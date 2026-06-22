'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-[#000000] p-10 lg:p-12">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl transition-colors duration-1000"
          style={{ backgroundColor: slide.badgeColor }}
        />
        <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-[#FF6A00]/10 blur-3xl" />
        {/* Dot grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dotgrid" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="1" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dotgrid)" />
        </svg>
      </div>

      {/* Logo */}
      <div className="relative z-10">
        <Link href="/">
          <Image
            src="/images/Logos/LLNeuroAds.png"
            alt="NeuroAds"
            width={320}
            height={80}
            className="h-[72px] w-auto hover:opacity-80 transition-opacity"
            priority
          />
        </Link>
      </div>

      {/* Slide content */}
      <div className="relative z-10 flex flex-col gap-6 flex-1 justify-center py-8">
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

          <h2 className="text-[28px] lg:text-[32px] font-black text-white leading-[1.1] tracking-tight whitespace-pre-line mb-4">
            {slide.headline}
          </h2>

          <p className="text-[14px] text-white/50 leading-relaxed max-w-sm">
            {slide.sub}
          </p>


        </div>
      </div>

      {/* Bottom: stats + dots */}
      <div className="relative z-10">
        <div className="border-t border-white/[0.08] pt-5 flex items-center justify-center">
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
    </div>
  );
}
