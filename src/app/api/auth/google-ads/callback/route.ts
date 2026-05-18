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
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');
  const appUrl = resolveAppUrl(request);
  const safeNext = state ? decodeURIComponent(state) : '/hub';
  const redirectPath = safeNext.startsWith('/') ? safeNext : '/hub';

  if (error || !code) {
    const errorMsg = error || 'authorization_failed';
    return NextResponse.redirect(`${appUrl}${redirectPath}?google_ads_error=${errorMsg}`);
  }

  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
  const redirectUri = `${appUrl}/api/auth/google-ads/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${appUrl}/hub?google_ads_error=missing_credentials`);
  }

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.json();
      console.error('Token exchange failed:', tokenError);
      return NextResponse.redirect(`${appUrl}${redirectPath}?google_ads_error=token_exchange_failed`);
    }

    const { access_token, refresh_token } = await tokenResponse.json();

    // Redirect back to hub with tokens as query params (short-lived session)
    // The client will pick these up and store them in state
    const successUrl = new URL(`${appUrl}${redirectPath}`);
    successUrl.searchParams.set('google_ads_token', access_token);
    if (refresh_token) {
      successUrl.searchParams.set('google_ads_refresh', refresh_token);
    }

    return NextResponse.redirect(successUrl.toString());
  } catch (err) {
    console.error('Google Ads OAuth callback error:', err);
    return NextResponse.redirect(`${appUrl}${redirectPath}?google_ads_error=callback_error`);
  }
}
