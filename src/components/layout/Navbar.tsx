'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ChevronDown, User, LogOut, X, PlugZap, CheckCircle2, Database, Gauge } from 'lucide-react';
import { HTTPS_PREFIX, normalizeHttpsMaskedUrlInput } from '../../lib/url-mask';

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

type ConnectorStatus = {
  googleAds: boolean;
  metaAds: boolean;
  ga4: boolean;
  serverTracking: boolean;
  crm: boolean;
  payments: boolean;
  warehouse: boolean;
};

type ConnectorDefinition = {
  key: keyof ConnectorStatus;
  name: string;
  source: string;
  required: boolean;
  usedBy: string;
};

const DEFAULT_CONNECTOR_STATUS: ConnectorStatus = {
  googleAds: false,
  metaAds: false,
  ga4: false,
  serverTracking: false,
  crm: false,
  payments: false,
  warehouse: false,
};

const DEFAULT_COMPANY_FORM = {
  companyName: '',
  site: HTTPS_PREFIX,
  instagram: '',
  linkedin: '',
  tiktok: '',
  blog: '',
};

const DEFAULT_CONNECTOR_CONFIG = {
  timezone: 'America/Sao_Paulo',
  currency: 'BRL',
  attributionWindow: '7d-click / 1d-view',
  refreshFrequency: '15 min',
};

