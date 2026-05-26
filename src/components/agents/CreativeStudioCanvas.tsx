'use client';

import { useRef, useState, useEffect } from 'react';
import { Download, Check, Sparkles, Type, Eye, Layers, Palette, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';

// Output format of our generator
export type StudioCreativeData = {
  id: string;
  title: string;
  concept: string;
  copy: string;
  cta: string;
  headline: string;
  subheading: string;
  backgroundImageUrl: string;
  channel: string;
  format: string;
  contentType: string;
};

type CreativeStudioCanvasProps = {
  creative: StudioCreativeData;
  onChange: (updated: StudioCreativeData) => void;
  primaryColor: string;
  secondaryColor: string;
  companyName: string;
};

type AspectRatioKey = 'feed' | 'stories' | 'banner';

const ASPECT_RATIO_PRESETS: Record<AspectRatioKey, { name: string; class: string; style: React.CSSProperties }> = {
  feed: {
    name: 'Feed (1:1)',
    class: 'aspect-square w-full max-w-[420px]',
    style: { aspectRatio: '1/1' }
  },
  stories: {
    name: 'Stories / Reels (9:16)',
    class: 'aspect-[9/16] w-full max-w-[320px]',
    style: { aspectRatio: '9/16' }
  },
  banner: {
    name: 'Banner Display (16:9)',
    class: 'aspect-[16/9] w-full max-w-[500px]',
    style: { aspectRatio: '16/9' }
  }
};

const FONTS = [
  { id: 'font-sans', name: 'Inter (SaaS Clean)', class: 'font-sans' },
  { id: 'font-outfit', name: 'Outfit (Modern Bold)', class: 'font-sans font-black tracking-tight' },
  { id: 'font-serif', name: 'Lora (Editorial Serif)', class: 'font-serif italic' }
];

export default function CreativeStudioCanvas({
  creative,
  onChange,
  primaryColor,
  secondaryColor,
  companyName
}: CreativeStudioCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [aspectKey, setAspectKey] = useState<AspectRatioKey>('feed');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(45); // 0 to 100
  const [selectedFont, setSelectedFont] = useState<string>('font-outfit');
  const [showLogo, setShowLogo] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  // Sync format of preset with user selection if it matches
  useEffect(() => {
    const formatLower = creative.format.toLowerCase();
    if (formatLower.includes('stories') || formatLower.includes('vertical')) {
      setAspectKey('stories');
    } else if (formatLower.includes('banner') || formatLower.includes('horizontal') || formatLower.includes('display')) {
      setAspectKey('banner');
    } else {
      setAspectKey('feed');
    }
  }, [creative.format]);

  // Download high-resolution PNG using html2canvas
  const handleExportPng = async () => {
    if (!canvasRef.current || isExporting) return;

    setIsExporting(true);
    setExportSuccess(false);

    try {
      // 1. Give DALL-E image time to load completely
      await new Promise((resolve) => setTimeout(resolve, 600));

      // 2. Capture the exact node with a 2x scale for sharp output on high-res displays
      const canvas = await html2canvas(canvasRef.current, {
        useCORS: true,
        scale: 2,
        backgroundColor: null,
        logging: false,
        allowTaint: true
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `neuroads-criativo-${creative.channel.toLowerCase()}-${aspectKey}-${creative.id}.png`;
      link.click();

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao exportar criativo:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const currentFont = FONTS.find((f) => f.id === selectedFont) || FONTS[0];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* LEFT: Live Interactive Preview */}
      <div className="xl:col-span-6 flex flex-col items-center justify-center space-y-4">
        {/* Aspect Ratio Selector */}
        <div className="flex bg-[#F1F5F9] p-1.5 rounded-full border border-[#E2E8F0] gap-1">
          {(Object.keys(ASPECT_RATIO_PRESETS) as AspectRatioKey[]).map((key) => {
            const active = aspectKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setAspectKey(key)}
                className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${
                  active
                    ? 'bg-white text-text-main shadow-sm'
                    : 'text-text-muted hover:text-text-main'
                }`}
              >
                {ASPECT_RATIO_PRESETS[key].name}
              </button>
            );
          })}
        </div>

        {/* Outer Frame (Shadow & Glass Glow) */}
        <div className="w-full flex items-center justify-center p-6 bg-gradient-to-br from-[#F8FAFC] to-[#EDF2F7] rounded-[24px] border border-[#E2E8F0] shadow-inner min-h-[460px]">
          {/* Capture Area (html2canvas) */}
          <div
            ref={canvasRef}
            style={ASPECT_RATIO_PRESETS[aspectKey].style}
            className={`relative overflow-hidden rounded-[16px] shadow-2xl transition-all duration-300 border border-black/10 select-none ${ASPECT_RATIO_PRESETS[aspectKey].class}`}
          >
            {/* Background Image (DALL-E or curated stock) */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-300 scale-100 hover:scale-105"
              style={{ backgroundImage: `url('${creative.backgroundImageUrl}')` }}
            />

            {/* Overlays: Gradient + Brand Hue Contrast overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-black/30 to-black/10 transition-opacity"
              style={{ backgroundColor: `${primaryColor}22` }} // subtle primary tint
            />
            <div
              className="absolute inset-0 bg-black transition-opacity duration-200"
              style={{ opacity: overlayOpacity / 100 }}
            />

            {/* Content Layer (Flex alignment based on aspect ratios) */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between text-white z-10">
              {/* TOP HEADER: Brand Profile */}
              <div className="flex items-center justify-between">
                {showLogo && (
                  <div className="flex items-center gap-2">
                    {/* Simulated avatar with brand primary/secondary background */}
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black tracking-tighter"
                      style={{
                        background: `linear-gradient(135deg, ${primaryColor || '#FF6B00'}, ${secondaryColor || '#FF8F1F'})`
                      }}
                    >
                      {companyName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[11px] font-black leading-none uppercase tracking-wide">
                        {companyName}
                      </p>
                      <p className="text-[8px] text-[#A0AEC0] font-bold uppercase tracking-wider mt-0.5">
                        Patrocinado • {creative.channel}
                      </p>
                    </div>
                  </div>
                )}
                {/* Platform badge */}
                <span className="text-[8px] bg-white/20 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {creative.contentType}
                </span>
              </div>

              {/* CENTER/BOTTOM: Main Headlines */}
              <div className="space-y-3 mt-auto mb-4">
                {/* Headline (Dynamic scale by aspect ratio) */}
                <h4
                  className={`leading-[1.15] text-left break-words ${currentFont.class} ${
                    aspectKey === 'stories'
                      ? 'text-2xl md:text-3xl'
                      : aspectKey === 'banner'
                        ? 'text-xl'
                        : 'text-2xl font-black'
                  }`}
                  style={{
                    textShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    color: '#FFFFFF'
                  }}
                >
                  {creative.headline}
                </h4>

                {/* Subtitle */}
                <p
                  className="text-left font-semibold text-[#CBD5E1] tracking-wide leading-relaxed break-words"
                  style={{
                    fontSize: aspectKey === 'banner' ? '10px' : '12px',
                    textShadow: '0 2px 8px rgba(0,0,0,0.4)'
                  }}
                >
                  {creative.subheading}
                </p>
              </div>

              {/* BOTTOM FOOTER: Call To Action Button (Simulated Platform Bar) */}
              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <span className="text-[9px] text-[#A0AEC0] font-black uppercase tracking-[0.08em]">
                  neuroads.com.br
                </span>

                {/* CTA Button */}
                <button
                  type="button"
                  className="px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-[0.08em] shadow-[0_4px_12px_rgba(0,0,0,0.2)] select-none hover:scale-102 transition-all border"
                  style={{
                    backgroundColor: secondaryColor || '#FF6B00',
                    borderColor: `${secondaryColor || '#FF6B00'}cc`,
                    color: '#FFFFFF'
                  }}
                >
                  {creative.cta}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: High-Fidelity Design controls (Editor) */}
      <div className="xl:col-span-6 space-y-6">
        <header className="border-b border-[#E2E8F0] pb-4">
          <span className="inline-flex items-center gap-1 bg-[#FFF4EC] text-[#FF6B00] border border-[#FFE4D1] px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <Sparkles className="h-3 w-3 animate-pulse" />
            Estúdio de Customização
          </span>
          <h2 className="mt-2 text-xl font-black text-text-main">Ajuste e Personalize sua Arte</h2>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            As alterações realizadas nas caixas abaixo atualizam a pré-visualização instantaneamente. Use para deixar a copy cirúrgica antes de exportar.
          </p>
        </header>

        {/* Section 1: Typography & Contrasts */}
        <section className="bg-[#FBFCFD] border border-[#E7ECF3] p-5 rounded-2xl space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#FF6B00] flex items-center gap-1.5">
            <Palette className="h-3.5 w-3.5" />
            1. Layout e Visual
          </h3>

          {/* Opacity slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-text-dim mb-1.5">
              <span>Opacidade do Overlay de Contraste</span>
              <span>{overlayOpacity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              value={overlayOpacity}
              onChange={(e) => setOverlayOpacity(Number(e.target.value))}
              className="w-full h-1.5 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#FF6B00]"
            />
          </div>

          {/* Font pairing */}
          <div>
            <p className="text-xs font-bold text-text-dim mb-2 flex items-center gap-1">
              <Type className="h-3.5 w-3.5" /> Estilo de Fonte (Tipografia)
            </p>
            <div className="grid grid-cols-3 gap-2">
              {FONTS.map((font) => {
                const active = selectedFont === font.id;
                return (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => setSelectedFont(font.id)}
                    className={`px-3 py-2 border rounded-xl text-center text-xs font-semibold tracking-wide transition-all ${
                      active
                        ? 'border-[#FF9A63] bg-[#FFF8F3] text-[#C2410C] font-black'
                        : 'border-[#D6DEE8] bg-white text-text-muted hover:border-[#FFBE94]'
                    }`}
                  >
                    {font.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Options toggle */}
          <div className="flex items-center justify-between border-t border-[#E7ECF3] pt-4">
            <label className="flex items-center gap-2 text-xs font-bold text-text-dim cursor-pointer">
              <input
                type="checkbox"
                checked={showLogo}
                onChange={(e) => setShowLogo(e.target.checked)}
                className="w-4 h-4 rounded text-[#FF6B00] border-gray-300 focus:ring-[#FF6B00] cursor-pointer"
              />
              Mostrar Cabeçalho e Logo Patrocinado
            </label>
          </div>
        </section>

        {/* Section 2: Overlaid Copy values */}
        <section className="bg-[#FBFCFD] border border-[#E7ECF3] p-5 rounded-2xl space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#FF6B00] flex items-center gap-1.5">
            <Type className="h-3.5 w-3.5" />
            2. Textos sobrepostos na Arte
          </h3>

          {/* Headline overlay */}
          <div>
            <label className="block text-xs font-bold text-text-dim mb-1">Headline (Texto Principal)</label>
            <input
              type="text"
              value={creative.headline}
              onChange={(e) => onChange({ ...creative, headline: e.target.value })}
              placeholder="Digite a headline magnética"
              className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main font-bold focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
            />
          </div>

          {/* Subheading overlay */}
          <div>
            <label className="block text-xs font-bold text-text-dim mb-1">Subtítulo (Frase de Apoio)</label>
            <textarea
              rows={2}
              value={creative.subheading}
              onChange={(e) => onChange({ ...creative, subheading: e.target.value })}
              placeholder="Digite a frase de apoio"
              className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-xs text-text-main focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
            />
          </div>

          {/* CTA & Title sync */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-text-dim mb-1">Botão CTA</label>
              <input
                type="text"
                value={creative.cta}
                onChange={(e) => onChange({ ...creative, cta: e.target.value })}
                placeholder="Ex: Saiba Mais"
                className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-xs text-text-main font-black uppercase tracking-wider focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-dim mb-1">Título de Controle</label>
              <input
                type="text"
                value={creative.title}
                onChange={(e) => onChange({ ...creative, title: e.target.value })}
                className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-xs text-text-main focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Ad Body primary copy */}
        <section className="bg-[#FBFCFD] border border-[#E7ECF3] p-5 rounded-2xl space-y-3">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#FF6B00] flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" />
            3. Legenda Primária (Copy do Anúncio)
          </h3>
          <div>
            <textarea
              rows={4}
              value={creative.copy}
              onChange={(e) => onChange({ ...creative, copy: e.target.value })}
              placeholder="Legenda que acompanha o criativo..."
              className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-xs leading-relaxed text-text-main focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]"
            />
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportPng}
            disabled={isExporting}
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-black uppercase tracking-[0.08em] transition-all ${
              exportSuccess
                ? 'bg-[#08B760] text-white'
                : 'bg-[#FF6B00] text-white hover:brightness-105 shadow-[0_10px_22px_rgba(255,107,0,0.30)]'
            }`}
          >
            {isExporting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Exportando em 2K...
              </>
            ) : exportSuccess ? (
              <>
                <Check className="h-4 w-4" />
                Salvo com Sucesso!
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Exportar Criativo (PNG)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
