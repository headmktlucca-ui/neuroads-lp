import { NextResponse } from 'next/server';

type GoogleAdsAccountOption = {
  id: string;
  name: string;
  accountId: string;
  isManager: boolean;
  loginCustomerId: string | null;
  managerName: string | null;
};

type GoogleAdsSearchResponse = {
  results?: Array<{
    customer?: {
      id?: string | number;
      descriptiveName?: string;
      manager?: boolean;
    };
    customerClient?: {
      clientCustomer?: string;
      descriptiveName?: string;
      manager?: boolean;
      status?: string;
    };
  }>;
};

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function toBool(value: unknown): boolean {
  return value === true;
}

function normalizeCustomerId(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) return String(Math.trunc(value));
  const raw = toStringValue(value);
  if (!raw) return '';
  if (raw.startsWith('customers/')) return raw.replace('customers/', '').trim();
  return raw;
}

async function fetchSeedCustomer(
  accessToken: string,
  developerToken: string,
  customerId: string
): Promise<{ id: string; name: string; isManager: boolean } | null> {
  const query = `
    SELECT
      customer.id,
      customer.descriptive_name,
      customer.manager
    FROM customer
    LIMIT 1
  `;

  const response = await fetch(`https://googleads.googleapis.com/v17/customers/${customerId}/googleAds:search`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'developer-token': developerToken,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) return null;
  const payload = (await response.json()) as GoogleAdsSearchResponse;
  const customer = payload.results?.[0]?.customer;
  if (!customer) return null;

  const id = normalizeCustomerId(customer.id);
  if (!id) return null;

  return {
    id,
    name: toStringValue(customer.descriptiveName) || `Conta ${id}`,
    isManager: toBool(customer.manager),
  };
}

async function fetchManagerClients(
  accessToken: string,
  developerToken: string,
  managerId: string,
  managerName: string
): Promise<GoogleAdsAccountOption[]> {
  const query = `
    SELECT
      customer_client.client_customer,
      customer_client.descriptive_name,
      customer_client.manager,
      customer_client.status
    FROM customer_client
    WHERE customer_client.level <= 1
      AND customer_client.status = 'ENABLED'
  `;

  const response = await fetch(`https://googleads.googleapis.com/v17/customers/${managerId}/googleAds:search`, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'developer-token': developerToken,
      'login-customer-id': managerId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) return [];
  const payload = (await response.json()) as GoogleAdsSearchResponse;
  const rows = Array.isArray(payload.results) ? payload.results : [];

  const accounts: GoogleAdsAccountOption[] = [];
  for (const row of rows) {
    const client = row.customerClient;
    if (!client) continue;
    const accountId = normalizeCustomerId(client.clientCustomer);
    if (!accountId || accountId === managerId) continue;

    const clientName = toStringValue(client.descriptiveName) || `Conta ${accountId}`;
    accounts.push({
      id: `${accountId}::${managerId}`,
      name: clientName,
      accountId,
      isManager: toBool(client.manager),
      loginCustomerId: managerId,
      managerName: managerName || null,
    });
  }

  return accounts;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { accessToken?: string };
    const accessToken = toStringValue(body?.accessToken);

    if (!accessToken) {
      return NextResponse.json({ error: 'access_token_required' }, { status: 400 });
    }

    const developerToken = toStringValue(process.env.GOOGLE_ADS_DEVELOPER_TOKEN);
    if (!developerToken) {
      return NextResponse.json(
        { error: 'GOOGLE_ADS_DEVELOPER_TOKEN não configurado.' },
        { status: 500 }
      );
    }

    const seedsResponse = await fetch('https://googleads.googleapis.com/v17/customers:listAccessibleCustomers', {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': developerToken,
      },
    });

    const seedsPayload = (await seedsResponse.json()) as {
      resourceNames?: string[];
      error?: { message?: string };
    };

    if (!seedsResponse.ok) {
      const message = toStringValue(seedsPayload?.error?.message) || 'Falha ao listar contas do Google Ads.';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const seeds = (Array.isArray(seedsPayload.resourceNames) ? seedsPayload.resourceNames : [])
      .map((name) => normalizeCustomerId(name))
      .filter(Boolean);

    if (seeds.length === 0) {
      return NextResponse.json({ accounts: [] });
    }

    const accounts: GoogleAdsAccountOption[] = [];
    const seen = new Set<string>();
    const pushUnique = (account: GoogleAdsAccountOption) => {
      const key = `${account.accountId}::${account.loginCustomerId ?? ''}`;
      if (seen.has(key)) return;
      seen.add(key);
      accounts.push(account);
    };

    for (const seedId of seeds) {
      try {
        const seed = await fetchSeedCustomer(accessToken, developerToken, seedId);
        if (!seed) {
          pushUnique({
            id: seedId,
            name: `Conta ${seedId}`,
            accountId: seedId,
            isManager: false,
            loginCustomerId: null,
            managerName: null,
          });
          continue;
        }

        pushUnique({
          id: seed.id,
          name: seed.name,
          accountId: seed.id,
          isManager: seed.isManager,
          loginCustomerId: null,
          managerName: null,
        });

        if (seed.isManager) {
          const clients = await fetchManagerClients(accessToken, developerToken, seed.id, seed.name);
          clients.forEach(pushUnique);
        }
      } catch {
        pushUnique({
          id: seedId,
          name: `Conta ${seedId}`,
          accountId: seedId,
          isManager: false,
          loginCustomerId: null,
          managerName: null,
        });
      }
    }

    return NextResponse.json({ accounts });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'google_ads_accounts_failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
