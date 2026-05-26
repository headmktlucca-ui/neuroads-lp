'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ExternalLink, Info, Power, Wrench, X } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import LuccaHubSupportWidget from '../../../components/hub/LuccaHubSupportWidget';
import { useAuth } from '../../../context/AuthContext';
import { agents } from '../../../data/agents';
import { getAgentEntryDefinition, getContractedAgentsFromProfile, slugifyAgentTitle } from '../../../lib/hub-agents';
import { readAgentStatusOverrides, writeAgentStatusOverrides } from '../../../lib/agent-status-cache';
import { getHubLoginRedirect, getHubOnboardingRedirect, resolveHubAccessState } from '../../../lib/hub-access';
import { getFirebaseDb } from '../../../lib/firebase';

const categories = [
  { slug: 'performance', label: 'Performance' },
  { slug: 'criativos', label: 'Criativos' },
  { slug: 'tecnico', label: 'Técnico' },
  { slug: 'inteligencia', label: 'Inteligência' },
];

const HUB_CONNECTOR_BUTTON_CLASS =
  'inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] bg-[#FF6B00] px-6 text-[14px] leading-none font-black text-white shadow-[0_10px_22px_rgba(255,107,0,0.30)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFBE94]';

const PLAN_AGENT_CAPACITY: Record<string, number> = {
  Lite: 5,
  Start: 10,
  Growth: 15,
  'Pro Scale': 20,
  Enterprise: 50,
};

const ACTIVATABLE_AGENT_TITLES = new Set([
  'Analista de Tráfego',
  'DNA da Marca',
  'SEO & GEO',
  'Simulador de ROAS',
  'Preditor de Funil',
  'Auditor de Desperdício',
  'Otimizador de Orçamento',
  'Gerador de Criativos',
  'Gerador de Copies de Conversão',
  'Diagnóstico de Landing Page',
  'Análise Viral',
  'Rastreador Cirúrgico',
  'Analisador de Público',
  'Diagnóstico de Funil',
  'Gerador de Testes A/B',
  'Avaliador de Oferta',
  'Radar de Oportunidades',
  'Análise de Concorrentes',
  'Público-Alvo Ideal',
]);

type AgentDetailsContent = {
  activities: string[];
  howItWorks: string;
  deliveries: string;
  effectiveResult: string;
};

