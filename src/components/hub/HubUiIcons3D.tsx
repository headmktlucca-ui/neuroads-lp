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

/* ─── Ads — megafone laranja-vermelho ────────────────────────────────── */
export function IconAds3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-ads" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF9040" /><stop offset="1" stopColor="#C83200" />
        </linearGradient>
        <linearGradient id="hui-ads-bell" x1="30" y1="28" x2="44" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFB870" /><stop offset="1" stopColor="#E04A00" />
        </linearGradient>
      </defs>
      {/* Megafone corpo principal */}
      <path d="M10 18 h6 l18-10 v28 L16 26 h-6 a4 4 0 0 1-4-4 v-0 a4 4 0 0 1 4-4z" fill="url(#hui-ads)" />
      {/* Bocal */}
      <path d="M34 36 a10 10 0 0 0 0-20" stroke="url(#hui-ads)" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.75" />
      <path d="M34 30 a4 4 0 0 0 0-8" stroke="url(#hui-ads)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      {/* Cabo */}
      <rect x="12" y="26" width="6" height="9" rx="2" fill="url(#hui-ads)" opacity="0.85" />
      {/* Brilho de vidro */}
      <ellipse cx="18" cy="14" rx="7" ry="2.8" fill="white" fillOpacity="0.32" />
      {/* Sombra base */}
      <ellipse cx="24" cy="45" rx="13" ry="2" fill="#C83200" fillOpacity="0.15" />
    </Svg>
  );
}

/* ─── Redes Sociais — nós conectados índigo-violeta ─────────────────── */
export function IconSocial3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-social" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A78BFA" /><stop offset="1" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      {/* Linhas de conexão */}
      <line x1="24" y1="24" x2="10" y2="12" stroke="url(#hui-social)" strokeWidth="3.5" strokeLinecap="round" opacity="0.7" />
      <line x1="24" y1="24" x2="38" y2="12" stroke="url(#hui-social)" strokeWidth="3.5" strokeLinecap="round" opacity="0.7" />
      <line x1="24" y1="24" x2="10" y2="38" stroke="url(#hui-social)" strokeWidth="3.5" strokeLinecap="round" opacity="0.55" />
      <line x1="24" y1="24" x2="38" y2="38" stroke="url(#hui-social)" strokeWidth="3.5" strokeLinecap="round" opacity="0.55" />
      <line x1="10" y1="12" x2="38" y2="12" stroke="url(#hui-social)" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />
      <line x1="10" y1="38" x2="38" y2="38" stroke="url(#hui-social)" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />
      {/* Nó central */}
      <circle cx="24" cy="24" r="6.5" fill="url(#hui-social)" />
      <circle cx="24" cy="24" r="3.5" fill="white" fillOpacity="0.9" />
      {/* Nós satélites */}
      <circle cx="10" cy="12" r="4.5" fill="url(#hui-social)" opacity="0.9" />
      <circle cx="38" cy="12" r="4.5" fill="url(#hui-social)" />
      <circle cx="10" cy="38" r="3.5" fill="url(#hui-social)" opacity="0.7" />
      <circle cx="38" cy="38" r="3.5" fill="url(#hui-social)" opacity="0.8" />
      {/* Brilho de vidro no nó principal */}
      <ellipse cx="20" cy="20" rx="5" ry="2.4" fill="white" fillOpacity="0.32" />
      {/* Sombra base */}
      <ellipse cx="24" cy="45" rx="13" ry="2" fill="#4F46E5" fillOpacity="0.15" />
    </Svg>
  );
}

