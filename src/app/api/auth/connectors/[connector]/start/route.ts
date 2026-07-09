import { NextResponse } from 'next/server';
import type { ConnectorKey } from '@/lib/connectors';
import {
  buildOAuthAuthorizationUrl,
  getAppBaseUrlForRequest,
  type ConnectorProvider,
} from '@/lib/connector-auth';

const SUPPORTED_CONNECTORS: ConnectorKey[] = [
  'googleAds',
  'searchConsole',
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

export async function GET(
  request: Request,
  context: { params: Promise<{ connector: string }> }
) {
  const appBaseUrl = getAppBaseUrlForRequest(request);
  const { searchParams } = new URL(request.url);
  const next = searchParams.get('next') || '/hub/conectores';
  const safeNext = next.startsWith('/') ? next : '/hub/conectores';
  const redirectWithError = (message: string) => {
    const base = new URL(appBaseUrl);
    const url = new URL(safeNext, base);
    url.searchParams.set('connector', connector);
    url.searchParams.set('connector_auth_error', message);
    return NextResponse.redirect(url);
  };

  const { connector } = await context.params;
  if (!isSupportedConnector(connector)) {
    return redirectWithError('unsupported_connector');
  }

  const provider = searchParams.get('provider');
  const runtimeHubSpot =
    connector === 'crm'
      ? {
          appId: searchParams.get('hubspot_app_id')?.trim() || undefined,
          clientId: searchParams.get('hubspot_client_id')?.trim() || undefined,
          clientSecret: searchParams.get('hubspot_client_secret')?.trim() || undefined,
          callbackUrl: searchParams.get('hubspot_redirect_uri')?.trim() || undefined,
          optionalScope: searchParams.get('hubspot_optional_scope')?.trim() || undefined,
        }
      : undefined;

  const runtimeStripe =
    connector === 'payments'
      ? {
          clientId: searchParams.get('stripe_connect_client_id')?.trim() || undefined,
        }
      : undefined;

  // HubSpot: credenciais em runtime são um override opcional — quando ausentes,
  // buildOAuthAuthorizationUrl usa HUBSPOT_CLIENT_ID / HUBSPOT_CLIENT_SECRET do env.
  const hasRuntimeHubSpot = Boolean(runtimeHubSpot?.clientId && runtimeHubSpot?.clientSecret);

  const built = buildOAuthAuthorizationUrl(
    connector,
    provider as ConnectorProvider | null,
    next,
    {
      appBaseUrl,
      runtime: connector === 'crm'
        ? (hasRuntimeHubSpot ? runtimeHubSpot : undefined)
        : runtimeStripe,
    }
  );
  if ('error' in built) {
    const missing = built.missingEnv?.length ? ` (${built.missingEnv.join(', ')})` : '';
    return redirectWithError(`${built.error}${missing}`);
  }

  return NextResponse.redirect(built.url);
}

