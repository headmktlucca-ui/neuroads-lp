'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import CategoryAgentManagementSection, { type AgentCategorySlug } from './CategoryAgentManagementSection';
import { useAuth } from '../../context/AuthContext';

export default function CategoryHubPageShell({ categorySlug }: { categorySlug: AgentCategorySlug }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/hub');
    }
  }, [loading, router, user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
    </main>
  );
}

