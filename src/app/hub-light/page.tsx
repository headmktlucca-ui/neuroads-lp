'use client';

import React, { useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  Bell,
  Brain,
  ChevronRight,
  Cpu,
  FlaskConical,
  Layers,
  LayoutDashboard,
  Link2,
  MousePointerClick,
  Plug2,
  RefreshCw,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from 'lucide-react';

/* ─── Design tokens (Light) ─────────────────────────────────────── */
const T = {
  bg: '#F1F5F9',          // slate-100
  surface: '#FFFFFF',
  surfaceAlt: '#F8FAFC',  // slate-50
  border: '#E2E8F0',      // slate--200
  borderSubtle: '#F1F5F9',
  text: '#0F172A',        // slate-900
  textSub: '#475569',     // slate-600
  textMuted: '#94A3B8',   // slate-400
  accent: '#FF6A00',      // brand orange
  accentLight: '#FFF4ED', // orange tint
  accentMid: '#FFEDE0',
  success: '#059652',
  successLight: '#ECFDF5',
  danger: '#DC2626',
  dangerLight: '#FEF2F2',
  blue: '#2563EB',
  blueLight: '#EFF6FF',
  amber: '#D97706',
  amberLight: '#FFFBEB',
};

/* ─── Mock data ──────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/hub', active: true },
  { icon: Brain, label: 'Laboratório IA', href: '/hub/laboratorio-agentes' },
  { icon: BarChart2, label: 'Performance', href: '/hub/performance' },
  { icon: FlaskConical, label: 'Criativos', href: '/hub/criativos' },
  { icon: Plug2, label: 'Integrações', href: '/hub/integracoes' },
  { icon: Cpu, label: 'Automações', href: '/hub/automacoes' },
  { icon: Layers, label: 'Explorar', href: '/hub/explorar' },
  { icon: Settings, label: 'Configurações', href: '/hub/configuracoes' },
];

const KPIS = [
  {
    label: 'Receita Total',
    value: 'R$ 128.450',
    delta: '+18,4%',
    positive: true,
    icon: Wallet,
    color: T.success,
    bg: T.successLight,
  },
  {
    label: 'Investimento',
    value: 'R$ 34.200',
    delta: '+6,2%',
    positive: false,
    icon: Target,
    color: T.blue,
    bg: T.blueLight,
  },
  {
    label: 'ROAS Médio',
    value: '3,75×',
    delta: '+0,43×',
    positive: true,
    icon: TrendingUp,
    color: T.accent,
    bg: T.accentLight,
  },
  {
    label: 'Conversões',
    value: '2.847',
    delta: '+22,1%',
    positive: true,
    icon: ShoppingCart,
    color: T.success,
    bg: T.successLight,
  },
  {
    label: 'CPA Médio',
    value: 'R$ 12,01',
    delta: '-8,3%',
    positive: true,
    icon: MousePointerClick,
    color: T.amber,
    bg: T.amberLight,
  },
  {
    label: 'Usuários Ativos',
    value: '14.380',
    delta: '+31,7%',
    positive: true,
    icon: Users,
    color: T.blue,
    bg: T.blueLight,
  },
];

const CHANNELS = [
  { name: 'Google Ads', spend: 18400, revenue: 72000, roas: 3.91, conversions: 1482, status: 'ativo' },
  { name: 'Meta Ads',   spend: 9800,  revenue: 36200, roas: 3.69, conversions: 890,  status: 'ativo' },
  { name: 'LinkedIn',   spend: 6000,  revenue: 20250, roas: 3.38, conversions: 475,  status: 'ativo' },
];

const AGENTS = [
  { name: 'Copy Persuasivo', desc: 'Criação de anúncios com gatilhos', status: 'Ativo', runs: 124 },
  { name: 'Análise ROAS',    desc: 'Diagnóstico automático por canal', status: 'Ativo', runs: 87  },
  { name: 'Brief Criativo',  desc: 'Geração de briefings visuais',    status: 'Beta',  runs: 42  },
];

const ALERTS = [
  { color: T.danger,  icon: ArrowDownRight, text: 'ROAS Google Ads caiu 12% nas últimas 24h', time: '2h atrás' },
  { color: T.success, icon: ArrowUpRight,   text: 'Meta Ads ultrapassou meta mensal de conversões', time: '5h atrás' },
  { color: T.amber,   icon: Activity,       text: 'LinkedIn Ads: orçamento 82% consumido', time: '1d atrás' },
];

/* ─── Sub-components ─────────────────────────────────────────────── */

function Sidebar() {
  return (
    <aside
      className="hidden lg:flex flex-col w-[220px] shrink-0 h-full border-r"
      style={{ background: T.surface, borderColor: T.border }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-[22px] border-b" style={{ borderColor: T.border }}>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[11px] font-black"
          style={{ background: `linear-gradient(135deg, ${T.accent}, #FF8805)` }}
        >
          N
        </div>
        <span className="text-[15px] font-bold tracking-tight" style={{ color: T.text }}>
          NeuroAds
        </span>
        <span
          className="ml-auto text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
          style={{ color: T.accent, background: T.accentLight }}
        >
          Hub
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ icon: Icon, label, href, active }) => (
          <a
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150 group"
            style={{
              color: active ? T.accent : T.textSub,
              background: active ? T.accentLight : 'transparent',
              fontWeight: active ? 700 : 500,
            }}
          >
            <Icon size={16} />
            {label}
            {active && (
              <span
                className="ml-auto w-1.5 h-1.5 rounded-full"
                style={{ background: T.accent }}
              />
            )}
          </a>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 pb-4">
        <div
          className="flex items-center gap-3 px-3 py-3 rounded-xl border cursor-pointer hover:bg-slate-50 transition-colors"
          style={{ borderColor: T.border }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0"
            style={{ background: `linear-gradient(135deg, ${T.accent}, #FF8805)` }}
          >
            L
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold truncate" style={{ color: T.text }}>Lucca</p>
            <p className="text-[11px] truncate" style={{ color: T.textMuted }}>Premium</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header
      className="flex items-center gap-4 px-6 h-14 border-b shrink-0"
      style={{ background: T.surface, borderColor: T.border }}
    >
      {/* Search */}
      <div
        className="flex items-center gap-2 flex-1 max-w-xs px-3 h-9 rounded-xl border text-[13px]"
        style={{ borderColor: T.border, background: T.bg, color: T.textMuted }}
      >
        <Search size={14} />
        <span>Buscar no Hub…</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Refresh */}
        <button
          className="flex items-center gap-1.5 px-3 h-8 rounded-lg border text-[12px] font-medium transition-colors hover:bg-slate-50"
          style={{ borderColor: T.border, color: T.textSub }}
        >
          <RefreshCw size={13} />
          Atualizar
        </button>

        {/* Period */}
        <button
          className="flex items-center gap-1.5 px-3 h-8 rounded-lg border text-[12px] font-medium"
          style={{ borderColor: T.border, color: T.textSub, background: T.surfaceAlt }}
        >
          Últimos 30 dias
          <ChevronRight size={13} className="-rotate-90" />
        </button>

        {/* Bell */}
        <button
          className="relative w-8 h-8 rounded-lg border flex items-center justify-center transition-colors hover:bg-slate-50"
          style={{ borderColor: T.border, color: T.textSub }}
        >
          <Bell size={15} />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ background: T.accent }}
          />
        </button>
      </div>
    </header>
  );
}

