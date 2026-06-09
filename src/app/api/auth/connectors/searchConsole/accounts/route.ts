import { NextResponse } from 'next/server';

type SearchConsoleAccountRecord = {
  id: string;
  name: string;
  accountId: string;
  permissionLevel?: string;
};

type SearchConsoleApiResponse = {
  siteEntry?: Array<{
    siteUrl?: string;
    permissionLevel?: string;
  }>;
  error?: {
    message?: string;
  };
};

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { accessToken?: string };
    const accessToken = toStringValue(body?.accessToken);

    if (!accessToken) {
      return NextResponse.json({ error: 'access_token_required' }, { status: 400 });
    }

    const endpoint = 'https://searchconsole.googleapis.com/webmasters/v3/sites';
    const response = await fetch(endpoint, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const payload = (await response.json()) as SearchConsoleApiResponse;
    
    if (!response.ok) {
      const errorMsg = toStringValue(payload?.error?.message) || 'Falha ao listar propriedades do Google Search Console.';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const accounts: SearchConsoleAccountRecord[] = [];
    const rows = Array.isArray(payload.siteEntry) ? payload.siteEntry : [];
    
    for (const row of rows) {
      const siteUrl = toStringValue(row.siteUrl);
      if (!siteUrl) continue;

      accounts.push({
        id: siteUrl,
        name: siteUrl.replace(/^sc-domain:/, '').replace(/\/$/, ''),
        accountId: siteUrl,
        permissionLevel: toStringValue(row.permissionLevel),
      });
    }

    return NextResponse.json({ accounts });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'search_console_accounts_failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
