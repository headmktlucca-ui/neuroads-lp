import { NextResponse } from 'next/server';

// Mesma versão usada em /api/traffic/extract e traffic-sync — mantenha em sincronia.
const GADS_BASE = 'https://googleads.googleapis.com/v24';

type GoogleAdsCustomer = {
  id: string;
  name: string;
  accountId: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      accessToken?: string;
      developerToken?: string;
    };
    const accessToken = body.accessToken?.trim();
    if (!accessToken) {
      return NextResponse.json({ error: 'accessToken ausente.' }, { status: 400 });
    }

    const developerToken =
      body.developerToken?.trim() || process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '';

    if (!developerToken) {
      return NextResponse.json(
        { error: 'Developer Token do Google Ads não configurado (GOOGLE_ADS_DEVELOPER_TOKEN).' },
        { status: 400 }
      );
    }

    const baseHeaders: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'developer-token': developerToken,
      'Content-Type': 'application/json',
    };

    // 1. List accessible customer resource names (top-level accounts)
    const listRes = await fetch(`${GADS_BASE}/customers:listAccessibleCustomers`, {
      method: 'GET',
      headers: { Authorization: baseHeaders.Authorization, 'developer-token': developerToken },
    });

    if (!listRes.ok) {
      const errText = await listRes.text();
      return NextResponse.json(
        { error: `Google Ads API error: ${listRes.status} ${errText}` },
        { status: listRes.status }
      );
    }

    const listData = (await listRes.json()) as { resourceNames?: string[] };
    const resourceNames = listData.resourceNames ?? [];

    if (resourceNames.length === 0) {
      return NextResponse.json({ customers: [] });
    }

    // 2. For each accessible customer, try to list sub-accounts via customer_client (MCC traversal)
    const allAccounts = new Map<string, GoogleAdsCustomer>();

    await Promise.all(
      resourceNames.slice(0, 10).map(async (resourceName) => {
        const managerId = resourceName.replace('customers/', '');
        try {
          // Try to get sub-accounts (works for MCC/manager accounts)
          const mccRes = await fetch(
            `${GADS_BASE}/customers/${managerId}/googleAds:search`,
            {
              method: 'POST',
              headers: { ...baseHeaders, 'login-customer-id': managerId },
              body: JSON.stringify({
                query: `
                  SELECT
                    customer_client.client_customer,
                    customer_client.descriptive_name,
                    customer_client.id,
                    customer_client.manager,
                    customer_client.level
                  FROM customer_client
                  WHERE customer_client.status = 'ENABLED'
                    AND customer_client.manager = FALSE
                    AND customer_client.level <= 3
                `,
              }),
            }
          );

          if (mccRes.ok) {
            const mccData = (await mccRes.json()) as {
              results?: Array<{
                customerClient?: {
                  clientCustomer?: string;
                  descriptiveName?: string;
                  id?: string;
                  manager?: boolean;
                  level?: number;
                };
              }>;
            };

            if (mccData.results && mccData.results.length > 0) {
              for (const row of mccData.results) {
                const client = row.customerClient;
                if (!client?.id) continue;
                const customerId = String(client.id);
                if (!allAccounts.has(customerId)) {
                  allAccounts.set(customerId, {
                    id: `customers/${customerId}`,
                    name: client.descriptiveName || `Conta ${customerId}`,
                    accountId: customerId,
                  });
                }
              }
              return; // Successfully listed sub-accounts, skip direct account fetch
            }
          }
        } catch {
          // MCC query failed, fall through to direct account info
        }

        // Fallback: fetch basic info for this customer directly
        try {
          const searchRes = await fetch(
            `${GADS_BASE}/customers/${managerId}/googleAds:search`,
            {
              method: 'POST',
              headers: { ...baseHeaders, 'login-customer-id': managerId },
              body: JSON.stringify({
                query: 'SELECT customer.id, customer.descriptive_name FROM customer LIMIT 1',
              }),
            }
          );

          if (!searchRes.ok) {
            if (!allAccounts.has(managerId)) {
              allAccounts.set(managerId, {
                id: resourceName,
                name: `Conta ${managerId}`,
                accountId: managerId,
              });
            }
            return;
          }

          const searchData = (await searchRes.json()) as {
            results?: Array<{
              customer?: { id?: string; descriptiveName?: string };
            }>;
          };

          const customerInfo = searchData.results?.[0]?.customer;
          const cid = customerInfo?.id ? String(customerInfo.id) : managerId;
          if (!allAccounts.has(cid)) {
            allAccounts.set(cid, {
              id: resourceName,
              name: customerInfo?.descriptiveName || `Conta ${managerId}`,
              accountId: cid,
            });
          }
        } catch {
          if (!allAccounts.has(managerId)) {
            allAccounts.set(managerId, {
              id: resourceName,
              name: `Conta ${managerId}`,
              accountId: managerId,
            });
          }
        }
      })
    );

    const customers = Array.from(allAccounts.values()).slice(0, 50);
    return NextResponse.json({ customers });
  } catch {
    return NextResponse.json(
      { error: 'Erro interno ao buscar contas do Google Ads.' },
      { status: 500 }
    );
  }
}
