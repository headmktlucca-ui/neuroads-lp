'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { HUB_BOOSTER, HUB_PLAN } from '../../data/hub-plan';

function formatBRLFromCents(cents: number): string {
  const value = cents / 100;
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/* ── 3D SVG icons ─────────────────────────────────────────── */

function IconBot() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
      <defs>
        <linearGradient id="g-bot-body" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5BC8F5" />
          <stop offset="100%" stopColor="#1565C0" />
        </linearGradient>
        <linearGradient id="g-bot-head" x1="10" y1="4" x2="30" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#64D2FF" />
          <stop offset="100%" stopColor="#1976D2" />
        </linearGradient>
        <filter id="shadow-bot" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#0D47A1" floodOpacity="0.45" />
        </filter>
      </defs>
      {/* Shadow */}
      <ellipse cx="20" cy="37" rx="11" ry="2.5" fill="#0D47A1" opacity="0.25" />
      {/* Body */}
      <rect x="7" y="18" width="26" height="16" rx="5" fill="url(#g-bot-body)" filter="url(#shadow-bot)" />
      {/* Head */}
      <rect x="11" y="6" width="18" height="14" rx="5" fill="url(#g-bot-head)" filter="url(#shadow-bot)" />
      {/* Antenna */}
      <rect x="19" y="2" width="2" height="5" rx="1" fill="#64D2FF" />
      <circle cx="20" cy="2" r="2" fill="#FFD600" />
      {/* Eyes */}
      <circle cx="16" cy="13" r="2.5" fill="white" />
      <circle cx="24" cy="13" r="2.5" fill="white" />
      <circle cx="16.5" cy="13.5" r="1" fill="#1565C0" />
      <circle cx="24.5" cy="13.5" r="1" fill="#1565C0" />
      {/* Mouth */}
      <rect x="14" y="24" width="12" height="4" rx="2" fill="white" opacity="0.9" />
      {/* Highlight head */}
      <ellipse cx="16" cy="9" rx="4.5" ry="2" fill="white" opacity="0.25" />
      {/* Highlight body */}
      <ellipse cx="14" cy="21" rx="5" ry="2" fill="white" opacity="0.18" />
    </svg>
  );
}

function IconChecklist() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
      <defs>
        <linearGradient id="g-clip" x1="4" y1="4" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFA726" />
          <stop offset="100%" stopColor="#E65100" />
        </linearGradient>
        <filter id="shadow-clip">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#BF360C" floodOpacity="0.4" />
        </filter>
      </defs>
      <ellipse cx="20" cy="37.5" rx="11" ry="2.5" fill="#BF360C" opacity="0.22" />
      {/* Clipboard body */}
      <rect x="6" y="8" width="28" height="28" rx="5" fill="url(#g-clip)" filter="url(#shadow-clip)" />
      {/* Clip top */}
      <rect x="14" y="4" width="12" height="7" rx="3" fill="#FF8F00" />
      <rect x="17" y="3" width="6" height="4" rx="2" fill="#FFB300" />
      {/* Lines */}
      <rect x="12" y="17" width="16" height="2.5" rx="1.25" fill="white" opacity="0.9" />
      <rect x="12" y="22.5" width="11" height="2.5" rx="1.25" fill="white" opacity="0.9" />
      <rect x="12" y="28" width="13" height="2.5" rx="1.25" fill="white" opacity="0.9" />
      {/* Check mark */}
      <circle cx="9.5" cy="18.25" r="3" fill="#4CAF50" />
      <polyline points="8,18.25 9.2,19.5 11.5,17" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Highlight */}
      <ellipse cx="14" cy="11" rx="5" ry="2" fill="white" opacity="0.22" />
    </svg>
  );
}

function IconLightning() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
      <defs>
        <linearGradient id="g-zap" x1="8" y1="2" x2="32" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE53B" />
          <stop offset="50%" stopColor="#FFB300" />
          <stop offset="100%" stopColor="#FF6D00" />
        </linearGradient>
        <filter id="shadow-zap">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#E65100" floodOpacity="0.45" />
        </filter>
      </defs>
      <ellipse cx="20" cy="37.5" rx="9" ry="2.5" fill="#E65100" opacity="0.22" />
      {/* Bolt shape */}
      <polygon points="23,2 10,22 19,22 17,38 30,18 21,18" fill="url(#g-zap)" filter="url(#shadow-zap)" />
      {/* Gloss */}
      <polygon points="23,2 17,14 21,14" fill="white" opacity="0.28" />
    </svg>
  );
}

