'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
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
import { useAuth } from '../../../context/AuthContext';
import { slugifyAgentTitle } from '../../../lib/hub-agents';
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
      tone: 'border-amber-500/30 bg-amber-950/20 text-amber-400',
    };
  }

  if (automation.status !== 'active') {
    return {
      label: 'Programação inativa',
      icon: 'inactive',
      tone: 'border-white/10 bg-white/5 text-slate-400',
    };
  }

  if (automation.lastUpdateAt && nowTs >= automation.lastUpdateAt && nowTs - automation.lastUpdateAt <= EXECUTION_WINDOW_MS) {
    return {
      label: 'Em execução',
      icon: 'running',
      tone: 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400',
    };
  }

  if (automation.nextUpdateAt && automation.nextUpdateAt < nowTs) {
    return {
      label: 'Execução atrasada',
      icon: 'overdue',
      tone: 'border-red-500/30 bg-red-950/20 text-red-400',
    };
  }

  return {
    label: 'Programada',
    icon: 'scheduled',
    tone: 'border-blue-500/30 bg-blue-950/20 text-blue-400',
  };
}

export default function HubAutomacoesPage() {
  const { profile } = useAuth();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [nowTs, setNowTs] = useState(() => Date.now());
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

  return (
    <div className="w-full space-y-6 text-white">
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ff6a00]/15 border border-[#ff6a00]/20 text-[#ff6a00]">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white leading-none">
              Automações
            </h1>
            <p className="text-[12px] font-semibold text-[#7eb8d4]/80 mt-1 max-w-2xl">
              Gestão em tempo real das rotinas ativas dos seus agentes com previsibilidade de execução, governança e visibilidade operacional.
            </p>
          </div>
        </div>
        <div className="flex items-center shrink-0">
          <Link
            href="/hub/agentes-ativos"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] border border-[#FF6B00] bg-[#FF6B00] px-5 text-[14px] font-black text-white shadow-[0_10px_22px_rgba(255,107,0,0.30)] transition hover:brightness-105 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFB98E]"
          >
            <Sparkles className="h-4 w-4" />
            Ativar novas automações
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <article className="rounded-2xl border border-white/[0.10] bg-[#071a2e]/82 p-4 backdrop-blur-xl hover:border-white/[0.18] transition-all shadow-[0_8px_32px_rgba(2,8,22,0.55)]">
          <p className="text-[11px] font-black uppercase tracking-wider text-[#7eb8d4]">Programadas/execução</p>
          <p className="mt-2 text-[22px] font-black text-white leading-none">{trackedAutomations.length}</p>
        </article>
        <article className="rounded-2xl border border-white/[0.10] bg-[#071a2e]/82 p-4 backdrop-blur-xl hover:border-white/[0.18] transition-all shadow-[0_8px_32px_rgba(2,8,22,0.55)]">
          <p className="text-[11px] font-black uppercase tracking-wider text-[#7eb8d4]">Ativas</p>
          <p className="mt-2 text-[22px] font-black text-white leading-none">{activeAutomationsCount}</p>
        </article>
        <article className="rounded-2xl border border-white/[0.10] bg-[#071a2e]/82 p-4 backdrop-blur-xl hover:border-white/[0.18] transition-all shadow-[0_8px_32px_rgba(2,8,22,0.55)]">
          <p className="text-[11px] font-black uppercase tracking-wider text-[#7eb8d4]">Em execução</p>
          <p className="mt-2 text-[22px] font-black text-emerald-400 leading-none">{runningNowCount}</p>
        </article>
        <article className="rounded-2xl border border-white/[0.10] bg-[#071a2e]/82 p-4 backdrop-blur-xl hover:border-white/[0.18] transition-all shadow-[0_8px_32px_rgba(2,8,22,0.55)]">
          <p className="text-[11px] font-black uppercase tracking-wider text-[#7eb8d4]">Execuções/mês</p>
          <p className="mt-2 text-[22px] font-black text-white leading-none">{totalMonthlyExecutions.toLocaleString('pt-BR')}</p>
        </article>
      </section>

      {/* Search Bar Container with Dark Glassmorphism styling */}
      <div className="rounded-3xl border border-white/[0.10] bg-[#071a2e]/82 p-5 md:p-6 shadow-[0_8px_32px_rgba(2,8,22,0.4)]">
        <div className="relative w-full max-w-lg">
          <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            aria-label="Pesquisar automações"
            placeholder="Pesquisar automações por nome de agente ou cadência…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-11 pr-10 rounded-[12px] border border-white/[0.12] bg-white/[0.06] text-[15px] font-medium text-white placeholder-slate-400 transition-all duration-300 focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FFBE94]/20 focus:bg-[#071a2e]"
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

      {trackedAutomations.length === 0 ? (
        <section className="rounded-[30px] border border-white/[0.10] bg-[#0c213a]/60 backdrop-blur-xl p-8 md:p-10 shadow-[0_8px_32px_rgba(2,8,22,0.4)] text-center text-white flex flex-col items-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.08] text-[#FF6B00] shadow-[0_0_15px_rgba(255,107,0,0.15)]">
            <Bot className="h-7 w-7" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">Nenhuma automação programada no momento</h2>
          <p className="mt-3 text-sm md:text-base text-slate-300 max-w-2xl mx-auto">
            Ative a rotina em um agente para listar aqui automações programadas e em execução com todas as configurações operacionais.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/hub/agentes-ativos"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#FF6B00] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(255,106,0,0.25)] hover:brightness-105 hover:scale-105 active:scale-95 transition-all"
            >
              Ir para Agentes Ativos
            </Link>
            <Link
              href="/hub"
              className="inline-flex h-11 items-center justify-center rounded-[12px] border border-white/10 bg-white/5 px-5 text-sm font-black text-white/80 hover:bg-white/10 hover:text-white hover:scale-105 active:scale-95 transition-all shadow-sm"
            >
              Voltar ao Hub
            </Link>
          </div>
        </section>
      ) : filteredAutomations.length === 0 ? (
        <section className="rounded-[30px] border border-white/[0.10] bg-[#0c213a]/60 backdrop-blur-xl p-8 md:p-10 shadow-[0_8px_32px_rgba(2,8,22,0.4)] text-center text-white flex flex-col items-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.04] border border-white/[0.08] text-[#FF6B00] shadow-[0_0_15px_rgba(255,107,0,0.15)]">
            <Bot className="h-7 w-7" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">Nenhuma automação encontrada</h2>
          <p className="mt-3 text-sm md:text-base text-slate-300 max-w-2xl mx-auto">
            Não encontramos nenhuma automação ativa correspondente à pesquisa &quot;{searchQuery}&quot;.
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-[12px] bg-[#FF6B00] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(255,106,0,0.25)] hover:brightness-105 hover:scale-105 active:scale-95 transition-all"
          >
            Limpar pesquisa
          </button>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_1fr]">
          <article className="rounded-[30px] border border-white/[0.10] bg-[#071a2e]/82 p-5 md:p-6 shadow-[0_8px_32px_rgba(2,8,22,0.4)] text-white">
            <header className="mb-4">
              <h2 className="text-2xl font-black text-white">Relação de Automações Programadas</h2>
              <p className="mt-1 text-sm text-slate-400">
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
                        ? 'border-emerald-500/40 bg-emerald-950/20 shadow-[0_4px_20px_rgba(16,185,129,0.15)]'
                        : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[17px] font-black text-white">{automation.agentTitle}</p>
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
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-950/30 px-3 py-1 text-[11px] font-bold text-emerald-400">
                        {getStatusLabel(automation.status)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{automation.cadenceTitle}</p>
                    {automation.scheduleOptionLabel ? (
                      <p className="mt-1 text-xs font-semibold text-blue-400">Agenda: {automation.scheduleOptionLabel}</p>
                    ) : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-950/30 text-blue-400 border border-blue-500/20 px-2.5 py-1 text-[11px] font-bold">
                        <Activity className="h-3.5 w-3.5" />
                        {automation.monthlyExecutions} execuções/mês
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-950/30 text-amber-400 border border-amber-500/20 px-2.5 py-1 text-[11px] font-bold">
                        <CalendarClock className="h-3.5 w-3.5" />
                        Próxima: {formatAutomationDateTime(automation.nextUpdateAt)}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] text-slate-300 border border-white/[0.08] px-2.5 py-1 text-[11px] font-bold">
                        <Clock3 className="h-3.5 w-3.5" />
                        Atualiza hoje: {automation.nextUpdateAt && automation.nextUpdateAt >= nowTs && automation.nextUpdateAt <= nowTs + 24 * 60 * 60 * 1000 ? 'Sim' : 'Não'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </article>

          <article className="rounded-[30px] border border-white/[0.10] bg-[#071a2e]/82 p-5 md:p-6 shadow-[0_8px_32px_rgba(2,8,22,0.4)] text-white">
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
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-[#FF6B00]">Painel da automação</p>
                  <h3 className="mt-2 text-3xl font-black tracking-tight text-white">{selectedAutomation.agentTitle}</h3>
                  <p className="mt-1 text-sm text-slate-400">{selectedAutomation.agentCategory}</p>
                </header>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl border border-white/[0.08] bg-[#051120]/60 p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Cadência ativa</p>
                    <p className="mt-1 text-lg font-black text-white">{selectedAutomation.cadenceTitle}</p>
                    <p className="mt-1 text-sm text-slate-300">{selectedAutomation.cadence}</p>
                    <p className="mt-1 text-xs text-slate-500">ID da cadência: {selectedAutomation.cadenceId || 'Não informado'}</p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Status e chave da automação</p>
                    <p className="mt-1 text-sm text-white">
                      <strong>Status:</strong> {getStatusLabel(selectedAutomation.status)}
                    </p>
                    <p className="mt-1 text-sm text-white break-all">
                      <strong>Identificador:</strong> {selectedAutomation.key}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Ativada em</p>
                      <p className="mt-1 text-sm font-black text-white">{formatAutomationDateTime(selectedAutomation.activatedAt)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Última edição</p>
                      <p className="mt-1 text-sm font-black text-white">{formatAutomationDateTime(selectedAutomation.updatedAt)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Última atualização</p>
                      <p className="mt-1 text-sm font-black text-white">{formatAutomationDateTime(selectedAutomation.lastUpdateAt)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Próxima atualização</p>
                      <p className="mt-1 text-sm font-black text-white">{formatAutomationDateTime(selectedAutomation.nextUpdateAt)}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Distribuição semanal</p>
                    <p className="mt-1 text-sm text-white">{selectedAutomation.distribution || 'Não informado'}</p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Agenda programada</p>
                    <p className="mt-1 text-sm font-black text-white">{selectedAutomation.scheduleOptionLabel || 'Não informado'}</p>
                    {selectedAutomation.scheduleOptionDetail ? (
                      <p className="mt-1 text-sm text-slate-300">{selectedAutomation.scheduleOptionDetail}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-slate-500">Código interno: {selectedAutomation.scheduleOptionId || 'Não informado'}</p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Objetivo operacional</p>
                    <p className="mt-1 text-sm text-white">{selectedAutomation.objective || 'Não informado'}</p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="inline-flex items-center gap-2 font-bold text-blue-400">
                        <RefreshCw className="h-4 w-4" />
                        Plano: {selectedAutomation.planName || 'Não informado'}
                      </span>
                      <span className="inline-flex items-center gap-2 font-bold text-emerald-400">
                        <Clock3 className="h-4 w-4" />
                        Limite mensal: {selectedAutomation.monthlyLimit || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/hub/agente/${slugifyAgentTitle(selectedAutomation.agentTitle)}`}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-[#0A9D57] px-5 text-sm font-black text-white shadow-[0_12px_24px_rgba(8,183,96,0.25)] transition hover:brightness-105 hover:scale-105 active:scale-95"
                  >
                    Gerenciar no Agente
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/hub/agentes-ativos"
                    className="inline-flex h-11 items-center justify-center rounded-[12px] border border-white/10 bg-white/5 px-5 text-sm font-black text-white/80 hover:bg-white/10 hover:text-white transition-all active:scale-95 shadow-sm"
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
  );
}
