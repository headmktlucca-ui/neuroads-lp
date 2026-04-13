'use client';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative grid grid-cols-1 lg:grid-cols-[1fr_400px] min-h-[92vh] items-stretch border-b border-black/10 overflow-hidden">
      {/* Decorative vertical line (desktop) */}
      <div className="hidden lg:block absolute top-0 right-[400px] w-[1px] h-full bg-black/10 z-10" />

      <div className="relative flex flex-col justify-center py-28 px-6 lg:padding-l-10 lg:pl-10 lg:pr-20">
        {/* Grid pattern background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `linear-gradient(rgba(22,15,8,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(22,15,8,0.09) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        <motion.div 
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative inline-flex items-center gap-[0.7rem] text-[0.7rem] font-semibold tracking-[0.22em] uppercase text-green-brand mb-8"
        >
          <span className="w-6 h-[1.5px] bg-green-brand" />
          Para pequenas e médias empresas
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="relative font-serif text-[clamp(2.8rem,5vw,5rem)] font-bold leading-[1.02] tracking-[-0.01em] text-ink mb-7"
        >
          Sua empresa merece<br />
          um marketing que<br />
          <em className="italic text-green-brand font-medium">realmente funciona.</em>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative text-[1rem] text-ink2 leading-[1.8] max-w-[500px] font-light"
        >
          Sou Claudio Müller. Há 25 anos ajudo empresas como a sua a crescerem de forma inteligente — com campanhas pagas que convertem, posicionamento orgânico (incluindo nas buscas por IA) e agentes automatizados que destravam o seu comercial.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="relative flex flex-wrap gap-4 mt-11"
        >
          <a href="#contato" className="inline-flex items-center gap-2 bg-green-brand text-white font-sans font-semibold text-[0.875rem] py-[0.9rem] px-8 rounded-[3px] no-underline transition-all hover:bg-green-medium hover:-translate-y-[1px] cursor-pointer tracking-[0.01em]">
            Quero um diagnóstico gratuito →
          </a>
          <a href="#claudio" className="inline-flex items-center gap-2 bg-transparent text-ink2 font-sans font-medium text-[0.875rem] py-[0.9rem] px-7 rounded-[3px] no-underline border border-black/10 transition-all hover:border-ink3 hover:text-ink">
            Conheça minha história
          </a>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="relative flex items-center gap-4 mt-12 pt-10 border-t border-black/10 text-[0.8rem] text-ink3"
        >
          <div className="flex">
            {['AS', 'RC', 'FM', 'JP'].map((initials, i) => (
              <div key={i} className={`w-8 h-8 rounded-full border-2 border-cream bg-green-light flex items-center justify-center text-[0.58rem] font-bold text-green-brand flex-shrink-0 ${i > 0 ? '-ml-2.5' : ''}`}>
                {initials}
              </div>
            ))}
          </div>
          <div>
            <span className="text-amber tracking-[-0.05em] text-[0.9rem]">★★★★★</span><br />
            <span>Avaliação 5 estrelas por clientes PME em todo o Brasil</span>
          </div>
        </motion.div>
      </div>

      {/* Right Column - Desktop Photo Content */}
      <div className="hidden lg:flex relative bg-ink flex-col justify-end overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-[-100px] right-[-100px] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(110,226,168,0.07)_0%,transparent_65%)] pointer-events-none" />

        <div className="absolute top-10 right-6 bg-yellow-500/10 border border-yellow-500/20 p-[0.9rem_1.1rem] rounded-[4px] text-center max-w-[130px] backdrop-blur-md">
          <div className="font-serif text-[2rem] font-bold text-[#F0C060] leading-none">R$10M<sup className="text-[0.55rem]">+</sup></div>
          <div className="text-[0.62rem] font-semibold text-[#F0C060] tracking-[0.07em] uppercase mt-1 opacity-75">Investimento gerenciado</div>
        </div>

        <div className="flex-1 flex items-center justify-center p-[3rem_2rem_1.5rem] relative">
          <div className="w-[260px] h-[340px] border border-white/10 rounded-[4px] relative overflow-hidden">
             <img 
               src="/images/Eu Executivo.png" 
               alt="Claudio Müller" 
               className="w-full h-full object-cover"
             />
          </div>

          <div className="absolute bottom-24 left-6 bg-green-brand/10 border border-green-brand/20 p-[0.8rem_1.1rem] rounded-[4px] max-w-[150px] backdrop-blur-md">
            <div className="font-serif text-[1.6rem] font-bold text-green-bright leading-none">25+</div>
            <div className="text-[0.62rem] font-semibold text-green-bright tracking-[0.06em] uppercase mt-1 opacity-75">Anos em Growth</div>
          </div>
        </div>

        <div className="bg-white/5 border-t border-white/10 p-[1.75rem_2rem]">
          <div className="font-serif text-[1.25rem] font-bold text-cream mb-1 tracking-[0.01em]">Claudio Müller</div>
          <div className="text-[0.75rem] text-white/35 tracking-[0.05em] uppercase font-medium">Estrategista de Marketing & IA · NeuroAds</div>
          <p className="text-[1rem] text-white/50 mt-[0.85rem] leading-[1.6] italic font-light font-serif">
            "Não vendo campanhas. Construo sistemas que geram resultado enquanto você cuida do que sabe fazer de melhor."
          </p>
        </div>
      </div>
    </section>
  );
}
