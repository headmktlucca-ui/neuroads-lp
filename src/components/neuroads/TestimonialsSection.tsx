'use client';
import { motion } from 'framer-motion';

const testimonials = [
  {
    stars: '★★★★★',
    text: '"Claudio é um profissional com grande entendimento técnico. Trouxe muitos leads qualificados e ajudou na expansão da empresa. A diferença foi brutal, e o que mais valorizo é a comunicação estratégica e direta."',
    author: 'Carlos Eduardo',
    role: 'CEO — Soluções Regulatórias'
  },
  {
    stars: '★★★★★',
    text: '"Eu tinha tentado outras agências. Com a NeuroAds foi diferente — o Claudio olhou de verdade para o meu negócio. Hoje tenho clareza total do que está sendo feito e os resultados aparecem todo mês."',
    author: 'Ana Paula',
    role: 'Diretora Comercial — B2B Digital'
  },
  {
    stars: '★★★★★',
    text: '"A integração entre anúncios e agentes de IA surpreendeu. Nossa equipe de vendas passou a receber leads muito mais quentes — e o tempo de resposta caiu drasticamente. Marketing e comercial unidos."',
    author: 'Rodrigo Motta',
    role: 'Sócio — Serviços de Engenharia'
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
    <section className="bg-bg-base py-24 lg:py-32 relative border-b border-white/5">
      <div className="max-w-[1160px] mx-auto px-10 relative z-10">
        <motion.p {...fadeUp} className="flex items-center gap-3 text-[0.68rem] font-bold tracking-[0.2em] uppercase text-blue-2 mb-4">
          <span className="w-5 h-[2px] bg-grad-main rounded-full" />
          Provas de Performance
        </motion.p>
        
        <motion.h2 {...fadeUp} transition={{ delay: 0.1 }} className="font-head text-[clamp(2rem,3.2vw,3.2rem)] font-extrabold leading-[1.1] tracking-tight text-text-1 mb-16">
          Empresas que <span className="bg-grad-main bg-clip-text text-transparent italic">escalaram</span><br />com a nossa inteligência.
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div 
              key={i} 
              {...fadeUp}
              transition={{ delay: 0.1 * i + 0.3 }}
              className="bg-bg-card border border-white/10 p-10 rounded-3xl relative hover:bg-bg-card-h transition-colors"
            >
              <div className="text-blue-1 text-[0.8rem] tracking-[0.1em] mb-6">{t.stars}</div>
              <p className="font-head text-[1rem] text-text-2 leading-relaxed italic font-medium mb-10">
                {t.text}
              </p>
              <div className="font-head font-bold text-[0.9rem] text-text-1">{t.author}</div>
              <div className="text-[0.75rem] text-text-4 mt-1 font-bold tracking-wide uppercase">{t.role}</div>

              {/* Decorative quote mark */}
              <div className="absolute top-8 right-8 text-[3rem] font-serif leading-none text-white/[0.03] pointer-events-none select-none">
                ”
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
