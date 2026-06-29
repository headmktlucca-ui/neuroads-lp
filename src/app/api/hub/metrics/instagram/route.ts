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
      const fresh = await getValidAccessToken(uid, 'instagram');
      if (fresh) accessToken = fresh;
    }

    if (!accessToken) {
      return NextResponse.json({ error: 'access_token_required' }, { status: 400 });
    }

    // Get connected Instagram Business accounts
    const meRes = await fetch(
      `https://graph.facebook.com/v19.0/me/accounts?fields=instagram_business_account{id,name,followers_count,media_count,profile_picture_url,website}&access_token=${accessToken}`,
      { cache: 'no-store' }
    );
    const meData = await meRes.json();

    const igAccount = meData?.data?.[0]?.instagram_business_account;

    if (!igAccount?.id) {
      return NextResponse.json({ error: 'no_instagram_account' }, { status: 404 });
    }

    const igId = igAccount.id;

    // Fetch insights: engagement metrics for last 30 days
    const insightsRes = await fetch(
      `https://graph.facebook.com/v19.0/${igId}/insights?metric=reach,profile_views,website_clicks&period=days_28&access_token=${accessToken}`,
      { cache: 'no-store' }
    );
    const insightsData = await insightsRes.json();

    const insightMap: Record<string, number> = {};
    for (const item of insightsData?.data ?? []) {
      const latest = item?.values?.[item.values.length - 1];
      if (item.name && latest) {
        insightMap[item.name] = typeof latest.value === 'number' ? latest.value : 0;
      }
    }

    const followers = igAccount.followers_count ?? 0;
    const reach = insightMap['reach'] ?? 0;
    const profileViews = insightMap['profile_views'] ?? 0;
    const websiteClicks = insightMap['website_clicks'] ?? 0;

    // Engagement rate approximation: profile_views / followers
    const engagementRate = followers > 0 ? ((profileViews / followers) * 100).toFixed(2) : '0.00';

    return NextResponse.json({
      username: igAccount.name ?? '',
      followers,
      reach,
      profileViews,
      websiteClicks,
      engagementRate: `${engagementRate}%`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'instagram_metrics_failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
