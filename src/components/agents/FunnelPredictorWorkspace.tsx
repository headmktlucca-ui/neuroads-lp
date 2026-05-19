'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Link2, Sparkles, Target, TrendingUp } from 'lucide-react';
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

type FunnelInput = {
  businessModel: string;
  averageTicket: string;
  targetRevenue: string;
  targetCpl: string;
  clickToLeadRate: string;
  leadToMeetingRate: string;
  meetingToProposalRate: string;
  proposalToSaleRate: string;
  retentionRate: string;
  churnRate: string;
  ltvMultiplier: string;
  grossMargin: string;
  gatewayFee: string;
  fixedCostMonthly: string;
};

type FunnelScenario = {
  id: 'optimistic' | 'moderate' | 'critical';
  label: string;
  leadGrowth: number;
  cplDelta: number;
  closeDelta: number;
};

type LeadScoreProfile = {
  label: string;
  probability: number;
  rationale: string;
};

type Recommendation = {
  action: string;
  urgency: 'Alta' | 'Média' | 'Baixa';
  impact: string;
  ease: 'Alta' | 'Média' | 'Baixa';
};

type AlertItem = {
  title: string;
  probability: number;
  impact: string;
  action: string;
};

const CONNECTORS_KEY = (uid: string) => `neuroads_funnel_predictor_connectors_${uid}`;

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

const DEFAULT_FUNNEL_INPUT: FunnelInput = {
  businessModel: 'B2B',
  averageTicket: '1500',
  targetRevenue: '60000',
  targetCpl: '40',
  clickToLeadRate: '8',
  leadToMeetingRate: '28',
  meetingToProposalRate: '50',
  proposalToSaleRate: '30',
  retentionRate: '72',
  churnRate: '8',
  ltvMultiplier: '2.4',
  grossMargin: '42',
  gatewayFee: '4',
  fixedCostMonthly: '3500',
};

