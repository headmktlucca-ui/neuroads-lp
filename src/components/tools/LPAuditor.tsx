'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, AlertTriangle, CheckCircle, Lightbulb, Zap, ArrowUpRight } from 'lucide-react';
import { analyzeLandingPage, DiagnosticResult } from '../../app/actions/lp-diagnostic';

export default function LPAuditor() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DiagnosticResult | null>(null);

  const handleAudit = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await analyzeLandingPage(url);
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        alert(res.error || 'Falha no diagnóstico neural.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* URL Input */}
      <div className="space-y-4">
        <label className="text-[10px] font-mono tracking-[0.3em] uppercase text-slate-500 font-bold">
          URL DE DESTINO (Onde o tráfego aterra?)
        </label>
        <div className="flex gap-2">
          <div className="relative flex-grow group">
             <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-[var(--color-brand-orange)] transition-colors" size={20} />
             <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://seusite.com.br/oferta-principal"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-6 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-brand-orange)]/50 transition-all font-mono text-sm"
             />
          </div>
          <button
            onClick={handleAudit}
            disabled={loading || !url.trim()}
            className="bg-white text-black px-8 rounded-xl font-black italic tracking-widest uppercase hover:bg-[var(--color-brand-green)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : 'ESCANEAR'}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Score Card */}
            <div className="md:col-span-1 glass-card p-8 border-white/10 flex flex-col items-center justify-center text-center bg-gradient-to-b from-white/5 to-transparent relative overflow-hidden">
                <div className="absolute top-0 left-0 p-4">
                   <Zap size={16} className="text-yellow-400 animate-pulse" />
                </div>
                <div className="relative mb-6">
                   <div className="w-32 h-32 rounded-full border-4 border-white/5 flex items-center justify-center relative">
                      <span className="text-5xl font-black italic text-white">{result.score}</span>
                      <svg className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] -rotate-90">
                         <circle
                            cx="68"
                            cy="68"
                            r="66"
                            fill="transparent"
                            stroke="var(--color-brand-orange)"
                            strokeWidth="4"
                            strokeDasharray="414"
                            strokeDashoffset={414 - (414 * result.score) / 100}
                            className="transition-all duration-1000"
                         />
                      </svg>
                   </div>
                </div>
                <h4 className="text-xs font-black tracking-widest uppercase italic mb-2">Poder de Conversão</h4>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Neural Score v1.0</p>
            </div>

            {/* Analysis Lists */}
            <div className="md:col-span-2 space-y-6">
                {/* Critical Issues */}
                <div className="glass-card p-6 border-red-500/20 bg-red-500/[0.03]">
                   <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle size={16} className="text-red-500" />
                      <h4 className="text-[10px] font-black tracking-widest uppercase italic text-red-500">Gargalos Críticos Detetados</h4>
                   </div>
                   <ul className="space-y-3">
                      {result.criticalIssues.map((issue, i) => (
                        <li key={i} className="flex gap-3 text-sm text-slate-300 items-start italic leading-relaxed">
                           <span className="text-red-500 mt-1">●</span> {issue}
                        </li>
                      ))}
                   </ul>
                </div>

                {/* Strengths */}
                <div className="glass-card p-6 border-green-500/20 bg-green-500/[0.03]">
                   <div className="flex items-center gap-2 mb-4">
                      <CheckCircle size={16} className="text-[var(--color-brand-green)]" />
                      <h4 className="text-[10px] font-black tracking-widest uppercase italic text-[var(--color-brand-green)]">Pontos de Performance</h4>
                   </div>
                   <ul className="space-y-3">
                      {result.strengths.map((str, i) => (
                        <li key={i} className="flex gap-3 text-sm text-slate-300 items-start italic">
                           <span className="text-[var(--color-brand-green)] mt-1">●</span> {str}
                        </li>
                      ))}
                   </ul>
                </div>
            </div>

            {/* Neural Insight Footer */}
            <div className="md:col-span-3 glass-card p-8 border-[var(--color-brand-orange)]/30 bg-[var(--color-brand-orange)]/5">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                   <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-4">
                         <Lightbulb size={20} className="text-[var(--color-brand-orange)]" />
                         <h4 className="text-sm font-black tracking-widest uppercase italic">Otimização de Headline Recomendada</h4>
                      </div>
                      <div className="bg-black/40 p-6 rounded-2xl border border-white/5 relative group">
                         <span className="text-xl font-bold italic text-white">"{result.copySuggestion}"</span>
                         <button className="absolute top-4 right-4 text-xs font-mono text-slate-500 hover:text-white flex items-center gap-1 group-hover:text-[var(--color-brand-orange)] transition-all">
                            TESTAR ESTA VARIAÇÃO <ArrowUpRight size={14} />
                         </button>
                      </div>
                   </div>
                   <div className="md:w-1/3 p-6 bg-white/5 rounded-2xl border border-white/10">
                      <h5 className="text-[10px] font-black tracking-widest uppercase italic mb-3 text-slate-400">Verificação Técnica</h5>
                      <p className="text-xs text-slate-400 italic leading-relaxed">{result.technicalFeedback}</p>
                   </div>
                </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center py-20 text-center opacity-40">
             <div className="w-16 h-16 rounded-3xl border-2 border-dashed border-slate-700 flex items-center justify-center mb-6">
                <Globe size={24} className="text-slate-600" />
             </div>
             <p className="text-sm font-mono tracking-widest italic">AGUARDANDO INPUT DE TRÁFEGO...</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
