'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { doc, setDoc } from 'firebase/firestore';
import { ArrowRight, Building2, Check, CheckCircle2, Globe, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getFirebaseDb } from '../../lib/firebase';
import { getHubLoginRedirect, hasHubPlanAccess, normalizeHubNextPath } from '../../lib/hub-access';
import { formatWhatsappInput } from '../../lib/phone-mask';
import { verifyStripeCheckoutSession } from '../../lib/stripe-session-verifier';
import { HTTPS_PREFIX, isHttpsPlaceholderOnly, normalizeHttpsMaskedUrlInput } from '../../lib/url-mask';
import stripeOffersCatalog from '../../data/stripe-offers.json';
import { AuthLeftPanel } from '../../components/auth/AuthLeftPanel';

type Step = 1 | 2 | 3;

type BusinessForm = {
  companyName: string;
  segment: string;
  revenueRange: string;
  site: string;
  whatsapp: string;
};

type PlanOffer = {
  slug: string;
  name: string;
  amount: number;
  amountAnnual?: number;
  description?: string;
  priceId: string;
  priceIdAnnual?: string;
};

const DEFAULT_FORM: BusinessForm = {
  companyName: '',
  segment: '',
  revenueRange: '',
  site: HTTPS_PREFIX,
  whatsapp: '',
};

const OBJECTIVES = [
  'Saber de onde vem cada venda',
  'Escalar sem depender de sorte ou indicação',
  'Reduzir desperdício de verba em mídia',
  'Ganhar previsibilidade de receita no mês',
  'Automatizar tarefas operacionais com IA',
];

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function formatCurrencyFromCents(value: number): string {
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: String(stripeOffersCatalog.currency || 'BRL').toUpperCase(),
    minimumFractionDigits: 2,
  }).format(value / 100);
  
  return formatted.replace(/,00$/, '');
}

function OnboardingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userEmail, profile, loading, premiumSyncing } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<BusinessForm>(DEFAULT_FORM);
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const nextPath = useMemo(() => normalizeHubNextPath(searchParams.get('next'), '/hub'), [searchParams]);
  const entryState = searchParams.get('state');
  const requestedStep = searchParams.get('step');
  const checkoutSuccess = searchParams.get('success') === 'true';
  const checkoutSessionId = searchParams.get('session_id')?.trim() ?? '';

  const plans = useMemo(
    () => ((stripeOffersCatalog.plans || []) as PlanOffer[]).filter((plan) => Boolean(plan.slug)),
    []
  );

  const plan = plans.length > 0 ? plans[0] : null;

  useEffect(() => {
    if (requestedStep === 'plan') {
      setStep(3);
    }
  }, [requestedStep]);

  useEffect(() => {
    if (!user || !checkoutSuccess) return;

    let active = true;

    const syncAndRedirectToHub = async () => {
      try {
        setIsSaving(true);
        setErrorMessage(null);

        if (checkoutSessionId) {
          const verification = await verifyStripeCheckoutSession(checkoutSessionId);
          if (!verification.ok) {
            throw new Error(verification.error || 'Falha ao validar checkout no Stripe.');
          }
        }

        const token = await user.getIdToken();
        await fetch('/api/stripe/sync-premium', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId: checkoutSessionId || undefined }),
        });

        if (!active) return;
        router.replace('/hub');
      } catch (error) {
        console.error('Falha ao finalizar contratação no onboarding:', error);
        if (!active) return;
        setErrorMessage('Pagamento identificado, mas não conseguimos liberar o Hub automaticamente. Tente novamente em alguns segundos.');
      } finally {
        if (active) setIsSaving(false);
      }
    };

    void syncAndRedirectToHub();

    return () => {
      active = false;
    };
  }, [checkoutSessionId, checkoutSuccess, router, user]);

  useEffect(() => {
    if (loading) return;
    if (user && !user.emailVerified) {
      router.replace('/verificar-email');
      return;
    }
    if (user && hasHubPlanAccess(profile)) {
      router.replace(nextPath);
    }
  }, [loading, nextPath, profile, router, user]);

  useEffect(() => {
    if (loading || user) return;
    router.replace(getHubLoginRedirect(`/onboarding?next=${encodeURIComponent(nextPath)}`));
  }, [loading, nextPath, router, user]);

  useEffect(() => {
    if (!profile) return;

    const record = profile as Record<string, unknown>;
    const onboarding = record.onboarding && typeof record.onboarding === 'object'
      ? (record.onboarding as Record<string, unknown>)
      : null;

    setForm((current) => ({
      companyName: current.companyName || readString(record.companyName ?? onboarding?.companyName),
      segment: current.segment || readString(record.segment ?? onboarding?.segment),
      revenueRange: current.revenueRange || readString(record.revenueRange ?? onboarding?.revenueRange),
      site: current.site !== HTTPS_PREFIX
        ? current.site
        : normalizeHttpsMaskedUrlInput(readString(record.site ?? onboarding?.site) || HTTPS_PREFIX),
      whatsapp: current.whatsapp || formatWhatsappInput(readString(record.whatsapp ?? onboarding?.whatsapp)),
    }));

    if (selectedObjectives.length === 0) {
      setSelectedObjectives(readStringArray(onboarding?.objectives));
    }
  }, [profile, selectedObjectives.length]);

  const persistOnboardingProgress = useCallback(async (overrides?: Partial<BusinessForm>) => {
    if (!user) return;

    const payloadForm = {
      ...form,
      ...overrides,
    };

    const now = Date.now();
    const normalizedSite = normalizeHttpsMaskedUrlInput(payloadForm.site);
    const authEmail = userEmail?.trim() || user.email?.trim() || null;

    const payload = {
      companyName: payloadForm.companyName.trim(),
      segment: payloadForm.segment.trim(),
      revenueRange: payloadForm.revenueRange.trim(),
      site: normalizedSite,
      whatsapp: payloadForm.whatsapp.trim(),
      onboardingStep: step,
      updatedAt: now,
      ...(authEmail ? { authEmail, email: authEmail } : {}),
      onboarding: {
        companyName: payloadForm.companyName.trim(),
        segment: payloadForm.segment.trim(),
        revenueRange: payloadForm.revenueRange.trim(),
        site: normalizedSite,
        whatsapp: payloadForm.whatsapp.trim(),
        objectives: selectedObjectives,
        updatedAt: now,
      },
    };

    await setDoc(doc(getFirebaseDb(), 'users', user.uid), payload, { merge: true });
  }, [form, selectedObjectives, step, user, userEmail]);

  const handleNextFromBusiness = async () => {
    const normalizedSite = normalizeHttpsMaskedUrlInput(form.site);
    const hasRequired =
      form.companyName.trim().length > 0 &&
      form.segment.trim().length > 0 &&
      form.revenueRange.trim().length > 0 &&
      !isHttpsPlaceholderOnly(normalizedSite) &&
      form.whatsapp.trim().length > 0;

    if (!hasRequired) {
      setErrorMessage('Preencha empresa, segmento, faixa de faturamento, site e WhatsApp para avançar.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);
      setForm((current) => ({ ...current, site: normalizedSite }));
      await persistOnboardingProgress({ site: normalizedSite });
      setStep(2);
    } catch (error) {
      console.error('Falha ao salvar etapa de negócio:', error);
      setErrorMessage('Não foi possível salvar seus dados agora.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNextFromObjectives = async () => {
    if (selectedObjectives.length === 0) {
      setErrorMessage('Selecione pelo menos um objetivo para continuar.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);
      await persistOnboardingProgress();
      setStep(3);
    } catch (error) {
      console.error('Falha ao salvar etapa de fontes:', error);
      setErrorMessage('Não foi possível salvar as fontes agora.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartTrial = async () => {
    if (!user) return;
    const selectedPlan = plan;
    if (!selectedPlan) {
      setErrorMessage('Nenhum plano disponível para iniciar o trial.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);
      const now = Date.now();
      const trialEndsAt = now + 14 * 24 * 60 * 60 * 1000;
      const authEmail = userEmail?.trim() || user.email?.trim() || null;

      await setDoc(
        doc(getFirebaseDb(), 'users', user.uid),
        {
          selectedPlanSlug: selectedPlan.slug,
          selectedPlan: selectedPlan.name,
          planSlug: selectedPlan.slug,
          planName: selectedPlan.name,
          planAmountCents: selectedPlan.amount,
          subscriptionStatus: 'trialing',
          trialEndsAt,
          updatedAt: now,
          ...(authEmail ? { authEmail, email: authEmail } : {}),
          onboarding: {
            companyName: form.companyName.trim(),
            segment: form.segment.trim(),
            revenueRange: form.revenueRange.trim(),
            site: normalizeHttpsMaskedUrlInput(form.site),
            whatsapp: form.whatsapp.trim(),
            objectives: selectedObjectives,
            planSlug: selectedPlan.slug,
            planName: selectedPlan.name,
            planAmountCents: selectedPlan.amount,
            subscriptionStatus: 'trialing',
            trialEndsAt,
            completedAt: now,
            updatedAt: now,
          },
        },
        { merge: true }
      );

      router.replace(nextPath);
    } catch (error) {
      console.error('Falha ao iniciar trial:', error);
      setErrorMessage('Não foi possível iniciar o trial agora.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoToStripeCheckout = async () => {
    if (!user) return;
    const selectedPlan = plan;
    if (!selectedPlan?.priceId) {
      setErrorMessage('Plano sem configuração de cobrança.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);

      const returnUrl = typeof window !== 'undefined' ? `${window.location.origin}/onboarding?step=plan` : '/onboarding?step=plan';

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: selectedPlan.priceId,
          userId: user.uid,
          email: userEmail || user.email,
          returnUrl,
          mode: 'subscription',
          kind: 'plano',
          trialDays: 14,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Falha ao abrir checkout.');
      }

      window.location.href = data.url as string;
    } catch (error) {
      console.error('Falha ao abrir checkout:', error);
      setErrorMessage('Não foi possível abrir o checkout agora.');
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading || (user && premiumSyncing)) {
    return (
      <div className="min-h-screen bg-[#EDF1F5] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6A00] border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <div className="min-h-screen bg-[#EDF1F5]" />;
  }

  const STEP_LABELS: Record<Step, string> = {
    1: 'Dados da empresa',
    2: 'Objetivos estratégicos',
    3: 'Plano de ativação',
  };

  return (
    <div className="min-h-screen flex bg-[#EDF1F5]">
      {/* Left Panel — identical to login */}
      <div className="hidden lg:block flex-1 min-w-0">
        <AuthLeftPanel />
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-start justify-center bg-[#EDF1F5] p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-[540px] my-auto py-8">

          {/* Mobile brand */}
          <div className="lg:hidden mb-8 text-center">
            <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#FF6A00]">NeuroAds · Ativação</span>
          </div>

          {/* Card */}
          <div className="w-full p-6 sm:p-8 rounded-2xl border border-slate-300 bg-white shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff]">

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#FF6A00]">
                  NeuroAds · Ativação
                </p>
                <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <CheckCircle2 size={12} className="text-[#08B760]" />
                  Etapa {step} de 3
                </div>
              </div>
              <h1 className="text-[24px] font-black text-slate-900 leading-tight">
                {STEP_LABELS[step]}
              </h1>
              <p className="mt-1.5 text-[13px] text-slate-500 font-medium">
                {step === 1 && 'Preencha os dados do seu negócio para personalizar seu Hub.'}
                {step === 2 && 'Selecione as dores prioritárias para calibrar seus agentes.'}
                {step === 3 && 'Comece com trial grátis de 14 dias ou ative diretamente com cartão.'}
              </p>
            </div>

            {/* Step progress dots */}
            <div className="flex gap-1.5 mb-6">
              {([1, 2, 3] as Step[]).map((s) => (
                <div
                  key={s}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    s === step
                      ? 'flex-[2] bg-[#FF6A00]'
                      : s < step
                      ? 'flex-1 bg-[#FF6A00]/30'
                      : 'flex-1 bg-slate-100'
                  }`}
                />
              ))}
            </div>

            {/* Entry state alert */}
            {entryState ? (
              <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                <p className="text-[13px] font-semibold text-red-400">
                  {entryState === 'trial_expired' && 'Seu trial expirou, mas seus dados estão salvos. Reative o plano para voltar ao Hub.'}
                  {entryState === 'canceled' && 'Seu plano foi cancelado. Reative para retomar sua escala previsível.'}
                  {entryState === 'past_due' && 'Seu pagamento está pendente. Atualize seu cartão para manter operação ativa.'}
                  {entryState === 'suspended' && 'Conta suspensa no momento. Fale com o especialista para regularizar.'}
                </p>
              </div>
            ) : null}

            {/* ── STEP 1: Dados da empresa ─────────────────────────────── */}
            {step === 1 ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Empresa *
                  </label>
                  <div className="relative">
                    <Building2 size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={form.companyName}
                      onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))}
                      placeholder="Nome da empresa"
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-[14px] text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-[#FF6A00]/50 focus:ring-1 focus:ring-[#FF6A00]/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Segmento *
                  </label>
                  <input
                    value={form.segment}
                    onChange={(e) => setForm((prev) => ({ ...prev, segment: e.target.value }))}
                    placeholder="Ex: Serviços profissionais"
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-[14px] text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-[#FF6A00]/50 focus:ring-1 focus:ring-[#FF6A00]/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Faturamento mensal *
                  </label>
                  <select
                    value={form.revenueRange}
                    onChange={(e) => setForm((prev) => ({ ...prev, revenueRange: e.target.value }))}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-[14px] text-slate-955 focus:outline-none focus:border-[#FF6A00]/50 focus:ring-1 focus:ring-[#FF6A00]/30 transition-all [&>option]:bg-white [&>option]:text-slate-955"
                  >
                    <option value="">Selecione a faixa</option>
                    <option value="R$ 30k - R$ 60k">R$ 30k - R$ 60k</option>
                    <option value="R$ 60k - R$ 120k">R$ 60k - R$ 120k</option>
                    <option value="R$ 120k - R$ 200k">R$ 120k - R$ 200k</option>
                    <option value="Acima de R$ 200k">Acima de R$ 200k</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Site *
                  </label>
                  <div className="relative">
                    <Globe size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={form.site}
                      onChange={(e) => setForm((prev) => ({ ...prev, site: normalizeHttpsMaskedUrlInput(e.target.value) }))}
                      onBlur={(e) => setForm((prev) => ({ ...prev, site: normalizeHttpsMaskedUrlInput(e.target.value) }))}
                      placeholder="https://empresa.com.br"
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-[14px] text-slate-955 placeholder:text-slate-400 focus:outline-none focus:border-[#FF6A00]/50 focus:ring-1 focus:ring-[#FF6A00]/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={form.whatsapp}
                      onChange={(e) => setForm((prev) => ({ ...prev, whatsapp: formatWhatsappInput(e.target.value) }))}
                      maxLength={15}
                      placeholder="(00) 00000-0000"
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-[14px] text-slate-955 placeholder:text-slate-400 focus:outline-none focus:border-[#FF6A00]/50 focus:ring-1 focus:ring-[#FF6A00]/30 transition-all"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {/* ── STEP 2: Objetivos ────────────────────────────────────── */}
            {step === 2 ? (
              <div className="space-y-3">
                {OBJECTIVES.map((objective) => {
                  const selected = selectedObjectives.includes(objective);
                  return (
                    <button
                      key={objective}
                      type="button"
                      onClick={() =>
                        setSelectedObjectives((current) =>
                          current.includes(objective)
                            ? current.filter((item) => item !== objective)
                            : [...current, objective]
                        )
                      }
                      className={`w-full rounded-xl border px-4 py-3 text-left text-[14px] font-semibold transition-all duration-200 ${
                        selected
                          ? 'border-[#08B760]/50 bg-[#08B760]/10 text-[#08B760]'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-[#FF6A00]/40 hover:text-slate-950'
                      }`}
                    >
                      {objective}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {/* ── STEP 3: Plano ────────────────────────────────────────── */}
            {step === 3 ? (
              plan ? (
                <div>
                  <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5">
                    <div className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#FF6A00]/15 blur-3xl" />
                    <div className="pointer-events-none absolute inset-0 rounded-2xl border border-[#FF6A00]/20" />

                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5">
                      <div className="relative shrink-0 h-[100px] w-[112px]">
                        <Image
                          src="/images/pricing-plans/icon_pro_scale_001.png"
                          alt="Imagem do plano NeuroAds IA Pro"
                          fill
                          sizes="112px"
                          className="object-contain drop-shadow-[0_8px_20px_rgba(255,90,0,0.25)] scale-[1.15]"
                          priority
                        />
                      </div>

                      <div className="flex-1">
                        <h3 className="text-[22px] font-black leading-none text-[#FF6A00]">{plan.name}</h3>
                        <p className="mt-1.5 text-[13px] text-slate-500 leading-snug">
                          IA avançada e inteligência profunda para escalar sua operation.
                        </p>

                        <div className="mt-3 flex flex-wrap items-end gap-2 pb-3 border-b border-slate-300">
                          <div className="flex items-end gap-1">
                            <span className="text-[30px] font-black leading-none text-slate-900">
                              R$ {formatCurrencyFromCents(plan.amount).replace('R$', '').trim()}
                            </span>
                            <span className="mb-0.5 text-[16px] font-black text-[#FF6A00]">/mês</span>
                          </div>
                          {(plan as Record<string, unknown>).amountAnnual ? (
                            <span className="mb-1 rounded-full bg-[#FF6A00]/10 px-2.5 py-0.5 text-[11px] font-extrabold text-[#FF6A00] border border-[#FF6A00]/20">
                              OU R$ {formatCurrencyFromCents((plan as Record<string, unknown>).amountAnnual as number).replace('R$', '').trim()}/ANO
                            </span>
                          ) : null}
                        </div>

                        <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-3">
                          {['Insights de IA (acesso total)', 'Fontes de dados ilimitadas', 'Analytics avançado', 'Modelagem preditiva'].map((feature) => (
                            <li key={feature} className="flex items-start gap-2 text-[12px] leading-snug text-slate-600">
                              <span className="mt-0.5 inline-flex h-[14px] w-[14px] shrink-0 items-center justify-center rounded-full bg-[#FF6A00] text-slate-900">
                                <Check size={9} strokeWidth={3.5} />
                              </span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-center text-[11px] text-slate-400 leading-relaxed">
                    Seus dados ficam preservados mesmo em reentrada (trial expirado, cancelado ou pendência).
                  </p>
                </div>
              ) : (
                <p className="text-[13px] text-red-400">Nenhum plano disponível no momento.</p>
              )
            ) : null}

            {/* Error */}
            {errorMessage ? (
              <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                <p className="text-[13px] font-semibold text-red-400">{errorMessage}</p>
              </div>
            ) : null}

            {/* Navigation */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => {
                  if (step === 1) {
                    router.push('/login');
                    return;
                  }
                  setErrorMessage(null);
                  setStep((current) => (current === 3 ? 2 : 1));
                }}
                className="rounded-xl border border-slate-200 px-5 h-11 text-[12px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all"
              >
                Voltar
              </button>

              <div className="flex flex-col gap-2 sm:flex-row">
                {step === 1 && (
                  <button
                    type="button"
                    onClick={handleNextFromBusiness}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-gradient-to-r from-[#F24900] to-[#FF8805] hover:from-[#d93f00] hover:to-[#e07500] disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 font-bold text-[14px] px-5 transition-all shadow-[0_0_24px_rgba(255,106,0,0.3)] hover:shadow-[0_0_32px_rgba(255,106,0,0.45)]"
                  >
                    {isSaving ? 'Salvando...' : 'Continuar'}
                    {!isSaving && <ArrowRight size={14} />}
                  </button>
                )}

                {step === 2 && (
                  <button
                    type="button"
                    onClick={handleNextFromObjectives}
                    disabled={isSaving}
                    className="inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-gradient-to-r from-[#F24900] to-[#FF8805] hover:from-[#d93f00] hover:to-[#e07500] disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 font-bold text-[14px] px-5 transition-all shadow-[0_0_24px_rgba(255,106,0,0.3)] hover:shadow-[0_0_32px_rgba(255,106,0,0.45)]"
                  >
                    {isSaving ? 'Salvando...' : 'Ir para plano'}
                    {!isSaving && <ArrowRight size={14} />}
                  </button>
                )}

                {step === 3 && (
                  <>
                    <button
                      type="button"
                      onClick={handleStartTrial}
                      disabled={isSaving}
                      className="h-11 rounded-xl border border-[#08B760]/50 bg-transparent hover:bg-[#08B760]/10 transition-colors px-5 text-[13px] font-bold text-[#08B760] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isSaving ? 'Processando...' : 'Trial grátis (14 dias)'}
                    </button>
                    <button
                      type="button"
                      onClick={handleGoToStripeCheckout}
                      disabled={isSaving}
                      className="h-11 rounded-xl bg-gradient-to-r from-[#F24900] to-[#FF8805] hover:from-[#d93f00] hover:to-[#e07500] disabled:opacity-40 disabled:cursor-not-allowed text-slate-900 font-bold text-[14px] px-5 transition-all shadow-[0_0_24px_rgba(255,106,0,0.3)] hover:shadow-[0_0_32px_rgba(255,106,0,0.45)]"
                    >
                      {isSaving ? 'Abrindo checkout...' : 'Ativar com cartão →'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#EDF1F5] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6A00] border-t-transparent" />
        </div>
      }
    >
      <OnboardingPageContent />
    </Suspense>
  );
}
