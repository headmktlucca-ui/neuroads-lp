'use client';

import React from 'react';

/**
 * Neumorphic 3D Squircle Button Layout & Custom Dark Vector Icons
 * Estilo alinhado perfeitamente aos botões 3D em relevo suave (Neumorphism / Skeuomorphic-flat)
 * com silhueta sólida em azul escuro (#1e293b) e iluminação especular.
 */

type IconProps = { size?: number; className?: string };

/* ─── Neumorphic Tile Wrapper Component ───────────────────────────── */
type NeumorphicTileProps = {
  children: React.ReactNode;
  isActive?: boolean;
  isDark?: boolean;
  size?: 'sm' | 'md' | 'card' | 'lg';
  className?: string;
};

export function NeumorphicTileIcon({
  children,
  isActive = false,
  size = 'md',
  className = '',
}: NeumorphicTileProps) {
  const dimensions =
    size === 'sm'
      ? 'w-5.5 h-5.5 rounded-[7px]'
      : size === 'card'
      ? 'w-10 h-10 rounded-xl'
      : size === 'lg'
      ? 'w-11 h-11 rounded-2xl'
      : 'w-6.5 h-6.5 rounded-lg';

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-108 group-hover:-translate-y-0.5 ${dimensions} ${className}`}
      style={{
        background: isActive
          ? 'linear-gradient(135deg, #FF6A00 0%, #FF8805 100%)'
          : 'linear-gradient(145deg, #ffffff 0%, #e2e8f5 100%)',
        border: isActive
          ? '1px solid rgba(255, 255, 255, 0.4)'
          : '1px solid rgba(255, 255, 255, 0.95)',
        boxShadow: isActive
          ? '0 4px 14px rgba(255, 106, 0, 0.45), 0 2px 4px rgba(0, 0, 0, 0.15)'
          : '3px 5px 10px rgba(150, 165, 185, 0.45), -2px -2px 6px rgba(255, 255, 255, 0.95)',
      }}
    >
      {/* Top-left specular highlight reflection */}
      <div className="absolute inset-0 rounded-[inherit] pointer-events-none bg-gradient-to-br from-white/60 via-transparent to-transparent opacity-90" />

      {/* Vector Icon */}
      <div className={`relative z-10 transition-colors duration-200 ${isActive ? 'text-white' : 'text-[#1e293b]'}`}>
        {children}
      </div>
    </div>
  );
}

function Svg({ size = 18, className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className} style={{ flexShrink: 0 }}>
      {children}
    </svg>
  );
}

/* ─── 1. Dashboard ──────────────────────────────────────────────────── */
export function IconNeuDashboard(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="3" width="8" height="10" rx="2" />
      <rect x="13" y="3" width="8" height="6" rx="2" />
      <rect x="13" y="11" width="8" height="10" rx="2" />
      <rect x="3" y="15" width="8" height="6" rx="2" />
    </Svg>
  );
}

/* ─── 2. Oportunidades / Sparkles ────────────────────────────────────── */
export function IconNeuOpportunities(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
      <path d="M19 17L20.2 20.8L24 22L20.2 23.2L19 27L17.8 23.2L14 22L17.8 20.8L19 17Z" opacity="0.8" />
    </Svg>
  );
}

/* ─── 3. Agentes IA / Cérebro ────────────────────────────────────────── */
export function IconNeuBrain(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 3C8.13 3 5 6.13 5 10C5 12.38 6.19 14.47 8 15.74V18C8 18.55 8.45 19 9 19H15C15.55 19 16 18.55 16 18V15.74C17.81 14.47 19 12.38 19 10C19 6.13 15.87 3 12 3ZM10 21H14V22H10V21ZM9.5 12C8.67 12 8 11.33 8 10.5C8 9.67 8.67 9 9.5 9C10.33 9 11 9.67 11 10.5C11 11.33 10.33 12 9.5 12ZM14.5 12C13.67 12 13 11.33 13 10.5C13 9.67 13.67 9 14.5 9C15.33 9 16 9.67 16 10.5C16 11.33 15.33 12 14.5 12Z" />
    </Svg>
  );
}

/* ─── 4. Atração (Imã) ───────────────────────────────────────────────── */
export function IconNeuAttraction(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 4V11C5 14.87 8.13 18 12 18C15.87 18 19 14.87 19 11V4H14V11C14 12.1 13.1 13 12 13C10.9 13 10 12.1 10 11V4H5ZM5 4H9V8H5V4ZM15 4H19V8H15V4Z" />
      <path d="M12 20L15 23H9L12 20Z" />
    </Svg>
  );
}

/* ─── 5. Engajamento (Coração / Pulso) ───────────────────────────────── */
export function IconNeuEngagement(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" />
    </Svg>
  );
}

/* ─── 6. Conversão (Alvo / Target) ──────────────────────────────────── */
export function IconNeuConversion(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C15.31 6 18 8.69 18 12C18 15.31 15.31 18 12 18ZM12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8ZM12 10C13.1 10 14 10.9 14 12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12C10 10.9 10.9 10 12 10Z" />
    </Svg>
  );
}

/* ─── 7. Retenção (Shield / Escudo de Retenção) ─────────────────────── */
export function IconNeuRetention(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM12 11.99H19C18.47 15.82 15.72 19.38 12 20.93V12H5V6.3L12 3.19V11.99Z" />
    </Svg>
  );
}

/* ─── 8. WhatsApp ───────────────────────────────────────────────────── */
export function IconNeuWhatsapp(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 2C6.48 2 2 6.48 2 12C2 13.81 2.49 15.5 3.34 16.97L2 22L7.17 20.65C8.61 21.5 10.25 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.6 15.34C16.41 15.87 15.53 16.32 14.96 16.41C14.45 16.49 13.79 16.53 11.53 15.59C8.65 14.39 6.79 11.47 6.64 11.27C6.5 11.08 5.47 9.71 5.47 8.29C5.47 6.87 6.19 6.17 6.48 5.88C6.72 5.64 7.05 5.53 7.39 5.53C7.5 5.53 7.6 5.53 7.69 5.54C7.96 5.55 8.09 5.57 8.27 6C8.49 6.53 9.03 7.85 9.1 7.98C9.17 8.12 9.22 8.29 9.13 8.46C9.04 8.64 8.98 8.72 8.84 8.88C8.7 9.04 8.57 9.17 8.43 9.33C8.3 9.47 8.15 9.62 8.31 9.89C8.47 10.16 9.02 11.06 9.83 11.78C10.87 12.71 11.72 13.01 12.02 13.13C12.26 13.23 12.44 13.21 12.58 13.05C12.76 12.84 13.03 12.47 13.26 12.14C13.43 11.9 13.64 11.87 13.88 11.96C14.12 12.04 15.41 12.68 15.68 12.81C15.95 12.95 16.12 13.02 16.19 13.14C16.26 13.26 16.26 13.85 16.6 15.34Z" />
    </Svg>
  );
}

/* ─── 9. CRM (Funil de Vendas) ───────────────────────────────────────── */
export function IconNeuCRM(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 4C3 3.45 3.45 3 4 3H20C20.55 3 21 3.45 21 4V6C21 6.55 20.55 7 20 7H4C3.45 7 3 6.55 3 6V4ZM5 9C4.45 9 4 9.45 4 10V12C4 12.55 4.45 13 5 13H19C19.55 13 20 12.55 20 12V10C20 9.45 19.55 9 19 9H5ZM8 15C7.45 15 7 15.45 7 16V18C7 18.55 7.45 19 8 19H16C16.55 19 17 18.55 17 18V16C17 15.45 16.55 15 16 15H8Z" />
    </Svg>
  );
}

/* ─── 10. Ads (Megafone) ────────────────────────────────────────────── */
export function IconNeuAds(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M18 11C18 8.44 16.54 6.22 14.41 5.17L12.58 3.34C11.95 2.71 10.9 3.16 10.9 4.05V19.95C10.9 20.84 11.95 21.29 12.58 20.66L14.41 18.83C16.54 17.78 18 15.56 18 13V11ZM4 9H8V15H4C3.45 15 3 14.55 3 14V10C3 9.45 3.45 9 4 9ZM20.5 12C20.5 14.28 19.34 16.29 17.58 17.47L19 18.89C21.15 17.38 22.5 14.85 22.5 12C22.5 9.15 21.15 6.62 19 5.11L17.58 6.53C19.34 7.71 20.5 9.72 20.5 12Z" />
    </Svg>
  );
}

/* ─── 11. Redes Sociais ─────────────────────────────────────────────── */
export function IconNeuSocial(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.35C15.11 18.56 15.08 18.78 15.08 19C15.08 20.61 16.39 21.92 18 21.92C19.61 21.92 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z" />
    </Svg>
  );
}

/* ─── 12. Automações (Engrenagem) ───────────────────────────────────── */
export function IconNeuAutomation(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M19.14 12.94C19.18 12.63 19.2 12.32 19.2 12C19.2 11.68 19.18 11.37 19.14 11.06L21.16 9.48C21.34 9.34 21.39 9.08 21.28 8.87L19.37 5.56C19.26 5.35 19 5.27 18.78 5.35L16.4 6.31C15.91 5.93 15.37 5.62 14.79 5.38L14.43 2.85C14.4 2.62 14.2 2.45 13.97 2.45H10.03C9.8 2.45 9.6 2.62 9.57 2.85L9.21 5.38C8.63 5.62 8.09 5.94 7.6 6.31L5.22 5.35C5 5.27 4.74 5.35 4.63 5.56L2.72 8.87C2.61 9.08 2.66 9.34 2.84 9.48L4.86 11.06C4.82 11.37 4.8 11.69 4.8 12C4.8 12.31 4.82 12.63 4.86 12.94L2.84 14.52C2.66 14.66 2.61 14.92 2.72 15.13L4.63 18.44C4.74 18.65 5 18.73 5.22 18.65L7.6 17.69C8.09 18.07 8.63 18.38 9.21 18.62L9.57 21.15C9.6 21.38 9.8 21.55 10.03 21.55H13.97C14.2 21.55 14.4 21.38 14.43 21.15L14.79 18.62C15.37 18.38 15.91 18.06 16.4 17.69L18.78 18.65C19 18.73 19.26 18.65 19.37 18.44L21.28 15.13C21.39 14.92 21.34 14.66 21.16 14.52L19.14 12.94ZM12 15.5C10.07 15.5 8.5 13.93 8.5 12C8.5 10.07 10.07 8.5 12 8.5C13.93 8.5 15.5 10.07 15.5 12C15.5 13.93 13.93 15.5 12 15.5Z" />
    </Svg>
  );
}

/* ─── 13. Integrações (Plugue Elétrico) ──────────────────────────────── */
export function IconNeuPlug(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M16 7V3H14V7H10V3H8V7H7C5.9 7 5 7.9 5 9V14C5 16.21 6.79 18 9 18H11V21H13V18H15C17.21 18 19 16.21 19 14V9C19 7.9 18.1 7 17 7H16Z" />
    </Svg>
  );
}

/* ─── 14. Base de Conhecimento (Livro / Documentos) ──────────────────── */
export function IconNeuBook(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M18 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V4C20 2.9 19.1 2 18 2ZM6 4H11V12L8.5 10.5L6 12V4Z" />
    </Svg>
  );
}

/* ─── 15. Configurações (Sliders / Config) ───────────────────────────── */
export function IconNeuSettings(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M3 17V19H9V17H3ZM3 5V7H13V5H3ZM13 21V19H21V17H13V15H11V21H13ZM7 9V11H3V13H7V15H9V9H7ZM21 13V11H11V13H21ZM17 7V9H19V7H21V5H19V3H17V7Z" />
    </Svg>
  );
}

/* ─── 16. Agentes Online (IA Avatar) ─────────────────────────────────── */
export function IconNeuLucca(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.66 6 15 7.34 15 9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9C9 7.34 10.34 6 12 6ZM12 20C9.67 20 7.42 19.06 5.86 17.44C6.01 15.39 10.02 14.25 12 14.25C13.98 14.25 17.99 15.39 18.14 17.44C16.58 19.06 14.33 20 12 20Z" />
    </Svg>
  );
}

/* ─── 17. Wallet / Impacto Financeiro ───────────────────────────────── */
export function IconNeuWallet(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M21 7.28V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-2.28c.59-.35 1-.99 1-1.72V9c0-.73-.41-1.37-1-1.72zM20 9v6h-3c-1.1 0-2-.9-2-2s.9-2 2-2h3zM5 5h14v2H5V5z" />
    </Svg>
  );
}

/* ─── 18. Alert / Alta Prioridade ───────────────────────────────────── */
export function IconNeuAlert(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 2L1 21H23L12 2ZM13 18H11V16H13V18ZM13 14H11V10H13V14Z" />
    </Svg>
  );
}

/* ─── 19. Users / Agentes Envolvidos ────────────────────────────────── */
export function IconNeuUsers(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </Svg>
  );
}

/* ─── 20. Zap / Lightning / Online ───────────────────────────────────── */
export function IconNeuZap(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </Svg>
  );
}

/* ─── 21. Clock / Tempo ──────────────────────────────────────────────── */
export function IconNeuClock(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
    </Svg>
  );
}

/* ─── 22. Cpu / Processador ─────────────────────────────────────────── */
export function IconNeuCpu(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M15 9H9v6h6V9zm-2 4h-2v-2h2v2zm8-2V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H9v2H7c-1.1 0-2 .9-2 2v2H3v2h2v2H3v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2zm-4 6H7V7h10v10z" />
    </Svg>
  );
}

/* ─── 23. Ticket / Cupon ─────────────────────────────────────────────── */
export function IconNeuTicket(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-1.99 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-2-1.46c-1.19.69-2 1.99-2 3.46s.81 2.77 2 3.46V18H4v-2.54c1.19-.69 2-1.99 2-3.46.01-1.48-.8-2.77-1.99-3.46V6h16v2.54z" />
    </Svg>
  );
}

/* ─── Neumorphic KPI Tile Wrappers (Layout idêntico aos botões do menu) ─── */
export function IconNeuKpiOportunidades({ size = 44, isActive = false }: { size?: number; isActive?: boolean }) {
  return (
    <NeumorphicTileIcon isActive={isActive} size="lg" className="shadow-md">
      <IconNeuOpportunities size={size ? Math.round(size * 0.5) : 22} />
    </NeumorphicTileIcon>
  );
}

export function IconNeuKpiImpacto({ size = 44, isActive = false }: { size?: number; isActive?: boolean }) {
  return (
    <NeumorphicTileIcon isActive={isActive} size="lg" className="shadow-md">
      <IconNeuWallet size={size ? Math.round(size * 0.5) : 22} />
    </NeumorphicTileIcon>
  );
}

export function IconNeuKpiPrioridade({ size = 44, isActive = false }: { size?: number; isActive?: boolean }) {
  return (
    <NeumorphicTileIcon isActive={isActive} size="lg" className="shadow-md">
      <IconNeuAlert size={size ? Math.round(size * 0.5) : 22} />
    </NeumorphicTileIcon>
  );
}

export function IconNeuKpiAgentes({ size = 44, isActive = false }: { size?: number; isActive?: boolean }) {
  return (
    <NeumorphicTileIcon isActive={isActive} size="lg" className="shadow-md">
      <IconNeuUsers size={size ? Math.round(size * 0.5) : 22} />
    </NeumorphicTileIcon>
  );
}

export function IconNeuKpiOperacoes({ size = 44, isActive = false }: { size?: number; isActive?: boolean }) {
  return (
    <NeumorphicTileIcon isActive={isActive} size="lg" className="shadow-md">
      <IconNeuAutomation size={size ? Math.round(size * 0.5) : 22} />
    </NeumorphicTileIcon>
  );
}

export function IconNeuKpiOnline({ size = 44, isActive = false }: { size?: number; isActive?: boolean }) {
  return (
    <NeumorphicTileIcon isActive={isActive} size="lg" className="shadow-md">
      <IconNeuZap size={size ? Math.round(size * 0.5) : 22} />
    </NeumorphicTileIcon>
  );
}

export function IconNeuKpiCpu({ size = 44, isActive = false }: { size?: number; isActive?: boolean }) {
  return (
    <NeumorphicTileIcon isActive={isActive} size="lg" className="shadow-md">
      <IconNeuCpu size={size ? Math.round(size * 0.5) : 22} />
    </NeumorphicTileIcon>
  );
}

export function IconNeuKpiClock({ size = 44, isActive = false }: { size?: number; isActive?: boolean }) {
  return (
    <NeumorphicTileIcon isActive={isActive} size="lg" className="shadow-md">
      <IconNeuClock size={size ? Math.round(size * 0.5) : 22} />
    </NeumorphicTileIcon>
  );
}

export function IconNeuKpiTicket({ size = 44, isActive = false }: { size?: number; isActive?: boolean }) {
  return (
    <NeumorphicTileIcon isActive={isActive} size="lg" className="shadow-md">
      <IconNeuTicket size={size ? Math.round(size * 0.5) : 22} />
    </NeumorphicTileIcon>
  );
}

/* ─── Page Title Icon Wrapper (Template Anexo 03) ─── */
export function PageTitleIcon({
  icon: Icon,
  className = "w-8 h-8",
  iconSize = 18,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  className?: string;
  iconSize?: number;
}) {
  return (
    <div
      className={`shrink-0 flex items-center justify-center rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] border border-slate-200/50 ${className}`}
    >
      <Icon size={iconSize} className="text-slate-700" />
    </div>
  );
}
