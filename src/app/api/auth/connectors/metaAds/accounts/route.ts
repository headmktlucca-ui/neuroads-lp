import { NextResponse } from 'next/server';

type MetaAdsAccountRecord = {
  id: string;
  name: string;
  accountId: string;
  currency: string;
  status: string;
};

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeMetaAccountId(value: string): string {
  if (!value) return '';
  return value.startsWith('act_') ? value : `act_${value}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { accessToken?: string };
    const accessToken = toStringValue(body?.accessToken);

    if (!accessToken) {
      return NextResponse.json({ error: 'access_token_required' }, { status: 400 });
    }

    const endpoint = new URL('https://graph.facebook.com/v23.0/me/adaccounts');
    endpoint.searchParams.set('fields', 'id,account_id,name,currency,account_status');
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
          : 'Falha ao listar contas do Meta Ads.';
      return NextResponse.json({ error: message || 'meta_ads_accounts_failed' }, { status: 400 });
    }

    const rawAccounts = Array.isArray(payload.data) ? (payload.data as Record<string, unknown>[]) : [];
    const seenIds = new Set<string>();
    const accounts: MetaAdsAccountRecord[] = [];

    for (const item of rawAccounts) {
      const rawId = toStringValue(item.id);
      const rawAccountId = toStringValue(item.account_id);
      const normalizedId = normalizeMetaAccountId(rawId || rawAccountId);
      if (!normalizedId || seenIds.has(normalizedId)) continue;

      seenIds.add(normalizedId);
      accounts.push({
        id: normalizedId,
        name: toStringValue(item.name) || normalizedId,
        accountId: rawAccountId || normalizedId.replace(/^act_/, ''),
        currency: toStringValue(item.currency) || '',
        status: toStringValue(item.account_status) || '',
      });
    }

    return NextResponse.json({ accounts });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'meta_ads_accounts_failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