/* ─── KPI: Seguidores Totais (Pessoas) ─────────────────────────── */
export function IconFollowers3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-followers" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF9A55" /><stop offset="1" stopColor="#E63E00" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="14" r="7" fill="url(#hui-followers)" />
      <path d="M12 36C12 29.3726 17.3726 24 24 24C30.6274 24 36 29.3726 36 36V38H12V36Z" fill="url(#hui-followers)" />
      <circle cx="12" cy="18" r="5" fill="url(#hui-followers)" opacity="0.6" />
      <path d="M5 36C5 31.5817 8.58172 28 13 28H15V38H5V36Z" fill="url(#hui-followers)" opacity="0.6" />
      <circle cx="36" cy="18" r="5" fill="url(#hui-followers)" opacity="0.6" />
      <path d="M43 36C43 31.5817 39.4183 28 35 28H33V38H43V36Z" fill="url(#hui-followers)" opacity="0.6" />
      <ellipse cx="21" cy="11" rx="4" ry="2" fill="white" fillOpacity="0.3" />
      <ellipse cx="20" cy="27" rx="6" ry="2" fill="white" fillOpacity="0.2" />
      <ellipse cx="24" cy="45" rx="14" ry="2" fill="#E63E00" fillOpacity="0.15" />
    </Svg>
  );
}

/* ─── KPI: Alcance Médio (Olho) ─────────────────────────── */
export function IconReach3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-reach" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5AAEFF" /><stop offset="1" stopColor="#1240B8" />
        </linearGradient>
      </defs>
      <path d="M24 10C14 10 6 24 6 24C6 24 14 38 24 38C34 38 42 24 42 24C42 24 34 10 24 10Z" fill="url(#hui-reach)" />
      <circle cx="24" cy="24" r="9" fill="white" fillOpacity="0.95" />
      <circle cx="24" cy="24" r="5" fill="url(#hui-reach)" />
      <ellipse cx="22" cy="22" rx="2" ry="1" fill="white" />
      <ellipse cx="18" cy="15" rx="8" ry="3" fill="white" fillOpacity="0.3" transform="rotate(-15 18 15)" />
      <ellipse cx="24" cy="45" rx="14" ry="2" fill="#1240B8" fillOpacity="0.15" />
    </Svg>
  );
}

/* ─── KPI: Curtidas / Reações (Coração) ─────────────────────────── */
export function IconLikes3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-likes" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F472B6" /><stop offset="1" stopColor="#BE185D" />
        </linearGradient>
      </defs>
      <path d="M24 41.5L21.1 38.8C10.8 29.5 4 23.3 4 15.5C4 9.2 8.9 4.2 15 4.2C18.5 4.2 21.8 5.8 24 8.3C26.2 5.8 29.5 4.2 33 4.2C39.1 4.2 44 9.2 44 15.5C44 23.3 37.2 29.5 26.9 38.9L24 41.5Z" fill="url(#hui-likes)" />
      <ellipse cx="15" cy="10" rx="6" ry="3" fill="white" fillOpacity="0.35" transform="rotate(-25 15 10)" />
      <ellipse cx="24" cy="45" rx="14" ry="2" fill="#BE185D" fillOpacity="0.15" />
    </Svg>
  );
}

/* ─── KPI: Engajamento (Gráfico com seta) ─────────────────────────── */
export function IconEngagement3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-engagement" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3EE59A" /><stop offset="1" stopColor="#036C4A" />
        </linearGradient>
      </defs>
      <rect x="6" y="26" width="8" height="14" rx="2" fill="url(#hui-engagement)" opacity="0.6" />
      <rect x="18" y="16" width="8" height="24" rx="2" fill="url(#hui-engagement)" opacity="0.8" />
      <rect x="30" y="8" width="8" height="32" rx="2" fill="url(#hui-engagement)" />
      <path d="M42 6 L32 6 L32 16 L35.5 12.5 L24 24 L16 16 L4 28" stroke="url(#hui-engagement)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <polygon points="42,6 32,6 42,16" fill="url(#hui-engagement)" />
      <ellipse cx="34" cy="12" rx="3" ry="1.5" fill="white" fillOpacity="0.4" />
      <ellipse cx="22" cy="18" rx="3" ry="1.5" fill="white" fillOpacity="0.3" />
      <ellipse cx="24" cy="45" rx="14" ry="2" fill="#036C4A" fillOpacity="0.15" />
    </Svg>
  );
}

