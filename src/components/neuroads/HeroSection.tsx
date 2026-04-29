'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, Sparkles, Zap, Smartphone, Monitor, Laptop } from 'lucide-react';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH1 = motion.h1;

export default function HeroSection() {
  const fadeUp = (delay = 0): any => ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, delay, ease: "circOut" }
  });

  return (
    <section className="relative min-h-[90vh] flex items-center pt-32 pb-20 overflow-hidden">
      {/* BACKGROUND IMAGE REMOVED - NOW IN PAGE WRAPPER */}

      <div className="wrap relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-16 items-center">
          
          <div className="flex flex-col items-start lg:pr-10">
            <MotionH1 {...fadeUp(0.25)} className="text-[43px] font-bold leading-[1.2] tracking-tight text-text-main mb-8 max-w-[850px]">
              Desbloqueie o <br />
              Potencial Oculto do <br />
              Seu Negócio: <span className="grad-text-animated">Marketing</span> <br />
              de <span className="grad-text-animated">Alta Performance</span> <br />
              com <span className="grad-text-animated">IA Agêntica</span>.
            </MotionH1>

            <MotionP {...fadeUp(0.4)} className="text-[18px] text-text-muted leading-relaxed max-w-[620px] mb-12 font-normal">
              Orquestre Agentes de IA que rodam fluxos de marketing de ponta a ponta. Velocidade, controle total e escala previsível.
            </MotionP>

            <MotionDiv {...fadeUp(0.5)}>
              <a
                href="/hub"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-black text-white font-bold text-sm hover:bg-black/90 transition-all"
              >
                Acessar Hub
                <ArrowRight size={16} />
              </a>
            </MotionDiv>

          </div>

            {/* NEW DARK PROFILE CARD */}
            <div className="relative w-full max-w-[480px] mx-auto z-20 hidden lg:block">
              {/* Main Card */}
              {/* Main Card with Double Border Gradient Effect */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="p-1 rounded-[36px] bg-gradient-to-br from-white/40 via-orange-300 to-[#FF6B00] shadow-[0_30px_80px_-20px_rgba(255,107,0,0.3)] relative z-20"
              >
                {/* Thick glass padding layer */}
                <div className="bg-white/60 backdrop-blur-3xl rounded-[32px] p-2">
                  {/* Inner Content Card */}
                  <div className="bg-white rounded-[24px] p-8 shadow-sm">
                    {/* Header */}
                    <div className="flex items-center gap-5 mb-8">
                      <div className="relative w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-primary to-[#FF7A00] shadow-[0_0_25px_rgba(255,77,0,0.3)] flex-shrink-0">
                        <div className="w-full h-full rounded-full overflow-hidden relative bg-white">
                          <Image src="/images/0599.jpeg" alt="Claudio Müller" fill className="object-cover" />
                        </div>
                        {/* Online Dot */}
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-head font-bold text-2xl text-text-main mb-1">Claudio Müller</h3>
                        <p className="text-[13px] text-text-muted font-medium uppercase tracking-wider">Marketing Specialist & IA Expert</p>
                      </div>
                      <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex-shrink-0">
                        Online
                      </div>
                    </div>

                    {/* Quote */}
                    <div className="border-l-2 border-primary pl-5 mb-8 py-1">
                      <p className="text-[15px] text-text-muted italic font-medium leading-relaxed">
                        "A performance real nasce onde a IA encontra a estratégia. Tenha um ecossistema inteligente atuando em operações que transformam dados em lucro previsível."
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 mb-8 border border-border rounded-[16px] p-5 bg-bg-secondary/50 shadow-inner">
                      <div className="text-center border-r border-border">
                        <div className="text-[22px] font-black text-primary mb-1 leading-none">R$10M+</div>
                        <div className="text-[9px] font-bold text-text-dim uppercase tracking-widest mt-2">Investimento</div>
                      </div>
                      <div className="text-center border-r border-border">
                        <div className="text-[22px] font-black text-primary mb-1 leading-none">25+</div>
                        <div className="text-[9px] font-bold text-text-dim uppercase tracking-widest mt-2">Anos Growth</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[22px] font-black text-primary mb-1 leading-none">18</div>
                        <div className="text-[9px] font-bold text-text-dim uppercase tracking-widest mt-2">Agentes de IA</div>
                      </div>
                    </div>

                    <MotionDiv 
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.5 }}
                      className="space-y-3 pt-2"
                    >
                      <p className="text-[13px] font-bold text-text-main leading-snug">
                        Dominamos o seu ecossistema digital para maximizar suas oportunidades.
                      </p>
                      <p className="text-[11px] font-medium text-text-muted leading-relaxed">
                        Crescimento orientado por estratégias inteligentes focadas na sua empresa.
                      </p>
                    </MotionDiv>
                  </div>
                </div>
              </motion.div>


            </div>

        </div>
      </div>
    </section>
  );
}
