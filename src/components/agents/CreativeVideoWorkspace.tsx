'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Sparkles, Video, Volume2, Clock, Check, Download, Layers } from 'lucide-react';

export type VideoScene = {
  id: string;
  timeRange: string; // Ex: "0s - 3s"
  start: number; // in seconds
  end: number;
  type: 'Gancho' | 'Agitação' | 'Oferta' | 'CTA';
  visualDescription: string;
  spokenText: string;
  overlayText: string;
};

type CreativeVideoWorkspaceProps = {
  initialScenes: VideoScene[];
  backgroundImageUrl: string;
  primaryColor: string;
  secondaryColor: string;
  companyName: string;
  ctaText: string;
};

export default function CreativeVideoWorkspace({
  initialScenes,
  backgroundImageUrl,
  primaryColor,
  secondaryColor,
  companyName,
  ctaText
}: CreativeVideoWorkspaceProps) {
  const [scenes, setScenes] = useState<VideoScene[]>(
    initialScenes.length
      ? initialScenes
      : [
          { id: '1', timeRange: '0s - 3s', start: 0, end: 3, type: 'Gancho', visualDescription: 'Estúdio moderno com fundo abstrato escuro e texturizado. Transição de texto em zoom explosivo de entrada.', spokenText: 'Se você está cansado de ver suas campanhas gastarem rios de dinheiro no Meta sem gerar leads qualificados...', overlayText: 'SEU ORÇAMENTO ESTÁ SENDO DRENADO?' },
          { id: '2', timeRange: '3s - 10s', start: 3, end: 10, type: 'Agitação', visualDescription: 'Efeito de desfoque suave de zoom no fundo. Entrada gradual do texto de legenda dividida em blocos.', spokenText: 'O erro número um é insistir em criativos genéricos. Nosso agente gera o DNA da sua marca e cria copies cirúrgicas baseadas em dados reais dos seus anúncios.', overlayText: 'PARE DE INSISTIR NO GENÉRICO' },
          { id: '3', timeRange: '10s - 15s', start: 10, end: 15, type: 'CTA', visualDescription: 'Fundo escurecido. Um botão de chamada para ação elegante pisca no centro inferior com uma seta dinâmica.', spokenText: 'Não espere mais. Clique no botão de Saiba Mais agora mesmo e garanta sua demonstração estratégica gratuita.', overlayText: 'GARANTA SEU DIAGNÓSTICO GRATUITO!' }
        ]
  );
  
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // in seconds, 0 to 15
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [isExportingScript, setIsExportingScript] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const duration = 15; // fixed video duration in seconds for simulated Reels/Tiktok ad

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            if (intervalRef.current) clearInterval(intervalRef.current);
            return 0;
          }
          return Number((prev + 0.1).toFixed(1));
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  // Determine active scene based on progress
  useEffect(() => {
    const sceneIdx = scenes.findIndex((scene) => progress >= scene.start && progress <= scene.end);
    if (sceneIdx !== -1) {
      setActiveSceneIndex(sceneIdx);
    }
  }, [progress, scenes]);

  const activeScene = scenes[activeSceneIndex] || scenes[0];

  const updateSceneText = (idx: number, key: keyof VideoScene, value: string) => {
    const updated = scenes.map((scene, i) => {
      if (i === idx) {
        return { ...scene, [key]: value };
      }
      return scene;
    });
    setScenes(updated);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
    setActiveSceneIndex(0);
  };

  const handleDownloadScript = () => {
    setIsExportingScript(true);
    setExportSuccess(false);

    try {
      const content = [
        `Roteiro de Vídeo Curto (Reels / TikTok) • ${companyName}`,
        `Duração Estimada: ${duration} segundos`,
        `Estilo de Design: Estúdio Híbrido`,
        '=========================================',
        ''
      ];

      scenes.forEach((scene, i) => {
        content.push(
          `CENA ${i + 1} [${scene.timeRange}] - Foco: ${scene.type}`,
          `Direção Visual: ${scene.visualDescription}`,
          `Texto Falado (Locução): "${scene.spokenText}"`,
          `Legenda (Texto em Tela): [${scene.overlayText}]`,
          '-----------------------------------------',
          ''
        );
      });

      const blob = new Blob([content.join('\n')], { type: 'text/plain;charset=utf-8' });
      const href = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = href;
      anchor.download = `neuroads-roteiro-video-${Date.now()}.txt`;
      anchor.click();
      URL.revokeObjectURL(href);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2000);
    } catch (err) {
      console.error('Erro ao baixar roteiro:', err);
    } finally {
      setIsExportingScript(false);
    }
  };

  // Dynamic animations classes based on current progress/scene
  const isHookActive = activeScene.type === 'Gancho';
  const isCTAActive = activeScene.type === 'CTA';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* LEFT: Live Animated Mobile Player Frame */}
      <div className="xl:col-span-5 flex flex-col items-center space-y-4">
        {/* Smartphone Wrapper 9:16 */}
        <div className="relative w-full max-w-[280px] aspect-[9/16] rounded-[36px] p-2 bg-[#0F172A] border-4 border-[#334155] shadow-2xl overflow-hidden group">
          {/* Simulated camera notch */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#0F172A] rounded-full z-30 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1e293b] mr-2" />
            <span className="w-1 h-1 rounded-full bg-[#1e293b]" />
          </div>

          {/* Video Scene Content Area */}
          <div className="relative w-full h-full rounded-[28px] overflow-hidden select-none bg-[#0B0F19]">
            {/* Background Zoom / Motion simulation */}
            <div
              className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${
                isPlaying ? 'scale-110' : 'scale-100'
              }`}
              style={{
                backgroundImage: `url('${backgroundImageUrl}')`,
                filter: isCTAActive ? 'blur(4px) brightness(0.4)' : 'none'
              }}
            />

            {/* Simulated overlays */}
            <div
              className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/60 z-10"
              style={{ backgroundColor: `${primaryColor}15` }}
            />

            {/* Dynamic UI Legend & text overlay inside video */}
            <div className="absolute inset-0 p-5 flex flex-col justify-between text-white z-20 pt-10">
              
              {/* Profile card on top */}
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                >
                  {companyName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-[9px] font-black tracking-wide leading-none">{companyName}</p>
                  <p className="text-[7px] text-[#A0AEC0] font-bold mt-0.5 uppercase tracking-wider">Patrocinado</p>
                </div>
              </div>

              {/* Dynamic Overlaid Legenda / Text animations */}
              <div className="my-auto text-center px-2 space-y-4">
                {/* Shake/Pulse text effect for hook, zoom for offer */}
                <h4
                  className={`text-lg font-black tracking-tighter uppercase font-sans break-words transition-all duration-300 leading-none ${
                    isHookActive ? 'text-[#FF6B00] scale-105 animate-pulse' : 'text-white scale-100'
                  }`}
                  style={{ textShadow: '0 4px 12px rgba(0,0,0,0.8)' }}
                >
                  {activeScene.overlayText}
                </h4>

                {/* Subtitle simulated auto captions */}
                <p
                  className="text-[10px] text-[#E2E8F0] tracking-wide leading-relaxed font-semibold px-1"
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}
                >
                  {activeScene.spokenText}
                </p>
              </div>

              {/* CTA button (slides in during CTA scene) */}
              <div className="space-y-4">
                <div
                  className={`w-full flex items-center justify-center transition-all duration-500 ${
                    isCTAActive ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-6 opacity-0 scale-90'
                  }`}
                >
                  <button
                    type="button"
                    className="w-full py-2.5 rounded-xl text-center text-xs font-black uppercase tracking-widest shadow-[0_8px_16px_rgba(0,0,0,0.3)] animate-bounce border"
                    style={{
                      backgroundColor: secondaryColor || '#FF6B00',
                      borderColor: `${secondaryColor || '#FF6B00'}dd`,
                      color: '#FFFFFF'
                    }}
                  >
                    {ctaText} »
                  </button>
                </div>

                {/* Progress bar inside video bottom */}
                <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-100"
                    style={{
                      width: `${(progress / duration) * 100}%`,
                      backgroundColor: secondaryColor || '#FF6B00'
                    }}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Player controls */}
        <div className="flex items-center gap-3 bg-[#F1F5F9] px-4 py-2.5 rounded-full border border-[#E2E8F0] shadow-sm select-none">
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 rounded-full bg-white text-text-main shadow hover:scale-105 active:scale-98 transition-all"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>
          
          <button
            type="button"
            onClick={handleReset}
            className="p-1 rounded-full text-text-muted hover:text-text-main"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <span className="text-[10px] font-black uppercase text-text-muted">
            {progress.toFixed(1)}s / {duration}s
          </span>

          <div className="flex items-center gap-1.5 text-text-muted">
            <Volume2 className="h-3.5 w-3.5" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Simulação</span>
          </div>
        </div>
      </div>

      {/* RIGHT: Video Script Storyboard & Text Customizer */}
      <div className="xl:col-span-7 space-y-6">
        <header className="border-b border-[#E2E8F0] pb-4">
          <span className="inline-flex items-center gap-1 bg-[#FFF4EC] text-[#FF6B00] border border-[#FFE4D1] px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <Sparkles className="h-3 w-3 animate-pulse" />
            Storyboard & Script do Vídeo
          </span>
          <h2 className="mt-2 text-xl font-black text-text-main">Legendas e Roteiro de Locução</h2>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            Personalize as falas da locução de inteligência artificial e os textos em tela. A simulação à esquerda reflete suas edições.
          </p>
        </header>

        {/* Storyboard timeline checklist */}
        <div className="space-y-4">
          {scenes.map((scene, idx) => {
            const active = idx === activeSceneIndex;
            return (
              <article
                key={scene.id}
                onClick={() => {
                  setActiveSceneIndex(idx);
                  setProgress(scene.start);
                }}
                className={`rounded-2xl border p-4 transition-all cursor-pointer ${
                  active
                    ? 'border-[#FF9A63] bg-[#FFF8F3] shadow-md scale-102'
                    : 'border-[#E4EAF2] bg-[#FCFDFF] hover:border-[#D6DEE8]'
                }`}
              >
                <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#DCE8FF] bg-[#F5F9FF] px-2.5 py-0.5 text-[9px] font-black uppercase text-[#1E3A8A]">
                      Cena {idx + 1}
                    </span>
                    <span className="text-xs font-black text-text-main">{scene.type}</span>
                  </div>

                  <span className="text-[10px] font-bold text-text-muted flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {scene.timeRange}
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Visual direction */}
                  <p className="text-[10px] text-text-muted italic leading-relaxed">
                    <strong>Direção Visual:</strong> {scene.visualDescription}
                  </p>

                  {/* Caption edit */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-text-dim mb-1">
                      Legenda em Tela (Máx 40 caracteres)
                    </label>
                    <input
                      type="text"
                      value={scene.overlayText}
                      onChange={(e) => updateSceneText(idx, 'overlayText', e.target.value)}
                      className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-xs text-text-main font-bold focus:border-[#FF6B00]"
                    />
                  </div>

                  {/* Locution text edit */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-text-dim mb-1">
                      Locução Falada (Mensagem de Voz)
                    </label>
                    <textarea
                      rows={2}
                      value={scene.spokenText}
                      onChange={(e) => updateSceneText(idx, 'spokenText', e.target.value)}
                      className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-xs leading-relaxed text-text-main focus:border-[#FF6B00]"
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Global Strategy tip */}
        <section className="bg-[#FBFCFD] border border-[#E7ECF3] p-4 rounded-xl text-xs text-text-dim flex gap-2.5 items-start">
          <Layers className="h-4 w-4 text-[#FF6B00] mt-0.5 shrink-0" />
          <div>
            <p className="font-black uppercase tracking-wide text-text-main mb-1">Estratégia Neuro-Vídeo</p>
            <p className="leading-relaxed">
              O gancho inicial explosivo de 3 segundos retém a atenção em Stories/Tiktok, e a locução agita o problema do lead de forma assertiva antes de apresentar a sua chamada direta com animações e CTAs pulsantes na tela.
            </p>
          </div>
        </section>

        {/* Download action */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleDownloadScript}
            disabled={isExportingScript}
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-black uppercase tracking-[0.08em] transition-all ${
              exportSuccess
                ? 'bg-[#08B760] text-white'
                : 'bg-[#FF6B00] text-white hover:brightness-105 shadow-[0_10px_22px_rgba(255,107,0,0.30)]'
            }`}
          >
            {exportSuccess ? (
              <>
                <Check className="h-4 w-4" />
                Roteiro Salvo com Sucesso!
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Baixar Roteiro e Cenas (TXT)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