/* ─── KPI: Receita Total (Carteira 3D Teal) ────────────────────────── */
export function IconWallet3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-wallet" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" /><stop offset="1" stopColor="#0D9488" />
        </linearGradient>
        <linearGradient id="hui-coin-w" x1="26" y1="6" x2="38" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE047" /><stop offset="1" stopColor="#CA8A04" />
        </linearGradient>
      </defs>
      <circle cx="33" cy="13" r="7" fill="url(#hui-coin-w)" />
      <text x="33" y="16" fontSize="8" fontWeight="bold" fill="#713F12" textAnchor="middle">R$</text>
      <rect x="6" y="14" width="34" height="24" rx="6" fill="url(#hui-wallet)" />
      <path d="M6 14 H36 A4 4 0 0 1 40 18 V22 H6 Z" fill="white" fillOpacity="0.2" />
      <path d="M28 20 h10 a4 4 0 0 1 4 4 v4 a4 4 0 0 1-4 4 H28 Z" fill="url(#hui-wallet)" />
      <circle cx="34" cy="26" r="2.5" fill="#FDE047" />
      <ellipse cx="18" cy="18" rx="8" ry="3" fill="white" fillOpacity="0.32" />
      <ellipse cx="24" cy="44" rx="14" ry="2" fill="#0D9488" fillOpacity="0.18" />
    </Svg>
  );
}

/* ─── KPI: ROAS Médio (Crescimento 3D Laranja) ──────────────────── */
export function IconTrending3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-trend" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF9040" /><stop offset="1" stopColor="#EA5800" />
        </linearGradient>
      </defs>
      <path d="M6 34 L18 20 L26 27 L40 10 L40 22 L40 10 L28 10" stroke="url(#hui-trend)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M6 34 L18 20 L26 27 L40 10 L40 22 L40 10 L28 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.4" fill="none" />
      <polygon points="40,10 28,10 40,22" fill="url(#hui-trend)" />
      <ellipse cx="16" cy="15" rx="5" ry="2.2" fill="white" fillOpacity="0.35" />
      <ellipse cx="24" cy="44" rx="14" ry="2" fill="#EA5800" fillOpacity="0.18" />
    </Svg>
  );
}

/* ─── KPI: Conversões (Carrinho 3D Verde) ────────────────────────── */
export function IconCart3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-cart" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2DD4BF" /><stop offset="1" stopColor="#0F766E" />
        </linearGradient>
      </defs>
      <path d="M6 10 h6 l5 18 h19 l4-13 H15" stroke="url(#hui-cart)" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="19" cy="37" r="3.5" fill="url(#hui-cart)" />
      <circle cx="34" cy="37" r="3.5" fill="url(#hui-cart)" />
      <circle cx="19" cy="37" r="1.5" fill="white" />
      <circle cx="34" cy="37" r="1.5" fill="white" />
      <ellipse cx="22" cy="18" rx="6" ry="2.5" fill="white" fillOpacity="0.35" />
      <ellipse cx="24" cy="45" rx="14" ry="2" fill="#0F766E" fillOpacity="0.18" />
    </Svg>
  );
}

/* ─── KPI: CPA Médio / Cliques (Ponteiro 3D Âmbar) ───────────────── */
export function IconClick3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-click" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FBBF24" /><stop offset="1" stopColor="#D97706" />
        </linearGradient>
      </defs>
      <circle cx="28" cy="14" r="8" stroke="url(#hui-click)" strokeWidth="2" fill="none" opacity="0.4" />
      <circle cx="28" cy="14" r="4" stroke="url(#hui-click)" strokeWidth="2" fill="none" opacity="0.7" />
      <path d="M12 8 L30 24 L21 26 L27 38 L22 40 L16 28 L9 33 Z" fill="url(#hui-click)" />
      <ellipse cx="17" cy="14" rx="4" ry="2" fill="white" fillOpacity="0.4" />
      <ellipse cx="24" cy="45" rx="13" ry="2" fill="#D97706" fillOpacity="0.18" />
    </Svg>
  );
}

