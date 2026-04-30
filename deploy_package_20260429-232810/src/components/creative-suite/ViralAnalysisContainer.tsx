'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Download } from 'lucide-react';
import KnowledgeInputForm from './KnowledgeInputForm';
import { generateCreativeSuiteResult } from '../../app/actions/creative-suite';

export default function ViralAnalysisContainer() {
  const [step, setStep] = useState<'onboarding' | 'processing' | 'results'>('onboarding');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleKnowledgeComplete = async (links: Record<string, unknown>) => {
    setStep('processing');
    setError(null);
    
    const res = await generateCreativeSuiteResult('viral', links);
    
    if (res.success && res.data) {
      setResult(res.data as string);
      setStep('results');
    } else {
      setError(res.error || 'Erro na análise viral.');
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
          appName="Análise Viral" 
          onComplete={handleKnowledgeComplete} 
          requiredFields={['site', 'instagram', 'facebook']}
        />
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="relative w-40 h-1 bg-white/5 rounded-full overflow-hidden mb-6">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--color-brand-orange)] to-transparent"
            animate={{ x: [-200, 200] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <h3 className="text-2xl font-bold uppercase tracking-widest mb-2 text-white">Escaneando Tendências do Nicho</h3>
        <p className="text-slate-400 font-mono text-xs">Identificando ganchos que pararam o scroll nas últimas 24h...</p>
      </div>
    );
  }

  if (step === 'results' && result) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 prose prose-invert max-w-none">
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
            <h3 className="text-xl font-bold uppercase tracking-widest text-[var(--color-brand-orange)] flex items-center gap-2">
               <Zap size={20} /> Relatório de DNA Viral
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
             <Download size={20} /> EXPORTAR ESTRATÉGIA VIRAL
          </button>
        </div>
      </motion.div>
    );
  }

  return null; // Fallback
}
