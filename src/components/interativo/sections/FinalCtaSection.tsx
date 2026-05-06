"use client";

import { MagneticButton } from "@/components/interativo/MagneticButton";
import { motion } from "framer-motion";

export function FinalCtaSection() {
  return (
    <section data-story-section className="px-6 pb-24 pt-20 md:px-12">
      <motion.div
        className="mx-auto max-w-7xl overflow-hidden rounded-[2.4rem] border border-white/12 bg-[radial-gradient(circle_at_50%_0%,rgba(255,140,0,0.28),rgba(14,14,14,0.96)_60%)] px-8 py-16 text-center sm:px-14"
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-90px" }}
        transition={{ duration: 0.7 }}
      >
        <p className="text-xs uppercase tracking-[0.22em] text-white/65">Sessao Final • CTA Cinematografico</p>
        <h2 className="mx-auto mt-4 max-w-4xl text-3xl font-semibold tracking-[-0.02em] text-white sm:text-6xl">
          Implante inteligencia operacional na sua empresa.
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base text-white/75 sm:text-lg">
          Menos ferramentas desconectadas. Mais sistema, dados reais e crescimento previsivel com especialista senior por tras de cada decisao.
        </p>

        <div className="mt-8 flex justify-center">
          <MagneticButton>Quero uma demonstracao</MagneticButton>
        </div>
      </motion.div>
    </section>
  );
}
