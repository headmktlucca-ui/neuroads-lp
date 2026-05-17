'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { GoogleLoginButton } from '../../components/auth/GoogleLoginButton';
import {
  getHubOnboardingRedirect,
  hasActiveHubSubscription,
  hasHubRegistration,
  normalizeHubNextPath,
} from '../../lib/hub-access';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading, premiumSyncing, loginWithGoogle, logout } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  const accessCheckRef = useRef<string | null>(null);

  const nextPath = useMemo(() => normalizeHubNextPath(searchParams.get('next'), '/hub'), [searchParams]);

  useEffect(() => {
    if (loading || !user) return;
    if (premiumSyncing && !profile) return;
    if (accessCheckRef.current === user.uid) return;

    accessCheckRef.current = user.uid;

    const resolveAccess = async () => {
      setIsCheckingAccess(true);

      let subscriptionActive = hasActiveHubSubscription(profile);

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
        } catch {
          subscriptionActive = false;
        }
      }

      if (!subscriptionActive) {
        await logout();
        setAuthErrorMessage(
          'Acesso ao login liberado somente para contas com plano ativo. Contrate um plano para continuar.'
        );
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
  }, [loading, logout, nextPath, premiumSyncing, profile, router, user]);

  useEffect(() => {
    if (user) return;
    accessCheckRef.current = null;
  }, [user]);

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

  if (isCheckingAccess) {
    return (
      <main className="min-h-screen bg-bg-main text-text-main">
        <div className="mx-auto flex min-h-screen w-full max-w-[1180px] items-center justify-center px-5 py-14">
          <section className="w-full max-w-[560px] rounded-[28px] border border-border bg-white p-7 shadow-[0_24px_54px_rgba(15,23,42,0.08)] sm:p-10">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary">Hub Estratégico</p>
            <h1 className="mt-2 text-[30px] font-extrabold leading-tight text-text-main">Validando sua assinatura</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-text-muted">
              Estamos confirmando seu plano ativo para liberar o login no Hub.
            </p>
            <div className="mt-6 w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-main text-text-main">
      <div className="mx-auto flex min-h-screen w-full max-w-[1180px] items-center justify-center px-5 py-14">
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
            disabled={isSubmitting}
            label={isSubmitting ? 'Autenticando...' : 'Entrar com o Google'}
            className="mt-7 w-full h-[46px]"
          />

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
    <Suspense fallback={<main className="min-h-screen bg-bg-main" />}>
      <LoginPageContent />
    </Suspense>
  );
}
