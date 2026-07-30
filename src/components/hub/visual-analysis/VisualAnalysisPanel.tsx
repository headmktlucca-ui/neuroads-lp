'use client';

import React, { useState, useCallback } from 'react';
import { X, ChevronDown, ChevronUp, Sparkles, RotateCcw, Upload } from 'lucide-react';
import { ScoreRing, AttentionScoreGrid } from './AttentionScoreCard';
import { HeatmapViewer } from './HeatmapViewer';
import { generateAttentionScore, getScoreLabel, getScoreColor, type AttentionScore, analyzeVisually } from '../../../lib/visual-analysis';
import type { HeatmapData } from '../../../lib/visual-analysis';

// ─── Props ────────────────────────────────────────────────────────────────────

interface VisualAnalysisPanelProps {
  /** Texto descritivo do que está sendo analisado (ex: "Banner Meta Ads") */
  subjectLabel: string;
  /** Seed numérico para gerar dados mock consistentes (ex: id da campanha) */
  seed?: number;
  /** Imagem URL para mostrar no heatmap viewer */
  imageUrl?: string;
  /** Callback ao fechar o painel (se usado em modal/drawer) */
  onClose?: () => void;
  /** Modo compacto — não renderiza o heatmap viewer, só os scores */
  compact?: boolean;
  /** Classe CSS extra */
  className?: string;
}

// ─── Estado de análise ────────────────────────────────────────────────────────

type AnalysisState = 'idle' | 'analyzing' | 'done' | 'error';

// ─── Componente principal ─────────────────────────────────────────────────────

export function VisualAnalysisPanel({
  subjectLabel,
  seed = 42,
  imageUrl,
  onClose,
  compact = false,
  className = '',
}: VisualAnalysisPanelProps) {
  const [state, setState] = useState<AnalysisState>('idle');
  const [score, setScore] = useState<AttentionScore | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const runAnalysis = useCallback(async () => {
    setState('analyzing');
    setScore(null);
    setHeatmap(null);
    setShowDetails(false);
    setErrorMessage('');

    try {
      // Chamada real para nossa API local que encapsula o backend
      const result = await analyzeVisually({
        url: subjectLabel.includes('.') ? subjectLabel : undefined,
        creativeName: !subjectLabel.includes('.') ? subjectLabel : undefined,
      });

      setScore({
        overall: result.overall,
        criteria: result.criteria,
        analyzedAt: new Date(result.analyzedAt),
        subjectLabel,
      });
      setHeatmap(result.heatmap);
      setState('done');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Erro ao processar a análise visual.');
      setState('error');
    }
  }, [subjectLabel]);

  const color = score ? getScoreColor(score.overall) : '#94a3b8';
  const label = score ? getScoreLabel(score.overall) : '';


  return (
    <div
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{
        background: 'white',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        border: '1px solid rgba(226,232,240,0.7)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{
          borderBottom: '1px solid rgba(226,232,240,0.6)',
          background: 'linear-gradient(135deg, rgba(255,106,0,0.04), rgba(255,136,5,0.02))',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Ícone neumórfico "bola 2014" */}
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 36, height: 36,
              background: 'white',
              boxShadow: '0 3px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
              border: '1px solid rgba(226,232,240,0.5)',
            }}
          >
            <Sparkles size={16} className="text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">NeuroVisão</p>
            <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{subjectLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {state === 'done' && (
            <button
              onClick={runAnalysis}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
              title="Reanalisar"
            >
              <RotateCcw size={14} />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Estado: idle */}
        {state === 'idle' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255,106,0,0.08), rgba(255,136,5,0.05))',
                border: '1px solid rgba(255,106,0,0.15)',
              }}
            >
              <Sparkles size={28} className="text-orange-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700 mb-1">Análise Visual Preditiva</p>
              <p className="text-[11px] text-slate-400 max-w-[220px] leading-relaxed">
                Mapeie as zonas de atenção e descubra como melhorar a conversão visual.
              </p>
            </div>
            <button
              onClick={runAnalysis}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #FF6A00, #FF8805)',
                boxShadow: '0 4px 12px rgba(255,106,0,0.35)',
              }}
            >
              <Sparkles size={14} />
              Analisar Agora
            </button>
          </div>
        )}

        {/* Estado: analyzing */}
        {state === 'analyzing' && (
          <div className="flex flex-col items-center gap-3 py-8">
            {/* Spinner neumórfico */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: 'white',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
                border: '1px solid rgba(226,232,240,0.6)',
              }}
            >
              <div
                className="w-8 h-8 rounded-full border-[3px] border-t-orange-500 border-orange-100"
                style={{ animation: 'spin 0.8s linear infinite' }}
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-700">Analisando com IA...</p>
              <p className="text-[11px] text-slate-400 mt-1">Mapeando zonas de atenção visual</p>
            </div>
          </div>
        )}

        {/* Estado: error */}
        {state === 'error' && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="text-red-500 text-2xl font-bold">⚠️</span>
            <p className="text-sm font-semibold text-slate-700">Erro na Análise Visual</p>
            <p className="text-[11px] text-slate-400 max-w-[240px]">{errorMessage}</p>
            <button
              onClick={runAnalysis}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #FF6A00, #FF8805)' }}
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Estado: done */}
        {state === 'done' && score && (
          <div className="space-y-4">
            {/* Score geral */}
            <div className="flex items-center gap-4">
              <ScoreRing score={score.overall} size={72} strokeWidth={6} />
              <div>
                <p className="text-2xl font-bold text-slate-800">{score.overall}<span className="text-sm text-slate-400 font-normal">/100</span></p>
                <p className="text-sm font-semibold" style={{ color }}>{label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Score de atenção visual</p>
              </div>
            </div>

            {/* Heatmap viewer (full) */}
            {!compact && heatmap && (
              <HeatmapViewer heatmap={heatmap} imageUrl={imageUrl} />
            )}

            {/* Critérios — toggle */}
            <button
              onClick={() => setShowDetails(v => !v)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors"
            >
              {showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {showDetails ? 'Ocultar' : 'Ver'} critérios detalhados
            </button>

            {showDetails && (
              <AttentionScoreGrid criteria={score.criteria} compact={compact} />
            )}

            {/* Critérios compactos sempre visíveis */}
            {!showDetails && (
              <AttentionScoreGrid criteria={score.criteria} compact />
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
