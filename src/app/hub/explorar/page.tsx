'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, TrendingUp, TrendingDown, AlertTriangle, ArrowRight,
  Target, Zap, Bot, BarChart3, DollarSign, Users, Clock,
  ChevronRight, CheckCircle2, XCircle, Lightbulb, Activity,
  RefreshCw, Star, Shield, Cpu,
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { getFirebaseDb } from '../../../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

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
  createdAt?: number | string | { seconds: number; nanoseconds: number; toMillis?: () => number };
};

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

/* ── Components ── */
function KpiCard({ label, value, icon: Icon, color, bg }: { label: string; value: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string; bg: string }) {
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

  const typeLabel = useMemo(() => {
    if (opp.category === 'risco') return { text: '⚠️ Risco Iminente', color: 'text-rose-600 bg-rose-50 border-rose-200' };
    if (opp.category === 'eficiencia' || opp.category === 'crescimento') return { text: '🔁 Padrão Detectado', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    return { text: '💡 Oportunidade', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  }, [opp.category]);

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
            <span className={`inline-flex items-center gap-1.5 text-[9.5px] font-black px-2.5 py-0.5 rounded-full border ${typeLabel.color}`}>
              {typeLabel.text}
            </span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${priority.bg} ${priority.color} ${priority.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priority.dot}`} />
              {priority.label}
            </span>
            <span className="text-[10px] font-bold text-slate-400 ml-auto">{opp.agent}</span>
          </div>

          <h3 className="text-[14px] font-black text-[#1e293b] leading-snug">{opp.title}</h3>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
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
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Todas');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [timePeriod, setTimePeriod] = useState<'hoje' | 'ontem' | '7d' | '15d'>('hoje');

  useEffect(() => {
    if (!user) {
      setOpportunities([]);
      setLoading(false);
      return;
    }
    try {
      const db = getFirebaseDb();
      const q = query(
        collection(db, 'users', user.uid, 'opportunities'),
        orderBy('createdAt', 'desc')
      );
      const unsub = onSnapshot(
        q,
        (snap) => {
          const docs: Opportunity[] = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<Opportunity, 'id'>)
          }));
          setOpportunities(docs);
          setLastUpdated(new Date());
          setLoading(false);
        },
        () => {
          setOpportunities([]);
          setLoading(false);
        }
      );
      return () => unsub();
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setOpportunities([]);
      setLoading(false);
    }
  }, [user]);

  const activeOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      const timestamp = (() => {
        const cAt = opp.createdAt;
        if (!cAt) return 0;
        if (typeof cAt === 'number') return cAt;
        if (typeof cAt === 'object' && cAt && 'toMillis' in cAt && typeof cAt.toMillis === 'function') return cAt.toMillis();
        if (typeof cAt === 'object' && cAt && 'seconds' in cAt && typeof cAt.seconds === 'number') return cAt.seconds * 1000;
        if (typeof cAt === 'string') return new Date(cAt).getTime();
        return 0;
      })();
      
      if (!timestamp) return false;
      // eslint-disable-next-line react-hooks/purity
      const diffMs = Date.now() - timestamp;
      
      if (timePeriod === 'hoje') {
        return diffMs <= 24 * 3600 * 1000;
      }
      if (timePeriod === 'ontem') {
        return diffMs > 24 * 3600 * 1000 && diffMs <= 48 * 3600 * 1000;
      }
      if (timePeriod === '7d') {
        return diffMs <= 7 * 24 * 3600 * 1000;
      }
      if (timePeriod === '15d') {
        return diffMs <= 15 * 24 * 3600 * 1000;
      }
      return true;
    });
  }, [opportunities, timePeriod]);

  const filtered = activeOpportunities.filter(opp => {
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

  const kpis = useMemo(() => {
    let totalImpact = 0;
    activeOpportunities.forEach(opp => {
      const valStr = opp.impactValue || '';
      const cleanVal = valStr.replace(/\./g, '');
      const match = cleanVal.match(/\d+/);
      if (match && valStr.includes('R$')) {
        totalImpact += parseInt(match[0], 10);
      }
    });

    const impactLabel = totalImpact > 0 
      ? `+R$ ${totalImpact.toLocaleString('pt-BR')}` 
      : (activeOpportunities.length > 0 ? 'Sob Demanda' : '—');

    return [
      { label: 'Oportunidades Identificadas', value: String(activeOpportunities.length), icon: Sparkles, color: 'text-[#FF6A00]', bg: 'bg-orange-500/10' },
      { label: 'Impacto Estimado / mês',       value: impactLabel, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
      { label: 'Alta Prioridade',              value: String(activeOpportunities.filter(o => o.priority === 'alta').length), icon: AlertTriangle, color: 'text-rose-600',  bg: 'bg-rose-500/10'   },
      { label: 'Agentes Envolvidos',           value: String(new Set(activeOpportunities.map(o => o.agent)).size), icon: Bot, color: 'text-blue-600', bg: 'bg-blue-500/10' },
    ];
  }, [activeOpportunities]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 rounded-full border-2 border-[#FF6A00] border-t-transparent animate-spin" />
        <p className="text-[13px] font-black text-slate-400 mt-3">Carregando oportunidades…</p>
      </div>
    );
  }

  if (opportunities.length === 0 && activeOpportunities.length === 0) {
    return (
      <div className="space-y-6 w-full">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={18} className="text-[#FF6A00]" />
              <h1 className="text-[22px] font-black text-[#1e293b]">Oportunidades</h1>
            </div>
            <p className="text-[13px] text-slate-500 font-semibold">
              Insights gerados pelos Agentes IA com base nos seus dados integrados — priorizados por impacto.
            </p>
          </div>
        </div>

        {/* Empty state card */}
        <div className="rounded-2xl border border-white/60 bg-[#eef2f7] p-12 text-center flex flex-col items-center gap-4 shadow-[4px_4px_10px_#d1d9e6,_-4px_-4px_10px_#ffffff]">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/8 border border-orange-500/15 flex items-center justify-center">
            <Sparkles size={28} className="text-[#FF6A00]" />
          </div>
          <div>
            <p className="text-[16px] font-black text-[#0f172a]">Nenhuma oportunidade gerada ainda</p>
            <p className="text-[13px] text-slate-500 font-semibold mt-1 max-w-sm mx-auto">
              As oportunidades e insights de otimização serão listadas aqui assim que os seus Agentes IA executarem os fluxos de Automação.
            </p>
          </div>
          <Link
            href="/hub/automacoes"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-black text-white shadow-[0_4px_12px_rgba(255,106,0,0.25)] hover:scale-[1.02] transition-all"
            style={{ background: 'linear-gradient(135deg, #FF4D00, #FF8805)', textDecoration: 'none' }}
          >
            <Cpu size={14} />
            Ver Automações
          </Link>
        </div>
      </div>
    );
  }

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

      {/* Time-Travel Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-white/60 bg-[#eef2f7] shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-black uppercase text-slate-400 mr-2 font-sans tracking-wider">Histórico de Análises (Time-Travel):</span>
          {[
            { id: 'hoje', label: 'Hoje (Atual)' },
            { id: 'ontem', label: 'Ontem' },
            { id: '7d', label: 'Últimos 7 dias' },
            { id: '15d', label: 'Últimos 15 dias' },
          ].map(period => (
            <button
              key={period.id}
              onClick={() => setTimePeriod(period.id as 'hoje' | 'ontem' | '7d' | '15d')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                timePeriod === period.id
                  ? 'bg-white text-[#FF6A00] border border-[#FF6A00]/30 shadow-sm'
                  : 'text-[#475569] hover:text-[#1e293b] border border-transparent'
              }`}
            >
              🕒 {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => (
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
