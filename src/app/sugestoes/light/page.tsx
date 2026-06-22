import React from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart3, Bot, Zap } from 'lucide-react';

export const metadata = {
  title: 'Light Mode | Sugestão de Layout',
};

export default function LightModePage() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#0A0A0A] font-sans selection:bg-[#FF4D00] selection:text-white">
      {/* HEADER / NAV */}
      <header className="sticky top-0 z-50 w-full bg-[#FFFFFF]/80 backdrop-blur-md border-b border-black/5">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="font-head font-bold text-2xl tracking-tight">NeuroAds.</div>
          <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-[#4B5563]">
            <Link href="#" className="hover:text-[#0A0A0A] transition-colors">Como Funciona</Link>
            <Link href="#" className="hover:text-[#0A0A0A] transition-colors">Agentes de IA</Link>
            <Link href="#" className="hover:text-[#0A0A0A] transition-colors">Resultados</Link>
          </nav>
          <Link 
            href="#" 
            className="group flex items-center gap-2 bg-[#FF4D00] text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:bg-[#E64500] hover:shadow-[0_4px_24px_rgba(255,77,0,0.3)]"
          >
            Começar Agora
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-40 px-6 max-w-[1400px] mx-auto overflow-hidden">
          <div className="max-w-4xl">
            <h1 className="font-head text-[clamp(3rem,8vw,6rem)] leading-[1.05] font-extrabold tracking-[-0.04em] text-[#0A0A0A] text-balance">
              Escala de anúncios guiada por inteligência extrema.
            </h1>
            <p className="mt-10 text-[clamp(1.125rem,2vw,1.5rem)] leading-relaxed text-[#4B5563] max-w-2xl text-balance">
              A NeuroAds conecta agentes especialistas em IA diretamente ao Google Ads. Performance de elite e otimização sem margem para erro humano.
            </p>
            
            <div className="mt-16 flex flex-wrap items-center gap-6">
              <Link 
                href="#" 
                className="group inline-flex items-center gap-3 bg-[#0A0A0A] text-white px-8 py-4 rounded-full text-base font-medium transition-all hover:bg-[#1F2937]"
              >
                Agendar Demonstração
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                href="#" 
                className="inline-flex items-center gap-3 bg-transparent text-[#0A0A0A] border border-black/10 px-8 py-4 rounded-full text-base font-medium transition-all hover:border-black/30"
              >
                Ver Como Funciona
              </Link>
            </div>
          </div>
          
          {/* Abstract visual element replacing generic UI mocks */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/3 aspect-square bg-[#FFF5F0] rounded-full blur-[120px] -z-10 opacity-70"></div>
        </section>

        {/* LOGOS / SOCIAL PROOF */}
        <section className="py-24 px-6 border-y border-black/5 bg-[#F9FAFB]">
          <div className="max-w-[1400px] mx-auto">
            <p className="text-sm font-medium text-[#9CA3AF] tracking-wide mb-10 text-center uppercase">Performance confiada por marcas exigentes</p>
            <div className="flex flex-wrap justify-center items-center gap-x-20 gap-y-10 opacity-60 grayscale">
              {/* Using text placeholders instead of SVGs for structural mockup */}
              <span className="font-head font-bold text-2xl tracking-tighter">BRAND A</span>
              <span className="font-head font-bold text-2xl tracking-tighter">COMPANY B</span>
              <span className="font-head font-bold text-2xl tracking-tighter">ENTERPRISE C</span>
              <span className="font-head font-bold text-2xl tracking-tighter">STARTUP D</span>
            </div>
          </div>
        </section>

        {/* ASYMMETRICAL FEATURES */}
        <section className="py-40 px-6 max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-24 lg:gap-x-16">
            
            {/* Feature 1 */}
            <div className="lg:col-span-5 lg:col-start-1 flex flex-col justify-center">
              <div className="w-12 h-12 bg-[#FFF5F0] text-[#FF4D00] rounded-2xl flex items-center justify-center mb-8">
                <Bot className="w-6 h-6" />
              </div>
              <h2 className="font-head text-[clamp(2rem,4vw,3.5rem)] leading-tight font-bold tracking-[-0.03em] mb-6">
                Agentes que operam. Não apenas recomendam.
              </h2>
              <p className="text-[#4B5563] text-lg leading-relaxed">
                Nossa IA não entrega relatórios longos para você executar. Os conectores atuam direto na sua conta, ajustando lances e lendo padrões invisíveis a olho nu, 24 horas por dia.
              </p>
            </div>
            <div className="lg:col-span-6 lg:col-start-7 bg-[#F9FAFB] rounded-[32px] aspect-square flex items-center justify-center border border-black/5">
              {/* Minimalist Data Viz abstraction */}
              <div className="w-2/3 h-2/3 border-b-2 border-l-2 border-black/10 relative">
                <div className="absolute bottom-0 left-1/4 w-px h-[40%] bg-[#FF4D00]"></div>
                <div className="absolute bottom-0 left-1/2 w-px h-[70%] bg-[#FF4D00]"></div>
                <div className="absolute bottom-0 left-3/4 w-px h-[90%] bg-[#FF4D00]"></div>
              </div>
            </div>

            {/* Feature 2 (Reverse layout) */}
            <div className="lg:col-span-6 lg:col-start-1 order-2 lg:order-1 bg-[#F9FAFB] rounded-[32px] aspect-square flex items-center justify-center border border-black/5">
               <div className="w-32 h-32 rounded-full border-[8px] border-[#FFF5F0] border-t-[#FF4D00] rotate-45"></div>
            </div>
            <div className="lg:col-span-5 lg:col-start-8 order-1 lg:order-2 flex flex-col justify-center">
              <div className="w-12 h-12 bg-[#FFF5F0] text-[#FF4D00] rounded-2xl flex items-center justify-center mb-8">
                <Zap className="w-6 h-6" />
              </div>
              <h2 className="font-head text-[clamp(2rem,4vw,3.5rem)] leading-tight font-bold tracking-[-0.03em] mb-6">
                Velocidade sem atrito.
              </h2>
              <p className="text-[#4B5563] text-lg leading-relaxed">
                Esqueça configurações complexas de dashboard. Você define os objetivos de negócio e o orçamento; o motor algorítmico da NeuroAds encontra a rota mais barata para a conversão.
              </p>
            </div>

          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-40 px-6 border-t border-black/5 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-head text-[clamp(3rem,6vw,5rem)] leading-tight font-extrabold tracking-[-0.04em] mb-10 text-balance">
              Pronto para elevar o padrão da sua aquisição?
            </h2>
            <Link 
              href="#" 
              className="inline-flex items-center gap-3 bg-[#FF4D00] text-white px-10 py-5 rounded-full text-lg font-semibold transition-all hover:bg-[#E64500] hover:shadow-[0_8px_32px_rgba(255,77,0,0.3)] hover:-translate-y-1"
            >
              Iniciar Implementação
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#0A0A0A] text-white py-16 px-6">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="font-head font-bold text-2xl tracking-tight">NeuroAds.</div>
          <p className="text-[#9CA3AF] text-sm">© 2026 NeuroAds. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
