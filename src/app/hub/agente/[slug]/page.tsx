'use client';

import { useMemo, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle2, Download, Eye, History, MoreVertical, Sparkles, Trash2, X } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import DnaBrandWorkspace, { DnaBrandPresentationPanel } from '../../../../components/agents/DnaBrandWorkspace';
import GenericAgentWorkspace from '../../../../components/agents/GenericAgentWorkspace';
import { getWorkspaceForAgent } from '../../../../lib/agent-workspace-registry';
import { useAuth } from '../../../../context/AuthContext';
import type { DnaBrandPresentation, DnaBrandSource } from '../../../actions/dna-brand';
import {
  getAgentBySlug,
  getAgentEntryDefinition,
  getContractedAgentsFromProfile,
  slugifyAgentTitle,
} from '../../../../lib/hub-agents';
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
function getAgentHeroDescription(agent: Agent | undefined): React.ReactNode | null {
  if (!agent?.heroDescription) return null;
  const match = agent.title === 'Agente Editorial' 
    ? `O <strong className="text-text-main">${agent.title}</strong> `
    : `O agente <strong className="text-text-main">${agent.title}</strong> `;

  return (
    <>
      <span dangerouslySetInnerHTML={{ __html: match }} />
      {agent.heroDescription}
    </>
  );
}

