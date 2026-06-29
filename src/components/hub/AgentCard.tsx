'use client';

/**
 * AgentCard — Componente reutilizável de card de agente para o Hub NeuroAds.
 * 
 * Estilizado sob o padrão Light Neumorphism (Soft UI), com fontes de alta legibilidade,
 * remoção de bordas laterais coloridas (Absolute Ban) e botões tátil-neumórficos.
 */

import Link from 'next/link';
import { CheckCircle2, ExternalLink, Info, Power, Wrench } from 'lucide-react';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type AgentCardVariant = 'lab' | 'dashboard';

export interface AgentCardProps {
  title: string;
  description: string;
  slug: string;
  isActive: boolean;
  variant?: AgentCardVariant;
  isActivatable?: boolean;
  isUpdating?: boolean;
  onActivate?: () => void;
  onDeactivate?: () => void;
  onDetails?: () => void;
}

// ─── Classes de botões compartilhadas ────────────────────────────────────────

const BTN_BASE = 'inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] px-6 text-[13px] leading-none font-bold transition-all active:scale-95';

const BTN_ACTIVE   = `${BTN_BASE} bg-gradient-to-r from-[#0d9488] to-[#10b981] text-white shadow-[0_4px_12px_rgba(13,148,136,0.25)] hover:from-[#0a7e73] hover:to-[#0db86e] hover:scale-[1.02]`;
const BTN_BLUE     = `${BTN_BASE} bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)] hover:from-[#1d4ed8] hover:to-[#2563eb] hover:scale-[1.02]`;
const BTN_GHOST    = `${BTN_BASE} border border-white/40 bg-[#eef2f7] text-slate-700 shadow-[2px_2px_4px_#d1d9e6,_-2px_-2px_4px_#ffffff] hover:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] hover:scale-[1.02]`;
const BTN_ORANGE   = `${BTN_BASE} bg-gradient-to-r from-[#FF6A00] to-[#FF8805] text-white shadow-[0_4px_12px_rgba(255,106,0,0.25)] hover:brightness-105 hover:scale-[1.02]`;
const BTN_DISABLED = `${BTN_BASE} border border-white/40 bg-[#eef2f7] text-slate-400 shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] cursor-not-allowed opacity-60`;

// ─── Componente ──────────────────────────────────────────────────────────────

export default function AgentCard({
  title,
  description,
  slug,
  isActive,
  variant = 'lab',
  isActivatable = true,
  isUpdating = false,
  onActivate,
  onDeactivate,
  onDetails,
}: AgentCardProps) {
  return (
    <article className="hub-neu-card group relative p-6 md:p-7 shadow-[4px_4px_8px_#d1d9e6,_-4px_-4px_8px_#ffffff] hover:shadow-[5px_5px_10px_#c2cbd9,_-5px_-5px_10px_#ffffff] transition-all duration-300 flex flex-col h-full overflow-hidden">
      {/* Content */}
      <div className="flex-1 relative z-10">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            {isActive && (
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10b981]"></span>
              </span>
            )}
            <h3 className="text-[18px] md:text-[20px] font-black text-[#0f172a] tracking-tight leading-none group-hover:text-[#FF6A00] transition-colors">
              {title}
            </h3>
          </div>

          {/* Deactivate inline button (shown only when active) */}
          {isActive && onDeactivate ? (
            <button
              type="button"
              onClick={onDeactivate}
              disabled={isUpdating}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-rose-600 hover:text-rose-800 transition-colors disabled:opacity-60 shrink-0"
            >
              <Power className="h-3 w-3" />
              {isUpdating ? 'Desativando' : 'Desativar'}
            </button>
          ) : null}
        </div>

        <p className="text-[14px] leading-[1.6] text-slate-600 font-medium">
          {description}
        </p>
      </div>

      {/* Actions */}
      <div className="mt-8 pt-5 border-t border-slate-200 flex flex-wrap gap-3 relative z-10">
        {isActive ? (
          <>
            <button type="button" className={BTN_ACTIVE} disabled>
              <CheckCircle2 className="h-4 w-4" />
              Ativo
            </button>

            <Link href={`/hub/agente/${slug}`} className={BTN_BLUE} style={{ textDecoration: 'none' }}>
              <ExternalLink className="h-4 w-4" />
              Acessar
            </Link>

            {variant === 'lab' && onDetails ? (
              <button type="button" onClick={onDetails} className={BTN_GHOST}>
                <Info className="h-4 w-4" />
                Detalhes
              </button>
            ) : null}
          </>
        ) : (
          <>
            {isActivatable ? (
              <button
                type="button"
                onClick={onActivate}
                disabled={isUpdating}
                className={`${BTN_ORANGE} disabled:opacity-60`}
              >
                <Wrench className="h-4 w-4" />
                {isUpdating ? 'Ativando…' : 'Ativar Agente'}
              </button>
            ) : (
              <button type="button" disabled className={BTN_DISABLED}>
                <Wrench className="h-4 w-4" />
                Em breve
              </button>
            )}

            {variant === 'lab' && onDetails ? (
              <button type="button" onClick={onDetails} className={BTN_GHOST}>
                <Info className="h-4 w-4" />
                Detalhes
              </button>
            ) : null}
          </>
        )}
      </div>
    </article>
  );
}
