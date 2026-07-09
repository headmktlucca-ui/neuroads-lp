import { NextResponse } from 'next/server';

type Ga4AccountRecord = {
  id: string;
  name: string;
  accountId: string;
};

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function parsePropertyId(resourceName: string): string {
  const normalized = toStringValue(resourceName);
  const match = normalized.match(/^properties\/(.+)$/i);
  return match?.[1]?.trim() ?? normalized;
}

type Ga4AccountSummariesResponse = {
  accountSummaries?: Array<{
    account?: string;
    displayName?: string;
    propertySummaries?: Array<{
      property?: string;
      displayName?: string;
    }>;
  }>;
  nextPageToken?: string;
  error?: {
    message?: string;
  };
};

/**
 * Lista as PROPERTIES GA4 acessíveis pelo usuário autenticado (via
 * accountSummaries — conta + properties em uma única chamada). A GA4 Data API
 * roda relatórios por property, então é a property que o usuário deve
 * selecionar ao conectar o canal.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { accessToken?: string };
    const accessToken = toStringValue(body?.accessToken);

    if (!accessToken) {
      return NextResponse.json({ error: 'access_token_required' }, { status: 400 });
    }

    const accounts: Ga4AccountRecord[] = [];
    const seenPropertyIds = new Set<string>();
    let nextPageToken = '';
    let pageGuard = 0;

    do {
      const endpoint = new URL('https://analyticsadmin.googleapis.com/v1beta/accountSummaries');
      endpoint.searchParams.set('pageSize', '200');
      if (nextPageToken) {
        endpoint.searchParams.set('pageToken', nextPageToken);
      }

      const response = await fetch(endpoint.toString(), {
        method: 'GET',
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const payload = (await response.json()) as Ga4AccountSummariesResponse;

      if (!response.ok) {
        const message = toStringValue(payload?.error?.message) || 'Falha ao listar contas do GA4.';
        return NextResponse.json({ error: message }, { status: 400 });
      }

      const summaries = Array.isArray(payload.accountSummaries) ? payload.accountSummaries : [];
      for (const summary of summaries) {
        const accountName = toStringValue(summary.displayName);
        const properties = Array.isArray(summary.propertySummaries) ? summary.propertySummaries : [];
        for (const property of properties) {
          const propertyId = parsePropertyId(toStringValue(property.property));
          if (!propertyId || seenPropertyIds.has(propertyId)) continue;

          seenPropertyIds.add(propertyId);
          const propertyName = toStringValue(property.displayName) || propertyId;
          accounts.push({
            id: propertyId,
            name: accountName ? `${accountName} — ${propertyName}` : propertyName,
            accountId: propertyId,
          });
        }
      }

      nextPageToken = toStringValue(payload.nextPageToken);
      pageGuard += 1;
    } while (nextPageToken && pageGuard < 10);

    return NextResponse.json({ accounts });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ga4_accounts_failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
