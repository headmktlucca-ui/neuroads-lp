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
      setResult(res.data as string);
      setStep('results');
    } else {
      setError(res.error || 'Erro na geração neural.');
      setStep('onboarding');
    }
  };

  if (step === 'onboarding') {
    return (
      <div className="space-y-4">
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-mono text-center flex items-center justify-center gap-2"
          >
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            {error}
          </motion.div>
        )}
        <KnowledgeInputForm 
          appName="Gerador de Criativos" 
          onComplete={handleKnowledgeComplete} 
          requiredFields={['site', 'instagram']}
        />
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 mb-8 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-mono text-center flex items-center justify-center gap-2"
          >
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            {error}
          </motion.div>
        )}
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

  if (step === 'results' && result) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 prose prose-invert max-w-none">
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
            <h3 className="text-xl font-bold uppercase tracking-widest text-[var(--color-brand-orange)] flex items-center gap-2">
               <Sparkles size={20} /> Conceito Criativo Neural
            </h3>
            <button 
              onClick={() => setStep('onboarding')}
              className="text-xs font-mono text-slate-500 hover:text-white transition-colors"
            >
              NOVA ANÁLISE
            </button>
          </div>
          
          <div className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed">
            {result}
          </div>
        </div>

        <div className="flex justify-center pt-8">
          <button className="px-8 py-4 bg-[var(--color-brand-orange)] text-black font-black uppercase tracking-tighter hover:scale-105 transition-all flex items-center gap-3">
             <Download size={20} /> BAIXAR ESTRATÉGIA CRIATIVA
          </button>
        </div>
      </motion.div>
    );
  }

  return null;
}
