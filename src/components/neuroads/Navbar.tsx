'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
  return (
    <nav className="sticky top-0 z-[200] border-b border-white/10 bg-[#05060F]/85 backdrop-blur-[20px] saturate-[1.4]">
      <div className="max-w-[1160px] mx-auto px-10 py-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-[0.65rem] no-underline">
          <div className="w-[34px] h-[34px] rounded-lg bg-grad-main flex items-center justify-center font-head font-extrabold text-[0.85rem] text-white tracking-[-0.02em] shadow-[0_0_16px_rgba(59,111,255,0.4)]">
            NA
          </div>
          <span className="font-head font-extrabold text-[1.05rem] text-text-1 tracking-[-0.02em]">
            Neuro<span className="text-blue-2">Ads</span>
          </span>
        </a>

        <ul className="hidden lg:flex items-center gap-7 list-none">
          <li><a href="#claudio" className="text-[0.835rem] font-medium text-text-3 no-underline transition-colors hover:text-text-1">Sobre Claudio</a></li>
          <li><a href="#servicos" className="text-[0.835rem] font-medium text-text-3 no-underline transition-colors hover:text-text-1">Soluções</a></li>
          <li><a href="#lucca" className="text-[0.835rem] font-medium text-text-3 no-underline transition-colors hover:text-text-1">Lucca</a></li>
          <li><a href="#geo" className="text-[0.835rem] font-medium text-text-3 no-underline transition-colors hover:text-text-1">SEO & GEO</a></li>
          <li className="flex items-center gap-2 bg-green-s/10 border border-green-s/20 px-3 py-1 rounded-full text-[0.72rem] font-semibold text-green-s">
            <span className="w-1.5 h-1.5 rounded-full bg-green-s animate-pulse" />
            Claudio Online
          </li>
          <li>
            <a href="#contato" className="btn-primary bg-grad-main text-white px-4 py-2 rounded-md font-semibold text-[0.8rem] no-underline transition-all hover:scale-[1.02] shadow-[0_4px_24px_rgba(59,111,255,0.4)]">
              Diagnóstico Gratuito
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
}
