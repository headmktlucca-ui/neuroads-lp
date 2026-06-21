import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const FOOTER_COLUMNS = [
  {
    title: 'Hub',
    links: [
      { label: 'Dashboard', href: '/hub' },
      { label: 'Integrações', href: '/hub/integracoes' },
      { label: 'Performance', href: '/hub/performance' },
      { label: 'Criativos', href: '/hub/criativos' },
      { label: 'Automações', href: '/hub/automacoes' },
    ],
  },
  {
    title: 'Ferramentas',
    links: [
      { label: 'Lab. de Agentes', href: '/hub/laboratorio-agentes' },
      { label: 'Agentes Ativos', href: '/hub/agentes-ativos' },
      { label: 'Inteligência', href: '/hub/inteligencia' },
      { label: 'Configurações', href: '/hub/configuracoes' },
    ],
  },
  {
    title: 'Plataformas',
    links: [
      { label: 'Google Ads', href: '/hub/integracoes' },
      { label: 'Meta Ads', href: '/hub/integracoes' },
      { label: 'TikTok Ads', href: '/hub/integracoes' },
      { label: 'LinkedIn Ads', href: '/hub/integracoes' },
      { label: 'Google Analytics 4', href: '/hub/integracoes' },
    ],
  },
  {
    title: 'Suporte',
    links: [
      { label: 'Documentação', href: '#' },
      { label: 'Central de Ajuda', href: '#' },
      { label: 'Status do Sistema', href: '#' },
      { label: 'Contato', href: '#' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre a NeuroAds', href: '#' },
      { label: 'Termos de Uso', href: '#' },
      { label: 'Política de Privacidade', href: '#' },
      { label: 'Política de Reembolso', href: '#' },
    ],
  },
];

export default function HubFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#08101e]/98 mt-12">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Columns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-3 md:col-span-1">
            <div className="mb-3">
              <Image
                src="/images/logo2026.png"
                alt="NeuroAds"
                width={130}
                height={32}
                className="h-7 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-[12px] text-white/35 leading-relaxed max-w-[200px]">
              Inteligência de mídia paga com atribuição em tempo real para equipes de marketing.
            </p>
            <div className="mt-4 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.9)] animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-400/70">Sistema Ativo</span>
            </div>
          </div>

          {/* Link Columns */}
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="text-[10px] font-black uppercase tracking-[0.14em] text-white/25 mb-4">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-white/45 hover:text-white transition-colors duration-150 font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-white/20">
            © {new Date().getFullYear()} NeuroAds. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-[12px] text-white/25 hover:text-white/55 transition-colors duration-150">
              Termos
            </Link>
            <Link href="#" className="text-[12px] text-white/25 hover:text-white/55 transition-colors duration-150">
              Privacidade
            </Link>
            <Link href="#" className="text-[12px] text-white/25 hover:text-white/55 transition-colors duration-150">
              Política de Reembolso
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