function getRequiredConnectorKeysForAgent(agent: Agent | undefined): ConnectorKey[] {
  if (agent?.requiredConnectors && agent.requiredConnectors.length > 0) {
    return agent.requiredConnectors;
  }
  // Fallbacks if not specified
  if (agent?.category === 'Performance') return ['googleAds', 'metaAds', 'linkedinAds', 'ga4'];
  if (agent?.category === 'Criativos') return ['googleAds', 'metaAds', 'ga4'];
  if (agent?.category === 'Técnico') return ['ga4', 'serverTracking', 'warehouse'];
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
  const { user, profile } = useAuth();
  const router = useRouter();
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
  const heroDescription = useMemo(() => getAgentHeroDescription(entry), [entry]);
  const connectorStatus = useMemo(() => getConnectionStatusFromProfile(profile), [profile]);
  const requiredConnectorKeys = useMemo(
    () => getRequiredConnectorKeysForAgent(entry),
    [entry]
  );
  const requiredConnectors = useMemo(() => {
    if (!entry) return [];
    return requiredConnectorKeys.map((key) => {
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

  return (
    <div className="w-full space-y-6 text-white">
      <div className="relative">
        <div className="relative z-10 py-6">
          {!agent || !entry ? (
            <div className="max-w-3xl mx-auto rounded-3xl border border-white/[0.10] bg-[#0c213a]/60 backdrop-blur-xl p-8 md:p-10 shadow-[0_8px_32px_rgba(2,8,22,0.4)] text-center text-white">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold mb-3">Agente</p>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-4">Agente não encontrado</h1>
              <p className="text-base text-slate-300 mb-8">
                O endereço informado não corresponde a um agente válido do Hub.
              </p>
              <button
                onClick={() => router.push('/hub')}
                className="inline-flex h-11 items-center justify-center rounded-[12px] border border-white/10 bg-white/5 px-6 text-sm font-black text-white/80 hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95 transition-all shadow-sm"
              >
                Voltar ao Hub
              </button>
            </div>
          ) : !entry.isActive ? (
            <div className="max-w-3xl mx-auto rounded-3xl border border-white/[0.10] bg-[#0c213a]/60 backdrop-blur-xl p-8 md:p-10 shadow-[0_8px_32px_rgba(2,8,22,0.4)] text-white">
              <p className="text-xs uppercase tracking-widest text-[#FF6B00] font-bold mb-3">{entry.category}</p>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-4">{entry.title}</h1>
              <p className="text-base text-slate-300 mb-8">
                Este agente ainda não está ativo na sua conta. Faça a contratação no Hub para liberar a janela funcional individual.
              </p>
              <div className="mb-8 rounded-2xl border border-white/[0.08] bg-[#051120]/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-black text-white">Canais necessários para operação</p>
                  <button
                    type="button"
                    onClick={() => router.push('/hub/conectores')}
                    className="rounded-full border border-slate-500/20 bg-slate-900/30 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-400 hover:bg-slate-900/50 hover:text-white transition-all"
                  >
                    Abrir Conectores
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                  {requiredConnectors.map((connector) => (
                    <div
                      key={connector.key}
                      className={`rounded-full border px-5 py-2.5 ${
                        connector.isActive
                           ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400'
                           : 'border-red-500/30 bg-red-950/20 text-red-400'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-black text-white">{connector.name}</p>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black ${
                            connector.isActive
                              ? 'border-emerald-500/20 bg-emerald-950/30 text-emerald-400'
                              : 'border-red-500/30 bg-red-950/30 text-red-400'
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
                className="inline-flex h-11 items-center justify-center rounded-[12px] border border-white/10 bg-white/5 px-6 text-sm font-black text-white/80 hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95 transition-all shadow-sm"
              >
                Voltar ao Hub
              </button>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-6">
              <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-4 mb-6">
                <div className="flex items-start lg:items-center gap-4">
                  <div className="shrink-0 w-16 h-16 rounded-[16px] p-[2px] bg-gradient-to-br from-[#FF6B00] via-[#FF8F1F] to-[#B83A00] shadow-[0_4px_12px_rgba(255,107,0,0.26)]">
                    <div className="relative w-full h-full rounded-[14px] overflow-hidden bg-[#101A2B]">
                      <Image src={agent.icon} alt={entry.title} fill className="object-cover" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-white leading-none">
                      {entry.title}
                    </h1>
                    <p className="text-[12px] font-semibold text-[#FF9A4D] mt-1 uppercase tracking-widest">
                      {entry.category}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAutomationNotice(null);
                      setIsAutomationModalOpen(true);
                    }}
                    className={`h-11 px-5 rounded-xl border text-[13px] font-black uppercase tracking-wider transition shadow-sm ${
                      automationActivated
                        ? 'border-[#08B760] bg-[#08B760]/10 text-[#08B760] hover:bg-[#08B760]/20'
                        : 'border-[#FF6B00] bg-[#FF6B00] text-white hover:brightness-105'
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
                    className="h-11 px-5 rounded-xl border border-white/10 bg-white/5 text-[13px] font-black uppercase tracking-wider text-white hover:bg-white/10 transition shadow-sm"
                  >
                    <History size={14} className="inline mr-2 -mt-[2px]" />
                    Histórico
                  </button>
                  <button
                    onClick={() => router.push('/hub')}
                    className="h-11 px-5 rounded-xl border border-white/10 bg-transparent text-[13px] font-black uppercase tracking-wider text-white/80 hover:bg-white/5 transition shadow-sm"
                  >
                    Voltar ao Hub
                  </button>
                </div>
              </header>

              {heroDescription ? (
                <div className="rounded-[24px] border border-white/[0.10] bg-[#071a2e]/82 p-6 backdrop-blur-xl shadow-[0_8px_32px_rgba(2,8,22,0.4)]">
                  <p className="max-w-[800px] text-[14px] leading-relaxed text-[#C8D3E6] [&_strong]:text-white">
                    {heroDescription}
                  </p>
                </div>
              ) : null}

              <section className="relative overflow-hidden rounded-3xl border border-white/[0.10] bg-[#071a2e]/82 shadow-[0_8px_32px_rgba(2,8,22,0.4)] text-white">
                <div className="px-6 py-5 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-4 bg-[#091624]">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs uppercase tracking-widest text-[#FF6B00] font-bold">Canais Necessários</p>
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Status operacional deste agente</h2>
                    <p className="text-xs font-semibold text-slate-300">
                      As conexões são gerenciadas exclusivamente na janela <strong>Conectores</strong>.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push('/hub/conectores')}
                    className="rounded-full border border-slate-500/20 bg-slate-900/30 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-400 hover:bg-slate-900/50 hover:text-white transition-all"
                  >
                    Abrir Conectores
                  </button>
                </div>

                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {requiredConnectors.map((connector) => (
                      <div
                        key={connector.key}
                        className={`rounded-[24px] border p-4 transition-all duration-200 ${
                          connector.isActive
                            ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400'
                            : 'border-red-500/30 bg-red-950/20 text-red-400'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-white">{connector.name}</p>
                            <p className="text-xs text-slate-400">{connector.source}</p>
                          </div>
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-black ${
                              connector.isActive
                                ? 'border-emerald-500/20 bg-emerald-950/30 text-emerald-400'
                                : 'border-red-500/20 bg-red-950/30 text-red-400'
                            }`}
                          >
                            {connector.isActive ? 'ATIVA' : 'INATIVA'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <div className="grid grid-cols-1 gap-6">
                {(() => {
                  // ── Registry lookup: O(1) — adicionar novo agente = 2 linhas em agent-workspace-registry.ts
                  const WorkspaceComponent = getWorkspaceForAgent(entry.title);
                  const workspaceProps = {
                    userId: user?.uid,
                    agentSlug: entry.slug,
                    agentTitle: entry.title,
                    agentCategory: entry.category,
                  };

                  if (WorkspaceComponent) {
                    return (
                      <div className="col-span-1">
                        <WorkspaceComponent {...workspaceProps} />
                      </div>
                    );
                  }

                  // Fallback: agente sem workspace específico
                  return (
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
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {entry && isAutomationModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden px-4 py-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setIsAutomationModalOpen(false)} />

          <div className="relative w-full max-w-[1120px] max-h-[96vh] rounded-[24px] bg-[#071a2e]/98 border border-white/[0.12] shadow-[0_24px_60px_rgba(2,8,22,0.6)] overflow-hidden animate-in fade-in zoom-in-95 duration-250 text-white flex flex-col">
            <div className="relative border-b border-white/[0.08] bg-[#091624] px-6 py-5 flex flex-col gap-1 shrink-0">
              <p className="text-xs uppercase tracking-widest text-[#FF6B00] font-bold">Automação Inteligente</p>
              <h3 className="text-2xl font-black text-white">Ativar Rotina do Agente</h3>
              <p className="text-xs font-semibold text-slate-300 mt-1">
                Selecione uma cadência para <strong>{entry.title}</strong>, respeitando o plano atual e o limite contratado.
              </p>
              <button
                type="button"
                onClick={() => setIsAutomationModalOpen(false)}
                className="absolute right-5 top-5 rounded-full border border-white/10 bg-white/5 p-2 text-white/80 transition-all hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95 shadow-sm z-50"
                aria-label="Fechar modal de automação"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-slate-300">
                Plano: <strong className="text-white">{entry.planSummary?.planName ?? 'A confirmar'}</strong> • Limite mensal:{' '}
                <strong className="text-white">{entry.planSummary?.monthlyLimit ?? 0} execuções</strong>
              </div>
              {isLoadingAutomation && (
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-slate-300">
                  Carregando configuração de automação salva…
                </div>
              )}
              {inactiveRequiredConnectors.length > 0 && (
                <div className="rounded-xl border border-orange-500/30 bg-orange-950/20 px-4 py-3 text-sm text-orange-400">
                  Para ativar esta automação, conecte primeiro: {inactiveRequiredConnectors.map((connector) => connector.name).join(', ')}.
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                      className={`w-full cursor-pointer text-left rounded-2xl border p-4 transition-all duration-200 ${
                        isSelected
                          ? 'border-[#FF7A00]/50 bg-[#FF7A00]/10 shadow-[0_8px_24px_rgba(255,122,0,0.15)] text-white'
                          : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] text-slate-300'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-base font-black text-white">{option.title}</p>
                        <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-950/30 px-3 py-1 text-xs font-bold text-emerald-400">
                          {option.monthlyExecutions} execuções/mês
                        </span>
                      </div>
                      <p className={`mt-2 text-xs leading-relaxed ${isSelected ? 'text-slate-200' : 'text-slate-400 line-clamp-2'}`}>{option.objective}</p>
                      <p className="mt-3 text-xs text-slate-400">
                        Cadência: <strong className="text-white">{option.cadence}</strong>
                      </p>
                      {isSelected ? <p className="mt-1.5 text-xs text-slate-400">{option.distribution}</p> : null}
                      {isSelected ? (
                        <div className="mt-4 rounded-xl border border-white/[0.08] bg-[#051120]/60 p-3.5 space-y-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#FF7A00]">
                            Sugestões de dias e horários
                          </p>
                          <div className="mt-2 grid grid-cols-1 gap-2">
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
                                  className={`cursor-pointer rounded-xl border p-3 text-left transition-all duration-200 w-full ${
                                    isScheduleSelected
                                      ? 'border-[#FF7A00]/50 bg-[#FF7A00]/10 shadow-[0_4px_12px_rgba(255,122,0,0.1)]'
                                      : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                                  }`}
                                >
                                  <p className="text-xs font-black text-white">{schedule.label}</p>
                                  <p className="mt-1 text-[11px] leading-snug text-slate-400">{schedule.detail}</p>
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

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/[0.08] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAutomationModalOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-300 transition-all hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95 shadow-sm"
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
                  className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest transition-all ${
                    selectedSuggestion && !isSavingAutomation && inactiveRequiredConnectors.length === 0
                      ? 'bg-gradient-to-r from-[#08B760] to-[#0A9D57] text-white shadow-[0_8px_18px_rgba(10,157,87,0.15)] hover:brightness-105 active:scale-98'
                      : 'bg-white/[0.04] text-slate-500 border border-white/[0.08] cursor-not-allowed'
                  }`}
                >
                  <Sparkles size={14} className="shrink-0" />
                  {isSavingAutomation ? 'Salvando…' : 'Confirmar Automação'}
                </button>
              </div>

              {automationActivated && selectedSuggestion && (
                <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-400 flex items-start gap-2">
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
                <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-sm text-emerald-400">
                  {automationNotice}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {entry && isHistoryModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto px-4 py-6 sm:items-center">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" onClick={() => setIsHistoryModalOpen(false)} />

          <div className="relative w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-[24px] border border-white/[0.12] bg-[#071a2e]/98 shadow-[0_24px_60px_rgba(2,8,22,0.6)] text-white flex flex-col">
            <div className="relative border-b border-white/[0.08] bg-[#091624] px-6 py-5 flex flex-col gap-1 shrink-0">
              <p className="text-xs uppercase tracking-widest text-[#FF6B00] font-bold">{entry.category}</p>
              <h3 className="text-2xl font-black text-white">Histórico de Relatórios</h3>
              <p className="text-xs font-semibold text-slate-300 mt-1">
                Últimos 10 relatórios do agente <strong>{entry.title}</strong>, prontos para visualização e download.
              </p>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="absolute right-5 top-5 rounded-full border border-white/10 bg-white/5 p-2 text-white/80 transition-all hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95 shadow-sm z-50"
                aria-label="Fechar histórico"
              >
                <X size={16} />
              </button>
            </div>

            {isLoadingHistory ? (
              <div className="p-6">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-6 text-sm text-slate-400">
                  Carregando histórico…
                </div>
              </div>
            ) : historyError ? (
              <div className="p-6">
                <div className="rounded-xl border border-orange-500/30 bg-orange-950/20 px-5 py-6 text-sm text-orange-400">
                  {historyError}
                </div>
              </div>
            ) : historyEntries.length === 0 ? (
              <div className="p-6">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-5 py-6 text-sm text-slate-400">
                  Ainda não existem relatórios salvos neste agente. Gere um relatório para iniciar o histórico.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-0 min-h-0 flex-1 overflow-hidden">
                <aside className="border-r border-white/[0.08] p-4 overflow-y-auto bg-[#071a2e]/40">
                  {historyActionError ? (
                    <div className="mb-3 rounded-xl border border-orange-500/30 bg-orange-950/20 px-3 py-2 text-xs font-semibold text-orange-400">
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
                          className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? 'border-[#FF7A00]/50 bg-[#FF7A00]/10 shadow-[0_8px_24px_rgba(255,122,0,0.15)] text-white'
                              : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04] text-slate-300'
                          }`}
                          onClick={() => setSelectedHistoryId(item.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#FF7A00]">Relatório {historyEntries.length - index}</p>
                            <div className="relative">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setHistoryMenuReportId((current) => (current === item.id ? null : item.id));
                                }}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                                aria-label="Abrir menu de ações do relatório"
                              >
                                <MoreVertical size={14} />
                              </button>

                              {historyMenuReportId === item.id ? (
                                <div className="absolute right-0 top-9 z-20 min-w-[148px] overflow-hidden rounded-xl border border-white/[0.12] bg-[#071a2e] shadow-[0_16px_28px_rgba(15,23,42,0.4)]">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedHistoryId(item.id);
                                      setHistoryMenuReportId(null);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-white hover:bg-white/[0.04]"
                                  >
                                    <Eye size={13} className="text-slate-400" />
                                    Visualizar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      void downloadAgentReport(item);
                                      setHistoryMenuReportId(null);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-emerald-400 hover:bg-emerald-950/20"
                                  >
                                    <Download size={13} />
                                    Download
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      void handleDeleteHistoryEntry(item.id);
                                    }}
                                    disabled={isDeletingCurrent}
                                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold ${
                                      isDeletingCurrent
                                        ? 'cursor-not-allowed text-red-400 bg-red-950/20'
                                        : 'text-red-400 hover:bg-red-950/30'
                                    }`}
                                  >
                                    <Trash2 size={13} />
                                    {isDeletingCurrent ? 'Excluindo…' : 'Excluir'}
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          </div>
                          <p className="mt-2 text-sm font-bold text-white break-all">{item.reportTitle || cleanedUrl}</p>
                          <p className="mt-1 text-xs text-slate-400">{formatHistoryDate(item.generatedAt)}</p>
                          {item.metadata?.websiteUrl ? (
                            <p className="mt-2 text-xs text-slate-400 line-clamp-2">{String(item.metadata.websiteUrl)}</p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </aside>

                <section className="p-5 md:p-6 overflow-y-auto flex-1 bg-transparent">
                  {selectedHistoryEntry ? (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4 text-slate-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#FF7A00]">Agente</p>
                            <p className="mt-1 font-bold text-white break-all">{selectedHistoryEntry.agentTitle}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#FF7A00]">Gerado em</p>
                            <p className="mt-1 font-bold text-white">{formatHistoryDate(selectedHistoryEntry.generatedAt)}</p>
                          </div>
                        </div>
                        {selectedHistoryEntry.metadata?.websiteUrl ? (
                          <div className="mt-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#FF7A00]">Referência</p>
                            <p className="mt-1 text-sm font-semibold text-white break-all">{String(selectedHistoryEntry.metadata.websiteUrl)}</p>
                          </div>
                        ) : null}
                        {selectedHistoryEntry.metadata?.businessContext ? (
                          <div className="mt-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#FF7A00]">Contexto informado</p>
                            <p className="mt-1 text-sm text-slate-300">{String(selectedHistoryEntry.metadata.businessContext)}</p>
                          </div>
                        ) : null}
                      </div>

                      <article className="rounded-2xl border border-white/[0.08] bg-[#071a2e]/82 p-5 shadow-[0_8px_32px_rgba(2,8,22,0.4)]">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
                          <h4 className="text-base font-black text-white">Resultado Completo</h4>
                          <button
                            type="button"
                            onClick={() => {
                              void downloadAgentReport(selectedHistoryEntry);
                            }}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#08B760] to-[#0A9D57] px-4 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-[0_8px_18px_rgba(10,157,87,0.15)] transition-all hover:brightness-105"
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
                          <pre className="whitespace-pre-wrap break-words text-[13px] leading-relaxed text-slate-300 font-sans">
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
      )}

      </div>
  );
}
