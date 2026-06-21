'use client';

import { motion, Variants } from 'framer-motion';
import { ArrowRight, Goal, Gauge, Layers, Handshake, Target } from 'lucide-react';
import Link from 'next/link';
import { type StrategicContentPageData } from '@/components/neuroads/StrategicContentPageShell';

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const iconMap: Record<string, React.ReactNode> = {
  goal: <Goal size={20} />,
  gauge: <Gauge size={20} />,
  layers: <Layers size={20} />,
  handshake: <Handshake size={20} />
};

export default function SobreClient({ data }: { data: StrategicContentPageData }) {
  return (
    <main className="relative min-h-screen bg-[#040811] text-white overflow-hidden pt-32 pb-24">
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
          animate="visible"
          className="text-center max-w-[800px] mx-auto mb-20"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-[#ff6a00]/30 bg-[#ff6a00]/10 backdrop-blur-md px-4 py-1.5 mb-6">
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff8f3a]">
              {data.eyebrow}
            </span>
          </span>
          <h1 className="text-[40px] md:text-[52px] font-black leading-[1.08] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
            {data.title}{" "}
            <br className="hidden md:block" />
            <span className="bg-[linear-gradient(90deg,#ff8a00_0%,#ff6a00_50%,#ff9f1a_100%)] bg-clip-text text-transparent">
              {data.highlightedTitle}
            </span>
          </h1>
          <p className="mt-6 text-[16px] sm:text-[18px] text-white/80 leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)] max-w-[700px] mx-auto">
            {data.subtitle}
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={data.primaryCta.href}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#ff6a00] hover:bg-[#ff7b1a] transition-all px-8 py-4 text-[14px] font-extrabold text-white shadow-[0_4px_24px_rgba(255,106,0,0.45)]"
            >
              {data.primaryCta.label}
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>

        {/* HIGHLIGHTS */}
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-24"
        >
          {data.highlights.map((highlight, index) => (
            <div key={index} className="rounded-[24px] border border-white/5 bg-zinc-950/40 p-6 backdrop-blur-sm transition-all hover:border-[#ff6a00]/30 hover:bg-white/5">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff6a00]/10 text-[#ff8f3a] border border-[#ff6a00]/20 mb-5">
                {iconMap[highlight.icon] || <Target size={20} />}
              </span>
              <h3 className="text-[18px] font-bold text-white mb-2">{highlight.title}</h3>
              <p className="text-[13px] text-slate-400 leading-relaxed">{highlight.description}</p>
            </div>
          ))}
        </motion.div>

        {/* SECTIONS */}
        <div className="space-y-24">
          {data.sections.map((section, index) => (
            <motion.div
              key={index}
              variants={revealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className={`flex flex-col lg:flex-row gap-12 items-center ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
            >
              <div className="flex-1 space-y-6">
                <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight">
                  {section.title}
                </h2>
                <p className="text-[16px] text-slate-300 leading-relaxed">
                  {section.description}
                </p>
                <ul className="space-y-4 pt-4">
                  {section.bullets?.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ff6a00]/20 text-[#ff8f3a]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#ff6a00]" />
                      </span>
                      <span className="text-[15px] text-slate-300 leading-snug">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-1 w-full">
                <div className="relative aspect-square md:aspect-video lg:aspect-square w-full rounded-[32px] border border-white/5 bg-zinc-900/50 overflow-hidden shadow-[0_18px_48px_rgba(0,0,0,0.5)]">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,106,0,0.1)_0%,transparent_70%)]" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Placeholder gráfico/decorativo para a seção */}
                    <div className="w-32 h-32 rounded-full border border-[#ff6a00]/30 animate-pulse bg-[#ff6a00]/5 flex items-center justify-center">
                      <Target className="text-[#ff6a00]/40" size={48} />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </main>
  );
}
