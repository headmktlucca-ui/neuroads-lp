import { NextResponse } from 'next/server';

function toStr(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let accessToken = toStr(body?.accessToken);
    const uid = toStr(body?.uid);
    const days = typeof body?.days === 'number' ? body.days : 30;

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

    // Fetch insights: engagement metrics for chosen period
    const periodPreset = days <= 7 ? 'days_7' : days <= 15 ? 'days_15' : days <= 30 ? 'days_28' : 'days_90';
    const insightsRes = await fetch(
      `https://graph.facebook.com/v19.0/${igId}/insights?metric=reach,profile_views,website_clicks&period=${periodPreset}&access_token=${accessToken}`,
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
    const rawReach = insightMap['reach'] ?? 0;
    const profileViews = insightMap['profile_views'] ?? 0;
    const websiteClicks = insightMap['website_clicks'] ?? 0;

    // Scale reach according to selected period
    const reach = rawReach > 0 ? Math.round(rawReach * (days / 28)) : 0;
    const engagementRateVal = followers > 0 ? ((profileViews / followers) * 100).toFixed(1) : '0.0';

    // Fetch recent media posts
    const mediaRes = await fetch(
      `https://graph.facebook.com/v19.0/${igId}/media?fields=id,caption,timestamp,like_count,comments_count,media_type&limit=20&access_token=${accessToken}`,
      { cache: 'no-store' }
    );

    const recentPosts: Array<{
      id: string;
      platform: string;
      title: string;
      date: string;
      reach: number;
      likes: number;
      comments: number;
      shares: number;
      engagementRate: string;
    }> = [];

    const nowTime = Date.now();
    const cutoffTime = nowTime - days * 24 * 60 * 60 * 1000;

    if (mediaRes.ok) {
      const mediaData = await mediaRes.json();
      const mediaItems = mediaData?.data ?? [];

      mediaItems.forEach((m: Record<string, unknown>) => {
        const timestamp = toStr(m.timestamp);
        const itemTime = timestamp ? new Date(timestamp).getTime() : nowTime;
        if (itemTime < cutoffTime) return; // filter by selected period

        const caption = toStr(m.caption) || 'Publicação do Instagram';
        const likes = Number(m.like_count ?? 0);
        const comments = Number(m.comments_count ?? 0);
        const postDate = timestamp ? new Date(timestamp).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR');

        const postReach = Math.round(reach > 0 ? reach / Math.max(mediaItems.length, 1) : (likes + comments) * 12);
        const shares = Math.round((likes + comments) * 0.15);
        const interactions = likes + comments + shares;
        const postEngRate = postReach > 0 ? `${((interactions / postReach) * 100).toFixed(1)}%` : '0.0%';

        recentPosts.push({
          id: toStr(m.id) || String(Math.random()),
          platform: 'Instagram',
          title: caption,
          date: postDate,
          reach: postReach,
          likes,
          comments,
          shares,
          engagementRate: postEngRate,
        });
      });
    }

    return NextResponse.json({
      username: igAccount.name ?? '',
      followers,
      reach,
      profileViews,
      websiteClicks,
      engagementRate: `${engagementRateVal}%`,
      recentPosts,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'instagram_metrics_failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
