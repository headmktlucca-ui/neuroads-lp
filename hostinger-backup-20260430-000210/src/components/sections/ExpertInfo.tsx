'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ShieldCheck, Crosshair, Award } from 'lucide-react';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
  </svg>
);

export default function ExpertInfo() {
  return (
    <section className="py-24 bg-black border-t border-white/5 relative overflow-hidden" id="sobre">
      {/* Minimalist Background Image & Gradients for Smooth Transition */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image 
          src="/images/minimalist_expert_bg.png"
          alt="Modern Minimalist Texture"
          fill
          quality={100}
          className="object-cover opacity-60"
        />
        {/* Soft edge fade using gradient to blend with surrounding black sections */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="w-full lg:w-1/2 flex flex-col items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative aspect-square w-full max-w-sm mx-auto rounded-[2rem] overflow-hidden shadow-xl border-4 border-white/10"
            >
              <Image 
                src="/images/0599.jpeg" 
                alt="Gestor Especialista NeuroAds" 
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-8 max-w-sm mx-auto w-full flex flex-col items-start px-2"
            >
              <h3 className="text-3xl font-bold text-white tracking-tight">Claudio Müller</h3>
              <p className="text-primary font-medium text-lg mt-1 mb-6">Marketing Specialist & IA Expert</p>
              
              <div className="flex gap-4">
                <a href="https://www.instagram.com/claudiomullermkt/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white hover:scale-110 transition-transform shadow-lg">
                  <InstagramIcon className="w-6 h-6" />
                </a>
                <a href="https://www.linkedin.com/in/claudiomullerneto/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-600 text-white hover:scale-110 transition-transform shadow-lg">
                  <LinkedinIcon className="w-6 h-6" />
                </a>
                <a href="https://www.youtube.com/@claudiomullermkt" target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center rounded-xl bg-red-600 text-white hover:scale-110 transition-transform shadow-lg">
                  <YoutubeIcon className="w-6 h-6" />
                </a>
              </div>
            </motion.div>
          </div>

          <div className="w-full lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-brand-orange)] to-[var(--color-brand-green)]">
                  Redefinindo operações, <br />
                  estratégias e resultados
                </span> <br />
                no Marketing Moderno.
              </h2>
              <p className="text-xl italic text-slate-400 mb-8 leading-relaxed">
                &quot;Não vendo campanhas. Construo sistemas que geram resultado enquanto você cuida do que sabe fazer de melhor.&quot;
              </p>

              <div className="flex flex-wrap sm:flex-nowrap items-start justify-center gap-6 pt-4 border-t border-white/5">
                <div className="flex flex-col items-center text-center flex-1">
                  <ShieldCheck className="w-10 h-10 text-[var(--color-brand-orange)] mb-3" />
                  <h4 className="font-bold text-white text-base mb-2">Estratégias Seguras</h4>
                  <p className="text-xs text-slate-400">Sem fórmulas mágicas, apenas dados e métricas reais.</p>
                </div>
                <div className="flex flex-col items-center text-center flex-1">
                  <Crosshair className="w-10 h-10 text-[var(--color-brand-orange)] mb-3" />
                  <h4 className="font-bold text-white text-base mb-2">Foco em Conversão</h4>
                  <p className="text-xs text-slate-400">O que importa é o custo por aquisição (CPA) no alvo.</p>
                </div>
                <div className="flex flex-col items-center text-center flex-1">
                  <Award className="w-10 h-10 text-[var(--color-brand-orange)] mb-3" />
                  <h4 className="font-bold text-white text-base mb-2">Histórico de Resultados</h4>
                  <p className="text-xs text-slate-400">Milhões gerenciados e validados nas maiores plataformas (Google/Meta).</p>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
