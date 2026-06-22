'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ExternalLink, Info, Power, Search, Wrench, X } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { agents } from '../../../data/agents';
import { getAgentEntryDefinition, getContractedAgentsFromProfile, slugifyAgentTitle } from '../../../lib/hub-agents';
import { readAgentStatusOverrides, writeAgentStatusOverrides } from '../../../lib/agent-status-cache';
import { getFirebaseDb } from '../../../lib/firebase';

const categories = [
  { slug: 'performance', label: 'Performance', desc: 'Análise de canais, otimização de lances e escala previsível.' },
  { slug: 'criativos', label: 'Criativos', desc: 'Criação de anúncios, copies de alta conversão e testes de peças.' },
  { slug: 'tecnico', label: 'Técnico', desc: 'Tagging, tracking avançado e conexões cirúrgicas de infraestrutura.' },
  { slug: 'inteligencia', label: 'Inteligência', desc: 'Predições de funil, concorrência e simulação de cenários.' },
];

const HUB_CONNECTOR_BUTTON_CLASS =
  'inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] bg-[#FF6B00] px-6 text-[14px] leading-none font-black text-white shadow-[0_10px_22px_rgba(255,107,0,0.30)] transition hover:brightness-105 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFBE94]';

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
  const { user, profile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('categoria');
  const contractedAgents = useMemo(() => getContractedAgentsFromProfile(profile), [profile]);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchesSearch = searchQuery
        ? agent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          agent.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
      const matchesCategoryFilter = categoryFilter
        ? slugifyAgentTitle(agent.category) === categoryFilter
        : true;
      return matchesSearch && matchesCategoryFilter;
    });
  }, [searchQuery, categoryFilter]);

  const totalVisibleAgents = filteredAgents.length;
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
    <div className="w-full space-y-6">
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-white/[0.06] py-8 mb-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#ff6a00]/10 border border-[#ff6a00]/20 text-[#ff6a00] shadow-[0_0_16px_rgba(255,106,0,0.08)] mt-1">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
              Laboratório de Agentes
            </h1>
            <p className="text-[#8fa0b5] text-[15px] font-medium mt-2 max-w-3xl leading-relaxed">
              Esta área centraliza a ativação dos agentes da sua operação, com foco em coerência estratégica, previsibilidade e impacto financeiro real.
            </p>
          </div>
        </div>
      </header>

      {/* Search Bar Container with Dark Glassmorphism styling */}
      <div className="rounded-3xl border border-[#FF6A00]/20 bg-[#0d1a2a]/40 backdrop-blur-md p-5 md:p-6 shadow-[0_8px_32px_rgba(255,106,0,0.04)]">
        <div className="relative w-full max-w-lg">
          <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            aria-label="Pesquisar agentes"
            placeholder="Pesquisar agentes por nome ou descrição…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-11 pr-10 rounded-[12px] border border-white/[0.12] bg-white/[0.06] text-[15px] font-medium text-white placeholder-slate-400 transition-all duration-300 focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FFBE94]/20 focus:bg-[#0d1a2a]/60"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-3 flex items-center px-1 text-slate-400 hover:text-white transition"
              aria-label="Limpar pesquisa"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>
      </div>

      {totalVisibleAgents === 0 ? (
        <div className="rounded-3xl border border-[#FF6A00]/20 bg-[#0d1a2a]/40 backdrop-blur-md p-12 text-center shadow-[0_8px_32px_rgba(255,106,0,0.04)]">
          <p className="text-lg font-black text-white">Nenhum agente encontrado</p>
          <p className="mt-1 text-sm text-slate-400">
            Não encontramos nenhum agente que corresponda à sua busca &quot;{searchQuery}&quot;.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-[12px] bg-[#FF6B00] px-5 text-sm font-black text-white shadow-[0_10px_20px_rgba(255,107,0,0.20)] hover:brightness-105 hover:scale-105 transition active:scale-95"
          >
            Limpar busca
          </button>
        </div>
      ) : null}

      {visibleCategories.map((category) => {
        const categoryAgents = filteredAgents.filter((agent) => agent.category === category.label);
        if (categoryAgents.length === 0) return null;

        const categoryTotalCount = categoryAgents.length;
        const categoryActiveCount = categoryAgents.filter((agent) => {
          const entry = getAgentEntryDefinition(agent, effectiveContracts);
          return entry.isActive;
        }).length;

        return (
          <section
            key={category.slug}
            className="overflow-hidden rounded-3xl border border-[#FF6A00]/20 bg-[#0d1a2a]/40 backdrop-blur-md shadow-[0_8px_32px_rgba(255,106,0,0.04)] text-white"
          >
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0d1a2a]/60 px-6 py-5 border-b border-[#FF6A00]/10">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse"></span>
                  <h2 className="text-[16px] md:text-[18px] font-black tracking-tight text-white">{category.label}</h2>
                </div>
                <p className="text-[12px] font-medium text-slate-300 leading-tight">
                  {category.desc}
                </p>
              </div>
              <div className="rounded-full border border-[#FF6A00] bg-[#FF6A00]/5 px-4 py-1.5 text-[16px] font-bold text-[#FF6A00] tracking-tight whitespace-nowrap">
                Ativos: {categoryActiveCount} de {categoryTotalCount}
              </div>
            </header>

            <div className="p-6 md:p-8">
              <div className="mt-0 grid grid-cols-1 lg:grid-cols-2 gap-3">
                {categoryAgents.map((agent) => {
                  const entry = getAgentEntryDefinition(agent, effectiveContracts);
                  const isActive = entry.isActive;
                  const agentSlug = slugifyAgentTitle(agent.title);
                  const isActivatable = ACTIVATABLE_AGENT_TITLES.has(agent.title);

                  return (
                    <article
                      key={agent.title}
                      className="group relative rounded-2xl border border-[#FF6A00]/20 border-l-gradient-orange border-l-transparent bg-[#0d1a2a]/40 backdrop-blur-md p-5 transition-all duration-300 hover:bg-[#0d1a2a]/70 hover:border-[#FF6A00]/40 hover:shadow-[0_0_32px_rgba(255,106,0,0.06)] flex flex-col h-full"
                    >
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-black text-white">{agent.title}</p>
                          {isActive ? (
                            <button
                              type="button"
                              onClick={() => setPendingDeactivateSlug(agentSlug)}
                              disabled={activatingSlug === agentSlug}
                              className="inline-flex items-center gap-1 text-[12px] font-black text-[#FF4D4D] hover:text-[#FF3333] transition-colors disabled:opacity-60"
                            >
                              <Power className="h-3.5 w-3.5" />
                              {activatingSlug === agentSlug ? 'Desativando…' : 'Desativar Agente'}
                            </button>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-slate-400">{agent.description}</p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {isActive ? (
                          <>
                            <button
                              type="button"
                              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] bg-[#0A9D57] px-6 text-[14px] leading-none font-black text-white shadow-[0_10px_22px_rgba(10,157,87,0.30)] hover:brightness-105 active:scale-95 transition-all"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Ativo
                            </button>
                            <Link
                              href={`/hub/agente/${agentSlug}`}
                              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] bg-[#0f62fe] px-6 text-[14px] leading-none font-black text-white shadow-[0_10px_22px_rgba(15,98,254,0.15)] transition-all hover:bg-[#0353e9] hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C5FD]"
                            >
                              <ExternalLink className="h-4 w-4" />
                              Acessar Agente
                            </Link>
                            <button
                              type="button"
                              onClick={() => setSelectedDetailsSlug(agentSlug)}
                              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] border border-white/10 bg-white/5 px-6 text-[14px] leading-none font-black text-white/80 transition-all hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95 shadow-sm"
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
                                {activatingSlug === agentSlug ? 'Ativando…' : 'Ativar Agente'}
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] bg-white/[0.04] border border-white/[0.08] px-6 text-[14px] leading-none font-bold text-slate-500 cursor-not-allowed opacity-60"
                              >
                                <Wrench className="h-4 w-4" />
                                em desenvolvimento
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setSelectedDetailsSlug(agentSlug)}
                              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] border border-white/10 bg-white/5 px-6 text-[14px] leading-none font-black text-white/80 transition-all hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95 shadow-sm"
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
            </div>
          </section>
        );
      })}

      {pendingDeactivateAgent ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setPendingDeactivateSlug(null)}
            className="absolute inset-0 bg-[#020816]/70 backdrop-blur-md transition-opacity duration-300"
            aria-label="Fechar confirmação"
          />
          <section className="relative w-full max-w-2xl rounded-[24px] border border-white/[0.12] bg-[#071a2e]/95 backdrop-blur-md p-6 md:p-8 shadow-[0_24px_60px_rgba(2,8,22,0.6)] text-white animate-in fade-in zoom-in-95 duration-250">
            <button
              type="button"
              onClick={() => setPendingDeactivateSlug(null)}
              className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition-all hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95 shadow-sm"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#FF4D4D]">Confirmar desativação</p>
            <h3 className="mt-1 text-3xl font-black tracking-tight text-white">{pendingDeactivateAgent.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Ao confirmar, o agente será desativado e deixará de aparecer como ativo até uma nova ativação.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPendingDeactivateSlug(null)}
                className="inline-flex h-11 items-center justify-center rounded-[12px] border border-white/10 bg-white/5 px-5 text-sm font-black text-white/80 hover:bg-white/10 hover:text-white transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() =>
                  deactivateAgent(pendingDeactivateAgent.title, slugifyAgentTitle(pendingDeactivateAgent.title))
                }
                disabled={activatingSlug === slugifyAgentTitle(pendingDeactivateAgent.title)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-[#FF4D4D] bg-[#FF4D4D] px-5 text-sm font-black text-white shadow-[0_10px_22px_rgba(255,77,77,0.30)] hover:brightness-105 active:scale-95 disabled:opacity-60 transition-all"
              >
                <Power className="h-4 w-4" />
                {activatingSlug === slugifyAgentTitle(pendingDeactivateAgent.title)
                  ? 'Desativando…'
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
            className="absolute inset-0 bg-[#020816]/70 backdrop-blur-md transition-opacity duration-300"
            aria-label="Fechar detalhes do agente"
          />
          <section className="relative w-full max-w-[780px] rounded-[24px] border border-white/[0.12] bg-[#071a2e]/95 backdrop-blur-md p-6 md:p-7 shadow-[0_30px_70px_rgba(2,12,27,0.6)] text-white animate-in fade-in zoom-in-95 duration-250">
            <button
              type="button"
              onClick={() => setSelectedDetailsSlug(null)}
              className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition-all hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95 shadow-sm"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-4 pr-14">
              <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-[16px] border-2 border-[#FF6B00] shadow-[0_10px_24px_rgba(2,12,27,0.18)]">
                <Image src={detailsAgent.icon} alt={detailsAgent.title} fill className="object-cover" sizes="76px" />
              </div>
              <div>
                <p className="pt-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#FF6B00]">Agente de IA</p>
                <h3 className="mt-1 text-[30px] leading-[1.05] font-black tracking-tight text-white sm:text-[38px] md:text-[44px]">{detailsAgent.title}</h3>
                <p className="mt-3 max-w-3xl text-[15px] leading-[1.45] text-slate-300 sm:text-[16px]">{detailsAgent.description}</p>
              </div>
            </div>

            <article className="mt-7 rounded-[18px] border border-white/[0.08] bg-[#051120]/60 p-5 md:p-6">
              <h4 className="text-[13px] font-black uppercase tracking-[0.08em] text-[#FF6B00]">Atividades relacionadas</h4>
              <ul className="mt-4 space-y-4 text-[15px] leading-[1.5] text-slate-300 sm:text-[16px]">
                {detailsContent.activities.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-[0.62em] inline-flex h-[7px] w-[7px] shrink-0 rounded-full bg-[#FF6B00]" />
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
            className="absolute inset-0 bg-[#020816]/70 backdrop-blur-md transition-opacity duration-300"
            aria-label="Fechar confirmação"
          />
          <section className="relative w-full max-w-2xl rounded-[24px] border border-white/[0.12] bg-[#071a2e]/95 backdrop-blur-md p-6 md:p-8 shadow-[0_24px_60px_rgba(2,8,22,0.6)] text-white animate-in fade-in zoom-in-95 duration-250">
            <button
              type="button"
              onClick={() => setPendingActivationSlug(null)}
              className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition-all hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95 shadow-sm"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#FF6B00]">Confirmar ativação</p>
            <h3 className="mt-1 text-3xl font-black tracking-tight text-white">{pendingAgent.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Você está prestes a ativar este agente. Confira como ficará a capacidade do plano ativo.
            </p>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white space-y-1">
              <p>
                <strong>Plano ativo:</strong> <span className="text-[#FF6B00]">{activePlanName}</span>
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
                className="inline-flex h-11 items-center justify-center rounded-[12px] border border-white/10 bg-white/5 px-5 text-sm font-black text-white/80 hover:bg-white/10 hover:text-white transition-all active:scale-95"
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
                {activatingSlug === slugifyAgentTitle(pendingAgent.title) ? 'Ativando…' : 'Confirmar ativação'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export default function LaboratorioAgentesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LaboratorioAgentesContent />
    </Suspense>
  );
}
