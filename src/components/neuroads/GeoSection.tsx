'use client';
import { motion } from 'framer-motion';

const geoStats = [
  { num: '50%+', desc: 'das buscas no Google já exibem respostas geradas por IA antes de qualquer link' },
  { num: '527%', desc: 'de crescimento em acessos vindos de IA em apenas 5 meses de 2025' },
  { num: '84%', desc: 'das empresas ainda não monitoram se são citadas — ou ignoradas — pelas IAs' }
];

export default function GeoSection() {
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7 }
  };

  return (
    <section className="bg-[#05060F] py-24 lg:py-32 relative border-b border-white/5" id="geo">
      <div className="max-w-[1160px] mx-auto px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-20 items-center">
          
          {/* LEFT CONTENT */}
          <div>
            <motion.p {...fadeUp} className="flex items-center gap-3 text-[0.68rem] font-bold tracking-[0.2em] uppercase text-blue-2 mb-4">
              <span className="w-5 h-[2px] bg-grad-main rounded-full" />
              SEO 2.0: O advento do GEO
            </motion.p>
            
            <motion.h2 {...fadeUp} transition={{ delay: 0.1 }} className="font-head text-[clamp(1.9rem,3.4vw,3rem)] font-extrabold leading-[1.1] tracking-tight text-text-1 mb-8">
              Quando alguém pergunta ao<br />
              <span className="bg-grad-main bg-clip-text text-transparent italic">ChatGPT</span> sobre o seu nicho,<br />
              você é a recomendação?
            </motion.h2>

            <motion.p {...fadeUp} transition={{ delay: 0.2 }} className="text-[0.935rem] text-text-3 font-light leading-relaxed mb-10 max-w-[540px]">
              O GEO (Generative Engine Optimization) é o novo SEO. Não se trata apenas de estar no topo do Google, mas de ser a entidade citada e recomendada pelas inteligências artificiais de busca.
            </motion.p>

            <div className="flex flex-col gap-px bg-white/10 border border-white/10 rounded-2xl overflow-hidden reveal">
              {geoStats.map((s, i) => (
                <motion.div 
                  key={i} 
                  {...fadeUp}
                  transition={{ delay: 0.1 * i + 0.3 }}
                  className="bg-bg-base/40 p-6 lg:p-8 flex items-center gap-8 group"
                >
                  <div className="font-head text-[1.8rem] font-extrabold text-blue-1 leading-none min-w-[80px] group-hover:scale-110 transition-transform">
                    {s.num}
                  </div>
                  <div className="text-[0.8rem] lg:text-[0.875rem] text-text-2 leading-relaxed">
                    {s.desc}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* RIGHT CARD */}
          <motion.div 
            {...fadeUp}
            transition={{ delay: 0.5 }}
            className="bg-grad-main rounded-[30px] p-10 text-white relative overflow-hidden shadow-2xl group"
          >
            {/* Background elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-2/20 rounded-full blur-3xl" />

            <h3 className="font-head text-[1.5rem] font-extrabold leading-tight mb-6 relative z-10">
              Otimização de Autoridade Integrada
            </h3>
            <p className="text-[0.85rem] text-white/80 leading-relaxed font-light mb-8 relative z-10">
              Unimos SEO técnico para humanos e GEO estratégico para algoritmos. Garantimos que sua empresa seja encontrada em qualquer ponto da jornada de busca do cliente.
            </p>

            <ul className="space-y-4 mb-10 relative z-10">
              {[
                'Auditoria de autoridade em IA',
                'SEO Técnico e de Conteúdo',
                'Estratégia de Menções e GEO',
                'Monitoramento de Citações',
                'Posicionamento no ChatGPT/Gemini'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[0.82rem] font-medium text-white/90">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-[0.6rem]">✓</span>
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <a href="#contato" className="block text-center bg-white text-blue-1 font-bold text-[0.875rem] py-3.5 rounded-xl no-underline transition-all hover:scale-[1.03] hover:shadow-xl relative z-10">
              Quero aparecer na IA →
            </a>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
