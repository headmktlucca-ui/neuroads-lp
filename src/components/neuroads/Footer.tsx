'use client';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-bg-base py-16 px-10 border-t border-white/5">
      <div className="max-w-[1160px] mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
          
          <Link href="/" className="group flex items-center gap-4">
            <div className="w-10 h-10 relative flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
              <Image 
                src="/images/icon_neuroads_transparente.png" 
                alt="NeuroAds Icon" 
                fill 
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-head text-[1.5rem] font-extrabold tracking-tighter text-text-1">
                Neuro<span className="grad-text italic">Ads</span>
              </span>
              <p className="text-[0.65rem] text-text-4 font-bold tracking-[0.2em] uppercase -mt-1">
                Insights Inteligentes
              </p>
            </div>
          </Link>
          
          <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 list-none m-0 p-0">
            <li><Link href="#claudio" className="text-[0.78rem] font-medium text-text-2 no-underline transition-colors hover:text-blue-1">Sobre Nós</Link></li>
            <li><Link href="#problemas" className="text-[0.78rem] font-medium text-text-2 no-underline transition-colors hover:text-blue-1">Desafios e Soluções</Link></li>
            <li><Link href="#lucca" className="text-[0.78rem] font-medium text-text-2 no-underline transition-colors hover:text-blue-1">Nosso Diferencial</Link></li>
            <li><Link href="#contato" className="text-[0.78rem] font-medium text-text-2 no-underline transition-colors hover:text-blue-1">Entre em Contato</Link></li>
          </ul>

          <div className="flex flex-col items-center md:items-end gap-2 text-center md:text-right">
            <p className="text-[0.73rem] text-text-4">© 2026 NeuroAds · Claudio Müller</p>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-1" />
              <span className="text-[0.65rem] text-text-4 font-bold uppercase tracking-widest">Powered by Lucca.os</span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
