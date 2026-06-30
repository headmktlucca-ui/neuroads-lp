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

// ─── Category left-border colors (same palette as integrations) ───────────────

const CATEGORY_BORDER_COLOR: Record<string, string> = {
  Performance:   '#0891b2',
  Criativos:     '#FF6A00',
  Técnico:       '#7c3aed',
  Inteligência:  '#059669',
};

// ─── Agent card — identical visual logic to integrations catalog ──────────────

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
  const borderColor = CATEGORY_BORDER_COLOR[agent.category] ?? accentColor;
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);

  // ── Shared inner content ──
  const cardInner = (
    <>
      {/* Top: icon + category badge */}
      <div className="flex items-start justify-between gap-2">
        <div
          className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center border border-white/40 bg-[#eef2f7] shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] overflow-hidden p-1"
        >
          <Image src={agent.icon} alt={agent.title} width={36} height={36} className="h-full w-full rounded-lg object-cover" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/60 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] text-slate-500 shrink-0">
          {agent.category}
        </span>
      </div>

      {/* Middle: name + description */}
      <div className="flex-1">
        <h3 className="text-[14px] font-black text-[#0f172a] group-hover:text-[#FF6A00] transition-colors leading-tight">{agent.title}</h3>
        <p className="mt-1.5 text-[12px] text-slate-500 font-semibold leading-snug line-clamp-3">{agent.description}</p>
      </div>
    </>
  );

  // ── Status bar ──
  const isTransitioning = isActivating || isDeactivating;

  if (isActive) {
    // ── Active card: plain div, green gradient status bar ──
    return (
      <>
        {/* ── Deactivation confirmation modal ── */}
        {confirmDeactivate && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <button type="button" onClick={() => setConfirmDeactivate(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" aria-label="Cancelar" />
            <div className="relative w-full max-w-sm rounded-[24px] border border-white/80 bg-[#eef2f7] p-6 shadow-[10px_10px_30px_#c2cbd9,_-10px_-10px_30px_#ffffff] animate-in fade-in zoom-in-95 duration-200">
              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 mx-auto mb-4">
                <Image src={agent.icon} alt={agent.title} width={32} height={32} className="rounded-xl object-cover" />
              </div>
              <h3 className="text-[17px] font-black text-[#0f172a] text-center leading-snug mb-1">
                Desativar {agent.title}?
              </h3>
              <p className="text-[12px] text-slate-500 font-semibold text-center mb-6 leading-snug">
                O agente sera pausado e deixara de executar tarefas. Voce pode reativa-lo a qualquer momento.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDeactivate(false)}
                  className="flex-1 px-4 py-2.5 rounded-2xl text-[13px] font-black text-slate-600 border border-white/60 bg-[#eef2f7] shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => { setConfirmDeactivate(false); onDeactivate(); }}
                  className="flex-1 px-4 py-2.5 rounded-2xl text-[13px] font-black text-white bg-gradient-to-r from-rose-600 to-red-500 shadow-[0_4px_14px_rgba(239,68,68,0.35)] hover:shadow-[0_6px_20px_rgba(239,68,68,0.45)] hover:brightness-105 active:scale-[0.98] transition-all"
                >
                  {isDeactivating ? 'Desativando…' : 'Sim, desativar'}
                </button>
              </div>
            </div>
          </div>
        )}

        <motion.div
          layout
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="hub-neu-card group relative flex flex-col gap-4 p-5 shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] transition-all duration-300 overflow-hidden"
          style={{ borderLeft: `3px solid ${borderColor}` }}
        >
          {cardInner}

          {/* Green gradient status bar — full-width bleed */}
          <div className="mt-auto -mx-5 -mb-5 px-4 py-2.5 rounded-b-2xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-white/90" />
              <span className="text-[11px] font-black uppercase tracking-widest text-white">
                {isDeactivating ? 'Desativando…' : 'Ativo'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {/* Acessar — orange gradient */}
              <Link
                href={`/hub/agente/${slugifyAgentTitle(agent.title)}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black text-white transition-all hover:brightness-110 active:scale-[0.97]"
                style={{ background: 'linear-gradient(135deg, #FF4D00, #FF8805)', textDecoration: 'none', boxShadow: '0 2px 8px rgba(255,106,0,0.4)' }}
              >
                <ExternalLink size={10} />
                Acessar
              </Link>
              {/* Desativar — red gradient, opens confirm modal */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setConfirmDeactivate(true); }}
                disabled={isDeactivating}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black text-white transition-all hover:brightness-110 active:scale-[0.97] disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #be123c, #ef4444)', boxShadow: '0 2px 8px rgba(239,68,68,0.4)' }}
              >
                Desativar
              </button>
              {/* Info */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDetails(); }}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 border border-white/30 text-white transition-all"
                aria-label="Detalhes"
              >
                <Info size={12} />
              </button>
            </div>
          </div>
        </motion.div>
      </>
    );
  }

  // ── Inactive card: entire card is clickable ──
  return (
    <motion.button
      layout
      type="button"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onActivate}
      disabled={isTransitioning}
      className="hub-neu-card group relative flex flex-col gap-4 p-5 text-left w-full cursor-pointer shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[0_0_0_2px_rgba(255,106,0,0.18),_6px_6px_14px_#c2cbd9,_-6px_-6px_14px_#ffffff] hover:scale-[1.015] active:scale-[1.005] transition-all duration-200 overflow-hidden disabled:opacity-60 disabled:cursor-wait"
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      {cardInner}

      {/* Inactive CTA bar */}
      <div className="mt-auto pt-3 border-t border-slate-200">
        <div className="flex items-center gap-1.5 text-[#FF6A00] group-hover:text-[#ff8f3a] transition-colors">
          {isActivating ? (
            <>
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span className="text-[12px] font-bold">Ativando…</span>
            </>
          ) : (
            <>
              <Wrench className="w-3.5 h-3.5" />
              <span className="text-[12px] font-bold">Ativar Agente</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </div>
      </div>
    </motion.button>
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
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold tracking-wide transition-all bg-[#eef2f7] ${
                  filterCategory === cat.slug
                    ? 'shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] border border-white/20 text-[#FF6A00]'
                    : 'text-slate-600 border border-white/40 shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff]'
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
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold tracking-wide transition-all bg-[#eef2f7] ${
                filterStatus === s
                  ? 'shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] border border-white/20 text-[#FF6A00]'
                  : 'text-slate-600 border border-white/40 shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Agents grid — 4 cols at lg, same as integrations catalog ── */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <div className="col-span-4 py-16 text-center">
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
