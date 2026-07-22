'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, CircleHelp, FolderKanban, Gauge, Goal, Handshake, Layers3, ChevronDown } from 'lucide-react';


import HomePageBackground from './HomePageBackground';
import { submitLuccaLeadAction } from '@/app/actions/lucca-leads';

type IconKey = 'goal' | 'layers' | 'gauge' | 'handshake' | 'faq' | 'resource';

type HighlightItem = {
  title: string;
  description: string;
  icon: IconKey;
};

type SectionBlock = {
  title: string;
  description: string;
  bullets: string[];
};

type ProcessStep = {
  title: string;
  detail: string;
};

type ResourceCard = {
  title: string;
  description: string;
  href: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type ComparisonColumn = {
  title: string;
  points: string[];
};

type ComparisonBlock = {
  eyebrow?: string;
  title: string;
  description: string;
  left: ComparisonColumn;
  right: ComparisonColumn;
};

type MiniCase = {
  segment: string;
  bottleneck: string;
  result: string;
};

type FinalCtaBanner = {
  eyebrow?: string;
  title: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

type CaptureFormConfig = {
  title: string;
  description: string;
  ctaLabel: string;
  flow: 'analise' | 'claudio' | 'mensagem_livre';
  serviceContext: string;
  successMessage: string;
  includeSite?: boolean;
  includeMessage?: boolean;
};

export type StrategicContentPageData = {
  slug: string;
  eyebrow: string;
  title: string;
  highlightedTitle: string;
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  highlights: HighlightItem[];
  sections: SectionBlock[];
  process?: ProcessStep[];
  processTitle?: string;
  processDescription?: string;
  comparison?: ComparisonBlock;
  miniCases?: MiniCase[];
  resources?: ResourceCard[];
  resourcesTitle?: string;
  faq?: FaqItem[];
  form?: CaptureFormConfig;
  finalCtaBanner?: FinalCtaBanner;
};

function getIcon(icon: IconKey) {
  switch (icon) {
    case 'goal':
      return Goal;
    case 'layers':
      return Layers3;
    case 'gauge':
      return Gauge;
    case 'handshake':
      return Handshake;
    case 'faq':
      return CircleHelp;
    case 'resource':
      return FolderKanban;
    default:
      return Goal;
  }
}

export default function StrategicContentPageShell({ data }: { data: StrategicContentPageData }) {
  const [openFaq, setOpenFaq] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);
  const [isSobreOpen, setIsSobreOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    site: '',
    message: '',
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!data.form) return;

    const name = form.name.trim();
    const email = form.email.trim();
    const whatsapp = form.whatsapp.trim();
    const site = form.site.trim();
    const message = form.message.trim();

    if (!name || (!email && !whatsapp)) {
      setStatusType('error');
      setStatusMessage('Informe pelo menos Nome e um canal de retorno (Email ou WhatsApp).');
      return;
    }

    setSubmitting(true);
    setStatusType(null);
    setStatusMessage('');

    const result = await submitLuccaLeadAction({
      flow: data.form.flow,
      clientName: name,
      email,
      whatsapp,
      site: site || undefined,
      message: message || `Solicitação enviada pela página ${data.slug}.`,
      pageSlug: data.slug,
      serviceContext: data.form.serviceContext,
      timestamp: new Date().toISOString(),
    });

    setSubmitting(false);
    if (!result.success) {
      setStatusType('error');
      setStatusMessage(result.error || 'Não consegui enviar agora. Tente novamente em instantes.');
      return;
    }

    setStatusType('success');
    setStatusMessage(data.form.successMessage);
    setForm({ name: '', email: '', whatsapp: '', site: '', message: '' });
  };

  return (
    <main className="bg-[#EDF1F5] min-h-screen text-slate-800 font-sans antialiased overflow-x-clip pb-16 selection:bg-[#FF5500]/20 selection:text-[#FF5500] relative">
      <header className="sticky top-4 z-[999] max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="bg-[#EDF1F5] shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] border border-white/50 rounded-full py-4 px-8 flex items-center justify-between transition-all duration-300">
          {/* Logo */}
          <Link href="/" className="flex items-center group transition-transform duration-300 hover:scale-[1.01]">
            <Image
              src="/images/Logos/Logo_primario.png"
              alt="NeuroAds Logo"
              width={172}
              height={39}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <div 
              className="relative"
              onMouseEnter={() => setIsSobreOpen(true)}
              onMouseLeave={() => setIsSobreOpen(false)}
            >
              <span 
                className="flex items-center gap-1 text-slate-600 font-medium text-sm hover:text-[#FF5500] transition-colors duration-200 py-2 focus:outline-none cursor-pointer select-none"
              >
                Sobre
                <motion.span
                  animate={{ rotate: isSobreOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={14} className="text-slate-400" />
                </motion.span>
              </span>

              <AnimatePresence>
                {isSobreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-56 z-50"
                  >
                    <div className="bg-[#EDF1F5] shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] border border-white/50 rounded-2xl p-2.5 flex flex-col gap-1">
                      <Link 
                        href="/a-neuroads/sobre#posicionamento" 
                        onClick={() => setIsSobreOpen(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl hover:bg-[#e4ecf5] hover:text-[#FF5500] transition-all duration-150"
                      >
                        Posicionamento
                      </Link>
                      <Link 
                        href="/a-neuroads/sobre#pilares" 
                        onClick={() => setIsSobreOpen(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl hover:bg-[#e4ecf5] hover:text-[#FF5500] transition-all duration-150"
                      >
                        Nossos pilares
                      </Link>
                      <Link 
                        href="/a-neuroads/sobre" 
                        onClick={() => setIsSobreOpen(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl hover:bg-[#e4ecf5] hover:text-[#FF5500] transition-all duration-150"
                      >
                        Quem somos
                      </Link>
                      <Link 
                        href="/a-neuroads/sobre#imprensa" 
                        onClick={() => setIsSobreOpen(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl hover:bg-[#e4ecf5] hover:text-[#FF5500] transition-all duration-150"
                      >
                        Imprensa
                      </Link>
                      <Link 
                        href="/privacidade" 
                        onClick={() => setIsSobreOpen(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl hover:bg-[#e4ecf5] hover:text-[#FF5500] transition-all duration-150"
                      >
                        Política de Privacidade
                      </Link>
                      <Link 
                        href="/termos" 
                        onClick={() => setIsSobreOpen(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl hover:bg-[#e4ecf5] hover:text-[#FF5500] transition-all duration-150"
                      >
                        Termos e DPA
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/#algoritmo" className="text-slate-600 font-medium text-sm hover:text-[#FF5500] transition-colors duration-200">
              Além do Algoritmo
            </Link>
            <Link href="/#valores" className="text-slate-600 font-medium text-sm hover:text-[#FF5500] transition-colors duration-200">
              Valores
            </Link>
          </nav>

          {/* Action Button */}
          <div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center font-bold text-xs px-6 py-2.5 rounded-full bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white shadow-[0_4px_14px_rgba(15,23,42,0.35)] border border-slate-700/80 hover:from-[#1e293b] hover:to-[#0f172a] hover:shadow-[0_6px_18px_rgba(15,23,42,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <div className="relative z-10">
        <section className="mx-auto max-w-[1260px] px-5 pb-14 pt-5 md:px-8">
        <div className="h-[24px]" />

        <section className="rounded-[32px] border border-white/50 bg-[#EDF1F5] px-6 py-8 shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] md:px-8">
          <span className="inline-flex rounded-full border border-white/40 bg-[#EDF1F5] shadow-[inset_2px_2px_5px_#c8d0e7,inset_-2px_-2px_5px_#ffffff] px-4 py-1.5 text-[9px] font-bold tracking-widest text-slate-500 uppercase">
            {data.eyebrow}
          </span>

          <h1 className="mt-5 text-[30px] font-black leading-[1.05] tracking-[-0.02em] text-[#0f1730] sm:text-[35px] lg:text-[46px]">
            {data.title}{' '}
            <span
              className="bg-[length:200%_200%] bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #ff9a35 0%, #ff6a00 55%, #c84a00 100%)' }}
            >
              {data.highlightedTitle}
            </span>
          </h1>

          <p className="mt-4 max-w-[860px] text-[16px] leading-relaxed text-[#47526b] sm:text-[17px] lg:text-[18px]">{data.subtitle}</p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href={data.primaryCta.href}
              className="inline-flex items-center gap-2 rounded-xl bg-[#ff6a00] px-6 py-3 text-[14px] font-black text-white shadow-[0_12px_28px_rgba(255,106,0,0.3)] transition hover:bg-[#e95f00]"
            >
              {data.primaryCta.label}
              <ArrowRight size={16} />
            </Link>
            {data.secondaryCta ? (
              <Link
                href={data.secondaryCta.href}
                className="inline-flex items-center gap-2 rounded-xl border border-[#dce3ef] bg-white px-6 py-3 text-[14px] font-black text-[#202a3f] transition hover:border-[#ffcaa8] hover:text-[#ff6a00]"
              >
                {data.secondaryCta.label}
                <ArrowRight size={16} />
              </Link>
            ) : null}
          </div>
        </section>

        <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.highlights.map((item) => {
            const Icon = getIcon(item.icon);
            return (
              <article key={item.title} className="rounded-[22px] border border-white/50 bg-[#EDF1F5] px-5 py-5 shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff]">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-[#EDF1F5] shadow-[inset_2px_2px_4px_#c8d0e7,inset_-2px_-2px_4px_#ffffff] text-[#ff6a00]">
                  <Icon size={17} strokeWidth={2.2} />
                </div>
                <h2 className="mt-3 text-[17px] font-black leading-tight text-slate-800">{item.title}</h2>
                <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{item.description}</p>
              </article>
            );
          })}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          {data.sections.map((block) => (
            <article key={block.title} className="rounded-[24px] border border-white/50 bg-[#EDF1F5] p-6 shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] md:p-8">
              <h3 className="text-[26px] font-black leading-tight text-slate-800">{block.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{block.description}</p>
              <ul className="mt-4 space-y-2.5 text-[15px] text-slate-700">
                {block.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff6a00]" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        {data.process?.length ? (
          <section className="mt-8 rounded-[26px] border border-white/50 bg-[#EDF1F5] p-6 shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] md:p-8">
            <h3 className="text-[30px] font-black leading-tight text-slate-800">
              {data.processTitle || 'Como funciona na prática'}
            </h3>
            {data.processDescription ? (
              <p className="mt-2 max-w-[880px] text-[15px] leading-relaxed text-slate-600">{data.processDescription}</p>
            ) : null}
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {data.process.map((step, index) => (
                <article key={step.title} className="rounded-2xl border border-white/30 bg-[#EDF1F5] shadow-[inset_2px_2px_5px_#c8d0e7,inset_-2px_-2px_5px_#ffffff] p-4">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-[#EDF1F5] shadow-[4px_4px_8px_#c8d0e7,-4px_-4px_8px_#ffffff] text-[12px] font-black text-[#ff6a00]">
                    {index + 1}
                  </div>
                  <h4 className="mt-3 text-[16px] font-black text-slate-800">{step.title}</h4>
                  <p className="mt-2 text-[14px] leading-relaxed text-slate-600">{step.detail}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {data.comparison ? (
          <section className="mt-8 overflow-hidden rounded-[26px] border border-[#1f304c] bg-[radial-gradient(circle_at_20%_20%,rgba(255,106,0,0.20),rgba(9,15,28,0.94)_45%),linear-gradient(120deg,#070d19_0%,#0a1324_55%,#101e34_100%)] p-6 text-white shadow-[0_22px_42px_rgba(8,14,26,0.36)] md:p-8">
            <p className="inline-flex rounded-full border border-[rgba(255,153,84,0.5)] bg-[rgba(255,127,43,0.16)] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#ffc596]">
              {data.comparison.eyebrow || 'Comparativo de operação'}
            </p>
            <h3 className="mt-4 text-[30px] font-black leading-tight text-[#f8fbff]">{data.comparison.title}</h3>
            <p className="mt-2 max-w-[920px] text-[15px] leading-relaxed text-[rgba(236,242,255,0.82)]">{data.comparison.description}</p>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-[rgba(255,255,255,0.14)] bg-[rgba(255,255,255,0.04)] p-5">
                <h4 className="text-[18px] font-black text-[#ffd6b6]">{data.comparison.left.title}</h4>
                <ul className="mt-3 space-y-2.5 text-[14px] leading-relaxed text-[rgba(236,242,255,0.86)]">
                  {data.comparison.left.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff8f3a]" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
              <article className="rounded-2xl border border-[rgba(255,155,89,0.34)] bg-[rgba(255,106,0,0.08)] p-5">
                <h4 className="text-[18px] font-black text-[#ffd6b6]">{data.comparison.right.title}</h4>
                <ul className="mt-3 space-y-2.5 text-[14px] leading-relaxed text-[rgba(236,242,255,0.9)]">
                  {data.comparison.right.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff8f3a]" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </div>
          </section>
        ) : null}

        {data.miniCases?.length ? (
          <section className="mt-8 rounded-[26px] border border-white/50 bg-[#EDF1F5] p-6 shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] md:p-8">
            <h3 className="text-[30px] font-black leading-tight text-[#0f1730]">Mini-cases de impacto no caixa</h3>
            <p className="mt-2 max-w-[900px] text-[15px] leading-relaxed text-[#4f5c75]">
              Casos típicos de PME em crescimento travado. O objetivo é transformar operação reativa em escala previsível.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {data.miniCases.map((item) => (
                <article key={`${item.segment}-${item.bottleneck}`} className="rounded-2xl border border-white/30 bg-[#EDF1F5] shadow-[inset_2px_2px_5px_#c8d0e7,inset_-2px_-2px_5px_#ffffff] p-4">
                  <p className="text-[12px] font-black uppercase tracking-[0.12em] text-[#ff6a00]">{item.segment}</p>
                  <h4 className="mt-2 text-[16px] font-black text-[#152344]">{item.bottleneck}</h4>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#4f5c75]">{item.result}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {data.resources?.length ? (
          <section className="mt-8 rounded-[26px] border border-white/50 bg-[#EDF1F5] p-6 shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] md:p-8">
            <h3 className="text-[30px] font-black leading-tight text-[#0f1730]">
              {data.resourcesTitle || 'Trilhas e recursos recomendados'}
            </h3>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {data.resources.map((resource) => (
                <Link
                  key={resource.title}
                  href={resource.href}
                  className="group rounded-2xl border border-white/30 bg-[#EDF1F5] shadow-[4px_4px_8px_#c8d0e7,-4px_-4px_8px_#ffffff] p-4 transition hover:shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff] hover:bg-[#e4ecf5]"
                >
                  <h4 className="text-[17px] font-black text-[#112043]">{resource.title}</h4>
                  <p className="mt-2 text-[14px] leading-relaxed text-[#5a6680]">{resource.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-black text-[#ff6a00]">
                    Acessar
                    <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className={`mt-8 grid gap-6 ${data.form ? 'lg:grid-cols-[1fr_1fr]' : ''}`}>
          {data.faq?.length ? (
            <article className="rounded-[26px] border border-white/50 bg-[#EDF1F5] p-6 shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] md:p-8">
              <div className="inline-flex items-center gap-2 text-[#ff6a00]">
                <CircleHelp size={18} />
                <p className="text-[12px] font-black uppercase tracking-[0.14em]">Perguntas frequentes</p>
              </div>
              <h3 className="mt-4 text-[30px] font-black leading-tight text-[#0f1730]">Respostas rápidas e objetivas</h3>
              <div className="mt-5 space-y-2">
                {data.faq.map((item, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <article key={item.question} className="rounded-2xl border border-white/30 bg-[#EDF1F5] shadow-[inset_2px_2px_5px_#c8d0e7,inset_-2px_-2px_5px_#ffffff]">
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                        onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      >
                        <span className="text-[15px] font-black text-[#1a2743]">{item.question}</span>
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#dce3ef] text-[#64718c]">
                          {isOpen ? '−' : '+'}
                        </span>
                      </button>
                      {isOpen ? <p className="px-4 pb-4 text-[14px] leading-relaxed text-[#4f5c75]">{item.answer}</p> : null}
                    </article>
                  );
                })}
              </div>
            </article>
          ) : null}

          {data.form ? (
            <article className="rounded-[26px] border border-white/50 bg-[#EDF1F5] p-6 shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] md:p-8">
              <div className="inline-flex items-center gap-2 text-[#ff6a00]">
                <CheckCircle2 size={18} />
                <p className="text-[12px] font-black uppercase tracking-[0.14em]">Próximo passo</p>
              </div>
              <h3 className="mt-4 text-[30px] font-black leading-tight text-[#0f1730]">{data.form.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#4f5c75]">{data.form.description}</p>

              <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
                <input
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  placeholder="Nome"
                  className="w-full rounded-xl bg-[#EDF1F5] shadow-[inset_2px_2px_5px_#c8d0e7,inset_-2px_-2px_5px_#ffffff] border border-white/30 px-3.5 py-3 text-[15px] font-medium text-slate-800 outline-none focus:border-[#FF5500]/30"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    placeholder="Email"
                    type="email"
                    className="w-full rounded-xl bg-[#EDF1F5] shadow-[inset_2px_2px_5px_#c8d0e7,inset_-2px_-2px_5px_#ffffff] border border-white/30 px-3.5 py-3 text-[15px] font-medium text-slate-800 outline-none focus:border-[#FF5500]/30"
                  />
                  <input
                    value={form.whatsapp}
                    onChange={(event) => setForm((prev) => ({ ...prev, whatsapp: event.target.value }))}
                    placeholder="WhatsApp"
                    className="w-full rounded-xl bg-[#EDF1F5] shadow-[inset_2px_2px_5px_#c8d0e7,inset_-2px_-2px_5px_#ffffff] border border-white/30 px-3.5 py-3 text-[15px] font-medium text-slate-800 outline-none focus:border-[#FF5500]/30"
                  />
                </div>
                {data.form.includeSite === false ? null : (
                  <input
                    value={form.site}
                    onChange={(event) => setForm((prev) => ({ ...prev, site: event.target.value }))}
                    placeholder="Site da Empresa"
                    className="w-full rounded-xl bg-[#EDF1F5] shadow-[inset_2px_2px_5px_#c8d0e7,inset_-2px_-2px_5px_#ffffff] border border-white/30 px-3.5 py-3 text-[15px] font-medium text-slate-800 outline-none focus:border-[#FF5500]/30"
                  />
                )}
                {data.form.includeMessage === false ? null : (
                  <textarea
                    value={form.message}
                    onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
                    placeholder="Descreva em uma frase seu principal desafio hoje"
                    rows={4}
                    className="w-full resize-none rounded-xl bg-[#EDF1F5] shadow-[inset_2px_2px_5px_#c8d0e7,inset_-2px_-2px_5px_#ffffff] border border-white/30 px-3.5 py-3 text-[15px] font-medium text-slate-800 outline-none focus:border-[#FF5500]/30"
                  />
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#FF7A00] px-5 py-3 text-[14px] font-black text-white shadow-[4px_4px_12px_rgba(255,85,0,0.3),-4px_-4px_12px_#ffffff] hover:shadow-[6px_6px_16px_rgba(255,85,0,0.45),-6px_-6px_16px_#ffffff] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-70 border border-orange-400/10"
                >
                  {submitting ? 'Enviando...' : data.form.ctaLabel}
                  <ArrowRight size={16} />
                </button>

                {statusMessage ? (
                  <p
                    className={`rounded-xl border px-3 py-2 text-[13px] ${
                      statusType === 'success'
                        ? 'border-[#b9eccf] bg-[#f2fff7] text-[#0c7a3d]'
                        : 'border-[#ffd7c2] bg-[#fff6f0] text-[#b14a1a]'
                    }`}
                  >
                    {statusMessage}
                  </p>
                ) : null}
              </form>
            </article>
          ) : null}
        </section>

        {data.finalCtaBanner ? (
          <section className="mt-8 overflow-hidden rounded-[26px] border border-[#1f304c] bg-[radial-gradient(circle_at_15%_20%,rgba(255,106,0,0.20),rgba(9,15,28,0.95)_42%),linear-gradient(120deg,#050b14_0%,#0a1324_55%,#11213a_100%)] p-6 text-white shadow-[0_24px_44px_rgba(7,13,24,0.38)] md:p-8">
            <p className="inline-flex rounded-full border border-[rgba(255,153,84,0.52)] bg-[rgba(255,127,43,0.15)] px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#ffc596]">
              {data.finalCtaBanner.eyebrow || 'Próximo passo'}
            </p>
            <h3 className="mt-4 text-[30px] font-black leading-tight text-[#f8fbff]">{data.finalCtaBanner.title}</h3>
            <p className="mt-2 max-w-[880px] text-[15px] leading-relaxed text-[rgba(236,242,255,0.86)]">
              {data.finalCtaBanner.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={data.finalCtaBanner.primaryCta.href}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#FF7A00] px-6 py-3 text-[14px] font-black text-white shadow-[0_4px_15px_rgba(255,106,0,0.4)] hover:shadow-[0_6px_20px_rgba(255,106,0,0.55)] transition-all hover:scale-[1.01] duration-200"
              >
                {data.finalCtaBanner.primaryCta.label}
                <ArrowRight size={16} />
              </Link>
              {data.finalCtaBanner.secondaryCta ? (
                <Link
                  href={data.finalCtaBanner.secondaryCta.href}
                  className="inline-flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.36)] bg-[rgba(255,255,255,0.08)] px-6 py-3 text-[14px] font-black text-white transition hover:border-[rgba(255,190,143,0.74)] hover:text-[#ffd9ba]"
                >
                  {data.finalCtaBanner.secondaryCta.label}
                  <ArrowRight size={16} />
                </Link>
              ) : null}
            </div>
          </section>
        ) : null}
        </section>

        {/* ========================================================================= */}
        {/* FOOTER */}
        {/* ========================================================================= */}
        <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <div className="bg-[#EDF1F5] shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] border border-white/50 rounded-[32px] p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="font-head font-extrabold text-lg text-slate-900">
                    Neuro<span className="text-[#FF5500]">Ads</span>
                  </span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Operações IA estratégicas para marketing e vendas B2B. Conectando dados em tempo real, automatizando funis e convertendo oportunidades.
                </p>
              </div>
              
              <div>
                <h4 className="font-head font-bold text-xs text-slate-800 uppercase tracking-wider mb-4">Plataforma</h4>
                <ul className="space-y-2 text-xs">
                  <li><Link href="/#solucoes" className="text-slate-500 hover:text-[#FF5500] transition">Soluções</Link></li>
                  <li><Link href="/#valores" className="text-slate-500 hover:text-[#FF5500] transition">Valores</Link></li>
                  <li><Link href="/cadastro" className="text-slate-500 hover:text-[#FF5500] transition">Começar</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-head font-bold text-xs text-slate-800 uppercase tracking-wider mb-4">Recursos</h4>
                <ul className="space-y-2 text-xs">
                  <li><Link href="/conteudos" className="text-slate-500 hover:text-[#FF5500] transition">Blog</Link></li>
                  <li><Link href="/whitepaper_ia_vendas" className="text-slate-500 hover:text-[#FF5500] transition">Whitepapers</Link></li>
                  <li><Link href="/conteudos/faq" className="text-slate-500 hover:text-[#FF5500] transition">FAQ</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="font-head font-bold text-xs text-slate-800 uppercase tracking-wider mb-4">Contato</h4>
                <ul className="space-y-2 text-xs text-slate-500">
                  <li>contato@neuroads.com.br</li>
                  <li>Suporte 24/7</li>
                </ul>
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-300/40 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
              <p>© {new Date().getFullYear()} NeuroAds. Todos os direitos reservados.</p>
              <div className="flex gap-6">
                <Link href="/privacidade" className="hover:text-[#FF5500] transition">Privacidade</Link>
                <Link href="/termos" className="hover:text-[#FF5500] transition">Termos</Link>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </main>
  );
}
