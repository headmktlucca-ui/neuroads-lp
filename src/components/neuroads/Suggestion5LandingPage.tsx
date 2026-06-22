'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  Funnel,
  Target,
  TrendingUp,
  AlertCircle,
  Cpu,
  Zap,
  ChevronRight,
  MessageCircle,
  BookOpen,
  LayoutDashboard
} from 'lucide-react';
import { agents as catalogAgents } from '../../data/agents';
import LuccaSpecialistChatModal from './LuccaSpecialistChatModal';
import Lenis from 'lenis';

const revealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    }
  }
};

const testimonials = [
  {
    quote: 'Essencial para impulsionar sua empresa, recomendo!!',
    name: 'Flávio Almeida',
    role: 'CEO, FJR TELEPROMPTER',
    avatar: '/images/flavio-almeida.png',
  },
  {
    quote: 'Excelente profissional de tráfego pago! Sempre muito estratégico, atencioso e focado em performance.',
    name: 'Bruno Ribeiro',
    role: 'CEO, VOAR ESTÚDIO CRIATIVO',
    avatar: '/images/Bruno Ribeiro.png',
  },
  {
    quote: 'Excelente agência, muito profissional e comprometida sempre buscando melhorar as atividades. Recomendo bastante!',
    name: 'Emanuel Silva',
    role: 'CONSULTOR FINANCEIRO',
    avatar: '/images/Emanuel Silva.png',
  },
];

const faq = [
  {
    q: 'Como funciona a IA Agêntica da NeuroAds?',
    a: 'A IA Agêntica da NeuroAds conecta diagnóstico, decisão e execução em um único ecossistema. Nossos agentes analisam dados reais de mídia, funil e comportamento para recomendar e executar ajustes com supervisão estratégica do time sênior, reduzindo achismo e aumentando previsibilidade de resultado.',
    tags: ['PLATAFORMA', 'IA AGÊNTICA'],
  },
  {
    q: 'Vocês atendem qual tipo de empresa?',
    a: 'Atendemos principalmente PMEs em fase de crescimento que já investem em marketing e precisam de mais controle sobre retorno financeiro. Em geral, são empresas com faturamento mensal entre R$ 30 mil e R$ 200 mil que querem escalar com dados reais, não com promessas vagas.',
    tags: ['EMPRESA', 'ELEGIBILIDADE'],
  },
  {
    q: 'Em quanto tempo começam os resultados?',
    a: 'Os primeiros ganhos operacionais normalmente aparecem nas primeiras semanas, com ajustes de estrutura, segmentação e orçamento. Resultados comerciais mais robustos dependem de variáveis como oferta, histórico da conta e maturidade do funil, mas o foco desde o início é reduzir desperdício e aumentar eficiência de receita.',
    tags: ['RESULTADOS', 'PRAZO'],
  },
  {
    q: 'Quais canais vocês gerenciam?',
    a: 'Gerenciamos Google Ads e Meta Ads de forma integrada, além de estratégias de SEO + GEO para buscadores e motores generativos. O objetivo é alinhar tráfego pago, orgânico e inteligência de conteúdo para gerar crescimento previsível em todo o ciclo de aquisição.',
    tags: ['CANAIS', 'MÍDIA PAGA'],
  },
  {
    q: 'Como é a implementação?',
    a: 'A implementação começa com diagnóstico estratégico para mapear gargalos e priorizar os agentes certos para sua operação. Em seguida, configuramos o ambiente, conectamos dados, ativamos os fluxos de execução e acompanhamos a evolução com indicadores traduzidos para impacto no caixa.',
    tags: ['IMPLEMENTAÇÃO', 'PROCESSO'],
  },
];

const useCasesSectors = [
  {
    id: 'social-media',
    title: 'Social Media',
    description: 'Automatize a criação de conteúdo, análise de engajamento e distribuição inteligente para Instagram, TikTok e LinkedIn com agentes treinados na voz da sua marca.',
    cards: [
      { title: 'Criação de Criativos', description: 'Gere imagens e vídeos virais com IA alinhados à identidade visual.' },
      { title: 'Calendário Editorial', description: 'Planejamento automático de pautas com base em tendências e dados do setor.' },
    ],
    nodes: [
      { label: 'IDEIA DE CONTEÚDO', icon: '💡' },
      { label: 'INSTAGRAM', icon: '📸' },
      { label: 'TIKTOK', icon: '🎬' },
      { label: 'LINKEDIN', icon: '💼' },
    ],
    outputs: [
      { label: 'CRIATIVO IG', color: '#E1306C' },
      { label: 'VÍDEO VIRAL', color: '#ff6a00' },
      { label: 'POST LK', color: '#0077B5' },
    ],
  },
  {
    id: 'ecommerce',
    title: 'E-Commerce',
    description: 'Otimize fichas de produto, gestão de catálogo e campanhas de remarketing com inteligência artificial para aumentar o faturamento com margem sustentável.',
    cards: [
      { title: 'Fotos de Produto com IA', description: 'Imagens profissionais geradas automaticamente para todo o catálogo.' },
      { title: 'Remarketing Inteligente', description: 'Campanhas dinâmicas que seguem o comportamento de compra do usuário.' },
    ],
    nodes: [
      { label: 'FOTO DO PRODUTO', icon: '📦' },
      { label: 'REMOVER FUNDO', icon: '✂️' },
      { label: 'MELHORAR', icon: '✨' },
    ],
    outputs: [
      { label: 'PRODUTO FINAL', color: '#ff6a00' },
      { label: 'ROAS +40%', color: '#10b981' },
    ],
  },
  {
    id: 'marketing',
    title: 'Marketing',
    description: 'Construa funis completos, gere copies de alta conversão e gerencie campanhas multicanal com supervisão agêntica e foco direto em resultado de caixa.',
    cards: [
      { title: 'Funil de Captação', description: 'Páginas, e-mails e automações integradas para captar leads qualificados.' },
      { title: 'Copy de Alta Conversão', description: 'Textos persuasivos gerados com base no perfil do público e dados de mercado.' },
    ],
    nodes: [
      { label: 'PÚBLICO-ALVO', icon: '🎯' },
      { label: 'COPY IA', icon: '✍️' },
      { label: 'LANDING PAGE', icon: '🌐' },
    ],
    outputs: [
      { label: 'LEAD QUALIFICADO', color: '#10b981' },
      { label: 'CONVERSÃO', color: '#ff6a00' },
    ],
  },
  {
    id: 'campanhas',
    title: 'Campanhas Patrocinadas',
    description: 'Gerencie Google Ads e Meta Ads com inteligência artificial que otimiza lances, orçamentos e segmentações em tempo real para maximizar o ROAS da operação.',
    cards: [
      { title: 'Google Ads & Meta Ads', description: 'Gestão integrada com otimização automática de campanhas e lances inteligentes.' },
      { title: 'Otimização de ROAS', description: 'Algoritmo agêntico que redistribui verba para os conjuntos com melhor retorno.' },
    ],
    nodes: [
      { label: 'ORÇAMENTO', icon: '💰' },
      { label: 'GOOGLE ADS', icon: '🔍' },
      { label: 'META ADS', icon: '📱' },
    ],
    outputs: [
      { label: 'ROAS OTIMIZADO', color: '#3b82f6' },
      { label: 'CPL REDUZIDO', color: '#10b981' },
    ],
  },
  {
    id: 'posicionamento',
    title: 'Posicionamento Estratégico',
    description: 'Domine o resultado orgânico e generativo com SEO + GEO, análise de concorrentes e construção de autoridade de marca baseada em dados reais de mercado.',
    cards: [
      { title: 'SEO & GEO', description: 'Visibilidade em buscadores tradicionais e em IAs como ChatGPT e Gemini.' },
      { title: 'Análise de Concorrentes', description: 'Mapeamento de lacunas e oportunidades estratégicas no seu mercado.' },
    ],
    nodes: [
      { label: 'PESQUISA DE MERCADO', icon: '🔎' },
      { label: 'SEO', icon: '📈' },
      { label: 'GEO (IA)', icon: '🤖' },
    ],
    outputs: [
      { label: 'AUTORIDADE', color: '#8b5cf6' },
      { label: 'TRÁFEGO ORGÂNICO', color: '#10b981' },
    ],
  },
];

