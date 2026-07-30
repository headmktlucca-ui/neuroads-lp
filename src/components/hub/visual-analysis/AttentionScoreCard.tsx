'use client';

import React from 'react';
import { Eye, MousePointerClick, Layers, AlertCircle } from 'lucide-react';
import type { AttentionScoreCriterion } from '../../../lib/visual-analysis';
import { getScoreColor } from '../../../lib/visual-analysis';

// ─── Score Ring (SVG animado) ─────────────────────────────────────────────────

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export function ScoreRing({ score, size = 64, strokeWidth = 5 }: ScoreRingProps) {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out, stroke 0.3s ease' }}
        />
      </svg>
      <span
        className="absolute text-xs font-bold"
        style={{ color, fontSize: size * 0.22 }}
      >
        {score}
      </span>
    </div>
  );
}

// ─── Icon por critério ────────────────────────────────────────────────────────

function CriterionIcon({ criterionKey, color }: { criterionKey: string; color: string }) {
  const props = { size: 14, style: { color } };
  switch (criterionKey) {
    case 'focal_point':      return <Eye {...props} />;
    case 'cta_visibility':   return <MousePointerClick {...props} />;
    case 'info_hierarchy':   return <Layers {...props} />;
    case 'distraction_score':return <AlertCircle {...props} />;
    default:                 return <Eye {...props} />;
  }
}

// ─── Card individual de critério ──────────────────────────────────────────────

interface AttentionScoreCardProps {
  criterion: AttentionScoreCriterion;
  compact?: boolean;
}

export function AttentionScoreCard({ criterion, compact = false }: AttentionScoreCardProps) {
  const color = getScoreColor(criterion.score);

  if (compact) {
    return (
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl"
        style={{
          background: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
          border: '1px solid rgba(226,232,240,0.6)',
        }}
      >
        {/* Ícone neumórfico "bola 2014" */}
        <div
          className="flex items-center justify-center rounded-full flex-shrink-0"
          style={{
            width: 32,
            height: 32,
            background: 'white',
            boxShadow: '0 3px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
            border: '1px solid rgba(226,232,240,0.5)',
          }}
        >
          <CriterionIcon criterionKey={criterion.key} color={color} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-400 font-medium truncate">{criterion.label}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${criterion.score}%`, background: color }}
              />
            </div>
            <span className="text-[10px] font-bold flex-shrink-0" style={{ color }}>
              {criterion.score}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-4 rounded-2xl"
      style={{
        background: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04)',
        border: '1px solid rgba(226,232,240,0.6)',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Ícone neumórfico "bola 2014" */}
        <div
          className="flex items-center justify-center rounded-full flex-shrink-0"
          style={{
            width: 36,
            height: 36,
            background: 'white',
            boxShadow: '0 3px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
            border: '1px solid rgba(226,232,240,0.5)',
          }}
        >
          <CriterionIcon criterionKey={criterion.key} color={color} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-slate-700">{criterion.label}</p>
            <span className="text-sm font-bold" style={{ color }}>{criterion.score}/100</span>
          </div>
          {/* Barra de progresso */}
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${criterion.score}%`, background: color }}
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">{criterion.description}</p>
        </div>
      </div>

      {/* Recomendação */}
      <div
        className="mt-3 px-3 py-2 rounded-xl text-[11px] text-slate-600 leading-relaxed"
        style={{ background: 'rgba(248,250,252,0.8)', border: '1px solid rgba(226,232,240,0.5)' }}
      >
        💡 {criterion.recommendation}
      </div>
    </div>
  );
}

// ─── Grid de 4 critérios ──────────────────────────────────────────────────────

interface AttentionScoreGridProps {
  criteria: AttentionScoreCriterion[];
  compact?: boolean;
}

export function AttentionScoreGrid({ criteria, compact = false }: AttentionScoreGridProps) {
  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-2">
        {criteria.map(c => (
          <AttentionScoreCard key={c.key} criterion={c} compact />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {criteria.map(c => (
        <AttentionScoreCard key={c.key} criterion={c} />
      ))}
    </div>
  );
}
