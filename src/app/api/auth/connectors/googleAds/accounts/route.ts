import { NextResponse } from 'next/server';

// Keep in sync with Google Ads API release schedule:
// https://developers.google.com/google-ads/api/docs/sunset-dates
const GOOGLE_ADS_API_VERSION = 'v24';

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

  // Try first without login-customer-id (for simple client accounts)
  let response = await fetch(
    `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${customerId}/googleAds:search`,
    {
      method: 'POST',
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': developerToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    }
  );

  // If it fails (common for MCC/Manager accounts), retry with login-customer-id header
  if (!response.ok) {
    response = await fetch(
      `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${customerId}/googleAds:search`,
      {
        method: 'POST',
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'developer-token': developerToken,
          'login-customer-id': customerId,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      }
    );
  }

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
  `;

  const response = await fetch(
    `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${managerId}/googleAds:search`,
    {
      method: 'POST',
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': developerToken,
        'login-customer-id': managerId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    console.error(`Falha ao buscar sub-contas da MCC ${managerId}:`, response.status, errorText);
    return [];
  }
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
      console.error('[GoogleAds:accounts] GOOGLE_ADS_DEVELOPER_TOKEN não configurado nas variáveis de ambiente.');
      return NextResponse.json(
        {
          error:
            'Developer Token do Google Ads não configurado. Configure GOOGLE_ADS_DEVELOPER_TOKEN nas variáveis de ambiente do servidor.',
        },
        { status: 500 }
      );
    }

    console.log('[GoogleAds:accounts] Developer token present, access token length:', accessToken.length);

    const seedsResponse = await fetch(
      `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers:listAccessibleCustomers`,
      {
        method: 'GET',
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'developer-token': developerToken,
        },
      }
    );

    const seedsText = await seedsResponse.text();
    let seedsPayload: {
      resourceNames?: string[];
      error?: { message?: string; status?: string; code?: number };
    } = {};

    try {
      seedsPayload = JSON.parse(seedsText);
    } catch (e) {
      console.error('[GoogleAds:listAccessibleCustomers] Response was not JSON. HTTP', seedsResponse.status, 'Body:', seedsText.substring(0, 500));
      return NextResponse.json(
        { error: 'A API do Google Ads retornou uma resposta inválida (HTML). Verifique os logs do servidor para mais detalhes.' },
        { status: 502 }
      );
    }

    if (!seedsResponse.ok) {
      const message =
        toStringValue(seedsPayload?.error?.message) || 'Falha ao listar contas do Google Ads.';
      const apiStatus = seedsPayload?.error?.status ?? '';
      console.error('[GoogleAds:listAccessibleCustomers] Error:', {
        httpStatus: seedsResponse.status,
        apiStatus,
        message,
      });

      // Specific error for unapproved developer token
      if (
        apiStatus === 'PERMISSION_DENIED' ||
        message.includes('DEVELOPER_TOKEN_NOT_APPROVED') ||
        message.includes('developer token')
      ) {
        return NextResponse.json(
          {
            error:
              'O Developer Token do Google Ads não está aprovado para acesso a contas reais. Solicite aprovação de acesso padrão em ads.google.com → Ferramentas → Central de API.',
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { error: `${message} (HTTP ${seedsResponse.status})` },
        { status: 400 }
      );
    }

    const seeds = (Array.isArray(seedsPayload.resourceNames) ? seedsPayload.resourceNames : [])
      .map((name) => normalizeCustomerId(name))
      .filter(Boolean);

    console.log('[GoogleAds:accounts] Accessible customer seeds:', seeds.length);

    if (seeds.length === 0) {
      return NextResponse.json({
        accounts: [],
        hint: 'Nenhuma conta Google Ads acessível encontrada para este usuário Google. Verifique se o e-mail autenticado possui acesso a contas em ads.google.com.',
      });
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
          // Could not fetch details — add as fallback so users can at least see it
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

        if (seed.isManager) {
          // For manager accounts (MCC): fetch client accounts first.
          // Only add the manager itself if it has no client accounts, since
          // advertising data lives in client accounts, not in the manager.
          const clients = await fetchManagerClients(accessToken, developerToken, seed.id, seed.name);
          if (clients.length > 0) {
            clients.forEach(pushUnique);
          } else {
            // Manager with no clients — add it as-is so the user can still link it
            pushUnique({
              id: seed.id,
              name: seed.name,
              accountId: seed.id,
              isManager: true,
              loginCustomerId: null,
              managerName: null,
            });
          }
        } else {
          pushUnique({
            id: seed.id,
            name: seed.name,
            accountId: seed.id,
            isManager: false,
            loginCustomerId: null,
            managerName: null,
          });
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

    console.log('[GoogleAds:accounts] Returning accounts:', accounts.length);
    return NextResponse.json({ accounts });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'google_ads_accounts_failed';
    console.error('[GoogleAds:accounts] Unexpected error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
