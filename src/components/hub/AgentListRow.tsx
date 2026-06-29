'use client';

import Link from 'next/link';
import { CheckCircle2, ExternalLink, Info, Power, Wrench } from 'lucide-react';
import { type AgentCardProps } from './AgentCard';

export default function AgentListRow({
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
    <div className="group relative flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-5 border-b border-white/[0.05] last:border-0 transition-colors hover:bg-white/[0.025]">
      {/* Orange left accent */}
      <div className="absolute left-0 inset-y-0 w-[3px] bg-gradient-to-b from-[#FF6A00] via-[#FF8C00]/60 to-transparent rounded-l-sm" />

      {/* Status dot + text */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative shrink-0">
          {isActive ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-hub-active)] opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--color-hub-active)] shadow-[0_0_8px_var(--color-hub-active)]" />
            </span>
          ) : (
            <span className="h-2.5 w-2.5 rounded-full bg-white/[0.12] border border-white/[0.15]" />
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[15px] font-black text-white leading-none group-hover:text-[#FF6A00] transition-colors truncate">
            {title}
          </p>
          <p className="mt-1.5 text-[13px] text-slate-400 leading-snug line-clamp-1">
            {description}
          </p>
        </div>
      </div>

      {/* Status badge */}
      <div className="shrink-0">
        {isActive ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Ativo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Inativo
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {isActive ? (
          <>
            <Link
              href={`/hub/agente/${slug}`}
              className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-gradient-to-r from-[#F24900] to-[#FF8805] px-4 text-[12px] font-black text-white hover:from-[#d93f00] hover:to-[#e07500] transition-all active:scale-95"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Acessar
            </Link>

            {variant === 'lab' && onDetails && (
              <button
                type="button"
                onClick={onDetails}
                className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-white/[0.10] bg-white/[0.04] px-4 text-[12px] font-black text-white/80 hover:bg-white/[0.08] hover:text-white transition-all active:scale-95"
              >
                <Info className="h-3.5 w-3.5" />
                Detalhes
              </button>
            )}

            {onDeactivate && (
              <button
                type="button"
                onClick={onDeactivate}
                disabled={isUpdating}
                className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-[#FF4D4D]/20 bg-[#FF4D4D]/05 px-3 text-[11px] font-bold uppercase tracking-wider text-[#FF4D4D] hover:bg-[#FF4D4D]/10 hover:border-[#FF4D4D]/40 transition-all disabled:opacity-50 active:scale-95"
              >
                <Power className="h-3 w-3" />
                {isUpdating ? '…' : 'Desativar'}
              </button>
            )}
          </>
        ) : (
          <>
            {isActivatable ? (
              <button
                type="button"
                onClick={onActivate}
                disabled={isUpdating}
                className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-gradient-to-r from-[#F24900] to-[#FF8805] px-4 text-[12px] font-black text-white hover:from-[#d93f00] hover:to-[#e07500] transition-all disabled:opacity-60 active:scale-95"
              >
                <Wrench className="h-3.5 w-3.5" />
                {isUpdating ? 'Ativando…' : 'Ativar Agente'}
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="inline-flex h-9 items-center gap-1.5 rounded-[10px] bg-white/[0.04] border border-white/[0.08] px-4 text-[12px] font-black text-slate-500 cursor-not-allowed opacity-60"
              >
                <Wrench className="h-3.5 w-3.5" />
                Em breve
              </button>
            )}

            {variant === 'lab' && onDetails && (
              <button
                type="button"
                onClick={onDetails}
                className="inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-white/[0.10] bg-white/[0.04] px-4 text-[12px] font-black text-white/80 hover:bg-white/[0.08] hover:text-white transition-all active:scale-95"
              >
                <Info className="h-3.5 w-3.5" />
                Detalhes
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
