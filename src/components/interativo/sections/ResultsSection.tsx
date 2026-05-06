"use client";

import { METRICS } from "@/lib/interativo/content";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function ResultsSection() {
  return (
    <section data-story-section className="px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl rounded-[2.2rem] border border-white/12 bg-white/7 p-7 backdrop-blur-2xl sm:p-10">
        <p className="text-xs uppercase tracking-[0.22em] text-[#ffb15e]">Sessao 5 • Resultados</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">
          Performance traduzida para caixa, previsibilidade e escala real.
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {METRICS.map((metric, index) => (
            <motion.div
              key={metric.label}
              className="rounded-2xl border border-white/12 bg-black/30 px-5 py-6"
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-70px" }}
              transition={{ delay: index * 0.08, duration: 0.6 }}
            >
              <p className="text-sm text-white/70">{metric.label}</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-white">
                {metric.prefix}
                <CountUp target={metric.value} />
                {metric.suffix}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CountUp({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const duration = 1450;
    const startedAt = performance.now();

    let frame = 0;

    const loop = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);

      if (progress < 1) {
        frame = window.requestAnimationFrame(loop);
      }
    };

    frame = window.requestAnimationFrame(loop);

    return () => window.cancelAnimationFrame(frame);
  }, [isInView, target]);

  const display = Number.isInteger(target) ? Math.round(value).toString() : value.toFixed(2);

  return <span ref={ref}>{display}</span>;
}
