'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Eye, EyeOff, Download } from 'lucide-react';
import type { HeatmapData, HeatmapFocusPoint } from '../../../lib/visual-analysis';

// ─── Utilitário: desenhar heatmap no canvas ───────────────────────────────────

function drawHeatmap(
  canvas: HTMLCanvasElement,
  heatmap: HeatmapData,
  opacity: number = 0.72
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  heatmap.focusPoints.forEach((pt: HeatmapFocusPoint) => {
    const x = pt.x * w;
    const y = pt.y * h;
    const r = pt.radius * (w / 1200); // escala relativa ao canvas

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0,   `rgba(255, 30,  30,  ${pt.intensity * opacity})`);
    gradient.addColorStop(0.3, `rgba(255, 120, 0,   ${pt.intensity * opacity * 0.7})`);
    gradient.addColorStop(0.6, `rgba(255, 220, 0,   ${pt.intensity * opacity * 0.4})`);
    gradient.addColorStop(1,   `rgba(0,   100, 255, 0)`);

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  });

  // Linha "above the fold"
  if (heatmap.aboveFoldY) {
    const foldY = heatmap.aboveFoldY * h;
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = 'rgba(100,116,139,0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, foldY);
    ctx.lineTo(w, foldY);
    ctx.stroke();

    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(100,116,139,0.6)';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('Above the fold ↑', 8, foldY - 6);
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface HeatmapViewerProps {
  heatmap: HeatmapData;
  imageUrl?: string;     // imagem de fundo (placeholder se não fornecida)
  label?: string;
  className?: string;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function HeatmapViewer({ heatmap, imageUrl, label, className = '' }: HeatmapViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [opacity, setOpacity] = useState(0.72);

  useEffect(() => {
    if (!canvasRef.current || !showHeatmap) {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      return;
    }
    drawHeatmap(canvasRef.current, heatmap, opacity);
  }, [heatmap, showHeatmap, opacity]);

  const aspectRatio = heatmap.height / heatmap.width;

  return (
    <div className={`rounded-2xl overflow-hidden ${className}`}
      style={{
        background: 'white',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        border: '1px solid rgba(226,232,240,0.6)',
      }}
    >
      {/* Barra de controles */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <span className="text-xs font-semibold text-slate-600">
          {label ?? 'Mapa de Calor Preditivo'}
        </span>
        <div className="flex items-center gap-2">
          {/* Slider de opacidade */}
          {showHeatmap && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400">Intensidade</span>
              <input
                type="range"
                min={0.2}
                max={1}
                step={0.05}
                value={opacity}
                onChange={e => setOpacity(Number(e.target.value))}
                className="w-16 accent-orange-500"
              />
            </div>
          )}
          {/* Toggle heatmap */}
          <button
            onClick={() => setShowHeatmap(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all"
            style={{
              background: showHeatmap
                ? 'linear-gradient(135deg, #FF6A00, #FF8805)'
                : 'rgba(248,250,252,0.8)',
              color: showHeatmap ? 'white' : '#64748b',
              border: showHeatmap ? 'none' : '1px solid rgba(226,232,240,0.8)',
              boxShadow: showHeatmap ? '0 2px 8px rgba(255,106,0,0.3)' : undefined,
            }}
          >
            {showHeatmap ? <Eye size={12} /> : <EyeOff size={12} />}
            {showHeatmap ? 'Heatmap' : 'Original'}
          </button>
        </div>
      </div>

      {/* Canvas overlay sobre imagem */}
      <div
        className="relative w-full overflow-hidden"
        style={{ paddingBottom: `${aspectRatio * 100}%` }}
      >
        {/* Fundo: imagem ou placeholder gradient */}
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="Criativo"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)',
            }}
          >
            {/* Grid de placeholder */}
            <div className="absolute inset-0 flex flex-col">
              {/* "Título" mock */}
              <div className="px-8 pt-8">
                <div className="h-6 rounded-lg bg-slate-200/70 w-2/3 mb-3" />
                <div className="h-4 rounded bg-slate-200/50 w-1/2 mb-2" />
                <div className="h-4 rounded bg-slate-200/50 w-5/12" />
              </div>
              {/* "CTA" mock */}
              <div className="px-8 mt-6">
                <div
                  className="h-10 rounded-xl w-40"
                  style={{ background: 'linear-gradient(135deg, #FF6A0040, #FF880540)' }}
                />
              </div>
              {/* Mensagem de placeholder */}
              <div className="flex-1 flex items-end justify-center pb-4">
                <span className="text-xs text-slate-400">Prévia do criativo (imagem não carregada)</span>
              </div>
            </div>
          </div>
        )}

        {/* Canvas do heatmap */}
        <canvas
          ref={canvasRef}
          width={heatmap.width}
          height={heatmap.height}
          className="absolute inset-0 w-full h-full"
          style={{
            mixBlendMode: 'multiply',
            opacity: showHeatmap ? 1 : 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
          }}
        />

        {/* Legenda */}
        {showHeatmap && (
          <div
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
            style={{
              background: 'rgba(255,255,255,0.92)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="flex gap-1 items-center">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF1E1E' }} />
              <span className="text-[9px] text-slate-500">Alta</span>
            </div>
            <div className="flex gap-1 items-center">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF8800' }} />
              <span className="text-[9px] text-slate-500">Média</span>
            </div>
            <div className="flex gap-1 items-center">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#0064FF' }} />
              <span className="text-[9px] text-slate-500">Baixa</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
