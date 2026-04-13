'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = [
    { name: 'Sobre Nós', href: '#claudio' },
    { name: 'Desafios e Soluções', href: '#problemas' },
    { name: 'Nosso Diferencial', href: '#lucca' },
  ];

  return (
    <nav className={`sticky top-0 z-[200] border-b border-white/10 transition-all duration-300 ${isScrolled ? 'bg-[#05060F]/85 py-2' : 'bg-transparent py-4'} backdrop-blur-[20px] saturate-[1.4]`}>
      <div className="max-w-[1160px] mx-auto px-8 flex items-center justify-between">
        <a href="#" className="flex items-center gap-4 no-underline group" onClick={closeMenu}>
          <div className="w-10 h-10 relative flex-shrink-0 group-hover:scale-110 transition-transform duration-500">
            <Image 
              src="/images/icon_neuroads_transparente.png" 
              alt="NeuroAds Icon" 
              fill 
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-head text-[1.25rem] font-extrabold tracking-tighter text-text-1">
              Neuro<span className="grad-text italic">Ads</span>
            </span>
            <span className="text-[0.55rem] text-text-4 font-bold tracking-[0.2em] uppercase -mt-1 hidden sm:block">
              Insights Inteligentes
            </span>
          </div>
        </a>

        {/* MOBILE TOGGLE */}
        <button 
          onClick={toggleMenu}
          className="lg:hidden w-10 h-10 flex items-center justify-center text-text-1 bg-white/5 border border-white/10 rounded-lg active:scale-95 transition-all z-[210]"
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* DESKTOP LINKS */}
        <ul className="hidden lg:flex items-center gap-[1.75rem] list-none">
          {navLinks.map((link) => (
            <li key={link.name}>
              <a href={link.href} className="text-[0.835rem] font-medium text-text-3 no-underline transition-colors hover:text-text-1">
                {link.name}
              </a>
            </li>
          ))}
          <li>
            <button 
              onClick={() => {
                window.dispatchEvent(new CustomEvent('neuroads:open-chat'));
                closeMenu();
              }}
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

      {/* MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="lg:hidden absolute top-full left-0 w-full bg-[#05060F]/95 backdrop-blur-[32px] border-b border-white/10 overflow-hidden"
          >
            <div className="px-8 py-10 flex flex-col gap-8">
              <ul className="flex flex-col gap-6 list-none p-0 m-0">
                {navLinks.map((link, i) => (
                  <motion.li 
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + (i * 0.05) }}
                  >
                    <a 
                      href={link.href} 
                      onClick={closeMenu}
                      className="text-[1.1rem] font-medium text-text-2 hover:text-text-1 transition-colors"
                    >
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-6 border-t border-white/5 flex flex-col gap-4"
              >
                <button 
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('neuroads:open-chat'));
                    closeMenu();
                  }}
                  className="w-full flex items-center justify-center gap-2 font-semibold text-[0.875rem] text-green-s bg-green-s/[0.08] border border-green-s/20 py-4 rounded-xl"
                >
                  <span className="w-2 h-2 rounded-full bg-green-s animate-blink" />
                  Atendimento Online
                </button>
                <a 
                  href="#contato" 
                  onClick={closeMenu}
                  className="btn btn-primary w-full py-4 rounded-xl flex items-center justify-center text-[0.9rem]"
                >
                  Diagnóstico Gratuito
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
