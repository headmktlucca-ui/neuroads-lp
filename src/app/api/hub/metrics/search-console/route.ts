import { NextResponse } from 'next/server';

function toStr(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let accessToken = toStr(body?.accessToken);
    const uid = toStr(body?.uid);

    if (uid) {
      const { getValidAccessToken } = await import('@/lib/connector-refresh-server');
      const fresh = await getValidAccessToken(uid, 'searchConsole');
      if (fresh) accessToken = fresh;
    }

    if (!accessToken) {
      return NextResponse.json({ error: 'access_token_required' }, { status: 400 });
    }

    // Discover site URL from list of verified sites
    const sitesRes = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });
    const sitesData = await sitesRes.json();
    const siteEntry = sitesData?.siteEntry?.[0];
    const siteUrl = siteEntry?.siteUrl;

    if (!siteUrl) {
      return NextResponse.json({ error: 'no_sites_found' }, { status: 404 });
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    const fmt = (d: Date) => d.toISOString().split('T')[0];

    const analyticsRes = await fetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: fmt(startDate),
          endDate: fmt(endDate),
          dimensions: [],
        }),
        cache: 'no-store',
      }
    );

    const analyticsData = await analyticsRes.json();

    if (!analyticsRes.ok) {
      return NextResponse.json({ error: analyticsData?.error?.message || 'search_console_error' }, { status: analyticsRes.status });
    }

    const row = analyticsData?.rows?.[0] ?? {};
    return NextResponse.json({
      clicks: Math.round(row.clicks ?? 0),
      impressions: Math.round(row.impressions ?? 0),
      ctr: row.ctr ? `${(row.ctr * 100).toFixed(2)}%` : '0,00%',
      position: row.position ? row.position.toFixed(1) : '0',
      siteUrl,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'search_console_failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
