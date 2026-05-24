import { NextResponse } from 'next/server';

type InstagramAccountRecord = {
  id: string;
  name: string;
  username: string;
  pageName: string;
  pageId: string;
};

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null;
  return value as Record<string, unknown>;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { accessToken?: string };
    const accessToken = toStringValue(body?.accessToken);

    if (!accessToken) {
      return NextResponse.json({ error: 'access_token_required' }, { status: 400 });
    }

    const endpoint = new URL('https://graph.facebook.com/v23.0/me/accounts');
    endpoint.searchParams.set('fields', 'id,name,instagram_business_account{id,username,name}');
    endpoint.searchParams.set('limit', '250');
    endpoint.searchParams.set('access_token', accessToken);

    const response = await fetch(endpoint.toString(), {
      method: 'GET',
      cache: 'no-store',
    });
    const payload = (await response.json()) as Record<string, unknown>;

    if (!response.ok) {
      const message =
        typeof payload.error === 'object' &&
        payload.error &&
        typeof (payload.error as { message?: unknown }).message === 'string'
          ? toStringValue((payload.error as { message?: unknown }).message)
          : 'Falha ao listar contas do Instagram.';
      return NextResponse.json({ error: message || 'instagram_accounts_failed' }, { status: 400 });
    }

    const rows = Array.isArray(payload.data) ? (payload.data as Record<string, unknown>[]) : [];
    const seen = new Set<string>();
    const accounts: InstagramAccountRecord[] = [];

    for (const row of rows) {
      const pageId = toStringValue(row.id);
      const pageName = toStringValue(row.name);
      const instagramRecord = readRecord(row.instagram_business_account);
      if (!instagramRecord) continue;

      const instagramId = toStringValue(instagramRecord.id);
      if (!instagramId || seen.has(instagramId)) continue;

      seen.add(instagramId);
      accounts.push({
        id: instagramId,
        name: toStringValue(instagramRecord.name) || toStringValue(instagramRecord.username) || instagramId,
        username: toStringValue(instagramRecord.username),
        pageName,
        pageId,
      });
    }

    return NextResponse.json({ accounts });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'instagram_accounts_failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
