'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Search, Wrench, X } from 'lucide-react';
import AgentCard from '../../../components/hub/AgentCard';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { agents } from '../../../data/agents';
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
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-hub-accent)]/15 border border-[var(--color-hub-border-accent)] text-[var(--color-hub-accent)]">
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
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] border border-[var(--color-hub-accent)] bg-[var(--color-hub-accent)] px-6 text-[14px] leading-none font-black text-white shadow-[var(--shadow-btn-orange)] transition hover:brightness-105 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-hub-accent)]/30"
          >
            <Wrench className="h-4 w-4" />
            Acessar Laboratório
          </Link>
        </div>
      </header>

      <div className="rounded-3xl border border-[var(--color-hub-border-accent)] bg-[var(--color-hub-deep)] backdrop-blur-md p-5 md:p-6 shadow-[var(--shadow-hub-card)]">
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
            className="w-full h-11 pl-11 pr-10 rounded-[12px] border border-[var(--color-hub-border-strong)] bg-white/[0.06] text-[15px] font-medium text-white placeholder-slate-400 transition-all duration-300 focus:outline-none focus:border-[var(--color-hub-accent)] focus:ring-2 focus:ring-[var(--color-hub-accent)]/20 focus:bg-[var(--color-hub-base)]"
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
        <div className="rounded-3xl border border-[var(--color-hub-border-accent)] bg-[var(--color-hub-deep)] backdrop-blur-md p-12 text-center shadow-[var(--shadow-hub-card)]">
          <p className="text-lg font-black text-white">Nenhum agente ativo encontrado</p>
          <p className="mt-1 text-sm text-slate-400">
            Não encontramos nenhum agente ativo correspondente à busca &quot;{searchQuery}&quot;.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-4 inline-flex h-11 items-center justify-center rounded-[12px] bg-[var(--color-hub-accent)] px-6 text-[14px] leading-none font-black text-white shadow-[var(--shadow-btn-orange)] hover:brightness-105 hover:scale-105 transition active:scale-95"
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
                className="relative overflow-hidden rounded-3xl border border-[var(--color-hub-border-accent)] bg-[var(--color-hub-deep)] backdrop-blur-md shadow-[var(--shadow-hub-card)]"
              >
                <header className="bg-[var(--color-hub-header)] px-6 py-5 border-b border-[var(--color-hub-border)] flex flex-wrap items-center justify-between gap-4">
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
                    {categoryAgents.map((agent) => (
                    <AgentCard
                      key={agent.title}
                      title={agent.title}
                      description={agent.description}
                      slug={slugifyAgentTitle(agent.title)}
                      isActive
                      variant="dashboard"
                      isUpdating={updatingSlug === slugifyAgentTitle(agent.title)}
                      onDeactivate={() => setPendingDeactivateSlug(slugifyAgentTitle(agent.title))}
                    />
                  ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        ) : (
          !searchQuery ? (
            <section className="rounded-3xl border border-[var(--color-hub-border-accent)] bg-[var(--color-hub-deep)] backdrop-blur-md p-6 md:p-8 shadow-[var(--shadow-hub-card)]">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-300">
                Nenhum agente ativo no momento.
              </div>
            </section>
          ) : null
        )
      ) : (
        <section className="relative overflow-hidden rounded-3xl border border-[var(--color-hub-border-accent)] bg-[var(--color-hub-deep)] backdrop-blur-md shadow-[var(--shadow-hub-card)]">
          <header className="bg-[var(--color-hub-header)] px-6 py-5 border-b border-[var(--color-hub-border)] flex flex-wrap items-center justify-between gap-4">
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
                {filteredActiveAgents.map((agent) => (
                <AgentCard
                  key={agent.title}
                  title={agent.title}
                  description={agent.description}
                  slug={slugifyAgentTitle(agent.title)}
                  isActive
                  variant="dashboard"
                  isUpdating={updatingSlug === slugifyAgentTitle(agent.title)}
                  onDeactivate={() => setPendingDeactivateSlug(slugifyAgentTitle(agent.title))}
                />
              ))}
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

      <section className="relative overflow-hidden mt-6 rounded-3xl border border-[var(--color-hub-border-accent)] bg-[var(--color-hub-deep)] backdrop-blur-md shadow-[var(--shadow-hub-card)] text-white">
        <header className="bg-[var(--color-hub-header)] px-6 py-5 border-b border-[var(--color-hub-border)] flex flex-wrap items-center justify-between gap-4">
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
                <AgentCard
                  key={agent.title}
                  title={agent.title}
                  description={agent.description}
                  slug={slugifyAgentTitle(agent.title)}
                  isActive={false}
                  variant="dashboard"
                  isActivatable={agent.isActivatable}
                  isUpdating={updatingSlug === slugifyAgentTitle(agent.title)}
                  onActivate={() => setPendingActivationSlug(slugifyAgentTitle(agent.title))}
                />
              ))}            </div>
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
          <section className="relative w-full max-w-2xl rounded-[24px] border border-[var(--color-hub-border-strong)] bg-[var(--color-hub-deep)]/95 backdrop-blur-md p-6 md:p-8 shadow-[var(--shadow-hub-card)] text-white animate-in fade-in zoom-in-95 duration-250">
            <button
              type="button"
              onClick={() => setPendingActivationSlug(null)}
              className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition-all hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95 shadow-sm"
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
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-[var(--color-hub-accent)] bg-[var(--color-hub-accent)] px-6 text-[14px] leading-none font-black text-white shadow-[var(--shadow-btn-orange)] disabled:opacity-60 transition-all hover:scale-105 active:scale-95"
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
          <section className="relative w-full max-w-2xl rounded-[24px] border border-[var(--color-hub-border-strong)] bg-[var(--color-hub-deep)]/95 backdrop-blur-md p-6 md:p-8 shadow-[var(--shadow-hub-card)] text-white animate-in fade-in zoom-in-95 duration-250">
            <button
              type="button"
              onClick={() => setPendingDeactivateSlug(null)}
              className="absolute right-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition-all hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95 shadow-sm"
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
                className="inline-flex h-11 items-center justify-center rounded-[12px] border border-[var(--color-hub-danger)] bg-[var(--color-hub-danger)] px-6 text-[14px] leading-none font-black text-white shadow-[var(--shadow-btn-orange)] disabled:opacity-60 transition-all hover:scale-105 active:scale-95"
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
