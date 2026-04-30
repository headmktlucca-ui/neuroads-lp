'use client';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH2 = motion.h2;

const steps = [
  {
    num: '01',
    title: 'Integração de Dados',
    desc: 'Ligue suas contas de anúncio e canais de vendas para que nossa IA entenda seu ecossistema em tempo real.'
  },
  {
    num: '02',
    title: 'Customização de Agentes',
    desc: 'Selecionamos e treinamos os agentes de IA específicos para seus desafios de marketing e conversão.'
  },
  {
    num: '03',
    title: 'Automação & Escala',
    desc: 'A IA assume as tarefas operacionais pesadas, otimizando ROAS e liberando seu time para estratégia.'
  },
  {
    num: '04',
    title: 'Crescimento Contínuo',
    desc: 'Ajustamos os modelos conforme o mercado evolui, garantindo que sua vantagem competitiva cresça.'
  }
];

export default function ProcessSection() {
  const fadeUp: any = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "circOut" }
  };

  return (
    <section className="py-24 lg:py-32 bg-bg-secondary" id="processo">
      <div className="wrap">
        <div className="text-center max-w-[800px] mx-auto mb-20">
          <MotionP {...fadeUp} className="s-badge justify-center">Nossa Metodologia</MotionP>
          <MotionH2 {...fadeUp} transition={{ delay: 0.1 }} className="s-title mb-6">
            Construa sua própria solução de <span className="text-primary italic">IA Marketing</span> impecável
          </MotionH2>
          <MotionP {...fadeUp} transition={{ delay: 0.2 }} className="text-lg text-text-muted">
            Um sistema desenhado para quem precisa de performance, não apenas relatórios. 
            Quatro passos para o futuro da sua automação.
          </MotionP>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <MotionDiv 
              key={i} 
              {...fadeUp}
              transition={{ delay: 0.2 + (i * 0.1) }}
              className="premium-card p-8 group hover:scale-[1.02]"
            >
              <div className="text-4xl font-bold text-primary mb-6 opacity-30 group-hover:opacity-100 transition-opacity">
                {step.num}
              </div>
              <h3 className="text-xl font-bold text-text-main mb-4">{step.title}</h3>
              <p className="text-text-muted leading-relaxed">
                {step.desc}
              </p>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}
