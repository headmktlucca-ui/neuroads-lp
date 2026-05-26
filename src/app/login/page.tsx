'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { GoogleLoginButton } from '../../components/auth/GoogleLoginButton';
import { AuthPagesBackdrop } from '../../components/auth/AuthPagesBackdrop';
import {
  getHubOnboardingRedirect,
  hasActiveHubSubscription,
  hasHubRegistration,
  normalizeHubNextPath,
} from '../../lib/hub-access';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading, premiumSyncing, loginWithGoogle, loginWithEmailPassword, registerWithEmailPassword } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false);
  const [emailAuthMode, setEmailAuthMode] = useState<'login' | 'register'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordConfirmInput, setPasswordConfirmInput] = useState('');
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);

  const nextPath = useMemo(() => normalizeHubNextPath(searchParams.get('next'), '/hub'), [searchParams]);

  useEffect(() => {
    if (loading || !user) return;
    if (premiumSyncing && !profile) return;
    if (!profile) return;

    const resolveAccess = async () => {
      setIsCheckingAccess(true);

      if (!hasHubRegistration(profile)) {
        router.replace(getHubOnboardingRedirect(nextPath));
        setIsCheckingAccess(false);
        return;
      }

      let subscriptionActive = hasActiveHubSubscription(profile);
      let syncInfraFailure = false;

      if (!subscriptionActive) {
        try {
          const token = await user.getIdToken();
          const syncRes = await fetch('/api/stripe/sync-premium', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const syncData = (await syncRes.json()) as { hasAccess?: boolean };
          subscriptionActive = Boolean(syncRes.ok && syncData.hasAccess);
          if (!syncRes.ok && syncRes.status >= 500) {
            syncInfraFailure = true;
          }
        } catch {
          subscriptionActive = false;
          syncInfraFailure = true;
        }
      }

      if (!subscriptionActive) {
        if (syncInfraFailure) {
          setAuthErrorMessage(
            'Não foi possível validar sua assinatura agora. Tente novamente em instantes.'
          );
        } else {
          router.replace(getHubOnboardingRedirect(nextPath));
        }
        setIsCheckingAccess(false);
        return;
      }

      if (hasHubRegistration(profile)) {
        router.replace(nextPath);
      } else {
        router.replace(getHubOnboardingRedirect(nextPath));
      }

      setIsCheckingAccess(false);
    };

    void resolveAccess();
  }, [loading, nextPath, premiumSyncing, profile, router, user]);

  useEffect(() => {
    if (hasActiveHubSubscription(profile)) {
      setAuthErrorMessage(null);
    }
  }, [profile]);

  const handleGoogleLogin = async () => {
    if (isSubmitting || isCheckingAccess) return;
    try {
      setIsSubmitting(true);
      setAuthErrorMessage(null);
      await loginWithGoogle();
    } catch (error) {
      console.error('Falha ao autenticar:', error);
      setAuthErrorMessage('Não foi possível concluir seu login agora. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailAuth = async () => {
    if (isEmailSubmitting || isCheckingAccess) return;
    if (!emailInput.trim() || !passwordInput) {
      setAuthErrorMessage('Informe email e senha para continuar.');
      return;
    }

    if (emailAuthMode === 'register') {
      if (passwordInput.length < 8) {
        setAuthErrorMessage('Defina uma senha com no mínimo 8 caracteres.');
        return;
      }

      if (passwordInput !== passwordConfirmInput) {
        setAuthErrorMessage('A confirmação da senha não confere.');
        return;
      }
    }

    try {
      setIsEmailSubmitting(true);
      setAuthErrorMessage(null);
      if (emailAuthMode === 'register') {
        await registerWithEmailPassword(emailInput.trim(), passwordInput);
      } else {
        await loginWithEmailPassword(emailInput.trim(), passwordInput);
      }
    } catch (error) {
      console.error('Falha na autenticação por email/senha:', error);
      setAuthErrorMessage(
        emailAuthMode === 'register'
          ? 'Não foi possível criar sua conta agora. Se já tiver cadastro, entre com email e senha.'
          : 'Email ou senha inválidos. Se preferir, entre com Google e configure sua senha no onboarding.'
      );
    } finally {
      setIsEmailSubmitting(false);
    }
  };

  if (isCheckingAccess) {
    return (
      <main className="relative min-h-screen bg-bg-main text-text-main">
        <AuthPagesBackdrop />
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1180px] items-center justify-center px-5 py-14">
          <section className="w-full max-w-[560px] rounded-[28px] border border-border bg-white p-7 shadow-[0_24px_54px_rgba(15,23,42,0.08)] sm:p-10">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary">Hub Estratégico</p>
            <h1 className="mt-2 text-[30px] font-extrabold leading-tight text-text-main">Validando sua assinatura</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-text-muted">
              Estamos confirmando seu plano (ativo ou em período gratuito inicial) para liberar o login no Hub.
            </p>
            <div className="mt-6 w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-bg-main text-text-main">
      <AuthPagesBackdrop />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1180px] items-center justify-center px-5 py-14">
        <section className="w-full max-w-[560px] rounded-[28px] border border-border bg-white p-7 shadow-[0_24px_54px_rgba(15,23,42,0.08)] sm:p-10">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary">Hub Estratégico</p>
          <h1 className="mt-2 text-[34px] font-extrabold leading-tight text-text-main">
            Acesse sua operação com dados reais
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-text-muted">
            Entre com sua conta Google para acessar o seu Hub Estratégico e acompanhar performance, agentes e decisões do seu ecossistema.
          </p>
          {premiumSyncing ? (
            <div className="mt-5 rounded-2xl border border-[#FFD7BD] bg-[#FFF6EF] px-4 py-3">
              <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#C2410C]">Configurando seu acesso</p>
              <p className="mt-1 text-[13px] text-[#9A3412]">
                Estamos preparando seu ambiente no Hub Estratégico. Isso pode levar alguns segundos.
              </p>
            </div>
          ) : null}

          {authErrorMessage ? (
            <div className="mt-5 rounded-2xl border border-[#FFD7BD] bg-[#FFF6EF] px-4 py-3">
              <p className="text-[13px] font-semibold text-[#9A3412]">{authErrorMessage}</p>
            </div>
          ) : null}

          <GoogleLoginButton
            onClick={handleGoogleLogin}
            disabled={isSubmitting || isEmailSubmitting}
            label={isSubmitting ? 'Autenticando...' : 'Entrar com o Google'}
            className="mt-7 w-full h-[46px]"
          />

          <div className="mt-5 rounded-2xl border border-border bg-bg-secondary p-4">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-text-dim">
              {emailAuthMode === 'register' ? 'Cadastro com Email Profissional' : 'Entrar com Email e Senha'}
            </p>
            <div className="mt-3 space-y-3">
              <input
                type="email"
                value={emailInput}
                onChange={(event) => setEmailInput(event.target.value)}
                autoComplete="email"
                placeholder="seu@email.com"
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-text-main outline-none transition-colors focus:border-primary"
              />
              <input
                type="password"
                value={passwordInput}
                onChange={(event) => setPasswordInput(event.target.value)}
                autoComplete={emailAuthMode === 'register' ? 'new-password' : 'current-password'}
                placeholder={emailAuthMode === 'register' ? 'Crie uma senha (mín. 8 caracteres)' : 'Sua senha'}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-text-main outline-none transition-colors focus:border-primary"
              />
              {emailAuthMode === 'register' ? (
                <input
                  type="password"
                  value={passwordConfirmInput}
                  onChange={(event) => setPasswordConfirmInput(event.target.value)}
                  autoComplete="new-password"
                  placeholder="Confirme sua senha"
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-text-main outline-none transition-colors focus:border-primary"
                />
              ) : null}
              <button
                type="button"
                onClick={handleEmailAuth}
                disabled={isEmailSubmitting || isSubmitting}
                className="w-full rounded-xl border border-[#0A9D57] bg-white px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#0A9D57] disabled:opacity-60"
              >
                {isEmailSubmitting
                  ? emailAuthMode === 'register'
                    ? 'Criando conta...'
                    : 'Autenticando...'
                  : emailAuthMode === 'register'
                    ? 'Criar conta com Email'
                    : 'Entrar com Email e Senha'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmailAuthMode((current) => (current === 'login' ? 'register' : 'login'));
                  setPasswordInput('');
                  setPasswordConfirmInput('');
                  setAuthErrorMessage(null);
                }}
                className="w-full rounded-xl border border-border bg-bg-main px-4 py-3 text-xs font-bold uppercase tracking-widest text-text-muted hover:text-text-main"
              >
                {emailAuthMode === 'register' ? 'Já tenho conta' : 'Não tenho conta (cadastrar)'}
              </button>
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
