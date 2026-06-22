'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { AuthLeftPanel } from '../../components/auth/AuthLeftPanel';
import { getFirebaseAuth, getFirebaseDb } from '../../lib/firebase';
import { sendEmailVerification } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Eye, EyeOff, Mail, Lock, User, Building2, Globe, Phone } from 'lucide-react';

function CadastroPageContent() {
  const router = useRouter();
  const { user, loading, registerWithEmailPassword, loginWithGoogle } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    companyName: '',
    site: 'https://',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace('/hub');
  }, [loading, user, router]);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;

    if (val === '' || val === 'http' || val === 'https' || val === 'https:' || val === 'https:/') {
      setForm((prev) => ({ ...prev, site: 'https://' }));
      return;
    }

    // Auto-correct double protocol pasting
    if (val.startsWith('https://https://')) {
      val = val.replace('https://https://', 'https://');
    } else if (val.startsWith('https://http://')) {
      val = val.replace('https://http://', 'https://');
    } else if (val.startsWith('http://') && val !== 'http://') {
      val = val.replace('http://', 'https://');
    }

    if (!val.startsWith('https://')) {
      val = 'https://' + val;
    }

    setForm((prev) => ({ ...prev, site: val }));
  };

  const saveProfile = async (uid: string) => {
    const db = getFirebaseDb();
    await setDoc(
      doc(db, 'users', uid),
      {
        displayName: form.name,
        companyName: form.companyName,
        site: form.site,
        whatsapp: form.whatsapp,
        authEmail: form.email.trim(),
        registeredAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (form.password.length < 6) {
      setAuthError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      setIsSubmitting(true);
      setAuthError(null);
      await registerWithEmailPassword(form.email, form.password);

      const auth = getFirebaseAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        await saveProfile(currentUser.uid);
        await sendEmailVerification(currentUser);
      }

      router.replace('/verificar-email');
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      if (code === 'auth/email-already-in-use') {
        setAuthError('Este e-mail já está cadastrado. Tente fazer login.');
      } else if (code === 'auth/invalid-email') {
        setAuthError('E-mail inválido. Verifique o endereço digitado.');
      } else if (code === 'auth/weak-password') {
        setAuthError('Senha muito fraca. Use pelo menos 6 caracteres.');
      } else {
        setAuthError('Não foi possível criar a conta. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleRegister = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      setAuthError(null);
      await loginWithGoogle();
    } catch {
      setAuthError('Não foi possível cadastrar com Google. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
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
      <div className="flex-1 flex items-center justify-center bg-[#040d18] p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-[540px] p-6 sm:p-8 rounded-2xl border border-white/[0.08] bg-[#071424] shadow-[0_12px_40px_rgba(0,0,0,0.6)]">

          <div className="mb-6">
            <h1 className="text-[26px] font-black text-white leading-tight">Criar uma conta</h1>
            <p className="mt-1.5 text-[14px] text-white/45 font-medium">
              Comece a transformar seus resultados de mídia paga.
            </p>
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleRegister}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-3 h-11 rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] transition-all text-[14px] font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            Cadastrar com Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/25">ou e-mail</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {authError && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
              <p className="text-[13px] font-semibold text-red-400">{authError}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-3.5">

            {/* Nome */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-white/40 mb-1.5">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 z-10" />
                <input type="text" value={form.name} onChange={set('name')} placeholder="Seu nome" required
                  className="w-full h-11 rounded-xl border border-white/[0.10] bg-white/[0.04] pl-10 pr-4 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF6A00]/50 focus:ring-1 focus:ring-[#FF6A00]/30 transition-all" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-white/40 mb-1.5">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 z-10" />
                <input type="email" value={form.email} onChange={set('email')} placeholder="nome@empresa.com" required
                  className="w-full h-11 rounded-xl border border-white/[0.10] bg-white/[0.04] pl-10 pr-4 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF6A00]/50 focus:ring-1 focus:ring-[#FF6A00]/30 transition-all" />
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-white/40 mb-1.5">WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 z-10" />
                <input type="tel" value={form.whatsapp} onChange={set('whatsapp')} placeholder="+55 11 99999-9999" required
                  className="w-full h-11 rounded-xl border border-white/[0.10] bg-white/[0.04] pl-10 pr-4 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF6A00]/50 focus:ring-1 focus:ring-[#FF6A00]/30 transition-all" />
              </div>
            </div>

            {/* Nome da Empresa + Site (grid) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-white/40 mb-1.5">Nome da Empresa</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/35 z-10" />
                  <input type="text" value={form.companyName} onChange={set('companyName')} placeholder="Minha Empresa" required
                    className="w-full h-11 rounded-xl border border-white/[0.10] bg-white/[0.04] pl-9 pr-3 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF6A00]/50 focus:ring-1 focus:ring-[#FF6A00]/30 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-white/40 mb-1.5">Site</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/35 z-10" />
                  <input type="url" value={form.site} onChange={handleSiteChange} placeholder="empresa.com"
                    className="w-full h-11 rounded-xl border border-white/[0.10] bg-white/[0.04] pl-9 pr-3 text-[13px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF6A00]/50 focus:ring-1 focus:ring-[#FF6A00]/30 transition-all" />
                </div>
              </div>
            </div>

            {/* Senha */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-white/40 mb-1.5">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 z-10" />
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Mínimo 6 caracteres" required
                  className="w-full h-11 rounded-xl border border-white/[0.10] bg-white/[0.04] pl-10 pr-11 text-[14px] text-white placeholder:text-white/20 focus:outline-none focus:border-[#FF6A00]/50 focus:ring-1 focus:ring-[#FF6A00]/30 transition-all" />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-[#FF6A00] hover:bg-[#FF8000] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-[15px] transition-all shadow-[0_0_24px_rgba(255,106,0,0.3)] hover:shadow-[0_0_32px_rgba(255,106,0,0.45)] flex items-center justify-center gap-2 mt-1">
              {isSubmitting
                ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                : <>Criar Conta →</>
              }
            </button>
          </form>

          <p className="mt-5 text-center text-[13px] text-white/35">
            Já tem uma conta?{' '}
            <Link href="/login" className="font-bold text-[#FF6A00] hover:text-[#FF8000] transition-colors">Fazer login</Link>
          </p>

          <p className="mt-4 text-center text-[11px] text-white/20 leading-relaxed">
            Ao criar uma conta, você concorda com nossos{' '}
            <a href="#" className="underline hover:text-white/40 transition-colors">Termos de Uso</a>{' '}
            e{' '}
            <a href="#" className="underline hover:text-white/40 transition-colors">Política de Privacidade</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CadastroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#040d18]" />}>
      <CadastroPageContent />
    </Suspense>
  );
}
