'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, ChevronDown, ExternalLink,
  Search, Sparkles, Wrench, X,
} from 'lucide-react';
import { TEAM_AGENTS, TeamAgent } from '../../../data/team-agents';
import { agents as allSpecialties } from '../../../data/agents';
import { slugifyAgentTitle } from '../../../lib/hub-agents';
import { readAgentStatusOverrides } from '../../../lib/agent-status-cache';
import { useAuth } from '../../../context/AuthContext';

// ─── Specialty row — always active, Acessar always visible ───────────────────

function ActiveSpecialtyRow({
  specialty,
  agentCor,
}: {
  specialty: (typeof allSpecialties)[number];
  agentCor: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200"
      style={{
        background: hovered ? `${agentCor}10` : `${agentCor}06`,
        borderColor: hovered ? `${agentCor}35` : `${agentCor}18`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="w-8 h-8 shrink-0 rounded-xl overflow-hidden border border-white/40 bg-[#eef2f7] shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]">
        <Image src={specialty.icon} alt={specialty.title} width={32} height={32} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-black text-[#0f172a] leading-tight truncate">{specialty.title}</p>
        <p className="text-[11px] text-slate-500 font-semibold leading-snug line-clamp-1 mt-0.5">{specialty.description}</p>
      </div>
      {/* Acessar — always visible */}
      <Link
        href={`/hub/agente/${slugifyAgentTitle(specialty.title)}`}
        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black text-white transition-all duration-200 hover:brightness-110 hover:scale-[1.03] active:scale-[0.98]"
        style={{
          background: hovered
            ? `linear-gradient(135deg, ${agentCor}, ${agentCor}cc)`
            : 'linear-gradient(135deg, #FF4D00, #FF8805)',
          boxShadow: hovered ? `0 3px 12px ${agentCor}45` : '0 2px 8px rgba(255,106,0,0.3)',
          textDecoration: 'none',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <ExternalLink size={10} />
        Acessar
      </Link>
    </div>
  );
}

// ─── Operacional Agent card ───────────────────────────────────────────────────

function OperacionalCard({
  teamAgent,
  activeSpecialties,
}: {
  teamAgent: TeamAgent;
  activeSpecialties: (typeof allSpecialties);
}) {
  const [expanded, setExpanded] = useState(false);
  const [avatarHovered, setAvatarHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="hub-neu-card overflow-hidden shadow-[3px_3px_8px_#d1d9e6,_-3px_-3px_8px_#ffffff] hover:shadow-[5px_5px_12px_#d1d9e6,_-5px_-5px_12px_#ffffff] transition-all duration-300"
      style={{ borderLeft: `3px solid ${teamAgent.cor}` }}
    >
      {/* Header */}
      <div className="w-full flex items-start gap-4 p-5">

        {/* Avatar — hover reveals "Ver perfil" overlay */}
        <div
          className="relative shrink-0 rounded-2xl overflow-hidden border-2 border-white/80 cursor-pointer"
          style={{
            width: 88,
            height: 88,
            background: `${teamAgent.cor}18`,
            boxShadow: avatarHovered
              ? `0 0 0 3px ${teamAgent.cor}60, 4px 4px 12px #d1d9e6, -4px -4px 12px #ffffff`
              : `0 0 0 3px ${teamAgent.cor}30, 4px 4px 12px #d1d9e6, -4px -4px 12px #ffffff`,
            transition: 'box-shadow 0.2s ease',
          }}
          onMouseEnter={() => setAvatarHovered(true)}
          onMouseLeave={() => setAvatarHovered(false)}
        >
          <Image
            src={teamAgent.avatarSrc}
            alt={teamAgent.nome}
            width={88}
            height={88}
            className="w-full h-full object-cover"
          />
          {/* Hover overlay — Ver perfil */}
          <AnimatePresence>
            {avatarHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-1"
                style={{ background: `linear-gradient(160deg, ${teamAgent.cor}e0 0%, ${teamAgent.cor}b0 100%)`, backdropFilter: 'blur(2px)' }}
              >
                <Sparkles size={14} className="text-white/90" />
                <Link
                  href={`/hub/membro/${teamAgent.id}`}
                  className="text-[9px] font-black text-white uppercase tracking-wider text-center leading-tight px-1"
                  style={{ textDecoration: 'none' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  Ver perfil
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Identity */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[18px] font-black text-[#0f172a] tracking-tight">{teamAgent.nome}</span>
            <span
              className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border"
              style={{ color: teamAgent.cor, background: `${teamAgent.cor}15`, borderColor: `${teamAgent.cor}30` }}
            >
              {teamAgent.categoria}
            </span>
            {/* Online indicator */}
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-emerald-600">Online</span>
            </div>
          </div>
          <p className="text-[12px] font-semibold text-slate-500 mt-0.5">{teamAgent.funcao}</p>
          <p className="text-[11.5px] text-slate-400 font-medium italic mt-1.5 leading-snug">
            &ldquo;{teamAgent.tagline}&rdquo;
          </p>
          <p className="text-[11px] font-black text-emerald-600 mt-1.5">
            {activeSpecialties.length} especialidade{activeSpecialties.length !== 1 ? 's' : ''} ativa{activeSpecialties.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Chevron — right side toggle */}
        <button
          type="button"
          onClick={() => setExpanded(e => !e)}
          className="shrink-0 mt-1 w-7 h-7 rounded-xl flex items-center justify-center border border-white/60 bg-[#eef2f7] shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] transition-all"
        >
          <ChevronDown
            size={14}
            className={`text-slate-400 transition-transform duration-300 hover:text-[#FF6A00] ${expanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Personality pills */}
      <div className="flex gap-1.5 flex-wrap px-5 pb-3">
        {teamAgent.personalidade.split(' · ').map((trait) => (
          <span
            key={trait}
            className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/40 bg-[#eef2f7] shadow-[1px_1px_3px_#d1d9e6,_-1px_-1px_3px_#ffffff] text-slate-500"
          >
            {trait}
          </span>
        ))}
      </div>

      {/* Expanded: active specialties */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mx-5 mb-5 mt-1 space-y-2 border-t border-slate-200/60 pt-4">
              {activeSpecialties.map((specialty) => (
                <ActiveSpecialtyRow
                  key={specialty.title}
                  specialty={specialty}
                  agentCor={teamAgent.cor}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OperacionalPage() {
  const { user } = useAuth();
  const [statusOverrides, setStatusOverrides] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!user) { setStatusOverrides({}); return; }
    setStatusOverrides(readAgentStatusOverrides(user.uid));
  }, [user]);

  // Build agent+active-specialties pairs
  const agentsWithActive = useMemo(() => {
    return TEAM_AGENTS
      .map((ta) => {
        const active = allSpecialties.filter(
          (s) => ta.specialtyTitles.includes(s.title) && statusOverrides[s.title] === true
        );
        return { teamAgent: ta, activeSpecialties: active };
      })
      .filter(({ activeSpecialties }) => activeSpecialties.length > 0);
  }, [statusOverrides]);

  const filtered = useMemo(() => {
    if (!search) return agentsWithActive;
    const q = search.toLowerCase();
    return agentsWithActive.filter(({ teamAgent }) =>
      teamAgent.nome.toLowerCase().includes(q) ||
      teamAgent.funcao.toLowerCase().includes(q) ||
      teamAgent.categoria.toLowerCase().includes(q)
    );
  }, [agentsWithActive, search]);

  const totalActive = agentsWithActive.reduce((acc, { activeSpecialties }) => acc + activeSpecialties.length, 0);

  return (
    <div className="space-y-8 w-full px-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 py-8 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 mb-2 px-3 py-1 rounded-full border border-white/60 bg-[#eef2f7] shadow-[2px_2px_5px_#d1d9e6,_-2px_-2px_5px_#ffffff]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-600">Equipe Operacional</span>
          </div>
          <h1 className="text-[26px] font-black text-[#0f172a] tracking-tight">Operacional</h1>
          <p className="text-[13px] text-slate-500 font-semibold mt-1">
            {agentsWithActive.length === 0
              ? 'Nenhuma especialidade ativa. Ative especialidades no Laboratório de IA.'
              : `${agentsWithActive.length} Agente${agentsWithActive.length > 1 ? 's' : ''} com ${totalActive} especialidade${totalActive > 1 ? 's' : ''} ativa${totalActive > 1 ? 's' : ''}.`}
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
        {[
          { label: 'Agentes Ativos', value: agentsWithActive.length, color: '#059669' },
          { label: 'Especialidades', value: totalActive,             color: '#FF6A00' },
          { label: 'Online Agora',   value: agentsWithActive.length, color: '#2563eb' },
          { label: 'Disponíveis 24h', value: '∞',                   color: '#d97706' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border border-white/60 bg-[#eef2f7] p-4 shadow-[4px_4px_10px_#d1d9e6,_-4px_-4px_10px_#ffffff]">
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2">{label}</p>
            <div className="text-[22px] font-black" style={{ color }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="flex items-center gap-2.5 max-w-sm px-3.5 h-10 rounded-2xl border border-white/30 bg-[#eef2f7] shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff]">
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

      {/* ── Agents grid ── */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {agentsWithActive.length === 0 ? (
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
                  <p className="text-[16px] font-black text-[#0f172a]">Nenhum agente operacional</p>
                  <p className="text-[13px] text-slate-500 font-semibold mt-1 max-w-sm mx-auto">
                    Acesse o Laboratório de IA e ative as especialidades dos Agentes para vê-los aqui.
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
            <motion.div
              key="empty-filter"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-2 py-12 text-center"
            >
              <Brain size={28} className="mx-auto text-slate-300 mb-3" />
              <p className="text-[14px] font-black text-slate-400">Nenhum agente encontrado.</p>
              <button
                onClick={() => setSearch('')}
                className="mt-3 text-[12px] font-black text-[#FF6A00] hover:underline"
              >
                Limpar busca
              </button>
            </motion.div>
          ) : (
            filtered.map(({ teamAgent, activeSpecialties }) => (
              <OperacionalCard
                key={teamAgent.id}
                teamAgent={teamAgent}
                activeSpecialties={activeSpecialties}
              />
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
