'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { ArrowRight, Building2, CheckCircle2, Globe, Phone, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getFirebaseDb } from '../../lib/firebase';
import { getHubLoginRedirect, hasHubPlanAccess, normalizeHubNextPath } from '../../lib/hub-access';
import { getHubProfileSummary } from '../../lib/hub-profile';
import { formatWhatsappInput } from '../../lib/phone-mask';
import { HTTPS_PREFIX, isHttpsPlaceholderOnly, normalizeHttpsMaskedUrlInput } from '../../lib/url-mask';
import { verifyStripeCheckoutSession } from '../../lib/stripe-session-verifier';
import stripeOffersCatalog from '../../data/stripe-offers.json';

type OnboardingStep = 1 | 2;

type PlanOffer = {
  slug: string;
  name: string;
  amount: number;
  priceId: string;
  description: string;
  limits?: {
    agents?: number;
    includedExecutions?: number;
  };
};

type CompanyForm = {
  companyName: string;
  site: string;
  whatsapp: string;
  instagram: string;
  linkedin: string;
};

const DEFAULT_COMPANY_FORM: CompanyForm = {
  companyName: '',
  site: HTTPS_PREFIX,
  whatsapp: '',
  instagram: '',
  linkedin: '',
};
const ONBOARDING_DRAFT_STORAGE_PREFIX = 'neuroads_onboarding_checkout_draft_';

