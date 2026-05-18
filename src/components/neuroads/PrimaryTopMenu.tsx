'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronDown, Menu, X } from 'lucide-react';

export type HeaderMenuLinkItem = {
  label: string;
  href: string;
};

export type HeaderMenuCategoryItem = {
  label: string;
  items: HeaderMenuLinkItem[];
};

export type HeaderSubmenuItem = HeaderMenuLinkItem | HeaderMenuCategoryItem;

export type HeaderMenuGroup = {
  label: string;
  href: string;
  submenu: HeaderSubmenuItem[];
};

function isCategorySubmenuItem(item: HeaderSubmenuItem): item is HeaderMenuCategoryItem {
  return 'items' in item;
}

export const PRIMARY_HEADER_MENU_GROUPS: HeaderMenuGroup[] = [
  {
    label: 'Serviços',
    href: '/servicos',
    submenu: [
      { label: 'Gestão de Tráfego', href: '/servicos/gestao-de-trafego-google-meta' },
      { label: 'SEO + GEO', href: '/servicos/seo-geo' },
      { label: 'Implantação de Agentes de IA', href: '/servicos/implantacao-de-agentes-ia' },
      { label: 'Estratégia de Funil de Conversão', href: '/servicos/estrategia-de-funil-e-conversao' },
      {
        label: 'Principais Setores',
        items: [
          { label: 'Mercado Imobiliário', href: '/servicos/mercado-imobiliario' },
          { label: 'Saúde & Clínicas', href: '/servicos/saude-clinicas' },
          { label: 'E-commerce & Varejo', href: '/servicos/e-commerce-varejo' },
          { label: 'Serviços Profissionais', href: '/servicos/servicos-profissionais' },
          { label: 'Educação Digital', href: '/servicos/educacao-digital' },
        ],
      },
    ],
  },
  {
    label: 'Agentes IA',
    href: '/agentes-ia',
    submenu: [
      { label: 'Visão Geral dos Agentes', href: '/agentes-ia/visao-geral-dos-agentes' },
      { label: 'Agentes de Aquisição', href: '/agentes-ia/agentes-de-aquisicao' },
      { label: 'Agentes de Conversão', href: '/agentes-ia/agentes-de-conversao' },
      { label: 'Agentes de Inteligência de Dados', href: '/agentes-ia/agentes-de-inteligencia-de-dados' },
    ],
  },
  {
    label: 'Conteúdos',
    href: '/conteudos',
    submenu: [
      { label: 'Além do Algoritmo', href: '/conteudos/alem-do-algoritmo' },
      { label: 'Materias de Apoio', href: '/conteudos/materias-de-apoio' },
      { label: 'FAQ', href: '/conteudos/faq' },
    ],
  },
  {
    label: 'A NeuroAds',
    href: '/a-neuroads',
    submenu: [
      { label: 'Sobre', href: '/a-neuroads/sobre' },
      { label: 'Nosso Método', href: '/a-neuroads/nosso-metodo' },
      { label: 'Contato', href: '/a-neuroads/contato' },
    ],
  },
];

type PrimaryTopMenuProps = {
  logoHref?: string;
  onSpecialistClick?: () => void;
  onRequestDemoClick?: () => void;
};

