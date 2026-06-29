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
  'inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] bg-gradient-to-r from-[#FF6A00] to-[#FF8805] px-6 text-[13px] leading-none font-bold text-white shadow-[0_4px_12px_rgba(255,106,0,0.25)] transition hover:brightness-105 hover:scale-[1.02] active:scale-95';

const HUB_HEADER_LAB_BUTTON_CLASS =
  'inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] border border-white/40 bg-[#eef2f7] px-6 text-[13px] leading-none font-bold text-slate-700 shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] transition hover:scale-[1.02] active:scale-95';

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
    <section className="relative w-full overflow-hidden text-[#1e293b]">
      <div className="relative z-10 space-y-6">
        <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-200 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20 text-[#ff6a00]">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-[#0f172a] leading-none">
                {isPerformance ? 'Performance' : category.label}
              </h1>
              <p className="text-[12px] font-bold text-slate-500 mt-1 max-w-2xl">
                {isPerformance 
                  ? 'Oportunidades e estratégias a partir de dados e comportamento. Escale com inteligência.' 
                  : category.summary}
              </p>
              <p className="text-[11px] font-black text-[#FF6A00] mt-1">
                {isPerformance 
                  ? 'Foco em decisões mais rápidas, menos desperdício de verba e crescimento previsível no caixa.'
                  : category.financialImpact}
              </p>
            </div>
          </div>
          <div className="flex items-center shrink-0">
            <Link href={`/hub/laboratorio-agentes?categoria=${categorySlug}`} className={HUB_HEADER_LAB_BUTTON_CLASS} style={{ textDecoration: 'none' }}>
              <Wrench className="h-4 w-4" />
              Acessar Laboratório
            </Link>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-3xl border border-white/50 bg-[#eef2f7] shadow-[5px_5px_10px_#d1d9e6,_-5px_-5px_10px_#ffffff]">
          <header className="bg-slate-100/30 px-6 py-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
                <h2 className="text-xl md:text-2xl font-black text-[#0f172a] tracking-tight">
                  Agentes da categoria
                </h2>
              </div>
              <p className="text-xs font-semibold text-slate-500">
                Gestão operacional dos agentes de {category.label}.
              </p>
            </div>
            <span className="border border-orange-500/20 bg-orange-500/10 text-[#FF6A00] rounded-full px-3 py-1 text-[11px] font-bold whitespace-nowrap shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff]">
              Ativos: {activeAgentsCount}
            </span>
          </header>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {categoryAgents.map(({ agent, entry }) => {
                const agentSlug = slugifyAgentTitle(agent.title);
                const isActive = entry.isActive;
                return (
                  <article
                    key={agent.title}
                    className="rounded-[24px] border border-white/60 bg-[#eef2f7] p-5 shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#c2cbd9,_-4px_-4px_8px_#ffffff] transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[14px] font-black leading-tight text-[#0f172a]">{agent.title}</p>
                      {isActive ? (
                        <button
                          type="button"
                          onClick={() => setPendingDeactivateSlug(agentSlug)}
                          disabled={deactivatingSlug === agentSlug}
                          className="inline-flex items-center gap-1 text-[12px] font-bold text-rose-600 hover:text-rose-800 transition-colors disabled:opacity-60"
                        >
                          <Power className="h-3.5 w-3.5" />
                          {deactivatingSlug === agentSlug ? 'Desativando…' : 'Desativar Agente'}
                        </button>
                      ) : null}
                    </div>
                    <p className="mt-2 text-[12px] leading-relaxed text-slate-500 font-medium">{agent.description}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {isActive ? (
                        <>
                          <button
                            type="button"
                            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] px-6 text-[13px] leading-none font-bold transition-all bg-gradient-to-r from-[#0d9488] to-[#10b981] text-white shadow-[0_4px_12px_rgba(13,148,136,0.25)] hover:scale-[1.02] active:scale-95"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Ativo
                          </button>
                          <Link
                            href={`/hub/agente/${agentSlug}`}
                            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] px-6 text-[13px] leading-none font-bold transition-all bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] hover:scale-[1.02] active:scale-95"
                            style={{ textDecoration: 'none' }}
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
                        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] border border-white/40 bg-[#eef2f7] px-6 text-[13px] leading-none font-bold text-slate-700 shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] hover:scale-[1.02] active:scale-95"
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

      {/* Details modal */}
      {detailsAgent ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setSelectedDetailsSlug(null)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
            aria-label="Fechar detalhes do agente"
          />
          <section className="relative w-full max-w-[780px] rounded-[24px] border border-white/80 bg-white/95 backdrop-blur-md p-6 md:p-7 shadow-[0_24px_60px_rgba(13,26,42,0.15)] text-[#1e293b] animate-in fade-in zoom-in-95 duration-250">
            <button
              type="button"
              onClick={() => setSelectedDetailsSlug(null)}
              className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 hover:text-slate-800 hover:scale-105 active:scale-95 shadow-sm"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-start gap-4 pr-14">
              <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-[16px] border border-white/55 bg-[#eef2f7] shadow-[4px_4px_8px_#d1d9e6,_-4px_-4px_8px_#ffffff]">
                <Image src={detailsAgent.icon} alt={detailsAgent.title} fill className="object-cover" sizes="76px" />
              </div>
              <div>
                <p className="pt-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#FF6B00]">Agente de IA</p>
                <h3 className="mt-1 text-[30px] leading-[1.08] font-black tracking-tight text-[#0f172a] sm:text-[38px] md:text-[44px]">{detailsAgent.title}</h3>
                <p className="mt-3 max-w-3xl text-[15px] leading-[1.5] text-slate-500 font-semibold md:text-[16px]">{detailsAgent.description}</p>
              </div>
            </div>

            <article className="mt-7 rounded-[18px] border border-slate-200 bg-slate-50 p-5 md:p-6">
              <h4 className="text-[13px] font-black uppercase tracking-[0.08em] text-[#FF6B00]">Atividades relacionadas</h4>
              <ul className="mt-4 space-y-3 text-[15px] leading-[1.55] text-slate-600 font-medium">
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

      {/* Activation confirmation modal */}
      {pendingAgent ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setPendingActivationSlug(null)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
            aria-label="Fechar confirmação"
          />
          <section className="relative w-full max-w-2xl rounded-[24px] border border-white/80 bg-white/95 backdrop-blur-md p-6 md:p-8 shadow-[0_24px_60px_rgba(13,26,42,0.15)] text-[#1e293b] animate-in fade-in zoom-in-95 duration-250">
            <button
              type="button"
              onClick={() => setPendingActivationSlug(null)}
              className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 hover:text-slate-800 hover:scale-105 active:scale-95 shadow-sm"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            <p className="text-xs font-black uppercase tracking-[0.12em] text-[#FF6B00]">Confirmar ativação</p>
            <h3 className="mt-1 text-3xl font-black tracking-tight text-[#0f172a]">{pendingAgent.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 font-medium">
              Você está prestes a ativar este agente. Confira como ficará a capacidade do plano ativo.
            </p>

            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 space-y-1">
              <p>Plano ativo: <span className="text-[#FF6B00] font-bold">{planName}</span></p>
              <p>Capacidade do plano: {planLimit} agentes</p>
              <p>Ativos atualmente: {activeAgentsCount}</p>
              <p>Após confirmação: <span className="font-bold text-[#FF6B00]">{activeAgentsCount + 1} de {planLimit}</span></p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPendingActivationSlug(null)}
                className="inline-flex h-11 items-center justify-center rounded-[12px] border border-slate-200 bg-slate-100 px-5 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-all active:scale-95"
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

      {/* Deactivation confirmation modal */}
      {pendingDeactivateAgent ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <button
            type="button"
            onClick={() => setPendingDeactivateSlug(null)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
            aria-label="Fechar confirmação"
          />
          <section className="relative w-full max-w-2xl rounded-[24px] border border-white/80 bg-white/95 backdrop-blur-md p-6 md:p-8 shadow-[0_24px_60px_rgba(13,26,42,0.15)] text-[#1e293b] animate-in fade-in zoom-in-95 duration-250">
            <button
              type="button"
              onClick={() => setPendingDeactivateSlug(null)}
              className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 hover:text-slate-800 hover:scale-105 active:scale-95 shadow-sm"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>

            <p className="text-xs font-black uppercase tracking-[0.12em] text-rose-600">Confirmar desativação</p>
            <h3 className="mt-1 text-3xl font-black tracking-tight text-[#0f172a]">{pendingDeactivateAgent.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 font-medium">
              Ao confirmar, o agente será desativado e deixará de aparecer como ativo até uma nova ativação.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPendingDeactivateSlug(null)}
                className="inline-flex h-11 items-center justify-center rounded-[12px] border border-slate-200 bg-slate-100 px-5 text-sm font-bold text-slate-700 hover:bg-slate-200 transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => deactivateAgent(pendingDeactivateAgent.title, slugifyAgentTitle(pendingDeactivateAgent.title))}
                disabled={deactivatingSlug === slugifyAgentTitle(pendingDeactivateAgent.title)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-rose-600 px-5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(225,29,72,0.25)] hover:bg-rose-700 active:scale-95 disabled:opacity-60 transition-all"
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
