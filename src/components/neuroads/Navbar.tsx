'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const handleAccessHub = () => {
    closeMenu();
    window.location.href = '/hub';
  };


  const navLinks = [
    { name: 'Agentes Neurais', href: '#servicos' },
    { name: 'Ecossistema', href: '#lucca' },
    { name: 'Cases', href: '#depoimentos' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-[200] pt-6 px-6">
      <nav className={`mx-auto max-w-[1200px] transition-all duration-700`}>
        <div className={`glass-pill px-8 py-3 flex items-center justify-between transition-all duration-500 shadow-2xl ${isScrolled ? 'bg-white/80 border-border/80' : 'bg-white/40 border-white/20'}`}>
          
          <Link href="/" className="flex items-center group transition-transform hover:scale-[1.02]" onClick={closeMenu}>
            <Image
              src={isScrolled ? '/images/Logos/Logo_primario.png' : '/images/Logos/LLNeuroAds.png'}
              alt="NeuroAds Logo" 
              width={192}
              height={48}
              className="h-10 lg:h-12 w-auto object-contain"
            />
          </Link>
          <div className="hidden lg:flex items-center gap-10">
            <ul className="flex items-center gap-8 list-none m-0 p-0">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-[14px] font-bold text-text-dim hover:text-primary transition-all">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
            
            <div className="flex items-center gap-6 pl-10 border-l border-border/50">
              <Link href="/#contato" className="btn btn-primary px-6 py-2.5 text-[13px] rounded-full">
                Contato
                <ArrowRight size={14} className="ml-2" />
              </Link>
            </div>
          </div>

          <button 
            onClick={toggleMenu}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-text-main bg-bg-secondary rounded-full"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="lg:hidden absolute top-24 left-6 right-6 bg-white border border-border shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-[32px] p-8 z-[210] overflow-hidden"
          >
            <div className="flex flex-col gap-8">
              <ul className="flex flex-col gap-5 list-none m-0 p-0">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} onClick={() => setTimeout(closeMenu, 150)} className="text-[20px] font-black text-text-main block">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="pt-8 border-t border-border flex flex-col gap-4">
                <button onClick={handleAccessHub} className="w-full py-5 font-black text-text-main bg-bg-secondary rounded-2xl">
                  Entrar no Hub
                </button>
                <a href="#contato" onClick={() => setTimeout(closeMenu, 150)} className="btn btn-primary w-full py-5 rounded-2xl text-[16px]">
                  Diagnóstico Gratuito
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
