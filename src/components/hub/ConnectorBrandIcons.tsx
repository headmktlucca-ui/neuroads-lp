'use client';

import React from 'react';

/**
 * Ícones 3D dos conectores sem asset de marca em /public/images/connectors.
 * Estilo alinhado aos ícones 3D da página inicial: gradiente diagonal,
 * brilho de vidro, drop-shadow e sombra de base — nas cores reais da marca.
 */

type IconProps = { size?: number };

/* ─── Stripe — quadrado arredondado roxo #635BFF com "S" ─────────────── */
export function IconStripe3D({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cbi-stripe-grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8780FF" /><stop offset="1" stopColor="#4B44E0" />
        </linearGradient>
        <filter id="cbi-stripe-shadow"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#4B44E0" floodOpacity="0.35" /></filter>
      </defs>
      <rect x="7" y="7" width="34" height="34" rx="9" fill="url(#cbi-stripe-grad)" filter="url(#cbi-stripe-shadow)" />
      <ellipse cx="17" cy="13" rx="9" ry="4.5" fill="white" fillOpacity="0.25" />
      <path
        d="M24.4 20.1c-2.1-.8-3.2-1.4-3.2-2.4 0-.9.7-1.4 2-1.4 2.3 0 4.7.9 6.3 1.7l.9-5.7c-1.3-.6-3.9-1.6-7-1.6-2.5 0-4.5.6-6 1.8-1.5 1.2-2.3 3-2.3 5.1 0 3.9 2.4 5.5 6.2 6.9 2.5.9 3.3 1.5 3.3 2.5 0 1-.8 1.5-2.3 1.5-1.9 0-5-.9-7-2.1l-.9 5.8c1.7 1 4.9 2 8.2 2 2.6 0 4.8-.6 6.3-1.8 1.6-1.3 2.5-3.1 2.5-5.4 0-4-2.5-5.6-7-6.9z"
        fill="white" fillOpacity="0.95"
      />
      <ellipse cx="24" cy="44" rx="13" ry="2.5" fill="#4B44E0" fillOpacity="0.15" />
    </svg>
  );
}

/* ─── Google Calendar — folha azul Google com "31" ───────────────────── */
export function IconGoogleCalendar3D({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cbi-gcal-grad" x1="6" y1="10" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5A9BFF" /><stop offset="1" stopColor="#1967D2" />
        </linearGradient>
        <filter id="cbi-gcal-shadow"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#1967D2" floodOpacity="0.35" /></filter>
      </defs>
      <rect x="7" y="10" width="34" height="31" rx="7" fill="url(#cbi-gcal-grad)" filter="url(#cbi-gcal-shadow)" />
      {/* Argolas */}
      <rect x="14" y="5" width="3.5" height="9" rx="1.75" fill="#1451A8" />
      <rect x="30.5" y="5" width="3.5" height="9" rx="1.75" fill="#1451A8" />
      {/* Miolo branco */}
      <rect x="11.5" y="17" width="25" height="19.5" rx="4" fill="white" fillOpacity="0.94" />
      <ellipse cx="17" cy="14" rx="9" ry="3.5" fill="white" fillOpacity="0.25" />
      {/* "31" */}
      <text x="24" y="31.5" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="13" fill="#1967D2">31</text>
      <ellipse cx="24" cy="44" rx="13" ry="2.5" fill="#1967D2" fillOpacity="0.15" />
    </svg>
  );
}

/* ─── Gmail — envelope branco com "M" multicolor ─────────────────────── */
export function IconGmail3D({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cbi-gmail-grad" x1="6" y1="10" x2="42" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" /><stop offset="1" stopColor="#E8EAED" />
        </linearGradient>
        <filter id="cbi-gmail-shadow"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#B23121" floodOpacity="0.3" /></filter>
      </defs>
      {/* Corpo do envelope */}
      <rect x="6" y="11" width="36" height="27" rx="5" fill="url(#cbi-gmail-grad)" filter="url(#cbi-gmail-shadow)" />
      {/* Barras laterais */}
      <path d="M6 16 a5 5 0 0 1 5-5 h1 v27 h-1 a5 5 0 0 1-5-5 Z" fill="#4285F4" />
      <path d="M42 16 a5 5 0 0 0-5-5 h-1 v27 h1 a5 5 0 0 0 5-5 Z" fill="#34A853" />
      {/* Dobra "M" */}
      <path d="M6.5 13.5 L24 27 L41.5 13.5" stroke="#EA4335" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <ellipse cx="16" cy="14" rx="8" ry="3" fill="white" fillOpacity="0.5" />
      <ellipse cx="24" cy="42" rx="13" ry="2.5" fill="#B23121" fillOpacity="0.15" />
    </svg>
  );
}

