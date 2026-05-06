'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import { useAuth } from '../../../context/AuthContext';
import { agents } from '../../../data/agents';
import { slugifyAgentTitle } from '../../../lib/hub-agents';

const categories = [
  { slug: 'performance', label: 'Performance' },
  { slug: 'criativos', label: 'Criativos' },
  { slug: 'tecnico', label: 'Técnico' },
  { slug: 'inteligencia', label: 'Inteligência' },
];

export default function LaboratorioAgentesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get('categoria');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/hub/laboratorio-agentes');
    }
  }, [loading, router, user]);

  const visibleCategories = useMemo(() => {
    if (!categoryFilter) return categories;
    return categories.filter((category) => category.slug === categoryFilter);
  }, [categoryFilter]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-bg-main">
      <Navbar />

      <div className="flex-grow pt-20 md:pt-28 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none bg-top bg-repeat-y bg-[length:100%_auto]"
          style={{ backgroundImage: "url('/images/background_hub_repeat_flow.png')" }}
        />
        <div className="absolute inset-x-0 bottom-0 h-44 pointer-events-none bg-gradient-to-b from-transparent via-[#f7f8fa]/75 to-bg-main" />

        <section className="relative z-10 wrap py-8 md:py-12 space-y-6">
          <header className="rounded-3xl border border-border bg-white p-6 md:p-8 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Laboratório de Agentes</p>
            <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight text-text-main">
              Gestão de contratação por categoria
            </h1>
            <p className="mt-3 max-w-3xl text-sm md:text-base text-text-muted leading-relaxed">
              Esta área centraliza a ativação dos agentes da sua operação, com foco em coerência estratégica, previsibilidade e impacto financeiro real.
            </p>
          </header>

          {visibleCategories.map((category) => {
            const categoryAgents = agents.filter((agent) => agent.category === category.label);
            return (
              <section
                key={category.slug}
                className="rounded-3xl border border-border bg-white p-6 md:p-8 shadow-[0_14px_34px_rgba(15,23,42,0.05)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-black text-text-main">{category.label}</h2>
                  <Link
                    href={`/hub/${category.slug}`}
                    className="inline-flex items-center justify-center rounded-full border border-[#FFBE94] bg-white px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-primary transition hover:bg-[#FFF3EA]"
                  >
                    Gerenciar categoria
                  </Link>
                </div>

                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                  {categoryAgents.map((agent) => (
                    <article key={agent.title} className="rounded-xl border border-border bg-bg-secondary p-4">
                      <p className="text-sm font-black text-text-main">{agent.title}</p>
                      <p className="mt-1 text-xs text-text-muted">{agent.description}</p>
                      <div className="mt-3">
                        <Link
                          href={`/hub/agente/${slugifyAgentTitle(agent.title)}`}
                          className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-white transition hover:brightness-110"
                        >
                          Ver agente
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </section>
      </div>

      <Footer />
    </main>
  );
}

