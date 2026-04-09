'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import AuthOverlay from '@/components/auth/AuthOverlay';

export default function Navbar() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <nav className="fixed w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center">
                {/* Neural Vector Icon (SVG) */}
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[var(--color-brand-orange)] group-hover:scale-110 transition-transform duration-500">
                  <path d="M16 4C11.5817 4 8 7.58172 8 12C8 14.42 9.07 16.59 10.77 18.07C10.77 18.07 11.5 19.5 11.5 21C11.5 22.5 12.5 24 14.5 24H17.5C19.5 24 20.5 22.5 20.5 21C20.5 19.5 21.23 18.07 21.23 18.07C22.93 16.59 24 14.42 24 12C24 7.58172 20.4183 4 16 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 11H20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2"/>
                  <path d="M12 15H20" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2"/>
                  <path d="M16 4V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M16 24V28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                
                {/* Brand Text */}
                <span className="ml-2 text-xl font-black tracking-tighter text-white">
                  NEURO<span className="text-[var(--color-brand-green)] font-light">ADS</span>
                </span>
                
                {/* Version Badge */}
                <div className="ml-3 px-1.5 py-0.5 bg-[var(--color-brand-orange)]/10 text-[8px] font-black text-[var(--color-brand-orange)] tracking-tighter border border-[var(--color-brand-orange)]/20 rounded-sm">
                  LAB v4.0
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-10">
            <Link href="/" className="text-xs font-mono tracking-widest text-white/70 hover:text-[var(--color-brand-orange)] transition-colors">HOME</Link>
            <Link href="#gallery" className="text-xs font-mono tracking-widest text-white/70 hover:text-[var(--color-brand-orange)] transition-colors">HUB ESTRATÉGICO</Link>
            <Link href="#pricing" className="text-xs font-mono tracking-widest text-white/70 hover:text-[var(--color-brand-orange)] transition-colors">PREÇOS</Link>
            
            {user ? (
              <button 
                onClick={logout}
                className="relative px-6 py-2 group overflow-hidden border border-white/20 hover:border-red-500/50 transition-colors"
              >
                <div className="absolute inset-0 bg-transparent group-hover:bg-red-500/10 skew-x-[-12deg] transition-colors" />
                <span className="relative z-10 text-white text-xs font-black tracking-widest">SAIR</span>
              </button>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="relative px-6 py-2 group overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-[var(--color-brand-orange)] skew-x-[-12deg] group-hover:bg-[var(--color-brand-green)] transition-colors" />
                <span className="relative z-10 text-black text-xs font-black tracking-widest uppercase">ENTRAR</span>
              </button>
            )}
          </div>
          
          {/* Mobile Menu Button - Minimalist */}
          <div className="md:hidden flex items-center">
            <button className="text-white p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 8h16M4 16h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <AuthOverlay isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
}
