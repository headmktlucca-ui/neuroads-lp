'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
  { label: 'Laboratório', href: '/agentes-ia/visao-geral-dos-agentes' },
  { label: 'Além do Algoritmo', href: '/alem-do-algoritmo' },
  { label: 'A NeuroAds', href: '/a-neuroads/sobre' },
  { label: 'Contato', href: '/a-neuroads/contato' },
];

export default function PublicTopNav() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#08101e]/98 backdrop-blur-xl border-b border-white/[0.06]">
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

        {/* Nav items — immediately right of logo */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-md text-[13px] font-medium whitespace-nowrap transition-colors duration-200 ${
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

        {/* CTA */}
        <Link
          href="/hub"
          className="px-4 py-1.5 rounded-xl bg-[#ff6a00] hover:bg-[#ff7b1a] transition-colors text-[13px] font-bold text-white shadow-[0_2px_12px_rgba(255,106,0,0.3)]"
        >
          Acessar Hub
        </Link>
      </div>
    </header>
  );
}