/* ─── KPI: CTR Médio (Atividade 3D Ciano) ────────────────────────── */
export function IconActivity3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-act" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" /><stop offset="1" stopColor="#0284C7" />
        </linearGradient>
      </defs>
      <path d="M6 24 H14 L19 10 L27 36 L33 18 L37 24 H42" stroke="url(#hui-act)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="19" cy="10" r="3" fill="#38BDF8" />
      <circle cx="27" cy="36" r="3" fill="#0284C7" />
      <circle cx="33" cy="18" r="3" fill="#38BDF8" />
      <ellipse cx="18" cy="14" rx="5" ry="2" fill="white" fillOpacity="0.35" />
      <ellipse cx="24" cy="45" rx="14" ry="2" fill="#0284C7" fillOpacity="0.18" />
    </Svg>
  );
}

/* ─── KPI: CPC Médio (Moeda 3D Rosa) ─────────────────────────────── */
export function IconCoin3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-coinrose" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F472B6" /><stop offset="1" stopColor="#DB2777" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="17" fill="url(#hui-coinrose)" />
      <circle cx="24" cy="24" r="13" fill="white" fillOpacity="0.2" />
      <text x="24" y="31" fontSize="20" fontWeight="900" fill="white" textAnchor="middle">$</text>
      <ellipse cx="17" cy="13" rx="7" ry="3.2" fill="white" fillOpacity="0.35" />
      <ellipse cx="24" cy="44" rx="13" ry="2" fill="#DB2777" fillOpacity="0.18" />
    </Svg>
  );
}

/* ─── KPI: Agentes da Equipe (Usuários 3D Laranja) ──────────────── */
export function IconUsers3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-users-orange" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF9A55" /><stop offset="1" stopColor="#E63E00" />
        </linearGradient>
      </defs>
      {/* Usuário secundário esquerda */}
      <circle cx="13" cy="17" r="5" fill="url(#hui-users-orange)" opacity="0.65" />
      <path d="M5 35c0-4.5 3.5-8 8-8h2v10H5z" fill="url(#hui-users-orange)" opacity="0.65" />
      {/* Usuário secundário direita */}
      <circle cx="35" cy="17" r="5" fill="url(#hui-users-orange)" opacity="0.7" />
      <path d="M35 27h2c4.5 0 8 3.5 8 8v2H35V27z" fill="url(#hui-users-orange)" opacity="0.7" />
      {/* Usuário principal centro */}
      <circle cx="24" cy="14" r="7.5" fill="url(#hui-users-orange)" />
      <path d="M11 37c0-6.6 5.4-12 13-12s13 5.4 13 12v1H11v-1z" fill="url(#hui-users-orange)" />
      {/* Brilhos de vidro */}
      <ellipse cx="21" cy="11" rx="4" ry="2" fill="white" fillOpacity="0.35" />
      <ellipse cx="20" cy="28" rx="6" ry="2" fill="white" fillOpacity="0.25" />
      {/* Sombra de base */}
      <ellipse cx="24" cy="45" rx="14" ry="2" fill="#E63E00" fillOpacity="0.18" />
    </Svg>
  );
}

/* ─── KPI: Raio / Online Agora / Ativas (Zap 3D Verde) ──────────── */
export function IconZap3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-zap-green" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3EE59A" /><stop offset="1" stopColor="#036C4A" />
        </linearGradient>
        <linearGradient id="hui-zap-shine" x1="12" y1="6" x2="32" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.6" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {/* Extrusão 3D de sombra */}
      <path d="M26 5 L11 25 h9 L14 43 L36 21 h-9 L32 5 Z" fill="#01402B" opacity="0.5" />
      {/* Raio principal */}
      <path d="M25 4 L10 24 h9 L13 42 L35 20 h-9 L31 4 Z" fill="url(#hui-zap-green)" />
      {/* Brilho superior */}
      <path d="M25 4 L10 24 h9 L13 42 L35 20 h-9 L31 4 Z" fill="url(#hui-zap-shine)" />
      <ellipse cx="21" cy="11" rx="4" ry="2" fill="white" fillOpacity="0.4" transform="rotate(-20 21 11)" />
      {/* Partículas de energia */}
      <circle cx="9" cy="14" r="2" fill="#7DFFC3" />
      <circle cx="37" cy="32" r="1.5" fill="#7DFFC3" />
      {/* Sombra de base */}
      <ellipse cx="24" cy="45" rx="13" ry="2" fill="#036C4A" fillOpacity="0.2" />
    </Svg>
  );
}

