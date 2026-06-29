import { NextResponse } from 'next/server';

type ChannelPayload = {
  platform: 'googleAds' | 'metaAds' | 'linkedinAds';
  accessToken: string;
  accountId?: string;
  loginCustomerId?: string;
};

type GoogleAdsApiResultRow = {
  metrics?: {
    costMicros?: string;
    impressions?: string;
    clicks?: string;
    conversions?: string;
  };
};

type MetaAdsAction = { action_type?: string; value?: string };
type MetaAdsInsightRow = {
  spend?: string;
  impressions?: string;
  clicks?: string;
  actions?: MetaAdsAction[];
};

type ExtractionPayload = {
  dateFrom: string;
  dateTo: string;
  channels: ChannelPayload[];
};

function toYmd(value: string): string {
  return value.replaceAll('-', '');
}

async function fetchGoogleAdsChannel(
  channel: ChannelPayload,
  dateFrom: string,
  dateTo: string
) {
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  if (!developerToken) {
    throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN não configurado.');
  }
  const sanitizedCustomerId = (channel.accountId || '').replace(/[^\d]/g, '');
  if (!sanitizedCustomerId) {
    throw new Error('Conta Google Ads não informada.');
  }

  const query = `
    SELECT metrics.cost_micros, metrics.impressions, metrics.clicks, metrics.conversions
    FROM campaign
    WHERE segments.date BETWEEN '${toYmd(dateFrom)}' AND '${toYmd(dateTo)}'
  `;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${channel.accessToken}`,
    'developer-token': developerToken,
    'Content-Type': 'application/json',
  };

  if (channel.loginCustomerId) {
    const sanitizedLoginCustomerId = channel.loginCustomerId.replace(/[^\d]/g, '');
    if (sanitizedLoginCustomerId) {
      headers['login-customer-id'] = sanitizedLoginCustomerId;
    }
  }

  const response = await fetch(
    `https://googleads.googleapis.com/v24/customers/${sanitizedCustomerId}/googleAds:search`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Ads: ${text}`);
  }

  const data = await response.json();
  const rows = (data.results as GoogleAdsApiResultRow[] | undefined) || [];
  const totals = rows.reduce(
    (acc: { spend: number; impressions: number; clicks: number; conversions: number }, row) => {
      const m = row.metrics || {};
      acc.spend += Number(m.costMicros || 0) / 1_000_000;
      acc.impressions += Number(m.impressions || 0);
      acc.clicks += Number(m.clicks || 0);
      acc.conversions += Number(m.conversions || 0);
      return acc;
    },
    { spend: 0, impressions: 0, clicks: 0, conversions: 0 }
  );

  return { platform: 'Google Ads', ...totals };
}

async function fetchMetaAdsChannel(channel: ChannelPayload, dateFrom: string, dateTo: string) {
  if (!channel.accountId) {
    throw new Error('Conta Meta Ads não informada.');
  }
  const accountId = channel.accountId.startsWith('act_') ? channel.accountId : `act_${channel.accountId}`;
  const params = new URLSearchParams({
    fields: 'spend,impressions,clicks,actions,action_values',
    time_range: JSON.stringify({ since: dateFrom, until: dateTo }),
    access_token: channel.accessToken,
  });

  const response = await fetch(`https://graph.facebook.com/v20.0/${accountId}/insights?${params.toString()}`);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Meta Ads: ${text}`);
  }

  const data = await response.json();
  const row = ((data.data as MetaAdsInsightRow[] | undefined) || [])[0] || {};
  const conversions =
    Number((row.actions || []).find((a) => a.action_type === 'purchase')?.value || 0);

  return {
    platform: 'Meta Ads',
    spend: Number(row.spend || 0),
    impressions: Number(row.impressions || 0),
    clicks: Number(row.clicks || 0),
    conversions,
  };
}

async function fetchLinkedinAdsChannel(channel: ChannelPayload, dateFrom: string, dateTo: string) {
  if (!channel.accountId) {
    throw new Error('Conta LinkedIn Ads não informada.');
  }

  const accountId = channel.accountId.replace('urn:li:sponsoredAccount:', '');
  const q = new URLSearchParams({
    q: 'analytics',
    dateRange: `(start:(year:${dateFrom.slice(0, 4)},month:${Number(dateFrom.slice(5, 7))},day:${Number(
      dateFrom.slice(8, 10)
    )}),end:(year:${dateTo.slice(0, 4)},month:${Number(dateTo.slice(5, 7))},day:${Number(dateTo.slice(8, 10))}))`,
    timeGranularity: 'ALL',
    pivot: 'ACCOUNT',
    accounts: `List(urn:li:sponsoredAccount:${accountId})`,
    fields: 'impressions,clicks,costInLocalCurrency,conversions',
  });

  const response = await fetch(`https://api.linkedin.com/rest/adAnalytics?${q.toString()}`, {
    headers: {
      Authorization: `Bearer ${channel.accessToken}`,
      'LinkedIn-Version': '202501',
      'X-Restli-Protocol-Version': '2.0.0',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LinkedIn Ads: ${text}`);
  }

  const data = await response.json();
  const row = data.elements?.[0] || {};
  return {
    platform: 'LinkedIn Ads',
    spend: Number(row.costInLocalCurrency || 0),
    impressions: Number(row.impressions || 0),
    clicks: Number(row.clicks || 0),
    conversions: Number(row.conversions || 0),
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ExtractionPayload & { uid?: string };
    if (!body?.dateFrom || !body?.dateTo || !Array.isArray(body.channels) || body.channels.length === 0) {
      return NextResponse.json({ success: false, error: 'Parâmetros inválidos para extração.' }, { status: 400 });
    }

    const uid = body.uid ? String(body.uid).trim() : '';

    const results = await Promise.all(
      body.channels.map(async (channel) => {
        try {
          const resolvedChannel = { ...channel };
          if (uid && (channel.platform === 'googleAds' || channel.platform === 'linkedinAds')) {
            const { getValidAccessToken } = await import('@/lib/connector-refresh-server');
            const freshToken = await getValidAccessToken(uid, channel.platform);
            if (freshToken) {
              resolvedChannel.accessToken = freshToken;
            }
          }

          if (resolvedChannel.platform === 'googleAds') return await fetchGoogleAdsChannel(resolvedChannel, body.dateFrom, body.dateTo);
          if (resolvedChannel.platform === 'metaAds') return await fetchMetaAdsChannel(resolvedChannel, body.dateFrom, body.dateTo);
          if (resolvedChannel.platform === 'linkedinAds') return await fetchLinkedinAdsChannel(resolvedChannel, body.dateFrom, body.dateTo);
          throw new Error(`Canal não suportado: ${channel.platform}`);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Erro na API';
          console.error(`Erro ao carregar dados do canal ${channel.platform}:`, errorMsg);
          return {
            platform: channel.platform === 'googleAds' ? 'Google Ads' : channel.platform === 'metaAds' ? 'Meta Ads' : 'LinkedIn Ads',
            spend: 0,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            error: errorMsg
          };
        }
      })
    );

    const totals = results.reduce(
      (acc, item) => {
        acc.spend += item.spend;
        acc.impressions += item.impressions;
        acc.clicks += item.clicks;
        acc.conversions += item.conversions;
        return acc;
      },
      { spend: 0, impressions: 0, clicks: 0, conversions: 0 }
    );

    return NextResponse.json({ success: true, channels: results, totals });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao extrair indicadores.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
