'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PRIMARY_HEADER_MENU_GROUPS } from './PrimaryTopMenu';

export default function PrimaryFooter() {
  return (
    <footer id="rodape" className="mx-auto max-w-[1260px] px-5 pb-8 pt-2 md:px-8">
      <div className="grid gap-8 border-b border-[#eceef2] pb-8 md:grid-cols-2 xl:grid-cols-[1.25fr_repeat(4,minmax(0,1fr))]">
        <div>
          <Image src="/images/logo2026.png" alt="NeuroAds" width={150} height={32} className="h-8 w-auto" />
          <p className="mt-3 max-w-[280px] text-[13px] text-[#707887]">IA agêntica para marketing de alta performance.</p>
          <div className="mt-4 flex items-center gap-3 text-[#525b6b]">
            <a
              href="https://www.linkedin.com/company/neuroads"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 w-8 overflow-hidden rounded-lg border border-[#e5e8ee] bg-white"
              aria-label="LinkedIn"
            >
              <Image src="/images/linkedin-3d.png" alt="LinkedIn" width={32} height={32} className="h-full w-full object-cover" />
            </a>
            <a
              href="https://www.instagram.com/neuroads.oficial/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 w-8 overflow-hidden rounded-lg border border-[#e5e8ee] bg-white"
              aria-label="Instagram"
            >
              <Image src="/images/instagram-final.png" alt="Instagram" width={32} height={32} className="h-full w-full object-cover" />
            </a>
            <a
              href="https://www.youtube.com/@claudiomullermkt"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 w-8 overflow-hidden rounded-lg border border-[#e5e8ee] bg-white"
              aria-label="YouTube"
            >
              <Image src="/images/youtube-final.png" alt="YouTube" width={32} height={32} className="h-full w-full object-cover" />
            </a>
          </div>
        </div>

        {PRIMARY_HEADER_MENU_GROUPS.map((group) => (
          <div key={group.label}>
            <Link href={group.href} className="text-[14px] font-extrabold text-[#242934] transition hover:text-[#ff6a00]">
              {group.label}
            </Link>
            <ul className="mt-3 space-y-2 text-[13px] text-[#656d7c]">
              {group.submenu.map((item) => {
                if ('items' in item) {
                  return (
                    <li key={item.label} className="pt-1">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#ff6a00]">{item.label}</p>
                      <div className="mt-1.5 space-y-1.5 pl-2">
                        {item.items.map((nestedItem) => (
                          <Link key={nestedItem.href} href={nestedItem.href} className="block transition hover:text-[#ff6a00]">
                            {nestedItem.label}
                          </Link>
                        ))}
                      </div>
                    </li>
                  );
                }

                return (
                  <li key={item.href}>
                    <Link href={item.href} className="transition hover:text-[#ff6a00]">
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-[11px] text-[#8c93a0]">
        <p>© 2026 NeuroAds. Todos os direitos reservados.</p>
        <div className="flex items-center gap-6">
          <Link href="/privacidade">Política de Privacidade</Link>
          <Link href="/termos">Termos de Uso</Link>
        </div>
      </div>
    </footer>
  );
}
