import 'server-only';

/**
 * Camada de coleta via conectores — Sprint 1 / P0
 *
 * Busca dados reais (últimos 28 dias) das contas conectadas em Integrações
 * para injetar no contexto das operações. Cada fetcher:
 *  - Usa getValidAccessToken (connector-refresh-server) para token sempre
 *    válido, com fallback ao token persistido se o refresh falhar;
 *  - Nunca lança exceção — retorna '' em qualquer falha, para que a
 *    ausência de um canal nunca derrube a operação (ela apenas segue sem
 *    aquela fonte, conforme o protocolo de autonomia do template mestre);
 *  - Tem timeout curto (8s) para não travar o chat quando a API do
 *    provedor estiver lenta ou fora do ar.
 *
 * Antes deste módulo, apenas o GA4 buscava dados reais (fetchGa4Context em
 * lucca-hub-chat.ts). Google Ads e Meta Ads entravam no contexto só como
 * nome de canal conectado, sem números.
 */

export type GoogleAdsConnectionInfo = { accessToken?: string; accountId?: string; loginCustomerId?: string };
export type MetaAdsConnectionInfo = { accessToken?: string; accountId?: string };
export type SearchConsoleConnectionInfo = { accessToken?: string; accountId?: string };

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    return await promise;
  } finally {
    clearTimeout(timeout);
  }
}

async function refreshedToken(userId: string, connectorKey: string, fallback?: string): Promise<string> {
  try {
    const { getValidAccessToken } = await import('./connector-refresh-server');
    const fresh = await getValidAccessToken(userId, connectorKey);
    if (fresh) return fresh;
  } catch { /* usa o token persistido */ }
  return fallback ?? '';
}

/* ── Google Ads ────────────────────────────────────────────────────── */

export async function fetchGoogleAdsContext(
  userId: string,
  conn: GoogleAdsConnectionInfo
): Promise<string> {
  try {
    const accessToken = await refreshedToken(userId, 'googleAds', conn.accessToken);
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    if (!accessToken || !conn.accountId || !developerToken) return '';

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'developer-token': developerToken,
      'Content-Type': 'application/json',
    };
    if (conn.loginCustomerId) headers['login-customer-id'] = conn.loginCustomerId;

    const query = `
      SELECT
        metrics.cost_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.conversions_value
      FROM customer
      WHERE segments.date DURING LAST_28_DAYS
    `;

    const res = await withTimeout(
      fetch(`https://googleads.googleapis.com/v17/customers/${conn.accountId}/googleAds:search`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query }),
        cache: 'no-store',
      }),
      8000
    );
    if (!res.ok) return '';
    const data = await res.json();

    let costMicros = 0;
    let impressions = 0;
    let clicks = 0;
    let conversions = 0;
    let conversionsValue = 0;

    (data.results || []).forEach((row: { metrics?: Record<string, string> }) => {
      const m = row.metrics || {};
      costMicros += Number(m.costMicros || 0);
      impressions += Number(m.impressions || 0);
      clicks += Number(m.clicks || 0);
      conversions += Number(m.conversions || 0);
      conversionsValue += Number(m.conversionsValue || 0);
    });

    if (impressions === 0 && clicks === 0 && costMicros === 0) return '';

    const cost = costMicros / 1_000_000;
    const cpa = conversions > 0 ? (cost / conversions).toFixed(2) : 'N/D';
    const roas = cost > 0 ? (conversionsValue / cost).toFixed(2) : 'N/D';
    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0';

    return `MÉTRICAS REAIS — Google Ads (últimos 28 dias, extraídas agora da conta conectada):
Investimento: R$ ${cost.toFixed(2)} · Impressões: ${impressions} · Cliques: ${clicks} · CTR: ${ctr}% · Conversões: ${conversions.toFixed(1)} · CPA: R$ ${cpa} · ROAS: ${roas}x`;
  } catch {
    return '';
  }
}

/* ── Meta Ads ──────────────────────────────────────────────────────── */

