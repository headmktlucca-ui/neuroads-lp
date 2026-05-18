'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Bot, CircleGauge, Headphones, HelpCircle, ShieldCheck, Target, Wallet } from 'lucide-react';
import LuccaSpecialistChatModal from './LuccaSpecialistChatModal';
import PrimaryTopMenu from './PrimaryTopMenu';
import PrimaryFooter from './PrimaryFooter';
import HomePageBackground from './HomePageBackground';
import { submitLuccaLeadAction } from '@/app/actions/lucca-leads';
import { trackSubmenuEvent } from '@/lib/submenu-tracking';

type FaqItem = {
  question: string;
  answer: string;
};

type ProofMetric = {
  value: string;
  label: string;
  detail: string;
};

type RelatedLink = {
  label: string;
  href: string;
  description: string;
};

type CopyContract = {
  promise: string;
  pain: string;
  impactoFinanceiro: string;
  prova: string;
  metodo: string;
  cta: string;
};

type MediaConfig = {
  title: string;
  poster: string;
  desktopVideo?: string;
  mobileVideo?: string;
};

export type SubmenuPageContent = {
  slug: string;
  eyebrow: string;
  headline: string;
  highlightedHeadline: string;
  subheadline: string;
  serviceContext: string;
  copyContract: CopyContract;
  painPoints: string[];
  impactPoints: string[];
  howItWorks: string[];
  proofMetrics: ProofMetric[];
  faq: FaqItem[];
  relatedPages: RelatedLink[];
  media: MediaConfig;
};

const heroQuickPoints = [
  { title: 'IA Agêntica', description: 'Orquestra dados e mídia com foco em receita', icon: Bot },
  { title: 'Dados reais', description: 'Decisão financeira em tempo real', icon: CircleGauge },
  { title: 'Acesso sênior', description: 'Diagnóstico com especialista, sem intermediários', icon: Headphones },
] as const;

function getUtmPayload() {
  if (typeof window === 'undefined') {
    return {
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
    };
  }

  const params = new URLSearchParams(window.location.search);
  return {
    utmSource: params.get('utm_source') || '',
    utmMedium: params.get('utm_medium') || '',
    utmCampaign: params.get('utm_campaign') || '',
  };
}

function buildLeadMessage(content: SubmenuPageContent, utm: ReturnType<typeof getUtmPayload>) {
  return [
    `Solicitação de diagnóstico (${content.serviceContext}).`,
    `Página: ${content.slug}.`,
    utm.utmSource ? `utm_source=${utm.utmSource}` : '',
    utm.utmMedium ? `utm_medium=${utm.utmMedium}` : '',
    utm.utmCampaign ? `utm_campaign=${utm.utmCampaign}` : '',
    'Objetivo: receber diagnóstico prático orientado a caixa/receita.',
  ]
    .filter(Boolean)
    .join(' ');
}

type MediaLoopBlockProps = {
  slug: string;
  media: MediaConfig;
};

