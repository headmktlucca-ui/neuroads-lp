'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { ExternalLink, Lock, Sparkles, Users, Wrench, Activity, ChevronDown, CheckCircle2, X } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { TEAM_AGENTS, TeamAgent } from '../../data/team-agents';
import { agents as allSpecialties } from '../../data/agents';
import { slugifyAgentTitle } from '../../lib/hub-agents';
import { readAgentStatusOverrides, writeAgentStatusOverrides } from '../../lib/agent-status-cache';
import { useAuth } from '../../context/AuthContext';
import { getFirebaseDb } from '../../lib/firebase';

// ─── Funil stage metadata ────────────────────────────────────────────────────

export type FunilStage = 'atracao' | 'engajamento' | 'conversao' | 'retencao';

const STAGE_META: Record<FunilStage, {
  label: string;
  tagline: string;
  description: string;
  cor: string;
  emoji: string;
  agentIds: string[];
}> = {
  atracao: {
    label: 'Atração',
    tagline: 'Gere demanda qualificada antes de qualquer conversa.',
    description: 'Agentes responsáveis por gerar visibilidade, atrair tráfego qualificado e posicionar a marca nos canais certos — via mídia paga, SEO, conteúdo e presença orgânica.',
    cor: '#FACC15',
    emoji: '🎯',
    agentIds: ['paola', 'igor', 'lais'],
  },
  engajamento: {
    label: 'Engajamento',
    tagline: 'Desperte interesse e construa relacionamento com os leads.',
    description: 'Agentes que nutrem leads, criam conteúdo relevante e mantêm a marca presente até o lead estar pronto para a conversa de vendas.',
    cor: '#FB923C',
    emoji: '💬',
    agentIds: ['lais', 'taina', 'igor'],
  },
  conversao: {
    label: 'Conversão',
    tagline: 'Transforme interesse em receita de forma autônoma.',
    description: 'Agentes que qualificam, abordam e fecham negócios — do primeiro contato ao contrato assinado, sem dependência de equipe humana para cada etapa.',
    cor: '#34D399',
    emoji: '⚡',
    agentIds: ['vitor', 'breno', 'heitor'],
  },
  retencao: {
    label: 'Retenção',
    tagline: 'Maximize o valor de cada cliente já conquistado.',
    description: 'Agentes que garantem a satisfação, o suporte rápido, o upsell no momento certo e a reativação de quem ficou inativo — protegendo e expandindo a receita recorrente.',
    cor: '#22D3EE',
    emoji: '🔁',
    agentIds: ['manu', 'raissa', 'ulisses'],
  },
};

// ─── Specialty row with hover action and descriptions ────────────────────────

