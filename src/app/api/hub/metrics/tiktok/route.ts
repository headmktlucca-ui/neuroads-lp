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
      try {
        const { getValidAccessToken } = await import('@/lib/connector-refresh-server');
        const fresh = await getValidAccessToken(uid, 'tiktok');
        if (fresh) accessToken = fresh;
      } catch {
        // Fallback to accessToken from body
      }
    }

    if (!accessToken) {
      return NextResponse.json({ error: 'access_token_required' }, { status: 400 });
    }

    // Call TikTok Open API to get user info
    const userRes = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,follower_count,following_count,likes_count,video_count',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    let followerCount = 0;
    let likesCount = 0;
    let username = 'Perfil TikTok';
    let videoCount = 0;

    if (userRes.ok) {
      const userData = await userRes.json();
      const info = userData?.data?.user ?? {};
      followerCount = info.follower_count ?? 0;
      likesCount = info.likes_count ?? 0;
      username = info.display_name ?? 'Perfil TikTok';
      videoCount = info.video_count ?? 0;
    }

    // Fetch user recent videos for reach and engagement calculation
    const videoRes = await fetch('https://open.tiktokapis.com/v2/video/list/?fields=id,title,create_time,cover_image_url,share_count,comment_count,like_count,view_count', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ max_count: 20 }),
      cache: 'no-store',
    });

    let totalViews = 0;
    let totalLikes = likesCount;
    let totalComments = 0;
    let totalShares = 0;
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

    if (videoRes.ok) {
      const videoData = await videoRes.json();
      const videos = videoData?.data?.videos ?? [];

      videos.forEach((v: Record<string, unknown>) => {
        const createTimeSec = Number(v.create_time ?? 0);
        const itemTime = createTimeSec ? createTimeSec * 1000 : nowTime;
        if (itemTime < cutoffTime) return; // filter by selected period

        const views = Number(v.view_count ?? 0);
        const likes = Number(v.like_count ?? 0);
        const comments = Number(v.comment_count ?? 0);
        const shares = Number(v.share_count ?? 0);
        const title = toStr(v.title) || 'Vídeo sem título';

        totalViews += views;
        totalComments += comments;
        totalShares += shares;
        if (!likesCount) totalLikes += likes;

        const engagement = views > 0 ? (((likes + comments + shares) / views) * 100).toFixed(1) : '0.0';

        recentPosts.push({
          id: toStr(v.id) || String(Math.random()),
          platform: 'TikTok',
          title,
          date: createTimeSec ? new Date(createTimeSec * 1000).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
          reach: views,
          likes,
          comments,
          shares,
          engagementRate: `${engagement}%`,
        });
      });
    }

    const reach = Math.round(totalViews > 0 ? totalViews * (days / 30) : followerCount * 2.5 * (days / 30));
    const interactions = totalLikes + totalComments + totalShares;
    const engagementRate = reach > 0 ? `${((interactions / reach) * 100).toFixed(1)}%` : '0.0%';

    return NextResponse.json({
      username,
      followers: followerCount,
      reach: Math.round(reach),
      likes: totalLikes,
      comments: totalComments,
      shares: totalShares,
      videoCount,
      engagementRate,
      recentPosts,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'tiktok_metrics_failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
