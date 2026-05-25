'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Sparkles, Target } from 'lucide-react';
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
  accountId?: string;
  loginCustomerId?: string;
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

type OptimizerInput = {
  optimizationBudget: string;
  targetCpl: string;
  targetConversionRate: string;
  maxChannelShare: string;
};

const CHANNEL_CONNECTION_KEY: Record<ChannelKey, string> = {
  googleAds: 'google_ads',
  metaAds: 'meta_ads',
  linkedinAds: 'linkedin_ads',
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

const DEFAULT_INPUT: OptimizerInput = {
  optimizationBudget: '10000',
  targetCpl: '45',
  targetConversionRate: '4',
  maxChannelShare: '55',
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

function formatCurrency(value: number): string {
  return Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(value);
}

function formatNumber(value: number, max = 2): string {
  return Intl.NumberFormat('pt-BR', { maximumFractionDigits: max }).format(value);
}

export default function BudgetOptimizerWorkspace({ userId, agentSlug, agentTitle, agentCategory }: Props) {
  const { profile } = useAuth();

  const [connectors, setConnectors] = useState<ConnectorState>(DEFAULT_CONNECTORS);
  const [dateFrom, setDateFrom] = useState(() => new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extraction, setExtraction] = useState<ExtractResponse | null>(null);
  const [historyCount, setHistoryCount] = useState(0);
  const [input, setInput] = useState<OptimizerInput>(DEFAULT_INPUT);

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
    const hydrated: ConnectorState = {
      googleAds: {
        ...EMPTY_CONNECTOR,
        oauthConnected: hasOAuthConnection(profileConnections[getConnectionKey('googleAds')]),
        accountId: profileConnections[getConnectionKey('googleAds')]?.accountId?.trim() ?? '',
        loginCustomerId: profileConnections[getConnectionKey('googleAds')]?.loginCustomerId?.trim() ?? '',
      },
      metaAds: {
        ...EMPTY_CONNECTOR,
        oauthConnected: hasOAuthConnection(profileConnections[getConnectionKey('metaAds')]),
        accountId: profileConnections[getConnectionKey('metaAds')]?.accountId?.trim() ?? '',
      },
      linkedinAds: {
        ...EMPTY_CONNECTOR,
        oauthConnected: hasOAuthConnection(profileConnections[getConnectionKey('linkedinAds')]),
        accountId: profileConnections[getConnectionKey('linkedinAds')]?.accountId?.trim() ?? '',
      },
    };

    (Object.keys(hydrated) as ChannelKey[]).forEach((key) => {
      hydrated[key].isActive =
        hydrated[key].oauthConnected &&
        Boolean(hydrated[key].accountId.trim());
    });

    setConnectors(hydrated);

    const loadHistoryCount = async () => {
      if (!userId) return;
      const entries = await getLatestAgentReportsFromDb(userId, agentSlug, 10);
      setHistoryCount(entries.length);
    };

    void loadHistoryCount();
  }, [agentSlug, profileConnections, userId]);

  const runExtraction = async () => {
    if (!activeChannels.length) {
      setError('Nenhum canal ativo encontrado. Configure os conectores na janela Conectores para extrair indicadores.');
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
          throw new Error(`A autenticação de ${labelFor(key)} está inativa. Reative esse canal na janela Conectores para continuar.`);
        }
        return {
          platform: key,
          accessToken,
          accountId: connection?.accountId?.trim() || '',
          loginCustomerId: connection?.loginCustomerId?.trim() || undefined,
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

  const optimization = useMemo(() => {
    if (!extraction?.totals || !extraction.channels?.length) return null;

    const totalBudget = toNumber(input.optimizationBudget);
    const targetCpl = toNumber(input.targetCpl);
    const targetCvRate = toNumber(input.targetConversionRate);
    const maxChannelShare = Math.max(10, Math.min(100, toNumber(input.maxChannelShare)));
    const maxShareFactor = maxChannelShare / 100;

    const withMetrics = extraction.channels.map((channel) => {
      const cpc = channel.clicks > 0 ? channel.spend / channel.clicks : 0;
      const cpl = channel.conversions > 0 ? channel.spend / channel.conversions : 0;
      const cvRate = channel.clicks > 0 ? (channel.conversions / channel.clicks) * 100 : 0;

      const cplScore = targetCpl > 0 && cpl > 0 ? Math.min(2, targetCpl / cpl) : 0.2;
      const cvScore = targetCvRate > 0 ? Math.min(2, cvRate / targetCvRate) : 0.2;
      const baseScore = cplScore * 0.65 + cvScore * 0.35;

      return {
        ...channel,
        cpc,
        cpl,
        cvRate,
        score: Math.max(0.05, baseScore),
      };
    });

    const scoreSum = withMetrics.reduce((acc, item) => acc + item.score, 0);
    const initialAllocations = withMetrics.map((item) => ({
      platform: item.platform,
      score: item.score,
      suggestedBudget: scoreSum > 0 ? totalBudget * (item.score / scoreSum) : 0,
      currentBudget: item.spend,
      cpl: item.cpl,
      cvRate: item.cvRate,
    }));

    const cappedAllocations = initialAllocations.map((item) => {
      const maxBudgetByRule = totalBudget * maxShareFactor;
      return {
        ...item,
        suggestedBudget: Math.min(item.suggestedBudget, maxBudgetByRule),
      };
    });

    const usedAfterCap = cappedAllocations.reduce((acc, item) => acc + item.suggestedBudget, 0);
    let remaining = Math.max(0, totalBudget - usedAfterCap);
    const recirculable = cappedAllocations.filter((item) => item.suggestedBudget < totalBudget * maxShareFactor);
    if (remaining > 0 && recirculable.length > 0) {
      const recirculableScore = recirculable.reduce((acc, item) => acc + item.score, 0) || 1;
      for (const item of cappedAllocations) {
        const room = totalBudget * maxShareFactor - item.suggestedBudget;
        if (room <= 0 || remaining <= 0) continue;
        const extra = Math.min(room, remaining * (item.score / recirculableScore));
        item.suggestedBudget += extra;
        remaining -= extra;
      }
    }

    const opportunities: string[] = [];
    const topGain = [...cappedAllocations].sort((a, b) => (b.suggestedBudget - b.currentBudget) - (a.suggestedBudget - a.currentBudget))[0];
    const topCut = [...cappedAllocations].sort((a, b) => (b.currentBudget - b.suggestedBudget) - (a.currentBudget - a.suggestedBudget))[0];

    if (topGain && topGain.suggestedBudget > topGain.currentBudget) {
      opportunities.push(`${topGain.platform} suporta aumento de verba de ${formatCurrency(topGain.suggestedBudget - topGain.currentBudget)} pelo melhor equilíbrio entre CPL e conversão.`);
    }
    if (topCut && topCut.currentBudget > topCut.suggestedBudget) {
      opportunities.push(`${topCut.platform} está drenando eficiência. Redução sugerida de ${formatCurrency(topCut.currentBudget - topCut.suggestedBudget)} para proteger margem.`);
    }
    const avgCurrentCpl = extraction.totals.conversions > 0 ? extraction.totals.spend / extraction.totals.conversions : 0;
    if (targetCpl > 0 && avgCurrentCpl > targetCpl) {
      opportunities.push(`CPL médio atual (${formatCurrency(avgCurrentCpl)}) acima da meta (${formatCurrency(targetCpl)}). A realocação prioriza canais com menor custo por lead.`);
    }
    if (!opportunities.length) {
      opportunities.push('Distribuição atual está equilibrada. Próximo passo: manter cadência semanal de rebalanceamento para preservar previsibilidade.');
    }

    const forecastLeads = cappedAllocations.reduce((acc, item) => {
      const safeCpl = item.cpl > 0 ? item.cpl : targetCpl || 1;
      return acc + item.suggestedBudget / safeCpl;
    }, 0);

    return {
      totalBudget,
      allocations: cappedAllocations,
      opportunities,
      forecastLeads,
      currentLeads: extraction.totals.conversions,
      avgCurrentCpl,
      targetCpl,
    };
  }, [extraction, input]);

  const saveOptimization = async () => {
    if (!optimization || !userId) return;
    setSaving(true);
    setError(null);
    try {
      const allocationText = optimization.allocations
        .map((item) => `- ${item.platform}: ${formatCurrency(item.suggestedBudget)} (atual ${formatCurrency(item.currentBudget)})`)
        .join('\n');
      const opportunitiesText = optimization.opportunities.map((item, index) => `${index + 1}. ${item}`).join('\n');
      const report = [
        `Otimização de Orçamento (${dateFrom} a ${dateTo})`,
        `Orçamento analisado: ${formatCurrency(optimization.totalBudget)}`,
        `Leads projetados com nova alocação: ${formatNumber(optimization.forecastLeads, 0)} (atual ${formatNumber(optimization.currentLeads, 0)})`,
        '',
        'Distribuição recomendada:',
        allocationText,
        '',
        'Oportunidades prioritárias:',
        opportunitiesText,
      ].join('\n');

      await saveAgentReportToDb({
        userId,
        agentKey: agentSlug,
        agentTitle,
        agentCategory,
        reportTitle: `Otimização de Orçamento ${dateFrom} a ${dateTo}`,
        reportContent: report,
        reportFormat: 'plain_text',
        generatedAt: new Date().toISOString(),
        metadata: {
          periodLabel: `${dateFrom} a ${dateTo}`,
          optimizationBudget: Number(optimization.totalBudget.toFixed(2)),
          forecastLeads: Number(optimization.forecastLeads.toFixed(2)),
          currentLeads: Number(optimization.currentLeads.toFixed(2)),
          avgCurrentCpl: Number(optimization.avgCurrentCpl.toFixed(2)),
          targetCpl: Number(optimization.targetCpl.toFixed(2)),
          channels: activeChannels.join(', '),
        },
      });

      const entries = await getLatestAgentReportsFromDb(userId, agentSlug, 10);
      setHistoryCount(entries.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar otimização.');
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
            <h3 className="text-sm font-black text-text-main">1. Canais disponíveis para extração</h3>
            <p className="mt-1 text-sm text-text-muted">
              Esta página valida status e extrai apenas dos canais ativos. Ative ou reative conexões exclusivamente na janela <strong>Conectores</strong>.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              {(Object.keys(connectors) as ChannelKey[]).map((key) => {
                return (
                  <div
                    key={key}
                    className={`rounded-xl border p-4 ${
                      connectors[key].isActive
                        ? 'border-[#BDE8CF] bg-[#F2FFF7]'
                        : 'border-[#FECACA] bg-[#FFF1F2]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-black text-text-main">{labelFor(key)}</p>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${
                          connectors[key].isActive
                            ? 'border-[#BDE8CF] bg-[#F2FFF7] text-[#0A9D57]'
                            : 'border-[#FECACA] bg-[#FFF1F2] text-[#B42318]'
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {connectors[key].isActive ? 'ATIVA' : 'INATIVA'}
                      </span>
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
            <h3 className="text-sm font-black text-text-main">2. Configurar parâmetros de otimização</h3>
            <p className="mt-1 text-sm text-text-muted">
              Defina orçamento, meta de CPL e limite de concentração para o agente simular alocação mais eficiente.
            </p>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <InputField label="Orçamento para otimizar (R$)" value={input.optimizationBudget} onChange={(value) => setInput((prev) => ({ ...prev, optimizationBudget: value }))} />
              <InputField label="CPL alvo (R$)" value={input.targetCpl} onChange={(value) => setInput((prev) => ({ ...prev, targetCpl: value }))} />
              <InputField label="Conversão alvo (%)" value={input.targetConversionRate} onChange={(value) => setInput((prev) => ({ ...prev, targetConversionRate: value }))} />
              <InputField label="Máx. share por canal (%)" value={input.maxChannelShare} onChange={(value) => setInput((prev) => ({ ...prev, maxChannelShare: value }))} />
            </div>
          </section>

          {error ? <p className="text-sm font-semibold text-[#B42318]">{error}</p> : null}

          {optimization ? (
            <section className="rounded-2xl border border-[#E4EAF2] bg-white p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm uppercase tracking-[0.08em] text-primary font-black">3. Oportunidades e simulações</h3>
                <button
                  type="button"
                  onClick={saveOptimization}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#08B760] to-[#0A9D57] px-5 py-2.5 text-xs font-black uppercase tracking-wide text-white shadow-[0_8px_18px_rgba(8,183,96,0.24)] disabled:opacity-60"
                >
                  <Sparkles className="h-4 w-4" />
                  {saving ? 'Salvando...' : 'Salvar otimização'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Metric label="Orçamento analisado" value={formatCurrency(optimization.totalBudget)} />
                <Metric label="Leads projetados" value={formatNumber(optimization.forecastLeads, 0)} />
                <Metric label="CPL médio atual" value={formatCurrency(optimization.avgCurrentCpl)} />
              </div>

              <div className="rounded-xl border border-[#E8EDF4] bg-[#FCFDFF] p-4">
                <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide text-text-dim">
                  <Target className="h-4 w-4 text-primary" />
                  Oportunidades priorizadas
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-text-muted">
                  {optimization.opportunities.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-[8px] inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-[#E8EDF4] bg-[#FCFDFF] p-4">
                <p className="text-xs font-black uppercase tracking-wide text-text-dim">Distribuição recomendada</p>
                <div className="mt-2 space-y-2">
                  {optimization.allocations.map((item) => (
                    <div key={item.platform} className="rounded-lg border border-[#E4EAF2] bg-white px-3 py-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-text-main">{item.platform}</span>
                        <span className="font-black text-primary">{formatCurrency(item.suggestedBudget)}</span>
                      </div>
                      <p className="mt-1 text-xs text-text-dim">
                        Atual: {formatCurrency(item.currentBudget)} | CPL: {formatCurrency(item.cpl)} | Conversão: {formatNumber(item.cvRate)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-text-dim">Histórico salvo no banco: {historyCount} otimizações (últimos 10).</p>
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
