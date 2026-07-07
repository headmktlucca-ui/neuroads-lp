export type ConnectorStatus = {
  googleAds: boolean;
  searchConsole: boolean;
  metaAds: boolean;
  instagram: boolean;
  linkedinAds: boolean;
  linkedinPage: boolean;
  rdStation: boolean;
  rdStationMarketing: boolean;
  rdStationConversas: boolean;
  ga4: boolean;
  serverTracking: boolean;
  tiktok: boolean;
  tiktokAds: boolean;
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
  searchConsole: false,
  metaAds: false,
  instagram: false,
  linkedinAds: false,
  linkedinPage: false,
  rdStation: false,
  rdStationMarketing: false,
  rdStationConversas: false,
  ga4: false,
  serverTracking: false,
  tiktok: false,
  tiktokAds: false,
  crm: false,
  payments: false,
  warehouse: false,
};

export const CONNECTOR_DEFINITIONS: ConnectorDefinition[] = [
  { key: 'googleAds', name: 'Google Ads API', source: 'Mídia paga', required: true, usedBy: 'ROAS, CAC, alertas de campanha' },
  { key: 'searchConsole', name: 'Google Search Console', source: 'SEO Orgânico', required: false, usedBy: 'Termos de pesquisa, CTR, Posição média' },
  { key: 'metaAds', name: 'Meta Ads API', source: 'Mídia paga', required: true, usedBy: 'CPL, CPA, desperdício e variações' },
  { key: 'instagram', name: 'Instagram Graph API', source: 'Atendimento e conteúdo', required: false, usedBy: 'Sinais de engajamento, perfil e inteligência de conteúdo' },
  { key: 'linkedinAds', name: 'LinkedIn Ads API', source: 'Mídia paga B2B', required: true, usedBy: 'CPL B2B, qualidade de lead e CAC por conta' },
  { key: 'linkedinPage', name: 'LinkedIn Page API', source: 'Conteúdo orgânico B2B', required: false, usedBy: 'Engajamento orgânico, audiência e sinais de intenção' },
  { key: 'rdStation', name: 'RD Station CRM API', source: 'Vendas', required: false, usedBy: 'Pipeline, etapas e repasse comercial por origem' },
  { key: 'rdStationMarketing', name: 'RD Station Marketing API', source: 'Marketing', required: false, usedBy: 'Leads, automações e qualificação por campanha' },
  { key: 'rdStationConversas', name: 'RD Station Conversas API', source: 'Atendimento', required: false, usedBy: 'Mensagens, contexto e produtividade do time comercial' },
  { key: 'ga4', name: 'GA4 Data API', source: 'Analytics', required: true, usedBy: 'Funil, taxa de conversão e jornada' },
  { key: 'serverTracking', name: 'GTM Server + CAPI/Enhanced', source: 'Atribuição', required: true, usedBy: 'Atribuição confiável e deduplicação' },
  { key: 'tiktok', name: 'TikTok API', source: 'Atendimento e conteúdo', required: false, usedBy: 'Audiência, tendências e inteligência criativa' },
  { key: 'tiktokAds', name: 'TikTok Ads API', source: 'Mídia paga', required: false, usedBy: 'CPL, CPA e performance incremental no TikTok' },
  { key: 'crm', name: 'CRM HubSpot', source: 'Vendas', required: true, usedBy: 'MQL, SQL e ganhos reais por estágio' },
  { key: 'payments', name: 'Stripe/Pagamentos', source: 'Receita', required: true, usedBy: 'Receita confirmada e LTV' },
  { key: 'warehouse', name: 'BigQuery/Data Warehouse', source: 'Consolidação', required: true, usedBy: 'Visão unificada e projeções' },
];

export const CONNECTOR_CONNECTION_KEYS: Record<ConnectorKey, string> = {
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

export function getConnectorStatusFromConnections(
  connections: Record<string, ConnectorConnection | null | undefined> | undefined | null
): ConnectorStatus {
  if (!connections) return { ...DEFAULT_CONNECTOR_STATUS };

  const status = { ...DEFAULT_CONNECTOR_STATUS };
  (Object.keys(status) as ConnectorKey[]).forEach((key) => {
    const storageKey = CONNECTOR_CONNECTION_KEYS[key];
    status[key] = Boolean(connections[storageKey]?.isActive ?? connections[key]?.isActive);
  });
  return status;
}

/**
 * Normaliza o mapa cru de `users/{uid}.connections` (chaves de armazenamento
 * snake_case, com fallback para chaves camelCase legadas) para um mapa
 * indexado por ConnectorKey. Use sempre este helper ao ler conexões do perfil.
 */
export function normalizeConnections(
  connections: Record<string, ConnectorConnection | null | undefined> | undefined | null
): Partial<Record<ConnectorKey, ConnectorConnection>> {
  const result: Partial<Record<ConnectorKey, ConnectorConnection>> = {};
  if (!connections) return result;

  (Object.entries(CONNECTOR_CONNECTION_KEYS) as [ConnectorKey, string][]).forEach(([key, storageKey]) => {
    const conn = connections[storageKey] ?? connections[key];
    if (conn) result[key] = conn;
  });
  return result;
}

/** Nome de exibição de um conector (ex: 'metaAds' → 'Meta Ads API'). */
export function getConnectorDisplayName(key: ConnectorKey): string {
  return CONNECTOR_DEFINITIONS.find((d) => d.key === key)?.name ?? key;
}

/**
 * Lista canais conectados e não conectados a partir do mapa cru de conexões,
 * com nomes de exibição prontos para uso em prompts e UI.
 */
export function describeConnections(
  connections: Record<string, ConnectorConnection | null | undefined> | undefined | null
): { connected: string[]; disconnected: string[] } {
  const status = getConnectorStatusFromConnections(connections ?? null);
  const connected: string[] = [];
  const disconnected: string[] = [];
  CONNECTOR_DEFINITIONS.forEach((def) => {
    if (status[def.key]) connected.push(def.name);
    else disconnected.push(def.name);
  });
  return { connected, disconnected };
}
