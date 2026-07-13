import 'server-only';
import { getAdminDb } from './firebase-admin';

// Map connector key to storage key in Firestore
const STORAGE_KEYS: Record<string, string> = {
  googleAds: 'google_ads',
  searchConsole: 'search_console',
  metaAds: 'meta_ads',
  instagram: 'instagram',
  linkedinAds: 'linkedin_ads',
  linkedinPage: 'linkedin_page',
  rdStation: 'rd_station_crm',
  rdStationMarketing: 'rd_station_marketing',
  rdStationConversas: 'rd_station_conversas',
  ga4: 'ga4',
  serverTracking: 'gtm_server',
  tiktok: 'tiktok',
  tiktokAds: 'tiktok_ads',
  crm: 'crm',
  payments: 'stripe',
  warehouse: 'bigquery',
};

type ConnectionData = {
  isActive?: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  accountId?: string;
  loginCustomerId?: string;
  metadata?: Record<string, unknown>;
};

function getGoogleCredentials() {
  const clientId = process.env.GOOGLE_ANALYTICS_CLIENT_ID || process.env.GOOGLE_ADS_CLIENT_ID || process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ANALYTICS_CLIENT_SECRET || process.env.GOOGLE_ADS_CLIENT_SECRET || process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  return { clientId, clientSecret };
}

function getLinkedinCredentials() {
  const clientId = process.env.LINKEDIN_ADS_CLIENT_ID || process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_ADS_CLIENT_SECRET || process.env.LINKEDIN_CLIENT_SECRET;
  return { clientId, clientSecret };
}

function getMetaCredentials() {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  return { appId, appSecret };
}

/**
 * Gets a valid access token for a connector, refreshing it if expired.
 */
export async function getValidAccessToken(uid: string, connectorKey: string): Promise<string | null> {
  const db = getAdminDb();
  const userRef = db.collection('users').doc(uid);
  const docSnap = await userRef.get();
  if (!docSnap.exists) return null;

  const data = docSnap.data() || {};
  const connections = data.connections || {};
  const storageKey = STORAGE_KEYS[connectorKey] || connectorKey;
  const conn = connections[storageKey] as ConnectionData | undefined;

  if (!conn || !conn.isActive || !conn.accessToken) return null;

  // If there is no expiresAt or it is not expired (with 5-minute safety margin)
  if (!conn.expiresAt || conn.expiresAt > Date.now() + 300 * 1000) {
    return conn.accessToken;
  }

  // Token is expired or expiring soon, try to refresh it
  if (!conn.refreshToken) {
    console.warn(`Connector ${connectorKey} is expired but has no refresh token.`);
    return conn.accessToken; // Fallback to current token anyway
  }

  try {
    let newAccessToken = '';
    let newExpiresIn = 3600;

    // Refresh Google connections (ga4, googleAds, searchConsole, warehouse/bigquery)
    if (['ga4', 'googleAds', 'searchConsole', 'warehouse'].includes(connectorKey)) {
      const { clientId, clientSecret } = getGoogleCredentials();
      if (!clientId || !clientSecret) {
        throw new Error('Google OAuth credentials not configured in environment.');
      }

      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: conn.refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      const payload = await res.json();
      if (!res.ok || !payload.access_token) {
        throw new Error(payload.error_description || payload.error || 'Google token refresh failed.');
      }

      newAccessToken = payload.access_token;
      newExpiresIn = Number(payload.expires_in || 3600);
    } 
    // Refresh LinkedIn connections (linkedinAds, linkedinPage)
    else if (['linkedinAds', 'linkedinPage'].includes(connectorKey)) {
      const { clientId, clientSecret } = getLinkedinCredentials();
      if (!clientId || !clientSecret) {
        throw new Error('LinkedIn OAuth credentials not configured in environment.');
      }

      const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: conn.refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      const payload = await res.json();
      if (!res.ok || !payload.access_token) {
        throw new Error(payload.error_description || payload.error || 'LinkedIn token refresh failed.');
      }

      newAccessToken = payload.access_token;
      newExpiresIn = Number(payload.expires_in || 5183999);
    }
    // Refresh Meta Ads token using app access token (regenerates long-lived user token)
    else if (connectorKey === 'metaAds') {
      const { appId, appSecret } = getMetaCredentials();
      if (!appId || !appSecret) {
        throw new Error('Meta OAuth credentials not configured in environment.');
      }

      // Step 1: Get app access token
      const appTokenRes = await fetch('https://graph.facebook.com/oauth/access_token', {
        method: 'GET',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const appTokenParams = new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        grant_type: 'client_credentials',
      });

      const appTokenUrl = new URL('https://graph.facebook.com/oauth/access_token');
      appTokenUrl.search = appTokenParams.toString();

      const appTokenFetch = await fetch(appTokenUrl.toString(), { method: 'GET' });
      const appTokenPayload = await appTokenFetch.json();
      if (!appTokenFetch.ok || !appTokenPayload.access_token) {
        throw new Error('Meta app token generation failed.');
      }

      const appAccessToken = appTokenPayload.access_token;

      // Step 2: Extend user token using app access token (gets a 60-day token)
      const extendParams = new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: conn.accessToken,
      });

      const extendUrl = new URL('https://graph.facebook.com/oauth/access_token');
      extendUrl.search = extendParams.toString();

      const extendRes = await fetch(extendUrl.toString(), { method: 'GET' });
      const extendPayload = await extendRes.json();
      if (!extendRes.ok || !extendPayload.access_token) {
        throw new Error(extendPayload.error?.message || 'Meta token extension failed.');
      }

      newAccessToken = extendPayload.access_token;
      // Meta long-lived tokens are valid for ~60 days
      newExpiresIn = Number(extendPayload.expires_in || 5184000); // 60 days default
    } else {
      // Other platforms do not support automatic server-side refresh, return existing
      return conn.accessToken;
    }

    // Save the refreshed token back to Firestore
    const expiresAt = Date.now() + newExpiresIn * 1000;
    const updatedConn = {
      ...conn,
      accessToken: newAccessToken,
      expiresAt,
      updatedAt: Date.now(),
    };

    await userRef.set(
      {
        connections: {
          [storageKey]: updatedConn,
        },
      },
      { merge: true }
    );

    console.log(`Successfully refreshed access token for ${connectorKey} (${uid})`);
    return newAccessToken;

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Failed to refresh token for ${connectorKey} of user ${uid}:`, errorMsg);
    return conn.accessToken; // Fallback to old token on failure
  }
}
