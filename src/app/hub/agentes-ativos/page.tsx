'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, CheckCircle2, ChevronRight, Cpu, ExternalLink,
  Info, Power, Search, Sparkles, Wrench, X,
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { agents as allAgents } from '../../../data/agents';
import {
  getAgentEntryDefinition,
  getContractedAgentsFromProfile,
  slugifyAgentTitle,
} from '../../../lib/hub-agents';
import { readAgentStatusOverrides, writeAgentStatusOverrides } from '../../../lib/agent-status-cache';
import { useAuth } from '../../../context/AuthContext';
import { getFirebaseDb } from '../../../lib/firebase';

// ─── Accent color per category ───────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Performance:  '#0891b2',
  Criativos:    '#FF6A00',
  'Técnico':    '#7c3aed',
  'Inteligência': '#059669',
};
function accentFor(category: string) {
  return CATEGORY_COLORS[category] ?? '#FF6A00';
}

// ─── Category pills ───────────────────────────────────────────────────────────

const CATEGORY_FILTERS = ['Todos', 'Performance', 'Criativos', 'Técnico', 'Inteligência'];

// ─── Agent card ───────────────────────────────────────────────────────────────

function AgentCard({
  agent,
  isDeactivating,
  accentColor,
  onDeactivate,
  onDetails,
}: {
  agent: (typeof allAgents)[number];
  isDeactivating: boolean;
  accentColor: string;
  onDeactivate: () => void;
  onDetails: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
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
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full border bg-emerald-500/10 border-emerald-500/20 text-emerald-700">
              <CheckCircle2 size={9} />
              Ativo
            </span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
              style={{
                color: accentColor,
                background: `${accentColor}12`,
                borderColor: `${accentColor}30`,
              }}
            >
              {agent.category}
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
                <Power size={12} className="inline mr-1" />
                {isDeactivating ? 'Desativando…' : 'Desativar'}
              </button>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AgentesAtivosPage() {
  const { user, profile } = useAuth();
  const router = useRouter();

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

  const [deactivatingSlug, setDeactivatingSlug] = useState<string | null>(null);
  const [selectedDetailsSlug, setSelectedDetailsSlug] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todos');

  // Only active agents
  const activeAgents = useMemo(() =>
    allAgents
      .map((agent) => ({ agent, entry: getAgentEntryDefinition(agent, effectiveContracts) }))
      .filter(({ entry }) => entry.isActive),
    [effectiveContracts]
  );

  const filtered = useMemo(() =>
    activeAgents.filter(({ agent }) => {
      const matchSearch = !search ||
        agent.title.toLowerCase().includes(search.toLowerCase()) ||
        agent.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === 'Todos' || agent.category === filterCategory;
      return matchSearch && matchCat;
    }),
    [activeAgents, search, filterCategory]
  );

  // Category breakdown (only from active agents)
  const byCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    activeAgents.forEach(({ agent }) => {
      counts[agent.category] = (counts[agent.category] ?? 0) + 1;
    });
    return counts;
  }, [activeAgents]);

  const detailsAgent = selectedDetailsSlug
    ? activeAgents.find(({ agent }) => slugifyAgentTitle(agent.title) === selectedDetailsSlug)?.agent ?? null
    : null;

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

  const totalActive = activeAgents.length;

  return (
    <div className="space-y-8 w-full px-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 py-8 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full border border-white/60 bg-[#eef2f7] shadow-[2px_2px_5px_#d1d9e6,_-2px_-2px_5px_#ffffff]">
            <Cpu size={12} className="text-[#FF6A00]" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#FF6A00]">IA Agents</span>
          </div>
          <h1 className="text-[26px] font-black text-[#0f172a] tracking-tight">Agentes Ativos</h1>
          <p className="text-[13px] text-slate-500 font-semibold mt-1">
            {totalActive === 0
              ? 'Nenhum agente ativo. Ative agentes no Laboratório de IA.'
              : `${totalActive} agente${totalActive > 1 ? 's' : ''} em execução no seu Hub.`}
          </p>
        </div>
        <Link
          href="/hub/laboratorio-agentes"
          className="shrink-0 inline-flex h-10 items-center justify-center gap-2 px-5 rounded-xl text-[12px] font-black text-slate-600 border border-white/60 bg-[#eef2f7] shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] transition-all"
          style={{ textDecoration: 'none' }}
        >
          <Wrench size={13} />
          Laboratório
        </Link>
      </div>

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {([
          { label: 'Ativos',        value: totalActive,                color: '#059669', bg: 'bg-emerald-500/8',  border: 'border-emerald-500/15' },
          { label: 'Performance',   value: byCategory['Performance'] ?? 0,  color: '#0891b2', bg: 'bg-sky-500/8',    border: 'border-sky-500/15'     },
          { label: 'Criativos',     value: byCategory['Criativos'] ?? 0,    color: '#FF6A00', bg: 'bg-orange-500/8', border: 'border-orange-500/15'  },
          { label: 'Inteligência',  value: (byCategory['Inteligência'] ?? 0) + (byCategory['Técnico'] ?? 0), color: '#7c3aed', bg: 'bg-violet-500/8', border: 'border-violet-500/15' },
        ] as Array<{ label: string; value: number; color: string; bg: string; border: string }>).map(({ label, value, color, bg, border }) => (
          <div key={label} className="rounded-2xl border border-white/60 bg-[#eef2f7] p-4 shadow-[4px_4px_10px_#d1d9e6,_-4px_-4px_10px_#ffffff]">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2">{label}</p>
            <div className={`inline-flex px-2.5 py-1 rounded-xl text-[22px] font-black ${bg} border ${border}`} style={{ color }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
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

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORY_FILTERS.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-[11px] font-black transition-all duration-200 bg-[#eef2f7] ${
                filterCategory === cat
                  ? 'shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff] border border-orange-500/20 text-[#FF6A00]'
                  : 'text-slate-500 border border-white/60 shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Agents grid ── */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {totalActive === 0 ? (
            /* Empty state — no active agents at all */
            <motion.div
              key="empty-global"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-2"
            >
              <div className="hub-neu-card p-12 text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-orange-500/8 border border-orange-500/15 flex items-center justify-center">
                  <Brain size={28} className="text-[#FF6A00]" />
                </div>
                <div>
                  <p className="text-[16px] font-black text-[#0f172a]">Nenhum agente ativo</p>
                  <p className="text-[13px] text-slate-500 font-semibold mt-1 max-w-sm mx-auto">
                    Acesse o Laboratório de IA e ative os agentes que farão parte da sua operação.
                  </p>
                </div>
                <Link
                  href="/hub/laboratorio-agentes"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-black text-white shadow-[0_4px_12px_rgba(255,106,0,0.25)] hover:scale-[1.02] transition-all"
                  style={{ background: 'linear-gradient(135deg, #FF4D00, #FF8805)', textDecoration: 'none' }}
                >
                  <Wrench size={14} />
                  Ir para o Laboratório
                </Link>
              </div>
            </motion.div>
          ) : filtered.length === 0 ? (
            /* Empty state — no results for current filter */
            <motion.div
              key="empty-filter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-2 py-12 text-center"
            >
              <Brain size={28} className="mx-auto text-slate-300 mb-3" />
              <p className="text-[14px] font-black text-slate-400">Nenhum agente encontrado nesta categoria.</p>
              <button
                onClick={() => { setSearch(''); setFilterCategory('Todos'); }}
                className="mt-3 text-[12px] font-black text-[#FF6A00] hover:underline"
              >
                Limpar filtros
              </button>
            </motion.div>
          ) : (
            filtered.map(({ agent }) => {
              const slug  = slugifyAgentTitle(agent.title);
              const color = accentFor(agent.category);
              return (
                <AgentCard
                  key={agent.title}
                  agent={agent}
                  isDeactivating={deactivatingSlug === slug}
                  accentColor={color}
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
                  <p className="pt-1 text-[11px] font-black uppercase tracking-[0.12em]" style={{ color: accentFor(detailsAgent.category) }}>
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
              <div className="mt-6 flex gap-3">
                <Link
                  href={`/hub/agente/${slugifyAgentTitle(detailsAgent.title)}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[13px] font-black text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] hover:scale-[1.02] transition-all"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)', textDecoration: 'none' }}
                >
                  <ExternalLink size={14} />
                  Acessar Agente
                </Link>
                <button
                  onClick={() => {
                    setSelectedDetailsSlug(null);
                    const slug = slugifyAgentTitle(detailsAgent.title);
                    deactivateAgent(detailsAgent.title, slug);
                  }}
                  className="px-5 py-3 rounded-xl text-[13px] font-black text-rose-600 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-all"
                >
                  <Power size={14} className="inline mr-1" />
                  Desativar
                </button>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
