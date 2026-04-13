'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0A0806] py-12 px-10 border-t border-white/[0.05]">
      <div className="max-w-[1160px] mx-auto flex flex-wrap items-center justify-between gap-6">
        <Link href="/" className="flex items-center">
          <img 
            src="/images/logo-neuroads-premium.png" 
            alt="NeuroAds" 
            className="h-7 w-auto object-contain invert-[0.9] brightness-200 mix-blend-screen"
          />
        </Link>
        
        <ul className="flex flex-wrap gap-8 list-none">
          <li><Link href="#claudio" className="text-[0.79rem] text-white/35 no-underline transition-colors hover:text-white/75">Quem sou</Link></li>
          <li><Link href="#servicos" className="text-[0.79rem] text-white/35 no-underline transition-colors hover:text-white/75">Soluções</Link></li>
          <li><Link href="#lucca" className="text-[0.79rem] text-white/35 no-underline transition-colors hover:text-white/75">Lucca</Link></li>
          <li><Link href="#geo" className="text-[0.79rem] text-white/35 no-underline transition-colors hover:text-white/75">SEO & GEO</Link></li>
          <li><a href="mailto:contato@neuroads.com.br" className="text-[0.79rem] text-white/35 no-underline transition-colors hover:text-white/75">contato@neuroads.com.br</a></li>
        </ul>

        <p className="text-[0.73rem] text-white/20">© 2026 NeuroAds · Claudio Müller</p>
      </div>
    </footer>
  );
}
