'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { User } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/hub' },
  { label: 'Explorar', href: '/hub/explorar' },
  { label: 'Assistente IA', href: '/hub/assistente-ia' },
  { label: 'Laboratório', href: '/hub/laboratorio-agentes' },
  { label: 'Automações', href: '/hub/automacoes' },
  { label: 'Agentes Ativos', href: '/hub/agentes-ativos' },
  { label: 'Estúdio', href: '/hub/estudio' },
  { label: 'API Keys', href: '/hub/api-keys' },
  { label: 'Integrações', href: '/hub/integracoes' },
  { label: 'MCP & CLI', href: '/hub/mcp-cli' },
];

const DROPDOWN_ITEMS = [
  { label: 'Explorar', href: '/hub/explorar' },
  { label: 'Financeiro', href: '/hub/financeiro' },
  { label: 'Times', href: '/hub/times' },
  { label: 'Galeria', href: '/hub/galeria' },
  { label: 'Suporte', href: '/hub/suporte' },
];

export default function HubTopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Erro ao sair:', err);
    }
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col bg-[var(--color-hub-base)]/98 backdrop-blur-xl shadow-[0_1px_0_rgba(255,255,255,0.06)]">
      {/* Top Bar: Logo + User */}
      <div className="flex items-center justify-between px-6 h-14 border-b border-white/[0.06]">
        {/* Logo */}
        <Link href="/hub" className="flex items-center shrink-0">
          <Image
            src="/images/Logos/LLNeuroAds.png"
            alt="NeuroAds"
            width={148}
            height={36}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {/* Right: Avatar Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center justify-center h-9 w-9 rounded-full border border-white/[0.10] bg-white/[0.05] overflow-hidden hover:border-white/[0.22] transition-all duration-200 cursor-pointer"
          >
            {user?.photoURL ? (
              <Image src={user.photoURL} alt="Perfil" width={36} height={36} className="object-cover w-full h-full" />
            ) : (
              <User className="h-4 w-4 text-white/60" />
            )}
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-52 rounded-2xl border border-[var(--color-hub-border)] bg-[var(--color-hub-surface)]/98 backdrop-blur-xl shadow-[var(--shadow-hub-card)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 z-50">
              <nav className="py-2">
                {DROPDOWN_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center px-4 py-2.5 text-[14px] font-medium text-white/65 hover:text-white hover:bg-white/[0.05] transition-colors duration-150"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="my-1.5 h-px bg-white/[0.06] mx-3" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center px-4 py-2.5 text-[14px] font-medium text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/[0.06] transition-colors duration-150 cursor-pointer"
                >
                  Sair
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Sub-Nav: Section Links */}
      <nav className="flex items-center gap-0 px-4 h-[42px] border-b border-white/[0.04] overflow-x-auto scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/hub' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center px-4 h-full text-[13px] font-semibold whitespace-nowrap transition-colors duration-200 ${
                isActive ? 'text-white' : 'text-[#8fa0b5] hover:text-white/80'
              }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t bg-gradient-to-r from-[var(--color-hub-accent)] to-[var(--color-hub-accent-h)] shadow-[var(--shadow-hub-orange)]" />
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
