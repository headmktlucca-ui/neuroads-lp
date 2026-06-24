'use client';

/**
 * AgentCard — Componente reutilizável de card de agente para o Hub NeuroAds.
 *
 * Encapsula o padrão visual (glassmorphism, borda laranja, botões padronizados h-11)
 * que antes estava duplicado em Dashboard, Laboratório e Agentes Ativos.
 *
 * Uso:
 *   <AgentCard
 *     title={agent.title}
 *     description={agent.description}
 *     slug={agentSlug}
 *     isActive={entry.isActive}
 *     variant="lab"              // 'lab' | 'dashboard'
 *     isActivatable={true}
 *     isUpdating={updatingSlug === agentSlug}
 *     onActivate={() => handleActivate(agentSlug)}
 *     onDeactivate={() => handleDeactivate(agentSlug)}
 *     onDetails={() => handleDetails(agentSlug)}
 *   />
 */

import Link from 'next/link';
import { CheckCircle2, ExternalLink, Info, Power, Wrench } from 'lucide-react';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type AgentCardVariant = 'lab' | 'dashboard';

export interface AgentCardProps {
  /** Título do agente (ex: "Analista de Tráfego") */
  title: string;
  /** Descrição curta do agente */
  description: string;
  /** Slug do agente para routing (/hub/agente/[slug]) */
  slug: string;
  /** Se o agente está atualmente ativo na conta do usuário */
  isActive: boolean;
  /**
   * 'lab'       → mostra botão "Ativar Agente" / "em desenvolvimento"
   * 'dashboard' → mostra apenas "Ativar Agente" para recomendados
   */
  variant?: AgentCardVariant;
  /** Se o agente pode ser ativado (false = exibe "em desenvolvimento") */
  isActivatable?: boolean;
  /** Se uma operação está em andamento para este agente */
  isUpdating?: boolean;
  /** Callback ao clicar em "Ativar Agente" */
  onActivate?: () => void;
  /** Callback ao clicar em "Desativar Agente" */
  onDeactivate?: () => void;
  /** Callback ao clicar em "Mais detalhes" (Laboratório) */
  onDetails?: () => void;
}

// ─── Classes de botões compartilhadas ────────────────────────────────────────

const BTN_BASE = 'inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[12px] px-6 text-[14px] leading-none font-black transition-all active:scale-95';

const BTN_ACTIVE   = `${BTN_BASE} bg-[var(--color-hub-active)] text-white shadow-[var(--shadow-btn-green)] hover:brightness-105`;
const BTN_BLUE     = `${BTN_BASE} bg-[var(--color-hub-info)] text-white shadow-[var(--shadow-btn-blue)] hover:bg-[#0353e9] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93C5FD]`;
const BTN_GHOST    = `${BTN_BASE} border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white hover:scale-105 shadow-sm`;
const BTN_ORANGE   = `${BTN_BASE} border border-[var(--color-hub-accent)] bg-[var(--color-hub-accent)] text-white shadow-[var(--shadow-btn-orange)] hover:brightness-105 hover:scale-105`;
const BTN_DISABLED = `${BTN_BASE} bg-white/[0.04] border border-white/[0.08] text-slate-500 cursor-not-allowed opacity-60`;

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
    <article className="group relative rounded-[24px] border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-transparent backdrop-blur-xl p-6 md:p-8 transition-all duration-500 hover:bg-white/[0.06] hover:border-[var(--color-hub-accent)]/30 hover:shadow-[0_8px_32px_rgba(255,106,0,0.08)] flex flex-col h-full overflow-hidden">
      
      {/* Subtle Glow Background on Hover */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--color-hub-accent)]/20 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

      {/* Top accent line on hover */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-hub-accent)]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content */}
      <div className="flex-1 relative z-10">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            {isActive && (
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-hub-active)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--color-hub-active)] shadow-[0_0_8px_var(--color-hub-active)]"></span>
              </span>
            )}
            <h3 className="text-[18px] md:text-[20px] font-black text-white tracking-tight leading-none group-hover:text-[var(--color-hub-accent)] transition-colors">
              {title}
            </h3>
          </div>

          {/* Deactivate inline button (shown only when active) */}
          {isActive && onDeactivate ? (
            <button
              type="button"
              onClick={onDeactivate}
              disabled={isUpdating}
              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-hub-danger)] hover:text-[#FF3333] transition-colors disabled:opacity-60 shrink-0"
            >
              <Power className="h-3 w-3" />
              {isUpdating ? 'Desativando' : 'Desativar'}
            </button>
          ) : null}
        </div>

        <p className="text-[14px] leading-[1.6] text-slate-300">
          {description}
        </p>
      </div>

      {/* Actions (Docked at bottom with a separator) */}
      <div className="mt-8 pt-5 border-t border-white/[0.06] flex flex-wrap gap-3 relative z-10">
        {isActive ? (
          <>
            <button type="button" className={BTN_ACTIVE} disabled>
              <CheckCircle2 className="h-4 w-4" />
              Ativo
            </button>

            <Link href={`/hub/agente/${slug}`} className={BTN_BLUE}>
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
