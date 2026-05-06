"use client";

import { AGENTS } from "@/lib/interativo/content";
import { motion } from "framer-motion";

export function AgentsHubSection() {
  return (
    <section data-story-section className="px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs uppercase tracking-[0.22em] text-[#ffb15e]">Sessao 4 • Hub de Agentes IA</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">
          Hologramas operacionais que executam tarefas criticas sem perder contexto da sua marca.
        </h2>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {AGENTS.map((agent, index) => (
            <motion.article
              key={agent.name}
              className="group relative overflow-hidden rounded-[1.7rem] border border-white/12 bg-white/8 p-5 backdrop-blur-xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, delay: index * 0.06 }}
              whileHover={{ y: -8, scale: 1.01 }}
            >
              <div className="pointer-events-none absolute -right-8 -top-12 h-32 w-32 rounded-full bg-[#ff6a00]/20 blur-2xl transition group-hover:bg-[#ff8c00]/35" />
              <div className="relative flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-black/25 text-lg text-white">
                  AI
                </div>
                <div>
                  <p className="text-sm text-white/72">{agent.status}</p>
                  <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                </div>
              </div>

              <div className="relative mt-5 h-12 rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                <div className="grid h-full grid-cols-14 items-end gap-1">
                  {Array.from({ length: 14 }).map((_, waveIndex) => (
                    <motion.span
                      key={`${agent.name}-wave-${waveIndex}`}
                      className="w-full rounded-full bg-gradient-to-t from-[#ff6a00] to-[#ffe2bf]"
                      animate={{ height: [8 + ((waveIndex + index) % 3) * 6, 24 + ((waveIndex + index) % 4) * 7, 10] }}
                      transition={{
                        duration: 1.5 + (waveIndex % 4) * 0.22,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              </div>

              <p className="relative mt-4 text-sm leading-relaxed text-white/74">{agent.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
