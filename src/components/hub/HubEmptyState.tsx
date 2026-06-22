'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Activity, TrendingUp, Zap, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    number: 1,
    icon: Activity,
    title: 'Conectar GA4',
    description: 'Rastreie faturamento, conversões e audiência em tempo real.',
  },
  {
    number: 2,
    icon: TrendingUp,
    title: 'Conectar Google Ads ou Meta Ads',
    description: 'Consolide investimento, cliques e ROAS de todas as plataformas.',
  },
  {
    number: 3,
    icon: Zap,
    title: 'Ver seu painel ao vivo',
    description: 'KPIs, funil de conversão e feed de atividade em tempo real.',
  },
];

export default function HubEmptyState() {
  const { user, profile } = useAuth();
  const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Bem-vindo';

  return (
    <div className="w-full max-w-3xl mx-auto py-12 space-y-10" style={{ fontFamily: "'Inter', 'DM Sans', sans-serif" }}>

      {/* Welcome */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-white tracking-tight">
          Olá, {firstName} 👋
        </h1>
        <p className="text-[14px] text-white/50 max-w-md mx-auto leading-relaxed">
          {profile?.companyName
            ? `Configure os conectores da ${profile.companyName}`
            : 'Configure seus conectores'}{' '}
          para ativar o painel de atribuição em tempo real.
        </p>
      </div>

      {/* Steps wizard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={step.number}
              className="relative rounded-2xl border border-white/[0.08] border-l-gradient-orange border-l-transparent bg-[#0a0a0a]/82 p-5 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6A00]/10 border border-[#FF6A00]/20">
                  <span className="text-[13px] font-black text-[#FF6A00]">{step.number}</span>
                </div>
                <Icon className="h-4 w-4 text-white/30" />
              </div>
              <h3 className="text-[13px] font-black text-white leading-snug mb-1">{step.title}</h3>
              <p className="text-[12px] text-white/45 leading-relaxed">{step.description}</p>
              {idx < STEPS.length - 1 && (
                <ArrowRight className="absolute -right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 hidden sm:block z-10" />
              )}
            </div>
          );
        })}
      </div>

      {/* Static preview */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0a]/60 p-5 space-y-3 backdrop-blur-xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-4">
          Pré-visualização do painel
        </p>
        {/* Mock KPI cards */}
        <div className="grid grid-cols-3 gap-3">
          {['Investimento', 'Receita', 'ROAS'].map((label, i) => (
            <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="text-[9px] font-black uppercase tracking-wider text-white/25 mb-2">{label}</div>
              <div className="h-5 w-14 rounded-md bg-white/[0.06] animate-pulse mb-2" />
              <div className="h-1.5 w-full rounded-full bg-white/[0.04] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#FF6A00]/25"
                  style={{ width: `${[65, 80, 50][i]}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        {/* Mock bar chart */}
        <div className="h-16 w-full rounded-xl border border-white/[0.04] bg-white/[0.02] flex items-end px-3 pb-2 gap-1">
          {[30, 45, 38, 55, 60, 52, 70, 65, 80, 72, 85, 78].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-[#FF6A00]/15"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          href="/hub/integracoes"
          className="inline-flex items-center gap-2 rounded-xl bg-[#FF6A00] hover:bg-[#ff8230] px-8 py-3.5 text-[14px] font-black text-white transition-all duration-200 shadow-[0_8px_24px_rgba(255,106,0,0.28)] hover:shadow-[0_8px_32px_rgba(255,106,0,0.42)]"
        >
          Configurar Integrações
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-3 text-[12px] text-white/30">
          Leva menos de 2 minutos para conectar a primeira fonte de dados.
        </p>
      </div>
    </div>
  );
}
