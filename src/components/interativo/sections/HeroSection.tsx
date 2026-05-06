"use client";

import { MagneticButton } from "@/components/interativo/MagneticButton";
import { HERO_SUBHEADLINE } from "@/lib/interativo/content";
import { motion } from "framer-motion";

type HeroSectionProps = {
  headlineWords: string[];
};

export function HeroSection({ headlineWords }: HeroSectionProps) {
  return (
    <section
      id="hero"
      data-story-section
      className="relative flex min-h-screen items-center px-6 pb-18 pt-30 md:px-12"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div data-open-line className="h-px w-0 bg-gradient-to-r from-[#ff6a00] via-[#ffb15e] to-transparent" />

          <div className="flex gap-2" aria-hidden>
            {Array.from({ length: 9 }).map((_, index) => (
              <span
                key={`particle-${index}`}
                data-open-particle
                className="h-1.5 w-1.5 rounded-full bg-[#ff8c00]/80 opacity-0 blur-[0.5px]"
              />
            ))}
          </div>

          <div className="relative inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-5 py-2 text-xs uppercase tracking-[0.18em] text-white/80 backdrop-blur-xl">
            <span data-open-symbol className="h-2.5 w-2.5 rounded-full bg-[#ff8c00] shadow-[0_0_20px_rgba(255,140,0,0.8)]" />
            Sistema Operacional de Inteligencia Comercial
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.03] tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl">
            {headlineWords.map((word, index) => (
              <span key={`${word}-${index}`} className="interativo-headline-word mr-4 inline-block opacity-0 blur-md">
                {word}
              </span>
            ))}
          </h1>

          <p data-open-copy className="max-w-2xl text-lg text-white/74 sm:text-xl">
            {HERO_SUBHEADLINE}
          </p>

          <div data-open-cta className="flex flex-wrap items-center gap-4 pt-2">
            <MagneticButton>Ver operacao em tempo real</MagneticButton>
            <MagneticButton className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:shadow-[0_0_38px_rgba(255,255,255,0.2)]">
              Ativar Agente IA
            </MagneticButton>
          </div>
        </div>

        <motion.aside
          data-open-dashboard
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.8 }}
          className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/7 p-6 backdrop-blur-2xl"
        >
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#ff6a00]/25 blur-3xl" />
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">Mini Dashboard Vivo</p>
          <div className="mt-6 space-y-4">
            <DashboardRow label="Agentes ativos" value="18" trend="+4 hoje" />
            <DashboardRow label="Receita prevista" value="R$ 248k" trend="+12%" />
            <DashboardRow label="Efetividade comercial" value="94%" trend="estavel" />
          </div>

          <div className="mt-8 space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Sinais operacionais</p>
            <div className="h-28 rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="grid h-full grid-cols-12 items-end gap-1.5">
                {[22, 34, 16, 48, 64, 38, 72, 46, 60, 78, 70, 86].map((height, index) => (
                  <motion.span
                    key={`bar-${index}`}
                    className="w-full rounded-full bg-gradient-to-t from-[#ff6a00] to-[#ffb15e]"
                    initial={{ height: 8 }}
                    animate={{ height }}
                    transition={{ duration: 1.2, delay: 0.2 + index * 0.04, repeat: Infinity, repeatType: "reverse", repeatDelay: 1.8 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}

function DashboardRow({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
      <p className="text-sm text-white/68">{label}</p>
      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="text-2xl font-semibold text-white">{value}</p>
        <p className="text-xs uppercase tracking-[0.15em] text-[#ffb15e]">{trend}</p>
      </div>
    </div>
  );
}
