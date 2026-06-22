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
    <article className="group relative rounded-2xl border border-[var(--color-hub-border-accent)] bg-[var(--color-hub-surface)]/40 backdrop-blur-md p-5 transition-all duration-300 hover:bg-[var(--color-hub-surface)]/70 hover:border-[var(--color-hub-border-accent-h)] hover:shadow-[var(--shadow-hub-orange)] flex flex-col h-full">

      {/* Top accent line on hover */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--color-hub-accent)]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl" />

      {/* Content */}
      <div className="flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-black text-[var(--color-hub-text)]">{title}</p>

          {/* Deactivate inline button (shown only when active) */}
          {isActive && onDeactivate ? (
            <button
              type="button"
              onClick={onDeactivate}
              disabled={isUpdating}
              className="inline-flex items-center gap-1 text-[12px] font-black text-[var(--color-hub-danger)] hover:text-[#FF3333] transition-colors disabled:opacity-60 shrink-0"
            >
              <Power className="h-3.5 w-3.5" />
              {isUpdating ? 'Desativando…' : 'Desativar Agente'}
            </button>
          ) : null}
        </div>

        <p className="mt-1 text-xs text-[var(--color-hub-muted)]">{description}</p>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2">
        {isActive ? (
          <>
            {/* Active indicator */}
            <button type="button" className={BTN_ACTIVE} disabled>
              <CheckCircle2 className="h-4 w-4" />
              Ativo
            </button>

            {/* Access workspace */}
            <Link href={`/hub/agente/${slug}`} className={BTN_BLUE}>
              <ExternalLink className="h-4 w-4" />
              Acessar Agente
            </Link>

            {/* Details (lab only) */}
            {variant === 'lab' && onDetails ? (
              <button type="button" onClick={onDetails} className={BTN_GHOST}>
                <Info className="h-4 w-4" />
                Mais detalhes
              </button>
            ) : null}
          </>
        ) : (
          <>
            {/* Activate / In Development */}
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

            {/* Details (lab only) */}
            {variant === 'lab' && onDetails ? (
              <button type="button" onClick={onDetails} className={BTN_GHOST}>
                <Info className="h-4 w-4" />
                Mais detalhes
              </button>
            ) : null}
          </>
        )}
      </div>
    </article>
  );
}
