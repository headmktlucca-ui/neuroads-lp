'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  Activity,
  CalendarClock,
  Gauge,
  Target,
  Wrench,
} from 'lucide-react';
import { agents } from '../../data/agents';
import { getAgentEntryDefinition, getContractedAgentsFromProfile } from '../../lib/hub-agents';
import { useAuth } from '../../context/AuthContext';

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
  'inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#FF6B00] px-6 text-[14px] font-black text-white shadow-[0_10px_22px_rgba(255,107,0,0.30)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFBE94]';

export default function CategoryAgentManagementSection({ categorySlug }: { categorySlug: AgentCategorySlug }) {
  const { profile } = useAuth();
  const category = CATEGORY_META[categorySlug];
  const contractedAgents = useMemo(() => getContractedAgentsFromProfile(profile), [profile]);

  const categoryAgents = useMemo(() => {
    return agents
      .filter((agent) => agent.category === category.label)
      .map((agent) => {
        const entry = getAgentEntryDefinition(agent, contractedAgents);
        return { agent, entry };
      });
  }, [category.label, contractedAgents]);

  const isPerformance = categorySlug === 'performance';

  const kpis = [
    {
      label: 'Meta mensal',
      value: 'R$ 1.500.000',
      icon: Target,
      trend: '+8,2% vs mês anterior',
    },
    {
      label: 'Execuções disponíveis',
      value: '250.000',
      icon: Gauge,
      trend: '+4,1% de capacidade',
    },
    {
      label: 'Próxima renovação',
      value: '28/05/2026',
      icon: CalendarClock,
      trend: 'Ciclo ativo',
    },
    {
      label: 'Status da operação',
      value: 'ATIVA',
      icon: Activity,
      trend: 'Monitoramento em tempo real',
    },
  ];

  const weeklyPriority = [
    {
      order: '01',
      agent: 'Analista de Tráfego',
      detail: 'Ajustar termos amplos e reduzir dispersão de orçamento nas campanhas de busca.',
      badge: 'Crítico',
      badgeClass: 'bg-[#FFE8E2] text-[#D9481A]',
    },
    {
      order: '02',
      agent: 'Simulador de ROAS',
      detail: 'Recalibrar projeção por canal para concentrar investimento nas campanhas com maior retorno.',
      badge: 'Alta',
      badgeClass: 'bg-[#FFF1E7] text-[#E66100]',
    },
    {
      order: '03',
      agent: 'Auditor de Desperdício',
      detail: 'Mapear anúncios com queda de eficiência e recomendar cortes de verba tática.',
      badge: 'Alta',
      badgeClass: 'bg-[#FFF1E7] text-[#E66100]',
    },
  ];

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative z-10 wrap py-8 md:py-12 space-y-6">
        {isPerformance ? (
          <>
            <header className="rounded-3xl border border-border bg-white p-6 md:p-8 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary">Gestão de Performance</p>
                  <h1 className="mt-2 text-3xl md:text-5xl font-black tracking-tight text-text-main">
                    Cockpit dos Agentes de Performance
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm md:text-lg text-text-muted leading-relaxed">
                    Priorize decisões com dados reais e escale com previsibilidade de caixa.
                  </p>
                </div>
                <Link
                  href="/hub/laboratorio-agentes?categoria=performance"
                  className={HUB_CONNECTOR_BUTTON_CLASS}
                >
                  <Wrench className="h-4 w-4" />
                  Abrir laboratório de agentes
                </Link>
              </div>
            </header>

            <section className="rounded-3xl border border-border bg-white p-4 md:p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                {kpis.map((kpi) => {
                  const Icon = kpi.icon;
                  return (
                    <article key={kpi.label} className="rounded-2xl border border-border bg-[#FCFCFD] p-4 md:p-5">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF3EC] text-primary">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-text-dim">{kpi.label}</p>
                          <p className="mt-1 text-2xl font-black tracking-tight text-text-main">{kpi.value}</p>
                          <p className="mt-2 text-sm font-semibold text-[#0A9D57]">{kpi.trend}</p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-white p-6 md:p-8 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
              <div className="mb-6">
                <h2 className="text-2xl md:text-3xl font-black text-text-main">Prioridade da Semana</h2>
                <p className="mt-2 text-sm md:text-base text-text-muted">
                  Ranking dos agentes críticos para impacto direto no caixa.
                </p>
              </div>

              <div className="space-y-3">
                {weeklyPriority.map((item) => (
                  <article key={item.order} className="rounded-2xl border border-border bg-[#FCFCFD] p-4 md:p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF3EC] text-primary text-sm font-black">
                          {item.order}
                        </span>
                        <div>
                          <p className="text-lg font-black text-text-main">{item.agent}</p>
                          <p className="mt-1 text-sm leading-relaxed text-text-muted">{item.detail}</p>
                        </div>
                      </div>
                      <span className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-bold ${item.badgeClass}`}>
                        {item.badge}
                      </span>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  className={HUB_CONNECTOR_BUTTON_CLASS}
                >
                  <Wrench className="h-4 w-4" />
                  Executar plano da semana
                </button>
              </div>
            </section>
          </>
        ) : (
          <header className="rounded-3xl border border-border bg-white p-6 md:p-8 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Gestão de Agentes</p>
            <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight text-text-main">{category.label}</h1>
            <p className="mt-3 max-w-3xl text-sm md:text-base text-text-muted leading-relaxed">{category.summary}</p>
            <p className="mt-2 text-sm font-semibold text-primary">{category.financialImpact}</p>
          </header>
        )}

        <section className="rounded-3xl border border-border bg-white p-6 md:p-8 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-text-main">Agentes da categoria</h2>
              {isPerformance ? (
                <p className="mt-1 text-sm text-text-muted">Gestão operacional dos agentes de Performance.</p>
              ) : null}
            </div>
            <Link
              href={`/hub/laboratorio-agentes?categoria=${categorySlug}`}
              className={HUB_CONNECTOR_BUTTON_CLASS}
            >
              <Wrench className="h-4 w-4" />
              Ir para laboratório
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {categoryAgents.map(({ agent, entry }) => (
              <article key={agent.title} className="rounded-2xl border border-border bg-bg-secondary p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-black text-text-main">{agent.title}</p>
                    <p className="mt-2 text-sm text-text-muted leading-relaxed">{agent.description}</p>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] ${
                      entry.isActive
                        ? 'bg-[#EBFFF4] text-[#067A43] border border-[#BDE8CF]'
                        : 'bg-white text-[#6B7280] border border-[#D1D5DB]'
                    }`}
                  >
                    {entry.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3">
                  <div className="rounded-xl border border-border bg-white p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Plano</p>
                    <p className="mt-1 text-sm font-black text-text-main">
                      {entry.planSummary?.planName || 'Não contratado'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={entry.isActive ? `/hub/agente/${entry.slug}` : `/hub/laboratorio-agentes?agente=${entry.slug}`}
                    className={HUB_CONNECTOR_BUTTON_CLASS}
                  >
                    <Wrench className="h-4 w-4" />
                    {entry.isActive ? 'Gerenciar agente' : 'Ativar agente'}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {isPerformance ? (
          <section className="rounded-3xl border border-border bg-white p-5 md:px-8 md:py-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-3 text-sm font-semibold text-text-muted md:flex-row md:items-center md:justify-between">
              <Link href="/hub?historico=performance" className={HUB_CONNECTOR_BUTTON_CLASS}>
                <Wrench className="h-4 w-4" />
                Ver histórico de performance
              </Link>
              <Link
                href="/hub/laboratorio-agentes?categoria=performance"
                className={HUB_CONNECTOR_BUTTON_CLASS}
              >
                <Wrench className="h-4 w-4" />
                Abrir laboratório de agentes
              </Link>
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
}