const segmentLandingCards = [
  {
    title: 'Mercado Imobiliário',
    href: '/servicos/mercado-imobiliario',
    backgroundImage: '/images/segment-backgrounds/mercado-imobiliario-bg.png',
    pain: 'Plantão cheio, mas poucas visitas com perfil de fechamento.',
    impact: 'Mais previsibilidade entre lead, visita e proposta.',
  },
  {
    title: 'Saúde & Clínicas',
    href: '/servicos/saude-clinicas',
    backgroundImage: '/images/segment-backgrounds/saude-clinicas-bg.png',
    pain: 'Agenda instável com contatos sem aderência clínica.',
    impact: 'Redução de desperdício e melhor ocupação da agenda.',
  },
  {
    title: 'E-commerce & Varejo',
    href: '/servicos/e-commerce-varejo',
    backgroundImage: '/images/segment-backgrounds/ecommerce-varejo-bg.png',
    pain: 'Tráfego alto sem conversão consistente em faturamento.',
    impact: 'Escala de vendas com foco em margem e ROAS sustentável.',
  },
  {
    title: 'Serviços Profissionais',
    href: '/servicos/servicos-profissionais',
    backgroundImage: '/images/segment-backgrounds/servicos-profissionais-bg.png',
    pain: 'Dependência de indicação e pipeline comercial irregular.',
    impact: 'Fluxo recorrente de reuniões com perfil ideal.',
  },
  {
    title: 'Educação Digital',
    href: '/servicos/educacao-digital',
    backgroundImage: '/images/segment-backgrounds/educacao-digital-bg.png',
    pain: 'Receita dependente de picos de lançamento.',
    impact: 'Matrículas previsíveis com sistema contínuo de aquisição.',
  },
] as const;

const ALL_LOGS = [
  { id: 1, icon: Target, title: 'Analista de Tráfego', subtitle: 'Realocou R$ 500 para campanha de Remarketing', value: '+12% ROAS', color: 'text-[#ff8f3a]' },
  { id: 2, icon: Funnel, title: 'Rastreador Cirúrgico', subtitle: 'Detectou falha de atribuição no iOS 17', value: 'Resolvido', color: 'text-emerald-400' },
  { id: 3, icon: TrendingUp, title: 'Preditor de Funil', subtitle: 'Projeta aumento de 15% na taxa de conversão', value: 'Meta Ativa', color: 'text-[#ff8f3a]' },
  { id: 4, icon: Cpu, title: 'Gerador de Criativos', subtitle: 'Testando 3 novas variações de copy', value: 'A/B Test', color: 'text-[#ff8f3a]' },
  { id: 5, icon: AlertCircle, title: 'Auditor de Desperdício', subtitle: 'Pausou conjunto de anúncios ineficiente', value: '- R$ 120/dia', color: 'text-emerald-400' },
  { id: 6, icon: Target, title: 'Analista de Tráfego', subtitle: 'Aumentou lance para público Lookalike 1%', value: '+ Escala', color: 'text-[#ff8f3a]' },
  { id: 7, icon: TrendingUp, title: 'Simulador de ROAS', subtitle: 'Cenário otimista validado para Black Friday', value: 'Sinal Verde', color: 'text-emerald-400' },
  { id: 8, icon: Zap, title: 'Gerador de Criativos', subtitle: 'Nova variação de vídeo atinge 8% de CTR', value: 'Vencedor', color: 'text-emerald-400' }
];

