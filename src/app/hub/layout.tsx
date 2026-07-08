'use client';

import React, { useEffect, useMemo, useState, useRef, Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { resolveHubAccessState, getHubLoginRedirect, getHubOnboardingRedirect } from '../../lib/hub-access';
import { HubProvider, useHub } from '../../context/HubContext';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Brain,
  BarChart2,
  Plug2,
  Cpu,
  Layers,
  Settings,
  Search,
  RefreshCw,
  Bell,
  ChevronRight,
  Check,
  CheckCheck,
  AlertTriangle,
  Info,
  BookOpen,
  LogOut,
  Bot,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Users,
} from 'lucide-react';


/* ─── Types ────────────────────────────────────────────────────────── */
type NavItem = {
  icon: LucideIcon;
  label: string;
  href: string;
  avatarImage?: string; // optional image to use instead of icon
  children?: NavItem[];
};

/* ─── Nav items ────────────────────────────────────────────────────── */
const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard',           href: '/hub'                                    },
  {
    icon: Brain,
    label: 'Agentes IA',
    href: '/hub/laboratorio-agentes',
    children: [
      { icon: Sparkles,     label: 'Atração',    href: '/hub/funil/atracao'    },
      { icon: BarChart2,    label: 'Engajamento', href: '/hub/funil/engajamento' },
      { icon: ChevronRight, label: 'Conversão',  href: '/hub/funil/conversao'  },
      { icon: RefreshCw,    label: 'Retenção',   href: '/hub/funil/retencao'   },
    ],
  },
  { icon: Layers,          label: 'Funil de Vendas',     href: '/hub/funil-vendas'                       },
  { icon: Cpu,             label: 'Automações',           href: '/hub/automacoes'                         },
  { icon: Sparkles,        label: 'Oportunidades',        href: '/hub/explorar'                           },
  { icon: Plug2,           label: 'Integrações',          href: '/hub/integracoes'                        },
  { icon: BookOpen,     label: 'Base de Conhecimento', href: '/hub/configuracoes?tab=conhecimento'         },
  { icon: Settings,     label: 'Configurações',        href: '/hub/configuracoes'                          },
];

