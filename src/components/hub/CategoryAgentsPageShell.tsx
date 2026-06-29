'use client';

/**
 * CategoryAgentsPageShell
 *
 * Modo CATEGORIA  → categorySlug = 'performance' | 'criativos' | 'tecnico' | 'inteligencia'
 *   Filtra agentes da categoria, filtros de status (Todos / Ativo / Inativo)
 *
 * Modo LABORATÓRIO → categorySlug = 'all'
 *   Mostra todos os agentes, filtros por categoria + status
 */

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Brain, CheckCircle2, ChevronRight, Clock, ExternalLink,
  Info, Sparkles, Wrench, X,
  BarChart2, Cpu, Search, Power,
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { agents as allAgents } from '../../data/agents';
import {
  getAgentEntryDefinition,
  getContractedAgentsFromProfile,
  slugifyAgentTitle,
} from '../../lib/hub-agents';
import { readAgentStatusOverrides, writeAgentStatusOverrides } from '../../lib/agent-status-cache';
import { useAuth } from '../../context/AuthContext';
import { getFirebaseDb } from '../../lib/firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CategoryPageSlug =
  | 'performance'
  | 'criativos'
  | 'tecnico'
  | 'inteligencia'
  | 'all';

type StatusFilter = 'Todos' | 'Ativo' | 'Inativo';

// ─── Category metadata ────────────────────────────────────────────────────────

const CATEGORY_META = {
  performance: {
    label: 'Performance',
    badge: 'IA Performance',
    summary: 'Agentes que analisam, otimizam e escalam seus resultados de mídia paga.',
    impact: 'Foco em reduzir desperdício e aumentar retorno por real investido.',
    icon: BarChart2,
    accentColor: '#0891b2',
  },
  criativos: {
    label: 'Criativos',
    badge: 'IA Criativos',
    summary: 'Agentes para produção de criativos, copies e testes de mensagem.',
    impact: 'Foco em melhorar taxa de clique, conversão e custo por lead.',
    icon: Sparkles,
    accentColor: '#FF6A00',
  },
  tecnico: {
    label: 'Técnico',
    badge: 'IA Técnico',
    summary: 'Agentes para tracking, funil, testes estruturados e estabilidade operacional.',
    impact: 'Foco em precisão de dados e ganhos de eficiência no caixa.',
    icon: Cpu,
    accentColor: '#7c3aed',
  },
  inteligencia: {
    label: 'Inteligência',
    badge: 'IA Inteligência',
    summary: 'Agentes de análise estratégica, GEO/SEO e leitura de cenário.',
    impact: 'Foco em decisões com dados reais e crescimento previsível.',
    icon: Brain,
    accentColor: '#059669',
  },
  all: {
    label: 'Todos',
    badge: 'Laboratório de IA',
    summary: 'Ative e gerencie todos os Agentes IA da sua operação com foco em resultado financeiro real.',
    impact: 'Cada agente conecta dados reais aos objetivos do seu negócio.',
    icon: Wrench,
    accentColor: '#FF6A00',
  },
} as const;

// ─── Category filters for "all" mode ─────────────────────────────────────────

const CATEGORY_FILTERS: Array<{ slug: string; label: string; color: string }> = [
  { slug: 'Todos',        label: 'Todos',         color: '#FF6A00' },
  { slug: 'Performance',  label: 'Performance',   color: '#0891b2' },
  { slug: 'Criativos',    label: 'Criativos',     color: '#FF6A00' },
  { slug: 'Técnico',      label: 'Técnico',       color: '#7c3aed' },
  { slug: 'Inteligência', label: 'Inteligência',  color: '#059669' },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildActivities(longDescription: string): string[] {
  const parts = longDescription
    .replace(/\s+/g, ' ').trim()
    .split('.')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2);
  if (parts.length >= 2) return parts;
  if (parts.length === 1) return [parts[0], 'Gera recomendações práticas para acelerar decisões com foco em resultado financeiro.'];
  return [
    'Analisa os principais sinais de desempenho da operação em tempo real.',
    'Transforma dados em sugestões práticas para ganho de eficiência e escala previsível.',
  ];
}

