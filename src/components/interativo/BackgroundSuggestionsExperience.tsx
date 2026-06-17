"use client";

import { useState, startTransition } from "react";
import dynamic from "next/dynamic";
import { 
  Brain, 
  Sliders, 
  Activity, 
  Code, 
  Copy, 
  Check, 
  Zap, 
  MousePointer,
  Eye
} from "lucide-react";

// Dynamically import the WebGL canvas to avoid SSR errors
const BackgroundSuggestionsCanvas = dynamic(
  () => import("./3d/BackgroundSuggestions").then((mod) => mod.BackgroundSuggestionsCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 bg-[#06060c] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-medium text-sm animate-pulse">Iniciando Engine WebGL...</p>
        </div>
      </div>
    ),
  }
);

export function BackgroundSuggestionsExperience() {
  const [activeOption, setActiveOption] = useState<number>(1);
  const [parallaxIntensity, setParallaxIntensity] = useState<number>(1.0);
  const [particleDensity, setParticleDensity] = useState<number>(1.0);
  const [glowIntensity, setGlowIntensity] = useState<number>(1.2);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopyCode = () => {
    const codeSnippet = `// Como integrar este background no seu componente/página Next.js:
import dynamic from "next/dynamic";

const NeuralBackground = dynamic(
  () => import("@/components/interativo/3d/BackgroundSuggestions").then((mod) => mod.BackgroundSuggestionsCanvas),
  { ssr: false }
);

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      {/* Background Layer */}
      <div className="fixed inset-0 -z-10">
        <NeuralBackground
          activeOption={${activeOption}}
          parallaxIntensity={${parallaxIntensity.toFixed(1)}}
          particleDensity={${particleDensity.toFixed(1)}}
          glowIntensity={${glowIntensity.toFixed(1)}}
          reducedMotion={${reducedMotion}}
        />
      </div>
      
      {/* Conteúdo do seu site aqui */}
    </div>
  );
}`;
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const getOptionDescription = () => {
    switch (activeOption) {
      case 1:
        return "Constelação de partículas tridimensionais ligadas por linhas que pulsam em tons de azul e laranja. O movimento do mouse aplica atração gravitacional e acentua o brilho dos caminhos próximos.";
      case 2:
        return "Cabos sinápticos curvos transportando potenciais de ação luminosos em loop contínuo. Ao mover o mouse, a velocidade dos impulsos acelera e as ondas se curvam dinamicamente.";
      case 3:
        return "Malha matemática 3D contínua simulando ondas cerebrais. O mouse cria ondulações de relevo e altera a transição cromática local para um gradiente neon de alta fidelidade.";
      default:
        return "";
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex flex-col md:flex-row text-slate-100 font-sans">
      
      {/* WebGL Render Viewport */}
      <div className="absolute inset-0 z-0">
        <BackgroundSuggestionsCanvas
          activeOption={activeOption}
          parallaxIntensity={reducedMotion ? 0 : parallaxIntensity}
          particleDensity={particleDensity}
          glowIntensity={glowIntensity}
          reducedMotion={reducedMotion}
        />
      </div>

      {/* Mouse Interaction Indicator */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/40 border border-slate-800/40 backdrop-blur-md text-xs text-slate-400">
        <MousePointer className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
        <span>Mova o mouse sobre a tela para o efeito paralaxe 3D</span>
      </div>

      {/* Main Glassmorphic Panel */}
      <div className="relative z-10 w-full md:w-[460px] h-full md:max-h-screen overflow-y-auto bg-slate-950/60 md:bg-slate-950/45 border-b md:border-b-0 md:border-r border-slate-800/50 backdrop-blur-xl flex flex-col justify-between p-6 md:p-8 shadow-2xl">
        
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-semibold tracking-wide text-orange-400 uppercase">
              <Brain className="w-3.5 h-3.5 animate-pulse" />
              NeuroAds Labs
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
              Backgrounds 3D
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Sugestões de fundos WebGL em loop interativo com paralaxe e física reativa ao cursor do mouse.
            </p>
          </div>

          {/* Theme Selector Tabs */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-orange-400" /> Selecionar Opção
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 1, label: "01. Constelação" },
                { id: 2, label: "02. Fluxo" },
                { id: 3, label: "03. Malha" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => startTransition(() => setActiveOption(opt.id))}
                  className={`py-3 px-1 rounded-lg font-medium text-xs border transition-all duration-200 cursor-pointer ${
                    activeOption === opt.id
                      ? "bg-gradient-to-r from-orange-600/90 to-orange-500/90 border-orange-400 text-white shadow-[0_0_12px_rgba(239,68,68,0.25)] scale-102"
                      : "bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:text-white hover:border-slate-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="p-3.5 rounded-lg bg-slate-900/40 border border-slate-800/30 text-xs text-slate-400 leading-relaxed animate-fadeIn">
              {getOptionDescription()}
            </div>
          </div>

          {/* Parameter Sliders */}
          <div className="space-y-5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-orange-400" /> Customizar Parâmetros
            </label>

            {/* Parallax Intensity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">Intensidade Paralaxe</span>
                <span className="text-orange-400 font-mono">{parallaxIntensity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.0"
                max="2.0"
                step="0.1"
                value={parallaxIntensity}
                onChange={(e) => setParallaxIntensity(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            {/* Connection Density */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">Densidade de Nós</span>
                <span className="text-orange-400 font-mono">{Math.round(particleDensity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.3"
                max="2.0"
                step="0.1"
                value={particleDensity}
                onChange={(e) => setParticleDensity(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            {/* Glow Intensity */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-300">Brilho Emissivo (Shader)</span>
                <span className="text-orange-400 font-mono">{glowIntensity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={glowIntensity}
                onChange={(e) => setGlowIntensity(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>

            {/* Reduced Motion Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800/40">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-200">Modo Acessibilidade</span>
                <p className="text-[10px] text-slate-500">Pausa animações complexas em loop (reduced-motion)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => setReducedMotion(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>
          </div>

          {/* Code Integration Accordion */}
          <div className="space-y-2">
            <button
              onClick={handleCopyCode}
              className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer active:scale-[0.99]"
            >
              <span className="flex items-center gap-2 text-slate-300">
                <Code className="w-3.5 h-3.5 text-orange-400" /> Copiar Código de Importação
              </span>
              {copied ? (
                <span className="flex items-center gap-1 text-emerald-400 text-[10px] font-semibold animate-pulse">
                  <Check className="w-3 h-3" /> Copiado!
                </span>
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300" />
              )}
            </button>
          </div>
        </div>

        {/* Footer Metrics */}
        <div className="mt-8 pt-4 border-t border-slate-800/40 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-orange-500" /> WebGL 2.0 Ativo
          </span>
          <span className="flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-emerald-500 animate-pulse" /> 60 FPS Estável
          </span>
        </div>

      </div>
    </div>
  );
}
