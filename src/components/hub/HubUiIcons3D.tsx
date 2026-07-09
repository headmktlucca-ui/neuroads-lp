'use client';

import React from 'react';

/**
 * Ícones 3D da UI do Hub (menu lateral, Configurações, Base de Conhecimento).
 * Estilo alinhado aos ícones 3D da página inicial: gradiente diagonal,
 * brilho de vidro e sombra de base — compactos para uso em navegação.
 */

type IconProps = { size?: number; className?: string };

function Svg({ size = 16, className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ flexShrink: 0 }}>
      {children}
    </svg>
  );
}

/* ─── Dashboard — mosaico de painéis laranja ─────────────────────────── */
export function IconDashboard3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-dash" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF9040" /><stop offset="1" stopColor="#E03A00" />
        </linearGradient>
      </defs>
      <rect x="6" y="6" width="17" height="22" rx="5" fill="url(#hui-dash)" />
      <rect x="26" y="6" width="16" height="13" rx="5" fill="url(#hui-dash)" opacity="0.75" />
      <rect x="26" y="22" width="16" height="20" rx="5" fill="url(#hui-dash)" />
      <rect x="6" y="31" width="17" height="11" rx="5" fill="url(#hui-dash)" opacity="0.75" />
      <ellipse cx="13" cy="10" rx="6" ry="2.5" fill="white" fillOpacity="0.3" />
      <ellipse cx="24" cy="45.5" rx="14" ry="2" fill="#E03A00" fillOpacity="0.15" />
    </Svg>
  );
}

/* ─── Agentes IA — cérebro violeta ───────────────────────────────────── */
export function IconBrain3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-brain" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B794FF" /><stop offset="1" stopColor="#6D28D9" />
        </linearGradient>
      </defs>
      <path d="M22 8c-5 0-8 3-8.5 6.5C10 15.5 8 18.5 8 22c0 2.7 1.2 5 3 6.5-.3 4.5 2.5 8.5 7.5 8.5 1.3 0 2.5-.3 3.5-.9V9c-.6-.6-1.2-1-2-1z" fill="url(#hui-brain)" />
      <path d="M26 8c5 0 8 3 8.5 6.5C38 15.5 40 18.5 40 22c0 2.7-1.2 5-3 6.5.3 4.5-2.5 8.5-7.5 8.5-1.3 0-2.5-.3-3.5-.9V9c.6-.6 1.2-1 2-1z" fill="url(#hui-brain)" opacity="0.85" />
      <line x1="24" y1="9" x2="24" y2="36" stroke="white" strokeWidth="1.6" strokeOpacity="0.5" />
      <ellipse cx="17" cy="13" rx="6" ry="2.8" fill="white" fillOpacity="0.3" />
      <ellipse cx="24" cy="42" rx="13" ry="2" fill="#6D28D9" fillOpacity="0.15" />
    </Svg>
  );
}

/* ─── Funil de Vendas — funil laranja/âmbar ──────────────────────────── */
export function IconFunnel3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-funnel" x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFC24D" /><stop offset="1" stopColor="#EA5800" />
        </linearGradient>
      </defs>
      <path d="M7 8h34l-12.5 15v14l-9 5V23Z" fill="url(#hui-funnel)" />
      <ellipse cx="17" cy="11" rx="8" ry="2.8" fill="white" fillOpacity="0.32" />
      <ellipse cx="24" cy="44.5" rx="12" ry="2" fill="#EA5800" fillOpacity="0.15" />
    </Svg>
  );
}