function UseCasesSection() {
  const [activeSectorIndex, setActiveSectorIndex] = useState(0);
  const categoryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rightPanelRef = useRef<HTMLDivElement | null>(null);
  const [rightPanelOffset, setRightPanelOffset] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const activeEl = categoryRefs.current[activeSectorIndex];
    if (!activeEl) return;

    const updateOffset = () => {
      const rightPanelEl = rightPanelRef.current;
      const heightLeft = activeEl.offsetHeight;
      const heightRight = rightPanelEl ? rightPanelEl.offsetHeight : 360;
      const offset = activeEl.offsetTop + (heightLeft - heightRight) / 2;
      setRightPanelOffset(offset);
    };

    updateOffset();
    const timer = setTimeout(updateOffset, 150);

    const resizeObserver = new ResizeObserver(updateOffset);
    resizeObserver.observe(activeEl);

    const rightPanelEl = rightPanelRef.current;
    if (rightPanelEl) {
      resizeObserver.observe(rightPanelEl);
    }

    window.addEventListener('resize', updateOffset);
    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateOffset);
    };
  }, [activeSectorIndex]);

  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth < 1024) return;

    const observerOptions = {
      root: null,
      rootMargin: '-35% 0px -35% 0px',
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = categoryRefs.current.indexOf(entry.target as HTMLDivElement);
          if (index !== -1) {
            setActiveSectorIndex(index);
          }
        }
      });
    }, observerOptions);

    categoryRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleHeaderClick = (idx: number) => {
    setActiveSectorIndex(idx);
    categoryRefs.current[idx]?.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  };

  return (
    <section className="relative z-10 py-24 px-5 md:px-8 bg-transparent w-full lg:overflow-visible overflow-hidden">
      <div className="mx-auto max-w-[1260px]">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-[720px] mx-auto mb-20"
        >
          <span className="text-[13px] font-bold text-[#ff6a00]">Arquitetura por Setor</span>
          <h2 className="text-3xl sm:text-4xl font-black mt-2">Aplicações Práticas</h2>
          <p className="text-slate-400 mt-4 text-sm leading-relaxed">
            Descubra como equipes de marketing utilizam nossos agentes para automatizar e escalar resultados em cada área.
          </p>
        </motion.div>

        {/* Desktop Layout: Scroll-Linked Sticky Accordion */}
        <div className="hidden lg:grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-start relative">
          {/* Left Column: Accordions list */}
          <div className="space-y-6">
            {useCasesSectors.map((sector, idx) => {
              const isActive = activeSectorIndex === idx;
              return (
                <div
                  key={sector.id}
                  ref={(el) => {
                    categoryRefs.current[idx] = el;
                  }}
                  className={`flex gap-6 p-6 rounded-2xl border transition-all duration-500 cursor-pointer ${
                    isActive
                      ? 'border-[#ff6a00]/30 bg-zinc-950/90 shadow-[0_4px_24px_rgba(255,106,0,0.08)]'
                      : 'border-white/5 bg-transparent hover:border-white/10'
                  }`}
                  onClick={() => handleHeaderClick(idx)}
                >
                  {/* Active side indicator */}
                  <div className="w-[3px] shrink-0 relative rounded-full overflow-hidden bg-zinc-800">
                    <motion.div
                      className="absolute top-0 left-0 right-0 bg-[#ff6a00] rounded-full"
                      initial={{ height: 0 }}
                      animate={{ height: isActive ? '100%' : '0%' }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className={`text-xl font-black transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400'}`}>
                      {sector.title}
                    </h3>

                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <p className="mt-3 text-slate-300 text-sm leading-relaxed">
                            {sector.description}
                          </p>
                          <div className="mt-6 grid grid-cols-2 gap-3">
                            {sector.cards.map((card, cIdx) => (
                              <div
                                key={cIdx}
                                className="rounded-xl border border-white/5 bg-zinc-950/90 p-4 hover:border-[#ff6a00]/30 transition-colors"
                              >
                                <span className="text-[11px] font-bold text-[#ff8f3a]">
                                  {sector.title}
                                </span>
                                <h4 className="text-sm font-bold text-white mt-1">{card.title}</h4>
                                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{card.description}</p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Sticky Workflow diagram */}
          <motion.div
            ref={rightPanelRef}
            className="w-full self-start"
            animate={{ y: rightPanelOffset }}
            transition={{ type: 'spring', stiffness: 100, damping: 20, mass: 1 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSectorIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-[20px] border border-white/8 bg-zinc-950/90 p-6 overflow-hidden min-h-[360px] flex flex-col justify-center shadow-[0_18px_48px_rgba(0,0,0,0.4)]"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#ff6a00]/5 rounded-full filter blur-[60px] pointer-events-none" />

                {/* Workflow title */}
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mb-5">
                  FLUXO AGÊNTICO — {useCasesSectors[activeSectorIndex].title.toUpperCase()}
                </p>

                {/* Node -> Output layout with curved animated SVG connectors */}
                <div className="flex items-center gap-2 relative z-10">
                  {/* Source nodes */}
                  <div className="flex flex-col gap-3.5 flex-1">
                    {useCasesSectors[activeSectorIndex].nodes.map((node, nIdx) => (
                      <div
                        key={nIdx}
                        className="flex items-center gap-2.5 rounded-[10px] border border-white/8 bg-zinc-900/60 px-3 py-2.5 shadow-sm"
                      >
                        <span className="text-base leading-none">{node.icon}</span>
                        <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wide leading-tight">{node.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* SVG Connector Column */}
                  <div className="w-16 h-[200px] relative flex items-center justify-center shrink-0">
                    <svg className="absolute inset-0 w-full h-full overflow-visible" fill="none" viewBox="0 0 64 200" preserveAspectRatio="none">
                      {useCasesSectors[activeSectorIndex].nodes.map((_, nIdx) => {
                        const nodesCount = useCasesSectors[activeSectorIndex].nodes.length;
                        const outputsCount = useCasesSectors[activeSectorIndex].outputs.length;
                        
                        // Distribute coordinates nicely along a 200px height viewbox
                        const yStart = nodesCount === 1 ? 100 : (nIdx / (nodesCount - 1)) * 160 + 20;
                        
                        return useCasesSectors[activeSectorIndex].outputs.map((_, oIdx) => {
                          const yEnd = outputsCount === 1 ? 100 : (oIdx / (outputsCount - 1)) * 160 + 20;
                          return (
                            <path
                              key={`${nIdx}-${oIdx}`}
                              d={`M 0,${yStart} C 32,${yStart} 32,${yEnd} 64,${yEnd}`}
                              stroke="url(#gradient-orange-blue)"
                              strokeWidth="1.5"
                              className="animate-dashdraw opacity-40 hover:opacity-100 transition-opacity"
                            />
                          );
                        });
                      })}
                      <defs>
                        <linearGradient id="gradient-orange-blue" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#ff6a00" />
                          <stop offset="100%" stopColor="#ff8f3a" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Output nodes */}
                  <div className="flex flex-col gap-3.5 flex-1">
                    {useCasesSectors[activeSectorIndex].outputs.map((output, oIdx) => (
                      <div
                        key={oIdx}
                        className="rounded-[10px] border px-3 py-2.5 text-center shadow-sm"
                        style={{ borderColor: output.color + '40', backgroundColor: output.color + '15' }}
                      >
                        <span
                          className="text-[10px] font-mono font-extrabold uppercase tracking-wide"
                          style={{ color: output.color }}
                        >
                          {output.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Animated background flow line */}
                <div className="absolute left-6 top-[70px] bottom-6 w-[2px] bg-gradient-to-b from-[#ff6a00]/30 to-transparent pointer-events-none" />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Mobile & Tablet Layout: Stacked sectors */}
        <div className="space-y-24 lg:hidden">
          {useCasesSectors.map((sector) => (
            <motion.div
              key={sector.id}
              variants={revealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="grid gap-12 items-center"
            >
              {/* Content */}
              <div className="flex gap-6">
                <div className="w-[3px] bg-[#ff6a00] rounded-full shrink-0" />
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-white">{sector.title}</h3>
                  <p className="mt-3 text-slate-300 text-sm leading-relaxed">{sector.description}</p>
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {sector.cards.map((card, cIdx) => (
                      <div
                        key={cIdx}
                        className="rounded-[16px] border border-[#ff6a00]/20 bg-zinc-950/95 p-4 hover:border-[#ff6a00]/40 transition-colors"
                      >
                        <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#ff8f3a]">
                          {sector.title.toUpperCase()}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1">{card.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{card.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Workflow visual */}
              <div className="relative rounded-[20px] border border-white/8 bg-zinc-950/90 p-6 overflow-hidden min-h-[260px] flex flex-col justify-center shadow-[0_18px_48px_rgba(0,0,0,0.4)]">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#ff6a00]/5 rounded-full filter blur-[60px] pointer-events-none" />

                <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mb-5">
                  FLUXO AGÊNTICO — {sector.title.toUpperCase()}
                </p>

                <div className="flex items-center gap-4 relative z-10">
                  {/* Source nodes */}
                  <div className="flex flex-col gap-2.5 flex-1">
                    {sector.nodes.map((node, nIdx) => (
                      <div
                        key={nIdx}
                        className="flex items-center gap-2.5 rounded-[10px] border border-white/8 bg-zinc-900/60 px-3 py-2"
                      >
                        <span className="text-base leading-none">{node.icon}</span>
                        <span className="text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wide leading-tight">{node.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Connector */}
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="h-[2px] w-8 border-t-2 border-dashed border-[#ff6a00]/40" />
                    <ChevronRight size={14} className="text-[#ff6a00]/60" />
                  </div>

                  {/* Output nodes */}
                  <div className="flex flex-col gap-2.5 flex-1">
                    {sector.outputs.map((output, oIdx) => (
                      <div
                        key={oIdx}
                        className="rounded-[10px] border px-3 py-2 text-center"
                        style={{ borderColor: output.color + '40', backgroundColor: output.color + '15' }}
                      >
                        <span
                          className="text-[10px] font-mono font-extrabold uppercase tracking-wide"
                          style={{ color: output.color }}
                        >
                          {output.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Animated flow line */}
                <div className="absolute left-6 top-[70px] bottom-6 w-[2px] bg-gradient-to-b from-[#ff6a00]/30 to-transparent pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Suggestion5LandingPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isLuccaChatOpen, setIsLuccaChatOpen] = useState(false);
  const [luccaAutoMessage, setLuccaAutoMessage] = useState<string | null>(null);

  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 1000], [0, 200]);

  // Mobile responsive hook removed as 3D transforms are disabled
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    let frameId: number;
    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);
  const handleOpenSpecialistChat = () => {
    setLuccaAutoMessage(null);
    setIsLuccaChatOpen(true);
  };

  return (
    <main className="relative min-h-screen bg-[#040811] text-white overflow-x-hidden selection:bg-[#ff6a00] selection:text-white">
      {/* Background radial overlays — CSS radial-gradient avoids filter layers entirely */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 600px 600px at 25% 0%, rgba(255,106,0,0.06) 0%, transparent 70%)',
            'radial-gradient(ellipse 700px 700px at 75% 35%, rgba(18,40,76,0.10) 0%, transparent 70%)',
            'radial-gradient(ellipse 500px 500px at 33% 100%, rgba(255,106,0,0.03) 0%, transparent 70%)',
          ].join(', '),
        }}
      />
      
      {/* Header Grid Line patterns */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* HERO SECTION WITH STORYTELLING NARRATIVE */}
      <section className="relative w-full min-h-[90vh] flex items-stretch z-10 pt-[139px] pb-16 md:pb-24 overflow-hidden bg-transparent">
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute w-full bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/backgrounds/bh_home.png')",
              y: backgroundY,
              height: '140%',
              top: '-20%',
              left: 0,
              right: 0,
            }}
          />
        </div>

        {/* Smooth top gradient fade to blend background image with the top menu bar */}
        <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-[#08101e] via-[#08101e]/60 to-transparent z-[1] pointer-events-none" />

        {/* Subtle left-side readability gradient — doesn't block video, just anchors text */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent z-[1] pointer-events-none" />

        {/* Cinematic Fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#03060c] to-transparent z-[1] pointer-events-none" />

        {/* Full-width container — no max-w, no centering, content reaches window edges */}
        <div className="relative z-10 w-full flex flex-col lg:flex-row items-stretch justify-between gap-8 lg:gap-0">

          {/* LEFT — headline + subtitle: hugs the left window edge */}
          <div className="pl-4 lg:pl-8 pr-4 lg:pr-10 w-full lg:flex-[6] lg:flex lg:flex-col lg:justify-center">
            <div>
              <h1 className="text-[42px] md:text-[58px] lg:text-[68px] font-black leading-[1.05] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
                Existe uma versão da sua empresa{" "}
                <br className="hidden lg:inline" />
                onde cada real investido tem destino{" "}
                <br className="hidden lg:inline" />
                <span className="text-[#ff6a00]">
                  certo e retorno mensurável.
                </span>
              </h1>
              <p className="mt-5 text-[15px] sm:text-[17px] text-white/80 leading-relaxed max-w-[480px] drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
                Agentes de IA que orquestram dados, mídia e criatividade para gerar resultados consistentes e escaláveis.
              </p>
              {/* Social proof — below fold anchor */}
              <div className="flex flex-wrap items-center gap-3 mt-6 text-xs text-white/50">
                <span className="font-bold text-white/70">25+ empresas</span>
                <span>·</span>
                <span>R$ 2M+ em mídia gerenciada</span>
                <span>·</span>
                <span className="text-emerald-400 font-bold">ROAS médio 7.5x</span>
              </div>
            </div>
          </div>

          {/* RIGHT — CTAs + badges: hugs the right window edge */}
          <div className="w-full lg:flex-[4] pl-4 lg:pl-10 pr-4 lg:pr-8 flex flex-col gap-6 lg:justify-end items-end">
            {/* CTAs stacked vertically */}
            <div className="flex flex-col gap-3 w-full max-w-[280px]">
              <button
                type="button"
                onClick={handleOpenSpecialistChat}
                className="w-full justify-center inline-flex items-center gap-2 rounded-xl bg-[#ff6a00] hover:bg-[#ff7b1a] transition-all px-8 py-4 text-[14px] font-extrabold text-white shadow-[0_4px_24px_rgba(255,106,0,0.45)] cursor-pointer"
              >
                Fale com um especialista
                <ArrowRight size={16} />
              </button>
              <Link
                href="/hub"
                className="w-full justify-center inline-flex items-center gap-2 rounded-xl border border-white/20 hover:border-white/40 transition-all px-8 py-3.5 text-[13px] font-bold text-white/80 hover:text-white"
              >
                Explorar o Hub
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Feature badges — vertical list */}
            <div className="flex flex-col gap-4 border-t border-white/15 pt-5 w-full max-w-[280px]">
              <div className="flex items-center justify-end gap-3 text-right w-full">
                <div>
                  <p className="text-sm font-bold text-white leading-none drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">IA Agêntica</p>
                  <p className="text-xs text-white/60 mt-1">Autônoma e orientada a metas</p>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ff6a00]/20 text-[#ff8f3a] border border-[#ff6a00]/30">
                  <Cpu size={16} />
                </span>
              </div>
              <div className="flex items-center justify-end gap-3 text-right w-full">
                <div>
                  <p className="text-sm font-bold text-white leading-none drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">Dados em tempo real</p>
                  <p className="text-xs text-white/60 mt-1">Decisões baseadas em sinal</p>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ff6a00]/20 text-[#ff8f3a] border border-[#ff6a00]/30">
                  <TrendingUp size={16} />
                </span>
              </div>
              <div className="flex items-center justify-end gap-3 text-right w-full">
                <div>
                  <p className="text-sm font-bold text-white leading-none drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">Resultados mensuráveis</p>
                  <p className="text-xs text-white/60 mt-1">Foco no que importa</p>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ff6a00]/20 text-[#ff8f3a] border border-[#ff6a00]/30">
                  <Target size={16} />
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CASOS DE USO POR SETOR */}
      <UseCasesSection />

      {/* AGENTES EM DESTAQUE */}
      <section className="relative z-10 py-24 px-5 md:px-8 bg-transparent w-full overflow-hidden">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto max-w-[1260px]"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
            <div>
              <span className="text-[13px] font-bold text-[#ff6a00]">Catálogo</span>
              <h2 className="text-3xl sm:text-4xl font-black mt-2">
                Agentes de IA que Executam por Você
              </h2>
              <p className="text-slate-400 mt-3 text-sm max-w-[540px]">
                Acesse e ative agentes especializados para cada etapa do funil — da atração à escala de resultados.
              </p>
            </div>
            <Link
              href="/agentes-ia"
              className="inline-flex items-center gap-2 rounded-xl border border-[#ff6a00]/40 px-6 py-3 text-sm font-extrabold text-[#ff8f3a] hover:bg-[#ff6a00]/10 transition-colors shrink-0"
            >
              Explorar todos os Agentes
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {catalogAgents.slice(0, 8).map((agent) => (
              <div
                key={agent.title}
                className="group relative rounded-xl border border-white/5 bg-zinc-950/90 p-5 flex flex-col justify-between hover:border-[#ff6a00]/30 transition-all hover:shadow-[0_4px_24px_rgba(255,106,0,0.08)] min-h-[220px]"
              >
                <div>
                  <div className="mb-4">
                    <span className="inline-block rounded-md bg-white/5 px-2.5 py-1 text-[11px] font-bold text-[#ff8f3a]">
                      {agent.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-[#ff8f3a] transition-colors leading-snug">
                    {agent.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed line-clamp-3">
                    {agent.description}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 font-mono uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    ONLINE
                  </span>
                  <Link
                    href="/agentes-ia"
                    className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#ff8f3a] hover:gap-2 transition-all"
                  >
                    Usar Agente
                    <ArrowRight size={10} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

        {/* NARRATIVE SECTION: COMO FUNCIONA? */}
        <section className="relative z-10 py-24 px-5 md:px-8 bg-transparent w-full overflow-hidden">
          
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-120px" }}
            className="relative z-10 mx-auto max-w-[1260px]"
          >
            <div className="grid gap-12 lg:grid-cols-2 items-center">

              {/* Left column: text content */}
              <div>
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#ff6a00]">COMO FUNCIONA?</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold mt-2">
                  Os Agentes da NeuroAds transformam dados em decisões estratégicas.
                </h2>
                <p className="text-slate-300 mt-6 text-sm leading-relaxed">
                  Os Agentes da NeuroAds analisam o comportamento dos seus clientes atuais, identificam os fatores que impulsionam vendas e criam um insights detalhados das oportunidades de posicionamento e receita.
                </p>
                <p className="text-slate-300 mt-4 text-sm leading-relaxed">
                  Ao comparar o perfil dos seus melhores clientes com o perfil ideal de mercado, os agentes encontram padrões valiosos que orientam ações de marketing, comunicação e posicionamento. Dessa forma, sua empresa deixa de trabalhar com suposições e passa a construir autoridade com base em inteligência de dados.
                </p>
              </div>

              {/* Right column: interactive Hub Operacional feed */}
              <div className="relative flex justify-center items-start">
                <div className="absolute inset-0 bg-[#ff6a00]/5 rounded-[30px] filter blur-[40px] pointer-events-none" />
                <div className="relative w-full max-w-[420px] p-6 overflow-hidden rounded-[24px] border border-white/5 bg-zinc-950/60 backdrop-blur-md">
                  {/* Widget Title */}
                  <div className="flex items-center justify-between border-b border-[#ff6a00]/15 pb-4 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#ff6a00]" />
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Hub Operacional - Automações</span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">STATUS: ATIVO</div>
                  </div>

                  {/* Static log feed */}
                  <div className="space-y-3 relative z-10 flex flex-col overflow-hidden h-[380px] pr-2 mask-image-bottom-fade">
                    {ALL_LOGS.slice(0, 5).map((log) => (
                      <div 
                        key={log.id}
                        className="flex items-center gap-4 p-3.5 rounded-[16px] bg-zinc-900/40 border border-white/5 w-full shrink-0"
                      >
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-[#ff6a00]/20 to-amber-500/10 flex items-center justify-center border border-[#ff6a00]/30 text-[#ff8f3a]">
                          <log.icon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{log.title}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{log.subtitle}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-xs font-bold ${log.color}`}>{log.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Animated vertical flow line */}
                  <div className="absolute left-[36px] top-[70px] bottom-[50px] w-[2px] bg-gradient-to-b from-[#ff6a00] via-amber-500/50 to-emerald-500 opacity-30 pointer-events-none" />
                </div>
              </div>

            </div>
          </motion.div>
        </section>

      {/* IMPLANTAÇÃO EM 4 ETAPAS */}
      <section className="relative z-10 py-24 px-5 md:px-8 bg-transparent w-full overflow-hidden">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto max-w-[1260px] grid gap-16 lg:grid-cols-2 items-center"
        >
          {/* Left: Steps */}
          <div>
            <span className="inline-block rounded-full border border-[#ff6a00]/30 bg-[#ff6a00]/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#ff8f3a] mb-6">
              PROCESSO DE IMPLANTAÇÃO
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
              Do Diagnóstico à Escala{' '}
              <br />
              <span className="bg-[linear-gradient(90deg,#ff8a00_0%,#ff6a00_50%,#ff9f1a_100%)] bg-clip-text text-transparent">
                em 4 Etapas
              </span>
            </h2>
            <p className="text-slate-300 mt-4 text-sm leading-relaxed max-w-[480px]">
              Nossa metodologia conecta diagnóstico, configuração, ativação e otimização em um ciclo contínuo orientado a resultados reais de caixa.
            </p>
            <ol className="mt-10 space-y-6">
              {[
                { n: 1, title: 'Diagnóstico Estratégico', desc: 'Mapeamos gargalos da operação e identificamos os agentes certos para o seu modelo de negócio.' },
                { n: 2, title: 'Configuração do Ambiente', desc: 'Conectamos fontes de dados, APIs de mídia e fluxos para alimentar os agentes com informação real.' },
                { n: 3, title: 'Ativação dos Agentes', desc: 'Agentes são implantados e iniciam rotinas automatizadas de análise, decisão e execução.' },
                { n: 4, title: 'Análise e Otimização Contínua', desc: 'Monitore indicadores com relatórios traduzidos para impacto direto no caixa, em tempo real.' },
              ].map(({ n, title, desc }) => (
                <li key={n} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ff6a00] text-white text-sm font-black">
                    {n}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">{title}</p>
                    <p className="text-[12px] text-slate-400 mt-1 leading-relaxed">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Right: Terminal mockup */}
          <div className="relative rounded-[20px] border border-white/10 bg-zinc-950/90 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/8 bg-zinc-900/60">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-500/70" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/70" />
                <span className="ml-3 text-[11px] text-slate-400 font-mono">Terminal</span>
              </div>
              <div className="flex gap-1">
                {['JSON', 'Dashboard', 'API'].map((tab, i) => (
                  <span
                    key={tab}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${i === 0 ? 'bg-white/10 text-white' : 'text-slate-500'}`}
                  >
                    {tab}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-6 font-mono text-[12px] leading-loose space-y-1">
              <p className="text-slate-500"># 1. Diagnóstico Estratégico</p>
              <p><span className="text-[#ff8f3a]">POST</span> <span className="text-white">/neuroads/v1/diagnostico</span></p>
              <p className="text-slate-300 pl-4">{`  -d '{"empresa": "Acme Corp"}'`}</p>
              <br />
              <p className="text-slate-500"># 2. Plano de Ação gerado:</p>
              <p className="text-slate-300">{"{"}</p>
              <p className="text-slate-300 pl-4">
                {'"agentes": ['}<span className="text-emerald-400">{"\"analista-trafego\""}</span>{", "}<span className="text-emerald-400">{"\"rastreador\""}</span>{"],"}
              </p>
              <p className="text-slate-300 pl-4">
                {'"status": '}<span className="text-[#ff8f3a]">{"\"pronto_para_ativar\""}</span>{","}
              </p>
              <p className="text-slate-300 pl-4">
                {'"impacto_estimado": '}<span className="text-emerald-400">{"\"+38% ROAS\""}</span>
              </p>
              <p className="text-slate-300">{"}"}</p>
              <br />
              <p className="text-slate-500"># 3. Agentes ativados em produção:</p>
              <p className="text-emerald-400">● analista-trafego &nbsp;&nbsp;ONLINE &nbsp;89ms</p>
              <p className="text-emerald-400">● rastreador-cirurgico &nbsp;ONLINE 112ms</p>
              <p className="text-emerald-400">● gerador-criativos &nbsp;&nbsp;ONLINE &nbsp;95ms</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* POR QUE A NEUROADS? */}
      <section className="relative z-10 py-24 px-5 md:px-8 bg-transparent w-full overflow-hidden">
        <div className="mx-auto max-w-[1260px]">
          <motion.div
            variants={revealVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-center max-w-[720px] mx-auto mb-20"
          >
            <span className="inline-block rounded-full border border-[#ff6a00]/30 bg-[#ff6a00]/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#ff8f3a]">
              POR QUE A NEUROADS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-4">
              Por que Empresas em Crescimento Escolhem a NeuroAds
            </h2>
            <p className="text-slate-400 mt-4 text-sm leading-relaxed">
              Abstraímos a complexidade de gerir múltiplos canais e ferramentas para que você foque no que realmente importa: crescer com previsibilidade.
            </p>
          </motion.div>

          <div className="space-y-20">
            {/* Feature 1: Custo Eficiência */}
            <motion.div
              variants={revealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="grid gap-12 lg:grid-cols-2 items-center"
            >
              <div>
                <div className="inline-flex items-center gap-2 mb-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff6a00]/15 border border-[#ff6a00]/30">
                    <TrendingUp size={16} className="text-[#ff8f3a]" />
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ff8f3a]">EFICIÊNCIA DE CUSTO</span>
                </div>
                <h3 className="text-2xl font-black text-white leading-tight">
                  Menor Custo por Lead com Inteligência Agêntica
                </h3>
                <p className="text-slate-300 mt-3 text-sm leading-relaxed">
                  A NeuroAds entrega estratégias otimizadas por IA que reduzem o custo por lead e aumentam o ROAS médio. Em comparação com agências tradicionais, nossas metodologias agênticas entregam redução de 30–40% no CPL em média.
                </p>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_18px_48px_rgba(0,0,0,0.4)]">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-6">COMPARATIVO DE CPL</p>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-slate-300 font-medium">Agência Tradicional</span>
                      <span className="text-sm font-bold text-slate-300">R$ 45 /lead</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <div className="h-full w-[85%] rounded-full bg-red-500/70" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-white font-bold">NeuroAds + IA</span>
                      <span className="text-sm font-bold text-emerald-400">R$ 28 /lead</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <div className="h-full w-[52%] rounded-full bg-emerald-400" />
                    </div>
                  </div>
                </div>
                <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-2">
                  <span className="text-emerald-400 font-bold text-sm">↓ 38% de redução</span>
                  <span className="text-slate-400 text-xs">no custo por lead</span>
                </div>
              </div>
            </motion.div>

            {/* Feature 2: Plataforma Unificada */}
            <motion.div
              variants={revealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="grid gap-12 lg:grid-cols-2 items-center"
            >
              <div className="rounded-[20px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_18px_48px_rgba(0,0,0,0.4)]">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-6">GATEWAY AGÊNTICO UNIFICADO</p>
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-lg border border-[#ff6a00]/40 bg-[#ff6a00]/10 px-5 py-2.5 font-mono text-sm text-[#ff8f3a] font-bold">
                    POST /agentes/v1/run
                  </div>
                  <ChevronRight size={16} className="text-slate-500 rotate-90" />
                  <div className="grid grid-cols-3 gap-2 w-full">
                    {[
                      { name: 'Analista', color: '#3b82f6' },
                      { name: 'Gerador', color: '#ff6a00' },
                      { name: 'Rastreador', color: '#10b981' },
                      { name: 'Preditor', color: '#8b5cf6' },
                      { name: 'Auditor', color: '#f59e0b' },
                      { name: 'Simulador', color: '#ec4899' },
                    ].map(({ name, color }) => (
                      <div
                        key={name}
                        className="rounded-lg border px-2 py-2 text-center"
                        style={{ borderColor: color + '40', backgroundColor: color + '15' }}
                      >
                        <span className="text-[10px] font-bold" style={{ color }}>{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 mb-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff6a00]/15 border border-[#ff6a00]/30">
                    <Cpu size={16} className="text-[#ff8f3a]" />
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ff8f3a]">PLATAFORMA UNIFICADA</span>
                </div>
                <h3 className="text-2xl font-black text-white leading-tight">
                  Uma Plataforma, 20+ Agentes Especializados
                </h3>
                <p className="text-slate-300 mt-3 text-sm leading-relaxed">
                  Acesse análise de tráfego, criação de conteúdo, rastreamento e inteligência de escala por meio de uma única plataforma. Combine agentes sem reconstruir sua operação de marketing.
                </p>
              </div>
            </motion.div>

            {/* Feature 3: Confiabilidade 24/7 */}
            <motion.div
              variants={revealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="grid gap-12 lg:grid-cols-2 items-center"
            >
              <div>
                <div className="inline-flex items-center gap-2 mb-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff6a00]/15 border border-[#ff6a00]/30">
                    <TrendingUp size={16} className="text-[#ff8f3a]" />
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ff8f3a]">CONFIABILIDADE</span>
                </div>
                <h3 className="text-2xl font-black text-white leading-tight">
                  Disponibilidade 24/7.<br />Monitoramento Contínuo.
                </h3>
                <p className="text-slate-300 mt-3 text-sm leading-relaxed">
                  A NeuroAds mantém os fluxos de marketing operando com disponibilidade monitorada, rastreamento de tarefas em tempo real e roteamento inteligente entre agentes e canais.
                </p>
              </div>
              <div className="rounded-[20px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_18px_48px_rgba(0,0,0,0.4)]">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-5">STATUS DO SISTEMA</p>
                <div className="flex items-start gap-10 mb-6">
                  <div>
                    <p className="text-4xl font-black text-emerald-400">99.8%</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">UPTIME (30 DIAS)</p>
                  </div>
                  <div>
                    <p className="text-4xl font-black text-white">~15min</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">RESPOSTA MÉDIA</p>
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-5 w-3 rounded-sm ${i === 18 ? 'bg-amber-500' : 'bg-emerald-500/80'}`}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-[10px] text-slate-500">30 dias atrás</span>
                  <span className="text-[10px] text-slate-500">Hoje</span>
                </div>
              </div>
            </motion.div>

            {/* Feature 4: Log de Automações */}
            <motion.div
              variants={revealVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              className="grid gap-12 lg:grid-cols-2 items-center"
            >
              <div className="rounded-[20px] border border-white/10 bg-zinc-950/80 p-6 font-mono shadow-[0_18px_48px_rgba(0,0,0,0.4)]">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-5">LOG DE AUTOMAÇÕES</p>
                <div className="space-y-0">
                  {[
                    { time: '14:32:01', task: 'analista-trafego', ms: '89ms' },
                    { time: '14:31:47', task: 'gerador-criativos', ms: '112ms' },
                    { time: '14:31:22', task: 'rastreador-cirurgico', ms: '95ms' },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center gap-3 py-3 border-b border-white/5 text-[11px]">
                      <span className="text-slate-500 shrink-0">{log.time}</span>
                      <span className="text-slate-400">POST</span>
                      <span className="text-[#ff8f3a]">/agentes</span>
                      <span className="text-slate-300 flex-1 truncate">{log.task}</span>
                      <span className="inline-flex items-center justify-center rounded px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shrink-0">
                        200
                      </span>
                      <span className="text-slate-500 shrink-0">{log.ms}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] text-slate-400">Live — Execução em tempo real</span>
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 mb-5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ff6a00]/15 border border-[#ff6a00]/30">
                    <Zap size={16} className="text-[#ff8f3a]" />
                  </span>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ff8f3a]">ORIENTADO A DADOS</span>
                </div>
                <h3 className="text-2xl font-black text-white leading-tight">
                  Relatórios e Alertas em Tempo Real
                </h3>
                <p className="text-slate-300 mt-3 text-sm leading-relaxed">
                  Receba notificações instantâneas quando resultados mudam, orçamentos são consumidos ou oportunidades surgem. Monitore cada agente com visibilidade total da operação.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SEGMENTOS IMPACTADOS */}
      <section id="segmentos" className="relative z-10 py-16 w-full px-5 md:px-8 overflow-hidden">
        
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-120px" }}
          className="relative z-10 mx-auto max-w-[1260px]"
        >
          <div className="text-center max-w-[720px] mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#ff6a00]">Segmentos Impactados</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2">
              Soluções Agênticas no seu Modelo de Negócio
            </h2>
            <p className="text-slate-400 mt-4">
              Cada segmento tem uma lógica de compra diferente. Conheça nossas estratégias com funis de captação e inteligência artificial específicos por indústria.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 justify-center">
            {segmentLandingCards.map((segment) => (
              <Link
                key={segment.href}
                href={segment.href}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-[24px] border border-[#ff6a00]/20 bg-zinc-950/85 backdrop-blur-md min-h-[380px] p-6 hover:border-[#ff6a00]/40 transition-colors shadow-[0_18px_48px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(255,106,0,0.15)] flex flex-col justify-end">
                  {segment.backgroundImage && (
                    <>
                      <Image 
                        src={segment.backgroundImage} 
                        alt={segment.title} 
                        fill 
                        className="object-cover object-center opacity-40 group-hover:scale-105 transition-transform duration-500 pointer-events-none" 
                        sizes="(max-width: 768px) 100vw, 30vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#040811] via-[#040811]/40 to-transparent z-0" />
                    </>
                  )}
                  
                  <div className="relative z-10">
                    <h3 className="text-xl font-black text-white group-hover:text-[#ff8f3a] transition-colors">{segment.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-300">{segment.pain}</p>
                    <p className="mt-3 text-xs font-semibold leading-relaxed text-emerald-400">{segment.impact}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#ff8f3a] group-hover:gap-2 transition-all">
                      Conhecer Soluções
                      <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="relative z-10 py-20 px-5 md:px-8 w-full">
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto max-w-[1260px]"
        >
          <div className="text-center max-w-[600px] mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#ff6a00]">Depoimentos</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2">O que dizem nossos clientes</h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col gap-5 rounded-[20px] border border-white/[0.08] bg-zinc-950/60 p-6 hover:border-[#ff6a00]/20 transition-colors"
              >
                <p className="text-sm leading-relaxed text-slate-300 flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3 border-t border-white/[0.06] pt-4">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover shrink-0"
                  />
                  <div>
                    <p className="text-sm font-bold text-white leading-none">{t.name}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* FAQ SECTION - MuAPI style */}
      <section id="faq" className="relative z-10 py-20 bg-transparent w-full px-5 md:px-8">
        <div className="mx-auto max-w-[1260px]">
          <div className="text-center mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#ff6a00]">Dúvidas Frequentes</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2">Perguntas & Respostas</h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1.6fr] items-start">
            {/* Left: 365 card */}
            <div className="lg:sticky lg:top-28 rounded-[24px] border border-[#ff6a00]/20 bg-zinc-950/92 backdrop-blur-sm p-8 shadow-[0_18px_48px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#ff6a00]/5 filter blur-[70px] rounded-full pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-7xl font-black text-white leading-none">365</span>
                </div>
                <p className="text-xs font-extrabold uppercase tracking-widest text-[#ff6a00] mb-8">DIAS / ANO</p>

                <h3 className="text-xl font-extrabold text-white mb-3">Ainda tem dúvidas?</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-8">
                  Nossa equipe e comunidade estão disponíveis para apoiar sua operação em todos os canais.
                </p>

                <div className="space-y-3">
                  <a
                    href="https://wa.me/5551981758382"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-[14px] border border-white/[0.08] bg-white/[0.03] hover:border-[#ff6a00]/30 hover:bg-[#ff6a00]/5 transition-all group cursor-pointer"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 border border-emerald-500/30">
                      <MessageCircle size={14} className="text-emerald-400" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-[#ff8f3a] transition-colors">Suporte Direto</p>
                      <p className="text-[10px] text-slate-500">WhatsApp & Chat</p>
                    </div>
                  </a>
                  <Link
                    href="/conteudos"
                    className="flex items-center gap-3 p-3 rounded-[14px] border border-white/[0.08] bg-white/[0.03] hover:border-[#ff6a00]/30 hover:bg-[#ff6a00]/5 transition-all group cursor-pointer"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ff6a00]/15 border border-[#ff6a00]/30">
                      <BookOpen size={14} className="text-[#ff8f3a]" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-[#ff8f3a] transition-colors">Blog & Conteúdos</p>
                      <p className="text-[10px] text-slate-500">Além do Algoritmo</p>
                    </div>
                  </Link>
                  <Link
                    href="/hub"
                    className="flex items-center gap-3 p-3 rounded-[14px] border border-white/[0.08] bg-white/[0.03] hover:border-[#ff6a00]/30 hover:bg-[#ff6a00]/5 transition-all group cursor-pointer"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/15 border border-blue-500/30">
                      <LayoutDashboard size={14} className="text-blue-400" />
                    </span>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-[#ff8f3a] transition-colors">Hub Estratégico</p>
                      <p className="text-[10px] text-slate-500">Plataforma de Inteligência</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: Numbered accordion */}
            <div className="space-y-3">
              {faq.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                const num = String(idx + 1).padStart(2, '0');
                return (
                  <div
                    key={idx}
                    className={`rounded-[16px] border transition-all duration-300 overflow-hidden ${
                      isOpen
                        ? 'border-[#ff6a00]/30 bg-zinc-900/60 shadow-[0_4px_16px_rgba(255,106,0,0.08)]'
                        : 'border-white/[0.08] bg-zinc-950/40 hover:border-[#ff6a00]/20'
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-center gap-4 p-5 text-left cursor-pointer group"
                    >
                      <span className="text-[13px] font-black text-[#ff6a00]/60 shrink-0 font-mono w-6">{num}</span>
                      <span className="flex-1 text-sm font-bold text-white group-hover:text-[#ff8f3a] transition-colors">{item.q}</span>
                      <span className={`shrink-0 text-xl font-light transition-transform duration-200 leading-none ${isOpen ? 'text-[#ff6a00] rotate-45' : 'text-slate-400'}`}>+</span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 border-t border-[#ff6a00]/10 pt-4 space-y-3">
                            <p className="text-xs leading-relaxed text-slate-300">{item.a}</p>
                            <div className="flex flex-wrap gap-2">
                              {item.tags.map((tag) => (
                                <span key={tag} className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#ff6a00]/10 text-[#ff8f3a] border border-[#ff6a00]/20">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA DE FECHAMENTO */}
      <section className="relative z-10 py-24 px-5 md:px-8 w-full overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 800px 400px at 50% 50%, rgba(255,106,0,0.07) 0%, transparent 70%)',
          }}
        />
        <motion.div
          variants={revealVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="relative z-10 mx-auto max-w-[720px] text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-[1.1] text-white">
            Pronto para transformar cada real investido em resultado mensurável?
          </h2>
          <p className="mt-5 text-[15px] text-slate-400 leading-relaxed max-w-[520px] mx-auto">
            Agende um diagnóstico gratuito e descubra quais agentes se encaixam no seu modelo de negócio.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <button
              type="button"
              onClick={handleOpenSpecialistChat}
              className="inline-flex items-center gap-2 rounded-xl bg-[#ff6a00] hover:bg-[#ff7b1a] transition-all px-10 py-4 text-[15px] font-extrabold text-white shadow-[0_4px_32px_rgba(255,106,0,0.45)] cursor-pointer"
            >
              Agendar diagnóstico gratuito
              <ArrowRight size={16} />
            </button>
            <Link
              href="/hub"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 hover:border-white/40 transition-all px-8 py-4 text-[14px] font-bold text-white/80 hover:text-white"
            >
              Explorar o Hub
              <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Specialist Lucca Chat Modal */}
      <LuccaSpecialistChatModal
        isOpen={isLuccaChatOpen}
        onClose={() => setIsLuccaChatOpen(false)}
        autoUserMessage={luccaAutoMessage}
      />
    </main>
  );
}
