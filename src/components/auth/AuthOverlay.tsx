'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, ArrowRight, BrainCircuit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GoogleLoginButton } from './GoogleLoginButton';

interface AuthOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}


export default function AuthOverlay({ isOpen, onClose }: AuthOverlayProps) {
  const { loginWithGoogle, loginWithEmailPassword } = useAuth();
  const [isEmailLogin, setIsEmailLogin] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
  const [emailAuthError, setEmailAuthError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setEmailAuthError(null);
      await loginWithGoogle();
      onClose();
      // No redirect — the calling component handles what happens after login
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleEmailLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!emailInput.trim() || !passwordInput) {
      setEmailAuthError('Informe email e senha para continuar.');
      return;
    }

    try {
      setIsSubmittingEmail(true);
      setEmailAuthError(null);
      await loginWithEmailPassword(emailInput.trim(), passwordInput);
      setPasswordInput('');
      onClose();
    } catch (error) {
      console.error('Email login error:', error);
      setEmailAuthError('Email ou senha inválidos. Tente novamente ou use o Google.');
    } finally {
      setIsSubmittingEmail(false);
    }
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 w-screen h-screen">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden rounded-2xl"
          >
            {/* Design Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-brand-orange)]/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-12 h-12 bg-[var(--color-brand-orange)]/10 border border-[var(--color-brand-orange)]/20 flex items-center justify-center mb-4 skew-x-[-12deg]">
                <BrainCircuit className="text-[var(--color-brand-orange)] skew-x-[12deg]" size={24} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight mb-2 uppercase">Acesse seu Hub Estratégico</h2>
              <p className="text-slate-400 text-sm">
                Entre para sincronizar seus dados e acessar a IA de performance.
              </p>
            </div>

            <div className="space-y-4">
              <GoogleLoginButton
                onClick={handleGoogleLogin}
                label="ENTRAR COM GOOGLE"
                className="w-full h-12 uppercase font-bold"
              />

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#0a0a0a] px-2 text-slate-500">Ou use email corporativo</span>
                </div>
              </div>

              {!isEmailLogin ? (
                <button
                  onClick={() => setIsEmailLogin(true)}
                  className="w-full h-12 border border-white/10 text-white font-mono text-sm tracking-widest hover:bg-white/5 transition-colors flex items-center justify-center gap-3"
                >
                  <Mail size={18} />
                  EMAIL CORPORATIVO
                </button>
              ) : (
                <motion.form 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleEmailLogin}
                  className="space-y-4"
                >
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="email" 
                      value={emailInput}
                      onChange={(event) => setEmailInput(event.target.value)}
                      placeholder="seu@empresa.com"
                      className="w-full h-12 bg-white/5 border border-white/10 pl-12 pr-4 text-white focus:outline-none focus:border-[var(--color-brand-orange)] transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="password" 
                      value={passwordInput}
                      onChange={(event) => setPasswordInput(event.target.value)}
                      placeholder="Sua senha"
                      className="w-full h-12 bg-white/5 border border-white/10 pl-12 pr-4 text-white focus:outline-none focus:border-[var(--color-brand-orange)] transition-colors"
                    />
                  </div>
                  {emailAuthError ? (
                    <p className="text-xs text-[#FFB4A5]">{emailAuthError}</p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={isSubmittingEmail}
                    className="w-full h-12 bg-[var(--color-brand-orange)] text-black font-bold flex items-center justify-center gap-2 hover:bg-[var(--color-brand-green)] transition-all disabled:opacity-60"
                  >
                    {isSubmittingEmail ? 'AUTENTICANDO...' : 'AUTENTICAR'} <ArrowRight size={18} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsEmailLogin(false)}
                    className="w-full text-xs text-slate-500 hover:text-white transition-colors"
                  >
                    Voltar para opções
                  </button>
                </motion.form>
              )}
            </div>

            <p className="mt-8 text-center text-[10px] text-slate-600 font-mono uppercase tracking-widest">
              Neural Security Protocol v4.0.2 // Encrypted
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
