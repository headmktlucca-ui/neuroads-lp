'use client';

/**
 * Automações — exibe apenas as automações ativas do usuário logado.
 * Dados reais lidos do perfil Firebase (campo automations / workflows).
 * Se nenhuma automação estiver ativa, exibe empty state com CTA.
 */

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, ArrowRight, Brain, CheckCircle2, ChevronRight,
  Clock, Cpu, ExternalLink, Power, Search, Sparkles, X, Zap,
} from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import { getFirebaseDb } from '../../../lib/firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  frequency: string;
  category: string;
  runsTotal: number;
  lastRunAt: string | null;
  createdAt: string;
  isActive: boolean;
}

// ─── Category accent colors ───────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Performance:    '#0891b2',
  Criativos:      '#FF6A00',
  'Técnico':      '#7c3aed',
  'Inteligência': '#059669',
  Leads:          '#d97706',
  Relatórios:     '#6366f1',
};
function accentFor(category: string) {
  return CATEGORY_COLORS[category] ?? '#FF6A00';
}

const CATEGORY_FILTERS = ['Todos', 'Performance', 'Criativos', 'Técnico', 'Inteligência', 'Leads', 'Relatórios'];

// ─── Automation card ──────────────────────────────────────────────────────────

function AutomationCard({
  automation,
}: {
  automation: Automation;
}) {
  const [expanded, setExpanded] = useState(false);
  const color = accentFor(automation.category);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="hub-neu-card p-5 shadow-[4px_4px_10px_#d1d9e6,_-4px_-4px_10px_#ffffff] hover:shadow-[6px_6px_14px_#d1d9e6,_-6px_-6px_14px_#ffffff] transition-all duration-300 cursor-pointer group"
      style={{ borderLeftColor: color }}
      onClick={() => setExpanded((e) => !e)}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border border-white/50 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06),_inset_-2px_-2px_4px_#ffffff]"
          style={{ background: `${color}18` }}
        >
          <Zap size={20} style={{ color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[14px] font-black text-[#0f172a] truncate">{automation.name}</h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-full border bg-emerald-500/10 border-emerald-500/20 text-emerald-700">
              <CheckCircle2 size={9} />
              Ativa
            </span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
              style={{ color, background: `${color}12`, borderColor: `${color}30` }}
            >
              {automation.category}
            </span>
          </div>
          <p className="text-[11.5px] text-slate-500 font-semibold mt-0.5 leading-snug line-clamp-2">
            {automation.description}
          </p>
        </div>

        <ChevronRight
          size={15}
          className={`text-slate-400 shrink-0 transition-transform duration-300 ${expanded ? 'rotate-90' : ''} group-hover:text-[#FF6A00]`}
        />
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-400 font-semibold">
        <span className="flex items-center gap-1">
          <Clock size={10} />
          {automation.lastRunAt ?? 'Ainda não executada'}
        </span>
        <span className="flex items-center gap-1">
          <Activity size={10} />
          {automation.frequency}
        </span>
        {automation.runsTotal > 0 && (
          <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-500/8 border border-orange-500/15">
            <Sparkles size={9} className="text-[#FF6A00]" />
            <span className="text-[10px] font-black text-[#FF6A00]">{automation.runsTotal} execuções</span>
          </span>
        )}
      </div>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-2">
              <p className="text-[11px] text-slate-400 font-semibold">
                <span className="font-black text-slate-600">Gatilho:</span> {automation.trigger}
              </p>
              <p className="text-[11px] text-slate-400 font-semibold">
                <span className="font-black text-slate-600">Criada em:</span> {automation.createdAt}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HubAutomacoesPage() {
  const { user } = useAuth();

  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todos');

  // Realtime listener from Firestore automations sub-collection
  useEffect(() => {
    if (!user) {
      setAutomations([]);
      setLoading(false);
      return;
    }
    try {
      const db = getFirebaseDb();
      const q = query(
        collection(db, 'users', user.uid, 'automations'),
        where('isActive', '==', true)
      );
      const unsub = onSnapshot(
        q,
        (snap) => {
          const docs: Automation[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Automation, 'id'>) }));
          setAutomations(docs);
          setLoading(false);
        },
        () => {
          // If collection doesn't exist yet, just show empty
          setAutomations([]);
          setLoading(false);
        }
      );
      return () => unsub();
    } catch {
      setAutomations([]);
      setLoading(false);
    }
  }, [user]);

  const filtered = useMemo(() =>
    automations.filter((a) => {
      const matchSearch = !search ||
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.description?.toLowerCase().includes(search.toLowerCase());
      const matchCat = filterCategory === 'Todos' || a.category === filterCategory;
      return matchSearch && matchCat;
    }),
    [automations, search, filterCategory]
  );

  // Category breakdown
  const byCategory = useMemo(() => {
    const counts: Record<string, number> = {};
    automations.forEach((a) => { counts[a.category] = (counts[a.category] ?? 0) + 1; });
    return counts;
  }, [automations]);

  const totalActive = automations.length;
  const topCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  return (
    <div className="space-y-8 w-full px-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 py-8 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full border border-white/60 bg-[#eef2f7] shadow-[2px_2px_5px_#d1d9e6,_-2px_-2px_5px_#ffffff]">
            <Cpu size={12} className="text-[#FF6A00]" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#FF6A00]">Automações</span>
          </div>
          <h1 className="text-[26px] font-black text-[#0f172a] tracking-tight">Fluxos Inteligentes</h1>
          <p className="text-[13px] text-slate-500 font-semibold mt-1 max-w-xl">
            {loading
              ? 'Carregando automações…'
              : totalActive === 0
              ? 'Nenhuma automação ativa. Crie fluxos para automatizar sua operação.'
              : `${totalActive} automação${totalActive > 1 ? 'ões' : ''} ativa${totalActive > 1 ? 's' : ''} trabalhando na sua operação.`}
          </p>
        </div>
      </div>

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {([
          { label: 'Ativas',          value: loading ? '…' : String(totalActive),  color: '#059669', bg: 'bg-emerald-500/8',  border: 'border-emerald-500/15' },
          { label: 'Performance',     value: loading ? '…' : String(byCategory['Performance'] ?? 0),   color: '#0891b2', bg: 'bg-sky-500/8',    border: 'border-sky-500/15'     },
          { label: 'Criativos',       value: loading ? '…' : String(byCategory['Criativos'] ?? 0),     color: '#FF6A00', bg: 'bg-orange-500/8', border: 'border-orange-500/15'  },
          { label: 'Top categoria',   value: loading ? '…' : topCategory,           color: '#7c3aed', bg: 'bg-violet-500/8', border: 'border-violet-500/15'  },
        ] as Array<{ label: string; value: string; color: string; bg: string; border: string }>).map(({ label, value, color, bg, border }) => (
          <div key={label} className="rounded-2xl border border-white/60 bg-[#eef2f7] p-4 shadow-[4px_4px_10px_#d1d9e6,_-4px_-4px_10px_#ffffff]">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2">{label}</p>
            <div className={`inline-flex px-2.5 py-1 rounded-xl text-[16px] font-black ${bg} border ${border} max-w-full truncate`} style={{ color }}>
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
            placeholder="Buscar automação…"
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

      {/* ── Grid / Empty state ── */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="inline-block w-8 h-8 rounded-full border-2 border-[#FF6A00] border-t-transparent animate-spin" />
          <p className="text-[13px] font-black text-slate-400 mt-3">Carregando automações…</p>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {totalActive === 0 ? (
              /* No active automations at all */
              <motion.div
                key="empty-global"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-2"
              >
                <div className="hub-neu-card p-12 text-center flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-orange-500/8 border border-orange-500/15 flex items-center justify-center">
                    <Zap size={28} className="text-[#FF6A00]" />
                  </div>
                  <div>
                    <p className="text-[16px] font-black text-[#0f172a]">Nenhuma automação ativa</p>
                    <p className="text-[13px] text-slate-500 font-semibold mt-1 max-w-sm mx-auto">
                      Crie fluxos inteligentes para automatizar tarefas repetitivas da sua operação de marketing.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link
                      href="/hub/laboratorio-agentes"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-black text-white shadow-[0_4px_12px_rgba(255,106,0,0.25)] hover:scale-[1.02] transition-all"
                      style={{ background: 'linear-gradient(135deg, #FF4D00, #FF8805)', textDecoration: 'none' }}
                    >
                      <Brain size={14} />
                      Ativar Agentes
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : filtered.length === 0 ? (
              /* No results for current filter */
              <motion.div
                key="empty-filter"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-2 py-12 text-center"
              >
                <Zap size={28} className="mx-auto text-slate-300 mb-3" />
                <p className="text-[14px] font-black text-slate-400">Nenhuma automação encontrada.</p>
                <button
                  onClick={() => { setSearch(''); setFilterCategory('Todos'); }}
                  className="mt-3 text-[12px] font-black text-[#FF6A00] hover:underline"
                >
                  Limpar filtros
                </button>
              </motion.div>
            ) : (
              filtered.map((automation) => (
                <AutomationCard key={automation.id} automation={automation} />
              ))
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
