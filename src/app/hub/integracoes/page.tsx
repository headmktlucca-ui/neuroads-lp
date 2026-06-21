'use client';

import React from 'react';
import { Link2, Plug, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

const INTEGRATIONS = [
  { id: 1, name: 'Meta Ads', status: 'connected', desc: 'Sincronização de campanhas, criativos e públicos.', icon: Plug, color: 'text-blue-500' },
  { id: 2, name: 'Google Ads', status: 'connected', desc: 'Otimização preditiva para Search e Performance Max.', icon: Plug, color: 'text-red-500' },
  { id: 3, name: 'TikTok Ads', status: 'available', desc: 'Automação de tendências e análise de criativos em vídeo.', icon: Plug, color: 'text-white' },
  { id: 4, name: 'Shopify', status: 'available', desc: 'Mapeamento de eventos de conversão de ponta a ponta.', icon: Plug, color: 'text-emerald-500' },
  { id: 5, name: 'Salesforce', status: 'available', desc: 'Qualificação profunda de leads B2B e routing.', icon: Plug, color: 'text-cyan-500' },
];

export default function HubIntegracoesPage() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col gap-1 mb-8">
        <h1 className="text-2xl font-black text-white tracking-tight">Integrações</h1>
        <p className="text-[#8fa0b5] text-[14px]">Conecte suas plataformas favoritas para alimentar os Agentes de IA.</p>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-[#0d1a2a]/40 border border-white/[0.06] backdrop-blur-md relative overflow-hidden group hover:bg-[#0d1a2a]/60 hover:border-white/[0.1] transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.03] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/[0.05] transition-colors" />
          <div className="flex items-start justify-between relative">
            <div>
              <p className="text-[13px] font-medium text-[#8fa0b5]">Plataformas Conectadas</p>
              <h3 className="text-2xl font-black text-white mt-1 tracking-tight">2</h3>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Link2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0d1a2a]/40 border border-white/[0.06] backdrop-blur-md relative overflow-hidden group hover:bg-[#0d1a2a]/60 hover:border-white/[0.1] transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/[0.03] rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/[0.05] transition-colors" />
          <div className="flex items-start justify-between relative">
            <div>
              <p className="text-[13px] font-medium text-[#8fa0b5]">Status das Sincronizações</p>
              <h3 className="text-2xl font-black text-white mt-1 tracking-tight">Saudável</h3>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d1a2a]/40 backdrop-blur-md overflow-hidden shadow-lg mt-6">
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
          <h2 className="text-[15px] font-bold text-white">Catálogo de Integrações</h2>
        </div>
        <div className="divide-y divide-white/[0.06]">
          {INTEGRATIONS.map((integ) => (
            <div key={integ.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border bg-white/[0.02] border-white/[0.05] shadow-sm`}>
                  <integ.icon className={`w-6 h-6 ${integ.color}`} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-white group-hover:text-[#FF6A00] transition-colors">{integ.name}</h3>
                  <p className="mt-1 text-[13px] text-[#8fa0b5]">{integ.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-auto">
                {integ.status === 'connected' ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[12px] font-bold uppercase tracking-wider">Conectado</span>
                  </div>
                ) : (
                  <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white/[0.05] text-white hover:bg-white/[0.1] border border-white/[0.1] transition-colors">
                    <span className="text-[13px] font-bold">Conectar</span>
                    <ArrowRight className="w-4 h-4 text-white/50" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
