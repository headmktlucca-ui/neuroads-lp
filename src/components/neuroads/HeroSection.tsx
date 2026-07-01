'use client';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import RadialOrbitalTimeline from '../ui/radial-orbital-timeline';
import { agents } from '../../data/agents';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH1 = motion.h1;

export default function HeroSection() {
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as const }
  });

  // Build orbital items from the agent catalog
  const orbitalItems = agents.map((agent, idx) => ({
    id: idx + 1,
    title: agent.title,
    image: agent.icon,
    category: agent.category,
  }));

  return (
    <section className="relative min-h-[90vh] flex items-center pt-32 pb-20 overflow-hidden">
      <div className="wrap relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* LEFT — text content, left-aligned */}
          <div className="flex flex-col items-start">
            <MotionH1 {...fadeUp(0.25)} className="text-[43px] font-bold leading-[1.2] tracking-tight text-text-main mb-8 max-w-[580px]">
              Desbloqueie o <br />
              Potencial Oculto do <br />
              Seu Negócio: <span className="grad-text-animated">Marketing</span> <br />
              de <span className="grad-text-animated">Alta Performance</span> <br />
              com <span className="grad-text-animated">IA Agêntica</span>.
            </MotionH1>

            <MotionP {...fadeUp(0.4)} className="text-[18px] text-text-muted leading-relaxed max-w-[520px] mb-12 font-normal">
              Orquestre Agentes de IA que rodam fluxos de marketing de ponta a ponta. Velocidade, controle total e escala previsível.
            </MotionP>

            <MotionDiv {...fadeUp(0.5)}>
              <Link
                href="/#contato"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-black text-white font-bold text-sm hover:bg-black/90 transition-all"
              >
                Contato
                <ArrowRight size={16} />
              </Link>
            </MotionDiv>
          </div>

          {/* RIGHT — Orbital animation with agent avatars */}
          <MotionDiv
            {...fadeUp(0.5)}
            className="hidden lg:flex items-center justify-center relative"
          >
            <RadialOrbitalTimeline
              items={orbitalItems}
              centerLabel="Agentes IA"
            />
          </MotionDiv>

        </div>
      </div>
    </section>
  );
}
