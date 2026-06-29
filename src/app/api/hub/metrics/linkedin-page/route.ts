import { NextResponse } from 'next/server';

function toStr(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let accessToken = toStr(body?.accessToken);
    const accountId = toStr(body?.accountId); // LinkedIn organization URN or ID
    const uid = toStr(body?.uid);

    if (uid) {
      const { getValidAccessToken } = await import('@/lib/connector-refresh-server');
      const fresh = await getValidAccessToken(uid, 'linkedinPage');
      if (fresh) accessToken = fresh;
    }

    if (!accessToken) {
      return NextResponse.json({ error: 'access_token_required' }, { status: 400 });
    }

    // Get organization ID from profile if not passed
    let orgId = accountId;
    if (!orgId) {
      const profileRes = await fetch('https://api.linkedin.com/v2/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      });
      const profileData = await profileRes.json();
      // Fallback: use member profile id (won't have org followers but gives a signal)
      orgId = toStr(profileData?.id);
    }

    if (!orgId) {
      return NextResponse.json({ error: 'no_linkedin_org' }, { status: 404 });
    }

    // Organization follower count
    const followersRes = await fetch(
      `https://api.linkedin.com/v2/networkSizes/urn:li:organization:${orgId}?edgeType=CompanyFollowedByMember`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      }
    );
    const followersData = await followersRes.json();
    const followers = followersData?.firstDegreeSize ?? 0;

    // Organization page statistics (30 days)
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const statsRes = await fetch(
      `https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:${orgId}&timeIntervals.timeGranularityType=MONTH&timeIntervals.timeRange.start=${thirtyDaysAgo}&timeIntervals.timeRange.end=${now}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      }
    );
    const statsData = await statsRes.json();
    const firstStat = statsData?.elements?.[0]?.totalShareStatistics ?? {};

    const impressions = firstStat.impressionCount ?? 0;
    const clicks = firstStat.clickCount ?? 0;
    const engagement = firstStat.engagement ?? 0;
    const engagementRate = `${(engagement * 100).toFixed(2)}%`;

    return NextResponse.json({
      followers,
      impressions,
      clicks,
      engagementRate,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'linkedin_page_metrics_failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
