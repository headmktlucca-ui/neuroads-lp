import { NextResponse } from 'next/server';

type TiktokAdvertiserRecord = {
  id: string;
  name: string;
  accountId: string;
};

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function getEnvValue(keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return '';
}

/**
 * Lista os anunciantes (advertiser accounts) do TikTok Ads autorizados pelo
 * usuário autenticado, via TikTok Business API v1.3.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { accessToken?: string };
    const accessToken = toStringValue(body?.accessToken);

    if (!accessToken) {
      return NextResponse.json({ error: 'access_token_required' }, { status: 400 });
    }

    const appId = getEnvValue(['TIKTOK_ADS_APP_ID', 'TIKTOK_ADS_CLIENT_ID', 'TIKTOK_APP_ID']);
    const secret = getEnvValue(['TIKTOK_ADS_SECRET', 'TIKTOK_ADS_CLIENT_SECRET', 'TIKTOK_APP_SECRET']);
    if (!appId || !secret) {
      return NextResponse.json(
        { error: 'Credenciais do TikTok Ads não configuradas (TIKTOK_ADS_APP_ID / TIKTOK_ADS_SECRET).' },
        { status: 400 }
      );
    }

    const endpoint = new URL('https://business-api.tiktok.com/open_api/v1.3/oauth2/advertiser/get/');
    endpoint.searchParams.set('app_id', appId);
    endpoint.searchParams.set('secret', secret);

    const response = await fetch(endpoint.toString(), {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Access-Token': accessToken,
      },
    });

    const payload = (await response.json()) as {
      code?: number;
      message?: string;
      data?: { list?: Array<{ advertiser_id?: unknown; advertiser_name?: unknown }> };
    };

    // TikTok Business API sinaliza erro via code != 0 mesmo com HTTP 200.
    if (!response.ok || (typeof payload.code === 'number' && payload.code !== 0)) {
      const message = toStringValue(payload.message) || 'Falha ao listar anunciantes do TikTok Ads.';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const rows = Array.isArray(payload.data?.list) ? payload.data.list : [];
    const seen = new Set<string>();
    const accounts: TiktokAdvertiserRecord[] = [];

    for (const row of rows) {
      const id = toStringValue(String(row.advertiser_id ?? ''));
      if (!id || seen.has(id)) continue;
      seen.add(id);
      accounts.push({
        id,
        name: toStringValue(String(row.advertiser_name ?? '')) || `Anunciante ${id}`,
        accountId: id,
      });
    }

    return NextResponse.json({ accounts });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'tiktok_ads_accounts_failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
