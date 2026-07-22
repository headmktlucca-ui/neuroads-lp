'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ExternalLink, Lock,
  Search, Sparkles, Users, X, Wrench, Activity, Zap, ChevronRight
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { TEAM_AGENTS, TeamAgent } from '../../data/team-agents';
import { agents as allSpecialties } from '../../data/agents';
import { readAgentStatusOverrides, writeAgentStatusOverrides } from '../../lib/agent-status-cache';
import { useAuth } from '../../context/AuthContext';
import { getFirebaseDb } from '../../lib/firebase';
import {
  IconUsers3D,
  IconActivity3D,
  IconZap3D,
  IconSparklesPurple3D,
  IconBrain3D,
} from './HubUiIcons3D';

// ─── Reusable KPI Icon Wrapper ──────────────────────────────────────────────

function KpiIconWrapper({
  children,
  fromColor,
  toColor,
  shadowColor
}: {
  children: React.ReactNode;
  fromColor: string;
  toColor: string;
  shadowColor: string;
}) {
  return (
    <div 
      className="w-[76px] h-[76px] rounded-full flex items-center justify-center text-white relative shrink-0"
      style={{
        background: `linear-gradient(135deg, ${fromColor}, ${toColor})`,
        boxShadow: `0 5px 10px ${shadowColor}`,
      }}
    >
      <div className="absolute top-[4px] left-[12px] w-[18px] h-[10px] bg-white/30 rounded-full"></div>
      <div className="absolute inset-[7px] rounded-full border border-white/15"></div>
      <div className="relative z-10 shrink-0">
        {children}
      </div>
    </div>
  );
}

// ─── Specialty row — activation states and access action ───────────────────

