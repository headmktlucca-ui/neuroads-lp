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
            <MotionH1 {...fadeUp(0.25)} className="text-[64px] font-bold leading-[1.1] tracking-tight text-text-main mb-8 max-w-[800px]">
              Onde o Tráfego encontra a <span className="text-primary italic">Inteligência.</span>
            </MotionH1>

            <MotionP {...fadeUp(0.4)} className="text-[18px] text-text-muted leading-relaxed max-w-[620px] mb-12 font-normal">
              Orquestre Agentes de IA que rodam fluxos de marketing de ponta a ponta. Velocidade, controle total e escala previsível.
            </MotionP>




          </div>

          <MotionDiv 
            initial={{ opacity: 0, x: 60, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 1.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative hidden lg:block"
          >
            {/* FLOATING AGENT CARD */}
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="premium-card p-10 bg-white/60 backdrop-blur-3xl ring-1 ring-border shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] relative z-20"
            >
              <div className="flex items-center gap-5 mb-10">
                <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-[0_10px_20px_rgba(255,107,31,0.3)]">
                  <Zap size={28} />
                </div>
                <div>
                  <h3 className="font-black text-[22px] text-text-main leading-none mb-1">Optimization Agent</h3>
                  <p className="text-[12px] font-bold text-text-dim uppercase tracking-widest">Status: active_running</p>
                </div>
              </div>

              <div className="p-6 bg-orange-light/30 border border-primary/10 rounded-2xl mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles size={16} className="text-primary animate-pulse" />
                  <span className="text-[13px] font-black text-text-main uppercase tracking-wider">Syncing Data...</span>
                </div>
                <div className="h-1.5 bg-white rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "85%" }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>

              <p className="text-[15px] text-text-muted leading-relaxed mb-10 font-medium italic">
                Otimizando headlines e bids em tempo real com base no comportamento preditivo do usuário.
              </p>

              <div className="h-px bg-border w-full mb-8" />

              <div className="flex items-center justify-between">
                <div className="flex -space-x-3">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-bg-secondary overflow-hidden">
                      <div className="w-full h-full bg-primary/10" />
                    </div>
                  ))}
                </div>
                <button className="text-primary font-black text-[13px] uppercase tracking-widest flex items-center gap-2 group">
                  View Logs 
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </motion.div>

            {/* LIGHT DECOR CARDS */}
            <div className="absolute top-[-20px] right-[-20px] w-64 h-80 bg-primary/5 border border-primary/10 rounded-[40px] -z-10 transform rotate-6 scale-105" />
            <div className="absolute top-10 left-[-40px] w-72 h-32 bg-white/50 backdrop-blur-md border border-white rounded-[32px] shadow-2xl z-10 transform -rotate-12" />
          </MotionDiv>

        </div>
      </div>
    </section>
  );
}
