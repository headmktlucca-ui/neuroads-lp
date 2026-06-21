'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { TrendingUp, Bot, Zap, BarChart2, Target, Link2 } from 'lucide-react';

const SLIDES = [
  {
    badge: 'DASHBOARD ESTRATÉGICO',
    badgeColor: '#FF6A00',
    headline: 'VEJA O RETORNO\nDE CADA REAL\nINVESTIDO',
    sub: 'Dados reais de Google Ads, Meta Ads e GA4 unificados em um painel de controle com inteligência preditiva.',
    statA: { label: 'ROAS médio dos clientes', value: '7.4x' },
    statB: { label: 'Redução de CPA', value: '−28%' },
    visual: 'dashboard',
  },
  {
    badge: 'AGENTES DE IA',
    badgeColor: '#a855f7',
    headline: 'AGENTES QUE\nOTIMIZAM SUAS\nCAMPANHAS 24/7',
    sub: 'IA especializada em mídia paga que ajusta lances, detecta anomalias e gera relatórios sem intervenção manual.',
    statA: { label: 'Horas economizadas/semana', value: '12h+' },
    statB: { label: 'Aumento de conversões', value: '+19%' },
    visual: 'agents',
  },
  {
    badge: 'INTEGRAÇÕES',
    badgeColor: '#22c55e',
    headline: 'CONECTE TODOS\nOS SEUS CANAIS\nEM MINUTOS',
    sub: 'Google Ads, Meta Ads, LinkedIn, TikTok e Google Analytics 4 — todos integrados com segurança OAuth.',
    statA: { label: 'Plataformas disponíveis', value: '8+' },
    statB: { label: 'Tempo de conexão', value: '< 2 min' },
    visual: 'integrations',
  },
];

function DashboardVisual() {
  return (
    <div className="w-full rounded-2xl border border-white/[0.08] bg-[#071525]/80 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-400/80">Ao Vivo</span>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          { label: 'ROAS', value: '7.4x', color: 'text-emerald-400' },
          { label: 'CPA', value: 'R$31', color: 'text-white' },
          { label: 'Conversões', value: '1.482', color: 'text-white' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-2.5">
            <p className="text-[8px] font-bold uppercase tracking-wider text-white/40 mb-1">{kpi.label}</p>
            <p className={`text-[16px] font-black leading-none ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[9px] font-bold uppercase tracking-wider text-white/40">Desempenho — 30 dias</span>
          <TrendingUp className="w-3 h-3 text-emerald-400" />
        </div>
        <svg viewBox="0 0 200 40" className="w-full">
          <polyline
            points="0,35 28,28 56,30 84,18 112,22 140,12 168,15 200,8"
            fill="none"
            stroke="#FF6A00"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="0,35 28,28 56,30 84,18 112,22 140,12 168,15 200,8"
            fill="url(#grad)"
            stroke="none"
            opacity="0.15"
          />
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF6A00" />
              <stop offset="100%" stopColor="#FF6A00" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function AgentsVisual() {
  return (
    <div className="w-full rounded-2xl border border-white/[0.08] bg-[#071525]/80 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-2 mb-3">
        <Bot className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-purple-400/80">Agentes Ativos</span>
      </div>
      <div className="space-y-2">
        {[
          { name: 'DNA da Marca', status: 'aprendendo', color: 'bg-[#FF6A00]/10 border-[#FF6A00]/20 text-[#FF6A00]' },
          { name: 'Otimizador de Lances', status: 'ativo', color: 'bg-purple-500/10 border-purple-500/20 text-purple-400' },
          { name: 'Qualificador de Leads', status: 'ativo', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
          { name: 'Análise Preditiva', status: 'standby', color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
        ].map((agent) => (
          <div key={agent.name} className="flex items-center justify-between rounded-xl bg-white/[0.03] border border-white/[0.06] px-3 py-2">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'standby' ? 'bg-white/20' : 'bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.8)]'}`} />
              <span className="text-[12px] font-semibold text-white/80">{agent.name}</span>
            </div>
            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${agent.color}`}>
              {agent.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IntegrationsVisual() {
  return (
    <div className="w-full rounded-2xl border border-white/[0.08] bg-[#071525]/80 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-400/80">Integrações Conectadas</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { name: 'Google Ads', icon: Target, color: 'text-red-400', bg: 'bg-red-500/10', connected: true },
          { name: 'Meta Ads', icon: BarChart2, color: 'text-blue-400', bg: 'bg-blue-500/10', connected: true },
          { name: 'Google Analytics 4', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10', connected: true },
          { name: 'LinkedIn Ads', icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-500/10', connected: false },
        ].map((integ) => (
          <div key={integ.name} className="flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/[0.06] p-2.5">
            <div className={`w-7 h-7 rounded-lg ${integ.bg} flex items-center justify-center shrink-0`}>
              <integ.icon className={`w-3.5 h-3.5 ${integ.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-white/80 truncate leading-tight">{integ.name}</p>
              <p className={`text-[8px] font-bold mt-0.5 ${integ.connected ? 'text-emerald-400' : 'text-white/25'}`}>
                {integ.connected ? '● Conectado' : '○ Disponível'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuthLeftPanel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((p) => (p + 1) % SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-[#040d18] p-10 lg:p-12">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl transition-colors duration-1000"
          style={{ backgroundColor: slide.badgeColor }}
        />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-[#FF6A00]/10 blur-3xl" />
        {/* Dot grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotgrid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotgrid)" />
        </svg>
      </div>

      {/* Logo */}
      <div className="relative z-10">
        <Image
          src="/images/Logos/LLNeuroAds.png"
          alt="NeuroAds"
          width={160}
          height={40}
          className="h-9 w-auto"
          priority
        />
      </div>

      {/* Slide content */}
      <div className="relative z-10 flex flex-col gap-6 flex-1 justify-center py-8">
        <div
          key={current}
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] mb-4 px-2.5 py-1 rounded-full border"
            style={{ color: slide.badgeColor, borderColor: `${slide.badgeColor}40`, backgroundColor: `${slide.badgeColor}12` }}
          >
            <span className="h-1 w-1 rounded-full" style={{ backgroundColor: slide.badgeColor }} />
            {slide.badge}
          </span>

          <h2 className="text-[28px] lg:text-[32px] font-black text-white leading-[1.1] tracking-tight whitespace-pre-line mb-4">
            {slide.headline}
          </h2>

          <p className="text-[14px] text-white/50 leading-relaxed max-w-sm">
            {slide.sub}
          </p>

          {/* Visual */}
          <div className="mt-6">
            {slide.visual === 'dashboard' && <DashboardVisual />}
            {slide.visual === 'agents' && <AgentsVisual />}
            {slide.visual === 'integrations' && <IntegrationsVisual />}
          </div>
        </div>
      </div>

      {/* Bottom: stats + dots */}
      <div className="relative z-10">
        <div className="border-t border-white/[0.08] pt-5 flex items-center justify-between">
          <div>
            <p className="text-[18px] font-black text-white">{slide.statA.value}</p>
            <p className="text-[11px] text-white/35 font-medium">{slide.statA.label}</p>
          </div>
          <div className="flex gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-[#FF6A00]' : 'w-1.5 bg-white/20'}`}
              />
            ))}
          </div>
          <div className="text-right">
            <p className="text-[18px] font-black text-white">{slide.statB.value}</p>
            <p className="text-[11px] text-white/35 font-medium">{slide.statB.label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
