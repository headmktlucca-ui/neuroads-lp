'use client';

import { useMemo, useEffect, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle2, History, Sparkles, X } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Navbar from '../../../../components/layout/Navbar';
import Footer from '../../../../components/layout/Footer';
import LuccaHubSupportWidget from '../../../../components/hub/LuccaHubSupportWidget';
import SeoGeoWorkspace from '../../../../components/agents/SeoGeoWorkspace';
import TrafficAnalystWorkspace from '../../../../components/agents/TrafficAnalystWorkspace';
import GenericAgentWorkspace from '../../../../components/agents/GenericAgentWorkspace';
import { useAuth } from '../../../../context/AuthContext';
import {
  getAgentBySlug,
  getAgentEntryDefinition,
  getContractedAgentsFromProfile,
  slugifyAgentTitle,
} from '../../../../lib/hub-agents';
import { getHubLoginRedirect, getHubOnboardingRedirect, resolveHubAccessState } from '../../../../lib/hub-access';
import { getFirebaseDb } from '../../../../lib/firebase';
import { readSeoGeoHistory, type SeoGeoHistoryEntry } from '../../../../lib/seo-geo-history';

type AutomationSuggestion = {
  id: string;
  title: string;
  objective: string;
  cadence: string;
  monthlyExecutions: number;
  distribution: string;
};

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
    },
    {
      id: 'balanced',
      title: 'Cadência Estratégica',
      objective: `${context.objective} Equilíbrio ideal entre aprendizado, execução e estabilidade.`,
      cadence: toCadence(balanced),
      monthlyExecutions: balanced,
      distribution: context.distribution,
    },
    {
      id: 'scale',
      title: 'Cadência Máxima do Plano',
      objective: `${context.objective} Uso total do limite contratado para acelerar resultados.`,
      cadence: toCadence(scale),
      monthlyExecutions: scale,
      distribution: context.distribution,
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
  const [historyEntries, setHistoryEntries] = useState<SeoGeoHistoryEntry[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [selectedAutomationId, setSelectedAutomationId] = useState<string | null>(null);
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
  const selectedHistoryEntry = useMemo(() => {
    if (!historyEntries.length) return null;
    if (!selectedHistoryId) return historyEntries[0];
    return historyEntries.find((item) => item.id === selectedHistoryId) ?? historyEntries[0];
  }, [historyEntries, selectedHistoryId]);
  const agentAutomationKey = useMemo(() => (entry ? slugifyAgentTitle(entry.title) : ''), [entry]);

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

  const openHistoryModal = () => {
    const entries = readSeoGeoHistory(user?.uid);
    setHistoryEntries(entries);
    setSelectedHistoryId(entries[0]?.id ?? null);
    setIsHistoryModalOpen(true);
  };

  useEffect(() => {
    if (!automationSuggestions.length) return;
    setSelectedAutomationId((current) => current ?? automationSuggestions[1]?.id ?? automationSuggestions[0].id);
  }, [automationSuggestions]);

  useEffect(() => {
    const loadPersistedAutomation = async () => {
      if (!user || !entry || !agentAutomationKey) return;

      setIsLoadingAutomation(true);
      try {
        const db = getFirebaseDb();
        const userRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userRef);
        const userData = snapshot.data() as
          | { automations?: Record<string, { cadenceId?: string; status?: string }> }
          | undefined;
        const persisted = userData?.automations?.[agentAutomationKey];

        if (persisted?.cadenceId) {
          setSelectedAutomationId(persisted.cadenceId);
          setAutomationActivated(persisted.status === 'active');
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
    <main className="flex flex-col min-h-screen bg-bg-main">
      <Navbar />

      <div className="flex-grow pt-20 md:pt-28 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none bg-top bg-repeat-y bg-[length:100%_auto]"
          style={{ backgroundImage: "url('/images/background_hub_repeat_flow.png')" }}
        />

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
              <button
                onClick={() => router.push('/hub')}
                className="btn btn-primary px-7 py-3 rounded-full text-sm font-bold tracking-widest uppercase"
              >
                Voltar ao Hub
              </button>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="rounded-[34px] p-[2px] bg-gradient-to-br from-white/40 via-orange-300/80 to-[#FF6B00] shadow-[0_24px_56px_-28px_rgba(255,107,0,0.45)]">
                <div className="rounded-[32px] bg-white/85 p-[1px]">
                  <div className="rounded-[30px] border border-[#FFF1E8] bg-white p-6 md:p-8 min-h-[220px] md:min-h-[300px]">
                    <div className="flex flex-col md:flex-row md:items-stretch md:justify-between gap-6">
                      <div className="flex-1">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-primary font-bold mb-2">{entry.category}</p>
                          <h1 className="text-3xl md:text-4xl font-black text-text-main">{entry.title}</h1>
                          {entry.title === 'SEO & GEO' ? (
                            <p className="mt-4 max-w-[760px] text-[13px] leading-relaxed text-text-muted">
                              O agente <strong className="text-text-main">SEO & GEO</strong> atua como uma camada estratégica contínua para aumentar a autoridade digital da sua marca
                              em buscadores tradicionais e em mecanismos de resposta por IA. Ele organiza palavras-chave de intenção real, otimiza conteúdo e estrutura técnica das páginas,
                              identifica oportunidades de posicionamento e transforma sinais de mercado em ações práticas. Com isso, sua operação ganha mais tráfego qualificado, melhora a
                              previsibilidade de geração de demanda e constrói crescimento sustentável com impacto direto em oportunidades comerciais e receita.
                            </p>
                          ) : null}
                          <div className="mt-6 flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setAutomationNotice(null);
                                setAutomationActivated(false);
                                setIsAutomationModalOpen(true);
                              }}
                              className="px-6 py-3 rounded-full border border-[#FF6B00] bg-[#FF6B00] text-white font-bold tracking-widest text-sm uppercase shadow-[0_10px_22px_rgba(255,107,0,0.3)] hover:brightness-105 transition-all"
                            >
                              Ativar Automação
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (entry.title === 'SEO & GEO') {
                                  openHistoryModal();
                                  return;
                                }
                                router.push(`/hub/agente/${slug}#historico`);
                              }}
                              className="px-6 py-3 rounded-full border border-[#D9E2F4] text-[#1D4ED8] bg-[#EEF4FF] font-bold tracking-widest text-sm uppercase hover:bg-[#E2ECFF] transition-colors"
                            >
                              <History size={14} className="inline mr-2 -mt-[2px]" />
                              Histórico
                            </button>
                            <button
                              onClick={() => router.push('/hub')}
                              className="px-6 py-3 rounded-full border border-[#FFE1CF] text-text-main font-bold tracking-widest text-sm uppercase hover:bg-[#FFF8F3] transition-colors"
                            >
                              Voltar ao Hub
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-start self-start gap-3 md:min-w-[280px]">
                          {entry.title === 'SEO & GEO' ? (
                            <div className="w-[168px] h-[168px] rounded-[24px] p-[3px] bg-gradient-to-br from-[#FF6B00] via-[#FF8F1F] to-[#B83A00] shadow-[0_0_0_1px_rgba(255,107,0,0.7),0_14px_28px_rgba(255,107,0,0.26)]">
                              <div className="relative w-full h-full rounded-[20px] overflow-hidden bg-white">
                                <Image src={agent.icon} alt={entry.title} fill className="object-cover" />
                              </div>
                            </div>
                          ) : (
                          <div className="w-14 h-14 rounded-[14px] p-[2px] bg-gradient-to-br from-[#FF6B00] via-[#FF8F1F] to-[#B83A00] shadow-[0_0_0_1px_rgba(255,107,0,0.7),0_10px_20px_rgba(255,107,0,0.22)]">
                          <div className="relative w-full h-full rounded-[12px] overflow-hidden bg-white">
                              <Image src={agent.icon} alt={entry.title} fill className="object-cover" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {entry.title === 'SEO & GEO' ? (
                  <div className="col-span-1">
                    <SeoGeoWorkspace agentTitle={entry.title} />
                  </div>
                ) : entry.title === 'Analista de Tráfego' ? (
                  <div className="col-span-1">
                    <TrafficAnalystWorkspace userId={user?.uid} />
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm" onClick={() => setIsAutomationModalOpen(false)} />

          <div className="relative w-full max-w-3xl rounded-[32px] p-[2px] bg-gradient-to-br from-white/40 via-orange-300/80 to-[#FF6B00] shadow-[0_22px_56px_rgba(15,23,42,0.3)]">
            <div className="rounded-[30px] bg-white/90 p-[1px]">
              <div className="rounded-[28px] border border-[#FFF1E8] bg-white p-6 md:p-7">
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-primary font-bold mb-1">Automação Inteligente</p>
                    <h3 className="text-2xl md:text-3xl font-black text-text-main">Ativar Rotina do Agente</h3>
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

                <div className="mb-4 rounded-xl border border-[#E3E8EF] bg-[#F8FAFC] px-4 py-3 text-sm text-text-muted">
                  Plano: <strong className="text-text-main">{entry.planSummary?.planName ?? 'A confirmar'}</strong> • Limite mensal:{' '}
                  <strong className="text-text-main">{entry.planSummary?.monthlyLimit ?? 0} execuções</strong>
                </div>
                {isLoadingAutomation && (
                  <div className="mb-4 rounded-xl border border-[#E3E8EF] bg-white px-4 py-3 text-sm text-text-muted">
                    Carregando configuração de automação salva...
                  </div>
                )}

                <div className="space-y-3">
                  {automationSuggestions.map((option) => {
                    const isSelected = selectedAutomationId === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelectedAutomationId(option.id)}
                        className={`w-full text-left rounded-2xl border p-4 transition-all ${
                          isSelected
                            ? 'border-[#FFBE94] bg-[#FFF7F1] shadow-[0_10px_24px_rgba(255,107,0,0.14)]'
                            : 'border-[#E3E8EF] bg-[#FBFCFE] hover:border-[#FFD1B3] hover:bg-white'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-base font-bold text-text-main">{option.title}</p>
                          <span className="inline-flex items-center rounded-full border border-[#CDE7D9] bg-[#F2FFF7] px-3 py-1 text-xs font-bold text-[#0A9D57]">
                            {option.monthlyExecutions} execuções/mês
                          </span>
                        </div>
                        <p className="text-sm text-text-muted mt-2">{option.objective}</p>
                        <p className="text-xs text-text-dim mt-2">
                          Cadência: <strong className="text-text-main">{option.cadence}</strong>
                        </p>
                        <p className="text-xs text-text-dim mt-1">{option.distribution}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAutomationModalOpen(false)}
                    className="px-5 py-2.5 rounded-full border border-border text-text-muted font-bold tracking-wide text-sm hover:bg-bg-secondary transition-colors"
                  >
                    Fechar
                  </button>

                  <button
                    type="button"
                    disabled={!selectedSuggestion}
                    onClick={async () => {
                      if (!selectedSuggestion || !user || !entry || !agentAutomationKey) return;

                      setIsSavingAutomation(true);
                      setAutomationNotice(null);
                      try {
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
                            planName: entry.planSummary?.planName ?? null,
                            monthlyLimit: entry.planSummary?.monthlyLimit ?? null,
                            activatedAt: Date.now(),
                            updatedAt: Date.now(),
                          },
                        };

                        await setDoc(userRef, payload, { merge: true });
                        setAutomationActivated(true);
                        setAutomationNotice('Automação salva com sucesso no seu perfil.');
                      } catch (error) {
                        console.error('Erro ao salvar automação:', error);
                        setAutomationActivated(false);
                        setAutomationNotice('Falha ao salvar automação. Tente novamente.');
                      } finally {
                        setIsSavingAutomation(false);
                      }
                    }}
                    className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all ${
                      selectedSuggestion && !isSavingAutomation
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

      {entry && entry.title === 'SEO & GEO' && isHistoryModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6">
          <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm" onClick={() => setIsHistoryModalOpen(false)} />

          <div className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-[32px] p-[2px] bg-gradient-to-br from-white/40 via-orange-300/80 to-[#FF6B00] shadow-[0_22px_56px_rgba(15,23,42,0.3)]">
            <div className="rounded-[30px] bg-white/90 p-[1px] h-full">
              <div className="rounded-[28px] border border-[#FFF1E8] bg-white h-full flex flex-col">
                <div className="flex items-start justify-between gap-3 px-6 pt-6 pb-5 border-b border-[#F1F5F9]">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-primary font-bold mb-1">SEO & GEO</p>
                    <h3 className="text-2xl md:text-3xl font-black text-text-main">Histórico de Pesquisas</h3>
                    <p className="text-sm text-text-muted mt-2">
                      Selecione uma auditoria para visualizar o resultado completo gerado anteriormente.
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

                {historyEntries.length === 0 ? (
                  <div className="px-6 py-10">
                    <div className="rounded-2xl border border-[#E3E8EF] bg-[#F8FAFC] px-5 py-6 text-sm text-text-muted">
                      Ainda não existem pesquisas salvas neste agente. Gere uma auditoria para começar o histórico.
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-0 min-h-0 flex-1">
                    <aside className="border-r border-[#EEF2F7] p-4 overflow-y-auto">
                      <div className="space-y-3">
                        {historyEntries.map((item, index) => {
                          const isSelected = selectedHistoryEntry?.id === item.id;
                          const cleanedUrl = item.websiteUrl.replace(/^https?:\/\//i, '');
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setSelectedHistoryId(item.id)}
                              className={`w-full rounded-2xl border p-4 text-left transition-all ${
                                isSelected
                                  ? 'border-[#FFBE94] bg-[#FFF7F1] shadow-[0_10px_24px_rgba(255,107,0,0.14)]'
                                  : 'border-[#E3E8EF] bg-[#FBFCFE] hover:border-[#FFD1B3] hover:bg-white'
                              }`}
                            >
                              <p className="text-[11px] font-bold uppercase tracking-widest text-text-dim">Pesquisa {historyEntries.length - index}</p>
                              <p className="mt-2 text-sm font-bold text-text-main break-all">{cleanedUrl}</p>
                              <p className="mt-1 text-xs text-text-muted">{formatHistoryDate(item.generatedAt)}</p>
                              {item.businessContext ? (
                                <p className="mt-2 text-xs text-text-dim line-clamp-2">{item.businessContext}</p>
                              ) : null}
                            </button>
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
                                <p className="text-[11px] font-bold uppercase tracking-widest text-text-dim">Site analisado</p>
                                <p className="mt-1 font-semibold text-text-main break-all">{selectedHistoryEntry.websiteUrl}</p>
                              </div>
                              <div>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-text-dim">Gerado em</p>
                                <p className="mt-1 font-semibold text-text-main">{formatHistoryDate(selectedHistoryEntry.generatedAt)}</p>
                              </div>
                            </div>
                            {selectedHistoryEntry.businessContext ? (
                              <div className="mt-4">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-text-dim">Contexto informado</p>
                                <p className="mt-1 text-sm text-text-main">{selectedHistoryEntry.businessContext}</p>
                              </div>
                            ) : null}
                          </div>

                          <article className="rounded-2xl border border-[#E7ECF3] bg-[#FBFCFE] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
                            <h4 className="text-base font-black text-text-main mb-3">Resultado Completo</h4>
                            <pre className="whitespace-pre-wrap break-words text-[13px] leading-relaxed text-text-main font-sans">
                              {selectedHistoryEntry.report}
                            </pre>
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

      <Footer />
      <LuccaHubSupportWidget />
    </main>
  );
}
