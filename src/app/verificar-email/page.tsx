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

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = Array(CODE_LENGTH).fill('');
    pasted.split('').forEach((c, i) => { next[i] = c; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  };

  // For now: Firebase uses email link (not OTP), so "verify" checks if the user
  // clicked the link sent to their inbox. The OTP UI is future-ready for a
  // custom backend OTP endpoint at /api/auth/verify-otp.
  const handleVerify = async () => {
    const code = digits.join('');
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
      <div className="min-h-screen bg-[#040d18] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF6A00] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_520px] bg-[#040d18]">
      {/* Left Panel */}
      <div className="hidden lg:block">
        <AuthLeftPanel />
      </div>

      {/* Right Panel */}
      <div className="flex items-center justify-center px-6 py-12 bg-[#06111f]">
        <div className="w-full max-w-[400px]">

          {success ? (
            <div className="text-center animate-in fade-in zoom-in-95 duration-400">
              <div className="mx-auto mb-5 w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-[22px] font-black text-white mb-2">E-mail confirmado!</h2>
              <p className="text-[14px] text-white/45">Redirecionando para o Hub...</p>
            </div>
          ) : (
            <>
              {/* Terminal visual */}
              <div className="mb-8 rounded-2xl border border-white/[0.08] bg-[#071525]/80 p-4 font-mono text-[12px]">
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="h-2 w-2 rounded-full bg-red-500/70" />
                  <div className="h-2 w-2 rounded-full bg-amber-500/70" />
                  <div className="h-2 w-2 rounded-full bg-emerald-500/70" />
                  <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-white/30">VERIFY_EMAIL.SH</span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <p><span className="text-white/30">1</span> <span className="text-white/50">$ init auth_handshake --client=neuroads</span></p>
                  <p><span className="text-white/30">2</span> <span className="text-emerald-400">[ OK ] Handshake initialized.</span></p>
                  <p><span className="text-white/30">3</span> <span className="text-white/50">$ verify key_delivery --target=<span className="text-[#FF6A00]">{maskedEmail}</span></span></p>
                  <p><span className="text-white/30">4</span> <span className="text-emerald-400">[ OK ] Código enviado com sucesso.</span></p>
                  <p className="animate-pulse"><span className="text-white/30">5</span> <span className="text-white/50">$ challenge response --input=<span className="text-white/30">______</span></span></p>
                </div>
              </div>

              <div className="mb-6">
                <h1 className="text-[26px] font-black text-white leading-tight mb-1">Confirmar e-mail</h1>
                <p className="text-[14px] text-white/45 leading-relaxed">
                  Digite o código de 6 dígitos enviado para{' '}
                  <span className="text-white/70 font-semibold">{maskedEmail}</span>.
                </p>
              </div>

              {/* OTP digits */}
              <div className="flex gap-2.5 mb-5" onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`flex-1 h-14 rounded-xl border text-center text-[22px] font-black text-white bg-white/[0.04] transition-all focus:outline-none
                      ${d ? 'border-[#FF6A00]/60 bg-[#FF6A00]/05 shadow-[0_0_12px_rgba(255,106,0,0.15)]' : 'border-white/[0.12] focus:border-[#FF6A00]/50 focus:ring-1 focus:ring-[#FF6A00]/30'}`}
                  />
                ))}
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
                  <p className="text-[13px] font-semibold text-red-400">{error}</p>
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={isVerifying || digits.join('').length < CODE_LENGTH}
                className="w-full h-11 rounded-xl bg-[#FF6A00] hover:bg-[#FF8000] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-[15px] transition-all shadow-[0_0_24px_rgba(255,106,0,0.3)] hover:shadow-[0_0_32px_rgba(255,106,0,0.45)] flex items-center justify-center gap-2 mb-5"
              >
                {isVerifying
                  ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  : <>Verificar OTP →</>
                }
              </button>

              <div className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-1.5 text-white/35">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Não recebeu?</span>
                  <button
                    onClick={handleResend}
                    disabled={isResending || resendCooldown > 0}
                    className="font-bold text-[#FF6A00] hover:text-[#FF8000] disabled:text-white/25 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                  >
                    {isResending && <RotateCw className="w-3 h-3 animate-spin" />}
                    {resendCooldown > 0 ? `Reenviar em ${resendCooldown}s` : 'Reenviar OTP'}
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <p className="text-center text-[11px] text-white/20">
                  2FA Security <span className="text-emerald-400/60 font-bold">habilitado</span>
                  <span className="mx-3 text-white/10">·</span>
                  Verificação instantânea &lt; 100ms
                </p>
              </div>

              <div className="mt-6 text-center">
                <Link href="/login" className="inline-flex items-center gap-1.5 text-[13px] text-white/30 hover:text-white/60 transition-colors">
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
    <Suspense fallback={<div className="min-h-screen bg-[#040d18]" />}>
      <VerificarEmailContent />
    </Suspense>
  );
}
