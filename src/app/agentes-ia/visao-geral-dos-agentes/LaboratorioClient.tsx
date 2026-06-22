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
    <main className="relative min-h-screen bg-[#040811] text-white overflow-hidden pt-24 pb-24">
      {/* Background radial overlays */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 600px 600px at 25% 0%, rgba(255,106,0,0.06) 0%, transparent 70%)',
            'radial-gradient(ellipse 700px 700px at 75% 35%, rgba(18,40,76,0.10) 0%, transparent 70%)',
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

      <div className="relative z-10 mx-auto max-w-[1260px] px-5 md:px-8">
        
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
          <h1 className="text-[40px] md:text-[52px] font-black leading-[1.08] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
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

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {content.agentExamples?.map((agent, i) => (
              <div
                key={agent.name}
                className="group relative rounded-xl border border-white/5 bg-zinc-950/90 p-6 flex flex-col justify-between hover:border-[#ff6a00]/30 transition-all hover:shadow-[0_4px_24px_rgba(255,106,0,0.08)] min-h-[220px]"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    {agent.icon.startsWith('/') ? (
                      <span className="relative inline-flex h-11 w-11 overflow-hidden rounded-xl border border-white/15 bg-white/[0.06] p-1.5">
                        <Image src={agent.icon} alt={agent.name} fill className="object-cover" sizes="44px" />
                      </span>
                    ) : (
                      <span className="text-[34px] leading-none">{agent.icon}</span>
                    )}
                    {agent.metric && (
                      <span className="text-[11px] font-black text-[#ff9a50] bg-[#ff6a00]/10 px-2 py-1 rounded-md">
                        {agent.metric}
                      </span>
                    )}
                  </div>
                  <h3 className="text-[15px] font-bold text-white group-hover:text-[#ff8f3a] transition-colors leading-snug">
                    {agent.name}
                  </h3>
                  <div className="mt-4 space-y-3">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500">Gatilho</p>
                      <p className="text-[12px] text-slate-300 leading-snug">{agent.trigger}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-[#ff8f3a]/70">Execução</p>
                      <p className="text-[12px] text-white/80 leading-snug">{agent.action}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </main>
  );
}