function MediaLoopBlock({ slug, media }: MediaLoopBlockProps) {
  const [desktopFailed, setDesktopFailed] = useState(false);
  const [mobileFailed, setMobileFailed] = useState(false);
  const milestonesRef = useRef<Set<number>>(new Set());

  const handleTimeUpdate = (current: number, duration: number) => {
    if (!duration || duration <= 0) return;
    const ratio = Math.min(100, Math.max(0, Math.round((current / duration) * 100)));
    const maybeTrack = (threshold: number, eventName: 'submenu_remotion_play_25' | 'submenu_remotion_play_50' | 'submenu_remotion_play_75' | 'submenu_remotion_play_100') => {
      if (ratio < threshold || milestonesRef.current.has(threshold)) return;
      milestonesRef.current.add(threshold);
      trackSubmenuEvent(eventName, { pageSlug: slug, threshold });
    };
    maybeTrack(25, 'submenu_remotion_play_25');
    maybeTrack(50, 'submenu_remotion_play_50');
    maybeTrack(75, 'submenu_remotion_play_75');
    maybeTrack(100, 'submenu_remotion_play_100');
  };

  const canShowDesktopVideo = Boolean(media.desktopVideo && !desktopFailed);
  const canShowMobileVideo = Boolean(media.mobileVideo && !mobileFailed);

  return (
    <div className="relative h-full min-h-[260px] overflow-hidden rounded-[26px] border border-[#e7ecf4] bg-white shadow-[0_18px_44px_rgba(12,22,38,0.08)] sm:min-h-[320px] md:min-h-[420px]">
      <div className="relative h-full w-full">
        <Image
          src={media.poster}
          alt={media.title}
          fill
          className="object-cover object-center scale-[1.12]"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0d1730]/28 via-transparent to-[#ff6a00]/8" />

        {canShowDesktopVideo && (
          <video
            className="absolute inset-0 hidden h-full w-full object-cover md:block"
            src={media.desktopVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setDesktopFailed(true)}
            onTimeUpdate={(event) => handleTimeUpdate(event.currentTarget.currentTime, event.currentTarget.duration)}
          />
        )}

        {canShowMobileVideo && (
          <video
            className="absolute inset-0 h-full w-full object-cover md:hidden"
            src={media.mobileVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onError={() => setMobileFailed(true)}
            onTimeUpdate={(event) => handleTimeUpdate(event.currentTarget.currentTime, event.currentTarget.duration)}
          />
        )}
      </div>
    </div>
  );
}

export default function SubmenuPageShell({ content }: { content: SubmenuPageContent }) {
  const [openFaq, setOpenFaq] = useState(0);
  const [isLuccaChatOpen, setIsLuccaChatOpen] = useState(false);
  const [luccaAutoMessage, setLuccaAutoMessage] = useState<string | null>(null);

  const [formStarted, setFormStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });
  const [form, setForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    companySite: '',
  });

  const scrollMilestonesRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    trackSubmenuEvent('submenu_page_view', {
      pageSlug: content.slug,
      serviceContext: content.serviceContext,
    });
  }, [content.slug, content.serviceContext]);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrolled = window.scrollY + window.innerHeight;
      const total = doc.scrollHeight || 1;
      const ratio = scrolled / total;

      const maybeTrack = (threshold: number, eventName: 'submenu_scroll_50' | 'submenu_scroll_90') => {
        if (ratio < threshold || scrollMilestonesRef.current.has(threshold)) return;
        scrollMilestonesRef.current.add(threshold);
        trackSubmenuEvent(eventName, { pageSlug: content.slug, threshold: Math.round(threshold * 100) });
      };

      maybeTrack(0.5, 'submenu_scroll_50');
      maybeTrack(0.9, 'submenu_scroll_90');
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [content.slug]);

  const openLuccaFromCta = (ctaContext: string) => {
    trackSubmenuEvent('submenu_cta_lucca_click', {
      pageSlug: content.slug,
      serviceContext: content.serviceContext,
      ctaContext,
    });
    setLuccaAutoMessage(
      `Solicito Diagnóstico para ${content.serviceContext}. Quero enviar meus dados iniciais (Nome, Email, WhatsApp e Site da Empresa).`,
    );
    setIsLuccaChatOpen(true);
  };

  const openSpecialistChat = () => {
    trackSubmenuEvent('submenu_cta_lucca_click', {
      pageSlug: content.slug,
      serviceContext: content.serviceContext,
      ctaContext: 'specialist',
    });
    setLuccaAutoMessage(null);
    setIsLuccaChatOpen(true);
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const whatsapp = form.whatsapp.trim();
    const companySite = form.companySite.trim();

    if (!name || !email || !whatsapp || !companySite) {
      setStatus({
        type: 'error',
        message: 'Preencha Nome, Email, WhatsApp e Site da Empresa para solicitar o diagnóstico.',
      });
      return;
    }

    const utm = getUtmPayload();
    setSubmitting(true);
    setStatus({ type: 'idle', message: '' });
    trackSubmenuEvent('submenu_form_submit', {
      pageSlug: content.slug,
      serviceContext: content.serviceContext,
      ...utm,
    });

    const result = await submitLuccaLeadAction({
      flow: 'analise',
      clientName: name,
      email,
      whatsapp,
      site: companySite,
      message: buildLeadMessage(content, utm),
      pageSlug: content.slug,
      serviceContext: content.serviceContext,
      utmSource: utm.utmSource,
      utmMedium: utm.utmMedium,
      utmCampaign: utm.utmCampaign,
      timestamp: new Date().toISOString(),
    });

    setSubmitting(false);
    if (!result.success) {
      setStatus({
        type: 'error',
        message: result.error || 'Não consegui registrar agora. Tente novamente em instantes.',
      });
      return;
    }

    trackSubmenuEvent('submenu_form_success', {
      pageSlug: content.slug,
      serviceContext: content.serviceContext,
      ...utm,
    });
    setStatus({
      type: 'success',
      message: 'Diagnóstico solicitado com sucesso. O Lucca vai conduzir os próximos passos com sua equipe.',
    });
    setForm({ name: '', email: '', whatsapp: '', companySite: '' });
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-[#1a2234]">
      <HomePageBackground />
      <div className="relative z-10">
        <PrimaryTopMenu onSpecialistClick={openSpecialistChat} onRequestDemoClick={() => openLuccaFromCta('header_demo')} />

        <section className="mx-auto max-w-[1260px] px-5 pb-16 pt-5 md:px-8">
        <div className="h-[84px]" />

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[28px] border border-[#e7ecf4] bg-white px-6 py-8 shadow-[0_16px_36px_rgba(12,22,38,0.06)] md:px-8">
            <span className="inline-flex rounded-full border border-[#ffd4bb] bg-[#fff4ec] px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.14em] text-[#ff6a00]">
              {content.eyebrow}
            </span>

            <h1 className="mt-6 text-[30px] font-black leading-[1.05] tracking-[-0.02em] text-[#0f1730] sm:text-[34px] lg:text-[44px]">
              {content.headline}{' '}
              <span
                className="bg-[length:200%_200%] bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #ff9a35 0%, #ff6a00 55%, #c84a00 100%)',
                }}
              >
                {content.highlightedHeadline}
              </span>
            </h1>
            <p className="mt-4 max-w-[740px] text-[16px] leading-relaxed text-[#47526b] sm:text-[17px] lg:text-[18px]">{content.subheadline}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {heroQuickPoints.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="rounded-2xl border border-[#e7ebf2] bg-[#fbfcfe] px-3.5 py-3">
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ffd2b8] bg-[#fff4eb] text-[#ff6a00]">
                      <Icon size={15} strokeWidth={2.2} />
                    </div>
                    <h3 className="mt-2 text-[14px] font-black text-[#14203f]">{item.title}</h3>
                    <p className="mt-1 text-[12px] leading-relaxed text-[#606b80]">{item.description}</p>
                  </article>
                );
              })}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => openLuccaFromCta('hero_primary')}
                className="inline-flex items-center gap-2 rounded-full bg-[#ff6a00] px-6 py-3 text-[14px] font-black text-white shadow-[0_12px_28px_rgba(255,106,0,0.3)] transition hover:bg-[#e95f00]"
              >
                Diagnóstico via Lucca
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={openSpecialistChat}
                className="inline-flex items-center gap-2 rounded-full border border-[#dce3ef] bg-white px-6 py-3 text-[14px] font-black text-[#202a3f] transition hover:border-[#ffcaa8] hover:text-[#ff6a00]"
              >
                Falar com especialista
                <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <MediaLoopBlock slug={content.slug} media={content.media} />
        </div>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="rounded-[26px] border border-[#e7ecf4] bg-white p-6 shadow-[0_14px_34px_rgba(12,22,38,0.05)] md:p-8">
            <div className="inline-flex items-center gap-2 text-[#ff6a00]">
              <Wallet size={18} />
              <p className="text-[12px] font-black uppercase tracking-[0.14em]">Problema, impacto e resposta</p>
            </div>

            <div className="mt-5 rounded-2xl border border-[#ebf0f7] bg-[#fbfcfe] p-4">
              <h2 className="text-[20px] font-black text-[#0f1730]">Onde o caixa sente primeiro</h2>
              <p className="mt-1 text-[14px] text-[#55627b]">{content.copyContract.pain}</p>
              <ul className="mt-3 space-y-2 text-[15px] text-[#33415d]">
                {content.painPoints.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#ff6a00]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 rounded-2xl border border-[#ebf0f7] bg-[#fbfcfe] p-4">
              <h3 className="text-[18px] font-black text-[#0f1730]">Impacto financeiro direto</h3>
              <p className="mt-1 text-[14px] text-[#55627b]">{content.copyContract.impactoFinanceiro}</p>
              <ul className="mt-3 space-y-2 text-[15px] text-[#33415d]">
                {content.impactPoints.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[#ff6a00]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className="rounded-[26px] border border-[#e7ecf4] bg-white p-6 shadow-[0_14px_34px_rgba(12,22,38,0.05)] md:p-8">
            <div className="inline-flex items-center gap-2 text-[#ff6a00]">
              <ShieldCheck size={18} />
              <p className="text-[12px] font-black uppercase tracking-[0.14em]">Como funciona</p>
            </div>

            <h2 className="mt-4 text-[28px] font-black leading-tight text-[#0f1730]">{content.copyContract.promise}</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#4f5c75]">{content.copyContract.metodo}</p>

            <div className="mt-5 space-y-3">
              {content.howItWorks.map((step, index) => (
                <div key={step} className="flex gap-3 rounded-2xl border border-[#ebf0f7] bg-[#fbfcfe] p-3.5">
                  <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#ffd3b8] bg-[#fff4eb] text-[12px] font-black text-[#ff6a00]">
                    {index + 1}
                  </div>
                  <p className="text-[15px] text-[#33415d]">{step}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-[#ffe1cf] bg-[#fff7f1] p-4">
              <p className="text-[13px] font-black uppercase tracking-[0.1em] text-[#ff6a00]">Prova e governança</p>
              <p className="mt-1 text-[14px] text-[#4f5c75]">{content.copyContract.prova}</p>
            </div>
          </article>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-[26px] border border-[#e7ecf4] bg-white p-6 shadow-[0_14px_34px_rgba(12,22,38,0.05)] md:p-8">
            <div className="inline-flex items-center gap-2 text-[#ff6a00]">
              <Target size={18} />
              <p className="text-[12px] font-black uppercase tracking-[0.14em]">Diagnóstico guiado por contexto</p>
            </div>
            <h2 className="mt-4 text-[28px] font-black leading-tight text-[#0f1730]">Fale com o Lucca em 60 segundos</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-[#4f5c75]">
              {content.copyContract.cta} Informe os dados iniciais para nossa equipe enviar o plano de ação com prioridade financeira.
            </p>

            <form className="mt-5 space-y-3" onSubmit={handleFormSubmit}>
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                onFocus={() => {
                  if (formStarted) return;
                  setFormStarted(true);
                  trackSubmenuEvent('submenu_form_start', {
                    pageSlug: content.slug,
                    serviceContext: content.serviceContext,
                  });
                }}
                placeholder="Nome"
                className="w-full rounded-xl border border-[#dbe2ef] bg-white px-3.5 py-3 text-[15px] font-medium text-[#1f2940] outline-none focus:border-[#ff9e63]"
              />
              <input
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="Email"
                type="email"
                className="w-full rounded-xl border border-[#dbe2ef] bg-white px-3.5 py-3 text-[15px] font-medium text-[#1f2940] outline-none focus:border-[#ff9e63]"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={form.whatsapp}
                  onChange={(event) => setForm((prev) => ({ ...prev, whatsapp: event.target.value }))}
                  placeholder="WhatsApp"
                  className="w-full rounded-xl border border-[#dbe2ef] bg-white px-3.5 py-3 text-[15px] font-medium text-[#1f2940] outline-none focus:border-[#ff9e63]"
                />
                <input
                  value={form.companySite}
                  onChange={(event) => setForm((prev) => ({ ...prev, companySite: event.target.value }))}
                  placeholder="Site da Empresa"
                  className="w-full rounded-xl border border-[#dbe2ef] bg-white px-3.5 py-3 text-[15px] font-medium text-[#1f2940] outline-none focus:border-[#ff9e63]"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff6a00] px-5 py-3 text-[14px] font-black text-white shadow-[0_12px_26px_rgba(255,106,0,0.3)] transition hover:bg-[#e95f00] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? 'Enviando diagnóstico...' : 'Solicitar diagnóstico agora'}
                <ArrowRight size={16} />
              </button>

              {status.message ? (
                <p
                  className={`rounded-xl border px-3 py-2 text-[13px] ${
                    status.type === 'success'
                      ? 'border-[#b9eccf] bg-[#f2fff7] text-[#0c7a3d]'
                      : 'border-[#ffd7c2] bg-[#fff6f0] text-[#b14a1a]'
                  }`}
                >
                  {status.message}
                </p>
              ) : null}
            </form>
          </article>

          <article className="rounded-[26px] border border-[#e7ecf4] bg-white p-6 shadow-[0_14px_34px_rgba(12,22,38,0.05)] md:p-8">
            <div className="inline-flex items-center gap-2 text-[#ff6a00]">
              <HelpCircle size={18} />
              <p className="text-[12px] font-black uppercase tracking-[0.14em]">FAQ orientado a decisão</p>
            </div>
            <h2 className="mt-4 text-[28px] font-black leading-tight text-[#0f1730]">Dúvidas que travam a escala previsível</h2>
            <div className="mt-5 space-y-2">
              {content.faq.map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <article key={item.question} className="rounded-2xl border border-[#e8edf5] bg-[#fbfcfe]">
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
        </section>

        <section className="mt-8 rounded-[26px] border border-[#e7ecf4] bg-white p-6 shadow-[0_14px_34px_rgba(12,22,38,0.05)] md:p-8">
          <h2 className="text-[30px] font-black leading-tight text-[#0f1730]">Páginas relacionadas para aprofundar</h2>
          <p className="mt-2 text-[15px] text-[#4f5c75]">
            Navegue pelos submenus complementares para integrar aquisição, conversão e inteligência em um único ecossistema operacional.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {content.relatedPages.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group rounded-2xl border border-[#e8edf5] bg-[#fbfcfe] px-4 py-4 transition hover:border-[#ffd1b3] hover:bg-[#fff8f3]"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[17px] font-black text-[#112043]">{link.label}</h3>
                  <ArrowRight size={16} className="mt-1 text-[#ff6a00] transition group-hover:translate-x-1" />
                </div>
                <p className="mt-2 text-[14px] leading-relaxed text-[#5a6680]">{link.description}</p>
              </Link>
            ))}
          </div>
        </section>
        </section>

        <PrimaryFooter />

        <LuccaSpecialistChatModal
          isOpen={isLuccaChatOpen}
          onClose={() => setIsLuccaChatOpen(false)}
          autoUserMessage={luccaAutoMessage}
        />
      </div>
    </main>
  );
}
