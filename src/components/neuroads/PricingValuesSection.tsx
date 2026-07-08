'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  Bot,
  CalendarClock,
  Gauge,
  Link2,
  ListChecks,
  MessageSquare,
  Plus,
  ShieldCheck,
  Users,
  Workflow,
  Zap,
} from 'lucide-react';
import { HUB_BOOSTER, HUB_PLAN } from '../../data/hub-plan';

function formatBRLFromCents(cents: number): string {
  const value = cents / 100;
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

const includedResources = [
  {
    icon: Bot,
    value: '10',
    label: 'Agentes de IA especializados',
    detail: 'Tráfego, criativos, copies, funil, SEO & GEO e inteligência de dados — o time completo, sem contratação avulsa.',
  },
  {
    icon: ListChecks,
    value: '30+',
    label: 'Operações pré-configuradas',
    detail: 'Executadas pelos agentes com um clique, além de operações personalizadas via chat com o assistente.',
  },
  {
    icon: Gauge,
    value: String(HUB_PLAN.monthlyCredits),
    label: 'Créditos por mês',
    detail: 'Moeda única para execuções de agentes, criativos e ações operacionais. Renova todo ciclo.',
  },
  {
    icon: Workflow,
    value: String(HUB_PLAN.limits.activeAutomations),
    label: 'Automações ativas',
    detail: 'Rotinas agendadas dos agentes rodando em paralelo, com cadência até diária.',
  },
  {
    icon: Link2,
    value: String(HUB_PLAN.limits.adAccounts),
    label: 'Contas de anúncio',
    detail: 'Conectores OAuth para as contas da sua operação (Google Ads e canais integrados).',
  },
  {
    icon: Users,
    value: String(HUB_PLAN.limits.hubUsers),
    label: 'Usuários no Hub',
    detail: 'Acesso para sócios e time de marketing no mesmo workspace.',
  },
  {
    icon: MessageSquare,
    value: String(HUB_PLAN.limits.chatMessagesMonthly),
    label: 'Mensagens de chat/mês',
    detail: 'Assistente operacional incluído — o chat não consome créditos.',
  },
];

const creditTariff = [
  { operation: 'Agente simples', cost: 1 },
  { operation: 'Agente intermediário', cost: 2 },
  { operation: 'Agente avançado', cost: 3 },
  { operation: 'Lote de criativos', cost: 2 },
  { operation: 'Ação operacional', cost: 3 },
];

export default function PricingValuesSection() {
  const prefersReducedMotion = useReducedMotion();

  const reveal = (delay = 0) => ({
    initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 28 },
    whileInView: prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.7, delay },
  });

  return (
    <section id="valores" className="relative w-full py-24 md:py-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — same editorial grid as the solutions section */}
        <motion.div
          {...reveal()}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pb-12 border-b border-slate-300/40"
        >
          <div className="md:col-span-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-[inset_2px_2px_4px_#c8d0e7,inset_-2px_-2px_4px_#ffffff] border border-white/30 text-[9px] font-bold tracking-widest text-slate-500 uppercase mb-4">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              VALORES &amp; RECURSOS
            </div>
            <h2 className="font-head font-extrabold text-3xl md:text-4xl text-slate-900 leading-[1.15] tracking-tight">
              Um plano único. <span className="text-[#FF5500]">Toda a operação</span> dentro dele.
            </h2>
          </div>
          <div className="md:col-span-1">
            <p className="text-slate-500 text-sm leading-relaxed md:pl-6 border-l-2 border-orange-500/20">
              Sem tabela de planos para decifrar: um valor mensal, todos os agentes, limites publicados e créditos como única unidade de consumo.
            </p>
          </div>
        </motion.div>

        {/* Price monument + spec sheet */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
          {/* Left: price lockup */}
          <motion.div
            {...reveal(0.1)}
            className="lg:col-span-5 bg-white shadow-[8px_8px_16px_#c8d0e7,-8px_-8px_16px_#ffffff] border border-white/50 rounded-[28px] p-8 md:p-10 flex flex-col"
          >
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              {HUB_PLAN.name}
            </span>

            <div className="mt-6 flex items-end gap-2">
              <span className="font-head font-extrabold text-slate-900 text-[64px] md:text-[76px] leading-[0.9] tracking-tighter">
                <span className="text-[26px] md:text-[30px] align-top font-black text-[#FF5500] mr-1">R$</span>
                {formatBRLFromCents(HUB_PLAN.monthlyPriceCents)}
              </span>
              <span className="text-slate-500 font-bold text-sm mb-1">/mês</span>
            </div>

            <p className="mt-4 text-slate-500 text-[13px] leading-relaxed">
              No anual, R$ {formatBRLFromCents(HUB_PLAN.annualPriceCents)}/ano — equivalente a dois
              meses grátis.
            </p>

            <div className="mt-8 pt-6 border-t border-slate-300/40 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-white/60 shadow-[3px_3px_6px_#c8d0e7,-3px_-3px_6px_#ffffff] flex items-center justify-center shrink-0">
                  <CalendarClock size={16} className="text-[#FF5500]" />
                </div>
                <p className="text-[12px] text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-800">
                    {HUB_PLAN.trialDays} dias de teste com {HUB_PLAN.trialCredits} créditos
                  </span>{' '}
                  para experimentar os agentes na sua operação real. A assinatura libera os{' '}
                  {HUB_PLAN.monthlyCredits} créditos mensais completos.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-white/60 shadow-[3px_3px_6px_#c8d0e7,-3px_-3px_6px_#ffffff] flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} className="text-[#FF5500]" />
                </div>
                <p className="text-[12px] text-slate-600 leading-relaxed">
                  <span className="font-bold text-slate-800">Limites verificados antes de cada execução</span>
                  {' '}— nenhuma análise é interrompida no meio. Alerta de consumo a partir de{' '}
                  {Math.round(HUB_PLAN.alertThreshold * 100)}%.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right: included resources spec sheet */}
          <motion.div
            {...reveal(0.18)}
            className="lg:col-span-7 bg-white shadow-[8px_8px_16px_#c8d0e7,-8px_-8px_16px_#ffffff] border border-white/50 rounded-[28px] p-8 md:p-10"
          >
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Tudo incluído no plano
            </span>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              {includedResources.map((resource, index) => {
                const Icon = resource.icon;
                return (
                  <div
                    key={resource.label}
                    className={`flex items-start gap-4 py-4 ${
                      index < includedResources.length - (includedResources.length % 2 === 0 ? 2 : 1)
                        ? 'border-b border-slate-300/30'
                        : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-white/60 shadow-[inset_2px_2px_4px_#c8d0e7,inset_-2px_-2px_4px_#ffffff] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={16} className="text-[#FF5500]" strokeWidth={2.2} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-head font-extrabold text-slate-900 text-xl leading-none">
                        {resource.value}
                        <span className="text-[12px] font-bold text-slate-600 ml-1.5 align-middle">
                          {resource.label}
                        </span>
                      </p>
                      <p className="text-slate-500 text-[11px] leading-relaxed mt-1.5">{resource.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Credit tariff — neumorphic keycaps */}
        <motion.div
          {...reveal(0.1)}
          className="mt-8 bg-white shadow-[8px_8px_16px_#c8d0e7,-8px_-8px_16px_#ffffff] border border-white/50 rounded-[28px] p-8 md:p-10"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Tarifário de créditos
              </span>
              <h3 className="font-head font-bold text-slate-900 text-lg tracking-tight mt-2">
                Quanto custa cada operação, em créditos
              </h3>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed md:text-right md:max-w-[280px]">
              O medidor no Hub mostra o saldo em tempo real. Transparência total: você sabe o custo antes de executar.
            </p>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            {creditTariff.map((entry) => (
              <div
                key={entry.operation}
                className="flex items-center gap-3 pl-4 pr-2 py-2 rounded-2xl bg-white border border-white/60 shadow-[4px_4px_8px_#c8d0e7,-4px_-4px_8px_#ffffff]"
              >
                <span className="text-[12px] font-bold text-slate-700">{entry.operation}</span>
                <span className="inline-flex items-center justify-center min-w-[44px] h-8 px-2.5 rounded-xl bg-white shadow-[inset_2px_2px_4px_#c8d0e7,inset_-2px_-2px_4px_#ffffff] border border-white/40 font-head font-extrabold text-[#FF5500] text-sm">
                  {entry.cost} cr
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Booster strip */}
        <motion.div
          {...reveal(0.16)}
          className="mt-8 bg-white shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] border border-white/50 rounded-[24px] p-6 md:p-7 flex flex-col sm:flex-row items-start sm:items-center gap-5"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF5500] to-[#FF8C00] shadow-[3px_3px_8px_rgba(255,85,0,0.25)] flex items-center justify-center shrink-0">
            <Zap size={22} className="text-white" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-head font-bold text-slate-900 text-sm tracking-tight">
              Precisou de mais no meio do ciclo? {HUB_BOOSTER.name} por R${' '}
              {formatBRLFromCents(HUB_BOOSTER.priceCents)}.
            </p>
            <p className="text-slate-500 text-[12px] leading-relaxed mt-1">
              Pacote avulso de {HUB_BOOSTER.credits} créditos, válido no ciclo vigente e disponível
              direto no Hub — contrate quantos precisar, sem mudar de plano.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white shadow-[inset_2px_2px_4px_#c8d0e7,inset_-2px_-2px_4px_#ffffff] border border-white/40 shrink-0">
            <Plus size={12} className="text-[#FF5500]" strokeWidth={3} />
            <span className="text-[11px] font-extrabold text-slate-700">
              {HUB_BOOSTER.credits} créditos · R$ {formatBRLFromCents(HUB_BOOSTER.priceCents)}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