function SpecialtyRow({
  specialty,
  agentId,
  agentCor,
}: {
  specialty: (typeof allSpecialties)[number];
  agentId: string;
  agentCor: string;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-2xl border transition-all duration-200"
      style={{
        background: hovered ? `${agentCor}08` : 'rgba(238,242,247,0.6)',
        borderColor: hovered ? `${agentCor}30` : 'rgba(255,255,255,0.6)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon */}
      <div className="w-16 h-16 shrink-0 rounded-2xl overflow-hidden border border-white/40 bg-[#eef2f7] shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff] mt-0.5">
        <Image src={specialty.icon} alt={specialty.title} width={64} height={64} className="w-full h-full object-cover" />
      </div>

      {/* Content wrapper */}
      <div className="flex-1 min-w-0">
        {/* Line 1: Name */}
        <p className="text-[13px] font-black text-[#0f172a] leading-tight truncate">{specialty.title}</p>
        {/* Line 2: Desc */}
        <p className="text-[11px] text-slate-500 font-semibold leading-snug line-clamp-2 mt-0.5">{specialty.description}</p>
      </div>
    </div>
  );
}

// ─── Coming-soon specialty row ────────────────────────────────────────────────

function ComingSoonRow({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-2xl border border-white/40 bg-[#eef2f7]/40 opacity-60">
      <div className="w-16 h-16 shrink-0 rounded-2xl border border-slate-300/40 bg-slate-200/60 flex items-center justify-center mt-0.5">
        <Lock size={26} className="text-slate-400" />
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
  const [expanded, setExpanded] = useState(false);
  const [avatarHovered, setAvatarHovered] = useState(false);
  const hasSpecialties = specialtiesForAgent.length > 0 || teamAgent.comingSoonSpecialties.length > 0;
  const activeCount = specialtiesForAgent.length;
  const totalSpecialties = specialtiesForAgent.length + teamAgent.comingSoonSpecialties.length;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="hub-neu-card overflow-hidden shadow-[3px_3px_8px_#d1d9e6,_-3px_-3px_8px_#ffffff] transition-all duration-300"
      style={{ borderLeft: `3px solid ${teamAgent.cor}`, background: '#ffffff' }}
    >
      {/* ── Card header (always visible) ── */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        onClick={() => setExpanded(e => !e)}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setExpanded(prev => !prev);
          }
        }}
        className="w-full flex items-start gap-4 p-5 text-left group cursor-pointer"
      >
        {/* Avatar image — 192×192 with hover overlay */}
        <Link
          href={`/hub/assistente-ia?agent=${teamAgent.id}`}
          className="relative shrink-0 rounded-2xl overflow-hidden border-2 border-white/80 cursor-pointer block w-20 h-20 sm:w-48 sm:h-48"
          style={{
            background: `${teamAgent.cor}18`,
            boxShadow: avatarHovered
              ? `0 0 0 4px ${teamAgent.cor}55, 4px 4px 14px #d1d9e6, -4px -4px 14px #ffffff`
              : `0 0 0 3px ${teamAgent.cor}30, 4px 4px 12px #d1d9e6, -4px -4px 12px #ffffff`,
            transition: 'box-shadow 0.2s ease',
            textDecoration: 'none',
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
                <span
                  className="text-[10px] font-black text-white uppercase tracking-wider text-center leading-tight px-2"
                >
                  Ver perfil
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

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

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/hub/assistente-ia?agent=${teamAgent.id}`}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-[11px] font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_2px_8px_rgba(255,106,0,0.2)]"
              style={{ background: 'linear-gradient(135deg, #FF4D00, #FF8805)', textDecoration: 'none' }}
              onClick={(e) => e.stopPropagation()}
            >
              Conversar com Agente
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(prev => !prev);
              }}
              className="inline-flex shrink-0 items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-black transition-all border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 shadow-sm whitespace-nowrap"
            >
              <span className="whitespace-nowrap">Lista de Operações</span>
              <ChevronDown
                size={12}
                className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Right: stats + chevron */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          {hasSpecialties && (
            <span className="text-[10px] font-black text-slate-400">
              {activeCount}/{totalSpecialties} Operações
            </span>
          )}
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-300 group-hover:text-[#FF6A00] ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
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
                  agentId={teamAgent.id}
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

  const totalActive = useMemo(() => {
    return TEAM_AGENTS.reduce((acc, a) => {
      return acc + a.specialtyTitles.length;
    }, 0);
  }, []);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-8 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            <span>Operação</span>
            <ChevronRight size={12} />
            <span className="text-[#FF6A00]">Agentes IA</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <IconBrain3D size={32} />
            Agentes IA
          </h1>
          <p className="text-sm font-semibold text-slate-500 mt-1 leading-relaxed">
            Seu time de IA que assume o Marketing &amp; Vendas da operação. Cada Agente tem identidade própria e operações disponíveis 24h.
          </p>
          <p className="text-[12px] font-black mt-1.5 text-[#FF6A00]">
            10 Agentes · {totalActive} Operações Ativas · Online 24h
          </p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { 
            label: 'Agentes da Equipe', 
            value: '10', 
            icon: <IconUsers3D size={54} />
          },
          { 
            label: 'Operações Ativas', 
            value: `${totalActive}`, 
            icon: <IconActivity3D size={54} />
          },
          { 
            label: 'Online Agora', 
            value: '10', 
            icon: <IconZap3D size={54} />
          },
          { 
            label: 'SLA de Execução', 
            value: '100%', 
            icon: <IconSparklesPurple3D size={54} />
          },
        ].map(({ label, value, icon }) => (
          <div key={label} className="rounded-2xl border border-white/60 bg-white p-5 shadow-[4px_4px_10px_#d1d9e6,_-4px_-4px_10px_#ffffff] flex items-center justify-between hover:shadow-[6px_6px_14px_#c2cbd9,_-6px_-6px_14px_#ffffff] transition-all">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1">{label}</p>
              <div className="text-[22px] font-black text-slate-800 tracking-tight">{value}</div>
            </div>
            <div className="shrink-0 transition-transform duration-300 hover:scale-110">{icon}</div>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="flex items-center gap-2.5 max-w-sm px-3.5 h-10 rounded-2xl border border-white/30 bg-[#eef2f7] shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff]">
        <Search size={14} className="text-slate-400 shrink-0" />
        <input
          className="flex-1 bg-transparent text-[13px] font-semibold text-slate-600 placeholder:text-slate-400 outline-none"
          placeholder="Buscar agente ou operação…"
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
      <motion.div layout className="columns-1 md:columns-2 lg:columns-3 gap-5">
        <AnimatePresence>
          {filteredTeam.map((ta) => {
            const specialtiesForAgent = allSpecialties.filter((s) =>
              ta.specialtyTitles.includes(s.title)
            );
            return (
              <div key={ta.id} className="mb-5 break-inside-avoid">
                <TeamAgentCard
                  teamAgent={ta}
                  specialtiesForAgent={specialtiesForAgent}
                />
              </div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
