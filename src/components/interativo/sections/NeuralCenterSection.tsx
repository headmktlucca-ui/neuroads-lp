"use client";

import { motion } from "framer-motion";

const logs = [
  "[08:41] Agente Midia ajustou verba de campanha Search +7%",
  "[08:42] Agente Receita priorizou 14 leads com alta intencao",
  "[08:43] Agente GEO publicou resposta estruturada para nova consulta",
  "[08:44] Agente Atendimento executou 32 follow-ups em lote",
];

export function NeuralCenterSection() {
  return (
    <section data-story-section className="px-6 py-24 md:px-12">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#ffb15e]">Sessao 3 • Central Neural</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">
            O painel que traduz tudo para dinheiro e prioridade operacional.
          </h2>
          <p className="mt-4 text-base text-white/70 sm:text-lg">
            Receita, eficiencia, agentes e campanhas em um fluxo vivo que mostra exatamente onde escalar e onde cortar desperdicio.
          </p>
        </div>

        <motion.div
          className="rounded-[2rem] border border-white/15 bg-white/6 p-5 backdrop-blur-2xl sm:p-7"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-90px" }}
          transition={{ duration: 0.75 }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard label="Receita monitorada" value="R$ 1.42M" trend="+18.3%" />
            <MetricCard label="Eficiencia operacional" value="93.6%" trend="+9.1%" />
            <MetricCard label="Agentes ativos" value="18" trend="tempo real" />
            <MetricCard label="Campanhas em execucao" value="47" trend="otimizando" />
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-white/55">Wave Chart</p>
            <div className="mt-3 h-24 overflow-hidden rounded-xl bg-black/25 p-3">
              <div className="relative h-full">
                <motion.div
                  className="absolute inset-x-0 bottom-0 h-12 rounded-full bg-gradient-to-r from-[#ff6a00]/20 via-[#ffb15e]/45 to-transparent blur-xl"
                  animate={{ x: ["-15%", "15%", "-15%"] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="absolute inset-0 grid grid-cols-20 items-end gap-1">
                  {Array.from({ length: 20 }).map((_, index) => (
                    <motion.span
                      key={`wave-${index}`}
                      className="w-full rounded-full bg-gradient-to-t from-[#ff6a00] to-[#ffd2a1]"
                      animate={{
                        height: [14 + (index % 4) * 4, 36 + (index % 6) * 6, 16 + (index % 5) * 4],
                      }}
                      transition={{
                        duration: 1.8 + (index % 5) * 0.24,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {logs.map((log, index) => (
              <motion.p
                key={log}
                className="rounded-xl border border-white/8 bg-black/20 px-3 py-2 text-sm text-white/72"
                initial={{ opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                {log}
              </motion.p>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function MetricCard({ label, value, trend }: { label: string; value: string; trend: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4">
      <p className="text-sm text-white/65">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#ffb15e]">{trend}</p>
    </article>
  );
}
