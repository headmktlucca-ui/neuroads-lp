'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { ScoreRing, AttentionScoreGrid } from './AttentionScoreCard';
import { HeatmapViewer } from './HeatmapViewer';
import { getScoreLabel, getScoreColor, type AttentionScore, analyzeVisually } from '../../../lib/visual-analysis';
import type { HeatmapData } from '../../../lib/visual-analysis';
import { useAuth } from '../../../context/AuthContext';
import { getFirebaseDb } from '../../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { PageTitleIcon, IconNeuOpportunities, IconNeuRefresh } from '../NeumorphicMenuIcons';

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
  imageUrl,
  onClose,
  compact = false,
  className = '',
}: VisualAnalysisPanelProps) {
  const { user, activeCompany } = useAuth();
  const [state, setState] = useState<AnalysisState>('idle');
  const [score, setScore] = useState<AttentionScore | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapData | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [errorTroubleshoot, setErrorTroubleshoot] = useState<string[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Load latest analysis from Firestore on mount/company change
  useEffect(() => {
    let active = true;
    async function loadLatest() {
      if (!user?.uid || !activeCompany?.id) {
        setIsInitialLoading(false);
        return;
      }
      try {
        setIsInitialLoading(true);
        const db = getFirebaseDb();
        const docRef = doc(db, 'users', user.uid, 'companies', activeCompany.id, 'visual-analysis', 'latest');
        const snap = await getDoc(docRef);
        if (active && snap.exists()) {
          const data = snap.data();
          setScore({
            overall: data.overall,
            criteria: data.criteria,
            analyzedAt: new Date(data.analyzedAt),
            subjectLabel: data.subjectLabel || subjectLabel,
          });
          setHeatmap(data.heatmap);
          setState('done');
        } else {
          // If no history, reset to idle
          if (active) {
            setScore(null);
            setHeatmap(null);
            setState('idle');
          }
        }
      } catch (err) {
        console.warn('Erro ao carregar análise visual do Firestore:', err);
      } finally {
        if (active) setIsInitialLoading(false);
      }
    }
    loadLatest();
    return () => {
      active = false;
    };
  }, [user?.uid, activeCompany?.id, subjectLabel]);

  const runAnalysis = useCallback(async () => {
    if (!user?.uid || !activeCompany?.id) {
      setErrorMessage('Usuário ou empresa não identificados.');
      setState('error');
      return;
    }

    setState('analyzing');
    setScore(null);
    setHeatmap(null);
    setShowDetails(false);
    setErrorMessage('');
    setErrorDetails('');
    setErrorTroubleshoot([]);

    try {
      // Chamada real para nossa API local que encapsula o backend
      const result = await analyzeVisually({
        url: subjectLabel,
      });

      const newScore: AttentionScore = {
        overall: result.overall,
        criteria: result.criteria,
        analyzedAt: new Date(result.analyzedAt),
        subjectLabel,
      };

      // Save to Firestore
      const db = getFirebaseDb();
      const docRef = doc(db, 'users', user.uid, 'companies', activeCompany.id, 'visual-analysis', 'latest');
      await setDoc(docRef, {
        overall: result.overall,
        criteria: result.criteria,
        heatmap: result.heatmap,
        analyzedAt: result.analyzedAt,
        subjectLabel,
        predictedCTR: result.predictedCTR,
        ctrBenchmark: result.ctrBenchmark,
        ctrDelta: result.ctrDelta,
        aboveFoldScore: result.aboveFoldScore,
      });

      setScore(newScore);
      setHeatmap(result.heatmap);
      setState('done');
    } catch (err: unknown) {
      console.error(err);
      const errorObj = err as { message?: string; details?: string; troubleshoot?: string[] };
      setErrorMessage(errorObj.message || 'Erro ao processar a análise visual.');
      setErrorDetails(errorObj.details || '');
      setErrorTroubleshoot(errorObj.troubleshoot || []);
      setState('error');
    }
  }, [subjectLabel, user?.uid, activeCompany?.id]);

  const color = score ? getScoreColor(score.overall) : '#94a3b8';
  const label = score ? getScoreLabel(score.overall) : '';

  if (isInitialLoading) {
    return (
      <div className={`p-8 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200/60 shadow-sm ${className}`}>
        <div className="w-8 h-8 border-[3px] border-t-orange-500 border-orange-100 rounded-full animate-spin" />
        <p className="text-[11px] text-slate-400 font-semibold mt-2.5">Buscando histórico...</p>
      </div>
    );
  }


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
          <PageTitleIcon icon={IconNeuOpportunities} className="w-9 h-9" iconSize={16} />
          <div>
            <p className="text-sm font-semibold text-slate-800">NeuroVisão</p>
            <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{subjectLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {state === 'done' && (
            <button
              onClick={runAnalysis}
              className="w-9 h-9 rounded-full flex items-center justify-center bg-white border border-slate-200/50 shadow-[0_3px_8px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] hover:scale-105 active:scale-95 transition-all"
              title="Reanalisar"
            >
              <IconNeuRefresh size={16} className="text-slate-700" />
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
              className="w-16 h-16 rounded-full flex items-center justify-center bg-white border border-slate-200/50 shadow-[0_4px_12px_rgba(0,0,0,0.06),0_1px_4px_rgba(0,0,0,0.04)]"
            >
              <IconNeuOpportunities size={28} className="text-slate-700" />
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
              <IconNeuOpportunities size={14} className="text-white" />
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
          <div className="flex flex-col items-stretch gap-4 py-4 text-left max-w-md mx-auto">
            <div className="flex items-center gap-3 border-b border-rose-100 pb-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-rose-50 border border-rose-100 text-rose-500 text-lg font-bold shrink-0">⚠️</span>
              <div>
                <p className="text-sm font-bold text-slate-800">Falha na Análise do Site</p>
                <p className="text-[11.5px] text-rose-600 font-semibold">{errorMessage}</p>
              </div>
            </div>

            {errorDetails && (
              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Detalhe do problema</p>
                <p className="text-[11px] font-medium text-slate-600 font-mono mt-0.5 leading-relaxed">{errorDetails}</p>
              </div>
            )}

            {errorTroubleshoot.length > 0 && (
              <div className="space-y-2">
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Como resolver</p>
                <div className="space-y-1.5">
                  {errorTroubleshoot.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11.5px] text-slate-600 font-semibold leading-relaxed">
                      <span className="text-[#FF6A00] font-black shrink-0 mt-0.5">•</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={runAnalysis}
              className="mt-2 w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all active:scale-98"
              style={{
                background: 'linear-gradient(135deg, #FF6A00, #FF8805)',
                boxShadow: '0 4px 12px rgba(255,106,0,0.3)',
              }}
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
