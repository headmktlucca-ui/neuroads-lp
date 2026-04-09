'use client';
import { motion } from 'framer-motion';

export default function BottomCTA() {
  return (
    <section className="relative py-24 bg-[#0a1b4d] overflow-hidden" id="agendar">
      {/* Decorative gradient blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[var(--color-brand-orange)]/20 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Star sparkle decoration */}
      <div className="absolute bottom-8 right-12 opacity-50">
        <svg width="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 0 C50 30 70 50 100 50 C70 50 50 70 50 100 C50 70 30 50 0 50 C30 50 50 30 50 0 Z" fill="#ffffff" />
        </svg>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[var(--color-brand-orange)] font-bold tracking-widest uppercase text-sm mb-4">
            PRONTO PARA ESCALAR SEUS RESULTADOS?
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-10 leading-tight">
            Agende sua Consultoria Gratuita com a NeuroAds.
          </h2>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <a 
              href="https://wa.me/5511999999999" 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange-hover)] text-white px-10 py-5 rounded-xl font-bold text-xl md:text-2xl transition-all shadow-[0_0_30px_rgba(234,88,12,0.5)] hover:shadow-[0_0_50px_rgba(234,88,12,0.8)]"
            >
              AGENDAR AGORA
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
