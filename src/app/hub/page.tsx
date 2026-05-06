'use client';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import StrategicHubOverview from '../../components/dashboard/StrategicHubOverview';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HubPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?next=/hub');
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

      <div className="flex-grow pt-20 md:pt-28">
        <div id="hub-overview" className="relative">
          <StrategicHubOverview />
        </div>
      </div>

      <Footer />
    </main>
  );
}
