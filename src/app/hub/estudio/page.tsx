'use client';

import React, { useState } from 'react';
import { Settings2, Zap, Play, Wand2, Download, Image as ImageIcon, Volume2 } from 'lucide-react';

export default function HubEstudioPage() {
  const [prompt, setPrompt] = useState('Uma cena de renderização 3D de alta qualidade mostrando um estúdio de marketing futurista, luzes neon sutis, atmosfera profissional.');
  const [temperature, setTemperature] = useState(0.7);

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Sidebar Controls */}
      <div className="w-80 shrink-0 flex flex-col rounded-3xl bg-[#0d1a2a]/40 border border-[#FF6A00]/20 backdrop-blur-md overflow-hidden shadow-lg">
        <div className="p-5 border-b border-white/[0.06] bg-white/[0.02]">
          <h2 className="text-[15px] font-bold text-white flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-[#FF6A00]" /> Parâmetros
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-subtle">
          
          <div className="space-y-3">
            <label className="text-[12px] font-bold uppercase tracking-wider text-[#8fa0b5]">Modelo</label>
            <div className="relative">
              <select className="w-full appearance-none bg-[#08101e] border border-white/[0.1] rounded-xl px-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-[#FF6A00]/50 focus:ring-1 focus:ring-[#FF6A00]/50 transition-all">
                <option>NeuroAds Vision v2</option>
                <option>Flux Pro</option>
                <option>Midjourney v6 Integration</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <Zap className="w-4 h-4 text-[#8fa0b5]" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[12px] font-bold uppercase tracking-wider text-[#8fa0b5]">Dimensões</label>
            <div className="grid grid-cols-2 gap-2">
              <button className="py-2 rounded-xl bg-gradient-to-r from-[#F24900] to-[#FF8805] text-white text-[13px] font-semibold border border-[#FF6A00] shadow-[0_0_15px_rgba(255,106,0,0.2)]">16:9</button>
              <button className="py-2 rounded-xl bg-[#08101e] text-[#8fa0b5] hover:text-white border border-white/[0.1] hover:border-white/[0.2] text-[13px] font-semibold transition-all">9:16</button>
              <button className="py-2 rounded-xl bg-[#08101e] text-[#8fa0b5] hover:text-white border border-white/[0.1] hover:border-white/[0.2] text-[13px] font-semibold transition-all">1:1</button>
              <button className="py-2 rounded-xl bg-[#08101e] text-[#8fa0b5] hover:text-white border border-white/[0.1] hover:border-white/[0.2] text-[13px] font-semibold transition-all">4:5</button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-bold uppercase tracking-wider text-[#8fa0b5]">Criatividade (Temperature)</label>
              <span className="text-[12px] text-white font-mono bg-white/[0.05] px-2 py-0.5 rounded">{temperature.toFixed(1)}</span>
            </div>
            <input 
              type="range" 
              min="0" max="1" step="0.1" 
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="w-full accent-[#FF6A00] bg-white/[0.1] rounded-lg h-1.5 appearance-none cursor-pointer" 
            />
          </div>

          <div className="space-y-3">
            <label className="text-[12px] font-bold uppercase tracking-wider text-[#8fa0b5]">Estilo</label>
            <div className="flex flex-wrap gap-2">
              {['Cinematográfico', 'Realista', '3D Render', 'Minimalista'].map(style => (
                <span key={style} className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[12px] text-[#8fa0b5] hover:text-white hover:bg-white/[0.08] hover:border-white/[0.1] cursor-pointer transition-colors">
                  {style}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Main Studio Area */}
      <div className="flex-1 flex flex-col gap-6">
        
        {/* Prompt Input */}
        <div className="rounded-3xl bg-[#0d1a2a]/40 border border-white/[0.06] backdrop-blur-md overflow-hidden flex flex-col shadow-lg">
          <div className="p-3 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
             <span className="text-[12px] font-bold uppercase tracking-wider text-[#8fa0b5] ml-2">Prompt</span>
             <div className="flex gap-2">
               <button className="p-2 text-[#8fa0b5] hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors" title="Audio Prompt">
                 <Volume2 className="w-4 h-4" />
               </button>
               <button className="flex items-center gap-2 px-4 py-1.5 bg-white text-[#08101e] font-bold text-[13px] rounded-lg hover:bg-gray-200 transition-colors">
                 <Wand2 className="w-4 h-4" /> Melhorar
               </button>
             </div>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 bg-transparent text-white placeholder:text-[#8fa0b5] p-5 focus:outline-none resize-none text-[15px] leading-relaxed"
            placeholder="Descreva o que você deseja criar..."
          />
          <div className="p-3 border-t border-white/[0.06] flex justify-end bg-gradient-to-t from-[#08101e] to-transparent">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#F24900] to-[#FF8805] hover:from-[#d93f00] hover:to-[#e07500] text-white font-bold text-[14px] rounded-xl transition-all shadow-[0_0_20px_rgba(255,106,0,0.4)]">
              <Play className="w-4 h-4 fill-white" /> Gerar Conteúdo
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 rounded-3xl border border-white/[0.06] border-dashed bg-[#08101e]/50 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
          
          <div className="relative z-10 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center">
               <ImageIcon className="w-8 h-8 text-[#8fa0b5]/50" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Área de Preview</h3>
              <p className="text-[#8fa0b5] text-[14px] mt-1 max-w-sm">O conteúdo gerado aparecerá aqui. Clique em &quot;Gerar Conteúdo&quot; para iniciar o processo.</p>
            </div>
          </div>

          {/* Action overlay (visible on hover if content existed) */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <button className="p-2.5 bg-white/[0.1] hover:bg-white/[0.2] backdrop-blur text-white rounded-xl transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
