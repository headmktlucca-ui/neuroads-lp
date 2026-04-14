'use client';
import { motion } from 'framer-motion';

import Image from 'next/image';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH2 = motion.h2;

const testimonials = [
  {
    q: 'Essencial para impulsionar sua empresa, recomendo!!',
    a: 'Flávio Almeida',
    s: 'CEO, FJR Teleprompter',
    img: '/images/image (2).png'
  },
  {
    q: 'Excelente profissional de tráfego pago! Sempre muito estratégico, atencioso e focado em performance.',
    a: 'Bruno Ribeiro',
    s: 'CEO, Voar Estúdio Criativo',
    img: '/images/image (1).png'
  },
  {
    q: 'Excelente agência, muito profissional e comprometida sempre buscando melhorar as atividades. Recomendo bastante!',
    a: 'Emanuel Silva',
    s: 'Consultor Financeiro',
    img: '/images/image.png'
  }
];

export default function TestimonialsSection() {
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7 }
  };

  return (
    <section className="section bg-white/[0.02] border-y border-white/10" id="depoimentos">
      <div className="wrap py-24 lg:py-32">
        <div className="text-center mb-16">
          <MotionP {...fadeUp} className="s-badge mx-auto">Feedback dos Clientes</MotionP>
          <MotionH2 {...fadeUp} transition={{ delay: 0.1 }} className="s-title mx-auto text-balance">
            O que dizem os parceiros<br />que já <span className="g">escalaram com o Lucca</span>
          </MotionH2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <MotionDiv
              key={i}
              {...fadeUp}
              transition={{ delay: 0.2 + (i * 0.1) }}
              className="bg-white/04 border border-white/08 rounded-lg p-8 relative hover:border-blue-1/30 transition-all"
            >
              <div className="text-amber-s mb-5 text-[0.8rem]">★★★★★</div>
              <p className="text-[0.935rem] text-text-2 italic font-light leading-[1.8] mb-8 relative z-10">
                "{t.q}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-grad-main flex items-center justify-center font-bold text-white text-[0.75rem] overflow-hidden relative">
                  {(t as any).img ? (
                    <Image src={(t as any).img} alt={t.a} fill className="object-cover" />
                  ) : (
                    <>
                      {t.a.split(' ')[0][0]}{t.a.split(' ')[1] ? t.a.split(' ')[1][0] : ''}
                    </>
                  )}
                </div>
                <div>
                  <div className="font-head font-bold text-[0.85rem] text-text-1">{t.a}</div>
                  <div className="text-[0.65rem] text-text-4 uppercase tracking-[0.1em] mt-0.5">{t.s}</div>
                </div>
              </div>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}
