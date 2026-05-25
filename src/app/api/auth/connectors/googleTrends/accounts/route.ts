import { NextResponse } from 'next/server';

type GoogleTrendsAccountRecord = {
  id: string;
  name: string;
  accountId: string;
  email?: string;
};

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

type GoogleUserInfoResponse = {
  sub?: string;
  email?: string;
  name?: string;
};

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function parseAccountId(resourceName: string): string {
  const normalized = toStringValue(resourceName);
  const match = normalized.match(/^accounts\/(.+)$/i);
  return match?.[1]?.trim() ?? normalized;
}

async function fetchUserIdentityAccount(accessToken: string): Promise<GoogleTrendsAccountRecord[] | null> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    method: 'GET',
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) return null;
  const payload = (await response.json()) as GoogleUserInfoResponse;
  const subject = toStringValue(payload.sub);
  const email = toStringValue(payload.email);
  const name = toStringValue(payload.name) || email || 'Conta Google';
  const accountId = subject || email;
  if (!accountId) return null;

  return [
    {
      id: accountId,
      name,
      accountId,
      email: email || undefined,
    },
  ];
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { accessToken?: string };
    const accessToken = toStringValue(body?.accessToken);

    if (!accessToken) {
      return NextResponse.json({ error: 'access_token_required' }, { status: 400 });
    }

    const accounts: GoogleTrendsAccountRecord[] = [];
    const seenAccountIds = new Set<string>();
    let nextPageToken = '';
    let pageGuard = 0;
    let ga4ApiError: string | null = null;

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
      if (!response.ok) {
        ga4ApiError = toStringValue(payload?.error?.message) || 'Falha ao listar contas Google para o canal.';
        break;
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

    if (accounts.length > 0) {
      return NextResponse.json({ accounts });
    }

    const identityFallback = await fetchUserIdentityAccount(accessToken);
    if (identityFallback && identityFallback.length > 0) {
      return NextResponse.json({ accounts: identityFallback });
    }

    if (ga4ApiError) {
      return NextResponse.json({ error: ga4ApiError }, { status: 400 });
    }

    return NextResponse.json({ accounts: [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'google_trends_accounts_failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
