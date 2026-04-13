'use client';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const agents = [
  { title: 'Analista de Tráfego', desc: 'Diagnóstico neural de campanhas com tomada de decisão automática baseada em ROI.' },
  { title: 'Gerador de Criativos', desc: 'Criação de copies e conceitos visuais de alto impacto validados por padrões de conversão.' },
  { title: 'Gerador de Copies', desc: 'Motor rápido focado na geração expressa de headlines, CTAs e argumentos diretos.' },
  { title: 'Análise Viral', desc: 'Identificação de padrões de conteúdo com alto potencial de partilha e viralização.' },
  { title: 'Rastreador Cirúrgico', desc: 'Implementação de tracking Lado-Servidor para contornar bloqueios de cookies.' },
  { title: 'Preditor de Funil', desc: 'Simulação de cenários de escala e previsão de ROI antes de investir.' },
  { title: 'Diagnóstico de LP', desc: 'Análise de problemas de conversão, UX e clareza da oferta da página.' },
  { title: 'Simulador de ROAS', desc: 'Projeção de metas de faturação e cálculo de leads e investimento.' },
  { title: 'Analisador de Público', desc: 'Refinamento avançado com sugestões de segmentações prontas por nicho.' },
  { title: 'Diagnóstico de Funil', desc: 'Mapeamento visual de gargalos entre a navegação e a conversão.' },
  { title: 'Auditor de Desperdício', desc: 'Calculadora que isola gastos desnecessários na conta de anúncios.' },
  { title: 'Otimizador de Budget', desc: 'Redistribuição tática do orçamento, apontando onde cortar e alavancar.' },
  { title: 'Gerador de Testes A/B', desc: 'Roteirizador inteligente que projeta variações ideais de oferta e peças.' },
  { title: 'Avaliador de Oferta', desc: 'Varrimento sistémico na estruturação de preço-valor e diferenciação.' },
  { title: 'Radar de Oportunidades', desc: 'Deteção contínua de canais subestimados na sua vertical.' },
  { title: 'DNA da Marca', desc: 'Documento estratégico com posicionamento, tom de voz e pilares.' },
  { title: 'Análise de Rivais', desc: 'Varrimento profundo para identificar pontos cegos dos concorrentes.' },
  { title: 'Público-Alvo Ideal', desc: 'Pesquisa neural de segmentação e padrões de consumo social.' }
];

