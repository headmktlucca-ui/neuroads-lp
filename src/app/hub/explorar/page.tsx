'use client';

import React, { useState } from 'react';
import { Sparkles, TrendingUp, Zap, Target, BarChart2, Bot, Layers, ArrowRight, CheckCircle2, Clock, Star } from 'lucide-react';

type Update = {
  id: string;
  version: string;
  date: string;
  badge: 'Novo' | 'Melhoria' | 'IA' | 'Destaque';
  badgeColorClass: string;
  title: string;
  headline: string;
  results: string[];
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  tag: string;
};

const UPDATES: Update[] = [
  {
    id: '1',
    version: 'v2.4',
    date: 'Junho 2026',
    badge: 'Destaque',
    badgeColorClass: 'bg-orange-500/10 text-[#FF6A00] border-orange-500/20',
    title: 'Agentes IA com Otimização Automática de Lances',
    headline: 'Reduza seu CPA em até 28% sem mexer nas campanhas manualmente.',
    results: [
      'Agente monitora performance a cada 15 minutos e ajusta lances em tempo real',
      'Clientes beta reduziram CPA médio de R$ 42 para R$ 31 em 3 semanas',
      'Zero configuração: basta conectar sua conta Google Ads e ativar',
    ],
    icon: Bot,
    iconColor: 'text-[#FF6A00]',
    tag: 'Agentes IA',
  },
  {
    id: '2',
    version: 'v2.3',
    date: 'Maio 2026',
    badge: 'IA',
    badgeColorClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
    title: 'Assistente Lucca: Análise de Campanhas por Chat',
    headline: 'Obtenha insights sobre suas campanhas em linguagem natural, sem precisar saber de métricas.',
    results: [
      'Pergunte "por que meu ROAS caiu essa semana?" e receba análise detalhada',
      'Lucca cruza dados de GA4, Google Ads e Meta Ads automaticamente',
      'Economize em média 3h/semana em relatórios manuais',
    ],
    icon: Sparkles,
    iconColor: 'text-cyan-600',
    tag: 'Assistente IA',
  },
  {
    id: '3',
    version: 'v2.2',
    date: 'Abril 2026',
    badge: 'Melhoria',
    badgeColorClass: 'bg-emerald-500/10 text-[#0d9488] border-emerald-500/20',
    title: 'Dashboard com Dados em Tempo Real',
    headline: 'Veja o desempenho das suas campanhas acontecendo agora, não apenas ontem.',
    results: [
      'Sincronização ao vivo com Google Ads, Meta Ads e GA4 a cada 5 minutos',
      'Feed de atividades ao vivo: conversões, ajustes de lance e alertas instantâneos',
      'Identifique picos e quedas de performance antes que afetem o resultado do mês',
    ],
    icon: TrendingUp,
    iconColor: 'text-[#0d9488]',
    tag: 'Dashboard',
  },
  {
    id: '4',
    version: 'v2.1',
    date: 'Março 2026',
    badge: 'Novo',
    badgeColorClass: 'bg-slate-200/50 text-slate-600 border-slate-300',
    title: 'Funil de Marketing Integrado',
    headline: 'Entenda onde você perde clientes e quanto cada etapa vale para o seu negócio.',
    results: [
      'Visualização clara de Awareness → Conversão com dados reais de cada canal',
      'Descubra gargalos: clientes beta aumentaram taxa de conversão em 19% ao identificar a etapa de abandono',
      'Funil unificado mesmo usando múltiplas plataformas simultaneamente',
    ],
    icon: Target,
    iconColor: 'text-slate-600',
    tag: 'Analytics',
  },
  {
    id: '5',
    version: 'v2.0',
    date: 'Fevereiro 2026',
    badge: 'Destaque',
    badgeColorClass: 'bg-orange-500/10 text-[#FF6A00] border-orange-500/20',
    title: 'Integrações com Meta Ads e LinkedIn Ads',
    headline: 'Gerencie todos os seus canais de mídia paga em um único painel.',
    results: [
      'Conecte Meta Ads in less than 2 minutes via OAuth seguro',
      'Compare performance entre canais: veja qual traz melhor ROAS para seu segmento',
      'Economize assinaturas de ferramentas separadas de analytics',
    ],
    icon: Layers,
    iconColor: 'text-[#FF6A00]',
    tag: 'Integrações',
  },
  {
    id: '6',
    version: 'v1.9',
    date: 'Janeiro 2026',
    badge: 'IA',
    badgeColorClass: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
    title: 'Automações de Orçamento Inteligente',
    headline: 'Seu orçamento de mídia sempre alocado onde traz mais retorno — sem decisões manuais.',
    results: [
      'Regras automáticas: pause campanhas com CPA acima do alvo sem precisar monitorar',
      'Redistribuição de budget entre canais baseada em ROAS em tempo real',
      'Usuários que ativaram automações reportaram 22% mais eficiência no investimento mensal',
    ],
    icon: Zap,
    iconColor: 'text-cyan-600',
    tag: 'Automações',
  },
];

