'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  CircleGauge,
  Headphones,
  HelpCircle,
  ShieldCheck,
  Target,
  Wallet,
  BarChart3,
  Sparkles,
} from 'lucide-react';
import LuccaSpecialistChatModal from './LuccaSpecialistChatModal';
import PrimaryTopMenu from './PrimaryTopMenu';
import PrimaryFooter from './PrimaryFooter';
import HomePageBackground from './HomePageBackground';
import { submitLuccaLeadAction } from '@/app/actions/lucca-leads';
import { trackSubmenuEvent } from '@/lib/submenu-tracking';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

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

export type AgentExample = {
  name: string;
  icon: string;
  trigger: string;
  action: string;
  result: string;
  metric?: string;
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
  agentExamples?: AgentExample[];
};

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────────────────

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

function getUtmPayload() {
  if (typeof window === 'undefined') {
    return { utmSource: '', utmMedium: '', utmCampaign: '' };
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

// ─────────────────────────────────────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────────────────────────────────────

const heroQuickPoints = [
  { title: 'IA Agêntica', description: 'Orquestra dados e mídia com foco em receita', icon: Bot },
  { title: 'Dados em tempo real', description: 'Decisão financeira baseada em performance real', icon: CircleGauge },
  { title: 'Especialistas sêniores', description: 'Sem repasse para equipe júnior', icon: Headphones },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

type MediaLoopBlockProps = { slug: string; media: MediaConfig };

function MediaLoopBlock({ slug, media }: MediaLoopBlockProps) {
  const [desktopFailed, setDesktopFailed] = useState(false);
  const [mobileFailed, setMobileFailed] = useState(false);
  const milestonesRef = useRef<Set<number>>(new Set());

  const handleTimeUpdate = (current: number, duration: number) => {
    if (!duration || duration <= 0) return;
    const ratio = Math.min(100, Math.max(0, Math.round((current / duration) * 100)));
    const maybeTrack = (
      threshold: number,
      eventName:
        | 'submenu_remotion_play_25'
        | 'submenu_remotion_play_50'
        | 'submenu_remotion_play_75'
        | 'submenu_remotion_play_100',
    ) => {
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
    <div
      className="relative h-full min-h-[280px] overflow-hidden rounded-[28px] sm:min-h-[340px] md:min-h-[460px]"
      style={{ boxShadow: '0 24px 64px rgba(12,22,38,0.12), 0 0 0 1px rgba(231,236,244,0.8)' }}
    >
      <div className="relative h-full w-full">
        <Image
          src={media.poster}
          alt={media.title}
          fill
          className="scale-[1.08] object-cover object-center"
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0d1730]/32 via-transparent to-[#ff6a00]/10" />

        {/* Live agent badge */}
        <div className="absolute bottom-4 left-4 rounded-2xl border border-white/20 bg-black/30 px-4 py-3 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4ade80] opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#4ade80]" />
            </span>
            <span className="text-[12px] font-bold text-white">Agentes ativos · operando agora</span>
          </div>
        </div>

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
            onTimeUpdate={(e) =>
              handleTimeUpdate(e.currentTarget.currentTime, e.currentTarget.duration)
            }
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
            onTimeUpdate={(e) =>
              handleTimeUpdate(e.currentTarget.currentTime, e.currentTarget.duration)
            }
          />
        )}
      </div>
    </div>
  );
}

function AgentCard({ agent, index }: { agent: AgentExample; index: number }) {
  const { ref, isVisible } = useInView(0.08);

  return (
    <div
      ref={ref}
      className="flex flex-col p-6 transition-colors duration-300 hover:bg-white/[0.04] md:p-7"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.55s ease ${index * 0.12}s, transform 0.55s ease ${index * 0.12}s`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[34px] leading-none">{agent.icon}</span>
        {agent.metric && (
          <span className="mt-1 rounded-full border border-[#ff6a00]/25 bg-[#ff6a00]/10 px-3 py-1 text-[12px] font-black text-[#ff9a50]">
            {agent.metric}
          </span>
        )}
      </div>

      <h3 className="mt-3 text-[15px] font-black leading-tight text-white">{agent.name}</h3>

      <div className="mt-4 flex flex-col gap-2.5">
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-3">
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#f97316]/70">
            Gatilho
          </p>
          <p className="text-[13px] leading-snug text-white/60">{agent.trigger}</p>
        </div>
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-3">
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#60a5fa]/70">
            Execução
          </p>
          <p className="text-[13px] leading-snug text-white/60">{agent.action}</p>
        </div>
        <div className="rounded-xl border border-[#4ade80]/15 bg-[#4ade80]/[0.05] p-3">
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#4ade80]/80">
            Resultado
          </p>
          <p className="text-[13px] leading-snug text-white/75">{agent.result}</p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  metric,
  index,
  isVisible,
}: {
  metric: ProofMetric;
  index: number;
  isVisible: boolean;
}) {
  return (
    <div
      className="rounded-2xl border border-[#ebf0f7] bg-[#f8fafd] p-5 transition-all hover:border-[#ffd2b8] hover:bg-[#fff8f3] hover:shadow-[0_8px_24px_rgba(255,106,0,0.08)]"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease ${index * 0.15}s, transform 0.5s ease ${index * 0.15}s`,
      }}
    >
      <div
        className="text-[38px] font-black leading-none"
        style={{
          backgroundImage: 'linear-gradient(135deg, #ff9a35 0%, #ff6a00 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
        }}
      >
        {metric.value}
      </div>
      <div className="mt-1.5 text-[16px] font-black text-[#1a2234]">{metric.label}</div>
      <div className="mt-1 text-[13px] leading-snug text-[#5a6680]">{metric.detail}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

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
  const [form, setForm] = useState({ name: '', email: '', whatsapp: '', companySite: '' });

  const scrollMilestonesRef = useRef<Set<number>>(new Set());

  // Scroll-triggered animation refs
  const agentsSectionAnim = useInView(0.08);
  const problemSectionAnim = useInView(0.08);
  const metricsSectionAnim = useInView(0.08);
  const ctaSectionAnim = useInView(0.08);
  const relatedSectionAnim = useInView(0.08);

  const hasAgents = Boolean(content.agentExamples && content.agentExamples.length > 0);
  const hasMetrics = content.proofMetrics && content.proofMetrics.length > 0;

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

      const maybeTrack = (
        threshold: number,
        eventName: 'submenu_scroll_50' | 'submenu_scroll_90',
      ) => {
        if (ratio < threshold || scrollMilestonesRef.current.has(threshold)) return;
        scrollMilestonesRef.current.add(threshold);
        trackSubmenuEvent(eventName, {
          pageSlug: content.slug,
          threshold: Math.round(threshold * 100),
        });
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
        <PrimaryTopMenu
          onSpecialistClick={openSpecialistChat}
          onRequestDemoClick={() => openLuccaFromCta('header_demo')}
        />

        <section className="mx-auto max-w-[1260px] px-5 pb-24 pt-5 md:px-8">
          <div className="h-[84px]" />

          {/* ══════════════════════════════════════════════════════════════
              HERO
          ══════════════════════════════════════════════════════════════ */}
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Hero text card */}
            <div className="rounded-[28px] border border-[#e7ecf4] bg-white px-6 py-8 shadow-[0_16px_48px_rgba(12,22,38,0.07)] md:px-10 md:py-10">
              {/* Eyebrow badge */}
              <span className="inline-flex items-center gap-2 rounded-full border border-[#ffd4bb] bg-[#fff4ec] px-4 py-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff6a00]" />
                <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#ff6a00]">
                  {content.eyebrow}
                </span>
              </span>

              <h1 className="mt-6 text-[30px] font-black leading-[1.05] tracking-[-0.02em] text-[#0f1730] sm:text-[36px] lg:text-[46px]">
                {content.headline}{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #ff9a35 0%, #ff6a00 55%, #c84a00 100%)',
                  }}
                >
                  {content.highlightedHeadline}
                </span>
              </h1>

              <p className="mt-4 max-w-[640px] text-[16px] leading-relaxed text-[#47526b] sm:text-[18px]">
                {content.subheadline}
              </p>

              {/* Trust points */}
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {heroQuickPoints.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article
                      key={item.title}
                      className="rounded-2xl border border-[#e7ebf2] bg-[#fbfcfe] px-3.5 py-3 transition-all duration-200 hover:border-[#ffd2b8] hover:bg-[#fffaf6] hover:shadow-[0_4px_16px_rgba(255,106,0,0.06)]"
                    >
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ffd2b8] bg-[#fff4eb] text-[#ff6a00]">
                        <Icon size={15} strokeWidth={2.2} />
                      </div>
                      <h3 className="mt-2 text-[14px] font-black text-[#14203f]">{item.title}</h3>
                      <p className="mt-0.5 text-[12px] leading-snug text-[#606b80]">
                        {item.description}
                      </p>
                    </article>
                  );
                })}
              </div>

              {/* CTAs */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => openLuccaFromCta('hero_primary')}
                  className="group inline-flex items-center gap-2 rounded-full bg-[#ff6a00] px-7 py-3.5 text-[14px] font-black text-white shadow-[0_12px_32px_rgba(255,106,0,0.32)] transition-all hover:bg-[#e95f00] hover:shadow-[0_16px_40px_rgba(255,106,0,0.42)]"
                >
                  Diagnóstico via Lucca
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </button>
                <button
                  type="button"
                  onClick={openSpecialistChat}
                  className="inline-flex items-center gap-2 rounded-full border border-[#dce3ef] bg-white px-7 py-3.5 text-[14px] font-black text-[#202a3f] transition-all hover:border-[#ffcaa8] hover:text-[#ff6a00]"
                >
                  Falar com especialista
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Media block */}
            <MediaLoopBlock slug={content.slug} media={content.media} />
          </div>

          {/* ══════════════════════════════════════════════════════════════
              AGENTES IA EM AÇÃO  (dark section — only when data is provided)
          ══════════════════════════════════════════════════════════════ */}
          {hasAgents && (
            <div
              ref={agentsSectionAnim.ref}
              className="mt-8 overflow-hidden rounded-[28px]"
              style={{
                background:
                  'linear-gradient(140deg, #070d1a 0%, #0d1630 55%, #14080a 100%)',
                opacity: agentsSectionAnim.isVisible ? 1 : 0,
                transform: agentsSectionAnim.isVisible ? 'translateY(0)' : 'translateY(32px)',
                transition: 'opacity 0.65s ease, transform 0.65s ease',
              }}
            >
              {/* Section header */}
              <div className="border-b border-white/[0.07] px-6 py-7 md:px-10">
                <div className="flex items-center gap-2.5">
                  <div className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#ff6a00]/30 bg-[#ff6a00]/15 text-[#ff9a50]">
                    <Bot size={14} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#ff9a50]">
                    Agentes NeuroAds · {content.serviceContext}
                  </span>
                </div>

                <h2 className="mt-4 text-[24px] font-black leading-tight text-white sm:text-[30px] lg:text-[36px]">
                  Agentes que geram oportunidades{' '}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #ff9a35 0%, #ff6a00 100%)',
                    }}
                  >
                    enquanto você foca no estratégico
                  </span>
                </h2>
                <p className="mt-2.5 max-w-[580px] text-[15px] leading-relaxed text-white/50">
                  Cada agente opera de forma autônoma no seu funil — executando com precisão tarefas
                  que antes exigiam horas de operação manual, sem custo variável por execução.
                </p>
              </div>

              {/* Agent cards — 2 cols on tablet, 4 on desktop */}
              <div className="grid divide-y divide-white/[0.05] md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4 xl:divide-x">
                {content.agentExamples!.map((agent, index) => (
                  <AgentCard key={agent.name} agent={agent} index={index} />
                ))}
              </div>

              {/* Bottom strip */}
              <div className="border-t border-white/[0.07] px-6 py-4 md:px-10">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <p className="text-[13px] text-white/45">
                    <span className="font-bold text-white/70">Operação 24 h por dia</span> — sem pausas,
                    sem custo variável por execução.
                  </p>
                  <button
                    type="button"
                    onClick={() => openLuccaFromCta('agents_section')}
                    className="inline-flex items-center gap-2 rounded-full border border-[#ff6a00]/35 bg-[#ff6a00]/10 px-5 py-2.5 text-[13px] font-black text-[#ff9a50] transition-all hover:border-[#ff6a00]/60 hover:bg-[#ff6a00]/18"
                  >
                    Ver como funcionam no meu segmento
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              PROBLEMA + SOLUÇÃO
          ══════════════════════════════════════════════════════════════ */}
          <div
            ref={problemSectionAnim.ref}
            className="mt-8 grid gap-6 lg:grid-cols-2"
            style={{
              opacity: problemSectionAnim.isVisible ? 1 : 0,
              transform: problemSectionAnim.isVisible ? 'translateY(0)' : 'translateY(28px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}
          >
            {/* Pain + Impact */}
            <article className="rounded-[26px] border border-[#e7ecf4] bg-white p-6 shadow-[0_14px_40px_rgba(12,22,38,0.05)] md:p-8">
              <div className="inline-flex items-center gap-2 text-[#ff6a00]">
                <Wallet size={18} />
                <p className="text-[12px] font-black uppercase tracking-[0.14em]">
                  Diagnóstico financeiro
                </p>
              </div>

              <h2 className="mt-4 text-[22px] font-black leading-tight text-[#0f1730] sm:text-[26px]">
                Onde o caixa sangra sem você perceber
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-[#55627b]">
                {content.copyContract.pain}
              </p>

              <div className="mt-5 rounded-2xl border border-[#ebf0f7] bg-[#f8fafd] p-4">
                <p className="mb-3 text-[11px] font-black uppercase tracking-[0.12em] text-[#8895aa]">
                  Sintomas operacionais
                </p>
                <ul className="space-y-2.5">
                  {content.painPoints.map((item, i) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#fff2ea] text-[10px] font-black text-[#ff6a00]">
                        {i + 1}
                      </span>
                      <span className="text-[14px] leading-snug text-[#33415d]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 rounded-2xl border border-[#ffd4bb] bg-[#fff7f1] p-4">
                <p className="mb-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-[#c04f20]">
                  Impacto financeiro direto
                </p>
                <p className="text-[14px] leading-relaxed text-[#6b3620]">
                  {content.copyContract.impactoFinanceiro}
                </p>
                <ul className="mt-3 space-y-1.5">
                  {content.impactPoints.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px] text-[#5a2a10]">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff6a00]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            {/* Solution — How It Works */}
            <article className="rounded-[26px] border border-[#e7ecf4] bg-white p-6 shadow-[0_14px_40px_rgba(12,22,38,0.05)] md:p-8">
              <div className="inline-flex items-center gap-2 text-[#ff6a00]">
                <ShieldCheck size={18} />
                <p className="text-[12px] font-black uppercase tracking-[0.14em]">Sistema de resposta</p>
              </div>

              <h2 className="mt-4 text-[22px] font-black leading-tight text-[#0f1730] sm:text-[26px]">
                {content.copyContract.promise}
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-[#4f5c75]">
                {content.copyContract.metodo}
              </p>

              {/* Steps */}
              <div className="relative mt-5 space-y-3">
                {/* Connecting line */}
                <div className="absolute left-[19px] top-8 h-[calc(100%-52px)] w-px bg-gradient-to-b from-[#ffd2b8] to-transparent" />

                {content.howItWorks.map((step, index) => (
                  <div
                    key={step}
                    className="relative flex gap-3 rounded-2xl border border-[#ebf0f7] bg-[#f8fafd] p-3.5 transition-all hover:border-[#ffd2b8] hover:bg-[#fff8f3]"
                  >
                    <div className="relative z-10 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#ffd3b8] bg-white text-[12px] font-black text-[#ff6a00] shadow-sm">
                      {index + 1}
                    </div>
                    <p className="pt-1 text-[14px] leading-snug text-[#33415d]">{step}</p>
                  </div>
                ))}
              </div>

              {/* Proof/governance note */}
              <div className="mt-5 rounded-2xl border border-[#d4edda] bg-[#f0fdf4] p-4">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck
                    size={16}
                    className="mt-0.5 shrink-0 text-[#16a34a]"
                    strokeWidth={2.2}
                  />
                  <p className="text-[13px] leading-relaxed text-[#166534]">
                    {content.copyContract.prova}
                  </p>
                </div>
              </div>
            </article>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              PROOF METRICS  (only when populated)
          ══════════════════════════════════════════════════════════════ */}
          {hasMetrics && (
            <div
              ref={metricsSectionAnim.ref}
              className="mt-8 rounded-[26px] border border-[#e7ecf4] bg-white p-6 shadow-[0_14px_40px_rgba(12,22,38,0.05)] md:p-10"
              style={{
                opacity: metricsSectionAnim.isVisible ? 1 : 0,
                transform: metricsSectionAnim.isVisible ? 'translateY(0)' : 'translateY(28px)',
                transition: 'opacity 0.6s ease, transform 0.6s ease',
              }}
            >
              <div className="flex items-center gap-2 text-[#ff6a00]">
                <BarChart3 size={18} />
                <p className="text-[12px] font-black uppercase tracking-[0.14em]">
                  Resultados representativos
                </p>
              </div>
              <h2 className="mt-3 text-[24px] font-black text-[#0f1730] sm:text-[28px]">
                O que os dados mostram na prática
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {content.proofMetrics.map((metric, index) => (
                  <MetricCard
                    key={metric.label}
                    metric={metric}
                    index={index}
                    isVisible={metricsSectionAnim.isVisible}
                  />
                ))}
              </div>

              <p className="mt-5 text-[12px] text-[#8895aa]">
                * Resultados baseados em operações gerenciadas pela NeuroAds. Variações ocorrem
                conforme segmento, maturidade do funil e orçamento disponível.
              </p>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              CTA FORM  +  FAQ
          ══════════════════════════════════════════════════════════════ */}
          <div
            ref={ctaSectionAnim.ref}
            className="mt-8 grid gap-6 lg:grid-cols-2"
            style={{
              opacity: ctaSectionAnim.isVisible ? 1 : 0,
              transform: ctaSectionAnim.isVisible ? 'translateY(0)' : 'translateY(28px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}
          >
            {/* Form */}
            <article className="rounded-[26px] border border-[#e7ecf4] bg-white p-6 shadow-[0_14px_40px_rgba(12,22,38,0.05)] md:p-8">
              <div className="inline-flex items-center gap-2 text-[#ff6a00]">
                <Target size={18} />
                <p className="text-[12px] font-black uppercase tracking-[0.14em]">
                  Diagnóstico gratuito
                </p>
              </div>

              <h2 className="mt-4 text-[24px] font-black leading-tight text-[#0f1730] sm:text-[28px]">
                Fale com o Lucca em 60 segundos
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-[#4f5c75]">
                {content.copyContract.cta} Informe seus dados para nossa equipe enviar o plano de
                ação com prioridade financeira.
              </p>

              {/* Trust badges */}
              <div className="mt-4 flex flex-wrap gap-2">
                {['Sem compromisso', 'Resposta em até 24 h', 'Diagnóstico personalizado'].map(
                  (badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#d4edda] bg-[#f0fdf4] px-3 py-1 text-[12px] font-bold text-[#166534]"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
                      {badge}
                    </span>
                  ),
                )}
              </div>

              <form className="mt-5 space-y-3" onSubmit={handleFormSubmit}>
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  onFocus={() => {
                    if (formStarted) return;
                    setFormStarted(true);
                    trackSubmenuEvent('submenu_form_start', {
                      pageSlug: content.slug,
                      serviceContext: content.serviceContext,
                    });
                  }}
                  placeholder="Seu nome"
                  className="w-full rounded-xl border border-[#dbe2ef] bg-white px-4 py-3 text-[15px] font-medium text-[#1f2940] outline-none transition focus:border-[#ff9e63] focus:ring-2 focus:ring-[#ff6a00]/10"
                />
                <input
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="E-mail profissional"
                  type="email"
                  className="w-full rounded-xl border border-[#dbe2ef] bg-white px-4 py-3 text-[15px] font-medium text-[#1f2940] outline-none transition focus:border-[#ff9e63] focus:ring-2 focus:ring-[#ff6a00]/10"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={form.whatsapp}
                    onChange={(e) => setForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="WhatsApp"
                    className="w-full rounded-xl border border-[#dbe2ef] bg-white px-4 py-3 text-[15px] font-medium text-[#1f2940] outline-none transition focus:border-[#ff9e63] focus:ring-2 focus:ring-[#ff6a00]/10"
                  />
                  <input
                    value={form.companySite}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, companySite: e.target.value }))
                    }
                    placeholder="Site da empresa"
                    className="w-full rounded-xl border border-[#dbe2ef] bg-white px-4 py-3 text-[15px] font-medium text-[#1f2940] outline-none transition focus:border-[#ff9e63] focus:ring-2 focus:ring-[#ff6a00]/10"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff6a00] px-5 py-3.5 text-[14px] font-black text-white shadow-[0_12px_30px_rgba(255,106,0,0.3)] transition-all hover:bg-[#e95f00] hover:shadow-[0_16px_40px_rgba(255,106,0,0.38)] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? 'Enviando diagnóstico...' : 'Solicitar diagnóstico agora'}
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </button>

                {status.message ? (
                  <p
                    className={`rounded-xl border px-3 py-2.5 text-[13px] font-medium ${
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

            {/* FAQ */}
            <article className="rounded-[26px] border border-[#e7ecf4] bg-white p-6 shadow-[0_14px_40px_rgba(12,22,38,0.05)] md:p-8">
              <div className="inline-flex items-center gap-2 text-[#ff6a00]">
                <HelpCircle size={18} />
                <p className="text-[12px] font-black uppercase tracking-[0.14em]">
                  Perguntas frequentes
                </p>
              </div>
              <h2 className="mt-4 text-[24px] font-black leading-tight text-[#0f1730] sm:text-[28px]">
                Dúvidas que travam a decisão
              </h2>

              <div className="mt-5 space-y-2">
                {content.faq.map((item, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <article
                      key={item.question}
                      className={`rounded-2xl border transition-colors duration-200 ${
                        isOpen
                          ? 'border-[#ffd2b8] bg-[#fff8f3]'
                          : 'border-[#e8edf5] bg-[#fbfcfe]'
                      }`}
                    >
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left"
                        onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      >
                        <span className="text-[14px] font-black text-[#1a2743]">
                          {item.question}
                        </span>
                        <span
                          className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[16px] font-bold leading-none transition-colors ${
                            isOpen
                              ? 'border-[#ff6a00]/30 bg-[#fff4eb] text-[#ff6a00]'
                              : 'border-[#dce3ef] text-[#64718c]'
                          }`}
                        >
                          {isOpen ? '−' : '+'}
                        </span>
                      </button>
                      <div
                        style={{
                          maxHeight: isOpen ? '240px' : '0',
                          overflow: 'hidden',
                          transition: 'max-height 0.3s ease',
                        }}
                      >
                        <p className="px-4 pb-4 text-[13px] leading-relaxed text-[#4f5c75]">
                          {item.answer}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Secondary CTA inside FAQ card */}
              <div className="mt-6 rounded-2xl border border-[#e7ecf4] bg-gradient-to-br from-[#fff8f3] to-[#fff4ec] p-5">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-[#ff6a00]" />
                  <p className="text-[14px] font-black text-[#0f1730]">Tem uma dúvida específica?</p>
                </div>
                <p className="mt-1 text-[13px] text-[#5a6880]">
                  Fale diretamente com o Lucca, nosso especialista de IA.
                </p>
                <button
                  type="button"
                  onClick={openSpecialistChat}
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#ffd2b8] bg-white px-4 py-2 text-[13px] font-black text-[#ff6a00] transition-all hover:border-[#ff6a00] hover:bg-[#fff4ec]"
                >
                  Perguntar ao Lucca
                  <ArrowRight size={13} />
                </button>
              </div>
            </article>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              RELATED PAGES
          ══════════════════════════════════════════════════════════════ */}
          <section
            ref={relatedSectionAnim.ref}
            className="mt-8 rounded-[26px] border border-[#e7ecf4] bg-white p-6 shadow-[0_14px_40px_rgba(12,22,38,0.05)] md:p-8"
            style={{
              opacity: relatedSectionAnim.isVisible ? 1 : 0,
              transform: relatedSectionAnim.isVisible ? 'translateY(0)' : 'translateY(28px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}
          >
            <h2 className="text-[22px] font-black leading-tight text-[#0f1730] sm:text-[26px]">
              Continue explorando
            </h2>
            <p className="mt-1.5 text-[14px] text-[#4f5c75]">
              Integre aquisição, conversão e inteligência em um único ecossistema operacional.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {content.relatedPages.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex flex-col justify-between rounded-2xl border border-[#e8edf5] bg-[#fbfcfe] px-4 py-4 transition-all duration-200 hover:border-[#ffd1b3] hover:bg-[#fff8f3] hover:shadow-[0_8px_24px_rgba(255,106,0,0.08)]"
                  style={{
                    opacity: relatedSectionAnim.isVisible ? 1 : 0,
                    transform: relatedSectionAnim.isVisible ? 'translateY(0)' : 'translateY(12px)',
                    transition: `opacity 0.5s ease ${index * 0.08}s, transform 0.5s ease ${index * 0.08}s`,
                  }}
                >
                  <div>
                    <h3 className="text-[15px] font-black text-[#112043] transition-colors group-hover:text-[#e95f00]">
                      {link.label}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-[#5a6680]">
                      {link.description}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[12px] font-bold text-[#ff6a00] opacity-0 transition-opacity group-hover:opacity-100">
                    Ver mais
                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                  </div>
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
