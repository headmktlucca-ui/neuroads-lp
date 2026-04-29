'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ChevronDown, User, CreditCard, LogOut, X, Building2 } from 'lucide-react';

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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [companySaved, setCompanySaved] = useState(false);
  const [companyForm, setCompanyForm] = useState({
    companyName: '',
    site: '',
    instagram: '',
    linkedin: '',
    facebook: '',
  });
  const [whatsApp, setWhatsApp] = useState('');
  const { user, profile, logout } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { name: 'Hub de Agentes', href: '/hub' },
    { name: 'Dashboard', href: '/dashboard' },
  ];

  const isLinkActive = (href: string): boolean => {
    if (!pathname) return false;
    if (href === '/hub') return pathname === '/hub' || pathname.startsWith('/hub/');
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const usageCount = profile?.usageStats ? Object.keys(profile.usageStats).length : 0;
  const connectedPlatforms = profile?.connections
    ? Object.values(profile.connections).filter((connection) => connection?.isActive).length
    : 0;
  const profileRecord = (profile as Record<string, unknown> | null) ?? null;

  useEffect(() => {
    if (!user) return;

    const companyKey = `neuroads_company_profile_${user.uid}`;
    const contactKey = `neuroads_profile_contact_${user.uid}`;
    const fallbackWhatsapp = typeof profileRecord?.whatsapp === 'string' ? profileRecord.whatsapp : '';

    try {
      const companyRaw = window.localStorage.getItem(companyKey);
      if (companyRaw) {
        const parsed = JSON.parse(companyRaw) as typeof companyForm;
        setCompanyForm({
          companyName: parsed.companyName || '',
          site: parsed.site || '',
          instagram: parsed.instagram || '',
          linkedin: parsed.linkedin || '',
          facebook: parsed.facebook || '',
        });
      }

      const contactRaw = window.localStorage.getItem(contactKey);
      if (contactRaw) {
        const parsed = JSON.parse(contactRaw) as { whatsapp?: string };
        setWhatsApp(parsed.whatsapp || fallbackWhatsapp);
      } else {
        setWhatsApp(fallbackWhatsapp);
      }
    } catch {
      setWhatsApp(fallbackWhatsapp);
    }
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
              <Link
                key={link.name}
                href={link.href}
                className={`text-[14px] font-bold transition-all ${
                  isLinkActive(link.href) ? 'text-[#0A9D57]' : 'text-text-dim hover:text-primary'
                }`}
              >
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
                    <button className="w-full px-7 py-4 text-left text-[13px] font-bold tracking-[0.08em] text-text-main hover:text-primary hover:bg-[#FFF8F3] transition-all flex items-center gap-4 normal-case">
                      <CreditCard size={15} className="text-text-dim" /> Assinatura
                    </button>
                    <button
                      onClick={() => {
                        setIsSettingsOpen(false);
                        setIsCompanyOpen(true);
                      }}
                      className="w-full px-7 py-4 text-left text-[13px] font-bold tracking-[0.08em] text-text-main hover:text-primary hover:bg-[#FFF8F3] transition-all flex items-center gap-4 normal-case"
                    >
                      <Building2 size={15} className="text-text-dim" /> Sobre a Empresa
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
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={`text-lg font-black tracking-[0.08em] transition-colors ${
                isLinkActive(link.href) ? 'text-[#0A9D57]' : 'text-text-main hover:text-primary'
              }`}
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
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsProfileOpen(true);
                }}
                className="w-full py-5 text-sm font-black text-text-muted tracking-widest uppercase border border-border rounded-xl bg-bg-secondary"
              >
                MEU PERFIL
              </button>
              <button className="w-full py-5 text-sm font-black text-text-muted tracking-widest uppercase border border-border rounded-xl bg-bg-secondary">ASSINATURA</button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsCompanyOpen(true);
                }}
                className="w-full py-5 text-sm font-black text-text-muted tracking-widest uppercase border border-border rounded-xl bg-bg-secondary"
              >
                SOBRE A EMPRESA
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
      {isCompanyOpen && user && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div
            onClick={() => setIsCompanyOpen(false)}
            className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-2xl rounded-[30px] p-[2px] bg-gradient-to-br from-[#FFEBDD] via-[#FFBE94] to-[#FF7A00] shadow-[0_20px_50px_rgba(255,107,0,0.2)]">
            <div className="rounded-[28px] bg-white border border-[#FFF1E8] overflow-hidden">
              <div className="relative px-6 py-5 border-b border-border bg-gradient-to-br from-orange-light to-white">
                <h3 className="text-2xl font-black text-text-main tracking-tight">Sobre a Empresa</h3>
                <p className="text-sm text-text-muted mt-1">Cadastro das informações institucionais</p>
                <button
                  onClick={() => setIsCompanyOpen(false)}
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
                    onChange={(e) => setCompanyForm((prev) => ({ ...prev, site: e.target.value }))}
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

                <div className="sm:col-span-2">
                  <label className="text-xs uppercase tracking-widest text-text-dim font-bold mb-2 block">Facebook</label>
                  <input
                    value={companyForm.facebook}
                    onChange={(e) => setCompanyForm((prev) => ({ ...prev, facebook: e.target.value }))}
                    className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-semibold text-text-main focus:border-primary outline-none"
                    placeholder="facebook.com/..."
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
                    onClick={() => setIsCompanyOpen(false)}
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
    </header>
  );
}
