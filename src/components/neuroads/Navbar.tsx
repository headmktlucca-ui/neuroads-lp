'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

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
        <a href="#" className="flex items-center gap-4 no-underline group">
          <div className="w-10 h-10 relative flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
            <Image 
              src="/images/logo-icon.png" 
              alt="NeuroAds Icon" 
              fill 
              className="object-contain mix-blend-screen"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-head text-[1.25rem] font-extrabold tracking-tighter text-text-1">
              Neuro<span className="grad-text italic">Ads</span>
            </span>
          </div>
        </a>

        <ul className="hidden lg:flex items-center gap-[1.75rem] list-none">
          <li><a href="#claudio" className="text-[0.835rem] font-medium text-text-3 no-underline transition-colors hover:text-text-1">Sobre Nós</a></li>
          <li><a href="#problemas" className="text-[0.835rem] font-medium text-text-3 no-underline transition-colors hover:text-text-1">Desafios e Soluções</a></li>
          <li><a href="#lucca" className="text-[0.835rem] font-medium text-text-3 no-underline transition-colors hover:text-text-1">Nosso Diferencial</a></li>
          <li><a href="#contato" className="text-[0.835rem] font-medium text-text-3 no-underline transition-colors hover:text-text-1">Entre em Contato</a></li>
          <li>
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('neuroads:open-chat'))}
              className="flex items-center gap-[0.45rem] font-semibold text-[0.72rem] text-green-s bg-green-s/[0.08] border border-green-s/20 px-[0.75rem] py-[0.3rem] rounded-full hover:bg-green-s/20 transition-all cursor-pointer"
            >
              <span className="w-[6px] h-[6px] rounded-full bg-green-s animate-blink" />
              Atendimento Online
            </button>
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