function IconGear() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
      <defs>
        <linearGradient id="g-gear" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#CE93D8" />
          <stop offset="100%" stopColor="#6A1B9A" />
        </linearGradient>
        <filter id="shadow-gear">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#4A148C" floodOpacity="0.4" />
        </filter>
      </defs>
      <ellipse cx="20" cy="37.5" rx="10" ry="2.5" fill="#4A148C" opacity="0.22" />
      {/* Gear teeth */}
      <path
        d="M20 4 L22.5 7.5 L26.5 6.5 L27.5 10.5 L31.5 11.5 L30.5 15.5 L34 17.5 L32 21 L34 24.5 L30.5 26.5 L31.5 30.5 L27.5 31.5 L26.5 35.5 L22.5 34.5 L20 38 L17.5 34.5 L13.5 35.5 L12.5 31.5 L8.5 30.5 L9.5 26.5 L6 24.5 L8 21 L6 17.5 L9.5 15.5 L8.5 11.5 L12.5 10.5 L13.5 6.5 L17.5 7.5 Z"
        fill="url(#g-gear)"
        filter="url(#shadow-gear)"
      />
      {/* Center hole */}
      <circle cx="20" cy="21" r="7" fill="#7B1FA2" />
      <circle cx="20" cy="21" r="4.5" fill="#9C27B0" />
      {/* Inner ring */}
      <circle cx="20" cy="21" r="3" fill="none" stroke="#CE93D8" strokeWidth="1.5" />
      {/* Highlight */}
      <ellipse cx="14" cy="12" rx="4" ry="2" fill="white" opacity="0.2" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
      <defs>
        <linearGradient id="g-link" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4DD0E1" />
          <stop offset="100%" stopColor="#00838F" />
        </linearGradient>
        <filter id="shadow-link">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#004D61" floodOpacity="0.4" />
        </filter>
      </defs>
      <ellipse cx="20" cy="37" rx="11" ry="2.5" fill="#004D61" opacity="0.22" />
      {/* Left link */}
      <path
        d="M10 16 C10 11 15 7 20 7 L20 11 C17 11 14 13.5 14 16 L14 24 C14 26.5 17 29 20 29 L20 33 C15 33 10 29 10 24 Z"
        fill="url(#g-link)"
        filter="url(#shadow-link)"
      />
      {/* Right link */}
      <path
        d="M30 16 C30 11 25 7 20 7 L20 11 C23 11 26 13.5 26 16 L26 24 C26 26.5 23 29 20 29 L20 33 C25 33 30 29 30 24 Z"
        fill="url(#g-link)"
        filter="url(#shadow-link)"
      />
      {/* Center overlap */}
      <rect x="16" y="15" width="8" height="10" rx="2" fill="#00BCD4" />
      {/* Highlight */}
      <ellipse cx="13" cy="11" rx="3" ry="2" fill="white" opacity="0.25" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
      <defs>
        <linearGradient id="g-users" x1="4" y1="4" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#66BB6A" />
          <stop offset="100%" stopColor="#1B5E20" />
        </linearGradient>
        <filter id="shadow-users">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#1B5E20" floodOpacity="0.4" />
        </filter>
      </defs>
      <ellipse cx="20" cy="37.5" rx="12" ry="2.5" fill="#1B5E20" opacity="0.22" />
      {/* Back person */}
      <circle cx="26" cy="11" r="5.5" fill="#43A047" filter="url(#shadow-users)" />
      <path d="M18 33 C18 26 22 22 26 22 C30 22 34 26 34 33 Z" fill="#43A047" filter="url(#shadow-users)" />
      {/* Front person */}
      <circle cx="15" cy="14" r="6" fill="url(#g-users)" filter="url(#shadow-users)" />
      <path d="M6 36 C6 28 10 24 15 24 C20 24 24 28 24 36 Z" fill="url(#g-users)" filter="url(#shadow-users)" />
      {/* Highlight front */}
      <ellipse cx="12" cy="11" rx="3.5" ry="2.5" fill="white" opacity="0.25" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
      <defs>
        <linearGradient id="g-chat" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#BA68C8" />
          <stop offset="100%" stopColor="#6A1B9A" />
        </linearGradient>
        <filter id="shadow-chat">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#4A148C" floodOpacity="0.4" />
        </filter>
      </defs>
      <ellipse cx="20" cy="37" rx="11" ry="2.5" fill="#4A148C" opacity="0.2" />
      {/* Bubble */}
      <path
        d="M4 8 C4 5 7 3 10 3 L30 3 C33 3 36 5 36 8 L36 24 C36 27 33 29 30 29 L22 29 L16 36 L16 29 L10 29 C7 29 4 27 4 24 Z"
        fill="url(#g-chat)"
        filter="url(#shadow-chat)"
      />
      {/* Dots */}
      <circle cx="14" cy="16" r="2.5" fill="white" opacity="0.95" />
      <circle cx="20" cy="16" r="2.5" fill="white" opacity="0.95" />
      <circle cx="26" cy="16" r="2.5" fill="white" opacity="0.95" />
      {/* Highlight */}
      <ellipse cx="14" cy="7" rx="7" ry="2.5" fill="white" opacity="0.2" />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
      <defs>
        <linearGradient id="g-cal" x1="4" y1="4" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#64B5F6" />
          <stop offset="100%" stopColor="#1565C0" />
        </linearGradient>
        <filter id="shadow-cal">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#0D47A1" floodOpacity="0.4" />
        </filter>
      </defs>
      <ellipse cx="20" cy="37.5" rx="11" ry="2.5" fill="#0D47A1" opacity="0.22" />
      {/* Body */}
      <rect x="4" y="10" width="32" height="26" rx="5" fill="url(#g-cal)" filter="url(#shadow-cal)" />
      {/* Header */}
      <rect x="4" y="10" width="32" height="10" rx="5" fill="#1976D2" />
      <rect x="4" y="15" width="32" height="5" fill="#1976D2" />
      {/* Hooks */}
      <rect x="12" y="6" width="3.5" height="8" rx="1.75" fill="#FF8F00" />
      <rect x="24.5" y="6" width="3.5" height="8" rx="1.75" fill="#FF8F00" />
      {/* Grid dots */}
      {[11, 17, 23, 29].map((x) =>
        [24, 30].map((y) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="4" height="3.5" rx="1" fill="white" opacity="0.85" />
        ))
      )}
      {/* Clock overlay */}
      <circle cx="28" cy="30" r="7" fill="#FFB300" stroke="#FF8F00" strokeWidth="1.5" />
      <line x1="28" y1="27" x2="28" y2="30" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="28" y1="30" x2="30.5" y2="31.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      {/* Highlight */}
      <ellipse cx="12" cy="13" rx="5" ry="1.8" fill="white" opacity="0.2" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
      <defs>
        <linearGradient id="g-shield" x1="4" y1="4" x2="36" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4FC3F7" />
          <stop offset="50%" stopColor="#0288D1" />
          <stop offset="100%" stopColor="#01579B" />
        </linearGradient>
        <filter id="shadow-shield">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#01579B" floodOpacity="0.4" />
        </filter>
      </defs>
      <ellipse cx="20" cy="37" rx="9" ry="2.5" fill="#01579B" opacity="0.22" />
      {/* Shield */}
      <path
        d="M20 3 L35 9 L35 21 C35 30 27 36.5 20 39 C13 36.5 5 30 5 21 L5 9 Z"
        fill="url(#g-shield)"
        filter="url(#shadow-shield)"
      />
      {/* Inner shield */}
      <path
        d="M20 7 L31 12 L31 21 C31 28 25 33 20 35.5 C15 33 9 28 9 21 L9 12 Z"
        fill="#0288D1"
        opacity="0.5"
      />
      {/* Check */}
      <polyline points="13.5,20.5 18,25.5 27,15" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Highlight */}
      <ellipse cx="14" cy="11" rx="4.5" ry="2.5" fill="white" opacity="0.22" />
    </svg>
  );
}

