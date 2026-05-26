'use client';

import { useState, useRef } from 'react';
import { ArrowLeft, ArrowRight, Download, Plus, Trash2, Check, Sparkles, Layers, Type, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';

export type CarouselSlide = {
  id: string;
  title: string;
  headline: string;
  subheading: string;
  stepFocus: string; // Ex: Atenção, Interesse, Desejo, Ação
};

type CreativeCarouselWorkspaceProps = {
  initialSlides: CarouselSlide[];
  backgroundImageUrl: string;
  primaryColor: string;
  secondaryColor: string;
  companyName: string;
  channel: string;
  onSave?: (slides: CarouselSlide[]) => void;
};

export default function CreativeCarouselWorkspace({
  initialSlides,
  backgroundImageUrl,
  primaryColor,
  secondaryColor,
  companyName,
  channel,
  onSave
}: CreativeCarouselWorkspaceProps) {
  const [slides, setSlides] = useState<CarouselSlide[]>(
    initialSlides.length
      ? initialSlides
      : [
          { id: '1', title: 'Lâmina 1', headline: 'CHAME A ATENÇÃO DO SEU CLIENTE', subheading: 'Destaque o maior benefício do seu produto nos primeiros segundos.', stepFocus: 'Atenção (Topo)' },
          { id: '2', title: 'Lâmina 2', headline: 'APRESENTE O PROBLEMA REAL', subheading: 'Mostre como a dor dele drena dinheiro e tempo todos os dias.', stepFocus: 'Interesse (Meio)' },
          { id: '3', title: 'Lâmina 3', headline: 'EXIBA A SOLUÇÃO COMPROVADA', subheading: 'Apresente sua oferta como o único caminho seguro para previsibilidade.', stepFocus: 'Desejo (Fundo)' },
          { id: '4', title: 'Lâmina 4', headline: 'CHAME ELE PARA AÇÃO AGORA', subheading: 'Clique abaixo e garanta o seu diagnóstico estratégico gratuito.', stepFocus: 'Ação (CTA)' }
        ]
  );
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isExportingAll, setIsExportingAll] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const slideRef = useRef<HTMLDivElement>(null);

  const activeSlide = slides[activeIndex] || slides[0];

  const updateActiveSlide = (key: keyof CarouselSlide, value: string) => {
    const updated = slides.map((slide, idx) => {
      if (idx === activeIndex) {
        return { ...slide, [key]: value };
      }
      return slide;
    });
    setSlides(updated);
    if (onSave) onSave(updated);
  };

  const handleAddSlide = () => {
    if (slides.length >= 6) return; // limit to 6 slides for conversion optimization
    const newSlide: CarouselSlide = {
      id: `${Date.now()}`,
      title: `Lâmina ${slides.length + 1}`,
      headline: 'DIGITE A SUA HEADLINE',
      subheading: 'Escreva um subtítulo descritivo de suporte.',
      stepFocus: 'Benefício Extra'
    };
    const next = [...slides, newSlide];
    setSlides(next);
    setActiveIndex(next.length - 1);
    if (onSave) onSave(next);
  };

  const handleDeleteSlide = (idxToDelete: number) => {
    if (slides.length <= 2) return; // Keep at least 2 slides
    const next = slides.filter((_, idx) => idx !== idxToDelete);
    setSlides(next);
    setActiveIndex((prev) => Math.max(0, Math.min(prev, next.length - 1)));
    if (onSave) onSave(next);
  };

  // Export each slide sequentially as individual PNG images
  const handleExportAll = async () => {
    if (isExportingAll) return;
    setIsExportingAll(true);
    setExportSuccess(false);

    try {
      // Loop over slides, render them, capture and download
      for (let i = 0; i < slides.length; i++) {
        // Select slide sequentially to render
        setActiveIndex(i);
        // Wait slightly for UI to repaint
        await new Promise((resolve) => setTimeout(resolve, 300));

        if (slideRef.current) {
          const canvas = await html2canvas(slideRef.current, {
            useCORS: true,
            scale: 2,
            backgroundColor: null,
            logging: false,
            allowTaint: true
          });

          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = `neuroads-carrossel-slide${i + 1}-${slides[i].stepFocus.split(' ')[0].toLowerCase()}-${Date.now()}.png`;
          link.click();
        }
      }

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao exportar carrossel em lote:', err);
    } finally {
      setIsExportingAll(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      {/* LEFT: Slide Preview & Stepper */}
      <div className="xl:col-span-6 flex flex-col items-center space-y-6">
        
        {/* Navigation & Counter */}
        <div className="flex items-center justify-between w-full max-w-[360px] bg-[#F1F5F9] px-4 py-2 rounded-full border border-[#E2E8F0]">
          <button
            type="button"
            disabled={activeIndex === 0}
            onClick={() => setActiveIndex((prev) => prev - 1)}
            className="p-1 rounded-full text-text-muted hover:text-text-main disabled:opacity-30"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <span className="text-xs font-black uppercase tracking-widest text-text-main">
            Lâmina {activeIndex + 1} de {slides.length} • <span className="text-[#FF6B00]">{activeSlide.stepFocus}</span>
          </span>

          <button
            type="button"
            disabled={activeIndex === slides.length - 1}
            onClick={() => setActiveIndex((prev) => prev + 1)}
            className="p-1 rounded-full text-text-muted hover:text-text-main disabled:opacity-30"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        {/* Outer Frame (Shadow & Grid Style) */}
        <div className="w-full flex items-center justify-center p-6 bg-gradient-to-br from-[#F8FAFC] to-[#EDF2F7] rounded-[24px] border border-[#E2E8F0] shadow-inner min-h-[460px]">
          {/* Static Capture Area 1:1 format for Carousel feed */}
          <div
            ref={slideRef}
            className="relative overflow-hidden rounded-[16px] shadow-2xl transition-all duration-300 border border-black/10 select-none aspect-square w-full max-w-[380px]"
            style={{ aspectRatio: '1/1' }}
          >
            {/* Background Image (Cohesive cross slide look) */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-all duration-300"
              style={{ backgroundImage: `url('${backgroundImageUrl}')` }}
            />

            {/* Overlays: Gradient + Brand overlay */}
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-black/40 to-black/20"
              style={{ backgroundColor: `${primaryColor}22` }}
            />
            <div className="absolute inset-0 bg-black/40" />

            {/* Cohesive top brand header */}
            <div className="absolute inset-x-0 top-0 p-5 flex items-center justify-between text-white z-10">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`
                  }}
                >
                  {companyName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-[10px] font-black leading-none uppercase tracking-wide">
                    {companyName}
                  </p>
                  <p className="text-[7px] text-[#CBD5E1] font-bold uppercase tracking-wider mt-0.5">
                    Patrocinado • {channel}
                  </p>
                </div>
              </div>

              {/* Indicator of carousel dots */}
              <div className="flex gap-1">
                {slides.map((_, i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                      i === activeIndex ? 'bg-[#FF6B00] w-3' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Content Layer (Centered Headline for aesthetic carousel) */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between text-white z-10 pt-16">
              
              <div className="my-auto text-center space-y-4">
                {/* Visual Focus tag */}
                <span className="inline-block text-[9px] bg-white/20 border border-white/10 px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest text-[#FFF4EC] bg-gradient-to-r from-[#FF6B00]/40 to-transparent">
                  {activeSlide.stepFocus}
                </span>

                {/* Main Headline */}
                <h4
                  className="text-xl md:text-2xl font-black tracking-tight leading-[1.15] break-words uppercase font-sans"
                  style={{ textShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                >
                  {activeSlide.headline}
                </h4>

                {/* Subheading */}
                <p
                  className="text-xs text-[#E2E8F0] tracking-wide leading-relaxed px-2 font-semibold"
                  style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
                >
                  {activeSlide.subheading}
                </p>
              </div>

              {/* Bottom footer bar */}
              <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[#CBD5E1]">
                <span className="text-[8px] font-black uppercase tracking-[0.08em]">
                  Arrastar para ver mais »
                </span>

                <button
                  type="button"
                  className="px-3.5 py-1.5 rounded text-[8px] font-black uppercase tracking-[0.08em] shadow-[0_4px_12px_rgba(0,0,0,0.2)] border"
                  style={{
                    backgroundColor: secondaryColor || '#FF6B00',
                    borderColor: `${secondaryColor || '#FF6B00'}cc`,
                    color: '#FFFFFF'
                  }}
                >
                  {activeIndex === slides.length - 1 ? 'Quero Começar' : 'Ver Oferta'}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Carousel Slide Timeline (Miniatures) */}
        <div className="w-full flex items-center gap-3 overflow-x-auto py-2 px-1 scrollbar-thin">
          {slides.map((slide, idx) => {
            const active = idx === activeIndex;
            return (
              <div
                key={slide.id}
                onClick={() => setActiveIndex(idx)}
                className={`relative cursor-pointer shrink-0 rounded-xl overflow-hidden border-2 w-[72px] h-[72px] transition-all group ${
                  active ? 'border-[#FF6B00] scale-105 shadow-md' : 'border-[#E2E8F0] opacity-60 hover:opacity-100'
                }`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url('${backgroundImageUrl}')` }}
                />
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-1 text-center text-white">
                  <span className="text-[8px] font-black uppercase text-[#FF9A63]">L{idx + 1}</span>
                  <span className="text-[7px] font-black mt-0.5 leading-none break-all line-clamp-2">
                    {slide.stepFocus.split(' ')[0]}
                  </span>
                </div>
                {slides.length > 2 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSlide(idx);
                    }}
                    className="absolute -top-1 -right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 border border-white scale-0 group-hover:scale-100 transition-transform duration-200"
                  >
                    <Trash2 className="h-2 w-2" />
                  </button>
                )}
              </div>
            );
          })}

          {slides.length < 6 && (
            <button
              type="button"
              onClick={handleAddSlide}
              className="shrink-0 w-[72px] h-[72px] rounded-xl border-2 border-dashed border-[#D6DEE8] hover:border-[#FF9A63] flex flex-col items-center justify-center gap-1 text-text-dim hover:text-[#C2410C] bg-[#FBFCFD] transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span className="text-[7px] font-black uppercase">Slide</span>
            </button>
          )}
        </div>
      </div>

      {/* RIGHT: Editor Panel */}
      <div className="xl:col-span-6 space-y-6">
        <header className="border-b border-[#E2E8F0] pb-4">
          <span className="inline-flex items-center gap-1 bg-[#FFF4EC] text-[#FF6B00] border border-[#FFE4D1] px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <Sparkles className="h-3 w-3 animate-pulse" />
            Editor de Carrossel Sequencial
          </span>
          <h2 className="mt-2 text-xl font-black text-text-main">Ajuste os Textos da Lâmina {activeIndex + 1}</h2>
          <p className="text-xs text-text-muted mt-1 leading-relaxed">
            Cada lâmina representa uma etapa estratégica no storytelling do criativo. Mude os textos para direcionar o funil de conversão.
          </p>
        </header>

        {/* Slide specifics */}
        <section className="bg-[#FBFCFD] border border-[#E7ECF3] p-5 rounded-2xl space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#FF6B00] flex items-center gap-1.5">
            <Type className="h-3.5 w-3.5" />
            Configurações da Lâmina {activeIndex + 1}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-text-dim mb-1">Título da Lâmina</label>
              <input
                type="text"
                value={activeSlide.title}
                onChange={(e) => updateActiveSlide('title', e.target.value)}
                className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-xs text-text-main focus:border-[#FF6B00]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-dim mb-1">Etapa de Conversão</label>
              <input
                type="text"
                value={activeSlide.stepFocus}
                onChange={(e) => updateActiveSlide('stepFocus', e.target.value)}
                className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-xs text-text-main font-bold text-[#C2410C] focus:border-[#FF6B00]"
              />
            </div>
          </div>

          {/* Headline and subheading */}
          <div>
            <label className="block text-xs font-bold text-text-dim mb-1">Headline do Slide (Maiúscula)</label>
            <input
              type="text"
              value={activeSlide.headline}
              onChange={(e) => updateActiveSlide('headline', e.target.value)}
              className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-xs text-text-main font-black focus:border-[#FF6B00]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-dim mb-1">Subtítulo / Frase de Apoio</label>
            <textarea
              rows={3}
              value={activeSlide.subheading}
              onChange={(e) => updateActiveSlide('subheading', e.target.value)}
              className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-xs leading-relaxed text-text-main focus:border-[#FF6B00]"
            />
          </div>
        </section>

        {/* Global Strategy tip */}
        <section className="bg-[#F5F9FF] border border-[#DCE8FF] p-4 rounded-xl text-xs text-[#1E3A8A] flex gap-2.5 items-start">
          <Layers className="h-4 w-4 text-[#1D4ED8] mt-0.5 shrink-0" />
          <div>
            <p className="font-black uppercase tracking-wide mb-1">Consistência de Narrativa</p>
            <p className="leading-relaxed">
              O NeuroAds desenhou este carrossel para que as imagens de fundo permaneçam 100% idênticas, dando coesão de marca enquanto a headline foca na dor e solução do lead. Evite fundos diferentes que causam atrito visual ao arrastar o carrossel.
            </p>
          </div>
        </section>

        {/* Download actions */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportAll}
            disabled={isExportingAll}
            className={`flex-1 inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 text-sm font-black uppercase tracking-[0.08em] transition-all ${
              exportSuccess
                ? 'bg-[#08B760] text-white'
                : 'bg-[#FF6B00] text-white hover:brightness-105 shadow-[0_10px_22px_rgba(255,107,0,0.30)]'
            }`}
          >
            {isExportingAll ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Exportando {slides.length} Lâminas...
              </>
            ) : exportSuccess ? (
              <>
                <Check className="h-4 w-4" />
                Carrossel Baixado com Sucesso!
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Baixar Lote de Imagens (PNGs)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
