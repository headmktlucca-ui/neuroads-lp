'use client';

import { useMemo, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle2, Sparkles, X } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Navbar from '../../../../components/layout/Navbar';
import Footer from '../../../../components/layout/Footer';
import SeoGeoWorkspace from '../../../../components/agents/SeoGeoWorkspace';
import { useAuth } from '../../../../context/AuthContext';
import { agents } from '../../../../data/agents';
import { formatBRL } from '../../../../data/agent-pricing';
import {
  getAgentBySlug,
  getAgentEntryDefinition,
  getContractedAgentsFromProfile,
  slugifyAgentTitle,
} from '../../../../lib/hub-agents';
import { getFirebaseDb } from '../../../../lib/firebase';

function formatDate(dateString?: string): string {
  if (!dateString) return 'A confirmar';
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'A confirmar';
  return date.toLocaleDateString('pt-BR');
}

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
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const [isAutomationModalOpen, setIsAutomationModalOpen] = useState(false);
  const [selectedAutomationId, setSelectedAutomationId] = useState<string | null>(null);
  const [automationActivated, setAutomationActivated] = useState(false);
  const [isSavingAutomation, setIsSavingAutomation] = useState(false);
  const [isLoadingAutomation, setIsLoadingAutomation] = useState(false);
  const [automationNotice, setAutomationNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, router, user]);

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
  const agentAutomationKey = useMemo(() => (entry ? slugifyAgentTitle(entry.title) : ''), [entry]);

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
  const agentsByCategory = useMemo(() => {
    const categoryOrder = ['Performance', 'Inteligência', 'Criativos', 'Técnico'];
    const categoryMap = new Map<string, typeof agents>();

    for (const category of categoryOrder) {
      categoryMap.set(category, agents.filter((item) => item.category === category));
    }

    const remainingCategories = Array.from(new Set(agents.map((item) => item.category))).filter(
      (category) => !categoryOrder.includes(category)
    );
    for (const category of remainingCategories) {
      categoryMap.set(category, agents.filter((item) => item.category === category));
    }

    return Array.from(categoryMap.entries()).filter(([, list]) => list.length > 0);
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
                  <div className="rounded-[30px] border border-[#FFF1E8] bg-white p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-[14px] p-[2px] bg-gradient-to-br from-[#FF6B00] via-[#FF8F1F] to-[#B83A00] shadow-[0_0_0_1px_rgba(255,107,0,0.7),0_10px_20px_rgba(255,107,0,0.22)]">
                          <div className="relative w-full h-full rounded-[12px] overflow-hidden bg-white">
                            <Image src={agent.icon} alt={entry.title} fill className="object-cover" />
                          </div>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-widest text-primary font-bold mb-2">{entry.category}</p>
                          <h1 className="text-3xl md:text-4xl font-black text-text-main">{entry.title}</h1>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setAutomationNotice(null);
                            setAutomationActivated(false);
                            setIsAutomationModalOpen(true);
                          }}
                          className="px-6 py-3 rounded-full border border-[#FFD3B7] bg-gradient-to-br from-[#FF6B00] to-[#FF9D00] text-white font-bold tracking-widest text-sm uppercase shadow-[0_10px_22px_rgba(255,107,0,0.3)] hover:brightness-105 transition-all"
                        >
                          Ativar Automação
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
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                  <div className="rounded-[30px] p-[2px] bg-gradient-to-br from-white/40 via-orange-300/80 to-[#FF6B00] shadow-[0_20px_44px_-28px_rgba(255,107,0,0.38)]">
                    <div className="rounded-[28px] bg-white/85 p-[1px]">
                      <div className="rounded-[26px] border border-[#FFF1E8] bg-white p-6 h-full">
                        <h2 className="text-xs uppercase tracking-widest text-primary font-bold mb-4">Resumo Comercial</h2>
                        <div className="space-y-3">
                          <p className="text-sm text-text-muted">
                            Plano: <span className="font-bold text-text-main">{entry.planSummary?.planName ?? 'A confirmar'}</span>
                          </p>
                          <p className="text-sm text-text-muted">
                            Valor: <span className="font-bold text-text-main">{formatBRL(entry.planSummary?.monthlyPrice ?? 0)}/mês</span>
                          </p>
                          <p className="text-sm text-text-muted">
                            Limite: <span className="font-bold text-text-main">{entry.planSummary?.monthlyLimit ?? 0} execuções/mês</span>
                          </p>
                          <p className="text-sm text-text-muted">
                            Em uso: <span className="font-bold text-text-main">{entry.planSummary?.usageUsed ?? 0}</span>
                          </p>
                          <p className="text-sm text-text-muted">
                            Próximo pagamento:{' '}
                            <span className="font-bold text-text-main">{formatDate(entry.planSummary?.nextPaymentAt)}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[30px] p-[2px] bg-gradient-to-br from-white/40 via-orange-300/80 to-[#FF6B00] shadow-[0_20px_44px_-28px_rgba(255,107,0,0.38)]">
                    <div className="rounded-[28px] bg-white/85 p-[1px]">
                      <div className="rounded-[26px] border border-[#FFF1E8] bg-white p-6">
                        <h2 className="text-xs uppercase tracking-widest text-primary font-bold mb-4">Agentes Neurais</h2>
                        <div className="space-y-5">
                          {agentsByCategory.map(([category, list]) => (
                            <div key={category} className="space-y-2.5">
                              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-text-dim">{category}</p>
                              <div className="space-y-2">
                                {list.map((item) => {
                                  const itemSlug = slugifyAgentTitle(item.title);
                                  const isCurrent = itemSlug === slug;
                                  return (
                                    <button
                                      key={item.title}
                                      type="button"
                                      onClick={() => router.push(`/hub/agente/${itemSlug}`)}
                                      className={`w-full text-left rounded-xl border px-3 py-2.5 transition-all ${
                                        isCurrent
                                          ? 'border-[#FFBE94] bg-[#FFF6F0] shadow-[0_8px_18px_rgba(255,107,0,0.12)]'
                                          : 'border-[#E3E8EF] bg-[#FBFCFE] hover:border-[#FFD2B5] hover:bg-white'
                                      }`}
                                    >
                                      <p className={`text-sm font-semibold ${isCurrent ? 'text-primary' : 'text-text-main'}`}>{item.title}</p>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {entry.title === 'SEO & GEO' ? (
                  <div className="lg:col-span-2">
                    <SeoGeoWorkspace agentTitle={entry.title} />
                  </div>
                ) : (
                  <div className="lg:col-span-2 rounded-[30px] p-[2px] bg-gradient-to-br from-white/40 via-orange-300/80 to-[#FF6B00] shadow-[0_24px_52px_-30px_rgba(255,107,0,0.42)]">
                    <div className="rounded-[28px] bg-white/85 p-[1px]">
                      <div className="rounded-[26px] border border-[#FFF1E8] bg-white p-6 md:p-8 h-full">
                        <h2 className="text-sm uppercase tracking-widest text-primary font-bold mb-4">Área de implantação</h2>
                        <div className="min-h-[420px] rounded-2xl border-2 border-dashed border-[#FFD9C0] bg-gradient-to-br from-[#FFF8F3] to-white p-6">
                          <p className="text-sm text-text-muted">
                            Espaço reservado para implementação das atividades e componentes específicos do agente <strong>{entry.title}</strong>.
                          </p>
                        </div>
                      </div>
                    </div>
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

      <Footer />
    </main>
  );
}
