import React from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, Target } from 'lucide-react';

export const metadata = {
  title: 'Dark Mode | Sugestão de Layout',
};

export default function DarkModePage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F9FAFB] font-sans selection:bg-[#FF4D00] selection:text-white">
      {/* HEADER / NAV */}
      <header className="fixed top-0 z-50 w-full bg-[#0A0A0A]/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="font-head font-bold text-2xl tracking-tight text-white">NeuroAds.</div>
          <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-[#9CA3AF]">
            <Link href="#" className="hover:text-white transition-colors">A Metodologia</Link>
            <Link href="#" className="hover:text-white transition-colors">A Plataforma</Link>
            <Link href="#" className="hover:text-white transition-colors">Impacto</Link>
          </nav>
          <Link 
            href="#" 
            className="group flex items-center gap-2 text-white border border-white/20 px-6 py-2.5 rounded-full text-sm font-semibold transition-all hover:bg-white hover:text-[#0A0A0A]"
          >
            Acessar Plataforma
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative pt-40 pb-32 px-6 max-w-[1400px] mx-auto overflow-hidden flex flex-col items-center text-center">
          
          {/* Editorial Glow Background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#FF4D00] rounded-full blur-[200px] -z-10 opacity-20 pointer-events-none"></div>

          <div className="max-w-5xl relative z-10">
            <span className="inline-block mb-6 text-[#FF4D00] font-mono text-sm tracking-widest uppercase">Performance Elevada</span>
            <h1 className="font-head text-[clamp(3.5rem,10vw,8rem)] leading-[0.95] font-extrabold tracking-[-0.05em] text-white text-balance drop-shadow-2xl">
              Inteligência que converte.
            </h1>
            <p className="mt-8 text-[clamp(1.125rem,2.5vw,1.75rem)] leading-relaxed text-[#9CA3AF] max-w-3xl mx-auto text-balance">
              NeuroAds abandona a superfície. Conectamos agentes algorítmicos diretos ao coração das suas campanhas, extraindo performance máxima enquanto você foca na estratégia.
            </p>
            
            <div className="mt-16 flex flex-col sm:flex-row justify-center items-center gap-6">
              <Link 
                href="#" 
                className="group inline-flex items-center justify-center gap-3 bg-[#FF4D00] text-white px-10 py-5 rounded-full text-lg font-semibold transition-all hover:bg-[#E64500] hover:shadow-[0_0_40px_rgba(255,77,0,0.4)] w-full sm:w-auto"
              >
                Solicitar Acesso
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* LOGOS / SOCIAL PROOF (Dark Theme) */}
        <section className="py-20 px-6 border-y border-white/5 bg-[#0A0A0A]">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex flex-wrap justify-center items-center gap-x-24 gap-y-12 opacity-40 grayscale">
              <span className="font-head font-bold text-2xl tracking-widest uppercase">Brand A</span>
              <span className="font-head font-bold text-2xl tracking-widest uppercase">Company B</span>
              <span className="font-head font-bold text-2xl tracking-widest uppercase">Enterprise C</span>
              <span className="font-head font-bold text-2xl tracking-widest uppercase">Startup D</span>
            </div>
          </div>
        </section>

        {/* EDITORIAL FEATURES */}
        <section className="py-40 px-6 max-w-[1400px] mx-auto">
          
          {/* Big statement */}
          <div className="max-w-4xl mb-32">
            <h2 className="font-head text-[clamp(2.5rem,5vw,4.5rem)] leading-tight font-bold tracking-[-0.04em] text-white text-balance">
              Operação silenciosa. <br/>Resultados agressivos.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-24">
            
            {/* Feature 1 */}
            <div className="flex flex-col">
              <div className="h-px w-full bg-white/10 mb-10"></div>
              <div className="w-14 h-14 bg-white/5 text-[#FF4D00] rounded-full flex items-center justify-center mb-10 border border-white/10">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-head text-3xl font-bold tracking-tight mb-4 text-white">
                Mira Laser nos Dados
              </h3>
              <p className="text-[#9CA3AF] text-lg leading-relaxed">
                Cada centavo alocado é calculado em milissegundos. Nossos modelos preditivos operam em camadas que o gerenciamento manual não alcança, cortando desperdício pela raiz.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col">
              <div className="h-px w-full bg-white/10 mb-10"></div>
              <div className="w-14 h-14 bg-white/5 text-[#FF4D00] rounded-full flex items-center justify-center mb-10 border border-white/10">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="font-head text-3xl font-bold tracking-tight mb-4 text-white">
                Agentes Autônomos
              </h3>
              <p className="text-[#9CA3AF] text-lg leading-relaxed">
                A IA não apenas sugere; ela executa. Com os conectores OAuth, a plataforma ajusta lances, pausa anúncios em fadiga e escala vencedores automaticamente, 24/7.
              </p>
            </div>

          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#0A0A0A] text-white py-20 px-6 mt-20">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
          <div>
            <div className="font-head font-bold text-3xl tracking-tight mb-4">NeuroAds.</div>
            <p className="text-[#4B5563] text-sm max-w-xs">A fronteira final da gestão de aquisição de clientes.</p>
          </div>
          <div className="flex gap-10 text-sm font-medium text-[#9CA3AF]">
            <Link href="#" className="hover:text-white transition-colors">Login</Link>
            <Link href="#" className="hover:text-white transition-colors">Suporte</Link>
            <Link href="#" className="hover:text-white transition-colors">Termos de Uso</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
