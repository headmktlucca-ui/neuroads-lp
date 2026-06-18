'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Brain,
  Globe,
  TrendingUp,
  Activity,
  AlertTriangle,
  Play,
  RotateCw,
  CheckCircle2,
  Database,
  Cpu,
  Settings,
  Flame,
} from 'lucide-react';

export default function HubDashboard() {
  // Biometric state variables for live fluctuation
  const [activeUsers, setActiveUsers] = useState(14258);
  const [attentionLevel, setAttentionLevel] = useState(87);
  const [emotionalEngagement, setEmotionalEngagement] = useState(74);
  const [memoryRetention, setMemoryRetention] = useState(68);
  const [activeAds, setActiveAds] = useState(450);

  // Fluctuations simulating real-time brain metrics
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveUsers((prev) => prev + Math.floor(Math.random() * 7) - 3);
      setAttentionLevel((prev) => {
        const val = prev + Math.floor(Math.random() * 5) - 2;
        return Math.max(75, Math.min(98, val));
      });
      setEmotionalEngagement((prev) => {
        const val = prev + Math.floor(Math.random() * 5) - 2;
        return Math.max(60, Math.min(90, val));
      });
      setMemoryRetention((prev) => {
        const val = prev + Math.floor(Math.random() * 3) - 1;
        return Math.max(55, Math.min(85, val));
      });
      if (Math.random() > 0.8) {
        setActiveAds((prev) => (prev === 450 ? 449 : 450));
      }
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen w-full pl-20 pr-4 md:pr-8 py-6 text-white font-sans overflow-y-auto">
      {/* Top Header Bar */}
      <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white leading-none">
              Neuroads Campaign Center
            </h1>
            <p className="text-[11px] font-semibold text-[#8fa0b5]/70 mt-1 uppercase tracking-widest">
              Global Bio-Data Monitoring
            </p>
          </div>
        </div>

        {/* Center status pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full bg-slate-950/60 border border-white/5 px-4 py-1.5 text-[11px] font-bold text-[#8fa0b5] flex items-center gap-1.5 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            Coordinates: <span className="text-white">15:3000° N, 15.500° E</span>
          </div>
          <div className="rounded-full bg-slate-950/60 border border-white/5 px-4 py-1.5 text-[11px] font-bold text-[#8fa0b5] flex items-center gap-1.5 backdrop-blur-md">
            24°C - Clear Sky
          </div>
          <div className="rounded-full bg-slate-950/60 border border-white/5 px-4 py-1.5 text-[11px] font-bold text-[#8fa0b5] flex items-center gap-1.5 backdrop-blur-md">
            18km/h - SW
          </div>
        </div>

        {/* Right Info Section */}
        <div className="text-[12px] font-bold text-[#8fa0b5] uppercase tracking-wider hidden xl:block">
          Live Campaign Bio-Metrics
        </div>
      </header>

      {/* Main Grid Layout matching Anexo 02 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* AI Neuro-Ad Optimizer Card */}
          <section className="relative overflow-hidden rounded-[24px] border border-[#2A826A]/40 bg-[#1D4A3E]/20 p-6 backdrop-blur-lg shadow-[0_12px_36px_rgba(2,8,22,0.3)] group hover:border-[#2A826A]/70 transition-all duration-300">
            {/* Background glowing shapes */}
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#10b981]/5 blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-[13px] font-black uppercase tracking-wider text-emerald-400">
                AI Neuro-Ad Optimizer
              </h2>
            </div>

            {/* Glowing Wireframe Brain SVG Animation */}
            <div className="relative my-6 flex justify-center items-center h-48 bg-slate-950/45 rounded-2xl border border-white/5 overflow-hidden">
              <svg viewBox="0 0 200 150" className="w-48 h-36 text-emerald-400/80 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                {/* Left hemisphere brain nodes and wires */}
                <path
                  d="M100,20 C70,20 50,40 50,70 C50,100 70,120 100,125 C85,110 80,90 90,70 C85,60 90,40 100,20 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="animate-pulse"
                />
                {/* Right hemisphere */}
                <path
                  d="M100,20 C130,20 150,40 150,70 C150,100 130,120 100,125 C115,110 120,90 110,70 C115,60 110,40 100,20 Z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                {/* Neural connections / center lines */}
                <line x1="100" y1="20" x2="100" y2="125" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M50,70 Q75,75 100,70" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                <path d="M150,70 Q125,75 100,70" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                <path d="M60,45 Q80,55 100,50" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                <path d="M140,45 Q120,55 100,50" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                <path d="M60,95 Q80,85 100,90" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                <path d="M140,95 Q120,85 100,90" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.6" />

                {/* Nodes with pulsing animations */}
                <circle cx="50" cy="70" r="4" fill="currentColor">
                  <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx="150" cy="70" r="4" fill="currentColor">
                  <animate attributeName="r" values="3;5;3" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx="100" cy="20" r="3" fill="currentColor" />
                <circle cx="100" cy="125" r="3" fill="currentColor" />
                <circle cx="85" cy="45" r="3" fill="currentColor" />
                <circle cx="115" cy="45" r="3" fill="currentColor" />
                <circle cx="75" cy="85" r="3" fill="currentColor" />
                <circle cx="125" cy="85" r="3" fill="currentColor" />
              </svg>
              {/* Scanline overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent h-12 w-full animate-bounce pointer-events-none" />
            </div>

            <h3 className="text-[15px] font-black text-white mb-2 leading-tight">
              AI Neuro-Ad Optimizer
            </h3>
            
            <p className="text-[13px] leading-relaxed text-[#b7cbdc] mb-4">
              <strong>Recomendação Principal:</strong> Realoque orçamento do Anúncio &quot;Lançamento Produto A&quot; para &quot;Recurso B&quot; para o público 18-24. Dados biométricos indicam <span className="text-emerald-400 font-bold">+25% de pico de atenção</span>.
            </p>

            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-[11px] font-bold text-emerald-400 uppercase">
                Platform A
              </span>
              <span className="text-[11px] font-semibold text-[#8fa0b5]/60">
                Atualizado 2m atrás
              </span>
            </div>
          </section>

          {/* Global Bio-Data Sources Map */}
          <section className="rounded-[24px] border border-white/5 bg-slate-950/45 p-6 backdrop-blur-md shadow-[0_12px_36px_rgba(2,8,22,0.25)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-black uppercase tracking-wider text-[#8fa0b5]">
                Global Bio-Data Sources Map
              </h2>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online 6/6
              </span>
            </div>

            {/* World Map SVG Visualizer */}
            <div className="relative my-4 flex justify-center items-center h-40 bg-[#091522]/30 rounded-xl border border-white/5 p-2 overflow-hidden">
              <svg viewBox="0 0 320 180" className="w-full h-full text-slate-800">
                {/* World land outlines (abstract grid circles / simple lines representing continents) */}
                <path
                  d="M30,70 Q60,50 90,60 T140,80 T190,50 T230,70 T290,60"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <path
                  d="M40,110 Q70,95 100,120 T150,115 T220,130 T280,105"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Hotspots matching the image layout (glowing markers) */}
                {/* New York */}
                <g className="cursor-pointer">
                  <circle cx="80" cy="65" r="6" fill="#10b981" className="animate-ping" opacity="0.4" />
                  <circle cx="80" cy="65" r="3" fill="#10b981" />
                  <text x="85" y="62" fill="#8fa0b5" fontSize="8" fontWeight="bold">Nova York</text>
                </g>

                {/* Lisboa */}
                <g className="cursor-pointer">
                  <circle cx="150" cy="75" r="6" fill="#10b981" className="animate-ping" opacity="0.4" />
                  <circle cx="150" cy="75" r="3" fill="#10b981" />
                  <text x="155" y="72" fill="#8fa0b5" fontSize="8" fontWeight="bold">Lisboa</text>
                </g>

                {/* São Paulo */}
                <g className="cursor-pointer">
                  <circle cx="110" cy="125" r="6" fill="#10b981" className="animate-ping" opacity="0.4" />
                  <circle cx="110" cy="125" r="3" fill="#10b981" />
                  <text x="115" y="132" fill="#10b981" fontSize="8" fontWeight="bold">São Paulo</text>
                </g>

                {/* Tóquio */}
                <g className="cursor-pointer">
                  <circle cx="270" cy="70" r="6" fill="#10b981" className="animate-ping" opacity="0.4" />
                  <circle cx="270" cy="70" r="3" fill="#10b981" />
                  <text x="250" y="62" fill="#8fa0b5" fontSize="8" fontWeight="bold">Tóquio</text>
                </g>
              </svg>
            </div>

            {/* Map Legend */}
            <div className="flex justify-between items-center border-t border-white/5 pt-4 text-[11px] font-bold text-[#8fa0b5]">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Norma
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Alerta
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Crítico
              </div>
            </div>
          </section>

        </div>

        {/* Center Column (Span 5) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Main Titles */}
          <div className="py-2">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight uppercase">
              Neuro-Ad Campaign Center
            </h2>
            <p className="text-[13px] font-bold text-emerald-400 uppercase tracking-widest mt-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              15:30 UTC | São Paulo (16:00 - 18:00)
            </p>
          </div>

          {/* Neuro-Ad Performance Trend Chart */}
          <section className="rounded-[24px] border border-white/5 bg-slate-950/45 p-6 backdrop-blur-md shadow-[0_12px_36px_rgba(2,8,22,0.25)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-[13px] font-black uppercase tracking-wider text-[#8fa0b5]">
                  Neuro-Ad Performance Trend
                </h3>
                <p className="text-[11px] font-semibold text-[#8fa0b5]/50 mt-0.5">
                  Biomimetic ROI
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select className="rounded-lg bg-white/5 border border-white/5 px-2.5 py-1 text-xs font-bold text-white outline-none cursor-pointer hover:bg-white/10 transition">
                  <option value="24h">Last 24 h</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                </select>
                <button className="p-1 rounded-lg hover:bg-white/5 text-[#8fa0b5] hover:text-white transition">
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Custom Bar Chart SVG */}
            <div className="my-6 h-56 w-full flex flex-col justify-end">
              <div className="relative w-full h-44 flex items-end justify-between px-2">
                {/* Visual grid lines behind */}
                <div className="absolute inset-x-0 top-0 border-t border-white/5" />
                <div className="absolute inset-x-0 top-1/3 border-t border-white/5" />
                <div className="absolute inset-x-0 top-2/3 border-t border-white/5" />

                {/* Bars - matching the visual layout exactly */}
                <div className="flex flex-col items-center w-8">
                  <div className="w-4 bg-[#1e293b] rounded-t-sm h-16 hover:bg-[#1e293b]/80 transition-all cursor-pointer" />
                  <span className="text-[9px] font-bold text-[#8fa0b5]/60 mt-2">11:00</span>
                </div>
                <div className="flex flex-col items-center w-8">
                  <div className="w-4 bg-[#1e293b] rounded-t-sm h-24 hover:bg-[#1e293b]/80 transition-all cursor-pointer" />
                  <span className="text-[9px] font-bold text-[#8fa0b5]/60 mt-2">11:00</span>
                </div>
                {/* Highlighted Glowing Central Bar */}
                <div className="flex flex-col items-center w-8">
                  <div className="w-4 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-sm h-36 shadow-[0_0_20px_rgba(16,185,129,0.7)] animate-pulse cursor-pointer" />
                  <span className="text-[9px] font-black text-emerald-400 mt-2">12:00</span>
                </div>
                <div className="flex flex-col items-center w-8">
                  <div className="w-4 bg-[#1e293b] rounded-t-sm h-28 hover:bg-[#1e293b]/80 transition-all cursor-pointer" />
                  <span className="text-[9px] font-bold text-[#8fa0b5]/60 mt-2">19:00</span>
                </div>
                <div className="flex flex-col items-center w-8">
                  <div className="w-4 bg-[#1e293b] rounded-t-sm h-20 hover:bg-[#1e293b]/80 transition-all cursor-pointer" />
                  <span className="text-[9px] font-bold text-[#8fa0b5]/60 mt-2">19:00</span>
                </div>
              </div>
            </div>

            {/* Bottom tabs matching Anexo 02 */}
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <div className="flex items-center gap-1.5">
                <button className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 text-xs font-black text-emerald-400">
                  Oil
                </button>
                <button className="rounded-lg hover:bg-white/5 border border-transparent px-3.5 py-1 text-xs font-bold text-[#8fa0b5] hover:text-white transition">
                  Gas
                </button>
                <button className="rounded-lg hover:bg-white/5 border border-transparent px-3.5 py-1 text-xs font-bold text-[#8fa0b5] hover:text-white transition">
                  Combined
                </button>
              </div>
              <span className="text-[11px] font-semibold text-[#8fa0b5]/60">
                Visualização Global
              </span>
            </div>
          </section>

        </div>

        {/* Right Column (Span 3) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Live Campaign Bio-Metrics Widget */}
          <section className="rounded-[24px] border border-white/5 bg-slate-950/45 p-6 backdrop-blur-md shadow-[0_12px_36px_rgba(2,8,22,0.25)]">
            <h2 className="text-[13px] font-black uppercase tracking-wider text-[#8fa0b5] mb-4">
              Live Campaign Bio-Metrics
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {/* Box 1: Atenção Neural */}
              <article className="rounded-xl bg-slate-900/40 border border-white/5 p-3 flex flex-col justify-between h-28">
                <div>
                  <h3 className="text-[11px] font-black text-[#8fa0b5] leading-tight">
                    Atenção Neural (Pico)
                  </h3>
                  <p className="text-lg font-black text-emerald-400 mt-1">
                    {attentionLevel}%
                  </p>
                </div>
                {/* Micro Chart */}
                <div className="flex items-end gap-0.5 h-10 mt-1">
                  {[20, 30, 45, 60, 50, 75, 90, 85].map((h, i) => (
                    <span
                      key={i}
                      className="flex-1 bg-emerald-500 rounded-t-sm"
                      style={{ height: `${h * (attentionLevel / 100)}%` }}
                    />
                  ))}
                </div>
              </article>

              {/* Box 2: Envolvimento Emocional */}
              <article className="rounded-xl bg-slate-900/40 border border-white/5 p-3 flex flex-col justify-between h-28">
                <div>
                  <h3 className="text-[11px] font-black text-[#8fa0b5] leading-tight">
                    Envolvimento Emocional
                  </h3>
                  <p className="text-lg font-black text-slate-300 mt-1">
                    {emotionalEngagement}%
                  </p>
                </div>
                {/* Micro Chart */}
                <div className="flex items-end gap-0.5 h-10 mt-1">
                  {[40, 50, 35, 55, 60, 45, 50, 65].map((h, i) => (
                    <span
                      key={i}
                      className="flex-1 bg-slate-500 rounded-t-sm"
                      style={{ height: `${h * (emotionalEngagement / 100)}%` }}
                    />
                  ))}
                </div>
              </article>

              {/* Box 3: Retenção de Memória */}
              <article className="rounded-xl bg-slate-900/40 border border-white/5 p-3 flex flex-col justify-between h-28">
                <div>
                  <h3 className="text-[11px] font-black text-[#8fa0b5] leading-tight">
                    Retenção de Memória
                  </h3>
                  <p className="text-lg font-black text-emerald-400 mt-1">
                    {memoryRetention}%
                  </p>
                </div>
                {/* Micro Chart */}
                <div className="flex items-end gap-0.5 h-10 mt-1">
                  {[30, 40, 55, 45, 65, 70, 60, 78].map((h, i) => (
                    <span
                      key={i}
                      className="flex-1 bg-emerald-400 rounded-t-sm"
                      style={{ height: `${h * (memoryRetention / 100)}%` }}
                    />
                  ))}
                </div>
              </article>

              {/* Box 4: Anúncios Ativos */}
              <article className="rounded-xl bg-slate-900/40 border border-white/5 p-3 flex flex-col justify-between h-28">
                <div>
                  <h3 className="text-[11px] font-black text-[#8fa0b5] leading-tight">
                    Anúncios Ativos
                  </h3>
                  <p className="text-lg font-black text-white mt-1">
                    {activeAds}/{activeAds}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 mb-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  100% Ativos
                </div>
              </article>
            </div>
          </section>

          {/* Critical Neuro-Asset Status Widget */}
          <section className="rounded-[24px] border border-white/5 bg-slate-950/45 p-6 backdrop-blur-md shadow-[0_12px_36px_rgba(2,8,22,0.25)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[13px] font-black uppercase tracking-wider text-[#8fa0b5]">
                Critical Neuro-Asset Status
              </h2>
              <button className="text-[#8fa0b5] hover:text-white text-xs font-bold transition">
                ↗
              </button>
            </div>

            <div className="space-y-4">
              {/* Asset 1 */}
              <article className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-emerald-400" />
                    <div>
                      <h4 className="text-[12px] font-bold text-white">
                        Modelo de Redes Neurais C-01
                      </h4>
                      <p className="text-[10px] font-medium text-emerald-400">
                        Saúde: 98%
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-[#8fa0b5]/50">Saúde</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '98%' }} />
                </div>
              </article>

              {/* Asset 2 */}
              <article className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-emerald-400" />
                    <div>
                      <h4 className="text-[12px] font-bold text-white">
                        Banco de Dados EEG
                      </h4>
                      <p className="text-[10px] font-medium text-[#8fa0b5]">
                        Saúde: Estável
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-[#8fa0b5]/50">Saúde</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: '85%' }} />
                </div>
              </article>

              {/* Asset 3 */}
              <article className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-amber-400" />
                    <div>
                      <h4 className="text-[12px] font-bold text-white">
                        Processador de Dados
                      </h4>
                      <p className="text-[10px] font-medium text-amber-400">
                        Saúde: Alerta de Carga - Otimizar
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-[#8fa0b5]/50">Saúde</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: '42%' }} />
                </div>
              </article>
            </div>
          </section>

        </div>

      </div>
    </div>
  );
}