/* ─── WhatsApp — círculo verde #25D366 com fone em balão ─────────────── */
export function IconWhatsapp3D({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cbi-wa-grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5FF08A" /><stop offset="1" stopColor="#1DA851" />
        </linearGradient>
        <filter id="cbi-wa-shadow"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#128C4B" floodOpacity="0.35" /></filter>
      </defs>
      {/* Balão redondo com rabinho */}
      <path
        d="M24 6.5c-9.7 0-17.5 7.6-17.5 17 0 3 .8 5.9 2.3 8.4L6.5 40.5l8.9-2.2c2.6 1.4 5.5 2.2 8.6 2.2 9.7 0 17.5-7.6 17.5-17s-7.8-17-17.5-17z"
        fill="url(#cbi-wa-grad)" filter="url(#cbi-wa-shadow)"
      />
      <ellipse cx="17" cy="13" rx="9" ry="4.5" fill="white" fillOpacity="0.28" />
      {/* Fone */}
      <path
        d="M18.2 15.8c-.5-1.1-1-1.1-1.4-1.1h-1.2c-.4 0-1.1.2-1.7.8-.6.6-2.2 2.1-2.2 5.2s2.3 6.1 2.6 6.5c.3.4 4.4 6.9 10.8 9.4 5.4 2.1 6.5 1.7 7.6 1.6 1.2-.1 3.7-1.5 4.2-2.9.5-1.5.5-2.7.4-2.9-.2-.3-.6-.4-1.2-.7-.6-.3-3.7-1.8-4.2-2-.6-.2-1-.3-1.4.3-.4.6-1.6 2-1.9 2.4-.4.4-.7.5-1.3.2-.6-.3-2.6-1-5-3.1-1.8-1.6-3.1-3.6-3.4-4.2-.4-.6 0-.9.3-1.2.3-.3.6-.7.9-1.1.3-.4.4-.6.6-1 .2-.4.1-.8 0-1.1-.2-.3-1.4-3.4-1.9-4.6z"
        fill="white" fillOpacity="0.96"
      />
      <ellipse cx="24" cy="44" rx="13" ry="2.5" fill="#128C4B" fillOpacity="0.15" />
    </svg>
  );
}

/* ─── Assinatura Digital — documento com caneta dourada ──────────────── */
export function IconSignature3D({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cbi-sig-doc" x1="8" y1="5" x2="34" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" /><stop offset="1" stopColor="#E4E9F2" />
        </linearGradient>
        <linearGradient id="cbi-sig-pen" x1="24" y1="20" x2="44" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFC94D" /><stop offset="1" stopColor="#B45309" />
        </linearGradient>
        <filter id="cbi-sig-shadow"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#B45309" floodOpacity="0.28" /></filter>
      </defs>
      {/* Documento */}
      <path d="M10 9 a4 4 0 0 1 4-4 h13 l8 8 v26 a4 4 0 0 1-4 4 H14 a4 4 0 0 1-4-4 Z" fill="url(#cbi-sig-doc)" filter="url(#cbi-sig-shadow)" />
      <path d="M27 5 l8 8 h-6 a2 2 0 0 1-2-2 Z" fill="#C9D2E3" />
      <ellipse cx="17" cy="10" rx="7" ry="3" fill="white" fillOpacity="0.6" />
      {/* Linhas do texto */}
      <rect x="14.5" y="18" width="14" height="2" rx="1" fill="#94A3B8" fillOpacity="0.7" />
      <rect x="14.5" y="23" width="18" height="2" rx="1" fill="#94A3B8" fillOpacity="0.55" />
      {/* Rubrica */}
      <path d="M14.5 34.5 c2.5-3.5 4-1 5.5-2.5 s2.5-2 4 0.5" stroke="#B45309" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      {/* Caneta */}
      <path d="M42 21.5 l-12.5 12.5 -4.2 1.4 1.4-4.2 L39.2 18.7 a2 2 0 0 1 2.8 0 a2 2 0 0 1 0 2.8z" fill="url(#cbi-sig-pen)" filter="url(#cbi-sig-shadow)" />
      <path d="M26.7 31.2 l2.8 2.8 -4.2 1.4z" fill="#7C3A06" />
      <ellipse cx="24" cy="44" rx="13" ry="2.5" fill="#B45309" fillOpacity="0.15" />
    </svg>
  );
}