const AGENT_DETAILS_MAP: Record<string, AgentDetailsContent> = {
  'Analista de Tráfego': {
    activities: [
      'Uma inteligência artificial avançada que se conecta diretamente às suas contas de anúncios (Google e Meta) para realizar diagnósticos em tempo real.',
      'Identifica desperdícios de orçamento, campanhas com fadiga de criativo e sugere ajustes automáticos de lances baseados no seu ROI alvo, otimizando cada centavo do seu investimento.',
    ],
    howItWorks:
      'Cruza sinais de campanha, audiência e conversão para priorizar ajustes de maior impacto financeiro em ciclos contínuos de otimização.',
    deliveries:
      'Checklist de otimização, recomendações de investimento e alertas operacionais para correção rápida de perdas.',
    effectiveResult:
      'Mais previsibilidade no caixa, menor custo por aquisição e ganho real de eficiência na operação de mídia.',
  },
  'Simulador de ROAS': {
    activities: [
      'Consolida indicadores de mídia por canal para transformar dados em projeções reais de receita.',
      'Simula cenários de investimento, gap de leads e distribuição recomendada de verba com foco em ROAS sustentável.',
    ],
    howItWorks:
      'Cruza investimento, conversão, ticket médio e taxa de fechamento para projetar o esforço necessário para bater metas de faturamento.',
    deliveries:
      'Simulações por cenário, oportunidades priorizadas por canal e plano de alocação de verba para escala previsível.',
    effectiveResult:
      'Mais clareza sobre onde investir, quanto investir e qual retorno financeiro esperar antes de acelerar o orçamento.',
  },
  'Preditor de Funil': {
    activities: [
      'Consolida indicadores reais de mídia e conversão para mapear cada etapa do funil comercial.',
      'Projeta cenários de cliques, leads, MQL, SQL e vendas para estimar receita, margem e risco operacional.',
    ],
    howItWorks:
      'Cruza volume, custos e taxas de passagem entre etapas para estimar o esforço necessário para bater metas de faturamento com previsibilidade.',
    deliveries:
      'Diagnóstico do funil atual, meta operacional por etapa e cenários comparativos de escala com impacto financeiro.',
    effectiveResult:
      'Mais precisão para decidir orçamento e ritmo de execução sem depender de tentativa e erro.',
  },
  'Auditor de Desperdício': {
    activities: [
      'Mapeia canais e campanhas com baixa eficiência para identificar desperdício financeiro recorrente.',
      'Simula cenários de corte e recuperação de verba para aumentar margem sem reduzir potencial de vendas.',
    ],
    howItWorks:
      'Confronta indicadores reais com metas operacionais de CPC, CPL e conversão para isolar pontos de drenagem de caixa.',
    deliveries:
      'Relatório de perdas estimadas, prioridades de ajuste por canal e plano de realocação de investimento.',
    effectiveResult:
      'Menos desperdício, maior eficiência de mídia e crescimento com previsibilidade financeira.',
  },
  'Otimizador de Orçamento': {
    activities: [
      'Avalia distribuição atual de verba entre canais e campanhas para identificar alocação ineficiente.',
      'Simula redistribuições com foco em reduzir desperdício e elevar retorno com base em dados reais.',
    ],
    howItWorks:
      'Cruza custo, conversão e desempenho por canal para priorizar realocação de investimento com maior impacto financeiro.',
    deliveries:
      'Plano de redistribuição de verba, cenários comparativos e prioridades de ajuste por janela operacional.',
    effectiveResult:
      'Mais previsibilidade no caixa, menor risco de drenagem de orçamento e escala com eficiência.',
  },
  'Gerador de Criativos': {
    activities: [
      'Conecta indicadores reais dos canais para diagnosticar quais criativos têm maior potencial de escala.',
      'Prioriza variações de mensagem e ângulo com base em gaps de CTR, conversão e CPL por canal.',
    ],
    howItWorks:
      'Cruza dados de mídia com metas criativas para sugerir ciclos de testes e simular impacto financeiro antes de publicar novas peças.',
    deliveries:
      'Plano criativo com oportunidades priorizadas, cadência recomendada de produção e simulações de uplift.',
    effectiveResult:
      'Mais consistência na geração de criativos com foco em reduzir CPL e aumentar previsibilidade comercial.',
  },
  'Diagnóstico de Landing Page': {
    activities: [
      'Executa auditoria estratégica de landing pages para encontrar gargalos reais de conversão, UX e percepção de valor.',
      'Conecta promessa do anúncio com a mensagem da página para identificar desalinhamentos que geram abandono.',
    ],
    howItWorks:
      'Captura sinais da URL analisada, estrutura scorecards por dimensão crítica e transforma achados em prioridades práticas com simulação de impacto.',
    deliveries:
      'Diagnóstico executivo, análise detalhada por domínio, heatmap cognitivo simulado e recomendações priorizadas por impacto/facilidade/urgência.',
    effectiveResult:
      'Mais clareza para decidir o que ajustar primeiro, reduzindo abandono e elevando conversão com foco em resultado financeiro.',
  },
  'Análise Viral': {
    activities: [
      'Monitora conteúdos quentes do mercado nas últimas 24 horas, filtrando temas aderentes ao DNA da marca.',
      'Converte tendências em variações de conteúdo com posicionamentos orientados a conversão e geração de demanda.',
    ],
    howItWorks:
      'Cruza segmento, objetivos e temas estratégicos da marca com sinais de destaque recentes para recomendar narrativas e formatos acionáveis.',
    deliveries:
      'Top 10 referências atuais com variações de abordagem, canal recomendado e CTA sugerido por oportunidade.',
    effectiveResult:
      'Mais velocidade criativa com foco em relevância comercial e aumento da previsibilidade de performance.',
  },
};

