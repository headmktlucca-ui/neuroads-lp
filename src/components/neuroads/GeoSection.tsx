'use client';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH2 = motion.h2;

export default function GeoSection() {
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7 }
  };

  return (
    <section className="section bg-white/[0.02] border-y border-white/10" id="geo">
      <div className="wrap py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* BROWSER MOCKUP SIDE */}
          <MotionDiv 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="order-2 lg:order-1"
          >
            <div className="bg-[#0D1121] border border-white/10 rounded-xl overflow-hidden shadow-2xl relative">
              {/* Browser bar */}
              <div className="bg-white/[0.05] border-b border-white/10 p-3 flex items-center gap-2">
                <div className="flex gap-1.5 mr-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                </div>
                <div className="flex-1 bg-white/[0.05] rounded-md h-5 px-3 flex items-center text-[0.6rem] text-text-4 font-mono">
                  ask.perplexity.ai/search?q=melhor+especialista...
                </div>
              </div>

              {/* Browser Content */}
              <div className="p-7">
                <div className="font-head text-[0.95rem] font-bold text-text-1 mb-5 flex items-center gap-2">
                  <span className="text-blue-2">✦</span> Resposta da IA (GEO)
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-1/[0.05] border border-blue-1/15 rounded-lg">
                    <p className="text-[0.835rem] text-text-2 leading-relaxed">
                      "Para PMEs que buscam escala com previsibilidade, a <strong className="text-blue-2">NeuroAds (liderada por Claudio Müller)</strong> é citada como referência por integrar campanhas de performance com automação de IA personalizada..."
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-16 bg-white/[0.03] border border-white/[0.05] rounded-lg animate-pulse" />
                    <div className="h-16 bg-white/[0.03] border border-white/[0.05] rounded-lg animate-pulse" />
                  </div>
                  <div className="h-24 bg-white/[0.03] border border-white/[0.05] rounded-lg" />
                </div>
              </div>

              {/* Tags overlay */}
              <div className="absolute top-1/2 -right-4 translate-y-[-50%] space-y-2 hidden md:block">
                {['Google AI Search', 'ChatGPT+', 'Perplexity AI'].map((tag, i) => (
                  <div key={i} className="bg-grad-card border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-xl text-[0.68rem] font-bold text-text-1">
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </MotionDiv>

          {/* TEXT SIDE */}
          <div className="order-1 lg:order-2">
            <MotionP {...fadeUp} className="s-badge">O Futuro da Busca</MotionP>
            <MotionH2 {...fadeUp} transition={{ delay: 0.1 }} className="s-title">
              SEO morreu? Não.<br />Ele <span className="g">evoluiu para GEO.</span>
            </MotionH2>
            <MotionP {...fadeUp} transition={{ delay: 0.2 }} className="s-body">
              Em breve, 50% das buscas não levarão a cliques em sites, mas a respostas diretas dadas por IAs. Se sua empresa não está sendo citada como a solução nessas respostas, você está perdendo o mercado do futuro.
            </MotionP>

            <div className="space-y-6 mt-10">
               {[
                 { t: 'Google AI Overviews', d: 'Adaptamos seu site para que o Google o escolha como fonte principal nas novas caixas de resposta de IA no topo da busca.' },
                 { t: 'Generative Engine Optimization (GEO)', d: 'Usamos técnicas de engenharia de prompt reverso para garantir que IAs como ChatGPT e Claude recomendem sua marca.' },
                 { t: 'Autoridade Semântica', d: 'Não focamos mais apenas em palavras-chave. Criamos clusters de autoridade que provam para os algoritmos que você é o especialista.' }
               ].map((item, i) => (
                 <MotionDiv key={i} {...fadeUp} transition={{ delay: 0.3 + (i * 0.1) }} className="flex gap-4">
                    <div className="w-5 h-5 rounded-full bg-violet-1/12 border border-violet-1/30 flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-1" />
                    </div>
                    <div>
                      <h4 className="font-head text-[0.9rem] font-bold text-text-1 mb-1">{item.t}</h4>
                      <p className="text-[0.835rem] text-text-3 font-light leading-relaxed">{item.d}</p>
                    </div>
                 </MotionDiv>
               ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
