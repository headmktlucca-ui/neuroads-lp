'use client';

import React, { useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { resolveHubAccessState, getHubLoginRedirect, getHubOnboardingRedirect } from '../../lib/hub-access';
import HubSidebar from '../../components/hub/HubSidebar';
import LuccaHubSupportWidget from '../../components/hub/LuccaHubSupportWidget';

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
    if (accessState === 'forbidden' && !premiumSyncing) {
      router.replace(getHubOnboardingRedirect(pathname));
    }
  }, [accessState, pathname, premiumSyncing, router]);

  if (accessState !== 'allowed') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4 px-4 text-white">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        {isSyncingAccess ? (
          <div className="max-w-md rounded-2xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-center">
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-emerald-400">Configurando seu acesso</p>
            <p className="mt-1 text-[13px] text-emerald-300/80">
              Estamos preparando seu ambiente no Hub Estratégico.
            </p>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <main
      className="flex min-h-screen w-full relative bg-cover bg-fixed bg-center bg-no-repeat overflow-x-hidden"
      style={{
        backgroundImage: "url('/images/backgrounds/wall01.webp')",
      }}
    >
      {/* Sidebar Navigation */}
      <div className="relative z-20">
        <HubSidebar />
      </div>

      {/* Main Panel Content */}
      <div className="relative z-10 flex-grow w-full min-h-screen flex flex-col pl-16 md:pl-28 pr-6 md:pr-10 pt-20 md:pt-6 pb-6 text-white font-sans">
        {children}
      </div>

      {/* Support Widget */}
      <div className="relative z-30">
        <LuccaHubSupportWidget />
      </div>
    </main>
  );
}
