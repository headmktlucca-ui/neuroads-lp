'use client';

import { motion, Variants } from 'framer-motion';
import { ArrowRight, Bot, BarChart2, TrendingDown, DollarSign, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { type SubmenuPageContent } from '@/components/neuroads/SubmenuPageShell';



const reveal: Variants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
};

const stagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

// ─── Shared Motion Section Wrapper ────────────────────────────────────────────

function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <motion.div
      id={id}
      variants={reveal}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── FAQ Item ─────────────────────────────────────────────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/8 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="text-[15px] font-black text-white leading-snug">{q}</span>
        {open
          ? <ChevronUp size={16} className="shrink-0 text-[#ff8f3a]" />
          : <ChevronDown size={16} className="shrink-0 text-slate-400" />}
      </button>
      {open && (
        <p className="pb-5 text-[14px] leading-relaxed text-slate-300 pr-6">{a}</p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LaboratorioClient({ content }: { content: SubmenuPageContent }) {
  return (
    <main className="relative min-h-screen bg-[#000000] text-white overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 700px 700px at 20% 0%, rgba(255,106,0,0.07) 0%, transparent 65%)',
            'radial-gradient(ellipse 600px 600px at 80% 30%, rgba(30,30,30,0.12) 0%, transparent 65%)',
            'radial-gradient(ellipse 500px 500px at 40% 100%, rgba(255,106,0,0.04) 0%, transparent 65%)',
          ].join(', '),
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10">


        <div className="mx-auto max-w-[1200px] px-5 md:px-10 lg:px-16 pt-36 pb-28 space-y-28">

          {/* ── 1. HERO ── */}
          <Section className="text-center max-w-[820px] mx-auto">
            <span className="inline-block rounded-full border border-[#ff6a00]/30 bg-[#ff6a00]/10 px-4 py-1.5 mb-7">
              <span className="text-[12px] font-black uppercase tracking-[0.18em] text-[#ff8f3a]">
                {content.eyebrow}
              </span>
            </span>
            <h1 className="text-[42px] md:text-[58px] font-black leading-[1.05] tracking-tight text-white text-balance">
              {content.headline}{' '}
              <span className="text-[#ff6a00]">{content.highlightedHeadline}</span>
            </h1>
            <p className="mt-6 text-[17px] sm:text-[19px] text-white/75 leading-relaxed max-w-[700px] mx-auto">
              {content.subheadline}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                href="/a-neuroads/contato"
                className="inline-flex items-center gap-2 rounded-xl bg-[#ff6a00] px-7 py-3.5 text-[14px] font-black text-white shadow-[0_12px_28px_rgba(255,106,0,0.32)] transition hover:bg-[#e95f00] hover:scale-[1.02]"
              >
                Solicitar diagnóstico
                <ArrowRight size={16} />
              </Link>
              <Link
                href="#agentes"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/6 px-7 py-3.5 text-[14px] font-black text-white/90 transition hover:border-[#ff6a00]/40 hover:text-[#ff8f3a]"
              >
                Ver agentes disponíveis
              </Link>
            </div>
          </Section>

          {/* ── 2. PROOF METRICS ── */}
          {content.proofMetrics?.length ? (
            <Section>
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                {content.proofMetrics.map((m) => (
                  <motion.div
                    key={m.label}
                    variants={fadeUp}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center"
                  >
                    <p className="text-[44px] font-black tracking-tight text-[#ff6a00] leading-none">{m.value}</p>
                    <p className="mt-2 text-[13px] font-black uppercase tracking-[0.14em] text-white">{m.label}</p>
                    <p className="mt-2 text-[13px] text-slate-400 leading-snug">{m.detail}</p>
                  </motion.div>
                ))}
              </motion.div>
            </Section>
          ) : null}

          {/* ── 3. PAIN POINTS ── */}
          {content.painPoints?.length ? (
            <Section>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#ff8f3a] mb-4">O problema</p>
                  <h2 className="text-[32px] md:text-[38px] font-black leading-tight text-white text-balance">
                    {content.copyContract?.pain}
                  </h2>
                  <p className="mt-5 text-[15px] text-slate-300 leading-relaxed">
                    {content.copyContract?.impactoFinanceiro}
                  </p>
                </div>
                <div className="space-y-3 lg:pt-12">
                  {content.painPoints.map((point, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3.5"
                    >
                      <TrendingDown size={16} className="text-rose-400 shrink-0 mt-0.5" />
                      <span className="text-[14px] text-slate-300 leading-snug">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          ) : null}

          {/* ── 4. HOW IT WORKS ── */}
          {content.howItWorks?.length ? (
            <Section>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#ff8f3a] mb-4">Como funciona</p>
              <h2 className="text-[32px] md:text-[38px] font-black leading-tight text-white mb-10 max-w-[600px]">
                {content.copyContract?.metodo}
              </h2>
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {content.howItWorks.map((step, i) => {
                  const [title, ...rest] = step.split(':');
                  return (
                    <motion.div
                      key={i}
                      variants={fadeUp}
                      className="flex gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-5"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#ff6a00]/30 bg-[#ff6a00]/10 text-[12px] font-black text-[#ff8f3a]">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-[14px] font-black text-white mb-1">{title.trim()}</p>
                        <p className="text-[13px] text-slate-400 leading-snug">{rest.join(':').trim()}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </Section>
          ) : null}

          {/* ── 5. AGENT CATALOG ── */}
          {content.agentExamples?.length ? (
            <Section id="agentes">
              <div className="flex items-center gap-3 mb-8">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ff6a00]/30 bg-[#ff6a00]/12 text-[#ff9a50]">
                  <Bot size={17} />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#ff8f3a]">Catálogo de Agentes</p>
                </div>
              </div>

              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex flex-col gap-3"
              >
                {content.agentExamples.map((agent) => (
                  <motion.div
                    key={agent.name}
                    variants={fadeUp}
                    className="group relative rounded-2xl border border-white/6 bg-zinc-950/70 px-5 py-5 flex flex-col md:flex-row md:items-center gap-5 hover:bg-zinc-900/80 hover:border-[#ff6a00]/25 transition-all hover:shadow-[0_4px_28px_rgba(255,106,0,0.07)]"
                  >
                    {/* Icon + Name */}
                    <div className="flex items-center gap-4 md:w-1/4 shrink-0">
                      {agent.icon.startsWith('/') ? (
                        <span className="relative inline-flex h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
                          <Image src={agent.icon} alt="" aria-hidden fill className="object-cover" sizes="48px" />
                        </span>
                      ) : (
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[28px]" aria-hidden>
                          {agent.icon}
                        </span>
                      )}
                      <h3 className="text-[15px] font-black text-white group-hover:text-[#ff8f3a] transition-colors leading-snug">
                        {agent.name}
                      </h3>
                    </div>

                    {/* Trigger */}
                    <div className="md:w-[30%]">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 mb-1.5">Gatilho</p>
                      <p className="text-[13px] text-slate-300 leading-relaxed">{agent.trigger}</p>
                    </div>

                    {/* Action */}
                    <div className="md:w-[35%]">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#ff8f3a]/70 mb-1.5">Execução</p>
                      <p className="text-[13px] text-white/80 leading-relaxed">{agent.action}</p>
                    </div>

                    {/* Metric */}
                    <div className="md:w-[10%] flex md:justify-end items-center pr-0 lg:pr-8">
                      {agent.metric && (
                        <span className="inline-block text-[12px] font-black text-[#ff9a50] bg-[#ff6a00]/10 px-3 py-1.5 rounded-lg border border-[#ff6a00]/20 tabular-nums whitespace-nowrap">
                          {agent.metric}
                        </span>
                      )}
                    </div>

                    {/* Hover arrow */}
                    <div className="hidden lg:flex absolute right-5 opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none">
                      <ArrowRight size={17} className="text-[#ff6a00]/50" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </Section>
          ) : null}

          {/* ── 6. IMPACT POINTS ── */}
          {content.impactPoints?.length ? (
            <Section className="rounded-[28px] border border-[#1f304c] bg-[radial-gradient(circle_at_20%_20%,rgba(255,106,0,0.18),rgba(9,15,28,0.95)_45%),linear-gradient(120deg,#070d19_0%,#0a1324_55%,#101e34_100%)] p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#ff8f3a] mb-4">Impacto no caixa</p>
                  <h2 className="text-[30px] md:text-[36px] font-black text-white leading-tight">
                    {content.copyContract?.promise}
                  </h2>
                  <p className="mt-5 text-[15px] text-white/70 leading-relaxed">
                    {content.copyContract?.prova}
                  </p>
                </div>
                <div className="space-y-3">
                  {content.impactPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3.5">
                      <DollarSign size={14} className="text-[#ff8f3a] shrink-0 mt-0.5" />
                      <span className="text-[14px] text-white/80 leading-snug">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          ) : null}

          {/* ── 7. FAQ ── */}
          {content.faq?.length ? (
            <Section>
              <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10 items-start">
                <div className="lg:sticky lg:top-28">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#ff8f3a] mb-4">Dúvidas frequentes</p>
                  <h2 className="text-[30px] md:text-[36px] font-black text-white leading-tight">
                    Respostas diretas para decisões rápidas
                  </h2>
                  <p className="mt-4 text-[15px] text-slate-400 leading-relaxed">
                    {content.copyContract?.cta}
                  </p>
                  <Link
                    href="/a-neuroads/contato"
                    className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#ff6a00] px-6 py-3 text-[14px] font-black text-white shadow-[0_12px_24px_rgba(255,106,0,0.28)] transition hover:bg-[#e95f00]"
                  >
                    Falar com especialista
                    <ArrowRight size={15} />
                  </Link>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-6 divide-y divide-white/8">
                  {content.faq.map((item) => (
                    <FaqItem key={item.question} q={item.question} a={item.answer} />
                  ))}
                </div>
              </div>
            </Section>
          ) : null}

          {/* ── 8. RELATED PAGES ── */}
          {content.relatedPages?.length ? (
            <Section>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#ff8f3a] mb-6">Próximos passos</p>
              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
              >
                {content.relatedPages.map((page) => (
                  <motion.div key={page.href} variants={fadeUp}>
                    <Link
                      href={page.href}
                      className="group flex items-start justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] px-5 py-4 hover:border-[#ff6a00]/30 hover:bg-white/[0.06] transition-all"
                    >
                      <div>
                        <p className="text-[15px] font-black text-white group-hover:text-[#ff8f3a] transition-colors">{page.label}</p>
                        <p className="mt-1 text-[13px] text-slate-400 leading-snug">{page.description}</p>
                      </div>
                      <ArrowRight size={16} className="shrink-0 mt-1 text-slate-500 group-hover:text-[#ff6a00] group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </Section>
          ) : null}

        </div>


      </div>
    </main>
  );
}