export default function ServicesSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Parallax effects for the rows - slightly increased for full-width impact
  const x1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const x2 = useTransform(scrollYProgress, [0, 1], [-150, 100]);
  const x3 = useTransform(scrollYProgress, [0, 1], [100, -150]);

  const row1 = agents.slice(0, 6);
  const row2 = agents.slice(6, 12);
  const row3 = agents.slice(12, 18);

  return (
    <section 
      ref={containerRef}
      className="py-24 lg:py-32 bg-cream relative overflow-hidden flex flex-col items-center" 
      id="servicos"
    >
      {/* Blueprint Grid Background - Softened */}
      <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} 
      />

      {/* Centralized Header Container */}
      <div className="max-w-[1160px] mx-auto px-10 relative z-10 w-full text-center mb-20 lg:mb-28">
        <div className="flex flex-col items-center max-w-[850px] mx-auto">
          <p className="flex items-center gap-[0.65rem] text-[0.68rem] font-semibold tracking-[0.22em] uppercase text-green-brand mb-6 reveal">
            <span className="w-[18px] h-[1.5px] bg-green-brand" />
            Neural Infrastructure
            <span className="w-[18px] h-[1.5px] bg-green-brand" />
          </p>
          <h2 className="font-serif text-[3.2rem] lg:text-[4.2rem] font-bold leading-[1] tracking-[-0.02em] text-ink mb-8 reveal">
            O Ecossistema de <em className="italic text-green-brand font-medium tracking-tight">Agentes.</em>
          </h2>
          <p className="text-[1.1rem] text-ink2 font-light leading-[1.8] reveal max-w-[700px]">
            Nossa tecnologia não é uma ferramenta estática. É um array de 18 inteligências especializadas que agem em rede para diagnosticar, prever e otimizar cada dólar investido.
          </p>
          
          <div className="mt-12 w-full max-w-[400px] reveal d1">
            <div className="flex items-center justify-between text-ink3 mb-3 px-1">
              <span className="text-[0.65rem] uppercase tracking-widest font-bold opacity-60">Status: Operacional</span>
              <div className="flex items-center gap-3">
                <span className="text-[1.8rem] font-serif italic text-green-brand leading-none">18</span>
                <span className="text-[0.65rem] uppercase tracking-wider font-bold opacity-60">Agentes Ativos</span>
              </div>
            </div>
            <div className="w-full h-[1px] bg-black/5 relative overflow-hidden">
              <motion.div 
                className="absolute inset-0 bg-green-brand"
                initial={{ x: "-100%" }}
                whileInView={{ x: "0%" }}
                transition={{ duration: 1.5, ease: "circOut" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Agents Array */}
      <div className="w-full relative z-10 flex flex-col gap-8 lg:gap-14 overflow-hidden py-4">
        {/* Row 1 */}
        <motion.div style={{ x: x1 }} className="flex gap-6 lg:gap-12 px-10">
          {row1.map((agent, i) => (
            <AgentCard key={i} agent={agent} index={i + 1} />
          ))}
          {/* Duplicate for visual overflow safety */}
          {row1.map((agent, i) => (
            <AgentCard key={`dup-${i}`} agent={agent} index={i + 1} />
          ))}
        </motion.div>

        {/* Row 2 */}
        <motion.div style={{ x: x2 }} className="flex gap-6 lg:gap-12 px-10 ml-[-200px]">
          {row2.map((agent, i) => (
            <AgentCard key={i+6} agent={agent} index={i + 7} />
          ))}
          {row2.map((agent, i) => (
            <AgentCard key={`dup-${i+6}`} agent={agent} index={i + 7} />
          ))}
        </motion.div>

        {/* Row 3 */}
        <motion.div style={{ x: x3 }} className="flex gap-6 lg:gap-12 px-10 ml-[100px]">
          {row3.map((agent, i) => (
            <AgentCard key={i+12} agent={agent} index={i + 13} />
          ))}
          {row3.map((agent, i) => (
            <AgentCard key={`dup-${i+12}`} agent={agent} index={i + 13} />
          ))}
        </motion.div>
      </div>

      {/* Interactive Hint */}
      <div className="mt-16 text-center reveal d2">
        <p className="text-[0.65rem] uppercase tracking-[0.2em] font-bold text-ink3/40 animate-pulse">
          ← Deslize lateralmente para explorar o ecossistema →
        </p>
      </div>
    </section>
  );
}

function AgentCard({ agent, index }: { agent: any, index: number }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02, rotateY: 5, rotateX: -5 }}
      style={{ perspective: 1000 }}
      className="flex-shrink-0 w-[280px] lg:w-[340px] h-[220px] lg:h-[260px] bg-white border border-black/[0.08] p-8 lg:p-10 relative overflow-hidden group/card shadow-[0_2px_10px_rgba(0,0,0,0.01)] hover:shadow-[0_20px_60px_rgba(22,15,8,0.08)] transition-all duration-500"
    >
      {/* Grid Pattern Inside Card */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none group-hover/card:opacity-[0.05] transition-opacity" 
        style={{ 
          backgroundImage: `radial-gradient(#000 1px, transparent 1px)`,
          backgroundSize: '15px 15px'
        }} 
      />

      {/* Large Watermark Number */}
      <div className="absolute -bottom-4 -right-4 font-serif text-[7.5rem] lg:text-[9rem] font-bold text-black/[0.02] leading-none pointer-events-none group-hover/card:text-green-brand/5 transition-colors duration-500 italic">
        {index.toString().padStart(2, '0')}
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="mb-auto">
          <div className="w-10 h-[1.5px] bg-green-brand/30 mb-6 group-hover/card:w-full transition-all duration-700" />
          <h3 className="font-serif text-[1.2rem] lg:text-[1.4rem] font-bold text-ink leading-[1.2] mb-4 group-hover/card:text-green-brand transition-colors">
            {agent.title}
          </h3>
          <p className="text-[0.8rem] lg:text-[0.85rem] text-ink2 font-light leading-relaxed">
            {agent.desc}
          </p>
        </div>
        
        <div className="flex items-center justify-between text-[0.6rem] font-bold tracking-widest text-ink3/30 uppercase mt-4">
          <span>Agent_Proc_0{index}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-green-brand/40 animate-pulse" />
        </div>
      </div>

      {/* Grain Overlay Effect */}
      <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
    </motion.div>
  );
}
