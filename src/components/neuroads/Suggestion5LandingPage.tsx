'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants, useScroll, useTransform, type MotionValue } from 'framer-motion';
import {
  ArrowRight,
  Funnel,
  Target,
  TrendingUp,
  AlertCircle,
  Cpu,
  Zap,
  ChevronRight,
  MessageCircle,
  BookOpen,
  LayoutDashboard,
  Database,
  Filter
} from 'lucide-react';
import { agents as catalogAgents } from '../../data/agents';
import { TEAM_AGENTS } from '../../data/team-agents';
import LuccaSpecialistChatModal from './LuccaSpecialistChatModal';
import Lenis from 'lenis';
import RadialOrbitalTimeline from '../ui/radial-orbital-timeline';

const revealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    }
  }
};

const testimonials = [
  {
    quote: 'Essencial para impulsionar sua empresa, recomendo!!',
    name: 'Flávio Almeida',
    role: 'CEO, FJR TELEPROMPTER',
    avatar: '/images/flavio-almeida.png',
  },
  {
    quote: 'Excelente profissional de tráfego pago! Sempre muito estratégico, atencioso e focado em performance.',
    name: 'Bruno Ribeiro',
    role: 'CEO, VOAR ESTÚDIO CRIATIVO',
    avatar: '/images/Bruno Ribeiro.png',
  },
  {
    quote: 'Excelente agência, muito profissional e comprometida sempre buscando melhorar as atividades. Recomendo bastante!',
    name: 'Emanuel Silva',
    role: 'CONSULTOR FINANCEIRO',
    avatar: '/images/Emanuel Silva.png',
  },
];

const faq = [
  {
    q: 'Como funciona a IA Agêntica da NeuroAds?',
    a: 'A IA Agêntica da NeuroAds conecta diagnóstico, decisão e execução em um único ecossistema. Nossos agentes analisam dados reais de mídia, funil e comportamento para recomendar e executar ajustes com supervisão estratégica do time sênior, reduzindo achismo e aumentando previsibilidade de resultado.',
    tags: ['PLATAFORMA', 'IA AGÊNTICA'],
  },
  {
    q: 'Vocês atendem qual tipo de empresa?',
    a: 'Atendemos principalmente PMEs em fase de crescimento que já investem em marketing e precisam de mais controle sobre retorno financeiro. Em geral, são empresas com faturamento mensal entre R$ 30 mil e R$ 200 mil que querem escalar com dados reais, não com promessas vagas.',
    tags: ['EMPRESA', 'ELEGIBILIDADE'],
  },
  {
    q: 'Em quanto tempo começam os resultados?',
    a: 'Os primeiros ganhos operacionais normalmente aparecem nas primeiras semanas, com ajustes de estrutura, segmentação e orçamento. Resultados comerciais mais robustos dependem de variáveis como oferta, histórico da conta e maturidade do funil, mas o foco desde o início é reduzir desperdício e aumentar eficiência de receita.',
    tags: ['RESULTADOS', 'PRAZO'],
  },
  {
    q: 'Quais canais vocês gerenciam?',
    a: 'Gerenciamos Google Ads e Meta Ads de forma integrada, além de estratégias de SEO + GEO para buscadores e motores generativos. O objetivo é alinhar tráfego pago, orgânico e inteligência de conteúdo para gerar crescimento previsível em todo o ciclo de aquisição.',
    tags: ['CANAIS', 'MÍDIA PAGA'],
  },
  {
    q: 'Como é a implementação?',
    a: 'A implementação começa com diagnóstico estratégico para mapear gargalos e priorizar os agentes certos para sua operação. Em seguida, configuramos o ambiente, conectamos dados, ativamos os fluxos de execução e acompanhamos a evolução com indicadores traduzidos para impacto no caixa.',
    tags: ['IMPLEMENTAÇÃO', 'PROCESSO'],
  },
];

const ALL_LOGS = [
  { id: 1, icon: Target, title: 'Analista de Tráfego', subtitle: 'Realocou R$ 500 para campanha de Remarketing', value: '+12% ROAS', color: 'text-[#ff8f3a]' },
  { id: 2, icon: Funnel, title: 'Rastreador Cirúrgico', subtitle: 'Detectou falha de atribuição no iOS 17', value: 'Resolvido', color: 'text-emerald-400' },
  { id: 3, icon: TrendingUp, title: 'Preditor de Funil', subtitle: 'Projeta aumento de 15% na taxa de conversão', value: 'Meta Ativa', color: 'text-[#ff8f3a]' },
  { id: 4, icon: Cpu, title: 'Gerador de Criativos', subtitle: 'Testando 3 novas variações de copy', value: 'A/B Test', color: 'text-[#ff8f3a]' },
  { id: 5, icon: AlertCircle, title: 'Auditor de Desperdício', subtitle: 'Pausou conjunto de anúncios ineficiente', value: '- R$ 120/dia', color: 'text-emerald-400' },
  { id: 6, icon: Target, title: 'Analista de Tráfego', subtitle: 'Aumentou lance para público Lookalike 1%', value: '+ Escala', color: 'text-[#ff8f3a]' },
  { id: 7, icon: TrendingUp, title: 'Simulador de ROAS', subtitle: 'Cenário otimista validado para Black Friday', value: 'Sinal Verde', color: 'text-emerald-400' },
  { id: 8, icon: Zap, title: 'Gerador de Criativos', subtitle: 'Nova variação de vídeo atinge 8% de CTR', value: 'Vencedor', color: 'text-emerald-400' }
];

