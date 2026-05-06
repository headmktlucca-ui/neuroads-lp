'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  CheckCheck,
  CircleDollarSign,
  Crown,
  Database,
  Gem,
  Receipt,
  Rocket,
  ShieldCheck,
  ShoppingCart,
  TrendingUp,
  UserRound,
  UsersRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import offers from '../../data/stripe-offers.json';
import { getFirebaseAuth } from '../../lib/firebase';

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
    includedExecutions: number;
    extraCreditUnitPrice: number;
  };
}

interface CreditOffer {
  slug: string;
  name: string;
  amount: number;
  description: string;
  priceId: string;
  mode: OfferMode;
  limits: {
    includedExecutions: number;
    unitPrice: number;
  };
}

const planOffers = offers.plans as PlanOffer[];
const creditOffers = offers.creditPacks as CreditOffer[];

const scheduleUrl = 'https://cal.com/atendimento-neuroads/atendimento?overlayCalendar=true';

const planVisuals = [
  {
    title: 'Start',
    subtitle: 'Para começar com inteligência.',
    icon: Rocket,
    features: [
      'Acesso a todos os Agentes de IA',
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
      'Acesso a todos os Agentes de IA',
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
      'Acesso a todos os Agentes de IA',
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
      'Acesso a todos os Agentes de IA',
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
    title: 'Escala com créditos',
    description: 'Aumente sua capacidade pagando apenas pelo que usar.',
    icon: BarChart3,
  },
];

function formatCurrencyFromCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatUnitPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
}

function formatPriceNumberFromCents(cents: number) {
  return Math.round(cents / 100).toLocaleString('pt-BR');
}

function getCreditPackShortName(includedExecutions: number) {
  if (includedExecutions >= 1000) return `Pacote ${Math.round(includedExecutions / 1000)}K`;
  return `Pacote ${includedExecutions}`;
}

