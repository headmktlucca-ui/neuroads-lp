'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getHistory } from '../actions/automations';
import Navbar from '../../components/layout/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, 
  ChevronRight, 
  BarChart3, 
  Globe, 
  Target,
  ArrowLeft,
  FileText
} from 'lucide-react';
import Link from 'next/link';

interface HistoryMetrics {
  roas?: string;
  investimento?: string;
  cpa?: string;
}

interface HistoryReport {
  id: string;
  timestamp: number;
  plataforma?: string;
  objetivo?: string;
  diagnosis?: string;
  metrics?: HistoryMetrics;
}

export default function HistoryPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<HistoryReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<HistoryReport | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      if (user) {
        const res = await getHistory(user.uid);
        if (res.success) {
          setHistory((res.results as HistoryReport[]) || []);
        }
      }
      setLoading(false);
    }

    if (!authLoading) {
      fetchHistory();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-[var(--color-brand-orange)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">ACESSO RESTRITO</h1>
        <p className="text-slate-500 mb-8">Faça login para acessar seu histórico de diagnósticos.</p>
        <Link href="/" className="px-8 py-3 bg-white text-black font-bold">VOLTAR PARA HOME</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-4 text-xs font-mono uppercase tracking-widest">
              <ArrowLeft size={14} /> Voltar
            </Link>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
              Histórico <span className="text-[var(--color-brand-orange)]">Neural</span>
            </h1>
            <p className="text-slate-500 font-mono text-sm mt-2 uppercase tracking-widest">
              Seu arquivo central de inteligência e performance
            </p>
          </div>
          
          <div className="flex gap-4">
             <div className="glass-card px-6 py-4 border-white/5 flex flex-col">
                <span className="text-[10px] text-slate-500 font-mono uppercase">Total de Análises</span>
                <span className="text-2xl font-black">{history.length}</span>
             </div>
             {profile?.isPremium && (
               <div className="glass-card px-6 py-4 border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/5 flex flex-col">
                  <span className="text-[10px] text-[var(--color-brand-green)] font-mono uppercase tracking-widest">Plano Max</span>
                  <span className="text-xs font-bold text-white uppercase mt-1">Status Ativo</span>
               </div>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* List */}
          <div className="lg:col-span-5 space-y-4">
            {history.length === 0 ? (
              <div className="glass-card p-12 text-center border-dashed border-white/10">
                <p className="text-slate-500 font-mono text-sm uppercase">Nenhum diagnóstico encontrado.</p>
              </div>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedReport(item)}
                  className={`w-full text-left p-6 glass-card border-white/5 transition-all group relative overflow-hidden ${selectedReport?.id === item.id ? 'border-[var(--color-brand-orange)] bg-white/5' : 'hover:border-white/20'}`}
                >
                  {selectedReport?.id === item.id && (
                    <motion.div layoutId="active" className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-brand-orange)]" />
                  )}
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded bg-white/5 ${item.plataforma === 'Google Ads' ? 'text-blue-400' : item.plataforma === 'Meta Ads' ? 'text-pink-400' : 'text-white'}`}>
                        {item.plataforma === 'Google Ads' ? <Globe size={16} /> : item.plataforma === 'Meta Ads' ? <Target size={16} /> : <BarChart3 size={16} />}
                      </div>
                      <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">{item.plataforma}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-600">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg mb-2 group-hover:text-[var(--color-brand-orange)] transition-colors uppercase tracking-tight">
                    Objetivo: {item.objetivo}
                  </h3>
                  
                  <div className="flex gap-4 text-[10px] font-mono text-slate-500 uppercase">
                    <span>ROI: <span className="text-white">{item.metrics?.roas || '0'}</span></span>
                    <span>Invest: <span className="text-white">R$ {item.metrics?.investimento || '0'}</span></span>
                  </div>
                  
                  <ChevronRight size={16} className={`absolute right-6 bottom-6 transition-transform ${selectedReport?.id === item.id ? 'rotate-90 text-[var(--color-brand-orange)]' : 'text-slate-700'}`} />
                </button>
              ))
            )}
          </div>

          {/* Details */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {selectedReport ? (
                <motion.div
                  key={selectedReport.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card p-8 md:p-12 border-white/5 sticky top-32"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="space-y-2">
                       <div className="flex items-center gap-3">
                         <div className="p-3 bg-[var(--color-brand-orange)]/10 rounded-xl">
                            <BrainCircuit className="text-[var(--color-brand-orange)]" size={32} />
                         </div>
                         <div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter">Detalhes do Diagnóstico</h2>
                            <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">ID: {selectedReport.id.slice(0, 8)}</p>
                         </div>
                       </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => window.print()} className="p-3 bg-white/5 border border-white/10 hover:border-[var(--color-brand-orange)] transition-colors">
                        <FileText size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                     <MetricBox label="Plataforma" value={selectedReport.plataforma} />
                     <MetricBox label="ROAS" value={selectedReport.metrics?.roas} />
                     <MetricBox label="CPA" value={`R$ ${selectedReport.metrics?.cpa || '0'}`} />
                     <MetricBox label="Investimento" value={`R$ ${selectedReport.metrics?.investimento}`} />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-mono text-[var(--color-brand-orange)] font-bold uppercase tracking-widest">Relatório IA NeuroAds</label>
                    <div className="bg-white/[0.02] border border-white/5 p-6 md:p-8 font-mono text-xs md:text-sm leading-relaxed text-slate-300 whitespace-pre-wrap max-h-[500px] overflow-y-auto custom-scrollbar">
                      {selectedReport.diagnosis}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-[600px] glass-card border-dashed border-white/10 flex flex-col items-center justify-center p-12 text-center opacity-40">
                  <BrainCircuit size={64} className="mb-6 text-slate-700" />
                  <p className="font-mono text-sm uppercase tracking-widest">Selecione um diagnóstico para visualizar os detalhes neurais.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  );
}

function MetricBox({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="p-4 bg-white/5 border border-white/5">
      <div className="text-[8px] font-mono text-slate-500 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-xs font-bold uppercase truncate">{value}</div>
    </div>
  );
}
