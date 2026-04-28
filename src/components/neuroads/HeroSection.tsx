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

            {/* NEW DARK PROFILE CARD */}
            <div className="relative w-full max-w-[480px] mx-auto z-20 hidden lg:block">
              {/* Main Card */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="bg-[#0b0c10]/95 backdrop-blur-2xl border border-white/10 rounded-[24px] p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)] relative z-20"
              >
                {/* Header */}
                <div className="flex items-center gap-5 mb-8">
                  <div className="relative w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-[#2563EB] to-[#4F46E5] shadow-[0_0_25px_rgba(37,99,235,0.4)] flex-shrink-0">
                    <div className="w-full h-full rounded-full overflow-hidden relative">
                      <Image src="/images/0599.jpeg" alt="Claudio Müller" fill className="object-cover" />
                    </div>
                    {/* Online Dot */}
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-[#0b0c10] rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-2xl text-white mb-1">Claudio Müller</h3>
                    <p className="text-[13px] text-gray-400 font-medium">Analista em Marketing & Expert em Aplicações IA</p>
                  </div>
                  <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex-shrink-0">
                    Online
                  </div>
                </div>

                {/* Quote */}
                <div className="border-l-2 border-[#3b82f6] pl-5 mb-8 py-1">
                  <p className="text-[15px] text-gray-300 italic font-medium leading-relaxed">
                    "Não vendo campanhas. Construo sistemas que geram resultado enquanto você cuida do que sabe fazer de melhor."
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 mb-8 border border-white/5 rounded-[16px] p-5 bg-[#12141A]">
                  <div className="text-center border-r border-white/5">
                    <div className="text-[22px] font-black text-[#8A9CFF] mb-1 leading-none">R$10M+</div>
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-2">Investimento</div>
                  </div>
                  <div className="text-center border-r border-white/5">
                    <div className="text-[22px] font-black text-[#8A9CFF] mb-1 leading-none">25+</div>
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-2">Anos Growth</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[22px] font-black text-[#8A9CFF] mb-1 leading-none">18</div>
                    <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-2">Agentes de IA</div>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2.5">
                  {['Google Ads', 'Meta Blueprint', 'Growth Methodology'].map(badge => (
                    <span key={badge} className="px-3.5 py-1.5 rounded-full bg-[#141B33] border border-[#232F5C] text-[11px] font-medium text-[#8A9CFF]">
                      {badge}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Floating Top Left Card */}
              <motion.div 
                initial={{ opacity: 0, x: -20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="absolute -top-10 -left-16 bg-[#12141A] border border-white/10 rounded-[20px] p-6 shadow-2xl z-30"
              >
                <div className="text-[26px] font-black text-[#8A9CFF] mb-1 leading-none">R$10M+</div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Investimento Gerenciado</div>
                <div className="text-[12px] font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="text-lg leading-none">↑</span> Comprovado em campanhas reais
                </div>
              </motion.div>

              {/* Floating Bottom Right Card */}
              <motion.div 
                initial={{ opacity: 0, x: 20, y: -10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="absolute -bottom-10 -right-12 bg-[#12141A] border border-white/10 rounded-[20px] p-6 shadow-2xl z-30"
              >
                <div className="flex items-baseline gap-1 mb-1">
                  <div className="text-[32px] font-black text-[#8A9CFF] leading-none">5.2</div>
                  <div className="text-[20px] font-black text-[#8A9CFF]">×</div>
                </div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">ROAS Médio</div>
                <div className="text-[12px] font-semibold text-emerald-400 flex items-center gap-1">
                  <span className="text-lg leading-none">↑</span> +15% vs mês anterior
                </div>
              </motion.div>
            </div>

        </div>
      </div>
    </section>
  );
}
