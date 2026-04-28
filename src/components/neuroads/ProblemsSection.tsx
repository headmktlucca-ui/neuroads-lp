'use client';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH2 = motion.h2;

const problems = [
  {
    icon: '💸',
    q: '"Invisto em anúncios todo mês, mas não sei se está dando resultado de verdade."',
    a: 'O dinheiro sai, os números do painel parecem bons, mas as vendas não batem. Isso acontece quando campanhas não têm rastreamento correto nem otimização contínua.',
    sol: 'Campanhas Inteligentes'
  },
  {
    icon: '🔍',
    q: '"Meu concorrente aparece no Google. Eu não. E agora tem essa tal IA de busca..."',
    a: 'A visibilidade mudou. Além do Google convencional, o ChatGPT e Gemini já respondem perguntas dos seus clientes. Se você não está lá, você não existe.',
    sol: 'SEO + GEO'
  },
  {
    icon: '⏳',
    q: '"Minha equipe perde horas com follow-up e tarefas que poderiam ser automáticas."',
    a: 'Cada hora que um vendedor passa respondendo FAQ é uma hora que ele não está vendendo. A IA libera seu time para o que realmente importa: fechar negócios.',
    sol: 'Agentes de IA'
  },
  {
    icon: '🧩',
    q: '"Tenho agência de tráfego, SEO e tecnologia que não conversam entre si."',
    a: 'Quando cada fornecedor defende seu território, ninguém é responsável pela sua receita. Uma estratégia integrada de IA e Performance muda tudo.',
    sol: 'NeuroAds 360'
  }
];

export default function ProblemsSection() {
  const fadeUp: any = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: "circOut" }
  };

  return (
    <section className="py-24 lg:py-32 bg-white" id="problemas">
      <div className="wrap">
        <div className="max-w-[800px]">
          <MotionP {...fadeUp} className="s-badge">O diagnóstico</MotionP>
          <MotionH2 {...fadeUp} transition={{ delay: 0.1 }} className="s-title text-balance">
            Desafios comuns que impedem a sua <span className="text-primary">Escala</span> Real
          </MotionH2>
          <MotionP {...fadeUp} transition={{ delay: 0.2 }} className="s-body">
            Depois de analisar centenas de PMEs, identificamos os gargalos que mais drenam lucro e tempo. Reconhece algum deles?
          </MotionP>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 mt-16 border border-white rounded-2xl overflow-hidden bg-border gap-px shadow-sm">
          {problems.map((p, i) => (
            <MotionDiv 
              key={i} 
              {...fadeUp}
              transition={{ delay: 0.3 + (i * 0.1) }}
              className="bg-white p-10 lg:p-14 group hover:bg-bg-secondary/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-bg-secondary flex items-center justify-center text-2xl mb-8 group-hover:scale-110 transition-transform">
                {p.icon}
              </div>
              <h3 className="text-xl font-bold text-text-main mb-4 leading-tight">
                {p.q}
              </h3>
              <p className="text-text-muted mb-8 text-[15px] leading-relaxed">
                {p.a}
              </p>
              <div className="flex items-center gap-2 text-[11px] font-bold text-primary uppercase tracking-widest border border-primary/10 bg-primary/5 px-4 py-2 rounded-full w-fit">
                <span>→</span> Solução: {p.sol}
              </div>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}
