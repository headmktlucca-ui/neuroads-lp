'use client';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-bg-secondary py-20 px-6 border-t border-border">
      <div className="wrap">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12">
          
          <div className="flex flex-col max-w-[300px]">
            <Link href="/" className="group flex items-center mb-6 transition-transform hover:scale-[1.02]">
              <img 
                src="/images/logo2026.png" 
                alt="NeuroAds Logo" 
                className="h-9 lg:h-11 w-auto object-contain"
              />
            </Link>
            <p className="text-text-muted text-sm leading-relaxed mb-6">
              Orquestrando o futuro do marketing com inteligência agêntica e performance real.
            </p>
            <div className="flex gap-4">
              {/* Simple Social Icons */}
              {[1,2,3].map(i => (
                <div key={i} className="w-9 h-9 bg-white border border-border rounded-full flex items-center justify-center text-text-dim hover:text-primary hover:border-primary transition-all cursor-pointer">
                  <ArrowUpRight size={16} />
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 sm:gap-20">
            <div>
              <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase text-text-dim mb-6">Plataforma</h4>
              <ul className="flex flex-col gap-4 list-none m-0 p-0">
                <li><Link href="#problemas" className="text-sm font-medium text-text-muted hover:text-primary transition-all">Desafios</Link></li>
                <li><Link href="#servicos" className="text-sm font-medium text-text-muted hover:text-primary transition-all">Soluções</Link></li>
                <li><Link href="#processo" className="text-sm font-medium text-text-muted hover:text-primary transition-all">Metodologia</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase text-text-dim mb-6">Legal</h4>
              <ul className="flex flex-col gap-4 list-none m-0 p-0">
                <li><Link href="/privacidade" className="text-sm font-medium text-text-muted hover:text-primary transition-all">Privacidade</Link></li>
                <li><Link href="/termos" className="text-sm font-medium text-text-muted hover:text-primary transition-all">Termos</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-text-dim">© 2026 NeuroAds · Claudio Müller. Todos os direitos reservados.</p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-text-dim">Powered by</span>
            <span className="text-[11px] font-extrabold text-primary uppercase tracking-[0.2em]">Lucca.os</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
