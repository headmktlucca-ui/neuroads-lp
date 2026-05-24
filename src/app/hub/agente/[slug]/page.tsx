'use client';

import { useMemo, useEffect, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle2, Download, Eye, History, MoreVertical, Sparkles, Trash2, X } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Navbar from '../../../../components/layout/Navbar';
import Footer from '../../../../components/layout/Footer';
import LuccaHubSupportWidget from '../../../../components/hub/LuccaHubSupportWidget';
import SeoGeoWorkspace from '../../../../components/agents/SeoGeoWorkspace';
import TrafficAnalystWorkspace from '../../../../components/agents/TrafficAnalystWorkspace';
import RoasSimulatorWorkspace from '../../../../components/agents/RoasSimulatorWorkspace';
import FunnelPredictorWorkspace from '../../../../components/agents/FunnelPredictorWorkspace';
import WasteAuditorWorkspace from '../../../../components/agents/WasteAuditorWorkspace';
import BudgetOptimizerWorkspace from '../../../../components/agents/BudgetOptimizerWorkspace';
import CreativeGeneratorWorkspace from '../../../../components/agents/CreativeGeneratorWorkspace';
import ConversionCopyWorkspace from '../../../../components/agents/ConversionCopyWorkspace';
import CreativeAnalysisWorkspace from '../../../../components/agents/CreativeAnalysisWorkspace';
import LandingPageDiagnosisWorkspace from '../../../../components/agents/LandingPageDiagnosisWorkspace';
import DnaBrandWorkspace, { DnaBrandPresentationPanel } from '../../../../components/agents/DnaBrandWorkspace';
import GenericAgentWorkspace from '../../../../components/agents/GenericAgentWorkspace';
import { useAuth } from '../../../../context/AuthContext';
import type { DnaBrandPresentation, DnaBrandSource } from '../../../actions/dna-brand';
import {
  getAgentBySlug,
  getAgentEntryDefinition,
  getContractedAgentsFromProfile,
  slugifyAgentTitle,
} from '../../../../lib/hub-agents';
import { getHubLoginRedirect, getHubOnboardingRedirect, resolveHubAccessState } from '../../../../lib/hub-access';
import { getFirebaseDb } from '../../../../lib/firebase';
import {
  deleteAgentReportFromDb,
  downloadAgentReport,
  getLatestAgentReportsFromDb,
  type AgentReportHistoryEntry,
} from '../../../../lib/agent-report-history';
import { buildAutomationTimestamps } from '../../../../lib/hub-automations';
import {
  CONNECTOR_DEFINITIONS,
  getConnectorStatusFromConnections,
  type ConnectorConnection,
  type ConnectorKey,
} from '../../../../lib/connectors';

