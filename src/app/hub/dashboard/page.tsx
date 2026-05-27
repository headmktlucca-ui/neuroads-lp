'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, ExternalLink, Info, Power, Search, Wrench, X } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import LuccaHubSupportWidget from '../../../components/hub/LuccaHubSupportWidget';
import { useAuth } from '../../../context/AuthContext';
import { agents, type Agent } from '../../../data/agents';
import { getContractedAgentsFromProfile, slugifyAgentTitle } from '../../../lib/hub-agents';
import { readAgentStatusOverrides, writeAgentStatusOverrides } from '../../../lib/agent-status-cache';
import { getHubLoginRedirect, getHubOnboardingRedirect, resolveHubAccessState } from '../../../lib/hub-access';
import { getFirebaseDb } from '../../../lib/firebase';

const AGENT_CATEGORY_ORDER = ['Performance', 'Inteligência', 'Criativos', 'Técnico'] as const;

export default function HubDashboardPage() {
  const { user, profile, loading, premiumSyncing } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [statusOverrides, setStatusOverrides] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [pendingActivationSlug, setPendingActivationSlug] = useState<string | null>(null);
  const [pendingDeactivateSlug, setPendingDeactivateSlug] = useState<string | null>(null);
  const [updatingSlug, setUpdatingSlug] = useState<string | null>(null);
  const isAgentesAtivosPage = pathname === '/hub/agentes-ativos';
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
  const activeAgentCardClass = isAgentesAtivosPage
    ? 'rounded-xl border border-border bg-bg-secondary p-4'
    : 'rounded-[12px] border border-[#D3DAE6] bg-[#F2F4F8] p-5';

  const renderActiveAgentCard = (agent: Agent) => (
    <article key={agent.title} className={activeAgentCardClass}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-black text-text-main">{agent.title}</p>
        <button
          type="button"
          onClick={() => setPendingDeactivateSlug(slugifyAgentTitle(agent.title))}
          disabled={updatingSlug === slugifyAgentTitle(agent.title)}
          className="inline-flex items-center gap-1 text-[12px] font-black text-[#B42318] hover:text-[#912018] disabled:opacity-60"
        >
          <Power className="h-3.5 w-3.5" />
          {updatingSlug === slugifyAgentTitle(agent.title) ? 'Desativando...' : 'Desativar Agente'}
        </button>
      </div>
      <p className="mt-2 text-xs text-text-muted">{agent.description}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] bg-[#0A9D57] px-6 text-[14px] leading-none font-black text-white shadow-[0_10px_22px_rgba(10,157,87,0.30)]"
        >
          <CheckCircle2 className="h-4 w-4" />
          Ativo
        </button>
        <Link
          href={`/hub/agente/${slugifyAgentTitle(agent.title)}`}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] bg-[#2563EB] px-6 text-[14px] leading-none font-black text-white shadow-[0_10px_22px_rgba(37,99,235,0.30)] transition hover:brightness-105"
        >
          <ExternalLink className="h-4 w-4" />
          Acessar Agente
        </Link>
        <Link
          href={`/hub/agente/${slugifyAgentTitle(agent.title)}`}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] border border-[#D3DAE6] bg-white px-6 text-[14px] leading-none font-black text-[#344054] shadow-[0_8px_16px_rgba(15,23,42,0.08)] transition hover:bg-[#F8FAFC]"
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

  if (accessState !== 'allowed') {
    return (
      <div className="min-h-screen bg-bg-main flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        {isSyncingAccess ? (
          <div className="max-w-md rounded-2xl border border-[#FFD7BD] bg-[#FFF6EF] px-4 py-3 text-center">
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#C2410C]">Configurando seu acesso</p>
            <p className="mt-1 text-[13px] text-[#9A3412]">
              Estamos preparando seu ambiente no Hub Estratégico.
            </p>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-bg-main">
      <Navbar />

      <div className="flex-grow pt-24 md:pt-40 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none bg-top bg-repeat-y bg-[length:100%_auto]"
          style={{ backgroundImage: "url('/images/background_hub_repeat_flow.png')" }}
        />
        <div className="relative z-10 wrap py-8 md:py-12">
          <header className="relative overflow-hidden rounded-3xl border border-[#122034] bg-[#040a13] p-6 md:p-8 shadow-[0_16px_40px_rgba(2,8,22,0.35)]">
            <Image
              src="/images/template-match/metrics-wave-v1.png"
              alt=""
              fill
              className="pointer-events-none object-cover object-bottom opacity-[1]"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,15,0.9)_0%,rgba(3,8,15,0.92)_40%,rgba(3,8,15,0.14)_100%)]" />

            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-[30px] leading-[1.1] font-black tracking-tight text-white sm:text-[34px] md:text-[36px]">
                  <span
                    className="bg-[length:200%_200%] bg-clip-text text-transparent"
                    style={{ backgroundImage: 'linear-gradient(135deg, #ff9a35 0%, #ff6a00 55%, #c84a00 100%)' }}
                  >
                    {isAgentesAtivosPage ? 'Agentes Ativos' : 'Hub de Agentes'}
                  </span>
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#C6D3E9] md:text-lg">
                  {isAgentesAtivosPage
                    ? 'Visibilidade operacional dos agentes em execução, com status e impacto em dados reais para decisões mais rápidas.'
                    : 'Visualização inicial dos agentes atualmente ativos na sua conta.'}
                </p>
                <p className="mt-2 text-sm font-semibold text-[#FF6A00]">
                  Foco em ativação contínua, menos gargalos operacionais e crescimento previsível no caixa.
                </p>
              </div>
              <Link
                href="/hub/laboratorio-agentes"
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] border border-[#FF6A00] bg-[#FF6A00] px-6 text-[14px] leading-none font-black text-white shadow-[0_10px_22px_rgba(255,107,0,0.30)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB98E]"
              >
                <Wrench className="h-4 w-4" />
                Acessar Laboratório
              </Link>
            </div>
          </header>

          <div className="mt-6 rounded-3xl glassmorphism-light p-5 md:p-6">
            <div className="relative w-full max-w-lg">
              <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-text-muted">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Pesquisar agentes ativos por nome ou descrição..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-11 pr-10 rounded-[12px] border border-[#D3DAE6] bg-[#F8FAFC] text-[15px] font-medium text-text-main placeholder-[#94A3B8] transition-all duration-300 focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FFBE94]/50 focus:bg-white"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-3 flex items-center px-1 text-text-muted hover:text-text-main transition"
                  aria-label="Limpar pesquisa"
                >
                  <X size={16} />
                </button>
              ) : null}
            </div>
          </div>

          {searchQuery && filteredActiveAgents.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-border bg-white p-12 text-center shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
              <p className="text-lg font-black text-text-main">Nenhum agente ativo encontrado</p>
              <p className="mt-1 text-sm text-text-muted">
                Não encontramos nenhum agente ativo correspondente à busca &quot;{searchQuery}&quot;.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-[12px] bg-[#FF6B00] px-5 text-sm font-black text-white shadow-[0_10px_20px_rgba(255,107,0,0.20)] hover:brightness-105 transition"
              >
                Limpar busca
              </button>
            </div>
          ) : null}

          {isAgentesAtivosPage ? (
            filteredActiveAgents.length > 0 ? (
              <div className="mt-6 space-y-6">
                {activeAgentsGroupedByCategory.map(({ category, agents: categoryAgents }) => (
                  <section
                    key={category}
                    className="relative overflow-hidden rounded-3xl border border-border bg-white shadow-[0_14px_34px_rgba(15,23,42,0.05)]"
                  >
                    <header className="bg-[#0d1e3d] px-6 py-5 border-b border-[#1a365d]/40 flex flex-wrap items-center justify-between gap-4">
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
                <section className="mt-6 rounded-3xl border border-border bg-white p-6 md:p-8 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
                  <div className="rounded-2xl border border-border bg-[#FCFCFD] p-5 text-sm text-text-muted">
                    Nenhum agente ativo no momento.
                  </div>
                </section>
              ) : null
            )
          ) : (
            <section className="relative overflow-hidden rounded-3xl border border-border bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
              <header className="bg-[#0d1e3d] px-6 py-5 border-b border-[#1a365d]/40 flex flex-wrap items-center justify-between gap-4">
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
                    <div className="rounded-2xl border border-border bg-[#FCFCFD] p-5 text-sm text-text-muted">
                      Nenhum agente ativo no momento.
                    </div>
                  ) : null
                )}
              </div>
            </section>
          )}

          <section
            className={`relative overflow-hidden mt-6 rounded-3xl ${
              isAgentesAtivosPage
                ? 'border border-[#183A6B] bg-[linear-gradient(130deg,#071632_0%,#0A1D3F_55%,#081832_100%)] shadow-[0_18px_44px_rgba(2,8,22,0.36)]'
                : 'border border-border bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]'
            }`}
          >
            <header className="bg-[#0d1e3d] px-6 py-5 border-b border-[#1a365d]/40 flex flex-wrap items-center justify-between gap-4">
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
              <p className={`text-sm md:text-base ${isAgentesAtivosPage ? 'text-[#C6D3E9]' : 'text-text-muted'} mb-6`}>
                Ao ativar estes agentes, sua operação tende a ganhar mais previsibilidade de demanda, redução de desperdício e maior velocidade de decisão com base em dados reais.
              </p>

            {recommendedAgents.length > 0 ? (
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-3">
                {recommendedAgents.map((agent) => (
                  <article
                    key={agent.title}
                    className={`rounded-xl border p-4 ${
                      isAgentesAtivosPage
                        ? 'border-[#264671] bg-[linear-gradient(150deg,#0C2144_0%,#0A1E3D_100%)] shadow-[0_14px_28px_rgba(1,9,23,0.34)]'
                        : 'border-border bg-bg-secondary'
                    }`}
                  >
                    <p className={`text-sm font-black ${isAgentesAtivosPage ? 'text-white' : 'text-text-main'}`}>{agent.title}</p>
                    <p className={`mt-1 text-xs ${isAgentesAtivosPage ? 'text-[#C6D3E9]' : 'text-text-muted'}`}>{agent.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setPendingActivationSlug(slugifyAgentTitle(agent.title))}
                        disabled={updatingSlug === slugifyAgentTitle(agent.title)}
                        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] border border-[#FF6B00] bg-[#FF6B00] px-6 text-[14px] leading-none font-black text-white shadow-[0_10px_22px_rgba(255,107,0,0.30)] transition hover:brightness-105 disabled:opacity-60"
                      >
                        <Wrench className="h-4 w-4" />
                        {updatingSlug === slugifyAgentTitle(agent.title) ? 'Ativando...' : 'Ativar Agente'}
                      </button>
                      <Link
                        href={`/hub/laboratorio-agentes?agente=${slugifyAgentTitle(agent.title)}`}
                        className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] px-6 text-[14px] leading-none font-black transition ${
                          isAgentesAtivosPage
                            ? 'border border-[#2A4870] bg-[#10284C] text-[#E8F1FF] shadow-[0_10px_22px_rgba(2,8,22,0.32)] hover:bg-[#15315D]'
                            : 'border border-[#D3DAE6] bg-white text-[#344054] shadow-[0_8px_16px_rgba(15,23,42,0.08)] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <Info className="h-4 w-4" />
                        Mais detalhes
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div
                className={`rounded-2xl border p-5 text-sm ${
                  isAgentesAtivosPage
                    ? 'border-[#264671] bg-[#0A1E3D] text-[#C6D3E9]'
                    : 'border-border bg-[#FCFCFD] text-text-muted'
                }`}
              >
                Todos os agentes disponíveis já estão ativos na conta.
              </div>
            )}
          </div>
        </section>

          {isAgentesAtivosPage ? (
            <div className="relative z-10 mt-6 [&>footer]:!bg-transparent [&>footer]:!backdrop-blur-none">
              <Footer />
            </div>
          ) : null}
        </div>
      </div>

      {pendingActivationAgent ? (
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
            <h3 className="mt-1 text-3xl font-black tracking-tight text-text-main">{pendingActivationAgent.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">
              Ao confirmar, o agente será ativado e passará a aparecer na lista de ativos.
            </p>

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
                onClick={() => activateAgent(pendingActivationAgent.title, slugifyAgentTitle(pendingActivationAgent.title))}
                disabled={updatingSlug === slugifyAgentTitle(pendingActivationAgent.title)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-[#FF6B00] bg-[#FF6B00] px-5 text-sm font-black text-white shadow-[0_10px_22px_rgba(255,107,0,0.30)] disabled:opacity-60"
              >
                <Wrench className="h-4 w-4" />
                {updatingSlug === slugifyAgentTitle(pendingActivationAgent.title) ? 'Ativando...' : 'Confirmar ativação'}
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
              Ao confirmar, o agente será desativado e deixará de aparecer na lista de ativos até uma nova ativação.
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
                onClick={() => deactivateAgent(pendingDeactivateAgent.title, slugifyAgentTitle(pendingDeactivateAgent.title))}
                disabled={updatingSlug === slugifyAgentTitle(pendingDeactivateAgent.title)}
                className="inline-flex h-11 items-center justify-center rounded-[12px] border border-[#B42318] bg-[#B42318] px-5 text-sm font-black text-white shadow-[0_10px_22px_rgba(180,35,24,0.30)] disabled:opacity-60"
              >
                {updatingSlug === slugifyAgentTitle(pendingDeactivateAgent.title) ? 'Desativando...' : 'Confirmar desativação'}
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {!isAgentesAtivosPage ? <Footer /> : null}
      <LuccaHubSupportWidget />
    </main>
  );
}
