'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, TrendingUp, TrendingDown, AlertTriangle, ArrowRight,
  Target, Zap, Bot, BarChart3, DollarSign, Users, Clock,
  ChevronRight, CheckCircle2, XCircle, Lightbulb, Activity,
  RefreshCw, Star, Shield, Cpu,
} from 'lucide-react';
import Link from 'next/link';

/* ── Types ── */
type Priority = 'alta' | 'media' | 'baixa';
type Category = 'receita' | 'eficiencia' | 'risco' | 'crescimento';

type Opportunity = {
  id: string;
  priority: Priority;
  category: Category;
  title: string;
  impact: string;
  impactValue: string;
  rationale: string;
  actions: string[];
  agent: string;
  effort: 'baixo' | 'medio' | 'alto';
  timeframe: string;
  source: string[];
};

/* ── Data — insights generated from integrated data sources ── */
const OPPORTUNITIES: Opportunity[] = [
  {
    id: 'op1',
    priority: 'alta',
    category: 'receita',
    title: 'Redistribuir budget do TikTok para Meta Ads',
    impact: 'Aumento de receita estimado',
    impactValue: '+R$ 38.200/mês',
    rationale:
      'O Agente de Performance identificou que suas campanhas TikTok têm ROAS 1.8x contra 4.2x do Meta Ads. Com o mesmo investimento realocado, você projeta +R$ 38k/mês em receita atribuída sem aumentar o budget total.',
    actions: [
      'Reduzir budget TikTok em 40% (de R$ 12.000 para R$ 7.200)',
      'Alocar R$ 4.800 adicionais em campanhas de Retargeting Meta',
      'Criar conjunto de anúncios Mirror das campanhas Black Friday Hero',
      'Monitorar ROAS por 7 dias antes de escalar',
    ],
    agent: 'Agente Performance',
    effort: 'baixo',
    timeframe: '3–5 dias',
    source: ['Meta Ads', 'TikTok Ads', 'GA4'],
  },
  {
    id: 'op2',
    priority: 'alta',
    category: 'eficiencia',
    title: 'Ativar Lance Automático via IA nos top 3 grupos',
    impact: 'Redução de CPA esperada',
    impactValue: '–22% CPA',
    rationale:
      'Com base nos últimos 28 dias, os grupos Retargeting 30d, Lookalike 2% e Interesses Broad têm padrões de conversão estáveis o suficiente para o Agente de Lances assumir controle e otimizar bid a cada 15min.',
    actions: [
      'Ativar modo Agente de Lances nos 3 grupos identificados',
      'Definir CPA alvo de R$ 28 (atual médio: R$ 36)',
      'Configurar alertas se CPA > R$ 42 por 6h consecutivas',
      'Revisar performance após 14 dias',
    ],
    agent: 'Agente de Lances IA',
    effort: 'baixo',
    timeframe: '1 dia',
    source: ['Google Ads', 'Meta Ads'],
  },
  {
    id: 'op3',
    priority: 'alta',
    category: 'risco',
    title: 'Corrigir discrepância de atribuição CAPI vs pixel',
    impact: 'Conversões não contabilizadas',
    impactValue: '~34% eventos perdidos',
    rationale:
      'O Agente Técnico detectou que 34% das conversões de compra não estão chegando via CAPI — apenas pelo pixel browser. Com iOS 17+ e bloqueadores, você está tomando decisões com dados incompletos, superestimando CPA real.',
    actions: [
      'Auditar configuração do GTM Server com o relatório de deduplicação',
      'Implementar event_id único compartilhado entre CAPI e pixel',
      'Validar eventos no Events Manager durante 48h',
      'Recalibrar metas de CPA após estabilização',
    ],
    agent: 'Agente Técnico',
    effort: 'medio',
    timeframe: '5–7 dias',
    source: ['GTM Server', 'Meta Ads', 'GA4'],
  },
  {
    id: 'op4',
    priority: 'media',
    category: 'crescimento',
    title: 'Escalar criativos de vídeo curto — formato ganhador',
    impact: 'Potencial de escala de CTR',
    impactValue: '+40% CTR médio',
    rationale:
      'O Agente de Criativos analisou 14 peças das últimas 4 semanas. Vídeos ≤15s superam imagens estáticas em 40% CTR e 28% taxa de conversão. O criativo Video_30s_BlackFriday_v3 está saturando — hora de criar variações.',
    actions: [
      'Produzir 3 variações do Video_30s_BlackFriday_v3 com CTA alternativo',
      'Testar headline "Oferta por tempo limitado" vs "Frete grátis hoje"',
      'Rodar teste A/B por 7 dias com budget de R$ 2.000 por variante',
      'Escalar o vencedor com orçamento do criativo saturado',
    ],
    agent: 'Agente Criativos',
    effort: 'medio',
    timeframe: '7–14 dias',
    source: ['Meta Ads', 'GA4'],
  },
  {
    id: 'op5',
    priority: 'media',
    category: 'receita',
    title: 'Ativar campanha de recuperação de carrinhos abandonados',
    impact: 'Receita recuperável estimada',
    impactValue: '+R$ 15.800/mês',
    rationale:
      'O Agente CRM identificou que 68% dos carrinhos abandonados nas últimas 2 semanas não receberam follow-up. Com uma sequência de e-mail + WhatsApp em 1h, 3h e 24h, a taxa de recuperação histórica do setor é 18–22%.',
    actions: [
      'Configurar automação de carrinho no RD Station',
      'Criar sequência: E-mail 1h → WhatsApp 3h → E-mail 24h com desconto 10%',
      'Segmentar por ticket médio (>R$ 150 recebe oferta VIP)',
      'Medir taxa de recuperação após 30 dias',
    ],
    agent: 'Agente CRM',
    effort: 'medio',
    timeframe: '3–5 dias',
    source: ['RD Station', 'GA4', 'Stripe'],
  },
  {
    id: 'op6',
    priority: 'media',
    category: 'eficiencia',
    title: 'Implementar Lookalike 1% de compradores recentes',
    impact: 'Novos leads qualificados',
    impactValue: 'CPL estimado R$ 18–24',
    rationale:
      'Sua base atual de compradores dos últimos 60 dias (1.840 pessoas) ainda não foi usada para criar público Lookalike 1%. Historicamente, LKA de compradores converte 3x melhor que interesses frios.',
    actions: [
      'Criar Custom Audience de compradores 60d no Meta',
      'Gerar Lookalike 1% Brasil com base neste público',
      'Alocar R$ 3.500 de budget de prospecting frio',
      'Comparar CPL vs Lookalike 2-5% existentes',
    ],
    agent: 'Agente Performance',
    effort: 'baixo',
    timeframe: '2–3 dias',
    source: ['Meta Ads', 'GA4'],
  },
  {
    id: 'op7',
    priority: 'baixa',
    category: 'crescimento',
    title: 'Integrar Google Search Console para captar demanda orgânica',
    impact: 'Visibilidade de palavras-chave',
    impactValue: '480+ termos identificados',
    rationale:
      'O Search Console ainda não está conectado. Com 480 palavras-chave captadas na última análise pública do domínio, você está perdendo dados cruciais de intenção de compra para alimentar campanhas de DSA e content strategy.',
    actions: [
      'Conectar Google Search Console em Integrações',
      'Identificar top 20 termos de alta conversão não cobertos por ads',
      'Criar campanha DSA para termos orgânicos top',
      'Alimentar blog com conteúdo para termos de cauda longa',
    ],
    agent: 'Agente SEO',
    effort: 'baixo',
    timeframe: '1 dia',
    source: ['Search Console', 'GA4'],
  },
];

