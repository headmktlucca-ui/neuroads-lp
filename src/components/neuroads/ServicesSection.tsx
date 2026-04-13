'use client';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH2 = motion.h2;

const services = [
  {
    id: '01',
    tag: 'Performance',
    title: 'Campanhas Patrocinadas de Alta Performance',
    desc: 'Google Ads e Meta Ads gerenciados com a plataforma Lucca — análise contínua, criativos validados por dados e foco total no custo por aquisição ideal para o seu negócio.',
    items: [
      'Gestão estratégica de Google Ads e Meta Ads',
      'Otimização de lances e orçamento em tempo real',
      'Criativos e copies gerados e testados com IA',
      'Rastreamento server-side (100% das conversões)',
      'Relatórios com foco em ROI, não em métricas de vaidade',
      'Simulação de ROAS antes de escalar o investimento'
    ]
  },
  {
    id: '02',
    tag: 'Visibilidade',
    title: 'SEO Estratégico + GEO — Apareça no Google e na IA',
    desc: 'Posicionamento nos resultados orgânicos do Google (SEO) e nas respostas geradas por IA como ChatGPT, Gemini e Perplexity (GEO). Em 2026, quem não está nos dois é invisível para metade do mercado.',
    items: [
      'SEO técnico e de conteúdo para buscas orgânicas',
      'GEO: posicionamento nas respostas de IA generativa',
      'Estruturação do site para AI Overviews do Google',
      'Estratégia de conteúdo que atrai e converte',
      'Monitoramento da presença da sua marca na IA',
      'Integração com as campanhas pagas para maximizar ROI'
    ]
  },
  {
    id: '03',
    tag: 'Operação',
    title: 'Agentes de IA no Seu Operacional Comercial',
    desc: 'Identificamos onde sua operação perde tempo e dinheiro, e implantamos agentes de IA personalizados que resolvem esse gargalo — do primeiro contato ao fechamento.',
    items: [
      'Diagnóstico do gargalo operacional comercial',
      'Agente de qualificação de leads 24h por dia',
      'Automação de follow-up e nutrição de pipeline',
      'Integração com CRM e ferramentas existentes',
      'Atendimento automático via WhatsApp e site',
      'Treinamento da equipe para trabalhar com IA'
    ]
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
    <section className="section bg-white/[0.02] border-y border-white/10" id="servicos">
      <div className="wrap py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-end mb-14">
          <div>
            <MotionP {...fadeUp} className="s-badge">O que fazemos</MotionP>
            <MotionH2 {...fadeUp} transition={{ delay: 0.1 }} className="s-title">
              Três soluções.<br /><span className="g">Uma estratégia.</span><br />Um responsável.
            </MotionH2>
          </div>
          <MotionP {...fadeUp} transition={{ delay: 0.2 }} className="s-body !mt-0 !max-w-none">
            Cada serviço da NeuroAds funciona sozinho — mas o poder real aparece quando os três trabalham juntos, alimentando um ao outro com dados e resultados.
          </MotionP>
        </div>

        <div className="space-y-5">
          {services.map((svc, i) => (
            <MotionDiv 
              key={i} 
              {...fadeUp}
              transition={{ delay: 0.3 + (i * 0.1) }}
              className="group bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden transition-all hover:border-blue-1/35 hover:shadow-[0_8px_48px_rgba(59,111,255,0.12)]"
            >
              <div className="p-8 lg:p-10 border-b border-white/10 bg-grad-card flex flex-col md:flex-row items-start gap-6 lg:gap-10">
                <div className="font-head text-[2.5rem] font-extrabold grad-text opacity-30 leading-none min-w-[48px] transition-opacity group-hover:opacity-100">
                  {svc.id}
                </div>
                <div>
                  <div className="mb-2"><span className="tag">{svc.tag}</span></div>
                  <h3 className="font-head text-[1.15rem] font-bold text-text-1 mb-2 leading-tight transition-colors">
                    {svc.title}
                  </h3>
                  <p className="text-[0.835rem] text-text-3 font-light leading-relaxed max-w-[700px]">
                    {svc.desc}
                  </p>
                </div>
              </div>
              <div className="p-8 lg:p-10 grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-10">
                {svc.items.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-[0.82rem] text-text-2 leading-relaxed">
                    <div className="w-4 h-4 rounded-full bg-green-s/[0.12] border border-green-s/[0.25] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[0.6rem] font-extrabold text-green-s">✓</span>
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </MotionDiv>
          ))}
        </div>
      </div>
    </section>
  );
}