/* ─── Automações — engrenagem azul ───────────────────────────────────── */
export function IconAutomation3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-gearblue" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5AAEFF" /><stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <path d="M24 6 L26.5 9.5 L30.5 8.5 L31.5 12.5 L35.5 13 L35 17 L38.5 19 L37 22.5 L40 25.5 L37.5 28 L38.5 32 L35 32.5 L33.5 36 L30 35 L27 38.5 L24 36.5 L21 38.5 L18 35 L14.5 36 L13 32.5 L9.5 32 L10.5 28 L8 25.5 L11 22.5 L9.5 19 L13 17 L12.5 13 L16.5 12.5 L17.5 8.5 L21.5 9.5 Z" fill="url(#hui-gearblue)" />
      <circle cx="24" cy="23" r="6.5" fill="white" fillOpacity="0.25" />
      <circle cx="24" cy="23" r="4" fill="white" fillOpacity="0.9" />
      <ellipse cx="17" cy="12" rx="6" ry="2.8" fill="white" fillOpacity="0.3" />
      <ellipse cx="24" cy="43" rx="13" ry="2" fill="#1D4ED8" fillOpacity="0.15" />
    </Svg>
  );
}

/* ─── Oportunidades — faísca âmbar ───────────────────────────────────── */
export function IconSparkles3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-spark" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFD54D" /><stop offset="1" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <path d="M21 6 L25 18 L37 22 L25 26 L21 38 L17 26 L5 22 L17 18 Z" fill="url(#hui-spark)" />
      <path d="M36 28 L38 33 L43 35 L38 37 L36 42 L34 37 L29 35 L34 33 Z" fill="url(#hui-spark)" opacity="0.8" />
      <ellipse cx="17" cy="14" rx="5" ry="2.5" fill="white" fillOpacity="0.35" />
      <ellipse cx="24" cy="45" rx="13" ry="2" fill="#D97706" fillOpacity="0.15" />
    </Svg>
  );
}

/* ─── Integrações — plugue rosa ──────────────────────────────────────── */
export function IconPlug3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-plug" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF7AA8" /><stop offset="1" stopColor="#BE185D" />
        </linearGradient>
      </defs>
      <rect x="14" y="14" width="20" height="14" rx="6" fill="url(#hui-plug)" />
      <rect x="17.5" y="6" width="4" height="10" rx="2" fill="url(#hui-plug)" />
      <rect x="26.5" y="6" width="4" height="10" rx="2" fill="url(#hui-plug)" />
      <path d="M24 28 v5 a5 5 0 0 1-5 5 h-3" stroke="url(#hui-plug)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <ellipse cx="20" cy="17" rx="6" ry="2.4" fill="white" fillOpacity="0.32" />
      <ellipse cx="24" cy="43" rx="12" ry="2" fill="#BE185D" fillOpacity="0.15" />
    </Svg>
  );
}

/* ─── Base de Conhecimento — livro teal ──────────────────────────────── */
export function IconBook3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-book" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3EE0C8" /><stop offset="1" stopColor="#0D9488" />
        </linearGradient>
      </defs>
      <path d="M10 10 a4 4 0 0 1 4-4 h20 a4 4 0 0 1 4 4 v26 a4 4 0 0 1-4 4 H15 a5 5 0 0 1-5-5 Z" fill="url(#hui-book)" />
      <path d="M10 35 a5 5 0 0 1 5-5 h23" stroke="white" strokeWidth="2.5" strokeOpacity="0.85" fill="none" />
      <rect x="16" y="13" width="14" height="2.4" rx="1.2" fill="white" fillOpacity="0.85" />
      <rect x="16" y="19" width="10" height="2.4" rx="1.2" fill="white" fillOpacity="0.6" />
      <ellipse cx="18" cy="10" rx="7" ry="2.6" fill="white" fillOpacity="0.3" />
      <ellipse cx="24" cy="44" rx="12" ry="2" fill="#0D9488" fillOpacity="0.15" />
    </Svg>
  );
}

