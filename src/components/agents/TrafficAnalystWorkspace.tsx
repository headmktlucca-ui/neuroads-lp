'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Link2, Sparkles } from 'lucide-react';
import { getLatestAgentReportsFromDb, saveAgentReportToDb } from '../../lib/agent-report-history';
import { useAuth } from '../../context/AuthContext';

type Props = {
  userId?: string | null;
  agentSlug: string;
  agentTitle: string;
  agentCategory: string;
};

type ChannelKey = 'googleAds' | 'metaAds' | 'linkedinAds';

type ConnectorAuth = {
  oauthConnected: boolean;
  isActive: boolean;
  accountId: string;
  loginCustomerId?: string;
  connectedAt?: number;
};

type ConnectorState = Record<ChannelKey, ConnectorAuth>;

type ProfileConnection = {
  isActive?: boolean;
  accessToken?: string;
};

type ProfileConnections = Record<string, ProfileConnection | undefined>;

type ExtractResponse = {
  success: boolean;
  error?: string;
  channels?: Array<{
    platform: string;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
  }>;
  totals?: {
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
  };
};

const CONNECTORS_KEY = (uid: string) => `neuroads_ad_connectors_${uid}`;

const CHANNEL_CONNECTION_KEY: Record<ChannelKey, string> = {
  googleAds: 'google_ads',
  metaAds: 'meta_ads',
  linkedinAds: 'linkedin_ads',
};

const CHANNEL_PROVIDER: Record<ChannelKey, string> = {
  googleAds: 'google',
  metaAds: 'meta',
  linkedinAds: 'linkedin',
};

const EMPTY_CONNECTOR: ConnectorAuth = {
  oauthConnected: false,
  isActive: false,
  accountId: '',
  loginCustomerId: '',
};

const DEFAULT_CONNECTORS: ConnectorState = {
  googleAds: { ...EMPTY_CONNECTOR },
  metaAds: { ...EMPTY_CONNECTOR },
  linkedinAds: { ...EMPTY_CONNECTOR },
};

function calculateInsights(totals: { spend: number; impressions: number; clicks: number; conversions: number }) {
  const ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
  const cpl = totals.conversions > 0 ? totals.spend / totals.conversions : 0;
  const convRate = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;

  const priorities: string[] = [];
  if (ctr < 1.3) priorities.push('Revisar criativos e promessa de valor dos anúncios para elevar CTR.');
  if (cpc > 4.5) priorities.push('Reduzir CPC com segmentação mais precisa e negativação de tráfego irrelevante.');
  if (convRate < 4.0) priorities.push('Otimizar página e oferta para elevar taxa de conversão.');
  if (cpl > 45) priorities.push('Priorizar conjuntos com melhor qualidade de lead para reduzir CPL.');

  if (!priorities.length) priorities.push('Operação saudável: escalar gradualmente mantendo controle diário de CPL e conversão.');

  const executive = `Resumo do período: CTR ${ctr.toFixed(2)}%, CPC R$ ${cpc.toFixed(2)}, CPL R$ ${cpl.toFixed(
    2
  )} e conversão ${convRate.toFixed(2)}%.`;

  return { ctr, cpc, cpl, convRate, priorities, executive };
}

function getConnectionKey(channel: ChannelKey): string {
  return CHANNEL_CONNECTION_KEY[channel];
}

function hasOAuthConnection(connection: ProfileConnection | undefined): boolean {
  return Boolean(connection?.isActive && connection?.accessToken && connection.accessToken.trim());
}

