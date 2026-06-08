'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { GoogleLoginButton } from '../../components/auth/GoogleLoginButton';
import { AuthPagesBackdrop } from '../../components/auth/AuthPagesBackdrop';
import { getFirebaseAuth } from '../../lib/firebase';
import { normalizeHubNextPath } from '../../lib/hub-access';

type AuthMode = 'login' | 'register';

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
    loginWithEmailPassword,
    registerWithEmailPassword,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [whatsappInput, setWhatsappInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordConfirmInput, setPasswordConfirmInput] = useState('');
  const [lgpdAccepted, setLgpdAccepted] = useState(false);
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

  const handleEmailAuth = async () => {
    if (isSubmitting) return;

    if (!emailInput.trim() || !passwordInput.trim()) {
      setAuthErrorMessage('Preencha e-mail e senha para continuar.');
      return;
    }

    if (mode === 'register') {
      if (!nameInput.trim()) {
        setAuthErrorMessage('Informe seu nome para criar a conta.');
        return;
      }
      if (!whatsappInput.trim()) {
        setAuthErrorMessage('Informe seu WhatsApp para ativar o suporte do onboarding.');
        return;
      }
      if (!lgpdAccepted) {
        setAuthErrorMessage('Você precisa aceitar os termos de uso e LGPD para continuar.');
        return;
      }
      if (passwordInput.length < 8) {
        setAuthErrorMessage('Defina uma senha com pelo menos 8 caracteres.');
        return;
      }
      if (passwordInput !== passwordConfirmInput) {
        setAuthErrorMessage('A confirmação da senha não confere.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setAuthErrorMessage(null);
      setNoticeMessage(null);

      if (mode === 'register') {
        await registerWithEmailPassword(emailInput.trim(), passwordInput);
      } else {
        await loginWithEmailPassword(emailInput.trim(), passwordInput);
      }
    } catch (error) {
      console.error('Falha na autenticação com e-mail:', error);
      setAuthErrorMessage(
        mode === 'register'
          ? 'Não foi possível criar sua conta agora. Tente novamente em instantes.'
          : 'E-mail ou senha inválidos. Revise os dados e tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (isResettingPassword || !emailInput.trim()) {
      setAuthErrorMessage('Informe seu e-mail para recuperar a senha.');
      return;
    }

    try {
      setIsResettingPassword(true);
      setAuthErrorMessage(null);
      setNoticeMessage(null);
      await sendPasswordResetEmail(getFirebaseAuth(), emailInput.trim());
      setNoticeMessage('Enviamos o link de redefinição para seu e-mail.');
    } catch (error) {
      console.error('Falha ao enviar recuperação de senha:', error);
      setAuthErrorMessage('Não foi possível enviar o link de recuperação agora.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  if (loading || premiumSyncing) {
    return (
      <main className="relative min-h-screen bg-bg-main">
        <AuthPagesBackdrop />
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1180px] items-center justify-center px-5 py-14">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-bg-main text-text-main">
      <AuthPagesBackdrop />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1180px] items-center justify-center px-5 py-14">
        <section className="w-full max-w-[580px] rounded-[28px] border border-border bg-white p-7 shadow-[0_24px_54px_rgba(15,23,42,0.08)] sm:p-10">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary">NeuroAds · Acesso</p>
          <h1 className="mt-2 text-[34px] font-extrabold leading-tight text-text-main">
            {mode === 'login' ? 'Entrar no Hub Estratégico' : 'Criar conta no ecossistema NeuroAds'}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-text-muted">
            {mode === 'login'
              ? 'Acompanhe sua operação com dados reais e clareza de impacto no caixa.'
              : 'Comece sem fricção: crie sua conta e siga para ativação com trial de 14 dias.'}
          </p>

          {authErrorMessage ? (
            <div className="mt-5 rounded-2xl border border-[#FFD7BD] bg-[#FFF6EF] px-4 py-3">
              <p className="text-[13px] font-semibold text-[#9A3412]">{authErrorMessage}</p>
            </div>
          ) : null}

          {noticeMessage ? (
            <div className="mt-5 rounded-2xl border border-[#BFEAD2] bg-[#ECFDF3] px-4 py-3">
              <p className="text-[13px] font-semibold text-[#0A7A42]">{noticeMessage}</p>
            </div>
          ) : null}

          <GoogleLoginButton
            onClick={handleGoogleLogin}
            disabled={isSubmitting || isResettingPassword}
            label={isSubmitting ? 'Processando...' : mode === 'login' ? 'Entrar com Google' : 'Criar conta com Google'}
            className="mt-7 h-[46px] w-full"
          />

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-text-dim">ou com e-mail</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="rounded-2xl border border-border bg-bg-secondary p-4">
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-white p-1">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setAuthErrorMessage(null);
                  setNoticeMessage(null);
                }}
                className={`rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-widest transition ${
                  mode === 'login' ? 'bg-bg-main text-text-main' : 'text-text-muted hover:text-text-main'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setAuthErrorMessage(null);
                  setNoticeMessage(null);
                }}
                className={`rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-widest transition ${
                  mode === 'register' ? 'bg-bg-main text-text-main' : 'text-text-muted hover:text-text-main'
                }`}
              >
                Criar Conta
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {mode === 'register' ? (
                <input
                  type="text"
                  value={nameInput}
                  onChange={(event) => setNameInput(event.target.value)}
                  placeholder="Seu nome"
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-text-main outline-none transition-colors focus:border-primary"
                />
              ) : null}

              <input
                type="email"
                value={emailInput}
                onChange={(event) => setEmailInput(event.target.value)}
                autoComplete="email"
                placeholder="seu@email.com"
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-text-main outline-none transition-colors focus:border-primary"
              />

              {mode === 'register' ? (
                <input
                  type="tel"
                  value={whatsappInput}
                  onChange={(event) => setWhatsappInput(event.target.value)}
                  autoComplete="tel"
                  placeholder="WhatsApp (DDD + número)"
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-text-main outline-none transition-colors focus:border-primary"
                />
              ) : null}

              <input
                type="password"
                value={passwordInput}
                onChange={(event) => setPasswordInput(event.target.value)}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                placeholder={mode === 'register' ? 'Crie uma senha (mín. 8)' : 'Sua senha'}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-text-main outline-none transition-colors focus:border-primary"
              />

              {mode === 'register' ? (
                <>
                  <input
                    type="password"
                    value={passwordConfirmInput}
                    onChange={(event) => setPasswordConfirmInput(event.target.value)}
                    autoComplete="new-password"
                    placeholder="Confirme sua senha"
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-text-main outline-none transition-colors focus:border-primary"
                  />
                  <label className="flex items-start gap-2 rounded-xl border border-border bg-white px-3 py-2 text-[12px] text-text-muted">
                    <input
                      type="checkbox"
                      checked={lgpdAccepted}
                      onChange={(event) => setLgpdAccepted(event.target.checked)}
                      className="mt-[2px]"
                    />
                    Aceito os termos de uso, política de privacidade e tratamento de dados (LGPD).
                  </label>
                </>
              ) : null}

              <button
                type="button"
                onClick={handleEmailAuth}
                disabled={isSubmitting || isResettingPassword}
                className="w-full rounded-xl bg-gradient-to-r from-[#08B760] to-[#0A9D57] px-4 py-3 text-xs font-bold uppercase tracking-widest text-white disabled:opacity-60"
              >
                {isSubmitting
                  ? 'Processando...'
                  : mode === 'login'
                    ? 'Entrar com E-mail'
                    : 'Criar conta e continuar'}
              </button>

              {mode === 'login' ? (
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={isSubmitting || isResettingPassword}
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-xs font-bold uppercase tracking-widest text-text-muted hover:text-text-main disabled:opacity-60"
                >
                  {isResettingPassword ? 'Enviando link...' : 'Esqueci minha senha'}
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-5 text-center text-[13px] text-text-muted">
            <Link href="/" className="font-bold text-text-main hover:text-primary">
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
        <main className="relative min-h-screen bg-bg-main">
          <AuthPagesBackdrop />
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
