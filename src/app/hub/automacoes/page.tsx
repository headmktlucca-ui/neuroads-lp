'use client';

import React from 'react';
import { Activity, Power, Clock, ArrowRight, Settings, CheckCircle2 } from 'lucide-react';

const AUTOMATIONS = [
  { id: 1, name: 'Sincronização de Leads Premium', status: 'active', lastRun: 'Há 5 minutos', runs: 1240 },
  { id: 2, name: 'Otimização de Lance (Meta Ads)', status: 'active', lastRun: 'Há 1 hora', runs: 86 },
  { id: 3, name: 'Relatório Semanal Consolidado', status: 'inactive', lastRun: 'Há 3 dias', runs: 14 },
];

export default function HubAutomacoesPage() {
  return (
    <div className="w-full space-y-6 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="py-8 border-b border-white/[0.06] mb-8">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF6A00] shadow-[0_0_6px_rgba(255,106,0,0.8)] animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#FF6A00]">Automações</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight">Fluxos Inteligentes</h1>
            <p className="text-[#8fa0b5] text-[15px] mt-2 max-w-xl leading-relaxed">
              Automatize tarefas repetitivas e libere sua equipe para o que realmente importa. Cada fluxo trabalha 24/7 no seu lugar.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0d1a2a]/60 border border-[#FF6A00]/20 backdrop-blur-md shrink-0">
            <Activity className="w-4 h-4 text-[#FF6A00]" />
            <span className="text-[13px] font-bold text-white">12 automações</span>
            <span className="text-[13px] text-[#8fa0b5]">ativas</span>
          </div>
        </div>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Automações Ativas', value: '12', icon: Activity, color: 'text-emerald-400', shadow: 'shadow-[0_0_15px_rgba(52,211,153,0.1)]' },
          { label: 'Tarefas Executadas (30d)', value: '45.2k', icon: CheckCircle2, color: 'text-blue-400', shadow: 'shadow-[0_0_15px_rgba(96,165,250,0.1)]' },
          { label: 'Horas Economizadas', value: '128h', icon: Clock, color: 'text-purple-400', shadow: 'shadow-[0_0_15px_rgba(192,132,252,0.1)]' },
        ].map((stat, i) => (
          <div key={i} className="p-5 rounded-2xl bg-[#0d1a2a]/40 border border-white/[0.06] backdrop-blur-md relative overflow-hidden group hover:bg-[#0d1a2a]/60 hover:border-white/[0.1] transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/[0.04] transition-colors" />
            <div className="flex items-start justify-between relative">
              <div>
                <p className="text-[13px] font-medium text-[#8fa0b5]">{stat.label}</p>
                <h3 className="text-2xl font-black text-white mt-1 tracking-tight">{stat.value}</h3>
              </div>
              <div className={`p-2 rounded-lg bg-white/[0.03] border border-white/[0.05] ${stat.color} ${stat.shadow}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d1a2a]/40 backdrop-blur-md overflow-hidden shadow-lg">
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
          <h2 className="text-[15px] font-bold text-white">Fluxos Recentes</h2>
          <button className="text-[13px] text-[#FF6A00] font-semibold hover:text-[#FF8000] transition-colors flex items-center gap-1 bg-[#FF6A00]/10 px-3 py-1.5 rounded-lg border border-[#FF6A00]/20 hover:bg-[#FF6A00]/20">
            Novo Fluxo <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {AUTOMATIONS.map((flow) => (
            <div key={flow.id} className="p-5 flex items-center justify-between hover:bg-white/[0.03] transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                  flow.status === 'active' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : 'bg-white/[0.05] border-white/[0.1] text-[#8fa0b5]'
                }`}>
                  <Power className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-white group-hover:text-[#FF6A00] transition-colors">{flow.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-[12px] text-[#8fa0b5]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {flow.lastRun}
                    </span>
                    <span>•</span>
                    <span>{flow.runs} execuções</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  flow.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/[0.05] text-[#8fa0b5]'
                }`}>
                  {flow.status === 'active' ? 'Ativo' : 'Pausado'}
                </div>
                <button className="p-2 text-[#8fa0b5] hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
