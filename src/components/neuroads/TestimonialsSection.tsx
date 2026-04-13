'use client';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH2 = motion.h2;

const testimonials = [
  {
    q: 'O que me impressionou na NeuroAds foi a clareza. Pela primeira vez, eu entendo onde cada centavo do meu investimento está indo e vejo o ROAS subir mês a mês.',
    a: 'Luiz F.',
    s: 'Proprietário, Construtora L.'
  },
  {
    q: 'A implementação dos agentes de IA no nosso WhatsApp mudou o jogo. Meus vendedores agora só pegam os leads prontos para comprar. Ganhamos 2h por dia cada um.',
    a: 'Mariana S.',
    s: 'Diretora Comercial, TecSol'
  },
  {
    q: 'Eu achava que SEO era só colocar palavra-chave. O Claudio me mostrou que GEO é o que vai manter a gente vivo no ChatGPT. Já estamos sendo citados lá!',
    a: 'Ricardo M.',
    s: 'Sócio, Advocacia M.'
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
                <div className="w-10 h-10 rounded-full bg-grad-main flex items-center justify-center font-bold text-white text-[0.75rem]">
                  {t.a.split(' ')[0][0]}{t.a.split(' ')[1] ? t.a.split(' ')[1][0] : ''}
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