function KpiCard({ kpi }: { kpi: typeof KPIS[0] }) {
  const Icon = kpi.icon;
  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200"
      style={{ background: T.surface, borderColor: T.border }}
    >
      <div className="flex items-center justify-between">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: kpi.bg }}
        >
          <Icon size={18} style={{ color: kpi.color }} />
        </div>
        <span
          className="flex items-center gap-1 text-[12px] font-semibold px-2 py-0.5 rounded-full"
          style={{
            color: kpi.positive ? T.success : T.danger,
            background: kpi.positive ? T.successLight : T.dangerLight,
          }}
        >
          {kpi.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {kpi.delta}
        </span>
      </div>
      <div>
        <p className="text-[22px] font-black tracking-tight tabular-nums" style={{ color: T.text }}>
          {kpi.value}
        </p>
        <p className="text-[12px] mt-0.5" style={{ color: T.textMuted }}>{kpi.label}</p>
      </div>
    </div>
  );
}

function ChannelRow({ ch, idx }: { ch: typeof CHANNELS[0]; idx: number }) {
  const roasColor = ch.roas >= 3.5 ? T.success : ch.roas >= 2.5 ? T.amber : T.danger;
  return (
    <tr
      className="border-b last:border-0 hover:bg-slate-50 transition-colors"
      style={{ borderColor: T.borderSubtle }}
    >
      <td className="py-3.5 px-5">
        <div className="flex items-center gap-2.5">
          <span
            className="w-1.5 h-6 rounded-full shrink-0"
            style={{ background: [T.accent, T.blue, T.amber][idx] }}
          />
          <span className="text-[13px] font-semibold" style={{ color: T.text }}>{ch.name}</span>
        </div>
      </td>
      <td className="py-3.5 px-4 text-right text-[13px] tabular-nums" style={{ color: T.textSub }}>
        R$ {ch.spend.toLocaleString('pt-BR')}
      </td>
      <td className="py-3.5 px-4 text-right text-[13px] tabular-nums font-semibold" style={{ color: T.text }}>
        R$ {ch.revenue.toLocaleString('pt-BR')}
      </td>
      <td className="py-3.5 px-4 text-right">
        <span
          className="text-[12px] font-bold px-2 py-0.5 rounded-lg"
          style={{ color: roasColor, background: roasColor === T.success ? T.successLight : roasColor === T.amber ? T.amberLight : T.dangerLight }}
        >
          {ch.roas.toFixed(2)}×
        </span>
      </td>
      <td className="py-3.5 px-5 text-right text-[13px] tabular-nums" style={{ color: T.textSub }}>
        {ch.conversions.toLocaleString('pt-BR')}
      </td>
    </tr>
  );
}