export default function TrafficAnalystWorkspace({ userId, agentSlug, agentTitle, agentCategory }: Props) {
  const searchParams = useSearchParams();
  const { profile } = useAuth();

  const [connectors, setConnectors] = useState<ConnectorState>(DEFAULT_CONNECTORS);
  const [dateFrom, setDateFrom] = useState(() => new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extraction, setExtraction] = useState<ExtractResponse | null>(null);
  const [historyCount, setHistoryCount] = useState(0);

  const profileConnections = useMemo(() => {
    if (!profile || typeof profile !== 'object') return {} as ProfileConnections;
    const maybeConnections = (profile as Record<string, unknown>).connections;
    if (!maybeConnections || typeof maybeConnections !== 'object') return {} as ProfileConnections;
    return maybeConnections as ProfileConnections;
  }, [profile]);

  const activeChannels = useMemo(
    () => (Object.keys(connectors) as ChannelKey[]).filter((key) => connectors[key].isActive),
    [connectors]
  );

  useEffect(() => {
    if (!userId) return;

    const persisted = window.localStorage.getItem(CONNECTORS_KEY(userId));
    let parsed = DEFAULT_CONNECTORS;

    if (persisted) {
      try {
        const raw = JSON.parse(persisted) as Partial<ConnectorState>;
        parsed = {
          googleAds: { ...EMPTY_CONNECTOR, ...(raw.googleAds ?? {}) },
          metaAds: { ...EMPTY_CONNECTOR, ...(raw.metaAds ?? {}) },
          linkedinAds: { ...EMPTY_CONNECTOR, ...(raw.linkedinAds ?? {}) },
        };
      } catch {
        parsed = DEFAULT_CONNECTORS;
      }
    }

    const hydrated: ConnectorState = {
      googleAds: {
        ...parsed.googleAds,
        oauthConnected: hasOAuthConnection(profileConnections[getConnectionKey('googleAds')]),
      },
      metaAds: {
        ...parsed.metaAds,
        oauthConnected: hasOAuthConnection(profileConnections[getConnectionKey('metaAds')]),
      },
      linkedinAds: {
        ...parsed.linkedinAds,
        oauthConnected: hasOAuthConnection(profileConnections[getConnectionKey('linkedinAds')]),
      },
    };

    (Object.keys(hydrated) as ChannelKey[]).forEach((key) => {
      hydrated[key].isActive =
        hydrated[key].oauthConnected &&
        hydrated[key].isActive &&
        Boolean(hydrated[key].accountId.trim());
    });

    setConnectors(hydrated);

    const loadHistoryCount = async () => {
      const entries = await getLatestAgentReportsFromDb(userId, agentSlug, 10);
      setHistoryCount(entries.length);
    };

    void loadHistoryCount();
  }, [agentSlug, profileConnections, userId]);

  useEffect(() => {
    const oauthError = searchParams.get('google_ads_error') || searchParams.get('connector_auth_error');
    if (oauthError) {
      setError(`Falha na autenticação do canal: ${oauthError}.`);
    }
  }, [searchParams]);

  const persistConnectors = (next: ConnectorState) => {
    if (!userId) return;
    window.localStorage.setItem(CONNECTORS_KEY(userId), JSON.stringify(next));
  };

  const setConnectorField = (key: ChannelKey, field: keyof ConnectorAuth, value: string | boolean | number) => {
    setConnectors((prev) => {
      const next = {
        ...prev,
        [key]: {
          ...prev[key],
          [field]: value,
        },
      };
      persistConnectors(next);
      return next;
    });
  };

  const connectChannel = (key: ChannelKey) => {
    setError(null);

    const current = connectors[key];
    if (!current.oauthConnected) {
      setError(`Autentique ${labelFor(key)} com o mesmo e-mail logado antes de ativar este canal.`);
      return;
    }

    if (!current.accountId.trim()) {
      setError(`Informe o ID da conta para ativar ${labelFor(key)}.`);
      return;
    }

    setConnectors((prev) => {
      const next = {
        ...prev,
        [key]: {
          ...prev[key],
          isActive: true,
          connectedAt: Date.now(),
        },
      };
      persistConnectors(next);
      return next;
    });
  };

  const disconnectChannel = (key: ChannelKey) => {
    setConnectors((prev) => {
      const next = {
        ...prev,
        [key]: {
          ...prev[key],
          isActive: false,
        },
      };
      persistConnectors(next);
      return next;
    });
  };

  const runExtraction = async () => {
    if (!activeChannels.length) {
      setError('Ative ao menos 1 canal autenticado antes de extrair indicadores.');
      return;
    }
    if (!dateFrom || !dateTo) {
      setError('Defina o período de extração.');
      return;
    }

    setLoading(true);
    setError(null);
    setExtraction(null);
    try {
      const channels = activeChannels.map((key) => {
        const connection = profileConnections[getConnectionKey(key)];
        const accessToken = connection?.accessToken?.trim() || '';

        if (!accessToken) {
          throw new Error(`A autenticação de ${labelFor(key)} expirou. Reconecte o canal para continuar.`);
        }

        return {
          platform: key,
          accessToken,
          accountId: connectors[key].accountId.trim(),
          loginCustomerId: connectors[key].loginCustomerId?.trim() || undefined,
        };
      });

      const response = await fetch('/api/traffic/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateFrom, dateTo, channels }),
      });
      const payload = (await response.json()) as ExtractResponse;
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || 'Falha ao extrair indicadores dos canais.');
      }

      setExtraction(payload);
      const totals = payload.totals ?? { spend: 0, impressions: 0, clicks: 0, conversions: 0 };
      const insights = calculateInsights(totals);
      const generatedAt = new Date().toISOString();
      const diagnosisMarkdown = `${insights.executive}\n\nPrioridades:\n${insights.priorities
        .map((p, i) => `${i + 1}. ${p}`)
        .join('\n')}`;

      if (userId) {
        await saveAgentReportToDb({
          userId,
          agentKey: agentSlug,
          agentTitle,
          agentCategory,
          reportTitle: `Diagnóstico de Tráfego ${dateFrom} a ${dateTo}`,
          reportContent: diagnosisMarkdown,
          reportFormat: 'plain_text',
          generatedAt,
          metadata: {
            campaignName: `Consolidação ${activeChannels.map((key) => labelFor(key)).join(' + ')}`,
            periodLabel: `${dateFrom} a ${dateTo}`,
            investment: Number(totals.spend.toFixed(2)),
            leads: totals.conversions,
            ctr: Number(insights.ctr.toFixed(2)),
            cpc: Number(insights.cpc.toFixed(2)),
            conversionRate: Number(insights.convRate.toFixed(2)),
            channels: activeChannels.join(', '),
          },
        });

        const entries = await getLatestAgentReportsFromDb(userId, agentSlug, 10);
        setHistoryCount(entries.length);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao extrair indicadores.');
    } finally {
      setLoading(false);
    }
  };

  const insights = useMemo(() => {
    if (!extraction?.totals) return null;
    return calculateInsights(extraction.totals);
  }, [extraction]);

  return (
    <div className="col-span-1 rounded-[30px] p-[2px] bg-gradient-to-br from-white/40 via-orange-300/80 to-[#FF6B00] shadow-[0_24px_52px_-30px_rgba(255,107,0,0.42)]">
      <div className="rounded-[28px] bg-white/85 p-[1px]">
        <div className="rounded-[26px] border border-[#FFF1E8] bg-white p-6 md:p-8 space-y-6">
          <h2 className="text-sm uppercase tracking-widest text-primary font-bold">Área de implantação</h2>

          <section className="rounded-2xl border border-[#E4EAF2] bg-[#FBFCFF] p-5">
            <h3 className="text-sm font-black text-text-main">1. Conectar canais de mídia</h3>
            <p className="mt-1 text-sm text-text-muted">
              A conexão é feita apenas por autenticação do canal com o mesmo e-mail da sua sessão. Não há entrada manual de token.
            </p>

            <div className="mt-4 space-y-4">
              {(Object.keys(connectors) as ChannelKey[]).map((key) => {
                const oauthHref = `/api/auth/connectors/${key}/start?provider=${CHANNEL_PROVIDER[key]}&next=/hub/agente/analista-de-trafego`;
                return (
                  <div key={key} className="rounded-xl border border-[#E1E7F0] bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-black text-text-main">{labelFor(key)}</p>
                      {connectors[key].isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#BDE8CF] bg-[#F2FFF7] px-3 py-1 text-xs font-bold text-[#0A9D57]">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Canal ativo
                        </span>
                      ) : connectors[key].oauthConnected ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#FCD34D] bg-[#FFFBEB] px-3 py-1 text-xs font-bold text-[#92400E]">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Autenticado (pendente ativação)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#D1D5DB] bg-white px-3 py-1 text-xs font-bold text-[#6B7280]">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Não autenticado
                        </span>
                      )}
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        value={connectors[key].accountId}
                        onChange={(e) => setConnectorField(key, 'accountId', e.target.value)}
                        placeholder={key === 'googleAds' ? 'Customer ID' : key === 'metaAds' ? 'Ad Account ID' : 'Sponsored Account ID'}
                        className="rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main"
                      />
                      {key === 'googleAds' ? (
                        <input
                          value={connectors[key].loginCustomerId || ''}
                          onChange={(e) => setConnectorField(key, 'loginCustomerId', e.target.value)}
                          placeholder="Login Customer ID (MCC) opcional"
                          className="rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main"
                        />
                      ) : (
                        <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-xs text-text-dim flex items-center">
                          Autenticação via e-mail do usuário logado
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <a
                        href={oauthHref}
                        className="inline-flex items-center gap-2 rounded-full border border-[#D9E2F4] bg-[#EEF4FF] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#1D4ED8]"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        Autenticar Canal
                      </a>
                      <button
                        type="button"
                        onClick={() => connectChannel(key)}
                        className="inline-flex items-center gap-2 rounded-full bg-[#FF6B00] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white"
                      >
                        Ativar Canal
                      </button>
                      {connectors[key].isActive ? (
                        <button
                          type="button"
                          onClick={() => disconnectChannel(key)}
                          className="inline-flex items-center gap-2 rounded-full border border-[#FECACA] bg-[#FFF1F2] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#B42318]"
                        >
                          Desativar
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-[#E4EAF2] bg-[#FBFCFF] p-5">
            <h3 className="text-sm font-black text-text-main">2. Selecionar período e extrair indicadores</h3>
            <p className="mt-1 text-sm text-text-muted">Com pelo menos 1 canal ativo, escolha o período para consolidar dados e gerar insights personalizados.</p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wide text-text-dim">Data inicial</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wide text-text-dim">Data final</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={runExtraction}
              disabled={loading}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#FF6B00] px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_10px_22px_rgba(255,107,0,0.30)] disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />
              {loading ? 'Extraindo...' : 'Extrair indicadores'}
            </button>
          </section>

          {error ? <p className="text-sm font-semibold text-[#B42318]">{error}</p> : null}

          {extraction?.success && extraction.totals && insights ? (
            <section className="rounded-2xl border border-[#E4EAF2] bg-white p-5">
              <h3 className="text-sm uppercase tracking-[0.08em] text-primary font-black">Insights personalizados</h3>
              <p className="mt-2 text-sm text-text-muted">{insights.executive}</p>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                <Metric label="Investimento" value={`R$ ${extraction.totals.spend.toFixed(2)}`} />
                <Metric label="Impressões" value={Intl.NumberFormat('pt-BR').format(extraction.totals.impressions)} />
                <Metric label="Cliques" value={Intl.NumberFormat('pt-BR').format(extraction.totals.clicks)} />
                <Metric label="Conversões" value={Intl.NumberFormat('pt-BR').format(extraction.totals.conversions)} />
              </div>

              <div className="mt-4 rounded-xl border border-[#E8EDF4] bg-[#FCFDFF] p-4">
                <p className="text-xs font-black uppercase tracking-wide text-text-dim">Prioridades recomendadas</p>
                <ul className="mt-2 space-y-1.5 text-sm text-text-muted">
                  {insights.priorities.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-[8px] inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="mt-3 text-xs text-text-dim">Histórico salvo no banco: {historyCount} análises (últimos 10).</p>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function labelFor(key: ChannelKey): string {
  if (key === 'googleAds') return 'Google Ads';
  if (key === 'metaAds') return 'Meta Ads';
  return 'LinkedIn Ads';
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E8EDF4] bg-[#FCFDFF] p-3">
      <p className="text-xs text-text-dim">{label}</p>
      <p className="mt-1 text-lg font-black text-text-main">{value}</p>
    </div>
  );
}
