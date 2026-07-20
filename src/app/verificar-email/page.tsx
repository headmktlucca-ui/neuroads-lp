'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { AuthLeftPanel } from '../../components/auth/AuthLeftPanel';
import { getFirebaseAuth } from '../../lib/firebase';
import { sendEmailVerification, reload } from 'firebase/auth';
import { Mail, RotateCw, CheckCircle2, ArrowLeft } from 'lucide-react';

const CODE_LENGTH = 6;

function VerificarEmailContent() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Redirect if already verified
  useEffect(() => {
    if (!loading && user?.emailVerified) {
      router.replace('/hub');
    }
  }, [loading, user, router]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);



  // For now: Firebase uses email link (not OTP), so "verify" checks if the user
  // clicked the link sent to their inbox. The OTP UI is future-ready for a
  // custom backend OTP endpoint at /api/auth/verify-otp.
  const handleVerify = async () => {
    if (code.length < CODE_LENGTH) {
      setError('Digite todos os 6 dígitos do código.');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      // Call custom OTP verification endpoint when backend is ready
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user?.uid, code }),
      });

      if (res.ok) {
        // Reload user to pick up emailVerified = true
        const auth = getFirebaseAuth();
        if (auth.currentUser) await reload(auth.currentUser);
        setSuccess(true);
        setTimeout(() => router.replace('/hub'), 1500);
      } else {
        const data = await res.json().catch(() => ({}));
        setError((data as { message?: string }).message || 'Código inválido ou expirado. Tente novamente.');
      }
    } catch {
      // Fallback: check if user verified via email link
      const auth = getFirebaseAuth();
      if (auth.currentUser) {
        await reload(auth.currentUser);
        if (auth.currentUser.emailVerified) {
          setSuccess(true);
          setTimeout(() => router.replace('/hub'), 1500);
          return;
        }
      }
      setError('Código inválido. Verifique e tente novamente, ou clique no link enviado ao seu e-mail.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (isResending || resendCooldown > 0) return;
    setIsResending(true);
    setError(null);
    try {
      const auth = getFirebaseAuth();
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setResendCooldown(60);
      }
    } catch {
      setError('Não foi possível reenviar o código. Aguarde um momento.');
    } finally {
      setIsResending(false);
    }
  };

  const maskedEmail = user?.email
    ? user.email.replace(/(.{2}).+(@.+)/, '$1•••$2')
    : 'seu e-mail';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EDF1F5] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6A00] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="h-screen max-h-screen flex bg-transparent relative overflow-hidden">
      {/* Left Panel */}
      <div className="hidden lg:block lg:flex-1 lg:min-w-0 h-full">
        <AuthLeftPanel />
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-transparent p-4 sm:p-6 lg:p-8 relative z-10 h-full overflow-y-auto">
        <div className="w-full max-w-[540px] p-6 sm:p-8 rounded-2xl border border-slate-300 bg-white shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff]">

          {/* Mobile brand */}
          <div className="lg:hidden mb-6 text-center">
            <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#FF6A00]">
              NeuroAds · Verificação
            </span>
          </div>

          {success ? (
            <div className="text-center py-6 animate-in fade-in zoom-in-95 duration-400">
              <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-[22px] font-black text-slate-900 mb-2">E-mail confirmado!</h2>
              <p className="text-[14px] text-slate-500 font-medium">Redirecionando para o Hub...</p>
            </div>
          ) : (
            <>
              {/* Terminal visual */}
              <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-900 p-4 font-mono text-[12px] shadow-sm">
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">VERIFY_EMAIL.SH</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <p><span className="text-slate-500">1</span> <span className="text-slate-300">$ init auth_handshake --client=neuroads</span></p>
                  <p><span className="text-slate-500">2</span> <span className="text-emerald-400">[ OK ] Handshake initialized.</span></p>
                  <p><span className="text-slate-500">3</span> <span className="text-slate-300">$ verify key_delivery --target=<span className="text-[#FF6A00] font-semibold">{maskedEmail}</span></span></p>
                  <p><span className="text-slate-500">4</span> <span className="text-emerald-400">[ OK ] Código enviado com sucesso.</span></p>
                  <p className="animate-pulse"><span className="text-slate-500">5</span> <span className="text-slate-300">$ challenge response --input=<span className="text-slate-500">______</span></span></p>
                </div>
              </div>

              <div className="mb-6">
                <h1 className="text-[26px] font-black text-slate-900 leading-tight mb-1.5">Confirmar e-mail</h1>
                <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
                  Digite o código de 6 dígitos enviado para{' '}
                  <span className="text-slate-900 font-bold">{maskedEmail}</span>.
                </p>
              </div>

              {/* OTP Input */}
              <div className="mb-5">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={CODE_LENGTH}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, CODE_LENGTH))}
                  placeholder="000000"
                  className={`w-full h-14 rounded-xl border text-center text-[22px] font-black tracking-[0.5em] text-slate-900 transition-all focus:outline-none
                    ${code.length === CODE_LENGTH ? 'border-[#FF6A00] bg-[#FF6A00]/05 shadow-[0_0_12px_rgba(255,106,0,0.15)]' : 'border-slate-300 bg-slate-50 focus:border-[#FF6A00]/50 focus:ring-1 focus:ring-[#FF6A00]/30'}`}
                />
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                  <p className="text-[13px] font-semibold text-red-500">{error}</p>
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={isVerifying || code.length < CODE_LENGTH}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#F24900] to-[#FF8805] hover:from-[#d93f00] hover:to-[#e07500] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-[15px] transition-all shadow-[0_0_24px_rgba(255,106,0,0.3)] hover:shadow-[0_0_32px_rgba(255,106,0,0.45)] flex items-center justify-center gap-2 mb-5"
              >
                {isVerifying
                  ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  : <>Confirmar e-mail →</>
                }
              </button>

              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>Não recebeu?</span>
                  <button
                    onClick={handleResend}
                    disabled={isResending || resendCooldown > 0}
                    className="font-bold text-[#FF6A00] hover:text-[#FF8000] disabled:text-slate-400 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    {isResending && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
                    {resendCooldown > 0 ? `Reenviar em ${resendCooldown}s` : 'Reenviar OTP'}
                  </button>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="text-center text-[11px] text-slate-400">
                  2FA Security <span className="text-emerald-600 font-bold">habilitado</span>
                  <span className="mx-3 text-slate-300">·</span>
                  Verificação instantânea &lt; 100ms
                </p>
              </div>

              <div className="mt-6 text-center">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-[13px] text-slate-400 hover:text-slate-700 font-semibold transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#000000]" />}>
      <VerificarEmailContent />
    </Suspense>
  );
}
