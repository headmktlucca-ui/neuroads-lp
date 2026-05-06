'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { agents } from '../../data/agents';
import { getAgentPricingProfile } from '../../data/agent-pricing';
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

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CategoryAgentManagementSection({ categorySlug }: { categorySlug: AgentCategorySlug }) {
  const { profile } = useAuth();
  const category = CATEGORY_META[categorySlug];
  const contractedAgents = useMemo(() => getContractedAgentsFromProfile(profile), [profile]);

  const categoryAgents = useMemo(() => {
    return agents
      .filter((agent) => agent.category === category.label)
      .map((agent) => {
        const entry = getAgentEntryDefinition(agent, contractedAgents);
        const pricing = getAgentPricingProfile(agent.title);
        return { agent, entry, pricing };
      });
  }, [category.label, contractedAgents]);

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative z-10 wrap py-8 md:py-12 space-y-6">
        <header className="rounded-3xl border border-border bg-white p-6 md:p-8 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Gestão de Agentes</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight text-text-main">{category.label}</h1>
          <p className="mt-3 max-w-3xl text-sm md:text-base text-text-muted leading-relaxed">{category.summary}</p>
          <p className="mt-2 text-sm font-semibold text-primary">{category.financialImpact}</p>
        </header>

        <section className="rounded-3xl border border-border bg-white p-6 md:p-8 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-2xl md:text-3xl font-black text-text-main">Agentes da categoria</h2>
            <Link
              href={`/hub/laboratorio-agentes?categoria=${categorySlug}`}
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-white transition hover:brightness-110"
            >
              Ir para laboratório
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {categoryAgents.map(({ agent, entry, pricing }) => (
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

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border bg-white p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Plano</p>
                    <p className="mt-1 text-sm font-black text-text-main">
                      {entry.planSummary?.planName || 'Não contratado'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-white p-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-dim">Valor mensal</p>
                    <p className="mt-1 text-sm font-black text-text-main">
                      {entry.planSummary ? `${formatCurrency(entry.planSummary.monthlyPrice)}/mês` : `${formatCurrency(pricing.startingPrice)}/mês`}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={entry.isActive ? `/hub/agente/${entry.slug}` : `/hub/laboratorio-agentes?agente=${entry.slug}`}
                    className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.08em] transition ${
                      entry.isActive
                        ? 'bg-[#0A9D57] text-white hover:brightness-110'
                        : 'border border-[#FFBE94] bg-white text-primary hover:bg-[#FFF3EA]'
                    }`}
                  >
                    {entry.isActive ? 'Gerenciar agente' : 'Contratar agente'}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

