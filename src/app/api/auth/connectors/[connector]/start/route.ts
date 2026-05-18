import { NextResponse } from 'next/server';
import type { ConnectorKey } from '@/lib/connectors';
import { buildOAuthAuthorizationUrl, type ConnectorProvider } from '@/lib/connector-auth';

const SUPPORTED_CONNECTORS: ConnectorKey[] = [
  'googleAds',
  'metaAds',
  'linkedinAds',
  'ga4',
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
  const { searchParams } = new URL(request.url);
  const next = searchParams.get('next') || '/hub?connectors=1';
  const safeNext = next.startsWith('/') ? next : '/hub?connectors=1';
  const redirectWithError = (message: string) => {
    const base = new URL(process.env.NEXT_PUBLIC_APP_URL?.trim() || 'http://localhost:3000');
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
  const built = buildOAuthAuthorizationUrl(connector, provider as ConnectorProvider | null, next);
  if ('error' in built) {
    const missing = built.missingEnv?.length ? ` (${built.missingEnv.join(', ')})` : '';
    return redirectWithError(`${built.error}${missing}`);
  }

  return NextResponse.redirect(built.url);
}