/* ── Config ── */
const PRIORITY_CONFIG = {
  alta:  { label: 'Prioridade Alta',   color: 'text-rose-600',    bg: 'bg-rose-500/10',    border: 'border-rose-500/30',    dot: 'bg-rose-500'    },
  media: { label: 'Prioridade Média',  color: 'text-amber-600',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   dot: 'bg-amber-500'   },
  baixa: { label: 'Prioridade Baixa',  color: 'text-blue-600',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30',    dot: 'bg-blue-500'    },
};

const CATEGORY_CONFIG = {
  receita:     { label: 'Receita',    icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  eficiencia:  { label: 'Eficiência', icon: Zap,        color: 'text-orange-600',  bg: 'bg-orange-500/10'  },
  risco:       { label: 'Risco',      icon: Shield,     color: 'text-rose-600',    bg: 'bg-rose-500/10'    },
  crescimento: { label: 'Crescimento',icon: TrendingUp, color: 'text-blue-600',    bg: 'bg-blue-500/10'    },
};

const EFFORT_LABEL = { baixo: 'Esforço Baixo', medio: 'Esforço Médio', alto: 'Esforço Alto' };
const FILTERS = ['Todas', 'Receita', 'Eficiência', 'Risco', 'Crescimento', 'Alta Prioridade'];

/* ── KPI summary ── */
const KPIS = [
  { label: 'Oportunidades Identificadas', value: '7', icon: Sparkles, color: 'text-[#FF6A00]', bg: 'bg-orange-500/10' },
  { label: 'Impacto Estimado / mês',       value: '+R$ 54k',    icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  { label: 'Alta Prioridade',              value: '3',          icon: AlertTriangle, color: 'text-rose-600',  bg: 'bg-rose-500/10'   },
  { label: 'Agentes Envolvidos',           value: '6',          icon: Bot,        color: 'text-blue-600',    bg: 'bg-blue-500/10'    },
];

/* ── Components ── */
function KpiCard({ label, value, icon: Icon, color, bg }: typeof KPIS[0]) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 p-4 rounded-2xl border border-white/60 bg-[#eef2f7] shadow-[3px_3px_8px_#d1d9e6,_-3px_-3px_8px_#ffffff]"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
        <Icon size={18} className={color} />
      </div>
      <div>
        <p className="text-[22px] font-black text-[#1e293b] leading-none">{value}</p>
        <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

function OpportunityCard({ opp, index }: { opp: Opportunity; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const priority = PRIORITY_CONFIG[opp.priority];
  const category = CATEGORY_CONFIG[opp.category];
  const CatIcon = category.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="rounded-2xl border border-white/60 bg-[#eef2f7] shadow-[3px_3px_8px_#d1d9e6,_-3px_-3px_8px_#ffffff] overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full text-left p-5 flex items-start gap-4 hover:bg-white/30 transition-colors"
      >
        {/* Priority dot + category icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${category.bg}`}>
          <CatIcon size={18} className={category.color} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${priority.bg} ${priority.color} ${priority.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
              {priority.label}
            </span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${category.bg} ${category.color}`}>
              {category.label}
            </span>
            <span className="text-[10px] font-bold text-slate-400 ml-auto">{opp.agent}</span>
          </div>

          <h3 className="text-[14px] font-black text-[#1e293b] leading-snug">{opp.title}</h3>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp size={13} className="text-emerald-500" />
              <span className="text-[12px] text-slate-600 font-semibold">{opp.impact}:</span>
              <span className="text-[13px] font-black text-emerald-600">{opp.impactValue}</span>
            </div>
            <span className="text-slate-300">·</span>
            <span className="text-[11px] font-semibold text-slate-400">{opp.timeframe}</span>
            <span className="text-slate-300">·</span>
            <span className="text-[11px] font-semibold text-slate-400">{EFFORT_LABEL[opp.effort]}</span>
          </div>
        </div>

        <ChevronRight
          size={16}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
        />
      </button>

      {/* Expanded body */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0 border-t border-white/40">
              {/* Rationale */}
              <div className="mt-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={13} className="text-amber-500" />
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide">Análise do Agente</span>
                </div>
                <p className="text-[13px] text-slate-700 leading-relaxed font-medium">{opp.rationale}</p>
              </div>

              {/* Actions */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span className="text-[11px] font-black text-slate-500 uppercase tracking-wide">Próximos Passos</span>
                </div>
                <ul className="space-y-2">
                  {opp.actions.map((action, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-0.5 w-5 h-5 rounded-full border-2 border-[#FF6A00]/30 bg-orange-500/5 flex items-center justify-center text-[10px] font-black text-[#FF6A00] shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-[12.5px] text-slate-700 font-semibold leading-snug">{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Sources + CTA */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Activity size={11} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400">Fontes:</span>
                  {opp.source.map(s => (
                    <span key={s} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-600">
                      {s}
                    </span>
                  ))}
                </div>

                <Link
                  href="/hub/assistente-ia"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-black text-white bg-[#FF6A00] hover:bg-[#e05d00] shadow-[2px_2px_6px_rgba(255,106,0,0.3)] transition-all hover:shadow-[3px_3px_8px_rgba(255,106,0,0.4)] active:shadow-none"
                >
                  Discutir com Lucca
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ── Main Page ── */
export default function OportunidadesPage() {
  const [activeFilter, setActiveFilter] = useState('Todas');
  const [lastUpdated] = useState(new Date());

  const filtered = OPPORTUNITIES.filter(opp => {
    if (activeFilter === 'Todas') return true;
    if (activeFilter === 'Alta Prioridade') return opp.priority === 'alta';
    const catMap: Record<string, Category> = {
      'Receita': 'receita',
      'Eficiência': 'eficiencia',
      'Risco': 'risco',
      'Crescimento': 'crescimento',
    };
    return opp.category === catMap[activeFilter];
  });

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="text-[#FF6A00]" />
            <h1 className="text-[22px] font-black text-[#1e293b]">Oportunidades</h1>
          </div>
          <p className="text-[13px] text-slate-500 font-semibold">
            Insights gerados pelos Agentes IA com base nos seus dados integrados — priorizados por impacto.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
          <RefreshCw size={12} />
          <span>Atualizado {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {KPIS.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <KpiCard {...kpi} />
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3.5 py-1.5 rounded-xl text-[12px] font-bold transition-all duration-150 ${
              activeFilter === f
                ? 'text-[#FF6A00] bg-orange-500/10 border border-orange-500/30 shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]'
                : 'text-[#475569] border border-white/40 bg-[#eef2f7] shadow-[2px_2px_5px_#d1d9e6,_-2px_-2px_5px_#ffffff] hover:shadow-[3px_3px_7px_#d1d9e6,_-3px_-3px_7px_#ffffff]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Agent Source Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/60 bg-gradient-to-r from-orange-500/5 to-transparent shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff]"
      >
        <div className="flex -space-x-2">
          {['Performance', 'Lances IA', 'Técnico', 'Criativos', 'CRM'].map((agent, i) => (
            <div
              key={agent}
              className="w-7 h-7 rounded-full border-2 border-[#eef2f7] bg-gradient-to-br from-[#FF6A00] to-[#FF8805] flex items-center justify-center"
              style={{ zIndex: 5 - i }}
            >
              <Bot size={11} className="text-white" />
            </div>
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-black text-[#1e293b]">
            5 Agentes IA analisaram seus dados continuamente
          </p>
          <p className="text-[11px] text-slate-500 font-semibold">
            Baseado em Meta Ads · Google Ads · GA4 · RD Station · TikTok Ads dos últimos 28 dias
          </p>
        </div>
        <Link
          href="/hub/assistente-ia"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black text-[#FF6A00] border border-orange-500/30 hover:bg-orange-500/10 transition-colors shrink-0"
        >
          Perguntar ao Lucca
          <ArrowRight size={12} />
        </Link>
      </motion.div>

      {/* Opportunities list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Sparkles size={24} className="mx-auto mb-3 text-slate-300" />
            <p className="text-[13px] font-bold">Nenhuma oportunidade nesta categoria.</p>
          </div>
        ) : (
          filtered.map((opp, i) => (
            <OpportunityCard key={opp.id} opp={opp} index={i} />
          ))
        )}
      </div>

      {/* Footer CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-between gap-4 p-5 rounded-2xl border border-white/60 bg-gradient-to-r from-orange-500/8 via-[#eef2f7] to-[#eef2f7] shadow-[3px_3px_8px_#d1d9e6,_-3px_-3px_8px_#ffffff]"
      >
        <div>
          <p className="text-[14px] font-black text-[#1e293b]">Quer explorar mais oportunidades?</p>
          <p className="text-[12px] text-slate-500 font-semibold mt-0.5">
            Converse com o Lucca e peça análises customizadas para o seu negócio.
          </p>
        </div>
        <Link
          href="/hub/assistente-ia"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-black text-white bg-[#FF6A00] hover:bg-[#e05d00] shadow-[3px_3px_8px_rgba(255,106,0,0.35)] transition-all hover:shadow-[4px_4px_10px_rgba(255,106,0,0.4)] active:shadow-none shrink-0"
        >
          <Sparkles size={14} />
          Abrir Lucca
        </Link>
      </motion.div>
    </div>
  );
}
