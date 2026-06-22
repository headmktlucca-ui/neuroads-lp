'use client';

import React, { useState } from 'react';
import {
  CreditCard, Receipt, TrendingUp, AlertCircle, Download,
  Plus, ChevronRight, CheckCircle2, Clock, XCircle, ArrowUpRight,
  Wallet, BarChart2, FileText, Shield,
} from 'lucide-react';

const PLAN = {
  name: 'NeuroAds Pro',
  price: 'R$ 497,00',
  cycle: 'mês',
  nextBilling: '22/07/2026',
  status: 'active',
  features: ['Agentes IA ilimitados', 'Dashboard em tempo real', 'Suporte prioritário', 'Integrações ilimitadas'],
};

const INVOICES = [
  { id: 'NR-2026-006', date: '22/06/2026', amount: 'R$ 497,00', status: 'paid', period: 'Jun 2026' },
  { id: 'NR-2026-005', date: '22/05/2026', amount: 'R$ 497,00', status: 'paid', period: 'Mai 2026' },
  { id: 'NR-2026-004', date: '22/04/2026', amount: 'R$ 497,00', status: 'paid', period: 'Abr 2026' },
  { id: 'NR-2026-003', date: '22/03/2026', amount: 'R$ 497,00', status: 'paid', period: 'Mar 2026' },
  { id: 'NR-2026-002', date: '22/02/2026', amount: 'R$ 497,00', status: 'paid', period: 'Fev 2026' },
  { id: 'NR-2026-001', date: '22/01/2026', amount: 'R$ 497,00', status: 'paid', period: 'Jan 2026' },
];

const USAGE = [
  { label: 'Agentes IA ativos', used: 4, total: 'Ilimitado', pct: null },
  { label: 'Integrações conectadas', used: 2, total: 8, pct: 25 },
  { label: 'Automações ativas', used: 3, total: 12, pct: 25 },
  { label: 'Requisições de IA (mês)', used: 8420, total: 50000, pct: 17 },
];

