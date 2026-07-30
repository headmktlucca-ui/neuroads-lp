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
import {
  NeumorphicTileIcon,
  IconNeuDashboard,
  IconNeuOpportunities,
  IconNeuBrain,
  IconNeuAttraction,
  IconNeuEngagement,
  IconNeuConversion,
  IconNeuRetention,
  IconNeuWhatsapp,
  IconNeuCRM,
  IconNeuAds,
  IconNeuSocial,
  IconNeuAutomation,
  IconNeuPlug,
  IconNeuBook,
  IconNeuSettings,
  IconNeuLucca,
} from '../../components/hub/NeumorphicMenuIcons';
import { CompanySwitcherTrigger } from '../../components/hub/CompanySwitcher';
import { useCompanyMigration } from '../../hooks/useCompanyMigration';
import { doc, getDoc } from 'firebase/firestore';
import { getFirebaseDb } from '../../lib/firebase';
import { subscribeToCRMLeads, type CRMLead } from '../../lib/crm-sync';
import CreditMeter from '../../components/hub/CreditMeter';


/* ─── Types ────────────────────────────────────────────────────────── */
type NavIconComponent = React.ComponentType<{ size?: number; className?: string }>;

type NavItem = {
  icon: NavIconComponent;
  label: string;
  href: string;
  avatarImage?: string; // optional image to use instead of icon
  children?: NavItem[];
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

/* ─── Nav groups grouped by journey (Neumorphic 3D Squircle Icons) ── */
const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Visão Geral',
    items: [
      { icon: IconNeuDashboard,     label: 'Dashboard',           href: '/hub' },
      { icon: IconNeuOpportunities, label: 'Oportunidades',        href: '/hub/explorar' },
    ],
  },
  {
    title: 'Operação',
    items: [
      {
        icon: IconNeuBrain,
        label: 'Agentes IA',
        href: '/hub/laboratorio-agentes',
        children: [
          { icon: IconNeuAttraction,  label: 'Atração',    href: '/hub/funil/atracao'    },
          { icon: IconNeuEngagement,  label: 'Engajamento', href: '/hub/funil/engajamento' },
          { icon: IconNeuConversion,  label: 'Conversão',  href: '/hub/funil/conversao'  },
          { icon: IconNeuRetention,   label: 'Retenção',   href: '/hub/funil/retencao'   },
        ],
      },
      { icon: IconNeuWhatsapp,   label: 'WhatsApp',             href: '/hub/whatsapp' },
      { icon: IconNeuCRM,        label: 'CRM',                  href: '/hub/funil-vendas' },
      { icon: IconNeuAds,        label: 'Ads',                  href: '/hub/ads' },
      { icon: IconNeuSocial,     label: 'Redes Sociais',        href: '/hub/redes-sociais' },
      { icon: IconNeuAutomation, label: 'Automações',           href: '/hub/automacoes' },
    ],
  },
  {
    title: 'Infraestrutura',
    items: [
      { icon: IconNeuPlug,       label: 'Integrações',          href: '/hub/integracoes' },
      { icon: IconNeuBook,       label: 'Base de Conhecimento', href: '/hub/configuracoes?tab=conhecimento' },
      { icon: IconNeuSettings,   label: 'Configurações',        href: '/hub/configuracoes' },
    ],
  },
  {
    title: 'Agentes',
    items: [
      { icon: IconNeuLucca,      label: 'Agentes Online',       href: '/hub/assistente-ia' },
    ],
  },
];

