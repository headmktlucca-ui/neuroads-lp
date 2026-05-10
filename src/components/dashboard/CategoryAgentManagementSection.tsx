'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ExternalLink, Info, Power, Wrench, X } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { agents } from '../../data/agents';
import { getAgentEntryDefinition, getContractedAgentsFromProfile, slugifyAgentTitle } from '../../lib/hub-agents';
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
  'inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] bg-[#FF6B00] px-6 text-[14px] leading-none font-black text-white shadow-[0_10px_22px_rgba(255,107,0,0.30)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFBE94]';

const HUB_HEADER_LAB_BUTTON_CLASS =
  'inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] border border-[#FF6A00] bg-transparent px-6 text-[14px] leading-none font-black text-[#FF6A00] shadow-none transition hover:bg-[#FF6A00]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB98E]';

const PERFORMANCE_PRIORITY_MAP: Record<string, string> = {
  'Analista de Tráfego': 'Refinar termos de pesquisa e correspondências para reduzir CPL sem perder volume qualificado.',
  'Simulador de ROAS': 'Recalibrar metas por canal para concentrar investimento nas campanhas com maior retorno projetado.',
  'Auditor de Desperdício': 'Cortar rapidamente pontos de drenagem e realocar orçamento para ativos com melhor conversão.',
  'Otimizador de Orçamento': 'Redistribuir verba entre campanhas com foco em previsibilidade de caixa e estabilidade de ROAS.',
};

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
  const [activatingSlug, setActivatingSlug] = useState<string | null>(null);
  const [deactivatingSlug, setDeactivatingSlug] = useState<string | null>(null);
  const [selectedDetailsSlug, setSelectedDetailsSlug] = useState<string | null>(null);
  const [pendingActivationSlug, setPendingActivationSlug] = useState<string | null>(null);
  const [pendingDeactivateSlug, setPendingDeactivateSlug] = useState<string | null>(null);

  const categoryAgents = useMemo(() => {
    return agents
      .filter((agent) => agent.category === category.label)
      .map((agent) => {
        const entry = getAgentEntryDefinition(agent, contractedAgents);
        return { agent, entry };
      });
  }, [category.label, contractedAgents]);

  const isPerformance = categorySlug === 'performance';

  const activePerformanceItems = useMemo(() => {
    if (!isPerformance) return [];

    return categoryAgents
      .filter(({ entry }) => entry.isActive)
      .map(({ agent }, index) => ({
        order: String(index + 1).padStart(2, '0'),
        agent: agent.title,
        detail:
          PERFORMANCE_PRIORITY_MAP[agent.title] ??
          'Executar otimizações táticas desta frente para aumentar eficiência e previsibilidade operacional.',
      }));
  }, [categoryAgents, isPerformance]);

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
    try {
      const db = getFirebaseDb();
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
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
      );
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
    try {
      const db = getFirebaseDb();
      const userRef = doc(db, 'users', user.uid);
      await setDoc(
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
      );
      setPendingDeactivateSlug(null);
      router.refresh();
    } catch (error) {
      console.error('Erro ao desativar agente:', error);
    } finally {
      setDeactivatingSlug(null);
    }
  };

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative z-10 wrap py-8 md:py-12 space-y-6">
        {isPerformance ? (
          <>
            <header className="rounded-3xl border border-[#153462] bg-[linear-gradient(110deg,#071633_0%,#081c3f_45%,#061734_100%)] p-6 md:p-8 shadow-[0_16px_40px_rgba(2,8,22,0.35)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#FF6A00]">Gestão de Agentes</p>
                <h1 className="mt-2 text-[30px] leading-[1.1] font-black tracking-tight text-white sm:text-[34px] md:text-[36px]">
                    Performance
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#C6D3E9] md:text-lg">
                    Oportunidades e estratégias a partir de dados e comportamento. Escale com inteligência.
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#FF6A00]">
                    Foco em decisões mais rápidas, menos desperdício de verba e crescimento previsível no caixa.
                  </p>
                </div>
                <Link href="/hub/laboratorio-agentes?categoria=performance" className={HUB_HEADER_LAB_BUTTON_CLASS}>
                  <Wrench className="h-4 w-4" />
                  Acessar Laboratório
                </Link>
              </div>
            </header>

          </>
        ) : (
          <header className="rounded-3xl border border-[#153462] bg-[linear-gradient(110deg,#071633_0%,#081c3f_45%,#061734_100%)] p-6 md:p-8 shadow-[0_16px_40px_rgba(2,8,22,0.35)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#FF6A00]">Gestão de Agentes</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-4xl">
                  {category.label}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#C6D3E9] md:text-base">{category.summary}</p>
                <p className="mt-2 text-sm font-semibold text-[#FF6A00]">{category.financialImpact}</p>
              </div>
              <Link href={`/hub/laboratorio-agentes?categoria=${categorySlug}`} className={HUB_HEADER_LAB_BUTTON_CLASS}>
                <Wrench className="h-4 w-4" />
                Acessar Laboratório
              </Link>
            </div>
          </header>
        )}

        <section className="rounded-3xl border border-border bg-white p-6 md:p-8 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-text-main">
                Agentes da categoria
              </h2>
              {isPerformance ? <p className="mt-1 text-sm text-text-muted">Gestão operacional dos agentes de Performance.</p> : null}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {categoryAgents.map(({ agent, entry }) => {
              const agentSlug = slugifyAgentTitle(agent.title);
              const isActive = entry.isActive;
              const isSeoGeo = agentSlug === 'seo-geo';

              return (
                <article key={agent.title} className="rounded-[28px] border border-border bg-bg-secondary p-5">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[14px] font-black leading-tight text-text-main">{agent.title}</p>
                    {isActive ? (
                      <button
                        type="button"
                        onClick={() => setPendingDeactivateSlug(agentSlug)}
                        disabled={deactivatingSlug === agentSlug}
                        className="inline-flex items-center gap-1 text-[12px] font-black text-[#B42318] hover:text-[#912018] disabled:opacity-60"
                      >
                        <Power className="h-3.5 w-3.5" />
                        {deactivatingSlug === agentSlug ? 'Desativando...' : 'Desativar Agente'}
                      </button>
                    ) : null}
                  </div>
                  <p className="mt-2 text-[12px] leading-relaxed text-text-muted">{agent.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
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
                      </>
                    ) : isSeoGeo ? (
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
                        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] bg-[#D1D5DB] px-6 text-[14px] leading-none font-black text-[#6B7280] shadow-none"
                      >
                        em breve
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
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {isPerformance ? (
          <section className="rounded-3xl border border-border bg-white p-6 md:p-8 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-black text-text-main">Prioridade da Semana</h2>
              <p className="mt-2 text-sm md:text-base text-text-muted">
                Lista dinâmica gerada somente com agentes ativos desta categoria.
              </p>
            </div>

            {activePerformanceItems.length > 0 ? (
              <div className="space-y-3">
                {activePerformanceItems.map((item) => (
                  <article key={item.order} className="rounded-2xl border border-border bg-[#FCFCFD] p-4 md:p-5">
                    <div className="flex items-start gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF3EC] text-primary text-sm font-black">
                        {item.order}
                      </span>
                      <div>
                        <p className="text-lg font-black text-text-main">{item.agent}</p>
                        <p className="mt-1 text-sm leading-relaxed text-text-muted">{item.detail}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-[#FCFCFD] p-5 text-sm text-text-muted">
                Nenhum agente ativo nesta categoria no momento. Ative um agente para receber prioridades reais e sugestões operacionais.
              </div>
            )}
          </section>
        ) : null}
      </div>

      {detailsAgent ? (
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
                <p className="pt-1 text-[11px] font-black uppercase tracking-[0.16em] text-primary">Agente de IA</p>
                <h3 className="mt-1 text-[30px] leading-[1.08] font-black tracking-tight text-[#1C2538] sm:text-[38px] md:text-[44px]">{detailsAgent.title}</h3>
                <p className="mt-3 max-w-3xl text-[15px] leading-[1.5] text-[#4B5568] md:text-[16px]">{detailsAgent.description}</p>
              </div>
            </div>

            <article className="mt-7 rounded-[18px] border border-[#D8DEEA] bg-[#EEF2F8] p-5 md:p-6">
              <h4 className="text-[13px] font-black uppercase tracking-[0.08em] text-primary">Atividades relacionadas</h4>
              <ul className="mt-4 space-y-3 text-[16px] leading-[1.55] text-[#445064]">
                {buildActivities(detailsAgent.longDescription).map((item) => (
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
              <p><strong>Plano ativo:</strong> {planName}</p>
              <p><strong>Capacidade do plano:</strong> {planLimit} agentes</p>
              <p><strong>Ativos atualmente:</strong> {activeAgentsCount}</p>
              <p><strong>Após confirmação:</strong> {activeAgentsCount + 1} de {planLimit}</p>
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
                onClick={() => deactivateAgent(pendingDeactivateAgent.title, slugifyAgentTitle(pendingDeactivateAgent.title))}
                disabled={deactivatingSlug === slugifyAgentTitle(pendingDeactivateAgent.title)}
                className="inline-flex h-11 items-center justify-center rounded-[12px] border border-[#B42318] bg-[#B42318] px-5 text-sm font-black text-white shadow-[0_10px_22px_rgba(180,35,24,0.30)] disabled:opacity-60"
              >
                {deactivatingSlug === slugifyAgentTitle(pendingDeactivateAgent.title) ? 'Desativando...' : 'Confirmar desativação'}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
