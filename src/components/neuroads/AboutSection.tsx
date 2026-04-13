'use client';
import { motion } from 'framer-motion';

export default function AboutSection() {
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7 }
  };

  return (
    <section className="bg-[#05060F]/50 py-24 lg:py-32 border-y border-white/5 relative overflow-hidden" id="claudio">
      <div className="max-w-[1160px] mx-auto px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* PHOTO COLUMN */}
          <motion.div {...fadeUp} className="relative group">
            <div className="aspect-[3/4] rounded-3xl bg-gradient-to-br from-blue-1/10 to-violet-1/05 border border-white/10 flex items-center justify-center overflow-hidden relative">
              <div className="font-head text-[7rem] font-extrabold bg-grad-main bg-clip-text text-transparent opacity-20 select-none">
                CM
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#05060F] to-transparent opacity-40" />
              
              <div className="absolute bottom-5 left-5 right-5 bg-bg-base/80 backdrop-blur-md border border-white/10 rounded-xl p-4 text-[0.75rem] text-text-3 italic leading-relaxed">
                📸 Insira aqui a foto profissional do Claudio Müller — cuidaremos do enquadramento e da integração com a marca.
              </div>
            </div>

            {/* Photo Badge */}
            <div className="absolute -top-5 -right-5 bg-grad-main p-4 rounded-xl shadow-2xl text-center transform group-hover:-translate-y-1 transition-transform">
              <div className="font-head text-[1.7rem] font-extrabold text-white leading-none">25+</div>
              <div className="text-[0.62rem] font-bold text-white/70 uppercase tracking-widest mt-1">Anos em Growth</div>
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              {['Google Ads Certified', 'Meta Blueprint', 'Growth Methodology', 'AI Automation'].map((cert) => (
                <span key={cert} className="px-3 py-1.5 rounded-full border border-blue-1/30 bg-blue-1/10 text-[0.7rem] font-medium text-blue-2">
                  {cert}
                </span>
              ))}
            </div>
          </motion.div>

          {/* TEXT COLUMN */}
          <div>
            <motion.p {...fadeUp} transition={{ delay: 0.1 }} className="flex items-center gap-3 text-[0.68rem] font-bold tracking-[0.2em] uppercase text-blue-2 mb-4">
              <span className="w-5 h-[2px] bg-grad-main rounded-full" />
              Quem está do outro lado
            </motion.p>
            
            <motion.h2 {...fadeUp} transition={{ delay: 0.2 }} className="font-head text-[clamp(1.9rem,3.2vw,3rem)] font-extrabold leading-[1.1] tracking-tight text-text-1 mb-6">
              Não sou uma agência.<br />
              <span className="bg-grad-main bg-clip-text text-transparent">Sou o Claudio.</span><br />
              E isso faz toda a diferença.
            </h2 >

            <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="bg-grad-card border border-blue-1/30 rounded-2xl p-6 lg:p-8 mb-8 relative overflow-hidden group">
              <span className="absolute right-6 top-0 font-head text-[5rem] font-extrabold bg-grad-main bg-clip-text text-transparent opacity-10 leading-none">"</span>
              <p className="text-[0.95rem] text-text-2 italic font-light leading-relaxed relative z-10">
                "Quando você fala com a NeuroAds, fala diretamente comigo — sem repassar para um estagiário ou um gestor júnior."
              </p>
            </motion.div>

            <motion.p {...fadeUp} transition={{ delay: 0.4 }} className="text-[0.935rem] text-text-2 font-light leading-relaxed mb-5">
              Comecei no marketing digital há mais de 25 anos, quando "tráfego pago" sequer era um conceito consolidado no Brasil. Trabalhei com empresas de todos os tamanhos e aprendi que o problema raramente é falta de verba — é falta de estratégia, de dados confiáveis e de um sistema que funcione sem depender de achismo.
            </motion.p>
            
            <motion.p {...fadeUp} transition={{ delay: 0.5 }} className="text-[0.935rem] text-text-2 font-light leading-relaxed mb-5">
              Ao longo dessa trajetória, gerenciei mais de R$ 10 milhões em investimentos no Google e Meta. Mas o que mais me move hoje é ver uma PME — que sempre dependeu de indicação ou sorte — começar a crescer de forma previsível, todos os meses, porque construímos juntos o sistema certo.
            </motion.p>

            <motion.div {...fadeUp} transition={{ delay: 0.6 }} className="grid grid-cols-3 gap-px bg-white/10 border border-white/10 rounded-2xl overflow-hidden mt-10">
              <div className="bg-bg-base/40 p-5 text-center">
                <div className="font-head text-[1.7rem] font-extrabold bg-grad-main bg-clip-text text-transparent">R$10M+</div>
                <div className="text-[0.62rem] text-text-4 uppercase tracking-widest mt-2">Investido</div>
              </div>
              <div className="bg-bg-base/40 p-5 text-center">
                <div className="font-head text-[1.7rem] font-extrabold bg-grad-main bg-clip-text text-transparent">25+</div>
                <div className="text-[0.62rem] text-text-4 uppercase tracking-widest mt-2">Anos Growh</div>
              </div>
              <div className="bg-bg-base/40 p-5 text-center">
                <div className="font-head text-[1.7rem] font-extrabold bg-grad-main bg-clip-text text-transparent">3em1</div>
                <div className="text-[0.62rem] text-text-4 uppercase tracking-widest mt-2">Integrado</div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
