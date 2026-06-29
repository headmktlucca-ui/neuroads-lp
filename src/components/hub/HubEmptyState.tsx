'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Activity, TrendingUp, Brain, ArrowRight, Plug2, Sparkles } from 'lucide-react';

const STEPS = [
  {
    number: 1,
    icon: Activity,
    title: 'Conectar GA4',
    description: 'Rastreie faturamento, conversões e audiência em tempo real.',
    color: '#0891b2',
  },
  {
    number: 2,
    icon: TrendingUp,
    title: 'Conectar Google Ads ou Meta Ads',
    description: 'Consolide investimento, cliques e ROAS de todas as plataformas.',
    color: '#FF6A00',
  },
  {
    number: 3,
    icon: Brain,
    title: 'Ativar Agente IA DNA da Marca',
    description: 'O ponto de partida recomendado: calibre a identidade da sua marca para que todos os agentes falem a mesma língua.',
    color: '#0d9488',
  },
];

export default function HubEmptyState() {
  const { user, profile } = useAuth();
  const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Bem-vindo';

  return (
    <div className="w-full max-w-3xl mx-auto py-12 space-y-10">

      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="text-center space-y-2"
      >
        <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 rounded-full border border-white/60 bg-[#eef2f7] shadow-[2px_2px_5px_#d1d9e6,_-2px_-2px_5px_#ffffff]">
          <Plug2 size={13} className="text-[#FF6A00]" />
          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FF6A00]">Nenhuma Conexão Ativa</span>
        </div>
        <h1 className="text-[26px] font-black text-[#0f172a] tracking-tight">
          Olá, {firstName} 👋
        </h1>
        <p className="text-[14px] text-slate-500 font-semibold max-w-md mx-auto leading-relaxed">
          {profile?.companyName
            ? `Configure os conectores da ${profile.companyName}`
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
          const Icon = step.icon;
          return (
            <motion.div
              key={step.number}
              variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
              className="relative rounded-2xl border border-white/60 bg-[#eef2f7] p-5 shadow-[4px_4px_10px_#d1d9e6,_-4px_-4px_10px_#ffffff] hover:shadow-[inset_3px_3px_6px_#d1d9e6,_inset_-3px_-3px_6px_#ffffff] transition-all duration-300 group cursor-default"
              style={{ borderLeft: `3px solid ${step.color}` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/40 bg-[#eef2f7] shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] shrink-0"
                >
                  <span className="text-[13px] font-black" style={{ color: step.color }}>{step.number}</span>
                </div>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/40 bg-[#eef2f7] shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]"
                >
                  <Icon size={14} style={{ color: step.color }} />
                </div>
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
        className="relative overflow-hidden rounded-2xl border border-white/60 bg-[#eef2f7] p-5 shadow-[4px_4px_10px_#d1d9e6,_-4px_-4px_10px_#ffffff]"
        style={{ borderLeft: '3px solid #0d9488' }}
      >
        {/* Subtle glow */}
        <div className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 rounded-full bg-teal-400/10 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/40 bg-[#eef2f7] shadow-[3px_3px_8px_#d1d9e6,_-3px_-3px_8px_#ffffff]">
              <Brain size={20} className="text-[#0d9488]" />
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
            Ativar agente
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