const STATUS_CONFIG = {
  paid:    { label: 'Pago',      icon: CheckCircle2, cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  pending: { label: 'Pendente',  icon: Clock,        cls: 'text-amber-400   bg-amber-500/10   border-amber-500/20'   },
  failed:  { label: 'Falhou',    icon: XCircle,      cls: 'text-red-400     bg-red-500/10     border-red-500/20'     },
};

export default function HubFinanceiroPage() {
  const [cancelConfirm, setCancelConfirm] = useState(false);

  return (
    <div className="w-full space-y-6 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Header */}
      <header className="py-8 border-b border-white/[0.06] mb-8">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF6A00] shadow-[0_0_6px_rgba(255,106,0,0.8)] animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#FF6A00]">Financeiro</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight">Sua Conta & Faturamento</h1>
            <p className="text-[#8fa0b5] text-[15px] mt-2 max-w-xl leading-relaxed">
              Gerencie seu plano, método de pagamento e acompanhe o histórico de faturas.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0d1a2a]/60 border border-[#FF6A00]/20 backdrop-blur-md shrink-0">
            <Shield className="w-4 h-4 text-[#FF6A00]" />
            <span className="text-[13px] font-bold text-white">Plano ativo</span>
            <span className="text-[13px] text-[#8fa0b5]">até {PLAN.nextBilling}</span>
          </div>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Próxima cobrança',   value: PLAN.nextBilling, icon: CreditCard,  color: 'text-[#FF6A00]',   glow: 'rgba(255,106,0,0.1)' },
          { label: 'Valor mensal',        value: PLAN.price,       icon: Wallet,      color: 'text-emerald-400', glow: 'rgba(52,211,153,0.1)' },
          { label: 'Total investido',     value: 'R$ 2.982,00',    icon: TrendingUp,  color: 'text-slate-400',   glow: 'rgba(148,163,184,0.1)' },
        ].map((kpi, i) => (
          <div key={i} className="p-5 rounded-2xl bg-[#0d1a2a]/40 border border-[#FF6A00]/20 backdrop-blur-md relative overflow-hidden group hover:bg-[#0d1a2a]/60 hover:border-[#FF6A00]/40 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-colors" style={{ backgroundColor: kpi.glow }} />
            <div className="flex items-start justify-between relative">
              <div>
                <p className="text-[13px] font-medium text-[#8fa0b5]">{kpi.label}</p>
                <h3 className="text-2xl font-black text-white mt-1 tracking-tight">{kpi.value}</h3>
              </div>
              <div className={`p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] ${kpi.color}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Plano atual */}
        <div className="lg:col-span-1 rounded-2xl border border-[#FF6A00]/20 bg-[#0d1a2a]/40 backdrop-blur-md overflow-hidden shadow-lg flex flex-col">
          <div className="p-5 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-white">Plano Atual</h2>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ativo
            </span>
          </div>
          <div className="p-5 flex-1">
            <div className="mb-4">
              <p className="text-[11px] font-black uppercase tracking-wider text-[#8fa0b5] mb-1">Seu plano</p>
              <p className="text-[22px] font-black text-white">{PLAN.name}</p>
              <p className="text-[#FF6A00] font-black text-[18px] mt-0.5">
                {PLAN.price}<span className="text-[13px] text-[#8fa0b5] font-normal">/{PLAN.cycle}</span>
              </p>
            </div>
            <ul className="space-y-2.5 mb-6">
              {PLAN.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2.5 text-[13px] text-white/70">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button className="w-full h-10 rounded-xl bg-gradient-to-r from-[#F24900] to-[#FF8805] hover:from-[#d93f00] hover:to-[#e07500] text-white font-bold text-[13px] transition-all shadow-[0_0_20px_rgba(255,106,0,0.25)]">
              Fazer Upgrade
            </button>
            {!cancelConfirm ? (
              <button
                onClick={() => setCancelConfirm(true)}
                className="w-full mt-2 h-10 rounded-xl border border-white/[0.08] bg-transparent hover:bg-white/[0.04] text-[#8fa0b5] hover:text-white font-bold text-[13px] transition-all"
              >
                Cancelar Plano
              </button>
            ) : (
              <div className="mt-2 p-3 rounded-xl border border-red-500/20 bg-red-500/10">
                <p className="text-[12px] text-red-400 mb-2">Tem certeza? Você perderá acesso imediatamente.</p>
                <div className="flex gap-2">
                  <button onClick={() => setCancelConfirm(false)} className="flex-1 h-8 rounded-lg border border-white/[0.1] text-white/60 hover:text-white text-[12px] font-bold transition-colors">
                    Não, manter
                  </button>
                  <button className="flex-1 h-8 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 text-[12px] font-bold transition-colors">
                    Confirmar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Coluna direita */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Método de pagamento */}
          <div className="rounded-2xl border border-[#FF6A00]/20 bg-[#0d1a2a]/40 backdrop-blur-md overflow-hidden shadow-lg">
            <div className="p-5 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-white">Método de Pagamento</h2>
              <button className="flex items-center gap-1.5 text-[12px] font-bold text-[#FF6A00] hover:text-[#FF8805] transition-colors">
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
            </div>
            <div className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 rounded-lg bg-gradient-to-br from-slate-600 to-slate-800 border border-white/[0.1] flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white/60" />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-white">•••• •••• •••• 4242</p>
                  <p className="text-[12px] text-[#8fa0b5]">Visa · Expira 08/2028</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Padrão</span>
                <button className="text-[12px] text-[#8fa0b5] hover:text-white transition-colors font-bold">Editar</button>
              </div>
            </div>
          </div>

          {/* Uso do plano */}
          <div className="rounded-2xl border border-[#FF6A00]/20 bg-[#0d1a2a]/40 backdrop-blur-md overflow-hidden shadow-lg">
            <div className="p-5 border-b border-white/[0.06] bg-white/[0.02]">
              <h2 className="text-[15px] font-bold text-white">Uso do Plano</h2>
            </div>
            <div className="p-5 space-y-4">
              {USAGE.map((u, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[13px] text-[#8fa0b5]">{u.label}</span>
                    <span className="text-[12px] font-bold text-white">
                      {typeof u.used === 'number' && typeof u.total === 'number'
                        ? `${u.used.toLocaleString('pt-BR')} / ${u.total.toLocaleString('pt-BR')}`
                        : `${u.used} / ${u.total}`}
                    </span>
                  </div>
                  {u.pct !== null ? (
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#F24900] to-[#FF8805] transition-all"
                        style={{ width: `${u.pct}%` }}
                      />
                    </div>
                  ) : (
                    <div className="h-1.5 rounded-full bg-emerald-500/20 overflow-hidden">
                      <div className="h-full w-full rounded-full bg-emerald-500/40" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Histórico de faturas */}
      <div className="rounded-2xl border border-[#FF6A00]/20 bg-[#0d1a2a]/40 backdrop-blur-md overflow-hidden shadow-lg">
        <div className="p-5 border-b border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#FF6A00]" />
            <h2 className="text-[15px] font-bold text-white">Histórico de Faturas</h2>
          </div>
          <button className="flex items-center gap-1.5 text-[12px] font-bold text-[#8fa0b5] hover:text-white transition-colors border border-white/[0.08] px-3 py-1.5 rounded-lg hover:bg-white/[0.04]">
            <Download className="w-3.5 h-3.5" /> Exportar todas
          </button>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {INVOICES.map((inv) => {
            const s = STATUS_CONFIG[inv.status as keyof typeof STATUS_CONFIG];
            return (
              <div key={inv.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                    <FileText className="w-4 h-4 text-[#8fa0b5]" />
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-white">{inv.period}</p>
                    <p className="text-[12px] text-[#8fa0b5]">{inv.id} · {inv.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <span className="text-[14px] font-black text-white">{inv.amount}</span>
                  <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${s.cls}`}>
                    <s.icon className="w-3.5 h-3.5" />
                    {s.label}
                  </span>
                  <button className="flex items-center gap-1 text-[12px] text-[#8fa0b5] hover:text-[#FF6A00] transition-colors font-bold opacity-0 group-hover:opacity-100">
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerta de segurança */}
      <div className="flex items-start gap-4 p-4 rounded-2xl border border-slate-500/20 bg-slate-500/5">
        <AlertCircle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-[13px] font-bold text-white mb-0.5">Pagamentos com segurança SSL</p>
          <p className="text-[12px] text-[#8fa0b5] leading-relaxed">
            Todos os dados financeiros são processados com criptografia de ponta e nunca armazenamos os detalhes do seu cartão. Operamos via gateway certificado PCI-DSS.
          </p>
        </div>
      </div>

    </div>
  );
}
