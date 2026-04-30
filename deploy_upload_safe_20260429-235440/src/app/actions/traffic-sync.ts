'use server';

import { TrafficData } from '../../lib/prompt-master';

export async function syncTrafficData(
  platform: string, 
  accessToken: string, 
  adAccountId?: string,
  loginCustomerId?: string
): Promise<{ success: boolean; data?: Partial<TrafficData>; error?: string }> {
  try {
    switch (platform) {
      case 'Google Ads':
        return await fetchGoogleAdsData(accessToken, adAccountId, loginCustomerId);
      case 'Meta Ads':
        return await fetchMetaAdsData(accessToken, adAccountId);
      case 'TikTok Ads':
        return await fetchTikTokAdsData(accessToken, adAccountId);
      default:
        return { success: false, error: 'Plataforma não suportada para sincronização.' };
    }
  } catch (error: unknown) {
    console.error(`Erro ao sincronizar com ${platform}:`, error);
    const message = error instanceof Error ? error.message : 'Erro erro desconhecido';
    return { success: false, error: message || 'Erro de conexão com a API' };
  }
}

async function fetchGoogleAdsData(accessToken: string, customerId?: string, loginCustomerId?: string) {
  // Developer token must be in .env
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  if (!developerToken) throw new Error('GOOGLE_ADS_DEVELOPER_TOKEN não configurado.');
  if (!customerId) throw new Error('ID da Conta do Google Ads (Customer ID) é obrigatório.');

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${accessToken}`,
    'developer-token': developerToken,
    'Content-Type': 'application/json',
  };

  // Add login-customer-id if request is made via manager/MCC
  if (loginCustomerId) {
    headers['login-customer-id'] = loginCustomerId;
  }

  // Example Google Ads API Call (REST endpoint)
  // Requer a query em AWQL ou Google Ads Query Language
  const query = `
    SELECT 
      metrics.cost_micros, 
      metrics.impressions, 
      metrics.clicks, 
      metrics.conversions, 
      metrics.cost_per_conversion 
    FROM campaign 
    WHERE segments.date DURING LAST_30_DAYS
  `;

  const response = await fetch(`https://googleads.googleapis.com/v17/customers/${customerId}/googleAds:search`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Erro ao buscar dados do Google Ads.';
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error?.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(`Erro Google Ads: ${errorMessage}`);
  }

  const data = await response.json();
  
  // Aggregate data
  let totalCost = 0;
  let totalImpressions = 0;
  let totalClicks = 0;
  let totalConversions = 0;

  data.results?.forEach((row: { metrics: Record<string, string> }) => {
    totalCost += parseInt(row.metrics.costMicros || '0') / 1000000;
    totalImpressions += parseInt(row.metrics.impressions || '0');
    totalClicks += parseInt(row.metrics.clicks || '0');
    totalConversions += parseFloat(row.metrics.conversions || '0');
  });

  const cpa = totalConversions > 0 ? (totalCost / totalConversions).toFixed(2) : '0';
  const roas = '0'; // Depende de conversion_value

  return {
    success: true,
    data: {
      investimento: totalCost.toFixed(2),
      impressoes: totalImpressions.toString(),
      cliques: totalClicks.toString(),
      conversoes: totalConversions.toString(),
      cpa,
      roas, 
    }
  };
}

async function fetchMetaAdsData(accessToken: string, accountId?: string) {
  if (!accountId) throw new Error('ID da Conta de Anúncios (Ad Account ID) é obrigatório. Ex: act_12345');
  
  // Ensure accountId starts with 'act_'
  const formattedId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;

  // Meta Graph API for Ad Insights
  const response = await fetch(
    `https://graph.facebook.com/v18.0/${formattedId}/insights?fields=spend,impressions,clicks,actions,action_values&date_preset=last_30d&access_token=${accessToken}`
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Erro Meta Ads: ${errorData.error?.message || 'Erro desconhecido'}`);
  }

  const data = await response.json();
  const summary = data.data?.[0]; // Default insights API returns array of objects by date/campaign

  if (!summary) throw new Error('Nenhum dado encontrado para esta conta nos últimos 30 dias.');

  const conversoes = summary.actions?.find((a: { action_type: string, value: string }) => a.action_type === 'purchase')?.value || '0';
  const conversoesValue = summary.action_values?.find((a: { action_type: string, value: string }) => a.action_type === 'purchase')?.value || '0';

  const spendNum = parseFloat(summary.spend);
  const convValueNum = parseFloat(conversoesValue);

  return {
    success: true,
    data: {
      investimento: summary.spend,
      impressoes: summary.impressions,
      cliques: summary.clicks,
      conversoes,
      cpa: parseInt(conversoes) > 0 ? (spendNum / parseInt(conversoes)).toFixed(2) : '0',
      roas: spendNum > 0 ? (convValueNum / spendNum).toFixed(2) : '0',
    }
  };
}

async function fetchTikTokAdsData(accessToken: string, advertiserId?: string) {
  if (!advertiserId) throw new Error('ID do Anunciante TikTok (Advertiser ID) é obrigatório.');

  // TikTok Business API
  const response = await fetch(
    `https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/?advertiser_id=${advertiserId}&report_type=BASIC&data_level=AUCTION_ADVERTISER&metrics=["spend","impressions","clicks","conversion","cost_per_conversion"]&start_date=2023-01-01&end_date=2023-12-31`,
    {
      headers: {
        'Access-Token': accessToken,
      }
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Erro TikTok Ads: ${JSON.stringify(errorData)}`);
  }

  const result = await response.json();
  if (result.code !== 0) {
     throw new Error(`Erro TikTok: ${result.message}`);
  }

  const metrics = result.data.list?.[0]?.metrics;
  if (!metrics) throw new Error('Dados não encontrados.');

  return {
    success: true,
    data: {
      investimento: metrics.spend,
      impressoes: metrics.impressions,
      cliques: metrics.clicks,
      conversoes: metrics.conversion,
      cpa: metrics.cost_per_conversion,
      roas: '0' // Request specific ROI metrics if available
    }
  };
}