function LaboratorioAgentesContent() {
  const { user, profile, loading, premiumSyncing } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('categoria');
  const contractedAgents = useMemo(() => getContractedAgentsFromProfile(profile), [profile]);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, boolean>>({});
  const effectiveContracts = useMemo(() => {
    if (Object.keys(statusOverrides).length === 0) return contractedAgents;

    const merged = new Map(contractedAgents);
    for (const [title, isActive] of Object.entries(statusOverrides)) {
      const current = merged.get(title) ?? { isActive: false };
      merged.set(title, { ...current, isActive });
    }
    return merged;
  }, [contractedAgents, statusOverrides]);
  const [activatingSlug, setActivatingSlug] = useState<string | null>(null);
  const [selectedDetailsSlug, setSelectedDetailsSlug] = useState<string | null>(null);
  const [pendingActivationSlug, setPendingActivationSlug] = useState<string | null>(null);
  const [pendingDeactivateSlug, setPendingDeactivateSlug] = useState<string | null>(null);
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

  useEffect(() => {
    if (!user) {
      setStatusOverrides({});
      return;
    }
    setStatusOverrides(readAgentStatusOverrides(user.uid));
  }, [user]);

  const visibleCategories = useMemo(() => {
    if (!categoryFilter) return categories;
    return categories.filter((category) => category.slug === categoryFilter);
  }, [categoryFilter]);

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

  const activeAgentsCount = Array.from(effectiveContracts.values()).filter((entry) => entry.isActive).length;
  const activePlanName = Array.from(effectiveContracts.values()).find((entry) => entry.isActive)?.planName ?? 'Growth';
  const planCapacity = PLAN_AGENT_CAPACITY[activePlanName] ?? 15;
  const nextActiveCount = activeAgentsCount + 1;

  const pendingAgent = pendingActivationSlug
    ? agents.find(
        (agent) =>
          slugifyAgentTitle(agent.title) === pendingActivationSlug &&
          ACTIVATABLE_AGENT_TITLES.has(agent.title)
      )
    : null;

  const detailsAgent = selectedDetailsSlug
    ? agents.find((agent) => slugifyAgentTitle(agent.title) === selectedDetailsSlug)
    : null;
  const pendingDeactivateAgent = pendingDeactivateSlug
    ? agents.find((agent) => slugifyAgentTitle(agent.title) === pendingDeactivateSlug)
    : null;

  const detailsContent = detailsAgent
    ? AGENT_DETAILS_MAP[detailsAgent.title] ?? {
        activities: [
          `Mapeia sinais críticos da frente de ${detailsAgent.category.toLowerCase()} para reduzir ineficiências da operação.`,
          'Transforma dados em recomendações objetivas para acelerar decisões com foco em resultado financeiro.',
        ],
        howItWorks:
          'Analisa indicadores da operação, prioriza alertas e sugere ações práticas orientadas a crescimento previsível.',
        deliveries:
          'Relatórios acionáveis, prioridades táticas e checklist de execução para o time implementar no dia a dia.',
        effectiveResult:
          'Mais consistência de performance, menor desperdício e aumento de escala com controle.',
      }
    : null;

  const activateAgent = async (agentTitle: string, agentSlug: string) => {
    if (!user || !ACTIVATABLE_AGENT_TITLES.has(agentTitle)) return;
    setActivatingSlug(agentSlug);
    const activationOverrides = { ...statusOverrides, [agentTitle]: true };
    setStatusOverrides(activationOverrides);
    writeAgentStatusOverrides(user.uid, activationOverrides);
    setPendingActivationSlug(null);
    try {
      const db = getFirebaseDb();
      const userRef = doc(db, 'users', user.uid);
      void setDoc(
        userRef,
        {
          activeAgents: {
            [agentTitle]: {
              isActive: true,
              planName: 'Growth',
              monthlyLimit: 15,
              usageUsed: 0,
              updatedAt: Date.now(),
            },
          },
        },
        { merge: true }
      ).catch((error) => {
        console.warn('Falha ao sincronizar ativação do agente no Firestore:', error);
      });
      router.refresh();
    } catch (error) {
      console.error('Erro ao ativar agente:', error);
    } finally {
      setActivatingSlug(null);
    }
  };

  const deactivateAgent = async (agentTitle: string, agentSlug: string) => {
    if (!user) return;
    setActivatingSlug(agentSlug);
    const deactivationOverrides = { ...statusOverrides, [agentTitle]: false };
    setStatusOverrides(deactivationOverrides);
    writeAgentStatusOverrides(user.uid, deactivationOverrides);
    setPendingDeactivateSlug(null);
    try {
      const db = getFirebaseDb();
      const userRef = doc(db, 'users', user.uid);
      void setDoc(
        userRef,
        {
          activeAgents: {
            [agentTitle]: {
              isActive: false,
              updatedAt: Date.now(),
            },
          },
        },
        { merge: true }
      ).catch((error) => {
        console.warn('Falha ao sincronizar desativação do agente no Firestore:', error);
      });
      router.refresh();
    } catch (error) {
      console.error('Erro ao desativar agente:', error);
    } finally {
      setActivatingSlug(null);
    }
  };

  return (
    <main className="flex flex-col min-h-screen bg-bg-main">
      <Navbar />

      <div className="flex-grow pt-24 md:pt-40 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none bg-top bg-repeat-y bg-[length:100%_auto]"
          style={{ backgroundImage: "url('/images/background_hub_repeat_flow.png')" }}
        />
        <div className="absolute inset-x-0 bottom-0 h-44 pointer-events-none bg-gradient-to-b from-transparent via-[#f7f8fa]/75 to-bg-main" />

        <section className="relative z-10 wrap py-8 md:py-12 space-y-6">
          <header className="relative overflow-hidden rounded-3xl border border-[#122034] bg-[#040a13] p-6 md:p-8 shadow-[0_16px_40px_rgba(2,8,22,0.35)]">
            <Image
              src="/images/template-match/metrics-wave-v1.png"
              alt=""
              fill
              className="pointer-events-none object-cover object-bottom opacity-[1]"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,15,0.9)_0%,rgba(3,8,15,0.92)_40%,rgba(3,8,15,0.14)_100%)]" />

            <div className="relative z-10">
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
                <span className="bg-[linear-gradient(90deg,#ffb36a_0%,#ff8a2b_45%,#d55a00_100%)] bg-clip-text text-transparent">
                  Laboratório de Agentes
                </span>
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#C6D3E9] md:text-base">
                Esta área centraliza a ativação dos agentes da sua operação, com foco em coerência estratégica, previsibilidade e impacto financeiro real.
              </p>
            </div>
          </header>

          {visibleCategories.map((category) => {
            const categoryAgents = agents.filter((agent) => agent.category === category.label);
            return (
              <section
                key={category.slug}
                className="rounded-3xl border border-border bg-white p-6 md:p-8 shadow-[0_14px_34px_rgba(15,23,42,0.05)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-black text-text-main">
                    {category.label}
                  </h2>
                </div>

                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {categoryAgents.map((agent) => {
                    const entry = getAgentEntryDefinition(agent, effectiveContracts);
                    const isActive = entry.isActive;
                    const agentSlug = slugifyAgentTitle(agent.title);
                    const isActivatable = ACTIVATABLE_AGENT_TITLES.has(agent.title);

                    return (
                      <article key={agent.title} className="rounded-xl border border-border bg-bg-secondary p-4">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-black text-text-main">{agent.title}</p>
                          {isActive ? (
                            <button
                              type="button"
                              onClick={() => setPendingDeactivateSlug(agentSlug)}
                              disabled={activatingSlug === agentSlug}
                              className="inline-flex items-center gap-1 text-[12px] font-black text-[#B42318] hover:text-[#912018] disabled:opacity-60"
                            >
                              <Power className="h-3.5 w-3.5" />
                              {activatingSlug === agentSlug ? 'Desativando...' : 'Desativar Agente'}
                            </button>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-text-muted">{agent.description}</p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {isActive ? (
                            <>
                              <button
                                type="button"
                                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] bg-[#0A9D57] px-6 text-[14px] leading-none font-black text-white shadow-[0_10px_22px_rgba(10,157,87,0.30)]"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                Ativo
                              </button>
                              <Link
                                href={`/hub/agente/${agentSlug}`}
                                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] bg-[#2563EB] px-6 text-[14px] leading-none font-black text-white shadow-[0_10px_22px_rgba(37,99,235,0.30)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C5FD]"
                              >
                                <ExternalLink className="h-4 w-4" />
                                Acessar Agente
                              </Link>
                              <button
                                type="button"
                                onClick={() => setSelectedDetailsSlug(agentSlug)}
                                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] border border-[#D3DAE6] bg-white px-6 text-[14px] leading-none font-black text-[#344054] shadow-[0_8px_16px_rgba(15,23,42,0.08)] transition hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D3DAE6]"
                              >
                                <Info className="h-4 w-4" />
                                Mais detalhes
                              </button>
                            </>
                          ) : (
                            <>
                              {isActivatable ? (
                                <button
                                  type="button"
                                  onClick={() => setPendingActivationSlug(agentSlug)}
                                  disabled={activatingSlug === agentSlug}
                                  className={`${HUB_CONNECTOR_BUTTON_CLASS} disabled:opacity-60`}
                                >
                                  <Wrench className="h-4 w-4" />
                                  {activatingSlug === agentSlug ? 'Ativando...' : 'Ativar Agente'}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled
                                  className={`${HUB_CONNECTOR_BUTTON_CLASS} cursor-not-allowed opacity-60`}
                                >
                                  <Wrench className="h-4 w-4" />
                                  em desenvolvimento
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedDetailsSlug(agentSlug)}
                                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] border border-[#D3DAE6] bg-white px-6 text-[14px] leading-none font-black text-[#344054] shadow-[0_8px_16px_rgba(15,23,42,0.08)] transition hover:bg-[#F8FAFC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D3DAE6]"
                              >
                                <Info className="h-4 w-4" />
                                Mais detalhes
                              </button>
                            </>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </section>
      </div>

      {pendingDeactivateAgent ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setPendingDeactivateSlug(null)}
            className="absolute inset-0 bg-[#101828]/45 backdrop-blur-[2px]"
            aria-label="Fechar confirmação"
          />
          <section className="relative w-full max-w-2xl rounded-[24px] border border-border bg-white p-6 md:p-8 shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
            <button
              type="button"
              onClick={() => setPendingDeactivateSlug(null)}
              className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-[#667085] hover:text-text-main"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#B42318]">Confirmar desativação</p>
            <h3 className="mt-1 text-3xl font-black tracking-tight text-text-main">{pendingDeactivateAgent.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">
              Ao confirmar, o agente será desativado e deixará de aparecer como ativo até uma nova ativação.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPendingDeactivateSlug(null)}
                className="inline-flex h-11 items-center justify-center rounded-[12px] border border-border bg-white px-5 text-sm font-black text-[#344054]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() =>
                  deactivateAgent(pendingDeactivateAgent.title, slugifyAgentTitle(pendingDeactivateAgent.title))
                }
                disabled={activatingSlug === slugifyAgentTitle(pendingDeactivateAgent.title)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-[#B42318] bg-[#B42318] px-5 text-sm font-black text-white shadow-[0_10px_22px_rgba(180,35,24,0.30)] disabled:opacity-60"
              >
                <Power className="h-4 w-4" />
                {activatingSlug === slugifyAgentTitle(pendingDeactivateAgent.title)
                  ? 'Desativando...'
                  : 'Confirmar desativação'}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {detailsAgent && detailsContent ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setSelectedDetailsSlug(null)}
            className="absolute inset-0 bg-[#0B1324]/55 backdrop-blur-[2px]"
            aria-label="Fechar detalhes do agente"
          />
          <section className="relative w-full max-w-[780px] rounded-[24px] border border-[#D9DEE8] bg-[#F8FAFD] p-6 md:p-7 shadow-[0_30px_70px_rgba(2,12,27,0.32)]">
            <button
              type="button"
              onClick={() => setSelectedDetailsSlug(null)}
              className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#CBD5E1] bg-[#F8FAFD] text-[#667085] hover:text-text-main"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-4 pr-14">
              <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-[16px] border-2 border-[#FF6B00] shadow-[0_10px_24px_rgba(2,12,27,0.18)]">
                <Image src={detailsAgent.icon} alt={detailsAgent.title} fill className="object-cover" sizes="76px" />
              </div>
              <div>
                <p className="pt-1 text-[11px] font-black uppercase tracking-[0.12em] text-primary">Agente de IA</p>
                <h3 className="mt-1 text-[30px] leading-[1.05] font-black tracking-tight text-[#1C2538] sm:text-[38px] md:text-[44px]">{detailsAgent.title}</h3>
                <p className="mt-3 max-w-3xl text-[15px] leading-[1.45] text-[#4B5568] sm:text-[16px]">{detailsAgent.description}</p>
              </div>
            </div>

            <article className="mt-7 rounded-[18px] border border-[#D8DEEA] bg-[#EEF2F8] p-5 md:p-6">
              <h4 className="text-[13px] font-black uppercase tracking-[0.08em] text-primary">Atividades relacionadas</h4>
              <ul className="mt-4 space-y-4 text-[15px] leading-[1.5] text-[#445064] sm:text-[16px]">
                {detailsContent.activities.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-[0.62em] inline-flex h-[7px] w-[7px] shrink-0 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </section>
        </div>
      ) : null}

      {pendingAgent ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setPendingActivationSlug(null)}
            className="absolute inset-0 bg-[#101828]/45 backdrop-blur-[2px]"
            aria-label="Fechar confirmação"
          />
          <section className="relative w-full max-w-2xl rounded-[24px] border border-border bg-white p-6 md:p-8 shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
            <button
              type="button"
              onClick={() => setPendingActivationSlug(null)}
              className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-[#667085] hover:text-text-main"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            <p className="text-xs font-black uppercase tracking-[0.12em] text-primary">Confirmar ativação</p>
            <h3 className="mt-1 text-3xl font-black tracking-tight text-text-main">{pendingAgent.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">
              Você está prestes a ativar este agente. Confira como ficará a capacidade do plano ativo.
            </p>

            <div className="mt-5 rounded-2xl border border-border bg-[#F8FAFC] p-4 text-sm text-text-main space-y-1">
              <p>
                <strong>Plano ativo:</strong> {activePlanName}
              </p>
              <p>
                <strong>Capacidade do plano:</strong> {planCapacity} agentes
              </p>
              <p>
                <strong>Ativos atualmente:</strong> {activeAgentsCount}
              </p>
              <p>
                <strong>Após confirmação:</strong> {nextActiveCount} de {planCapacity}
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPendingActivationSlug(null)}
                className="inline-flex h-11 items-center justify-center rounded-[12px] border border-border bg-white px-5 text-sm font-black text-[#344054]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => activateAgent(pendingAgent.title, slugifyAgentTitle(pendingAgent.title))}
                disabled={activatingSlug === slugifyAgentTitle(pendingAgent.title)}
                className={`${HUB_CONNECTOR_BUTTON_CLASS} disabled:opacity-60`}
              >
                <Wrench className="h-4 w-4" />
                {activatingSlug === slugifyAgentTitle(pendingAgent.title) ? 'Ativando...' : 'Confirmar ativação'}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <Footer />
      <LuccaHubSupportWidget />
    </main>
  );
}

export default function LaboratorioAgentesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg-main flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LaboratorioAgentesContent />
    </Suspense>
  );
}
