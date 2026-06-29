'use client';

import React, { useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { resolveHubAccessState, getHubLoginRedirect, getHubOnboardingRedirect } from '../../lib/hub-access';
import LuccaHubSupportWidget from '../../components/hub/LuccaHubSupportWidget';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Brain,
  BarChart2,
  FlaskConical,
  Plug2,
  Cpu,
  Layers,
  Settings,
  Search,
  RefreshCw,
  Bell,
  ChevronRight,
} from 'lucide-react';

/* ─── Nav items ────────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard',     href: '/hub'                       },
  { icon: Brain,           label: 'Laboratório IA', href: '/hub/laboratorio-agentes'  },
  { icon: BarChart2,       label: 'Performance',   href: '/hub/performance'           },
  { icon: FlaskConical,    label: 'Criativos',     href: '/hub/criativos'             },
  { icon: Plug2,           label: 'Integrações',   href: '/hub/integracoes'           },
  { icon: Cpu,             label: 'Automações',    href: '/hub/automacoes'            },
  { icon: Layers,          label: 'Explorar',      href: '/hub/explorar'              },
  { icon: Settings,        label: 'Configurações', href: '/hub/configuracoes'         },
];

/* ─── Sidebar Component ────────────────────────────────────────────── */
function Sidebar({ userName, userPhoto, pathname }: { userName: string; userPhoto?: string | null; pathname: string }) {
  return (
    <aside
      className="hidden lg:flex flex-col w-[230px] shrink-0 border-r border-white/40 bg-[#eef2f7] relative z-20 shadow-[4px_0_12px_rgba(0,0,0,0.015)]"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-6 border-b border-white/40 shrink-0">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[12px] font-black shrink-0 shadow-[4px_4px_8px_rgba(255,106,0,0.25)]"
          style={{ background: 'linear-gradient(135deg, #FF6A00, #FF8805)' }}
        >
          N
        </div>
        <span className="text-[16px] font-black tracking-tight text-[#1e293b]">NeuroAds</span>
        <span
          className="ml-auto text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 border border-orange-500/20"
        >
          Hub
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1.5">
        {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
          const active = pathname === href || (href !== '/hub' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all duration-200 ${
                active 
                  ? 'text-[#FF6A00]' 
                  : 'text-[#475569] hover:text-[#1e293b] hover:shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff]'
              }`}
              style={{
                boxShadow: active ? 'inset 3px 3px 6px #d1d9e6, inset -3px -3px 6px #ffffff' : 'none',
                background: active ? '#eef2f7' : 'transparent',
                borderLeft: active ? '2px solid #FF6A00' : '2px solid transparent',
                textDecoration: 'none',
              }}
            >
              <Icon size={16} className={`transition-transform duration-200 group-hover:scale-110 ${active ? 'text-[#FF6A00]' : 'text-slate-500'}`} />
              <span>{label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF6A00]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User card */}
      <div className="px-4 pb-6 shrink-0">
        <div
          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-white/60 bg-[#eef2f7] cursor-pointer shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff] transition-all duration-200"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 flex items-center justify-center border border-white/10"
            style={{ background: 'linear-gradient(135deg, #FF6A00, #FF8805)' }}>
            {userPhoto ? (
              <Image src={userPhoto} alt="" width={36} height={36} className="object-cover w-full h-full" />
            ) : (
              <span className="text-white text-[13px] font-bold">{userName.charAt(0).toUpperCase() || 'L'}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-[#1e293b] truncate">{userName || 'Lucca'}</p>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">Premium Account</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ─── TopBar Component ─────────────────────────────────────────────── */
function TopBar({ onRefresh }: { onRefresh: () => void }) {
  return (
    <header
      className="flex items-center gap-4 px-8 h-16 border-b border-white/40 bg-[#eef2f7] shrink-0 relative z-20 shadow-[0_4px_12px_rgba(0,0,0,0.015)]"
    >
      <div
        className="flex items-center gap-2.5 flex-1 max-w-xs px-3.5 h-10 rounded-2xl border border-white/30 bg-[#eef2f7] text-[13px] text-[#475569] shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff] focus-within:ring-2 focus-within:ring-[#FF6A00]/25 transition-all"
      >
        <Search size={14} className="text-slate-400" />
        <span className="select-none text-slate-400 font-bold">Buscar no Hub…</span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 px-4 h-9 rounded-xl border border-white/40 bg-[#eef2f7] text-[12px] font-bold text-[#475569] shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#c2cbd9,_-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff] transition-all duration-150"
        >
          <RefreshCw size={13} />
          <span>Atualizar</span>
        </button>
        <button
          className="flex items-center gap-1.5 px-4 h-9 rounded-xl border border-white/40 bg-[#eef2f7] text-[12px] font-bold text-[#475569] shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#c2cbd9,_-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff] transition-all duration-150"
        >
          <span>Últimos 30 dias</span>
          <ChevronRight size={13} className="-rotate-90 text-slate-400" />
        </button>
        <button
          className="relative w-9 h-9 rounded-xl border border-white/40 bg-[#eef2f7] flex items-center justify-center text-[#475569] shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#c2cbd9,_-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff] transition-all duration-150"
        >
          <Bell size={15} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF6A00]" />
        </button>
      </div>
    </header>
  );
}

/* ─── HubLayout Component ──────────────────────────────────────────── */
export default function HubLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, premiumSyncing } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const accessState = useMemo(
    () => resolveHubAccessState({ loading, user, profile }),
    [loading, profile, user]
  );

  const isSyncingAccess = accessState === 'forbidden' && premiumSyncing;

  useEffect(() => {
    if (accessState === 'unauthenticated') {
      router.replace(getHubLoginRedirect(pathname));
      return;
    }
    if (accessState === 'unverified') {
      router.replace('/verificar-email');
      return;
    }
    if (accessState === 'forbidden' && !premiumSyncing) {
      router.replace(getHubOnboardingRedirect(pathname));
    }
  }, [accessState, pathname, premiumSyncing, router]);

  if (accessState !== 'allowed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-[#eef2f7] text-[#1e293b]">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        {isSyncingAccess ? (
          <div className="max-w-md rounded-2xl border border-orange-500/30 bg-white p-4 text-center shadow-[4px_4px_8px_#d1d9e6,_-4px_-4px_8px_#ffffff]">
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#FF6A00]">Configurando seu acesso</p>
            <p className="mt-1 text-[13px] text-slate-600 font-medium">
              Estamos preparando seu ambiente no Hub Estratégico.
            </p>
          </div>
        ) : null}
      </div>
    );
  }

  const userName = user?.displayName || profile?.companyName || 'Lucca';
  const userPhoto = user?.photoURL || null;

  return (
    <div className="flex h-screen overflow-hidden font-sans antialiased bg-[#eef2f7] text-[#1e293b]">
      <Sidebar userName={userName} userPhoto={userPhoto} pathname={pathname} />

      {/* Content wrapper */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <TopBar onRefresh={() => window.location.reload()} />

        {/* Scrollable workspace */}
        <div className="flex-1 overflow-y-auto px-8 py-8 relative z-10">
          {children}
        </div>
      </div>

      {/* Support Widget */}
      <div className="relative z-30">
        <LuccaHubSupportWidget />
      </div>
    </div>
  );
}
