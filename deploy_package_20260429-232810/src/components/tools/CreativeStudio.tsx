'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Copy, Check, Info, ArrowRight } from 'lucide-react';
import { generateCreativeSuiteResult, CreativeResult } from '../../app/actions/creative-suite';

export default function CreativeStudio() {
  const [productInfo, setProductInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CreativeResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!productInfo.trim()) return;

    setLoading(true);

    try {
      const res = await generateCreativeSuiteResult(productInfo);

      if (res.success && res.data && typeof res.data !== 'string') {
        setResult(res.data);
      } else {
        alert(res.error || 'Falha ao processar comando neural.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Input Section */}
      <div className="space-y-4">
        <label className="text-[10px] font-mono tracking-[0.3em] uppercase text-slate-500">
          Entrada de Dados (O que vamos vender hoje?)
        </label>
        <div className="relative group">
          <textarea
            value={productInfo}
            onChange={(e) => setProductInfo(e.target.value)}
            placeholder="Ex: Novo serviço de tráfego pago para e-commerce de moda feminina premium..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder:text-slate-600 focus:outline-none focus:border-[var(--color-brand-orange)]/50 focus:ring-1 focus:ring-[var(--color-brand-orange)]/20 min-h-[120px] transition-all"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !productInfo.trim()}
            className="absolute bottom-4 right-4 bg-[var(--color-brand-orange)] hover:bg-[var(--color-brand-green)] text-black px-6 py-2.5 rounded-xl font-black italic tracking-wider flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed group-hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(249,166,32,0.2)]"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                PROCESSAR <Send size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {result ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8"
          >
            {/* Headlines */}
            <div className="glass-card p-6 border-white/10 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="text-[var(--color-brand-orange)]" size={18} />
                <h4 className="text-xs font-black tracking-widest uppercase italic">Headlines Magnéticas</h4>
              </div>
              <div className="space-y-3">
                {result.headlines.map((h, i) => (
                  <div key={i} className="group relative bg-white/5 p-4 rounded-xl border border-white/10 flex justify-between items-center hover:border-[var(--color-brand-orange)]/30 transition-all">
                    <span className="text-sm font-medium italic">&quot;{h}&quot;</span>
                    <button onClick={() => copyToClipboard(h, `h-${i}`)} className="text-slate-500 hover:text-white transition-colors">
                      {copied === `h-${i}` ? <Check size={14} className="text-[var(--color-brand-green)]" /> : <Copy size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Hook */}
            <div className="glass-card p-6 border-white/10 flex flex-col gap-4 bg-gradient-to-br from-[var(--color-brand-orange)]/5 to-transparent">
              <div className="flex items-center gap-2 mb-2">
                <Info className="text-[var(--color-brand-green)]" size={18} />
                <h4 className="text-xs font-black tracking-widest uppercase italic">Video Hook (3 Segundos)</h4>
              </div>
              <div className="bg-black/40 p-5 rounded-2xl border border-white/10 relative overflow-hidden group">
                <p className="text-sm leading-relaxed italic text-white relative z-10">&quot;{result.videoHook}&quot;</p>
                <div className="absolute top-0 right-0 p-3">
                  <button onClick={() => copyToClipboard(result.videoHook, 'hook')} className="text-slate-500 hover:text-white">
                    {copied === 'hook' ? <Check size={14} className="text-[var(--color-brand-green)]" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div className="mt-auto pt-4 flex items-center gap-2 text-[10px] text-slate-500 font-mono tracking-wider">
                <ArrowRight size={10} /> FOCO EM RETENÇÃO EXTREMA
              </div>
            </div>

            {/* Full Copy PAS */}
            <div className="lg:col-span-2 glass-card p-8 border-white/10 relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-[var(--color-brand-orange)] rounded-full" />
                  <h4 className="text-xs font-black tracking-widest uppercase italic">Neuro-Copy Master (PAS)</h4>
                </div>
                <button
                  onClick={() => copyToClipboard(result.adCopy, 'copy')}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg text-[10px] font-bold tracking-widest hover:bg-white/10 transition-all border border-white/10"
                >
                  {copied === 'copy' ? <Check size={12} className="text-[var(--color-brand-green)]" /> : <Copy size={12} />}
                  {copied === 'copy' ? 'COPIADO' : 'COPIAR TUDO'}
                </button>
              </div>
              <div className="bg-black/20 p-8 rounded-3xl border border-white/5 whitespace-pre-wrap text-slate-300 text-sm leading-[1.8] font-light">
                {result.adCopy}
              </div>
              <div className="mt-8 p-6 bg-white/5 rounded-2xl border-l-4 border-[var(--color-brand-green)]">
                <h5 className="text-[10px] font-black tracking-widest uppercase italic mb-3 text-[var(--color-brand-green)]">Por que funciona? (Estratégia Neural)</h5>
                <p className="text-xs text-slate-400 italic leading-relaxed">{result.strategy}</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-grow flex flex-col items-center justify-center p-12 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 animate-pulse">
              <Sparkles className="text-slate-600" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2 tracking-tight text-slate-400 italic">Pronto para criar o impossível?</h3>
            <p className="text-sm text-slate-600 max-w-sm">
              Insira as informações do seu produto acima e deixe nossos sistemas neurais gerarem sua próxima campanha de alta conversão.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
