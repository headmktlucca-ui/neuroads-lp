'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GoogleLoginButton } from '../../components/auth/GoogleLoginButton';

function normalizeNextPath(path: string | null): string {
  if (!path || !path.startsWith('/')) return '/hub';
  if (path.startsWith('//')) return '/hub';
  return path;
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, premiumSyncing, loginWithGoogle } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextPath = useMemo(() => normalizeNextPath(searchParams.get('next')), [searchParams]);

  useEffect(() => {
    if (!loading && user) {
      router.replace(nextPath);
    }
  }, [loading, nextPath, router, user]);

  const handleGoogleLogin = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      await loginWithGoogle();
      router.replace(nextPath);
    } catch (error) {
      console.error('Falha ao autenticar:', error);
      window.alert('Não foi possível concluir seu login agora. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
