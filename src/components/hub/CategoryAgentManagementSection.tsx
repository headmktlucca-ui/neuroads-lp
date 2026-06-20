'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ExternalLink, Info, Power, Wrench, X } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { agents } from '../../data/agents';
import { getAgentEntryDefinition, getContractedAgentsFromProfile, slugifyAgentTitle } from '../../lib/hub-agents';
import { readAgentStatusOverrides, writeAgentStatusOverrides } from '../../lib/agent-status-cache';
import { useAuth } from '../../context/AuthContext';
import { getFirebaseDb } from '../../lib/firebase';

export type AgentCategorySlug = 'performance' | 'criativos' | 'tecnico' | 'inteligencia';

const CATEGORY_META: Record<
  AgentCategorySlug,
  { label: string; summary: string; financialImpact: string }
> = {
  performance: {
    label: 'Performance',
    summary: 'Gestão de agentes voltados para mídia, escala e eficiência de aquisição.',
    financialImpact: 'Foco em reduzir desperdício e aumentar retorno por real investido.',
  },
  criativos: {
    label: 'Criativos',
    summary: 'Gestão de agentes para produção de criativos, copies e testes de mensagem.',
    financialImpact: 'Foco em melhorar taxa de clique, conversão e custo por lead.',
  },
  tecnico: {
    label: 'Técnico',
    summary: 'Gestão de agentes para tracking, funil, testes estruturados e estabilidade operacional.',
    financialImpact: 'Foco em precisão de dados e ganhos de eficiência no caixa.',
  },
  inteligencia: {
    label: 'Inteligência',
    summary: 'Gestão de agentes de análise estratégica, GEO/SEO e leitura de cenário.',
    financialImpact: 'Foco em decisões com dados reais e crescimento previsível.',
  },
};

const HUB_CONNECTOR_BUTTON_CLASS =
  'inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] bg-[#FF6B00] px-6 text-[14px] leading-none font-black text-white shadow-[0_10px_22px_rgba(255,107,0,0.30)] transition hover:brightness-105 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFBE94]';

const HUB_HEADER_LAB_BUTTON_CLASS =
  'inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] border border-[#FF6A00] bg-[#FF6A00] px-6 text-[14px] leading-none font-black text-white shadow-[0_10px_22px_rgba(255,107,0,0.30)] transition hover:brightness-105 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB98E]';

function buildActivities(longDescription: string): string[] {
  const cleaned = longDescription.replace(/\s+/g, ' ').trim();
  const parts = cleaned
    .split('.')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length >= 2) return parts;
  if (parts.length === 1) return [parts[0], 'Gera recomendações práticas para acelerar decisões com foco em resultado financeiro.'];
  return [
    'Analisa os principais sinais de desempenho da operação em tempo real.',
    'Transforma dados em sugestões práticas para ganho de eficiência e escala previsível.',
  ];
}