export default function HubExplorarPage() {
  const [activeFilter, setActiveFilter] = useState<string>('Todos');

  const filters = ['Todos', 'Dashboard', 'Agentes IA', 'Assistente IA', 'Integrações', 'Automações', 'Analytics'];

  const filtered = activeFilter === 'Todos' ? UPDATES : UPDATES.filter((u) => u.tag === activeFilter);

  return (
    <div className="w-full px-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-[#1e293b]">

      {/* Hero Header */}
      <header className="py-8 border-b border-slate-200 mb-8">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF6A00]" />
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#FF6A00]">Novidades NeuroAds</span>
            </div>
            <h1 className="text-3xl font-black text-[#0f172a] tracking-tight leading-tight">
              O que há de novo
            </h1>
            <p className="text-slate-500 text-[15px] mt-2 max-w-xl font-bold leading-relaxed">
              Cada atualização existe para gerar um resultado concreto no seu negócio. Aqui você acompanha o que evoluiu e o que você pode usar hoje.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-white/60 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff]">
            <Star className="w-4 h-4 text-[#FF6A00]" />
            <span className="text-[13px] font-bold text-[#1e293b]">{UPDATES.length} atualizações</span>
            <span className="text-[13px] text-slate-500 font-medium">neste ciclo</span>
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap mb-8">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 sm:py-1.5 rounded-full text-[13px] font-bold border transition-all duration-150 cursor-pointer ${
              activeFilter === f
                ? 'bg-[#eef2f7] text-[#FF6A00] shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] border border-white/20'
                : 'bg-[#eef2f7] border border-white/40 text-slate-600 shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Updates List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
        {filtered.map((update) => (
          <article
            key={update.id}
            className="group relative rounded-3xl border border-white/50 bg-[#eef2f7] shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#c2cbd9,_-4px_-4px_8px_#ffffff] transition-all duration-300 flex flex-col"
          >
            <div className="p-6 flex gap-5 flex-col sm:flex-row flex-1">
              {/* Icon */}
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-[#eef2f7] border border-white/40 shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] flex items-center justify-center">
                  <update.icon className={`w-6 h-6 ${update.iconColor}`} />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] ${update.badgeColorClass}`}>
                    {update.badge}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 border border-slate-300 px-2 py-0.5 rounded-full bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff]">
                    {update.version}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    {update.date}
                  </div>
                </div>

                <h2 className="text-[17px] font-black text-[#0f172a] leading-snug mb-1 group-hover:text-[#FF6A00] transition-colors duration-200">
                  {update.title}
                </h2>
                <p className="text-[14px] text-slate-500 font-semibold mb-4 leading-relaxed">
                  {update.headline}
                </p>

                {/* Results */}
                <ul className="space-y-2">
                  {update.results.map((result, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#FF6A00]/70 shrink-0 mt-0.5" />
                      <span className="text-[13px] text-slate-600 leading-relaxed font-semibold">{result}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tag + Arrow */}
              <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-3 sm:justify-between">
                <span className="text-[11px] font-bold text-slate-500 bg-[#eef2f7] border border-white/40 px-2.5 py-1 rounded-lg whitespace-nowrap shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff]">
                  {update.tag}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#FF6A00] transition-colors duration-200" />
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-slate-200 py-10 text-center">
        <div className="inline-flex flex-col items-center gap-3">
          <BarChart2 className="w-8 h-8 text-[#FF6A00]/50" />
          <p className="text-slate-500 text-[14px] font-bold max-w-md">
            Quer uma funcionalidade específica? Nossa equipe prioriza o roadmap com base nas necessidades reais dos nossos clientes.
          </p>
          <a
            href="mailto:avante@neuroads.com.br"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-gradient-to-r from-[#FF6A00] to-[#FF8805] px-6 text-[13px] font-bold text-white shadow-[0_4px_12px_rgba(255,106,0,0.25)] hover:brightness-105 hover:scale-[1.02] active:scale-95 transition-all"
            style={{ textDecoration: 'none' }}
          >
            <span>Sugerir uma melhoria</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
