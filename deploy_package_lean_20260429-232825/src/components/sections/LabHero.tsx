'use client';
import { motion } from 'framer-motion';
import { BarChart3, GitBranch, Network, ArrowRight } from 'lucide-react';

export default function LabHero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
  };

  const cardVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 overflow-hidden bg-black">
      {/* Correct Neural Mesh Background Image - Static */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 bg-[#030303] bg-cover bg-center bg-no-repeat opacity-90"
          style={{ backgroundImage: `url('/images/hero-correct.jpg')` }}
        />
        
        {/* Static Glow Overlay for Subtle Depth (No Motion) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-brand-orange)]/5 via-transparent to-[var(--color-brand-green)]/5 opacity-50" />

        {/* Strategic Vignette for Readability */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_20%,_black_95%)] opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Left Column: Strategic Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start"
          >
            <motion.div 
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6"
            >
              <div className="w-2 h-2 rounded-full bg-[var(--color-brand-orange)] animate-pulse" />
              <span className="text-xs font-bold tracking-[0.2em] text-[var(--color-brand-orange)] uppercase">
                NEUROADS, AGÊNCIA DE IA
              </span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-4xl md:text-6xl font-bold leading-[1.2] mb-8 tracking-tight text-white"
            >
              Agentes de IA para <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-orange)] to-[var(--color-brand-green)]">
                Processos e Dados
              </span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-slate-300 font-light leading-relaxed max-w-xl mb-12"
            >
              Transforme dados em decisões estratégicas com agentes de Inteligência Artificial personalizados que automatizam tarefas, analisam informações e impulsionam resultados mensuráveis.
            </motion.p>

            <motion.div variants={itemVariants}>
              <button className="px-10 py-5 bg-[var(--color-brand-orange)] text-black font-bold rounded-full hover:bg-[var(--color-brand-orange-hover)] transition-all shadow-[0_10px_30px_rgba(249,166,32,0.2)] flex items-center gap-3 group">
                Descubra os benefícios
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
            </motion.div>
          </motion.div>

          {/* Right Side: Features Cards */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.2,
                  delayChildren: 0.6
                }
              }
            }}
            className="flex flex-col gap-6"
          >
            {[
              {
                title: 'Análise Inteligente de Dados',
                desc: 'Extraia insights valiosos de seus dados com agentes de IA que identificam padrões e tendências ocultas automaticamente.',
                icon: <BarChart3 className="text-black" size={24} />
              },
              {
                title: 'Automação de Processos Internos',
                desc: 'Elimine tarefas repetitivas e reduza erros com agentes que automatizam fluxos de trabalho críticos do seu negócio.',
                icon: <GitBranch className="text-black" size={24} />
              },
              {
                title: 'IA Personalizada para sua Empresa',
                desc: 'Obtenha agentes inteligentes treinados com os dados da sua empresa e integrados perfeitamente aos seus sistemas atuais.',
                icon: <Network className="text-black" size={24} />
              }
            ].map((card, i) => (
              <motion.div
                key={i}
                variants={cardVariants}
                className="bg-white p-6 md:p-8 rounded-3xl flex items-start gap-6 shadow-2xl hover:translate-x-2 transition-transform duration-300 group"
              >
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--color-brand-orange)]/10 transition-colors">
                  {card.icon}
                </div>
                <div>
                  <h3 className="text-black font-bold text-xl mb-2">{card.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">
                    {card.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
