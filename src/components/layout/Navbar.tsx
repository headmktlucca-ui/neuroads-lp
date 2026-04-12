'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AuthOverlay from '../auth/AuthOverlay';
import { ChevronDown, User, CreditCard, LogOut, LayoutDashboard } from 'lucide-react';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function getFirstName(fullName: string | null | undefined): string {
  if (!fullName) return '';
  return fullName.split(' ')[0];
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, logout } = useAuth();

  const navLinks = [
    { name: 'HOME', href: user ? '/hub' : '/' },
    { name: 'HUB ESTRATÉGICO', href: user ? '/hub#gallery' : '#gallery' },
    { name: 'PREÇOS', href: '#pricing' },
  ];

  return (
    <nav className="fixed w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href={user ? "/hub" : "/"} className="flex items-center gap-3 group">
              <div className="relative flex items-center">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--color-brand-orange)] group-hover:scale-110 transition-transform duration-500">
                  <path d="M16 4C11.5817 4 8 7.58172 8 12C8 14.42 9.07 16.59 10.77 18.07C10.77 18.07 11.5 19.5 11.5 21C11.5 22.5 12.5 24 14.5 24H17.5C19.5 24 20.5 22.5 20.5 21C20.5 19.5 21.23 18.07 21.23 18.07C22.93 16.59 24 14.42 24 12C24 7.58172 20.4183 4 16 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 11H20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2"/>
                  <path d="M12 15H20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2"/>
                  <path d="M16 4V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M16 24V28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <span className="ml-2 text-xl font-black tracking-tighter text-white uppercase italic">
                  NEURO<span className="text-[var(--color-brand-green)] font-light">ADS</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-xs font-mono tracking-widest text-white/70 hover:text-[var(--color-brand-orange)] transition-colors">
                {link.name}
              </Link>
            ))}
            
            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="relative px-6 py-2 group overflow-hidden border border-white/20 hover:border-[var(--color-brand-orange)]/50 transition-all flex items-center gap-2"
                >
                  <div className="absolute inset-0 bg-transparent group-hover:bg-white/5 skew-x-[-12deg] transition-all" />
                  <span className="relative z-10 text-white text-xs font-black tracking-widest uppercase italic">
                    {getGreeting()}, {getFirstName(user.displayName || user.email)}!
                  </span>
                  <ChevronDown size={14} className={`relative z-10 transition-transform duration-300 ${isSettingsOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Submenu */}
                {isSettingsOpen && (
                  <div className="absolute top-full right-0 mt-3 w-64 bg-black/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-2 z-[60]">
                    <Link
                      href="/hub"
                      onClick={() => setIsSettingsOpen(false)}
                      className="w-full px-6 py-4 text-left text-[11px] font-black tracking-[0.2em] text-[var(--color-brand-orange)] hover:text-white hover:bg-[var(--color-brand-orange)]/10 transition-all flex items-center gap-3"
                    >
                      <LayoutDashboard size={14} /> ACESSAR MEU HUB
                    </Link>
                    <div className="h-px bg-white/5 mx-4 my-1" />
                    <button className="w-full px-6 py-4 text-left text-[11px] font-black tracking-[0.2em] text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-3">
                      <User size={14} /> MEU PERFIL
                    </button>
                    <button className="w-full px-6 py-4 text-left text-[11px] font-black tracking-[0.2em] text-slate-400 hover:text-white hover:bg-white/5 transition-all flex items-center gap-3">
                      <CreditCard size={14} /> ASSINATURA
                    </button>
                    <div className="h-px bg-white/5 mx-4 my-1" />
                    <button 
                      onClick={() => { logout(); setIsSettingsOpen(false); }}
                      className="w-full px-6 py-4 text-left text-[11px] font-black tracking-[0.2em] text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-3"
                    >
                      <LogOut size={14} /> SAIR
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="relative px-8 py-3 group overflow-hidden cursor-pointer"
              >
                {/* Border Glow Loop */}
                <div className="absolute inset-0 border border-white/5 rounded-full" />
                
                <span className="relative z-10 text-[13px] font-black tracking-[0.4em] uppercase italic bg-gradient-to-r from-[var(--color-brand-orange)] via-[var(--color-brand-green)] to-[var(--color-brand-orange)] bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer-text flex items-center gap-4">
                  ACESSAR MEU HUB
                </span>
              </button>
            )}
          </div>
          
          {/* Mobile Menu Button - Minimalist */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="text-white p-2 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 8h16M4 16h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Backdrop & Panel */}
      <div className={`md:hidden absolute top-20 left-0 w-full bg-black/98 backdrop-blur-3xl border-b border-white/10 transition-all duration-300 ${isMenuOpen ? 'opacity-100 visible max-h-screen py-10' : 'opacity-0 invisible max-h-0'}`}>
        <div className="flex flex-col items-center gap-10 px-6">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              onClick={() => setIsMenuOpen(false)}
              className="text-lg font-black tracking-[0.3em] text-white hover:text-[var(--color-brand-orange)] transition-colors uppercase italic"
            >
              {link.name}
            </Link>
          ))}
          
          <div className="w-full h-px bg-white/5" />
          
          {user ? (
            <div className="w-full space-y-4">
              <p className="text-center text-sm font-black tracking-widest uppercase italic text-[var(--color-brand-orange)]">
                {getGreeting()}, {getFirstName(user.displayName || user.email)}!
              </p>
              <Link
                href="/hub"
                onClick={() => setIsMenuOpen(false)}
                className="w-full py-5 text-sm font-black text-[var(--color-brand-orange)] tracking-widest uppercase border border-[var(--color-brand-orange)]/30 rounded-xl bg-[var(--color-brand-orange)]/5 flex items-center justify-center gap-3"
              >
                <LayoutDashboard size={18} /> ACESSAR MEU HUB
              </Link>
              <button className="w-full py-5 text-sm font-black text-slate-400 tracking-widest uppercase border border-white/5 rounded-xl">MEU PERFIL</button>
              <button className="w-full py-5 text-sm font-black text-slate-400 tracking-widest uppercase border border-white/5 rounded-xl">ASSINATURA</button>
              <button 
                onClick={() => { logout(); setIsMenuOpen(false); }}
                className="w-full py-5 text-sm font-black text-red-500 tracking-widest uppercase border border-red-500/20 rounded-xl bg-red-500/5 flex items-center justify-center gap-3"
              >
                <LogOut size={18} /> SAIR DA CONTA
              </button>
            </div>
          ) : (
            <button 
              onClick={() => { setIsAuthModalOpen(true); setIsMenuOpen(false); }}
              className="w-full py-6 bg-transparent border border-white/10 rounded-2xl relative overflow-hidden group"
            >
              <span className="relative z-10 text-lg font-black tracking-[0.4em] uppercase italic bg-gradient-to-r from-[var(--color-brand-orange)] via-[var(--color-brand-green)] to-[var(--color-brand-orange)] bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer-text">
                ACESSAR MEU HUB
              </span>
            </button>
          )}
        </div>
      </div>

      <AuthOverlay isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
}
