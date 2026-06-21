'use client';

import React, { useState } from 'react';
import { Target, Users, Search, Play, Pause, Settings, BarChart2 } from 'lucide-react';

const TABS = ['Todos', 'Aquisição', 'Conversão', 'Inteligência de Dados'];

const AGENTS = [
  { id: 1, name: 'Qualificador de Leads B2B', category: 'Conversão', status: 'online', avatar: 'bg-emerald-500/20 text-emerald-400', icon: Users, desc: 'Filtra e pontua leads automaticamente baseado no ICP.' },
  { id: 2, name: 'Otimizador de Lances (Meta)', category: 'Aquisição', status: 'online', avatar: 'bg-blue-500/20 text-blue-400', icon: Target, desc: 'Ajusta lances em tempo real para maximizar ROAS.' },
  { id: 3, name: 'Análise Preditiva de Churn', category: 'Inteligência de Dados', status: 'offline', avatar: 'bg-purple-500/20 text-purple-400', icon: BarChart2, desc: 'Identifica padrões de cancelamento antes que ocorram.' },
  { id: 4, name: 'Gerador de Criativos Dinâmicos', category: 'Aquisição', status: 'online', avatar: 'bg-[#FF6A00]/20 text-[#FF6A00]', icon: Target, desc: 'Cria variações de anúncios A/B automaticamente.' },
];

export default function HubAgentesPage() {
  const [activeTab, setActiveTab] = useState('Todos');

  const filteredAgents = AGENTS.filter(a => activeTab === 'Todos' || a.category === activeTab);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white tracking-tight">Agentes IA</h1>
        <p className="text-[#8fa0b5] max-w-2xl text-[15px]">
          Catálogo de Agentes autônomos. Ative, monitore e gerencie os especialistas que impulsionam sua operação de marketing.
        </p>
      </header>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all ${
                activeTab === tab 
                  ? 'bg-white text-[#08101e] shadow-lg' 
                  : 'text-[#8fa0b5] hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8fa0b5]" />
          <input 
            type="text" 
            placeholder="Buscar agente..." 
            className="w-full bg-[#0d1a2a]/60 border border-white/[0.06] rounded-full pl-9 pr-4 py-2 text-[13px] text-white placeholder:text-[#8fa0b5] focus:outline-none focus:border-white/[0.15] focus:ring-1 focus:ring-white/[0.1] transition-all"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAgents.map(agent => (
          <div key={agent.id} className="group relative p-6 rounded-3xl bg-[#0d1a2a]/40 border border-white/[0.06] backdrop-blur-md overflow-hidden hover:bg-[#0d1a2a]/60 hover:border-white/[0.15] hover:shadow-[0_0_30px_rgba(255,106,0,0.05)] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative flex items-start justify-between">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-white/[0.05] ${agent.avatar}`}>
                <agent.icon className="w-6 h-6" />
              </div>
              
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${agent.status === 'online' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-[#8fa0b5]'}`} />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8fa0b5]">{agent.status}</span>
              </div>
            </div>

            <div className="mt-5 relative">
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase bg-white/[0.03] text-[#8fa0b5] border border-white/[0.05]">
                {agent.category}
              </span>
              <h3 className="text-[16px] font-bold text-white mt-3 group-hover:text-[#FF6A00] transition-colors">{agent.name}</h3>
              <p className="mt-2 text-[13px] text-[#8fa0b5] leading-relaxed line-clamp-2">{agent.desc}</p>
            </div>

            <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-between relative">
              <button className="flex items-center gap-1.5 text-[12px] font-semibold text-[#8fa0b5] hover:text-white transition-colors">
                <Settings className="w-4 h-4" /> Configurar
              </button>
              
              {agent.status === 'online' ? (
                <button className="flex items-center justify-center w-8 h-8 rounded-full bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors">
                  <Pause className="w-4 h-4" />
                </button>
              ) : (
                <button className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors">
                  <Play className="w-4 h-4 ml-0.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
