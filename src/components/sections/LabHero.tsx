'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { BrainCircuit } from 'lucide-react';

export default function LabHero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  };

  return (
    <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center pt-32 pb-4 overflow-hidden bg-black">
      {/* Neural Background Layer */}
      <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
        <Image
          src="/images/neural-bg.jpg"
          alt="Neural Network Background NeuroAds"
          fill
          priority
          className="object-cover object-center [mask-image:radial-gradient(ellipse_at_top,black_50%,transparent_100%)]"
        />
      </div>

      {/* Background Neural Grid */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-brand-orange)_0%,_transparent_1px)] bg-[length:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      </div>

      {/* Floating Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-brand-orange)]/15 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--color-brand-green)]/15 blur-[120px] rounded-full animate-pulse delay-1000" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center"
        >


          {/* Headline - Radical Typographic Layout */}
          <motion.div variants={itemVariants} className="relative mb-12 text-center w-full px-4 overflow-visible">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.2] tracking-tight uppercase italic pb-4 pr-4">
              Não é o design. <br />
              Não é o texto. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-orange)] to-[var(--color-brand-green)] inline-block pr-8">
                É ESTRATÉGIA!
              </span>
            </h1>
            <div className="absolute -top-8 -right-24 hidden lg:block">
              <span className="text-[var(--color-brand-green)] font-mono text-sm opacity-50 rotate-90 inline-block">NEUROADS_v4.0</span>
            </div>
          </motion.div>

          {/* Description */}
          <motion.p 
            variants={itemVariants}
            className="max-w-2xl text-lg md:text-xl text-slate-400 font-light leading-relaxed text-balance"
          >
            Sua operação comercial com inteligência ativa, identificando oportunidades e acelerando resultados.
          </motion.p>

          {/* Data Fragment Orbits */}
          <div className="absolute inset-0 -z-10 pointer-events-none">
             {/* Left Card */}
             <motion.div 
               animate={{ y: [0, -20, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="absolute top-[15%] left-[-18%] hidden xl:block glass-card p-4 rounded-none border-l-2 border-l-[var(--color-brand-orange)]"
             >
                <div className="text-[10px] text-slate-500 font-mono mb-1">REAL_TIME_ROI</div>
                <div className="text-2xl font-bold text-[var(--color-brand-orange)]">482%</div>
             </motion.div>

              {/* Right Card */}
              <motion.div 
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[20%] right-[-18%] hidden xl:block glass-card p-4 rounded-none border-r-2 border-r-[var(--color-brand-green)] text-right"
              >
                <div className="text-[10px] text-slate-500 font-mono mb-1">AI_DIAGNOSES_COMPLETED</div>
                <div className="text-2xl font-bold text-[var(--color-brand-green)]">1,240+</div>
             </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Extreme Bottom Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}
