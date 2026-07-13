'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { ExternalLink, Lock, Sparkles, Users, Activity, ChevronDown, TrendingUp, MousePointerClick, ShoppingCart, Wallet } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { TEAM_AGENTS, TeamAgent } from '../../data/team-agents';
import { agents as allSpecialties } from '../../data/agents';
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
    description: 'Ativos responsáveis por gerar visibilidade, atrair tráfego qualificado e posicionar a marca nos canais certos — via mídia paga, SEO, conteúdo e presença orgânica.',
    cor: '#FACC15',
    emoji: '🎯',
    agentIds: ['paola', 'igor', 'lais'],
  },
  engajamento: {
    label: 'Engajamento',
    tagline: 'Desperte interesse e construa relacionamento com os leads.',
    description: 'Ativos que nutrem leads, criam conteúdo relevante e mantêm a marca presente até o lead estar pronto para a conversa de vendas.',
    cor: '#FB923C',
    emoji: '💬',
    agentIds: ['lais', 'taina', 'igor'],
  },
  conversao: {
    label: 'Conversão',
    tagline: 'Transforme interesse em receita de forma autônoma.',
    description: 'Ativos que qualificam, abordam e fecham negócios — do primeiro contato ao contrato assinado, sem dependência de equipe humana para cada etapa.',
    cor: '#34D399',
    emoji: '⚡',
    agentIds: ['vitor', 'breno', 'heitor'],
  },
  retencao: {
    label: 'Retenção',
    tagline: 'Maximize o valor de cada cliente já conquistado.',
    description: 'Ativos que garantem a satisfação, o suporte rápido, o upsell no momento certo e a reativação de quem ficou inativo — protegendo e expandindo a receita recorrente.',
    cor: '#22D3EE',
    emoji: '🔁',
    agentIds: ['manu', 'raissa', 'ulisses'],
  },
};

// ─── Stage Cockpit Panel Component ───────────────────────────────────────────

