import { NextResponse } from 'next/server';

type Ga4AccountRecord = {
  id: string;
  name: string;
  accountId: string;
};

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function parseAccountId(resourceName: string): string {
  const normalized = toStringValue(resourceName);
  const match = normalized.match(/^accounts\/(.+)$/i);
  return match?.[1]?.trim() ?? normalized;
}

type Ga4AccountsApiResponse = {
  accounts?: Array<{
    name?: string;
    displayName?: string;
  }>;
  nextPageToken?: string;
  error?: {
    message?: string;
  };
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { accessToken?: string };
    const accessToken = toStringValue(body?.accessToken);

    if (!accessToken) {
      return NextResponse.json({ error: 'access_token_required' }, { status: 400 });
    }

    const accounts: Ga4AccountRecord[] = [];
    const seenAccountIds = new Set<string>();
    let nextPageToken = '';
    let pageGuard = 0;

    do {
      const endpoint = new URL('https://analyticsadmin.googleapis.com/v1beta/accounts');
      endpoint.searchParams.set('pageSize', '200');
      endpoint.searchParams.set('showDeleted', 'false');
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

      const payload = (await response.json()) as Ga4AccountsApiResponse;
      console.log('[GA4 Accounts API] Response payload:', JSON.stringify(payload, null, 2));

      if (!response.ok) {
        const message = toStringValue(payload?.error?.message) || 'Falha ao listar contas do GA4.';
        console.error('[GA4 Accounts API] Error:', message);
        return NextResponse.json({ error: message }, { status: 400 });
      }

      const rows = Array.isArray(payload.accounts) ? payload.accounts : [];
      for (const row of rows) {
        const rawName = toStringValue(row.name);
        const accountId = parseAccountId(rawName);
        if (!accountId || seenAccountIds.has(accountId)) continue;

        seenAccountIds.add(accountId);
        accounts.push({
          id: accountId,
          name: toStringValue(row.displayName) || accountId,
          accountId,
        });
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