function IconZapOrange() {
  return (
    <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
      <defs>
        <linearGradient id="g-zap-o" x1="8" y1="2" x2="32" y2="38" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFE53B" />
          <stop offset="100%" stopColor="#FF6D00" />
        </linearGradient>
      </defs>
      <polygon points="23,2 10,22 19,22 17,38 30,18 21,18" fill="url(#g-zap-o)" />
      <polygon points="23,2 17,14 21,14" fill="white" opacity="0.3" />
    </svg>
  );
}

/* ── Resource icon map ───────────────────────────────────── */

const resourceIcons: Record<string, () => React.ReactElement> = {
  Bot: IconBot,
  ListChecks: IconChecklist,
  Gauge: IconLightning,
  Workflow: IconGear,
  Link2: IconLink,
  Users: IconUsers,
  MessageSquare: IconChat,
};

/* ── Data ────────────────────────────────────────────────── */

const includedResources = [
  {
    iconKey: 'Bot',
    value: '10',
    label: 'Agentes de IA especializados',
    detail: 'Tráfego, criativos, copies, funil, SEO & GEO e inteligência de dados — o time completo, sem contratação avulsa.',
  },
  {
    iconKey: 'ListChecks',
    value: '30+',
    label: 'Operações pré-configuradas',
    detail: 'Executadas pelos agentes com um clique, além de operações personalizadas via chat com o assistente.',
  },
  {
    iconKey: 'Gauge',
    value: String(HUB_PLAN.monthlyCredits),
    label: 'Créditos por mês',
    detail: 'Moeda única para execuções de agentes, criativos e ações operacionais. Renova todo ciclo.',
  },
  {
    iconKey: 'Workflow',
    value: String(HUB_PLAN.limits.activeAutomations),
    label: 'Automações ativas',
    detail: 'Rotinas agendadas dos agentes rodando em paralelo, com cadência até diária.',
  },
  {
    iconKey: 'Link2',
    value: String(HUB_PLAN.limits.adAccounts),
    label: 'Contas de anúncio',
    detail: 'Conectores OAuth para as contas da sua operação (Google Ads e canais integrados).',
  },
  {
    iconKey: 'Users',
    value: String(HUB_PLAN.limits.hubUsers),
    label: 'Usuários no Hub',
    detail: 'Acesso para sócios e time de marketing no mesmo workspace.',
  },
  {
    iconKey: 'MessageSquare',
    value: String(HUB_PLAN.limits.chatMessagesMonthly),
    label: 'Mensagens de chat/mês',
    detail: 'Assistente operacional incluído — o chat não consome créditos.',
  },
];