/* ─── Single nav link ───────────────────────────────────────────────── */
function NavLink({
  item,
  depth = 0,
  pathname,
  currentTab,
}: {
  item: NavItem;
  depth?: number;
  pathname: string;
  currentTab: string | null;
}) {
  const hasChildren = !!item.children?.length;
  const isConhecimento   = item.href.includes('tab=conhecimento');
  const isSettingsGeneral = item.href === '/hub/configuracoes';

  const isChildActive = hasChildren && item.children!.some(c =>
    pathname === c.href || (c.href !== '/hub' && pathname.startsWith(c.href))
  );

  const isActive = (() => {
    if (isConhecimento)    return pathname === '/hub/configuracoes' && currentTab === 'conhecimento';
    if (isSettingsGeneral) return pathname === '/hub/configuracoes' && currentTab !== 'conhecimento';
    if (hasChildren)       return isChildActive;
    return pathname === item.href || (item.href !== '/hub' && pathname.startsWith(item.href));
  })();

  const [open, setOpen] = useState(isChildActive || isActive);

  const paddingLeft = depth === 1 ? 'pl-9' : 'pl-4';
  const textSize    = depth === 1 ? 'text-[12px]' : 'text-[13px]';
  const ParentIcon  = item.icon;

  if (hasChildren) {
    return (
      <div>
        {/* Parent row — clickable to expand/collapse */}
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          className={`w-full text-left group flex items-center gap-3 ${paddingLeft} pr-3 py-3 rounded-2xl ${textSize} font-bold transition-all duration-200 cursor-pointer ${
            isActive
              ? 'text-[#FF6A00]'
              : 'text-[#475569] hover:text-[#1e293b] hover:shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff]'
          }`}
          style={{
            boxShadow:   isActive ? 'inset 3px 3px 6px #d1d9e6, inset -3px -3px 6px #ffffff' : 'none',
            background:  isActive ? '#eef2f7' : 'transparent',
            borderLeft:  isActive ? '2px solid #FF6A00' : '2px solid transparent',
          }}
        >
          <ParentIcon size={16} className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-[#FF6A00]' : 'text-slate-500'}`} />
          <span className="flex-1">{item.label}</span>
          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FF6A00]" />}
          <ChevronDown
            size={13}
            className={`text-slate-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Children */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="sub"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden ml-4 border-l border-slate-200/80 pl-1 mt-0.5 space-y-0.5"
            >
              {item.children!.map(child => (
                <NavLink
                  key={child.href}
                  item={child}
                  depth={1}
                  pathname={pathname}
                  currentTab={currentTab}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  /* ── Leaf link ── */
  const LeafIcon = item.icon;
  const isLucca = item.href === '/hub/assistente-ia';
  return (
    <Link
      href={item.href}
      className={`group flex items-center gap-3 ${paddingLeft} pr-3 py-${depth === 1 ? '2.5' : '3'} rounded-2xl ${textSize} font-bold transition-all duration-200 ${
        isActive
          ? isLucca ? 'text-emerald-600' : 'text-[#FF6A00]'
          : 'text-[#475569] hover:text-[#1e293b] hover:shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff]'
      }`}
      style={{
        boxShadow:   isActive ? 'inset 3px 3px 6px #d1d9e6, inset -3px -3px 6px #ffffff' : 'none',
        background:  isActive ? (isLucca ? '#ecfdf5' : '#eef2f7') : 'transparent',
        borderLeft:  isActive ? `2px solid ${isLucca ? '#10b981' : '#FF6A00'}` : '2px solid transparent',
        textDecoration: 'none',
      }}
    >
      {/* Icon: use avatar image for Lucca, regular icon for others */}
      {item.avatarImage ? (
        <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-emerald-500/30 shadow-[0_0_6px_rgba(16,185,129,0.25)]">
          <Image
            src={item.avatarImage}
            alt={item.label}
            width={24}
            height={24}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <LeafIcon size={depth === 1 ? 13 : 16} className={`transition-transform duration-200 group-hover:scale-110 shrink-0 ${isActive ? (isLucca ? 'text-emerald-600' : 'text-[#FF6A00]') : 'text-slate-500'}`} />
      )}
      <span className="flex-1">{item.label}</span>
      {isLucca && (
        <span className="flex items-center gap-1 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)] animate-pulse" />
        </span>
      )}
      {isActive && !isLucca && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF6A00]" />}
    </Link>
  );
}

/* ─── Greeting helper ─────────────────────────────────────────────── */
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Bom dia';
  if (hour >= 12 && hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

/* ─── Sidebar content (shared by desktop sidebar + mobile drawer) ───── */
function SidebarContent({
  userName,
  userPhoto,
  companyName,
  pathname,
  currentTab,
  onSignOut,
}: {
  userName: string;
  userPhoto?: string | null;
  companyName?: string;
  pathname: string;
  currentTab: string | null;
  onSignOut: () => void;
}) {
  return (
    <>
      {/* User card — editorial two-zone layout */}
      <div className="px-4 pt-5 pb-4 border-b border-white/40 shrink-0">
        <div className="flex items-stretch gap-0 rounded-2xl overflow-hidden border border-white/60 shadow-[3px_3px_8px_#d1d9e6,_-3px_-3px_8px_#ffffff] bg-[#eef2f7]">

          {/* LEFT — photo zone (square crop, ~40% width) */}
          <div className="relative w-[72px] shrink-0 overflow-hidden" style={{ minHeight: 72 }}>
            {userPhoto ? (
              <Image
                src={userPhoto}
                alt=""
                fill
                className="object-cover object-center"
                sizes="72px"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #FF4D00 0%, #FF8805 100%)' }}>
                <span className="text-white text-[22px] font-black select-none">
                  {(userName.charAt(0) || 'N').toUpperCase()}
                </span>
              </div>
            )}
            {/* Warm edge fade into divider */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, transparent 55%, rgba(238,242,247,0.7) 85%, #eef2f7 100%)' }} />
          </div>

          {/* Vertical divider — 1px, subtle */}
          <div className="w-px bg-gradient-to-b from-transparent via-slate-300/60 to-transparent shrink-0 my-3" />

          {/* RIGHT — text zone */}
          <div className="flex flex-col justify-center px-3.5 py-3 min-w-0 flex-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.18em] leading-none mb-1.5">
              {getGreeting()}
            </p>
            <p className="text-[14px] font-black text-[#0f172a] truncate leading-none tracking-tight">
              {userName}
            </p>
            {companyName && (
              <p className="text-[11px] font-bold text-[#FF6A00] truncate leading-tight mt-1.5 tracking-tight">
                {companyName}
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            currentTab={currentTab}
          />
        ))}

        {/* Agentes Online — positioned after Configurações, before Sair */}
        <div className="pt-1">
          <Link
            href="/hub/assistente-ia"
            className={`group flex items-center gap-3 pl-4 pr-3 py-3 rounded-2xl text-[13px] font-bold transition-all duration-200 ${
              pathname === '/hub/assistente-ia'
                ? 'text-emerald-600'
                : 'text-[#475569] hover:text-[#1e293b] hover:shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff]'
            }`}
            style={{
              boxShadow: pathname === '/hub/assistente-ia' ? 'inset 3px 3px 6px #d1d9e6, inset -3px -3px 6px #ffffff' : 'none',
              background: pathname === '/hub/assistente-ia' ? '#ecfdf5' : 'transparent',
              borderLeft: pathname === '/hub/assistente-ia' ? '2px solid #10b981' : '2px solid transparent',
              textDecoration: 'none',
            }}
          >
            <Users
              size={16}
              className={`transition-transform duration-200 group-hover:scale-110 shrink-0 ${
                pathname === '/hub/assistente-ia' ? 'text-emerald-600' : 'text-slate-500'
              }`}
            />
            <span className="flex-1">Agentes Online</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)] animate-pulse shrink-0" />
          </Link>
        </div>
      </nav>

      {/* Sign out */}
      <div className="px-3 pb-5 shrink-0 border-t border-white/40 pt-3">
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold text-[#475569] hover:text-rose-600 hover:shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] transition-all duration-200 border border-transparent hover:border-rose-500/15"
        >
          <LogOut size={15} className="text-slate-400 group-hover:text-rose-500 transition-colors shrink-0" />
          <span>Sair</span>
        </button>
      </div>
    </>
  );
}

/* ─── Sidebar Component (desktop) ──────────────────────────────────── */
function Sidebar({
  userName,
  userPhoto,
  companyName,
  pathname,
  onSignOut,
}: {
  userName: string;
  userPhoto?: string | null;
  companyName?: string;
  pathname: string;
  onSignOut: () => void;
}) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');

  return (
    <aside className="hidden lg:flex flex-col w-[230px] shrink-0 border-r border-white/40 bg-[#eef2f7] relative z-20 shadow-[4px_0_12px_rgba(0,0,0,0.015)]">
      <SidebarContent
        userName={userName}
        userPhoto={userPhoto}
        companyName={companyName}
        pathname={pathname}
        currentTab={currentTab}
        onSignOut={onSignOut}
      />
    </aside>
  );
}

/* ─── Mobile Page Title Helper ─────────────────────────────────────── */
function getMobilePageTitle(pathname: string): string {
  if (pathname === '/hub') return 'Dashboard';
  if (pathname.startsWith('/hub/agentes-ativos')) return 'Agentes Ativos';
  if (pathname.startsWith('/hub/laboratorio-agentes')) return 'Agentes IA';
  if (pathname.startsWith('/hub/funil-vendas')) return 'Funil de Vendas';
  if (pathname.startsWith('/hub/performance')) return 'Performance';
  if (pathname.startsWith('/hub/criativos')) return 'Criativos';
  if (pathname.startsWith('/hub/tecnico')) return 'Técnico';
  if (pathname.startsWith('/hub/inteligencia')) return 'Inteligência';
  if (pathname.startsWith('/hub/integracoes')) return 'Integrações';
  if (pathname.startsWith('/hub/automacoes')) return 'Automações';
  if (pathname.startsWith('/hub/explorar')) return 'Oportunidades';
  if (pathname.startsWith('/hub/assistente-ia')) return 'Agentes Online';
  if (pathname.startsWith('/hub/configuracoes')) return 'Configurações';
  return 'Hub';
}

/* ─── Notifications panel content (shared: desktop popover + mobile sheet) ── */
function NotificationsPanelContent() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useHub();

  return (
    <>
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-black text-[#0f172a] uppercase tracking-wide">Notificações</span>
          {unreadCount > 0 && (
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-orange-500/10 text-[#FF6A00]">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="text-[11px] font-bold text-[#FF6A00] hover:text-[#ff8f3a] flex items-center gap-1 transition-colors"
          >
            <CheckCheck size={13} />
            <span>Lidas</span>
          </button>
        )}
      </div>

      <div className="mt-3 max-h-72 overflow-y-auto space-y-2.5 pr-0.5">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <Info size={20} className="mx-auto text-slate-300 mb-2" />
            <p className="text-[12px] font-bold">Nenhuma notificação por aqui.</p>
          </div>
        ) : (
          notifications.map((n) => {
            const NotifIcon = n.type === 'success' ? Check : n.type === 'warning' ? AlertTriangle : Info;
            const typeColor = n.type === 'success' ? 'text-emerald-600 bg-emerald-500/5' : n.type === 'warning' ? 'text-amber-600 bg-amber-500/5' : 'text-blue-600 bg-blue-500/5';
            return (
              <div
                key={n.id}
                onClick={() => !n.read && markAsRead(n.id)}
                className={`flex gap-3 p-2.5 rounded-xl border border-white/50 bg-[#eef2f7] transition-all cursor-pointer ${
                  n.read
                    ? 'opacity-70 hover:opacity-100 shadow-[1px_1px_2px_#d1d9e6,_-1px_-1px_2px_#ffffff]'
                    : 'shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] border-orange-500/10'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center border border-white/60 ${typeColor}`}>
                  <NotifIcon size={13} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-[12px] font-black text-slate-800 ${!n.read ? 'text-[#FF6A00]' : ''}`}>{n.title}</p>
                  <p className="text-[11.5px] font-semibold text-slate-500 leading-snug mt-0.5">{n.message}</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-1">
                    {new Date(n.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

/* ─── Mobile Notifications Panel (sheet below the mobile header) ────── */
function MobileNotificationsPanel() {
  const { isNotificationsOpen, setIsNotificationsOpen } = useHub();

  return (
    <AnimatePresence>
      {isNotificationsOpen && (
        <>
          <motion.div
            key="mobile-notif-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden"
            onClick={() => setIsNotificationsOpen(false)}
            aria-hidden="true"
          />
          <motion.div
            key="mobile-notif-panel"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed top-16 left-3 right-3 z-50 lg:hidden rounded-[24px] border border-white/80 bg-[#eef2f7] p-4 shadow-[5px_5px_15px_#d1d9e6,_-5px_-5px_15px_#ffffff]"
            role="dialog"
            aria-label="Notificações"
          >
            <NotificationsPanelContent />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── Mobile Header (visible only on mobile) ────────────────────────── */
const PERIOD_OPTIONS = [
  { label: 'Últimos 7 dias',  value: '7'  },
  { label: 'Últimos 15 dias', value: '15' },
  { label: 'Últimos 30 dias', value: '30' },
  { label: 'Últimos 90 dias', value: '90' },
];

function MobileHeader({
  pathname,
  onMenuOpen,
}: {
  pathname: string;
  onMenuOpen: () => void;
}) {
  const { unreadCount, isNotificationsOpen, setIsNotificationsOpen, selectedPeriod, setSelectedPeriod } = useHub();
  const pageTitle = getMobilePageTitle(pathname);
  const isDashboard = pathname === '/hub';

  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const periodRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPeriodOpen) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (periodRef.current && !periodRef.current.contains(e.target as Node)) {
        setIsPeriodOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [isPeriodOpen]);

  return (
    <header className="flex lg:hidden items-center gap-2 px-3 h-14 border-b border-white/40 bg-[#eef2f7] shrink-0 relative z-20 shadow-[0_4px_12px_rgba(0,0,0,0.015)]">
      <button
        onClick={onMenuOpen}
        className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-[#475569] border border-white/40 bg-[#eef2f7] shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff] transition-all duration-150"
        aria-label="Abrir menu de navegação"
      >
        <Menu size={18} />
      </button>

      <span className="flex-1 min-w-0 text-[15px] font-black text-[#1e293b] truncate">{pageTitle}</span>

      {/* Period selector — only on Dashboard (parity with desktop TopBar) */}
      {isDashboard && (
        <div className="relative shrink-0" ref={periodRef}>
          <button
            onClick={() => setIsPeriodOpen(prev => !prev)}
            className={`flex items-center gap-1 px-3 h-11 rounded-xl border border-white/40 bg-[#eef2f7] text-[12px] font-black text-[#475569] shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff] transition-all duration-150 ${isPeriodOpen ? 'text-[#FF6A00]' : ''}`}
            aria-label="Selecionar período"
            aria-expanded={isPeriodOpen}
          >
            <span>{selectedPeriod}d</span>
            <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${isPeriodOpen ? 'rotate-180' : ''}`} />
          </button>

          {isPeriodOpen && (
            <div className="absolute right-0 top-full mt-2 z-[999] w-52 rounded-2xl border border-white/80 bg-[#eef2f7] p-2.5 shadow-[5px_5px_15px_#d1d9e6,_-5px_-5px_15px_#ffffff]">
              <div className="space-y-1">
                {PERIOD_OPTIONS.map((p) => {
                  const active = p.value === selectedPeriod;
                  return (
                    <button
                      key={p.value}
                      onClick={() => { setSelectedPeriod(p.value); setIsPeriodOpen(false); }}
                      className={`flex w-full items-center justify-between px-3 py-2.5 rounded-xl text-[12px] font-bold text-left transition-all ${
                        active
                          ? 'text-[#FF6A00] bg-slate-100/60 shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]'
                          : 'text-[#475569] hover:bg-slate-200/50'
                      }`}
                    >
                      <span>{p.label}</span>
                      {active && <Check size={13} />}
                    </button>
                  );
                })}
                <button
                  onClick={() => { setIsPeriodOpen(false); window.location.reload(); }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-bold text-left text-[#475569] hover:bg-slate-200/50 border-t border-slate-200/70 mt-1 pt-3 transition-all"
                >
                  <RefreshCw size={12} className="text-slate-400" />
                  <span>Atualizar dados</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
        className="relative w-11 h-11 shrink-0 rounded-xl border border-white/40 bg-[#eef2f7] flex items-center justify-center text-[#475569] shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] active:shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff] transition-all duration-150"
        aria-label="Notificações"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#FF6A00]" />
        )}
      </button>
    </header>
  );
}

/* ─── Mobile Bottom Nav ─────────────────────────────────────────────── */
const BOTTOM_NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/hub',               exact: true  },
  { icon: Bot,             label: 'Agentes',   href: '/hub/agentes-ativos', exact: false },
  { icon: Plug2,           label: 'Integrar',  href: '/hub/integracoes',    exact: false },
  { icon: Layers,          label: 'Explorar',  href: '/hub/explorar',       exact: false },
] as const;

function MobileBottomNav({
  pathname,
  onMenuOpen,
}: {
  pathname: string;
  onMenuOpen: () => void;
}) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex lg:hidden bg-[#eef2f7] border-t border-white/50 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navegação principal"
    >
      {BOTTOM_NAV_ITEMS.map(({ icon: Icon, label, href, exact }) => {
        const isActive = exact
          ? pathname === href
          : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-1 h-16 min-w-0 transition-colors ${
              isActive ? 'text-[#FF6A00]' : 'text-slate-400'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
            <span className="text-[10px] font-bold leading-none">{label}</span>
          </Link>
        );
      })}
      <button
        onClick={onMenuOpen}
        className="flex-1 flex flex-col items-center justify-center gap-1 h-16 min-w-0 text-slate-400 active:text-[#FF6A00] transition-colors"
        aria-label="Mais opções de navegação"
      >
        <Menu size={20} strokeWidth={1.8} />
        <span className="text-[10px] font-bold leading-none">Menu</span>
      </button>
    </nav>
  );
}

/* ─── Mobile Drawer ─────────────────────────────────────────────────── */
function MobileDrawer({
  isOpen,
  onClose,
  userName,
  userPhoto,
  companyName,
  pathname,
  onSignOut,
}: {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userPhoto?: string | null;
  companyName?: string;
  pathname: string;
  onSignOut: () => void;
}) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');


  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <motion.aside
            key="mobile-drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col bg-[#eef2f7] lg:hidden shadow-[4px_0_24px_rgba(0,0,0,0.10)]"
            aria-label="Menu de navegação"
          >
            {/* Drawer top bar */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/40 shrink-0">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.1em]">Navegação</span>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 border border-white/30 bg-[#eef2f7] shadow-[2px_2px_5px_#d1d9e6,_-2px_-2px_5px_#ffffff] active:shadow-[inset_2px_2px_4px_#d1d9e6,_inset_-2px_-2px_4px_#ffffff] transition-all"
                aria-label="Fechar menu"
              >
                <X size={16} />
              </button>
            </div>

            {/* User card */}
            <div className="px-4 pt-4 pb-3 border-b border-white/40 shrink-0">
              <div className="flex items-center gap-3 px-3 py-3 rounded-2xl border border-white/60 bg-[#eef2f7] shadow-[3px_3px_8px_#d1d9e6,_-3px_-3px_8px_#ffffff]">
                <div
                  className="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center border border-white/30 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06)]"
                  style={{ background: 'linear-gradient(135deg, #FF6A00, #FF8805)' }}
                >
                  {userPhoto ? (
                    <Image src={userPhoto} alt="" width={40} height={40} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-white text-[15px] font-black">{(userName.charAt(0) || 'N').toUpperCase()}</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-slate-400 leading-none mb-0.5">{getGreeting()},</p>
                  <p className="text-[13px] font-black text-[#1e293b] truncate leading-tight">{userName}</p>
                  {companyName && (
                    <p className="text-[11px] font-semibold text-[#FF6A00] truncate leading-tight mt-0.5">{companyName}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Nav — onClick on nav closes drawer on any link tap */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" onClick={onClose}>
              {NAV_ITEMS.map(item => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  currentTab={currentTab}
                />
              ))}
            </nav>

            {/* Sign out */}
            <div
              className="px-3 pt-3 shrink-0 border-t border-white/40"
              style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
            >
              <button
                onClick={() => { onClose(); onSignOut(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[13px] font-bold text-[#475569] hover:text-rose-600 hover:shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] transition-all duration-200 border border-transparent hover:border-rose-500/15"
              >
                <LogOut size={15} className="text-slate-400 shrink-0" />
                <span>Sair</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─── TopBar Component ─────────────────────────────────────────────── */
function TopBar({ onRefresh, pathname }: { onRefresh: () => void; pathname: string }) {
  const {
    selectedPeriod,
    setSelectedPeriod,
    unreadCount,
    isNotificationsOpen,
    setIsNotificationsOpen,
  } = useHub();

  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const periodRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  // Only show refresh/period on the main Dashboard page
  const isDashboard = pathname === '/hub';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (periodRef.current && !periodRef.current.contains(e.target as Node)) {
        setIsPeriodOpen(false);
      }
      // On mobile the notifications state is owned by MobileHeader/MobileNotificationsPanel;
      // this hidden desktop bell must not close it.
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
      if (isDesktop && bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [setIsNotificationsOpen]);

  const periods = PERIOD_OPTIONS;

  const activePeriodLabel = periods.find(p => p.value === selectedPeriod)?.label || 'Últimos 30 dias';


  return (
    <header className="hidden lg:flex items-center gap-4 px-8 h-16 border-b border-white/40 bg-[#eef2f7] shrink-0 relative z-20 shadow-[0_4px_12px_rgba(0,0,0,0.015)]">
      <div className="flex items-center gap-2.5 flex-1 max-w-xs px-3.5 h-10 rounded-2xl border border-white/30 bg-[#eef2f7] text-[13px] text-[#475569] shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff] focus-within:ring-2 focus-within:ring-[#FF6A00]/25 transition-all">
        <Search size={14} className="text-slate-400" />
        <span className="select-none text-slate-400 font-bold">Buscar no Hub…</span>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3 relative">
        {/* Refresh — only on Dashboard */}
        {isDashboard && (
          <button
            onClick={onRefresh}
            aria-label="Atualizar"
            className="flex items-center gap-2 px-2.5 sm:px-4 h-9 rounded-xl border border-white/40 bg-[#eef2f7] text-[12px] font-bold text-[#475569] shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#c2cbd9,_-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff] transition-all duration-150"
          >
            <RefreshCw size={13} />
            <span className="hidden sm:inline">Atualizar</span>
          </button>
        )}

        {/* Period Selector — only on Dashboard */}
        {isDashboard && (
          <div className="relative" ref={periodRef}>
            <button
              onClick={() => setIsPeriodOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-2.5 sm:px-4 h-9 rounded-xl border border-white/40 bg-[#eef2f7] text-[12px] font-bold text-[#475569] shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#c2cbd9,_-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff] transition-all duration-150"
            >
              <span className="hidden sm:inline">{activePeriodLabel}</span>
              <span className="sm:hidden">{selectedPeriod}d</span>
              <ChevronRight size={13} className={`transition-transform duration-200 text-slate-400 ${isPeriodOpen ? 'rotate-90' : '-rotate-90'}`} />
            </button>

            {isPeriodOpen && (
              <div className="absolute right-0 mt-2 z-[999] w-48 rounded-2xl border border-white/80 bg-[#eef2f7] p-2.5 shadow-[5px_5px_15px_#d1d9e6,_-5px_-5px_15px_#ffffff]">
                <div className="space-y-1">
                  {periods.map((p) => {
                    const active = p.value === selectedPeriod;
                    return (
                      <button
                        key={p.value}
                        onClick={() => { setSelectedPeriod(p.value); setIsPeriodOpen(false); }}
                        className={`flex w-full items-center justify-between px-3 py-2 rounded-xl text-[12px] font-bold text-left transition-all ${
                          active
                            ? 'text-[#FF6A00] bg-slate-100/60 shadow-[inset_1px_1px_3px_#d1d9e6,_inset_-1px_-1px_3px_#ffffff]'
                            : 'text-[#475569] hover:bg-slate-200/50'
                        }`}
                      >
                        <span>{p.label}</span>
                        {active && <Check size={13} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notifications */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative w-9 h-9 rounded-xl border border-white/40 bg-[#eef2f7] flex items-center justify-center text-[#475569] shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#c2cbd9,_-4px_-4px_8px_#ffffff] active:shadow-[inset_2px_2px_5px_#d1d9e6,_inset_-2px_-2px_5px_#ffffff] transition-all duration-150"
            aria-label="Notificações"
          >
            <Bell size={15} />
            {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#FF6A00]" />}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 z-[999] w-80 rounded-[24px] border border-white/80 bg-[#eef2f7] p-4 shadow-[5px_5px_15px_#d1d9e6,_-5px_-5px_15px_#ffffff] animate-in fade-in slide-in-from-top-2 duration-150">
              <NotificationsPanelContent />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ─── HubLayoutInner ───────────────────────────────────────────────── */
function HubLayoutInner({
  children,
  userName,
  userPhoto,
  companyName,
  pathname,
  onSignOut,
}: {
  children: React.ReactNode;
  userName: string;
  userPhoto: string | null;
  companyName?: string;
  pathname: string;
  onSignOut: () => void;
}) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden font-sans antialiased bg-[#eef2f7] text-[#1e293b]">
      {/* Desktop sidebar */}
      <Suspense fallback={<div className="hidden lg:flex w-[230px] shrink-0 border-r border-white/40 bg-[#eef2f7]" />}>
        <Sidebar userName={userName} userPhoto={userPhoto} companyName={companyName} pathname={pathname} onSignOut={onSignOut} />
      </Suspense>

      {/* Mobile slide-in drawer */}
      <Suspense fallback={null}>
        <MobileDrawer
          isOpen={mobileDrawerOpen}
          onClose={() => setMobileDrawerOpen(false)}
          userName={userName}
          userPhoto={userPhoto}
          companyName={companyName}
          pathname={pathname}
          onSignOut={onSignOut}
        />
      </Suspense>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        {/* Mobile header — hidden on desktop */}
        <MobileHeader pathname={pathname} onMenuOpen={() => setMobileDrawerOpen(true)} />

        {/* Mobile notifications sheet — hidden on desktop */}
        <MobileNotificationsPanel />

        {/* Desktop topbar — hidden on mobile */}
        <TopBar onRefresh={() => window.location.reload()} pathname={pathname} />

        {/* Main content area — full height for chat page, padded for others */}
        {pathname === '/hub/assistente-ia' ? (
          <div className="flex-1 overflow-hidden relative z-10 p-4">
            {children}
          </div>
        ) : (
          <div
            id="hub-scroll-container"
            className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 lg:px-8 lg:py-8 lg:pb-8 relative z-10 mobile-content-area"
            style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
          >
            {children}
          </div>
        )}
        <style>{`@media (min-width: 1024px) { .mobile-content-area { padding-bottom: 2rem !important; } }`}</style>
      </div>

      {/* Mobile bottom navigation bar */}
      <MobileBottomNav pathname={pathname} onMenuOpen={() => setMobileDrawerOpen(true)} />
    </div>
  );
}

/* ─── HubLayout ────────────────────────────────────────────────────── */
export default function HubLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, premiumSyncing, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const accessState = useMemo(
    () => resolveHubAccessState({ loading, user, profile }),
    [loading, profile, user]
  );

  const isSyncingAccess = accessState === 'forbidden' && premiumSyncing;

  useEffect(() => {
    if (accessState === 'unauthenticated') { router.replace(getHubLoginRedirect(pathname)); return; }
    if (accessState === 'unverified')      { router.replace('/verificar-email'); return; }
    if (accessState === 'forbidden' && !premiumSyncing) { router.replace(getHubOnboardingRedirect(pathname)); }
  }, [accessState, pathname, premiumSyncing, router]);

  const handleSignOut = async () => {
    try {
      await logout();
      router.replace('/entrar');
    } catch {
      router.replace('/entrar');
    }
  };

  if (accessState !== 'allowed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 bg-[#eef2f7] text-[#1e293b]">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        {isSyncingAccess && (
          <div className="max-w-md rounded-2xl border border-orange-500/30 bg-white p-4 text-center shadow-[4px_4px_8px_#d1d9e6,_-4px_-4px_8px_#ffffff]">
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#FF6A00]">Configurando seu acesso</p>
            <p className="mt-1 text-[13px] text-slate-600 font-medium">Estamos preparando seu ambiente no Hub Estratégico.</p>
          </div>
        )}
      </div>
    );
  }

  const userName    = user?.displayName || profile?.companyName || 'Lucca';
  const companyName = profile?.companyName;
  const userPhoto   = user?.photoURL || null;

  return (
    <HubProvider>
      <HubLayoutInner
        userName={userName}
        userPhoto={userPhoto}
        companyName={companyName}
        pathname={pathname}
        onSignOut={handleSignOut}
      >
        {children}
      </HubLayoutInner>
    </HubProvider>
  );
}
