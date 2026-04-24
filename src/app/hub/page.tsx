'use client';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import AgentGrid from '../../components/dashboard/AgentGrid';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, TrendingUp } from 'lucide-react';

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
        <div className="w-8 h-8 border-2 border-[#7BFBF0] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-black">
      <Navbar />

      <div className="flex-grow pt-20 md:pt-28">
        {/* Dashboard Status Header */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* Account Status Card */}
            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl hover:border-white/[0.15] transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-[#7BFBF0]/10 border border-[#7BFBF0]/20">
                  <Activity size={18} className="text-[#7BFBF0]" />
                </div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Status da Conta</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white font-black tracking-tight">ACTIVE CLIENT</span>
              </div>
            </div>

            {/* IA Engine Card */}
            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl hover:border-white/[0.15] transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-[#7BFBF0]/10 border border-[#7BFBF0]/20">
                  <Zap size={18} className="text-[#7BFBF0]" />
                </div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">IA Engine</span>
              </div>
              <div className="text-white font-black tracking-tight">Gemini 1.5 Flash <span className="text-[#7BFBF0]">●</span></div>
            </div>

            {/* Credits Card */}
            <div className="p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl hover:border-white/[0.15] transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-[#7BFBF0]/10 border border-[#7BFBF0]/20">
                  <TrendingUp size={18} className="text-[#7BFBF0]" />
                </div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Créditos</span>
              </div>
              <div className="text-white font-black tracking-tight">Ilimitado <span className="text-green-400">PRO</span></div>
            </div>
          </motion.div>
        </div>

        {/* Agent Grid Section */}
        <div id="agent-grid">
          <AgentGrid />
        </div>
      </div>

      <Footer />
    </main>
  );
}
