import React from 'react';
import Link from 'next/link';
import { ArrowDown, Cpu, BarChart } from 'lucide-react';

export const metadata = {
  title: 'Drenched Orange | Sugestão de Layout',
};

export default function DrenchedModePage() {
  return (
    <div className="min-h-screen bg-[#FF4D00] text-[#0A0A0A] font-sans selection:bg-[#0A0A0A] selection:text-[#FF4D00]">
      {/* HEADER / NAV - Stark & Minimal */}
      <header className="fixed top-0 z-50 w-full bg-[#FF4D00]/90 backdrop-blur-md border-b border-black/10">
        <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="font-head font-extrabold text-2xl tracking-tight text-[#0A0A0A] uppercase">NeuroAds</div>
          <nav className="hidden md:flex items-center gap-12 text-sm font-bold text-[#0A0A0A]/70 uppercase tracking-widest">
            <Link href="#" className="hover:text-[#0A0A0A] transition-colors">Sistema</Link>
            <Link href="#" className="hover:text-[#0A0A0A] transition-colors">Automação</Link>
            <Link href="#" className="hover:text-[#0A0A0A] transition-colors">Performance</Link>
          </nav>
          <Link 
            href="#" 
            className="hidden md:block bg-[#0A0A0A] text-[#FF4D00] px-8 py-3 text-sm font-bold tracking-widest uppercase transition-all hover:bg-black/80"
          >
            Falar com Vendas
          </Link>
        </div>
      </header>

      <main>
        {/* HERO SECTION - Brutalist & Bold */}
        <section className="pt-40 pb-32 px-6 max-w-[1400px] mx-auto flex flex-col justify-center min-h-[90vh]">
          <div className="max-w-6xl">
            <h1 className="font-head text-[clamp(4rem,12vw,10rem)] leading-[0.85] font-black tracking-[-0.06em] text-[#0A0A0A] uppercase">
              Aquisição <br/> <span className="text-white">Autônoma.</span>
            </h1>
            
            <div className="mt-20 grid grid-cols-1 md:grid-cols-12 gap-10 items-end">
              <div className="md:col-span-7">
                <p className="text-[clamp(1.25rem,3vw,2rem)] leading-tight text-[#0A0A0A] font-medium text-balance">
                  Conecte a NeuroAds ao seu Google Ads. Nossos agentes operam bids, otimizam escalas e cortam o desperdício que o gerenciamento humano não consegue ver.
                </p>
              </div>
              <div className="md:col-span-5 flex justify-start md:justify-end">
                <Link 
                  href="#" 
                  className="inline-flex items-center justify-center gap-4 bg-[#0A0A0A] text-[#FF4D00] px-12 py-6 text-xl font-bold uppercase tracking-widest transition-all hover:bg-white hover:text-[#0A0A0A]"
                >
                  Começar
                  <ArrowDown className="w-6 h-6" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* LOGOS / SOCIAL PROOF (White block for stark contrast) */}
        <section className="py-24 px-6 bg-white text-[#0A0A0A]">
          <div className="max-w-[1400px] mx-auto">
            <p className="text-sm font-bold tracking-widest uppercase mb-16 opacity-40">Operando marcas de alta performance</p>
            <div className="flex flex-wrap justify-between items-center gap-12 opacity-80">
              <span className="font-head font-black text-3xl md:text-5xl tracking-tighter uppercase">Brand A</span>
              <span className="font-head font-black text-3xl md:text-5xl tracking-tighter uppercase">Company B</span>
              <span className="font-head font-black text-3xl md:text-5xl tracking-tighter uppercase">Enterprise C</span>
            </div>
          </div>
        </section>

        {/* FEATURES - Brutalist Grid */}
        <section className="py-40 px-6 max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#0A0A0A]/20 border border-[#0A0A0A]/20">
            
            {/* Feature 1 */}
            <div className="bg-[#FF4D00] p-12 md:p-20 flex flex-col">
              <div className="mb-16">
                <Cpu className="w-16 h-16 text-[#0A0A0A]" strokeWidth={1.5} />
              </div>
              <h2 className="font-head text-4xl md:text-6xl font-black tracking-[-0.04em] uppercase leading-none mb-8 text-white">
                Engine 1: <br/> Otimização
              </h2>
              <p className="text-[#0A0A0A] text-xl md:text-2xl font-medium leading-tight">
                Os conectores da plataforma analisam sinais e ajustam as campanhas 24h por dia, superando a latência do gestor humano.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#FF4D00] p-12 md:p-20 flex flex-col">
              <div className="mb-16">
                <BarChart className="w-16 h-16 text-[#0A0A0A]" strokeWidth={1.5} />
              </div>
              <h2 className="font-head text-4xl md:text-6xl font-black tracking-[-0.04em] uppercase leading-none mb-8 text-white">
                Engine 2: <br/> Escala
              </h2>
              <p className="text-[#0A0A0A] text-xl md:text-2xl font-medium leading-tight">
                Quando a conversão performa, o algoritmo injeta orçamento e expande o alcance de forma previsível e altamente lucrativa.
              </p>
            </div>

          </div>
        </section>

        {/* BOTTOM CTA - Charcoal Block */}
        <section className="py-40 px-6 bg-[#0A0A0A] text-[#FF4D00]">
          <div className="max-w-[1400px] mx-auto text-center">
            <h2 className="font-head text-[clamp(4rem,8vw,8rem)] leading-none font-black tracking-[-0.05em] uppercase mb-16 text-balance">
              Corte a Latência.
            </h2>
            <Link 
              href="#" 
              className="inline-block bg-[#FF4D00] text-[#0A0A0A] px-16 py-8 text-2xl font-black uppercase tracking-widest transition-all hover:bg-white"
            >
              Agendar Setup
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-white text-[#0A0A0A] py-12 px-6">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8 font-bold uppercase tracking-widest text-sm">
          <div>NeuroAds © 2026</div>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-[#FF4D00]">Twitter</Link>
            <Link href="#" className="hover:text-[#FF4D00]">LinkedIn</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
