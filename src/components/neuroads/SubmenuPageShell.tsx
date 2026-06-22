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
      style={{ boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
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
        <div className="absolute bottom-4 left-4 rounded-2xl bg-black/30 px-4 py-3 backdrop-blur-md">
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
  const hasImageIcon = agent.icon.startsWith('/');

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
        {hasImageIcon ? (
          <span className="relative inline-flex h-11 w-11 overflow-hidden rounded-xl border border-white/15 bg-white/[0.06] p-1.5">
            <Image
              src={agent.icon}
              alt={`Ícone oficial do agente ${agent.name}`}
              fill
              className="object-cover"
              sizes="44px"
            />
          </span>
        ) : (
          <span className="text-[34px] leading-none">{agent.icon}</span>
        )}
        {agent.metric && (
          <span className="mt-1 text-[12px] font-black text-[#ff9a50]">
            {agent.metric}
          </span>
        )}
      </div>

      <h3 className="mt-3 text-[15px] font-black leading-tight text-white">{agent.name}</h3>

      <div className="mt-4 flex flex-col gap-2.5">
        <div className="p-3">
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#f97316]/70">
            Gatilho
          </p>
          <p className="text-[13px] leading-snug text-white/60">{agent.trigger}</p>
        </div>
        <div className="p-3">
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#60a5fa]/70">
            Execução
          </p>
          <p className="text-[13px] leading-snug text-white/60">{agent.action}</p>
        </div>
        <div className="p-3">
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
      className="rounded-2xl border border-white/5 border-l-gradient-orange border-l-transparent bg-zinc-950/40 p-5 backdrop-blur-sm transition-all hover:border-[#ff6a00]/30 hover:bg-white/5 hover:shadow-[0_8px_24px_rgba(255,106,0,0.15)]"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s ease ${index * 0.15}s, transform 0.5s ease ${index * 0.15}s`,
      }}
    >
      <div
        className="text-[38px] font-black leading-none drop-shadow-[0_0_15px_rgba(255,106,0,0.3)]"
        style={{
          backgroundImage: 'linear-gradient(135deg, #ff9a35 0%, #ff6a00 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
        }}
      >
        {metric.value}
      </div>
      <div className="mt-1.5 text-[16px] font-bold text-white">{metric.label}</div>
      <div className="mt-1 text-[13px] leading-snug text-slate-400">{metric.detail}</div>
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
    <main 
      className="relative min-h-screen bg-[#040811] text-white overflow-hidden selection:bg-[#ff6a00] selection:text-white bg-top bg-repeat-y bg-[length:100%_auto]"
      style={{ backgroundImage: "url('/images/backgrd_dark.png')" }}
    >
      {/* Background radial overlays */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#ff6a00]/10 to-transparent rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute top-[800px] right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#12284c]/20 to-transparent rounded-full filter blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-gradient-to-br from-[#ff6a00]/5 to-transparent rounded-full filter blur-[120px] pointer-events-none" />
      
      {/* Header Grid Line patterns */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
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
            <div className="rounded-[32px] border border-white/5 bg-zinc-950/50 backdrop-blur-md px-6 py-8 shadow-[0_18px_48px_rgba(0,0,0,0.5)] md:px-10 md:py-10 transition-[box-shadow,border-color] duration-300">
              {/* Eyebrow badge */}
              <span className="inline-flex items-center gap-2 rounded-full border border-[#ff6a00]/30 bg-[#ff6a00]/10 backdrop-blur-md px-4 py-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#ff6a00]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#ff8f3a]">
                  {content.eyebrow}
                </span>
              </span>

              <h1 className="mt-6 text-[34px] md:text-[42px] font-black leading-[1.2] tracking-tight text-white">
                {content.headline}{' '}
                <span className="bg-[linear-gradient(90deg,#ff8a00_0%,#ff6a00_50%,#ff9f1a_100%)] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(255,106,0,0.4)]">
                  {content.highlightedHeadline}
                </span>
              </h1>

              <p className="mt-6 text-[15px] sm:text-lg text-slate-300 leading-relaxed max-w-[540px]">
                {content.subheadline}
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => openLuccaFromCta('hero_primary')}
                  className="group relative w-full sm:w-auto justify-center inline-flex items-center gap-2 rounded-full px-8 py-4 text-[14px] font-extrabold text-white overflow-hidden transition-all duration-500 ease-out hover:scale-[1.02] hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                  style={{
                    background: 'linear-gradient(145deg, #ff8f3a 0%, #e65c00 100%)',
                    boxShadow: '0 10px 30px -5px rgba(255,106,0,0.6), inset 0 2px 2px rgba(255,255,255,0.3), inset 0 -2px 5px rgba(0,0,0,0.2)'
                  }}
                >
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_100%)]" />
                  <span className="relative z-10 flex items-center gap-2">
                    Diagnóstico via Lucca
                    <ArrowRight size={16} className="transition-transform duration-500 group-hover:translate-x-1.5" />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={openSpecialistChat}
                  className="w-full sm:w-auto justify-center inline-flex items-center gap-2 rounded-full border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all px-6 py-4 text-[14px] font-bold cursor-pointer"
                >
                  Falar com especialista
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Trust points */}
              <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-6 border-t border-white/10 pt-8">
                {heroQuickPoints.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ff6a00]/10 text-[#ff8f3a] border border-[#ff6a00]/20">
                        <Icon size={18} />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-white leading-none">{item.title}</p>
                        <p className="text-xs text-slate-400 mt-1.5">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
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
              className="mt-8 overflow-hidden rounded-[28px] bg-zinc-950/40 backdrop-blur-md border border-white/5"
              style={{
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
            <article className="rounded-[32px] border border-white/5 bg-zinc-950/50 backdrop-blur-md p-6 shadow-[0_18px_48px_rgba(0,0,0,0.5)] md:p-8">
              <div className="inline-flex items-center gap-2 text-[#ff8f3a]">
                <Wallet size={18} />
                <p className="text-[12px] font-bold uppercase tracking-[0.14em]">
                  Diagnóstico financeiro
                </p>
              </div>

              <h2 className="mt-4 text-[22px] font-black leading-tight text-white sm:text-[26px]">
                Onde o caixa sangra sem você perceber
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-300">
                {content.copyContract.pain}
              </p>

              <div className="mt-5 rounded-2xl border border-white/5 bg-white/5 p-4">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  Sintomas operacionais
                </p>
                <ul className="space-y-2.5">
                  {content.painPoints.map((item, i) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ff6a00]/10 text-[10px] font-bold text-[#ff8f3a]">
                        {i + 1}
                      </span>
                      <span className="text-[14px] leading-snug text-slate-300">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 rounded-2xl border border-[#ff6a00]/20 bg-[#ff6a00]/5 p-4">
                <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#ff8f3a]">
                  Impacto financeiro direto
                </p>
                <p className="text-[14px] leading-relaxed text-[#ffbda8]">
                  {content.copyContract.impactoFinanceiro}
                </p>
                <ul className="mt-3 space-y-1.5">
                  {content.impactPoints.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px] text-[#ffbda8]/80">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#ff6a00]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </article>

            {/* Solution — How It Works */}
            <article className="rounded-[32px] border border-white/5 bg-zinc-950/50 backdrop-blur-md p-6 shadow-[0_18px_48px_rgba(0,0,0,0.5)] md:p-8">
              <div className="inline-flex items-center gap-2 text-[#ff8f3a]">
                <ShieldCheck size={18} />
                <p className="text-[12px] font-bold uppercase tracking-[0.14em]">Sistema de resposta</p>
              </div>

              <h2 className="mt-4 text-[22px] font-black leading-tight text-white sm:text-[26px]">
                {content.copyContract.promise}
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-300">
                {content.copyContract.metodo}
              </p>

              {/* Steps */}
              <div className="relative mt-5 space-y-3">
                {/* Connecting line */}
                <div className="absolute left-[19px] top-8 h-[calc(100%-52px)] w-px bg-gradient-to-b from-[#ff6a00]/30 to-transparent" />

                {content.howItWorks.map((step, index) => (
                  <div
                    key={step}
                    className="relative flex gap-3 rounded-2xl border border-white/5 bg-white/5 p-3.5 transition-all hover:border-[#ff6a00]/30 hover:bg-white/10"
                  >
                    <div className="relative z-10 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#ff6a00]/30 bg-zinc-900 text-[12px] font-bold text-[#ff8f3a] shadow-sm">
                      {index + 1}
                    </div>
                    <p className="pt-1 text-[14px] leading-snug text-slate-200">{step}</p>
                  </div>
                ))}
              </div>

              {/* Proof/governance note */}
              <div className="mt-5 rounded-2xl border border-[#4ade80]/20 bg-[#4ade80]/10 p-4">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck
                    size={16}
                    className="mt-0.5 shrink-0 text-[#4ade80]"
                    strokeWidth={2.2}
                  />
                  <p className="text-[13px] leading-relaxed text-[#86efac]">
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
              className="mt-8 rounded-[32px] border border-white/5 bg-zinc-950/50 backdrop-blur-md p-6 shadow-[0_18px_48px_rgba(0,0,0,0.5)] md:p-10"
              style={{
                opacity: metricsSectionAnim.isVisible ? 1 : 0,
                transform: metricsSectionAnim.isVisible ? 'translateY(0)' : 'translateY(28px)',
                transition: 'opacity 0.6s ease, transform 0.6s ease',
              }}
            >
              <div className="flex items-center gap-2 text-[#ff8f3a]">
                <BarChart3 size={18} />
                <p className="text-[12px] font-bold uppercase tracking-[0.14em]">
                  Resultados representativos
                </p>
              </div>
              <h2 className="mt-3 text-[24px] font-black text-white sm:text-[28px]">
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

              <p className="mt-5 text-[12px] text-slate-500">
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
            <article className="rounded-[32px] border border-white/5 bg-zinc-950/50 backdrop-blur-md p-6 shadow-[0_18px_48px_rgba(0,0,0,0.5)] md:p-8">
              <div className="inline-flex items-center gap-2 text-[#ff8f3a]">
                <Target size={18} />
                <p className="text-[12px] font-bold uppercase tracking-[0.14em]">
                  Diagnóstico gratuito
                </p>
              </div>

              <h2 className="mt-4 text-[24px] font-black leading-tight text-white sm:text-[28px]">
                Fale com o Lucca em 60 segundos
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-slate-300">
                {content.copyContract.cta} Informe seus dados para nossa equipe enviar o plano de
                ação com prioridade financeira.
              </p>

              {/* Trust badges */}
              <div className="mt-4 flex flex-wrap gap-2">
                {['Sem compromisso', 'Resposta em até 24 h', 'Diagnóstico personalizado'].map(
                  (badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#4ade80]/20 bg-[#4ade80]/10 px-3 py-1 text-[12px] font-bold text-[#86efac]"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
                      {badge}
                    </span>
                  ),
                )}
              </div>

              <form className="mt-5 space-y-3" onSubmit={handleFormSubmit}>
                <input
                  name="name"
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
                  autoComplete="name"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] font-medium text-white placeholder-slate-400 outline-none transition focus:border-[#ff6a00]/50 focus:ring-2 focus:ring-[#ff6a00]/20"
                />
                <input
                  name="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="E-mail profissional"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] font-medium text-white placeholder-slate-400 outline-none transition focus:border-[#ff6a00]/50 focus:ring-2 focus:ring-[#ff6a00]/20"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    name="whatsapp"
                    value={form.whatsapp}
                    onChange={(e) => setForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="WhatsApp"
                    type="tel"
                    autoComplete="tel"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] font-medium text-white placeholder-slate-400 outline-none transition focus:border-[#ff6a00]/50 focus:ring-2 focus:ring-[#ff6a00]/20"
                  />
                  <input
                    name="companySite"
                    value={form.companySite}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, companySite: e.target.value }))
                    }
                    placeholder="Site da empresa"
                    type="url"
                    autoComplete="url"
                    required
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[15px] font-medium text-white placeholder-slate-400 outline-none transition focus:border-[#ff6a00]/50 focus:ring-2 focus:ring-[#ff6a00]/20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="group relative w-full justify-center inline-flex items-center gap-2 rounded-full px-5 py-3.5 text-[14px] font-extrabold text-white overflow-hidden transition-all duration-500 ease-out hover:scale-[1.02] hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
                  style={{
                    background: 'linear-gradient(145deg, #ff8f3a 0%, #e65c00 100%)',
                    boxShadow: '0 10px 30px -5px rgba(255,106,0,0.6), inset 0 2px 2px rgba(255,255,255,0.3), inset 0 -2px 5px rgba(0,0,0,0.2)'
                  }}
                >
                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_100%)]" />
                  <span className="relative z-10 flex items-center gap-2">
                    {submitting ? 'Enviando diagnóstico...' : 'Solicitar diagnóstico agora'}
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-500 group-hover:translate-x-1.5"
                    />
                  </span>
                </button>

                {status.message ? (
                  <p
                    className={`rounded-xl border px-3 py-2.5 text-[13px] font-medium ${
                      status.type === 'success'
                        ? 'border-[#4ade80]/30 bg-[#4ade80]/10 text-[#4ade80]'
                        : 'border-[#ef4444]/30 bg-[#ef4444]/10 text-[#fca5a5]'
                    }`}
                  >
                    {status.message}
                  </p>
                ) : null}
              </form>
            </article>

            {/* FAQ */}
            <article className="rounded-[32px] border border-white/5 bg-zinc-950/50 backdrop-blur-md p-6 shadow-[0_18px_48px_rgba(0,0,0,0.5)] md:p-8">
              <div className="inline-flex items-center gap-2 text-[#ff8f3a]">
                <HelpCircle size={18} />
                <p className="text-[12px] font-bold uppercase tracking-[0.14em]">
                  Perguntas frequentes
                </p>
              </div>
              <h2 className="mt-4 text-[24px] font-black leading-tight text-white sm:text-[28px]">
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
                          ? 'border-[#ff6a00]/30 bg-white/10'
                          : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left cursor-pointer"
                        onClick={() => setOpenFaq(isOpen ? -1 : index)}
                      >
                        <span className="text-[14px] font-bold text-white">
                          {item.question}
                        </span>
                        <span
                          className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[16px] font-bold leading-none transition-colors ${
                            isOpen
                              ? 'border-[#ff6a00]/50 bg-[#ff6a00]/10 text-[#ff8f3a]'
                              : 'border-white/20 text-slate-400'
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
                        <p className="px-4 pb-4 text-[13px] leading-relaxed text-slate-300">
                          {item.answer}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Secondary CTA inside FAQ card */}
              <div className="mt-6 rounded-2xl border border-[#ff6a00]/20 bg-[#ff6a00]/5 p-5 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-[#ff8f3a]" />
                  <p className="text-[14px] font-bold text-white">Tem uma dúvida específica?</p>
                </div>
                <p className="mt-1 text-[13px] text-slate-400">
                  Fale diretamente com o Lucca, nosso especialista de IA.
                </p>
                <button
                  type="button"
                  onClick={openSpecialistChat}
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#ff6a00]/30 bg-white/5 px-4 py-2 text-[13px] font-bold text-[#ff8f3a] transition-all hover:border-[#ff6a00]/60 hover:bg-white/10 cursor-pointer"
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
            className="mt-8 rounded-[32px] border border-white/5 bg-zinc-950/50 backdrop-blur-md p-6 shadow-[0_18px_48px_rgba(0,0,0,0.5)] md:p-8"
            style={{
              opacity: relatedSectionAnim.isVisible ? 1 : 0,
              transform: relatedSectionAnim.isVisible ? 'translateY(0)' : 'translateY(28px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}
          >
            <h2 className="text-[22px] font-black leading-tight text-white sm:text-[26px]">
              Continue explorando
            </h2>
            <p className="mt-1.5 text-[14px] text-slate-300">
              Integre aquisição, conversão e inteligência em um único ecossistema operacional.
            </p>

            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {content.relatedPages.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex flex-col justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-4 transition-all duration-200 hover:border-[#ff6a00]/40 hover:bg-white/10 hover:shadow-[0_8px_24px_rgba(255,106,0,0.15)]"
                  style={{
                    opacity: relatedSectionAnim.isVisible ? 1 : 0,
                    transform: relatedSectionAnim.isVisible ? 'translateY(0)' : 'translateY(12px)',
                    transition: `opacity 0.5s ease ${index * 0.08}s, transform 0.5s ease ${index * 0.08}s`,
                  }}
                >
                  <div>
                    <h3 className="text-[15px] font-bold text-white transition-colors group-hover:text-[#ff8f3a]">
                      {link.label}
                    </h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-slate-400">
                      {link.description}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[12px] font-bold text-[#ff8f3a] opacity-0 transition-opacity group-hover:opacity-100">
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
