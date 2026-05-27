'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bot,
  CalendarClock,
  CheckCircle2,
  Clock3,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Search,
  Sparkles,
  X,
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

function getRuntimeInfo(automation: HubAutomationEntry, nowTs: number): {
  label: string;
  icon: 'running' | 'scheduled' | 'paused' | 'inactive' | 'overdue';
  tone: string;
} {
  const EXECUTION_WINDOW_MS = 45 * 60 * 1000;

  if (automation.status === 'paused') {
    return {
      label: 'Programação pausada',
      icon: 'paused',
      tone: 'border-[#F5D0A9] bg-[#FFF7ED] text-[#B45309]',
    };
  }

  if (automation.status !== 'active') {
    return {
      label: 'Programação inativa',
      icon: 'inactive',
      tone: 'border-[#D0D5DD] bg-[#F9FAFB] text-[#667085]',
    };
  }

  if (automation.lastUpdateAt && nowTs >= automation.lastUpdateAt && nowTs - automation.lastUpdateAt <= EXECUTION_WINDOW_MS) {
    return {
      label: 'Em execução',
      icon: 'running',
      tone: 'border-[#BDE8CF] bg-[#F2FFF7] text-[#0A9D57]',
    };
  }

  if (automation.nextUpdateAt && automation.nextUpdateAt < nowTs) {
    return {
      label: 'Execução atrasada',
      icon: 'overdue',
      tone: 'border-[#FECACA] bg-[#FFF1F2] text-[#B42318]',
    };
  }

  return {
    label: 'Programada',
    icon: 'scheduled',
    tone: 'border-[#DCE8FF] bg-[#F5F9FF] text-[#1D4ED8]',
  };
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

  const [searchQuery, setSearchQuery] = useState('');
  const automations = useMemo(() => getHubAutomationsFromProfile(profile), [profile]);
  const trackedAutomations = useMemo(
    () => automations.filter((automation) => automation.status === 'active' || automation.status === 'paused'),
    [automations]
  );
  const filteredAutomations = useMemo(() => {
    return trackedAutomations.filter((automation) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        automation.agentTitle.toLowerCase().includes(query) ||
        automation.agentCategory.toLowerCase().includes(query) ||
        automation.cadenceTitle.toLowerCase().includes(query) ||
        (automation.objective && automation.objective.toLowerCase().includes(query))
      );
    });
  }, [trackedAutomations, searchQuery]);
  const effectiveSelectedKey = useMemo(() => {
    if (!filteredAutomations.length) return null;
    if (!selectedKey) return filteredAutomations[0].key;
    return filteredAutomations.some((automation) => automation.key === selectedKey)
      ? selectedKey
      : filteredAutomations[0].key;
  }, [filteredAutomations, selectedKey]);
  const selectedAutomation = useMemo(
    () => filteredAutomations.find((automation) => automation.key === effectiveSelectedKey) ?? null,
    [filteredAutomations, effectiveSelectedKey]
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => setNowTs(Date.now()), 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  const totalMonthlyExecutions = useMemo(
    () => trackedAutomations.reduce((acc, item) => acc + item.monthlyExecutions, 0),
    [trackedAutomations]
  );
  const activeAutomationsCount = useMemo(
    () => trackedAutomations.filter((item) => item.status === 'active').length,
    [trackedAutomations]
  );
  const runningNowCount = useMemo(
    () =>
      trackedAutomations.filter((item) => {
        return getRuntimeInfo(item, nowTs).icon === 'running';
      }).length,
    [trackedAutomations, nowTs]
  );
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
        <div className="relative z-10 wrap py-8 md:py-12 space-y-6">
          <header className="relative overflow-hidden rounded-3xl border border-[#122034] bg-[#040a13] p-6 md:p-8 shadow-[0_16px_40px_rgba(2,8,22,0.35)]">
            <Image
              src="/images/template-match/metrics-wave-v1.png"
              alt=""
              fill
              className="pointer-events-none object-cover object-bottom opacity-[1]"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,15,0.9)_0%,rgba(3,8,15,0.92)_40%,rgba(3,8,15,0.14)_100%)]" />

            <div className="relative z-10">
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#FF6A00]">Hub Operacional</p>
                  <h1 className="mt-2 text-[30px] leading-[1.1] font-black tracking-tight text-white sm:text-[34px] md:text-[36px]">
                    <span
                      className="bg-[length:200%_200%] bg-clip-text text-transparent"
                      style={{ backgroundImage: 'linear-gradient(135deg, #ff9a35 0%, #ff6a00 55%, #c84a00 100%)' }}
                    >
                      Automações
                    </span>
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm md:text-base text-[#C6D3E9]">
                    Gestão em tempo real das rotinas ativas dos seus agentes com previsibilidade de execução, governança e visibilidade operacional.
                  </p>
                </div>
                <Link
                  href="/hub/agentes-ativos"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-[#FF6A00] bg-[#FF6A00] px-5 text-sm font-black text-white shadow-[0_10px_22px_rgba(255,107,0,0.30)] transition hover:brightness-105"
                >
                  <Sparkles className="h-4 w-4" />
                  Ativar novas automações
                </Link>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-4">
                <article className="rounded-2xl border border-[#122034] bg-[#020813]/60 backdrop-blur-sm shadow-inner p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#95ABD6]">Programadas/execução</p>
                  <p className="mt-2 text-3xl font-black text-white">{trackedAutomations.length}</p>
                </article>
                <article className="rounded-2xl border border-[#122034] bg-[#020813]/60 backdrop-blur-sm shadow-inner p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#95ABD6]">Ativas</p>
                  <p className="mt-2 text-3xl font-black text-white">{activeAutomationsCount}</p>
                </article>
                <article className="rounded-2xl border border-[#122034] bg-[#020813]/60 backdrop-blur-sm shadow-inner p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#95ABD6]">Em execução</p>
                  <p className="mt-2 text-3xl font-black text-white">{runningNowCount}</p>
                </article>
                <article className="rounded-2xl border border-[#122034] bg-[#020813]/60 backdrop-blur-sm shadow-inner p-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#95ABD6]">Execuções/mês</p>
                  <p className="mt-2 text-3xl font-black text-white">{totalMonthlyExecutions.toLocaleString('pt-BR')}</p>
                </article>
              </div>
            </div>
          </header>

          {/* Search Bar Container with Glassmorphism Translúcido styling */}
          <div className="rounded-3xl border border-white/50 bg-white/80 backdrop-blur-md p-5 md:p-6 shadow-[0_16px_36px_rgba(15,23,42,0.04)]">
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

          {trackedAutomations.length === 0 ? (
            <section className="rounded-[30px] border border-[#E5EAF2] bg-white p-8 md:p-10 shadow-[0_16px_36px_rgba(15,23,42,0.08)] text-center">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF3EC] text-[#FF6A00]">
                <Bot className="h-7 w-7" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-text-main">Nenhuma automação programada no momento</h2>
              <p className="mt-3 text-sm md:text-base text-text-muted max-w-2xl mx-auto">
                Ative a rotina em um agente para listar aqui automações programadas e em execução com todas as configurações operacionais.
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
          ) : filteredAutomations.length === 0 ? (
            <section className="rounded-[30px] border border-[#E5EAF2] bg-white p-8 md:p-10 shadow-[0_16px_36px_rgba(15,23,42,0.08)] text-center">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF3EC] text-[#FF6A00]">
                <Bot className="h-7 w-7" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-text-main">Nenhuma automação encontrada</h2>
              <p className="mt-3 text-sm md:text-base text-text-muted max-w-2xl mx-auto">
                Não encontramos nenhuma automação ativa correspondente à pesquisa &quot;{searchQuery}&quot;.
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="mt-6 inline-flex h-11 items-center justify-center rounded-[12px] bg-[#FF6A00] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(255,106,0,0.25)] transition hover:brightness-105"
              >
                Limpar pesquisa
              </button>
            </section>
          ) : (
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_1fr]">
              <article className="rounded-[30px] border border-[#E5EAF2] bg-white p-5 md:p-6 shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
                <header className="mb-4">
                  <h2 className="text-2xl font-black text-text-main">Relação de Automações Programadas</h2>
                  <p className="mt-1 text-sm text-text-muted">
                    Selecione uma automação programada ou em execução para visualizar o detalhamento completo.
                  </p>
                </header>

                <div className="space-y-3">
                  {filteredAutomations.map((automation) => {
                    const isSelected = selectedAutomation?.key === automation.key;
                    const runtime = getRuntimeInfo(automation, nowTs);
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
                          <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold ${runtime.tone}`}>
                            {runtime.icon === 'running' ? (
                              <PlayCircle className="h-3.5 w-3.5" />
                            ) : runtime.icon === 'paused' ? (
                              <PauseCircle className="h-3.5 w-3.5" />
                            ) : runtime.icon === 'inactive' || runtime.icon === 'overdue' ? (
                              <AlertCircle className="h-3.5 w-3.5" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                            {runtime.label}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#CDE7D9] bg-[#F2FFF7] px-3 py-1 text-[11px] font-bold text-[#0A9D57]">
                            {getStatusLabel(automation.status)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-text-muted">{automation.cadenceTitle}</p>
                        {automation.scheduleOptionLabel ? (
                          <p className="mt-1 text-xs font-semibold text-[#1D4ED8]">Agenda: {automation.scheduleOptionLabel}</p>
                        ) : null}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF4FF] px-2.5 py-1 text-[11px] font-bold text-[#1D4ED8]">
                            <Activity className="h-3.5 w-3.5" />
                            {automation.monthlyExecutions} execuções/mês
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF7ED] px-2.5 py-1 text-[11px] font-bold text-[#C2410C]">
                            <CalendarClock className="h-3.5 w-3.5" />
                            Próxima: {formatAutomationDateTime(automation.nextUpdateAt)}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F7FA] px-2.5 py-1 text-[11px] font-bold text-[#475467]">
                            <Clock3 className="h-3.5 w-3.5" />
                            Atualiza hoje: {automation.nextUpdateAt && automation.nextUpdateAt >= nowTs && automation.nextUpdateAt <= nowTs + 24 * 60 * 60 * 1000 ? 'Sim' : 'Não'}
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
                    {(() => {
                      const runtime = getRuntimeInfo(selectedAutomation, nowTs);
                      return (
                        <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${runtime.tone}`}>
                          {runtime.icon === 'running' ? (
                            <PlayCircle className="h-3.5 w-3.5" />
                          ) : runtime.icon === 'paused' ? (
                            <PauseCircle className="h-3.5 w-3.5" />
                          ) : runtime.icon === 'inactive' || runtime.icon === 'overdue' ? (
                            <AlertCircle className="h-3.5 w-3.5" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          )}
                          {runtime.label}
                        </div>
                      );
                    })()}
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
                        <p className="mt-1 text-xs text-text-dim">ID da cadência: {selectedAutomation.cadenceId || 'Não informado'}</p>
                      </div>

                      <div className="rounded-2xl border border-[#E6ECF4] bg-white p-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-[#667085]">Status e chave da automação</p>
                        <p className="mt-1 text-sm text-text-main">
                          <strong>Status:</strong> {getStatusLabel(selectedAutomation.status)}
                        </p>
                        <p className="mt-1 text-sm text-text-main break-all">
                          <strong>Identificador:</strong> {selectedAutomation.key}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-[#E6ECF4] bg-white p-4">
                          <p className="text-xs font-bold uppercase tracking-widest text-[#667085]">Ativada em</p>
                          <p className="mt-1 text-sm font-black text-text-main">{formatAutomationDateTime(selectedAutomation.activatedAt)}</p>
                        </div>
                        <div className="rounded-2xl border border-[#E6ECF4] bg-white p-4">
                          <p className="text-xs font-bold uppercase tracking-widest text-[#667085]">Última edição</p>
                          <p className="mt-1 text-sm font-black text-text-main">{formatAutomationDateTime(selectedAutomation.updatedAt)}</p>
                        </div>
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
                        <p className="text-xs font-bold uppercase tracking-widest text-[#667085]">Agenda programada</p>
                        <p className="mt-1 text-sm font-black text-text-main">{selectedAutomation.scheduleOptionLabel || 'Não informado'}</p>
                        {selectedAutomation.scheduleOptionDetail ? (
                          <p className="mt-1 text-sm text-text-muted">{selectedAutomation.scheduleOptionDetail}</p>
                        ) : null}
                        <p className="mt-1 text-xs text-text-dim">Código interno: {selectedAutomation.scheduleOptionId || 'Não informado'}</p>
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
        <div className="relative z-10">
          <div className="[&>footer]:!bg-transparent [&>footer]:!backdrop-blur-none">
            <Footer />
          </div>
        </div>
      </div>
      <LuccaHubSupportWidget />
    </main>
  );
}
