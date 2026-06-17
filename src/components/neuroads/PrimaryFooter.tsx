'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';
import Image from 'next/image';

export default function PrimaryFooter() {
  return (
    <footer className="relative z-10 w-full overflow-hidden border-t border-white/5 bg-[#040811]/95 backdrop-blur-xl">
      <div className="relative z-10 mx-auto max-w-[1260px] px-5 py-12 md:px-8">
        {/* Top Grid Area - 6 columns to allow left space as seen in the image */}
        <div className="grid gap-8 border-b border-[#ff6a00]/15 pb-8 md:grid-cols-6 text-xs">
          {/* Empty column to push the rest to the right like the screenshot */}
          <div className="hidden md:block"></div>

          <div>
            <h4 className="font-extrabold uppercase text-[#ff8f3a] mb-4">Soluções</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/#control-room" className="hover:text-white transition-colors">Agentes IA</Link></li>
              <li><Link href="/#segmentos" className="hover:text-white transition-colors">Segmentos</Link></li>
              <li><Link href="/servicos" className="hover:text-white transition-colors">Portfólio</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-extrabold uppercase text-[#ff8f3a] mb-4">Empresa</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/a-neuroads" className="hover:text-white transition-colors">Sobre a NeuroAds</Link></li>
              <li><Link href="/whitepaper_ia_vendas" className="hover:text-white transition-colors">Whitepaper Vendas</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-extrabold uppercase text-[#ff8f3a] mb-4">Recursos</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/conteudos" className="hover:text-white transition-colors">Blog Além do Algoritmo</Link></li>
              <li><Link href="/#faq" className="hover:text-white transition-colors">Central de Ajuda</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-extrabold uppercase text-[#ff8f3a] mb-4">Legal</h4>
            <ul className="space-y-2 text-slate-400">
              <li><Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link></li>
              <li><Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-extrabold uppercase text-[#ff8f3a] mb-4">Mídia Social</h4>
            <p className="text-slate-400 leading-relaxed mb-4">
              Acompanhe discussões de IA agêntica, automações e performance comercial.
            </p>
            <div className="flex items-center gap-3 mt-2">
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/neuroads"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn NeuroAds"
                className="group inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-[#0077B5]/20 hover:border-[#0077B5]/40 transition-all cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-slate-400 group-hover:fill-[#0077B5] transition-colors" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="https://www.instagram.com/neuroads.ia"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram NeuroAds"
                className="group inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-[#E1306C]/20 hover:border-[#E1306C]/40 transition-all cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-slate-400 group-hover:fill-[#E1306C] transition-colors" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              {/* YouTube */}
              <a
                href="https://www.youtube.com/@neuroads"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube NeuroAds"
                className="group inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-[#FF0000]/20 hover:border-[#FF0000]/40 transition-all cursor-pointer"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-slate-400 group-hover:fill-[#FF0000] transition-colors" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93-.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom Area */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black border border-white/10 text-white font-black text-[14px]">
              N
            </span>
            <p>© {new Date().getFullYear()} NeuroAds LP. Todos os direitos reservados.</p>
          </div>
          <p className="flex items-center gap-1 font-mono uppercase">
            <Zap size={10} className="text-[#ff6a00]" /> Powered by Agential AI
          </p>
        </div>
      </div>
    </footer>
  );
}
