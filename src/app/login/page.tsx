'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { AuthLeftPanel } from '../../components/auth/AuthLeftPanel';
import { normalizeHubNextPath } from '../../lib/hub-access';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

function resolvePlanState(profile: Record<string, unknown> | null): string {
  if (!profile) return 'none';
  const onboarding = profile.onboarding && typeof profile.onboarding === 'object'
    ? (profile.onboarding as Record<string, unknown>) : null;
  const read = (value: unknown) => (typeof value === 'string' ? value.trim().toLowerCase() : '');
  return (
    read(profile.subscriptionStatus) || read(profile.stripeSubscriptionStatus) ||
    read(profile.status) || read(onboarding?.subscriptionStatus) ||
    read(onboarding?.stripeSubscriptionStatus) || read(onboarding?.status) || 'none'
  );
}

function hasProfileCompleted(profile: Record<string, unknown> | null): boolean {
  if (!profile) return false;
  const onboarding = profile.onboarding && typeof profile.onboarding === 'object'
    ? (profile.onboarding as Record<string, unknown>) : null;
  const company = String(profile.companyName ?? onboarding?.companyName ?? '').trim();
  const segment = String(profile.segment ?? onboarding?.segment ?? '').trim();
  const revenue = String(profile.revenueRange ?? onboarding?.revenueRange ?? '').trim();
  const objectives = onboarding?.objectives;
  return Boolean(company && segment && revenue && Array.isArray(objectives) && objectives.length > 0);
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, loading, premiumSyncing, loginWithGoogle, loginWithEmailPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const nextPath = useMemo(() => normalizeHubNextPath(searchParams.get('next'), '/hub'), [searchParams]);

  useEffect(() => {
    if (loading || !user || !profile) return;
    const profileRecord = profile as Record<string, unknown>;
    const onboardingDone = hasProfileCompleted(profileRecord);
    const emailVerified = Boolean(user.emailVerified);
    const planState = resolvePlanState(profileRecord);

    if (!emailVerified) {
      setNoticeMessage('Seu e-mail ainda não foi verificado. Confira sua caixa de entrada.');
      return;
    }
    if (!onboardingDone) { router.replace(`/onboarding?next=${encodeURIComponent(nextPath)}`); return; }
    if (planState === 'trialing' || planState === 'active') { router.replace(nextPath); return; }
    if (planState === 'trial_expired') { router.replace('/onboarding?step=plan&state=trial_expired'); return; }
    if (planState === 'canceled' || planState === 'cancelled') { router.replace('/onboarding?step=plan&state=canceled'); return; }
    if (planState === 'past_due') { router.replace('/onboarding?step=plan&state=past_due'); return; }
    if (planState === 'suspended') { router.replace('/onboarding?step=plan&state=suspended'); return; }
    router.replace('/onboarding?step=plan');
  }, [loading, nextPath, profile, router, user]);

  const handleGoogleLogin = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      setAuthError(null);
      setNoticeMessage(null);
      await loginWithGoogle();
    } catch {
      setAuthError('Não foi possível entrar com Google. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !email || !password) return;
    try {
      setIsSubmitting(true);
      setAuthError(null);
      setNoticeMessage(null);
      await loginWithEmailPassword(email, password);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setAuthError('E-mail ou senha incorretos. Verifique os dados e tente novamente.');
      } else if (code === 'auth/too-many-requests') {
        setAuthError('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
      } else {
        setAuthError('Erro ao entrar. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || premiumSyncing) {
    return (
      <div className="min-h-screen bg-[#040d18] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6A00] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#040d18]">
      {/* Left Panel */}
      <div className="hidden lg:block flex-1 min-w-0">
        <AuthLeftPanel />
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-[#040d18] p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[540px] p-6 sm:p-8 rounded-2xl border border-white/[0.08] bg-[#071424] shadow-[0_12px_40px_rgba(0,0,0,0.6)]">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#FF6A00]">NeuroAds · Acesso</span>
          </div>

          <div className="mb-8">
            <h1 className="text-[28px] font-black text-white leading-tight">Bem-vindo de volta</h1>
            <p className="mt-1.5 text-[14px] text-white/45 font-medium">
              Entre na sua conta para acessar o Hub Estratégico.
            </p>
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] transition-all text-[14px] font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Continuar com Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/25">ou e-mail</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {/* Error / Notice */}
          {authError && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="text-[13px] font-semibold text-red-400">{authError}</p>
            </div>
          )}
          {noticeMessage && (
            <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
              <p className="text-[13px] font-semibold text-amber-400">{noticeMessage}</p>
            </div>
          )}

          {/* Email form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-white/40 mb-1.5">
                Endereço de E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 z-10" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@empresa.com"
                  required
                  className="w-full h-11 rounded-xl border border-white/[0.10] bg-white/[0.04] pl-10 pr-4 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF6A00]/50 focus:ring-1 focus:ring-[#FF6A00]/30 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-white/40">Senha</label>
                <Link href="/recuperar-senha" className="text-[12px] font-bold text-[#FF6A00] hover:text-[#FF8000] transition-colors">
                  Esqueceu?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 z-10" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full h-11 rounded-xl border border-white/[0.10] bg-white/[0.04] pl-10 pr-11 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF6A00]/50 focus:ring-1 focus:ring-[#FF6A00]/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email || !password}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-[#F24900] to-[#FF8805] hover:from-[#d93f00] hover:to-[#e07500] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-[15px] transition-all shadow-[0_0_24px_rgba(255,106,0,0.3)] hover:shadow-[0_0_32px_rgba(255,106,0,0.45)] flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>Entrar →</>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-white/35">
            Não tem uma conta?{' '}
            <Link href="/cadastro" className="font-bold text-[#FF6A00] hover:text-[#FF8000] transition-colors">
              Criar conta
            </Link>
          </p>

          <p className="mt-4 text-center text-[11px] text-white/20 leading-relaxed">
            Ao entrar, você concorda com nossos{' '}
            <a href="#" className="underline hover:text-white/40 transition-colors">Termos</a>{' '}
            e{' '}
            <a href="#" className="underline hover:text-white/40 transition-colors">Política de Privacidade</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#040d18]" />}>
      <LoginPageContent />
    </Suspense>
  );
}