function SpecialtyRow({
  specialty,
  agentCor,
  isActive,
  isActivating,
  isDeactivating,
  onActivate,
  onDeactivate,
}: {
  specialty: typeof allSpecialties[number];
  agentCor: string;
  isActive: boolean;
  isActivating: boolean;
  isDeactivating: boolean;
  onActivate: () => void;
  onDeactivate: () => void;
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
        
        {/* Line 3: Buttons in a row */}
        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          {isActive ? (
            <>
              {/* Ativo Badge */}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <CheckCircle2 size={10} /> Ativo
              </span>

              {/* Acessar Operação */}
              <Link
                href={`/hub/agente/${slugifyAgentTitle(specialty.title)}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black text-white hover:brightness-110 transition-all"
                style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4)', textDecoration: 'none', boxShadow: '0 2px 6px rgba(37,99,235,0.3)' }}
              >
                <ExternalLink size={10} /> Acessar Operação
              </Link>

              {/* Desativar */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDeactivate(); }}
                disabled={isDeactivating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-600 border border-white/60 bg-[#eef2f7] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all active:scale-95 cursor-pointer"
              >
                {isDeactivating ? <Activity size={10} className="animate-pulse" /> : <X size={10} />}
                Desativar
              </button>
            </>
          ) : (
            <>
              {/* Ativar */}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onActivate(); }}
                disabled={isActivating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black text-white hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #FF4D00, #FF8805)', boxShadow: '0 2px 6px rgba(255,106,0,0.2)' }}
              >
                {isActivating ? <Activity size={10} className="animate-pulse" /> : <Wrench size={10} />}
                Ativar
              </button>

              {/* Acessar Operação (Disabled style) */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-400 border border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed">
                <ExternalLink size={10} /> Acessar Operação
              </span>

              {/* Desativar (Disabled style) */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-400 border border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed">
                <X size={10} /> Desativar
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Coming-soon specialty row with lock icon ───────────────────────────────

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

// ─── Agent operation card ────────────────────────────────────────────────────

function AgentOperationCard({
  teamAgent,
  statusOverrides,
  activatingTitle,
  deactivatingTitle,
  onActivate,
  onDeactivate,
}: {
  teamAgent: TeamAgent;
  statusOverrides: Record<string, boolean>;
  activatingTitle: string | null;
  deactivatingTitle: string | null;
  onActivate: (title: string) => void;
  onDeactivate: (title: string) => void;
}) {
  const specialties = allSpecialties.filter((s) => teamAgent.specialtyTitles.includes(s.title));
  const comingSoon = teamAgent.comingSoonSpecialties;
  const activeCount = specialties.filter((s) => statusOverrides[s.title] === true).length;
  const totalCount = specialties.length + comingSoon.length;
  const [expanded, setExpanded] = useState(true);
  const [avatarHovered, setAvatarHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="hub-neu-card overflow-hidden shadow-[3px_3px_8px_#d1d9e6,_-3px_-3px_8px_#ffffff] transition-all duration-300"
      style={{ borderLeft: `3px solid ${teamAgent.cor}` }}
    >
      {/* ── Card header (clickable to expand/collapse) ── */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-start gap-4 p-5 text-left group"
      >
        {/* Avatar image — 192×192 with hover overlay */}
        <Link
          href={`/hub/membro/${teamAgent.id}`}
          className="relative shrink-0 rounded-2xl overflow-hidden border-2 border-white/80 cursor-pointer block"
          style={{
            width: 192,
            height: 192,
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

          <div className="mt-3.5 flex flex-col items-start gap-2.5">
            <Link
              href={`/hub/assistente-ia?agent=${teamAgent.id}`}
              className="inline-flex items-center justify-center px-4 py-1.5 rounded-xl text-[11px] font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_2px_8px_rgba(255,106,0,0.25)]"
              style={{ background: 'linear-gradient(135deg, #FF4D00, #FF8805)', textDecoration: 'none' }}
              onClick={(e) => e.stopPropagation()}
            >
              Enviar Mensagem
            </Link>
            {activeCount > 0 ? (
              <span 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                style={{ 
                  boxShadow: '0 0 8px rgba(16, 185, 129, 0.4), inset 0 0 4px rgba(16, 185, 129, 0.2)',
                  textShadow: '0 0 4px rgba(16, 185, 129, 0.6)' 
                }}
              >
                Ativo
              </span>
            ) : (
              <span 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/30"
                style={{ 
                  boxShadow: '0 0 8px rgba(244, 63, 94, 0.4), inset 0 0 4px rgba(244, 63, 94, 0.2)',
                  textShadow: '0 0 4px rgba(244, 63, 94, 0.6)' 
                }}
              >
                Inativo
              </span>
            )}
          </div>
        </div>

        {/* Right: stats + chevron */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className="text-[10px] font-black text-slate-400">
            {activeCount}/{totalCount} ativas
          </span>
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

      {/* Expanded: specialties panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mx-5 mb-5 mt-1 space-y-2 border-t border-slate-200/60 pt-4">
              {specialties.map((specialty) => (
                <SpecialtyRow
                  key={specialty.title}
                  specialty={specialty}
                  agentCor={teamAgent.cor}
                  isActive={statusOverrides[specialty.title] === true}
                  isActivating={activatingTitle === specialty.title}
                  isDeactivating={deactivatingTitle === specialty.title}
                  onActivate={() => onActivate(specialty.title)}
                  onDeactivate={() => onDeactivate(specialty.title)}
                />
              ))}

              {comingSoon.map((cs) => (
                <ComingSoonRow
                  key={cs.title}
                  title={cs.title}
                  description={cs.description}
                />
              ))}

              {/* Profile Link */}
              <Link
                href={`/hub/membro/${teamAgent.id}`}
                className="flex items-center justify-center gap-1.5 mt-2 py-2 rounded-xl text-[11px] font-black border border-white/50 bg-[#eef2f7] shadow-[2px_2px_5px_#d1d9e6,_-2px_-2px_5px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] transition-all"
                style={{ textDecoration: 'none', color: teamAgent.cor }}
              >
                <Sparkles size={11} />
                Ver perfil de {teamAgent.nome}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main exported shell ─────────────────────────────────────────────────────

export default function FunilStagePage({ stage }: { stage: FunilStage }) {
  const meta = STAGE_META[stage];
  const { user } = useAuth();
  const [statusOverrides, setStatusOverrides] = useState<Record<string, boolean>>({});
  const [activatingTitle, setActivatingTitle] = useState<string | null>(null);
  const [deactivatingTitle, setDeactivatingTitle] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setStatusOverrides({}); return; }
    setStatusOverrides(readAgentStatusOverrides(user.uid));
  }, [user]);

  const activateSpecialty = async (agentTitle: string) => {
    if (!user) return;
    setActivatingTitle(agentTitle);
    const overrides = { ...statusOverrides, [agentTitle]: true };
    setStatusOverrides(overrides);
    writeAgentStatusOverrides(user.uid, overrides);
    try {
      const db = getFirebaseDb();
      await setDoc(doc(db, 'users', user.uid), {
        activeAgents: { [agentTitle]: { isActive: true, planName: 'Growth', monthlyLimit: 15, usageUsed: 0, updatedAt: Date.now() } },
      }, { merge: true });
    } catch { /* noop */ } finally { setActivatingTitle(null); }
  };

  const deactivateSpecialty = async (agentTitle: string) => {
    if (!user) return;
    setDeactivatingTitle(agentTitle);
    const overrides = { ...statusOverrides, [agentTitle]: false };
    setStatusOverrides(overrides);
    writeAgentStatusOverrides(user.uid, overrides);
    try {
      const db = getFirebaseDb();
      await setDoc(doc(db, 'users', user.uid), {
        activeAgents: { [agentTitle]: { isActive: false, updatedAt: Date.now() } },
      }, { merge: true });
    } catch { /* noop */ } finally { setDeactivatingTitle(null); }
  };

  const stageAgents = useMemo(
    () => TEAM_AGENTS.filter((a) => meta.agentIds.includes(a.id)),
    [meta.agentIds]
  );

  const totalSpecialties = stageAgents.reduce(
    (acc, a) => acc + a.specialtyTitles.length + a.comingSoonSpecialties.length,
    0
  );

  const totalActive = stageAgents.reduce((acc, a) => {
    return acc + a.specialtyTitles.filter((t) => statusOverrides[t] === true).length;
  }, 0);

  return (
    <div className="space-y-8 w-full px-6 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Header ── */}
      <div className="py-8 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full border border-white/60 bg-[#eef2f7] shadow-[2px_2px_5px_#d1d9e6,_-2px_-2px_5px_#ffffff]">
          <Users size={11} style={{ color: meta.cor }} />
          <span className="text-[10px] font-black uppercase tracking-[0.15em]" style={{ color: meta.cor }}>
            Laboratório IA · {meta.label}
          </span>
        </div>
        <h1 className="text-[26px] font-black text-[#0f172a] tracking-tight flex items-center gap-3">
          <span className="text-[28px]">{meta.emoji}</span>
          {meta.label}
        </h1>
        <p className="text-[13px] text-slate-500 font-semibold mt-1 max-w-2xl leading-relaxed">
          {meta.description}
        </p>
        <p className="text-[12px] font-black mt-2" style={{ color: meta.cor }}>
          {stageAgents.length} Agentes · {totalActive}/{totalSpecialties} especialidades ativas
        </p>
      </div>

      {/* ── Funnel stages navigation ── */}
      <div className="flex gap-2 flex-wrap">
        {(Object.entries(STAGE_META) as [FunilStage, typeof STAGE_META[FunilStage]][]).map(([key, s]) => (
          <Link
            key={key}
            href={`/hub/funil/${key}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border transition-all hover:scale-[1.02]"
            style={{
              textDecoration: 'none',
              color: key === stage ? '#fff' : s.cor,
              background: key === stage ? `linear-gradient(135deg, ${s.cor}, ${s.cor}cc)` : `${s.cor}10`,
              borderColor: key === stage ? s.cor : `${s.cor}30`,
              boxShadow: key === stage ? `0 2px 10px ${s.cor}40` : 'none',
            }}
          >
            {s.emoji} {s.label}
          </Link>
        ))}
      </div>

      {/* ── Agent grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {stageAgents.map((ta) => (
          <AgentOperationCard
            key={ta.id}
            teamAgent={ta}
            statusOverrides={statusOverrides}
            activatingTitle={activatingTitle}
            deactivatingTitle={deactivatingTitle}
            onActivate={activateSpecialty}
            onDeactivate={deactivateSpecialty}
          />
        ))}
      </div>

      {/* ── Link back to Lab ── */}
      <div className="flex justify-center pt-4">
        <Link
          href="/hub/laboratorio-agentes"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-[12px] font-black border border-white/60 bg-[#eef2f7] shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] transition-all text-slate-500 hover:text-[#FF6A00]"
          style={{ textDecoration: 'none' }}
        >
          <Users size={13} /> Ver toda a Equipe IA
        </Link>
      </div>
    </div>
  );
}
