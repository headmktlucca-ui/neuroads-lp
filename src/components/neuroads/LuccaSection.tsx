'use client';
import { motion } from 'framer-motion';

const luccaItems = [
  'Analisa leilões do Google e Meta a cada ciclo para extrair o menor CPA possível',
  'Prevê o ROI antes de você escalar — você vê os números antes de decidir',
  'Rastreamento server-side: captura 100% das conversões, sem perda por bloqueio de cookies',
  'Redistribui a verba automaticamente para os criativos e canais de melhor performance',
  'Gera diagnóstico automático de Landing Pages, identificando focos de evasão'
];

const luccaRows = [
  { label: 'CPA Atual', val: 'R$ 38,40' },
  { label: 'CPA Alvo', val: 'R$ 42,00 ✓', status: 'good' },
  { label: 'ROAS Atual', val: '4,7×', status: 'good' },
  { label: 'Budget Restante', val: 'R$ 4.280' },
  { label: 'Alertas Detectados', val: '1 grupo ocioso', status: 'warn' },
  { label: 'Receita Projetada', val: 'R$ 84.600', status: 'good' }
];

export default function LuccaSection() {
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7 }
  };

  return (
    <section className="bg-bg-base py-24 lg:py-32 relative overflow-hidden border-b border-white/5" id="lucca">
      {/* Background glow shadow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-blue-1/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1160px] mx-auto px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* CONTENT */}
          <div>
            <motion.p {...fadeUp} className="flex items-center gap-3 text-[0.68rem] font-bold tracking-[0.2em] uppercase text-blue-2 mb-4">
              <span className="w-5 h-[2px] bg-grad-main rounded-full" />
              Saber mais que os outros
            </motion.p>
            
            <motion.h2 {...fadeUp} transition={{ delay: 0.1 }} className="font-head text-[clamp(2rem,3.2vw,3.2rem)] font-extrabold leading-[1.1] tracking-tight text-text-1 mb-8">
              O <span className="bg-grad-main bg-clip-text text-transparent italic">Lucca</span>: o motor que dirige sua performance.
            </motion.h2>

            <motion.p {...fadeUp} transition={{ delay: 0.2 }} className="text-[0.935rem] text-text-3 font-light leading-relaxed mb-10 max-w-[500px]">
              O Lucca não é apenas uma planilha — é um sistema proprietário da NeuroAds que une machine learning aos dados brutos das plataformas de anúncios para tomar decisões que os painéis padrão não mostram.
            </motion.p>

            <div className="flex flex-col gap-5 reveal">
              {luccaItems.map((item, i) => (
                <motion.div 
                  key={i} 
                  {...fadeUp}
                  transition={{ delay: 0.1 * i + 0.3 }}
                  className="flex items-start gap-4 text-[0.9rem] text-text-2 leading-relaxed"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-1/10 border border-blue-1/20 flex items-center justify-center text-[0.7rem] flex-shrink-0 text-blue-1 mt-0.5">
                    ◆
                  </div>
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* DASHBOARD CARD */}
          <motion.div 
            {...fadeUp}
            transition={{ delay: 0.5 }}
            className="bg-bg-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative"
          >
            {/* Header */}
            <div className="bg-white/[0.03] border-b border-white/[0.06] p-5 lg:p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-grad-main flex items-center justify-center font-head font-extrabold text-[0.7rem] text-white">L</div>
                <span className="font-head text-[0.95rem] font-bold text-text-1">Lucca · Painel Operacional</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-1/10 border border-blue-1/20 text-[0.62rem] font-bold text-blue-2 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-2 animate-pulse" />
                Live Feed
              </div>
            </div>

            {/* List */}
            <div className="p-4 lg:p-6 space-y-2">
              {luccaRows.map((row, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.02] hover:bg-white/[0.04] transition-colors">
                  <span className="text-[0.75rem] text-text-4 uppercase tracking-wider font-bold">{row.label}</span>
                  <span className={`font-head text-[1.1rem] font-extrabold ${row.status === 'good' ? 'text-green-s' : row.status === 'warn' ? 'text-amber-s' : 'text-text-1'}`}>
                    {row.val}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-5 lg:p-6 bg-white/[0.02] border-t border-white/[0.04] text-center">
              <p className="text-[0.68rem] text-text-4 italic">
                *Dados anonimizados de monitoramento em tempo real.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
