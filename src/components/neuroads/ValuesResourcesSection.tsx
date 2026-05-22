'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowRight,
  Check,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import offers from '../../data/stripe-offers.json';
import { doc, setDoc } from 'firebase/firestore';
import { getFirebaseAuth, getFirebaseDb } from '../../lib/firebase';
import { verifyStripeCheckoutSession } from '../../lib/stripe-session-verifier';

type OfferMode = 'subscription' | 'payment';

interface PlanOffer {
  slug: string;
  name: string;
  amount: number;
  description: string;
  priceId: string;
  mode: OfferMode;
  trialDays?: number;
  limits: {
    agents: number;
  };
}

const planOffers = offers.plans as PlanOffer[];

const onboardingHubUrl = '/onboarding?next=%2Fhub';
const onboardingHubSetupUrl = '/onboarding?next=%2Fhub&setup_auth=1';

const planVisuals = [
  {
    title: 'Start',
    subtitle: 'Tudo que você precisa para começar com IA agêntica.',
    image: '/images/pricing-plans/icon_start_001.png',
    imageContainerClass: 'h-[124px] w-[124px]',
    imageClassName: 'scale-[1.22]',
    ctaLabel: 'Começar',
    buttonGradientClass: 'bg-[linear-gradient(90deg,#6f42ff_0%,#8f62ff_100%)]',
    buttonShadowClass: 'shadow-[0_14px_25px_rgba(111,66,255,0.30)]',
    titleClassName: 'text-[#6f42ff]',
    pricePrefixClassName: 'text-[#0a0f26]',
    priceSuffixClassName: 'text-[#6f42ff]',
    isCustomPrice: false,
    features: [
      'Insights de IA (Essencial)',
      'Até 5 fontes de dados',
      'Dashboards padrão',
      'Suporte por email',
    ],
  },
  {
    title: 'Growth',
    subtitle: 'Mais insights, mais automação e mais formas de crescer.',
    image: '/images/pricing-plans/icon_growth_001.png',
    imageContainerClass: 'h-[130px] w-[170px]',
    imageClassName: 'scale-[1.23]',
    ctaLabel: 'Escalar agora',
    buttonGradientClass: 'bg-[linear-gradient(90deg,#1f58ff_0%,#2c8bff_100%)]',
    buttonShadowClass: 'shadow-[0_14px_25px_rgba(31,88,255,0.28)]',
    titleClassName: 'text-[#1f58ff]',
    pricePrefixClassName: 'text-[#0a0f26]',
    priceSuffixClassName: 'text-[#1f58ff]',
    isCustomPrice: false,
    features: [
      'Insights de IA (Avançado)',
      'Até 20 fontes de dados',
      'Dashboards customizados',
      'Relatórios automatizados',
      'Suporte prioritário por email',
    ],
  },
  {
    title: 'Pro Scale',
    subtitle: 'IA avançada e inteligência profunda para escalar sua operação.',
    image: '/images/pricing-plans/icon_pro_scale_001.png',
    imageContainerClass: 'h-[126px] w-[142px]',
    imageClassName: 'scale-[1.2]',
    ctaLabel: 'Escalar agora',
    buttonGradientClass: 'bg-[linear-gradient(90deg,#ff5a00_0%,#ff9f1a_100%)]',
    buttonShadowClass: 'shadow-[0_14px_25px_rgba(255,101,15,0.35)]',
    titleClassName: 'text-[#ff5a00]',
    pricePrefixClassName: 'text-[#0a0f26]',
    priceSuffixClassName: 'text-[#ff5a00]',
    isCustomPrice: false,
    features: [
      'Insights de IA (acesso total)',
      'Fontes de dados ilimitadas',
      'Analytics avançado',
      'Modelagem preditiva',
      'Colaboração de equipe',
      'Suporte prioritário e onboarding',
    ],
  },
  {
    title: 'Enterprise',
    subtitle: 'Soluções sob medida, escala ilimitada e operação de alta performance.',
    image: '/images/pricing-plans/icon_enterprise_001.png',
    imageContainerClass: 'h-[126px] w-[144px]',
    imageClassName: 'scale-[1.2]',
    ctaLabel: 'Escalar agora',
    buttonGradientClass: 'bg-[linear-gradient(90deg,#5f45ff_0%,#8a5cff_100%)]',
    buttonShadowClass: 'shadow-[0_14px_25px_rgba(95,69,255,0.30)]',
    titleClassName: 'text-[#5f45ff]',
    pricePrefixClassName: 'text-[#0a0f26]',
    priceSuffixClassName: 'text-[#5f45ff]',
    isCustomPrice: false,
    features: [
      'Tudo do Pro Scale',
      'Integrações sob medida',
      'Segurança avançada e SSO',
      'Gestor de conta dedicado',
      'SLA e suporte premium',
    ],
  },
];