/* ─── Configurações — engrenagem slate ───────────────────────────────── */
export function IconGear3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-gearslate" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A9B8CC" /><stop offset="1" stopColor="#475569" />
        </linearGradient>
      </defs>
      <path d="M24 6 L26.5 9.5 L30.5 8.5 L31.5 12.5 L35.5 13 L35 17 L38.5 19 L37 22.5 L40 25.5 L37.5 28 L38.5 32 L35 32.5 L33.5 36 L30 35 L27 38.5 L24 36.5 L21 38.5 L18 35 L14.5 36 L13 32.5 L9.5 32 L10.5 28 L8 25.5 L11 22.5 L9.5 19 L13 17 L12.5 13 L16.5 12.5 L17.5 8.5 L21.5 9.5 Z" fill="url(#hui-gearslate)" />
      <circle cx="24" cy="23" r="6.5" fill="white" fillOpacity="0.25" />
      <circle cx="24" cy="23" r="4" fill="white" fillOpacity="0.9" />
      <ellipse cx="17" cy="12" rx="6" ry="2.8" fill="white" fillOpacity="0.3" />
      <ellipse cx="24" cy="43" rx="13" ry="2" fill="#475569" fillOpacity="0.15" />
    </Svg>
  );
}

/* ─── Engajamento — gráfico de barras azul ───────────────────────────── */
export function IconChart3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-chart" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38D4C0" /><stop offset="1" stopColor="#0369A1" />
        </linearGradient>
      </defs>
      <rect x="8" y="26" width="8" height="16" rx="3" fill="url(#hui-chart)" opacity="0.8" />
      <rect x="20" y="16" width="8" height="26" rx="3" fill="url(#hui-chart)" />
      <rect x="32" y="8" width="8" height="34" rx="3" fill="url(#hui-chart)" opacity="0.9" />
      <ellipse cx="36" cy="11" rx="3.4" ry="1.6" fill="white" fillOpacity="0.35" />
      <ellipse cx="24" cy="45" rx="14" ry="2" fill="#0369A1" fillOpacity="0.15" />
    </Svg>
  );
}

/* ─── Conversão — alvo verde ─────────────────────────────────────────── */
export function IconTarget3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-target" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4ADE80" /><stop offset="1" stopColor="#047857" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="17" fill="url(#hui-target)" />
      <circle cx="24" cy="24" r="11" fill="white" fillOpacity="0.28" />
      <circle cx="24" cy="24" r="10" fill="url(#hui-target)" />
      <circle cx="24" cy="24" r="4.5" fill="white" fillOpacity="0.92" />
      <ellipse cx="17" cy="15" rx="7" ry="3.4" fill="white" fillOpacity="0.28" />
      <ellipse cx="24" cy="44" rx="13" ry="2" fill="#047857" fillOpacity="0.15" />
    </Svg>
  );
}

/* ─── Retenção — setas circulares ciano ──────────────────────────────── */
export function IconRefresh3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-refresh" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4DE3F7" /><stop offset="1" stopColor="#0E7490" />
        </linearGradient>
      </defs>
      <path d="M38 22 a14 14 0 0 0-24-8" stroke="url(#hui-refresh)" strokeWidth="5.5" strokeLinecap="round" fill="none" />
      <path d="M10 26 a14 14 0 0 0 24 8" stroke="url(#hui-refresh)" strokeWidth="5.5" strokeLinecap="round" fill="none" />
      <path d="M14 6 v9 h9z" fill="url(#hui-refresh)" />
      <path d="M34 42 v-9 h-9z" fill="url(#hui-refresh)" />
      <ellipse cx="24" cy="45.5" rx="12" ry="1.8" fill="#0E7490" fillOpacity="0.15" />
    </Svg>
  );
}

/* ─── Perfil/Usuário — avatar laranja ────────────────────────────────── */
export function IconUserBadge3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-user" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF9040" /><stop offset="1" stopColor="#E03A00" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="16" r="9" fill="url(#hui-user)" />
      <path d="M8 40 a16 11 0 0 1 32 0 v2 H8 Z" fill="url(#hui-user)" opacity="0.9" />
      <ellipse cx="20" cy="11" rx="5" ry="2.6" fill="white" fillOpacity="0.35" />
      <ellipse cx="24" cy="45" rx="14" ry="2" fill="#E03A00" fillOpacity="0.15" />
    </Svg>
  );
}