/* ── Component ───────────────────────────────────────────── */

export default function PricingValuesSection() {
  const prefersReducedMotion = useReducedMotion();

  const reveal = (delay = 0) => ({
    initial: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 28 },
    whileInView: prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.7, delay },
  });

  return (
    <section id="valores" className="relative w-full py-24 md:py-28 overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          {...reveal()}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pb-12 border-b border-slate-300/40"
        >
          <div className="md:col-span-2">
            <h2 className="font-head font-extrabold text-3xl md:text-4xl text-slate-900 leading-[1.15] tracking-tight">
              Um plano único. <span className="text-[#FF5500]">Toda a operação</span> dentro dele.
            </h2>
          </div>
          <div className="md:col-span-1">
            <p className="text-slate-500 text-sm leading-relaxed md:pl-6 border-l-2 border-orange-500/20">
              Sem tabela de planos para decifrar: um valor mensal, todos os agentes, limites publicados e créditos como única unidade de consumo.
            </p>
          </div>
        </motion.div>

        {/* Price monument + spec sheet */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
          {/* Left: price lockup */}
          <motion.div
            {...reveal(0.1)}
            className="lg:col-span-5 relative overflow-hidden rounded-[28px] p-[1.5px] flex flex-col shadow-[8px_8px_16px_#c8d0e7,-8px_-8px_16px_#ffffff] bg-slate-200/50"
          >
            {/* Rotating Orange Border Beam */}
            <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 z-0 animate-border-beam bg-[conic-gradient(from_0deg,transparent_70%,#FF5500_95%,transparent_100%)]"></div>

            {/* Inner Content Card */}
            <div className="relative z-10 w-full h-full rounded-[26.5px] bg-white dark:bg-slate-900 p-8 md:p-10 flex flex-col flex-1 justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  {HUB_PLAN.name}
                </span>

                <div className="mt-6 flex items-end gap-2">
                  <span className="font-head font-extrabold text-slate-900 dark:text-white text-[64px] md:text-[76px] leading-[0.9] tracking-tighter">
                    <span className="text-[26px] md:text-[30px] align-top font-black text-[#FF5500] mr-1">R$</span>
                    {formatBRLFromCents(HUB_PLAN.monthlyPriceCents)}
                  </span>
                  <span className="text-slate-500 font-bold text-sm mb-1">/mês</span>
                </div>

                <p className="mt-4 text-slate-500 text-[13px] leading-relaxed">
                  No anual, R$ {formatBRLFromCents(HUB_PLAN.annualPriceCents)}/ano — equivalente a dois
                  meses grátis.
                </p>

                <div className="mt-8 pt-6 border-t border-slate-300/40 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 flex items-center justify-center shrink-0">
                      <IconCalendar />
                    </div>
                    <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      <span className="font-bold text-slate-800 dark:text-white">
                        {HUB_PLAN.trialDays} dias de teste com {HUB_PLAN.trialCredits} créditos
                      </span>{' '}
                      para experimentar os agentes na sua operação real. A assinatura libera os{' '}
                      {HUB_PLAN.monthlyCredits} créditos mensais completos.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 flex items-center justify-center shrink-0">
                      <IconShield />
                    </div>
                    <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      <span className="font-bold text-slate-800 dark:text-white">Limites verificados antes de cada execução</span>
                      {' '}— nenhuma análise é interrompida no meio. Alerta de consumo a partir de{' '}
                      {Math.round(HUB_PLAN.alertThreshold * 100)}%.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Inline keyframes animation */}
            <style>
              {`
                @keyframes border-beam {
                  0% {
                    transform: translate(-50%, -50%) rotate(0deg);
                  }
                  100% {
                    transform: translate(-50%, -50%) rotate(360deg);
                  }
                }

                .animate-border-beam {
                  animation: border-beam 4s linear infinite;
                }
              `}
            </style>
          </motion.div>

          {/* Right: included resources spec sheet */}
          <motion.div
            {...reveal(0.18)}
            className="lg:col-span-7 bg-white shadow-[8px_8px_16px_#c8d0e7,-8px_-8px_16px_#ffffff] border border-white/50 rounded-[28px] p-8 md:p-10"
          >
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Tudo incluído no plano
            </span>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              {includedResources.map((resource, index) => {
                const Icon3D = resourceIcons[resource.iconKey];
                return (
                  <div
                    key={resource.label}
                    className={`flex items-start gap-4 py-4 ${
                      index < includedResources.length - (includedResources.length % 2 === 0 ? 2 : 1)
                        ? 'border-b border-slate-300/30'
                        : ''
                    }`}
                  >
                    <div className="w-10 h-10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon3D />
                    </div>
                    <div className="min-w-0">
                      <p className="font-head font-extrabold text-slate-900 text-xl leading-none">
                        {resource.value}
                        <span className="text-[12px] font-bold text-slate-600 ml-1.5 align-middle">
                          {resource.label}
                        </span>
                      </p>
                      <p className="text-slate-500 text-[11px] leading-relaxed mt-1.5">{resource.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Booster strip */}
        <motion.div
          {...reveal(0.16)}
          className="mt-8 bg-white shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] border border-white/50 rounded-[24px] p-6 md:p-7 flex flex-col sm:flex-row items-start sm:items-center gap-5"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF5500] to-[#FF8C00] shadow-[3px_3px_8px_rgba(255,85,0,0.25)] flex items-center justify-center shrink-0">
            <IconZapOrange />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-head font-bold text-slate-900 text-sm tracking-tight">
              Precisou de mais no meio do ciclo? {HUB_BOOSTER.name} por R${' '}
              {formatBRLFromCents(HUB_BOOSTER.priceCents)}.
            </p>
            <p className="text-slate-500 text-[12px] leading-relaxed mt-1">
              Pacote avulso de {HUB_BOOSTER.credits} créditos, válido no ciclo vigente e disponível
              direto no Hub — contrate quantos precisar, sem mudar de plano.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white shadow-[inset_2px_2px_4px_#c8d0e7,inset_-2px_-2px_4px_#ffffff] border border-white/40 shrink-0">
            <Plus size={12} className="text-[#FF5500]" strokeWidth={3} />
            <span className="text-[11px] font-extrabold text-slate-700">
              {HUB_BOOSTER.credits} créditos · R$ {formatBRLFromCents(HUB_BOOSTER.priceCents)}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