export default function ValuesResourcesSection() {
  const { user, loginWithGoogle } = useAuth();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successKind, setSuccessKind] = useState<'plano' | 'credito'>('plano');
  const recommendedPlanSlug = planOffers[2]?.slug ?? planOffers[0]?.slug;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const success = params.get('success');
    const kind = params.get('kind');

    if (success === 'true') {
      setSuccessKind(kind === 'credito' ? 'credito' : 'plano');
      setShowSuccessModal(true);
      params.delete('success');
      params.delete('kind');
      params.delete('session_id');
      const nextQuery = params.toString();
      const nextUrl = `${window.location.pathname}${nextQuery ? `?${nextQuery}` : ''}${window.location.hash}`;
      window.history.replaceState({}, '', nextUrl);
    }
  }, []);

  const checkoutCopy = useMemo(
    () => ({
      plano: {
        title: 'Contratação confirmada com sucesso',
        description:
          'As instruções para acessar seu Hub Operacional serão enviadas em até 02 dias úteis. Enquanto isso, agende agora sua implantação de 30 minutos.',
      },
      credito: {
        title: 'Compra de créditos confirmada',
        description:
          'Seus créditos serão vinculados à sua conta e você receberá as instruções do Hub Operacional em até 02 dias úteis.',
      },
    }),
    [],
  );

  const handleCheckout = async (offer: PlanOffer | CreditOffer) => {
    try {
      setLoadingId(offer.slug);

      if (!user) {
        await loginWithGoogle();
      }
      const authUser = getFirebaseAuth().currentUser;

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: offer.priceId,
          userId: authUser?.uid,
          email: authUser?.email,
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
      <div className="rounded-[28px] border border-[#e8edf5] bg-[#f9fbff] p-4 shadow-[0_12px_34px_rgba(10,20,40,0.04)] sm:p-8 lg:p-10">
        <div className="text-center">
          <span className="inline-flex items-center rounded-full border border-[#ffceb0] bg-white px-6 py-2 text-[13px] font-extrabold uppercase tracking-[0.22em] text-[#ff5a00]">
            Valores & Recursos
          </span>
          <h2 className="mt-4 text-[38px] font-black leading-[1.08] tracking-[-0.02em] text-[#090f2a] md:text-[62px]">
            Escolha seu plano e escale com previsibilidade
          </h2>
          <p className="mt-3 text-[17px] text-[#47506a]">Comece com 14 dias de demonstração grátis. Cancele quando quiser.</p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3 lg:gap-8">
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

        <div className="mt-6 grid gap-4 xl:grid-cols-4">
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
                  <span className={`text-[36px] font-black ${isRecommended ? 'text-[#ff5a00]' : 'text-[#0f1733]'}`}>R$</span>
                  <span className={`text-[56px] font-black leading-none ${isRecommended ? 'text-[#ff5a00]' : 'text-[#0f1733]'}`}>
                    {formatPriceNumberFromCents(plan.amount)}
                  </span>
                  <span className="mb-1 text-[30px] text-[#47506a]">/mês</span>
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
                  <div className="grid grid-cols-2 gap-2 text-[12px] text-[#2a3552]">
                    <p className="flex items-center gap-1.5">
                      <UsersRound size={16} />
                      <span>
                        <strong>{plan.limits.agents}</strong> Agentes inclusos
                      </span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <BarChart3 size={16} />
                      <span>
                        <strong>{plan.limits.includedExecutions.toLocaleString('pt-BR')}</strong> execuções/mês
                      </span>
                    </p>
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-[13px] text-[#2a3552]">
                    <CircleDollarSign size={17} />
                    <span>
                      Crédito excedente: <strong>{formatUnitPrice(plan.limits.extraCreditUnitPrice)}</strong> por execução
                    </span>
                  </p>
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

        <div className="mt-6 rounded-[14px] border border-[#153462] bg-[linear-gradient(110deg,#071633_0%,#081c3f_45%,#061734_100%)] p-3 shadow-[0_18px_32px_rgba(2,8,22,0.35)]">
          <div className="grid gap-2 lg:grid-cols-[1.45fr_1fr_1fr_1fr]">
            <article className="rounded-[10px] border border-[#173c6e] bg-[#081a38] px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#ff6a00]/55 bg-[#0b1d3f] text-[#ff6a00]">
                  <Database size={21} />
                </span>
                <div>
                  <h3 className="text-[22px] font-extrabold leading-[1.06] text-white">Créditos avulsos para expansão imediata</h3>
                  <p className="mt-1 text-[13px] leading-[1.35] text-[#b7c4df]">
                    Quando seu consumo ultrapassar o limite do plano, adicione créditos sem precisar trocar de assinatura.
                  </p>
                </div>
              </div>
            </article>

            {creditOffers.map((credit) => (
              <article key={credit.slug} className="rounded-[10px] border border-[#173c6e] bg-[#081a38] px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#ff6a00]/60 bg-[#0b1d3f] text-[#ff6a00]">
                        <Database size={15} />
                      </span>
                      <span className="text-[13px] font-bold text-white">{getCreditPackShortName(credit.limits.includedExecutions)}</span>
                    </div>
                    <p className="text-[40px] font-black leading-none text-[#ff6a00]">{formatCurrencyFromCents(credit.amount)}</p>
                    <p className="mt-1 text-[13px] text-white">{credit.limits.includedExecutions.toLocaleString('pt-BR')} execuções</p>
                    <p className="text-[13px] text-[#c6d3e9]">{formatUnitPrice(credit.limits.unitPrice)} por execução</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCheckout(credit)}
                    disabled={loadingId === credit.slug}
                    className="inline-flex h-[84px] w-[92px] shrink-0 items-center justify-center rounded-[12px] border border-[#ff6a00] bg-transparent px-2 py-2 text-[12px] font-extrabold text-[#ff6a00] transition hover:bg-[#ff6a00]/10 disabled:opacity-60"
                  >
                    <span className="text-center leading-[1.05]">
                      {loadingId === credit.slug ? 'Processando...' : 'Comprar créditos'}
                      <span className="mt-1.5 block">
                        <ShoppingCart size={18} className="mx-auto" />
                      </span>
                    </span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 rounded-[18px] border border-[#e6ebf3] bg-white p-5 md:grid-cols-3">
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
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-[#0a111d]/70 p-4">
          <div className="w-full max-w-[560px] rounded-[20px] border border-[#e6ebf3] bg-white p-6 shadow-[0_30px_70px_rgba(4,10,20,0.35)]">
            <h3 className="text-[26px] font-extrabold text-[#1b2230]">{checkoutCopy[successKind].title}</h3>
            <p className="mt-3 text-[15px] leading-relaxed text-[#5a6478]">{checkoutCopy[successKind].description}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href={scheduleUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-full bg-[#ff6a00] px-5 py-3 text-[13px] font-extrabold uppercase tracking-[0.07em] text-white transition hover:brightness-110"
              >
                Agendar Implantação (30 min)
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