function formatPriceNumberFromCents(cents: number) {
  return Math.round(cents / 100).toLocaleString('pt-BR');
}

export default function ValuesResourcesSection() {
  const router = useRouter();
  const { user, loginWithGoogle } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const [hoveredPlanSlug, setHoveredPlanSlug] = useState<string | null>(null);
  const [selectedPlanSlug, setSelectedPlanSlug] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successKind, setSuccessKind] = useState<'plano' | 'credito'>('plano');
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  const [shouldRedirectToOnboarding, setShouldRedirectToOnboarding] = useState(false);
  const recommendedPlanSlug = planOffers[2]?.slug ?? planOffers[0]?.slug;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const kind = params.get('kind');
    const sessionId = params.get('session_id');

    if (success === 'true') {
      const isCreditPurchase = kind === 'credito';
      setSuccessKind(isCreditPurchase ? 'credito' : 'plano');

      if (isCreditPurchase) {
        setShowSuccessModal(true);
      } else {
        setShowSuccessModal(false);
        setShouldRedirectToOnboarding(true);
        if (sessionId) {
          setPendingSessionId(sessionId);
        }
      }

      params.delete('success');
      params.delete('kind');
      params.delete('session_id');
      const nextQuery = params.toString();
      const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash}`;
      window.history.replaceState({}, '', nextUrl);
    }
  }, []);

  useEffect(() => {
    const syncPremiumAfterCheckout = async () => {
      if (!shouldRedirectToOnboarding || !user || successKind !== 'plano') return;

      if (!pendingSessionId) {
        router.replace(onboardingHubSetupUrl);
        return;
      }

      try {
        const verifyResult = await verifyStripeCheckoutSession(pendingSessionId);
        if (!verifyResult.ok || !verifyResult.data) {
          throw new Error(verifyResult.error || 'Falha ao validar sessão do checkout.');
        }
        const data = verifyResult.data;

        const isCompletedSubscription = data.mode === 'subscription' && data.status === 'complete';
        const isCurrentUserSession = data.clientReferenceId === user.uid;

        if (isCompletedSubscription && isCurrentUserSession) {
          const db = getFirebaseDb();
          const userRef = doc(db, 'users', user.uid);
          await setDoc(
            userRef,
            {
              isPremium: true,
              stripeCustomerId: data.customerId ?? null,
              stripeSubscriptionId: data.subscriptionId ?? null,
              subscriptionStatus: data.subscriptionStatus ?? 'active',
              trialEndsAt:
                typeof data.trialEndsAt === 'number' && Number.isFinite(data.trialEndsAt)
                  ? data.trialEndsAt
                  : null,
              updatedAt: Date.now(),
            },
            { merge: true }
          );
        }
      } catch (error) {
        console.warn('Falha na sincronização pós-checkout do plano:', error);
      } finally {
        setPendingSessionId(null);
        router.replace(onboardingHubSetupUrl);
      }
    };

    void syncPremiumAfterCheckout();
  }, [pendingSessionId, router, shouldRedirectToOnboarding, successKind, user]);

  const checkoutCopy = useMemo(
    () => ({
      plano: {
        title: 'Contratação confirmada com sucesso',
        description:
          'As instruções para acessar seu Hub Operacional serão enviadas em até 02 dias úteis. Acesse seu Hub de Agentes no link abaixo:',
      },
      credito: {
        title: 'Compra de créditos confirmada',
        description:
          'Seus créditos serão vinculados à sua conta e você receberá as instruções do Hub Operacional em até 02 dias úteis.',
      },
    }),
    [],
  );

  const handleCheckout = async (offer: PlanOffer) => {
    try {
      setLoadingId(offer.slug);

      if (!user) {
        await loginWithGoogle();
      }
      const auth = getFirebaseAuth();
      const authUser = auth.currentUser;
      if (!authUser) {
        throw new Error('Sessão de autenticação não encontrada. Faça login novamente para continuar.');
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: offer.priceId,
          userId: authUser.uid,
          email: authUser.email,
          returnUrl: typeof window !== 'undefined' ? `${window.location.origin}/` : '',
          mode: offer.mode,
          kind: offer.mode === 'subscription' ? 'plano' : 'credito',
          trialDays: offer.mode === 'subscription' ? (offer.trialDays ?? 14) : 0,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Falha ao abrir checkout.');
      }

      window.location.href = data.url as string;
    } catch (error) {
      console.error(error);
      window.alert('Não foi possível iniciar o checkout agora. Tente novamente em instantes.');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <section id="pricing" className="mx-auto max-w-[1520px] px-4 pb-14 pt-12 md:px-8">
      <div className="relative overflow-hidden rounded-[32px] border-0 bg-[rgba(241,243,247,0.2)] px-4 pb-8 pt-4 shadow-[0_14px_34px_rgba(10,20,40,0.06)] sm:px-8 sm:pb-10 sm:pt-5 lg:px-10 lg:pb-12 lg:pt-6">
        <div className="relative z-10 mx-auto flex min-h-[160px] max-w-[980px] flex-col items-center justify-center text-center sm:min-h-[180px] lg:min-h-[200px]">
          <h2 className="font-black tracking-[-0.03em]">
            <span className="block text-[42px] leading-[0.98] text-[#060f29]">Sua operação muito mais</span>
            <span className="mt-3 block pb-[0.08em] bg-[linear-gradient(90deg,#ff8a00_0%,#ff6a00_50%,#ff9f1a_100%)] bg-clip-text text-[50px] leading-[1.03] text-transparent">
              inteligente, lucrativa e escalável.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-[820px] text-[19px] leading-[1.35] text-[#4e5a74]">
            Do início ao nível enterprise, nossa plataforma com IA ajuda você a analisar, automatizar e acelerar crescimento com previsibilidade.
          </p>
        </div>

        <div className="relative z-10 mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          {planOffers.map((plan, index) => {
            const visual = planVisuals[index] ?? planVisuals[planVisuals.length - 1];
            const isRecommended = plan.slug === recommendedPlanSlug;
            const isImageFloating =
              !prefersReducedMotion &&
              (isRecommended
                ? (selectedPlanSlug === null || selectedPlanSlug === plan.slug) &&
                  (hoveredPlanSlug === null || hoveredPlanSlug === plan.slug)
                : hoveredPlanSlug === plan.slug);

            return (
              <motion.article
                key={plan.slug}
                onClick={() => setSelectedPlanSlug(plan.slug)}
                onHoverStart={() => setHoveredPlanSlug(plan.slug)}
                onHoverEnd={() => setHoveredPlanSlug((current) => (current === plan.slug ? null : current))}
                className={`group relative flex h-full cursor-pointer flex-col overflow-visible rounded-[24px] border px-6 pb-6 backdrop-blur-xl ${
                  isRecommended ? 'pt-[126px]' : 'pt-[112px]'
                } shadow-[0_18px_48px_rgba(13,23,45,0.14)] transition-[box-shadow,border-color,background-color] duration-300 ${
                  isRecommended
                    ? 'border-0 bg-[linear-gradient(165deg,rgba(255,255,255,0.78),rgba(255,245,237,0.58))] hover:shadow-[0_36px_92px_rgba(255,110,35,0.38)]'
                    : 'border-white/55 bg-[linear-gradient(165deg,rgba(255,255,255,0.74),rgba(245,250,255,0.54))] hover:border-white/70 hover:shadow-[0_34px_88px_rgba(15,33,70,0.30)]'
                }`}
              >
                <div
                  className={`pointer-events-none absolute inset-0 rounded-[24px] opacity-100 ${
                    isRecommended
                      ? 'bg-[radial-gradient(circle_at_35%_0%,rgba(255,162,82,0.22),rgba(255,255,255,0)_58%)]'
                      : 'bg-[radial-gradient(circle_at_35%_0%,rgba(137,160,255,0.16),rgba(255,255,255,0)_58%)]'
                  }`}
                />
                <div className={`pointer-events-none absolute inset-0 rounded-[24px] ${isRecommended ? '' : 'border border-white/45'}`} />
                {isRecommended ? (
                  <span className="absolute left-1/2 top-0 z-30 -translate-x-1/2 -translate-y-[58%] whitespace-nowrap rounded-full bg-[#ff5f0f] px-6 py-1 text-[13px] font-extrabold uppercase tracking-[0.03em] text-white">
                    ★ Mais escolhido
                  </span>
                ) : null}

                <motion.div
                  animate={isImageFloating ? { y: [0, -11, 0] } : { y: 0 }}
                  transition={
                    isImageFloating
                      ? { duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }
                      : { duration: 0.2, ease: 'easeOut' }
                  }
                  className={`pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-[30%] ${visual.imageContainerClass}`}
                >
                  <Image
                    src={visual.image}
                    alt={`Imagem do plano ${visual.title}`}
                    fill
                    sizes="220px"
                    className={`object-contain drop-shadow-[0_16px_28px_rgba(10,20,40,0.18)] ${visual.imageClassName}`}
                    priority={index < 2}
                  />
                </motion.div>

                <h3 className={`text-[24px] font-black leading-none ${visual.titleClassName}`}>{visual.title}</h3>
                <p className="mt-2 min-h-[68px] text-[16px] leading-[1.35] text-[#3f4a63]">{visual.subtitle}</p>

                <div className="mt-4 border-b border-[#e7edf7] pb-4">
                  {visual.isCustomPrice ? (
                    <>
                      <p className="text-[56px] font-black leading-none text-[#0b132d]">Sob consulta</p>
                      <p className="mt-2 text-[14px] font-semibold text-[#6f7b95]">Vamos construir uma operação sob medida.</p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-end gap-1.5">
                        <span className={`text-[45px] font-black leading-none ${visual.pricePrefixClassName}`}>R$ {formatPriceNumberFromCents(plan.amount)}</span>
                        <span className={`mb-2 text-[30px] font-black ${visual.priceSuffixClassName}`}>/mês</span>
                      </div>
                      <p className="mt-2 text-[14px] font-semibold text-[#6f7b95]">Cobrança mensal</p>
                    </>
                  )}
                </div>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {visual.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-[14px] leading-[1.28] text-[#25324d]">
                      <span
                        className={`mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${
                          isRecommended ? 'bg-[#ff7a1b] text-white' : 'bg-[#2759de] text-white'
                        }`}
                      >
                        <Check size={12} strokeWidth={3.1} />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handleCheckout(plan)}
                  disabled={loadingId === plan.slug}
                  className={`relative mt-6 inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-[12px] border border-transparent px-5 py-3 text-[17px] font-extrabold text-white transition duration-300 disabled:opacity-60 hover:brightness-105 ${visual.buttonGradientClass} ${visual.buttonShadowClass}`}
                >
                  <span>{loadingId === plan.slug ? 'Abrindo checkout...' : visual.ctaLabel}</span>
                  <ArrowRight size={20} />
                </button>
              </motion.article>
            );
          })}
        </div>

      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-[95] flex items-start justify-center overflow-y-auto bg-[#0a111d]/70 p-4 sm:items-center">
          <div className="w-full max-w-[560px] rounded-[20px] border border-[#e6ebf3] bg-white p-6 shadow-[0_30px_70px_rgba(4,10,20,0.35)]">
            <h3 className="text-[26px] font-extrabold text-[#1b2230]">{checkoutCopy[successKind].title}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[#5a6478]">{checkoutCopy[successKind].description}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={onboardingHubUrl}
                className="inline-flex items-center justify-center rounded-full bg-[#ff6a00] px-5 py-3 text-[13px] font-extrabold uppercase tracking-[0.07em] text-white transition hover:brightness-110"
              >
                Acessar meu Hub
              </a>
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="inline-flex items-center justify-center rounded-full border border-[#d4dbe7] px-5 py-3 text-[13px] font-bold text-[#364154]"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
