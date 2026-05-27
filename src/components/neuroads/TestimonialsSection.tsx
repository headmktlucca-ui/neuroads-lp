'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Star } from 'lucide-react';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH2 = motion.h2;

const testimonials = [
  { q: 'Essencial para impulsionar sua empresa, recomendo!!', a: 'Flávio Almeida', s: 'CEO, FJR Teleprompter', img: '/images/flavio-almeida.png' },
  { q: 'Excelente profissional de tráfego pago! Sempre muito estratégico, atencioso e focado em performance.', a: 'Bruno Ribeiro', s: 'CEO, Voar Estúdio Criativo', img: '/images/Bruno Ribeiro.png' },
  { q: 'Excelente agência, muito profissional e comprometida sempre buscando melhorar as atividades. Recomendo bastante!', a: 'Emanuel Silva', s: 'Consultor Financeiro', img: '/images/Emanuel Silva.png' }
];

export default function TestimonialsSection() {
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }
  };

  return (
    <section className="py-24 lg:py-32 bg-transparent relative overflow-hidden" id="depoimentos">
      {/* BACKGROUND IMAGE WITH SMOOTH TRANSITION */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Top Fade Mask: From Superior Section Color */}
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/55 via-white/35 to-transparent z-10" />
        
        {/* Bottom Fade Mask: To Next Section Color (White) */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white/60 via-white/35 to-transparent z-10" />
        
        <Image 
          src="/images/back000.png" 
          alt="Background" 
          fill
          className="object-cover object-bottom opacity-70"
        />
      </div>

      <div className="wrap">
        <div className="text-center mb-20">
          <MotionP {...fadeUp} className="s-badge mx-auto">Feedback dos Clientes</MotionP>
          <MotionH2 {...fadeUp} transition={{ delay: 0.1 }} className="s-title mx-auto text-balance">
            Escala validada por quem<br /><span className="text-primary italic">já chegou lá</span>
          </MotionH2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <MotionDiv
              key={i}
              {...fadeUp}
              transition={{ delay: 0.2 + (i * 0.1) }}
              className="premium-card p-10 flex flex-col items-start"
            >
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} size={14} className="fill-primary text-primary" />
                ))}
              </div>
              <p className="text-[17px] text-text-main italic leading-relaxed mb-10 flex-1">
                &quot;{t.q}&quot;
              </p>
              <div className="flex items-center gap-4 pt-6 border-t border-border w-full">
                <div className="w-12 h-12 rounded-full border-2 border-primary/20 p-0.5 overflow-hidden flex-shrink-0 relative">
                  <Image src={t.img} alt={t.a} fill className="object-cover rounded-full" />
                </div>
                <div>
                  <div className="font-bold text-[15px] text-text-main leading-none mb-1">{t.a}</div>
                  <div className="text-[11px] text-text-dim uppercase tracking-wider font-bold">{t.s}</div>
                </div>
              </div>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}
