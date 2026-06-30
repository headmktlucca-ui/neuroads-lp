'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { ExternalLink, Lock, Sparkles, Users, Wrench, Activity } from 'lucide-react';
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
  const [avatarHovered, setAvatarHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="hub-neu-card overflow-hidden shadow-[3px_3px_8px_#d1d9e6,_-3px_-3px_8px_#ffffff]"
      style={{ borderLeft: `3px solid ${teamAgent.cor}` }}
    >
      {/* Agent header */}
      <div className="flex items-center gap-4 p-4 border-b border-slate-200/50">
        {/* Avatar — 96×96 with hover overlay */}
        <div
          className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden border border-white/60 shadow-[2px_2px_5px_#d1d9e6,_-2px_-2px_5px_#ffffff] cursor-pointer"
          style={{
            boxShadow: avatarHovered
              ? `0 0 0 3px ${teamAgent.cor}55, 2px 2px 8px #d1d9e6, -2px -2px 8px #ffffff`
              : '2px 2px 5px #d1d9e6, -2px -2px 5px #ffffff',
            transition: 'box-shadow 0.2s ease',
          }}
          onMouseEnter={() => setAvatarHovered(true)}
          onMouseLeave={() => setAvatarHovered(false)}
        >
          <Image
            src={teamAgent.avatarSrc}
            alt={teamAgent.nome}
            width={96}
            height={96}
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
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[15px] font-black text-[#0f172a]">{teamAgent.nome}</span>
            <span
              className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
              style={{ color: teamAgent.cor, background: `${teamAgent.cor}15`, borderColor: `${teamAgent.cor}30` }}
            >
              {teamAgent.categoria}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-semibold mt-0.5 line-clamp-1">{teamAgent.tagline}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] font-black" style={{ color: teamAgent.cor }}>{activeCount}/{totalCount}</p>
          <p className="text-[9px] text-slate-400 font-semibold">ativas</p>
        </div>
      </div>

      {/* Specialties list */}
      <div className="p-3 space-y-2">
        {specialties.map((specialty) => {
          const isActive = statusOverrides[specialty.title] === true;
          const isActivating = activatingTitle === specialty.title;
          const isDeactivating = deactivatingTitle === specialty.title;

          return (
            <div
              key={specialty.title}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all"
              style={{
                background: isActive ? `${teamAgent.cor}06` : 'rgba(238,242,247,0.5)',
                borderColor: isActive ? `${teamAgent.cor}20` : 'rgba(255,255,255,0.5)',
              }}
            >
              <div className="w-7 h-7 shrink-0 rounded-lg overflow-hidden border border-white/40 bg-[#eef2f7] shadow-[inset_1px_1px_2px_#d1d9e6]">
                <Image src={specialty.icon} alt={specialty.title} width={28} height={28} className="w-full h-full object-cover" />
              </div>
              <span className="flex-1 text-[12px] font-bold text-[#0f172a] truncate">{specialty.title}</span>
              {isActive ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <Link
                    href={`/hub/agente/${slugifyAgentTitle(specialty.title)}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black text-white"
                    style={{ background: 'linear-gradient(135deg, #FF4D00, #FF8805)', textDecoration: 'none', boxShadow: '0 2px 6px rgba(255,106,0,0.3)' }}
                  >
                    <ExternalLink size={9} /> Acessar
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onActivate(specialty.title)}
                  disabled={isActivating}
                  className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black text-white hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
                  style={{ background: 'linear-gradient(135deg, #FF4D00, #FF8805)', boxShadow: '0 2px 6px rgba(255,106,0,0.2)' }}
                >
                  {isActivating ? <Activity size={9} className="animate-pulse" /> : <Wrench size={9} />}
                  {isActivating ? 'Ativando…' : 'Ativar'}
                </button>
              )}
            </div>
          );
        })}

        {/* Coming soon */}
        {comingSoon.map((cs) => (
          <div
            key={cs.title}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/40 bg-[#eef2f7]/40 opacity-55"
          >
            <div className="w-7 h-7 shrink-0 rounded-lg border border-slate-300/40 bg-slate-200/60 flex items-center justify-center">
              <Lock size={11} className="text-slate-400" />
            </div>
            <span className="flex-1 text-[12px] font-bold text-slate-400 truncate">{cs.title}</span>
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-slate-300/40 bg-slate-200/50 text-slate-400">Em breve</span>
          </div>
        ))}

        {/* Profile link */}
        <Link
          href={`/hub/membro/${teamAgent.id}`}
          className="flex items-center justify-center gap-1.5 mt-1 py-2 rounded-xl text-[11px] font-black border border-white/50 bg-[#eef2f7] shadow-[2px_2px_5px_#d1d9e6,_-2px_-2px_5px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] transition-all"
          style={{ textDecoration: 'none', color: teamAgent.cor }}
        >
          <Sparkles size={11} />
          Ver perfil de {teamAgent.nome}
        </Link>
      </div>
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
