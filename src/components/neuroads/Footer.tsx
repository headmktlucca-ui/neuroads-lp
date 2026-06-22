'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  PRIMARY_HEADER_MENU_GROUPS,
  type HeaderMenuCategoryItem,
  type HeaderSubmenuItem,
} from './PrimaryTopMenu';

function isCategorySubmenuItem(item: HeaderSubmenuItem): item is HeaderMenuCategoryItem {
  return 'items' in item;
}

export default function Footer() {
  const pathname = usePathname();
  const isHubSection = pathname?.startsWith('/hub');

  const socialLinks = [
    { name: 'LinkedIn', href: 'https://www.linkedin.com/company/neuroads', iconSrc: '/images/linkedin-3d.png' },
    { name: 'Instagram', href: 'https://www.instagram.com/neuroads.oficial/', iconSrc: '/images/instagram-final.png' },
    { name: 'YouTube', href: 'https://www.youtube.com/@claudiomullermkt', iconSrc: '/images/youtube-final.png' }
  ];

  const defaultFooterGroups = [
    {
      title: 'Plataforma',
      links: [
        { label: 'Desafios', href: '#problemas' },
        { label: 'Soluções', href: '#servicos' },
        { label: 'Metodologia', href: '#processo' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacidade', href: '/privacidade' },
        { label: 'Termos', href: '/termos' },
      ],
    },
  ];
  if (isHubSection) {
    return (
      <footer className="relative z-10 w-full overflow-hidden border-t border-white/5 bg-[#000000]/95 backdrop-blur-xl">
        <div className="relative z-10 mx-auto max-w-[1260px] px-5 py-12 md:px-8">
          <div className="grid gap-8 border-b border-[#eceef2] pb-8 md:grid-cols-2 xl:grid-cols-[1.25fr_repeat(4,minmax(0,1fr))]">
            <div>
              <Link href="/" className="inline-flex items-center">
                <Image src="/images/Logos/LLNeuroAds.png" alt="NeuroAds Logo" width={220} height={56} className="h-11 w-auto object-contain" />
              </Link>
              <p className="mt-3 max-w-[280px] text-[13px] text-[#5f697b]">IA agêntica para marketing de alta performance.</p>
              <div className="mt-4 flex items-center gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="inline-flex h-9 w-9 overflow-hidden rounded-full border border-[#dce2ec] bg-white"
                  >
                    <Image src={social.iconSrc} alt={social.name} width={36} height={36} className="h-full w-full object-cover" />
                  </a>
                ))}
              </div>
            </div>

            {PRIMARY_HEADER_MENU_GROUPS.map((group) => (
              <div key={group.label}>
                <Link href={group.href} className="text-[14px] font-extrabold text-[#111827] transition hover:text-[#ff6a00]">
                  {group.label}
                </Link>
                <ul className="mt-3 space-y-2 text-[13px] text-[#566379]">
                  {group.submenu.map((item) => {
                    if (isCategorySubmenuItem(item)) {
                      return (
                        <li key={item.label}>
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

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
            <p className="text-xs text-[#8c93a0]">© 2026 NeuroAds · Claudio Müller. Todos os direitos reservados.</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#8c93a0]">Powered by</span>
              <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-primary">Lucca.os</span>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative z-10 w-full overflow-hidden border-t border-white/5 bg-[#000000]/95 backdrop-blur-xl">
      <div className="relative z-10 mx-auto max-w-[1260px] px-5 py-12 md:px-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12">
          
          <div className="flex flex-col max-w-[300px]">
            <Link href="/" className="group flex items-center mb-6 transition-transform hover:scale-[1.02]">
              <Image
                src="/images/Logos/LLNeuroAds.png" 
                alt="NeuroAds Logo" 
                width={220}
                height={56}
                className="h-11 lg:h-13 w-auto object-contain"
              />
            </Link>
            <p className="text-text-muted text-sm leading-relaxed mb-6">
              Orquestrando o futuro do marketing com inteligência agêntica e performance real.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => {
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="w-9 h-9 overflow-hidden rounded-xl border border-border bg-white transition-all hover:border-primary"
                  >
                    <Image
                      src={social.iconSrc}
                      alt={social.name}
                      width={36}
                      height={36}
                      className="h-full w-full object-cover"
                    />
                  </a>
                );
              })}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 sm:gap-20">
            {defaultFooterGroups.map((group) => (
              <div key={group.title}>
                <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase text-text-dim mb-6">{group.title}</h4>
                <ul className="flex flex-col gap-4 list-none m-0 p-0">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm font-medium text-text-muted hover:text-primary transition-all">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-text-dim">© 2026 NeuroAds · Claudio Müller. Todos os direitos reservados.</p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-text-dim">Powered by</span>
            <span className="text-[11px] font-extrabold text-primary uppercase tracking-[0.2em]">Lucca.os</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
