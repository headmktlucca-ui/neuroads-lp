'use client';
import { motion } from 'framer-motion';

const problems = [
  {
    num: '01',
    q: '"Invisto em anúncios, mas não sei o que volta."',
    a: 'O dinheiro sai, o painel do Meta parece bom, mas no final do mês você não sabe qual real investido gerou qual venda. Falta integração e transparência nos dados.',
    tag: 'Solução: Campanhas com Lucca'
  },
  {
    num: '02',
    q: '"Meus concorrentes aparecem no Google. Eu não."',
    a: 'E agora nem é só o Google. ChatGPT e outras IAs de busca já respondem seus clientes. Se sua marca não está nas respostas, você está fora de metade do mercado digital.',
    tag: 'Solução: SEO + GEO'
  },
  {
    num: '03',
    q: '"Minha equipe comercial perde tempo com leads ruins."',
    a: 'Vendedores qualificados perdendo horas em follow-up de curiosos. A IA pode filtrar, qualificar e até agendar reuniões, liberando seu time para fechar negócio.',
    tag: 'Solução: Agentes de IA'
  },
  {
    num: '04',
    q: '"Ninguém conversa com ninguém na minha estratégia."',
    a: 'Tráfego pago num lado, conteúdo no outro, CRM no terceiro. Quando as pontas não se unem, o resultado é ineficiência e desperdício de verba.',
    tag: 'Solução: NeuroAds 3 em 1'
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
    <section className="bg-bg-base py-24 lg:py-32 relative border-b border-white/5">
      <div className="max-w-[1160px] mx-auto px-10">
        <motion.p {...fadeUp} className="flex items-center gap-3 text-[0.68rem] font-bold tracking-[0.2em] uppercase text-blue-2 mb-4">
          <span className="w-5 h-[2px] bg-grad-main rounded-full" />
          O que ouço todo dia
        </motion.p>
        
        <motion.h2 {...fadeUp} transition={{ delay: 0.1 }} className="font-head text-[clamp(2.2rem,3.5vw,3.5rem)] font-extrabold leading-[1.1] tracking-tight text-text-1 max-w-[800px]">
          Fases comuns de <span className="bg-grad-main bg-clip-text text-transparent italic">estagnação digital</span> em PMEs
        </motion.h2>

        <motion.p {...fadeUp} transition={{ delay: 0.2 }} className="text-[1rem] text-text-3 font-light leading-relaxed max-w-[540px] mt-6">
          Depois de trabalhar com centenas de empresas, percebi que os gargalos costumam ser os mesmos. Algum destes te impede de crescer hoje?
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-16">
          {problems.map((p, i) => (
            <motion.div 
              key={i} 
              {...fadeUp}
              transition={{ delay: 0.1 * i + 0.3 }}
              className="bg-bg-card border border-white/10 p-10 rounded-2xl hover:bg-bg-card-h hover:border-blue-1/40 transition-all group"
            >
              <div className="font-head text-[2.5rem] font-extrabold text-blue-1/20 group-hover:text-blue-1/40 transition-colors leading-none mb-6">
                {p.num}
              </div>
              <h3 className="font-head text-[1.15rem] font-bold text-text-1 mb-4 leading-relaxed group-hover:text-blue-2 transition-colors">
                {p.q}
              </h3>
              <p className="text-[0.9rem] text-text-2 leading-relaxed font-light mb-8">
                {p.a}
              </p>
              <div className="flex items-center gap-2 text-[0.7rem] font-bold text-blue-2 tracking-widest uppercase">
                <span className="w-4 h-px bg-blue-2" />
                {p.tag}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