/* ─── Main page ──────────────────────────────────────────────────── */
export default function HubLightPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'channels'>('overview');

  return (
    <div
      className="flex h-screen overflow-hidden font-sans antialiased"
      style={{ background: T.bg, color: T.text }}
    >
      <Sidebar />

      {/* Right column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Page header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="h-1.5 w-1.5 rounded-full animate-pulse"
                  style={{ background: T.accent, boxShadow: `0 0 6px ${T.accent}` }}
                />
                <span
                  className="text-[10px] font-black uppercase tracking-[0.16em]"
                  style={{ color: T.accent }}
                >
                  Dashboard
                </span>
              </div>
              <h1
                className="text-[26px] font-black tracking-tight leading-tight"
                style={{ color: T.text }}
              >
                Visão Estratégica
              </h1>
              <p className="text-[13px] mt-1" style={{ color: T.textMuted }}>
                Resumo dos últimos 30 dias · Atualizado agora há pouco
              </p>
            </div>

            {/* Primary CTA */}
            <button
              className="flex items-center gap-2 px-4 h-9 rounded-xl text-white text-[13px] font-bold shadow-sm hover:shadow-md transition-all duration-150 hover:scale-[1.02]"
              style={{ background: `linear-gradient(135deg, #F24900, #FF8805)` }}
            >
              <Sparkles size={14} />
              Análise com IA
            </button>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {KPIS.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </div>

          {/* Main content row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Channel table — 2/3 width */}
            <div
              className="lg:col-span-2 rounded-2xl border overflow-hidden"
              style={{ background: T.surface, borderColor: T.border }}
            >
              {/* Card header */}
              <div
                className="flex items-center justify-between px-5 py-4 border-b"
                style={{ borderColor: T.border }}
              >
                <div className="flex items-center gap-2">
                  <BarChart2 size={16} style={{ color: T.accent }} />
                  <span className="text-[14px] font-bold" style={{ color: T.text }}>
                    Performance por Canal
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {(['overview', 'channels'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTab(t)}
                      className="px-3 py-1 rounded-lg text-[12px] font-medium transition-colors"
                      style={{
                        background: activeTab === t ? T.accentLight : 'transparent',
                        color: activeTab === t ? T.accent : T.textMuted,
                        fontWeight: activeTab === t ? 700 : 500,
                      }}
                    >
                      {t === 'overview' ? 'Resumo' : 'Canais'}
                    </button>
                  ))}
                </div>
              </div>

              <table className="w-full">
                <thead>
                  <tr style={{ background: T.surfaceAlt }}>
                    {['Canal', 'Investimento', 'Receita', 'ROAS', 'Conversões'].map((h, i) => (
                      <th
                        key={h}
                        className={`py-2.5 px-${i === 0 || i === 4 ? 5 : 4} text-[11px] font-bold uppercase tracking-[0.06em] ${i > 0 ? 'text-right' : 'text-left'}`}
                        style={{ color: T.textMuted }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CHANNELS.map((ch, i) => (
                    <ChannelRow key={ch.name} ch={ch} idx={i} />
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: T.surfaceAlt }}>
                    <td className="py-3 px-5 text-[12px] font-bold" style={{ color: T.text }}>Total</td>
                    <td className="py-3 px-4 text-right text-[12px] font-bold tabular-nums" style={{ color: T.text }}>
                      R$ 34.200
                    </td>
                    <td className="py-3 px-4 text-right text-[12px] font-bold tabular-nums" style={{ color: T.text }}>
                      R$ 128.450
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-[12px] font-black px-2 py-0.5 rounded-lg" style={{ color: T.success, background: T.successLight }}>
                        3,75×
                      </span>
                    </td>
                    <td className="py-3 px-5 text-right text-[12px] font-bold tabular-nums" style={{ color: T.text }}>
                      2.847
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Right column — alerts + agents */}
            <div className="space-y-5">

              {/* Alerts */}
              <div
                className="rounded-2xl border overflow-hidden"
                style={{ background: T.surface, borderColor: T.border }}
              >
                <div
                  className="flex items-center gap-2 px-4 py-3.5 border-b"
                  style={{ borderColor: T.border }}
                >
                  <Activity size={15} style={{ color: T.accent }} />
                  <span className="text-[13px] font-bold" style={{ color: T.text }}>Alertas</span>
                  <span
                    className="ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-full"
                    style={{ background: T.accentLight, color: T.accent }}
                  >
                    {ALERTS.length}
                  </span>
                </div>
                <div className="divide-y" style={{ borderColor: T.borderSubtle }}>
                  {ALERTS.map((a, i) => {
                    const Icon = a.icon;
                    return (
                      <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: a.color + '18' }}
                        >
                          <Icon size={13} style={{ color: a.color }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[12px] leading-snug" style={{ color: T.text }}>{a.text}</p>
                          <p className="text-[11px] mt-0.5" style={{ color: T.textMuted }}>{a.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Active Agents */}
              <div
                className="rounded-2xl border overflow-hidden"
                style={{ background: T.surface, borderColor: T.border }}
              >
                <div
                  className="flex items-center gap-2 px-4 py-3.5 border-b"
                  style={{ borderColor: T.border }}
                >
                  <Brain size={15} style={{ color: T.accent }} />
                  <span className="text-[13px] font-bold" style={{ color: T.text }}>Agentes Ativos</span>
                  <a
                    href="/hub/laboratorio-agentes"
                    className="ml-auto text-[11px] font-semibold flex items-center gap-1 transition-colors hover:opacity-80"
                    style={{ color: T.accent }}
                  >
                    Ver todos <ChevronRight size={11} />
                  </a>
                </div>
                <div className="divide-y" style={{ borderColor: T.borderSubtle }}>
                  {AGENTS.map((ag) => (
                    <div key={ag.name} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: T.accentLight }}
                      >
                        <Zap size={13} style={{ color: T.accent }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-semibold truncate" style={{ color: T.text }}>{ag.name}</p>
                        <p className="text-[11px] truncate" style={{ color: T.textMuted }}>{ag.desc}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{
                            color: ag.status === 'Ativo' ? T.success : T.amber,
                            background: ag.status === 'Ativo' ? T.successLight : T.amberLight,
                          }}
                        >
                          {ag.status}
                        </span>
                        <p className="text-[10px] mt-0.5" style={{ color: T.textMuted }}>{ag.runs} execuções</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom quick-access row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Link2,      label: 'Integrações',     sub: '3 canais ativos',     href: '/hub/integracoes',     color: T.blue   },
              { icon: FlaskConical, label: 'Criativos',     sub: '12 peças esta semana', href: '/hub/criativos',      color: T.accent },
              { icon: Cpu,         label: 'Automações',     sub: '5 flows ativos',      href: '/hub/automacoes',      color: T.success },
              { icon: Sparkles,    label: 'Assistente IA',  sub: 'Pergunte algo novo',  href: '/hub/assistente-ia',   color: T.amber  },
            ].map(({ icon: Icon, label, sub, href, color }) => (
              <a
                key={label}
                href={href}
                className="group flex items-center gap-3 px-4 py-4 rounded-2xl border hover:shadow-sm transition-all duration-150 hover:-translate-y-px"
                style={{ background: T.surface, borderColor: T.border }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                  style={{ background: color + '18' }}
                >
                  <Icon size={17} style={{ color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold truncate" style={{ color: T.text }}>{label}</p>
                  <p className="text-[11px] truncate" style={{ color: T.textMuted }}>{sub}</p>
                </div>
                <ArrowUpRight
                  size={14}
                  className="ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: T.textMuted }}
                />
              </a>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
