import React from 'react';
import Link from 'next/link';
import { ArrowRight, LayoutTemplate } from 'lucide-react';

export const metadata = {
  title: 'Sugestões de Layout | NeuroAds',
};

export default function SugestoesIndexPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#0A0A0A] font-sans p-6 md:p-20">
      <div className="max-w-4xl mx-auto">
        <div className="mb-16">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#FF4D00] text-white mb-6">
            <LayoutTemplate className="w-6 h-6" />
          </div>
          <h1 className="font-head text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Apresentação de Layouts
          </h1>
          <p className="text-lg text-[#4B5563] leading-relaxed">
            Desenvolvemos 3 sugestões estruturais para a nova página inicial da NeuroAds, focadas em fugir do genérico e transmitir autoridade técnica. Escolha uma das vias abaixo para visualizar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <Link 
            href="/sugestoes/light" 
            className="group flex flex-col bg-white rounded-2xl border border-black/5 p-8 transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] hover:-translate-y-1"
          >
            <div className="w-full aspect-video bg-[#F9FAFB] border border-black/5 rounded-lg mb-6 flex items-center justify-center overflow-hidden relative">
              <div className="absolute top-4 left-4 w-1/2 h-4 bg-black/10 rounded"></div>
              <div className="absolute top-12 left-4 w-3/4 h-8 bg-black/5 rounded"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 bg-[#FF4D00] rounded-full"></div>
            </div>
            <h2 className="font-head font-bold text-xl mb-2">1. Premium Light Mode</h2>
            <p className="text-[#4B5563] text-sm mb-6 flex-grow">
              Foco em muito espaço em branco, tipografia elegante e uso contido do laranja apenas para destaque.
            </p>
            <div className="flex items-center text-[#FF4D00] font-medium text-sm gap-2">
              Visualizar <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 2 */}
          <Link 
            href="/sugestoes/dark" 
            className="group flex flex-col bg-[#0A0A0A] text-white rounded-2xl border border-white/10 p-8 transition-all hover:shadow-[0_20px_40px_rgba(255,77,0,0.1)] hover:-translate-y-1"
          >
            <div className="w-full aspect-video bg-[#1F2937] border border-white/5 rounded-lg mb-6 flex items-center justify-center overflow-hidden relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#FF4D00] blur-3xl opacity-30"></div>
              <div className="absolute top-4 left-4 w-1/2 h-4 bg-white/20 rounded"></div>
              <div className="absolute top-12 left-4 w-3/4 h-8 bg-white/10 rounded"></div>
            </div>
            <h2 className="font-head font-bold text-xl mb-2 text-white">2. Dark Mode Editorial</h2>
            <p className="text-[#9CA3AF] text-sm mb-6 flex-grow">
              Alto contraste, atmosfera focada e tecnológica. O laranja funciona como uma luz direcional para a atenção.
            </p>
            <div className="flex items-center text-[#FF4D00] font-medium text-sm gap-2">
              Visualizar <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Card 3 */}
          <Link 
            href="/sugestoes/drenched" 
            className="group flex flex-col bg-[#FF4D00] text-[#0A0A0A] rounded-2xl border border-black/10 p-8 transition-all hover:shadow-[0_20px_40px_rgba(255,77,0,0.25)] hover:-translate-y-1"
          >
            <div className="w-full aspect-video bg-black/10 border border-black/5 rounded-lg mb-6 flex items-center justify-center overflow-hidden relative">
              <div className="absolute top-4 left-4 w-1/2 h-6 bg-[#0A0A0A] rounded"></div>
              <div className="absolute top-14 left-4 w-3/4 h-12 bg-[#0A0A0A]/80 rounded"></div>
            </div>
            <h2 className="font-head font-black text-xl mb-2 uppercase tracking-wide text-white">3. Drenched Orange</h2>
            <p className="text-[#0A0A0A] font-medium text-sm mb-6 flex-grow">
              Abordagem brutalista e ousada. Impacto máximo utilizando o laranja como cor base para toda a superfície.
            </p>
            <div className="flex items-center text-[#0A0A0A] font-black text-sm gap-2 uppercase tracking-wide">
              Visualizar <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
