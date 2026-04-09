'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 -z-10" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-900/5 blur-3xl rounded-full translate-x-1/3 -translate-y-1/4 -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight mb-6">
              Pare de Queimar Verba com Tráfego Amador. <span className="text-[var(--color-brand-blue)]">Escale com Inteligência Neural.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-8 leading-relaxed max-w-xl">
              Ajudamos empresas a transcenderem o platô de vendas através de uma gestão de tráfego de alta performance, rastreamento de dados cirúrgico e funis automatizados orientados a ROI.
            </p>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-block"
            >
              <a 
                href="#agendar" 
                className="inline-block bg-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange-hover)] text-white px-8 py-4 rounded-xl font-bold text-lg md:text-xl transition-all shadow-lg hover:shadow-orange-500/30"
              >
                SAIBA COMO IMPULSIONAR SUAS VENDAS
              </a>
            </motion.div>
          </motion.div>

          {/* Image Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative lg:ml-auto w-full max-w-md mx-auto lg:max-w-none"
          >
            <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/50 bg-slate-200">
              {/* Fallback styling in case image is missing */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-slate-400 font-medium">Imagem do Especialista</span>
              </div>
              <Image 
                src="/images/especialista.jpg" 
                alt="Especialista em Gestão de Tráfego" 
                fill
                className="object-cover relative z-10"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            {/* Decorative element (Floating ROI Badge) */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute -bottom-6 -left-6 md:-left-12 bg-white p-4 pr-6 rounded-2xl shadow-xl z-20 border border-slate-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <div>
                  <p className="text-sm md:text-base font-bold text-slate-900 leading-tight">ROI Maximizado</p>
                  <p className="text-xs md:text-sm text-slate-500">Resultados comprovados</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
