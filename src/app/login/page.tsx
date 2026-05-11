'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="mt-7 flex w-full items-center justify-center gap-3 rounded-lg border border-[#dadce0] bg-white px-4 py-2.5 text-[15px] font-medium text-[#3c4043] transition hover:bg-[#f8f9fa] hover:shadow-md active:bg-[#f1f3f4] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="text-[13px] font-extrabold uppercase tracking-[0.07em] text-primary">Autenticando...</span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
                <span>Entrar com o Google</span>
              </>
            )}
          </button>

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
