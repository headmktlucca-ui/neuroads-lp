'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ExternalLink, Info, Power, Search, Wrench, X } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { agents, type Agent } from '../../../data/agents';
import { getContractedAgentsFromProfile, slugifyAgentTitle } from '../../../lib/hub-agents';
import { readAgentStatusOverrides, writeAgentStatusOverrides } from '../../../lib/agent-status-cache';
import { getFirebaseDb } from '../../../lib/firebase';

const AGENT_CATEGORY_ORDER = ['Performance', 'Inteligência', 'Criativos', 'Técnico'] as const;

export default function HubDashboardPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [statusOverrides, setStatusOverrides] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingActivationSlug, setPendingActivationSlug] = useState<string | null>(null);
  const [pendingDeactivateSlug, setPendingDeactivateSlug] = useState<string | null>(null);
  const [updatingSlug, setUpdatingSlug] = useState<string | null>(null);
  const isAgentesAtivosPage = pathname === '/hub/agentes-ativos';

  useEffect(() => {
    if (!user) {
      setStatusOverrides({});
      return;
    }
    setStatusOverrides(readAgentStatusOverrides(user.uid));
  }, [user]);

  useEffect(() => {
    const refreshOnFocus = () => router.refresh();
    const refreshOnVisible = () => {
      if (document.visibilityState === 'visible') {
        router.refresh();
      }
    };
    window.addEventListener('focus', refreshOnFocus);
    document.addEventListener('visibilitychange', refreshOnVisible);
    return () => {
      window.removeEventListener('focus', refreshOnFocus);
      document.removeEventListener('visibilitychange', refreshOnVisible);
    };
  }, [router]);

  const contractedAgents = useMemo(() => getContractedAgentsFromProfile(profile), [profile]);
  const effectiveContracts = useMemo(() => {
    if (Object.keys(statusOverrides).length === 0) return contractedAgents;

    const merged = new Map(contractedAgents);
    for (const [title, isActive] of Object.entries(statusOverrides)) {
      const current = merged.get(title) ?? { isActive: false };
      merged.set(title, { ...current, isActive });
    }
    return merged;
  }, [contractedAgents, statusOverrides]);
  
  const activeAgents = useMemo(() => {
    const activeTitles = new Set(
      Array.from(effectiveContracts.entries())
        .filter(([, entry]) => entry.isActive)
        .map(([title]) => title)
    );

    return agents.filter((agent) => activeTitles.has(agent.title));
  }, [effectiveContracts]);

  const filteredActiveAgents = useMemo(() => {
    return activeAgents.filter((agent) => {
      if (!searchQuery) return true;
      return (
        agent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [activeAgents, searchQuery]);

  const activeAgentsGroupedByCategory = useMemo(() => {
    const groups = new Map<string, typeof filteredActiveAgents>();

    for (const agent of filteredActiveAgents) {
      const category = agent.category || 'Sem categoria';
      const categoryAgents = groups.get(category) ?? [];
      categoryAgents.push(agent);
      groups.set(category, categoryAgents);
    }

    const knownCategories = AGENT_CATEGORY_ORDER.filter((category) => groups.has(category));
    const extraCategories = Array.from(groups.keys())
      .filter((category) => !AGENT_CATEGORY_ORDER.includes(category as (typeof AGENT_CATEGORY_ORDER)[number]))
      .sort((a, b) => a.localeCompare(b, 'pt-BR'));
    const sortedCategories = [...knownCategories, ...extraCategories];

    return sortedCategories.map((category) => ({
      category,
      agents: groups.get(category) ?? [],
    }));
  }, [filteredActiveAgents]);

  const recommendedAgents = useMemo(() => {
    const activeTitles = new Set(activeAgents.map((agent) => agent.title));
    return agents.filter((agent) => !activeTitles.has(agent.title)).slice(0, 4);
  }, [activeAgents]);

  const pendingDeactivateAgent = pendingDeactivateSlug
    ? activeAgents.find((agent) => slugifyAgentTitle(agent.title) === pendingDeactivateSlug) ?? null
    : null;
  const pendingActivationAgent = pendingActivationSlug
    ? recommendedAgents.find((agent) => slugifyAgentTitle(agent.title) === pendingActivationSlug) ?? null
    : null;

  const activeAgentCardClass = 'rounded-xl border border-white/[0.08] bg-[#051120]/60 p-4 hover:border-white/[0.16] hover:bg-[#051120]/80 transition-all duration-200';

  const renderActiveAgentCard = (agent: Agent) => (
    <article key={agent.title} className={activeAgentCardClass}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-black text-white">{agent.title}</p>
        <button
          type="button"
          onClick={() => setPendingDeactivateSlug(slugifyAgentTitle(agent.title))}
          disabled={updatingSlug === slugifyAgentTitle(agent.title)}
          className="inline-flex items-center gap-1 text-[12px] font-black text-[#FF4D4D] hover:text-[#FF3333] transition-colors disabled:opacity-60"
        >
          <Power className="h-3.5 w-3.5" />
          {updatingSlug === slugifyAgentTitle(agent.title) ? 'Desativando…' : 'Desativar Agente'}
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-400">{agent.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] bg-[#0A9D57] px-6 text-[14px] leading-none font-black text-white shadow-[0_10px_22px_rgba(10,157,87,0.30)] hover:brightness-105 active:scale-95 transition-all"
        >
          <CheckCircle2 className="h-4 w-4" />
          Ativo
        </button>
        <Link
          href={`/hub/agente/${slugifyAgentTitle(agent.title)}`}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] bg-[#0f62fe] px-6 text-[14px] leading-none font-black text-white shadow-[0_10px_22px_rgba(15,98,254,0.15)] transition-all hover:bg-[#0353e9] hover:scale-105 active:scale-95"
        >
          <ExternalLink className="h-4 w-4" />
          Acessar Agente
        </Link>
        <Link
          href={`/hub/agente/${slugifyAgentTitle(agent.title)}`}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] border border-white/10 bg-white/5 px-6 text-[14px] leading-none font-black text-white/80 transition-all hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95 shadow-sm"
        >
          <Info className="h-4 w-4" />
          Mais detalhes
        </Link>
      </div>
    </article>
  );

  const activateAgent = async (agentTitle: string, agentSlug: string) => {
    if (!user) return;
    setUpdatingSlug(agentSlug);
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
      setUpdatingSlug(null);
    }
  };

  const deactivateAgent = async (agentTitle: string, agentSlug: string) => {
    if (!user) return;
    setUpdatingSlug(agentSlug);
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
      setUpdatingSlug(null);
    }
  };

  return (
    <div className="w-full space-y-6 text-white">
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ff6a00]/15 border border-[#ff6a00]/20 text-[#ff6a00]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white leading-none">
              {isAgentesAtivosPage ? 'Agentes Ativos' : 'Hub de Agentes'}
            </h1>
            <p className="text-[12px] font-semibold text-[#7eb8d4]/80 mt-1 max-w-2xl">
              {isAgentesAtivosPage
                ? 'Visibilidade operacional dos agentes em execução, com status e impacto em dados reais para decisões mais rápidas.'
                : 'Visualização inicial dos agentes atualmente ativos na sua conta.'}
            </p>
            <p className="text-[11px] font-bold text-[#FF6A00] mt-1">
              Foco em ativação contínua, menos gargalos operacionais e crescimento previsível no caixa.
            </p>
          </div>
        </div>
        <div className="flex items-center shrink-0">
          <Link
            href="/hub/laboratorio-agentes"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] border border-[#FF6A00] bg-[#FF6A00] px-6 text-[14px] leading-none font-black text-white shadow-[0_10px_22px_rgba(255,107,0,0.30)] transition hover:brightness-105 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB98E]"
          >
            <Wrench className="h-4 w-4" />
            Acessar Laboratório
          </Link>
        </div>
      </header>

      <div className="rounded-3xl border border-white/[0.10] bg-[#071a2e]/82 p-5 md:p-6 shadow-[0_8px_32px_rgba(2,8,22,0.4)]">
        <div className="relative w-full max-w-lg">
          <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            aria-label="Pesquisar agentes ativos"
            placeholder="Pesquisar agentes ativos por nome ou descrição…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-11 pr-10 rounded-[12px] border border-white/[0.12] bg-white/[0.06] text-[15px] font-medium text-white placeholder-slate-400 transition-all duration-300 focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FFBE94]/20 focus:bg-[#071a2e]"
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

      {searchQuery && filteredActiveAgents.length === 0 ? (
        <div className="rounded-3xl border border-white/[0.10] bg-[#071a2e]/82 p-12 text-center shadow-[0_8px_32px_rgba(2,8,22,0.4)]">
          <p className="text-lg font-black text-white">Nenhum agente ativo encontrado</p>
          <p className="mt-1 text-sm text-slate-400">
            Não encontramos nenhum agente ativo correspondente à busca &quot;{searchQuery}&quot;.
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

      {isAgentesAtivosPage ? (
        filteredActiveAgents.length > 0 ? (
          <div className="space-y-6">
            {activeAgentsGroupedByCategory.map(({ category, agents: categoryAgents }) => (
              <section
                key={category}
                className="relative overflow-hidden rounded-3xl border border-white/[0.10] bg-[#071a2e]/82 shadow-[0_8px_32px_rgba(2,8,22,0.4)]"
              >
                <header className="bg-[#091624] px-6 py-5 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
                      <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                        {category}
                      </h2>
                    </div>
                    <p className="text-xs font-semibold text-slate-300">
                      Agentes ativos da vertical de {category}.
                    </p>
                  </div>
                  <span className="border border-[#FF6A00] bg-[#FF6A00]/5 text-[#FF6A00] rounded-full px-3 py-1 text-[11px] font-bold whitespace-nowrap">
                    Ativos: {categoryAgents.length}
                  </span>
                </header>

                <div className="p-6 md:p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {categoryAgents.map((agent) => renderActiveAgentCard(agent))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        ) : (
          !searchQuery ? (
            <section className="rounded-3xl border border-white/[0.10] bg-[#071a2e]/82 p-6 md:p-8 shadow-[0_8px_32px_rgba(2,8,22,0.4)]">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-300">
                Nenhum agente ativo no momento.
              </div>
            </section>
          ) : null
        )
      ) : (
        <section className="relative overflow-hidden rounded-3xl border border-white/[0.10] bg-[#071a2e]/82 shadow-[0_8px_32px_rgba(2,8,22,0.4)]">
          <header className="bg-[#091624] px-6 py-5 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  Agentes ativos
                </h2>
              </div>
              <p className="text-xs font-semibold text-slate-300">
                Verticalização dos processos operacionais inteligentes em execução.
              </p>
            </div>
            <span className="border border-[#FF6A00] bg-[#FF6A00]/5 text-[#FF6A00] rounded-full px-3 py-1 text-[11px] font-bold whitespace-nowrap">
              Ativos na conta: {filteredActiveAgents.length}
            </span>
          </header>

          <div className="p-6 md:p-8">
            {filteredActiveAgents.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {filteredActiveAgents.map((agent) => renderActiveAgentCard(agent))}
              </div>
            ) : (
              !searchQuery ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-300">
                  Nenhum agente ativo no momento.
                </div>
              ) : null
            )}
          </div>
        </section>
      )}

      <section className="relative overflow-hidden mt-6 rounded-3xl border border-white/[0.10] bg-[#071a2e]/82 shadow-[0_8px_32px_rgba(2,8,22,0.4)] text-white">
        <header className="bg-[#091624] px-6 py-5 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#FF6A00] animate-pulse" />
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Agentes recomendados
              </h2>
            </div>
            <p className="text-xs font-semibold text-slate-300">
              Acelere decisões e reduza desperdício ativando novos agentes.
            </p>
          </div>
          <span className="border border-[#FF6A00] bg-[#FF6A00]/5 text-[#FF6A00] rounded-full px-3 py-1 text-[11px] font-bold whitespace-nowrap">
            Sugestões: {recommendedAgents.length}
          </span>
        </header>

        <div className="p-6 md:p-8">
          <p className="text-sm md:text-base text-slate-300 mb-6">
            Ao ativar estes agentes, sua operação tende a ganhar mais previsibilidade de demanda, redução de desperdício e maior velocidade de decisão com base em dados reais.
          </p>

          {recommendedAgents.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {recommendedAgents.map((agent) => (
                <article
                  key={agent.title}
                  className="rounded-xl border border-white/[0.08] bg-[#051120]/60 p-4 transition-all hover:border-white/[0.16] hover:bg-[#051120]/80 duration-200"
                >
                  <p className="text-sm font-black text-white">{agent.title}</p>
                  <p className="mt-1 text-xs text-slate-400">{agent.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setPendingActivationSlug(slugifyAgentTitle(agent.title))}
                      disabled={updatingSlug === slugifyAgentTitle(agent.title)}
                      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] border border-[#FF6B00] bg-[#FF6B00] px-6 text-[14px] leading-none font-black text-white shadow-[0_10px_22px_rgba(255,107,0,0.30)] transition hover:brightness-105 hover:scale-105 active:scale-95 disabled:opacity-60"
                    >
                      <Wrench className="h-4 w-4" />
                      {updatingSlug === slugifyAgentTitle(agent.title) ? 'Ativando…' : 'Ativar Agente'}
                    </button>
                    <Link
                      href={`/hub/laboratorio-agentes?agente=${slugifyAgentTitle(agent.title)}`}
                      className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] px-6 text-[14px] leading-none font-black transition border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95 shadow-sm"
                    >
                      <Info className="h-4 w-4" />
                      Mais detalhes
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-white/10 bg-[#0A1E3D] text-[#C6D3E9] p-5 text-sm">
              Todos os agentes disponíveis já estão ativos na conta.
            </div>
          )}
        </div>
      </section>

      {pendingActivationAgent ? (
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
            <h3 className="mt-1 text-3xl font-black tracking-tight text-white">{pendingActivationAgent.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Ao confirmar, o agente será ativado e passará a aparecer na lista de ativos.
            </p>

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
                onClick={() => activateAgent(pendingActivationAgent.title, slugifyAgentTitle(pendingActivationAgent.title))}
                disabled={updatingSlug === slugifyAgentTitle(pendingActivationAgent.title)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-[#FF6B00] bg-[#FF6B00] px-5 text-sm font-black text-white shadow-[0_10px_22px_rgba(255,107,0,0.30)] disabled:opacity-60 transition-all hover:scale-105 active:scale-95"
              >
                <Wrench className="h-4 w-4" />
                {updatingSlug === slugifyAgentTitle(pendingActivationAgent.title) ? 'Ativando…' : 'Confirmar ativação'}
              </button>
            </div>
          </section>
        </div>
      ) : null}

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
              Ao confirmar, o agente será desativado e deixará de aparecer na lista de ativos até uma nova ativação.
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
                onClick={() => deactivateAgent(pendingDeactivateAgent.title, slugifyAgentTitle(pendingDeactivateAgent.title))}
                disabled={updatingSlug === slugifyAgentTitle(pendingDeactivateAgent.title)}
                className="inline-flex h-11 items-center justify-center rounded-[12px] border border-[#FF4D4D] bg-[#FF4D4D] px-5 text-sm font-black text-white shadow-[0_10px_22px_rgba(180,35,24,0.30)] disabled:opacity-60 transition-all hover:scale-105 active:scale-95"
              >
                {updatingSlug === slugifyAgentTitle(pendingDeactivateAgent.title) ? 'Desativando…' : 'Confirmar desativação'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
