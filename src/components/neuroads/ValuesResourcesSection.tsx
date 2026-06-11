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
    <section id="pricing" className="mx-auto max-w-[1520px] px-4 pb-14 pt-12 md:px-8">
      <div className="relative overflow-hidden rounded-[32px] border-0 bg-[rgba(241,243,247,0.2)] px-4 pb-8 pt-4 shadow-[0_14px_34px_rgba(10,20,40,0.06)] sm:px-8 sm:pb-10 sm:pt-5 lg:px-10 lg:pb-12 lg:pt-6">
        <div className="relative z-10 mx-auto flex min-h-[160px] max-w-[980px] flex-col items-center justify-center text-center sm:min-h-[180px] lg:min-h-[200px]">
          <h2 className="font-black tracking-[-0.03em]">
            <span className="block text-[42px] leading-[0.98] text-[#060f29]">Sua operação muito mais</span>
            <span className="mt-3 block pb-[0.08em] bg-[linear-gradient(90deg,#ff8a00_0%,#ff6a00_50%,#ff9f1a_100%)] bg-clip-text text-[50px] leading-[1.03] text-transparent">
              inteligente, lucrativa e escalável.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-[820px] text-[19px] leading-[1.35] text-[#4e5a74]">
            Plataforma com IA que ajuda você a analisar, automatizar e acelerar crescimento com previsibilidade.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="relative z-10 mx-auto mt-8 flex items-center justify-center gap-4">
          <span className={`text-[14px] font-bold tracking-wide transition-colors ${!isAnnual ? 'text-[#ff5a00]' : 'text-[#8a91a3]'}`}>
            Mensal
          </span>
          <button
            type="button"
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative h-[30px] w-[56px] cursor-pointer rounded-full border border-[#e0e5ef] bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] outline-none transition-all hover:border-[#ff8a40]"
          >
            <motion.div
              className="absolute left-[3px] top-[3px] h-[22px] w-[22px] rounded-full bg-[linear-gradient(135deg,#ff6a00_0%,#ff9f1a_100%)] shadow-[0_2px_6px_rgba(255,106,0,0.35)]"
              animate={{ x: isAnnual ? 26 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={`text-[14px] font-bold tracking-wide transition-colors flex items-center gap-2 ${isAnnual ? 'text-[#ff5a00]' : 'text-[#8a91a3]'}`}>
            Anual
            {monthlySavings > 0 ? (
              <span className="rounded-full bg-[#ECFDF3] px-2.5 py-0.5 text-[11px] font-extrabold text-[#0A7A42] border border-[#08B760]/20">
                ECONOMIZE R$ {formatPriceFromCents(monthlySavings)}
              </span>
            ) : null}
          </span>
        </div>

        {/* Single Plan Card */}
        <div className="relative z-10 mx-auto mt-10 max-w-[520px]">
          <motion.article
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="group relative flex flex-col overflow-visible rounded-[24px] border-0 bg-[linear-gradient(165deg,rgba(255,255,255,0.78),rgba(255,245,237,0.58))] px-7 pb-7 pt-[130px] shadow-[0_18px_48px_rgba(13,23,45,0.14)] transition-[box-shadow] duration-300 hover:shadow-[0_36px_92px_rgba(255,110,35,0.38)]"
          >
            {/* Inner border overlay */}
            <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-[radial-gradient(circle_at_35%_0%,rgba(255,162,82,0.22),rgba(255,255,255,0)_58%)]" />

            {/* Floating Image */}
            <motion.div
              animate={!prefersReducedMotion && isHovered ? { y: [0, -11, 0] } : { y: 0 }}
              transition={
                !prefersReducedMotion && isHovered
                  ? { duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }
                  : { duration: 0.2, ease: 'easeOut' }
              }
              className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-[30%] h-[126px] w-[142px]"
            >
              <Image
                src="/images/pricing-plans/icon_pro_scale_001.png"
                alt="Imagem do plano NeuroAds IA Pro"
                fill
                sizes="220px"
                className="object-contain drop-shadow-[0_16px_28px_rgba(10,20,40,0.18)] scale-[1.2]"
                priority
              />
            </motion.div>

            <h3 className="text-[28px] font-black leading-none text-[#ff5a00]">{plan.name}</h3>
            <p className="mt-2 text-[16px] leading-[1.35] text-[#3f4a63]">
              IA avançada e inteligência profunda para escalar sua operação.
            </p>

            <div className="mt-5 border-b border-[#e7edf7] pb-5">
              <div className="flex items-end gap-1.5">
                <span className="text-[48px] font-black leading-none text-[#0b132d]">
                  R$ {formatPriceFromCents(currentPrice)}
                </span>
                <span className="mb-2 text-[26px] font-black text-[#ff5a00]">{currentLabel}</span>
              </div>
              <p className="mt-2 text-[14px] font-semibold text-[#6f7b95]">
                {isAnnual ? 'Cobrança anual' : 'Cobrança mensal'}
              </p>
            </div>

            <ul className="mt-5 flex-1 space-y-2.5">
              {planFeatures.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-[14px] leading-[1.28] text-[#25324d]">
                  <span className="mt-0.5 inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[#ff7a1b] text-white">
                    <Check size={12} strokeWidth={3.1} />
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={handleCtaClick}
              className="relative mt-7 inline-flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-[12px] border border-transparent px-5 py-3.5 text-[17px] font-extrabold text-white transition duration-300 hover:brightness-105 bg-[linear-gradient(90deg,#ff5a00_0%,#ff9f1a_100%)] shadow-[0_14px_25px_rgba(255,101,15,0.35)]"
            >
              <span>Começar agora</span>
              <ArrowRight size={20} />
            </button>

            <p className="mt-3 text-center text-[12px] text-[#8a91a3]">
              14 dias de trial grátis · Cancele quando quiser
            </p>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
