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
    <div className="w-full space-y-6 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-[#1e293b]">
      <header className="py-8 border-b border-slate-200 mb-8">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF6A00]" />
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#FF6A00]">Automações</span>
            </div>
            <h1 className="text-3xl font-black text-[#0f172a] tracking-tight leading-tight">Fluxos Inteligentes</h1>
            <p className="text-slate-500 text-[15px] mt-2 max-w-xl font-bold leading-relaxed">
              Automatize tarefas repetitivas e libere sua equipe para o que realmente importa. Cada fluxo trabalha 24/7 no seu lugar.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-white/60 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] shrink-0">
            <Activity className="w-4 h-4 text-[#FF6A00]" />
            <span className="text-[13px] font-bold text-[#1e293b]">12 automações</span>
            <span className="text-[13px] text-slate-500 font-medium">ativas</span>
          </div>
        </div>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Automações Ativas', value: '12', icon: Activity, color: 'text-emerald-600' },
          { label: 'Tarefas Executadas (30d)', value: '45.2k', icon: CheckCircle2, color: 'text-slate-500' },
          { label: 'Horas Economizadas', value: '128h', icon: Clock, color: 'text-orange-600' },
        ].map((stat, i) => (
          <div
            key={i}
            className="group relative rounded-2xl border border-white/50 bg-[#eef2f7] p-5 shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#c2cbd9,_-4px_-4px_8px_#ffffff] transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[13px] font-bold text-slate-500">{stat.label}</p>
                <h3 className="text-2xl font-black text-[#0f172a] mt-1 tracking-tight">{stat.value}</h3>
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center border border-white/40 bg-[#eef2f7] shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="rounded-3xl border border-white/50 bg-[#eef2f7] overflow-hidden text-[#1e293b] shadow-[5px_5px_10px_#d1d9e6,_-5px_-5px_10px_#ffffff]">
        <div className="p-5 border-b border-slate-200 bg-slate-100/30 flex items-center justify-between">
          <h2 className="text-[15px] font-black text-[#0f172a]">Fluxos Recentes</h2>
          <button className="inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] bg-gradient-to-r from-[#FF6A00] to-[#FF8805] px-5 text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(255,106,0,0.25)] transition hover:brightness-105 hover:scale-[1.02] active:scale-95">
            <span>Novo Fluxo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="divide-y divide-slate-200 bg-slate-50/10">
          {AUTOMATIONS.map((flow) => (
            <div key={flow.id} className="p-5 flex items-center justify-between hover:bg-slate-100/10 transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                  flow.status === 'active' 
                    ? 'bg-emerald-50/50 border-emerald-500/20 text-[#0d9488]' 
                    : 'bg-[#eef2f7] border border-white/40 text-slate-400 shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff]'
                }`}>
                  <Power className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[14px] font-bold text-[#1e293b] group-hover:text-[#FF6A00] transition-colors">{flow.name}</h3>
                  <div className="flex items-center gap-3 mt-1 text-[12px] text-slate-500 font-semibold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {flow.lastRun}
                    </span>
                    <span>•</span>
                    <span>{flow.runs} execuções</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  flow.status === 'active' 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-[#0d9488]' 
                    : 'bg-slate-200/50 border-slate-300 text-slate-500'
                }`}>
                  {flow.status === 'active' ? 'Ativo' : 'Pausado'}
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
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
