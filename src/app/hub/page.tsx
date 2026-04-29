'use client';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import AgentGrid from '../../components/dashboard/AgentGrid';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, TrendingUp } from 'lucide-react';
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
            src="/images/background_neuroads_26.png"
            alt="Hub Background"
            fill
            className="object-cover object-top opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/90 to-white" />
        </div>

        {/* Dashboard Status Header */}
        <div className="wrap relative z-10 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <p className="s-badge">Área Logada</p>
            <h1 className="s-title">
              Hub de <span className="text-primary italic">Agentes</span>
            </h1>
            <p className="text-text-muted text-base md:text-lg leading-relaxed max-w-2xl mt-4">
              Gerencie sua operação inteligente em um ambiente visual unificado com o padrão NeuroAds.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* Account Status Card */}
            <div className="p-6 rounded-2xl border border-border bg-white shadow-sm hover:shadow-md hover:border-border-h transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <Activity size={18} className="text-primary" />
                </div>
                <span className="text-[11px] font-bold text-text-dim uppercase tracking-widest">Status da Conta</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-text-main font-black tracking-tight">ACTIVE CLIENT</span>
              </div>
            </div>

            {/* IA Engine Card */}
            <div className="p-6 rounded-2xl border border-border bg-white shadow-sm hover:shadow-md hover:border-border-h transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <Zap size={18} className="text-primary" />
                </div>
                <span className="text-[11px] font-bold text-text-dim uppercase tracking-widest">IA Engine</span>
              </div>
              <div className="text-text-main font-black tracking-tight">Gemini 1.5 Flash <span className="text-primary">●</span></div>
            </div>

            {/* Credits Card */}
            <div className="p-6 rounded-2xl border border-border bg-white shadow-sm hover:shadow-md hover:border-border-h transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <TrendingUp size={18} className="text-primary" />
                </div>
                <span className="text-[11px] font-bold text-text-dim uppercase tracking-widest">Créditos</span>
              </div>
              <div className="text-text-main font-black tracking-tight">Ilimitado <span className="text-green-600">PRO</span></div>
            </div>
          </motion.div>
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
