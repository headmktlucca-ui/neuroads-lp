'use client';

import React, {
  Suspense, useCallback, useEffect, useRef, useState,
} from 'react';
import {
  Link2, ShieldCheck, ArrowRight, CheckCircle2, CreditCard,
  X, Loader2, BarChart3, AlertCircle, MoreVertical, Info,
  Unlink, Key, ExternalLink, ChevronRight, Database, Server,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import {
  saveConnection,
  saveApiKeyConnection,
  disconnectConnector,
  loadUserConnections,
  isConnectorActive,
  getConnectionMeta,
  type ConnectionsMap,
} from '../../../lib/connector-save';
import type { ConnectorKey } from '../../../lib/connectors';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ConnectFlow =
  | 'oauth'
  | 'oauth-select'
  | 'oauth-creds'
  | 'api-key';

type CredField = { label: string; placeholder: string; key: string; secret?: boolean };

type IntegrationDef = {
  id: string;
  connectorKey: ConnectorKey;
  name: string;
  category: string;
  desc: string;
  flow: ConnectFlow;
  icon?: string;
  isComponentIcon?: boolean;
  componentIconType?: 'stripe' | 'database' | 'server';
  oauthConnector?: string;
  credFields?: CredField[];
  apiKeyLabel?: string;
  apiKeyPlaceholder?: string;
};

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

const INTEGRATIONS: IntegrationDef[] = [
  {
    id: 'ga4', connectorKey: 'ga4', name: 'GA4', category: 'ANALYTICS',
    desc: 'Monitore eventos, sessoes e conversoes para leitura real de funil e receita.',
    icon: '/images/connectors/ga4-photorealistic-icon-hd-v1.png',
    flow: 'oauth-select', oauthConnector: 'ga4',
  },
  {
    id: 'googleAds', connectorKey: 'googleAds', name: 'Google Ads', category: 'ADS',
    desc: 'Acompanhe campanhas, custos e conversoes para otimizar seus investimentos.',
    icon: '/images/connectors/google-ads-icon-white-v1.png',
    flow: 'oauth-select', oauthConnector: 'googleAds',
  },
  {
    id: 'searchConsole', connectorKey: 'searchConsole', name: 'Google Search Console', category: 'SEO',
    desc: 'Acompanhe metricas de SEO organico, palavras-chave e cliques no Google Busca.',
    icon: '/images/connectors/google-trends-photorealistic-icon-hd-v1.png',
    flow: 'oauth', oauthConnector: 'searchConsole',
  },
  {
    id: 'hubspot', connectorKey: 'crm', name: 'HubSpot', category: 'CRM',
    desc: 'Sincronize leads, empresas e oportunidades para uma visao completa do funil.',
    icon: '/images/connectors/hubspot-photorealistic-icon-hd-v1.png',
    flow: 'oauth-creds', oauthConnector: 'crm',
    credFields: [
      { label: 'HubSpot App ID', placeholder: 'Ex: 12345678', key: 'hubspot_app_id' },
      { label: 'Client ID', placeholder: 'Cole seu Client ID', key: 'hubspot_client_id' },
      { label: 'Client Secret', placeholder: 'Cole seu Client Secret', key: 'hubspot_client_secret', secret: true },
      { label: 'Redirect URI', placeholder: 'https://seusite.com/api/auth/connectors/crm/callback', key: 'hubspot_redirect_uri' },
    ],
  },
  {
    id: 'instagram', connectorKey: 'instagram', name: 'Instagram', category: 'SOCIAL',
    desc: 'Consolide sinais de engajamento comercial e conteudo com potencial de conversao.',
    icon: '/images/connectors/instagram-photorealistic-icon-hd-v2.png',
    flow: 'oauth', oauthConnector: 'instagram',
  },
  {
    id: 'linkedinAds', connectorKey: 'linkedinAds', name: 'LinkedIn Ads', category: 'ADS',
    desc: 'Acompanhe CPL B2B, qualidade de lead e CAC por conta diretamente no LinkedIn.',
    icon: '/images/connectors/linkedin-ads-photorealistic-icon-hd-v1.png',
    flow: 'oauth', oauthConnector: 'linkedinAds',
  },
  {
    id: 'linkedinPage', connectorKey: 'linkedinPage', name: 'LinkedIn Page', category: 'SOCIAL',
    desc: 'Acompanhe conteudo organico, crescimento de audiencia e sinais de intencao B2B.',
    icon: '/images/connectors/linkedin-page-photorealistic-icon-hd-v1.png',
    flow: 'oauth', oauthConnector: 'linkedinPage',
  },
  {
    id: 'metaAds', connectorKey: 'metaAds', name: 'Meta Ads', category: 'ADS',
    desc: 'Importe dados de anuncios do Facebook e Instagram para analises mais precisas.',
    icon: '/images/connectors/meta-ads-photorealistic-icon-hd-v1.png',
    flow: 'oauth', oauthConnector: 'metaAds',
  },
  {
    id: 'rdStationConversas', connectorKey: 'rdStationConversas', name: 'RD Station Conversas', category: 'CRM',
    desc: 'Integre WhatsApp e canais de atendimento para dar escala ao time comercial.',
    icon: '/images/connectors/rd-station-conversas-photorealistic-icon-hd-v1.png',
    flow: 'api-key',
    apiKeyLabel: 'Token de API — RD Station Conversas',
    apiKeyPlaceholder: 'Cole seu token de API do RD Station Conversas',
  },
  {
    id: 'rdStationCrm', connectorKey: 'rdStation', name: 'RD Station CRM', category: 'CRM',
    desc: 'Centralize contatos, empresas e estagios do pipeline para acelerar repasse.',
    icon: '/images/connectors/rd-station-conversas-photorealistic-icon-hd-v1.png',
    flow: 'api-key',
    apiKeyLabel: 'Token de API — RD Station CRM',
    apiKeyPlaceholder: 'Cole seu token de API do RD Station CRM',
  },
  {
    id: 'rdStationMarketing', connectorKey: 'rdStationMarketing', name: 'RD Station Marketing', category: 'MARKETING',
    desc: 'Conecte formularios, campanhas e automacoes para elevar a qualificacao de leads.',
    icon: '/images/connectors/rd-station-conversas-photorealistic-icon-hd-v1.png',
    flow: 'api-key',
    apiKeyLabel: 'Token de API — RD Station Marketing',
    apiKeyPlaceholder: 'Cole seu token de API do RD Station Marketing',
  },
  {
    id: 'serverTracking', connectorKey: 'serverTracking', name: 'GTM Server + CAPI', category: 'ANALYTICS',
    desc: 'Configuração de atribuição confiável de conversões de servidor e deduplicação via GTM.',
    isComponentIcon: true, componentIconType: 'server',
    flow: 'api-key',
    apiKeyLabel: 'URL do GTM Server / Endpoint de Rastreamento',
    apiKeyPlaceholder: 'Cole a URL do seu container GTM Server',
  },
  {
    id: 'stripe', connectorKey: 'payments', name: 'Stripe', category: 'FINANCEIRO',
    desc: 'Conecte pagamentos para liberar receita confirmada, LTV e conciliacao comercial.',
    isComponentIcon: true, flow: 'oauth', oauthConnector: 'payments',
  },
  {
    id: 'tiktok', connectorKey: 'tiktok', name: 'Tik Tok', category: 'SOCIAL',
    desc: 'Mapeie comportamento de audiencia e tendencias de formato para escalar criativos.',
    icon: '/images/connectors/tiktok-icon-from-reference-v1.png',
    flow: 'oauth', oauthConnector: 'tiktok',
  },
  {
    id: 'tiktokAds', connectorKey: 'tiktokAds', name: 'Tik Tok Ads', category: 'ADS',
    desc: 'Integre performance de midia com custo por aquisicao e receita incremental.',
    icon: '/images/connectors/tiktok-photorealistic-icon-hd-v2.png',
    flow: 'oauth', oauthConnector: 'tiktokAds',
  },
  {
    id: 'warehouse', connectorKey: 'warehouse', name: 'BigQuery / Data Warehouse', category: 'ANALYTICS',
    desc: 'Visão unificada dos dados e projeções estruturadas através do Google BigQuery.',
    isComponentIcon: true, componentIconType: 'database',
    flow: 'oauth', oauthConnector: 'warehouse',
  },
];

const FILTERS = ['Todos', 'SOCIAL', 'CRM', 'ADS', 'ANALYTICS', 'SEO', 'FINANCEIRO', 'MARKETING'];

// ---------------------------------------------------------------------------
// Modal / state types
// ---------------------------------------------------------------------------

type AccountEntry = { id: string; name: string; accountId: string };

type AccountSelectModal = {
  connector: ConnectorKey;
  title: string;
  accounts: AccountEntry[];
  accessToken: string;
  refreshToken: string | null;
  expiresIn?: number | null;
};

type FlowPhase =
  | { phase: 'idle' }
  | { phase: 'oauth-loading'; connector: ConnectorKey }
  | { phase: 'saving'; connector: ConnectorKey }
  | { phase: 'success'; connector: ConnectorKey; label?: string }
  | { phase: 'error'; connector: ConnectorKey; message: string };

type CredsModal = { integ: IntegrationDef; values: Record<string, string> };
type ApiKeyModal = { integ: IntegrationDef; value: string; saving: boolean };

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

function HubIntegracoesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [activeFilter, setActiveFilter] = useState('Todos');
  const [connections, setConnections] = useState<ConnectionsMap>({});
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [flowPhase, setFlowPhase] = useState<FlowPhase>({ phase: 'idle' });
  const [accountSelectModal, setAccountSelectModal] = useState<AccountSelectModal | null>(null);
  const [credsModal, setCredsModal] = useState<CredsModal | null>(null);
  const [apiKeyModal, setApiKeyModal] = useState<ApiKeyModal | null>(null);
  const [optionsMenuId, setOptionsMenuId] = useState<string | null>(null);
  const [detailsInteg, setDetailsInteg] = useState<IntegrationDef | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Load real connections from Firestore
  const refreshConnections = useCallback(async () => {
    if (!user) return;
    setLoadingConnections(true);
    try {
      const map = await loadUserConnections(user.uid);
      setConnections(map);
    } finally {
      setLoadingConnections(false);
    }
  }, [user]);

  useEffect(() => { refreshConnections(); }, [refreshConnections]);

  // Close options menu on outside click
  useEffect(() => {
    if (!optionsMenuId) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOptionsMenuId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [optionsMenuId]);

  // Generic OAuth callback processor
  const handleOAuthCallback = useCallback(async (
    connector: ConnectorKey,
    flow: ConnectFlow,
    accessToken: string,
    refreshToken: string | null,
    expiresIn: number | null,
    accountId: string | null,
  ) => {
    if (!user) return;

    if (flow === 'oauth-select') {
      setFlowPhase({ phase: 'oauth-loading', connector });
      const apiPath = connector === 'ga4'
        ? '/api/auth/connectors/ga4/accounts'
        : '/api/auth/connectors/googleAds/accounts';
      const resKey = connector === 'ga4' ? 'accounts' : 'customers';
      try {
        const res = await fetch(apiPath, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken }),
        });
        const data = (await res.json()) as Record<string, AccountEntry[] | string | undefined>;
        if (!res.ok || data.error) {
          setFlowPhase({ phase: 'error', connector, message: String(data.error ?? 'Falha ao listar contas.') });
          return;
        }
        const accounts = (data[resKey] as AccountEntry[] | undefined) ?? [];
        setAccountSelectModal({
          connector,
          title: connector === 'ga4' ? 'Selecionar conta GA4' : 'Selecionar conta Google Ads',
          accounts,
          accessToken,
          refreshToken,
          expiresIn,
        });
        setFlowPhase({ phase: 'idle' });
      } catch {
        setFlowPhase({ phase: 'error', connector, message: 'Erro de rede ao buscar contas.' });
      }
      return;
    }

    // Simple save
    setFlowPhase({ phase: 'saving', connector });
    try {
      await saveConnection({ connector, uid: user.uid, accessToken, refreshToken, accountId, expiresIn });
      setConnections((prev) => ({ ...prev, [connector]: { isActive: true, accessToken, connectedAt: Date.now() } }));
      setFlowPhase({ phase: 'success', connector });
      setTimeout(() => setFlowPhase({ phase: 'idle' }), 3000);
    } catch {
      setFlowPhase({ phase: 'error', connector, message: 'Falha ao salvar a conexao.' });
    }
  }, [user]);

  // Detect OAuth callback from URL params
  useEffect(() => {
    const connector = searchParams.get('connector') as ConnectorKey | null;
    const success = searchParams.get('connector_auth_success');
    const accessToken = searchParams.get('connector_access_token');
    const refreshToken = searchParams.get('connector_refresh_token');
    const expiresInRaw = searchParams.get('connector_expires_in');
    const accountId = searchParams.get('connector_account_id');
    const authError = searchParams.get('connector_auth_error');

    if (!connector) return;
    router.replace('/hub/integracoes', { scroll: false });

    if (authError) {
      setFlowPhase({ phase: 'error', connector, message: `Erro: ${authError}` });
      return;
    }
    if (success === '1' && accessToken) {
      const integ = INTEGRATIONS.find((i) => i.connectorKey === connector);
      const flow = integ?.flow ?? 'oauth';
      handleOAuthCallback(connector, flow, accessToken, refreshToken, expiresInRaw ? Number(expiresInRaw) : null, accountId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Account selection save
  const handleSelectAccount = useCallback(async (acc: AccountEntry) => {
    if (!user || !accountSelectModal) return;
    const { connector, accessToken, refreshToken, expiresIn } = accountSelectModal;
    setFlowPhase({ phase: 'saving', connector });
    setAccountSelectModal(null);
    try {
      await saveConnection({ connector, uid: user.uid, accessToken, refreshToken, accountId: acc.accountId, accountName: acc.name, expiresIn });
      setConnections((prev) => ({
        ...prev,
        [connector]: { isActive: true, accessToken, accountId: acc.accountId, metadata: { accountName: acc.name }, connectedAt: Date.now() },
      }));
      setFlowPhase({ phase: 'success', connector, label: acc.name });
      setTimeout(() => setFlowPhase({ phase: 'idle' }), 3000);
    } catch {
      setFlowPhase({ phase: 'error', connector, message: 'Falha ao salvar conta selecionada.' });
    }
  }, [user, accountSelectModal]);

  // HubSpot credentials submit -> OAuth redirect
  const handleCredsSubmit = useCallback((integ: IntegrationDef, values: Record<string, string>) => {
    const params = new URLSearchParams({ next: '/hub/integracoes' });
    integ.credFields?.forEach((f) => { if (values[f.key]) params.set(f.key, values[f.key]); });
    setCredsModal(null);
    window.location.href = `/api/auth/connectors/${integ.oauthConnector ?? integ.connectorKey}/start?${params.toString()}`;
  }, []);

  // API key save
  const handleApiKeySave = useCallback(async () => {
    if (!user || !apiKeyModal || !apiKeyModal.value.trim()) return;
    setApiKeyModal((prev) => prev ? { ...prev, saving: true } : null);
    const { integ, value } = apiKeyModal;
    try {
      await saveApiKeyConnection({ connector: integ.connectorKey, uid: user.uid, apiKey: value.trim() });
      setConnections((prev) => ({ ...prev, [integ.connectorKey]: { isActive: true, accessToken: value.trim(), connectedAt: Date.now() } }));
      setApiKeyModal(null);
      setFlowPhase({ phase: 'success', connector: integ.connectorKey });
      setTimeout(() => setFlowPhase({ phase: 'idle' }), 3000);
    } catch {
      setApiKeyModal((prev) => prev ? { ...prev, saving: false } : null);
    }
  }, [user, apiKeyModal]);

  // Disconnect
  const handleDisconnect = useCallback(async (connector: ConnectorKey) => {
    if (!user) return;
    setOptionsMenuId(null);
    try {
      await disconnectConnector(user.uid, connector);
      setConnections((prev) => ({ ...prev, [connector]: { ...(prev[connector] ?? {}), isActive: false } }));
    } catch { /* noop */ }
  }, [user]);

  const openConnect = (integ: IntegrationDef) => {
    if (integ.flow === 'oauth' || integ.flow === 'oauth-select') {
      window.location.href = `/api/auth/connectors/${integ.oauthConnector ?? integ.connectorKey}/start?next=/hub/integracoes`;
    } else if (integ.flow === 'oauth-creds') {
      const initial: Record<string, string> = {};
      integ.credFields?.forEach((f) => { initial[f.key] = ''; });
      setCredsModal({ integ, values: initial });
    } else {
      setApiKeyModal({ integ, value: '', saving: false });
    }
  };

  const filteredIntegrations = INTEGRATIONS.filter((i) => activeFilter === 'Todos' || i.category === activeFilter);
  const connectedCount = Object.values(connections).filter((c) => c?.isActive).length;

  // ── helpers for per-card flow state
  const cardFlow = (connKey: ConnectorKey) => {
    if (flowPhase.phase === 'idle') return null;
    const fp = flowPhase as { connector: ConnectorKey; phase: string; message?: string; label?: string };
    if (fp.connector !== connKey) return null;
    return fp;
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="w-full space-y-6 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-[#1e293b]">

      {/* ── Header ── */}
      <header className="py-8 border-b border-slate-200 mb-8">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF6A00]" />
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#FF6A00]">Integracoes</span>
            </div>
            <h1 className="text-3xl font-black text-[#0f172a] tracking-tight leading-tight">Conecte Seus Canais</h1>
            <p className="text-slate-500 text-[15px] mt-2 max-w-xl font-bold leading-relaxed">
              Vincule suas plataformas de midia paga e analytics para alimentar os Agentes de IA com dados reais da sua operacao.
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-white/60 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff]">
              <Link2 className="w-4 h-4 text-[#FF6A00]" />
              <span className="text-[13px] font-bold text-[#1e293b]">{INTEGRATIONS.length}+ plataformas</span>
              <span className="text-[13px] text-slate-500 font-medium">disponiveis</span>
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-2.5 rounded-2xl border border-white/60 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff]">
              <span className="text-[13px] text-slate-500 font-bold">Conectadas</span>
              <div className="flex items-center gap-1.5">
                {loadingConnections
                  ? <Loader2 className="w-3.5 h-3.5 text-[#FF6A00] animate-spin" />
                  : <span className="text-[14px] font-black text-[#1e293b]">{connectedCount}</span>
                }
                <Link2 className="w-3.5 h-3.5 text-[#FF6A00]" />
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-2.5 rounded-2xl border border-white/60 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff]">
              <span className="text-[13px] text-slate-500 font-bold">Sincronizacao</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] font-black text-[#1e293b]">Saudavel</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Catalog ── */}
      <div className="hub-neu-card overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-100/30">
          <h2 className="text-[15px] font-black text-[#0f172a] mb-4">Catalogo de Integracoes</h2>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button key={f} onClick={() => setActiveFilter(f)}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold tracking-wide transition-all ${activeFilter === f
                    ? 'bg-[#eef2f7] text-[#FF6A00] shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] border border-white/20'
                    : 'bg-[#eef2f7] border border-white/40 text-slate-600 shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff]'
                  }`}>{f}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Link href="/hub/api-keys" className="px-4 py-1.5 rounded-full text-[12px] font-bold border border-white/40 bg-[#eef2f7] text-slate-700 shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] transition-all" style={{ textDecoration: 'none' }}>API Keys</Link>
              <Link href="/hub/mcp-cli" className="px-4 py-1.5 rounded-full text-[12px] font-bold border border-white/40 bg-[#eef2f7] text-slate-700 shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] transition-all" style={{ textDecoration: 'none' }}>MCP & CLI</Link>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-50/30">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredIntegrations.map((integ) => {
              const connected = isConnectorActive(connections, integ.connectorKey);
              const meta = getConnectionMeta(connections, integ.connectorKey);
              const cf = cardFlow(integ.connectorKey);
              const isLoading = cf?.phase === 'oauth-loading' || cf?.phase === 'saving';
              const isSuccess = cf?.phase === 'success';
              const isError = cf?.phase === 'error';

              return (
                <div key={integ.id} className="hub-neu-card group relative flex flex-col gap-4 p-5 shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#c2cbd9,_-4px_-4px_8px_#ffffff] transition-all duration-300">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center border border-white/40 bg-[#eef2f7] shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] overflow-hidden p-1">
                      {integ.isComponentIcon ? (
                        integ.componentIconType === 'database' ? (
                          <Database className="h-5 w-5 text-blue-600" />
                        ) : integ.componentIconType === 'server' ? (
                          <Server className="h-5 w-5 text-teal-600" />
                        ) : (
                          <CreditCard className="h-5 w-5 text-[#635BFF]" />
                        )
                      ) : (
                        <Image src={integ.icon as string} alt={integ.name} width={36} height={36} className="h-full w-full rounded-lg object-cover" />
                      )}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/60 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] ${connected ? 'text-[#0d9488]' : 'text-slate-500'}`}>{integ.category}</span>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-[14px] font-black text-[#0f172a] group-hover:text-[#FF6A00] transition-colors leading-tight">{integ.name}</h3>
                    {meta.accountName && <p className="text-[11px] font-bold text-[#FF6A00] mt-0.5 truncate">{meta.accountName}</p>}
                    <p className="mt-1.5 text-[12px] text-slate-500 font-semibold leading-snug line-clamp-2">{integ.desc}</p>
                  </div>

                  <div className="mt-auto pt-3 border-t border-slate-200">
                    {isLoading ? (
                      <div className="flex items-center gap-1.5 text-[#FF6A00]">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span className="text-[12px] font-bold">Conectando...</span>
                      </div>
                    ) : isSuccess ? (
                      <div className="flex items-center gap-1.5 text-[#0d9488]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="text-[12px] font-bold uppercase tracking-wider">Conectado!</span>
                      </div>
                    ) : isError ? (
                      <div className="flex items-center gap-1.5 text-red-500">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold truncate">Erro — tente novamente</span>
                      </div>
                    ) : connected ? (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-[#0d9488]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="text-[12px] font-bold uppercase tracking-wider">Conectado</span>
                        </div>
                        <div className="relative" ref={optionsMenuId === integ.id ? menuRef : null}>
                          <button type="button" onClick={(e) => { e.stopPropagation(); setOptionsMenuId((p) => p === integ.id ? null : integ.id); }}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/50 bg-[#eef2f7] shadow-[1px_1px_3px_#d1d9e6,_-1px_-1px_3px_#ffffff] hover:shadow-[inset_1px_1px_2px_#d1d9e6,_inset_-1px_-1px_2px_#ffffff] text-slate-500 transition-all" aria-label="Opcoes">
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                          {optionsMenuId === integ.id && (
                            <div className="absolute right-0 bottom-9 z-30 min-w-[148px] overflow-hidden rounded-2xl border border-white/80 bg-[#eef2f7] shadow-[5px_5px_15px_#d1d9e6,_-5px_-5px_15px_#ffffff]">
                              <button type="button" onClick={() => { setDetailsInteg(integ); setOptionsMenuId(null); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[12px] font-bold text-slate-700 hover:bg-slate-200/60 transition-colors">
                                <Info className="w-3.5 h-3.5 text-slate-400" />Detalhes
                              </button>
                              <div className="mx-3 border-t border-slate-200" />
                              <button type="button" onClick={() => handleDisconnect(integ.connectorKey)} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[12px] font-bold text-red-600 hover:bg-red-500/10 transition-colors">
                                <Unlink className="w-3.5 h-3.5" />Desconectar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <button type="button" onClick={() => openConnect(integ)} className="flex items-center gap-1.5 text-[#FF6A00] hover:text-[#ff8f3a] transition-colors">
                        {integ.flow === 'api-key'
                          ? <><Key className="w-3.5 h-3.5" /><span className="text-[12px] font-bold">Inserir Token</span></>
                          : integ.flow === 'oauth-creds'
                          ? <><ExternalLink className="w-3.5 h-3.5" /><span className="text-[12px] font-bold">Configurar</span></>
                          : <><span className="text-[12px] font-bold">Conectar</span><ArrowRight className="w-3.5 h-3.5" /></>
                        }
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Details Modal ── */}
      {detailsInteg && (() => {
        const meta = getConnectionMeta(connections, detailsInteg.connectorKey);
        return (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <button type="button" onClick={() => setDetailsInteg(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" aria-label="Fechar" />
            <section className="relative w-full max-w-sm rounded-[28px] border border-white/80 bg-[#eef2f7] p-6 shadow-[10px_10px_30px_#c2cbd9,_-10px_-10px_30px_#ffffff] animate-in fade-in zoom-in-95 duration-200">
              <button type="button" onClick={() => setDetailsInteg(null)} className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-full border border-white/50 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] text-slate-500 transition-all"><X className="h-4 w-4" /></button>
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center border border-white/50 bg-[#eef2f7] shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] overflow-hidden p-1.5">
                  {detailsInteg.isComponentIcon ? (
                    detailsInteg.componentIconType === 'database' ? (
                      <Database className="h-6 w-6 text-blue-600" />
                    ) : detailsInteg.componentIconType === 'server' ? (
                      <Server className="h-6 w-6 text-teal-600" />
                    ) : (
                      <CreditCard className="h-6 w-6 text-[#635BFF]" />
                    )
                  ) : (
                    <Image src={detailsInteg.icon as string} alt={detailsInteg.name} width={40} height={40} className="h-full w-full rounded-xl object-cover" />
                  )}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#FF6B00] mb-0.5">{detailsInteg.category}</p>
                  <h3 className="text-[18px] font-black text-[#0f172a] leading-tight">{detailsInteg.name}</h3>
                </div>
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl border border-white/50 bg-[#eef2f7] p-4 shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Descricao</p>
                  <p className="text-[13px] font-semibold text-slate-700 leading-snug">{detailsInteg.desc}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/50 bg-[#eef2f7] p-3.5 shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</p>
                    <div className="flex items-center gap-1.5 text-[#0d9488]"><CheckCircle2 className="w-3.5 h-3.5" /><span className="text-[12px] font-bold">Conectado</span></div>
                  </div>
                  <div className="rounded-2xl border border-white/50 bg-[#eef2f7] p-3.5 shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Canal</p>
                    <p className="text-[12px] font-bold text-[#0f172a]">{detailsInteg.category}</p>
                  </div>
                </div>
                {meta.accountName && (
                  <div className="rounded-2xl border border-white/50 bg-[#eef2f7] p-3.5 shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Conta</p>
                    <p className="text-[12px] font-bold text-[#0f172a]">{meta.accountName}</p>
                  </div>
                )}
                {meta.connectedAt && (
                  <div className="rounded-2xl border border-white/50 bg-[#eef2f7] p-3.5 shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Conectado em</p>
                    <p className="text-[12px] font-bold text-[#0f172a]">{new Date(meta.connectedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                )}
              </div>
              <button type="button" onClick={() => { handleDisconnect(detailsInteg.connectorKey); setDetailsInteg(null); }}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-[12px] font-bold text-red-600 hover:bg-red-500/10 transition-all shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]">
                <Unlink className="w-3.5 h-3.5" />Desconectar canal
              </button>
            </section>
          </div>
        );
      })()}

      {/* ── Account Selection Modal ── */}
      {accountSelectModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button type="button" onClick={() => setAccountSelectModal(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" aria-label="Fechar" />
          <section className="relative w-full max-w-md rounded-[24px] border border-white/80 bg-[#eef2f7] p-6 shadow-[10px_10px_30px_#c2cbd9,_-10px_-10px_30px_#ffffff] animate-in fade-in zoom-in-95 duration-200">
            <button type="button" onClick={() => setAccountSelectModal(null)} className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-full border border-white/50 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] text-slate-500 transition-all"><X className="h-4 w-4" /></button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center"><BarChart3 className="h-5 w-5 text-[#FF6A00]" /></div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#FF6A00]">Selecionar conta</p>
                <h3 className="text-[18px] font-black text-[#0f172a] leading-tight">{accountSelectModal.title}</h3>
              </div>
            </div>
            <p className="text-[13px] text-slate-500 font-semibold mb-4">
              {accountSelectModal.accounts.length === 0
                ? 'Nenhuma conta encontrada para este perfil.'
                : `${accountSelectModal.accounts.length} conta${accountSelectModal.accounts.length !== 1 ? 's' : ''} encontrada${accountSelectModal.accounts.length !== 1 ? 's' : ''}. Selecione qual deseja conectar.`}
            </p>
            {accountSelectModal.accounts.length > 0 && (
              <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {accountSelectModal.accounts.map((acc) => (
                  <li key={acc.id}>
                    <button type="button" onClick={() => handleSelectAccount(acc)}
                      className="w-full text-left flex items-center justify-between gap-3 px-4 py-3 rounded-[12px] border border-white/50 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] transition-all group">
                      <div>
                        <p className="text-[14px] font-bold text-slate-800 group-hover:text-[#FF6A00] transition-colors">{acc.name}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-semibold">ID: {acc.accountId}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#FF6A00] transition-colors shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {/* ── Creds Modal (HubSpot) ── */}
      {credsModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button type="button" onClick={() => setCredsModal(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" aria-label="Fechar" />
          <section className="relative w-full max-w-md rounded-[24px] border border-white/80 bg-[#eef2f7] p-6 shadow-[10px_10px_30px_#c2cbd9,_-10px_-10px_30px_#ffffff] animate-in fade-in zoom-in-95 duration-200">
            <button type="button" onClick={() => setCredsModal(null)} className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-full border border-white/50 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] text-slate-500 transition-all"><X className="h-4 w-4" /></button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                {credsModal.integ.isComponentIcon ? (
                  credsModal.integ.componentIconType === 'database' ? (
                    <Database className="h-5 w-5 text-blue-600" />
                  ) : credsModal.integ.componentIconType === 'server' ? (
                    <Server className="h-5 w-5 text-teal-600" />
                  ) : (
                    <CreditCard className="h-5 w-5 text-[#635BFF]" />
                  )
                ) : (
                  <Image src={credsModal.integ.icon as string} alt={credsModal.integ.name} width={32} height={32} className="rounded-lg object-cover" />
                )}
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#FF6A00]">Configurar</p>
                <h3 className="text-[18px] font-black text-[#0f172a] leading-tight">{credsModal.integ.name}</h3>
              </div>
            </div>
            <p className="text-[13px] text-slate-500 font-semibold mb-4">Insira as credenciais do seu app para iniciar a autenticacao OAuth.</p>
            <form onSubmit={(e) => { e.preventDefault(); handleCredsSubmit(credsModal.integ, credsModal.values); }} className="space-y-3">
              {credsModal.integ.credFields?.map((field) => (
                <div key={field.key}>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">{field.label}</label>
                  <input type={field.secret ? 'password' : 'text'} value={credsModal.values[field.key] ?? ''}
                    onChange={(e) => setCredsModal((prev) => prev ? { ...prev, values: { ...prev.values, [field.key]: e.target.value } } : null)}
                    placeholder={field.placeholder}
                    className="w-full rounded-xl border border-white/30 bg-[#eef2f7] shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] px-3 py-2.5 text-[13px] font-semibold text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#FF6A00]/30"
                    required
                  />
                </div>
              ))}
              <button type="submit" className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF8805] px-4 py-3 text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(255,106,0,0.25)] hover:brightness-105 transition-all">
                <ExternalLink className="w-4 h-4" />Continuar para autenticacao
              </button>
            </form>
          </section>
        </div>
      )}

      {/* ── API Key Modal ── */}
      {apiKeyModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button type="button" onClick={() => !apiKeyModal.saving && setApiKeyModal(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" aria-label="Fechar" />
          <section className="relative w-full max-w-sm rounded-[24px] border border-white/80 bg-[#eef2f7] p-6 shadow-[10px_10px_30px_#c2cbd9,_-10px_-10px_30px_#ffffff] animate-in fade-in zoom-in-95 duration-200">
            <button type="button" onClick={() => !apiKeyModal.saving && setApiKeyModal(null)} className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-full border border-white/50 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] text-slate-500 transition-all"><X className="h-4 w-4" /></button>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center"><Key className="h-5 w-5 text-[#FF6A00]" /></div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#FF6A00]">Token de API</p>
                <h3 className="text-[18px] font-black text-[#0f172a] leading-tight">{apiKeyModal.integ.name}</h3>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-[11px] font-black uppercase tracking-widest text-slate-500 mb-1">{apiKeyModal.integ.apiKeyLabel ?? 'Token de API'}</label>
              <textarea value={apiKeyModal.value} onChange={(e) => setApiKeyModal((prev) => prev ? { ...prev, value: e.target.value } : null)}
                placeholder={apiKeyModal.integ.apiKeyPlaceholder ?? 'Cole seu token aqui'} rows={3} disabled={apiKeyModal.saving}
                className="w-full rounded-xl border border-white/30 bg-[#eef2f7] shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] px-3 py-2.5 text-[13px] font-semibold text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#FF6A00]/30 resize-none"
              />
            </div>
            <button type="button" onClick={handleApiKeySave} disabled={!apiKeyModal.value.trim() || apiKeyModal.saving}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF6A00] to-[#FF8805] px-4 py-3 text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(255,106,0,0.25)] hover:brightness-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {apiKeyModal.saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {apiKeyModal.saving ? 'Salvando...' : 'Salvar e Conectar'}
            </button>
          </section>
        </div>
      )}

      {/* ── Error toast ── */}
      {flowPhase.phase === 'error' && (
        <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-2xl border border-red-500/20 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(239,68,68,0.15)] animate-in slide-in-from-bottom-4 duration-300">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <p className="text-[13px] font-bold text-red-700 max-w-xs">{(flowPhase as { message: string }).message}</p>
          <button type="button" onClick={() => setFlowPhase({ phase: 'idle' })} className="ml-1 text-slate-400 hover:text-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function HubIntegracoesPage() {
  return (
    <Suspense fallback={<div className="w-full flex items-center justify-center py-32"><Loader2 className="h-6 w-6 text-[#FF6A00] animate-spin" /></div>}>
      <HubIntegracoesContent />
    </Suspense>
  );
}