/* ─── KPI: SLA / Top Categoria (Faíscas 3D Violeta/Roxo) ────────── */
export function IconSparklesPurple3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-spark-purple" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C495FF" /><stop offset="1" stopColor="#54189E" />
        </linearGradient>
        <linearGradient id="hui-spark-purp-glow" x1="10" y1="10" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E2C7FF" /><stop offset="1" stopColor="#8A3BE0" />
        </linearGradient>
      </defs>
      {/* Estrela 3D principal */}
      <path d="M24 4 L28 17 L41 21 L28 25 L24 38 L20 25 L7 21 L20 17 Z" fill="url(#hui-spark-purple)" />
      {/* Facetas de luz 3D */}
      <path d="M24 4 L28 17 L24 21 L20 17 Z" fill="url(#hui-spark-purp-glow)" />
      <path d="M24 21 L28 25 L24 38 L20 25 Z" fill="url(#hui-spark-purple)" opacity="0.8" />
      {/* Estrela 3D secundária */}
      <path d="M36 26 L38 31 L43 33 L38 35 L36 40 L34 35 L29 33 L34 31 Z" fill="url(#hui-spark-purple)" opacity="0.9" />
      {/* Estrela 3D menor */}
      <path d="M12 30 L13.5 33.5 L17 35 L13.5 36.5 L12 40 L10.5 36.5 L7 35 L10.5 33.5 Z" fill="#DDB8FF" opacity="0.8" />
      {/* Brilho de vidro */}
      <ellipse cx="24" cy="13" rx="3.5" ry="1.8" fill="white" fillOpacity="0.45" />
      {/* Sombra de base */}
      <ellipse cx="24" cy="44" rx="14" ry="2" fill="#54189E" fillOpacity="0.2" />
    </Svg>
  );
}

/* ─── KPI: Criativos / Processador (CPU 3D Laranja) ──────────────── */
export function IconCpu3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-cpu-orange" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF9A55" /><stop offset="1" stopColor="#E63E00" />
        </linearGradient>
        <linearGradient id="hui-cpu-gold" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FFE082" /><stop offset="1" stopColor="#FFB300" />
        </linearGradient>
      </defs>
      {/* Pinos dourados externos */}
      <path d="M14 6 h3 v4 h-3 z M22.5 6 h3 v4 h-3 z M31 6 h3 v4 h-3 z" fill="url(#hui-cpu-gold)" />
      <path d="M14 38 h3 v4 h-3 z M22.5 38 h3 v4 h-3 z M31 38 h3 v4 h-3 z" fill="url(#hui-cpu-gold)" />
      <path d="M6 14 h4 v3 h-4 z M6 22.5 h4 v3 h-4 z M6 31 h4 v3 h-4 z" fill="url(#hui-cpu-gold)" />
      <path d="M38 14 h4 v3 h-4 z M38 22.5 h4 v3 h-4 z M38 31 h4 v3 h-4 z" fill="url(#hui-cpu-gold)" />

      {/* Corpo principal do chip 3D */}
      <rect x="9" y="9" width="30" height="30" rx="6" fill="url(#hui-cpu-orange)" />
      {/* Moldura metálica interna */}
      <rect x="15" y="15" width="18" height="18" rx="4" fill="#992600" />
      {/* Núcleo de silício */}
      <rect x="18" y="18" width="12" height="12" rx="2.5" fill="#FFE5D6" fillOpacity="0.9" />
      <rect x="21" y="21" width="6" height="6" rx="1.5" fill="#E63E00" />

      {/* Brilhos de vidro */}
      <ellipse cx="20" cy="14" rx="7" ry="2.8" fill="white" fillOpacity="0.35" />
      {/* Sombra de base */}
      <ellipse cx="24" cy="44" rx="13" ry="2" fill="#E63E00" fillOpacity="0.2" />
    </Svg>
  );
}

