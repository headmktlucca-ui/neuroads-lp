'use client';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import AgentGrid from '../../components/dashboard/AgentGrid';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';

export default function HubPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

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
        <div className="absolute inset-0 pointer-events-none">
          <Image
            src="/images/background_agents_execution_v3.png"
            alt="Hub Background"
            fill
            className="object-cover object-[center_top] opacity-90"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-white/40 to-white/70" />
        </div>

        {/* Agent Grid Section */}
        <div id="agent-grid" className="relative z-10">
          <AgentGrid />
        </div>
      </div>

      <Footer />
    </main>
  );
}
