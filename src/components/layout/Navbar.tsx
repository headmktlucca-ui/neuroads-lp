'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ChevronDown, User, CreditCard, LogOut } from 'lucide-react';

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
  const { user, logout } = useAuth();

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Hub Estratégico', href: '#gallery' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-[200] pt-6 px-6">
      <nav className="mx-auto max-w-[1200px] transition-all duration-700">
        <div className="glass-pill px-8 py-3 flex items-center justify-between transition-all duration-500 shadow-2xl bg-white/80 border-border/80">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center group transition-transform hover:scale-[1.02]">
              <img
                src="/images/logo2026.png"
                alt="NeuroAds Logo"
                className="h-10 lg:h-12 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="text-[14px] font-bold text-text-dim hover:text-primary transition-all">
                {link.name}
              </Link>
            ))}

            {/* User greeting + submenu (only when logged in) */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="relative px-8 py-3.5 group overflow-hidden rounded-full transition-all flex items-center gap-3 bg-gradient-to-r from-[#FF6B00] to-[#FF7A00] text-white shadow-[0_12px_30px_rgba(255,107,0,0.35)] hover:brightness-105 active:scale-[0.98]"
                >
                  <span className="relative z-10 text-white text-[14px] font-black tracking-[0.02em]">
                    {getGreeting()}, {getFirstName(user.displayName || user.email)}!
                  </span>
                  <ChevronDown size={14} className={`relative z-10 text-white transition-transform duration-300 ${isSettingsOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Submenu */}
                {isSettingsOpen && (
                  <div className="absolute top-full right-0 mt-4 w-[290px] bg-white border border-border rounded-[18px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.14)] py-3 z-[60]">
                    <button className="w-full px-7 py-4 text-left text-[11px] font-black tracking-[0.2em] text-text-muted hover:text-text-main hover:bg-bg-secondary transition-all flex items-center gap-4 uppercase">
                      <User size={15} /> Meu Perfil
                    </button>
                    <button className="w-full px-7 py-4 text-left text-[11px] font-black tracking-[0.2em] text-text-muted hover:text-text-main hover:bg-bg-secondary transition-all flex items-center gap-4 uppercase">
                      <CreditCard size={15} /> Assinatura
                    </button>
                    <div className="h-px bg-border mx-7 my-2" />
                    <button
                      onClick={() => { logout(); setIsSettingsOpen(false); }}
                      className="w-full px-7 py-4 text-left text-[11px] font-black tracking-[0.2em] text-red-500 hover:bg-red-50 transition-all flex items-center gap-4 uppercase"
                    >
                      <LogOut size={15} /> Sair
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-text-main p-2 focus:outline-none"
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
      </nav>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-24 left-6 right-6 bg-white border border-border shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] rounded-[32px] p-8 z-[210] overflow-hidden transition-all duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="flex flex-col items-center gap-10 px-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="text-lg font-black tracking-[0.08em] text-text-main hover:text-primary transition-colors"
            >
              {link.name}
            </Link>
          ))}

          <div className="w-full h-px bg-border" />

          {user && (
            <div className="w-full space-y-4">
              <p className="text-center text-sm font-black tracking-widest uppercase italic text-primary">
                {getGreeting()}, {getFirstName(user.displayName || user.email)}!
              </p>
              <button className="w-full py-5 text-sm font-black text-text-muted tracking-widest uppercase border border-border rounded-xl bg-bg-secondary">MEU PERFIL</button>
              <button className="w-full py-5 text-sm font-black text-text-muted tracking-widest uppercase border border-border rounded-xl bg-bg-secondary">ASSINATURA</button>
              <button
                onClick={() => { logout(); setIsMenuOpen(false); }}
                className="w-full py-5 text-sm font-black text-red-500 tracking-widest uppercase border border-red-200 rounded-xl bg-red-50 flex items-center justify-center gap-3"
              >
                <LogOut size={18} /> SAIR
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
