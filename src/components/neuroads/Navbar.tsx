'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

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
    <nav className={`sticky top-0 z-[100] transition-shadow duration-300 py-[1.1rem] px-10 flex items-center justify-between border-b border-black/10 backdrop-blur-2xl ${isScrolled ? 'shadow-[0_4px_40px_rgba(22,15,8,0.07)]' : ''}`} style={{ background: 'rgba(249, 246, 240, 0.95)' }}>
      <Link href="/" className="flex items-center">
        <img 
          src="/images/logo-neuroads-premium - horizontal.png" 
          alt="NeuroAds" 
          className="h-8 w-auto object-contain mix-blend-multiply"
        />
      </Link>
      
      <ul className="hidden md:flex items-center gap-8 list-none">
        <li><Link href="#claudio" className="text-[0.84rem] font-medium text-ink3 no-underline transition-colors hover:text-ink tracking-[0.01em]">Quem sou</Link></li>
        <li><Link href="#servicos" className="text-[0.84rem] font-medium text-ink3 no-underline transition-colors hover:text-ink tracking-[0.01em]">Soluções</Link></li>
        <li><Link href="#lucca" className="text-[0.84rem] font-medium text-ink3 no-underline transition-colors hover:text-ink tracking-[0.01em]">Lucca</Link></li>
        <li><Link href="#geo" className="text-[0.84rem] font-medium text-ink3 no-underline transition-colors hover:text-ink tracking-[0.01em]">SEO & GEO</Link></li>
        <li><Link href="#contato" className="bg-green-brand text-white py-[0.55rem] px-[1.35rem] rounded-[3px] font-semibold text-[0.8rem] tracking-[0.02em] transition-colors hover:bg-green-medium">Falar com Claudio</Link></li>
      </ul>
    </nav>
  );
}