export default function CategoryAgentManagementSection({ categorySlug }: { categorySlug: AgentCategorySlug }) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const category = CATEGORY_META[categorySlug];
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
  const [deactivatingSlug, setDeactivatingSlug] = useState<string | null>(null);
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

  const categoryAgents = useMemo(() => {
    return agents
      .filter((agent) => agent.category === category.label)
      .map((agent) => {
        const entry = getAgentEntryDefinition(agent, effectiveContracts);
        return { agent, entry };
      });
  }, [category.label, effectiveContracts]);

  const isPerformance = categorySlug === 'performance';

  const detailsAgent = selectedDetailsSlug
    ? categoryAgents.find(({ agent }) => slugifyAgentTitle(agent.title) === selectedDetailsSlug)?.agent ?? null
    : null;
  const pendingAgent = pendingActivationSlug
    ? categoryAgents.find(({ agent }) => slugifyAgentTitle(agent.title) === pendingActivationSlug)?.agent ?? null
    : null;
  const pendingDeactivateAgent = pendingDeactivateSlug
    ? categoryAgents.find(({ agent }) => slugifyAgentTitle(agent.title) === pendingDeactivateSlug)?.agent ?? null
    : null;
  const activeAgentsCount = categoryAgents.filter(({ entry }) => entry.isActive).length;
  const activeEntry = categoryAgents.find(({ entry }) => entry.isActive)?.entry;
  const planName = activeEntry?.planSummary?.planName ?? 'Growth';
  const planLimit = activeEntry?.planSummary?.monthlyLimit ?? 15;

  const activateAgent = async (agentTitle: string, agentSlug: string) => {
    if (!user) return;
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
    setDeactivatingSlug(agentSlug);
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
      setDeactivatingSlug(null);
    }
  };

  return (
    <section className="relative w-full overflow-hidden text-white">
      <div className="relative z-10 space-y-6">
        <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ff6a00]/15 border border-[#ff6a00]/20 text-[#ff6a00]">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white leading-none">
                {isPerformance ? 'Performance' : category.label}
              </h1>
              <p className="text-[12px] font-semibold text-[#7eb8d4]/80 mt-1 max-w-2xl">
                {isPerformance 
                  ? 'Oportunidades e estratégias a partir de dados e comportamento. Escale com inteligência.' 
                  : category.summary}
              </p>
              <p className="text-[11px] font-bold text-[#FF6A00] mt-1">
                {isPerformance 
                  ? 'Foco em decisões mais rápidas, menos desperdício de verba e crescimento previsível no caixa.'
                  : category.financialImpact}
              </p>
            </div>
          </div>
          <div className="flex items-center shrink-0">
            <Link href={`/hub/laboratorio-agentes?categoria=${categorySlug}`} className={HUB_HEADER_LAB_BUTTON_CLASS}>
              <Wrench className="h-4 w-4" />
              Acessar Laboratório
            </Link>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-3xl border border-white/[0.10] bg-[#071a2e]/82 shadow-[0_8px_32px_rgba(2,8,22,0.4)]">
          <header className="bg-[#091624] px-6 py-5 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  Agentes da categoria
                </h2>
              </div>
              <p className="text-xs font-semibold text-slate-300">
                Gestão operacional dos agentes de {category.label}.
              </p>
            </div>
            <span className="border border-[#FF6A00] bg-[#FF6A00]/5 text-[#FF6A00] rounded-full px-3 py-1 text-[11px] font-bold whitespace-nowrap">
              Ativos: {activeAgentsCount}
            </span>
          </header>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {categoryAgents.map(({ agent, entry }) => {
                const agentSlug = slugifyAgentTitle(agent.title);
                const isActive = entry.isActive;
                return (
                  <article
                    key={agent.title}
                    className="rounded-[24px] border border-white/[0.08] bg-[#051120]/60 p-5 transition-all duration-200 hover:border-white/[0.16] hover:bg-[#051120]/80"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[14px] font-black leading-tight text-white">{agent.title}</p>
                      {isActive ? (
                        <button
                          type="button"
                          onClick={() => setPendingDeactivateSlug(agentSlug)}
                          disabled={deactivatingSlug === agentSlug}
                          className="inline-flex items-center gap-1 text-[12px] font-black text-[#FF4D4D] hover:text-[#FF3333] transition-colors disabled:opacity-60"
                        >
                          <Power className="h-3.5 w-3.5" />
                          {deactivatingSlug === agentSlug ? 'Desativando…' : 'Desativar Agente'}
                        </button>
                      ) : null}
                    </div>
                    <p className="mt-2 text-[12px] leading-relaxed text-slate-400">{agent.description}</p>

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
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPendingActivationSlug(agentSlug)}
                          disabled={activatingSlug === agentSlug}
                          className={`${HUB_CONNECTOR_BUTTON_CLASS} disabled:opacity-60`}
                        >
                          <Wrench className="h-4 w-4" />
                          {activatingSlug === agentSlug ? 'Ativando…' : 'Ativar Agente'}
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
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {detailsAgent ? (
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
                <p className="pt-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#FF6B00]">Agente de IA</p>
                <h3 className="mt-1 text-[30px] leading-[1.08] font-black tracking-tight text-white sm:text-[38px] md:text-[44px]">{detailsAgent.title}</h3>
                <p className="mt-3 max-w-3xl text-[15px] leading-[1.5] text-slate-300 md:text-[16px]">{detailsAgent.description}</p>
              </div>
            </div>

            <article className="mt-7 rounded-[18px] border border-white/[0.08] bg-[#051120]/60 p-5 md:p-6">
              <h4 className="text-[13px] font-black uppercase tracking-[0.08em] text-[#FF6B00]">Atividades relacionadas</h4>
              <ul className="mt-4 space-y-3 text-[16px] leading-[1.55] text-slate-300">
                {buildActivities(detailsAgent.longDescription).map((item) => (
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
              <p>Plano ativo: <span className="text-[#FF6B00]">{planName}</span></p>
              <p>Capacidade do plano: {planLimit} agentes</p>
              <p>Ativos atualmente: {activeAgentsCount}</p>
              <p>Após confirmação: {activeAgentsCount + 1} de {planLimit}</p>
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
                onClick={() => deactivateAgent(pendingDeactivateAgent.title, slugifyAgentTitle(pendingDeactivateAgent.title))}
                disabled={deactivatingSlug === slugifyAgentTitle(pendingDeactivateAgent.title)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-[#FF4D4D] bg-[#FF4D4D] px-5 text-sm font-black text-white shadow-[0_10px_22px_rgba(255,77,77,0.30)] hover:brightness-105 active:scale-95 disabled:opacity-60 transition-all"
              >
                {deactivatingSlug === slugifyAgentTitle(pendingDeactivateAgent.title) ? 'Desativando…' : 'Confirmar desativação'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
