'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import { X, Bot, Link2, Zap, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = 'neuroads_welcome_shown_v1';

const STEPS = [
  {
    step: 1,
    icon: Link2,
    iconBg: 'bg-slate-500/10',
    iconColor: 'text-slate-400',
    title: 'Conecte seus canais',
    desc: 'Vincule Google Ads, Meta Ads e Google Analytics 4 para alimentar os Agentes com dados reais da sua operação.',
    cta: 'Ir para Integrações',
    href: '/hub/integracoes',
  },
  {
    step: 2,
    icon: Bot,
    iconBg: 'bg-[#FF6A00]/10',
    iconColor: 'text-[#FF6A00]',
    title: 'Ative o Agente DNA da Marca',
    desc: 'Este é o ponto de partida. O DNA da Marca aprende a linguagem, o tom e os diferenciais do seu negócio — base para todos os outros Agentes operarem com inteligência.',
    cta: 'Ver Agentes IA',
    href: '/hub/agentes-ativos',
    highlight: true,
  },
  {
    step: 3,
    icon: Zap,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    title: 'Explore o Hub',
    desc: 'Com canais conectados e o DNA configurado, o Dashboard começa a exibir métricas reais e os demais Agentes ganham contexto para otimizar seus resultados.',
    cta: 'Ver Dashboard',
    href: '/hub',
  },
];

export default function WelcomeModal() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const shown = window.localStorage.getItem(STORAGE_KEY);
    if (!shown) setOpen(true);
  }, []);

  const dismiss = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, '1');
    }
    setOpen(false);
  };

  if (!open) return null;

  const firstName = user?.displayName?.split(' ')[0] || 'por aí';
  const step = STEPS[activeStep];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={dismiss}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-lg animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-400">
          <div className="relative rounded-3xl border border-[#FF6A00]/20 bg-[#07111f] shadow-[0_32px_80px_rgba(0,0,0,0.8)] overflow-hidden">

            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FF6A00]/60 to-transparent" />

            {/* Background glow */}
            <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#FF6A00]/08 blur-3xl" />

            {/* Header */}
            <div className="flex items-start justify-between p-6 pb-0">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/Logos/LLNeuroAds.png"
                  alt="NeuroAds"
                  width={120}
                  height={30}
                  className="h-7 w-auto"
                />
              </div>
              <button
                onClick={dismiss}
                className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Welcome message */}
            <div className="px-6 pt-5 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-[#FF6A00]" />
                <span className="text-[11px] font-black uppercase tracking-[0.14em] text-[#FF6A00]">Bem-vindo à NeuroAds</span>
              </div>
              <h2 className="text-[22px] font-black text-white leading-snug">
                Olá, {firstName}! Vamos começar?
              </h2>
              <p className="mt-1.5 text-[13px] text-white/45 leading-relaxed">
                Siga esses 3 passos para ativar sua operação de mídia paga com inteligência artificial.
              </p>
            </div>

            {/* Step tabs */}
            <div className="flex gap-1.5 px-6 mb-4">
              {STEPS.map((s, i) => (
                <button
                  key={s.step}
                  onClick={() => setActiveStep(i)}
                  className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                    i === activeStep ? 'bg-[#FF6A00]' : i < activeStep ? 'bg-[#FF6A00]/40' : 'bg-white/[0.08]'
                  }`}
                />
              ))}
            </div>

            {/* Active step card */}
            <div className="mx-6 mb-6">
              <div
                className={`rounded-2xl border p-5 transition-all duration-300 ${
                  step.highlight
                    ? 'border-[#FF6A00]/30 bg-[#FF6A00]/05 shadow-[0_0_24px_rgba(255,106,0,0.08)]'
                    : 'border-white/[0.08] bg-white/[0.02]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`shrink-0 w-11 h-11 rounded-xl ${step.iconBg} border border-white/[0.06] flex items-center justify-center`}>
                    <step.icon className={`w-5 h-5 ${step.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/25">Passo {step.step}</span>
                      {step.highlight && (
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[#FF6A00]/15 text-[#FF6A00] border border-[#FF6A00]/30 uppercase tracking-wider">
                          Comece aqui
                        </span>
                      )}
                    </div>
                    <h3 className="text-[16px] font-black text-white leading-snug mb-1.5">{step.title}</h3>
                    <p className="text-[13px] text-white/50 leading-relaxed">{step.desc}</p>
                  </div>
                </div>

                <Link
                  href={step.href}
                  onClick={dismiss}
                  className={`mt-4 w-full flex items-center justify-center gap-2 h-10 rounded-xl font-bold text-[14px] transition-all ${
                    step.highlight
                      ? 'bg-gradient-to-r from-[#F24900] to-[#FF8805] hover:from-[#d93f00] hover:to-[#e07500] text-white shadow-[0_0_20px_rgba(255,106,0,0.3)]'
                      : 'bg-white/[0.06] text-white hover:bg-white/[0.10] border border-white/[0.08]'
                  }`}
                >
                  {step.cta} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Step navigation */}
            <div className="flex items-center justify-between px-6 pb-5">
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeStep ? 'w-5 bg-[#FF6A00]' : 'w-1.5 bg-white/[0.12]'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2">
                {activeStep > 0 && (
                  <button
                    onClick={() => setActiveStep((p) => p - 1)}
                    className="px-3 py-1.5 text-[13px] font-semibold text-white/35 hover:text-white transition-colors"
                  >
                    Anterior
                  </button>
                )}
                {activeStep < STEPS.length - 1 ? (
                  <button
                    onClick={() => setActiveStep((p) => p + 1)}
                    className="px-4 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[13px] font-bold text-white hover:bg-white/[0.10] transition-all"
                  >
                    Próximo
                  </button>
                ) : (
                  <button
                    onClick={dismiss}
                    className="px-4 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[13px] font-bold text-white hover:bg-white/[0.10] transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Entendido
                  </button>
                )}
              </div>
            </div>

            {/* Bottom dismiss */}
            <div className="border-t border-white/[0.05] px-6 py-3 text-center">
              <button
                onClick={dismiss}
                className="text-[11px] text-white/20 hover:text-white/40 transition-colors"
              >
                Pular introdução e explorar por conta própria
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