/* ─── Single nav link ───────────────────────────────────────────────── */
function NavLink({
  item,
  depth = 0,
  pathname,
  currentTab,
  isDark = false,
}: {
  item: NavItem;
  depth?: number;
  pathname: string;
  currentTab: string | null;
  isDark?: boolean;
}) {
  const router = useRouter();
  const hasChildren = !!item.children?.length;
  const isConhecimento   = item.href.includes('tab=conhecimento');
  const isSettingsGeneral = item.href === '/hub/configuracoes';

  const isChildActive = hasChildren && item.children!.some(c =>
    pathname === c.href || (c.href !== '/hub' && pathname.startsWith(c.href))
  );

  const isActive = (() => {
    if (isConhecimento)    return pathname === '/hub/configuracoes' && currentTab === 'conhecimento';
    if (isSettingsGeneral) return pathname === '/hub/configuracoes' && currentTab !== 'conhecimento';
    if (hasChildren)       return isChildActive || pathname === item.href || (item.href !== '/hub' && pathname.startsWith(item.href));
    return pathname === item.href || (item.href !== '/hub' && pathname.startsWith(item.href));
  })();

  const [open, setOpen] = useState(isChildActive || isActive);

  const paddingLeft = depth === 1 ? 'pl-5' : 'pl-2';
  const textSize    = depth === 1 ? 'text-[11px]' : 'text-[12px]';
  const ParentIcon  = item.icon;

  if (hasChildren) {
    return (
      <div>
        {/* Parent row — clickable to expand/collapse */}
        <button
          type="button"
          onClick={() => {
            setOpen(o => !o);
            if (item.href) {
              router.push(item.href);
            }
          }}
          className={`w-full text-left group flex items-center gap-2 ${paddingLeft} pr-2 py-1 rounded-xl ${textSize} font-bold transition-all duration-200 cursor-pointer ${
            isActive
              ? isDark ? 'text-white' : 'text-[#FF6A00]'
              : isDark
                ? 'text-white/80 hover:text-white hover:bg-white/10'
                : 'text-[#475569] hover:text-[#1e293b] hover:shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff]'
          }`}
          style={{
            boxShadow:   isActive ? (isDark ? 'none' : 'inset 3px 3px 6px #d1d9e6, inset -3px -3px 6px #ffffff') : 'none',
            background:  isActive ? (isDark ? 'rgba(255,255,255,0.18)' : '#eef2f7') : 'transparent',
            borderLeft:  isActive ? (isDark ? '2px solid rgba(255,255,255,0.7)' : '2px solid #FF6A00') : '2px solid transparent',
          }}
        >
          <NeumorphicTileIcon isActive={isActive} isDark={isDark} size={depth === 1 ? 'sm' : 'md'}>
            <ParentIcon size={depth === 1 ? 12 : 15} />
          </NeumorphicTileIcon>
          <span className="flex-1 truncate">{item.label}</span>
          {isActive && <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-white' : 'bg-[#FF6A00]'}`} />}
          <ChevronDown
            size={11}
            className={`transition-transform duration-300 ${open ? 'rotate-180' : ''} ${isDark ? 'text-white/50' : 'text-slate-400'}`}
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
              transition={{ duration: 0.2 }}
              className={`overflow-hidden ml-2.5 pl-1 my-0.5 space-y-0.5 border-l ${isDark ? 'border-white/20' : 'border-slate-200/80'}`}
            >
              {item.children!.map(child => (
                <NavLink
                  key={child.href}
                  item={child}
                  depth={1}
                  pathname={pathname}
                  currentTab={currentTab}
                  isDark={isDark}
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
      className={`group flex items-center gap-2 ${paddingLeft} pr-2 py-1 rounded-xl ${textSize} font-bold transition-all duration-200 ${
        isActive
          ? isLucca ? 'text-emerald-300' : isDark ? 'text-white' : 'text-[#FF6A00]'
          : isDark
            ? 'text-white/80 hover:text-white hover:bg-white/10'
            : 'text-[#475569] hover:text-[#1e293b] hover:shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff]'
      }`}
      style={{
        boxShadow:   isActive ? (isDark ? 'none' : 'inset 3px 3px 6px #d1d9e6, inset -3px -3px 6px #ffffff') : 'none',
        background:  isActive ? (isLucca ? 'rgba(16,185,129,0.12)' : isDark ? 'rgba(255,255,255,0.18)' : '#eef2f7') : 'transparent',
        borderLeft:  isActive ? `2px solid ${isLucca ? '#10b981' : isDark ? 'rgba(255,255,255,0.7)' : '#FF6A00'}` : '2px solid transparent',
        textDecoration: 'none',
      }}
    >
      {item.avatarImage ? (
        <div className="w-6.5 h-6.5 rounded-lg overflow-hidden shrink-0 border border-emerald-400/60 shadow-[0_0_10px_rgba(16,185,129,0.35)] group-hover:scale-110 transition-transform duration-200">
          <Image
            src={item.avatarImage}
            alt={item.label}
            width={26}
            height={26}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <NeumorphicTileIcon isActive={isActive} isDark={isDark} size={depth === 1 ? 'sm' : 'md'}>
          <LeafIcon size={depth === 1 ? 12 : 15} />
        </NeumorphicTileIcon>
      )}
      <span className="flex-1 truncate">{item.label}</span>
      {isLucca && (
        <span className="flex items-center gap-1 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)] animate-pulse" />
        </span>
      )}
      {isActive && !isLucca && <span className={`ml-auto w-1.5 h-1.5 rounded-full ${isDark ? 'bg-white' : 'bg-[#FF6A00]'}`} />}
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
  isDark = false,
}: {
  userName: string;
  userPhoto?: string | null;
  companyName?: string;
  pathname: string;
  currentTab: string | null;
  onSignOut: () => void;
  isDark?: boolean;
}) {
  return (
    <>
      {/* Top profile header: static company/user display */}
      <div className={`px-2 pt-1.5 pb-1 shrink-0 ${isDark ? 'border-b border-white/15' : 'border-b border-slate-200/40'}`}>
        <CompanySwitcherTrigger
          companyName={companyName || ''}
          userName={userName}
          userPhoto={userPhoto}
          isDark={isDark}
          compact={true}
        />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-1 space-y-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {NAV_GROUPS.map(group => (
          <div key={group.title} className="space-y-0.5">
            <h4 className={`px-2 text-[8px] font-black uppercase tracking-wider ${isDark ? 'text-white/50' : 'text-slate-400'} mb-0.5 mt-0.5`}>
              {group.title}
            </h4>
            <div className="space-y-0.5">
              {group.items.map(item => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  currentTab={currentTab}
                  isDark={isDark}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Credits */}
      <CreditMeter variant="sidebar" isDark={isDark} />

      {/* Sign out */}
      <div className={`px-2 pb-1.5 shrink-0 pt-1 ${isDark ? 'border-t border-white/15' : 'border-t border-white/40'}`}>
        <button
          onClick={onSignOut}
          className={`w-full flex items-center gap-2 px-2.5 py-1 rounded-xl text-[11.5px] font-bold transition-all duration-200 border border-transparent ${
            isDark
              ? 'text-white/70 hover:text-white hover:bg-white/10 hover:border-white/10'
              : 'text-[#475569] hover:text-rose-600 hover:shadow-[3px_3px_6px_#d1d9e6,_-3px_-3px_6px_#ffffff] hover:border-rose-500/15'
          }`}
        >
          <LogOut size={13} className={`transition-colors shrink-0 ${isDark ? 'text-white/50' : 'text-slate-400'}`} />
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
    <aside
      className="hidden lg:flex flex-col w-[230px] shrink-0 relative z-20 rounded-r-[28px] overflow-hidden shadow-[4px_0_28px_rgba(0,0,0,0.28)]"
      style={{ background: 'linear-gradient(180deg, #7a2500 0%, #c24010 40%, #e85f22 80%, #FF8340 100%)' }}
    >
      <SidebarContent
        userName={userName}
        userPhoto={userPhoto}
        companyName={companyName}
        pathname={pathname}
        currentTab={currentTab}
        onSignOut={onSignOut}
        isDark={true}
      />
    </aside>
  );
}

/* ─── Mobile Page Title Helper ─────────────────────────────────────── */
function getMobilePageTitle(pathname: string): string {
  if (pathname === '/hub') return 'Dashboard';
  if (pathname.startsWith('/hub/agentes-ativos')) return 'Agentes Ativos';
  if (pathname.startsWith('/hub/laboratorio-agentes')) return 'Agentes IA';
  if (pathname.startsWith('/hub/funil-vendas')) return 'CRM';
  if (pathname.startsWith('/hub/ads')) return 'Ads';
  if (pathname.startsWith('/hub/redes-sociais')) return 'Redes Sociais';
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

function getMobilePageIcon(pathname: string) {
  if (pathname === '/hub') return IconNeuDashboard;
  if (pathname.startsWith('/hub/explorar')) return IconNeuOpportunities;
  if (pathname.startsWith('/hub/laboratorio-agentes') || pathname.startsWith('/hub/agentes') || pathname.startsWith('/hub/assistente-ia')) return IconNeuBrain;
  if (pathname.startsWith('/hub/whatsapp')) return IconNeuWhatsapp;
  if (pathname.startsWith('/hub/funil-vendas') || pathname.startsWith('/hub/funil')) return IconNeuCRM;
  if (pathname.startsWith('/hub/ads')) return IconNeuAds;
  if (pathname.startsWith('/hub/redes-sociais')) return IconNeuSocial;
  if (pathname.startsWith('/hub/automacoes')) return IconNeuAutomation;
  if (pathname.startsWith('/hub/integracoes')) return IconNeuPlug;
  if (pathname.startsWith('/hub/configuracoes')) return IconNeuSettings;
  return IconNeuDashboard;
}

function MobileHeader({
  pathname,
  onMenuOpen,
}: {
  pathname: string;
  onMenuOpen: () => void;
}) {
  const { unreadCount, isNotificationsOpen, setIsNotificationsOpen } = useHub();
  const pageTitle = getMobilePageTitle(pathname);
  const PageIcon = getMobilePageIcon(pathname);

  return (
    <header className="flex lg:hidden items-center justify-between gap-3 px-4 h-14 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shrink-0 relative z-20 shadow-xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <button
          onClick={onMenuOpen}
          className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-slate-700 border border-slate-200 bg-white shadow-xs hover:border-[#FF6A00]/40 active:scale-95 transition-all duration-150 cursor-pointer"
          aria-label="Abrir menu de navegação"
        >
          <Menu size={18} />
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <PageIcon size={20} className="shrink-0" />
          <span className="text-[14.5px] font-black text-slate-900 truncate tracking-tight">{pageTitle}</span>
        </div>
      </div>

      <button
        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
        className="relative w-10 h-10 shrink-0 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 shadow-xs hover:border-[#FF6A00]/40 active:scale-95 transition-all duration-150 cursor-pointer"
        aria-label="Notificações"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#FF6A00] ring-2 ring-white" />
        )}
      </button>
    </header>
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

            {/* User card — company switcher */}
            <div className="px-4 pt-4 pb-3 border-b border-white/40 shrink-0">
              <CompanySwitcherTrigger
                companyName={companyName || ''}
                userName={userName}
                userPhoto={userPhoto}
                isDark={false}
              />
            </div>

            {/* Nav — onClick on nav closes drawer on any link tap */}
            <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto" onClick={onClose}>
              {NAV_GROUPS.map(group => (
                <div key={group.title} className="space-y-1.5">
                  <h4 className="px-4 text-[9px] font-black uppercase tracking-wider text-slate-400">
                    {group.title}
                  </h4>
                  <div className="space-y-0.5">
                    {group.items.map(item => (
                      <NavLink
                        key={item.href}
                        item={item}
                        pathname={pathname}
                        currentTab={currentTab}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            {/* Credits */}
            <div className="px-1">
              <CreditMeter variant="sidebar" isDark={false} />
            </div>

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

/* ─── DesktopNotificationBell Component ─────────────────────────────── */
function DesktopNotificationBell() {
  const {
    unreadCount,
    isNotificationsOpen,
    setIsNotificationsOpen,
  } = useHub();

  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
      if (isDesktop && bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [setIsNotificationsOpen]);
  return (
    <div className="hidden lg:block relative z-30" ref={bellRef}>
      <button
        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
        className="relative w-10 h-10 rounded-2xl border border-slate-200/90 bg-white/90 backdrop-blur-md flex items-center justify-center text-[#475569] shadow-xs hover:border-[#FF6A00]/40 hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        aria-label="Notificações"
        title="Notificações"
      >
        <Bell size={18} />
        {unreadCount > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#FF6A00] ring-2 ring-white" />}
      </button>

      {isNotificationsOpen && (
        <div className="absolute right-0 mt-2 z-[100] w-80 rounded-[24px] border border-slate-200 bg-white/95 backdrop-blur-xl p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          <NotificationsPanelContent />
        </div>
      )}
    </div>
  );
}

/* ─── CRM Header Widget (Top bar stats) ─────────────────────────────── */
function CRMHeaderWidget() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<CRMLead[]>([]);

  useEffect(() => {
    let active = true;
    
    // Initial fetch from Firestore / LocalStorage
    async function loadInitial() {
      if (!user) return;
      try {
        const db = getFirebaseDb();
        const docRef = doc(db, 'users', user.uid, 'leads_funil', 'main');
        const snap = await getDoc(docRef);
        if (active && snap.exists() && snap.data().leads) {
          setLeads(snap.data().leads);
        } else {
          const local = localStorage.getItem(`leads_funil_${user.uid}`);
          if (active && local) setLeads(JSON.parse(local));
        }
      } catch {}
    }
    loadInitial();

    const unsubscribe = subscribeToCRMLeads(user?.uid, (remoteLeads) => {
      if (active && Array.isArray(remoteLeads)) {
        setLeads(remoteLeads);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [user]);

  const stats = useMemo(() => {
    const list = {
      capturado: { count: 0, value: 0, label: 'Captura', color: '#60A5FA' },
      qualificado: { count: 0, value: 0, label: 'Qualif.', color: '#34D399' },
      proposta: { count: 0, value: 0, label: 'Proposta', color: '#FBBF24' },
      fechamento: { count: 0, value: 0, label: 'Fecham.', color: '#FB923C' },
      ganho: { count: 0, value: 0, label: 'Ganho', color: '#10B981' },
    };

    leads.forEach((l) => {
      const stage = l.stage as keyof typeof list;
      if (list[stage]) {
        list[stage].count += 1;
        list[stage].value += l.value || 0;
      }
    });

    return Object.entries(list).map(([id, item]) => ({
      id,
      ...item,
    }));
  }, [leads]);

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none max-w-full mr-auto py-1">
      {stats.map((s) => (
        <div
          key={s.id}
          className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white border border-slate-200/50 shadow-[1px_1px_3px_rgba(0,0,0,0.03)] shrink-0 transition-transform duration-200 hover:scale-[1.02]"
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: s.color }} />
          <div className="flex flex-col">
            <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 leading-none">
              {s.label}
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-[11px] font-black text-slate-700 leading-none font-mono">
                {s.count}
              </span>
              <span className="text-[8px] font-medium text-slate-400 leading-none">
                {s.count === 1 ? 'lead' : 'leads'}
              </span>
              <span className="text-[9px] font-bold text-slate-500 font-mono leading-none ml-1.5">
                R$ {s.value.toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
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
      <Suspense fallback={<div className="hidden lg:flex w-[230px] shrink-0 border-r border-white/40 bg-white" />}>
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

        {/* Desktop Header bar containing the CRM stages & Notification Bell */}
        <div className="hidden lg:flex h-16 items-center justify-between px-8 shrink-0 border-b border-slate-200/20 bg-white/40 backdrop-blur-md z-30">
          <CRMHeaderWidget />
          <DesktopNotificationBell />
        </div>

        {pathname === '/hub/assistente-ia' ? (
          <div className="flex-1 overflow-hidden relative z-10 p-1.5 sm:p-4 lg:p-4">
            {children}
          </div>
        ) : (
          <div
            id="hub-scroll-container"
            className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 lg:px-8 lg:py-6 pb-6 relative z-10"
          >
            {children}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── HubLayout ────────────────────────────────────────────────────── */
export default function HubLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, premiumSyncing, logout, activeCompany } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Migrate legacy single-company data to the companies subcollection
  useCompanyMigration(user, profile as Parameters<typeof useCompanyMigration>[1]);

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

  const userName    = user?.displayName || activeCompany?.companyName || profile?.companyName || 'Lucca';
  const companyName = activeCompany?.companyName || profile?.companyName;
  const userPhoto   = (profile?.photoURL as string) || (profile?.photoUrl as string) || (profile?.profilePhoto as string) || user?.photoURL || null;

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