function StageCockpitPanel({ stage }: { stage: FunilStage }) {
  // Atração States
  const [dailyBudget, setDailyBudget] = useState(50);
  const [cpcValue, setCpcValue] = useState(1.50);

  const clicks = useMemo(() => Math.round((dailyBudget / cpcValue) * 30), [dailyBudget, cpcValue]);
  const convs = useMemo(() => Math.round(clicks * 0.025), [clicks]);
  const revenue = useMemo(() => convs * 150, [convs]);

  // Conversão States
  const [opportunities, setOpportunities] = useState([
    { id: 1, name: 'Carlos Souza', company: 'Empresa X', score: 94, action: 'Enviar Proposta Comercial', phone: '+55 11 99999-1111' },
    { id: 2, name: 'Ana Paula', company: 'Startup Tech', score: 89, action: 'Agendar Reunião', phone: '+55 21 98888-2222' },
  ]);

  const handleRemoveOpportunity = (id: number, actionName: string) => {
    setOpportunities(prev => prev.filter(o => o.id !== id));
    alert(`Ação "${actionName}" iniciada com sucesso! O lead foi direcionado ao Closer Breno.`);
  };

  if (stage === 'atracao') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="hub-neu-card p-6 bg-white border-l-4 border-yellow-400 space-y-4 shadow-md rounded-2xl"
      >
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="text-[18px]">🎯</span>
          <div>
            <h3 className="text-[14px] font-black text-[#0f172a] uppercase">Simulador de Investimento em Tráfego</h3>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Estime cliques, conversões e faturamento com base no budget diário e CPC.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-black text-slate-700">
                <span>Orçamento Diário (R$)</span>
                <span className="font-mono text-[#FF6A00]">R$ {dailyBudget}</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="5"
                value={dailyBudget}
                onChange={e => setDailyBudget(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#FF6A00]"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-black text-slate-700">
                <span>Custo por Clique (CPC Estimado)</span>
                <span className="font-mono text-blue-600">R$ {cpcValue.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.20"
                max="10.00"
                step="0.10"
                value={cpcValue}
                onChange={e => setCpcValue(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>

          <div className="bg-[#eef2f7] p-4 rounded-2xl border border-white/60 shadow-[inset_2px_2px_4px_#d1d9e6,inset_-2px_-2px_4px_#ffffff] grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col justify-center">
              <p className="text-[9px] font-black text-slate-400 uppercase">Cliques / Mês</p>
              <p className="text-[16px] font-black text-slate-800 font-mono mt-0.5">{clicks.toLocaleString('pt-BR')}</p>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[9px] font-black text-slate-400 uppercase">Leads (2.5%)</p>
              <p className="text-[16px] font-black text-[#FF6A00] font-mono mt-0.5">{convs}</p>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[9px] font-black text-slate-400 uppercase">Receita (LTV)</p>
              <p className="text-[16px] font-black text-emerald-600 font-mono mt-0.5">R$ {revenue.toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-yellow-500/5 rounded-xl border border-yellow-500/20 text-[11px] font-bold text-slate-600 flex items-start gap-2 leading-relaxed">
          <span>💡</span>
          <p>
            <strong className="text-slate-800">Recomendação NeuroAds:</strong> Investimentos acima de <span className="font-mono text-yellow-700">R$ 100/dia</span> ajudam os agentes de Tráfego (Paola) e Inteligência (Igor) a calibrarem públicos mais rapidamente, reduzindo o tempo de aprendizado em até 40%.
          </p>
        </div>
      </motion.div>
    );
  }

  if (stage === 'engajamento') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="hub-neu-card p-6 bg-white border-l-4 border-orange-400 space-y-4 shadow-md rounded-2xl"
      >
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="text-[18px]">💬</span>
          <div>
            <h3 className="text-[14px] font-black text-[#0f172a] uppercase">Monitor de Engajamento & Gargalos</h3>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Acompanhe as ações ativas de conteúdo e possíveis travas identificadas no funil de nutrição.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Últimas Atividades dos Agentes</p>
            <div className="space-y-2">
              <div className="flex items-start gap-2.5 text-[11.5px] font-semibold text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                <p>Tainá publicou 3 novas variações de criativos de alta intenção com gatilhos comportamentais.</p>
              </div>
              <div className="flex items-start gap-2.5 text-[11.5px] font-semibold text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <p>Laís otimizou o SEO de 4 palavras-chave de fundo de funil focando no ICP B2B.</p>
              </div>
              <div className="flex items-start gap-2.5 text-[11.5px] font-semibold text-slate-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <p>Igor recalibrou a pontuação de engajamento dos leads com base no tempo de tela da demo.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Logs de Gargalos Identificados</p>
            <div className="space-y-2">
              <div className="p-3 bg-rose-500/5 rounded-xl border border-rose-500/15 flex items-start gap-2.5">
                <span className="text-[11px] shrink-0 mt-0.5">⚠️</span>
                <div>
                  <p className="text-[11px] font-black text-rose-800">Queda no CTR Meta Ads (-15%)</p>
                  <p className="text-[10px] text-rose-700/80 font-bold mt-0.5">Identificado por Igor. Recomendação: Trocar criativo estático por vídeo depoimento.</p>
                </div>
              </div>
              <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/15 flex items-start gap-2.5">
                <span className="text-[11px] shrink-0 mt-0.5">⚠️</span>
                <div>
                  <p className="text-[11px] font-black text-amber-800">Queda de posições em palavras B2B no Google</p>
                  <p className="text-[10px] text-amber-700/80 font-bold mt-0.5">Identificado por Laís. Ação em andamento: Atualização de meta descriptions e cabeçalhos.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (stage === 'conversao') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="hub-neu-card p-6 bg-white border-l-4 border-emerald-400 space-y-4 shadow-md rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[18px]">⚡</span>
            <div>
              <h3 className="text-[14px] font-black text-[#0f172a] uppercase">Oportunidades Urgentes de Fechamento</h3>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Leads super quentes que demandam contato imediato do closer Breno.</p>
            </div>
          </div>
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10">
            {opportunities.length} LEADS URGENTES
          </span>
        </div>

        {opportunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.map(o => (
              <div key={o.id} className="p-4 rounded-2xl border border-white/60 bg-[#eef2f7]/60 flex flex-col justify-between gap-3 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-black text-slate-800">{o.name}</span>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600">Score {o.score}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">{o.company} · {o.phone}</p>
                    <p className="text-[11px] text-[#FF6A00] font-black mt-1.5">★ Ação sugerida: {o.action}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRemoveOpportunity(o.id, 'Chamar no WhatsApp')}
                    className="flex-1 py-1.5 rounded-xl text-[10px] font-black text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm cursor-pointer text-center"
                    style={{ border: 'none' }}
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => handleRemoveOpportunity(o.id, 'Enviar Proposta de ROI')}
                    className="flex-1 py-1.5 rounded-xl text-[10px] font-black text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer text-center"
                  >
                    Enviar Proposta
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center bg-slate-55 rounded-2xl border border-dashed border-slate-200">
            <p className="text-[12px] font-bold text-slate-500">Tudo em dia! Nenhuma oportunidade pendente no momento.</p>
          </div>
        )}
      </motion.div>
    );
  }

  if (stage === 'retencao') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="hub-neu-card p-6 bg-white border-l-4 border-cyan-400 space-y-4 shadow-md rounded-2xl"
      >
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="text-[18px]">🔁</span>
          <div>
            <h3 className="text-[14px] font-black text-[#0f172a] uppercase">Cockpit de Retenção & NPS</h3>
            <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Proteja e expanda sua base de faturamento recorrente com alertas de saúde de contas.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Block 1: NPS Tracker */}
          <div className="p-4 rounded-2xl border border-white/60 bg-[#eef2f7]/50 flex flex-col justify-between gap-1 text-center">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase">NPS Médio Consolidado</p>
              <p className="text-[28px] font-black text-cyan-600 mt-1 font-mono">78</p>
            </div>
            <p className="text-[10px] text-emerald-600 font-black">★ Zona de Excelência</p>
          </div>

          {/* Block 2: Churn Alert */}
          <div className="p-4 rounded-2xl border border-white/60 bg-rose-500/5 flex flex-col justify-between gap-2 border-rose-500/10">
            <div>
              <p className="text-[9px] font-black text-rose-500 uppercase tracking-wider">Alerta de Churn</p>
              <p className="text-[12px] font-black text-rose-900 mt-1.5 leading-snug">Empresa GHI com queda de uso &gt; 35% nas últimas 2 semanas.</p>
            </div>
            <Link href="/hub/assistente-ia?agent=manu" className="text-[10.5px] font-black text-rose-600 hover:underline" style={{ textDecoration: 'none' }}>
              Acionar Manu (Suporte) →
            </Link>
          </div>

          {/* Block 3: Expansion Opp */}
          <div className="p-4 rounded-2xl border border-white/60 bg-emerald-500/5 flex flex-col justify-between gap-2 border-emerald-500/10">
            <div>
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-wider">Oportunidade de Upsell</p>
              <p className="text-[12px] font-black text-emerald-900 mt-1.5 leading-snug">Empresa ABC atingiu 92% do limite de créditos do plano mensal.</p>
            </div>
            <Link href="/hub/assistente-ia?agent=raissa" className="text-[10.5px] font-black text-emerald-600 hover:underline" style={{ textDecoration: 'none' }}>
              Acionar Raíssa (Upsell) →
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
}

