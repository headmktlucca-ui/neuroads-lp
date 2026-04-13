'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH2 = motion.h2;

export default function AboutSection() {
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7 }
  };

  return (
    <section className="section bg-white/[0.02] border-y border-white/10 overflow-hidden" id="claudio">
      <div className="wrap py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
          
          {/* PHOTO COLUMN */}
          <MotionDiv 
            {...fadeUp}
            className="about-photo-wrap relative"
          >
            <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-blue-1/10 via-violet-1/[0.08] to-transparent border border-white/10 flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center font-head font-extrabold text-[7rem] grad-text opacity-15 select-none">
                CM
              </div>
              <Image 
                src="/images/especialista-sobre.jpg" 
                alt="Claudio Müller" 
                fill
                className="object-cover object-center relative z-10"
              />
            </div>

            <div className="absolute -top-4 -right-4 bg-grad-main rounded-md p-[0.875rem_1.1rem] text-center shadow-[0_4px_24px_rgba(59,111,255,0.4)] z-20">
              <div className="font-head text-[1.7rem] font-extrabold text-white leading-none">25+</div>
              <div className="text-[0.62rem] font-bold text-white/70 uppercase tracking-[0.1em] mt-1">Anos em Growth</div>
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              {['Google Ads Certified', 'Meta Blueprint', 'Growth Methodology', 'AI Automation'].map((cert, i) => (
                <span key={i} className="text-[0.68rem] font-medium text-blue-2 bg-blue-1/10 border border-blue-1/30 px-3 py-1 rounded-full">
                  {cert}
                </span>
              ))}
            </div>
          </MotionDiv>

          {/* TEXT COLUMN */}
          <div>
            <MotionP {...fadeUp} className="s-badge">Quem está do outro lado</MotionP>
            <MotionH2 {...fadeUp} transition={{ delay: 0.1 }} className="s-title">
              Não é sobre equipe grande.<br />
              <span className="g">É sobre entrega real.</span><br />
              E isso faz toda a diferença.
            </MotionH2>

            <MotionDiv {...fadeUp} transition={{ delay: 0.2 }} className="bg-grad-card border border-blue-1/30 rounded-lg p-[1.5rem_1.75rem] my-8 relative overflow-hidden">
               {/* Quote mark background */}
               <div className="absolute top-[-0.5rem] right-[1.25rem] font-head font-extrabold text-[5rem] grad-text opacity-20 pointer-events-none">
                "
               </div>
               <p className="text-[0.95rem] text-text-2 italic font-light leading-[1.75] relative z-10">
                 "Quando você fala com a NeuroAds, fala diretamente comigo — sem repassar para um estagiário ou um gestor júnior."
               </p>
            </MotionDiv>

            <div className="space-y-4">
              {[
                'Comecei no marketing digital há mais de 25 anos, quando "tráfego pago" sequer era um conceito consolidado no Brasil. Trabalhei com empresas de todos os tamanhos e aprendi que o problema raramente é falta de verba — é falta de estratégia, de dados confiáveis e de um sistema que funcione sem depender de achismo.',
                'Ao longo dessa trajetória, gerenciei mais de R$ 10 milhões em investimentos no Google e Meta. Mas o que mais me move hoje é ver uma PME — que sempre dependeu de indicação ou sorte — começar a crescer de forma previsível, todos os meses, porque construímos juntos o sistema certo.',
                'Por isso criei a NeuroAds: para trazer às PMEs a mesma inteligência estratégica que grandes empresas têm acesso — sem burocracia, sem custo exorbitante, e com alguém que fala a sua língua.'
              ].map((text, i) => (
                <MotionP key={i} {...fadeUp} transition={{ delay: 0.3 + (i * 0.1) }} className="text-[0.935rem] text-text-2 font-light leading-[1.85]">
                  {text}
                </MotionP>
              ))}
            </div>

            <MotionDiv {...fadeUp} transition={{ delay: 0.6 }} className="grid grid-cols-3 gap-px bg-white/10 border border-white/10 rounded-lg overflow-hidden mt-10">
              {[
                { val: 'R$10M+', lbl: 'Em campanhas gerenciadas' },
                { val: '25+', lbl: 'Anos de experiência' },
                { val: '3em1', lbl: 'Soluções integradas' }
              ].map((s, i) => (
                <div key={i} className="bg-[#090B18] p-[1.25rem_1rem] text-center">
                  <div className="font-head text-[1.7rem] font-extrabold grad-text leading-none">{s.val}</div>
                  <div className="text-[0.68rem] text-text-4 uppercase tracking-[0.08em] mt-1.5 leading-tight">{s.lbl}</div>
                </div>
              ))}
            </MotionDiv>
          </div>

        </div>
      </div>
    </section>
  );
}
