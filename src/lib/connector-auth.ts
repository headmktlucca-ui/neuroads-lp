import { randomUUID } from 'node:crypto';
import type { ConnectorKey } from './connectors';

export type ConnectorProvider =
  | 'google'
  | 'meta'
  | 'linkedin'
  | 'hubspot'
  | 'stripe'
  | 'bigquery';

type TokenExchangeStyle = 'form-post' | 'meta-get' | 'stripe-post';

type ConnectorProviderConfig = {
  provider: ConnectorProvider;
  authUrl: string;
  tokenUrl: string;
  scope: string;
  clientIdEnvKeys: string[];
  clientSecretEnvKeys: string[];
  authExtraParams?: Record<string, string>;
  tokenExchangeStyle: TokenExchangeStyle;
};

type ConnectorOAuthConfig = {
  connector: ConnectorKey;
  providers: ConnectorProviderConfig[];
  defaultProvider: ConnectorProvider;
};

export type ConnectorAuthState = {
  connector: ConnectorKey;
  provider: ConnectorProvider;
  next: string;
  nonce: string;
  issuedAt: number;
};

export type ConnectorTokenExchangeResult = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  accountId?: string;
  raw: Record<string, unknown>;
};

function extractErrorMessage(payload: Record<string, unknown>, fallback: string): string {
  const directError = payload.error;
  if (typeof directError === 'string' && directError.trim()) return directError;
  if (directError && typeof directError === 'object') {
    const message = (directError as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  const errorDescription = payload.error_description;
  if (typeof errorDescription === 'string' && errorDescription.trim()) return errorDescription;
  return fallback;
}

const CONNECTOR_OAUTH_CONFIGS: Record<ConnectorKey, ConnectorOAuthConfig | null> = {
  googleAds: {
    connector: 'googleAds',
    defaultProvider: 'google',
    providers: [
      {
        provider: 'google',
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scope: 'https://www.googleapis.com/auth/adwords openid email profile',
        clientIdEnvKeys: ['GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_ADS_CLIENT_ID'],
        clientSecretEnvKeys: ['GOOGLE_OAUTH_CLIENT_SECRET', 'GOOGLE_ADS_CLIENT_SECRET'],
        authExtraParams: {
          access_type: 'offline',
          prompt: 'consent',
          include_granted_scopes: 'true',
        },
        tokenExchangeStyle: 'form-post',
      },
    ],
  },
  metaAds: {
    connector: 'metaAds',
    defaultProvider: 'meta',
    providers: [
      {
        provider: 'meta',
        authUrl: 'https://www.facebook.com/v23.0/dialog/oauth',
        tokenUrl: 'https://graph.facebook.com/v23.0/oauth/access_token',
        scope: 'ads_read,business_management',
        clientIdEnvKeys: ['META_APP_ID'],
        clientSecretEnvKeys: ['META_APP_SECRET'],
        authExtraParams: {
          display: 'popup',
        },
        tokenExchangeStyle: 'meta-get',
      },
    ],
  },
  instagram: {
    connector: 'instagram',
    defaultProvider: 'meta',
    providers: [
      {
        provider: 'meta',
        authUrl: 'https://www.facebook.com/v23.0/dialog/oauth',
        tokenUrl: 'https://graph.facebook.com/v23.0/oauth/access_token',
        scope: 'instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement,business_management',
        clientIdEnvKeys: ['META_APP_ID'],
        clientSecretEnvKeys: ['META_APP_SECRET'],
        authExtraParams: {
          display: 'popup',
        },
        tokenExchangeStyle: 'meta-get',
      },
    ],
  },
  linkedinAds: {
    connector: 'linkedinAds',
    defaultProvider: 'linkedin',
    providers: [
      {
        provider: 'linkedin',
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
        scope: 'r_liteprofile r_emailaddress r_ads r_ads_reporting',
        clientIdEnvKeys: ['LINKEDIN_ADS_CLIENT_ID', 'LINKEDIN_CLIENT_ID'],
        clientSecretEnvKeys: ['LINKEDIN_ADS_CLIENT_SECRET', 'LINKEDIN_CLIENT_SECRET'],
        tokenExchangeStyle: 'form-post',
      },
    ],
  },
  ga4: {
    connector: 'ga4',
    defaultProvider: 'google',
    providers: [
      {
        provider: 'google',
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scope: 'https://www.googleapis.com/auth/analytics.readonly openid email profile',
        clientIdEnvKeys: ['GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_ADS_CLIENT_ID'],
        clientSecretEnvKeys: ['GOOGLE_OAUTH_CLIENT_SECRET', 'GOOGLE_ADS_CLIENT_SECRET'],
        authExtraParams: {
          access_type: 'offline',
          prompt: 'consent',
          include_granted_scopes: 'true',
        },
        tokenExchangeStyle: 'form-post',
      },
    ],
  },
  serverTracking: null,
  crm: {
    connector: 'crm',
    defaultProvider: 'hubspot',
    providers: [
      {
        provider: 'hubspot',
        authUrl: 'https://app.hubspot.com/oauth/authorize',
        tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
        scope: 'crm.objects.contacts.read crm.objects.deals.read oauth',
        clientIdEnvKeys: ['HUBSPOT_CLIENT_ID'],
        clientSecretEnvKeys: ['HUBSPOT_CLIENT_SECRET'],
        tokenExchangeStyle: 'form-post',
      },
    ],
  },
  payments: {
    connector: 'payments',
    defaultProvider: 'stripe',
    providers: [
      {
        provider: 'stripe',
        authUrl: 'https://connect.stripe.com/oauth/authorize',
        tokenUrl: 'https://connect.stripe.com/oauth/token',
        scope: 'read_write',
        clientIdEnvKeys: ['STRIPE_CONNECT_CLIENT_ID'],
        clientSecretEnvKeys: ['STRIPE_SECRET_KEY'],
        tokenExchangeStyle: 'stripe-post',
      },
    ],
  },
  warehouse: {
    connector: 'warehouse',
    defaultProvider: 'bigquery',
    providers: [
      {
        provider: 'bigquery',
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        scope: 'https://www.googleapis.com/auth/bigquery.readonly openid email profile',
        clientIdEnvKeys: ['GOOGLE_OAUTH_CLIENT_ID', 'GOOGLE_ADS_CLIENT_ID'],
        clientSecretEnvKeys: ['GOOGLE_OAUTH_CLIENT_SECRET', 'GOOGLE_ADS_CLIENT_SECRET'],
        authExtraParams: {
          access_type: 'offline',
          prompt: 'consent',
          include_granted_scopes: 'true',
        },
        tokenExchangeStyle: 'form-post',
      },
    ],
  },
};

function getEnvValue(envKeys: string[]): string | null {
  for (const key of envKeys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return null;
}

function toBase64Url(value: string): string {
  return Buffer.from(value, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, 'base64').toString('utf8');
}

function stripTrailingSlashes(value: string): string {
  return value.replace(/\/+$/g, '');
}

function isLocalHostname(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase().replace(/^\[(.*)\]$/, '$1');
  return normalized === 'localhost' || normalized === '127.0.0.1' || normalized === '::1';
}

function getRequestOrigin(request: Request): string {
  try {
    const requestUrl = new URL(request.url);
    const forwardedHost = request.headers.get('x-forwarded-host')?.trim();
    const host = (forwardedHost || request.headers.get('host') || requestUrl.host).trim();
    const forwardedProto = request.headers.get('x-forwarded-proto')?.trim();
    const protocol = forwardedProto || requestUrl.protocol.replace(/:$/, '');
    return `${protocol}://${host}`;
  } catch {
    return 'http://localhost:3000';
  }
}

function resolveBaseUrl(overrideBaseUrl?: string, request?: Request): string {
  if (overrideBaseUrl?.trim()) {
    return stripTrailingSlashes(overrideBaseUrl.trim());
  }

  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!request) {
    return stripTrailingSlashes(configured || 'http://localhost:3000');
  }

  const requestOrigin = stripTrailingSlashes(getRequestOrigin(request));
  try {
    const requestHost = new URL(requestOrigin).hostname;
    if (isLocalHostname(requestHost)) {
      return requestOrigin;
    }
  } catch {
    // Ignore parse failures and fallback to configured URL.
  }

  return stripTrailingSlashes(configured || requestOrigin);
}

export function getAppBaseUrl(): string {
  return resolveBaseUrl();
}

export function getAppBaseUrlForRequest(request: Request): string {
  return resolveBaseUrl(undefined, request);
}

export function getConnectorOAuthConfig(connector: ConnectorKey): ConnectorOAuthConfig | null {
  return CONNECTOR_OAUTH_CONFIGS[connector] ?? null;
}

export function listAvailableProviders(connector: ConnectorKey): ConnectorProvider[] {
  const config = getConnectorOAuthConfig(connector);
  if (!config) return [];
  return config.providers.map((item) => item.provider);
}

export function resolveProviderConfig(
  connector: ConnectorKey,
  provider: ConnectorProvider | null | undefined
): ConnectorProviderConfig | null {
  const config = getConnectorOAuthConfig(connector);
  if (!config) return null;

  if (provider) {
    return config.providers.find((item) => item.provider === provider) ?? null;
  }

  return config.providers.find((item) => item.provider === config.defaultProvider) ?? null;
}

export function buildCallbackUrl(connector: ConnectorKey, appBaseUrl?: string): string {
  return `${resolveBaseUrl(appBaseUrl)}/api/auth/connectors/${connector}/callback`;
}

export function createAuthState(connector: ConnectorKey, provider: ConnectorProvider, next: string): string {
  const safeNext = next.startsWith('/') ? next : '/hub';
  const payload: ConnectorAuthState = {
    connector,
    provider,
    next: safeNext,
    nonce: randomUUID(),
    issuedAt: Date.now(),
  };
  return toBase64Url(JSON.stringify(payload));
}

export function parseAuthState(encodedState: string | null): ConnectorAuthState | null {
  if (!encodedState) return null;
  try {
    const decoded = fromBase64Url(encodedState);
    const parsed = JSON.parse(decoded) as ConnectorAuthState;
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.connector || !parsed.provider || !parsed.next) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function buildOAuthAuthorizationUrl(
  connector: ConnectorKey,
  provider: ConnectorProvider | null | undefined,
  next: string,
  options?: {
    appBaseUrl?: string;
  }
): { url: string; provider: ConnectorProvider } | { error: string; missingEnv?: string[] } {
  const providerConfig = resolveProviderConfig(connector, provider);
  if (!providerConfig) {
    return { error: `Conector ${connector} não possui configuração OAuth ativa.` };
  }

  const clientId = getEnvValue(providerConfig.clientIdEnvKeys);
  const clientSecret = getEnvValue(providerConfig.clientSecretEnvKeys);
  const missingEnv: string[] = [];
  if (!clientId) missingEnv.push(providerConfig.clientIdEnvKeys.join(' | '));
  if (!clientSecret) missingEnv.push(providerConfig.clientSecretEnvKeys.join(' | '));
  if (missingEnv.length > 0) {
    return {
      error: `Credenciais OAuth ausentes para ${providerConfig.provider}.`,
      missingEnv,
    };
  }
  if (!clientId || !clientSecret) {
    return {
      error: `Credenciais OAuth ausentes para ${providerConfig.provider}.`,
      missingEnv: providerConfig.clientIdEnvKeys.concat(providerConfig.clientSecretEnvKeys),
    };
  }

  const callbackUrl = buildCallbackUrl(connector, options?.appBaseUrl);
  const state = createAuthState(connector, providerConfig.provider, next);
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: callbackUrl,
    state,
    scope: providerConfig.scope,
  });

  Object.entries(providerConfig.authExtraParams ?? {}).forEach(([key, value]) => {
    params.set(key, value);
  });

  return {
    url: `${providerConfig.authUrl}?${params.toString()}`,
    provider: providerConfig.provider,
  };
}

export async function exchangeOAuthCodeForToken(args: {
  connector: ConnectorKey;
  provider: ConnectorProvider;
  code: string;
  appBaseUrl?: string;
}): Promise<ConnectorTokenExchangeResult> {
  const providerConfig = resolveProviderConfig(args.connector, args.provider);
  if (!providerConfig) {
    throw new Error(`Provider ${args.provider} não configurado para ${args.connector}.`);
  }

  const clientId = getEnvValue(providerConfig.clientIdEnvKeys);
  const clientSecret = getEnvValue(providerConfig.clientSecretEnvKeys);
  if (!clientId || !clientSecret) {
    throw new Error(`Credenciais OAuth ausentes para ${args.provider}.`);
  }

  const callbackUrl = buildCallbackUrl(args.connector, args.appBaseUrl);

  if (providerConfig.tokenExchangeStyle === 'meta-get') {
    const tokenUrl = new URL(providerConfig.tokenUrl);
    tokenUrl.searchParams.set('client_id', clientId);
    tokenUrl.searchParams.set('client_secret', clientSecret);
    tokenUrl.searchParams.set('redirect_uri', callbackUrl);
    tokenUrl.searchParams.set('code', args.code);
    const response = await fetch(tokenUrl.toString(), { method: 'GET' });
    const payload = (await response.json()) as Record<string, unknown>;
    if (!response.ok || !payload.access_token) {
      throw new Error(extractErrorMessage(payload, 'Falha no token OAuth da Meta.'));
    }
    return {
      accessToken: String(payload.access_token),
      expiresIn: Number(payload.expires_in || 0) || undefined,
      raw: payload,
    };
  }

  if (providerConfig.tokenExchangeStyle === 'stripe-post') {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: args.code,
      client_secret: clientSecret,
    });
    const response = await fetch(providerConfig.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });
    const payload = (await response.json()) as Record<string, unknown>;
    if (!response.ok || !payload.access_token) {
      const message = typeof payload.error_description === 'string'
        ? payload.error_description
        : typeof payload.error === 'string'
          ? payload.error
          : 'Falha no token OAuth da Stripe.';
      throw new Error(message);
    }
    return {
      accessToken: String(payload.access_token),
      refreshToken: typeof payload.refresh_token === 'string' ? payload.refresh_token : undefined,
      expiresIn: Number(payload.expires_in || 0) || undefined,
      accountId: typeof payload.stripe_user_id === 'string' ? payload.stripe_user_id : undefined,
      raw: payload,
    };
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: args.code,
    redirect_uri: callbackUrl,
    client_id: clientId,
    client_secret: clientSecret,
  });
  const response = await fetch(providerConfig.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });
  const payload = (await response.json()) as Record<string, unknown>;
  if (!response.ok || !payload.access_token) {
    throw new Error(extractErrorMessage(payload, 'Falha ao trocar código OAuth por token.'));
  }

  return {
    accessToken: String(payload.access_token),
    refreshToken: typeof payload.refresh_token === 'string' ? payload.refresh_token : undefined,
    expiresIn: Number(payload.expires_in || 0) || undefined,
    raw: payload,
  };
}