const useCasesSectors = [
  {
    id: 'centralizar-dados',
    title: 'Centralizar dados',
    description: 'Unifique dados de múltiplas ferramentas em um único lugar. Mídia paga, leads, prospects, negócios, clientes... Todos seus dados organizados e centralizados, prontos para análises que seriam muito complexas sem a Laiki.',
    cards: [
      { title: 'Conectores Nativos', description: 'Integração nativa com as principais plataformas de tráfego, CRM e vendas do mercado.' },
      { title: 'Single Source of Truth', description: 'Evite discrepâncias entre plataformas tendo uma única base de dados consolidada.' },
    ],
  },
  {
    id: 'segmentar-base',
    title: 'Segmente sua base',
    description: 'Crie listas com base em qualquer dado do seu ecossistema: perfil do lead, campos personalizados, comportamento, engajamento... Filtre, combine critérios e crie segmentações mais inteligentes para que o time possa trabalhar de forma mais eficiente.',
    cards: [
      { title: 'Filtros Avançados', description: 'Combine critérios de comportamento de compra, UTMs de origem e status de CRM.' },
      { title: 'Atualização em Tempo Real', description: 'Listas dinâmicas que se atualizam automaticamente à medida que novos dados entram.' },
    ],
  },
  {
    id: 'dashboards-dinamicos',
    title: 'Dashboards dinâmicos',
    description: 'Crie dashboards com gráficos dinâmicos a partir de dados centralizados de marketing e vendas. Cruze mídia com dados de vendas, acompanhe funis, conversões e indicadores de crescimento praticamente em tempo real, tudo reunido em uma única tela.',
    cards: [
      { title: 'Métricas Unificadas', description: 'Cruze dados de investimento de mídia diretamente com receita de vendas do CRM.' },
      { title: 'Tempo Real', description: 'Acompanhe o desempenho da sua operação comercial com dados sempre atualizados.' },
    ],
  },
  {
    id: 'metricas-calculadas',
    title: 'Métricas calculadas',
    description: 'Crie relatórios com métricas de negócio personalizadas a partir de dados de marketing, vendas e mídia. Faça operações de cálculo e acompanhe indicadores que fazem sentido dentro da sua operação.',
    cards: [
      { title: 'Indicadores Customizados', description: 'Calcule ROI real, LTV, taxa de conversão entre etapas e margem de contribuição.' },
      { title: 'Sem Planilhas Manuais', description: 'Automatize cálculos complexos e elimine o trabalho manual de consolidação semanal.' },
    ],
  },
  {
    id: 'processamento-dados',
    title: 'Processamento de dados',
    description: 'Construa workflows para enriquecer, e normalizar qualquer dado recebido antes de enviá-lo ao destino final. Conecte qualquer plataforma com API pública, processe dados em tempo real e automatize tarefas sem depender de time técnico.',
    cards: [
      { title: 'Tratamento Automático', description: 'Limpe nomes, padronize formatos de telefone e unifique parâmetros de UTM.' },
      { title: 'Roteamento de Leads', description: 'Envie os dados certos para o vendedor certo ou ferramenta de CRM no exato segundo da conversão.' },
    ],
  },
  {
    id: 'analise-ia',
    title: 'Análise com IA',
    description: 'Use inteligência artificial para analisar seus dados e gerar insights baseados no seu próprio funil. Faça perguntas sobre performance, campanhas e leads e receba respostas e sugestões em segundos.',
    cards: [
      { title: 'Insights Preditivos', description: 'Identifique gargalos de conversão ou desvios de CAC antes que eles afetem seu caixa.' },
      { title: 'Chat Interativo', description: 'Consulte sua base de dados fazendo perguntas em português, como se estivesse conversando com um analista.' },
    ],
  },
];