/* ─── Bot/Agente — robô laranja ──────────────────────────────────────── */
export function IconBot3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-bot" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF9040" /><stop offset="1" stopColor="#E03A00" />
        </linearGradient>
      </defs>
      <rect x="9" y="14" width="30" height="22" rx="7" fill="url(#hui-bot)" />
      <circle cx="18" cy="25" r="3.4" fill="white" fillOpacity="0.95" />
      <circle cx="30" cy="25" r="3.4" fill="white" fillOpacity="0.95" />
      <rect x="17" y="31" width="14" height="2" rx="1" fill="white" fillOpacity="0.75" />
      <rect x="22.5" y="7" width="3" height="7" rx="1.5" fill="#FF9040" />
      <circle cx="24" cy="7" r="2.4" fill="#FFB380" />
      <ellipse cx="19" cy="18" rx="7" ry="3" fill="white" fillOpacity="0.28" />
      <ellipse cx="24" cy="41.5" rx="12" ry="2" fill="#E03A00" fillOpacity="0.15" />
    </Svg>
  );
}

/* ─── Chat — balão de conversa ciano ─────────────────────────────────── */
export function IconChatBubble3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-chatb" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4DE3F7" /><stop offset="1" stopColor="#0E7490" />
        </linearGradient>
      </defs>
      <path d="M24 7c-9.4 0-17 6.4-17 14.3 0 4.5 2.5 8.5 6.4 11.1L11 40.5l8.6-3.6c1.4.3 2.9.5 4.4.5 9.4 0 17-6.4 17-14.3S33.4 7 24 7z" fill="url(#hui-chatb)" />
      <circle cx="17" cy="21.5" r="2.2" fill="white" fillOpacity="0.95" />
      <circle cx="24" cy="21.5" r="2.2" fill="white" fillOpacity="0.95" />
      <circle cx="31" cy="21.5" r="2.2" fill="white" fillOpacity="0.95" />
      <ellipse cx="17" cy="12" rx="8" ry="3.2" fill="white" fillOpacity="0.28" />
      <ellipse cx="24" cy="44" rx="12" ry="2" fill="#0E7490" fillOpacity="0.15" />
    </Svg>
  );
}

/* ─── Pasta — âmbar ──────────────────────────────────────────────────── */
export function IconFolder3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-folder" x1="6" y1="8" x2="42" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFC94D" /><stop offset="1" stopColor="#C77700" />
        </linearGradient>
      </defs>
      <path d="M6 13 a4 4 0 0 1 4-4 h9 l4 5 h15 a4 4 0 0 1 4 4 v17 a4 4 0 0 1-4 4 H10 a4 4 0 0 1-4-4 Z" fill="url(#hui-folder)" />
      <path d="M6 20 h36 v15 a4 4 0 0 1-4 4 H10 a4 4 0 0 1-4-4 Z" fill="white" fillOpacity="0.18" />
      <ellipse cx="15" cy="12.5" rx="6" ry="2.2" fill="white" fillOpacity="0.32" />
      <ellipse cx="24" cy="43" rx="13" ry="2" fill="#C77700" fillOpacity="0.15" />
    </Svg>
  );
}

/* ─── Documento/Relatório — azul ─────────────────────────────────────── */
export function IconFileDoc3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-file" x1="10" y1="5" x2="38" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6BA8FF" /><stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <path d="M11 9 a4 4 0 0 1 4-4 h13 l9 9 v25 a4 4 0 0 1-4 4 H15 a4 4 0 0 1-4-4 Z" fill="url(#hui-file)" />
      <path d="M28 5 l9 9 h-7 a2 2 0 0 1-2-2 Z" fill="white" fillOpacity="0.45" />
      <rect x="16" y="21" width="14" height="2.4" rx="1.2" fill="white" fillOpacity="0.85" />
      <rect x="16" y="27" width="16" height="2.4" rx="1.2" fill="white" fillOpacity="0.65" />
      <rect x="16" y="33" width="10" height="2.4" rx="1.2" fill="white" fillOpacity="0.5" />
      <ellipse cx="18" cy="9.5" rx="5" ry="2.2" fill="white" fillOpacity="0.3" />
      <ellipse cx="24" cy="45" rx="12" ry="2" fill="#1D4ED8" fillOpacity="0.15" />
    </Svg>
  );
}
