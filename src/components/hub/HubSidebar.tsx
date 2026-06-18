'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  TrendingUp,
  Wrench,
  ShieldCheck,
  Database,
  Network,
  FileText,
  Cog,
  Brain,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import Image from 'next/image';

type SidebarItem = {
  type?: 'item' | 'divider';
  icon?: React.ComponentType<{ className?: string }>;
  label?: string;
  href?: string;
  sublabel?: string;
};

const MENU_ITEMS: SidebarItem[] = [
  { type: 'item', icon: LayoutDashboard, label: 'Hub Estratégico', sublabel: 'Dashboard Principal', href: '/hub' },
  { type: 'item', icon: Network, label: 'Conectores', sublabel: 'Fontes de Dados', href: '/hub/conectores' },
  { type: 'item', icon: Wrench, label: 'Laboratório de Agentes', sublabel: 'Configurar IA', href: '/hub/laboratorio-agentes' },
  { type: 'divider' },
  { type: 'item', icon: TrendingUp, label: 'Performance', sublabel: 'Mídia e Resultados', href: '/hub/performance' },
  { type: 'item', icon: FileText, label: 'Criativos', sublabel: 'Análise de Anúncios', href: '/hub/criativos' },
  { type: 'item', icon: Settings, label: 'Configurações', sublabel: 'Preferências e Infra', href: '/hub/configuracoes' },
  { type: 'item', icon: Brain, label: 'Inteligência', sublabel: 'Modelos e EEG', href: '/hub/inteligencia' },
  { type: 'divider' },
  { type: 'item', icon: ShieldCheck, label: 'Agentes Ativos', sublabel: 'Monitorar Operação', href: '/hub/agentes-ativos' },
  { type: 'item', icon: Database, label: 'Automações', sublabel: 'Tarefas Ativas', href: '/hub/automacoes' },
];

export default function HubSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Erro ao sair:', err);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Operador';

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-20 flex-col items-center justify-between border-r border-[#ffffff08] bg-[#0b1622bd] py-6 backdrop-blur-xl transition-all hover:w-64 group/sidebar">
      {/* Brand Logo / Top Action */}
      <div className="flex w-full flex-col items-center group-hover/sidebar:items-start group-hover/sidebar:px-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#09bd3c15] text-[#09bd3c] border border-[#09bd3c30] group-hover/sidebar:h-10 group-hover/sidebar:w-10 overflow-hidden shrink-0">
          {user?.photoURL ? (
            <Image src={user.photoURL} alt="Profile" width={48} height={48} className="object-cover w-full h-full" />
          ) : (
            <User className="h-6 w-6" />
          )}
        </div>
        <span className="mt-3 hidden text-[18px] font-black tracking-wider text-white group-hover/sidebar:block">
          {getGreeting()}, {firstName}
        </span>
        <span className="hidden text-[12px] font-medium text-[#c5d3e9]/60 group-hover/sidebar:block">
          Centro Operacional
        </span>
      </div>

      {/* Menu Navigation */}
      <nav className="flex w-full flex-col gap-1.5 px-3">
        {MENU_ITEMS.map((item, index) => {
          if (item.type === 'divider') {
            return (
              <div key={`divider-${index}`} className="my-1 h-px w-full bg-white/[0.08]" />
            );
          }

          const Icon = item.icon!;
          const isActive = pathname === item.href || (item.href !== '/hub' && pathname?.startsWith(item.href!));

          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`relative flex h-12 w-full items-center rounded-xl transition-all duration-250 ${
                isActive
                  ? 'bg-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                  : 'text-[#8fa0b5] hover:bg-white/5 hover:text-white'
              }`}
            >
              {/* Active Indicator Light */}
              {isActive && (
                <span className="absolute left-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#09bd3c] shadow-[0_0_10px_rgba(9,189,60,0.8)]" />
              )}

              {/* Icon Container */}
              <div className="flex h-12 w-14 flex-shrink-0 items-center justify-center">
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'group-hover/sidebar:scale-105'}`} />
              </div>

              {/* Text Labels */}
              <div className="hidden flex-col justify-center overflow-hidden pr-4 group-hover/sidebar:flex">
                <span className="text-[13px] font-semibold tracking-tight whitespace-nowrap">
                  {item.label}
                </span>
                <span className="text-[10px] font-medium text-[#8fa0b5]/70 whitespace-nowrap">
                  {item.sublabel}
                </span>
              </div>

              {/* Floating Tooltip (Visible when sidebar is collapsed) */}
              <div className="absolute left-16 z-50 hidden rounded-md bg-[#0b1622] px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg border border-[#ffffff08] whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100 group-hover/sidebar:hidden group-hover/sidebar:opacity-0 group/item group-hover:group-hover/sidebar:hidden group-hover:block">
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Profile / Logout Options */}
      <div className="flex w-full flex-col items-center gap-4 px-3 group-hover/sidebar:px-4">
        {/* Settings option replacing old profile identifier */}
        <Link href="/hub/configuracoes" className="flex w-full items-center rounded-xl p-1 text-[#8fa0b5] hover:bg-white/5 hover:text-white cursor-pointer group/user">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
            <Settings className="h-5 w-5 text-[#8fa0b5] group-hover/user:text-white" />
          </div>
          <div className="hidden flex-col justify-center ml-3 overflow-hidden group-hover/sidebar:flex">
            <span className="text-[13px] font-bold text-white truncate max-w-[120px]">
              Configurações
            </span>
            <span className="text-[10px] font-medium text-[#8fa0b5]/60 truncate max-w-[120px]">
              Preferências do sistema
            </span>
          </div>
        </Link>

        {/* Logout Action */}
        <button
          onClick={handleLogout}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-400 group-hover/sidebar:h-11 group-hover/sidebar:w-full group-hover/sidebar:justify-start group-hover/sidebar:gap-3 group-hover/sidebar:px-3 transition-all"
          title="Sair"
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden text-[13px] font-semibold group-hover/sidebar:block">
            Desconectar
          </span>
        </button>
      </div>
    </aside>
  );
}