export async function fetchMetaAdsContext(
  userId: string,
  conn: MetaAdsConnectionInfo
): Promise<string> {
  try {
    const accessToken = await refreshedToken(userId, 'metaAds', conn.accessToken);
    if (!accessToken || !conn.accountId) return '';

    const formattedId = conn.accountId.startsWith('act_') ? conn.accountId : `act_${conn.accountId}`;
    const fields = 'spend,impressions,clicks,actions,action_values';

    const res = await withTimeout(
      fetch(
        `https://graph.facebook.com/v21.0/${formattedId}/insights?fields=${fields}&date_preset=last_28d&access_token=${accessToken}`,
        { cache: 'no-store' }
      ),
      8000
    );
    if (!res.ok) return '';
    const data = await res.json();
    const summary = data?.data?.[0];
    if (!summary) return '';

    const spend = parseFloat(summary.spend || '0');
    const impressions = Number(summary.impressions || 0);
    const clicks = Number(summary.clicks || 0);
    const purchases = Number(
      (summary.actions as Array<{ action_type: string; value: string }> | undefined)?.find(
        (a) => a.action_type === 'purchase' || a.action_type === 'offsite_conversion.fb_pixel_purchase'
      )?.value || 0
    );
    const purchaseValue = parseFloat(
      (summary.action_values as Array<{ action_type: string; value: string }> | undefined)?.find(
        (a) => a.action_type === 'purchase' || a.action_type === 'offsite_conversion.fb_pixel_purchase'
      )?.value || '0'
    );

    const cpa = purchases > 0 ? (spend / purchases).toFixed(2) : 'N/D';
    const roas = spend > 0 ? (purchaseValue / spend).toFixed(2) : 'N/D';
    const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0';

    return `MÉTRICAS REAIS — Meta Ads (últimos 28 dias, extraídas agora da conta conectada):
Investimento: R$ ${spend.toFixed(2)} · Impressões: ${impressions} · Cliques: ${clicks} · CTR: ${ctr}% · Compras: ${purchases} · CPA: R$ ${cpa} · ROAS: ${roas}x`;
  } catch {
    return '';
  }
}

/* ── Google Search Console ────────────────────────────────────────── */

export async function fetchSearchConsoleContext(
  userId: string,
  conn: SearchConsoleConnectionInfo
): Promise<string> {
  try {
    const accessToken = await refreshedToken(userId, 'searchConsole', conn.accessToken);
    if (!accessToken || !conn.accountId) return '';

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 28);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    const [summaryRes, queriesRes] = await Promise.all([
      withTimeout(
        fetch(
          `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(conn.accountId)}/searchAnalytics/query`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ startDate: fmt(startDate), endDate: fmt(endDate) }),
            cache: 'no-store',
          }
        ),
        8000
      ),
      withTimeout(
        fetch(
          `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(conn.accountId)}/searchAnalytics/query`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              startDate: fmt(startDate),
              endDate: fmt(endDate),
              dimensions: ['query'],
              rowLimit: 5,
            }),
            cache: 'no-store',
          }
        ),
        8000
      ),
    ]);

    if (!summaryRes.ok) return '';
    const summaryData = await summaryRes.json();
    const row = summaryData?.rows?.[0];
    if (!row) return '';

    const lines = [
      `Cliques: ${row.clicks ?? 0} · Impressões: ${row.impressions ?? 0} · CTR médio: ${((row.ctr ?? 0) * 100).toFixed(2)}% · Posição média: ${(row.position ?? 0).toFixed(1)}`,
    ];

    if (queriesRes.ok) {
      const queriesData = await queriesRes.json();
      const topQueries = (queriesData?.rows || []) as Array<{ keys?: string[]; clicks?: number }>;
      if (topQueries.length > 0) {
        lines.push(
          `Top termos de busca (cliques): ${topQueries.map((q) => `${q.keys?.[0] || '?'} = ${q.clicks || 0}`).join(' · ')}`
        );
      }
    }

    return `MÉTRICAS REAIS — Google Search Console (últimos 28 dias, extraídas agora da propriedade conectada):\n${lines.join('\n')}`;
  } catch {
    return '';
  }
}
