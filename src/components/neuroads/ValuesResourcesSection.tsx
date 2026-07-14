'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  ArrowRight,
  Check,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import offers from '../../data/stripe-offers.json';

interface PlanOffer {
  slug: string;
  name: string;
  amount: number;
  amountAnnual?: number;
  description: string;
  priceId: string;
  priceIdAnnual?: string;
  mode: string;
  trialDays?: number;
}

const plan = (offers.plans as PlanOffer[])[0] ?? null;

const planFeatures = [
  'Insights de IA (acesso total)',
  'Fontes de dados ilimitadas',
  'Analytics avançado',
  'Modelagem preditiva',
  'Colaboração de equipe',
  'Suporte prioritário e onboarding',
];

function formatPriceFromCents(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function ValuesResourcesSection() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const [isAnnual, setIsAnnual] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCtaClick = () => {
    router.push('/onboarding');
  };

  const currentPrice = isAnnual && plan?.amountAnnual ? plan.amountAnnual : plan?.amount ?? 0;
  const currentLabel = isAnnual ? '/ano' : '/mês';
  const monthlySavings = plan && plan.amountAnnual
    ? Math.round(plan.amount * 12 - plan.amountAnnual)
    : 0;

  if (!plan) return null;

  return (
    <section id="pricing" className="relative z-10 w-full px-4 pb-14 pt-12 md:px-8 overflow-hidden">
      
      <div className="relative z-10 mx-auto max-w-[1520px]">
        <div className="relative overflow-hidden rounded-[40px] border border-[#ff6a00]/15 bg-black/30 backdrop-blur-xl px-6 py-16 md:px-12 my-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] items-center">
          {/* Left Column: Headline, Subtitle, Toggle & Info */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#ff6a00]">Valores e Recursos</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 leading-tight tracking-[-0.03em]">
              <span className="block text-white">Sua operação muito mais</span>
              <span className="mt-2 block pb-[0.08em] bg-[linear-gradient(90deg,#ff8a00_0%,#ff6a00_50%,#ff9f1a_100%)] bg-clip-text text-transparent">
                inteligente, lucrativa e escalável.
              </span>
            </h2>
            <p className="mt-4 max-w-[540px] text-slate-400 text-sm leading-relaxed">
              Plataforma com IA que ajuda você a analisar, automatizar e acelerar crescimento com previsibilidade de caixa.
            </p>

            {/* Billing Toggle */}
            <div className="mt-8 flex flex-col items-center lg:items-start gap-4">
              <div className="flex items-center gap-4">
                <span className={`text-sm font-bold tracking-wide transition-colors ${!isAnnual ? 'text-[#ff6a00]' : 'text-slate-400'}`}>
                  Mensal
                </span>
                <button
                  type="button"
                  onClick={() => setIsAnnual(!isAnnual)}
                  className="relative h-[30px] w-[56px] cursor-pointer rounded-full border border-white/10 bg-zinc-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] outline-none transition-all hover:border-[#ff8a40]"
                >
                  <motion.div
                    className="absolute left-[3px] top-[3px] h-[22px] w-[22px] rounded-full bg-[linear-gradient(135deg,#ff6a00_0%,#ff9f1a_100%)] shadow-[0_2px_6px_rgba(255,106,0,0.35)]"
                    animate={{ x: isAnnual ? 26 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
                <span className={`text-sm font-bold tracking-wide transition-colors flex items-center gap-2 ${isAnnual ? 'text-[#ff6a00]' : 'text-slate-400'}`}>
                  Anual
                  {monthlySavings > 0 ? (
                    <span className="rounded-full bg-emerald-950/40 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-400 border border-emerald-500/20">
                      ECONOMIZE R$ {formatPriceFromCents(monthlySavings)}
                    </span>
                  ) : null}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                14 dias de trial grátis · Cancele quando quiser
              </p>
            </div>
          </div>

          {/* Right Column: Premium Card */}
          <div className="relative mx-auto w-full max-w-[500px] mt-12 lg:mt-0">
            <motion.article
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              className="group relative flex flex-col overflow-visible rounded-[24px] border border-[#ff6a00]/20 bg-zinc-950/85 backdrop-blur-xl px-7 pb-8 pt-24 sm:pt-28 shadow-[0_18px_48px_rgba(0,0,0,0.5)] transition-[box-shadow,border-color] duration-300 hover:border-[#ff6a00]/40 hover:shadow-[0_20px_50px_rgba(255,106,0,0.15)]"
            >
              {/* Inner glow overlay */}
              <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-[radial-gradient(circle_at_50%_0%,rgba(255,106,0,0.12),transparent_60%)]" />

              {/* Floating Image */}
              <motion.div
                animate={!prefersReducedMotion && isHovered ? { y: [0, -8, 0] } : { y: 0 }}
                transition={
                  !prefersReducedMotion && isHovered
                    ? { duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }
                    : { duration: 0.2, ease: 'easeOut' }
                }
                className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-[45%] h-[120px] w-[130px]"
              >
                <Image
                  src="/images/pricing-plans/icon_pro_scale_001.png"
                  alt="Imagem do plano NeuroAds IA Pro"
                  fill
                  sizes="220px"
                  className="object-contain drop-shadow-[0_16px_28px_rgba(255,106,0,0.2)] scale-[1.15]"
                  priority
                />
              </motion.div>

              <h3 className="text-2xl font-extrabold text-white text-center sm:text-left">{plan.name}</h3>
              <p className="mt-2 text-sm text-slate-400 text-center sm:text-left">
                IA avançada e inteligência profunda para escalar sua operação.
              </p>

              <div className="mt-6 border-b border-white/5 pb-5">
                <div className="flex items-end justify-center sm:justify-start gap-1.5">
                  <span className="text-4xl sm:text-5xl font-black leading-none text-[#ff6a00]">
                    R$ {formatPriceFromCents(currentPrice)}
                  </span>
                  <span className="mb-1 text-xl font-bold text-white">{currentLabel}</span>
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-500 text-center sm:text-left">
                  {isAnnual ? 'Cobrança anual' : 'Cobrança mensal'}
                </p>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {planFeatures.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="mt-0.5 inline-flex h-[16px] w-[16px] shrink-0 items-center justify-center rounded-full bg-[#ff6a00] text-white">
                      <Check size={10} strokeWidth={3.5} />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={handleCtaClick}
                className="relative mt-8 inline-flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3.5 text-sm font-extrabold text-white transition duration-300 hover:bg-[#ff7b1a] bg-[#ff6a00] shadow-[0_4px_20px_rgba(255,106,0,0.3)] hover:shadow-[0_4px_25px_rgba(255,106,0,0.45)]"
              >
                <span>Começar agora</span>
                <ArrowRight size={16} />
              </button>
            </motion.article>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}