/* ─── GTM Server — losango do Google Tag Manager ─────────────────────── */
export function IconGtmServer3D({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cbi-gtm-grad" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5A9BFF" /><stop offset="1" stopColor="#1A73E8" />
        </linearGradient>
        <linearGradient id="cbi-gtm-grad-dark" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3F7FE8" /><stop offset="1" stopColor="#174EA6" />
        </linearGradient>
        <filter id="cbi-gtm-shadow"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#174EA6" floodOpacity="0.35" /></filter>
      </defs>
      {/* Losango de trás (tag inferior) */}
      <path d="M24 14 L36.5 26.5 L24 39 L11.5 26.5 Z" fill="url(#cbi-gtm-grad-dark)" filter="url(#cbi-gtm-shadow)" />
      {/* Losango principal */}
      <path d="M24 6 L40 22 L24 38 L8 22 Z" fill="url(#cbi-gtm-grad)" filter="url(#cbi-gtm-shadow)" />
      <ellipse cx="18" cy="13" rx="8" ry="4" fill="white" fillOpacity="0.28" />
      {/* Setas de tag */}
      <path d="M20.5 16 L26.5 22 L20.5 28" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity="0.95" />
      <circle cx="29.5" cy="22" r="2.2" fill="white" fillOpacity="0.95" />
      <ellipse cx="24" cy="43.5" rx="13" ry="2.5" fill="#174EA6" fillOpacity="0.15" />
    </svg>
  );
}

/* ─── BigQuery — hexágono azul Google Cloud com lupa ─────────────────── */
export function IconBigQuery3D({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cbi-bq-grad" x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6BA8FF" /><stop offset="1" stopColor="#1967D2" />
        </linearGradient>
        <filter id="cbi-bq-shadow"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#1451A8" floodOpacity="0.35" /></filter>
      </defs>
      {/* Hexágono */}
      <path d="M24 5 L39.6 14 V32 L24 41 L8.4 32 V14 Z" fill="url(#cbi-bq-grad)" filter="url(#cbi-bq-shadow)" />
      <ellipse cx="17" cy="12" rx="8.5" ry="4" fill="white" fillOpacity="0.26" />
      {/* Lupa */}
      <circle cx="22.5" cy="21.5" r="7.5" fill="white" fillOpacity="0.2" />
      <circle cx="22.5" cy="21.5" r="6.5" stroke="white" strokeWidth="2.5" strokeOpacity="0.95" fill="none" />
      {/* Barras de dados dentro da lupa */}
      <rect x="19.4" y="21" width="2" height="4" rx="1" fill="white" fillOpacity="0.95" />
      <rect x="22.6" y="19" width="2" height="6" rx="1" fill="white" fillOpacity="0.95" />
      <rect x="25.8" y="20" width="2" height="5" rx="1" fill="white" fillOpacity="0.95" />
      {/* Cabo da lupa */}
      <path d="M27.5 26.5 L32.5 31.5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeOpacity="0.95" />
      <ellipse cx="24" cy="44.5" rx="13" ry="2.2" fill="#1451A8" fillOpacity="0.15" />
    </svg>
  );
}

/* ─── Helpdesk — headset de suporte ciano ────────────────────────────── */
export function IconHelpdesk3D({ size = 32 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cbi-help-grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4DE3F7" /><stop offset="1" stopColor="#0891B2" />
        </linearGradient>
        <filter id="cbi-help-shadow"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#0E7490" floodOpacity="0.35" /></filter>
      </defs>
      {/* Arco do headset */}
      <path d="M10 27 v-3 a14 14 0 0 1 28 0 v3" stroke="url(#cbi-help-grad)" strokeWidth="5" strokeLinecap="round" fill="none" filter="url(#cbi-help-shadow)" />
      {/* Conchas */}
      <rect x="7" y="25" width="8" height="12" rx="4" fill="url(#cbi-help-grad)" filter="url(#cbi-help-shadow)" />
      <rect x="33" y="25" width="8" height="12" rx="4" fill="url(#cbi-help-grad)" filter="url(#cbi-help-shadow)" />
      <ellipse cx="10" cy="27.5" rx="3" ry="1.6" fill="white" fillOpacity="0.35" />
      <ellipse cx="36" cy="27.5" rx="3" ry="1.6" fill="white" fillOpacity="0.35" />
      <ellipse cx="18" cy="13" rx="8" ry="3.5" fill="white" fillOpacity="0.3" />
      {/* Haste do microfone */}
      <path d="M37 37 a10 8 0 0 1-9 5 h-3" stroke="#0891B2" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="24" cy="42" r="3" fill="url(#cbi-help-grad)" filter="url(#cbi-help-shadow)" />
      <circle cx="23" cy="41" r="1" fill="white" fillOpacity="0.6" />
      <ellipse cx="24" cy="46.5" rx="13" ry="1.8" fill="#0E7490" fillOpacity="0.15" />
    </svg>
  );
}
