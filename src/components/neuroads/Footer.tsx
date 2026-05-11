'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const isHubSection = pathname?.startsWith('/hub');

  const renderSocialIcon = (name: string) => {
    if (name === 'Instagram') {
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#E1306C]" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="17.4" cy="6.6" r="1.2" fill="currentColor" />
        </svg>
      );
    }

    if (name === 'LinkedIn') {
      return (
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#0A66C2]" fill="currentColor" aria-hidden="true">
          <path d="M6.8 8.6a1.8 1.8 0 1 1 0-3.6 1.8 1.8 0 0 1 0 3.6ZM5.3 10h3V19h-3v-9Zm5 0h2.9v1.2h.1c.4-.8 1.4-1.5 2.9-1.5 3.1 0 3.7 2 3.7 4.7V19h-3v-4c0-1 0-2.3-1.4-2.3s-1.6 1.1-1.6 2.2V19h-3v-9Z" />
        </svg>
      );
    }

    return (
      <svg viewBox="0 0 24 24" className="w-4 h-4 text-[#FF0000]" fill="currentColor" aria-hidden="true">
        <path d="M21.6 8.8a3 3 0 0 0-2.1-2.1C17.6 6.2 12 6.2 12 6.2s-5.6 0-7.5.5a3 3 0 0 0-2.1 2.1C2 10.7 2 12 2 12s0 1.3.4 3.2a3 3 0 0 0 2.1 2.1c1.9.5 7.5.5 7.5.5s5.6 0 7.5-.5a3 3 0 0 0 2.1-2.1c.4-1.9.4-3.2.4-3.2s0-1.3-.4-3.2ZM10.2 15.2v-6.4L15.8 12l-5.6 3.2Z" />
      </svg>
    );
  };

  const socialLinks = [
    { name: 'Instagram', href: 'https://www.instagram.com/neuroads.oficial/' },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/company/neuroads' },
    { name: 'YouTube', href: 'https://www.youtube.com/@claudiomullermkt' }
  ];

  const hubFooterGroups = [
    {
      title: 'Hub Estratégico',
      links: [
        { label: 'Hub Estratégico', href: '/hub' },
      ],
    },
    {
      title: 'Laboratório de Agentes',
      links: [
        { label: 'Laboratório de Agentes', href: '/hub/laboratorio-agentes?agente=auditor-de-desperdicio' },
        { label: 'Performance', href: '/hub/performance' },
        { label: 'Criativos', href: '/hub/criativos' },
        { label: 'Técnico', href: '/hub/tecnico' },
        { label: 'Inteligência', href: '/hub/inteligencia' },
      ],
    },
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

  const footerGroups = isHubSection ? hubFooterGroups : defaultFooterGroups;

  return (
    <footer className="bg-white/65 backdrop-blur-sm py-20 px-6 border-t border-border">
      <div className="wrap">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12">
          
          <div className="flex flex-col max-w-[300px]">
            <Link href="/" className="group flex items-center mb-6 transition-transform hover:scale-[1.02]">
              <Image
                src="/images/logo2026.png" 
                alt="NeuroAds Logo" 
                width={176}
                height={44}
                className="h-9 lg:h-11 w-auto object-contain"
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
                    className="w-9 h-9 bg-white border border-border rounded-full flex items-center justify-center hover:border-primary transition-all"
                  >
                    {renderSocialIcon(social.name)}
                  </a>
                );
              })}
            </div>
          </div>
          
          <div className={isHubSection ? 'grid grid-cols-1 sm:grid-cols-2 gap-12 sm:gap-20' : 'grid grid-cols-1 sm:grid-cols-2 gap-12 sm:gap-20'}>
            {footerGroups.map((group) => (
              <div key={group.title}>
                {!isHubSection ? (
                  <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase text-text-dim mb-6">{group.title}</h4>
                ) : null}
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
