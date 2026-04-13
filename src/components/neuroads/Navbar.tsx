'use client';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-[200] border-b border-white/10 transition-all duration-300 ${isScrolled ? 'bg-[#05060F]/85 py-2' : 'bg-transparent py-4'} backdrop-blur-[20px] saturate-[1.4]`}>
      <div className="max-w-[1160px] mx-auto px-8 flex items-center justify-between">
        <a href="#" className="flex items-center gap-[0.65rem] no-underline group">
          <div className="w-[34px] h-[34px] rounded-lg bg-grad-main flex items-center justify-center font-head font-extrabold text-[0.85rem] text-white tracking-[-0.02em] shadow-[0_0_16px_rgba(59,111,255,0.4)] group-hover:scale-105 transition-transform">
            NA
          </div>
          <span className="font-head font-extrabold text-[1.05rem] text-text-1 tracking-[-0.02em]">
            Neuro<span className="text-blue-2">Ads</span>
          </span>
        </a>

        <ul className="hidden lg:flex items-center gap-[1.75rem] list-none">
          <li><a href="#claudio" className="text-[0.835rem] font-medium text-text-3 no-underline transition-colors hover:text-text-1">Sobre Claudio</a></li>
          <li><a href="#servicos" className="text-[0.835rem] font-medium text-text-3 no-underline transition-colors hover:text-text-1">Soluções</a></li>
          <li><a href="#lucca" className="text-[0.835rem] font-medium text-text-3 no-underline transition-colors hover:text-text-1">Lucca</a></li>
          <li><a href="#geo" className="text-[0.835rem] font-medium text-text-3 no-underline transition-colors hover:text-text-1">SEO & GEO</a></li>
          <li>
            <span className="flex items-center gap-[0.45rem] font-semibold text-[0.72rem] text-green-s bg-green-s/[0.08] border border-green-s/20 px-[0.75rem] py-[0.3rem] rounded-full">
              <span className="w-[6px] h-[6px] rounded-full bg-green-s animate-blink" />
              Claudio Online
            </span>
          </li>
          <li>
            <a href="#contato" className="btn btn-primary px-[1.1rem] py-[0.5rem] text-[0.8rem] no-underline">
              Diagnóstico Gratuito
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