const SCENARIOS: FunnelScenario[] = [
  { id: 'optimistic', label: 'Cenário Otimista', leadGrowth: 0.35, cplDelta: -0.18, closeDelta: 0.2 },
  { id: 'moderate', label: 'Cenário Moderado', leadGrowth: 0.18, cplDelta: -0.08, closeDelta: 0.1 },
  { id: 'critical', label: 'Cenário Crítico', leadGrowth: -0.12, cplDelta: 0.16, closeDelta: -0.18 },
];

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

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function toNumber(value: string): number {
  const normalized = value.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toFactor(percent: number): number {
  return Math.max(0, percent) / 100;
}

function clamp(min: number, value: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function formatCurrency(value: number): string {
  return Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(value);
}

function formatNumber(value: number, max = 2): string {
  return Intl.NumberFormat('pt-BR', { maximumFractionDigits: max }).format(value);
}

function formatPercent(value: number): string {
  return `${formatNumber(value, 2)}%`;
}

function urgencyByProbability(probability: number): 'Alta' | 'Média' | 'Baixa' {
  if (probability >= 70) return 'Alta';
  if (probability >= 45) return 'Média';
  return 'Baixa';
}

function heatColor(ratePercent: number): string {
  if (ratePercent >= 40) return 'bg-[#E9F9F1] text-[#0A9D57] border-[#BDE8CF]';
  if (ratePercent >= 22) return 'bg-[#FFF8EA] text-[#B45309] border-[#FDD79A]';
  return 'bg-[#FFF2F1] text-[#B42318] border-[#FECACA]';
}

function buildMarkdownReport(payload: {
  periodLabel: string;
  businessModel: string;
  executive: string[];
  diagnostics: Array<{ metric: string; value: string }>;
  predictions: Array<{ label: string; value: string }>;
  bottlenecks: string[];
  opportunities: string[];
  recommendations: Recommendation[];
  scenarios: Array<{ label: string; revenue: string; profit: string; roi: string; targetHit: string }>;
  strategicInsights: string[];
}) {
  const lines: string[] = [];
  lines.push(`# Preditor de Funil • ${payload.periodLabel}`);
  lines.push('');
  lines.push('## Diagnóstico Atual');
  payload.executive.forEach((line) => lines.push(`- ${line}`));
  lines.push('');
  lines.push('### Métricas do Funil');
  payload.diagnostics.forEach((item) => lines.push(`- ${item.metric}: ${item.value}`));
  lines.push('');
  lines.push('## Predições');
  payload.predictions.forEach((item) => lines.push(`- ${item.label}: ${item.value}`));
  lines.push('');
  lines.push('## Gargalos Identificados');
  payload.bottlenecks.forEach((item) => lines.push(`- ${item}`));
  lines.push('');
  lines.push('## Oportunidades Imediatas');
  payload.opportunities.forEach((item) => lines.push(`- ${item}`));
  lines.push('');
  lines.push('## Recomendações Prioritárias');
  payload.recommendations.forEach((item) =>
    lines.push(`- ${item.action} | Urgência: ${item.urgency} | Impacto: ${item.impact} | Facilidade: ${item.ease}`)
  );
  lines.push('');
  lines.push('## Simulação de Cenários');
  payload.scenarios.forEach((item) =>
    lines.push(`- ${item.label}: Receita ${item.revenue} | Lucro ${item.profit} | ROI ${item.roi} | Meta atingida ${item.targetHit}`)
  );
  lines.push('');
  lines.push('## Insights Estratégicos');
  payload.strategicInsights.forEach((item) => lines.push(`- ${item}`));
  lines.push('');
  lines.push(`Modelo de operação considerado: ${payload.businessModel}`);
  return lines.join('\n');
}

export default function FunnelPredictorWorkspace({ userId, agentSlug, agentTitle, agentCategory }: Props) {
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
  const [inputs, setInputs] = useState<FunnelInput>(DEFAULT_FUNNEL_INPUT);

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

  const profileContext = useMemo(() => {
    if (!profile || typeof profile !== 'object') return { companyName: 'Empresa', segment: 'Não informado' };
    const root = profile as Record<string, unknown>;
    const onboarding = root.onboarding && typeof root.onboarding === 'object'
      ? (root.onboarding as Record<string, unknown>)
      : {};
    const companyName =
      readString(root.companyName) ||
      readString(root.company) ||
      readString(onboarding.companyName) ||
      'Empresa';
    const segment =
      readString(onboarding.segment) ||
      readString(onboarding.subsegment) ||
      readString(root.segment) ||
      'Não informado';
    const inferredModel =
      readString(onboarding.businessModel) ||
      readString(onboarding.modeloNegocio) ||
      readString(root.businessModel);
    return { companyName, segment, inferredModel };
  }, [profile]);

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
    if (profileContext.inferredModel) {
      setInputs((prev) => (prev.businessModel ? prev : { ...prev, businessModel: profileContext.inferredModel as string }));
    }
  }, [profileContext.inferredModel]);

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

  const projection = useMemo(() => {
    if (!extraction?.totals) return null;

    const totals = extraction.totals;
    const periodDays = Math.max(1, Math.round((new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const monthlyScale = 30 / periodDays;

    const averageTicket = Math.max(0, toNumber(inputs.averageTicket));
    const targetRevenue = Math.max(0, toNumber(inputs.targetRevenue));
    const targetCpl = Math.max(1, toNumber(inputs.targetCpl));
    const clickToLeadRate = clamp(0.1, toNumber(inputs.clickToLeadRate), 100);
    const leadToMeetingRate = clamp(0.1, toNumber(inputs.leadToMeetingRate), 100);
    const meetingToProposalRate = clamp(0.1, toNumber(inputs.meetingToProposalRate), 100);
    const proposalToSaleRate = clamp(0.1, toNumber(inputs.proposalToSaleRate), 100);
    const retentionRate = clamp(0, toNumber(inputs.retentionRate), 100);
    const churnRate = clamp(0, toNumber(inputs.churnRate), 100);
    const ltvMultiplier = Math.max(1, toNumber(inputs.ltvMultiplier));
    const grossMargin = clamp(0, toNumber(inputs.grossMargin), 100);
    const gatewayFee = clamp(0, toNumber(inputs.gatewayFee), 100);
    const fixedCostMonthly = Math.max(0, toNumber(inputs.fixedCostMonthly));

    const impressions = totals.impressions;
    const clicks = totals.clicks;
    const leads = totals.conversions;
    const spend = totals.spend;

    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cpc = clicks > 0 ? spend / clicks : 0;
    const currentCpl = leads > 0 ? spend / leads : targetCpl;

    const effectiveClickToLead = clickToLeadRate > 0 ? clickToLeadRate : leads > 0 && clicks > 0 ? (leads / clicks) * 100 : 5;
    const meetings = leads * toFactor(leadToMeetingRate);
    const proposals = meetings * toFactor(meetingToProposalRate);
    const sales = proposals * toFactor(proposalToSaleRate);
    const leadToSaleRate = leads > 0 ? (sales / leads) * 100 : 0;

    const revenue = sales * averageTicket;
    const marginFactor = Math.max(0, toFactor(grossMargin) - toFactor(gatewayFee));
    const netRevenue = revenue * marginFactor;
    const roi = spend > 0 ? ((netRevenue - spend) / spend) * 100 : 0;
    const cac = sales > 0 ? spend / sales : 0;

    const ltv = averageTicket * ltvMultiplier * (1 + retentionRate / 100);
    const ltvCac = cac > 0 ? ltv / cac : 0;

    const monthlyRevenue = revenue * monthlyScale;
    const monthlyNet = monthlyRevenue * marginFactor;
    const monthlySpend = spend * monthlyScale;
    const monthlyProfit = monthlyNet - monthlySpend - fixedCostMonthly;

    const requiredSales = averageTicket > 0 ? targetRevenue / averageTicket : 0;
    const requiredProposals = toFactor(proposalToSaleRate) > 0 ? requiredSales / toFactor(proposalToSaleRate) : 0;
    const requiredMeetings = toFactor(meetingToProposalRate) > 0 ? requiredProposals / toFactor(meetingToProposalRate) : 0;
    const requiredLeads = toFactor(leadToMeetingRate) > 0 ? requiredMeetings / toFactor(leadToMeetingRate) : 0;
    const requiredClicks = toFactor(effectiveClickToLead) > 0 ? requiredLeads / toFactor(effectiveClickToLead) : 0;
    const requiredImpressions = toFactor(ctr) > 0 ? requiredClicks / toFactor(ctr) : 0;
    const requiredBudget = requiredLeads * targetCpl;
    const targetHit = targetRevenue > 0 ? (monthlyRevenue / targetRevenue) * 100 : 0;

    const stageRates = [
      { label: 'Impressões → Cliques', rate: ctr },
      { label: 'Cliques → Leads', rate: effectiveClickToLead },
      { label: 'Leads → Reuniões', rate: leadToMeetingRate },
      { label: 'Reuniões → Propostas', rate: meetingToProposalRate },
      { label: 'Propostas → Vendas', rate: proposalToSaleRate },
    ].sort((a, b) => a.rate - b.rate);

    const bottlenecks = stageRates.slice(0, 2).map((item) => `${item.label} em ${formatPercent(item.rate)}.`) as string[];

    const channelScores = (extraction.channels ?? []).map((channel) => {
      const channelCpl = channel.conversions > 0 ? channel.spend / channel.conversions : 99999;
      const channelCtr = channel.impressions > 0 ? (channel.clicks / channel.impressions) * 100 : 0;
      const score = (channel.conversions * 2 + channelCtr) / Math.max(1, channelCpl);
      return { ...channel, channelCpl, channelCtr, score };
    });
    const bestChannel = [...channelScores].sort((a, b) => b.score - a.score)[0];

    const probCtrDrop = clamp(5, 22 + (ctr < 1.2 ? 34 : ctr < 2 ? 20 : 8) + (activeChannels.length <= 1 ? 10 : 0), 95);
    const probPerfDrop = clamp(5, 18 + (targetHit < 80 ? 30 : targetHit < 100 ? 15 : 5), 95);
    const probChurn = clamp(5, 12 + churnRate + (retentionRate < 65 ? 14 : 0), 95);
    const probCacRise = clamp(5, 16 + (currentCpl > targetCpl ? 28 : 8) + (proposalToSaleRate < 22 ? 12 : 0), 95);
    const probCreativeFatigue = clamp(5, probCtrDrop - (activeChannels.length > 2 ? 8 : 0) + (impressions > 200000 ? 10 : 0), 95);
    const probFunnelAbandon = clamp(5, 20 + (leadToMeetingRate < 20 ? 26 : 6) + (meetingToProposalRate < 40 ? 12 : 0), 95);
    const probRevenueShortfall = clamp(5, 100 - targetHit + (monthlyProfit < 0 ? 12 : 0), 95);

    const alerts: AlertItem[] = [
      {
        title: 'Queda de CTR / fadiga criativa',
        probability: probCtrDrop,
        impact: 'Reduz volume qualificado e encarece aquisição.',
        action: 'Renovar criativos e segmentar testes por promessa principal.',
      },
      {
        title: 'Elevação de CAC',
        probability: probCacRise,
        impact: 'Pressiona margem e reduz previsibilidade de lucro.',
        action: 'Ajustar qualificação de tráfego e melhorar passagem Proposta → Venda.',
      },
      {
        title: 'Abandono de funil',
        probability: probFunnelAbandon,
        impact: 'Perda de oportunidade entre captação e fechamento.',
        action: 'Reforçar SLA de resposta comercial e playbook de primeiro contato.',
      },
    ].filter((item) => item.probability >= 35);

    const recommendations: Recommendation[] = [
      {
        action: 'Reforçar o fluxo Lead → Reunião com resposta em até 10 minutos e script de abordagem alinhado à promessa da campanha.',
        urgency: urgencyByProbability(probFunnelAbandon),
        impact: `Potencial de elevar reuniões em ${formatPercent(Math.max(8, 26 - leadToMeetingRate / 2))}.`,
        ease: 'Média',
      },
      {
        action: 'Atualizar headline e criativos da campanha principal para conter saturação e recuperar CTR.',
        urgency: urgencyByProbability(probCreativeFatigue),
        impact: 'Possível recuperação de CTR entre 12% e 22% no curto prazo.',
        ease: 'Alta',
      },
      {
        action: 'Revisar oferta/proposta comercial para aumentar fechamento em propostas de alto fit.',
        urgency: urgencyByProbability(probRevenueShortfall),
        impact: 'Aumento projetado de 10% a 18% na taxa Proposta → Venda.',
        ease: 'Média',
      },
      {
        action: 'Priorizar investimento no canal com melhor eficiência atual e reduzir canais com CPL acima do alvo.',
        urgency: urgencyByProbability(probCacRise),
        impact: `Redução estimada de CAC e ganho de ROI com foco em ${bestChannel?.platform ?? 'canal vencedor'}.`,
        ease: 'Alta',
      },
    ];

    const opportunities = [
      targetHit < 100
        ? `A operação está em ${formatPercent(targetHit)} da meta mensal. Gap estimado de ${formatNumber(requiredLeads - leads, 0)} leads para bater ${formatCurrency(targetRevenue)}.`
        : `Meta mensal já coberta no ritmo atual (${formatPercent(targetHit)} do alvo).`,
      `Canal com melhor eficiência atual: ${bestChannel?.platform ?? 'Indefinido'} (${formatCurrency(bestChannel?.channelCpl ?? currentCpl)} de CPL).`,
      `Com CPL alvo de ${formatCurrency(targetCpl)}, a previsão de orçamento para a meta é ${formatCurrency(requiredBudget)}.`,
    ];

    const leadScoring: LeadScoreProfile[] = [
      {
        label: 'Lead Quente',
        probability: clamp(5, proposalToSaleRate * 1.65, 95),
        rationale: 'Interação alta com oferta e resposta comercial rápida.',
      },
      {
        label: 'Lead Morno',
        probability: clamp(5, proposalToSaleRate * 1.05, 90),
        rationale: 'Interesse confirmado, mas ainda precisa de prova e follow-up.',
      },
      {
        label: 'Lead Frio',
        probability: clamp(5, 100 - leadToMeetingRate * 1.9, 85),
        rationale: 'Baixa resposta inicial e menor aderência à promessa.',
      },
      {
        label: 'Lead Estratégico',
        probability: clamp(5, ltvCac * 16, 92),
        rationale: 'Maior potencial de LTV e impacto no caixa de longo prazo.',
      },
      {
        label: 'Lead de Alto Ticket',
        probability: clamp(5, averageTicket > 3000 ? 74 : 41, 95),
        rationale: 'Potencial de receita por venda acima da média.',
      },
      {
        label: 'Lead com risco de churn',
        probability: probChurn,
        rationale: 'Sinal de retenção baixa e probabilidade de evasão no pós-venda.',
      },
    ];

    const scenarios = SCENARIOS.map((scenario) => {
      const scenarioLeads = leads * (1 + scenario.leadGrowth);
      const scenarioCpl = targetCpl * (1 + scenario.cplDelta);
      const scenarioCloseRate = clamp(1, proposalToSaleRate * (1 + scenario.closeDelta), 95);
      const scenarioMeetings = scenarioLeads * toFactor(leadToMeetingRate);
      const scenarioProposals = scenarioMeetings * toFactor(meetingToProposalRate);
      const scenarioSales = scenarioProposals * toFactor(scenarioCloseRate);
      const scenarioRevenue = scenarioSales * averageTicket;
      const scenarioSpend = scenarioLeads * scenarioCpl;
      const scenarioMonthlyRevenue = scenarioRevenue * monthlyScale;
      const scenarioMonthlyNet = scenarioMonthlyRevenue * marginFactor;
      const scenarioMonthlySpend = scenarioSpend * monthlyScale;
      const scenarioMonthlyProfit = scenarioMonthlyNet - scenarioMonthlySpend - fixedCostMonthly;
      const scenarioRoi = scenarioSpend > 0 ? ((scenarioRevenue * marginFactor - scenarioSpend) / scenarioSpend) * 100 : 0;
      const scenarioTargetHit = targetRevenue > 0 ? (scenarioMonthlyRevenue / targetRevenue) * 100 : 0;

      return {
        ...scenario,
        monthlyRevenue: scenarioMonthlyRevenue,
        monthlyProfit: scenarioMonthlyProfit,
        roi: scenarioRoi,
        targetHit: scenarioTargetHit,
      };
    });

    const strategicInsights = [
      `Leads com passagem acima de ${formatPercent(leadToMeetingRate)} para reunião tendem a acelerar o ciclo de vendas no modelo ${inputs.businessModel}.`,
      `Quando o lead interage cedo com proposta comercial, o potencial de fechamento sobe para ${formatPercent(proposalToSaleRate)} no cenário atual.`,
      `A operação tem melhor chance de escala previsível ao priorizar ${bestChannel?.platform ?? 'o canal de menor CPL'} com variação controlada de criativos.`,
      `Retenção em ${formatPercent(retentionRate)} e churn em ${formatPercent(churnRate)} indicam ${retentionRate >= 70 ? 'boa base de valor recorrente' : 'necessidade de reforço no pós-venda'}.`,
    ];

    const executivePanel = {
      predictedRevenue: monthlyRevenue,
      predictedConversion: leadToSaleRate,
      criticalBottleneck: bottlenecks[0] ?? 'Sem gargalo crítico identificado.',
      bestChannel: bestChannel?.platform ?? 'Indefinido',
      winningCampaign: bestChannel ? `${bestChannel.platform} (CPL ${formatCurrency(bestChannel.channelCpl)})` : 'Sem dados suficientes',
      immediateOpportunity: opportunities[0],
    };

    return {
      periodDays,
      totals: { impressions, clicks, leads, spend },
      rates: {
        ctr,
        clickToLeadRate: effectiveClickToLead,
        leadToMeetingRate,
        meetingToProposalRate,
        proposalToSaleRate,
        leadToSaleRate,
      },
      volumes: { meetings, proposals, sales },
      financial: {
        cpc,
        cpl: currentCpl,
        cac,
        ltv,
        ltvCac,
        roi,
        revenue,
        monthlyRevenue,
        monthlyProfit,
        requiredBudget,
        requiredLeads,
        requiredImpressions,
      },
      predictions: {
        probPerfDrop,
        probCtrDrop,
        probChurn,
        probCacRise,
        probCreativeFatigue,
        probFunnelAbandon,
        probRevenueShortfall,
      },
      bottlenecks,
      opportunities,
      recommendations,
      leadScoring,
      scenarios,
      strategicInsights,
      alerts,
      executivePanel,
      targetHit,
      input: {
        businessModel: inputs.businessModel,
        targetRevenue,
        targetCpl,
        averageTicket,
        retentionRate,
        churnRate,
      },
    };
  }, [activeChannels.length, dateFrom, dateTo, extraction, inputs]);

  const runPrediction = async () => {
    if (!projection || !userId) return;
    setSaving(true);
    setError(null);

    try {
      const periodLabel = `${dateFrom} a ${dateTo}`;
      const executive = [
        `Receita prevista (30 dias): ${formatCurrency(projection.executivePanel.predictedRevenue)}`,
        `Conversão prevista (Lead → Venda): ${formatPercent(projection.executivePanel.predictedConversion)}`,
        `Gargalo crítico: ${projection.executivePanel.criticalBottleneck}`,
        `Melhor canal atual: ${projection.executivePanel.bestChannel}`,
        `Campanha vencedora: ${projection.executivePanel.winningCampaign}`,
        `Oportunidade imediata: ${projection.executivePanel.immediateOpportunity}`,
      ];

      const diagnostics = [
        { metric: 'Impressões', value: formatNumber(projection.totals.impressions, 0) },
        { metric: 'CTR', value: formatPercent(projection.rates.ctr) },
        { metric: 'Cliques', value: formatNumber(projection.totals.clicks, 0) },
        { metric: 'Leads', value: formatNumber(projection.totals.leads, 0) },
        { metric: 'CPL', value: formatCurrency(projection.financial.cpl) },
        { metric: 'Reuniões', value: formatNumber(projection.volumes.meetings, 0) },
        { metric: 'Propostas', value: formatNumber(projection.volumes.proposals, 0) },
        { metric: 'Conversão (Lead → Venda)', value: formatPercent(projection.rates.leadToSaleRate) },
        { metric: 'CAC', value: projection.financial.cac > 0 ? formatCurrency(projection.financial.cac) : 'Indefinido' },
        { metric: 'LTV', value: formatCurrency(projection.financial.ltv) },
        { metric: 'ROI', value: formatPercent(projection.financial.roi) },
        { metric: 'Retenção', value: formatPercent(projection.input.retentionRate) },
        { metric: 'Churn', value: formatPercent(projection.input.churnRate) },
      ];

      const predictions = [
        { label: 'Receita prevista 30 dias', value: formatCurrency(projection.financial.monthlyRevenue) },
        { label: 'Conversão prevista', value: formatPercent(projection.rates.leadToSaleRate) },
        { label: 'Churn previsto', value: formatPercent(projection.predictions.probChurn) + ' probabilidade de pressão' },
        { label: 'Saturação criativa prevista', value: formatPercent(projection.predictions.probCreativeFatigue) + ' probabilidade' },
        { label: 'Queda de performance', value: formatPercent(projection.predictions.probPerfDrop) + ' probabilidade' },
        { label: 'Aumento de CAC', value: formatPercent(projection.predictions.probCacRise) + ' probabilidade' },
      ];

      const scenarios = projection.scenarios.map((item) => ({
        label: item.label,
        revenue: formatCurrency(item.monthlyRevenue),
        profit: formatCurrency(item.monthlyProfit),
        roi: formatPercent(item.roi),
        targetHit: formatPercent(item.targetHit),
      }));

      const report = buildMarkdownReport({
        periodLabel,
        businessModel: projection.input.businessModel,
        executive,
        diagnostics,
        predictions,
        bottlenecks: projection.bottlenecks,
        opportunities: projection.opportunities,
        recommendations: projection.recommendations,
        scenarios,
        strategicInsights: projection.strategicInsights,
      });

      await saveAgentReportToDb({
        userId,
        agentKey: agentSlug,
        agentTitle,
        agentCategory,
        reportTitle: `Preditor de Funil • Radar Preditivo • ${periodLabel}`,
        reportContent: report,
        reportFormat: 'markdown',
        generatedAt: new Date().toISOString(),
        metadata: {
          periodLabel,
          businessModel: projection.input.businessModel,
          segment: profileContext.segment,
          monthlyRevenue: Number(projection.financial.monthlyRevenue.toFixed(2)),
          monthlyProfit: Number(projection.financial.monthlyProfit.toFixed(2)),
          requiredLeads: Number(projection.financial.requiredLeads.toFixed(0)),
          requiredBudget: Number(projection.financial.requiredBudget.toFixed(2)),
          criticalBottleneck: projection.bottlenecks[0] ?? '',
          bestChannel: projection.executivePanel.bestChannel,
          targetHit: Number(projection.targetHit.toFixed(2)),
        },
      });

      const entries = await getLatestAgentReportsFromDb(userId, agentSlug, 10);
      setHistoryCount(entries.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar radar preditivo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="col-span-1 rounded-[30px] p-[2px] bg-gradient-to-br from-white/40 via-orange-300/80 to-[#FF6B00] shadow-[0_24px_52px_-30px_rgba(255,107,0,0.42)]">
      <div className="rounded-[28px] bg-white/85 p-[1px]">
        <div className="rounded-[26px] border border-[#FFF1E8] bg-white p-6 md:p-8 space-y-6">
          <header className="rounded-2xl border border-[#E4EAF2] bg-[#FBFCFF] p-5">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-primary">Radar Preditivo da Operação Comercial</p>
            <h3 className="mt-1 text-xl md:text-2xl font-black text-text-main">Preditor de Funil</h3>
            <p className="mt-2 text-sm text-text-muted">
              Conecta sinais de mídia e funil para antecipar riscos, gargalos e oportunidades de crescimento com previsibilidade financeira.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full border border-[#DCE8FF] bg-[#F5F9FF] px-3 py-1 text-xs font-semibold text-[#1D4ED8]">Empresa: {profileContext.companyName}</span>
              <span className="rounded-full border border-[#FFE1CF] bg-[#FFF7F1] px-3 py-1 text-xs font-semibold text-[#C2410C]">Segmento: {profileContext.segment}</span>
            </div>
          </header>

          <section className="rounded-2xl border border-[#E4EAF2] bg-[#FBFCFF] p-5">
            <h3 className="text-sm font-black text-text-main">1. Inteligência integrada multicanal</h3>
            <p className="mt-1 text-sm text-text-muted">
              Ative os canais para extração dos sinais de performance. As demais fontes (CRM, WhatsApp, E-mail, LP, BI, ERP) entram no radar como próximas integrações estratégicas.
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {['CRM', 'WhatsApp', 'Landing Pages', 'E-mail', 'Analytics', 'Instagram', 'TikTok', 'LinkedIn', 'ERP', 'BI'].map((item) => (
                <span key={item} className="rounded-full border border-[#E4EAF2] bg-white px-3 py-1 text-xs text-[#475467]">
                  {item} • {item === 'LinkedIn' ? 'Ativo via Ads' : 'Pendente'}
                </span>
              ))}
            </div>

            <div className="mt-4 space-y-4">
              {(Object.keys(connectors) as ChannelKey[]).map((key) => {
                const oauthHref = `/api/auth/connectors/${key}/start?provider=${CHANNEL_PROVIDER[key]}&next=/hub/agente/preditor-de-funil`;
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
                        onChange={(event) => setConnectorField(key, 'accountId', event.target.value)}
                        placeholder={key === 'googleAds' ? 'Customer ID' : key === 'metaAds' ? 'Ad Account ID' : 'Sponsored Account ID'}
                        className="rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main"
                      />
                      <input
                        value={connectors[key].loginCustomerId || ''}
                        onChange={(event) => setConnectorField(key, 'loginCustomerId', event.target.value)}
                        placeholder={key === 'googleAds' ? 'Login Customer ID (MCC) opcional' : 'Autenticação via e-mail logado'}
                        disabled={key !== 'googleAds'}
                        className="rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main disabled:bg-[#F8FAFC] disabled:text-[#98A2B3]"
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <a
                        href={oauthHref}
                        className="inline-flex h-9 items-center gap-2 rounded-full border border-[#D9E2F4] bg-[#EEF4FF] px-4 text-xs font-bold uppercase tracking-wide text-[#1D4ED8]"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        Autenticar canal
                      </a>
                      <ChannelConnectionHelpTooltip channel={key} />
                      {!connectors[key].isActive ? (
                        <button
                          type="button"
                          onClick={() => connectChannel(key)}
                          className="inline-flex h-9 items-center rounded-full bg-[#FF6B00] px-4 text-xs font-bold uppercase tracking-wide text-white shadow-[0_8px_18px_rgba(255,107,0,0.28)]"
                        >
                          Ativar canal
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => disconnectChannel(key)}
                          className="inline-flex h-9 items-center rounded-full border border-[#E4E7EC] bg-white px-4 text-xs font-bold uppercase tracking-wide text-[#475467]"
                        >
                          Desativar canal
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="text-xs font-bold uppercase tracking-wide text-text-dim">
                Data inicial
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main"
                />
              </label>
              <label className="text-xs font-bold uppercase tracking-wide text-text-dim">
                Data final
                <input
                  type="date"
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  className="mt-1 w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => {
                void runExtraction();
              }}
              disabled={loading}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#FF6B00] px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_10px_22px_rgba(255,107,0,0.30)] disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />
              {loading ? 'Extraindo...' : 'Extrair indicadores'}
            </button>
          </section>

          <section className="rounded-2xl border border-[#E4EAF2] bg-[#FBFCFF] p-5">
            <h3 className="text-sm font-black text-text-main">2. Premissas de previsão e comportamento</h3>
            <p className="mt-1 text-sm text-text-muted">
              Defina as taxas do funil, metas e perfil operacional para calibrar predições, scoring e recomendações do agente.
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
              <label className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wide text-text-dim">Modelo de operação</span>
                <select
                  value={inputs.businessModel}
                  onChange={(event) => setInputs((prev) => ({ ...prev, businessModel: event.target.value }))}
                  className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main"
                >
                  {['B2B', 'B2C', 'SaaS', 'Consultoria', 'E-commerce', 'Infoproduto', 'Local Business', 'High Ticket'].map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wide text-text-dim">Ticket médio (R$)</span>
                <input value={inputs.averageTicket} onChange={(event) => setInputs((prev) => ({ ...prev, averageTicket: event.target.value }))} className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main" />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wide text-text-dim">Meta receita mês (R$)</span>
                <input value={inputs.targetRevenue} onChange={(event) => setInputs((prev) => ({ ...prev, targetRevenue: event.target.value }))} className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main" />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wide text-text-dim">CPL alvo (R$)</span>
                <input value={inputs.targetCpl} onChange={(event) => setInputs((prev) => ({ ...prev, targetCpl: event.target.value }))} className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main" />
              </label>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
              <label className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wide text-text-dim">Cliques → Leads (%)</span>
                <input value={inputs.clickToLeadRate} onChange={(event) => setInputs((prev) => ({ ...prev, clickToLeadRate: event.target.value }))} className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main" />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wide text-text-dim">Leads → Reuniões (%)</span>
                <input value={inputs.leadToMeetingRate} onChange={(event) => setInputs((prev) => ({ ...prev, leadToMeetingRate: event.target.value }))} className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main" />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wide text-text-dim">Reuniões → Propostas (%)</span>
                <input value={inputs.meetingToProposalRate} onChange={(event) => setInputs((prev) => ({ ...prev, meetingToProposalRate: event.target.value }))} className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main" />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wide text-text-dim">Propostas → Vendas (%)</span>
                <input value={inputs.proposalToSaleRate} onChange={(event) => setInputs((prev) => ({ ...prev, proposalToSaleRate: event.target.value }))} className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main" />
              </label>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-5 gap-3">
              <label className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wide text-text-dim">Retenção (%)</span>
                <input value={inputs.retentionRate} onChange={(event) => setInputs((prev) => ({ ...prev, retentionRate: event.target.value }))} className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main" />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wide text-text-dim">Churn (%)</span>
                <input value={inputs.churnRate} onChange={(event) => setInputs((prev) => ({ ...prev, churnRate: event.target.value }))} className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main" />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wide text-text-dim">Multiplicador LTV</span>
                <input value={inputs.ltvMultiplier} onChange={(event) => setInputs((prev) => ({ ...prev, ltvMultiplier: event.target.value }))} className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main" />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wide text-text-dim">Margem bruta (%)</span>
                <input value={inputs.grossMargin} onChange={(event) => setInputs((prev) => ({ ...prev, grossMargin: event.target.value }))} className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main" />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-wide text-text-dim">Taxas + custo fixo</span>
                <input value={inputs.gatewayFee} onChange={(event) => setInputs((prev) => ({ ...prev, gatewayFee: event.target.value }))} placeholder="Taxa gateway %" className="mb-2 w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main" />
                <input value={inputs.fixedCostMonthly} onChange={(event) => setInputs((prev) => ({ ...prev, fixedCostMonthly: event.target.value }))} placeholder="Custo fixo mensal R$" className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main" />
              </label>
            </div>
          </section>

          {error ? (
            <div className="rounded-xl border border-[#FFD2B5] bg-[#FFF7F1] px-4 py-3 text-sm text-[#B45309] flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {projection ? (
            <>
              <section className="rounded-2xl border border-[#E4EAF2] bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-black text-text-main">3. Painel executivo preditivo</h3>
                  <span className="rounded-full border border-[#DCE8FF] bg-[#F5F9FF] px-3 py-1 text-xs font-bold text-[#1D4ED8]">
                    Histórico: {historyCount} relatório(s)
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  <article className="rounded-xl border border-[#E4EAF2] bg-[#FBFCFF] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-text-dim">Receita prevista</p>
                    <p className="mt-1 text-sm font-black text-text-main">{formatCurrency(projection.executivePanel.predictedRevenue)}</p>
                  </article>
                  <article className="rounded-xl border border-[#E4EAF2] bg-[#FBFCFF] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-text-dim">Conversão prevista</p>
                    <p className="mt-1 text-sm font-black text-text-main">{formatPercent(projection.executivePanel.predictedConversion)}</p>
                  </article>
                  <article className="rounded-xl border border-[#E4EAF2] bg-[#FBFCFF] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-text-dim">Gargalo crítico</p>
                    <p className="mt-1 text-xs font-semibold text-text-main">{projection.executivePanel.criticalBottleneck}</p>
                  </article>
                  <article className="rounded-xl border border-[#E4EAF2] bg-[#FBFCFF] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-text-dim">Melhor canal</p>
                    <p className="mt-1 text-sm font-black text-text-main">{projection.executivePanel.bestChannel}</p>
                  </article>
                  <article className="rounded-xl border border-[#E4EAF2] bg-[#FBFCFF] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-text-dim">Campanha vencedora</p>
                    <p className="mt-1 text-xs font-semibold text-text-main">{projection.executivePanel.winningCampaign}</p>
                  </article>
                  <article className="rounded-xl border border-[#E4EAF2] bg-[#FBFCFF] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-text-dim">Oportunidade imediata</p>
                    <p className="mt-1 text-xs font-semibold text-text-main">{projection.executivePanel.immediateOpportunity}</p>
                  </article>
                </div>
              </section>

              <section className="rounded-2xl border border-[#E4EAF2] bg-white p-5">
                <h3 className="text-sm font-black text-text-main">4. Diagnóstico completo do funil</h3>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-sm">
                  <MetricCard label="Impressões" value={formatNumber(projection.totals.impressions, 0)} />
                  <MetricCard label="CTR" value={formatPercent(projection.rates.ctr)} />
                  <MetricCard label="Cliques" value={formatNumber(projection.totals.clicks, 0)} />
                  <MetricCard label="Leads" value={formatNumber(projection.totals.leads, 0)} />
                  <MetricCard label="CPL" value={formatCurrency(projection.financial.cpl)} />
                  <MetricCard label="Reuniões" value={formatNumber(projection.volumes.meetings, 0)} />
                  <MetricCard label="Propostas" value={formatNumber(projection.volumes.proposals, 0)} />
                  <MetricCard label="Conversão" value={formatPercent(projection.rates.leadToSaleRate)} />
                  <MetricCard label="CAC" value={projection.financial.cac > 0 ? formatCurrency(projection.financial.cac) : 'N/A'} />
                  <MetricCard label="LTV" value={formatCurrency(projection.financial.ltv)} />
                  <MetricCard label="ROI" value={formatPercent(projection.financial.roi)} />
                  <MetricCard label="Retenção" value={formatPercent(projection.input.retentionRate)} />
                  <MetricCard label="Churn" value={formatPercent(projection.input.churnRate)} />
                </div>

                <div className="mt-4 rounded-xl border border-[#E4EAF2] bg-[#FBFCFF] p-4">
                  <p className="text-[11px] font-black uppercase tracking-wide text-text-dim">Heatmap de eficiência por etapa</p>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
                    {[
                      { label: 'Imp. → Cliques', rate: projection.rates.ctr },
                      { label: 'Cliques → Leads', rate: projection.rates.clickToLeadRate },
                      { label: 'Leads → Reuniões', rate: projection.rates.leadToMeetingRate },
                      { label: 'Reuniões → Propostas', rate: projection.rates.meetingToProposalRate },
                      { label: 'Propostas → Vendas', rate: projection.rates.proposalToSaleRate },
                    ].map((item) => (
                      <div key={item.label} className={`rounded-lg border px-3 py-2 ${heatColor(item.rate)}`}>
                        <p className="font-black">{item.label}</p>
                        <p className="mt-1">{formatPercent(item.rate)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-[#E4EAF2] bg-white p-5">
                <h3 className="text-sm font-black text-text-main">5. Predições inteligentes</h3>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <PredictionCard title="Queda de performance" probability={projection.predictions.probPerfDrop} detail="Risco de desaceleração geral da operação." />
                  <PredictionCard title="Queda de CTR" probability={projection.predictions.probCtrDrop} detail="Probabilidade de fadiga criativa nos próximos ciclos." />
                  <PredictionCard title="Aumento de CAC" probability={projection.predictions.probCacRise} detail="Risco de pressão de margem por aquisição." />
                  <PredictionCard title="Saturação criativa" probability={projection.predictions.probCreativeFatigue} detail="Risco de perda de tração por repetição de criativos." />
                  <PredictionCard title="Abandono de funil" probability={projection.predictions.probFunnelAbandon} detail="Probabilidade de vazamento no fluxo comercial." />
                  <PredictionCard title="Churn / retenção" probability={projection.predictions.probChurn} detail="Risco de evasão no pós-venda e queda de LTV." />
                </div>
              </section>

              <section className="rounded-2xl border border-[#E4EAF2] bg-white p-5">
                <h3 className="text-sm font-black text-text-main">6. Alertas inteligentes em tempo real</h3>
                <div className="mt-3 space-y-2">
                  {projection.alerts.length ? (
                    projection.alerts.map((alert) => (
                      <div key={alert.title} className="rounded-xl border border-[#FECACA] bg-[#FFF6F5] px-4 py-3">
                        <p className="text-sm font-black text-[#B42318]">{alert.title} • {formatPercent(alert.probability)}</p>
                        <p className="mt-1 text-xs text-[#7F1D1D]">Impacto: {alert.impact}</p>
                        <p className="mt-1 text-xs text-[#7F1D1D]">Ação recomendada: {alert.action}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-text-muted">Sem alertas críticos no momento.</p>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-[#E4EAF2] bg-white p-5">
                <h3 className="text-sm font-black text-text-main">7. Scoring inteligente de leads</h3>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {projection.leadScoring.map((score) => (
                    <article key={score.label} className="rounded-xl border border-[#E4EAF2] bg-[#FBFCFF] p-3">
                      <p className="text-sm font-black text-text-main">{score.label}</p>
                      <p className="mt-1 text-lg font-black text-[#1D4ED8]">{formatPercent(score.probability)}</p>
                      <p className="mt-1 text-xs text-text-muted">{score.rationale}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-[#E4EAF2] bg-white p-5">
                <h3 className="text-sm font-black text-text-main">8. Simulação de cenários</h3>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {projection.scenarios.map((scenario) => (
                    <article key={scenario.id} className="rounded-xl border border-[#E4EAF2] bg-[#FBFCFF] p-4">
                      <p className="text-sm font-black text-text-main">{scenario.label}</p>
                      <p className="mt-2 text-xs text-text-muted">Receita prevista: <strong className="text-text-main">{formatCurrency(scenario.monthlyRevenue)}</strong></p>
                      <p className="mt-1 text-xs text-text-muted">Lucro previsto: <strong className={scenario.monthlyProfit >= 0 ? 'text-[#0A9D57]' : 'text-[#B42318]'}>{formatCurrency(scenario.monthlyProfit)}</strong></p>
                      <p className="mt-1 text-xs text-text-muted">ROI previsto: <strong className="text-text-main">{formatPercent(scenario.roi)}</strong></p>
                      <p className="mt-1 text-xs text-text-muted">Meta atingida: <strong className="text-text-main">{formatPercent(scenario.targetHit)}</strong></p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-[#E4EAF2] bg-white p-5">
                <h3 className="text-sm font-black text-text-main">9. Gargalos, oportunidades e recomendações</h3>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <article className="rounded-xl border border-[#E4EAF2] bg-[#FBFCFF] p-4">
                    <p className="text-[11px] font-black uppercase tracking-wide text-text-dim">Gargalos identificados</p>
                    <ul className="mt-2 space-y-2 text-sm text-text-main">
                      {projection.bottlenecks.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#B42318]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>

                  <article className="rounded-xl border border-[#E4EAF2] bg-[#FBFCFF] p-4">
                    <p className="text-[11px] font-black uppercase tracking-wide text-text-dim">Oportunidades imediatas</p>
                    <ul className="mt-2 space-y-2 text-sm text-text-main">
                      {projection.opportunities.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#0A9D57]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>

                  <article className="rounded-xl border border-[#E4EAF2] bg-[#FBFCFF] p-4">
                    <p className="text-[11px] font-black uppercase tracking-wide text-text-dim">Insights estratégicos</p>
                    <ul className="mt-2 space-y-2 text-sm text-text-main">
                      {projection.strategicInsights.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#1D4ED8]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="text-left text-text-dim">
                        <th className="px-3 py-2 font-black uppercase tracking-wide">Ação</th>
                        <th className="px-3 py-2 font-black uppercase tracking-wide">Impacto</th>
                        <th className="px-3 py-2 font-black uppercase tracking-wide">Urgência</th>
                        <th className="px-3 py-2 font-black uppercase tracking-wide">Facilidade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projection.recommendations.map((item) => (
                        <tr key={item.action} className="border-t border-[#E4EAF2] text-text-main">
                          <td className="px-3 py-2">{item.action}</td>
                          <td className="px-3 py-2">{item.impact}</td>
                          <td className="px-3 py-2 font-bold">{item.urgency}</td>
                          <td className="px-3 py-2">{item.ease}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    void runPrediction();
                  }}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-full bg-[#08B760] px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_10px_22px_rgba(8,183,96,0.30)] disabled:opacity-60"
                >
                  <Sparkles className="h-4 w-4" />
                  {saving ? 'Salvando...' : 'Confirmar diagnóstico'}
                </button>
                <span className="inline-flex items-center gap-1 rounded-full border border-[#BDE8CF] bg-[#F2FFF7] px-3 py-1 text-xs font-bold text-[#0A9D57]">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Radar preditivo pronto para decisões de growth
                </span>
              </div>

              <div className="rounded-xl border border-[#DCE8FF] bg-[#F5F9FF] px-4 py-3 text-sm text-[#1E3A8A]">
                <p className="inline-flex items-center gap-2 font-bold">
                  <Target size={14} />
                  Resultado final ideal
                </p>
                <p className="mt-1">
                  Clareza, previsibilidade e direção operacional para aumentar conversão, reduzir desperdício e escalar lucro com decisões rápidas.
                </p>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-[#E4EAF2] bg-[#FBFCFF] p-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-text-dim">{label}</p>
      <p className="mt-1 text-sm font-black text-text-main">{value}</p>
    </article>
  );
}

function PredictionCard({ title, probability, detail }: { title: string; probability: number; detail: string }) {
  const urgency = urgencyByProbability(probability);
  const colorClass =
    urgency === 'Alta'
      ? 'border-[#FECACA] bg-[#FFF2F1] text-[#B42318]'
      : urgency === 'Média'
        ? 'border-[#FDE68A] bg-[#FFFBEA] text-[#B45309]'
        : 'border-[#C7EBD7] bg-[#F2FFF7] text-[#0A9D57]';

  return (
    <article className={`rounded-xl border p-4 ${colorClass}`}>
      <p className="text-sm font-black">{title}</p>
      <p className="mt-1 text-lg font-black">{formatPercent(probability)}</p>
      <p className="mt-1 text-xs">{detail}</p>
      <p className="mt-2 text-[11px] font-bold uppercase tracking-wide">Urgência: {urgency}</p>
    </article>
  );
}

