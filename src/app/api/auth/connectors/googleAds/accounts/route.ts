import { NextResponse } from 'next/server';

const GADS_BASE = 'https://googleads.googleapis.com/v24';

type GoogleAdsCustomer = {
  id: string;
  name: string;
  customerId: string;
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

    const baseHeaders = {
      Authorization: `Bearer ${accessToken}`,
      'developer-token': developerToken,
    };

    // 1. List accessible customer resource names
    const listRes = await fetch(`${GADS_BASE}/customers:listAccessibleCustomers`, {
      method: 'GET',
      headers: baseHeaders,
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

    // 2. Fetch name/id for each customer via GAQL search
    const customers: GoogleAdsCustomer[] = await Promise.all(
      resourceNames.slice(0, 20).map(async (resourceName) => {
        const customerId = resourceName.replace('customers/', '');
        try {
          const searchRes = await fetch(
            `${GADS_BASE}/customers/${customerId}/googleAds:search`,
            {
              method: 'POST',
              headers: {
                ...baseHeaders,
                'Content-Type': 'application/json',
                'login-customer-id': customerId,
              },
              body: JSON.stringify({
                query:
                  'SELECT customer.id, customer.descriptive_name FROM customer LIMIT 1',
              }),
            }
          );

          if (!searchRes.ok) {
            return { id: resourceName, name: `Conta ${customerId}`, customerId };
          }

          const searchData = (await searchRes.json()) as {
            results?: Array<{
              customer?: { id?: string; descriptiveName?: string };
            }>;
          };

          const customerInfo = searchData.results?.[0]?.customer;
          return {
            id: resourceName,
            name: customerInfo?.descriptiveName || `Conta ${customerId}`,
            customerId: customerInfo?.id || customerId,
          };
        } catch {
          return { id: resourceName, name: `Conta ${customerId}`, customerId };
        }
      })
    );

    return NextResponse.json({ customers });
  } catch {
    return NextResponse.json(
      { error: 'Erro interno ao buscar contas do Google Ads.' },
      { status: 500 }
    );
  }
}
