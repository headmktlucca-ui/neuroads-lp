import { NextResponse } from 'next/server';
import type { ConnectorKey } from '@/lib/connectors';
import {
  exchangeOAuthCodeForToken,
  getAppBaseUrlForRequest,
  parseAuthState,
  type ConnectorProvider,
} from '@/lib/connector-auth';

const SUPPORTED_CONNECTORS: ConnectorKey[] = [
  'googleAds',
  'googleTrends',
  'metaAds',
  'instagram',
  'linkedinAds',
  'linkedinPage',
  'rdStation',
  'rdStationMarketing',
  'rdStationConversas',
  'ga4',
  'tiktok',
  'tiktokAds',
  'crm',
  'payments',
  'warehouse',
];

function isSupportedConnector(value: string): value is ConnectorKey {
  return SUPPORTED_CONNECTORS.includes(value as ConnectorKey);
}

function buildRedirectUrl(path: string, appBase: string) {
  if (path.startsWith('/')) return new URL(`${appBase}${path}`);
  return new URL(`${appBase}/hub/conectores`);
}

export async function GET(
  request: Request,
  context: { params: Promise<{ connector: string }> }
) {
  const appBaseUrl = getAppBaseUrlForRequest(request);
  const { connector } = await context.params;
  if (!isSupportedConnector(connector)) {
    return NextResponse.redirect(`${appBaseUrl}/hub/conectores?connector_auth_error=unsupported_connector`);
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = parseAuthState(searchParams.get('state'));

  const redirectPath = state?.next && state.next.startsWith('/') ? state.next : '/hub/conectores';
  const redirectUrl = buildRedirectUrl(redirectPath, appBaseUrl);
  redirectUrl.searchParams.set('connector', connector);

  if (error || !code || !state) {
    redirectUrl.searchParams.set('connector_auth_error', error || 'authorization_failed');
    return NextResponse.redirect(redirectUrl);
  }
  if (state.connector !== connector) {
    redirectUrl.searchParams.set('connector_auth_error', 'state_connector_mismatch');
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const tokenData = await exchangeOAuthCodeForToken({
      connector,
      provider: state.provider as ConnectorProvider,
      code,
      appBaseUrl,
      runtime: state.runtime,
    });

    redirectUrl.searchParams.set('connector_auth_success', '1');
    redirectUrl.searchParams.set('connector_provider', state.provider);
    redirectUrl.searchParams.set('connector_access_token', tokenData.accessToken);
    if (tokenData.refreshToken) {
      redirectUrl.searchParams.set('connector_refresh_token', tokenData.refreshToken);
    }
    if (tokenData.accountId) {
      redirectUrl.searchParams.set('connector_account_id', tokenData.accountId);
    }
    if (typeof tokenData.expiresIn === 'number' && Number.isFinite(tokenData.expiresIn)) {
      redirectUrl.searchParams.set('connector_expires_in', String(tokenData.expiresIn));
    }

    return NextResponse.redirect(redirectUrl);
  } catch (exchangeError) {
    const message = exchangeError instanceof Error ? exchangeError.message : 'token_exchange_failed';
    redirectUrl.searchParams.set('connector_auth_error', message);
    return NextResponse.redirect(redirectUrl);
  }
}

