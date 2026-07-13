'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { ArrowRight, Sparkles } from 'lucide-react';

/* ─── Ícones 3D — mesmo estilo dos aplicados na página inicial ─────────── */
function IconLineChart({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hes-lc-grad" x1="5" y1="5" x2="43" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38D4C0" /><stop offset="1" stopColor="#0369A1" />
        </linearGradient>
        <filter id="hes-lc-shadow"><feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#0369A1" floodOpacity="0.35" /></filter>
      </defs>
      <rect x="7" y="9" width="34" height="27" rx="7" fill="url(#hes-lc-grad)" filter="url(#hes-lc-shadow)" />
      <ellipse cx="18" cy="15" rx="9" ry="4" fill="white" fillOpacity="0.22" />
      <polyline points="12,30 18,22 24,26 30,16 36,20" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />
      <circle cx="18" cy="22" r="2" fill="white" fillOpacity="0.9" />
      <circle cx="30" cy="16" r="2" fill="white" fillOpacity="0.9" />
      <line x1="11" y1="33" x2="37" y2="33" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
      <ellipse cx="24" cy="42" rx="13" ry="2.5" fill="#0369A1" fillOpacity="0.15" />
    </svg>
  );
}

function IconPieChart({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hes-pie-grad" x1="5" y1="5" x2="43" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF8040" /><stop offset="1" stopColor="#E03A00" />
        </linearGradient>
        <filter id="hes-pie-shadow"><feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#E03A00" floodOpacity="0.3" /></filter>
      </defs>
      <circle cx="24" cy="24" r="17" fill="url(#hes-pie-grad)" filter="url(#hes-pie-shadow)" />
      <ellipse cx="17" cy="15" rx="8" ry="4.5" fill="white" fillOpacity="0.22" />
      <line x1="24" y1="24" x2="24" y2="7" stroke="white" strokeWidth="2" strokeOpacity="0.7" />
      <line x1="24" y1="24" x2="39" y2="31" stroke="white" strokeWidth="2" strokeOpacity="0.7" />
      <line x1="24" y1="24" x2="10" y2="35" stroke="white" strokeWidth="2" strokeOpacity="0.7" />
      <path d="M24 24 L24 7 A17 17 0 0 1 39 31 Z" fill="white" fillOpacity="0.15" />
      <ellipse cx="24" cy="44" rx="13" ry="2.5" fill="#E03A00" fillOpacity="0.15" />
    </svg>
  );
}

function IconBotAI({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hes-bot-grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2DD4BF" /><stop offset="1" stopColor="#0d9488" />
        </linearGradient>
        <filter id="hes-bot-shadow"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0d9488" floodOpacity="0.3" /></filter>
      </defs>
      <rect x="9" y="13" width="30" height="23" rx="7" fill="url(#hes-bot-grad)" filter="url(#hes-bot-shadow)" />
      <ellipse cx="19" cy="18" rx="8" ry="4" fill="white" fillOpacity="0.22" />
      <circle cx="18" cy="24" r="3.5" fill="white" fillOpacity="0.95" />
      <circle cx="30" cy="24" r="3.5" fill="white" fillOpacity="0.95" />
      <circle cx="18" cy="24" r="1.8" fill="#0f766e" fillOpacity="0.8" />
      <circle cx="30" cy="24" r="1.8" fill="#0f766e" fillOpacity="0.8" />
      <rect x="17" y="30" width="14" height="2" rx="1" fill="white" fillOpacity="0.75" />
      <rect x="22.5" y="6" width="3" height="7" rx="1.5" fill="#5EEAD4" />
      <circle cx="24" cy="6" r="2.5" fill="#99F6E4" />
      <ellipse cx="24" cy="42" rx="11" ry="2.5" fill="#0f766e" fillOpacity="0.15" />
    </svg>
  );
}

const STEPS = [
  {
    number: 1,
    Icon: IconLineChart,
    title: 'Conectar GA4',
    description: 'Rastreie faturamento, conversões e audiência em tempo real.',
    color: '#0891b2',
  },
  {
    number: 2,
    Icon: IconPieChart,
    title: 'Conectar Google Ads ou Meta Ads',
    description: 'Consolide investimento, cliques e ROAS de todas as plataformas.',
    color: '#FF6A00',
  },
  {
    number: 3,
    Icon: IconBotAI,
    title: 'Ativar Agente IA DNA da Marca',
    description: 'O ponto de partida recomendado: calibre a identidade da sua marca para que todos os agentes falem a mesma língua.',
    color: '#0d9488',
  },
];