function CentralizarMockup() {
  const platforms = [
    { name: 'Google Ads', color: '#4285F4' },
    { name: 'Meta Ads', color: '#1877F2' },
    { name: 'LinkedIn Ads', color: '#0077B5' },
    { name: 'RD Station', color: '#F95F62' },
    { name: 'Pipedrive', color: '#262626' },
    { name: 'Kommo CRM', color: '#3A9BEA' },
    { name: 'CVCRM', color: '#10B981' },
    { name: 'Exact Sales', color: '#F59E0B' },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-center items-center relative overflow-hidden p-4 min-h-[300px]">
      <div className="relative z-20 flex flex-col items-center justify-center p-6 rounded-full bg-zinc-900/90 border border-[#ff6a00]/30 shadow-[0_0_30px_rgba(255,106,0,0.15)] w-28 h-28 animate-pulse">
        <Database size={32} className="text-[#ff6a00]" />
        <span className="text-xs font-black text-white mt-1.5">Laiki</span>
        <span className="text-[8px] text-[#ff8f3a] font-bold uppercase tracking-wider">DATABASE</span>
      </div>

      <div className="absolute inset-0 z-10 w-full h-full">
        {platforms.map((plat, idx) => {
          const angle = (idx * 360) / platforms.length;
          const radius = 110;
          const radians = (angle * Math.PI) / 180;
          const x = Math.round(radius * Math.cos(radians));
          const y = Math.round(radius * Math.sin(radians));

          return (
            <div
              key={idx}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center"
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
            >
              <div
                className="px-2.5 py-1.5 rounded-lg border text-[9px] font-bold text-white bg-zinc-950/80 backdrop-blur-sm shadow-md transition-all duration-300 hover:scale-105"
                style={{
                  borderColor: `${plat.color}40`,
                  boxShadow: `0 4px 12px ${plat.color}15`,
                }}
              >
                {plat.name}
              </div>
              <svg className="absolute overflow-visible pointer-events-none z-0" style={{ left: '50%', top: '50%' }}>
                <line
                  x1={0}
                  y1={0}
                  x2={-x}
                  y2={-y}
                  stroke="#ffffff"
                  strokeOpacity="0.08"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SegmentarMockup() {
  return (
    <div className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 p-4 shadow-xl text-zinc-800">
      <div className="flex items-center gap-1.5 pb-3 border-b border-zinc-200/80 mb-3">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 text-[10px] text-zinc-400 font-mono">segmentador_laiki.ui</span>
      </div>

      <div className="space-y-3 font-sans text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Recursos</span>
          <span className="text-[10px] bg-zinc-200/70 text-zinc-600 px-2 py-0.5 rounded-full font-semibold">Segmente sua base</span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-zinc-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600">
            <Filter size={10} />
            <span>REGRA DE ENTRADA</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 p-2 rounded-lg bg-zinc-50 border border-zinc-200 text-[10px] font-semibold text-zinc-700">
              Evento
            </div>
            <div className="flex-1 p-2 rounded-lg bg-zinc-50 border border-zinc-200 text-[10px] font-semibold text-zinc-700">
              Nome do Evento...
            </div>
            <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200 text-[10px] text-zinc-500 font-semibold">
              Igual a
            </div>
            <div className="flex-1 p-2 rounded-lg bg-blue-50/50 border border-blue-200 text-[10px] font-bold text-blue-700">
              Lead Qualificado
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pl-4">
          <span className="text-[9px] font-black bg-amber-500/10 text-amber-600 border border-amber-500/20 px-2.5 py-0.5 rounded-md uppercase tracking-wider">OU</span>
          <div className="flex-1 h-[1px] bg-zinc-200" />
        </div>

        <div className="p-3 bg-white rounded-xl border border-zinc-200 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600">
            <Filter size={10} />
            <span>CONDIÇÃO SECUNDÁRIA</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 p-2 rounded-lg bg-zinc-50 border border-zinc-200 text-[10px] font-semibold text-zinc-700">
              Evento
            </div>
            <div className="flex-1 p-2 rounded-lg bg-zinc-50 border border-zinc-200 text-[10px] font-semibold text-zinc-700">
              UTM Medium...
            </div>
            <div className="p-2 rounded-lg bg-zinc-50 border border-zinc-200 text-[10px] text-zinc-500 font-semibold">
              Igual a
            </div>
            <div className="flex-1 p-2 rounded-lg bg-amber-50/50 border border-amber-200 text-[10px] font-bold text-amber-700">
              cpc
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardsMockup() {
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-zinc-950 p-4 shadow-2xl text-slate-200 text-xs font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">Laki &gt; Dashboard</span>
        </div>
        <div className="text-[9px] bg-zinc-900 border border-white/10 px-2 py-0.5 rounded text-slate-400">
          Mês passado
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="p-3 rounded-xl border border-white/5 bg-zinc-900/50">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tempo médio na página</p>
          <p className="text-lg font-black text-white mt-1">1m 13s</p>
          <p className="text-[9px] text-emerald-400 font-semibold mt-0.5">▲ +15.8% vs. 1-30 Abr</p>
        </div>
        <div className="p-3 rounded-xl border border-white/5 bg-zinc-900/50">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Investimento no Mês</p>
          <p className="text-lg font-black text-white mt-1">R$ 5.000,00</p>
          <p className="text-[9px] text-emerald-400 font-semibold mt-0.5">▼ -12% vs. planejado</p>
        </div>
        <div className="p-3 rounded-xl border border-white/5 bg-zinc-900/50">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">CAC Mídia</p>
          <p className="text-lg font-black text-white mt-1">R$ 135,57</p>
          <p className="text-[9px] text-[#ff8f3a] font-semibold mt-0.5">▲ +6.1% dentro do limite</p>
        </div>
        <div className="p-3 rounded-xl border border-white/5 bg-zinc-900/50">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Conversões - Laki</p>
          <p className="text-lg font-black text-white mt-1">37</p>
          <p className="text-[9px] text-emerald-400 font-semibold mt-0.5">▲ +40.2% vs. Abr</p>
        </div>
      </div>

      <div className="p-3 rounded-xl border border-white/5 bg-zinc-900/30 space-y-2">
        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Funil de Aquisição</p>
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-slate-400 w-16 truncate">Cliques</span>
            <div className="flex-1 h-3 rounded bg-zinc-800 overflow-hidden">
              <div className="h-full bg-blue-500 rounded" style={{ width: '100%' }} />
            </div>
            <span className="text-[9px] font-black text-white w-8 text-right">440</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-slate-400 w-16 truncate">Conversões</span>
            <div className="flex-1 h-3 rounded bg-zinc-800 overflow-hidden">
              <div className="h-full bg-[#ff6a00] rounded" style={{ width: '60%' }} />
            </div>
            <span className="text-[9px] font-black text-white w-8 text-right">37</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-slate-400 w-16 truncate">Reuniões</span>
            <div className="flex-1 h-3 rounded bg-zinc-800 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded" style={{ width: '35%' }} />
            </div>
            <span className="text-[9px] font-black text-white w-8 text-right">20</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricasMockup() {
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-zinc-950 p-5 shadow-2xl space-y-4 text-xs font-sans">
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Métricas Calculadas</span>
        <span className="text-[9px] font-semibold text-[#ff6a00]">Fórmulas Ativas</span>
      </div>

      <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/60 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Valor total das OP (MRR)</p>
          <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">Ver leads</span>
        </div>
        <p className="text-2xl font-black text-white tracking-tight">R$ 6.750,00</p>
        
        <div className="h-10 mt-3 relative overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
            <path
              d="M0 15 Q20 5 40 12 T80 4 T100 8"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
            />
            <path
              d="M0 15 Q20 5 40 12 T80 4 T100 8 L100 20 L0 20 Z"
              fill="url(#gradient-green)"
              opacity="0.1"
            />
            <defs>
              <linearGradient id="gradient-green" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-white/5 bg-zinc-900/30">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Reuniões Agendadas</p>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-xl font-black text-white">24</p>
          <span className="text-[10px] text-emerald-400 font-bold">▲ +12% esta semana</span>
        </div>
      </div>
    </div>
  );
}

function ProcessamentoMockup() {
  const dots: { x: number; y: number; size: number; color: string; delay: number }[] = [];
  
  const addEdgeDots = (x1: number, y1: number, x2: number, y2: number, count: number) => {
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const baseX = x1 + (x2 - x1) * t;
      const baseY = y1 + (y2 - y1) * t;
      
      const jitterX = (Math.random() - 0.5) * 8;
      const jitterY = (Math.random() - 0.5) * 8;
      const size = Math.random() * 2 + 1.5;
      
      const colors = ['#8B5CF6', '#3B82F6', '#EC4899', '#A78BFA', '#93C5FD'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      dots.push({
        x: baseX + jitterX,
        y: baseY + jitterY,
        size,
        color,
        delay: Math.random() * 2,
      });
    }
  };

  addEdgeDots(100, 40, 40, 160, 20);
  addEdgeDots(40, 160, 160, 160, 20);
  addEdgeDots(160, 160, 100, 40, 20);

  return (
    <div className="w-full rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff6a00]/5 filter blur-2xl rounded-full" />
      <span className="absolute top-4 left-4 text-[9px] uppercase font-bold text-slate-500 tracking-wider">Workflow Pipeline</span>
      
      <svg className="w-40 h-40 overflow-visible" viewBox="0 0 200 200">
        {dots.map((dot, idx) => (
          <circle
            key={idx}
            cx={dot.x}
            cy={dot.y}
            r={dot.size}
            fill={dot.color}
            opacity="0.8"
            style={{
              animation: `pulse ${1.5 + Math.random()}s infinite alternate`,
              animationDelay: `${dot.delay}s`,
            }}
          />
        ))}
      </svg>
      
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.4; }
          100% { transform: scale(1.1); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}

function AnaliseIaMockup() {
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-zinc-950 p-4 shadow-2xl text-slate-200 text-[11px] font-sans">
      <div className="flex items-center justify-between pb-2.5 border-b border-white/5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#ff6a00]/20 flex items-center justify-center border border-[#ff6a00]/30 animate-pulse">
            <Cpu size={10} className="text-[#ff6a00]" />
          </div>
          <span className="font-bold text-[10px] uppercase tracking-wider text-slate-300">Laiki Copilot</span>
        </div>
        <span className="text-[8px] bg-[#ff6a00]/10 text-[#ff8f3a] border border-[#ff6a00]/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Inteligência</span>
      </div>

      <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
        <div className="p-3 rounded-xl border border-white/5 bg-zinc-900/40 space-y-2">
          <p className="font-bold text-white text-[10px] border-b border-white/5 pb-1">Target de junho:</p>
          <ul className="space-y-1 text-slate-300">
            <li className="flex items-center gap-1.5">
              <span className="text-emerald-400">✓</span>
              <span>Conversões: <strong className="text-white">50+</strong> (vs. 26 atuais)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-emerald-400">✓</span>
              <span>CPL: <strong className="text-white">R$ 80 máximo</strong> (vs. R$ 166 atual)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-emerald-400">✓</span>
              <span>Vendas fechadas: <strong className="text-white">3+</strong> (vs. 0 atual)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-emerald-400">✓</span>
              <span>Taxa lead→reunião: <strong className="text-white">90%+</strong> (está em 96%)</span>
            </li>
          </ul>
          
          <p className="text-[10px] text-slate-400 pt-1 leading-relaxed border-t border-white/5 mt-2">
            Se atingir esses targets: Junho encerra rentável; julho pode escalar.
          </p>
          <p className="text-[10px] text-[#ff8f3a] font-semibold mt-1">
            📅 Próximo checkpoint: 03/06 (diagnóstico pós-auditoria)
          </p>
        </div>

        <div className="flex items-center justify-between text-[9px] text-slate-500 px-1">
          <span>Este insight foi útil?</span>
          <div className="flex gap-2">
            <button className="hover:text-white transition-colors cursor-pointer">👍</button>
            <button className="hover:text-white transition-colors cursor-pointer">👎</button>
          </div>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 shrink-0 scrollbar-none">
          <div className="px-2 py-1 rounded bg-zinc-900 border border-white/5 text-[9px] text-slate-400 truncate shrink-0 cursor-pointer hover:border-white/20">
            Qual a sugestão para melhorar a performance nas próximas 48h?
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          placeholder="Pergunte sobre este insight..."
          readOnly
          className="flex-1 px-3 py-2 rounded-xl bg-zinc-950 border border-white/5 text-[10px] text-slate-400 placeholder:text-slate-600 focus:outline-none"
        />
        <div className="w-8 h-8 rounded-xl bg-[#ff6a00]/10 border border-[#ff6a00]/30 flex items-center justify-center cursor-pointer hover:bg-[#ff6a00]/20">
          <ArrowRight size={12} className="text-[#ff6a00]" />
        </div>
      </div>
    </div>
  );
}

interface SectorCardProps {
  i: number;
  sector: typeof useCasesSectors[number];
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}

function SectorCard({ i, sector, progress, range, targetScale }: SectorCardProps) {
  const container = useRef<HTMLDivElement>(null);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      ref={container}
      className="h-screen flex items-center justify-center sticky top-0 overflow-hidden"
    >
      <motion.div
        style={{
          scale,
          top: `calc(4vh + ${i * 24}px)`,
        }}
        className="relative flex flex-col lg:flex-row h-[520px] w-[90%] max-w-[1200px] rounded-[32px] border border-white/10 bg-zinc-950/95 backdrop-blur-md shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] p-8 lg:p-12 origin-top overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff6a00]/5 rounded-full filter blur-[100px] pointer-events-none" />

        {/* LEFT COLUMN — Text and differentials */}
        <div className="flex-1 flex flex-col justify-between z-10 lg:pr-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-1.5 h-8 bg-[#ff6a00] rounded-full shadow-[0_0_12px_rgba(255,106,0,0.6)]" />
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{sector.title}</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              {sector.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
            {sector.cards.map((card, cIdx) => (
              <div
                key={cIdx}
                className="rounded-2xl border border-white/5 bg-zinc-900/30 p-5 hover:bg-zinc-900/60 hover:border-[#ff6a00]/25 transition-all duration-300 group/card"
              >
                <span className="text-[9px] font-black uppercase tracking-widest text-[#ff8f3a]">
                  Diferencial
                </span>
                <h4 className="text-[14px] font-bold text-white mt-1.5">{card.title}</h4>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN — Visual mockup */}
        <div className="hidden lg:flex w-[45%] flex-col justify-center items-center relative pl-8 border-l border-white/5 z-10 min-h-[300px]">
          {sector.id === 'centralizar-dados' && <CentralizarMockup />}
          {sector.id === 'segmentar-base' && <SegmentarMockup />}
          {sector.id === 'dashboards-dinamicos' && <DashboardsMockup />}
          {sector.id === 'metricas-calculadas' && <MetricasMockup />}
          {sector.id === 'processamento-dados' && <ProcessamentoMockup />}
          {sector.id === 'analise-ia' && <AnaliseIaMockup />}
        </div>
      </motion.div>
    </div>
  );
}

function UseCasesSection() {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  return (
    <section ref={container} className="relative min-h-[600vh] bg-transparent w-full pb-20">
      {/* Scrollable header (moves out of view) */}
      <div className="w-full text-center max-w-[720px] mx-auto mb-10 pt-24 px-5">
        <span className="text-[13px] font-bold text-[#ff6a00]">Arquitetura de Dados</span>
        <h2 className="text-3xl sm:text-4xl font-black mt-2 text-white">Recursos Integrados</h2>
        <p className="text-slate-400 mt-4 text-sm leading-relaxed">
          Descubra como a plataforma Laiki centraliza, segmenta e automatiza a inteligência dos seus dados em tempo real.
        </p>
      </div>

      <div className="w-full relative z-10">
        {useCasesSectors.map((sector, idx) => {
          const targetScale = 1 - (useCasesSectors.length - idx) * 0.025;
          return (
            <SectorCard
              key={sector.id}
              i={idx}
              sector={sector}
              progress={scrollYProgress}
              range={[idx * (1 / useCasesSectors.length), 1]}
              targetScale={targetScale}
            />
          );
        })}
      </div>
    </section>
  );
}

export default function Suggestion5LandingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isLuccaChatOpen, setIsLuccaChatOpen] = useState(false);
  const [luccaAutoMessage, setLuccaAutoMessage] = useState<string | null>(null);

  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 1000], [0, 200]);

  // Mobile responsive hook removed as 3D transforms are disabled
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    let frameId: number;
    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);
  const handleOpenSpecialistChat = () => {
    setLuccaAutoMessage(null);
    setIsLuccaChatOpen(true);
  };

  return (
    <main className="relative min-h-screen bg-[#000000] text-white overflow-x-clip selection:bg-[#ff6a00] selection:text-white">
      {/* Background radial overlays — CSS radial-gradient avoids filter layers entirely */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 600px 600px at 25% 0%, rgba(255,106,0,0.06) 0%, transparent 70%)',
            'radial-gradient(ellipse 700px 700px at 75% 35%, rgba(30,30,30,0.10) 0%, transparent 70%)',
            'radial-gradient(ellipse 500px 500px at 33% 100%, rgba(255,106,0,0.03) 0%, transparent 70%)',
          ].join(', '),
        }}
      />
      
      {/* Header Grid Line patterns */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* HERO SECTION — LEFT-ALIGNED + ORBITAL AGENTS */}
      <section className="relative w-full min-h-[92vh] flex items-center z-10 pt-[90px] pb-20 overflow-hidden bg-transparent">
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute w-full bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/backgrounds/bh_home.png')",
              y: backgroundY,
              height: '140%',
              top: '-20%',
              left: 0,
              right: 0,
            }}
          />
        </div>

        {/* Smooth top gradient */}
        <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-[#000000] via-[#000000]/70 to-transparent z-[1] pointer-events-none" />

        {/* Left side fade for readability */}
        <div className="absolute inset-0 z-[1] pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 80% at 30% 50%, rgba(4,8,17,0.65) 0%, rgba(4,8,17,0.10) 100%)'
        }} />

        {/* Cinematic bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#000000] to-transparent z-[1] pointer-events-none" />

        {/* TWO-COLUMN CONTENT */}
        <div className="relative z-10 w-full px-4 sm:px-8 lg:px-16 max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* LEFT COLUMN — text, left-aligned */}
            <div className="flex flex-col items-start">

              {/* Feature badges */}
              <motion.div
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.05 }}
                className="mb-8 flex flex-col sm:flex-row items-start gap-3"
              >
                {[
                  { icon: <AlertCircle size={14} />, label: 'Dados soltos custam caro' },
                  { icon: <TrendingUp size={14} />, label: 'ROAS em tempo real' },
                  { icon: <Cpu size={14} />, label: 'Agentes que executam' },
                ].map((badge, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/[0.10] bg-black/30 backdrop-blur-sm"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#ff6a00]/20 text-[#ff8f3a] border border-[#ff6a00]/30">
                      {badge.icon}
                    </span>
                    <p className="text-[12px] font-bold text-white whitespace-nowrap">{badge.label}</p>
                  </div>
                ))}
              </motion.div>

              {/* Main headline */}
              <motion.h1
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.08 }}
                className="text-[36px] sm:text-[42px] font-black leading-[1.08] tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.7)] text-left"
              >
                Inteligência Estratégica em
                <br />
                <span className="text-[#ff6a00]">Marketing & Vendas B2B.</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.16 }}
                className="mt-5 text-[17px] text-white/65 leading-relaxed max-w-[560px] drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)] font-medium text-left"
              >
                Aumente sua receita com Agentes IA que identificam, nutrem e qualificam o cliente ideal até o fechamento.
              </motion.p>

              {/* CTAs */}
              <motion.div
                variants={revealVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: 0.24 }}
                className="mt-8 flex flex-col sm:flex-row items-start gap-3"
              >
                <button
                  type="button"
                  onClick={handleOpenSpecialistChat}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F24900] to-[#FF8805] hover:from-[#d93f00] hover:to-[#e07500] transition-all px-7 py-3.5 text-[14px] font-extrabold text-white shadow-[0_4px_28px_rgba(180,70,0,0.5)] cursor-pointer"
                >
                  Fale com um especialista
                  <ArrowRight size={16} />
                </button>
                <Link
                  href="/hub"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 hover:border-white/40 bg-white/[0.04] hover:bg-white/[0.08] transition-all px-7 py-3.5 text-[14px] font-bold text-white/80 hover:text-white"
                >
                  Explorar o Hub
                  <ArrowRight size={14} />
                </Link>
              </motion.div>
            </div>

            {/* RIGHT COLUMN — Orbital agents animation */}
            <motion.div
              variants={revealVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.3 }}
              className="hidden lg:flex items-center justify-center"
            >
              <RadialOrbitalTimeline
                items={TEAM_AGENTS.map((agent, idx) => ({
                  id: idx + 1,
                  title: agent.nome,
                  image: agent.avatarSrc,
                  category: agent.funcao,
                }))}
                centerLabel={<img src="/images/icon_neuroads_transparente.png" alt="NeuroAds" width={80} height={80} style={{objectFit:'contain'}} />}
              />
            </motion.div>

          </div>
        </div>
      </section>

      {/* CASOS DE USO POR SETOR */}
      <UseCasesSection />

      {/* AGENTES EM DESTAQUE */}
      <section className="relative z-10 py-24 px-5 md:px-8 bg-transparent w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-[0.10]" style={{ backgroundColor: '#ff6a00' }} />
          <div className="absolute bottom-0 -left-16 w-72 h-72 rounded-full blur-3xl opacity-[0.07]" style={{ backgroundColor: '#3b82f6' }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="dots-agentes" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="white" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#dots-agentes)" />
          </svg>
        </div>
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto max-w-[1260px]"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
            <div>
              <span className="text-[13px] font-bold text-[#ff6a00]">Catálogo</span>
              <h2 className="text-3xl sm:text-4xl font-black mt-2">
                Agentes de IA que Executam por Você
              </h2>
              <p className="text-slate-400 mt-3 text-sm max-w-[540px]">
                Acesse e ative agentes especializados para cada etapa do funil — da atração à escala de resultados.
              </p>
            </div>
            <Link
              href="/agentes-ia"
              className="inline-flex items-center gap-2 rounded-xl border border-[#ff6a00]/40 px-6 py-3 text-sm font-extrabold text-[#ff8f3a] hover:bg-[#ff6a00]/10 transition-colors shrink-0"
            >
              Explorar todos os Agentes
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {catalogAgents.slice(0, 8).map((agent) => (
              <div
                key={agent.title}
                className="group relative rounded-xl border border-white/5 bg-zinc-950/90 p-5 flex flex-col justify-between hover:border-[#ff6a00]/30 transition-all hover:shadow-[0_4px_24px_rgba(255,106,0,0.08)] min-h-[220px]"
              >
                <div>
                  <div className="mb-4">
                    <span className="inline-block rounded-md bg-white/5 px-2.5 py-1 text-[11px] font-bold text-[#ff8f3a]">
                      {agent.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#ff8f3a] transition-colors leading-snug">
                    {agent.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed line-clamp-3">
                    {agent.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 font-mono uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    ONLINE
                  </span>
                  <Link
                    href="/agentes-ia"
                    className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#ff8f3a] hover:gap-2 transition-all"
                  >
                    Usar Agente
                    <ArrowRight size={10} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

        {/* NARRATIVE SECTION: COMO FUNCIONA? */}
        <section className="relative z-10 py-24 px-5 md:px-8 bg-transparent w-full overflow-hidden">
          
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-120px" }}
            className="relative z-10 mx-auto max-w-[1260px]"
          >
            <div className="grid gap-12 lg:grid-cols-2 items-center">

              {/* Left column: text content */}
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#ff6a00]">COMO FUNCIONA?</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold mt-2">
                  Se você não confia 100% nos seus dados, cada decisão é uma aposta.
                </h2>
                <div className="mt-6 space-y-3">
                  {[
                    'Você sabe, com certeza, qual campanha está drenando seu orçamento hoje?',
                    'Seu time sabe quais leads do Google Ads merecem atenção agora?',
                    'Todo mês, alguém passa horas montando relatórios que já deveriam chegar prontos?',
                    'Sua campanha está no ar — mas você sabe como está performando em tempo real?',
                  ].map((q, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="text-[#ff6a00] shrink-0 mt-0.5 font-black">→</span>
                      <p className="text-sm text-slate-300 italic leading-relaxed">{q}</p>
                    </div>
                  ))}
                </div>
                <p className="text-slate-300 mt-6 text-sm leading-relaxed">
                  Se alguma dessas perguntas gerou desconforto, você precisa de mais do que uma agência — precisa de inteligência operacional. Os Agentes da NeuroAds conectam Google Ads, Meta Ads e GA4 em um ecossistema único, transformam dados em decisões e executam ajustes sem depender de relatórios manuais.
                </p>
              </div>

              {/* Right column: interactive Hub Operacional feed */}
              <div className="relative flex justify-center items-start">
                <div className="absolute inset-0 bg-[#ff6a00]/5 rounded-[30px] filter blur-[40px] pointer-events-none" />
                <div className="relative w-full max-w-[420px] p-6 overflow-hidden rounded-[24px] border border-white/5 bg-zinc-950/60 backdrop-blur-md">
                  {/* Widget Title */}
                  <div className="flex items-center justify-between border-b border-[#ff6a00]/15 pb-4 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ff6a00]" />
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Hub Operacional - Automações</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">STATUS: ATIVO</div>
                  </div>

                  {/* Static log feed */}
                  <div className="space-y-3 relative z-10 flex flex-col overflow-hidden h-[380px] pr-2 mask-image-bottom-fade">
                    {ALL_LOGS.slice(0, 5).map((log) => (
                      <div 
                        key={log.id}
                        className="flex items-center gap-4 p-3.5 rounded-[16px] bg-zinc-900/40 border border-white/5 w-full shrink-0"
                      >
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-[#ff6a00]/20 to-amber-500/10 flex items-center justify-center border border-[#ff6a00]/30 text-[#ff8f3a]">
                          <log.icon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{log.title}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{log.subtitle}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-xs font-bold ${log.color}`}>{log.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Animated vertical flow line */}
                  <div className="absolute left-[36px] top-[70px] bottom-[50px] w-[2px] bg-gradient-to-b from-[#ff6a00] via-amber-500/50 to-emerald-500 opacity-30 pointer-events-none" />
                </div>
              </div>

            </div>
          </motion.div>
        </section>

      {/* IMPLANTAÇÃO EM 4 ETAPAS */}
      <section className="relative z-10 py-24 px-5 md:px-8 bg-transparent w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 left-1/3 w-80 h-80 rounded-full blur-3xl opacity-[0.08]" style={{ backgroundColor: '#ff6a00' }} />
          <div className="absolute -bottom-10 -right-20 w-72 h-72 rounded-full blur-3xl opacity-[0.06]" style={{ backgroundColor: '#10b981' }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="dots-implantacao" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="white" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#dots-implantacao)" />
          </svg>
        </div>
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto max-w-[1260px] grid gap-16 lg:grid-cols-2 items-center"
        >
          {/* Left: Steps */}
          <div>
            <span className="inline-block rounded-full border border-[#ff6a00]/30 bg-[#ff6a00]/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#ff8f3a] mb-6">
              PROCESSO DE IMPLANTAÇÃO
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
              Do Diagnóstico à Escala{' '}
              <br />
              <span className="text-[#ff6a00]">
                em 4 Etapas
              </span>
            </h2>
            <p className="text-slate-300 mt-4 text-sm leading-relaxed max-w-[480px]">
              O analista deixa de coletar dados e volta a interpretá-los. Nossa metodologia conecta diagnóstico, configuração, ativação e otimização em um ciclo contínuo — com impacto direto no caixa.
            </p>
            <ol className="mt-10 space-y-6">
              {[
                { n: 1, title: 'Diagnóstico Estratégico', desc: 'Mapeamos gargalos da operação e identificamos os agentes certos para o seu modelo de negócio.' },
                { n: 2, title: 'Configuração do Ambiente', desc: 'Conectamos fontes de dados, APIs de mídia e fluxos para alimentar os agentes com informação real.' },
                { n: 3, title: 'Ativação dos Agentes', desc: 'Agentes são implantados e iniciam rotinas automatizadas de análise, decisão e execução.' },
                { n: 4, title: 'Análise e Otimização Contínua', desc: 'Monitore indicadores com relatórios traduzidos para impacto direto no caixa, em tempo real.' },
              ].map(({ n, title, desc }) => (
                <li key={n} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ff6a00] text-white text-sm font-black">
                    {n}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">{title}</p>
                    <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Right: Terminal mockup */}
          <div className="relative rounded-[20px] border border-white/10 bg-zinc-950/90 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/8 bg-zinc-900/60">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/70" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
                <span className="ml-3 text-[11px] text-slate-400 font-mono">Terminal</span>
              </div>
              <div className="flex gap-1">
                {['JSON', 'Dashboard', 'API'].map((tab, i) => (
                  <span
                    key={tab}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${i === 0 ? 'bg-white/10 text-white' : 'text-slate-500'}`}
                  >
                    {tab}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-6 font-mono text-[12px] leading-loose space-y-1">
              <p className="text-slate-500"># 1. Diagnóstico Estratégico</p>
              <p><span className="text-[#ff8f3a]">POST</span> <span className="text-white">/neuroads/v1/diagnostico</span></p>
              <p className="text-slate-300 pl-4">{`  -d '{"empresa": "Acme Corp"}'`}</p>
              <br />
              <p className="text-slate-500"># 2. Plano de Ação gerado:</p>
              <p className="text-slate-300">{"{"}</p>
              <p className="text-slate-300 pl-4">
                {'"agentes": ['}<span className="text-emerald-400">{"\"analista-trafego\""}</span>{", "}<span className="text-emerald-400">{"\"rastreador\""}</span>{"],"}
              </p>
              <p className="text-slate-300 pl-4">
                {'"status": '}<span className="text-[#ff8f3a]">{"\"pronto_para_ativar\""}</span>{","}
              </p>
              <p className="text-slate-300 pl-4">
                {'"impacto_estimado": '}<span className="text-emerald-400">{"\"+38% ROAS\""}</span>
              </p>
              <p className="text-slate-300">{"}"}</p>
              <br />
              <p className="text-slate-500"># 3. Agentes ativados em produção:</p>
              <p className="text-emerald-400">● analista-trafego &nbsp;&nbsp;ONLINE &nbsp;89ms</p>
              <p className="text-emerald-400">● rastreador-cirurgico &nbsp;ONLINE 112ms</p>
              <p className="text-emerald-400">● gerador-criativos &nbsp;&nbsp;ONLINE &nbsp;95ms</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* POR QUE A NEUROADS? */}
      <section className="relative z-10 py-24 px-5 md:px-8 bg-transparent w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-[0.10]" style={{ backgroundColor: '#ff6a00' }} />
          <div className="absolute top-1/2 -right-16 w-80 h-80 rounded-full blur-3xl opacity-[0.07]" style={{ backgroundColor: '#3b82f6' }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="dots-porque" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="white" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#dots-porque)" />
          </svg>
        </div>
        <div className="mx-auto max-w-[1260px]">
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center max-w-[720px] mx-auto mb-20"
          >
            <span className="inline-block rounded-full border border-[#ff6a00]/30 bg-[#ff6a00]/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#ff8f3a]">
              POR QUE A NEUROADS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-4">
              Dados soltos entre plataformas são um grande problema
            </h2>
            <p className="text-slate-400 mt-4 text-sm leading-relaxed">
              Google Ads, Meta Ads e GA4 geram dados separados — e sem unificação, cada decisão é baseada em pedaços incompletos da verdade. A NeuroAds centraliza tudo e entrega crescimento previsível.
            </p>
          </motion.div>

          <div className="space-y-20">
            {/* Feature 1: Custo Eficiência */}
            <motion.div
              variants={revealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="grid gap-12 lg:grid-cols-2 items-center"
            >
              <div>
                <div className="inline-flex items-center gap-2 mb-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff6a00]/15 border border-[#ff6a00]/30">
                    <TrendingUp size={16} className="text-[#ff8f3a]" />
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ff8f3a]">EFICIÊNCIA DE CUSTO</span>
                </div>
                <h3 className="text-2xl font-black text-white leading-tight">
                  Menor Custo por Lead com Inteligência Agêntica
                </h3>
                <p className="text-slate-300 mt-3 text-sm leading-relaxed">
                  A NeuroAds entrega estratégias otimizadas por IA que reduzem o custo por lead e aumentam o ROAS médio. Em comparação com agências tradicionais, nossas metodologias agênticas entregam redução de 30–40% no CPL em média.
                </p>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_18px_48px_rgba(0,0,0,0.4)]">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-6">COMPARATIVO DE CPL</p>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-300 font-medium">Agência Tradicional</span>
                      <span className="text-sm font-bold text-slate-300">R$ 45 /lead</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <div className="h-full w-[85%] rounded-full bg-red-500/70" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-white font-bold">NeuroAds + IA</span>
                      <span className="text-sm font-bold text-emerald-400">R$ 28 /lead</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <div className="h-full w-[52%] rounded-full bg-emerald-400" />
                    </div>
                  </div>
                </div>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-2">
                  <span className="text-emerald-400 font-bold text-sm">↓ 38% de redução</span>
                  <span className="text-slate-400 text-xs">no custo por lead</span>
                </div>
              </div>
            </motion.div>

            {/* Feature 2: Plataforma Unificada */}
            <motion.div
              variants={revealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="grid gap-12 lg:grid-cols-2 items-center"
            >
              <div className="rounded-[20px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_18px_48px_rgba(0,0,0,0.4)]">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-6">GATEWAY AGÊNTICO UNIFICADO</p>
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-lg border border-[#ff6a00]/40 bg-[#ff6a00]/10 px-5 py-2.5 font-mono text-sm text-[#ff8f3a] font-bold">
                    POST /agentes/v1/run
                  </div>
                  <ChevronRight size={16} className="text-slate-500 rotate-90" />
                  <div className="grid grid-cols-3 gap-2 w-full">
                    {[
                      { name: 'Analista', color: '#3b82f6' },
                      { name: 'Gerador', color: '#ff6a00' },
                      { name: 'Rastreador', color: '#10b981' },
                      { name: 'Preditor', color: '#8b5cf6' },
                      { name: 'Auditor', color: '#f59e0b' },
                      { name: 'Simulador', color: '#ec4899' },
                    ].map(({ name, color }) => (
                      <div
                        key={name}
                        className="rounded-lg border px-2 py-2 text-center"
                        style={{ borderColor: color + '40', backgroundColor: color + '15' }}
                      >
                        <span className="text-[10px] font-bold" style={{ color }}>{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 mb-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff6a00]/15 border border-[#ff6a00]/30">
                    <Cpu size={16} className="text-[#ff8f3a]" />
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ff8f3a]">PLATAFORMA UNIFICADA</span>
                </div>
                <h3 className="text-2xl font-black text-white leading-tight">
                  Uma Plataforma, 20+ Agentes Especializados
                </h3>
                <p className="text-slate-300 mt-3 text-sm leading-relaxed">
                  Acesse análise de tráfego, criação de conteúdo, rastreamento e inteligência de escala por meio de uma única plataforma. Combine agentes sem reconstruir sua operação de marketing.
                </p>
              </div>
            </motion.div>

            {/* Feature 3: Confiabilidade 24/7 */}
            <motion.div
              variants={revealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="grid gap-12 lg:grid-cols-2 items-center"
            >
              <div>
                <div className="inline-flex items-center gap-2 mb-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff6a00]/15 border border-[#ff6a00]/30">
                    <TrendingUp size={16} className="text-[#ff8f3a]" />
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ff8f3a]">CONFIABILIDADE</span>
                </div>
                <h3 className="text-2xl font-black text-white leading-tight">
                  Disponibilidade 24/7.<br />Monitoramento Contínuo.
                </h3>
                <p className="text-slate-300 mt-3 text-sm leading-relaxed">
                  A NeuroAds mantém os fluxos de marketing operando com disponibilidade monitorada, rastreamento de tarefas em tempo real e roteamento inteligente entre agentes e canais.
                </p>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_18px_48px_rgba(0,0,0,0.4)]">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-5">STATUS DO SISTEMA</p>
                <div className="flex items-start gap-10 mb-6">
                  <div>
                    <p className="text-4xl font-black text-emerald-400">99.8%</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">UPTIME (30 DIAS)</p>
                  </div>
                  <div>
                    <p className="text-4xl font-black text-white">~15min</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">RESPOSTA MÉDIA</p>
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-5 w-3 rounded-sm ${i === 18 ? 'bg-amber-500' : 'bg-emerald-500/80'}`}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-slate-500">30 dias atrás</span>
                  <span className="text-[10px] text-slate-500">Hoje</span>
                </div>
              </div>
            </motion.div>

            {/* Feature 4: Log de Automações */}
            <motion.div
              variants={revealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="grid gap-12 lg:grid-cols-2 items-center"
            >
              <div className="rounded-[20px] border border-white/10 bg-zinc-950/80 p-6 font-mono shadow-[0_18px_48px_rgba(0,0,0,0.4)]">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-5">LOG DE AUTOMAÇÕES</p>
                <div className="space-y-0">
                  {[
                    { time: '14:32:01', task: 'analista-trafego', ms: '89ms' },
                    { time: '14:31:47', task: 'gerador-criativos', ms: '112ms' },
                    { time: '14:31:22', task: 'rastreador-cirurgico', ms: '95ms' },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center gap-3 py-3 border-b border-white/5 text-[11px]">
                      <span className="text-slate-500 shrink-0">{log.time}</span>
                      <span className="text-slate-400">POST</span>
                      <span className="text-[#ff8f3a]">/agentes</span>
                      <span className="text-slate-300 flex-1 truncate">{log.task}</span>
                      <span className="inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shrink-0">
                        200
                      </span>
                      <span className="text-slate-500 shrink-0">{log.ms}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-slate-400">Live — Execução em tempo real</span>
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 mb-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff6a00]/15 border border-[#ff6a00]/30">
                    <Zap size={16} className="text-[#ff8f3a]" />
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ff8f3a]">ORIENTADO A DADOS</span>
                </div>
                <h3 className="text-2xl font-black text-white leading-tight">
                  Relatórios e Alertas em Tempo Real
                </h3>
                <p className="text-slate-300 mt-3 text-sm leading-relaxed">
                  Receba notificações instantâneas quando resultados mudam, orçamentos são consumidos ou oportunidades surgem. Monitore cada agente com visibilidade total da operação.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="relative z-10 py-20 px-5 md:px-8 w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 -translate-y-1/2 -left-24 w-80 h-80 rounded-full blur-3xl opacity-[0.08]" style={{ backgroundColor: '#a855f7' }} />
          <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-[0.06]" style={{ backgroundColor: '#ff6a00' }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="dots-depoimentos" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="white" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#dots-depoimentos)" />
          </svg>
        </div>
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto max-w-[1260px]"
        >
          <div className="text-center max-w-[600px] mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#ff6a00]">Depoimentos</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2">O que dizem nossos clientes</h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col gap-5 rounded-[20px] border border-white/[0.08] bg-zinc-950/60 p-6 hover:border-[#ff6a00]/20 transition-colors"
              >
                <p className="text-sm leading-relaxed text-slate-300 flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 border-t border-white/[0.06] pt-4">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover shrink-0"
                  />
                  <div>
                    <p className="text-sm font-bold text-white leading-none">{t.name}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* FAQ SECTION - MuAPI style */}
      <section id="faq" className="relative z-10 py-20 bg-transparent w-full px-5 md:px-8">
        <div className="mx-auto max-w-[1260px]">
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#ff6a00]">Dúvidas Frequentes</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2">Perguntas & Respostas</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr] items-start">
            {/* Left: 365 card */}
            <div className="lg:sticky lg:top-28 rounded-[24px] border border-[#ff6a00]/20 bg-zinc-950/92 backdrop-blur-sm p-8 shadow-[0_18px_48px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#ff6a00]/5 filter blur-[70px] rounded-full pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-7xl font-black text-white leading-none">365</span>
                </div>
                <p className="text-xs font-extrabold uppercase tracking-widest text-[#ff6a00] mb-8">DIAS / ANO</p>

                <h3 className="text-xl font-extrabold text-white mb-3">Ainda tem dúvidas?</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-8">
                  Nossa equipe e comunidade estão disponíveis para apoiar sua operação em todos os canais.
                </p>

                <div className="space-y-3">
                  <a
                    href="https://wa.me/5551981758382"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-[14px] border border-white/[0.08] bg-white/[0.03] hover:border-[#ff6a00]/30 hover:bg-[#ff6a00]/5 transition-all group cursor-pointer"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30">
                      <MessageCircle size={14} className="text-emerald-400" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-[#ff8f3a] transition-colors">Suporte Direto</p>
                      <p className="text-[10px] text-slate-500">WhatsApp & Chat</p>
                    </div>
                  </a>
                  <Link
                    href="/conteudos"
                    className="flex items-center gap-3 p-3 rounded-[14px] border border-white/[0.08] bg-white/[0.03] hover:border-[#ff6a00]/30 hover:bg-[#ff6a00]/5 transition-all group cursor-pointer"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ff6a00]/15 border border-[#ff6a00]/30">
                      <BookOpen size={14} className="text-[#ff8f3a]" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-[#ff8f3a] transition-colors">Blog & Conteúdos</p>
                      <p className="text-[10px] text-slate-500">Além do Algoritmo</p>
                    </div>
                  </Link>
                  <Link
                    href="/hub"
                    className="flex items-center gap-3 p-3 rounded-[14px] border border-white/[0.08] bg-white/[0.03] hover:border-[#ff6a00]/30 hover:bg-[#ff6a00]/5 transition-all group cursor-pointer"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-500/15 border border-slate-500/30">
                      <LayoutDashboard size={14} className="text-slate-400" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-[#ff8f3a] transition-colors">Hub Estratégico</p>
                      <p className="text-[10px] text-slate-500">Plataforma de Inteligência</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Numbered accordion */}
            <div className="space-y-3">
              {faq.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                const num = String(idx + 1).padStart(2, '0');
                return (
                  <div
                    key={idx}
                    className={`rounded-[16px] border transition-all duration-300 overflow-hidden ${
                      isOpen
                        ? 'border-[#ff6a00]/30 bg-zinc-900/60 shadow-[0_4px_16px_rgba(255,106,0,0.08)]'
                        : 'border-white/[0.08] bg-zinc-950/40 hover:border-[#ff6a00]/20'
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-center gap-4 p-5 text-left cursor-pointer group"
                    >
                      <span className="text-[13px] font-black text-[#ff6a00]/60 shrink-0 font-mono w-6">{num}</span>
                      <span className="flex-1 text-sm font-bold text-white group-hover:text-[#ff8f3a] transition-colors">{item.q}</span>
                      <span className={`shrink-0 text-xl font-light transition-transform duration-200 leading-none ${isOpen ? 'text-[#ff6a00] rotate-45' : 'text-slate-400'}`}>+</span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 border-t border-[#ff6a00]/10 pt-4 space-y-3">
                            <p className="text-xs leading-relaxed text-slate-300">{item.a}</p>
                            <div className="flex flex-wrap gap-2">
                              {item.tags.map((tag) => (
                                <span key={tag} className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#ff6a00]/10 text-[#ff8f3a] border border-[#ff6a00]/20">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA DE FECHAMENTO */}
      <section className="relative z-10 py-24 px-5 md:px-8 w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[280px] rounded-full blur-3xl opacity-[0.12]" style={{ backgroundColor: '#ff6a00' }} />
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full blur-3xl opacity-[0.05]" style={{ backgroundColor: '#ff6a00' }} />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-[0.05]" style={{ backgroundColor: '#a855f7' }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="dots-cta" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="white" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#dots-cta)" />
          </svg>
        </div>
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="relative z-10 mx-auto max-w-[720px] text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.1] text-white">
            Nenhuma estratégia tem valor se você não puder provar que realmente funciona.
          </h2>
          <p className="mt-5 text-[15px] text-slate-400 leading-relaxed max-w-[520px] mx-auto">
            A Laiki reúne todos os recursos que sua operação precisa para transformar dados em crescimento.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <button
              type="button"
              onClick={handleOpenSpecialistChat}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F24900] to-[#FF8805] hover:from-[#d93f00] hover:to-[#e07500] transition-all px-10 py-4 text-[15px] font-extrabold text-white shadow-[0_4px_32px_rgba(255,106,0,0.45)] cursor-pointer"
            >
              Agendar diagnóstico gratuito
              <ArrowRight size={16} />
            </button>
            <Link
              href="/hub"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 hover:border-white/40 transition-all px-8 py-4 text-[14px] font-bold text-white/80 hover:text-white"
            >
              Explorar o Hub
              <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Specialist Lucca Chat Modal */}
      <LuccaSpecialistChatModal
        isOpen={isLuccaChatOpen}
        onClose={() => setIsLuccaChatOpen(false)}
        autoUserMessage={luccaAutoMessage}
      />
    </main>
  );
}
