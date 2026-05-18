import { NextResponse } from 'next/server';

function resolveAppUrl(request: Request): string {
  const requestUrl = new URL(request.url);
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || requestUrl.host;
  const proto = request.headers.get('x-forwarded-proto') || requestUrl.protocol.replace(/:$/, '');
  const origin = `${proto}://${host}`.replace(/\/+$/g, '');
  const hostname = requestUrl.hostname.toLowerCase();
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/+$/g, '');

  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
    return origin;
  }

  return configured || origin;
}

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const appUrl = resolveAppUrl(request);
  const { searchParams } = new URL(request.url);
  const next = searchParams.get('next');
  const safeNext = next && next.startsWith('/') ? next : '/hub';
  
  if (!clientId) {
    return NextResponse.json(
      { error: 'GOOGLE_ADS_CLIENT_ID não configurado no servidor.' },
      { status: 500 }
    );
  }

  const redirectUri = `${appUrl}/api/auth/google-ads/callback`;
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: [
      'https://www.googleapis.com/auth/adwords',
      'openid',
      'email',
      'profile',
    ].join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: encodeURIComponent(safeNext),
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  
  return NextResponse.redirect(authUrl);
}
