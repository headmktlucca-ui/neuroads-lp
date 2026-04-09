'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import TrafficAnalystContainer, { ActiveAppConfig } from '@/components/traffic-analyst/TrafficAnalystContainer';

export default function ToolGallery() {
  const [activeApp, setActiveApp] = useState<ActiveAppConfig | null>(null);

  const tools = [
    {
      title: 'Analista de Tráfego',
      description: 'Diagnóstico neural de campanhas com tomada de decisão automática baseada em ROI.',
      icon: '/images/tools/analista_trafego.png',
      status: 'DISPONÍVEL',
      link: '#analista',
      color: 'var(--color-brand-orange)'
    },
    {
      title: 'Rastreador Cirúrgico',
      description: 'Implementação de tracking Lado-Servidor para ignorar bloqueios de cookies e iOS14+.',
      icon: '/images/tools/rastreador_cirurgico.png',
      status: 'EM BREVE',
      link: '#',
      color: 'slate-500'
    },
    {
      title: 'Gerador de Criativos',
      description: 'Criação de copies e conceitos visuais de alto impacto validados por padrões de conversão.',
      icon: '/images/tools/gerador_criativos.png',
      status: 'EM BREVE',
      link: '#',
      color: 'slate-500'
    },
    {
      title: 'Preditor de Funil',
      description: 'Simulação de cenários de escala e previsão de ROI antes mesmo de investir o primeiro real.',
      icon: '/images/tools/preditor_funil.png',
      status: 'EM BREVE',
      link: '#',
      color: 'slate-500'
    },
    {
      title: 'Diagnóstico de Landing Page',
      description: 'Análise de problemas de conversão, UX e clareza da oferta da sua página final.',
      icon: '/images/tools/diagnostico_lp.png',
      status: 'EM BREVE',
      link: '#',
      color: 'slate-500'
    },
    {
      title: 'Simulador de ROAS',
      description: 'Projete sua meta de faturamento e descubra quantos leads e investimento precisará alocar.',
      icon: '/images/tools/simulador_roas.png',
      status: 'EM BREVE',
      link: '#',
      color: 'slate-500'
    },
    {
      title: 'Analisador de Público',
      description: 'Refinamento avançado com sugestões de segmentações prontas por nicho, produto e ticket.',
      icon: '/images/tools/analisador_publico.png',
      status: 'EM BREVE',
      link: '#',
      color: 'slate-500'
    },
    {
      title: 'Diagnóstico de Funil',
      description: 'Mapeamento visual do seu gargalo identificando as quebras entre navegação, clique e conversão.',
      icon: '/images/tools/diagnostico_funil.png',
      status: 'EM BREVE',
      link: '#',
      color: 'slate-500'
    },
    {
      title: 'Gerador de Copies de Conversão',
      description: 'Motor rápido focado na geração expressa de headlines, CTAs chamativos e argumentos diretos.',
      icon: '/images/tools/gerador_copies.png',
      status: 'EM BREVE',
      link: '#',
      color: 'slate-500'
    },
    {
      title: 'Auditor de Desperdício',
      description: 'Calculadora que escaneia a conta isolando gastos desnecessários que não revertem em vendas.',
      icon: '/images/tools/auditor_desperdicio.png',
      status: 'EM BREVE',
      link: '#',
      color: 'slate-500'
    },
    {
      title: 'Otimizador de Orçamento',
      description: 'Redistribuição tática do seu budget, apontando matematicamente onde cortar e onde alavancar.',
      icon: '/images/tools/alocacao.png',
      status: 'EM BREVE',
      link: '#',
      color: 'slate-500'
    },
    {
      title: 'Gerador de Testes A/B',
      description: 'Roteirizador inteligente que projeta variações ideais de público, oferta e peças gráficas.',
      icon: '/images/tools/testes.png',
      status: 'EM BREVE',
      link: '#',
      color: 'slate-500'
    },
    {
      title: 'Avaliador de Oferta',
      description: 'Varredura sistêmica na sua estruturação de preço-valor e análise de gap de diferenciação.',
      icon: '/images/tools/mineracao.png',
      status: 'EM BREVE',
      link: '#',
      color: 'slate-500'
    },
    {
      title: 'Radar de Oportunidades',
      description: 'Detecção contínua de canais subestimados e oceano azul de conversão na sua vertical.',
      icon: '/images/tools/analise.png',
      status: 'EM BREVE',
      link: '#',
      color: 'slate-500'
    }
  ];

  return (
    <section className="py-24 bg-black relative overflow-hidden shadow-[0_-20px_50px_rgba(249,166,32,0.05),0_20px_50px_rgba(204,255,0,0.05)]">
      {/* Creative Background Layout */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_50%,#000_30%,transparent_100%)]"></div>
        {/* Soft edge fade using gradient to blend with surrounding black sections */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Ambient glowing orbs behind apps */}
      <div className="absolute top-1/2 left-[15%] w-[600px] h-[600px] bg-[var(--color-brand-orange)]/20 blur-[150px] rounded-full pointer-events-none -translate-y-1/2" />
      <div className="absolute top-1/2 right-[15%] w-[600px] h-[600px] bg-[var(--color-brand-green)]/20 blur-[150px] rounded-full pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight uppercase">
              Hub <br />
              <span className="text-[var(--color-brand-orange)]">Estratégico</span>
            </h2>
            <p className="text-slate-400 font-light leading-relaxed">
              Ative as engrenagens certas e escale sua operação.
            </p>
          </div>
          <div className="font-mono text-[10px] text-slate-600 tracking-[0.2em] hidden md:block">
            NEUROADS_SYSTEMS_CORE_v4.0.2
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool, index) => {
            const isSoon = tool.status === 'EM BREVE';
            return (
              <motion.div
                key={tool.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`glass-card p-8 transition-all duration-300 flex flex-col min-h-[320px] relative overflow-hidden ${
                  isSoon
                    ? 'opacity-70 cursor-not-allowed'
                    : `group cursor-pointer hover:border-[var(--color-brand-orange)]/50 hover:-translate-y-2 hover:shadow-[0_0_30px_rgba(249,166,32,0.1)] ${activeApp?.title === tool.title ? 'border-[var(--color-brand-orange)]/50 shadow-[0_0_30px_rgba(249,166,32,0.1)] -translate-y-2' : ''}`
                }`}
                onClick={() => {
                  if (!isSoon) {
                    setActiveApp(tool);
                    // Adiciona delay sútil para dar tempo do componente renderizar na DOM caso seja o primeiro clique
                    setTimeout(() => {
                      const analystElement = document.getElementById('analista');
                      if (analystElement) {
                        analystElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }, 50);
                  }
                }}
              >
                {!isSoon && (
                  <div className={`absolute inset-0 bg-gradient-to-br from-[var(--color-brand-orange)]/10 to-transparent transition-opacity duration-500 pointer-events-none ${activeApp?.title === tool.title ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                )}

                <div className="mb-6 relative z-10">
                  <div className={`relative w-20 h-20 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(249,166,32,0.15)] ring-1 ${!isSoon && activeApp?.title === tool.title ? 'ring-[var(--color-brand-orange)]/50' : !isSoon ? 'ring-white/10 group-hover:ring-[var(--color-brand-orange)]/50' : 'ring-white/5 grayscale saturate-50'} transition-all`}>
                    <Image src={tool.icon} alt={tool.title} fill className={`object-cover transition-transform duration-500 ${!isSoon && activeApp?.title === tool.title ? 'scale-110' : !isSoon ? 'group-hover:scale-110' : ''}`} />
                  </div>
                </div>

                <div className="flex-grow">
                  <h3 className={`text-xl font-bold mb-3 tracking-tight transition-colors ${!isSoon && activeApp?.title === tool.title ? 'text-[var(--color-brand-orange)]' : !isSoon ? 'group-hover:text-[var(--color-brand-orange)]' : 'text-slate-300'}`}>
                    {tool.title}
                  </h3>
                  <p className={`text-sm leading-relaxed mb-6 ${isSoon ? 'text-slate-500' : 'text-slate-400'}`}>
                    {tool.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <span className={`text-[10px] font-mono tracking-widest ${
                    tool.status === 'DISPONÍVEL' ? 'text-[var(--color-brand-green)]' 
                    : isSoon ? 'bg-white/10 text-white px-3 py-1.5 rounded uppercase font-bold border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.05)] text-center tracking-[0.2em]' 
                    : 'text-slate-600'
                  }`}>
                    {tool.status}
                  </span>

                  {!isSoon && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveApp(tool);
                        setTimeout(() => {
                          const analystElement = document.getElementById('analista');
                          if (analystElement) {
                            analystElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }, 50);
                      }}
                      className="h-10 flex items-center gap-1 text-[var(--color-brand-orange)] text-xs font-bold hover:gap-2 transition-all cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                    >
                      ACESSAR <span className="text-lg">→</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <TrafficAnalystContainer activeApp={activeApp} />
    </section>
  );
}
