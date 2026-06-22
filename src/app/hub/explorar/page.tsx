'use client';

import React, { useState } from 'react';
import { Sparkles, TrendingUp, Zap, Target, BarChart2, Bot, Layers, ArrowRight, CheckCircle2, Clock, Star } from 'lucide-react';

type Update = {
  id: string;
  version: string;
  date: string;
  badge: 'Novo' | 'Melhoria' | 'IA' | 'Destaque';
  badgeColor: string;
  title: string;
  headline: string;
  results: string[];
  icon: React.ComponentType<any>;
  iconBg: string;
  iconColor: string;
  tag: string;
};

const UPDATES: Update[] = [
  {
    id: '1',
    version: 'v2.4',
    date: 'Junho 2026',
    badge: 'Destaque',
    badgeColor: 'bg-[#FF6A00]/15 text-[#FF6A00] border-[#FF6A00]/30',
    title: 'Agentes IA com Otimização Automática de Lances',
    headline: 'Reduza seu CPA em até 28% sem mexer nas campanhas manualmente.',
    results: [
      'Agente monitora performance a cada 15 minutos e ajusta lances em tempo real',
      'Clientes beta reduziram CPA médio de R$ 42 para R$ 31 em 3 semanas',
      'Zero configuração: basta conectar sua conta Google Ads e ativar',
    ],
    icon: Bot,
    iconBg: 'bg-[#FF6A00]/10',
    iconColor: 'text-[#FF6A00]',
    tag: 'Agentes IA',
  },
  {
    id: '2',
    version: 'v2.3',
    date: 'Maio 2026',
    badge: 'IA',
    badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    title: 'Assistente Lucca: Análise de Campanhas por Chat',
    headline: 'Obtenha insights sobre suas campanhas em linguagem natural, sem precisar saber de métricas.',
    results: [
      'Pergunte "por que meu ROAS caiu essa semana?" e receba análise detalhada',
      'Lucca cruza dados de GA4, Google Ads e Meta Ads automaticamente',
      'Economize em média 3h/semana em relatórios manuais',
    ],
    icon: Sparkles,
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
    tag: 'Assistente IA',
  },
  {
    id: '3',
    version: 'v2.2',
    date: 'Abril 2026',
    badge: 'Melhoria',
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    title: 'Dashboard com Dados em Tempo Real',
    headline: 'Veja o desempenho das suas campanhas acontecendo agora, não apenas ontem.',
    results: [
      'Sincronização ao vivo com Google Ads, Meta Ads e GA4 a cada 5 minutos',
      'Feed de atividades ao vivo: conversões, ajustes de lance e alertas instantâneos',
      'Identifique picos e quedas de performance antes que afetem o resultado do mês',
    ],
    icon: TrendingUp,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    tag: 'Dashboard',
  },
  {
    id: '4',
    version: 'v2.1',
    date: 'Março 2026',
    badge: 'Novo',
    badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    title: 'Funil de Marketing Integrado',
    headline: 'Entenda onde você perde clientes e quanto cada etapa vale para o seu negócio.',
    results: [
      'Visualização clara de Awareness → Conversão com dados reais de cada canal',
      'Descubra gargalos: clientes beta aumentaram taxa de conversão em 19% ao identificar a etapa de abandono',
      'Funil unificado mesmo usando múltiplas plataformas simultaneamente',
    ],
    icon: Target,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    tag: 'Analytics',
  },
  {
    id: '5',
    version: 'v2.0',
    date: 'Fevereiro 2026',
    badge: 'Destaque',
    badgeColor: 'bg-[#FF6A00]/15 text-[#FF6A00] border-[#FF6A00]/30',
    title: 'Integrações com Meta Ads e LinkedIn Ads',
    headline: 'Gerencie todos os seus canais de mídia paga em um único painel.',
    results: [
      'Conecte Meta Ads em menos de 2 minutos via OAuth seguro',
      'Compare performance entre canais: veja qual traz melhor ROAS para seu segmento',
      'Economize assinaturas de ferramentas separadas de analytics',
    ],
    icon: Layers,
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-400',
    tag: 'Integrações',
  },
  {
    id: '6',
    version: 'v1.9',
    date: 'Janeiro 2026',
    badge: 'IA',
    badgeColor: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    title: 'Automações de Orçamento Inteligente',
    headline: 'Seu orçamento de mídia sempre alocado onde traz mais retorno — sem decisões manuais.',
    results: [
      'Regras automáticas: pause campanhas com CPA acima do alvo sem precisar monitorar',
      'Redistribuição de budget entre canais baseada em ROAS em tempo real',
      'Usuários que ativaram automações reportaram 22% mais eficiência no investimento mensal',
    ],
    icon: Zap,
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    tag: 'Automações',
  },
];

