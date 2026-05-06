"use client";

import { CHAT_STEPS } from "@/lib/interativo/content";
import { motion } from "framer-motion";

export function LuccaSection() {
  return (
    <section data-story-section className="px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl rounded-[2.2rem] border border-white/12 bg-black/40 p-6 backdrop-blur-2xl sm:p-10">
        <p className="text-xs uppercase tracking-[0.22em] text-[#ffb15e]">Sessao 6 • Lucca IA</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">
          O secretario executivo operacional da sua empresa, em tempo real.
        </h2>

        <div className="mt-8 rounded-3xl border border-white/10 bg-[#101010]/85 p-4 sm:p-6">
          <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/55">Lucca IA Console</p>
              <p className="text-sm text-white/78">Operacao sincronizada com Marketing, Comercial e Atendimento</p>
            </div>
            <span className="rounded-full border border-emerald-300/40 bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-200">
              Online
            </span>
          </div>

          <div className="space-y-3">
            {CHAT_STEPS.map((step, index) => (
              <motion.div
                key={`${step.role}-${index}`}
                className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3"
                initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true, margin: "-90px" }}
                transition={{ delay: index * 0.12, duration: 0.55 }}
              >
                <p className="text-xs uppercase tracking-[0.14em] text-[#ffb15e]">{step.role}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/82">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
