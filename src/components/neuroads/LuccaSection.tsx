'use client';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, ShieldCheck, Zap } from 'lucide-react';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH2 = motion.h2;

const features = [
  { icon: <TrendingUp size={18} />, t: 'Decisão em Tempo Real', d: 'O Lucca analisa o desempenho de cada anúncio a cada 60 minutos e redistribui a verba para o que gera lucro.' },
  { icon: <Zap size={18} />, t: 'Criativos Contextuais via IA', d: 'Testamos dezenas de variações de imagem e texto simultaneamente, geradas com base no comportamento real.' },
  { icon: <ShieldCheck size={18} />, t: 'Transparência nos Dados', d: 'Um painel exclusivo onde você vê exatamente quanto investiu e quanto retornou. Sem maquiagem.' }
];

export default function LuccaSection() {
  const fadeUp: any = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "circOut" }
  };

  return (
    <section className="py-24 lg:py-32 bg-white" id="lucca">
      <div className="wrap">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          <div className="max-w-[540px]">
            <MotionP {...fadeUp} className="s-badge">Sistema Propriatário</MotionP>
            <MotionH2 {...fadeUp} transition={{ delay: 0.1 }} className="s-title">
              O cérebro da nossa<br />performance: <span className="text-primary italic">Lucca</span>
            </MotionH2>
            <MotionP {...fadeUp} transition={{ delay: 0.2 }} className="s-body mb-12">
              Esqueça as decisões baseadas no "feeling". O Lucca é nosso sistema agêntico que orquestra tráfego, criativos e automações em um único ecossistema.
            </MotionP>

            <div className="space-y-8 mt-10">
              {features.map((item, i) => (
                <MotionDiv key={i} {...fadeUp} transition={{ delay: 0.3 + (i * 0.1) }} className="flex gap-5">
                  <div className="w-10 h-10 rounded-xl bg-orange-light flex items-center justify-center text-primary flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-text-main mb-1 text-[15px]">{item.t}</h4>
                    <p className="text-[14px] text-text-muted leading-relaxed">{item.d}</p>
                  </div>
                </MotionDiv>
              ))}
            </div>

            <MotionDiv {...fadeUp} transition={{ delay: 0.7 }} className="mt-12">
               <a 
                 href="https://www.luccaos.pro/" 
                 target="_blank" 
                 rel="noopener noreferrer" 
                 className="btn btn-primary px-8"
               >
                 Acessar Lucca.os
               </a>
            </MotionDiv>
          </div>

          <MotionDiv 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative lg:ml-10"
          >
            {/* DASHBOARD MOCKUP LIGHT */}
            <div className="premium-card p-0 overflow-hidden ring-1 ring-border shadow-2xl">
              <div className="bg-bg-secondary px-6 py-4 border-b border-border flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-dim">Lucca Dashboard v2.5</div>
                <div className="w-6 h-6 rounded-full bg-white border border-border" />
              </div>
              
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-text-dim mb-2">ROI Real Time</p>
                    <p className="text-3xl font-black text-primary">6.8x</p>
                    <p className="text-[10px] text-green-600 font-bold mt-1">↑ +14% vs ontem</p>
                  </div>
                  <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-text-dim mb-2">Leads Gerados</p>
                    <p className="text-3xl font-black text-text-main">1,284</p>
                    <p className="text-[10px] text-green-600 font-bold mt-1">↑ +8% optimized</p>
                  </div>
                </div>

                <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
                    <p className="text-xs font-bold text-text-main">Agentes Ativos</p>
                    <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded text-[10px] font-bold text-green-600">
                      <div className="w-1 h-1 rounded-full bg-green-600 animate-pulse" />
                      Otimizando
                    </div>
                  </div>
                  <div className="space-y-4">
                    {[1, 2].map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <div className="w-32 h-2 bg-bg-secondary rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} whileInView={{ width: '80%' }} className="h-full bg-primary" />
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-text-dim">98% Match</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Glowing background */}
            <div className="absolute -inset-20 bg-primary/5 blur-[100px] -z-10 rounded-full" />
          </MotionDiv>

        </div>
      </div>
    </section>
  );
}
