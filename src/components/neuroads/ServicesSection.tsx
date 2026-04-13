'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';

const MotionDiv = motion.div;
const MotionP = motion.p;
const MotionH2 = motion.h2;

const agentCategories = [
  {
    name: 'Performance & Criativos',
    agents: [
      { 
        title: 'Analista de Tráfego', 
        desc: 'Diagnóstico neural de campanhas com tomada de decisão automática baseada em ROI.',
        image: '/images/tools/analista_trafego.png' 
      },
      { 
        title: 'Gerador de Criativos', 
        desc: 'Criação de copies e conceitos visuais de alto impacto validados por padrões de conversão.',
        image: '/images/tools/gerador_criativos.png' 
      },
      { 
        title: 'Gerador de Copies', 
        desc: 'Motor rápido focado na geração expressa de headlines, CTAs chamativos e argumentos diretos.',
        image: '/images/tools/gerador_copies.png' 
      },
      { 
        title: 'Análise Viral', 
        desc: 'Identificação de padrões de conteúdo com alto potencial de partilha e viralização no nicho.',
        image: '/images/tools/analise_viral.png' 
      },
    ]
  },
  {
    name: 'Estratégia & Projeção',
    agents: [
      { 
        title: 'Preditor de Funil', 
        desc: 'Simulação de cenários de escala e previsão de ROI antes de investir.',
        image: '/images/tools/preditor_funil.png' 
      },
      { 
        title: 'Simulador de ROAS', 
        desc: 'Projeção de metas de faturação e cálculo de leads e investimento necessários.',
        image: '/images/tools/simulador_roas.png' 
      },
      { 
        title: 'Otimizador de Orçamento', 
        desc: 'Redistribuição tática do orçamento, apontando onde cortar e onde alavancar.',
        image: '/images/tools/otimizacao.png' 
      },
      { 
        title: 'Gerador de Testes A/B', 
        desc: 'Roteirizador inteligente que projeta variações ideais de público, oferta e peças gráficas.',
        image: '/images/tools/testes.png' 
      },
      { 
        title: 'Avaliador de Oferta', 
        desc: 'Varrimento sistémico na estruturação de preço-valor e análise de lacunas de diferenciação.',
        image: '/images/tools/analise.png' 
      },
    ]
  },
  {
    name: 'Técnico & Auditoria',
    agents: [
      { 
        title: 'Rastreador Cirúrgico', 
        desc: 'Implementação de tracking Lado-Servidor para contornar bloqueios de cookies e iOS14+.',
        image: '/images/tools/rastreador_cirurgico.png' 
      },
      { 
        title: 'Diagnóstico de LP', 
        desc: 'Análise de problemas de conversão, UX (experiência do utilizador) e clareza da oferta.',
        image: '/images/tools/diagnostico_lp.png' 
      },
      { 
        title: 'Diagnóstico de Funil', 
        desc: 'Mapeamento visual de gargalos entre a navegação, o clique e a conversão.',
        image: '/images/tools/diagnostico_funil.png' 
      },
      { 
        title: 'Auditor de Desperdício', 
        desc: 'Calculadora que faz o varrimento da conta para isolar gastos desnecessários.',
        image: '/images/tools/auditor_desperdicio.png' 
      },
    ]
  },
  {
    name: 'Inteligência de Mercado',
    agents: [
      { 
        title: 'Analisador de Público', 
        desc: 'Refinamento avançado com sugestões de segmentações prontas por nicho e produto.',
        image: '/images/tools/analisador_publico.png' 
      },
      { 
        title: 'Público-Alvo Ideal', 
        desc: 'Pesquisa neural de segmentação, identificando o que o público consome e como interage.',
        image: '/images/tools/publico_ideal.png' 
      },
      { 
        title: 'Análise de Rivais', 
        desc: 'Varrimento profundo via URL para identificar estratégias e pontos cegos dos concorrentes.',
        image: '/images/tools/concorrentes.png' 
      },
      { 
        title: 'Radar de Oportunidades', 
        desc: 'Deteção contínua de canais subestimados na sua vertical de mercado.',
        image: '/images/tools/mineracao.png' 
      },
      { 
        title: 'DNA da Marca', 
        desc: 'Documento estratégico completo com posicionamento, tom de voz e pilares da marca.',
        image: '/images/tools/dna_marca.png' 
      },
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
    <section className="section bg-white/[0.01] border-y border-white/10" id="servicos">
      <div className="wrap py-24 lg:py-32">
        
        {/* HEADER */}
        <div className="text-center mb-16 lg:mb-24">
          <MotionP {...fadeUp} className="s-badge mx-auto">Arsenal de Agentes Neurais</MotionP>
          <MotionH2 {...fadeUp} transition={{ delay: 0.1 }} className="s-title mx-auto text-balance mt-4">
            Tecnologia sistêmica.<br />
            <span className="g">Resultado humano.</span>
          </MotionH2>
          <MotionP {...fadeUp} transition={{ delay: 0.2 }} className="text-text-3 max-w-[600px] mx-auto mt-6 font-light">
            Não entregamos apenas serviços. Implantamos um ecossistema de agentes inteligentes que operam 24/7 para otimizar cada etapa do seu funil comercial.
          </MotionP>
        </div>

        {/* CATEGORIES GRID */}
        <div className="space-y-20">
          {agentCategories.map((cat, catIdx) => (
            <div key={catIdx}>
              <MotionH2 
                {...fadeUp} 
                className="text-[0.72rem] font-black tracking-[0.2em] uppercase text-text-4 mb-10 flex items-center gap-4"
              >
                <span className="w-8 h-px bg-white/10" />
                {cat.name}
              </MotionH2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {cat.agents.map((agent, i) => (
                  <MotionDiv
                    key={i}
                    {...fadeUp}
                    transition={{ delay: 0.1 * i }}
                    className="group relative bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 hover:bg-white/[0.05] hover:border-blue-1/30 transition-all duration-300 overflow-hidden"
                  >
                    <div className="flex items-start gap-4 h-full">
                      <div className="w-14 h-14 rounded-lg bg-white/[0.05] border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 relative group-hover:border-blue-1/50 transition-all">
                        <Image 
                          src={agent.image} 
                          alt={agent.title}
                          fill
                          className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                        />
                      </div>
                      <div className="flex flex-col">
                        <h3 className="font-head text-[0.95rem] font-bold text-text-1 mb-2 group-hover:text-blue-1 transition-colors leading-tight">
                          {agent.title}
                        </h3>
                        <p className="text-[0.78rem] text-text-3 font-light leading-relaxed">
                          {agent.desc}
                        </p>
                      </div>
                    </div>
                  </MotionDiv>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM CTA */}
        <MotionDiv 
          {...fadeUp} 
          transition={{ delay: 0.4 }}
          className="mt-24 p-10 bg-grad-card border border-blue-1/20 rounded-2xl text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-1/5 blur-[100px] -z-10" />
          <h3 className="font-head text-[1.4rem] font-bold text-text-1 mb-4">
            Qual desses agentes sua operação precisa agora?
          </h3>
          <p className="text-text-3 text-[0.9rem] mb-8 font-light max-w-[500px] mx-auto">
            Agende um diagnóstico gratuito e vamos identificar qual gargalo podemos resolver primeiro.
          </p>
          <a href="#contato" className="btn btn-primary">
            Falar com o Claudio Müller →
          </a>
        </MotionDiv>

      </div>
    </section>
  );
}
