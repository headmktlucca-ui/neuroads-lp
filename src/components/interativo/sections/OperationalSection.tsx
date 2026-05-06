"use client";

import { TiltCard } from "@/components/interativo/TiltCard";
import { OPERATIONAL_CARDS } from "@/lib/interativo/content";
import { motion } from "framer-motion";

export function OperationalSection() {
  return (
    <section data-story-section className="px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs uppercase tracking-[0.22em] text-[#ffb15e]">Sessao 2 • Inteligencia Operacional</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">
          Cada area da sua operacao conectada em um unico ecossistema de performance.
        </h2>
        <p className="mt-4 max-w-3xl text-base text-white/70 sm:text-lg">
          Aqui nao existe campanha isolada. Existe sistema vivo alinhado a dados reais, eficiencia comercial e escala previsivel.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {OPERATIONAL_CARDS.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.75, delay: index * 0.05 }}
            >
              <TiltCard title={item.title} body={item.body} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
