'use client';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const fadeUp = {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8 }
  };

  return (
    <section className="relative pt-24 pb-16 min-h-[92vh] flex items-center overflow-hidden">
      {/* Grid pattern background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(59,111,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(59,111,255,0.06) 1px, transparent 1px)`,
          backgroundSize: '52px 52px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 30%, black 20%, transparent 80%)'
        }}
      />

      <div className="max-w-[1160px] mx-auto px-10 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-16 lg:gap-20 items-center">
          
          {/* LEFT CONTENT */}
          <div className="flex flex-col">
            <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="flex items-center gap-3 mb-7 flex-wrap">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-1/30 bg-blue-1/10 font-sans font-semibold text-[0.7rem] text-blue-2 tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-1 animate-pulse" />
                Machine Learning · IA · Automação
              </span>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full border border-white/10 bg-white/5 font-sans font-semibold text-[0.68rem] text-text-3 tracking-widest uppercase">
                Para PMEs
              </span>
            </motion.div>

            <motion.h1 
              {...fadeUp} transition={{ delay: 0.25 }}
              className="font-head text-[clamp(2.4rem,4.5vw,4.4rem)] font-extrabold leading-[1.05] tracking-tight text-text-1 mb-6"
            >
              Sua empresa merece<br />
              um marketing que<br />
              <span className="bg-grad-main bg-clip-text text-transparent">realmente funciona.</span>
            </motion.h1>

            <motion.p 
              {...fadeUp} transition={{ delay: 0.4 }}
              className="text-[1.05rem] text-text-2 font-light leading-relaxed max-w-[540px] mb-9"
            >
              Sou Claudio Müller. Combinamos campanhas pagas de alta performance, posicionamento no Google e nas IAs de busca (GEO), e agentes inteligentes no seu operacional comercial — tudo integrado, tudo orientado a resultado mensurável.
            </motion.p>

            <motion.div {...fadeUp} transition={{ delay: 0.55 }} className="flex flex-wrap gap-4 mb-10">
              <a href="#contato" className="btn-primary bg-grad-main text-white px-8 py-3 rounded-md font-bold text-[0.875rem] no-underline shadow-[0_4px_24px_rgba(59,111,255,0.4)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_32px_rgba(59,111,255,0.55)]">
                Quero um diagnóstico gratuito →
              </a>
              <a href="#claudio" className="bg-white/5 border border-white/10 text-text-2 px-8 py-3 rounded-md font-semibold text-[0.875rem] no-underline transition-all hover:bg-white/10 hover:border-white/20 hover:text-white">
                Conheça minha história
              </a>
            </motion.div>

            <motion.div {...fadeUp} transition={{ delay: 0.7 }} className="flex items-center gap-4 pt-8 border-t border-white/10">
              <div className="flex">
                {['AS', 'RC', 'FM', 'JP'].map((initials, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full border-2 border-[#05060F] bg-grad-main flex items-center justify-center text-[0.6rem] font-bold text-white ${i > 0 ? '-ml-2' : ''}`}>
                    {initials}
                  </div>
                ))}
              </div>
              <div className="text-[0.78rem] text-text-3 leading-tight">
                <span className="text-amber-s">★★★★★</span><br />
                Avaliação 5 estrelas por clientes PME em todo o Brasil
              </div>
            </motion.div>
          </div>

          {/* RIGHT - Claudio Card */}
          <div className="relative">
            {/* Floating Metrics */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className="absolute -top-6 -left-12 bg-[#090B18]/80 backdrop-blur-xl border border-white/10 p-4 pt-5 rounded-xl shadow-2xl z-20 hidden lg:block"
            >
              <div className="font-head text-[1.5rem] font-extrabold bg-grad-main bg-clip-text text-transparent leading-none">R$10M+</div>
              <div className="text-[0.62rem] font-bold text-text-4 tracking-widest uppercase mt-2">Investimento gerido</div>
              <div className="text-[0.7rem] font-semibold text-green-s mt-1">↑ Campanhas reais</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
              className="absolute -bottom-6 -right-8 bg-[#090B18]/80 backdrop-blur-xl border border-white/10 p-4 pt-5 rounded-xl shadow-2xl z-20 hidden lg:block"
            >
              <div className="font-head text-[1.5rem] font-extrabold bg-grad-main bg-clip-text text-transparent leading-none">5.2×</div>
              <div className="text-[0.62rem] font-bold text-text-4 tracking-widest uppercase mt-2">ROAS Médio</div>
              <div className="text-[0.7rem] font-semibold text-green-s mt-1">↑ +15% vs mês ant.</div>
            </motion.div>

            {/* Main Card */}
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-2xl shadow-2xl relative">
              {/* Top glow line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-1/60 to-transparent" />
              
              <div className="bg-gradient-to-br from-[#3B6FFF]/10 to-[#7B5FFF]/05 p-8 border-b border-white/10 flex items-center gap-5">
                <div className="w-16 h-16 rounded-full bg-grad-main flex items-center justify-center font-head font-extrabold text-[1.3rem] text-white shadow-[0_0_24px_rgba(59,111,255,0.4)] relative">
                  CM
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-s border-2 border-[#090B18] animate-pulse" />
                </div>
                <div>
                  <div className="font-head font-bold text-[1.05rem] text-text-1">Claudio Müller</div>
                  <div className="text-[0.75rem] text-text-3 mt-1 uppercase tracking-wide">Estrategista de Marketing & IA</div>
                </div>
                <div className="ml-auto hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-s/10 border border-green-s/20 text-[0.68rem] font-bold text-green-s">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-s" /> ONLINE
                </div>
              </div>

              <div className="p-8 pb-10">
                <p className="text-[0.9rem] text-text-2 italic font-light leading-relaxed border-l-2 border-blue-1 pl-4 mb-7">
                  "Não vendo campanhas. Construo sistemas que geram resultado enquanto você cuida do que sabe fazer de melhor."
                </p>

                <div className="grid grid-cols-3 gap-px bg-white/10 border border-white/10 rounded-xl overflow-hidden mb-7">
                  <div className="bg-[#090B18] p-4 text-center">
                    <div className="font-head text-[1.2rem] font-extrabold bg-grad-main bg-clip-text text-transparent truncate">R$10M+</div>
                    <div className="text-[0.6rem] text-text-4 uppercase tracking-widest mt-1">Investido</div>
                  </div>
                  <div className="bg-[#090B18] p-4 text-center">
                    <div className="font-head text-[1.2rem] font-extrabold bg-grad-main bg-clip-text text-transparent truncate">25+</div>
                    <div className="text-[0.6rem] text-text-4 uppercase tracking-widest mt-1">Anos Exp</div>
                  </div>
                  <div className="bg-[#090B18] p-4 text-center">
                    <div className="font-head text-[1.2rem] font-extrabold bg-grad-main bg-clip-text text-transparent truncate">3em1</div>
                    <div className="text-[0.6rem] text-text-4 uppercase tracking-widest mt-1">Soluções</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-[0.68rem] font-medium">
                  {['Google Ads', 'Meta Ads', 'Growth', 'AI Automation'].map(cert => (
                    <span key={cert} className="px-2.5 py-1 rounded-full bg-blue-1/10 border border-blue-1/30 text-blue-2">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