/* ─── WhatsApp — balão de conversa 3D verde com fone ──────────────── */
export function IconWhatsapp3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-wa-green" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#25D366" /><stop offset="1" stopColor="#0B8043" />
        </linearGradient>
        <linearGradient id="hui-wa-shine" x1="10" y1="8" x2="30" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
        </linearGradient>
      </defs>
      {/* Sombra de projeção 3D */}
      <path d="M24 6c-9.5 0-17.2 6.8-17.2 15.2 0 4.8 2.5 9 6.5 11.8L11 41l8.7-3.8c1.4.3 2.9.5 4.3.5 9.5 0 17.2-6.8 17.2-15.2S33.5 6 24 6z" fill="#054D27" opacity="0.4" transform="translate(1, 2)" />
      {/* Balão WhatsApp 3D principal */}
      <path d="M24 6c-9.5 0-17.2 6.8-17.2 15.2 0 4.8 2.5 9 6.5 11.8L11 41l8.7-3.8c1.4.3 2.9.5 4.3.5 9.5 0 17.2-6.8 17.2-15.2S33.5 6 24 6z" fill="url(#hui-wa-green)" />
      {/* Brilho superior de vidro */}
      <path d="M24 6c-9.5 0-17.2 6.8-17.2 15.2 0 4.8 2.5 9 6.5 11.8L11 41l8.7-3.8c1.4.3 2.9.5 4.3.5 9.5 0 17.2-6.8 17.2-15.2S33.5 6 24 6z" fill="url(#hui-wa-shine)" />
      {/* Ícone de Telefone / Headset branco dentro */}
      <path d="M17.5 15.2c-.4-.9-.9-.9-1.3-.9h-1.1c-.4 0-1.1.2-1.7.8s-2.1 2.1-2.1 5.1 2.2 5.9 2.5 6.3c.3.4 4.3 6.6 10.4 9.2 1.4.6 2.6 1 3.5 1.3 1.5.5 2.8.4 3.9.2 1.2-.2 3.7-1.5 4.2-3s.5-2.8.4-3c-.1-.2-.5-.4-1.1-.7s-3.7-1.8-4.3-2c-.6-.2-1-.3-1.4.3s-1.6 2-2 2.4c-.4.4-.8.5-1.4.2-.6-.3-2.5-.9-4.8-3-1.8-1.6-3-3.6-3.4-4.2-.4-.6 0-.9.3-1.2.3-.3.6-.7.9-1.1.3-.4.4-.7.6-1.1.2-.4.1-.8 0-1.1-.1-.3-.9-2.3-1.3-3.1z" fill="white" fillOpacity="0.95" />
      {/* Reflexo de brilho curvo */}
      <ellipse cx="18" cy="11" rx="7" ry="2.6" fill="white" fillOpacity="0.32" />
      {/* Sombra de base */}
      <ellipse cx="24" cy="45" rx="14" ry="2" fill="#054D27" fillOpacity="0.2" />
    </Svg>
  );
}

