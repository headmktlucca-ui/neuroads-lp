'use client';

import { motion, Variants } from 'framer-motion';
import { ArrowRight, Bot, Target, Funnel, TrendingUp, Cpu, Zap, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { type SubmenuPageContent } from '@/components/neuroads/SubmenuPageShell';

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

export default function LaboratorioClient({ content }: { content: SubmenuPageContent }) {
  return (
    <main className="relative min-h-screen bg-[#000000] text-white overflow-hidden pt-24 pb-24">
      {/* Background radial overlays */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 600px 600px at 25% 0%, rgba(255,106,0,0.06) 0%, transparent 70%)',
            'radial-gradient(ellipse 700px 700px at 75% 35%, rgba(30,30,30,0.10) 0%, transparent 70%)',
            'radial-gradient(ellipse 500px 500px at 33% 100%, rgba(255,106,0,0.03) 0%, transparent 70%)',
          ].join(', '),
        }}
      />
      
      {/* Header Grid Line patterns */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1260px] px-6 md:px-12 lg:px-20">
        
        {/* HERO SECTION */}
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center max-w-[800px] mx-auto mt-12 mb-20"
        >
          <span className="inline-block rounded-md border border-[#ff6a00]/30 bg-[#ff6a00]/10 px-3 py-1 mb-6">
            <span className="text-[13px] font-bold text-[#ff8f3a]">
              {content.eyebrow}
            </span>
          </span>
          <h1 className="text-[40px] md:text-[52px] font-black leading-[1.08] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] text-balance">
            {content.headline}{" "}
            <span className="text-[#ff6a00]">
              {content.highlightedHeadline}
            </span>
          </h1>
          <p className="mt-6 text-[16px] sm:text-[18px] text-white/80 leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
            {content.subheadline}
          </p>
        </motion.div>

        {/* AGENTS SECTION */}
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <div className="flex items-center gap-2.5 mb-6">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ff6a00]/30 bg-[#ff6a00]/15 text-[#ff9a50]">
              <Bot size={16} />
            </div>
            <span className="text-[12px] font-black uppercase tracking-[0.18em] text-[#ff9a50]">
              Catálogo de Agentes
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {content.agentExamples?.map((agent, i) => (
              <div
                key={agent.name}
                tabIndex={0}
                className="group relative rounded-xl border border-white/5 bg-zinc-950/80 p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-6 hover:bg-zinc-900/90 hover:border-[#ff6a00]/30 transition-all hover:shadow-[0_4px_24px_rgba(255,106,0,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6a00]/50"
              >
                {/* Ícone e Nome do Agente (Coluna 1) */}
                <div className="flex items-center gap-4 md:w-1/4 shrink-0">
                  {agent.icon.startsWith('/') ? (
                    <span className="relative inline-flex h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] p-2">
                      <Image src={agent.icon} alt="" aria-hidden="true" fill className="object-cover" sizes="48px" />
                    </span>
                  ) : (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[28px] leading-none" aria-hidden="true">
                      {agent.icon}
                    </span>
                  )}
                  <h3 className="text-[16px] font-bold text-white group-hover:text-[#ff8f3a] transition-colors leading-snug">
                    {agent.name}
                  </h3>
                </div>

                {/* Gatilho (Coluna 2) */}
                <div className="md:w-[30%]">
                  <p className="text-[10px] font-black uppercase text-slate-500 mb-1.5">Gatilho</p>
                  <p className="text-[13px] text-slate-300 leading-relaxed">{agent.trigger}</p>
                </div>

                {/* Execução (Coluna 3) */}
                <div className="md:w-[35%]">
                  <p className="text-[10px] font-black uppercase text-[#ff8f3a]/70 mb-1.5">Execução</p>
                  <p className="text-[13px] text-white/80 leading-relaxed">{agent.action}</p>
                </div>

                {/* Métrica (Coluna 4) */}
                <div className="md:w-[10%] flex md:justify-end items-center pr-0 lg:pr-8">
                  {agent.metric && (
                    <span className="inline-block text-[12px] font-bold text-[#ff9a50] bg-[#ff6a00]/10 px-3 py-1.5 rounded-lg border border-[#ff6a00]/20 tabular-nums whitespace-nowrap">
                      {agent.metric}
                    </span>
                  )}
                </div>
                
                {/* Indicador visual hover (Seta) */}
                <div className="hidden lg:flex absolute right-6 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none">
                  <ArrowRight size={18} className="text-[#ff6a00]/50" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </main>
  );
}
