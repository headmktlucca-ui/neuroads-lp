'use client';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ToolGallery from '../../components/sections/ToolGallery';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-brand-orange)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-black">
      <Navbar />
      
      <div className="flex-grow pt-24">
        {/* Dashboard Exclusive Header */}
        <div className="max-w-full mx-auto px-6 md:px-12 lg:px-16 mb-12">
          <div className="glass-card p-8 rounded-3xl border-white/5 bg-gradient-to-br from-white/5 to-transparent flex flex-wrap gap-12 items-center">
            <div>
              <div className="text-slate-500 text-[10px] font-mono tracking-widest uppercase mb-2">Status da Conta</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[var(--color-brand-green)] animate-pulse" />
                <span className="text-white font-black italic tracking-wider">ACTIVE CLIENT</span>
              </div>
            </div>
            
            <div className="h-12 w-px bg-white/10 hidden md:block" />
            
            <div>
              <div className="text-slate-500 text-[10px] font-mono tracking-widest uppercase mb-2">IA Engine</div>
              <div className="text-white font-black italic tracking-wider uppercase">Gemini 1.5 Flash <span className="text-[var(--color-brand-green)]">●</span></div>
            </div>

            <div className="h-12 w-px bg-white/10 hidden md:block" />

            <div>
              <div className="text-slate-500 text-[10px] font-mono tracking-widest uppercase mb-2">Créditos Semanais</div>
              <div className="text-white font-black italic tracking-wider uppercase">Ilimitado <span className="text-[var(--color-brand-orange)]">PRO</span></div>
            </div>
          </div>
        </div>

        <div id="gallery">
          <ToolGallery />
        </div>
      </div>

      <Footer />
    </main>
  );
}