type AutomationSuggestion = {
  id: string;
  title: string;
  objective: string;
  cadence: string;
  monthlyExecutions: number;
  distribution: string;
  scheduleOptions: Array<{
    id: string;
    label: string;
    detail: string;
  }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getDnaHistoryPayload(entry: AgentReportHistoryEntry | null): {
  presentation: DnaBrandPresentation;
  sources: DnaBrandSource[];
} | null {
  if (!entry || entry.agentTitle !== 'DNA da Marca') return null;
  const metadata = entry.metadata;
  if (!isRecord(metadata)) return null;

  const presentationRaw = metadata.dnaPresentation;
  const sourcesRaw = metadata.dnaSources;

  if (!isRecord(presentationRaw) || !Array.isArray(sourcesRaw)) return null;

  return {
    presentation: presentationRaw as unknown as DnaBrandPresentation,
    sources: sourcesRaw as unknown as DnaBrandSource[],
  };
}

function getCadenceContext(category: string, title: string) {
  const byCategory: Record<string, { objective: string; distribution: string }> = {
    Performance: {
      objective: 'Ajustes rápidos em campanhas, orçamento e segmentações para sustentar ROI.',
      distribution: 'Seg: diagnóstico | Qua: otimização | Sex: validação de performance',
    },
    Inteligência: {
      objective: 'Análises estratégicas e decisões orientadas por sinais de mercado e comportamento.',
      distribution: 'Ter: pesquisa e insights | Qui: refinamento de direcionamento | Sex: plano de ação',
    },
    Criativos: {
      objective: 'Ciclos contínuos de ideação, variações e melhoria de mensagens criativas.',
      distribution: 'Seg: briefing | Qua: variações | Sex: revisão de conversão',
    },
    Técnico: {
      objective: 'Estabilidade de tracking, testes técnicos e evolução da infraestrutura de marketing.',
      distribution: 'Ter: auditoria técnica | Qui: implementação | Sex: validação e monitoramento',
    },
  };

  const fallback = {
    objective: 'Rotina estratégica para evolução contínua da operação com foco em previsibilidade.',
    distribution: 'Seg: planejamento | Qua: execução | Sex: revisão',
  };

  if (title === 'SEO & GEO') {
    return {
      objective: 'Evolução contínua de autoridade orgânica e presença em respostas de IAs generativas.',
      distribution: 'Seg: auditoria e keywords | Qua: otimização on-page/schema | Sex: GEO e menções externas',
    };
  }

  return byCategory[category] ?? fallback;
}

function getAgentHeroDescription(title: string) {
  if (title === 'SEO & GEO') {
    return (
      <>
        O agente <strong className="text-text-main">SEO & GEO</strong> atua como uma camada estratégica contínua para aumentar a autoridade digital da sua marca em buscadores
        tradicionais e em mecanismos de resposta por IA. Ele organiza palavras-chave de intenção real, otimiza conteúdo e estrutura técnica das páginas, identifica
        oportunidades de posicionamento e transforma sinais de mercado em ações práticas. Com isso, sua operação ganha mais tráfego qualificado, melhora a previsibilidade de
        geração de demanda e constrói crescimento sustentável com impacto direto em oportunidades comerciais e receita.
      </>
    );
  }

  if (title === 'Analista de Tráfego') {
    return (
      <>
        O agente <strong className="text-text-main">Analista de Tráfego</strong> monitora campanhas em Google Ads e Meta de forma contínua para identificar desperdícios,
        oportunidades de escala e ajustes de conversão com prioridade no caixa da operação. Ele cruza dados reais de desempenho, redistribui orçamento por potencial de retorno e
        sinaliza decisões práticas para manter CPL competitivo e ROAS saudável. O resultado é mais previsibilidade comercial, menos achismo e avanço consistente da receita.
      </>
    );
  }

  if (title === 'Simulador de ROAS') {
    return (
      <>
        O agente <strong className="text-text-main">Simulador de ROAS</strong> conecta seus canais de mídia, consolida indicadores reais e transforma metas de faturamento em
        projeções acionáveis de investimento, leads e retorno. Ele identifica gaps entre o cenário atual e a meta desejada, prioriza oportunidades por canal e sugere simulações
        de escala com foco em previsibilidade de caixa. Com isso, sua operação decide orçamento com mais segurança, reduz desperdício e avança com consistência financeira.
      </>
    );
  }

  if (title === 'Preditor de Funil') {
    return (
      <>
        O agente <strong className="text-text-main">Preditor de Funil</strong> transforma sinais reais de tráfego e conversão em projeções financeiras acionáveis para cada etapa
        da jornada comercial. Ele estima volume necessário de cliques, leads, MQLs, SQLs e vendas para bater metas de receita, compara cenários de execução e aponta o caminho com
        melhor equilíbrio entre escala, custo e margem.
      </>
    );
  }

  if (title === 'Auditor de Desperdício') {
    return (
      <>
        O agente <strong className="text-text-main">Auditor de Desperdício</strong> cruza dados reais de mídia para detectar onde sua verba está sendo drenada sem retorno
        proporcional. Ele identifica canais, segmentações e padrões de baixa eficiência, estima o desperdício financeiro e simula cenários de recuperação para realocar
        investimento com foco em margem e previsibilidade. O resultado é uma operação mais enxuta, com decisões orientadas por dados reais e impacto direto no caixa.
      </>
    );
  }

  if (title === 'Otimizador de Orçamento') {
    return (
      <>
        O agente <strong className="text-text-main">Otimizador de Orçamento</strong> identifica o melhor destino para cada real investido entre seus canais ativos. Ele cruza
        custo, conversão e eficiência por fonte para simular realocações mais inteligentes, reduzir desperdício e aumentar previsibilidade de resultado financeiro. Na prática,
        você ganha um plano tático de distribuição de verba orientado por dados reais, com foco em escala previsível e consistência de caixa.
      </>
    );
  }

  if (title === 'Gerador de Criativos') {
    return (
      <>
        O agente <strong className="text-text-main">Gerador de Criativos</strong> conecta seus canais, lê indicadores reais de CTR, conversão e custo por lead para identificar
        quais mensagens e ângulos criativos têm maior potencial financeiro. Ele transforma dados de performance em oportunidades priorizadas e simulações práticas de impacto,
        apoiando ciclos contínuos de testes com foco em reduzir CPL e aumentar previsibilidade comercial.
      </>
    );
  }

  if (title === 'Gerador de Copies de Conversão') {
    return (
      <>
        O agente <strong className="text-text-main">Gerador de Copies de Conversão</strong> transforma sinais reais de performance em copies orientadas a resultado financeiro.
        Ele localiza padrões vencedores por canal, mensura prioridades de otimização e gera variações de headline, hook, corpo e CTA prontas para execução com foco em elevar
        conversão e controlar o custo por aquisição.
      </>
    );
  }

  if (title === 'Análise Viral') {
    return (
      <>
        O agente <strong className="text-text-main">Análise de Criativos</strong> monitora sinais quentes do mercado para mapear conteúdos em destaque nas últimas 24 horas.
        Ele transforma tendências em variações estratégicas de formato, narrativa e posicionamento, priorizando relevância comercial, clareza de oferta e impacto direto na
        geração de demanda.
      </>
    );
  }

  if (title === 'Diagnóstico de Landing Page') {
    return (
      <>
        O agente <strong className="text-text-main">Diagnóstico de Landing Page</strong> funciona como um laboratório de conversão para identificar com precisão os pontos que
        derrubam resultado comercial na sua página. Ele cruza clareza de oferta, UX, copy, autoridade e consistência entre anúncio e landing page para encontrar gargalos
        críticos, priorizar ações e simular impacto esperado em conversão. Na prática, você recebe direção objetiva para ajustar o que realmente afeta receita, retenção e
        eficiência da operação.
      </>
    );
  }

  if (title === 'DNA da Marca') {
    return (
      <>
        O agente <strong className="text-text-main">DNA da Marca</strong> transforma posicionamento em linguagem comercial clara, garantindo consistência entre anúncios,
        páginas, roteiros e atendimento. Ele organiza diferenciais, dores e provas de valor para que cada mensagem reflita o que torna sua empresa única no mercado. Com isso,
        sua comunicação ganha força estratégica, aumenta a qualidade dos leads e melhora a conversão sem depender de improviso.
      </>
    );
  }

  return null;
}

function getRequiredConnectorKeysForAgent(title: string, category: string): ConnectorKey[] {
  if (title === 'SEO & GEO') return ['ga4', 'crm', 'warehouse'];
  if (title === 'DNA da Marca') return ['crm', 'ga4'];
  if (title === 'Diagnóstico de Landing Page') return ['ga4', 'googleAds', 'metaAds', 'crm'];
  if (title === 'Gerador de Copies de Conversão') return ['ga4', 'crm', 'googleAds', 'metaAds'];
  if (title === 'Gerador de Criativos' || title === 'Análise Viral') return ['googleAds', 'metaAds', 'linkedinAds', 'ga4'];
  if (title === 'Simulador de ROAS' || title === 'Preditor de Funil') {
    return ['googleAds', 'metaAds', 'linkedinAds', 'ga4', 'crm', 'payments'];
  }
  if (title === 'Analista de Tráfego' || title === 'Auditor de Desperdício' || title === 'Otimizador de Orçamento') {
    return ['googleAds', 'metaAds', 'linkedinAds', 'ga4'];
  }
  if (category === 'Performance') return ['googleAds', 'metaAds', 'linkedinAds', 'ga4'];
  if (category === 'Criativos') return ['googleAds', 'metaAds', 'ga4'];
  if (category === 'Técnico') return ['ga4', 'serverTracking', 'warehouse'];
  return ['ga4', 'crm', 'warehouse'];
}

function getConnectionStatusFromProfile(profile: unknown): Record<ConnectorKey, boolean> {
  const profileRecord = isRecord(profile) ? profile : null;
  const connectionsRaw = profileRecord?.connections;
  const connections = isRecord(connectionsRaw)
    ? (connectionsRaw as Record<string, ConnectorConnection | null | undefined>)
    : null;
  return getConnectorStatusFromConnections(connections);
}

function buildAutomationSuggestions(entry: { title: string; category: string; planSummary?: { monthlyLimit?: number } }): AutomationSuggestion[] {
  const limit = Math.max(6, entry.planSummary?.monthlyLimit ?? 12);
  const context = getCadenceContext(entry.category, entry.title);

  const conservative = Math.max(4, Math.round(limit * 0.45));
  const balanced = Math.max(conservative + 1, Math.round(limit * 0.75));
  const scale = limit;

  const toCadence = (executions: number) => {
    const weekly = Math.max(1, Math.round(executions / 4));
    const days =
      weekly <= 2
        ? '2x por semana'
        : weekly <= 4
          ? '4x por semana'
          : weekly <= 6
            ? '6x por semana'
            : 'execução diária';
    return `${days} (${weekly} rotinas/semana)`;
  };

  return [
    {
      id: 'conservative',
      title: 'Cadência Essencial',
      objective: `${context.objective} Com foco em consistência e baixo esforço operacional.`,
      cadence: toCadence(conservative),
      monthlyExecutions: conservative,
      distribution: context.distribution,
      scheduleOptions: [
        { id: 'conservative_mon_thu_0900', label: 'Seg e Qui • 09:00', detail: 'Revisão no início da manhã para ajustes rápidos antes do pico.' },
        { id: 'conservative_tue_fri_1430', label: 'Ter e Sex • 14:30', detail: 'Acompanhamento no meio da tarde com janela para correções no mesmo dia.' },
      ],
    },
    {
      id: 'balanced',
      title: 'Cadência Estratégica',
      objective: `${context.objective} Equilíbrio ideal entre aprendizado, execução e estabilidade.`,
      cadence: toCadence(balanced),
      monthlyExecutions: balanced,
      distribution: context.distribution,
      scheduleOptions: [
        { id: 'balanced_mon_wed_fri_0830', label: 'Seg, Qua e Sex • 08:30', detail: 'Ritmo clássico para abrir, ajustar e consolidar a semana.' },
        { id: 'balanced_tue_thu_sat_1000', label: 'Ter, Qui e Sáb • 10:00', detail: 'Distribuição equilibrada com revisão extra no sábado.' },
        { id: 'balanced_mon_wed_fri_1700', label: 'Seg, Qua e Sex • 17:00', detail: 'Leitura de fechamento diário para replanejar o dia seguinte.' },
      ],
    },
    {
      id: 'scale',
      title: 'Cadência Máxima do Plano',
      objective: `${context.objective} Uso total do limite contratado para acelerar resultados.`,
      cadence: toCadence(scale),
      monthlyExecutions: scale,
      distribution: context.distribution,
      scheduleOptions: [
        { id: 'scale_weekdays_0800', label: 'Seg a Sex • 08:00', detail: 'Ajustes agressivos na abertura de cada dia útil.' },
        { id: 'scale_weekdays_1230', label: 'Seg a Sex • 12:30', detail: 'Correções no meio do dia, após sinais iniciais de performance.' },
        { id: 'scale_weekdays_1800', label: 'Seg a Sex • 18:00', detail: 'Fechamento de rotina para rebalanceamento noturno.' },
        { id: 'scale_daily_0900', label: 'Seg a Dom • 09:00', detail: 'Operação contínua inclusive fim de semana para contas com alto giro.' },
      ],
    },
  ];
}

export default function AgentEntryPage() {
  const { user, profile, loading, premiumSyncing } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<AgentReportHistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyActionError, setHistoryActionError] = useState<string | null>(null);
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null);
  const [historyMenuReportId, setHistoryMenuReportId] = useState<string | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [selectedAutomationId, setSelectedAutomationId] = useState<string | null>(null);
  const [selectedScheduleOptionId, setSelectedScheduleOptionId] = useState<string | null>(null);
  const [automationActivated, setAutomationActivated] = useState(false);
  const [isSavingAutomation, setIsSavingAutomation] = useState(false);
  const [isLoadingAutomation, setIsLoadingAutomation] = useState(false);
  const [automationNotice, setAutomationNotice] = useState<string | null>(null);
  const accessState = useMemo(
    () => resolveHubAccessState({ loading, user, profile }),
    [loading, profile, user]
  );
  const isSyncingAccess = accessState === 'forbidden' && premiumSyncing;

  useEffect(() => {
    if (accessState === 'unauthenticated') {
      router.replace(getHubLoginRedirect(pathname));
      return;
    }
    if (accessState === 'forbidden' && !premiumSyncing) {
      router.replace(getHubOnboardingRedirect(pathname));
    }
  }, [accessState, pathname, premiumSyncing, router]);

  const contracts = useMemo(() => getContractedAgentsFromProfile(profile), [profile]);
  const agent = useMemo(() => (slug ? getAgentBySlug(slug) : undefined), [slug]);
  const entry = useMemo(() => (agent ? getAgentEntryDefinition(agent, contracts) : null), [agent, contracts]);
  const automationSuggestions = useMemo(() => {
    if (!entry) return [];
    return buildAutomationSuggestions(entry);
  }, [entry]);
  const selectedSuggestion = useMemo(
    () => automationSuggestions.find((item) => item.id === selectedAutomationId) ?? null,
    [automationSuggestions, selectedAutomationId]
  );
  const selectedScheduleOption = useMemo(() => {
    if (!selectedSuggestion) return null;
    return selectedSuggestion.scheduleOptions.find((item) => item.id === selectedScheduleOptionId) ?? null;
  }, [selectedScheduleOptionId, selectedSuggestion]);
  const selectedHistoryEntry = useMemo(() => {
    if (!historyEntries.length) return null;
    if (!selectedHistoryId) return historyEntries[0];
    return historyEntries.find((item) => item.id === selectedHistoryId) ?? historyEntries[0];
  }, [historyEntries, selectedHistoryId]);
  const dnaHistoryPayload = useMemo(
    () => getDnaHistoryPayload(selectedHistoryEntry),
    [selectedHistoryEntry]
  );
  const agentAutomationKey = useMemo(() => (entry ? slugifyAgentTitle(entry.title) : ''), [entry]);
  const heroDescription = useMemo(() => (entry ? getAgentHeroDescription(entry.title) : null), [entry]);
  const connectorStatus = useMemo(() => getConnectionStatusFromProfile(profile), [profile]);
  const requiredConnectors = useMemo(() => {
    if (!entry) return [];
    const requiredKeys = getRequiredConnectorKeysForAgent(entry.title, entry.category);
    return requiredKeys.map((key) => {
      const definition = CONNECTOR_DEFINITIONS.find((item) => item.key === key);
      return {
        key,
        name: definition?.name ?? key,
        source: definition?.source ?? 'Conector',
        isActive: connectorStatus[key],
      };
    });
  }, [connectorStatus, entry]);
  const inactiveRequiredConnectors = useMemo(
    () => requiredConnectors.filter((connector) => !connector.isActive),
    [requiredConnectors]
  );

  const formatHistoryDate = (dateIso: string) => {
    const parsed = new Date(dateIso);
    if (Number.isNaN(parsed.getTime())) return 'Data indisponível';
    return parsed.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openHistoryModal = async () => {
    if (!user?.uid || !entry) {
      setHistoryEntries([]);
      setSelectedHistoryId(null);
      setHistoryError('Faça login para acessar o histórico.');
      setIsHistoryModalOpen(true);
      return;
    }

    setIsHistoryModalOpen(true);
    setIsLoadingHistory(true);
    setHistoryError(null);
    setHistoryActionError(null);
    setHistoryMenuReportId(null);
    try {
      const entries = await getLatestAgentReportsFromDb(user.uid, entry.slug, 10);
      setHistoryEntries(entries);
      setSelectedHistoryId(entries[0]?.id ?? null);
    } catch (error) {
      console.error('Erro ao abrir histórico do agente:', error);
      setHistoryEntries([]);
      setSelectedHistoryId(null);
      setHistoryError('Não foi possível carregar o histórico neste momento.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleDeleteHistoryEntry = async (reportId: string) => {
    if (!user?.uid) {
      setHistoryActionError('Faça login para excluir relatórios.');
      return;
    }

    const shouldDelete = window.confirm('Deseja realmente excluir este relatório do histórico?');
    if (!shouldDelete) return;

    setHistoryActionError(null);
    setHistoryMenuReportId(null);
    setDeletingReportId(reportId);
    try {
      const deleteResult = await deleteAgentReportFromDb(user.uid, reportId);
      if (!deleteResult.success) {
        throw new Error(deleteResult.error || 'Falha ao excluir relatório.');
      }

      setHistoryEntries((prev) => {
        const next = prev.filter((entry) => entry.id !== reportId);
        setSelectedHistoryId((current) => {
          if (current !== reportId) return current;
          return next[0]?.id ?? null;
        });
        return next;
      });
    } catch (error) {
      console.error('Erro ao excluir relatório do histórico:', error);
      setHistoryActionError('Não foi possível excluir este relatório agora. Tente novamente.');
    } finally {
      setDeletingReportId(null);
    }
  };

  useEffect(() => {
    if (!historyMenuReportId) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest('[data-history-menu-root="true"]')) return;
      setHistoryMenuReportId(null);
    };

    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [historyMenuReportId]);

  useEffect(() => {
    if (!automationSuggestions.length) return;
    setSelectedAutomationId((current) => current ?? automationSuggestions[1]?.id ?? automationSuggestions[0].id);
  }, [automationSuggestions]);

  useEffect(() => {
    if (!selectedSuggestion) return;
    setSelectedScheduleOptionId((current) => {
      const exists = selectedSuggestion.scheduleOptions.some((option) => option.id === current);
      if (exists) return current;
      return selectedSuggestion.scheduleOptions[0]?.id ?? null;
    });
  }, [selectedSuggestion]);

  useEffect(() => {
    const loadPersistedAutomation = async () => {
      if (!user || !entry || !agentAutomationKey) return;

      setIsLoadingAutomation(true);
      try {
        const db = getFirebaseDb();
        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);
        const userData = snapshot.data() as
          | { automations?: Record<string, { cadenceId?: string; status?: string; scheduleOptionId?: string }> }
          | undefined;
        const persisted = userData?.automations?.[agentAutomationKey];

        if (persisted) {
          // Support legacy records that may have `status` but no `cadenceId`.
          setAutomationActivated(persisted.status === 'active');
          if (persisted.cadenceId) {
            setSelectedAutomationId(persisted.cadenceId);
          }
          if (persisted.scheduleOptionId) {
            setSelectedScheduleOptionId(persisted.scheduleOptionId);
          }
        } else {
          setAutomationActivated(false);
        }
      } catch (error) {
        console.error('Erro ao carregar automação persistida:', error);
      } finally {
        setIsLoadingAutomation(false);
      }
    };

    loadPersistedAutomation();
  }, [agentAutomationKey, entry, user]);
  if (accessState !== 'allowed') {
    return (
      <div className="min-h-screen bg-bg-main flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        {isSyncingAccess ? (
          <div className="max-w-md rounded-2xl border border-[#FFD7BD] bg-[#FFF6EF] px-4 py-3 text-center">
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#C2410C]">Configurando seu acesso</p>
            <p className="mt-1 text-[13px] text-[#9A3412]">
              Estamos preparando seu ambiente no Hub.
            </p>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <main
      className="agent-page-button-corners flex flex-col min-h-screen bg-bg-main bg-top bg-repeat-y bg-[length:100%_auto]"
      style={{ backgroundImage: "url('/images/background_hub_repeat_flow.png')" }}
    >
      <Navbar />

      <div className="flex-grow pt-20 md:pt-28 relative">
        <div className="relative z-10 wrap py-8 md:py-12">
          {!agent || !entry ? (
            <div className="max-w-3xl mx-auto rounded-3xl border border-border bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] p-8 md:p-10">
              <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-3">Agente</p>
              <h1 className="text-3xl md:text-4xl font-black text-text-main mb-4">Agente não encontrado</h1>
              <p className="text-base text-text-muted mb-8">
                O endereço informado não corresponde a um agente válido do Hub.
              </p>
              <button
                onClick={() => router.push('/hub')}
                className="btn btn-primary px-7 py-3 rounded-full text-sm font-bold tracking-widest uppercase"
              >
                Voltar ao Hub
              </button>
            </div>
          ) : !entry.isActive ? (
            <div className="max-w-3xl mx-auto rounded-3xl border border-[#FFE4D1] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] p-8 md:p-10">
              <p className="text-xs uppercase tracking-widest text-primary font-bold mb-3">{entry.category}</p>
              <h1 className="text-3xl md:text-4xl font-black text-text-main mb-4">{entry.title}</h1>
              <p className="text-base text-text-muted mb-8">
                Este agente ainda não está ativo na sua conta. Faça a contratação no Hub para liberar a janela funcional individual.
              </p>
              <div className="mb-8 rounded-2xl border border-[#FFE4D1] bg-[#FFF8F3] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-black text-text-main">Canais necessários para operação</p>
                  <button
                    type="button"
                    onClick={() => router.push('/hub/conectores')}
                    className="rounded-full border border-[#D9E2F4] bg-[#EEF4FF] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#1D4ED8] hover:bg-[#E2ECFF]"
                  >
                    Abrir Conectores
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                  {requiredConnectors.map((connector) => (
                    <div
                      key={connector.key}
                      className={`rounded-lg border px-3 py-2 ${
                        connector.isActive
                          ? 'border-[#BDE8CF] bg-[#F2FFF7]'
                          : 'border-[#FECACA] bg-[#FFF1F2]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-black text-text-main">{connector.name}</p>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black ${
                            connector.isActive
                              ? 'border-[#BDE8CF] bg-[#F2FFF7] text-[#0A9D57]'
                              : 'border-[#FECACA] bg-[#FFF1F2] text-[#B42318]'
                          }`}
                        >
                          {connector.isActive ? 'ATIVA' : 'INATIVA'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => router.push('/hub')}
                className="btn btn-primary px-7 py-3 rounded-full text-sm font-bold tracking-widest uppercase"
              >
                Voltar ao Hub
              </button>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="rounded-[34px] p-[2px] bg-gradient-to-br from-[#3A465C] via-[#1A2536] to-[#FF6B00] shadow-[0_26px_58px_-28px_rgba(8,15,30,0.72)]">
                <div className="rounded-[32px] bg-[#0F1A2B]/95 p-[1px]">
                  <div className="rounded-[30px] border border-[#26344A] bg-[#0B1422] p-6 md:p-8 min-h-[220px] md:min-h-[300px]">
                    <div className="flex flex-col md:flex-row md:items-stretch md:justify-between gap-6">
                      <div className="flex-1">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-[#FF9A4D] font-bold mb-2">{entry.category}</p>
                          <h1 className="text-3xl md:text-4xl font-black text-white">{entry.title}</h1>
                          {heroDescription ? <p className="mt-4 max-w-[760px] text-[13px] leading-relaxed text-[#C8D3E6] [&_strong]:text-white">{heroDescription}</p> : null}
                          <div className="mt-6 flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setAutomationNotice(null);
                                setIsAutomationModalOpen(true);
                              }}
                              className={`px-6 py-3 rounded-full border text-white font-bold tracking-widest text-sm uppercase transition-all ${
                                automationActivated
                                  ? 'border-[#08B760] bg-[#08B760] shadow-[0_10px_22px_rgba(8,183,96,0.3)] hover:brightness-105'
                                  : 'border-[#FF6B00] bg-[#FF6B00] shadow-[0_10px_22px_rgba(255,107,0,0.3)] hover:brightness-105'
                              }`}
                            >
                              {entry.title === 'Gerador de Copies de Conversão'
                                ? 'Ativar Agente'
                                : automationActivated
                                  ? entry.title === 'Auditor de Desperdício' || entry.title === 'Otimizador de Orçamento' || entry.title === 'Gerador de Criativos' || entry.title === 'Análise Viral' || entry.title === 'Preditor de Funil' || entry.title === 'Diagnóstico de Landing Page'
                                    ? 'Agente Ativo'
                                    : 'Automação Ativa'
                                  : entry.title === 'Auditor de Desperdício' || entry.title === 'Otimizador de Orçamento' || entry.title === 'Gerador de Criativos' || entry.title === 'Análise Viral' || entry.title === 'Preditor de Funil' || entry.title === 'Diagnóstico de Landing Page'
                                    ? 'Ativar Agente'
                                    : 'Ativar Automação'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                void openHistoryModal();
                              }}
                              className="px-6 py-3 rounded-full border border-[#30405A] text-[#DCE7FF] bg-[#172438] font-bold tracking-widest text-sm uppercase hover:bg-[#22344F] transition-colors"
                            >
                              <History size={14} className="inline mr-2 -mt-[2px]" />
                              Histórico
                            </button>
                            <button
                              onClick={() => router.push('/hub')}
                              className="px-6 py-3 rounded-full border border-[#30405A] text-[#F1F5FF] bg-transparent font-bold tracking-widest text-sm uppercase hover:bg-[#1B2940] transition-colors"
                            >
                              Voltar ao Hub
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-start self-start gap-3 md:min-w-[280px]">
                        <div className="w-[168px] h-[168px] rounded-[24px] p-[3px] bg-gradient-to-br from-[#FF6B00] via-[#FF8F1F] to-[#B83A00] shadow-[0_0_0_1px_rgba(255,107,0,0.7),0_14px_28px_rgba(255,107,0,0.26)]">
                          <div className="relative w-full h-full rounded-[20px] overflow-hidden bg-[#101A2B]">
                            <Image src={agent.icon} alt={entry.title} fill className="object-cover" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <section className="rounded-[30px] p-[2px] bg-gradient-to-br from-white/40 via-orange-300/70 to-[#FF6B00] shadow-[0_18px_44px_-28px_rgba(255,107,0,0.38)]">
                <div className="rounded-[28px] bg-white/90 p-[1px]">
                  <div className="rounded-[26px] border border-[#FFF1E8] bg-white px-6 py-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-primary font-bold">Canais Necessários</p>
                        <h2 className="mt-1 text-lg font-black text-text-main">Status operacional deste agente</h2>
                        <p className="mt-1 text-sm text-text-muted">
                          As conexões são gerenciadas exclusivamente na janela <strong>Conectores</strong>.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => router.push('/hub/conectores')}
                        className="rounded-full border border-[#D9E2F4] bg-[#EEF4FF] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#1D4ED8] hover:bg-[#E2ECFF]"
                      >
                        Abrir Conectores
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {requiredConnectors.map((connector) => (
                        <div
                          key={connector.key}
                          className={`rounded-xl border px-4 py-3 ${
                            connector.isActive
                              ? 'border-[#BDE8CF] bg-[#F2FFF7]'
                              : 'border-[#FECACA] bg-[#FFF1F2]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-black text-text-main">{connector.name}</p>
                              <p className="text-xs text-text-muted">{connector.source}</p>
                            </div>
                            <span
                              className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-black ${
                                connector.isActive
                                  ? 'border-[#BDE8CF] bg-[#F2FFF7] text-[#0A9D57]'
                                  : 'border-[#FECACA] bg-[#FFF1F2] text-[#B42318]'
                              }`}
                            >
                              {connector.isActive ? 'ATIVA' : 'INATIVA'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 gap-6">
                {entry.title === 'SEO & GEO' ? (
                  <div className="col-span-1">
                    <SeoGeoWorkspace agentTitle={entry.title} agentSlug={entry.slug} agentCategory={entry.category} />
                  </div>
                ) : entry.title === 'Analista de Tráfego' ? (
                  <div className="col-span-1">
                    <TrafficAnalystWorkspace
                      userId={user?.uid}
                      agentSlug={entry.slug}
                      agentTitle={entry.title}
                      agentCategory={entry.category}
                    />
                  </div>
                ) : entry.title === 'Simulador de ROAS' ? (
                  <div className="col-span-1">
                    <RoasSimulatorWorkspace
                      userId={user?.uid}
                      agentSlug={entry.slug}
                      agentTitle={entry.title}
                      agentCategory={entry.category}
                    />
                  </div>
                ) : entry.title === 'Preditor de Funil' ? (
                  <div className="col-span-1">
                    <FunnelPredictorWorkspace
                      userId={user?.uid}
                      agentSlug={entry.slug}
                      agentTitle={entry.title}
                      agentCategory={entry.category}
                    />
                  </div>
                ) : entry.title === 'Auditor de Desperdício' ? (
                  <div className="col-span-1">
                    <WasteAuditorWorkspace
                      userId={user?.uid}
                      agentSlug={entry.slug}
                      agentTitle={entry.title}
                      agentCategory={entry.category}
                    />
                  </div>
                ) : entry.title === 'Otimizador de Orçamento' ? (
                  <div className="col-span-1">
                    <BudgetOptimizerWorkspace
                      userId={user?.uid}
                      agentSlug={entry.slug}
                      agentTitle={entry.title}
                      agentCategory={entry.category}
                    />
                  </div>
                ) : entry.title === 'Gerador de Criativos' ? (
                  <div className="col-span-1">
                    <CreativeGeneratorWorkspace
                      userId={user?.uid}
                      agentSlug={entry.slug}
                      agentTitle={entry.title}
                      agentCategory={entry.category}
                    />
                  </div>
                ) : entry.title === 'Gerador de Copies de Conversão' ? (
                  <div className="col-span-1">
                    <ConversionCopyWorkspace
                      userId={user?.uid}
                      agentSlug={entry.slug}
                      agentTitle={entry.title}
                      agentCategory={entry.category}
                    />
                  </div>
                ) : entry.title === 'Análise Viral' ? (
                  <div className="col-span-1">
                    <CreativeAnalysisWorkspace
                      userId={user?.uid}
                      agentSlug={entry.slug}
                      agentTitle={entry.title}
                      agentCategory={entry.category}
                    />
                  </div>
                ) : entry.title === 'Diagnóstico de Landing Page' ? (
                  <div className="col-span-1">
                    <LandingPageDiagnosisWorkspace
                      userId={user?.uid}
                      agentSlug={entry.slug}
                      agentTitle={entry.title}
                      agentCategory={entry.category}
                    />
                  </div>
                ) : entry.title === 'DNA da Marca' ? (
                  <div className="col-span-1">
                    <DnaBrandWorkspace
                      userId={user?.uid}
                      agentSlug={entry.slug}
                      agentTitle={entry.title}
                      agentCategory={entry.category}
                    />
                  </div>
                ) : (
                  <div className="col-span-1">
                    <GenericAgentWorkspace
                      key={`${user?.uid ?? 'anon'}-${entry.slug}`}
                      userId={user?.uid}
                      agentTitle={entry.title}
                      category={entry.category}
                      description={agent.longDescription}
                      monthlyLimit={entry.planSummary?.monthlyLimit}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {entry && isAutomationModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden px-4 py-4">
          <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm" onClick={() => setIsAutomationModalOpen(false)} />

          <div className="relative w-full max-w-[1120px] rounded-[26px] p-[2px] bg-gradient-to-br from-white/40 via-orange-300/80 to-[#FF6B00] shadow-[0_22px_56px_rgba(15,23,42,0.3)] sm:rounded-[32px]">
            <div className="rounded-[30px] bg-white/90 p-[1px]">
              <div className="rounded-[28px] border border-[#FFF1E8] bg-white p-5 md:p-6">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-primary font-bold mb-1">Automação Inteligente</p>
                    <h3 className="text-2xl md:text-[2rem] font-black text-text-main">Ativar Rotina do Agente</h3>
                    <p className="text-sm text-text-muted mt-2">
                      Selecione uma cadência para <strong>{entry.title}</strong>, respeitando o plano atual e o limite contratado.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAutomationModalOpen(false)}
                    className="p-2 rounded-full border border-border text-text-muted hover:text-text-main hover:bg-bg-secondary transition-colors"
                    aria-label="Fechar modal de automação"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="mb-3 rounded-xl border border-[#E3E8EF] bg-[#F8FAFC] px-4 py-2.5 text-sm text-text-muted">
                  Plano: <strong className="text-text-main">{entry.planSummary?.planName ?? 'A confirmar'}</strong> • Limite mensal:{' '}
                  <strong className="text-text-main">{entry.planSummary?.monthlyLimit ?? 0} execuções</strong>
                </div>
                {isLoadingAutomation && (
                  <div className="mb-3 rounded-xl border border-[#E3E8EF] bg-white px-4 py-2.5 text-sm text-text-muted">
                    Carregando configuração de automação salva...
                  </div>
                )}
                {inactiveRequiredConnectors.length > 0 && (
                  <div className="mb-3 rounded-xl border border-[#FFE1CF] bg-[#FFF8F3] px-4 py-2.5 text-sm text-[#B45309]">
                    Para ativar esta automação, conecte primeiro: {inactiveRequiredConnectors.map((connector) => connector.name).join(', ')}.
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {automationSuggestions.map((option) => {
                    const isSelected = selectedAutomationId === option.id;
                    return (
                      <div
                        key={option.id}
                        onClick={() => setSelectedAutomationId(option.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setSelectedAutomationId(option.id);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className={`w-full cursor-pointer text-left rounded-2xl border p-3 transition-all ${
                          isSelected
                            ? 'border-[#FFBE94] bg-[#FFF7F1] shadow-[0_10px_24px_rgba(255,107,0,0.14)]'
                            : 'border-[#E3E8EF] bg-[#FBFCFE] hover:border-[#FFD1B3] hover:bg-white'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[1rem] font-bold text-text-main">{option.title}</p>
                          <span className="inline-flex items-center rounded-full border border-[#CDE7D9] bg-[#F2FFF7] px-3 py-1 text-xs font-bold text-[#0A9D57]">
                            {option.monthlyExecutions} execuções/mês
                          </span>
                        </div>
                        <p className={`mt-2 text-sm text-text-muted ${isSelected ? '' : 'truncate'}`}>{option.objective}</p>
                        <p className="mt-2 text-xs text-text-dim">
                          Cadência: <strong className="text-text-main">{option.cadence}</strong>
                        </p>
                        {isSelected ? <p className="mt-1 text-xs text-text-dim">{option.distribution}</p> : null}
                        {isSelected ? (
                          <div className="mt-3 rounded-xl border border-[#FFE1CF] bg-white p-3">
                            <p className="text-[11px] font-black uppercase tracking-widest text-[#B45309]">
                              Sugestões de dias e horários
                            </p>
                            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                              {option.scheduleOptions.map((schedule) => {
                                const isScheduleSelected = selectedScheduleOptionId === schedule.id;
                                return (
                                  <button
                                    key={schedule.id}
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setSelectedScheduleOptionId(schedule.id);
                                    }}
                                    className={`cursor-pointer rounded-lg border px-3 py-2 text-left transition-all ${
                                      isScheduleSelected
                                        ? 'border-[#FF9A63] bg-[#FFF4EC] shadow-[0_8px_16px_rgba(255,107,0,0.12)]'
                                        : 'border-[#E4EAF2] bg-white hover:border-[#FFC7A2]'
                                    }`}
                                  >
                                    <p className="text-xs font-black text-text-main">{schedule.label}</p>
                                    <p className="mt-1 text-[11px] leading-snug text-text-dim">{schedule.detail}</p>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAutomationModalOpen(false)}
                    className="px-5 py-2.5 rounded-full border border-border text-text-muted font-bold tracking-wide text-sm hover:bg-bg-secondary transition-colors"
                  >
                    Fechar
                  </button>

                  <button
                    type="button"
                    disabled={!selectedSuggestion || !selectedScheduleOption || inactiveRequiredConnectors.length > 0}
                    onClick={async () => {
                      if (!selectedSuggestion || !selectedScheduleOption || !user || !entry || !agentAutomationKey) return;
                      if (inactiveRequiredConnectors.length > 0) {
                        setAutomationNotice(
                          `Conecte os canais obrigatórios antes de confirmar: ${inactiveRequiredConnectors
                            .map((connector) => connector.name)
                            .join(', ')}.`
                        );
                        return;
                      }

                      const shouldConfirm = window.confirm(
                        `Confirmar programação para ${entry.title}?\n\nCadência: ${selectedSuggestion.title}\nAgenda sugerida: ${selectedScheduleOption.label}`
                      );
                      if (!shouldConfirm) return;

                      setIsSavingAutomation(true);
                      setAutomationNotice(null);
                      try {
                        const timestamps = buildAutomationTimestamps({
                          cadence: selectedSuggestion.cadence,
                          monthlyExecutions: selectedSuggestion.monthlyExecutions,
                          scheduleOptionLabel: selectedScheduleOption.label,
                        });
                        const db = getFirebaseDb();
                        const userRef = doc(db, 'users', user.uid);
                        const payload = {
                          [`automations.${agentAutomationKey}`]: {
                            status: 'active',
                            agentTitle: entry.title,
                            agentCategory: entry.category,
                            cadenceId: selectedSuggestion.id,
                            cadenceTitle: selectedSuggestion.title,
                            cadence: selectedSuggestion.cadence,
                            monthlyExecutions: selectedSuggestion.monthlyExecutions,
                            distribution: selectedSuggestion.distribution,
                            objective: selectedSuggestion.objective,
                            scheduleOptionId: selectedScheduleOption.id,
                            scheduleOptionLabel: selectedScheduleOption.label,
                            scheduleOptionDetail: selectedScheduleOption.detail,
                            planName: entry.planSummary?.planName ?? null,
                            monthlyLimit: entry.planSummary?.monthlyLimit ?? null,
                            activatedAt: Date.now(),
                            updatedAt: Date.now(),
                            lastUpdateAt: timestamps.lastUpdateAt,
                            nextUpdateAt: timestamps.nextUpdateAt,
                          },
                        };

                        await setDoc(userRef, payload, { merge: true });
                        setAutomationActivated(true);
                        setAutomationNotice('Programação salva com sucesso no seu perfil.');
                        setIsAutomationModalOpen(false);
                      } catch (error) {
                        console.error('Erro ao salvar automação:', error);
                        setAutomationActivated(false);
                        setAutomationNotice('Falha ao salvar automação. Tente novamente.');
                      } finally {
                        setIsSavingAutomation(false);
                      }
                    }}
                    className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all ${
                      selectedSuggestion && !isSavingAutomation && inactiveRequiredConnectors.length === 0
                        ? 'bg-gradient-to-br from-[#08B760] to-[#0A9D57] text-white shadow-[0_10px_22px_rgba(8,183,96,0.3)] hover:brightness-105'
                        : 'bg-[#E2E8F0] text-[#64748B] cursor-not-allowed'
                    }`}
                  >
                    <Sparkles size={15} />
                    {isSavingAutomation ? 'Salvando...' : 'Confirmar Automação'}
                  </button>
                </div>

                {automationActivated && selectedSuggestion && (
                  <div className="mt-4 rounded-xl border border-[#B9EBD1] bg-[#F2FFF7] px-4 py-3 text-sm text-[#0A9D57] flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                    <span>
                      Automação ativada com a configuração <strong>{selectedSuggestion.title}</strong> para o agente{' '}
                      <strong>{entry.title}</strong>.
                      {selectedScheduleOption ? (
                        <>
                          {' '}
                          Agenda selecionada: <strong>{selectedScheduleOption.label}</strong>.
                        </>
                      ) : null}
                    </span>
                  </div>
                )}
                {automationNotice && !automationActivated && (
                  <div className="mt-4 rounded-xl border border-[#FFD2B5] bg-[#FFF7F1] px-4 py-3 text-sm text-[#B45309]">
                    {automationNotice}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {entry && isHistoryModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto px-4 py-6 sm:items-center">
          <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm" onClick={() => setIsHistoryModalOpen(false)} />

          <div className="relative w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-[26px] p-[2px] bg-gradient-to-br from-white/40 via-orange-300/80 to-[#FF6B00] shadow-[0_22px_56px_rgba(15,23,42,0.3)] sm:rounded-[32px]">
            <div className="rounded-[30px] bg-white/90 p-[1px] h-full">
              <div className="rounded-[28px] border border-[#FFF1E8] bg-white h-full flex flex-col">
                <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-5 border-b border-[#F1F5F9]">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-primary font-bold mb-1">{entry.category}</p>
                    <h3 className="text-2xl md:text-3xl font-black text-text-main">Histórico de Relatórios</h3>
                    <p className="text-sm text-text-muted mt-2">
                      Últimos 10 relatórios do agente <strong>{entry.title}</strong>, prontos para visualização e download.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsHistoryModalOpen(false)}
                    className="p-2 rounded-full border border-border text-text-muted hover:text-text-main hover:bg-bg-secondary transition-colors"
                    aria-label="Fechar histórico"
                  >
                    <X size={18} />
                  </button>
                </div>

                {isLoadingHistory ? (
                  <div className="px-6 py-10">
                    <div className="rounded-2xl border border-[#E3E8EF] bg-[#F8FAFC] px-5 py-6 text-sm text-text-muted">
                      Carregando histórico...
                    </div>
                  </div>
                ) : historyError ? (
                  <div className="px-6 py-10">
                    <div className="rounded-2xl border border-[#FFE1CF] bg-[#FFF8F3] px-5 py-6 text-sm text-[#B45309]">
                      {historyError}
                    </div>
                  </div>
                ) : historyEntries.length === 0 ? (
                  <div className="px-6 py-10">
                    <div className="rounded-2xl border border-[#E3E8EF] bg-[#F8FAFC] px-5 py-6 text-sm text-text-muted">
                      Ainda não existem relatórios salvos neste agente. Gere um relatório para iniciar o histórico.
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-0 min-h-0 flex-1">
                    <aside className="border-r border-[#EEF2F7] p-4 overflow-y-auto">
                      {historyActionError ? (
                        <div className="mb-3 rounded-xl border border-[#FFE1CF] bg-[#FFF8F3] px-3 py-2 text-xs font-semibold text-[#B45309]">
                          {historyActionError}
                        </div>
                      ) : null}
                      <div className="space-y-3">
                        {historyEntries.map((item, index) => {
                          const isSelected = selectedHistoryEntry?.id === item.id;
                          const websiteUrl =
                            typeof item.metadata?.websiteUrl === 'string' ? item.metadata.websiteUrl : '';
                          const cleanedUrl = websiteUrl ? websiteUrl.replace(/^https?:\/\//i, '') : '';
                          const isDeletingCurrent = deletingReportId === item.id;
                          return (
                            <div
                              key={item.id}
                              data-history-menu-root="true"
                              className={`w-full rounded-2xl border p-4 text-left transition-all ${
                                isSelected
                                  ? 'border-[#FFBE94] bg-[#FFF7F1] shadow-[0_10px_24px_rgba(255,107,0,0.14)]'
                                  : 'border-[#E3E8EF] bg-[#FBFCFE] hover:border-[#FFD1B3] hover:bg-white'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-text-dim">Relatório {historyEntries.length - index}</p>
                                <div className="relative">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setHistoryMenuReportId((current) => (current === item.id ? null : item.id))
                                    }
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#DCE4EE] bg-white text-[#667085] hover:bg-[#F8FAFC]"
                                    aria-label="Abrir menu de ações do relatório"
                                  >
                                    <MoreVertical size={14} />
                                  </button>

                                  {historyMenuReportId === item.id ? (
                                    <div className="absolute right-0 top-9 z-20 min-w-[148px] overflow-hidden rounded-xl border border-[#E3E8EF] bg-white shadow-[0_16px_28px_rgba(15,23,42,0.14)]">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedHistoryId(item.id);
                                          setHistoryMenuReportId(null);
                                        }}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-[#1D4ED8] hover:bg-[#EEF4FF]"
                                      >
                                        <Eye size={13} />
                                        Visualizar
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          void downloadAgentReport(item);
                                          setHistoryMenuReportId(null);
                                        }}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-[#0A9D57] hover:bg-[#EEFDF5]"
                                      >
                                        <Download size={13} />
                                        Download
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          void handleDeleteHistoryEntry(item.id);
                                        }}
                                        disabled={isDeletingCurrent}
                                        className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold ${
                                          isDeletingCurrent
                                            ? 'cursor-not-allowed text-[#B42318] bg-[#FFF4F6]'
                                            : 'text-[#B42318] hover:bg-[#FFF1F3]'
                                        }`}
                                      >
                                        <Trash2 size={13} />
                                        {isDeletingCurrent ? 'Excluindo...' : 'Excluir'}
                                      </button>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                              <p className="mt-2 text-sm font-bold text-text-main break-all">{item.reportTitle || cleanedUrl}</p>
                              <p className="mt-1 text-xs text-text-muted">{formatHistoryDate(item.generatedAt)}</p>
                              {item.metadata?.websiteUrl ? (
                                <p className="mt-2 text-xs text-text-dim line-clamp-2">{String(item.metadata.websiteUrl)}</p>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </aside>

                    <section className="p-5 md:p-6 overflow-y-auto">
                      {selectedHistoryEntry ? (
                        <div className="space-y-4">
                          <div className="rounded-2xl border border-[#E3E8EF] bg-[#FBFCFE] p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-text-dim">Agente</p>
                                <p className="mt-1 font-semibold text-text-main break-all">{selectedHistoryEntry.agentTitle}</p>
                              </div>
                              <div>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-text-dim">Gerado em</p>
                                <p className="mt-1 font-semibold text-text-main">{formatHistoryDate(selectedHistoryEntry.generatedAt)}</p>
                              </div>
                            </div>
                            {selectedHistoryEntry.metadata?.websiteUrl ? (
                              <div className="mt-4">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-text-dim">Referência</p>
                                <p className="mt-1 text-sm text-text-main break-all">{String(selectedHistoryEntry.metadata.websiteUrl)}</p>
                              </div>
                            ) : null}
                            {selectedHistoryEntry.metadata?.businessContext ? (
                              <div className="mt-4">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-text-dim">Contexto informado</p>
                                <p className="mt-1 text-sm text-text-main">{String(selectedHistoryEntry.metadata.businessContext)}</p>
                              </div>
                            ) : null}
                          </div>

                          <article className="rounded-2xl border border-[#E7ECF3] bg-[#FBFCFE] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                              <h4 className="text-base font-black text-text-main">Resultado Completo</h4>
                              <button
                                type="button"
                                onClick={() => {
                                  void downloadAgentReport(selectedHistoryEntry);
                                }}
                                className="inline-flex items-center gap-2 rounded-full border border-[#B5E8CB] bg-gradient-to-br from-[#08B760] to-[#0A9D57] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-[0_10px_24px_rgba(8,183,96,0.3)] transition-all hover:brightness-105"
                              >
                                <Download size={14} />
                                Download
                              </button>
                            </div>
                            {dnaHistoryPayload ? (
                              <DnaBrandPresentationPanel
                                presentation={dnaHistoryPayload.presentation}
                                sources={dnaHistoryPayload.sources}
                                generatedAt={selectedHistoryEntry.generatedAt}
                              />
                            ) : (
                              <pre className="whitespace-pre-wrap break-words text-[13px] leading-relaxed text-text-main font-sans">
                                {selectedHistoryEntry.reportContent}
                              </pre>
                            )}
                          </article>
                        </div>
                      ) : null}
                    </section>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="[&>footer]:!bg-transparent [&>footer]:!backdrop-blur-none">
        <Footer />
      </div>
      <LuccaHubSupportWidget />
    </main>
  );
}
