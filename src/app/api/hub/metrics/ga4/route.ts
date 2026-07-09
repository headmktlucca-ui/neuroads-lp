import { NextResponse } from 'next/server';

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Valida 'YYYY-MM-DD' para uso direto na GA4 Data API */
function toDateValue(value: unknown): string {
  const str = toStringValue(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(str) ? str : '';
}

type Ga4Row = {
  dimensionValues?: Array<{ value?: string }>;
  metricValues?: Array<{ value?: string }>;
};

function shiftDate(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let accessToken = toStringValue(body?.accessToken);
    const accountId = toStringValue(body?.accountId);
    const uid = toStringValue(body?.uid);

    // Período selecionado no Hub (Últimos 7/15/30/90 dias). Default: 30 dias.
    const dateTo = toDateValue(body?.dateTo) || new Date().toISOString().slice(0, 10);
    const dateFrom = toDateValue(body?.dateFrom) || shiftDate(dateTo, -30);

    if (uid) {
      const { getValidAccessToken } = await import('@/lib/connector-refresh-server');
      const freshToken = await getValidAccessToken(uid, 'ga4');
      if (freshToken) {
        accessToken = freshToken;
      }
    }

    if (!accessToken) {
      return NextResponse.json({ error: 'access_token_required' }, { status: 400 });
    }

    let propertyName = '';

    // Step 1: Resolver a property.
    // Novo formato: a seleção de conta salva diretamente o Property ID (GA4 Data
    // API roda relatórios por property). Valida com uma consulta direta.
    if (accountId) {
      const directRes = await fetch(`https://analyticsadmin.googleapis.com/v1beta/properties/${accountId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store'
      });
      if (directRes.ok) {
        propertyName = `properties/${accountId}`;
      }
    }

    // Legado: accountId era uma CONTA GA4 — busca a primeira property da conta.
    if (!propertyName && accountId) {
      const propEndpoint = `https://analyticsadmin.googleapis.com/v1beta/properties?filter=parent:accounts/${accountId}`;
      const propRes = await fetch(propEndpoint, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store'
      });
      const propData = await propRes.json();

      if (propData.properties && propData.properties.length > 0) {
        propertyName = propData.properties[0].name; // 'properties/12345'
      }
    }

    if (!propertyName) {
      return NextResponse.json({ error: 'No properties found for this account' }, { status: 404 });
    }

    // Período anterior equivalente (para variação % nas regiões)
    const periodDays = Math.max(
      1,
      Math.round((new Date(`${dateTo}T12:00:00Z`).getTime() - new Date(`${dateFrom}T12:00:00Z`).getTime()) / 86_400_000)
    );
    const prevTo = shiftDate(dateFrom, -1);
    const prevFrom = shiftDate(prevTo, -(periodDays - 1));

    // Step 2: Batch de relatórios reais no período selecionado
    const reportEndpoint = `https://analyticsdata.googleapis.com/v1beta/${propertyName}:batchRunReports`;
    const reportRes = await fetch(reportEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          // 0 — resumo geral
          {
            dateRanges: [{ startDate: dateFrom, endDate: dateTo }],
            metrics: [
              { name: 'activeUsers' },
              { name: 'averageSessionDuration' },
              { name: 'conversions' },
              { name: 'engagementRate' },
              { name: 'purchaseRevenue' }
            ]
          },
          // 1 — origens de tráfego (sessões por origem/mídia)
          {
            dateRanges: [{ startDate: dateFrom, endDate: dateTo }],
            dimensions: [{ name: 'sessionSourceMedium' }],
            metrics: [{ name: 'sessions' }],
            orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
            limit: 8
          },
          // 2 — usuários novos x recorrentes por dia
          {
            dateRanges: [{ startDate: dateFrom, endDate: dateTo }],
            dimensions: [{ name: 'date' }, { name: 'newVsReturning' }],
            metrics: [{ name: 'activeUsers' }],
            orderBys: [{ dimension: { dimensionName: 'date' } }],
            limit: 400
          },
          // 3 — usuários ativos por país (período atual)
          {
            dateRanges: [{ startDate: dateFrom, endDate: dateTo }],
            dimensions: [{ name: 'country' }],
            metrics: [{ name: 'activeUsers' }],
            orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
            limit: 8
          },
          // 4 — usuários ativos por país (período anterior, para variação %)
          {
            dateRanges: [{ startDate: prevFrom, endDate: prevTo }],
            dimensions: [{ name: 'country' }],
            metrics: [{ name: 'activeUsers' }],
            orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
            limit: 50
          }
        ]
      })
    });

    const reportData = await reportRes.json();

    if (!reportRes.ok) {
      return NextResponse.json({ error: reportData.error?.message || 'Failed to fetch GA4 report' }, { status: reportRes.status });
    }

    const reports = (reportData.reports ?? []) as Array<{ rows?: Ga4Row[] }>;

    // ── 0: resumo geral ──
    let activeUsers = '0';
    let averageSessionDuration = '0';
    let conversions = '0';
    let engagementRate = '0';
    let purchaseRevenue = '0';

    const summaryRow = reports[0]?.rows?.[0]?.metricValues;
    if (summaryRow) {
      activeUsers = summaryRow[0]?.value || '0';

      const durationSeconds = parseFloat(summaryRow[1]?.value || '0');
      const mins = Math.floor(durationSeconds / 60);
      const secs = Math.floor(durationSeconds % 60);
      averageSessionDuration = `${mins}m ${secs}s`;

      conversions = summaryRow[2]?.value || '0';

      const rate = parseFloat(summaryRow[3]?.value || '0');
      engagementRate = `${(rate * 100).toFixed(2)}%`;

      purchaseRevenue = summaryRow[4]?.value || '0';
    }

    // ── 1: origens de tráfego ──
    const trafficSources = (reports[1]?.rows ?? []).map((row) => ({
      source: row.dimensionValues?.[0]?.value || '(unknown)',
      sessions: parseInt(row.metricValues?.[0]?.value || '0', 10),
    }));

    // ── 2: novos x recorrentes por dia ──
    const trendMap = new Map<string, { newUsers: number; returningUsers: number }>();
    (reports[2]?.rows ?? []).forEach((row) => {
      const rawDate = row.dimensionValues?.[0]?.value || ''; // YYYYMMDD
      const bucket = row.dimensionValues?.[1]?.value || '';
      const count = parseInt(row.metricValues?.[0]?.value || '0', 10);
      if (rawDate.length !== 8) return;
      const key = rawDate;
      const entry = trendMap.get(key) ?? { newUsers: 0, returningUsers: 0 };
      if (bucket === 'new') entry.newUsers += count;
      else if (bucket === 'returning') entry.returningUsers += count;
      trendMap.set(key, entry);
    });
    const usersTrend = [...trendMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([rawDate, counts]) => {
        const date = new Date(`${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}T12:00:00Z`);
        const label = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' }).replace('.', '');
        return { date: label, newUsers: counts.newUsers, returningUsers: counts.returningUsers };
      });

    // ── 3 + 4: usuários por região com variação vs período anterior ──
    const prevRegionMap = new Map<string, number>();
    (reports[4]?.rows ?? []).forEach((row) => {
      const country = row.dimensionValues?.[0]?.value || '';
      if (country) prevRegionMap.set(country, parseInt(row.metricValues?.[0]?.value || '0', 10));
    });
    const regions = (reports[3]?.rows ?? []).map((row) => {
      const country = row.dimensionValues?.[0]?.value || '(unknown)';
      const value = parseInt(row.metricValues?.[0]?.value || '0', 10);
      const prev = prevRegionMap.get(country) ?? 0;
      let change = '0%';
      let positive: boolean | null = null;
      if (prev > 0) {
        const pct = ((value - prev) / prev) * 100;
        if (Math.abs(pct) >= 0.05) {
          change = `${pct > 0 ? '+' : ''}${pct.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
          positive = pct > 0;
        }
      } else if (value > 0) {
        change = 'novo';
        positive = true;
      }
      return { country, value, change, positive };
    });

    return NextResponse.json({
      activeUsers,
      averageSessionDuration,
      conversions,
      engagementRate,
      purchaseRevenue,
      trafficSources,
      usersTrend,
      regions,
      period: { dateFrom, dateTo }
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'ga4_metrics_failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