/* ─── Redes Sociais — Nós de conexão 3D Laranja ───────────────────── */
export function IconSocialMedia3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-social-orange" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF9A55" /><stop offset="1" stopColor="#E63E00" />
        </linearGradient>
        <linearGradient id="hui-social-shine" x1="10" y1="8" x2="30" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.65" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Sombras de extrusão 3D das hastes de conexão */}
      <line x1="14" y1="24" x2="34" y2="12" stroke="#601000" strokeWidth="5" strokeLinecap="round" opacity="0.35" />
      <line x1="14" y1="24" x2="34" y2="36" stroke="#601000" strokeWidth="5" strokeLinecap="round" opacity="0.35" />

      {/* Hastes de conexão 3D */}
      <line x1="14" y1="24" x2="34" y2="12" stroke="url(#hui-social-orange)" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="14" y1="24" x2="34" y2="36" stroke="url(#hui-social-orange)" strokeWidth="4.5" strokeLinecap="round" />

      {/* Nó principal esquerda 3D */}
      <circle cx="14" cy="24" r="9" fill="url(#hui-social-orange)" />
      <circle cx="14" cy="24" r="9" fill="url(#hui-social-shine)" />
      <circle cx="14" cy="24" r="4.5" fill="white" fillOpacity="0.85" />
      <ellipse cx="12" cy="19" rx="3.5" ry="1.8" fill="white" fillOpacity="0.5" />

      {/* Nó superior direita 3D */}
      <circle cx="34" cy="12" r="7" fill="url(#hui-social-orange)" />
      <circle cx="34" cy="12" r="7" fill="url(#hui-social-shine)" />
      <circle cx="34" cy="12" r="3.2" fill="white" fillOpacity="0.85" />
      <ellipse cx="32" cy="9" rx="2.5" ry="1.3" fill="white" fillOpacity="0.5" />

      {/* Nó inferior direita 3D */}
      <circle cx="34" cy="36" r="7" fill="url(#hui-social-orange)" />
      <circle cx="34" cy="36" r="7" fill="url(#hui-social-shine)" />
      <circle cx="34" cy="36" r="3.2" fill="white" fillOpacity="0.85" />
      <ellipse cx="32" cy="33" rx="2.5" ry="1.3" fill="white" fillOpacity="0.5" />

      {/* Sombra de base */}
      <ellipse cx="24" cy="45" rx="14" ry="2" fill="#E63E00" fillOpacity="0.22" />
    </Svg>
  );
}

/* ─── Campanhas Patrocinadas / Ads — Megafone 3D Laranja ───────────── */
export function IconMegaphone3D(p: IconProps) {
  return (
    <Svg {...p}>
      <defs>
        <linearGradient id="hui-mega-orange" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF9A55" /><stop offset="1" stopColor="#E63E00" />
        </linearGradient>
        <linearGradient id="hui-mega-shine" x1="10" y1="8" x2="30" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.65" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.0" />
        </linearGradient>
      </defs>

      {/* Sombra de projeção 3D do cabo e cone */}
      <path d="M12 18 L28 10 L34 26 L12 28 Z" fill="#601000" opacity="0.3" transform="translate(1, 2)" />
      <path d="M16 28 L14 38 L20 37 L20 28 Z" fill="#601000" opacity="0.3" transform="translate(1, 2)" />

      {/* Cabo do megafone 3D */}
      <path d="M16 27 L14 37 L20 36 L20 27 Z" fill="url(#hui-mega-orange)" />
      <rect x="15" y="27" width="5" height="10" rx="2" fill="white" fillOpacity="0.3" />

      {/* Cone principal 3D */}
      <path d="M11 17 L28 9 L33 25 L11 27 Z" fill="url(#hui-mega-orange)" />
      <path d="M11 17 L28 9 L33 25 L11 27 Z" fill="url(#hui-mega-shine)" />

      {/* Abertura traseira 3D */}
      <ellipse cx="11" cy="22" rx="3.5" ry="5" fill="#992600" />
      <ellipse cx="11" cy="22" rx="2" ry="3.5" fill="#FFE5D6" fillOpacity="0.9" />

      {/* Anel da boca frontal 3D */}
      <ellipse cx="30.5" cy="17" rx="4.5" ry="8" fill="url(#hui-mega-orange)" />
      <ellipse cx="30.5" cy="17" rx="4.5" ry="8" fill="url(#hui-mega-shine)" />
      <ellipse cx="29.5" cy="14" rx="2" ry="4" fill="white" fillOpacity="0.5" />

      {/* Ondas de som / emissão 3D */}
      <path d="M37 11 A10 10 0 0 1 37 23" stroke="#FF9A55" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M42 7 A16 16 0 0 1 42 27" stroke="url(#hui-mega-orange)" strokeWidth="3.5" strokeLinecap="round" fill="none" />

      {/* Sombra de base */}
      <ellipse cx="24" cy="45" rx="14" ry="2" fill="#E63E00" fillOpacity="0.2" />
    </Svg>
  );
}




