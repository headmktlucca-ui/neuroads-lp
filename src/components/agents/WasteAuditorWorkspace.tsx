'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Link2, Sparkles, Target, TrendingDown } from 'lucide-react';
import { getLatestAgentReportsFromDb, saveAgentReportToDb } from '../../lib/agent-report-history';
import { useAuth } from '../../context/AuthContext';
import ChannelConnectionHelpTooltip from './ChannelConnectionHelpTooltip';

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

type AuditInput = {
  targetCpc: string;
  targetCpl: string;
  minConversionRate: string;
  wasteCutGoal: string;
};

const CONNECTORS_KEY = (uid: string) => `neuroads_waste_connectors_${uid}`;

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

const DEFAULT_AUDIT_INPUT: AuditInput = {
  targetCpc: '4.5',
  targetCpl: '45',
  minConversionRate: '4',
  wasteCutGoal: '25',
};

function labelFor(key: ChannelKey): string {
  if (key === 'googleAds') return 'Google Ads';
  if (key === 'metaAds') return 'Meta Ads';
  return 'LinkedIn Ads';
}

function getConnectionKey(channel: ChannelKey): string {
  return CHANNEL_CONNECTION_KEY[channel];
}

function hasOAuthConnection(connection: ProfileConnection | undefined): boolean {
  return Boolean(connection?.isActive && connection?.accessToken && connection.accessToken.trim());
}

