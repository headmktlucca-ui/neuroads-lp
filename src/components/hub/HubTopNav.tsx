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
  { label: 'CONFIGURAÇÕES', href: '/hub/configuracoes' },
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
    <header className="fixed top-0 left-0 right-0 z-50 flex flex-col bg-[var(--color-hub-base)]/98 backdrop-blur-xl">
      {/* Top Bar: Logo + User */}
      <div className="flex items-center justify-between px-6 h-14">
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

        {/* O Avatar foi movido para o HubDashboard.tsx conforme solicitado */}
      </div>

      {/* Sub-Nav: Section Links */}
      <nav className="flex items-center justify-start md:justify-center gap-0 px-4 h-[42px] overflow-x-auto scrollbar-none">
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
        <button
          onClick={handleLogout}
          className="relative flex items-center px-4 h-full text-[13px] font-semibold whitespace-nowrap transition-colors duration-200 text-[#ff4d4d] hover:text-[#ff1a1a]"
        >
          SAIR
        </button>
      </nav>
    </header>
  );
}
