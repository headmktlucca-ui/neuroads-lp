'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { label: 'Laboratório', href: '/agentes-ia/visao-geral-dos-agentes' },
  { label: 'Além do Algoritmo', href: '/alem-do-algoritmo' },
  { label: 'A NeuroAds', href: '/a-neuroads/sobre' },
  { label: 'Contato', href: '/a-neuroads/contato' },
];

export default function PublicTopNav() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fecha o menu ao mudar de rota
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Previne scroll quando o menu está aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-[#000000] via-[#000000]/90 to-transparent pb-4">
      <div className="flex items-center h-20 px-6 gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src="/images/Logos/LLNeuroAds.png"
            alt="NeuroAds"
            width={164}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Nav items — Desktop */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2.5 rounded-lg text-[14px] font-medium whitespace-nowrap transition-colors duration-200 ${
                  isActive
                    ? 'text-white bg-white/[0.08]'
                    : 'text-[#8fa0b5] hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA — Desktop */}
        <div className="hidden lg:block">
          <Link
            href="/hub"
            className="flex items-center justify-center px-6 h-11 rounded-xl bg-gradient-to-r from-[#F24900] to-[#FF8805] hover:from-[#d93f00] hover:to-[#e07500] transition-all text-[14px] font-bold text-white shadow-[0_2px_12px_rgba(255,106,0,0.3)]"
          >
            Acessar Hub
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          className="lg:hidden p-2 -mr-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-20 z-40 bg-[#08101e]/95 backdrop-blur-xl border-t border-white/[0.06] flex flex-col p-6 lg:hidden h-[calc(100vh-80px)] overflow-y-auto">
          <nav className="flex flex-col gap-2 flex-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center h-14 px-4 rounded-xl text-[16px] font-medium transition-colors ${
                    isActive
                      ? 'text-white bg-white/[0.08]'
                      : 'text-[#8fa0b5] hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          <div className="pt-6 border-t border-white/[0.06]">
            <Link
              href="/hub"
              className="flex items-center justify-center w-full h-14 rounded-xl bg-gradient-to-r from-[#F24900] to-[#FF8805] hover:from-[#d93f00] hover:to-[#e07500] transition-all text-[16px] font-bold text-white shadow-[0_2px_12px_rgba(255,106,0,0.3)]"
            >
              Acessar Hub
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
