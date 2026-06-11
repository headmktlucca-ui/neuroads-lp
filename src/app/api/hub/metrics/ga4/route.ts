import { NextResponse } from 'next/server';

function toStringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const accessToken = toStringValue(body?.accessToken);
    const accountId = toStringValue(body?.accountId);

    if (!accessToken) {
      return NextResponse.json({ error: 'access_token_required' }, { status: 400 });
    }

    let propertyName = '';

    // Step 1: Find a property for this account
    if (accountId) {
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

    // Step 2: Run report
    const reportEndpoint = `https://analyticsdata.googleapis.com/v1beta/${propertyName}:runReport`;
    const reportRes = await fetch(reportEndpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        metrics: [
          { name: 'activeUsers' },
          { name: 'averageSessionDuration' },
          { name: 'conversions' },
          { name: 'engagementRate' }
        ]
      })
    });

    const reportData = await reportRes.json();

    if (!reportRes.ok) {
      return NextResponse.json({ error: reportData.error?.message || 'Failed to fetch GA4 report' }, { status: reportRes.status });
    }

    // Extract values
    let activeUsers = '0';
    let averageSessionDuration = '0';
    let conversions = '0';
    let engagementRate = '0';

    if (reportData.rows && reportData.rows.length > 0) {
      const metricValues = reportData.rows[0].metricValues;
      activeUsers = metricValues[0]?.value || '0';
      
      const durationSeconds = parseFloat(metricValues[1]?.value || '0');
      const mins = Math.floor(durationSeconds / 60);
      const secs = Math.floor(durationSeconds % 60);
      averageSessionDuration = `${mins}m ${secs}s`;

      conversions = metricValues[2]?.value || '0';
      
      const rate = parseFloat(metricValues[3]?.value || '0');
      engagementRate = `${(rate * 100).toFixed(2)}%`;
    }

    return NextResponse.json({
      activeUsers,
      averageSessionDuration,
      conversions,
      engagementRate
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'ga4_metrics_failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