export default function HubEmptyState() {
  const { user, profile, activeCompany } = useAuth();
  const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Bem-vindo';
  const displayCompanyName = activeCompany?.companyName || profile?.companyName;

  return (
    <div className="w-full max-w-3xl mx-auto py-12 space-y-10">

      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="text-center space-y-2"
      >
        <h1 className="text-[26px] font-black text-[#0f172a] tracking-tight">
          Olá, {firstName} 👋
        </h1>
        <p className="text-[14px] text-slate-500 font-semibold max-w-md mx-auto leading-relaxed">
          {displayCompanyName
            ? `Configure os conectores da ${displayCompanyName}`
            : 'Configure seus conectores'}{' '}
          para ativar o painel de atribuição em tempo real.
        </p>
      </motion.div>

      {/* Steps wizard */}
      <motion.div
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {STEPS.map((step, idx) => {
          const Icon = step.Icon;
          return (
            <motion.div
              key={step.number}
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              className="relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[4px_4px_10px_#dfe5ee,_-4px_-4px_10px_#ffffff] hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all duration-300 group cursor-default"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 shrink-0"
                >
                  <span className="text-[13px] font-black" style={{ color: step.color }}>{step.number}</span>
                </div>
                <Icon size={46} />
              </div>
              <h3 className="text-[13px] font-black text-[#0f172a] leading-snug mb-1.5">{step.title}</h3>
              <p className="text-[12px] text-slate-500 font-semibold leading-relaxed">{step.description}</p>

              {idx < STEPS.length - 1 && (
                <div className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full hidden sm:flex items-center justify-center border border-white/60 bg-[#eef2f7] shadow-[2px_2px_5px_#d1d9e6,_-2px_-2px_5px_#ffffff] z-10">
                  <ArrowRight size={12} className="text-slate-400" />
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* DNA da Marca Agent Suggestion */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.45 }}
        className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[4px_4px_10px_#dfe5ee,_-4px_-4px_10px_#ffffff]"
      >
        {/* Subtle glow */}
        <div className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 rounded-full bg-teal-400/10 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="shrink-0">
              <IconBotAI size={60} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#0d9488]">Ponto de Partida Recomendado</p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-teal-500/10 text-teal-700 border border-teal-500/20">
                  <Sparkles size={9} />
                  IA
                </span>
              </div>
              <h3 className="text-[15px] font-black text-[#0f172a] leading-tight">Agente IA — DNA da Marca</h3>
              <p className="text-[12px] text-slate-500 font-semibold leading-snug mt-0.5">
                Calibre sua identidade de marca para que todos os agentes falem com a voz certa desde o primeiro dia.
              </p>
            </div>
          </div>
          <Link
            href="/hub/agente/dna-da-marca"
            className="inline-flex items-center gap-2 shrink-0 rounded-xl border border-[#0d9488]/30 bg-teal-500/5 px-4 py-2.5 text-[12px] font-black text-[#0d9488] hover:bg-teal-500/10 hover:shadow-[0_4px_12px_rgba(13,148,136,0.15)] transition-all duration-200"
          >
            Executar Operação
            <ArrowRight size={13} />
          </Link>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="text-center space-y-3"
      >
        <Link
          href="/hub/integracoes"
          className="inline-flex items-center gap-2 rounded-2xl px-8 py-3.5 text-[14px] font-black text-white transition-all duration-200 shadow-[0_8px_24px_rgba(255,106,0,0.28)] hover:shadow-[0_8px_32px_rgba(255,106,0,0.42)] hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #FF4D00, #FF8805)' }}
        >
          Configurar Integrações
          <ArrowRight size={16} />
        </Link>
        <p className="text-[12px] text-slate-400 font-semibold">
          Leva menos de 2 minutos para conectar a primeira fonte de dados.
        </p>
      </motion.div>

    </div>
  );
}
