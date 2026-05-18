export type ConnectorStatus = {
  googleAds: boolean;
  metaAds: boolean;
  linkedinAds: boolean;
  ga4: boolean;
  serverTracking: boolean;
  crm: boolean;
  payments: boolean;
  warehouse: boolean;
};

export type ConnectorKey = keyof ConnectorStatus;

export type ConnectorDefinition = {
  key: ConnectorKey;
  name: string;
  source: string;
  required: boolean;
  usedBy: string;
};

export type ConnectorConnection = {
  isActive?: boolean;
  provider?: string;
  accountId?: string;
  accessToken?: string;
  refreshToken?: string;
  connectedAt?: number;
  updatedAt?: number;
  expiresIn?: number;
  expiresAt?: number;
  metadata?: Record<string, unknown>;
};

export const DEFAULT_CONNECTOR_STATUS: ConnectorStatus = {
  googleAds: false,
  metaAds: false,
  linkedinAds: false,
  ga4: false,
  serverTracking: false,
  crm: false,
  payments: false,
  warehouse: false,
};

export const CONNECTOR_DEFINITIONS: ConnectorDefinition[] = [
  { key: 'googleAds', name: 'Google Ads API', source: 'Mídia paga', required: true, usedBy: 'ROAS, CAC, alertas de campanha' },
  { key: 'metaAds', name: 'Meta Ads API', source: 'Mídia paga', required: true, usedBy: 'CPL, CPA, desperdício e variações' },
  { key: 'linkedinAds', name: 'LinkedIn Ads API', source: 'Mídia paga B2B', required: true, usedBy: 'CPL B2B, qualidade de lead e CAC por conta' },
  { key: 'ga4', name: 'GA4 Data API', source: 'Analytics', required: true, usedBy: 'Funil, taxa de conversão e jornada' },
  { key: 'serverTracking', name: 'GTM Server + CAPI/Enhanced', source: 'Atribuição', required: true, usedBy: 'Atribuição confiável e deduplicação' },
  { key: 'crm', name: 'CRM (HubSpot/RD/Pipedrive)', source: 'Vendas', required: true, usedBy: 'MQL, SQL, ganhos reais por estágio' },
  { key: 'payments', name: 'Stripe/Pagamentos', source: 'Receita', required: true, usedBy: 'Receita confirmada e LTV' },
  { key: 'warehouse', name: 'BigQuery/Data Warehouse', source: 'Consolidação', required: true, usedBy: 'Visão unificada e projeções' },
];

export const CONNECTOR_CONNECTION_KEYS: Record<ConnectorKey, string> = {
  googleAds: 'google_ads',
  metaAds: 'meta_ads',
  linkedinAds: 'linkedin_ads',
  ga4: 'ga4',
  serverTracking: 'gtm_server',
  crm: 'crm',
  payments: 'stripe',
  warehouse: 'bigquery',
};

export function getConnectorStatusFromConnections(
  connections: Record<string, ConnectorConnection | null | undefined> | undefined | null
): ConnectorStatus {
  if (!connections) return { ...DEFAULT_CONNECTOR_STATUS };

  const status = { ...DEFAULT_CONNECTOR_STATUS };
  (Object.keys(status) as ConnectorKey[]).forEach((key) => {
    const storageKey = CONNECTOR_CONNECTION_KEYS[key];
    status[key] = Boolean(connections[storageKey]?.isActive);
  });
  return status;
}