// ─── Agent card (visual idêntico ao Agentes Ativos) ──────────────────────────

function AgentCard({
  agent,
  isActive,
  isActivating,
  isDeactivating,
  accentColor,
  onActivate,
  onDeactivate,
  onDetails,
}: {
  agent: (typeof allAgents)[number];
  isActive: boolean;
  isActivating: boolean;
  isDeactivating: boolean;
  accentColor: string;
  onActivate: () => void;
  onDeactivate: () => void;
  onDetails: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const statusCfg = isActive
    ? { label: 'Ativo',   color: 'text-emerald-700', bg: 'bg-emerald-500/10 border-emerald-500/20', Icon: CheckCircle2 }
    : { label: 'Inativo', color: 'text-slate-500',    bg: 'bg-slate-200/60 border-slate-300/40',     Icon: Power };

  const StatusIcon = statusCfg.Icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="hub-neu-card p-5 shadow-[4px_4px_10px_#d1d9e6,_-4px_-4px_10px_#ffffff] hover:shadow-[6px_6px_14px_#d1d9e6,_-6px_-6px_14px_#ffffff] transition-all duration-300 cursor-pointer group"
      style={{ borderLeftColor: accentColor }}
      onClick={() => setExpanded((e) => !e)}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border border-white/50 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06),_inset_-2px_-2px_4px_#ffffff] overflow-hidden"
          style={{ background: `${accentColor}18` }}
        >
          <Image src={agent.icon} alt={agent.title} width={28} height={28} className="object-cover" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[14px] font-black text-[#0f172a] truncate">{agent.title}</h3>
            <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.color}`}>
              <StatusIcon size={9} />
              {statusCfg.label}
            </span>
          </div>
          <p className="text-[11.5px] text-slate-500 font-semibold mt-0.5 leading-snug line-clamp-2">
            {agent.description}
          </p>
        </div>

        <ChevronRight
          size={15}
          className={`text-slate-400 shrink-0 transition-transform duration-300 ${expanded ? 'rotate-90' : ''} group-hover:text-[#FF6A00]`}
        />
      </div>

      {/* Expanded actions */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-slate-200/60 flex flex-wrap gap-3">
              {isActive ? (
                <>
                  <Link
                    href={`/hub/agente/${slugifyAgentTitle(agent.title)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-black text-white transition-all shadow-[0_4px_12px_rgba(37,99,235,0.25)] hover:shadow-[0_4px_18px_rgba(37,99,235,0.38)] hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', textDecoration: 'none' }}
                  >
                    <ExternalLink size={12} />
                    Acessar Agente
                  </Link>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeactivate(); }}
                    disabled={isDeactivating}
                    className="px-4 py-2.5 rounded-xl text-[12px] font-black text-rose-600 border border-rose-500/20 bg-rose-500/5 shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] transition-all disabled:opacity-50"
                  >
                    {isDeactivating ? 'Desativando…' : 'Desativar'}
                  </button>
                </>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); onActivate(); }}
                  disabled={isActivating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-black text-white transition-all shadow-[0_4px_12px_rgba(255,106,0,0.25)] hover:shadow-[0_4px_18px_rgba(255,106,0,0.38)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #FF4D00, #FF8805)' }}
                >
                  <Wrench size={12} />
                  {isActivating ? 'Ativando…' : 'Ativar Agente'}
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onDetails(); }}
                className="px-4 py-2.5 rounded-xl text-[12px] font-black text-slate-600 border border-white/60 bg-[#eef2f7] shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] transition-all"
              >
                <Info size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function CategoryAgentsPageShell({
  categorySlug,
}: {
  categorySlug: CategoryPageSlug;
}) {
  const { user, profile } = useAuth();
  const router = useRouter();
  const isAll = categorySlug === 'all';
  const meta = CATEGORY_META[categorySlug];
  const CategoryIcon = meta.icon;

  // Firebase / optimistic UI
  const contractedAgents = useMemo(() => getContractedAgentsFromProfile(profile), [profile]);
  const [statusOverrides, setStatusOverrides] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (!user) { setStatusOverrides({}); return; }
    setStatusOverrides(readAgentStatusOverrides(user.uid));
  }, [user]);

  const effectiveContracts = useMemo(() => {
    if (Object.keys(statusOverrides).length === 0) return contractedAgents;
    const merged = new Map(contractedAgents);
    for (const [title, isActive] of Object.entries(statusOverrides)) {
      merged.set(title, { ...(merged.get(title) ?? { isActive: false }), isActive });
    }
    return merged;
  }, [contractedAgents, statusOverrides]);

  const [activatingSlug, setActivatingSlug]   = useState<string | null>(null);
  const [deactivatingSlug, setDeactivatingSlug] = useState<string | null>(null);
  const [selectedDetailsSlug, setSelectedDetailsSlug] = useState<string | null>(null);

  // Filters
  const [search, setSearch]                   = useState('');
  const [filterStatus, setFilterStatus]       = useState<StatusFilter>('Todos');
  const [filterCategory, setFilterCategory]   = useState('Todos'); // only used in "all" mode

  // Pool of agents (all or filtered by category)
  const poolAgents = useMemo(() => {
    const base = isAll ? allAgents : allAgents.filter((a) => a.category === meta.label);
    return base.map((agent) => ({
      agent,
      entry: getAgentEntryDefinition(agent, effectiveContracts),
    }));
  }, [isAll, meta.label, effectiveContracts]);

  const filtered = useMemo(() =>
    poolAgents.filter(({ agent, entry }) => {
      const matchSearch = !search ||
        agent.title.toLowerCase().includes(search.toLowerCase()) ||
        agent.description.toLowerCase().includes(search.toLowerCase());
      const matchStatus =
        filterStatus === 'Todos' ||
        (filterStatus === 'Ativo'   && entry.isActive) ||
        (filterStatus === 'Inativo' && !entry.isActive);
      const matchCategory = !isAll || filterCategory === 'Todos' || agent.category === filterCategory;
      return matchSearch && matchStatus && matchCategory;
    }),
    [poolAgents, search, filterStatus, filterCategory, isAll]
  );

  const activeCount = poolAgents.filter(({ entry }) => entry.isActive).length;
  const totalCount  = poolAgents.length;

  const detailsAgent = selectedDetailsSlug
    ? poolAgents.find(({ agent }) => slugifyAgentTitle(agent.title) === selectedDetailsSlug)?.agent ?? null
    : null;

  const activeEntry = poolAgents.find(({ entry }) => entry.isActive)?.entry;
  const planName    = activeEntry?.planSummary?.planName  ?? 'Growth';
  const planLimit   = activeEntry?.planSummary?.monthlyLimit ?? 15;

  // Accent color per agent (for "all" mode uses per-category color)
  function agentAccentColor(categoryLabel: string): string {
    const found = Object.values(CATEGORY_META).find((m) => m.label === categoryLabel);
    return found?.accentColor ?? '#FF6A00';
  }

  const activateAgent = async (agentTitle: string, agentSlug: string) => {
    if (!user) return;
    setActivatingSlug(agentSlug);
    const overrides = { ...statusOverrides, [agentTitle]: true };
    setStatusOverrides(overrides);
    writeAgentStatusOverrides(user.uid, overrides);
    try {
      const db = getFirebaseDb();
      await setDoc(doc(db, 'users', user.uid), {
        activeAgents: { [agentTitle]: { isActive: true, planName: 'Growth', monthlyLimit: 15, usageUsed: 0, updatedAt: Date.now() } },
      }, { merge: true });
      router.refresh();
    } catch { /* noop */ } finally { setActivatingSlug(null); }
  };

  const deactivateAgent = async (agentTitle: string, agentSlug: string) => {
    if (!user) return;
    setDeactivatingSlug(agentSlug);
    const overrides = { ...statusOverrides, [agentTitle]: false };
    setStatusOverrides(overrides);
    writeAgentStatusOverrides(user.uid, overrides);
    try {
      const db = getFirebaseDb();
      await setDoc(doc(db, 'users', user.uid), {
        activeAgents: { [agentTitle]: { isActive: false, updatedAt: Date.now() } },
      }, { merge: true });
      router.refresh();
    } catch { /* noop */ } finally { setDeactivatingSlug(null); }
  };

  return (
    <div className="space-y-8 w-full px-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 py-8 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full border border-white/60 bg-[#eef2f7] shadow-[2px_2px_5px_#d1d9e6,_-2px_-2px_5px_#ffffff]">
            <CategoryIcon size={12} style={{ color: meta.accentColor }} />
            <span className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: meta.accentColor }}>
              {meta.badge}
            </span>
          </div>
          <h1 className="text-[26px] font-black text-[#0f172a] tracking-tight">
            {isAll ? 'Laboratório de Agentes' : meta.label}
          </h1>
          <p className="text-[13px] text-slate-500 font-semibold mt-1 max-w-xl">{meta.summary}</p>
          <p className="text-[12px] font-black mt-1" style={{ color: meta.accentColor }}>{meta.impact}</p>
        </div>
        {!isAll && (
          <Link
            href={`/hub/laboratorio-agentes?categoria=${categorySlug}`}
            className="shrink-0 inline-flex h-10 items-center justify-center gap-2 px-5 rounded-xl text-[12px] font-black text-slate-600 border border-white/60 bg-[#eef2f7] shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] transition-all"
            style={{ textDecoration: 'none' }}
          >
            <Wrench size={13} />
            Laboratório
          </Link>
        )}
      </div>

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {([
          { label: 'Agentes Ativos',     value: activeCount,                     color: '#059669', bg: 'bg-emerald-500/8',  border: 'border-emerald-500/15' },
          { label: 'Total Disponível',    value: totalCount,                      color: isAll ? '#FF6A00' : meta.accentColor, bg: 'bg-orange-500/8', border: 'border-orange-500/15' },
          { label: isAll ? 'Categorias' : 'Plano', value: isAll ? CATEGORY_FILTERS.length - 1 : planName, color: '#2563eb', bg: 'bg-blue-500/8', border: 'border-blue-500/15' },
          { label: isAll ? 'Inativos' : 'Capacidade', value: isAll ? totalCount - activeCount : `${activeCount}/${planLimit}`, color: '#d97706', bg: 'bg-amber-500/8', border: 'border-amber-500/15' },
        ] as Array<{ label: string; value: string | number; color: string; bg: string; border: string }>).map(({ label, value, color, bg, border }) => (
          <div key={label} className="rounded-2xl border border-white/60 bg-[#eef2f7] p-4 shadow-[4px_4px_10px_#d1d9e6,_-4px_-4px_10px_#ffffff]">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2">{label}</p>
            <div className={`inline-flex px-2.5 py-1 rounded-xl text-[18px] font-black ${bg} border ${border}`} style={{ color }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2.5 flex-1 max-w-xs px-3.5 h-10 rounded-2xl border border-white/30 bg-[#eef2f7] shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff]">
          <Search size={14} className="text-slate-400 shrink-0" />
          <input
            className="flex-1 bg-transparent text-[13px] font-semibold text-slate-600 placeholder:text-slate-400 outline-none"
            placeholder="Buscar agente…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} className="text-slate-400 hover:text-[#FF6A00] transition">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Category pills (only in "all" mode) */}
        {isAll && (
          <div className="flex gap-2 flex-wrap">
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setFilterCategory(cat.slug)}
                className={`px-3.5 py-2 rounded-xl text-[11px] font-black transition-all duration-200 bg-[#eef2f7] ${
                  filterCategory === cat.slug
                    ? 'shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff] border border-orange-500/20 text-[#FF6A00]'
                    : 'text-slate-500 border border-white/60 shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Status pills */}
        <div className="flex gap-2">
          {(['Todos', 'Ativo', 'Inativo'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3.5 py-2 rounded-xl text-[11px] font-black transition-all duration-200 bg-[#eef2f7] ${
                filterStatus === s
                  ? 'shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff] border border-orange-500/20 text-[#FF6A00]'
                  : 'text-slate-500 border border-white/60 shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Agents grid ── */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <div className="col-span-2 py-16 text-center">
              <Brain size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-[14px] font-black text-slate-400">Nenhum agente encontrado.</p>
            </div>
          ) : (
            filtered.map(({ agent, entry }) => {
              const slug  = slugifyAgentTitle(agent.title);
              const color = isAll ? agentAccentColor(agent.category) : meta.accentColor;
              return (
                <AgentCard
                  key={agent.title}
                  agent={agent}
                  isActive={entry.isActive}
                  isActivating={activatingSlug === slug}
                  isDeactivating={deactivatingSlug === slug}
                  accentColor={color}
                  onActivate={() => activateAgent(agent.title, slug)}
                  onDeactivate={() => deactivateAgent(agent.title, slug)}
                  onDetails={() => setSelectedDetailsSlug(slug)}
                />
              );
            })
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Details modal ── */}
      <AnimatePresence>
        {detailsAgent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          >
            <button
              type="button"
              onClick={() => setSelectedDetailsSlug(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              aria-label="Fechar"
            />
            <motion.section
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-[780px] rounded-[24px] border border-white/80 bg-white/95 backdrop-blur-md p-6 md:p-7 shadow-[0_24px_60px_rgba(13,26,42,0.15)] text-[#1e293b]"
            >
              <button
                type="button"
                onClick={() => setSelectedDetailsSlug(null)}
                className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200 hover:scale-105 active:scale-95 shadow-sm transition-all"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-start gap-4 pr-14">
                <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-[16px] border border-white/55 bg-[#eef2f7] shadow-[4px_4px_8px_#d1d9e6,_-4px_-4px_8px_#ffffff]">
                  <Image src={detailsAgent.icon} alt={detailsAgent.title} fill className="object-cover" sizes="76px" />
                </div>
                <div>
                  <p className="pt-1 text-[11px] font-black uppercase tracking-[0.12em]" style={{ color: isAll ? agentAccentColor(detailsAgent.category) : meta.accentColor }}>
                    Agente de IA · {detailsAgent.category}
                  </p>
                  <h3 className="mt-1 text-[28px] font-black tracking-tight text-[#0f172a] leading-tight sm:text-[34px]">
                    {detailsAgent.title}
                  </h3>
                  <p className="mt-3 max-w-3xl text-[15px] leading-[1.5] text-slate-500 font-semibold">
                    {detailsAgent.description}
                  </p>
                </div>
              </div>

              <article className="mt-7 rounded-[18px] border border-slate-200 bg-slate-50 p-5 md:p-6">
                <h4
                  className="text-[13px] font-black uppercase tracking-[0.08em]"
                  style={{ color: isAll ? agentAccentColor(detailsAgent.category) : meta.accentColor }}
                >
                  Atividades relacionadas
                </h4>
                <ul className="mt-4 space-y-3 text-[15px] leading-[1.55] text-slate-600 font-medium">
                  {buildActivities(detailsAgent.longDescription).map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span
                        className="mt-[0.62em] inline-flex h-[7px] w-[7px] shrink-0 rounded-full"
                        style={{ background: isAll ? agentAccentColor(detailsAgent.category) : meta.accentColor }}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
