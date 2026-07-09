'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import HeroCircuitBackground from '@/components/ui/HeroCircuitBackground';

const SLIDES = [
  {
    badge: 'DASHBOARD ESTRATÉGICO',
    badgeColor: '#FF6A00',
    headline: 'VEJA O RETORNO\nDE CADA REAL\nINVESTIDO',
    sub: 'Dados reais de Google Ads, Meta Ads e GA4 unificados em um painel de controle com inteligência preditiva.',
  },
  {
    badge: 'AGENTES DE IA',
    badgeColor: '#a855f7',
    headline: 'AGENTES QUE\nOTIMIZAM SUAS\nCAMPANHAS 24/7',
    sub: 'IA especializada em mídia paga que ajusta lances, detecta anomalias e gera relatórios sem intervenção manual.',
  },
  {
    badge: 'INTEGRAÇÕES',
    badgeColor: '#22c55e',
    headline: 'CONECTE TODOS\nOS SEUS CANAIS\nEM MINUTOS',
    sub: 'Google Ads, Meta Ads, LinkedIn, TikTok e Google Analytics 4 — todos integrados com segurança OAuth.',
  },
];



export function AuthLeftPanel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((p) => (p + 1) % SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <>
      {/* Background — mesma animação de circuito da seção de abertura da home */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-[#FAFBFD] to-[#ECEFF4]">
        <HeroCircuitBackground id="circuit-auth" />
      </div>

      {/* Left Panel Content - Hidden on mobile, visible on lg */}
      <div className="relative z-10 hidden lg:flex h-full flex-col justify-between p-10 lg:p-12 w-full max-h-screen">
        <Link href="/">
          <Image
            src="/images/Logos/Logo_primario.png"
            alt="NeuroAds"
            width={320}
            height={80}
            className="h-[72px] w-auto hover:opacity-80 transition-opacity"
            priority
          />
        </Link>

        {/* Slide content */}
        <div className="flex flex-col gap-6 flex-1 justify-center py-8">
          <div
            key={current}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] mb-4 px-2.5 py-1 rounded-full border"
              style={{ color: slide.badgeColor, borderColor: `${slide.badgeColor}40`, backgroundColor: `${slide.badgeColor}12` }}
            >
              <span className="h-1 w-1 rounded-full" style={{ backgroundColor: slide.badgeColor }} />
              {slide.badge}
            </span>

            <h2 className="text-[28px] lg:text-[32px] font-black text-slate-900 leading-[1.1] tracking-tight whitespace-pre-line mb-4">
              {slide.headline}
            </h2>

            <p className="text-[14px] text-slate-900/50 leading-relaxed max-w-sm">
              {slide.sub}
            </p>
          </div>
        </div>

        {/* Bottom: stats + dots */}
        <div className="border-t border-slate-300 pt-5 flex items-center justify-center">
          <div className="flex gap-1.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-[#FF6A00]' : 'w-1.5 bg-white/20'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
