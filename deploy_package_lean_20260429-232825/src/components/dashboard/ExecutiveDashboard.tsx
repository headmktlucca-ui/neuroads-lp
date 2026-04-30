'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Funnel,
  Gauge,
  Sparkles,
  Wallet,
} from 'lucide-react';

type PeriodKey = '7d' | '30d' | '90d';
type ScenarioKey = 'conservador' | 'base' | 'agressivo';

type MetricCard = {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down';
  helper: string;
};

type AlertItem = {
  id: string;
  severity: 'crítico' | 'alto' | 'médio';
  title: string;
  detail: string;
  impact: string;
  owner: string;
};

type ActionItem = {
  id: string;
  title: string;
  impact: string;
  confidence: number;
  eta: string;
};

type AgentStatus = {
  id: string;
  name: string;
  status: 'ativo' | 'analisando' | 'aguardando';
  lastRun: string;
  nextRun: string;
  impact: string;
  progress: number;
};

type TimelineItem = {
  id: string;
  timestamp: string;
  title: string;
  detail: string;
  result: string;
};

const metricsByPeriod: Record<PeriodKey, MetricCard[]> = {
  '7d': [
    { id: 'roas', label: 'ROAS Médio', value: '4.7x', delta: '+13%', trend: 'up', helper: 'vs. 7 dias anteriores' },
    { id: 'cac', label: 'CAC', value: 'R$ 68', delta: '-9%', trend: 'up', helper: 'custo por cliente otimizado' },
    { id: 'cpl', label: 'CPL', value: 'R$ 14,20', delta: '-6%', trend: 'up', helper: 'captação de leads mais eficiente' },
    { id: 'rev', label: 'Receita Atribuída', value: 'R$ 182 mil', delta: '+18%', trend: 'up', helper: 'vendas com origem rastreada' },
    { id: 'waste', label: 'Verba Desperdiçada', value: '7,8%', delta: '-3,2pp', trend: 'up', helper: 'redução de gasto improdutivo' },
    { id: 'conv', label: 'Taxa de Conversão', value: '3,9%', delta: '+0,7pp', trend: 'up', helper: 'funil com melhor eficiência' },
  ],
  '30d': [
    { id: 'roas', label: 'ROAS Médio', value: '4.2x', delta: '+9%', trend: 'up', helper: 'vs. 30 dias anteriores' },
    { id: 'cac', label: 'CAC', value: 'R$ 74', delta: '-6%', trend: 'up', helper: 'otimização progressiva do custo' },
    { id: 'cpl', label: 'CPL', value: 'R$ 15,80', delta: '-4%', trend: 'up', helper: 'lead mais qualificado' },
    { id: 'rev', label: 'Receita Atribuída', value: 'R$ 706 mil', delta: '+14%', trend: 'up', helper: 'crescimento sustentável' },
    { id: 'waste', label: 'Verba Desperdiçada', value: '9,1%', delta: '-2,1pp', trend: 'up', helper: 'menos fuga de orçamento' },
    { id: 'conv', label: 'Taxa de Conversão', value: '3,5%', delta: '+0,4pp', trend: 'up', helper: 'melhora consistente no funil' },
  ],
  '90d': [
    { id: 'roas', label: 'ROAS Médio', value: '3.8x', delta: '+11%', trend: 'up', helper: 'tendência trimestral positiva' },
    { id: 'cac', label: 'CAC', value: 'R$ 81', delta: '-8%', trend: 'up', helper: 'queda de custo no trimestre' },
    { id: 'cpl', label: 'CPL', value: 'R$ 17,10', delta: '-5%', trend: 'up', helper: 'ganho contínuo de eficiência' },
    { id: 'rev', label: 'Receita Atribuída', value: 'R$ 1,9 mi', delta: '+21%', trend: 'up', helper: 'escala com previsibilidade' },
    { id: 'waste', label: 'Verba Desperdiçada', value: '10,4%', delta: '-3,8pp', trend: 'up', helper: 'menos perdas estruturais' },
    { id: 'conv', label: 'Taxa de Conversão', value: '3,2%', delta: '+0,5pp', trend: 'up', helper: 'processo comercial ajustado' },
  ],
};