function toNumber(value: string): number {
  const normalized = value.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toPercentFactor(value: number): number {
  return Math.max(0, value) / 100;
}

function formatCurrency(value: number): string {
  return Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(value);
}

function formatNumber(value: number, max = 2): string {
  return Intl.NumberFormat('pt-BR', { maximumFractionDigits: max }).format(value);
}

export default function WasteAuditorWorkspace({ userId, agentSlug, agentTitle, agentCategory }: Props) {
  const searchParams = useSearchParams();
  const { profile } = useAuth();

  const [connectors, setConnectors] = useState<ConnectorState>(DEFAULT_CONNECTORS);
  const [dateFrom, setDateFrom] = useState(() => new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extraction, setExtraction] = useState<ExtractResponse | null>(null);
  const [historyCount, setHistoryCount] = useState(0);
  const [auditInput, setAuditInput] = useState<AuditInput>(DEFAULT_AUDIT_INPUT);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao extrair indicadores.');
    } finally {
      setLoading(false);
    }
  };

  const audit = useMemo(() => {
    if (!extraction?.totals) return null;

    const totals = extraction.totals;
    const targetCpc = toNumber(auditInput.targetCpc);
    const targetCpl = toNumber(auditInput.targetCpl);
    const minConversionRate = toNumber(auditInput.minConversionRate);
    const wasteCutGoal = toNumber(auditInput.wasteCutGoal);

    const currentCtr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const currentCpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
    const currentCpl = totals.conversions > 0 ? totals.spend / totals.conversions : 0;
    const currentCvRate = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;

    const spend = totals.spend;
    const wastedByCpc = targetCpc > 0 ? Math.max(0, spend - targetCpc * totals.clicks) : 0;
    const wastedByCpl = totals.conversions > 0 && targetCpl > 0 ? Math.max(0, spend - targetCpl * totals.conversions) : spend * 0.35;
    const cvGap = minConversionRate > 0 ? Math.max(0, minConversionRate - currentCvRate) / minConversionRate : 0;
    const wastedByCv = spend * Math.min(0.5, cvGap);

    const estimatedWaste = Math.min(spend, wastedByCpc * 0.4 + wastedByCpl * 0.4 + wastedByCv * 0.2);
    const wasteRate = spend > 0 ? (estimatedWaste / spend) * 100 : 0;
    const recoverable = estimatedWaste * toPercentFactor(wasteCutGoal);
    const additionalLeads = currentCpl > 0 ? recoverable / currentCpl : 0;

    const channelAnalysis = (extraction.channels ?? []).map((channel) => {
      const cpc = channel.clicks > 0 ? channel.spend / channel.clicks : 0;
      const cpl = channel.conversions > 0 ? channel.spend / channel.conversions : 0;
      const cvRate = channel.clicks > 0 ? (channel.conversions / channel.clicks) * 100 : 0;
      const cpcPressure = targetCpc > 0 ? Math.max(0, cpc - targetCpc) / targetCpc : 0;
      const cplPressure = targetCpl > 0 ? Math.max(0, cpl - targetCpl) / targetCpl : 0;
      const cvPressure = minConversionRate > 0 ? Math.max(0, minConversionRate - cvRate) / minConversionRate : 0;
      const inefficiencyScore = cpcPressure * 0.35 + cplPressure * 0.45 + cvPressure * 0.2;
      const channelWaste = Math.max(0, channel.spend * Math.min(0.75, inefficiencyScore));
      return {
        ...channel,
        cpc,
        cpl,
        cvRate,
        inefficiencyScore,
        channelWaste,
      };
    });

    const prioritized = [...channelAnalysis].sort((a, b) => b.channelWaste - a.channelWaste);

    const opportunities: string[] = [];
    if (wasteRate >= 25) {
      opportunities.push(`Desperdício alto detectado (${formatNumber(wasteRate)}% do investimento). Prioridade imediata: pausar segmentos de baixa conversão e revisar termos/placements.`);
    }
    if (currentCpc > targetCpc && targetCpc > 0) {
      opportunities.push(`CPC acima da meta (${formatCurrency(currentCpc)} vs ${formatCurrency(targetCpc)}). Ajuste de segmentação e criativos tende a reduzir dreno de verba.`);
    }
    if (currentCpl > targetCpl && targetCpl > 0) {
      opportunities.push(`CPL acima do tolerável (${formatCurrency(currentCpl)} vs ${formatCurrency(targetCpl)}). Foco em qualificação e consistência da oferta para evitar lead caro.`);
    }
    if (currentCvRate < minConversionRate) {
      opportunities.push(`Taxa de conversão abaixo da meta (${formatNumber(currentCvRate)}% vs ${formatNumber(minConversionRate)}%). Otimize a jornada pós-clique para reduzir perda.`);
    }
    const topChannel = prioritized[0];
    if (topChannel && topChannel.channelWaste > 0) {
      opportunities.push(`${topChannel.platform} concentra maior perda estimada (${formatCurrency(topChannel.channelWaste)}). Inicie auditoria por este canal para ganho rápido.`);
    }
    if (!opportunities.length) {
      opportunities.push('Nível de desperdício sob controle. Próximo passo: manter rotina semanal de auditoria para preservar margem e escala previsível.');
    }

    const scenarios = [10, 20, 30].map((cut) => {
      const recovered = estimatedWaste * (cut / 100);
      const recoveredLeads = currentCpl > 0 ? recovered / currentCpl : 0;
      return {
        cut,
        recovered,
        recoveredLeads,
      };
    });

    return {
      totals,
      currentCtr,
      currentCpc,
      currentCpl,
      currentCvRate,
      estimatedWaste,
      wasteRate,
      recoverable,
      additionalLeads,
      prioritized,
      opportunities,
      scenarios,
      input: {
        targetCpc,
        targetCpl,
        minConversionRate,
        wasteCutGoal,
      },
    };
  }, [auditInput, extraction]);

  const saveAuditReport = async () => {
    if (!audit || !userId) return;
    setSaving(true);
    setError(null);
    try {
      const topChannels = audit.prioritized
        .slice(0, 3)
        .map((item, index) => `${index + 1}. ${item.platform}: perda estimada ${formatCurrency(item.channelWaste)}`)
        .join('\n');
      const opportunitiesText = audit.opportunities.map((item, index) => `${index + 1}. ${item}`).join('\n');
      const scenariosText = audit.scenarios
        .map((scenario) => `- Corte de ${scenario.cut}%: recupera ${formatCurrency(scenario.recovered)} (~${formatNumber(scenario.recoveredLeads, 0)} leads)`)
        .join('\n');

      const report = [
        `Auditoria de Desperdício (${dateFrom} a ${dateTo})`,
        `Investimento analisado: ${formatCurrency(audit.totals.spend)}`,
        `Desperdício estimado: ${formatCurrency(audit.estimatedWaste)} (${formatNumber(audit.wasteRate)}%)`,
        '',
        'Oportunidades prioritárias:',
        opportunitiesText,
        '',
        'Canais com maior perda estimada:',
        topChannels,
        '',
        'Simulações de recuperação:',
        scenariosText,
      ].join('\n');

      await saveAgentReportToDb({
        userId,
        agentKey: agentSlug,
        agentTitle,
        agentCategory,
        reportTitle: `Auditoria de Desperdício ${dateFrom} a ${dateTo}`,
        reportContent: report,
        reportFormat: 'plain_text',
        generatedAt: new Date().toISOString(),
        metadata: {
          periodLabel: `${dateFrom} a ${dateTo}`,
          spend: Number(audit.totals.spend.toFixed(2)),
          estimatedWaste: Number(audit.estimatedWaste.toFixed(2)),
          wasteRate: Number(audit.wasteRate.toFixed(2)),
          targetCpc: Number(audit.input.targetCpc.toFixed(2)),
          targetCpl: Number(audit.input.targetCpl.toFixed(2)),
          minConversionRate: Number(audit.input.minConversionRate.toFixed(2)),
          channels: activeChannels.join(', '),
        },
      });

      const entries = await getLatestAgentReportsFromDb(userId, agentSlug, 10);
      setHistoryCount(entries.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar auditoria.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="col-span-1 rounded-[30px] p-[2px] bg-gradient-to-br from-white/40 via-orange-300/80 to-[#FF6B00] shadow-[0_24px_52px_-30px_rgba(255,107,0,0.42)]">
      <div className="rounded-[28px] bg-white/85 p-[1px]">
        <div className="rounded-[26px] border border-[#FFF1E8] bg-white p-6 md:p-8 space-y-6">
          <h2 className="text-sm uppercase tracking-widest text-primary font-bold">Área de implantação</h2>

          <section className="rounded-2xl border border-[#E4EAF2] bg-[#FBFCFF] p-5">
            <h3 className="text-sm font-black text-text-main">1. Integrar canais e extrair indicadores</h3>
            <p className="mt-1 text-sm text-text-muted">
              Conecte os canais com o e-mail logado para consolidar investimento, cliques e conversões no período analisado.
            </p>

            <div className="mt-4 space-y-4">
              {(Object.keys(connectors) as ChannelKey[]).map((key) => {
                const oauthHref = `/api/auth/connectors/${key}/start?provider=${CHANNEL_PROVIDER[key]}&next=/hub/agente/auditor-de-desperdicio`;
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
                      <ChannelConnectionHelpTooltip channel={key} />
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

          <section className="rounded-2xl border border-[#E4EAF2] bg-[#FBFCFF] p-5">
            <h3 className="text-sm font-black text-text-main">2. Definir critérios de desperdício</h3>
            <p className="mt-1 text-sm text-text-muted">
              Configure metas operacionais para o agente identificar perda de verba e simular recuperação com impacto no caixa.
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <InputField label="CPC alvo (R$)" value={auditInput.targetCpc} onChange={(value) => setAuditInput((prev) => ({ ...prev, targetCpc: value }))} />
              <InputField label="CPL alvo (R$)" value={auditInput.targetCpl} onChange={(value) => setAuditInput((prev) => ({ ...prev, targetCpl: value }))} />
              <InputField label="Conversão mínima (%)" value={auditInput.minConversionRate} onChange={(value) => setAuditInput((prev) => ({ ...prev, minConversionRate: value }))} />
              <InputField label="Meta de corte (%)" value={auditInput.wasteCutGoal} onChange={(value) => setAuditInput((prev) => ({ ...prev, wasteCutGoal: value }))} />
            </div>
          </section>

          {error ? <p className="text-sm font-semibold text-[#B42318]">{error}</p> : null}

          {audit ? (
            <section className="rounded-2xl border border-[#E4EAF2] bg-white p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm uppercase tracking-[0.08em] text-primary font-black">3. Auditoria e simulações de recuperação</h3>
                <button
                  type="button"
                  onClick={saveAuditReport}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#08B760] to-[#0A9D57] px-5 py-2.5 text-xs font-black uppercase tracking-wide text-white shadow-[0_8px_18px_rgba(8,183,96,0.24)] disabled:opacity-60"
                >
                  <Sparkles className="h-4 w-4" />
                  {saving ? 'Salvando...' : 'Salvar auditoria'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Metric label="Investimento analisado" value={formatCurrency(audit.totals.spend)} />
                <Metric label="Desperdício estimado" value={formatCurrency(audit.estimatedWaste)} />
                <Metric label="Taxa de desperdício" value={`${formatNumber(audit.wasteRate)}%`} />
                <Metric label="Verba recuperável" value={formatCurrency(audit.recoverable)} />
              </div>

              <div className="rounded-xl border border-[#E8EDF4] bg-[#FCFDFF] p-4">
                <p className="text-xs font-black uppercase tracking-wide text-text-dim">Leitura executiva</p>
                <p className="mt-2 text-sm text-text-muted">
                  O agente detectou {formatCurrency(audit.estimatedWaste)} de desperdício potencial no período, equivalente a {formatNumber(audit.wasteRate)}% da verba.
                  {` `}
                  Com meta de corte de {formatNumber(audit.input.wasteCutGoal)}%, a operação pode recuperar {formatCurrency(audit.recoverable)} e gerar aproximadamente {formatNumber(audit.additionalLeads, 0)} leads adicionais no mesmo orçamento.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-xl border border-[#E8EDF4] bg-[#FCFDFF] p-4">
                  <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide text-text-dim">
                    <Target className="h-4 w-4 text-primary" />
                    Oportunidades prioritárias
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm text-text-muted">
                    {audit.opportunities.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-[8px] inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-[#E8EDF4] bg-[#FCFDFF] p-4">
                  <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide text-text-dim">
                    <TrendingDown className="h-4 w-4 text-primary" />
                    Canais com maior perda estimada
                  </p>
                  <div className="mt-2 space-y-2">
                    {audit.prioritized.slice(0, 3).map((channel) => (
                      <div key={channel.platform} className="flex items-center justify-between rounded-lg border border-[#E4EAF2] bg-white px-3 py-2 text-sm">
                        <span className="font-semibold text-text-main">{channel.platform}</span>
                        <span className="font-black text-[#B42318]">{formatCurrency(channel.channelWaste)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {audit.scenarios.map((scenario) => (
                  <div key={scenario.cut} className="rounded-xl border border-[#E8EDF4] bg-[#FCFDFF] p-3">
                    <p className="text-xs font-black uppercase tracking-wide text-text-dim">Corte de {scenario.cut}%</p>
                    <p className="mt-1 text-sm text-text-main">Recuperação: {formatCurrency(scenario.recovered)}</p>
                    <p className="text-sm text-text-muted">Leads extras: {formatNumber(scenario.recoveredLeads, 0)}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-text-dim">Histórico salvo no banco: {historyCount} auditorias (últimos 10).</p>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-bold uppercase tracking-wide text-text-dim">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main"
      />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E8EDF4] bg-[#FCFDFF] p-3">
      <p className="text-xs text-text-dim">{label}</p>
      <p className="mt-1 text-lg font-black text-text-main">{value}</p>
    </div>
  );
}
