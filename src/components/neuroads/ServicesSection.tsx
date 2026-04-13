'use client';
import { motion } from 'framer-motion';

const services = [
  {
    num: '01',
    title: 'Campanhas de Alta Performance',
    desc: 'Gestão de tráfego pago no Google e Meta Ads com foco total em ROI. Utilizamos o ecossistema Lucca para monitorar cada conversão e otimizar seu investimento em tempo real.',
    items: ['Dashboard Exclusivo (Lucca)', 'Rastreamento Server-Side', 'Otimização Diária de ROI'],
    grad: 'from-blue-1/20 to-blue-2/05'
  },
  {
    num: '02',
    title: 'Posicionamento SEO & GEO',
    desc: 'Sua marca visível onde as decisões são tomadas. Dominamos o Google tradicional e as novas IAs de busca (ChatGPT, Gemini, Perplexity) para que você seja a resposta número 1.',
    items: ['SEO Técnico Avançado', 'Otimização para IAs (GEO)', 'Autoridade de Domínio'],
    grad: 'from-violet-1/20 to-violet-2/05'
  },
  {
    num: '03',
    title: 'Agentes de Automação IA',
    desc: 'Escalamos seu atendimento comercial sem aumentar sua folha de pagamento. Implementamos agentes inteligentes que qualificam leads e agendam reuniões 24h por dia.',
    items: ['Qualificação de Leads IA', 'Agendamento Automático', 'Integração com CRM'],
    grad: 'from-cyan-1/20 to-blue-1/05'
  }
];

export default function ServicesSection() {
  const fadeUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.7 }
  };

  return (
    <section className="bg-[#05060F] py-24 lg:py-32 relative overflow-hidden" id="servicos">
      {/* Glow highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-grad-glow blur-[120px] opacity-20 pointer-events-none" />

      <div className="max-w-[1160px] mx-auto px-10 relative z-10">
        <div className="text-center max-w-[800px] mx-auto mb-20 lg:mb-28">
          <motion.p {...fadeUp} className="flex items-center justify-center gap-3 text-[0.68rem] font-bold tracking-[0.2em] uppercase text-blue-2 mb-4">
            <span className="w-5 h-[2px] bg-grad-main rounded-full" />
            Nossa Entrega
            <span className="w-5 h-[2px] bg-grad-main rounded-full" />
          </motion.p>
          <motion.h2 {...fadeUp} transition={{ delay: 0.1 }} className="font-head text-[clamp(2.5rem,4vw,4rem)] font-extrabold leading-[1.05] tracking-tight text-text-1">
            Três pilares para sua<br />
            <span className="bg-grad-main bg-clip-text text-transparent italic">escala acelerada.</span>
          </motion.h2>
          <motion.p {...fadeUp} transition={{ delay: 0.2 }} className="text-[1.1rem] text-text-3 font-light leading-relaxed mt-7 mx-auto max-w-[600px]">
            Unimos o melhor do tráfego pago, autoridade orgânica e automação operacional em um sistema único.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <motion.div 
              key={i}
              {...fadeUp}
              transition={{ delay: 0.1 * i + 0.3 }}
              className={`bg-bg-card border border-white/10 rounded-3xl p-10 flex flex-col h-full hover:bg-bg-card-h hover:border-white/20 transition-all group relative overflow-hidden`}
            >
              {/* Card gradient glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${s.grad} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="font-head text-[2.8rem] font-extrabold text-blue-1/10 mb-8 leading-none relative z-10">
                {s.num}
              </div>
              <h3 className="font-head text-[1.4rem] font-extrabold text-text-1 mb-5 leading-tight group-hover:text-blue-2 transition-colors relative z-10">
                {s.title}
              </h3>
              <p className="text-[0.9rem] text-text-3 font-light leading-relaxed mb-10 relative z-10">
                {s.desc}
              </p>
              
              <ul className="mt-auto space-y-4 relative z-10">
                {s.items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-[0.8rem] text-text-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-1" />
                    {item}
                  </li>
                ))}
              </ul>

              {/* Bottom line glow */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-grad-main opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0 duration-500" />
            </motion.div>
          ))}
        </div>

        <motion.div {...fadeUp} transition={{ delay: 0.8 }} className="mt-20 text-center">
          <p className="text-[0.85rem] text-text-3 opacity-60">
            Cada solução é integrada ao seu ecossistema comercial existente.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
