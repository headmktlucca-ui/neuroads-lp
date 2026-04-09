'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Sparkles, Wand2, Download, Copy, Share2, Palette } from 'lucide-react';
import KnowledgeInputForm from './KnowledgeInputForm';
import { generateCreativeSuiteResult } from '../../app/actions/creative-suite';

export default function CreativeGeneratorContainer() {
  const [step, setStep] = useState<'onboarding' | 'processing' | 'results'>('onboarding');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleKnowledgeComplete = async (links: any) => {
    setStep('processing');
    setError(null);
    
    const res = await generateCreativeSuiteResult('creative', links);
    
    if (res.success && res.data) {
      setResult(res.data);
      setStep('results');
    } else {
      setError(res.error || 'Erro na geração neural.');
      setStep('onboarding');
    }
  };

  if (step === 'onboarding') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <KnowledgeInputForm 
          appName="Gerador de Criativos" 
          onComplete={handleKnowledgeComplete} 
          requiredFields={['site', 'instagram']}
        />
      </motion.div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="relative w-32 h-32 mb-8">
          <div className="absolute inset-0 border-4 border-[var(--color-brand-orange)]/20 rounded-full" />
          <motion.div 
            className="absolute inset-0 border-4 border-t-[var(--color-brand-orange)] rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="text-[var(--color-brand-orange)] animate-pulse" size={32} />
          </div>
        </div>
        <h3 className="text-2xl font-bold uppercase tracking-widest mb-2">Compondo Conceitos Visuais</h3>
        <p className="text-slate-400 font-mono text-sm">Analisando estética do Instagram e tom do Website...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Preview Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 overflow-hidden relative group">
            <div className="aspect-square bg-slate-900 rounded-2xl flex items-center justify-center border border-white/5 relative overflow-hidden">
               <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center grayscale" />
               <div className="relative z-10 flex flex-col items-center text-center p-8">
                 <ImageIcon size={48} className="text-slate-700 mb-4" />
                 <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Preview Estrutural Neural</p>
               </div>
               {/* Label Overlay */}
               <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10">
                 <div className="h-2 w-24 bg-white/20 rounded mb-2" />
                 <div className="h-3 w-48 bg-white/40 rounded" />
               </div>
            </div>
            
            <div className="mt-6 flex items-center justify-between">
              <div>
                <h4 className="font-bold uppercase text-sm mb-1">Conceito Visual A: Abstração Minimalista</h4>
                <p className="text-xs text-slate-500">Baseado no branding do seu site.</p>
              </div>
              <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                <Download size={18} />
              </button>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
            <h4 className="font-bold uppercase text-xs text-[var(--color-brand-orange)] tracking-widest mb-6 flex items-center gap-2">
              <Palette size={14} /> Moodboard de Performance
            </h4>
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className={`h-12 w-full rounded-lg bg-slate-800 border border-white/5 animate-pulse`} />
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-400">Paleta sugerida para maximizar CTR no feed do Instagram.</p>
          </div>
        </div>

        {/* Copy & Interaction Card */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-brand-green)]/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
            <h4 className="font-bold uppercase text-sm mb-6 flex items-center gap-2">
              <Sparkles size={16} className="text-[var(--color-brand-orange)]" /> Ad Copy Sugerida
            </h4>
            
            <div className="bg-black/40 border border-white/5 p-6 rounded-2xl font-mono text-sm leading-relaxed text-slate-300">
               [Sua Oferta Principal] + [Diferencial Único]
               <br/><br/>
               "Pare de desperdiçar budget com criativos genéricos. A NeuroAds acaba de mapear o seu próximo vencedor..."
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button className="h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all">
                <Copy size={16} /> COPIAR COPY
              </button>
              <button className="h-12 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all">
                <Wand2 size={16} /> VARIAR TOM
              </button>
            </div>
          </div>

          <button className="w-full h-16 bg-[var(--color-brand-orange)] text-black font-bold rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(249,166,32,0.2)]">
            GERAR NOVAS VARIAÇÕES <Sparkles size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