function formatCurrencyFromCents(value: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(value / 100);
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function buildFormFromProfile(profile: unknown): CompanyForm {
  if (!profile || typeof profile !== 'object') return DEFAULT_COMPANY_FORM;
  const record = profile as Record<string, unknown>;
  const onboarding = record.onboarding && typeof record.onboarding === 'object'
    ? (record.onboarding as Record<string, unknown>)
    : null;
  const profileDetails = record.profileDetails && typeof record.profileDetails === 'object'
    ? (record.profileDetails as Record<string, unknown>)
    : null;

  const companyName = readString(
    record.companyName ?? record.company ?? onboarding?.companyName ?? onboarding?.company ?? profileDetails?.companyName
  );
  const siteRaw = readString(record.site ?? record.website ?? onboarding?.site ?? onboarding?.website ?? profileDetails?.site);
  const whatsapp = readString(record.whatsapp ?? onboarding?.whatsapp ?? profileDetails?.whatsapp);
  const instagram = readString(record.instagram ?? onboarding?.instagram ?? profileDetails?.instagram);
  const linkedin = readString(record.linkedin ?? onboarding?.linkedin ?? profileDetails?.linkedin);

  return {
    companyName,
    site: siteRaw ? normalizeHttpsMaskedUrlInput(siteRaw) : HTTPS_PREFIX,
    whatsapp: formatWhatsappInput(whatsapp),
    instagram,
    linkedin,
  };
}

function OnboardingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userEmail, profile, loading, premiumSyncing } = useAuth();
  const [step, setStep] = useState<OnboardingStep>(1);
  const [form, setForm] = useState<CompanyForm>(DEFAULT_COMPANY_FORM);
  const [selectedPlanSlug, setSelectedPlanSlug] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingReturn, setIsProcessingReturn] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currencyCode = String(stripeOffersCatalog.currency || 'brl').toUpperCase();
  const planOffers = useMemo(
    () => ((stripeOffersCatalog.plans || []) as PlanOffer[]).filter((plan) => Boolean(plan.slug)),
    []
  );
  const nextPath = useMemo(() => normalizeHubNextPath(searchParams.get('next'), '/hub'), [searchParams]);

  useEffect(() => {
    if (planOffers.length === 0) return;
    setSelectedPlanSlug((current) => current || planOffers[0].slug);
  }, [planOffers]);

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
    if (!user || !profile) return;
    setForm((current) => {
      const fromProfile = buildFormFromProfile(profile);
      return {
        companyName: current.companyName || fromProfile.companyName,
        site: current.site !== HTTPS_PREFIX ? current.site : fromProfile.site,
        whatsapp: current.whatsapp || fromProfile.whatsapp,
        instagram: current.instagram || fromProfile.instagram,
        linkedin: current.linkedin || fromProfile.linkedin,
      };
    });
  }, [profile, user]);

  const selectedPlan = useMemo(
    () => planOffers.find((plan) => plan.slug === selectedPlanSlug) ?? null,
    [planOffers, selectedPlanSlug]
  );
  const hubProfile = useMemo(() => getHubProfileSummary(profile), [profile]);
  const successParam = searchParams.get('success');
  const canceledParam = searchParams.get('canceled');
  const sessionIdParam = searchParams.get('session_id');

  const persistCompanyStepAndCache = useCallback(async (normalizedSite: string) => {
    if (!user) return;

    const now = Date.now();
    const authenticatedEmail = userEmail?.trim() || user.email?.trim() || null;
    const payload = {
      companyName: form.companyName.trim(),
      site: normalizedSite,
      whatsapp: form.whatsapp.trim(),
      instagram: form.instagram.trim(),
      linkedin: form.linkedin.trim(),
      updatedAt: now,
      ...(authenticatedEmail ? { authEmail: authenticatedEmail, email: authenticatedEmail } : {}),
      onboarding: {
        companyName: form.companyName.trim(),
        site: normalizedSite,
        whatsapp: form.whatsapp.trim(),
        instagram: form.instagram.trim(),
        linkedin: form.linkedin.trim(),
        updatedAt: now,
      },
    };

    const db = getFirebaseDb();
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, payload, { merge: true });

    if (typeof window !== 'undefined') {
      const companyKey = `neuroads_company_profile_${user.uid}`;
      const contactKey = `neuroads_profile_contact_${user.uid}`;
      window.localStorage.setItem(
        companyKey,
        JSON.stringify({
          companyName: form.companyName.trim(),
          site: normalizedSite,
          instagram: form.instagram.trim(),
          linkedin: form.linkedin.trim(),
          tiktok: '',
          blog: '',
        })
      );
      window.localStorage.setItem(contactKey, JSON.stringify({ whatsapp: form.whatsapp.trim() }));
    }
  }, [
    form.companyName,
    form.instagram,
    form.linkedin,
    form.whatsapp,
    userEmail,
    user,
  ]);

  const handleContinueToPlans = async () => {
    const hasCompany = form.companyName.trim().length > 0;
    const normalizedSite = normalizeHttpsMaskedUrlInput(form.site);
    const hasSite = !isHttpsPlaceholderOnly(normalizedSite);
    const hasWhatsapp = form.whatsapp.trim().length > 0;

    if (!hasCompany || !hasSite || !hasWhatsapp) {
      setErrorMessage('Preencha empresa, site e WhatsApp para continuar.');
      return;
    }

    setErrorMessage(null);
    setForm((current) => ({ ...current, site: normalizedSite }));

    try {
      await persistCompanyStepAndCache(normalizedSite);
    } catch (error) {
      console.error('Falha ao salvar dados da etapa 1:', error);
      setErrorMessage('Não foi possível salvar seus dados agora. Tente novamente.');
      return;
    }

    if (hubProfile.isSubscriptionActive) {
      router.replace(nextPath);
      return;
    }

    setStep(2);
  };

  const persistOnboardingAndGoHub = useCallback(async ({
    plan,
    formData,
    normalizedSite,
    customerId,
    subscriptionId,
    subscriptionStatus,
    trialEndsAt,
  }: {
    plan: PlanOffer;
    formData: CompanyForm;
    normalizedSite: string;
    customerId?: string | null;
    subscriptionId?: string | null;
    subscriptionStatus?: string | null;
    trialEndsAt?: number | null;
  }) => {
    if (!user) return;

    const now = Date.now();
    const authenticatedEmail = userEmail?.trim() || user.email?.trim() || null;
    const payload = {
      companyName: formData.companyName.trim(),
      site: normalizedSite,
      whatsapp: formData.whatsapp.trim(),
      instagram: formData.instagram.trim(),
      linkedin: formData.linkedin.trim(),
      selectedPlan: plan.name,
      selectedPlanSlug: plan.slug,
      planName: plan.name,
      planSlug: plan.slug,
      planAmountCents: plan.amount,
      planCurrency: currencyCode,
      isPremium: true,
      stripeCustomerId: customerId ?? null,
      stripeSubscriptionId: subscriptionId ?? null,
      subscriptionStatus: subscriptionStatus ?? 'active',
      ...(trialEndsAt && Number.isFinite(trialEndsAt) ? { trialEndsAt } : {}),
      onboardingCompletedAt: now,
      updatedAt: now,
      ...(authenticatedEmail ? { authEmail: authenticatedEmail, email: authenticatedEmail } : {}),
      onboarding: {
        companyName: formData.companyName.trim(),
        site: normalizedSite,
        whatsapp: formData.whatsapp.trim(),
        instagram: formData.instagram.trim(),
        linkedin: formData.linkedin.trim(),
        planName: plan.name,
        planSlug: plan.slug,
        planAmountCents: plan.amount,
        planCurrency: currencyCode,
        subscriptionStatus: subscriptionStatus ?? 'active',
        ...(trialEndsAt && Number.isFinite(trialEndsAt) ? { trialEndsAt } : {}),
        completedAt: now,
      },
    };

    const db = getFirebaseDb();
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, payload, { merge: true });

    if (typeof window !== 'undefined') {
      const companyKey = `neuroads_company_profile_${user.uid}`;
      const contactKey = `neuroads_profile_contact_${user.uid}`;
      window.localStorage.setItem(
        companyKey,
        JSON.stringify({
          companyName: formData.companyName.trim(),
          site: normalizedSite,
          instagram: formData.instagram.trim(),
          linkedin: formData.linkedin.trim(),
          tiktok: '',
          blog: '',
        })
      );
      window.localStorage.setItem(contactKey, JSON.stringify({ whatsapp: formData.whatsapp.trim() }));
      window.localStorage.removeItem(`${ONBOARDING_DRAFT_STORAGE_PREFIX}${user.uid}`);
    }

    router.replace(nextPath);
  }, [
    currencyCode,
    nextPath,
    router,
    userEmail,
    user,
  ]);

  const handleStartCheckout = async () => {
    if (!user || !selectedPlan || isSaving) return;
    if (!selectedPlan.priceId) {
      setErrorMessage('Plano sem configuração de cobrança no Stripe.');
      return;
    }

    const normalizedSite = normalizeHttpsMaskedUrlInput(form.site);
    const draftPayload = {
      companyName: form.companyName.trim(),
      site: normalizedSite,
      whatsapp: form.whatsapp.trim(),
      instagram: form.instagram.trim(),
      linkedin: form.linkedin.trim(),
      selectedPlanSlug: selectedPlan.slug,
    };

    try {
      setIsSaving(true);
      setErrorMessage(null);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(`${ONBOARDING_DRAFT_STORAGE_PREFIX}${user.uid}`, JSON.stringify(draftPayload));
      }

      const returnUrl =
        typeof window !== 'undefined' ? `${window.location.origin}/onboarding` : '/onboarding';

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
        throw new Error(data.error || 'Falha ao abrir checkout do Stripe.');
      }

      window.location.href = data.url as string;
    } catch (error) {
      console.error('Falha ao salvar onboarding:', error);
      setErrorMessage('Não foi possível iniciar o checkout agora. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const handleCheckoutReturn = async () => {
      if (!user || successParam !== 'true' || !sessionIdParam || isProcessingReturn) return;

      try {
        setIsProcessingReturn(true);
        setErrorMessage(null);
        const verifyResult = await verifyStripeCheckoutSession(sessionIdParam);
        if (!verifyResult.ok || !verifyResult.data) {
          throw new Error(verifyResult.error || 'Falha ao validar checkout no Stripe.');
        }
        const verifyData = verifyResult.data;

        const isCompletedSubscription =
          verifyData.mode === 'subscription' &&
          verifyData.status === 'complete' &&
          verifyData.kind === 'plano';
        const isCurrentUserSession = verifyData.clientReferenceId === user.uid;

        if (!isCompletedSubscription || !isCurrentUserSession) {
          throw new Error('A sessão Stripe retornou inválida para este usuário.');
        }

        const draftRaw =
          typeof window !== 'undefined'
            ? window.localStorage.getItem(`${ONBOARDING_DRAFT_STORAGE_PREFIX}${user.uid}`)
            : null;
        const draft = draftRaw ? (JSON.parse(draftRaw) as Partial<CompanyForm> & { selectedPlanSlug?: string }) : null;

        const mergedForm: CompanyForm = {
          companyName: draft?.companyName?.trim() || form.companyName.trim(),
          site: draft?.site?.trim() || form.site,
          whatsapp: formatWhatsappInput(draft?.whatsapp?.trim() || form.whatsapp.trim()),
          instagram: draft?.instagram?.trim() || form.instagram.trim(),
          linkedin: draft?.linkedin?.trim() || form.linkedin.trim(),
        };

        const planFromDraft = planOffers.find((item) => item.slug === draft?.selectedPlanSlug);
        const effectivePlan = planFromDraft ?? selectedPlan ?? planOffers[0];
        if (!effectivePlan) {
          throw new Error('Plano não encontrado para finalizar o onboarding.');
        }

        setForm(mergedForm);
        await persistOnboardingAndGoHub({
          plan: effectivePlan,
          formData: mergedForm,
          normalizedSite: normalizeHttpsMaskedUrlInput(mergedForm.site),
          customerId: verifyData.customerId,
          subscriptionId: verifyData.subscriptionId,
          subscriptionStatus: typeof verifyData.subscriptionStatus === 'string' ? verifyData.subscriptionStatus : null,
          trialEndsAt:
            typeof verifyData.trialEndsAt === 'number' && Number.isFinite(verifyData.trialEndsAt)
              ? verifyData.trialEndsAt
              : null,
        });
      } catch (error) {
        console.error('Falha ao processar retorno do checkout no onboarding:', error);
        setStep(2);
        setErrorMessage('Pagamento não confirmado. Revise o plano e tente novamente.');
      } finally {
        setIsProcessingReturn(false);
      }
    };

    void handleCheckoutReturn();
  }, [
    form.companyName,
    form.instagram,
    form.linkedin,
    form.site,
    form.whatsapp,
    isProcessingReturn,
    planOffers,
    selectedPlan,
    sessionIdParam,
    successParam,
    user,
    persistOnboardingAndGoHub,
  ]);

  useEffect(() => {
    if (canceledParam !== 'true') return;
    setStep(2);
    setErrorMessage('Checkout cancelado. Se desejar, selecione o plano e tente novamente.');
  }, [canceledParam]);

  if (loading || (user && premiumSyncing)) {
    return (
      <main className="min-h-screen bg-bg-main flex items-center justify-center px-5">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (isProcessingReturn) {
    return (
      <main className="min-h-screen bg-bg-main flex items-center justify-center px-5">
        <div className="max-w-md rounded-2xl border border-[#FFD7BD] bg-[#FFF6EF] px-6 py-5 text-center">
          <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#C2410C]">Validando pagamento</p>
          <p className="mt-2 text-sm text-[#9A3412]">
            Estamos confirmando sua contratação no Stripe para liberar seu Hub.
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-bg-main flex items-center justify-center px-5">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-main text-text-main">
      <div className="mx-auto w-full max-w-[1160px] px-5 py-10 sm:py-14">
        <section className="mx-auto w-full max-w-[860px] rounded-[30px] border border-border bg-white p-6 shadow-[0_24px_54px_rgba(15,23,42,0.08)] sm:p-9">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary">Onboarding do Hub</p>
              <h1 className="mt-2 text-[30px] font-extrabold leading-tight text-text-main">
                Configure seu acesso em 2 etapas
              </h1>
              <p className="mt-2 text-sm text-text-muted">
                Primeiro registramos os dados da sua empresa. Depois você seleciona o plano contratado.
              </p>
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.08em] text-[#9A3412]">
                Campos obrigatórios: Empresa, Site e WhatsApp.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-bg-secondary px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-text-dim">
              <CheckCircle2 size={14} className={step === 2 ? 'text-[#0A9D57]' : 'text-text-dim'} />
              Etapa {step} de 2
            </div>
          </div>

          {step === 1 ? (
            <div className="mt-8 space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-text-dim">Empresa *</label>
                  <div className="relative">
                    <Building2 size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                    <input
                      value={form.companyName}
                      onChange={(event) => setForm((prev) => ({ ...prev, companyName: event.target.value }))}
                      placeholder="Nome da empresa"
                      required
                      className="w-full rounded-xl border border-border bg-bg-secondary px-10 py-3 text-sm font-semibold text-text-main outline-none transition-colors focus:border-primary"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-text-dim">Site *</label>
                  <div className="relative">
                    <Globe size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                    <input
                      value={form.site}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, site: normalizeHttpsMaskedUrlInput(event.target.value) }))
                      }
                      onBlur={(event) =>
                        setForm((prev) => ({ ...prev, site: normalizeHttpsMaskedUrlInput(event.target.value) }))
                      }
                      placeholder="https://empresa.com.br"
                      required
                      className="w-full rounded-xl border border-border bg-bg-secondary px-10 py-3 text-sm font-semibold text-text-main outline-none transition-colors focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-text-dim">WhatsApp *</label>
                  <div className="relative">
                    <Phone size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
                    <input
                      value={form.whatsapp}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, whatsapp: formatWhatsappInput(event.target.value) }))
                      }
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={15}
                      placeholder="(00) 00000-0000"
                      required
                      className="w-full rounded-xl border border-border bg-bg-secondary px-10 py-3 text-sm font-semibold text-text-main outline-none transition-colors focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-text-dim">Instagram</label>
                  <input
                    value={form.instagram}
                    onChange={(event) => setForm((prev) => ({ ...prev, instagram: event.target.value }))}
                    placeholder="@empresa"
                    className="w-full rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none transition-colors focus:border-primary"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-text-dim">LinkedIn</label>
                  <input
                    value={form.linkedin}
                    onChange={(event) => setForm((prev) => ({ ...prev, linkedin: event.target.value }))}
                    placeholder="linkedin.com/company/empresa"
                    className="w-full rounded-xl border border-border bg-bg-secondary px-4 py-3 text-sm font-semibold text-text-main outline-none transition-colors focus:border-primary"
                  />
                </div>
              </div>

              {errorMessage ? (
                <p className="rounded-xl border border-[#FFD7BD] bg-[#FFF6EF] px-4 py-3 text-sm text-[#9A3412]">
                  {errorMessage}
                </p>
              ) : null}

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleContinueToPlans}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#08B760] to-[#0A9D57] px-5 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-[0_8px_18px_rgba(8,183,96,0.25)]"
                >
                  Continuar
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {planOffers.map((plan) => {
                  const isSelected = plan.slug === selectedPlanSlug;
                  return (
                    <button
                      type="button"
                      key={plan.slug}
                      onClick={() => setSelectedPlanSlug(plan.slug)}
                      className={`rounded-2xl border p-5 text-left transition-all ${
                        isSelected
                          ? 'border-[#0A9D57] bg-[#F2FFF7] shadow-[0_12px_24px_rgba(10,157,87,0.16)]'
                          : 'border-border bg-bg-secondary hover:border-[#B7C1D0]'
                      }`}
                    >
                      <p className="text-sm font-black text-text-main">{plan.name}</p>
                      <p className="mt-2 text-2xl font-black text-text-main">
                        {formatCurrencyFromCents(plan.amount, currencyCode)}
                        <span className="ml-1 text-xs font-bold uppercase tracking-wider text-text-dim">/mês</span>
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-text-muted">{plan.description}</p>
                      {plan.limits?.agents ? (
                        <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#0A9D57]">
                          {plan.limits.agents} agentes inclusos
                        </p>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {selectedPlan ? (
                <div className="rounded-2xl border border-[#DCE8FF] bg-[#F5F9FF] p-4 text-sm text-[#1D4ED8]">
                  <div className="flex items-center gap-2 font-bold">
                    <Sparkles size={14} />
                    Plano selecionado: {selectedPlan.name}
                  </div>
                  <p className="mt-1">
                    Valor: {formatCurrencyFromCents(selectedPlan.amount, currencyCode)} por mês
                  </p>
                </div>
              ) : null}

              {errorMessage ? (
                <p className="rounded-xl border border-[#FFD7BD] bg-[#FFF6EF] px-4 py-3 text-sm text-[#9A3412]">
                  {errorMessage}
                </p>
              ) : null}

              <div className="flex flex-col-reverse items-stretch justify-between gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setStep(1);
                  }}
                  className="rounded-xl border border-border px-5 py-3 text-xs font-bold uppercase tracking-widest text-text-muted hover:bg-bg-secondary"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={handleStartCheckout}
                  disabled={isSaving || !selectedPlan}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#08B760] to-[#0A9D57] px-5 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-[0_8px_18px_rgba(8,183,96,0.25)] disabled:opacity-60"
                >
                  {isSaving ? 'Redirecionando...' : 'Contratar plano no Stripe'}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-bg-main" />}>
      <OnboardingPageContent />
    </Suspense>
  );
}
