'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH2 = motion.h2;

const steps = [
  {
    num: '01',
    title: 'Diagnóstico & Estratégia',
    desc: 'Analisamos seus dados atuais, concorrentes e operacional. Definimos o plano de ataque: onde investir, o que automatizar e como se posicionar.',
    tag: 'Fase 1'
  },
  {
    num: '02',
    title: 'Implementação do Ecossistema',
    desc: 'Ativamos o Lucca nas suas campanhas, estruturamos o GEO do seu site e implantamos os primeiros agentes de IA nos seus canais de atendimento.',
    tag: 'Fase 2'
  },
  {
    num: '03',
    title: 'Escala & Otimização Contínua',
    desc: 'Com o sistema rodando, focamos em baixar o custo por lead e aumentar o ROAS. Você recebe relatórios em tempo real e suporte direto do Claudio.',
    tag: 'Fase 3'
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
    <section className="section py-24 lg:py-32" id="processo">
      <div className="wrap text-center">
        <MotionP {...fadeUp} className="s-badge mx-auto">Como Funciona</MotionP>
        <MotionH2 {...fadeUp} transition={{ delay: 0.1 }} className="s-title mx-auto">
          O caminho para sua<br /><span className="g">escala previsível</span>
        </MotionH2>
        <MotionP {...fadeUp} transition={{ delay: 0.2 }} className="s-body mx-auto">
          Sem enrolação. Um processo claro, focado em colocar sua empresa no topo do mercado utilizando o que há de mais avançado em IA.
        </MotionP>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 relative">
          {/* Connector line background (visible on md+) */}
          <div className="absolute top-[40px] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent hidden md:block" />

          {steps.map((step, i) => (
            <MotionDiv 
              key={i} 
              {...fadeUp}
              transition={{ delay: 0.3 + (i * 0.1) }}
              className="relative z-10"
            >
              <div className="w-[120px] h-[120px] rounded-full bg-grad-card border border-white/10 mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(59,111,255,0.2)] mb-8 overflow-hidden relative group">
                <Image 
                  src={`/images/process/phase${i+1}.png`} 
                  alt={step.tag} 
                  fill 
                  className="object-cover scale-110 group-hover:scale-125 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05060F]/40 to-transparent" />
              </div>
              <div className="mb-4">
                <span className="font-head text-[1.4rem] font-extrabold grad-text uppercase tracking-wider">
                  {step.tag}
                </span>
              </div>
              <h3 className="font-head text-[1.1rem] font-bold text-text-1 mb-3">{step.title}</h3>
              <p className="text-[0.85rem] text-text-2 font-light leading-relaxed max-w-[280px] mx-auto">
                {step.desc}
              </p>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}