const alertsSeed: AlertItem[] = [
  {
    id: 'a1',
    severity: 'crítico',
    title: 'Queda de ROAS na campanha Search | Produto Premium',
    detail: 'ROAS caiu 22% nas últimas 18h. Ocorreu aumento de CPC e queda de CTR.',
    impact: 'Risco estimado: -R$ 7.400 em 7 dias.',
    owner: 'Analista de Tráfego',
  },
  {
    id: 'a2',
    severity: 'alto',
    title: 'CPA acima do limite no conjunto Lookalike 2%',
    detail: 'CPA atual 31% acima da meta configurada para captação.',
    impact: 'Risco estimado: +R$ 2.900 de custo adicional/mês.',
    owner: 'Otimizador de Orçamento',
  },
  {
    id: 'a3',
    severity: 'médio',
    title: 'Taxa de resposta no WhatsApp abaixo da meta',
    detail: 'Tempo médio de resposta subiu para 31 min no período comercial.',
    impact: 'Perda potencial de 9% em conversão de leads quentes.',
    owner: 'Agente de Automação',
  },
];

const actionsSeed: ActionItem[] = [
  {
    id: 'q1',
    title: 'Realocar R$ 1.200 para campanhas com ROAS > 5.0',
    impact: '+18% ROAS estimado em 7 dias',
    confidence: 91,
    eta: 'Executa em ~4 min',
  },
  {
    id: 'q2',
    title: 'Pausar 23 termos de baixa intenção no Google Search',
    impact: '-11% desperdício em 48h',
    confidence: 88,
    eta: 'Executa em ~2 min',
  },
  {
    id: 'q3',
    title: 'Criar 3 variações de criativo para público frio',
    impact: '+0,6pp de CTR projetado',
    confidence: 84,
    eta: 'Executa em ~12 min',
  },
  {
    id: 'q4',
    title: 'Ajustar lance horário para picos de conversão',
    impact: '-9% CPA médio',
    confidence: 86,
    eta: 'Executa em ~3 min',
  },
];

const agentStatus: AgentStatus[] = [
  {
    id: 'g1',
    name: 'Analista de Tráfego',
    status: 'ativo',
    lastRun: 'Hoje, 10:32',
    nextRun: 'Hoje, 12:00',
    impact: 'Redução de custo em 8,4%',
    progress: 82,
  },
  {
    id: 'g2',
    name: 'SEO & GEO',
    status: 'analisando',
    lastRun: 'Hoje, 09:15',
    nextRun: 'Hoje, 13:00',
    impact: '12 oportunidades detectadas',
    progress: 58,
  },
  {
    id: 'g3',
    name: 'Rastreador Cirúrgico',
    status: 'ativo',
    lastRun: 'Hoje, 10:48',
    nextRun: 'Hoje, 11:48',
    impact: 'Atribuição válida em 97,9%',
    progress: 96,
  },
  {
    id: 'g4',
    name: 'Gerador de Criativos',
    status: 'aguardando',
    lastRun: 'Ontem, 19:07',
    nextRun: 'Aguardando briefing',
    impact: 'Fila de 3 campanhas',
    progress: 28,
  },
];

const timelineSeed: TimelineItem[] = [
  {
    id: 't1',
    timestamp: 'Hoje • 10:44',
    title: 'Automação aplicou corte de desperdício',
    detail: '18 termos negativos adicionados e 2 conjuntos pausados.',
    result: 'Economia projetada: R$ 1.320 / mês',
  },
  {
    id: 't2',
    timestamp: 'Hoje • 09:58',
    title: 'Novo criativo publicado para público de remarketing',
    detail: 'Variação com prova social e CTA direto para WhatsApp.',
    result: 'CTR de prévia: +14%',
  },
  {
    id: 't3',
    timestamp: 'Ontem • 17:20',
    title: 'Ajuste de orçamento entre Meta e Google',
    detail: 'Redistribuição tática orientada por margem líquida.',
    result: 'ROAS consolidado: +0,4x',
  },
];

const projectionByScenario: Record<
  ScenarioKey,
  { label: string; revenue7d: string; revenue30d: string; efficiency: string; curve: number[] }
> = {
  conservador: {
    label: 'Conservador',
    revenue7d: 'R$ 192 mil',
    revenue30d: 'R$ 782 mil',
    efficiency: 'Eficiência prevista: 3.9x',
    curve: [36, 42, 47, 45, 49, 52, 55],
  },
  base: {
    label: 'Base',
    revenue7d: 'R$ 214 mil',
    revenue30d: 'R$ 906 mil',
    efficiency: 'Eficiência prevista: 4.4x',
    curve: [38, 47, 52, 50, 57, 61, 65],
  },
  agressivo: {
    label: 'Agressivo',
    revenue7d: 'R$ 247 mil',
    revenue30d: 'R$ 1,04 mi',
    efficiency: 'Eficiência prevista: 4.9x',
    curve: [42, 53, 60, 62, 70, 74, 79],
  },
};

