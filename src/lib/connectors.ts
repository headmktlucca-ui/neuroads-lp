export type ConnectorStatus = {
  googleAds: boolean;
  metaAds: boolean;
  instagram: boolean;
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
  loginCustomerId?: string;
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
  instagram: false,
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
  { key: 'instagram', name: 'Instagram Graph API', source: 'Atendimento e conteúdo', required: false, usedBy: 'Sinais de engajamento, perfil e inteligência de conteúdo' },
  { key: 'linkedinAds', name: 'LinkedIn Ads API', source: 'Mídia paga B2B', required: true, usedBy: 'CPL B2B, qualidade de lead e CAC por conta' },
  { key: 'ga4', name: 'GA4 Data API', source: 'Analytics', required: true, usedBy: 'Funil, taxa de conversão e jornada' },
  { key: 'serverTracking', name: 'GTM Server + CAPI/Enhanced', source: 'Atribuição', required: true, usedBy: 'Atribuição confiável e deduplicação' },
  { key: 'crm', name: 'CRM HubSpot', source: 'Vendas', required: true, usedBy: 'MQL, SQL e ganhos reais por estágio' },
  { key: 'payments', name: 'Stripe/Pagamentos', source: 'Receita', required: true, usedBy: 'Receita confirmada e LTV' },
  { key: 'warehouse', name: 'BigQuery/Data Warehouse', source: 'Consolidação', required: true, usedBy: 'Visão unificada e projeções' },
];

export const CONNECTOR_CONNECTION_KEYS: Record<ConnectorKey, string> = {
  googleAds: 'google_ads',
  metaAds: 'meta_ads',
  instagram: 'instagram',
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
