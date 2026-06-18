'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { GoogleLoginButton } from '../../components/auth/GoogleLoginButton';
import { AuthPagesBackdrop } from '../../components/auth/AuthPagesBackdrop';
import { normalizeHubNextPath } from '../../lib/hub-access';

function resolvePlanState(profile: Record<string, unknown> | null): string {
  if (!profile) return 'none';

  const onboarding = profile.onboarding && typeof profile.onboarding === 'object'
    ? (profile.onboarding as Record<string, unknown>)
    : null;

  const read = (value: unknown) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

  return (
    read(profile.subscriptionStatus) ||
    read(profile.stripeSubscriptionStatus) ||
    read(profile.status) ||
    read(onboarding?.subscriptionStatus) ||
    read(onboarding?.stripeSubscriptionStatus) ||
    read(onboarding?.status) ||
    'none'
  );
}

function hasProfileCompleted(profile: Record<string, unknown> | null): boolean {
  if (!profile) return false;
  const onboarding = profile.onboarding && typeof profile.onboarding === 'object'
    ? (profile.onboarding as Record<string, unknown>)
    : null;

  const company = String(profile.companyName ?? onboarding?.companyName ?? '').trim();
  const segment = String(profile.segment ?? onboarding?.segment ?? '').trim();
  const revenue = String(profile.revenueRange ?? onboarding?.revenueRange ?? '').trim();
  const objectives = onboarding?.objectives;

  return Boolean(company && segment && revenue && Array.isArray(objectives) && objectives.length > 0);
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    user,
    profile,
    loading,
    premiumSyncing,
    loginWithGoogle,
  } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const nextPath = useMemo(() => normalizeHubNextPath(searchParams.get('next'), '/hub'), [searchParams]);

  useEffect(() => {
    if (loading || !user || !profile) return;

    const profileRecord = profile as Record<string, unknown>;
    const onboardingDone = hasProfileCompleted(profileRecord);
    const emailVerified = Boolean(user.emailVerified);
    const planState = resolvePlanState(profileRecord);

    if (!emailVerified) {
      setNoticeMessage('Seu e-mail ainda não foi verificado. Confira sua caixa de entrada para concluir o acesso.');
      return;
    }

    if (!onboardingDone) {
      router.replace(`/onboarding?next=${encodeURIComponent(nextPath)}`);
      return;
    }

    if (planState === 'trialing' || planState === 'active') {
      router.replace(nextPath);
      return;
    }

    if (planState === 'trial_expired') {
      router.replace('/onboarding?step=plan&state=trial_expired');
      return;
    }

    if (planState === 'canceled' || planState === 'cancelled') {
      router.replace('/onboarding?step=plan&state=canceled');
      return;
    }

    if (planState === 'past_due') {
      router.replace('/onboarding?step=plan&state=past_due');
      return;
    }

    if (planState === 'suspended') {
      router.replace('/onboarding?step=plan&state=suspended');
      return;
    }

    router.replace('/onboarding?step=plan');
  }, [loading, nextPath, profile, router, user]);

  const handleGoogleLogin = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setAuthErrorMessage(null);
      setNoticeMessage(null);
      await loginWithGoogle();
    } catch (error) {
      console.error('Falha ao autenticar com Google:', error);
      setAuthErrorMessage('Não foi possível concluir o login com Google agora. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };


  if (loading || premiumSyncing) {
    return (
      <main className="relative min-h-screen bg-transparent">
        <AuthPagesBackdrop />
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1180px] items-center justify-center px-5 py-14">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-transparent text-white">
      <AuthPagesBackdrop />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1180px] items-center justify-center px-5 py-14">
        <section className="w-full max-w-[580px] rounded-[28px] border border-slate-800/80 bg-slate-950/60 backdrop-blur-xl p-7 shadow-[0_24px_54px_rgba(0,0,0,0.5)] sm:p-10">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary">NeuroAds · Acesso</p>
          <h1 className="mt-2 text-[34px] font-extrabold leading-tight text-white">
            Entrar no Hub Estratégico
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-slate-400">
            Acompanhe sua operação com dados reais e clareza de impacto no caixa.
          </p>

          {authErrorMessage ? (
            <div className="mt-5 rounded-2xl border border-red-900/30 bg-red-950/20 px-4 py-3">
              <p className="text-[13px] font-semibold text-red-400">{authErrorMessage}</p>
            </div>
          ) : null}

          {noticeMessage ? (
            <div className="mt-5 rounded-2xl border border-emerald-900/30 bg-emerald-950/20 px-4 py-3">
              <p className="text-[13px] font-semibold text-emerald-400">{noticeMessage}</p>
            </div>
          ) : null}

          <GoogleLoginButton
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            label={isSubmitting ? 'Processando...' : 'Entrar com Google'}
            className="mt-7 h-[46px] w-full"
          />

          <div className="mt-5 text-center text-[13px] text-slate-400">
            <Link href="/" className="font-bold text-white hover:text-primary transition-colors">
              Voltar para a página inicial
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="relative min-h-screen bg-transparent">
          <AuthPagesBackdrop />
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
