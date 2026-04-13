'use client';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH2 = motion.h2;

const problems = [
  {
    icon: '💸',
    q: '"Invisto em anúncios todo mês, mas não sei se está dando resultado de verdade."',
    a: 'O dinheiro sai, os números do painel parecem bons, mas as vendas não batem. Isso acontece quando campanhas não têm rastreamento correto nem otimização contínua orientada por dados reais.',
    sol: 'Campanhas com Lucca'
  },
  {
    icon: '🔍',
    q: '"Meu concorrente aparece no Google. Eu não. E agora tem essa tal IA de busca..."',
    a: 'A visibilidade mudou. Além do Google, o ChatGPT, Gemini e Perplexity já respondem perguntas dos seus clientes sem mostrar links. Se você não está nessas respostas, é invisível para metade do mercado.',
    sol: 'SEO + GEO'
  },
  {
    icon: '⏳',
    q: '"Minha equipe perde horas com follow-up e tarefas que poderiam ser automáticas."',
    a: 'Cada hora que um vendedor passa respondendo FAQ ou preenchendo planilha é uma hora que ele não está fechando venda. A IA não substitui sua equipe — ela libera as pessoas para o que importa.',
    sol: 'Agentes de IA'
  },
  {
    icon: '🧩',
    q: '"Tenho agência de tráfego, SEO e um cara de tecnologia que não conversam."',
    a: 'Quando cada fornecedor defende seu território, o resultado são dados contraditórios e ninguém responsável pelo único número que importa: sua receita. Uma estratégia integrada muda tudo.',
    sol: 'NeuroAds 3 em 1'
  }
];

export default function ProblemsSection() {
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7 }
  };

  return (
    <section className="section py-24 lg:py-32 scroll-mt-24" id="problemas">
      <div className="wrap">
        <MotionP {...fadeUp} className="s-badge">O diagnóstico</MotionP>
        <MotionH2 {...fadeUp} transition={{ delay: 0.1 }} className="s-title text-balance max-w-[800px]">
          Quatro situações que vejo<br />
          todo dia em empresas <span className="g">como a sua</span>
        </MotionH2>
        <MotionP {...fadeUp} transition={{ delay: 0.2 }} className="s-body">
          Depois de trabalhar com centenas de PMEs, os problemas se repetem. Veja se algum te parece familiar.
        </MotionP>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-12">
          {problems.map((p, i) => (
            <MotionDiv 
              key={i} 
              {...fadeUp}
              transition={{ delay: 0.3 + (i * 0.1) }}
              className="group relative bg-white/[0.04] border border-white/[0.08] rounded-lg p-7 transition-all hover:border-blue-1/35 hover:-translate-y-1 overflow-hidden"
            >
              {/* Card top border glow effect */}
              <div className="absolute inset-0 bg-grad-card opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="w-11 h-11 rounded-sm bg-blue-1/12 border border-blue-1/35 flex items-center justify-center text-[1.1rem] mb-5">
                  {p.icon}
                </div>
                <h3 className="font-head text-[0.95rem] font-bold text-text-1 mb-2.5 leading-tight">
                  {p.q}
                </h3>
                <p className="text-[0.835rem] text-text-3 font-light leading-relaxed">
                  {p.a}
                </p>
                <div className="inline-flex items-center gap-1.5 mt-4 text-[0.7rem] font-semibold text-blue-2 tracking-[0.08em] uppercase">
                  <span className="text-[0.75rem]">→</span> Solução: {p.sol}
                </div>
              </div>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}
