'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Calculator, Network, Sparkles, TrendingUp } from 'lucide-react';
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

type SimulationInput = {
  revenueTarget: string;
  averageTicket: string;
  closeRate: string;
  grossMargin: string;
  gatewayFee: string;
  targetRoas: string;
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

const DEFAULT_INPUT: SimulationInput = {
  revenueTarget: '50000',
  averageTicket: '1500',
  closeRate: '12',
  grossMargin: '42',
  gatewayFee: '4',
  targetRoas: '4.5',
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

export default function RoasSimulatorWorkspace({ userId, agentSlug, agentTitle, agentCategory }: Props) {
  const { profile } = useAuth();

  const [connectors, setConnectors] = useState<ConnectorState>(DEFAULT_CONNECTORS);
  const [operationalMode, setOperationalMode] = useState<'real' | 'demo'>('real');
  const [dateFrom, setDateFrom] = useState(() => new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extraction, setExtraction] = useState<ExtractResponse | null>(null);
  const [historyCount, setHistoryCount] = useState(0);
  const [simInput, setSimInput] = useState<SimulationInput>(DEFAULT_INPUT);

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

  const runMockExtraction = async () => {
    setLoading(true);
    setError(null);
    setExtraction(null);

    window.setTimeout(() => {
      try {
        const mockPayload: ExtractResponse = {
          success: true,
          channels: [
            { platform: 'googleAds', spend: 3200, impressions: 180000, clicks: 2800, conversions: 75 },
            { platform: 'metaAds', spend: 4100, impressions: 320000, clicks: 5100, conversions: 125 },
          ],
          totals: {
            spend: 7300,
            impressions: 500000,
            clicks: 7900,
            conversions: 200,
          }
        };
        setExtraction(mockPayload);
      } catch (err) {
        setError('Erro ao gerar simulação de demonstração.');
      } finally {
        setLoading(false);
      }
    }, 1200);
  };

  const simulation = useMemo(() => {
    if (!extraction?.totals) return null;

    const totals = extraction.totals;
    const revenueTarget = toNumber(simInput.revenueTarget);
    const averageTicket = toNumber(simInput.averageTicket);
    const closeRate = toNumber(simInput.closeRate);
    const grossMargin = toNumber(simInput.grossMargin);
    const gatewayFee = toNumber(simInput.gatewayFee);
    const targetRoas = toNumber(simInput.targetRoas);

    const currentCtr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
    const currentCpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0;
    const currentCpl = totals.conversions > 0 ? totals.spend / totals.conversions : 0;
    const currentCvRate = totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;

    const closeRateFactor = toPercentFactor(closeRate);
    const grossMarginFactor = toPercentFactor(grossMargin);
    const gatewayFactor = toPercentFactor(gatewayFee);
    const netMarginFactor = Math.max(0, grossMarginFactor - gatewayFactor);

    const currentSales = totals.conversions * closeRateFactor;
    const currentRevenue = currentSales * averageTicket;
    const currentRoas = totals.spend > 0 ? currentRevenue / totals.spend : 0;
    const currentProfit = currentRevenue * netMarginFactor - totals.spend;

    const requiredBudget = targetRoas > 0 ? revenueTarget / targetRoas : 0;
    const requiredLeads =
      averageTicket > 0 && closeRateFactor > 0 ? revenueTarget / (averageTicket * closeRateFactor) : 0;
    const requiredCpl = requiredLeads > 0 ? requiredBudget / requiredLeads : 0;
    const leadGap = requiredLeads - totals.conversions;

    const channelBreakdown = (extraction.channels ?? []).map((channel) => {
      const cpl = channel.conversions > 0 ? channel.spend / channel.conversions : 0;
      const cvRate = channel.clicks > 0 ? (channel.conversions / channel.clicks) * 100 : 0;
      const share = totals.spend > 0 ? channel.spend / totals.spend : 0;
      const efficiency = cpl > 0 ? 1 / cpl : 0;
      return {
        ...channel,
        cpl,
        cvRate,
        share,
        efficiency,
      };
    });

    const maxEfficiency = Math.max(...channelBreakdown.map((item) => item.efficiency), 1);
    const totalScore = channelBreakdown.reduce((acc, item) => acc + item.efficiency / maxEfficiency + item.cvRate / 100, 0);
    const recommendedAllocation = channelBreakdown.map((item) => {
      const score = item.efficiency / maxEfficiency + item.cvRate / 100;
      const budget = totalScore > 0 ? requiredBudget * (score / totalScore) : 0;
      return {
        platform: item.platform,
        budget,
      };
    });

    const opportunities: string[] = [];
    if (totals.conversions <= 0) {
      opportunities.push('Sem conversões atribuídas no período: valide eventos de conversão e qualidade da oferta antes de escalar orçamento.');
    }
    if (currentCpl > 0 && requiredCpl > 0 && currentCpl > requiredCpl) {
      opportunities.push(`CPL atual acima do alvo de meta (${formatCurrency(currentCpl)} vs ${formatCurrency(requiredCpl)}). Priorize otimização de criativo e página.`);
    }
    if (currentCvRate < 4) {
      opportunities.push('Taxa de conversão abaixo de 4%. Ganho rápido: alinhar promessa do anúncio com oferta e prova social na landing page.');
    }
    const bestChannel = channelBreakdown
      .filter((item) => item.conversions > 0)
      .sort((a, b) => (a.cpl || Number.POSITIVE_INFINITY) - (b.cpl || Number.POSITIVE_INFINITY))[0];
    if (bestChannel) {
      opportunities.push(`${bestChannel.platform} apresenta melhor custo por conversão no período. Considere aumentar share de verba neste canal.`);
    }
    if (!opportunities.length) {
      opportunities.push('Base operacional saudável para escala previsível. Próximo passo: expandir orçamento com monitoramento diário de CPL e taxa de fechamento.');
    }

    const buildScenario = (label: string, roas: number) => {
      const cappedRoas = Math.max(0.1, roas);
      const budget = revenueTarget > 0 ? revenueTarget / cappedRoas : 0;
      const expectedLeads = currentCpl > 0 ? budget / currentCpl : 0;
      const expectedSales = expectedLeads * closeRateFactor;
      const expectedRevenue = expectedSales * averageTicket;
      return { label, roas: cappedRoas, budget, expectedLeads, expectedRevenue };
    };

    const baseRoas = targetRoas > 0 ? targetRoas : currentRoas || 3.5;
    const scenarios = [
      buildScenario('Conservador', baseRoas * 0.85),
      buildScenario('Meta', baseRoas),
      buildScenario('Agressivo', baseRoas * 1.2),
    ];

    return {
      totals,
      currentCtr,
      currentCpc,
      currentCpl,
      currentCvRate,
      currentRoas,
      currentRevenue,
      currentProfit,
      requiredBudget,
      requiredLeads,
      requiredCpl,
      leadGap,
      opportunities,
      recommendedAllocation,
      scenarios,
      input: {
        revenueTarget,
        averageTicket,
        closeRate,
        grossMargin,
        gatewayFee,
        targetRoas,
      },
    };
  }, [extraction, simInput]);

  const runSimulation = async () => {
    if (!simulation || !userId) return;
    setSimulating(true);
    setError(null);
    try {
      const summary = [
        `Meta de faturamento: ${formatCurrency(simulation.input.revenueTarget)} | ROAS-alvo: ${formatNumber(simulation.input.targetRoas)}x`,
        `Necessário para meta: investimento ${formatCurrency(simulation.requiredBudget)} e ${formatNumber(simulation.requiredLeads, 0)} leads qualificados.`,
        `Situação atual: investimento ${formatCurrency(simulation.totals.spend)}, CPL ${formatCurrency(simulation.currentCpl)}, ROAS projetado ${formatNumber(simulation.currentRoas)}x.`,
      ].join('\n');

      const opportunitiesText = simulation.opportunities.map((item, index) => `${index + 1}. ${item}`).join('\n');
      const allocationText = simulation.recommendedAllocation
        .map((item) => `- ${item.platform}: ${formatCurrency(item.budget)} de orçamento recomendado`)
        .join('\n');

      const report = `${summary}\n\nOportunidades prioritárias:\n${opportunitiesText}\n\nDistribuição sugerida:\n${allocationText}`;
      await saveAgentReportToDb({
        userId,
        agentKey: agentSlug,
        agentTitle,
        agentCategory,
        reportTitle: `Simulação de ROAS ${dateFrom} a ${dateTo}`,
        reportContent: report,
        reportFormat: 'plain_text',
        generatedAt: new Date().toISOString(),
        metadata: {
          periodLabel: `${dateFrom} a ${dateTo}`,
          revenueTarget: Number(simulation.input.revenueTarget.toFixed(2)),
          targetRoas: Number(simulation.input.targetRoas.toFixed(2)),
          requiredBudget: Number(simulation.requiredBudget.toFixed(2)),
          requiredLeads: Number(simulation.requiredLeads.toFixed(0)),
          currentSpend: Number(simulation.totals.spend.toFixed(2)),
          currentRoas: Number(simulation.currentRoas.toFixed(2)),
          channels: activeChannels.join(', '),
        },
      });
      const entries = await getLatestAgentReportsFromDb(userId, agentSlug, 10);
      setHistoryCount(entries.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar simulação.');
    } finally {
      setSimulating(false);
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
                    className={`rounded-full border px-5 py-2.5 ${
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

            {/* Mode Selector Switch */}
            <div className="flex rounded-xl bg-[#F8FAFC] p-1 border border-[#E2E8F0] mb-4">
              <button
                type="button"
                onClick={() => setOperationalMode('real')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                  operationalMode === 'real'
                    ? 'bg-white text-[#0F172A] shadow-sm border border-[#E2E8F0]'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <Network className="h-3.5 w-3.5" />
                Modo Real (Conexão Ativa)
              </button>
              <button
                type="button"
                onClick={() => setOperationalMode('demo')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                  operationalMode === 'demo'
                    ? 'bg-white text-[#0F172A] shadow-sm border border-[#E2E8F0]'
                    : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                Modo Demonstração (Simulado)
              </button>
            </div>

            {operationalMode === 'real' ? (
              <div className="rounded-xl border border-[#FF6B00]/20 bg-[#FF6B00]/5 p-4 text-xs space-y-2 mb-4">
                <p className="font-bold text-[#FF6B00] flex items-center gap-1.5 uppercase tracking-wide">
                  <Network size={14} />
                  Canais necessários para o uso do Modo Real:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-text-muted">
                  <li><strong>Google Ads & Meta Ads & LinkedIn Ads:</strong> Extração direta de investimento ({activeChannels.length > 0 ? 'Conectado ✅' : 'Pendente Conexão ⚠️'})</li>
                  <li><strong>Google Analytics 4:</strong> Para consolidação complementar ({profileConnections.ga4?.isActive ? 'Ativo ✅' : 'Inativo ⚠️'})</li>
                  <li><strong>CRM & Pagamentos:</strong> Sincronização de leads e receita no funil ({profileConnections.crm?.isActive ? 'Ativo ✅' : 'Inativo ⚠️'})</li>
                </ul>
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-bg-secondary p-4 text-xs mb-4">
                <p className="font-bold text-text-main flex items-center gap-1.5 uppercase tracking-wide">
                  <Sparkles size={14} className="text-primary animate-pulse" />
                  Usando dados integrados de simulação rápida:
                </p>
                <p className="mt-1 text-text-muted">
                  Este modo gera dados fictícios realistas de tráfego para testar o agente sem precisar de conexões com gerenciadores.
                </p>
              </div>
            )}

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

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={operationalMode === 'real' ? runExtraction : runMockExtraction}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full bg-[#FF6B00] px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_10px_22px_rgba(255,107,0,0.30)] disabled:opacity-60"
              >
                {operationalMode === 'real' ? <Network className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                {loading ? 'Processando...' : operationalMode === 'real' ? 'Extrair Indicadores Reais' : 'Simular Dados Exemplo'}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E4EAF2] bg-[#FBFCFF] p-5">
            <h3 className="text-sm font-black text-text-main">2. Parametrizar simulação de ROAS</h3>
            <p className="mt-1 text-sm text-text-muted">
              Defina meta de faturamento e premissas de operação para calcular investimento, gap de leads e cenários de escala.
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <InputField label="Meta de faturamento (R$)" value={simInput.revenueTarget} onChange={(value) => setSimInput((prev) => ({ ...prev, revenueTarget: value }))} />
              <InputField label="Ticket médio (R$)" value={simInput.averageTicket} onChange={(value) => setSimInput((prev) => ({ ...prev, averageTicket: value }))} />
              <InputField label="Taxa de fechamento (%)" value={simInput.closeRate} onChange={(value) => setSimInput((prev) => ({ ...prev, closeRate: value }))} />
              <InputField label="Margem bruta (%)" value={simInput.grossMargin} onChange={(value) => setSimInput((prev) => ({ ...prev, grossMargin: value }))} />
              <InputField label="Taxa gateway (%)" value={simInput.gatewayFee} onChange={(value) => setSimInput((prev) => ({ ...prev, gatewayFee: value }))} />
              <InputField label="ROAS-alvo (x)" value={simInput.targetRoas} onChange={(value) => setSimInput((prev) => ({ ...prev, targetRoas: value }))} />
            </div>
          </section>

          {error ? <p className="text-sm font-semibold text-[#B42318]">{error}</p> : null}

          {simulation ? (
            <section className="rounded-2xl border border-[#E4EAF2] bg-white p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-sm uppercase tracking-[0.08em] text-primary font-black">3. Oportunidades e cenários de ROAS</h3>
                <button
                  type="button"
                  onClick={runSimulation}
                  disabled={simulating}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#08B760] to-[#0A9D57] px-5 py-2.5 text-xs font-black uppercase tracking-wide text-white shadow-[0_8px_18px_rgba(8,183,96,0.24)] disabled:opacity-60"
                >
                  <Calculator className="h-4 w-4" />
                  {simulating ? 'Salvando...' : 'Salvar simulação'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Metric label="Investimento atual" value={formatCurrency(simulation.totals.spend)} />
                <Metric label="CPL atual" value={formatCurrency(simulation.currentCpl)} />
                <Metric label="ROAS projetado" value={`${formatNumber(simulation.currentRoas)}x`} />
                <Metric label="Meta de investimento" value={formatCurrency(simulation.requiredBudget)} />
              </div>

              <div className="rounded-xl border border-[#E8EDF4] bg-[#FCFDFF] p-4">
                <p className="text-xs font-black uppercase tracking-wide text-text-dim">Leitura executiva</p>
                <p className="mt-2 text-sm text-text-muted">
                  Para buscar {formatCurrency(simulation.input.revenueTarget)} com ROAS de {formatNumber(simulation.input.targetRoas)}x, a operação precisa de {formatCurrency(simulation.requiredBudget)} em mídia e cerca de {formatNumber(simulation.requiredLeads, 0)} leads qualificados.
                  {` `}
                  {simulation.leadGap > 0
                    ? `Gap atual: +${formatNumber(simulation.leadGap, 0)} leads.`
                    : 'A base atual já suporta a meta com folga de leads.'}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="rounded-xl border border-[#E8EDF4] bg-[#FCFDFF] p-4">
                  <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wide text-text-dim">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Oportunidades prioritárias
                  </p>
                  <ul className="mt-2 space-y-1.5 text-sm text-text-muted">
                    {simulation.opportunities.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-[8px] inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-[#E8EDF4] bg-[#FCFDFF] p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-text-dim">Distribuição de verba sugerida</p>
                  <div className="mt-2 space-y-2">
                    {simulation.recommendedAllocation.map((channel) => (
                      <div key={channel.platform} className="flex items-center justify-between rounded-lg border border-[#E4EAF2] bg-white px-3 py-2 text-sm">
                        <span className="font-semibold text-text-main">{channel.platform}</span>
                        <span className="font-black text-primary">{formatCurrency(channel.budget)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {simulation.scenarios.map((scenario) => (
                  <div key={scenario.label} className="rounded-xl border border-[#E8EDF4] bg-[#FCFDFF] p-3">
                    <p className="text-xs font-black uppercase tracking-wide text-text-dim">{scenario.label}</p>
                    <p className="mt-1 text-sm text-text-main">ROAS {formatNumber(scenario.roas)}x</p>
                    <p className="text-sm text-text-muted">Verba: {formatCurrency(scenario.budget)}</p>
                    <p className="text-sm text-text-muted">Leads estimados: {formatNumber(scenario.expectedLeads, 0)}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-text-dim">Histórico salvo no banco: {historyCount} simulações (últimos 10).</p>
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
