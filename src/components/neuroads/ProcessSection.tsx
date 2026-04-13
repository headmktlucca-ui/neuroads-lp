'use client';
import { motion } from 'framer-motion';

const steps = [
  {
    num: '01',
    title: 'Diagnóstico Gratuito',
    desc: 'Analisamos seus dados atuais, visibilidade e defasagem técnica. Identificamos onde está o maior potencial de retorno imediato.'
  },
  {
    num: '02',
    title: 'Engenharia de Estratégia',
    desc: 'Desenhamos o ecossistema personalizado: mix de canais, estrutura de agentes e metas de ROAS baseadas na sua margem.'
  },
  {
    num: '03',
    title: 'Implantação do Sistema',
    desc: 'Ativamos as campanhas com o Lucca, configuramos o GEO e os agentes de IA. Tudo integrado e pronto para tracionar.'
  },
  {
    num: '04',
    title: 'Monitoramento & Escala',
    desc: 'Acompanhamento diário orientado a dados. Quando o sistema calibra e o lucro escala, expandimos com inteligência.'
  }
];

export default function ProcessSection() {
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7 }
  };

  return (
    <section className="bg-bg-base py-24 lg:py-32 relative border-b border-white/5">
      <div className="max-w-[1160px] mx-auto px-10 relative z-10">
        <motion.p {...fadeUp} className="flex items-center gap-3 text-[0.68rem] font-bold tracking-[0.2em] uppercase text-blue-2 mb-4">
          <span className="w-5 h-[2px] bg-grad-main rounded-full" />
          Metodologia NeuroAds
        </motion.p>
        
        <motion.h2 {...fadeUp} transition={{ delay: 0.1 }} className="font-head text-[clamp(2rem,3.2vw,3.2rem)] font-extrabold leading-[1.1] tracking-tight text-text-1 mb-16">
          Quatro etapas para o<br /><span className="bg-grad-main bg-clip-text text-transparent italic">próximo nível.</span>
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div 
              key={i} 
              {...fadeUp}
              transition={{ delay: 0.1 * i + 0.3 }}
              className="group relative"
            >
              <div className="bg-bg-card border border-white/10 p-8 rounded-2xl h-full group-hover:bg-bg-card-h group-hover:border-blue-1/30 transition-all">
                <div className="font-head text-[3.2rem] font-extrabold text-blue-1/10 mb-6 leading-none group-hover:text-blue-1/30 transition-colors">
                  {s.num}
                </div>
                <h3 className="font-head text-[1.1rem] font-bold text-text-1 mb-4 leading-tight group-hover:text-blue-2 transition-colors">
                  {s.title}
                </h3>
                <p className="text-[0.85rem] text-text-3 font-light leading-relaxed">
                  {s.desc}
                </p>
              </div>
              
              {/* Connector for Desktop */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 translate-y-[-50%] z-20">
                  <div className="w-8 h-px bg-white/10 group-hover:bg-blue-1/40 transition-colors" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
