'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCheck,
  Crown,
  Gem,
  Receipt,
  Rocket,
  ShieldCheck,
  TrendingUp,
  UserRound,
  UsersRound,
} from 'lucide-react';
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
    subtitle: 'Para começar com inteligência.',
    icon: Rocket,
    features: [
      'Acesso a todos os Agentes de IA com Automações inclusas',
      'Dashboard e relatórios essenciais',
      'Integrações e conectores básicos',
      'Suporte por email',
    ],
  },
  {
    title: 'Growth',
    subtitle: 'Para acelerar seu crescimento.',
    icon: TrendingUp,
    features: [
      'Acesso a todos os Agentes de IA com Automações inclusas',
      'Dashboards avançados',
      'Integrações e conectores avançados',
      'Suporte prioritário por email e chat',
    ],
  },
  {
    title: 'Pro Scale',
    subtitle: 'O melhor equilíbrio entre custo e escala.',
    icon: Gem,
    features: [
      'Acesso a todos os Agentes de IA com Automações inclusas',
      'Dashboards avançados e personalizados',
      'Integrações e conectores avançados',
      'Suporte prioritário por email e chat',
      'Alerta de anomalias e insights IA',
    ],
  },
  {
    title: 'Enterprise',
    subtitle: 'Para operações de alta performance.',
    icon: Crown,
    features: [
      'Acesso a todos os Agentes de IA com Automações inclusas',
      'Dashboards executivos e preditivos',
      'Integrações e conectores ilimitados',
      'Suporte dedicado e SLA',
      'Onboarding e estratégia personalizada',
    ],
  },
];

const journeySteps = [
  {
    title: 'Teste 14 dias',
    description: 'Explore todos os recursos sem compromisso.',
    icon: BadgeCheck,
  },
  {
    title: 'Escolha do plano',
    description: 'Selecione o plano ideal para sua operação.',
    icon: CheckCheck,
  },
  {
    title: 'Escala com mais agentes',
    description: 'Amplie sua operação liberando mais agentes ativos simultâneos.',
    icon: UsersRound,
  },
];

function formatPriceNumberFromCents(cents: number) {
  return Math.round(cents / 100).toLocaleString('pt-BR');
}

