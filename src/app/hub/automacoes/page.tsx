'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  ArrowRight,
  Bot,
  CalendarClock,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import LuccaHubSupportWidget from '../../../components/hub/LuccaHubSupportWidget';
import { useAuth } from '../../../context/AuthContext';
import { slugifyAgentTitle } from '../../../lib/hub-agents';
import { getHubLoginRedirect, getHubOnboardingRedirect, resolveHubAccessState } from '../../../lib/hub-access';
import { formatAutomationDateTime, getHubAutomationsFromProfile, type HubAutomationEntry } from '../../../lib/hub-automations';

function getStatusLabel(status: HubAutomationEntry['status']): string {
  if (status === 'active') return 'Automação Ativa';
  if (status === 'paused') return 'Automação Pausada';
  return 'Automação Inativa';
}

export default function HubAutomacoesPage() {
  const { user, profile, loading, premiumSyncing } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [nowTs, setNowTs] = useState(() => Date.now());
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

  const automations = useMemo(() => getHubAutomationsFromProfile(profile), [profile]);
  const activeAutomations = useMemo(
    () => automations.filter((automation) => automation.status === 'active'),
    [automations]
  );
  const effectiveSelectedKey = useMemo(() => {
    if (!activeAutomations.length) return null;
    if (!selectedKey) return activeAutomations[0].key;
    return activeAutomations.some((automation) => automation.key === selectedKey)
      ? selectedKey
      : activeAutomations[0].key;
  }, [activeAutomations, selectedKey]);
  const selectedAutomation = useMemo(
    () => activeAutomations.find((automation) => automation.key === effectiveSelectedKey) ?? null,
    [activeAutomations, effectiveSelectedKey]
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => setNowTs(Date.now()), 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const totalMonthlyExecutions = useMemo(
    () => activeAutomations.reduce((acc, item) => acc + item.monthlyExecutions, 0),
    [activeAutomations]
  );
  const automationsUpdatingToday = useMemo(() => {
    const dayAhead = nowTs + 24 * 60 * 60 * 1000;
    return activeAutomations.filter((item) => {
      if (!item.nextUpdateAt) return false;
      return item.nextUpdateAt >= nowTs && item.nextUpdateAt <= dayAhead;
    }).length;
  }, [activeAutomations, nowTs]);

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

      <div className="flex-grow pt-20 md:pt-28 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none bg-top bg-repeat-y bg-[length:100%_auto]"
          style={{ backgroundImage: "url('/images/background_hub_repeat_flow.png')" }}
        />
        <div className="relative z-10 wrap py-8 md:py-12 space-y-6">
          <section className="rounded-[30px] border border-[#153462] bg-[linear-gradient(110deg,#071633_0%,#081c3f_45%,#061734_100%)] p-6 md:p-8 shadow-[0_18px_40px_rgba(2,8,22,0.35)]">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#8FB5FF]">Hub Operacional</p>
                <h1 className="mt-2 text-3xl md:text-4xl font-black tracking-tight text-white">Automações</h1>
                <p className="mt-3 max-w-2xl text-sm md:text-base text-[#C6D3E9]">
                  Gestão em tempo real das rotinas ativas dos seus agentes com previsibilidade de execução, governança e visibilidade operacional.
                </p>
              </div>
              <Link
                href="/hub/agentes-ativos"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-[#FF6A00] px-5 text-sm font-black text-[#FF6A00] transition hover:bg-[#FF6A00]/10"
              >
                <Sparkles className="h-4 w-4" />
                Ativar novas automações
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
              <article className="rounded-2xl border border-[#173c6e] bg-[#081a38] p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-[#95ABD6]">Automações ativas</p>
                <p className="mt-2 text-3xl font-black text-white">{activeAutomations.length}</p>
              </article>
              <article className="rounded-2xl border border-[#173c6e] bg-[#081a38] p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-[#95ABD6]">Execuções/mês</p>
                <p className="mt-2 text-3xl font-black text-white">{totalMonthlyExecutions.toLocaleString('pt-BR')}</p>
              </article>
              <article className="rounded-2xl border border-[#173c6e] bg-[#081a38] p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-[#95ABD6]">Atualizam hoje</p>
                <p className="mt-2 text-3xl font-black text-white">{automationsUpdatingToday}</p>
              </article>
            </div>
          </section>

          {activeAutomations.length === 0 ? (
            <section className="rounded-[30px] border border-[#E5EAF2] bg-white p-8 md:p-10 shadow-[0_16px_36px_rgba(15,23,42,0.08)] text-center">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF3EC] text-[#FF6A00]">
                <Bot className="h-7 w-7" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-text-main">Nenhuma automação ativa no momento</h2>
              <p className="mt-3 text-sm md:text-base text-text-muted max-w-2xl mx-auto">
                Ative a rotina em um agente para começar a acompanhar próximas e últimas atualizações com visibilidade total no Hub.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/hub/agentes-ativos"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#FF6A00] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(255,106,0,0.25)] transition hover:brightness-105"
                >
                  Ir para Agentes Ativos
                </Link>
                <Link
                  href="/hub"
                  className="inline-flex h-11 items-center justify-center rounded-[12px] border border-[#D3DAE6] bg-white px-5 text-sm font-black text-[#344054] transition hover:bg-[#F8FAFC]"
                >
                  Voltar ao Hub
                </Link>
              </div>
            </section>
          ) : (
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_1fr]">
              <article className="rounded-[30px] border border-[#E5EAF2] bg-white p-5 md:p-6 shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
                <header className="mb-4">
                  <h2 className="text-2xl font-black text-text-main">Relação de Automações Ativas</h2>
                  <p className="mt-1 text-sm text-text-muted">
                    Selecione uma automação para visualizar o detalhamento operacional.
                  </p>
                </header>

                <div className="space-y-3">
                  {activeAutomations.map((automation) => {
                    const isSelected = selectedAutomation?.key === automation.key;
                    return (
                      <button
                        key={automation.key}
                        type="button"
                        onClick={() => setSelectedKey(automation.key)}
                        className={`w-full rounded-2xl border p-4 text-left transition-all ${
                          isSelected
                            ? 'border-[#A9E8C8] bg-[#F3FFF8] shadow-[0_10px_22px_rgba(8,183,96,0.14)]'
                            : 'border-[#E4EAF2] bg-[#FCFDFE] hover:border-[#D5DFEC] hover:bg-white'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[17px] font-black text-text-main">{automation.agentTitle}</p>
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#CDE7D9] bg-[#F2FFF7] px-3 py-1 text-[11px] font-bold text-[#0A9D57]">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {getStatusLabel(automation.status)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-text-muted">{automation.cadenceTitle}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF4FF] px-2.5 py-1 text-[11px] font-bold text-[#1D4ED8]">
                            <Activity className="h-3.5 w-3.5" />
                            {automation.monthlyExecutions} execuções/mês
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF7ED] px-2.5 py-1 text-[11px] font-bold text-[#C2410C]">
                            <CalendarClock className="h-3.5 w-3.5" />
                            Próxima: {formatAutomationDateTime(automation.nextUpdateAt)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </article>

              <article className="rounded-[30px] border border-[#E5EAF2] bg-white p-5 md:p-6 shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
                {selectedAutomation ? (
                  <>
                    <header>
                      <p className="text-xs font-black uppercase tracking-[0.12em] text-primary">Painel da automação</p>
                      <h3 className="mt-2 text-3xl font-black tracking-tight text-text-main">{selectedAutomation.agentTitle}</h3>
                      <p className="mt-1 text-sm text-text-muted">{selectedAutomation.agentCategory}</p>
                    </header>

                    <div className="mt-5 space-y-3">
                      <div className="rounded-2xl border border-[#E6ECF4] bg-[#F8FAFC] p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#667085]">Cadência ativa</p>
                        <p className="mt-1 text-lg font-black text-text-main">{selectedAutomation.cadenceTitle}</p>
                        <p className="mt-1 text-sm text-text-muted">{selectedAutomation.cadence}</p>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-[#E6ECF4] bg-white p-4">
                          <p className="text-xs font-bold uppercase tracking-widest text-[#667085]">Última atualização</p>
                          <p className="mt-1 text-sm font-black text-text-main">{formatAutomationDateTime(selectedAutomation.lastUpdateAt)}</p>
                        </div>
                        <div className="rounded-2xl border border-[#E6ECF4] bg-white p-4">
                          <p className="text-xs font-bold uppercase tracking-widest text-[#667085]">Próxima atualização</p>
                          <p className="mt-1 text-sm font-black text-text-main">{formatAutomationDateTime(selectedAutomation.nextUpdateAt)}</p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[#E6ECF4] bg-white p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#667085]">Distribuição semanal</p>
                        <p className="mt-1 text-sm text-text-main">{selectedAutomation.distribution || 'Não informado'}</p>
                      </div>

                      <div className="rounded-2xl border border-[#E6ECF4] bg-white p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#667085]">Objetivo operacional</p>
                        <p className="mt-1 text-sm text-text-main">{selectedAutomation.objective || 'Não informado'}</p>
                      </div>

                      <div className="rounded-2xl border border-[#E6ECF4] bg-white p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                          <span className="inline-flex items-center gap-2 font-bold text-[#1D4ED8]">
                            <RefreshCw className="h-4 w-4" />
                            Plano: {selectedAutomation.planName ?? 'Não informado'}
                          </span>
                          <span className="inline-flex items-center gap-2 font-bold text-[#0A9D57]">
                            <Clock3 className="h-4 w-4" />
                            Limite mensal: {selectedAutomation.monthlyLimit ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        href={`/hub/agente/${slugifyAgentTitle(selectedAutomation.agentTitle)}`}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#08B760] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(8,183,96,0.25)] transition hover:brightness-105"
                      >
                        Gerenciar no Agente
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        href="/hub/agentes-ativos"
                        className="inline-flex h-11 items-center justify-center rounded-[12px] border border-[#D3DAE6] bg-white px-5 text-sm font-black text-[#344054] transition hover:bg-[#F8FAFC]"
                      >
                        Ver Agentes Ativos
                      </Link>
                    </div>
                  </>
                ) : null}
              </article>
            </section>
          )}
        </div>
      </div>

      <Footer />
      <LuccaHubSupportWidget />
    </main>
  );
}
