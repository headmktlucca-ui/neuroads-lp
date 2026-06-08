'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { ArrowRight, Building2, CheckCircle2, Globe, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getFirebaseDb } from '../../lib/firebase';
import { getHubLoginRedirect, hasHubPlanAccess, normalizeHubNextPath } from '../../lib/hub-access';
import { formatWhatsappInput } from '../../lib/phone-mask';
import { verifyStripeCheckoutSession } from '../../lib/stripe-session-verifier';
import { HTTPS_PREFIX, isHttpsPlaceholderOnly, normalizeHttpsMaskedUrlInput } from '../../lib/url-mask';
import stripeOffersCatalog from '../../data/stripe-offers.json';
import { AuthPagesBackdrop } from '../../components/auth/AuthPagesBackdrop';

type Step = 1 | 2 | 3 | 4;

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
  priceId: string;
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

const DATA_SOURCES = [
  { key: 'google_ads', label: 'Google Ads' },
  { key: 'meta_ads', label: 'Meta Ads' },
  { key: 'ga4', label: 'Google Analytics (GA4)' },
];

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function formatCurrencyFromCents(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: String(stripeOffersCatalog.currency || 'BRL').toUpperCase(),
    minimumFractionDigits: 0,
  }).format(value / 100);
}

function OnboardingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userEmail, profile, loading, premiumSyncing } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<BusinessForm>(DEFAULT_FORM);
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedPlanSlug, setSelectedPlanSlug] = useState('');
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

  useEffect(() => {
    if (plans.length === 0) return;
    setSelectedPlanSlug((current) => current || plans[0].slug);
  }, [plans]);

  useEffect(() => {
    if (requestedStep === 'plan') {
      setStep(4);
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

        await fetch('/api/stripe/sync-premium', { method: 'POST' });

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

    if (selectedSources.length === 0) {
      setSelectedSources(readStringArray(onboarding?.dataSources));
    }
  }, [profile, selectedObjectives.length, selectedSources.length]);

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
        dataSources: selectedSources,
        updatedAt: now,
      },
    };

    await setDoc(doc(getFirebaseDb(), 'users', user.uid), payload, { merge: true });
  }, [form, selectedObjectives, selectedSources, step, user, userEmail]);

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
      console.error('Falha ao salvar etapa de objetivos:', error);
      setErrorMessage('Não foi possível salvar os objetivos agora.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNextFromSources = async () => {
    try {
      setIsSaving(true);
      setErrorMessage(null);
      await persistOnboardingProgress();
      setStep(4);
    } catch (error) {
      console.error('Falha ao salvar etapa de fontes:', error);
      setErrorMessage('Não foi possível salvar as fontes agora.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartTrial = async () => {
    if (!user) return;
    const selectedPlan = plans.find((plan) => plan.slug === selectedPlanSlug) ?? plans[0];
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
            dataSources: selectedSources,
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
    const selectedPlan = plans.find((plan) => plan.slug === selectedPlanSlug) ?? null;
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

  if (loading || (user && premiumSyncing)) {
    return (
      <main className="relative min-h-screen bg-bg-main">
        <AuthPagesBackdrop />
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1160px] items-center justify-center px-5 py-14">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="relative min-h-screen bg-bg-main">
        <AuthPagesBackdrop />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-bg-main text-text-main">
      <AuthPagesBackdrop />
      <div className="relative z-10 mx-auto w-full max-w-[1160px] px-5 py-10 sm:py-14">
        <section className="mx-auto w-full max-w-[920px] rounded-[30px] border border-border bg-white p-6 shadow-[0_24px_54px_rgba(15,23,42,0.08)] sm:p-9">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary">NeuroAds · Ativação</p>
              <h1 className="mt-2 text-[30px] font-extrabold leading-tight text-text-main">
                Onboarding estratégico em 3 passos + plano
              </h1>
              <p className="mt-2 text-sm text-text-muted">
                Primeiro alinhamos contexto do negócio. Depois calibramos objetivos e fontes para ativar seu Hub com inteligência.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-secondary px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-text-dim">
              <CheckCircle2 size={14} className="text-[#0A9D57]" /> Etapa {step} de 4
            </div>
          </div>

          {entryState ? (
            <div className="mt-5 rounded-2xl border border-[#FFD7BD] bg-[#FFF6EF] px-4 py-3 text-sm text-[#9A3412]">
              {entryState === 'trial_expired' && 'Seu trial expirou, mas seus dados estão salvos. Reative o plano para voltar ao Hub.'}
              {entryState === 'canceled' && 'Seu plano foi cancelado. Reative para retomar sua escala previsível.'}
              {entryState === 'past_due' && 'Seu pagamento está pendente. Atualize seu cartão para manter operação ativa.'}
              {entryState === 'suspended' && 'Conta suspensa no momento. Fale com o especialista para regularizar.'}
            </div>
          ) : null}

          {step === 1 ? (
            <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-text-dim">Empresa *</label>
                <div className="relative">
                  <Building2 size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                  <input value={form.companyName} onChange={(event) => setForm((prev) => ({ ...prev, companyName: event.target.value }))} placeholder="Nome da empresa" className="w-full rounded-xl border border-border bg-bg-secondary px-10 py-3 text-sm font-semibold text-text-main outline-none transition-colors focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-text-dim">Segmento *</label>
                <input value={form.segment} onChange={(event) => setForm((prev) => ({ ...prev, segment: event.target.value }))} placeholder="Ex: Serviços profissionais" className="w-full rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none transition-colors focus:border-primary" />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-text-dim">Faturamento mensal *</label>
                <select value={form.revenueRange} onChange={(event) => setForm((prev) => ({ ...prev, revenueRange: event.target.value }))} className="w-full rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none transition-colors focus:border-primary">
                  <option value="">Selecione a faixa</option>
                  <option value="R$ 30k - R$ 60k">R$ 30k - R$ 60k</option>
                  <option value="R$ 60k - R$ 120k">R$ 60k - R$ 120k</option>
                  <option value="R$ 120k - R$ 200k">R$ 120k - R$ 200k</option>
                  <option value="Acima de R$ 200k">Acima de R$ 200k</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-text-dim">Site *</label>
                <div className="relative">
                  <Globe size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                  <input value={form.site} onChange={(event) => setForm((prev) => ({ ...prev, site: normalizeHttpsMaskedUrlInput(event.target.value) }))} onBlur={(event) => setForm((prev) => ({ ...prev, site: normalizeHttpsMaskedUrlInput(event.target.value) }))} placeholder="https://empresa.com.br" className="w-full rounded-xl border border-border bg-bg-secondary px-10 py-3 text-sm font-semibold text-text-main outline-none transition-colors focus:border-primary" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-text-dim">WhatsApp *</label>
                <div className="relative">
                  <Phone size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                  <input value={form.whatsapp} onChange={(event) => setForm((prev) => ({ ...prev, whatsapp: formatWhatsappInput(event.target.value) }))} maxLength={15} placeholder="(00) 00000-0000" className="w-full rounded-xl border border-border bg-bg-secondary px-10 py-3 text-sm font-semibold text-text-main outline-none transition-colors focus:border-primary" />
                </div>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="mt-7">
              <p className="text-sm text-text-muted">Selecione as dores prioritárias para calibrar seus agentes e relatórios no formato certo.</p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {OBJECTIVES.map((objective) => {
                  const selected = selectedObjectives.includes(objective);
                  return (
                    <button key={objective} type="button" onClick={() => setSelectedObjectives((current) => current.includes(objective) ? current.filter((item) => item !== objective) : [...current, objective])} className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${selected ? 'border-[#08B760] bg-[#ECFDF3] text-[#0A7A42]' : 'border-border bg-bg-secondary text-text-main hover:border-primary'}`}>
                      {objective}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="mt-7">
              <p className="text-sm text-text-muted">Conecte as fontes que já usa. Se quiser, você pode pular esta etapa e configurar no Hub depois.</p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {DATA_SOURCES.map((source) => {
                  const selected = selectedSources.includes(source.key);
                  return (
                    <button key={source.key} type="button" onClick={() => setSelectedSources((current) => current.includes(source.key) ? current.filter((item) => item !== source.key) : [...current, source.key])} className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${selected ? 'border-[#08B760] bg-[#ECFDF3] text-[#0A7A42]' : 'border-border bg-bg-secondary text-text-main hover:border-primary'}`}>
                      {source.label}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs text-text-dim">Seus dados ficam preservados mesmo em reentrada (trial expirado, cancelado ou pendência).</p>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="mt-7">
              <p className="text-sm text-text-muted">Escolha seu plano de ativação. Se preferir, comece agora com trial grátis de 14 dias sem cartão.</p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {plans.map((plan) => {
                  const selected = selectedPlanSlug === plan.slug;
                  return (
                    <button key={plan.slug} type="button" onClick={() => setSelectedPlanSlug(plan.slug)} className={`rounded-xl border px-4 py-4 text-left transition ${selected ? 'border-[#08B760] bg-[#ECFDF3]' : 'border-border bg-bg-secondary hover:border-primary'}`}>
                      <p className="text-lg font-black text-text-main">{plan.name}</p>
                      <p className="mt-1 text-sm font-semibold text-text-muted">{formatCurrencyFromCents(plan.amount)}/mês</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {errorMessage ? <p className="mt-5 rounded-xl border border-[#FFD7BD] bg-[#FFF6EF] px-4 py-3 text-sm text-[#9A3412]">{errorMessage}</p> : null}

          <div className="mt-6 flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => {
                if (step === 1) {
                  router.push('/login');
                  return;
                }
                setErrorMessage(null);
                setStep((current) => (current === 4 ? 3 : current === 3 ? 2 : 1));
              }}
              className="rounded-xl border border-border px-5 py-3 text-xs font-bold uppercase tracking-widest text-text-muted hover:bg-bg-secondary"
            >
              Voltar
            </button>

            {step === 1 ? <button type="button" onClick={handleNextFromBusiness} disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#08B760] to-[#0A9D57] px-5 py-3 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-60">{isSaving ? 'Salvando...' : 'Continuar'}<ArrowRight size={14} /></button> : null}
            {step === 2 ? <button type="button" onClick={handleNextFromObjectives} disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#08B760] to-[#0A9D57] px-5 py-3 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-60">{isSaving ? 'Salvando...' : 'Continuar'}<ArrowRight size={14} /></button> : null}
            {step === 3 ? <button type="button" onClick={handleNextFromSources} disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#08B760] to-[#0A9D57] px-5 py-3 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-60">{isSaving ? 'Salvando...' : 'Ir para plano'}<ArrowRight size={14} /></button> : null}
            {step === 4 ? (
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                <button type="button" onClick={handleStartTrial} disabled={isSaving} className="rounded-xl border border-[#0A9D57] bg-white px-5 py-3 text-xs font-bold uppercase tracking-widest text-[#0A9D57] disabled:opacity-60">{isSaving ? 'Processando...' : 'Iniciar trial grátis (14 dias)'}</button>
                <button type="button" onClick={handleGoToStripeCheckout} disabled={isSaving} className="rounded-xl bg-gradient-to-r from-[#08B760] to-[#0A9D57] px-5 py-3 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-60">{isSaving ? 'Abrindo checkout...' : 'Ativar agora com cartão'}</button>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <main className="relative min-h-screen bg-bg-main">
          <AuthPagesBackdrop />
        </main>
      }
    >
      <OnboardingPageContent />
    </Suspense>
  );
}