export default function ValuesResourcesSection() {
  const router = useRouter();
  const { user, loginWithGoogle } = useAuth();
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
          trialDays: offer.mode === 'subscription' ? 14 : 0,
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
      <div className="relative overflow-hidden rounded-[28px] border border-[#e8edf5] bg-[#f9fbff] p-4 shadow-[0_12px_34px_rgba(10,20,40,0.04)] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_15%,rgba(255,121,32,0.08)_0%,rgba(255,121,32,0)_50%),linear-gradient(180deg,#fafcff_0%,#f6f9ff_100%)]" />
        <div
          className="pointer-events-none absolute inset-0 hidden bg-cover bg-center bg-no-repeat md:block"
          style={{ backgroundImage: "url('/images/backgrounds/valores-recursos-bg-option-2-desktop.png')" }}
        />
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-top bg-no-repeat md:hidden"
          style={{ backgroundImage: "url('/images/backgrounds/valores-recursos-bg-option-2-mobile.png')" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-white/58" />

        <div className="relative z-10 text-center">
          <span className="inline-flex items-center rounded-full border border-[#ffceb0] bg-white px-6 py-2 text-[13px] font-extrabold uppercase tracking-[0.22em] text-[#ff5a00]">
            Valores & Recursos
          </span>
          <h2 className="mt-8 text-[30px] font-black leading-[1.08] tracking-[-0.02em] text-[#090f2a] sm:text-[38px] md:text-[54px] lg:text-[62px]">
            Escolha seu plano e escale com previsibilidade
          </h2>
          <p className="mt-6 text-[17px] text-[#47506a]">Comece com 14 dias de demonstração grátis. Cancele quando quiser.</p>
        </div>

        <div className="relative z-10 mt-16 grid gap-8 md:grid-cols-3 lg:gap-8">
          {journeySteps.map((step, index) => (
            <div key={step.title} className="relative rounded-2xl px-2 py-2">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-2xl border border-[#ffd9c5] bg-white text-[#ff5a00]">
                  <step.icon size={30} strokeWidth={2.2} />
                </span>
                <div>
                  <p className="text-[16px] font-extrabold text-[#101832]">
                    {index + 1}. {step.title}
                  </p>
                  <p className="mt-1 max-w-[340px] text-[14px] leading-[1.4] text-[#44506b]">{step.description}</p>
                </div>
              </div>
              {index < journeySteps.length - 1 ? (
                <span className="pointer-events-none absolute right-[-40px] top-1/2 hidden h-[2px] w-[86px] -translate-y-1/2 lg:block">
                  <span className="block h-full w-full bg-[#ff6a00]" />
                  <span className="absolute right-0 top-1/2 h-[10px] w-[10px] -translate-y-1/2 rounded-full bg-[#ff6a00]" />
                </span>
              ) : null}
            </div>
          ))}
        </div>

        <div className="relative z-10 mt-12 grid gap-4 xl:grid-cols-4">
          {planOffers.map((plan, index) => {
            const visual = planVisuals[index] ?? planVisuals[planVisuals.length - 1];
            const isRecommended = plan.slug === recommendedPlanSlug;
            const PlanIcon = visual.icon;

            return (
              <article
                key={plan.slug}
                className={`relative rounded-[22px] border bg-white p-5 shadow-[0_10px_26px_rgba(20,26,45,0.05)] ${
                  isRecommended ? 'border-[#ff5a00] ring-2 ring-[#ff5a00]/15' : 'border-[#e7ebf2]'
                }`}
              >
                {isRecommended ? (
                  <>
                    <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff5a00] px-4 py-1 text-[13px] font-bold text-white">
                      ★ Mais escolhido
                    </span>
                  </>
                ) : null}

                <div className="flex items-start gap-3">
                  <span
                    className={`inline-flex h-[62px] w-[62px] shrink-0 items-center justify-center rounded-full border ${
                      isRecommended ? 'border-[#ffcfb2] text-[#ff5a00]' : 'border-[#dbe1ea] text-[#1d2a43]'
                    } bg-[#f8fafc]`}
                  >
                    <PlanIcon size={33} strokeWidth={2.1} />
                  </span>
                  <div>
                    <h3 className="text-[24px] font-black leading-none text-[#0f1733]">{visual.title}</h3>
                    <p className="mt-2 text-[16px] leading-[1.3] text-[#405071]">{visual.subtitle}</p>
                  </div>
                </div>

                <div className="mt-6 flex items-end gap-2 border-b border-[#e7ebf2] pb-4">
                  <span className={`text-[24px] font-black sm:text-[30px] lg:text-[36px] ${isRecommended ? 'text-[#ff5a00]' : 'text-[#0f1733]'}`}>R$</span>
                  <span className={`text-[42px] font-black leading-none sm:text-[48px] lg:text-[56px] ${isRecommended ? 'text-[#ff5a00]' : 'text-[#0f1733]'}`}>
                    {formatPriceNumberFromCents(plan.amount)}
                  </span>
                  <span className="mb-1 text-[20px] text-[#47506a] sm:text-[24px] lg:text-[30px]">/mês</span>
                </div>

                <ul className="mt-4 space-y-2">
                  {visual.features.map((feature, featureIndex) => (
                    <li
                      key={feature}
                      className={`flex items-start gap-2 text-[14px] leading-[1.3] text-[#1f2b47] ${featureIndex === 4 ? 'hidden xl:flex' : ''}`}
                    >
                      <Check className="mt-1 shrink-0 text-[#159a52]" size={17} strokeWidth={3} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 border-t border-[#e7ebf2] pt-3">
                  <div className="text-[12px] text-[#2a3552]">
                    <p className="flex items-center gap-1.5">
                      <UsersRound size={16} />
                      <span>
                        <strong>{plan.limits.agents}</strong> Agentes ativos simultâneos
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCheckout(plan)}
                  disabled={loadingId === plan.slug}
                  className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-[16px] font-extrabold transition disabled:opacity-60 ${
                    isRecommended
                      ? 'border-[#ff5a00] bg-[#ff5a00] text-white hover:brightness-110'
                      : 'border-[#ff6a00] bg-white text-[#ff5a00] hover:bg-[#fff4ee]'
                  }`}
                >
                  {loadingId === plan.slug ? 'Abrindo checkout...' : 'Contratar plano'}
                  <ArrowRight size={18} />
                </button>

                {isRecommended ? (
                  <div className="mt-2 flex justify-center">
                    <span className="inline-flex rounded-full border border-[#ffbf93] bg-[#fff5ef] px-6 py-1 text-[14px] font-extrabold uppercase tracking-[0.08em] text-[#ff5a00]">
                      Plano Recomendado
                    </span>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        <div className="relative z-10 mt-10 grid gap-3 rounded-[18px] border border-[#e6ebf3] bg-white p-5 md:grid-cols-3">
          <div className="flex items-center gap-3">
            <ShieldCheck size={24} className="text-[#18223e]" />
            <div>
              <p className="text-[16px] font-extrabold text-[#18223e]">Checkout Stripe seguro</p>
              <p className="text-[13px] text-[#5f6a82]">Seus dados e pagamentos protegidos.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 md:border-l md:border-r md:border-[#e6ebf3] md:px-5">
            <Receipt size={24} className="text-[#18223e]" />
            <div>
              <p className="text-[16px] font-extrabold text-[#18223e]">Cobrança transparente</p>
              <p className="text-[13px] text-[#5f6a82]">Sem taxas escondidas.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <UserRound size={24} className="text-[#18223e]" />
            <div>
              <p className="text-[16px] font-extrabold text-[#18223e]">Acompanhamento no Hub</p>
              <p className="text-[13px] text-[#5f6a82]">Métricas, relatórios e histórico completo.</p>
            </div>
          </div>
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
