'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Info, ChevronDown, ChevronUp, Sparkles, X } from 'lucide-react';
import { ScoreRing, AttentionScoreGrid } from './AttentionScoreCard';
import { HeatmapViewer } from './HeatmapViewer';
import {
  scoreCreative,
  getScoreColor,
  getScoreLabel,
  type Platform,
  type CreativeAnalysis,
  analyzeVisually,
} from '../../../lib/visual-analysis';

// ─── Checklist de boas práticas por plataforma ────────────────────────────────

const PLATFORM_CHECKLIST: Record<Platform, string[]> = {
  'Meta Ads': [
    'Texto em até 20% da imagem',
    'Rosto humano no criativo aumenta CTR em até 38%',
    'Cores vibrantes contrastam com fundo branco do feed',
    'CTA visível nos primeiros 3 segundos de vídeo',
  ],
  'Google Ads': [
    'Proporção 1.91:1 para display responsivo',
    'Logo no canto superior esquerdo',
    'Headline com palavra-chave principal',
    'CTA direto e específico ("Solicitar Demo" > "Clique aqui")',
  ],
  'LinkedIn Ads': [
    'Conteúdo profissional e informativo',
    'Headline com benefício claro para o decisor',
    'Imagem 1200×628px para Sponsored Content',
    'Sem CTAs agressivos — público B2B prefere abordagem consultiva',
  ],
  'TikTok Ads': [
    'Formato vertical 9:16 obrigatório',
    'Hook nos primeiros 2 segundos',
    'Texto na parte inferior (evitar área de UI do app)',
    'Música/som é fundamental — 90% assiste com som ativo',
  ],
  'Orgânico': [
    'Consistência visual com a identidade da marca',
    'Legenda com CTA claro',
    'Hashtags relevantes no nicho',
    'Melhor horário: Terça a Quinta, 9h–11h ou 17h–19h',
  ],
};

// ─── Badge de CTR preditivo ───────────────────────────────────────────────────

