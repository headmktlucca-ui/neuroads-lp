'use client';

import React, { useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { resolveHubAccessState, getHubLoginRedirect, getHubOnboardingRedirect } from '../../lib/hub-access';
import HubTopNav from '../../components/hub/HubTopNav';
import HubFooter from '../../components/hub/HubFooter';
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ backgroundColor: '#08101e' }}>
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#08101e' }}>
      {/* Top Navigation */}
      <HubTopNav />

      {/* Main Content — offset by top nav height (56px bar + 42px subnav = 98px) */}
      <main className="flex-grow pt-[98px] px-6 pb-6 text-white font-sans relative z-10">
        {children}
      </main>

      {/* Footer */}
      <HubFooter />

      {/* Support Widget */}
      <div className="relative z-30">
        <LuccaHubSupportWidget />
      </div>
    </div>
  );
}
