'use client';

import React from 'react';
import Link from 'next/link';
import { PenTool, BarChart2, Image as ImageIcon, Zap, TrendingUp, DollarSign, Users, Target, ArrowRight } from 'lucide-react';

const ATIVIDADES = [
  { id: 'copy', title: 'Criação de Copy', description: 'Gere textos persuasivos para anúncios e landing pages.', icon: PenTool, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { id: 'data', title: 'Análise de Dados', description: 'Transforme métricas complexas em insights acionáveis.', icon: BarChart2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { id: 'images', title: 'Geração de Imagens', description: 'Crie criativos visuais de alta conversão com IA.', icon: ImageIcon, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  { id: 'automation', title: 'Automação de Tarefas', description: 'Crie fluxos inteligentes para reduzir trabalho manual.', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
];

const OBJETIVOS = [
  { id: 'conversion', title: 'Aumentar Conversão', description: 'Estratégias focadas em maximizar seu ROI e ROAS.', icon: TrendingUp, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  { id: 'cost', title: 'Reduzir Custos', description: 'Otimização de orçamento e eliminação de desperdícios.', icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10' },
  { id: 'leads', title: 'Qualificar Leads', description: 'Filtre e nutra contatos para vendas de alto ticket.', icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  { id: 'campaigns', title: 'Otimizar Campanhas', description: 'Ajuste fino contínuo baseado em inteligência preditiva.', icon: Target, color: 'text-orange-400', bg: 'bg-orange-500/10' },
];

export default function HubExplorarPage() {
  return (
    <div className="w-full max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-white tracking-tight">Explorar</h1>
        <p className="text-[#8fa0b5] max-w-2xl text-[15px]">
          Descubra ferramentas e agentes de IA projetados para impulsionar seus resultados. Navegue por atividades específicas ou busque soluções focadas nos seus objetivos de negócio.
        </p>
      </header>

      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
          <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
            <Zap className="w-5 h-5 text-white/80" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Por Atividade</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ATIVIDADES.map((item) => (
            <Link key={item.id} href={`/hub/agentes-ativos?filter=${item.id}`} className="group relative p-5 rounded-2xl bg-[#0d1a2a]/40 border border-white/[0.06] hover:bg-[#0d1a2a]/80 hover:border-white/[0.15] hover:shadow-[0_0_24px_rgba(255,106,0,0.05)] transition-all duration-300 overflow-hidden backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center border border-white/[0.04]`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors duration-300 -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100" />
              </div>
              <div className="mt-5 relative">
                <h3 className="text-[15px] font-bold text-white group-hover:text-[#FF6A00] transition-colors duration-300">{item.title}</h3>
                <p className="mt-2 text-[13px] text-[#8fa0b5] line-clamp-2 leading-relaxed">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
          <div className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.05]">
            <Target className="w-5 h-5 text-white/80" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Por Objetivo</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {OBJETIVOS.map((item) => (
            <Link key={item.id} href={`/hub/agentes-ativos?filter=${item.id}`} className="group relative p-5 rounded-2xl bg-[#0d1a2a]/40 border border-white/[0.06] hover:bg-[#0d1a2a]/80 hover:border-white/[0.15] hover:shadow-[0_0_24px_rgba(255,106,0,0.05)] transition-all duration-300 overflow-hidden backdrop-blur-md">
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center border border-white/[0.04]`}>
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors duration-300 -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100" />
              </div>
              <div className="mt-5 relative">
                <h3 className="text-[15px] font-bold text-white group-hover:text-[#FF6A00] transition-colors duration-300">{item.title}</h3>
                <p className="mt-2 text-[13px] text-[#8fa0b5] line-clamp-2 leading-relaxed">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
