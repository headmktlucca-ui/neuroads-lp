'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { agents } from '../../data/agents';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH2 = motion.h2;

export default function AboutSection() {
  const agentsCount = agents.length;
  const fadeUp: any = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7, ease: "circOut" }
  };

  return (
    <section className="py-24 lg:py-32 bg-bg-secondary border-y border-border" id="claudio">
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

              {/* EXPERTISE BADGE */}
              <div className="absolute -top-4 -right-4 bg-grad-main rounded-xl p-4 text-center shadow-orange z-20">
                <div className="font-head text-2xl font-extrabold text-white leading-none">25+</div>
                <div className="text-[10px] font-bold text-white/80 uppercase tracking-widest mt-1">Anos em Growth</div>
              </div>

              {/* EXPERT PROFILE CARD */}
              <div className="absolute -bottom-8 left-8 right-8 z-20 bg-white/90 backdrop-blur-xl shadow-xl rounded-2xl p-6 border border-border">
                <div>
                  <h4 className="text-text-main font-head font-extrabold text-xl leading-none">Claudio Müller</h4>
                  <p className="text-[11px] font-bold text-primary uppercase tracking-[0.15em] mt-2 leading-none">Analista de Marketing & IA Comercial</p>
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

            <div className="flex flex-wrap gap-2 mt-16 lg:mt-20">
              {['Google Ads Certified', 'Meta Blueprint', 'Growth Methodology', 'AI Automation'].map((cert, i) => (
                <span key={i} className="text-[11px] font-bold text-primary bg-primary/5 border border-primary/10 px-4 py-1.5 rounded-full uppercase tracking-wider">
                  {cert}
                </span>
              ))}
            </div>
          </MotionDiv>

          {/* TEXT COLUMN */}
          <div>
            <MotionP {...fadeUp} className="s-badge">Especialista Fundador</MotionP>
            <MotionH2 {...fadeUp} transition={{ delay: 0.1 }} className="s-title">
              Não é sobre equipe grande.<br />
              <span className="text-primary italic">É sobre inteligência.</span>
            </MotionH2>

            <MotionDiv {...fadeUp} transition={{ delay: 0.2 }} className="premium-card p-8 my-8 relative overflow-hidden bg-white/50">
               <div className="absolute top-2 right-6 font-head font-extrabold text-[5rem] text-primary/5 pointer-events-none italic">
                "
               </div>
               <p className="text-base text-text-muted italic font-medium leading-relaxed relative z-10">
                 "Na NeuroAds, você fala diretamente comigo. Sem intermediários, sem gestores juniores. Estratégia de nível Master aplicada ao seu negócio."
               </p>
            </MotionDiv>

            <div className="space-y-6">
              {[
                'Com mais de 25 anos de estrada no marketing digital, vi o mercado nascer e se transformar. Gerenciei mais de R$ 10 milhões em mídia paga, mas aprendi que o segredo não é apenas "comprar tráfego" — é construir um ecossistema que converte.',
                'A NeuroAds nasceu da necessidade de democratizar a IA corporativa para PMEs. Hoje, usamos agentes autônomos para liberar seu time do operacional e focar no que realmente importa: fechar vendas de alto valor.',
                'Meu compromisso é com a transparência e o resultado na última linha do balanço. Se você busca escala previsível e autoridade semântica, você está no lugar certo.'
              ].map((text, i) => (
                <MotionP key={i} {...fadeUp} transition={{ delay: 0.3 + (i * 0.1) }} className="text-base text-text-muted leading-relaxed">
                  {text}
                </MotionP>
              ))}
            </div>

            <MotionDiv {...fadeUp} transition={{ delay: 0.6 }} className="grid grid-cols-3 gap-px bg-border border border-border rounded-xl overflow-hidden mt-12 bg-white shadow-sm">
              {[
                { val: 'R$10M+', lbl: 'Gerenciados' },
                { val: '25+', lbl: 'Anos de Exp.' },
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
    </section>
  );
}
