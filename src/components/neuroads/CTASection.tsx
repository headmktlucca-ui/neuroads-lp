'use client';
import { motion } from 'framer-motion';

export default function CTASection() {
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7 }
  };

  return (
    <section className="bg-[#05060F] py-24 lg:py-32 relative overflow-hidden" id="contato">
      {/* Background glow shadow */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-1/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1160px] mx-auto px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          
          {/* LEFT CONTENT */}
          <div>
            <motion.p {...fadeUp} className="flex items-center gap-3 text-[0.68rem] font-bold tracking-[0.2em] uppercase text-blue-2 mb-4">
              <span className="w-5 h-[2px] bg-grad-main rounded-full" />
              Sua Próxima Decisão
            </motion.p>
            
            <motion.h2 {...fadeUp} transition={{ delay: 0.1 }} className="font-head text-[clamp(2rem,3.2vw,3.2rem)] font-extrabold leading-[1.1] tracking-tight text-text-1 mb-8">
              Vamos construir sua<br />
              <span className="bg-grad-main bg-clip-text text-transparent italic">máquina de vendas?</span>
            </motion.h2>

            <motion.p {...fadeUp} transition={{ delay: 0.2 }} className="text-[1rem] text-text-3 font-light leading-relaxed mb-10 max-w-[500px]">
              O diagnóstico é gratuito, direto e revela exatamente onde seu dinheiro está sendo desperdiçado e onde está a maior oportunidade de escala.
            </motion.p>

            <ul className="space-y-5 mb-12">
              {[
                'Análise profunda de campanhas atuais',
                'Diagnóstico de visibilidade GEO (IA)',
                'Identificação de gargalos no comercial',
                'Roadmap personalizado de crescimento'
              ].map((item, i) => (
                <motion.li 
                  key={i} 
                  {...fadeUp}
                  transition={{ delay: 0.1 * i + 0.3 }}
                  className="flex items-start gap-4 text-[0.9rem] text-text-2"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-1/10 flex items-center justify-center text-blue-1 flex-shrink-0 mt-0.5">
                    <span className="text-[0.6rem]">✓</span>
                  </div>
                  {item}
                </motion.li>
              ))}
            </ul>

            <motion.div {...fadeUp} transition={{ delay: 0.7 }} className="flex items-center gap-5 pt-10 border-t border-white/5">
              <div className="w-14 h-14 rounded-full bg-grad-main p-px">
                <div className="w-full h-full rounded-full bg-bg-base flex items-center justify-center font-head font-extrabold text-[1.1rem] text-blue-1">
                  CM
                </div>
              </div>
              <div>
                <div className="font-head font-bold text-[0.95rem] text-text-1">Claudio Müller</div>
                <div className="text-[0.75rem] text-text-4 mt-0.5 font-medium italic">Fundador & Estrategista Master</div>
              </div>
            </motion.div>
          </div>

          {/* FORM CARD */}
          <motion.div 
            {...fadeUp}
            transition={{ delay: 0.4 }}
            className="bg-bg-card border border-white/10 p-8 lg:p-12 rounded-[40px] shadow-2xl relative group overflow-hidden"
          >
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-1/5 blur-3xl rounded-full" />
            
            <h3 className="font-head text-[1.5rem] font-extrabold text-text-1 mb-2 relative z-10">Solicitar Diagnóstico</h3>
            <p className="text-[0.82rem] text-text-3 mb-10 relative z-10">Entraremos em contato em até 2 horas úteis.</p>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-5 relative z-10">
              <div className="space-y-2">
                <label className="text-[0.62rem] font-bold text-text-4 uppercase tracking-[0.1em] px-1">Seu Nome</label>
                <input type="text" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-[0.9rem] text-text-1 outline-none focus:border-blue-1/50 focus:bg-white/[0.05] transition-all" placeholder="Como prefere ser chamado?" />
              </div>
              
              <div className="space-y-2">
                <label className="text-[0.62rem] font-bold text-text-4 uppercase tracking-[0.1em] px-1">Nome da Empresa</label>
                <input type="text" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-[0.9rem] text-text-1 outline-none focus:border-blue-1/50 focus:bg-white/[0.05] transition-all" placeholder="Nome do seu negócio" />
              </div>

              <div className="space-y-2">
                <label className="text-[0.62rem] font-bold text-text-4 uppercase tracking-[0.1em] px-1">WhatsApp</label>
                <input type="tel" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-[0.9rem] text-text-1 outline-none focus:border-blue-1/50 focus:bg-white/[0.05] transition-all" placeholder="(00) 00000-0000" />
              </div>

              <div className="space-y-2">
                <label className="text-[0.62rem] font-bold text-text-4 uppercase tracking-[0.1em] px-1">Principal Desafio</label>
                <select 
                  defaultValue=""
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-[0.9rem] text-text-1 outline-none focus:border-blue-1/50 focus:bg-white/[0.05] transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled className="bg-bg-base">Selecione uma opção</option>
                  <option value="leads" className="bg-bg-base text-black">Gerar mais leads qualificados</option>
                  <option value="cpa" className="bg-bg-base text-black">Reduzir custo por aquisição (CPA)</option>
                  <option value="geo" className="bg-bg-base text-black">Aparecer no topo do Google/IA</option>
                  <option value="automate" className="bg-bg-base text-black">Automatizar processo comercial</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-grad-main text-white font-head font-extrabold text-[0.95rem] p-4 rounded-2xl cursor-pointer mt-4 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                AGENDAR DIAGNÓSTICO →
              </button>
              
              <p className="text-center text-[0.74rem] text-text-4 mt-6 leading-relaxed">
                Prefere algo mais ágil? <a href="#" className="text-blue-1 hover:text-blue-2 transition-colors font-bold underline">Chame no WhatsApp</a>
              </p>
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