export default function PrimaryTopMenu({
  logoHref = '/',
  onSpecialistClick,
  onRequestDemoClick,
}: PrimaryTopMenuProps) {
  const [openMenuGroup, setOpenMenuGroup] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const closeMenuTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pathname = usePathname();

  const clearMenuCloseTimeout = () => {
    if (!closeMenuTimeoutRef.current) return;
    clearTimeout(closeMenuTimeoutRef.current);
    closeMenuTimeoutRef.current = null;
  };

  const openMenuWithIntent = (groupLabel: string) => {
    clearMenuCloseTimeout();
    setOpenMenuGroup(groupLabel);
  };

  const closeMenuWithDelay = (delay = 220) => {
    clearMenuCloseTimeout();
    closeMenuTimeoutRef.current = setTimeout(() => {
      setOpenMenuGroup(null);
      closeMenuTimeoutRef.current = null;
    }, delay);
  };

  const isActiveSubmenuItem = (href: string) => {
    if (!pathname) return false;
    const [basePath] = href.split('?');
    return pathname === basePath || pathname.startsWith(`${basePath}/`);
  };

  useEffect(() => {
    return () => clearMenuCloseTimeout();
  }, []);

  return (
    <>
      <header className="fixed left-1/2 top-4 z-[90] flex w-[min(calc(100%-1.5rem),1196px)] -translate-x-1/2 items-center justify-between gap-2 rounded-full border border-black/[0.06] bg-white px-3 py-3 shadow-[0_8px_26px_rgba(10,18,30,0.04)] sm:w-[min(calc(100%-2.5rem),1196px)] sm:gap-3 sm:px-5 md:px-7">
        <Link href={logoHref} className="flex items-center">
          <Image src="/images/logo2026.png" alt="NeuroAds" width={156} height={34} className="h-8 w-auto" priority />
        </Link>

        <nav
          className="hidden items-center gap-5 text-[13px] font-semibold text-[#5f6572] xl:flex"
          onMouseEnter={clearMenuCloseTimeout}
          onMouseLeave={() => closeMenuWithDelay(220)}
        >
          {PRIMARY_HEADER_MENU_GROUPS.map((group) => {
            const isOpen = openMenuGroup === group.label;
            return (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => openMenuWithIntent(group.label)}
              >
                <Link
                  href={group.href}
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[13px] font-semibold text-[#5f6572] transition hover:text-[#1c2230]"
                  aria-expanded={isOpen}
                  onFocus={() => openMenuWithIntent(group.label)}
                >
                  {group.label}
                  <ChevronDown size={13} className={`text-[#8a93a3] transition ${isOpen ? 'rotate-180' : ''}`} />
                </Link>

                <div
                  className={`absolute left-1/2 top-full z-[130] w-[320px] -translate-x-1/2 pt-2 transition duration-150 ${
                    isOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'
                  }`}
                  onMouseEnter={clearMenuCloseTimeout}
                  onMouseLeave={() => closeMenuWithDelay(220)}
                >
                  <div className="rounded-[16px] border border-[#e6ebf2] bg-white p-2 shadow-[0_16px_30px_rgba(18,26,40,0.1)]">
                    {group.submenu.map((item) => {
                      if (isCategorySubmenuItem(item)) {
                        return (
                          <div key={item.label} className="rounded-[12px] px-3 py-2">
                            <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#ff6a00]">{item.label}</p>
                            <div className="mt-1.5 space-y-1">
                              {item.items.map((nestedItem) => (
                                <Link
                                  key={nestedItem.href}
                                  href={nestedItem.href}
                                  onClick={() => setOpenMenuGroup(null)}
                                  className={`block rounded-[10px] px-2.5 py-1.5 text-[13px] font-semibold transition hover:bg-[#f7f9fc] hover:text-[#ff6a00] ${
                                    isActiveSubmenuItem(nestedItem.href) ? 'text-[#ff6a00]' : 'text-[#344058]'
                                  }`}
                                >
                                  {nestedItem.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpenMenuGroup(null)}
                          className={`block rounded-[12px] px-3 py-2.5 text-[13px] font-semibold transition hover:bg-[#f7f9fc] hover:text-[#ff6a00] ${
                            isActiveSubmenuItem(item.href) ? 'text-[#ff6a00]' : 'text-[#344058]'
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/#pricing"
            className="hidden items-center gap-2 rounded-full border border-[#d7dce5] bg-white px-5 py-2.5 text-[12px] font-extrabold text-[#2b3240] lg:inline-flex"
          >
            Valores & Recursos
            <ArrowRight size={13} />
          </Link>

          {onSpecialistClick ? (
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                // navegar para a página de login
                if (typeof window !== 'undefined') window.location.href = '/login';
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0A9D57] px-3 py-2.5 text-[11px] font-extrabold text-white sm:gap-2 sm:px-5 sm:text-[12px] shadow-[0_10px_30px_rgba(10,157,87,0.18)] hover:shadow-[0_12px_40px_rgba(10,157,87,0.26)] transition-shadow hover:bg-[#0B9D57] active:bg-[#087a45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0A9D57] focus-visible:ring-offset-white"
            >
              <span className="sm:hidden">Acessar meu Hub</span>
              <span className="hidden sm:inline">Acessar meu Hub</span>
              <ArrowRight size={13} className="hidden sm:inline" />
            </button>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0A9D57] px-3 py-2.5 text-[11px] font-extrabold text-white sm:gap-2 sm:px-5 sm:text-[12px] shadow-[0_10px_30px_rgba(10,157,87,0.18)] hover:shadow-[0_12px_40px_rgba(10,157,87,0.26)] transition-shadow hover:bg-[#0B9D57] active:bg-[#087a45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0A9D57] focus-visible:ring-offset-white"
            >
              <span className="sm:hidden">Acessar meu Hub</span>
              <span className="hidden sm:inline">Acessar meu Hub</span>
              <ArrowRight size={13} className="hidden sm:inline" />
            </Link>
          )}

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#dbe2ee] bg-white text-[#2b3240] transition hover:border-[#ffc8a5] hover:text-[#ff6a00] xl:hidden"
            aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {isMobileMenuOpen ? (
        <button
          type="button"
          aria-label="Fechar menu mobile"
          className="fixed inset-0 z-[85] bg-[#0e1830]/35 xl:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      ) : null}

      <div
        className={`fixed left-1/2 top-[84px] z-[95] max-h-[calc(100dvh-110px)] w-[min(calc(100%-1.5rem),460px)] -translate-x-1/2 overflow-y-auto overscroll-contain rounded-[20px] border border-[#e5eaf3] bg-white p-4 shadow-[0_20px_44px_rgba(12,22,38,0.16)] transition sm:w-[min(calc(100%-2.5rem),460px)] xl:hidden ${
          isMobileMenuOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'
        }`}
      >
        <div className="space-y-2">
          {PRIMARY_HEADER_MENU_GROUPS.map((group) => {
            const isGroupOpen = openMobileGroup === group.label;
            return (
              <div key={group.label} className="rounded-[14px] border border-[#edf1f7] bg-[#fafcff]">
                <div className="flex items-center gap-2 px-3.5 py-3">
                  <Link
                    href={group.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="grow text-[14px] font-black text-[#1f2a44]"
                  >
                    {group.label}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setOpenMobileGroup(isGroupOpen ? null : group.label)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#dde4ee] text-[#7d889d]"
                    aria-label={`Abrir submenu ${group.label}`}
                  >
                    <ChevronDown size={15} className={`shrink-0 transition ${isGroupOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>
                {isGroupOpen ? (
                  <div className="border-t border-[#edf1f7] px-2 py-2">
                    {group.submenu.map((item) => {
                      if (isCategorySubmenuItem(item)) {
                        return (
                          <div key={item.label} className="rounded-xl px-2.5 py-2">
                            <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#ff6a00]">{item.label}</p>
                            <div className="mt-1.5 space-y-1">
                              {item.items.map((nestedItem) => (
                                <Link
                                  key={nestedItem.href}
                                  href={nestedItem.href}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className={`block rounded-lg px-2 py-1.5 text-[13px] font-semibold transition hover:bg-[#fff5ee] hover:text-[#ff6a00] ${
                                    isActiveSubmenuItem(nestedItem.href) ? 'text-[#ff6a00]' : 'text-[#42506a]'
                                  }`}
                                >
                                  {nestedItem.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`block rounded-xl px-2.5 py-2 text-[13px] font-semibold transition hover:bg-[#fff5ee] hover:text-[#ff6a00] ${
                            isActiveSubmenuItem(item.href) ? 'text-[#ff6a00]' : 'text-[#42506a]'
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="mt-3 grid gap-2">
          <Link
            href="/#pricing"
            onClick={() => setIsMobileMenuOpen(false)}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d8deea] bg-white px-4 py-2.5 text-[12px] font-extrabold text-[#2b3240]"
          >
            Valores & Recursos
            <ArrowRight size={13} />
          </Link>

          {onRequestDemoClick ? (
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onRequestDemoClick();
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d8deea] bg-white px-4 py-2.5 text-[12px] font-extrabold text-[#2b3240] transition hover:border-[#ffc8a5] hover:text-[#ff6a00]"
            >
              Solicite Demonstração
              <ArrowRight size={13} />
            </button>
          ) : (
            <Link
              href="/a-neuroads/contato"
              onClick={() => setIsMobileMenuOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d8deea] bg-white px-4 py-2.5 text-[12px] font-extrabold text-[#2b3240] transition hover:border-[#ffc8a5] hover:text-[#ff6a00]"
            >
              Solicite Demonstração
              <ArrowRight size={13} />
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
