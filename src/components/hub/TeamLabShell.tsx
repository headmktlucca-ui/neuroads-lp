'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ExternalLink, Lock,
  Search, Sparkles, Users, X,
} from 'lucide-react';
import { TEAM_AGENTS, TeamAgent } from '../../data/team-agents';
import { agents as allSpecialties } from '../../data/agents';
import { slugifyAgentTitle } from '../../lib/hub-agents';


// ─── Specialty row — all available, hover reveals "Entrar" ───────────────────

function SpecialtyRow({
  specialty,
  agentCor,
}: {
  specialty: (typeof allSpecialties)[number];
  agentCor: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-200 cursor-pointer"
      style={{
        background: hovered ? `${agentCor}08` : 'rgba(238,242,247,0.6)',
        borderColor: hovered ? `${agentCor}30` : 'rgba(255,255,255,0.6)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon */}
      <div className="w-8 h-8 shrink-0 rounded-xl overflow-hidden border border-white/40 bg-[#eef2f7] shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]">
        <Image src={specialty.icon} alt={specialty.title} width={32} height={32} className="w-full h-full object-cover" />
      </div>

      {/* Name + desc */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-black text-[#0f172a] leading-tight truncate">{specialty.title}</p>
        <p className="text-[11px] text-slate-500 font-semibold leading-snug line-clamp-1 mt-0.5">{specialty.description}</p>
      </div>

      {/* Hover action — Entrar */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
          >
            <Link
              href={`/hub/agente/${slugifyAgentTitle(specialty.title)}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-black text-white transition-all hover:brightness-110"
              style={{ background: `linear-gradient(135deg, ${agentCor}, ${agentCor}cc)`, textDecoration: 'none', boxShadow: `0 2px 8px ${agentCor}40` }}
            >
              <ExternalLink size={10} />
              Entrar
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Coming-soon specialty row ────────────────────────────────────────────────

function ComingSoonRow({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/40 bg-[#eef2f7]/40 opacity-60">
      <div className="w-8 h-8 shrink-0 rounded-xl border border-slate-300/40 bg-slate-200/60 flex items-center justify-center">
        <Lock size={13} className="text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-black text-slate-400 leading-tight truncate">{title}</p>
        <p className="text-[11px] text-slate-400 font-semibold leading-snug line-clamp-1 mt-0.5">{description}</p>
      </div>
      <span className="shrink-0 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-slate-300/40 bg-slate-200/60 text-slate-400">
        Em breve
      </span>
    </div>
  );
}

// ─── Agent team card ──────────────────────────────────────────────────────────

function TeamAgentCard({
  teamAgent,
  specialtiesForAgent,
}: {
  teamAgent: TeamAgent;
  specialtiesForAgent: (typeof allSpecialties);
}) {
  const [expanded, setExpanded] = useState(true);
  const [avatarHovered, setAvatarHovered] = useState(false);
  const hasSpecialties = specialtiesForAgent.length > 0 || teamAgent.comingSoonSpecialties.length > 0;
  const totalSpecialties = specialtiesForAgent.length + teamAgent.comingSoonSpecialties.length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="hub-neu-card overflow-hidden shadow-[3px_3px_8px_#d1d9e6,_-3px_-3px_8px_#ffffff] transition-all duration-300"
      style={{ borderLeft: `3px solid ${teamAgent.cor}` }}
    >
      {/* ── Card header (always visible) ── */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-start gap-4 p-5 text-left group"
      >
        {/* Avatar image — 192×192 with hover overlay */}
        <div
          className="relative shrink-0 rounded-2xl overflow-hidden border-2 border-white/80 cursor-pointer"
          style={{
            width: 192,
            height: 192,
            background: `${teamAgent.cor}18`,
            boxShadow: avatarHovered
              ? `0 0 0 4px ${teamAgent.cor}55, 4px 4px 14px #d1d9e6, -4px -4px 14px #ffffff`
              : `0 0 0 3px ${teamAgent.cor}30, 4px 4px 12px #d1d9e6, -4px -4px 12px #ffffff`,
            transition: 'box-shadow 0.2s ease',
          }}
          onMouseEnter={() => setAvatarHovered(true)}
          onMouseLeave={() => setAvatarHovered(false)}
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            src={teamAgent.avatarSrc}
            alt={teamAgent.nome}
            width={192}
            height={192}
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
                className="absolute inset-0 flex flex-col items-center justify-center gap-1.5"
                style={{ background: `linear-gradient(160deg, ${teamAgent.cor}e0 0%, ${teamAgent.cor}b5 100%)`, backdropFilter: 'blur(2px)' }}
              >
                <Sparkles size={16} className="text-white/90" />
                <Link
                  href={`/hub/membro/${teamAgent.id}`}
                  className="text-[10px] font-black text-white uppercase tracking-wider text-center leading-tight px-2"
                  style={{ textDecoration: 'none' }}
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
          </div>
          <p className="text-[12px] font-semibold text-slate-500 mt-0.5">{teamAgent.funcao}</p>
          <p className="text-[11.5px] text-slate-400 font-medium italic mt-1.5 leading-snug">
            &ldquo;{teamAgent.tagline}&rdquo;
          </p>
        </div>

        {/* Right: stats + chevron */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          {hasSpecialties && (
            <span className="text-[10px] font-black text-slate-400">
              {totalSpecialties} especialidades
            </span>
          )}
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-300 group-hover:text-[#FF6A00] ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

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

      {/* ── Expanded: specialties panel ── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mx-5 mb-5 mt-1 space-y-2 border-t border-slate-200/60 pt-4">
              {/* Live specialties */}
              {specialtiesForAgent.map((specialty) => (
                <SpecialtyRow
                  key={specialty.title}
                  specialty={specialty}
                  agentCor={teamAgent.cor}
                />
              ))}

              {/* Coming soon */}
              {teamAgent.comingSoonSpecialties.map((cs) => (
                <ComingSoonRow key={cs.title} title={cs.title} description={cs.description} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main: TeamLabShell ───────────────────────────────────────────────────────

export default function TeamLabShell() {
  const [search, setSearch] = useState('');

  const totalSpecialties = allSpecialties.length;

  // Filtered team agents
  const filteredTeam = useMemo(() => {
    if (!search) return TEAM_AGENTS;
    const q = search.toLowerCase();
    return TEAM_AGENTS.filter(
      (ta) =>
        ta.nome.toLowerCase().includes(q) ||
        ta.funcao.toLowerCase().includes(q) ||
        ta.categoria.toLowerCase().includes(q) ||
        ta.specialtyTitles.some((s) => s.toLowerCase().includes(q))
    );
  }, [search]);

  return (
    <div className="space-y-8 w-full px-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Header ── */}
      <div className="py-8 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full border border-white/60 bg-[#eef2f7] shadow-[2px_2px_5px_#d1d9e6,_-2px_-2px_5px_#ffffff]">
          <Users size={11} className="text-[#FF6A00]" />
          <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#FF6A00]">
            Equipe IA · NeuroAds
          </span>
        </div>
        <h1 className="text-[26px] font-black text-[#0f172a] tracking-tight">Laboratório de Agentes</h1>
        <p className="text-[13px] text-slate-500 font-semibold mt-1 max-w-2xl">
          Seu time de IA que assume o Marketing &amp; Vendas da operação. Cada Agente tem identidade própria e especialidades disponíveis 24h.
        </p>
        <p className="text-[12px] font-black mt-1.5 text-[#FF6A00]">
          10 Agentes · {totalSpecialties} especialidades disponíveis · Online 24h
        </p>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Agentes da Equipe', value: '10',          color: '#FF6A00' },
          { label: 'Especialidades', value: totalSpecialties, color: '#2563eb' },
          { label: 'Online Agora', value: '10',              color: '#059669' },
          { label: 'Em Breve', value: TEAM_AGENTS.reduce((acc, a) => acc + a.comingSoonSpecialties.length, 0), color: '#d97706' },
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
          placeholder="Buscar agente ou especialidade…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} className="text-slate-400 hover:text-[#FF6A00] transition">
            <X size={13} />
          </button>
        )}
      </div>

      {/* ── Team grid ── */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredTeam.map((ta) => {
            const specialtiesForAgent = allSpecialties.filter((s) =>
              ta.specialtyTitles.includes(s.title)
            );
            return (
              <TeamAgentCard
                key={ta.id}
                teamAgent={ta}
                specialtiesForAgent={specialtiesForAgent}
              />
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
