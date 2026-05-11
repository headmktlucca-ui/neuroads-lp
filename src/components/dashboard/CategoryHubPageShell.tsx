'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import LuccaHubSupportWidget from '../hub/LuccaHubSupportWidget';
import CategoryAgentManagementSection, { type AgentCategorySlug } from './CategoryAgentManagementSection';
import { useAuth } from '../../context/AuthContext';
import { resolveHubAccessState, getHubLoginRedirect, HUB_PLAN_REQUIRED_REDIRECT } from '../../lib/hub-access';

export default function CategoryHubPageShell({ categorySlug }: { categorySlug: AgentCategorySlug }) {
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
      router.replace(HUB_PLAN_REQUIRED_REDIRECT);
    }
  }, [accessState, pathname, premiumSyncing, router]);

  if (accessState !== 'allowed') {
    return (
      <div className="min-h-screen bg-bg-main flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        {isSyncingAccess ? (
          <div className="max-w-md rounded-2xl border border-[#FFD7BD] bg-[#FFF6EF] px-4 py-3 text-center">
            <p className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#C2410C]">Configurando seu acesso</p>
            <p className="mt-1 text-[13px] text-[#9A3412]">
              Estamos preparando seu ambiente no Hub Estratégico.
            </p>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-bg-main">
      <Navbar />

      <div className="flex-grow pt-20 md:pt-28 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none bg-top bg-repeat-y bg-[length:100%_auto]"
          style={{ backgroundImage: "url('/images/background_hub_repeat_flow.png')" }}
        />
        <div className="absolute inset-x-0 bottom-0 h-44 pointer-events-none bg-gradient-to-b from-transparent via-[#f7f8fa]/75 to-bg-main" />

        <div className="relative z-10">
          <CategoryAgentManagementSection categorySlug={categorySlug} />
        </div>
      </div>

      <Footer />
      <LuccaHubSupportWidget />
    </main>
  );
}