// ─── Specialty row with hover action and descriptions ────────────────────────

function SpecialtyRow({
  specialty,
  agentId,
  agentCor,
}: {
  specialty: typeof allSpecialties[number];
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
        
        {/* Line 3: Action buttons — side by side, equal width */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          {/* Executar Operação — primary */}
          <Link
            href={`/hub/assistente-ia?agent=${agentId}&specialty=${encodeURIComponent(specialty.title)}`}
            onClick={(e) => e.stopPropagation()}
            className="group/exec inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[10.5px] font-black text-white transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #2563EB, #06B6D4)', textDecoration: 'none', boxShadow: '0 4px 12px rgba(37,99,235,0.28)' }}
          >
            <ExternalLink size={11} className="transition-transform duration-200 group-hover/exec:translate-x-0.5" /> Executar Operação
          </Link>

          {/* Programar Automação — secondary */}
          <Link
            href={`/hub/automacoes`}
            onClick={(e) => e.stopPropagation()}
            className="group/prog inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-[10.5px] font-black text-slate-600 border border-white/70 bg-[#eef2f7] shadow-[2px_2px_5px_#d1d9e6,_-2px_-2px_5px_#ffffff] transition-all duration-200 hover:-translate-y-0.5 hover:text-[#2563EB] active:translate-y-0 active:scale-[0.98]"
            style={{ textDecoration: 'none' }}
          >
            <Activity size={11} className="transition-transform duration-200 group-hover/prog:rotate-[18deg]" /> Programar Automação
          </Link>
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
  const [expanded, setExpanded] = useState(false);
  const [avatarHovered, setAvatarHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="hub-neu-card overflow-hidden shadow-[3px_3px_8px_#d1d9e6,_-3px_-3px_8px_#ffffff] transition-all duration-300"
      style={{ borderLeft: `3px solid ${teamAgent.cor}`, background: '#ffffff' }}
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
          <p className="text-[12px] font-semibold text-slate-500 mt-0.5">{teamAgent.funcao}</p>
          <p className="text-[11.5px] text-slate-400 font-medium italic mt-1.5 leading-snug">
            &ldquo;{teamAgent.tagline}&rdquo;
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/hub/assistente-ia?agent=${teamAgent.id}`}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-[11px] font-black text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_2px_8px_rgba(255,106,0,0.25)]"
              style={{ background: 'linear-gradient(135deg, #FF4D00, #FF8805)', textDecoration: 'none' }}
              onClick={(e) => e.stopPropagation()}
            >
              Enviar Mensagem
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(prev => !prev);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black transition-all border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 shadow-sm"
            >
              <span>Operações Estratégicas</span>
              <ChevronDown
                size={12}
                className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
              />
            </button>
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
                  agentId={teamAgent.id}
                  agentCor={teamAgent.cor}
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
          {stageAgents.length} Ativos · {totalActive}/{totalSpecialties} especialidades ativas
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

      {/* ── Custom Cockpit Panel based on Stage ── */}
      <StageCockpitPanel stage={stage} />

      {/* ── Agent grid ── */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-5">
        {stageAgents.map((ta) => (
          <div key={ta.id} className="mb-5 break-inside-avoid">
            <AgentOperationCard
              teamAgent={ta}
              statusOverrides={statusOverrides}
              activatingTitle={activatingTitle}
              deactivatingTitle={deactivatingTitle}
              onActivate={activateSpecialty}
              onDeactivate={deactivateSpecialty}
            />
          </div>
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
