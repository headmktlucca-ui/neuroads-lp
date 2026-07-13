'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import HeroCircuitBackground from '@/components/ui/HeroCircuitBackground';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LegalSection {
  id: string;
  label: string;
}

interface LegalLayoutProps {
  children: React.ReactNode;
  /** Optional: list of sections to build sticky sidebar nav */
  sections?: LegalSection[];
  /** Title shown in the sidebar header */
  docTitle?: string;
  /** ISO date string: "Junho de 2026" */
  updatedAt?: string;
}

// ─── Sidebar TOC ──────────────────────────────────────────────────────────────

function TableOfContents({
  sections,
  docTitle,
  updatedAt,
}: {
  sections: LegalSection[];
  docTitle?: string;
  updatedAt?: string;
}) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '');

  useEffect(() => {
    if (!sections.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <aside className="hidden lg:block w-[220px] shrink-0">
      <div className="sticky top-28 space-y-5">
        {docTitle && (
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#FF5500] mb-1">Documento</p>
            <p className="text-[13px] font-black text-slate-800 leading-snug">{docTitle}</p>
          </div>
        )}

        <nav>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-450 mb-3">Conteúdo</p>
          <ul className="space-y-1">
            {sections.map(({ id, label }) => {
              const isActive = activeId === id;
              return (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className={`block text-[12px] font-bold py-1 pl-3 border-l-2 transition-all leading-snug ${
                      isActive
                        ? 'border-[#FF5500] text-[#FF5500]'
                        : 'border-slate-300/40 text-slate-500 hover:text-slate-800 hover:border-slate-400'
                    }`}
                    style={{ textDecoration: 'none' }}
                  >
                    {label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {updatedAt && (
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Atualizado em<br />{updatedAt}
          </p>
        )}
      </div>
    </aside>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function LegalLayout({
  children,
  sections = [],
  docTitle,
  updatedAt,
}: LegalLayoutProps) {
  const hasSidebar = sections.length > 0;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-[#EDF1F5] min-h-screen text-slate-800 font-sans antialiased pb-0 selection:bg-[#FF5500]/20 selection:text-[#FF5500]">
      
      {/* ========================================================================= */}
      {/* HEADER TEMPLATE 01 (LIGHT NEUMORPHIC) */}
      {/* ========================================================================= */}
      <header className="fixed top-4 left-0 right-0 w-full z-[999] px-4 sm:px-8 lg:px-24">
        <div className="bg-transparent md:bg-white shadow-none md:shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] border-none md:border md:border-white/50 rounded-none md:rounded-full py-2 md:py-4 px-0 md:px-8 flex items-center justify-between transition-all duration-300">
          {/* Logo */}
          <Link href="/" className="flex items-center group transition-transform duration-300 hover:scale-[1.01]">
            <Image
              src="/images/Logos/Logo_primario.png"
              alt="NeuroAds Logo"
              width={172}
              height={39}
              className="h-7 md:h-9 w-auto object-contain"
              priority
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#publico-alvo" className="text-slate-650 font-medium text-sm hover:text-[#FF5500] transition-colors duration-200">
              Público-Alvo
            </Link>
            <Link href="/#agentes" className="text-slate-650 font-medium text-sm hover:text-[#FF5500] transition-colors duration-200">
              Agentes IA
            </Link>
            <Link href="/#solucoes" className="text-slate-650 font-medium text-sm hover:text-[#FF5500] transition-colors duration-200">
              Soluções
            </Link>
            <Link href="/#demonstracao" className="text-slate-650 font-medium text-sm hover:text-[#FF5500] transition-colors duration-200">
              Demonstração
            </Link>
          </nav>

          {/* Action Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden md:inline-flex items-center justify-center font-bold text-xs px-6 py-2.5 rounded-full bg-white text-slate-700 shadow-[4px_4px_8px_#c8d0e7,-4px_-4px_8px_#ffffff] border border-white/60 hover:shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff] hover:bg-[#e4ecf5] active:scale-[0.98] transition-all duration-200"
            >
              Acessar Hub
            </Link>

            {/* Hamburger Toggle for Mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex md:hidden w-11 h-11 items-center justify-center rounded-full text-slate-700 hover:text-[#FF5500] active:bg-slate-200/50 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-16 left-4 right-4 bg-white border border-white/50 shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] rounded-[24px] p-6 flex flex-col gap-4 md:hidden z-[998]"
            >
              <Link
                href="/#publico-alvo"
                onClick={() => setIsMenuOpen(false)}
                className="text-slate-650 font-bold text-xs uppercase tracking-wider hover:text-[#FF5500] py-2 transition-colors duration-200"
              >
                Público-Alvo
              </Link>
              <Link
                href="/#agentes"
                onClick={() => setIsMenuOpen(false)}
                className="text-slate-650 font-bold text-xs uppercase tracking-wider hover:text-[#FF5500] py-2 transition-colors duration-200"
              >
                Agentes IA
              </Link>
              <Link
                href="/#solucoes"
                onClick={() => setIsMenuOpen(false)}
                className="text-slate-650 font-bold text-xs uppercase tracking-wider hover:text-[#FF5500] py-2 transition-colors duration-200"
              >
                Soluções
              </Link>
              <Link
                href="/#demonstracao"
                onClick={() => setIsMenuOpen(false)}
                className="text-slate-650 font-bold text-xs uppercase tracking-wider hover:text-[#FF5500] py-2 transition-colors duration-200"
              >
                Demonstração
              </Link>
              <div className="border-t border-slate-200 pt-4 mt-2">
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center font-bold text-xs py-3 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#FF7A00] text-white shadow-[3px_3px_8px_rgba(255,85,0,0.25)]"
                >
                  Acessar Hub
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ========================================================================= */}
      {/* CONTENT WITH PARALLAX BACKGROUND */}
      {/* ========================================================================= */}
      <div className="relative w-full pt-28 pb-8">
        {/* Background Wrapper */}
        <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-[#FAFBFD] to-[#ECEFF4] z-[1]">
          <HeroCircuitBackground />
        </div>

        <section className="relative z-[2] mx-auto max-w-[1200px] px-5 md:px-10 pb-24 pt-6">
          <div className="h-[20px] md:h-[40px]" />

          {/* Two-column layout when sidebar present */}
          <div className={`flex flex-col lg:flex-row gap-8 lg:gap-14 items-start lg:items-stretch ${hasSidebar ? '' : 'justify-center'}`}>
            {hasSidebar && (
              <TableOfContents sections={sections} docTitle={docTitle} updatedAt={updatedAt} />
            )}

            {/* Main content card */}
            <div className={`flex-1 w-full min-w-0 ${!hasSidebar ? 'max-w-[860px]' : ''}`}>
              <div className="bg-white shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] border border-white/50 rounded-[28px] p-7 sm:p-9 lg:p-11 backdrop-blur-md">
                {children}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* FOOTER */}
      {/* ========================================================================= */}
      <div className="relative w-full overflow-hidden py-16 md:py-24 mt-0">
        {/* Footer Background Wrapper */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FAFBFD] to-[#ECEFF4] z-[1]">
          <HeroCircuitBackground id="circuit-footer" />
        </div>

        <footer className="relative z-[2] max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              <div className="md:col-span-8 space-y-4">
                <div className="flex items-center">
                  <span className="font-head font-extrabold text-lg text-slate-900">
                    Neuro<span className="text-[#FF5500]">Ads</span>
                  </span>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed max-w-2xl">
                  Operações IA estratégicas para marketing e vendas B2B. Conectando dados em tempo real, automatizando funis e convertendo oportunidades.
                </p>
              </div>
              
              <div className="md:col-span-4 space-y-4 text-left md:text-right">
                <h4 className="font-head font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">Contato</h4>
                <ul className="space-y-2 text-xs text-slate-500">
                  <li>avante@neuroads.com.br</li>
                  <li>Suporte 24/7</li>
                  <li className="pt-2 flex md:justify-end">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white shadow-[inset_1.5px_1.5px_3px_#c8d0e7,inset_-1.5px_-1.5px_3px_#ffffff] text-[8px] font-bold text-emerald-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      Sistemas Online
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-slate-300/30 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
              <p>© {new Date().getFullYear()} NeuroAds. Todos os direitos reservados.</p>
              <div className="flex gap-4">
                <Link href="/termos" className="hover:text-slate-800 transition">Termos de Uso</Link>
                <Link href="/privacidade" className="hover:text-slate-800 transition">Privacidade</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>

    </div>
  );
}
