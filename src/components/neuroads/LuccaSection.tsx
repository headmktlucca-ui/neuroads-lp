'use client';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH2 = motion.h2;

export default function LuccaSection() {
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7 }
  };

  return (
    <section className="section overflow-hidden" id="lucca">
      <div className="wrap py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* TEXT SIDE */}
          <div>
            <MotionP {...fadeUp} className="s-badge">Nossa Diferenciação Tech</MotionP>
            <MotionH2 {...fadeUp} transition={{ delay: 0.1 }} className="s-title">
              O cérebro por trás<br />da performance: <span className="g">Lucca</span>
            </MotionH2>
            <MotionP {...fadeUp} transition={{ delay: 0.2 }} className="s-body">
              Esqueça as agências que tomam decisões baseadas no "feeling" do gestor junior. Nós usamos o Lucca, nosso sistema proprietário que centraliza dados, gera criativos e otimiza campanhas 24h por dia.
            </MotionP>

            <div className="space-y-6 mt-10">
              {[
                { t: 'Decisão em Tempo Real', d: 'O Lucca analisa o desempenho de cada anúncio a cada 60 minutos e redistribui a verba para o que está gerando lucro agora.' },
                { t: 'Criativos Contextuais via IA', d: 'Testamos dezenas de variações de imagem e texto simultaneamente, geradas com base no que o seu cliente realmente clica.' },
                { t: 'Transparência nos Dados', d: 'Um painel exclusivo onde você vê exatamente quanto investiu e quanto retornou — sem planilhas confusas ou dados maquiados.' }
              ].map((item, i) => (
                <MotionDiv key={i} {...fadeUp} transition={{ delay: 0.3 + (i * 0.1) }} className="flex gap-4">
                  <div className="w-5 h-5 rounded-full bg-blue-1/12 border border-blue-1/30 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-1" />
                  </div>
                  <div>
                    <h4 className="font-head text-[0.9rem] font-bold text-text-1 mb-1">{item.t}</h4>
                    <p className="text-[0.835rem] text-text-3 font-light leading-relaxed">{item.d}</p>
                  </div>
                </MotionDiv>
              ))}
            </div>

            <MotionDiv {...fadeUp} transition={{ delay: 0.7 }} className="mt-10">
               <a href="#contato" className="btn btn-ghost px-6 py-3">
                 Saiba como o Lucca ajudará você →
               </a>
            </MotionDiv>
          </div>

          {/* DASHBOARD PREVIEW SIDE */}
          <MotionDiv 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="relative"
          >
            {/* Dashboard Mockup */}
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden backdrop-blur-lg shadow-[var(--shadow-card),_var(--shadow-glow)]">
              {/* UI Header */}
              <div className="bg-grad-card border-b border-white/10 p-[0.75rem_1.25rem] flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-s/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-s/30" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-s/30" />
                </div>
                <div className="text-[0.65rem] font-bold tracking-[0.1em] text-text-4 uppercase">Lucca Performance · v2.4</div>
                <div className="w-6 h-6 rounded-full bg-blue-1/20 border border-blue-1/30" />
              </div>

              {/* UI Content */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#090B18] border border-white/[0.08] rounded-lg p-4">
                    <div className="text-[0.65rem] text-text-4 uppercase">Custo por Lead (AVG)</div>
                    <div className="font-head text-[1.4rem] font-extrabold text-blue-2 mt-1">R$ 4,82</div>
                    <div className="text-[0.62rem] text-green-s font-semibold flex items-center gap-1 mt-1">
                      <span>↓ 18.2%</span> vs last month
                    </div>
                  </div>
                  <div className="bg-[#090B18] border border-white/[0.08] rounded-lg p-4">
                    <div className="text-[0.65rem] text-text-4 uppercase">Conversão Média</div>
                    <div className="font-head text-[1.4rem] font-extrabold text-green-s mt-1">6.42%</div>
                    <div className="text-[0.62rem] text-green-s font-semibold flex items-center gap-1 mt-1">
                      <span>↑ 2.4%</span> optimized by IA
                    </div>
                  </div>
                </div>

                <div className="bg-[#090B18] border border-white/[0.08] rounded-lg p-4 overflow-hidden">
                  <div className="flex items-center justify-between mb-4 border-b border-white/[0.05] pb-2">
                    <div className="text-[0.68rem] font-bold text-text-3">Anúncios em Processamento</div>
                    <div className="text-[0.6rem] text-green-s/60 bg-green-s/[0.05] px-2 py-0.5 rounded border border-green-s/20 animate-pulse">Live Scan</div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { l: 'Creative_V4_Meta', s: 'Ativo', c: 'green-s' },
                      { l: 'Search_GEO_Intent', s: 'Otimizando', c: 'blue-1' },
                      { l: 'Boring_Ad_Copy', s: 'A/B Test', c: 'amber-s' }
                    ].map((ad, i) => (
                      <div key={i} className="flex items-center justify-between text-[0.7rem] text-text-2 group/ad">
                        <div className="flex items-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full bg-${ad.c}`} />
                          {ad.l}
                        </div>
                        <div className="font-mono opacity-50">98.2% relevância</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Graph placeholder */}
                <div className="mt-6 flex items-end justify-between h-16 px-2">
                   {[40, 65, 52, 85, 95, 75, 100].map((h, i) => (
                      <div key={i} className="w-1.5 bg-grad-main rounded-t-sm" style={{ height: `${h}%` }}>
                        <div className="absolute w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white] -top-1 left-0 hidden group-hover:block" />
                      </div>
                   ))}
                </div>
              </div>
            </div>

            {/* Glowing background behind dashboard */}
            <div className="absolute -inset-10 bg-blue-1/[0.08] blur-[80px] -z-10 rounded-full" />
          </MotionDiv>
        </div>
      </div>
    </section>
  );
}
