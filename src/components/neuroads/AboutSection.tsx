'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { agents } from '../../data/agents';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH2 = motion.h2;

export default function AboutSection() {
  const agentsCount = agents.length;
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }
  };

  return (
    <section className="py-24 lg:py-32 relative z-10" id="claudio">
      <div className="wrap">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* PHOTO COLUMN */}
          <MotionDiv 
            {...fadeUp}
            className="relative"
          >
            <div className="relative group">
              {/* Decorative Frame */}
              <div className="absolute -inset-4 bg-primary/5 rounded-2xl -z-10 blur-xl group-hover:bg-primary/10 transition-all duration-500" />
              
              {/* EXPERTISE BADGE - R$10M+ (Top Left) */}

              <div className="aspect-[3/4] rounded-xl bg-white border border-border shadow-lg flex items-center justify-center overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center font-head font-extrabold text-[7rem] text-primary/5 select-none">
                  CM
                </div>
                <Image 
                  src="/images/0599.jpeg" 
                  alt="Claudio Müller" 
                  fill
                  className="object-cover object-center relative z-10 grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                />
              </div>

              {/* ROAS BADGE (Bottom Right) */}

              {/* EXPERT PROFILE CARD */}
              <div className="absolute -bottom-16 left-8 right-8 z-20 p-1 rounded-[24px] bg-gradient-to-br from-white/40 via-orange-300 to-[#FF6B00] shadow-[0_20px_40px_-10px_rgba(255,107,0,0.3)]">
                <div className="bg-white/60 backdrop-blur-3xl rounded-[20px] p-1.5">
                  <div className="bg-white rounded-[14px] p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-text-main font-head font-extrabold text-xl leading-none">Claudio Müller</h4>
                        <p className="text-[11px] font-bold text-primary uppercase tracking-[0.15em] mt-2 leading-none">Marketing Specialist & IA Expert</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-green-50 px-2.5 py-1 rounded-full text-[10px] font-bold text-green-600 border border-green-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                        ONLINE
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-5">
                      <a href="https://www.instagram.com/claudiomullermkt/" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-all duration-300 opacity-70 hover:opacity-100">
                        <Image src="/images/instagram-final.png" alt="Instagram" width={28} height={28} />
                      </a>
                      <a href="https://www.linkedin.com/in/claudiomullerneto/" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-all duration-300 opacity-70 hover:opacity-100">
                        <Image src="/images/linkedin-3d.png" alt="LinkedIn" width={28} height={28} />
                      </a>
                      <a href="https://www.youtube.com/@claudiomullermkt" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-all duration-300 opacity-70 hover:opacity-100">
                        <Image src="/images/youtube-final.png" alt="YouTube" width={28} height={28} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </MotionDiv>

          {/* TEXT COLUMN */}
          <div className="p-1 rounded-[36px] bg-gradient-to-br from-white/40 via-orange-300 to-[#FF6B00] shadow-[0_30px_80px_-20px_rgba(255,107,0,0.3)] relative z-20">
            <div className="bg-white/60 backdrop-blur-3xl rounded-[32px] p-2">
              <div className="bg-white rounded-[24px] p-10 lg:p-12 shadow-sm">
                <MotionP {...fadeUp} className="s-badge">Especialista Fundador</MotionP>
                <MotionH2 {...fadeUp} transition={{ delay: 0.1 }} className="s-title !text-[30px]">
                  Não é sobre equipe grande.<br />
                  <span className="text-primary italic">É sobre inteligência.</span>
                </MotionH2>

                <MotionDiv {...fadeUp} transition={{ delay: 0.2 }} className="p-8 my-8 relative overflow-hidden bg-bg-secondary/50 rounded-2xl border border-border shadow-sm">
                   <div className="absolute top-2 right-6 font-head font-extrabold text-[5rem] text-primary/10 pointer-events-none italic">
                    &quot;
                   </div>
                   <p className="text-base text-text-muted italic font-medium leading-relaxed relative z-10">
                     &quot;A performance real nasce onde a IA encontra a estratégia. Tenha um ecossistema inteligente atuando em operações que transformam dados em lucro previsível.&quot;
                   </p>
                </MotionDiv>

                <div className="space-y-6">
                  {[
                    '"Com mais de 25 anos de estrada no marketing digital, vi o mercado nascer e se transformar. Gerenciei mais de R$ 10 milhões em mídia paga, mas aprendi que o segredo não é apenas comprar tráfego: é construir um ecossistema que converte.',
                    'A NeuroAds nasceu da necessidade de democratizar a IA corporativa para PMEs. Hoje, usamos agentes autônomos para liberar seu time do operacional e focar no que realmente importa: fechar vendas de alto valor."'
                  ].map((text, i) => (
                    <MotionP key={i} {...fadeUp} transition={{ delay: 0.3 + (i * 0.1) }} className="text-base text-text-muted leading-relaxed italic">
                      {text}
                    </MotionP>
                  ))}
                </div>

                <MotionDiv {...fadeUp} transition={{ delay: 0.6 }} className="grid grid-cols-3 gap-px bg-border border border-border rounded-xl overflow-hidden mt-12 bg-white shadow-sm">
                  {[
                    { val: 'R$10M+', lbl: 'Investimento' },
                    { val: '25+', lbl: 'Anos Growth' },
                    { val: agentsCount, lbl: 'Agentes de IA' }
                  ].map((s, i) => (
                    <div key={i} className="bg-white p-6 text-center">
                      <div className="font-head text-2xl font-extrabold text-primary leading-none">{s.val}</div>
                      <div className="text-[10px] text-text-dim uppercase tracking-widest mt-2">{s.lbl}</div>
                    </div>
                  ))}
                </MotionDiv>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