function severityClasses(severity: AlertItem['severity']) {
  if (severity === 'crítico') {
    return 'border-[#FFD2D2] bg-[#FFF5F5] text-[#B42318]';
  }
  if (severity === 'alto') {
    return 'border-[#FFE1CF] bg-[#FFF8F3] text-[#C2410C]';
  }
  return 'border-[#DCE8FF] bg-[#F5F9FF] text-[#1D4ED8]';
}

function statusClasses(status: AgentStatus['status']) {
  if (status === 'ativo') {
    return 'bg-[#E8FFF3] text-[#0A9D57] border-[#BFE8D2]';
  }
  if (status === 'analisando') {
    return 'bg-[#FFF6E8] text-[#D97706] border-[#FFE1B4]';
  }
  return 'bg-[#F3F4F6] text-[#6B7280] border-[#D1D5DB]';
}

export default function ExecutiveDashboard() {
  const [period, setPeriod] = useState<PeriodKey>('30d');
  const [scenario, setScenario] = useState<ScenarioKey>('base');
  const [alerts, setAlerts] = useState<AlertItem[]>(alertsSeed);
  const [actionsDone, setActionsDone] = useState<Record<string, boolean>>({});

  const metrics = metricsByPeriod[period];
  const projection = projectionByScenario[scenario];
  const pendingActions = useMemo(
    () => actionsSeed.filter((item) => !actionsDone[item.id]),
    [actionsDone]
  );

  const dismissAlert = (id: string) => {
    setAlerts((current) => current.filter((item) => item.id !== id));
  };

  const executeAction = (id: string) => {
    setActionsDone((current) => ({ ...current, [id]: true }));
  };

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative z-10 wrap py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="rounded-[30px] border border-[#FFE4D1] bg-white/90 backdrop-blur-sm shadow-[0_20px_40px_-24px_rgba(15,23,42,0.2)] p-6 md:p-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-primary mb-2">
                Painel Executivo NeuroAds
              </p>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight text-text-main">
                Decisão rápida, execução inteligente.
              </h1>
              <p className="mt-2 text-text-muted max-w-2xl">
                Visão consolidada de performance, riscos e oportunidades com prioridade por impacto financeiro.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#DCE3EE] bg-[#F8FAFC] px-4 py-2 text-xs font-semibold text-[#475569]">
                <Clock3 size={14} />
                Última sincronização: há 2 min
              </div>
              <div className="inline-flex rounded-full border border-[#FFD9C0] bg-white p-1">
                {(['7d', '30d', '90d'] as PeriodKey[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPeriod(item)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                      period === item
                        ? 'bg-gradient-to-br from-[#FF6B00] to-[#FF9D00] text-white shadow-[0_8px_16px_rgba(255,107,0,0.28)]'
                        : 'text-[#64748B] hover:text-text-main'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {metrics.map((card, index) => {
              const isPositive = card.trend === 'up';
              return (
                <motion.article
                  key={card.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index, duration: 0.35 }}
                  className="rounded-2xl border border-[#E8ECF3] bg-white p-4 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.35)]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] uppercase tracking-[0.12em] font-bold text-[#64748B]">{card.label}</p>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-bold ${
                        isPositive
                          ? 'border-[#BDE8CF] bg-[#F2FFF7] text-[#0A9D57]'
                          : 'border-[#FFD5D5] bg-[#FFF5F5] text-[#B42318]'
                      }`}
                    >
                      {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {card.delta}
                    </span>
                  </div>
                  <p className="text-2xl font-black tracking-tight text-text-main">{card.value}</p>
                  <p className="mt-1 text-sm text-[#64748B]">{card.helper}</p>
                </motion.article>
              );
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mt-6">
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="xl:col-span-3 rounded-[28px] border border-[#FFE4D1] bg-white/90 p-6 md:p-7"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-primary mb-1">Centro de Alertas</p>
                <h2 className="text-xl md:text-2xl font-black text-text-main">Riscos e desvios em tempo real</h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#E3E8EF] bg-[#F8FAFC] px-3 py-1.5 text-xs font-bold text-[#475569]">
                <AlertTriangle size={14} />
                {alerts.length} alertas ativos
              </span>
            </div>

            <div className="space-y-3">
              {alerts.map((alert) => (
                <motion.article
                  key={alert.id}
                  layout
                  className={`rounded-2xl border p-4 ${severityClasses(alert.severity)}`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div>
                      <p className="text-sm font-black">{alert.title}</p>
                      <p className="mt-1 text-sm opacity-90">{alert.detail}</p>
                      <p className="mt-2 text-xs font-bold opacity-90">{alert.impact}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-widest opacity-80">Agente responsável: {alert.owner}</p>
                    </div>
                    <div className="flex flex-row md:flex-col gap-2 md:w-[200px]">
                      <button
                        type="button"
                        className="flex-1 md:flex-auto rounded-xl bg-white/90 text-text-main border border-white/70 px-3 py-2 text-xs font-bold hover:bg-white transition-colors"
                      >
                        Corrigir agora
                      </button>
                      <button
                        type="button"
                        className="flex-1 md:flex-auto rounded-xl bg-white/90 text-text-main border border-white/70 px-3 py-2 text-xs font-bold hover:bg-white transition-colors"
                      >
                        Gerar plano
                      </button>
                      <button
                        type="button"
                        onClick={() => dismissAlert(alert.id)}
                        className="flex-1 md:flex-auto rounded-xl bg-white/90 text-text-main border border-white/70 px-3 py-2 text-xs font-bold hover:bg-white transition-colors"
                      >
                        Pausar
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
              {alerts.length === 0 && (
                <div className="rounded-2xl border border-[#BDE8CF] bg-[#F2FFF7] p-4 text-[#0A9D57] text-sm font-semibold">
                  Nenhum alerta pendente. O ecossistema está estável no período atual.
                </div>
              )}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="xl:col-span-2 rounded-[28px] border border-[#FFE4D1] bg-white/90 p-6 md:p-7"
          >
            <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-primary mb-1">Fila de Ações</p>
            <h2 className="text-xl md:text-2xl font-black text-text-main mb-5">Prioridade por impacto financeiro</h2>

            <div className="space-y-3">
              {pendingActions.map((action) => (
                <article key={action.id} className="rounded-2xl border border-[#E3E8EF] bg-white p-4">
                  <p className="text-sm font-bold text-text-main">{action.title}</p>
                  <p className="mt-1 text-xs text-[#64748B]">{action.impact}</p>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#475569] mb-1">
                      <span>Confiança da recomendação</span>
                      <span>{action.confidence}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#EEF2F7] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${action.confidence}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF9D00]"
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#64748B]">
                      <CalendarClock size={12} />
                      {action.eta}
                    </span>
                    <button
                      type="button"
                      onClick={() => executeAction(action.id)}
                      className="rounded-xl border border-[#FFD6BD] bg-[#FFF7F1] px-3 py-2 text-xs font-bold text-[#B45309] hover:bg-[#FFECDf] transition-colors"
                    >
                      Executar ação
                    </button>
                  </div>
                </article>
              ))}

              {pendingActions.length === 0 && (
                <div className="rounded-2xl border border-[#BDE8CF] bg-[#F2FFF7] p-4 text-[#0A9D57] text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  Todas as ações recomendadas foram executadas neste ciclo.
                </div>
              )}
            </div>
          </motion.section>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mt-6">
          <motion.section
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="xl:col-span-3 rounded-[28px] border border-[#FFE4D1] bg-white/90 p-6 md:p-7"
          >
            <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-primary mb-1">Agentes Neurais</p>
            <h2 className="text-xl md:text-2xl font-black text-text-main mb-5">Status operacional do ecossistema</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {agentStatus.map((agent) => (
                <article key={agent.id} className="rounded-2xl border border-[#E3E8EF] bg-white p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-text-main">{agent.name}</p>
                    <span className={`inline-flex px-2.5 py-1 rounded-full border text-[11px] font-bold ${statusClasses(agent.status)}`}>
                      {agent.status}
                    </span>
                  </div>
                  <p className="text-sm text-[#64748B] mb-2">{agent.impact}</p>
                  <div className="h-2 rounded-full bg-[#EEF2F7] overflow-hidden mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${agent.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.65, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-[#08B760] to-[#0A9D57]"
                    />
                  </div>
                  <div className="text-[11px] text-[#64748B] flex items-center justify-between">
                    <span>Última execução: {agent.lastRun}</span>
                    <span>Próxima: {agent.nextRun}</span>
                  </div>
                </article>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="xl:col-span-2 rounded-[28px] border border-[#FFE4D1] bg-white/90 p-6 md:p-7"
          >
            <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-primary mb-1">Linha do Tempo</p>
            <h2 className="text-xl md:text-2xl font-black text-text-main mb-5">Evolução e decisões aplicadas</h2>
            <div className="space-y-3">
              {timelineSeed.map((item) => (
                <article key={item.id} className="rounded-2xl border border-[#E3E8EF] bg-white p-4">
                  <p className="text-[11px] uppercase tracking-widest text-[#64748B] font-semibold">{item.timestamp}</p>
                  <p className="mt-1 text-sm font-bold text-text-main">{item.title}</p>
                  <p className="mt-1 text-sm text-[#64748B]">{item.detail}</p>
                  <p className="mt-2 text-xs font-bold text-[#0A9D57]">{item.result}</p>
                </article>
              ))}
            </div>
          </motion.section>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 rounded-[28px] border border-[#FFE4D1] bg-white/90 p-6 md:p-7"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] font-bold text-primary mb-1">Projeção de Receita</p>
              <h2 className="text-xl md:text-2xl font-black text-text-main">Cenários para os próximos ciclos</h2>
            </div>
            <div className="inline-flex rounded-full border border-[#FFD9C0] bg-white p-1">
              {(['conservador', 'base', 'agressivo'] as ScenarioKey[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setScenario(item)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                    scenario === item
                      ? 'bg-gradient-to-br from-[#FF6B00] to-[#FF9D00] text-white shadow-[0_8px_16px_rgba(255,107,0,0.28)]'
                      : 'text-[#64748B] hover:text-text-main'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <article className="rounded-2xl border border-[#E3E8EF] bg-white p-4">
              <p className="text-[11px] uppercase tracking-widest font-bold text-[#64748B]">Receita em 7 dias</p>
              <p className="mt-1 text-2xl font-black text-text-main">{projection.revenue7d}</p>
            </article>
            <article className="rounded-2xl border border-[#E3E8EF] bg-white p-4">
              <p className="text-[11px] uppercase tracking-widest font-bold text-[#64748B]">Receita em 30 dias</p>
              <p className="mt-1 text-2xl font-black text-text-main">{projection.revenue30d}</p>
            </article>
            <article className="rounded-2xl border border-[#E3E8EF] bg-white p-4 lg:col-span-2">
              <p className="text-[11px] uppercase tracking-widest font-bold text-[#64748B]">Eficiência projetada</p>
              <p className="mt-1 text-xl font-black text-[#0A9D57]">{projection.efficiency}</p>
              <p className="mt-1 text-sm text-[#64748B]">Modelo considera sazonalidade, histórico e ritmo de execução atual.</p>
            </article>
          </div>

          <div className="mt-4 rounded-2xl border border-[#E3E8EF] bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-text-main">Curva de tendência ({projection.label})</p>
              <span className="text-[11px] uppercase tracking-widest text-[#64748B] font-semibold">Próximos 7 pontos</span>
            </div>
            <div className="flex items-end gap-2 h-32">
              {projection.curve.map((point, index) => (
                <motion.div
                  key={`${scenario}-${index}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: `${point}%`, opacity: 1 }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  className="flex-1 rounded-t-lg bg-gradient-to-t from-[#FF6B00] to-[#FFB46A]"
                />
              ))}
            </div>
          </div>
        </motion.section>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { id: 'k1', icon: Wallet, label: 'Margem Líquida Estimada', value: '27,4%', note: '+2,1pp no período' },
            { id: 'k2', icon: Funnel, label: 'Conversão do Funil', value: '3,9%', note: 'Topo > Meio > Fundo' },
            { id: 'k3', icon: Gauge, label: 'Health Score da Operação', value: '91/100', note: 'Risco baixo no momento' },
            { id: 'k4', icon: Activity, label: 'Velocidade de Resposta', value: '4m 38s', note: 'SLA em conformidade' },
          ].map((item) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-[#E3E8EF] bg-white/90 p-4"
            >
              <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[#FFE1CF] bg-[#FFF8F3] text-primary mb-3">
                <item.icon size={16} />
              </div>
              <p className="text-[11px] uppercase tracking-widest font-bold text-[#64748B]">{item.label}</p>
              <p className="mt-1 text-2xl font-black text-text-main">{item.value}</p>
              <p className="text-xs text-[#64748B] mt-1">{item.note}</p>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 rounded-2xl border border-[#FFD8BE] bg-gradient-to-r from-[#FFF8F3] to-white p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl border border-[#FFD8BE] bg-white flex items-center justify-center text-primary">
            <Sparkles size={18} />
          </div>
          <p className="text-sm text-[#7C2D12] font-semibold">
            Próximo passo recomendado: ativar rotina diária de otimização automática às 08h para capturar ganhos de abertura de pregão.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