const CONNECTOR_DEFINITIONS: ConnectorDefinition[] = [
  { key: 'googleAds', name: 'Google Ads API', source: 'Mídia paga', required: true, usedBy: 'ROAS, CAC, alertas de campanha' },
  { key: 'metaAds', name: 'Meta Ads API', source: 'Mídia paga', required: true, usedBy: 'CPL, CPA, desperdício e variações' },
  { key: 'ga4', name: 'GA4 Data API', source: 'Analytics', required: true, usedBy: 'Funil, taxa de conversão e jornada' },
  { key: 'serverTracking', name: 'GTM Server + CAPI/Enhanced', source: 'Atribuição', required: true, usedBy: 'Atribuição confiável e deduplicação' },
  { key: 'crm', name: 'CRM (HubSpot/RD/Pipedrive)', source: 'Vendas', required: true, usedBy: 'MQL, SQL, ganhos reais por estágio' },
  { key: 'payments', name: 'Stripe/Pagamentos', source: 'Receita', required: true, usedBy: 'Receita confirmada e LTV' },
  { key: 'warehouse', name: 'BigQuery/Data Warehouse', source: 'Consolidação', required: true, usedBy: 'Visão unificada e projeções' },
];

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLabSubmenuOpen, setIsLabSubmenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isConnectorsOpen, setIsConnectorsOpen] = useState(false);
  const [companySaved, setCompanySaved] = useState(false);
  const [connectorsSaved, setConnectorsSaved] = useState(false);
  const [companyForm, setCompanyForm] = useState(DEFAULT_COMPANY_FORM);
  const [connectorStatus, setConnectorStatus] = useState<ConnectorStatus>(DEFAULT_CONNECTOR_STATUS);
  const [connectorConfig, setConnectorConfig] = useState(DEFAULT_CONNECTOR_CONFIG);
  const [whatsApp, setWhatsApp] = useState('');
  const { user, profile, logout, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentHash, setCurrentHash] = useState('');
  const settingsMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isSettingsOpen) return;

    const handleOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(target)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsidePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointerDown);
    };
  }, [isSettingsOpen]);

  useEffect(() => {
    const syncHash = () => {
      if (typeof window !== 'undefined') {
        setCurrentHash(window.location.hash || '');
      }
    };

    syncHash();
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', syncHash);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('hashchange', syncHash);
      }
    };
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!pathname?.startsWith('/admin')) return;

    const sectionIds = [
      'operacao-lucca',
      'crm-custom',
      'crm-funil',
      'gestao-agentes',
      'gestao-financeira',
      'canais',
    ];

    const resolveActiveSection = () => {
      const anchorY = 170;
      let candidate: string | null = null;
      let nearestAbove: { id: string; distance: number } | null = null;
      let nearestBelow: { id: string; distance: number } | null = null;

      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (!element) continue;

        const rect = element.getBoundingClientRect();

        if (rect.top <= anchorY && rect.bottom >= anchorY) {
          candidate = id;
          break;
        }

        if (rect.top < anchorY) {
          const distance = anchorY - rect.top;
          if (!nearestAbove || distance < nearestAbove.distance) {
            nearestAbove = { id, distance };
          }
        } else {
          const distance = rect.top - anchorY;
          if (!nearestBelow || distance < nearestBelow.distance) {
            nearestBelow = { id, distance };
          }
        }
      }

      if (!candidate) {
        candidate = nearestBelow?.id || nearestAbove?.id || null;
      }

      if (candidate) {
        const nextHash = `#${candidate}`;
        setCurrentHash((prev) => (prev === nextHash ? prev : nextHash));
      }
    };

    resolveActiveSection();
    window.addEventListener('scroll', resolveActiveSection, { passive: true });
    window.addEventListener('resize', resolveActiveSection);

    return () => {
      window.removeEventListener('scroll', resolveActiveSection);
      window.removeEventListener('resize', resolveActiveSection);
    };
  }, [pathname]);

  const isConnectorsModalOpen = isConnectorsOpen || searchParams.get('connectors') === '1';
  const isCompanyModalOpen = isCompanyOpen || searchParams.get('brand') === '1';

  const closeConnectorsModal = () => {
    setIsConnectorsOpen(false);
    if (searchParams.get('connectors') === '1') {
      router.replace(pathname || '/hub', { scroll: false });
    }
  };

  const closeCompanyModal = () => {
    setIsCompanyOpen(false);
    if (searchParams.get('brand') === '1') {
      router.replace(pathname || '/hub', { scroll: false });
    }
  };

  const navLinks = pathname?.startsWith('/admin') && isAdmin
    ? [
        { name: 'Administrativo', href: '/admin#operacao-lucca' },
        { name: 'Cadastros', href: '/admin#crm-custom' },
        { name: 'CRM Funil', href: '/admin#crm-funil' },
        { name: 'Agentes', href: '/admin#gestao-agentes' },
        { name: 'Financeiro', href: '/admin#gestao-financeira' },
      ]
      : [
        { name: 'Hub Estratégico', href: '/hub' },
        { name: 'Laboratório de Agentes', href: '/hub/laboratorio-agentes?agente=auditor-de-desperdicio' },
      ];
  const laboratorySubLinks = [
    { name: 'Performance', href: '/hub/performance' },
    { name: 'Criativos', href: '/hub/criativos' },
    { name: 'Técnico', href: '/hub/tecnico' },
    { name: 'Inteligência', href: '/hub/inteligencia' },
  ];
  const desktopNavClass = pathname?.startsWith('/admin')
    ? 'hidden md:flex items-center gap-9'
    : 'hidden md:flex items-center gap-10';

  const isLinkActive = (href: string): boolean => {
    if (!pathname) return false;
    const [pathWithQuery, hash] = href.split('#');
    const [basePath] = pathWithQuery.split('?');
    if (basePath === '/hub') {
      return pathname === '/hub' || pathname.startsWith('/hub/agente');
    }
    if (basePath === '/hub/laboratorio-agentes') {
      return (
        pathname.startsWith('/hub/laboratorio-agentes') ||
        pathname.startsWith('/hub/performance') ||
        pathname.startsWith('/hub/criativos') ||
        pathname.startsWith('/hub/tecnico') ||
        pathname.startsWith('/hub/inteligencia')
      );
    }
    if (basePath === '/admin' && hash) {
      return pathname === '/admin' && currentHash === `#${hash}`;
    }
    return pathname === basePath || pathname.startsWith(`${basePath}/`);
  };

  const handleNavLinkClick = (href: string) => {
    const [basePath, hash] = href.split('#');
    if (basePath === '/admin' && hash) {
      setCurrentHash(`#${hash}`);
    }
  };

  const usageCount = profile?.usageStats ? Object.keys(profile.usageStats).length : 0;
  const connectedPlatforms = profile?.connections
    ? Object.values(profile.connections).filter((connection) => connection?.isActive).length
    : 0;
  const requiredConnectors = CONNECTOR_DEFINITIONS.filter((item) => item.required);
  const connectedRequired = requiredConnectors.filter((item) => connectorStatus[item.key]).length;
  const dashboardReadiness = Math.round((connectedRequired / requiredConnectors.length) * 100);
  const profileRecord = (profile as Record<string, unknown> | null) ?? null;

  useEffect(() => {
    if (!user) return;

    const companyKey = `neuroads_company_profile_${user.uid}`;
    const contactKey = `neuroads_profile_contact_${user.uid}`;
    const connectorsKey = `neuroads_dashboard_connectors_${user.uid}`;
    const connectorsConfigKey = `neuroads_dashboard_connectors_config_${user.uid}`;
    const fallbackWhatsapp = typeof profileRecord?.whatsapp === 'string' ? profileRecord.whatsapp : '';
    let timeoutId: number | undefined;

    try {
      let nextCompanyForm = DEFAULT_COMPANY_FORM;
      let nextWhatsapp = fallbackWhatsapp;
      let nextConnectorStatus = DEFAULT_CONNECTOR_STATUS;
      let nextConnectorConfig = DEFAULT_CONNECTOR_CONFIG;

      const companyRaw = window.localStorage.getItem(companyKey);
      if (companyRaw) {
        const parsed = JSON.parse(companyRaw) as typeof companyForm;
        nextCompanyForm = {
          companyName: parsed.companyName || '',
          site: parsed.site ? normalizeHttpsMaskedUrlInput(parsed.site) : HTTPS_PREFIX,
          instagram: parsed.instagram || '',
          linkedin: parsed.linkedin || '',
          tiktok: parsed.tiktok || '',
          blog: parsed.blog || '',
        };
      }

      const contactRaw = window.localStorage.getItem(contactKey);
      if (contactRaw) {
        const parsed = JSON.parse(contactRaw) as { whatsapp?: string };
        nextWhatsapp = parsed.whatsapp || fallbackWhatsapp;
      } else {
        nextWhatsapp = fallbackWhatsapp;
      }

      const connectorsRaw = window.localStorage.getItem(connectorsKey);
      if (connectorsRaw) {
        const parsed = JSON.parse(connectorsRaw) as Partial<ConnectorStatus>;
        nextConnectorStatus = {
          ...DEFAULT_CONNECTOR_STATUS,
          ...parsed,
        };
      }

      const connectorsConfigRaw = window.localStorage.getItem(connectorsConfigKey);
      if (connectorsConfigRaw) {
        const parsed = JSON.parse(connectorsConfigRaw) as Partial<typeof connectorConfig>;
        nextConnectorConfig = { ...DEFAULT_CONNECTOR_CONFIG, ...parsed };
      }

      timeoutId = window.setTimeout(() => {
        setCompanyForm(nextCompanyForm);
        setWhatsApp(nextWhatsapp);
        setConnectorStatus(nextConnectorStatus);
        setConnectorConfig(nextConnectorConfig);
      }, 0);
    } catch {
      timeoutId = window.setTimeout(() => {
        setWhatsApp(fallbackWhatsapp);
      }, 0);
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [profileRecord?.whatsapp, user]);

  const handleSaveCompany = () => {
    if (!user) return;
    const companyKey = `neuroads_company_profile_${user.uid}`;
    window.localStorage.setItem(companyKey, JSON.stringify(companyForm));
    setCompanySaved(true);
    setTimeout(() => setCompanySaved(false), 2200);
  };

  const handleSaveWhatsApp = () => {
    if (!user) return;
    const contactKey = `neuroads_profile_contact_${user.uid}`;
    window.localStorage.setItem(contactKey, JSON.stringify({ whatsapp: whatsApp }));
  };

  const handleSaveConnectors = () => {
    if (!user) return;
    const connectorsKey = `neuroads_dashboard_connectors_${user.uid}`;
    const connectorsConfigKey = `neuroads_dashboard_connectors_config_${user.uid}`;
    window.localStorage.setItem(connectorsKey, JSON.stringify(connectorStatus));
    window.localStorage.setItem(connectorsConfigKey, JSON.stringify(connectorConfig));
    setConnectorsSaved(true);
    setTimeout(() => setConnectorsSaved(false), 2200);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-[200] pt-3 px-4 lg:px-6">
      <nav className="mx-auto max-w-[1240px] transition-all duration-700">
        <div className="rounded-[32px] border border-[#E7EAF0] bg-white px-6 lg:px-10 py-3 flex items-center justify-between transition-all duration-500 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center group transition-transform duration-300 hover:scale-[1.01]">
              <Image
                src="/images/logo2026.png"
                alt="NeuroAds Logo"
                width={192}
                height={48}
                className="h-9 lg:h-10 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className={`${desktopNavClass} flex-1 justify-center px-8`}>
            {pathname?.startsWith('/admin') && isAdmin ? (
              navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => handleNavLinkClick(link.href)}
                  className={`text-[15px] leading-none font-semibold transition-colors duration-200 ${
                    isLinkActive(link.href) ? 'text-[#0A9D57]' : 'text-[#344054] hover:text-[#111827]'
                  }`}
                >
                  {link.name}
                </Link>
              ))
            ) : (
              <>
                <Link
                  href="/hub"
                  className={`text-[15px] leading-none font-semibold transition-colors duration-200 ${
                    isLinkActive('/hub') ? 'text-[#0A9D57]' : 'text-[#344054] hover:text-[#111827]'
                  }`}
                >
                  Hub Estratégico
                </Link>
                <div className="relative group">
                  <Link
                    href="/hub/laboratorio-agentes?agente=auditor-de-desperdicio"
                    className={`inline-flex items-center gap-1 text-[15px] leading-none font-semibold transition-colors duration-200 ${
                      isLinkActive('/hub/laboratorio-agentes?agente=auditor-de-desperdicio')
                        ? 'text-[#0A9D57]'
                        : 'text-[#344054] group-hover:text-[#111827]'
                    }`}
                  >
                    Laboratório de Agentes
                    <ChevronDown size={14} />
                  </Link>
                  <div className="invisible absolute left-1/2 top-full z-[120] mt-3 w-56 -translate-x-1/2 rounded-2xl border border-[#E7EAF0] bg-white p-2 opacity-0 shadow-[0_14px_30px_rgba(15,23,42,0.12)] transition-all duration-150 group-hover:visible group-hover:opacity-100">
                    {laboratorySubLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className={`block rounded-xl px-3 py-2 text-[14px] font-semibold transition-colors ${
                          isLinkActive(link.href) ? 'bg-[#F0FFF7] text-[#0A9D57]' : 'text-[#344054] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {/* User menu (only when logged in) */}
            {user && (
              <div ref={settingsMenuRef} className="relative">
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="relative size-11 group overflow-hidden rounded-full transition-all flex items-center justify-center border border-[#E5E7EB] bg-white text-[#344054] hover:text-[#111827]"
                >
                  <User size={16} className="relative z-10" />
                  <ChevronDown size={12} className={`relative z-10 transition-transform duration-300 ${isSettingsOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Submenu */}
                {isSettingsOpen && (
                  <div className="absolute top-full right-0 mt-4 w-[300px] rounded-[22px] p-[2px] bg-gradient-to-br from-[#FFEBDD] via-[#FFBE94] to-[#FF7A00] shadow-[0_20px_50px_rgba(255,107,0,0.18)] z-[60]">
                    <div className="bg-white border border-[#FFF1E8] rounded-[20px] overflow-hidden py-3">
                    <button
                      onClick={() => {
                        setIsSettingsOpen(false);
                        setIsProfileOpen(true);
                      }}
                      className="w-full px-7 py-4 text-left text-[13px] font-bold tracking-[0.08em] text-text-main hover:text-primary hover:bg-[#FFF8F3] transition-all flex items-center gap-4 normal-case"
                    >
                      <User size={15} className="text-text-dim" /> Meu perfil
                    </button>
                    <button
                      onClick={() => {
                        setIsSettingsOpen(false);
                        setIsConnectorsOpen(true);
                      }}
                      className="w-full px-7 py-4 text-left text-[13px] font-bold tracking-[0.08em] text-text-main hover:text-primary hover:bg-[#FFF8F3] transition-all flex items-center gap-4 normal-case"
                    >
                      <PlugZap size={15} className="text-text-dim" /> Conectores
                    </button>
                    <button
                      onClick={() => {
                        setIsSettingsOpen(false);
                        setIsCompanyOpen(true);
                      }}
                      className="w-full px-7 py-4 text-left text-[13px] font-bold tracking-[0.08em] text-text-main hover:text-primary hover:bg-[#FFF8F3] transition-all flex items-center gap-4 normal-case"
                    >
                      <User size={15} className="text-text-dim" /> Sua Empresa
                    </button>
                    <div className="h-px bg-border mx-7 my-2" />
                    <button
                      onClick={() => { logout(); setIsSettingsOpen(false); }}
                      className="w-full px-7 py-4 text-left text-[13px] font-bold tracking-[0.08em] text-red-500 hover:bg-red-50 transition-all flex items-center gap-4 normal-case"
                    >
                      <LogOut size={15} /> Sair
                    </button>
                    </div>
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
          {pathname?.startsWith('/admin') && isAdmin ? (
            navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => {
                  handleNavLinkClick(link.href);
                  setIsMenuOpen(false);
                }}
                className={`text-lg font-black tracking-[0.08em] transition-colors ${
                  isLinkActive(link.href) ? 'text-[#0A9D57]' : 'text-text-main hover:text-primary'
                }`}
              >
                {link.name}
              </Link>
            ))
          ) : (
            <>
              <Link
                href="/hub"
                onClick={() => setIsMenuOpen(false)}
                className={`text-lg font-black tracking-[0.08em] transition-colors ${
                  isLinkActive('/hub') ? 'text-[#0A9D57]' : 'text-text-main hover:text-primary'
                }`}
              >
                Hub Estratégico
              </Link>

              <div className="w-full">
                <button
                  type="button"
                  onClick={() => setIsLabSubmenuOpen((prev) => !prev)}
                  className={`mx-auto flex items-center gap-2 text-lg font-black tracking-[0.08em] transition-colors ${
                    isLinkActive('/hub/laboratorio-agentes?agente=auditor-de-desperdicio')
                      ? 'text-[#0A9D57]'
                      : 'text-text-main hover:text-primary'
                  }`}
                >
                  Laboratório de Agentes
                  <ChevronDown size={16} className={`transition-transform ${isLabSubmenuOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`mt-3 space-y-2 ${isLabSubmenuOpen ? 'block' : 'hidden'}`}>
                  {laboratorySubLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block rounded-xl px-4 py-2 text-center text-sm font-bold tracking-wide transition-colors ${
                        isLinkActive(link.href) ? 'bg-[#F0FFF7] text-[#0A9D57]' : 'text-text-muted hover:bg-[#F8FAFC]'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="w-full h-px bg-border" />

          {user && (
            <div className="w-full space-y-4">
              <p className="text-center text-sm font-black tracking-widest uppercase italic text-primary">
                {getGreeting()}, {getFirstName(user.displayName || user.email)}!
              </p>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsProfileOpen(true);
                }}
                className="w-full py-5 text-sm font-black text-text-muted tracking-widest uppercase border border-border rounded-xl bg-bg-secondary"
              >
                MEU PERFIL
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsConnectorsOpen(true);
                }}
                className="w-full py-5 text-sm font-black text-text-muted tracking-widest uppercase border border-border rounded-xl bg-bg-secondary"
              >
                CONECTORES
              </button>
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

      {/* Profile Modal */}
      {isProfileOpen && user && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            onClick={() => setIsProfileOpen(false)}
            className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-xl rounded-[30px] p-[2px] bg-gradient-to-br from-[#FFEBDD] via-[#FFBE94] to-[#FF7A00] shadow-[0_20px_50px_rgba(255,107,0,0.2)]">
            <div className="rounded-[28px] bg-white border border-[#FFF1E8] overflow-hidden">
              <div className="relative px-6 py-5 border-b border-border bg-gradient-to-br from-orange-light to-white">
                <h3 className="text-2xl font-black text-text-main tracking-tight">Meu perfil</h3>
                <p className="text-sm text-text-muted mt-1">Informações da conta do usuário</p>
                <button
                  onClick={() => setIsProfileOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white border border-border hover:bg-bg-secondary transition-colors"
                >
                  <X size={18} className="text-text-main" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="rounded-2xl border border-border bg-bg-secondary p-5">
                  <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2">Nome</p>
                  <p className="text-base font-bold text-text-main">{user.displayName || 'Não informado'}</p>
                </div>

                <div className="rounded-2xl border border-border bg-bg-secondary p-5">
                  <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2">E-mail</p>
                  <p className="text-base font-bold text-text-main">{user.email || 'Não informado'}</p>
                </div>

                <div className="rounded-2xl border border-border bg-bg-secondary p-5">
                  <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2">WhatsApp</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      value={whatsApp}
                      onChange={(e) => setWhatsApp(e.target.value)}
                      placeholder="(00) 00000-0000"
                      className="flex-1 bg-white border border-border rounded-xl px-4 py-3 text-sm font-semibold text-text-main focus:border-primary outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleSaveWhatsApp}
                      className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#08B760] to-[#0A9D57] text-white text-xs font-bold tracking-widest uppercase shadow-[0_8px_18px_rgba(8,183,96,0.25)]"
                    >
                      Salvar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-border bg-bg-secondary p-5">
                    <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2">Plano</p>
                    <p className={`text-base font-black ${profile?.isPremium ? 'text-[#0A9D57]' : 'text-primary'}`}>
                      {profile?.isPremium ? 'Premium' : 'Padrão'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border bg-bg-secondary p-5">
                    <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2">Plataformas conectadas</p>
                    <p className="text-base font-black text-text-main">{connectedPlatforms}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-bg-secondary p-5">
                  <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2">Aplicações em uso</p>
                  <p className="text-base font-black text-text-main">{usageCount}</p>
                </div>

                <div className="rounded-2xl border border-border bg-bg-secondary p-5">
                  <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2">ID do usuário</p>
                  <p className="text-sm font-semibold text-text-main break-all">{user.uid}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Company Modal */}
      {isCompanyModalOpen && user && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            onClick={closeCompanyModal}
            className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-2xl rounded-[30px] p-[2px] bg-gradient-to-br from-[#FFEBDD] via-[#FFBE94] to-[#FF7A00] shadow-[0_20px_50px_rgba(255,107,0,0.2)]">
            <div className="rounded-[28px] bg-white border border-[#FFF1E8] overflow-hidden">
              <div className="relative px-6 py-5 border-b border-border bg-gradient-to-br from-orange-light to-white">
                <h3 className="text-2xl font-black text-text-main tracking-tight">Sobre sua Marca</h3>
                <p className="text-sm text-text-muted mt-1">Cadastro das informações institucionais</p>
                <button
                  onClick={closeCompanyModal}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white border border-border hover:bg-bg-secondary transition-colors"
                >
                  <X size={18} className="text-text-main" />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2 block">Nome da Empresa</label>
                  <input
                    value={companyForm.companyName}
                    onChange={(e) => setCompanyForm((prev) => ({ ...prev, companyName: e.target.value }))}
                    className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-semibold text-text-main focus:border-primary outline-none"
                    placeholder="Nome da empresa"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2 block">Site</label>
                  <input
                    value={companyForm.site}
                    onChange={(e) =>
                      setCompanyForm((prev) => ({ ...prev, site: normalizeHttpsMaskedUrlInput(e.target.value) }))
                    }
                    onBlur={(e) =>
                      setCompanyForm((prev) => ({ ...prev, site: normalizeHttpsMaskedUrlInput(e.target.value) }))
                    }
                    className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-semibold text-text-main focus:border-primary outline-none"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2 block">Instagram</label>
                  <input
                    value={companyForm.instagram}
                    onChange={(e) => setCompanyForm((prev) => ({ ...prev, instagram: e.target.value }))}
                    className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-semibold text-text-main focus:border-primary outline-none"
                    placeholder="@perfil"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2 block">LinkedIn</label>
                  <input
                    value={companyForm.linkedin}
                    onChange={(e) => setCompanyForm((prev) => ({ ...prev, linkedin: e.target.value }))}
                    className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-semibold text-text-main focus:border-primary outline-none"
                    placeholder="linkedin.com/company/..."
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2 block">TikTok</label>
                  <input
                    value={companyForm.tiktok}
                    onChange={(e) => setCompanyForm((prev) => ({ ...prev, tiktok: e.target.value }))}
                    className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-semibold text-text-main focus:border-primary outline-none"
                    placeholder="tiktok.com/@perfil"
                  />
                </div>

                <div>
                  <label className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2 block">Blog</label>
                  <input
                    value={companyForm.blog}
                    onChange={(e) => setCompanyForm((prev) => ({ ...prev, blog: e.target.value }))}
                    className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-semibold text-text-main focus:border-primary outline-none"
                    placeholder="blog.seudominio.com"
                  />
                </div>
              </div>

              <div className="px-6 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className={`text-sm ${companySaved ? 'text-[#0A9D57]' : 'text-text-muted'}`}>
                  {companySaved ? 'Dados salvos com sucesso.' : 'Preencha os dados da empresa.'}
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeCompanyModal}
                    className="px-5 py-3 rounded-xl border border-border text-text-muted text-xs font-bold tracking-widest uppercase hover:bg-bg-secondary"
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCompany}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#08B760] to-[#0A9D57] text-white text-xs font-bold tracking-widest uppercase shadow-[0_8px_18px_rgba(8,183,96,0.25)]"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connectors Modal */}
      {isConnectorsModalOpen && user && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            onClick={closeConnectorsModal}
            className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-4xl rounded-[30px] p-[2px] bg-gradient-to-br from-[#FFEBDD] via-[#FFBE94] to-[#FF7A00] shadow-[0_20px_50px_rgba(255,107,0,0.2)] max-h-[92vh]">
            <div className="rounded-[28px] bg-white border border-[#FFF1E8] overflow-hidden h-full flex flex-col">
              <div className="relative px-6 py-5 border-b border-border bg-gradient-to-br from-orange-light to-white">
                <h3 className="text-2xl font-black text-text-main tracking-tight">Conectores</h3>
                <p className="text-sm text-text-muted mt-1">
                  Configure as integrações e parâmetros essenciais para exibir dados reais e corretos no Dashboard.
                </p>
                <button
                  onClick={closeConnectorsModal}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white border border-border hover:bg-bg-secondary transition-colors"
                >
                  <X size={18} className="text-text-main" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                <div className="rounded-2xl border border-[#FFE4D1] bg-[#FFF8F3] p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-[#B45309] font-bold mb-1">Prontidão do Dashboard</p>
                      <p className="text-sm text-[#7C2D12]">Conectores obrigatórios ativos: {connectedRequired} de {requiredConnectors.length}</p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-[#FFD2B5] bg-white">
                      <Gauge size={14} className="text-primary" />
                      <span className="text-sm font-black text-primary">{dashboardReadiness}%</span>
                    </div>
                  </div>
                  <div className="mt-4 h-2.5 rounded-full bg-[#FFE5D0] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF9D00] transition-all duration-500"
                      style={{ width: `${dashboardReadiness}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-white p-5">
                  <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-4">Conectores obrigatórios</p>
                  <div className="space-y-3">
                    {CONNECTOR_DEFINITIONS.map((connector) => (
                      <div key={connector.key} className="rounded-xl border border-border bg-bg-secondary p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-text-main">{connector.name}</p>
                            <p className="text-xs text-text-muted mt-1">{connector.source} • {connector.usedBy}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setConnectorStatus((prev) => ({
                                ...prev,
                                [connector.key]: !prev[connector.key],
                              }))
                            }
                            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold tracking-wider uppercase transition-all ${
                              connectorStatus[connector.key]
                                ? 'bg-[#F2FFF7] border-[#BDE8CF] text-[#0A9D57]'
                                : 'bg-white border-[#D1D5DB] text-[#6B7280]'
                            }`}
                          >
                            {connectorStatus[connector.key] ? (
                              <>
                                <CheckCircle2 size={14} /> Conectado
                              </>
                            ) : (
                              <>
                                <PlugZap size={14} /> Pendente
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-white p-5">
                  <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-4">Configurações operacionais</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2 block">Timezone</label>
                      <input
                        value={connectorConfig.timezone}
                        onChange={(e) => setConnectorConfig((prev) => ({ ...prev, timezone: e.target.value }))}
                        className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-semibold text-text-main focus:border-primary outline-none"
                        placeholder="America/Sao_Paulo"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2 block">Moeda</label>
                      <input
                        value={connectorConfig.currency}
                        onChange={(e) => setConnectorConfig((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                        className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-semibold text-text-main focus:border-primary outline-none"
                        placeholder="BRL"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2 block">Janela de atribuição</label>
                      <input
                        value={connectorConfig.attributionWindow}
                        onChange={(e) => setConnectorConfig((prev) => ({ ...prev, attributionWindow: e.target.value }))}
                        className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-semibold text-text-main focus:border-primary outline-none"
                        placeholder="7d-click / 1d-view"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2 block">Frequência de atualização</label>
                      <input
                        value={connectorConfig.refreshFrequency}
                        onChange={(e) => setConnectorConfig((prev) => ({ ...prev, refreshFrequency: e.target.value }))}
                        className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-semibold text-text-main focus:border-primary outline-none"
                        placeholder="15 min"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-white p-5">
                  <p className="text-xs uppercase tracking-widest text-text-dim font-bold mb-4">Componentes do Dashboard e dependências</p>
                  <div className="space-y-3">
                    <div className="rounded-xl border border-border bg-bg-secondary p-4">
                      <p className="text-sm font-bold text-text-main">Resumo executivo (ROAS, CAC, CPL, Receita)</p>
                      <p className="text-xs text-text-muted mt-1">Google Ads + Meta Ads + CRM + Pagamentos + Warehouse</p>
                    </div>
                    <div className="rounded-xl border border-border bg-bg-secondary p-4">
                      <p className="text-sm font-bold text-text-main">Alertas inteligentes e fila de ações</p>
                      <p className="text-xs text-text-muted mt-1">Mídia paga + GA4 + Tracking server-side + Jobs de automação</p>
                    </div>
                    <div className="rounded-xl border border-border bg-bg-secondary p-4">
                      <p className="text-sm font-bold text-text-main">Status de agentes e timeline</p>
                      <p className="text-xs text-text-muted mt-1">Firestore (logs) + Scheduler + Warehouse</p>
                    </div>
                    <div className="rounded-xl border border-border bg-bg-secondary p-4">
                      <p className="text-sm font-bold text-text-main">Projeções e cenários</p>
                      <p className="text-xs text-text-muted mt-1">Histórico consolidado no Warehouse + regras de margem e sazonalidade</p>
                    </div>
                  </div>
                  <div className="mt-4 rounded-xl border border-[#DCE8FF] bg-[#F5F9FF] p-4 text-xs text-[#1D4ED8] flex items-start gap-2">
                    <Database size={14} className="mt-0.5" />
                    <span>
                      Recomendação: centralizar dados no BigQuery e sincronizar os conectores a cada 15 minutos para precisão operacional.
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className={`text-sm ${connectorsSaved ? 'text-[#0A9D57]' : 'text-text-muted'}`}>
                  {connectorsSaved ? 'Configurações de conectores salvas com sucesso.' : 'Ative os conectores e salve para aplicar no Dashboard.'}
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeConnectorsModal}
                    className="px-5 py-3 rounded-xl border border-border text-text-muted text-xs font-bold tracking-widest uppercase hover:bg-bg-secondary"
                  >
                    Fechar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveConnectors}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#08B760] to-[#0A9D57] text-white text-xs font-bold tracking-widest uppercase shadow-[0_8px_18px_rgba(8,183,96,0.25)]"
                  >
                    Salvar configuração
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
