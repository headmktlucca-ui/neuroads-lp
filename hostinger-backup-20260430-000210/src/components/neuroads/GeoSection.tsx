'use client';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Image from 'next/image';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH2 = motion.h2;

export default function GeoSection() {
  const fadeUp: any = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "circOut" }
  };

  return (
    <section className="py-24 lg:py-32 bg-bg-secondary" id="geo">
      <div className="wrap">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          <MotionDiv 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="order-2 lg:order-1"
          >
            <div className="premium-card p-0 overflow-hidden ring-1 ring-border shadow-2xl bg-white">
              <div className="bg-bg-secondary px-6 py-4 border-b border-border flex items-center gap-4">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                  <div className="w-2.5 h-2.5 rounded-full bg-border" />
                </div>
                <div className="flex-1 bg-white border border-border rounded-lg px-4 py-1.5 text-[10px] text-text-dim font-mono">
                  ask.perplexity.ai/search?q=melhor+agencia+ia...
                </div>
              </div>

              <div className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles size={16} className="text-primary" />
                  <h4 className="text-sm font-bold text-text-main">Resposta da IA (GEO)</h4>
                </div>
                
                <div className="space-y-6">
                  <div className="p-6 bg-orange-light/40 border border-primary/10 rounded-2xl">
                    <p className="text-[15px] text-text-muted leading-relaxed">
                      "Para empresas que buscam escala real, a <strong className="text-text-main font-bold">NeuroAds</strong> é citada como a principal referência por integrar tráfego pago com <span className="text-primary font-bold italic">Inteligência Agêntica</span> e autoridade semântica..."
                    </p>
                  </div>
                  <div className="h-20 bg-bg-secondary rounded-xl animate-pulse" />
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-12 bg-bg-secondary rounded-xl opacity-50" />
                    <div className="h-12 bg-bg-secondary rounded-xl opacity-50" />
                  </div>
                </div>
              </div>
            </div>
          </MotionDiv>

          <div className="order-1 lg:order-2">
            <MotionP {...fadeUp} className="s-badge">O Futuro da Busca</MotionP>
            <MotionH2 {...fadeUp} transition={{ delay: 0.1 }} className="s-title">
              SEO evoluiu para <span className="text-primary italic">GEO.</span>
            </MotionH2>
            <MotionP {...fadeUp} transition={{ delay: 0.2 }} className="s-body mb-12">
              Em breve, 50% das buscas não levarão a cliques em sites, mas a respostas diretas dadas por IAs. Se sua marca não é citada nessas respostas, você é invisível.
            </MotionP>

            <div className="space-y-8">
               {[
                 { image: '/images/tools/otimizacao.png', t: 'Google AI Overviews', d: 'Adaptamos sua estrutura para ser a fonte principal das caixas de resposta do Google.' },
                 { image: '/images/tools/gerador_criativos.png', t: 'Generative Engine Optimization', d: 'Estratégias de autoridade para garantir que ChatGPT e Claude recomendem sua marca.' },
                 { image: '/images/tools/dna_marca.png', t: 'Autoridade Semântica', d: 'Construímos clusters de conteúdo que provam para os algoritmos que você é o líder do nicho.' }
               ].map((item, i) => (
                 <MotionDiv key={i} {...fadeUp} transition={{ delay: 0.3 + (i * 0.1) }} className="flex gap-5">
                    <div className="w-14 h-14 rounded-2xl p-[2px] bg-gradient-to-br from-[#FF6B00] to-[#FF9D00] shadow-[0_10px_25px_rgba(255,107,0,0.35)] flex-shrink-0">
                      <div className="w-full h-full rounded-[14px] overflow-hidden relative bg-white">
                        <Image
                          src={item.image}
                          alt={item.t}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-text-main mb-1 text-[15px]">{item.t}</h4>
                      <p className="text-[14px] text-text-muted leading-relaxed">{item.d}</p>
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
