'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PenTool, Zap, Table, CheckCircle2, Copy, RefreshCw, BarChart3, Download } from 'lucide-react';
import KnowledgeInputForm from './KnowledgeInputForm';
import { generateCreativeSuiteResult } from '../../app/actions/creative-suite';

export default function CopyGeneratorContainer() {
  const [step, setStep] = useState<'onboarding' | 'processing' | 'results'>('onboarding');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleKnowledgeComplete = async (links: any) => {
    setStep('processing');
    setError(null);
    
    const res = await generateCreativeSuiteResult('copy', links);
    
    if (res.success && res.data) {
      setResult(res.data);
      setStep('results');
    } else {
      setError(res.error || 'Erro na geração de copy.');
      setStep('onboarding');
    }
  };

  if (step === 'onboarding') {
    return <KnowledgeInputForm 
      appName="Gerador de Copies" 
      onComplete={handleKnowledgeComplete} 
      requiredFields={['site', 'linkedin', 'facebook']}
    />;
  }

  if (step === 'processing') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 bg-[var(--color-brand-orange)]/10 border border-[var(--color-brand-orange)]/20 rounded-2xl flex items-center justify-center mb-6"
        >
          <Zap className="text-[var(--color-brand-orange)]" size={32} />
        </motion.div>
        <h3 className="text-2xl font-bold uppercase tracking-widest mb-2 text-white">Destilando Argumentos</h3>
        <p className="text-slate-400 font-mono text-xs">Mapeando gatilhos mentais ideais para o seu site...</p>
      </div>
    );
  }

  if (step === 'results' && result) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 prose prose-invert max-w-none">
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-white/10">
            <h3 className="text-xl font-bold uppercase tracking-widest text-[var(--color-brand-orange)] flex items-center gap-2">
               <Zap size={20} /> Matriz de Copy Neural
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
}