const BADGE_ORDER = ['Destaque', 'IA', 'Novo', 'Melhoria'] as const;

export default function HubExplorarPage() {
  const [activeFilter, setActiveFilter] = useState<string>('Todos');

  const filters = ['Todos', 'Dashboard', 'Agentes IA', 'Assistente IA', 'Integrações', 'Automações', 'Analytics'];

  const filtered = activeFilter === 'Todos' ? UPDATES : UPDATES.filter((u) => u.tag === activeFilter);

  return (
    <div className="w-full px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Hero Header */}
      <header className="py-8 border-b border-white/[0.06] mb-8">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF6A00] shadow-[0_0_6px_rgba(255,106,0,0.8)] animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#FF6A00]">Novidades NeuroAds</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
              O que há de novo
            </h1>
            <p className="text-[#8fa0b5] text-[15px] mt-2 max-w-xl leading-relaxed">
              Cada atualização existe para gerar um resultado concreto no seu negócio. Aqui você acompanha o que evoluiu e o que você pode usar hoje.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0d1a2a]/60 border border-[#FF6A00]/20 backdrop-blur-md">
            <Star className="w-4 h-4 text-[#FF6A00]" />
            <span className="text-[13px] font-bold text-white">{UPDATES.length} atualizações</span>
            <span className="text-[13px] text-[#8fa0b5]">neste ciclo</span>
          </div>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap mb-8">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-bold border transition-all duration-150 cursor-pointer ${
              activeFilter === f
                ? 'bg-gradient-to-r from-[#F24900] to-[#FF8805] hover:from-[#d93f00] hover:to-[#e07500] text-white border-[#FF6A00] shadow-[0_0_16px_rgba(255,106,0,0.3)]'
                : 'bg-[#0d1a2a]/40 text-[#8fa0b5] border-white/[0.08] hover:text-white hover:border-white/[0.2]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Updates List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pb-10">
        {filtered.map((update) => (
          <article
            key={update.id}
            className="group relative rounded-3xl border border-[#FF6A00]/20 border-l-gradient-orange border-l-transparent bg-[#0d1a2a]/40 backdrop-blur-md hover:bg-[#0d1a2a]/70 hover:border-[#FF6A00]/40 hover:shadow-[0_0_32px_rgba(255,106,0,0.06)] transition-all duration-300 flex flex-col"
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF6A00]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="p-6 flex gap-5 flex-col sm:flex-row flex-1">
              {/* Icon */}
              <div className="shrink-0">
                <div className={`w-12 h-12 rounded-2xl ${update.iconBg} border border-[#FF6A00]/20 flex items-center justify-center shadow-[0_0_16px_rgba(255,106,0,0.08)]`}>
                  <update.icon className={`w-6 h-6 ${update.iconColor}`} />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${update.badgeColor}`}>
                    {update.badge}
                  </span>
                  <span className="text-[11px] font-bold text-white/30 border border-white/[0.08] px-2 py-0.5 rounded-full">
                    {update.version}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-[#8fa0b5]">
                    <Clock className="w-3 h-3" />
                    {update.date}
                  </div>
                </div>

                <h2 className="text-[17px] font-black text-white leading-snug mb-1 group-hover:text-[#FF6A00] transition-colors duration-200">
                  {update.title}
                </h2>
                <p className="text-[14px] text-[#8fa0b5] font-medium mb-4 leading-relaxed">
                  {update.headline}
                </p>

                {/* Results */}
                <ul className="space-y-2">
                  {update.results.map((result, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#FF6A00]/70 shrink-0 mt-0.5" />
                      <span className="text-[13px] text-white/70 leading-relaxed font-medium">{result}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tag + Arrow */}
              <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-3 sm:justify-between">
                <span className="text-[11px] font-bold text-[#8fa0b5] bg-white/[0.04] border border-white/[0.06] px-2.5 py-1 rounded-lg whitespace-nowrap">
                  {update.tag}
                </span>
                <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-[#FF6A00] transition-colors duration-200" />
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="border-t border-white/[0.06] py-10 text-center">
        <div className="inline-flex flex-col items-center gap-3">
          <BarChart2 className="w-8 h-8 text-[#FF6A00]/50" />
          <p className="text-[#8fa0b5] text-[14px] font-medium max-w-md">
            Quer uma funcionalidade específica? Nossa equipe prioriza o roadmap com base nas necessidades reais dos nossos clientes.
          </p>
          <a
            href="mailto:avante@neuroads.com.br"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#F24900] to-[#FF8805] hover:from-[#d93f00] hover:to-[#e07500] text-white font-bold text-[14px] rounded-xl transition-all shadow-[0_0_20px_rgba(255,106,0,0.3)]"
          >
            Sugerir uma melhoria <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