function CTRBadge({ value, benchmark, delta }: { value: number; benchmark: number; delta: number }) {
  const isUp = delta >= 0;
  const Icon = delta > 0.05 ? TrendingUp : delta < -0.05 ? TrendingDown : Minus;
  const color = delta > 0.05 ? '#22c55e' : delta < -0.05 ? '#ef4444' : '#f97316';

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-xl"
      style={{
        background: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        border: '1px solid rgba(226,232,240,0.6)',
      }}
    >
      <div className="flex flex-col">
        <span className="text-[10px] text-slate-400">CTR Preditivo</span>
        <span className="text-lg font-bold text-slate-800">{value.toFixed(2)}%</span>
      </div>
      <div className="flex flex-col items-end ml-auto">
        <span className="text-[10px] text-slate-400">vs benchmark</span>
        <div className="flex items-center gap-1" style={{ color }}>
          <Icon size={12} />
          <span className="text-xs font-bold">{delta >= 0 ? '+' : ''}{delta.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CreativePreValidatorProps {
  /** ID único do criativo/campanha */
  creativeId: string;
  /** Nome da campanha ou criativo */
  creativeName: string;
  /** Plataforma de veiculação */
  platform: Platform;
  /** URL da imagem do criativo (opcional) */
  imageUrl?: string;
  /** Callback ao fechar */
  onClose?: () => void;
}

// ─── Estados ──────────────────────────────────────────────────────────────────

type ValidatorState = 'idle' | 'validating' | 'done' | 'error';

// ─── Componente ───────────────────────────────────────────────────────────────

export function CreativePreValidator({
  creativeId,
  creativeName,
  platform,
  imageUrl,
  onClose,
}: CreativePreValidatorProps) {
  const [state, setState] = useState<ValidatorState>('idle');
  const [analysis, setAnalysis] = useState<CreativeAnalysis | null>(null);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showCriteria, setShowCriteria] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validate = async () => {
    setState('validating');
    setAnalysis(null);
    setErrorMessage('');
    try {
      const result = await analyzeVisually({
        creativeName,
        platform,
      });

      setAnalysis({
        id: creativeId,
        platform,
        creativeName,
        imageUrl,
        attentionScore: {
          overall: result.overall,
          criteria: result.criteria,
          analyzedAt: new Date(result.analyzedAt),
          subjectLabel: creativeName,
        },
        heatmap: result.heatmap,
        predictedCTR: result.predictedCTR,
        ctrBenchmark: result.ctrBenchmark,
        ctrDelta: result.ctrDelta,
        aboveFoldScore: result.aboveFoldScore,
        analyzedAt: new Date(result.analyzedAt),
      });
      setState('done');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Erro ao validar o criativo.');
      setState('error');
    }
  };


  const color = analysis ? getScoreColor(analysis.attentionScore.overall) : '#94a3b8';
  const checklist = PLATFORM_CHECKLIST[platform];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'white',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
        border: '1px solid rgba(226,232,240,0.7)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid rgba(226,232,240,0.6)' }}
      >
        <div className="flex items-center gap-3">
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
            <p className="text-sm font-semibold text-slate-800">Pré-validação de Criativo</p>
            <p className="text-[11px] text-slate-400 max-w-[200px] truncate">{creativeName}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Platform badge */}
      <div className="px-5 pt-4 flex items-center gap-2">
        <span
          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold"
          style={{
            background: 'rgba(255,106,0,0.08)',
            color: '#FF6A00',
            border: '1px solid rgba(255,106,0,0.2)',
          }}
        >
          {platform}
        </span>
        <span className="text-[11px] text-slate-400">análise de atenção visual preditiva</span>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4">
        {/* Idle */}
        {state === 'idle' && (
          <div className="flex flex-col items-center gap-4 py-4">
            <p className="text-[12px] text-slate-500 text-center leading-relaxed max-w-[280px]">
              Valide seu criativo antes de veicular. Economize orçamento de mídia evitando anúncios com baixo CTR preditivo.
            </p>
            <button
              onClick={validate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{
                background: 'linear-gradient(135deg, #FF6A00, #FF8805)',
                boxShadow: '0 4px 12px rgba(255,106,0,0.35)',
              }}
            >
              <Sparkles size={14} />
              Validar Criativo
            </button>
          </div>
        )}

        {/* Validating */}
        {state === 'validating' && (
          <div className="flex flex-col items-center gap-3 py-6">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{
                background: 'white',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                border: '1px solid rgba(226,232,240,0.6)',
              }}
            >
              <div
                className="w-8 h-8 rounded-full border-[3px] border-t-orange-500 border-orange-100"
                style={{ animation: 'spin 0.8s linear infinite' }}
              />
            </div>
            <p className="text-sm font-semibold text-slate-700">Validando com IA...</p>
            <p className="text-[11px] text-slate-400">Simulando atenção visual para {platform}</p>
          </div>
        )}

        {/* Estado: error */}
        {state === 'error' && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="text-red-500 text-2xl font-bold">⚠️</span>
            <p className="text-sm font-semibold text-slate-700">Erro na Validação</p>
            <p className="text-[11px] text-slate-400 max-w-[240px]">{errorMessage}</p>
            <button
              onClick={validate}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #FF6A00, #FF8805)' }}
            >
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Done */}
        {state === 'done' && analysis && (
          <>
            {/* Score + CTR lado a lado */}
            <div className="grid grid-cols-2 gap-3">
              <div
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: 'rgba(248,250,252,0.8)',
                  border: '1px solid rgba(226,232,240,0.6)',
                }}
              >
                <ScoreRing score={analysis.attentionScore.overall} size={52} strokeWidth={5} />
                <div>
                  <p className="text-[10px] text-slate-400">Score Visual</p>
                  <p className="text-sm font-bold" style={{ color }}>
                    {getScoreLabel(analysis.attentionScore.overall)}
                  </p>
                </div>
              </div>
              <CTRBadge
                value={analysis.predictedCTR}
                benchmark={analysis.ctrBenchmark}
                delta={analysis.ctrDelta}
              />
            </div>

            {/* Heatmap */}
            <HeatmapViewer
              heatmap={analysis.heatmap}
              imageUrl={imageUrl}
              label={`Mapa de Atenção — ${platform}`}
            />

            {/* Critérios toggle */}
            <button
              onClick={() => setShowCriteria(v => !v)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors w-full"
            >
              {showCriteria ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {showCriteria ? 'Ocultar' : 'Ver'} análise por critério
            </button>

            {showCriteria && (
              <AttentionScoreGrid criteria={analysis.attentionScore.criteria} compact />
            )}

            {/* Checklist da plataforma */}
            <div>
              <button
                onClick={() => setShowChecklist(v => !v)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors w-full"
              >
                {showChecklist ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                Checklist de boas práticas — {platform}
              </button>

              {showChecklist && (
                <div className="mt-3 space-y-2">
                  {checklist.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 px-3 py-2 rounded-xl"
                      style={{
                        background: 'rgba(248,250,252,0.8)',
                        border: '1px solid rgba(226,232,240,0.5)',
                      }}
                    >
                      <span className="text-orange-500 mt-0.5 flex-shrink-0">✓</span>
                      <span className="text-[11px] text-slate-600 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Acima da dobra */}
            <div
              className="flex items-center justify-between px-3 py-2.5 rounded-xl"
              style={{
                background: 'rgba(255,106,0,0.04)',
                border: '1px solid rgba(255,106,0,0.12)',
              }}
            >
              <span className="text-[11px] text-slate-600">Score Above-the-Fold</span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold" style={{ color: getScoreColor(analysis.aboveFoldScore) }}>
                  {analysis.aboveFoldScore}/100
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
