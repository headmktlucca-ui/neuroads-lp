'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, ArrowRight, BrainCircuit } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export default function AuthOverlay({ isOpen, onClose }: AuthOverlayProps) {
  const { loginWithGoogle } = useAuth();
  const [isEmailLogin, setIsEmailLogin] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      onClose();
      // No redirect — the calling component handles what happens after login
    } catch (error) {
      console.error('Login error:', error);
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
              <button
                onClick={handleGoogleLogin}
                className="w-full h-12 bg-white text-black font-bold flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
              >
                <GoogleIcon />
                ENTRAR COM GOOGLE
              </button>

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
                  className="space-y-4"
                >
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="email" 
                      placeholder="seu@empresa.com"
                      className="w-full h-12 bg-white/5 border border-white/10 pl-12 pr-4 text-white focus:outline-none focus:border-[var(--color-brand-orange)] transition-colors"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="password" 
                      placeholder="Sua senha"
                      className="w-full h-12 bg-white/5 border border-white/10 pl-12 pr-4 text-white focus:outline-none focus:border-[var(--color-brand-orange)] transition-colors"
                    />
                  </div>
                  <button className="w-full h-12 bg-[var(--color-brand-orange)] text-black font-bold flex items-center justify-center gap-2 hover:bg-[var(--color-brand-green)] transition-all">
                    AUTENTICAR <ArrowRight size={18} />
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
