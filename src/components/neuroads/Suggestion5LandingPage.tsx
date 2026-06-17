'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Funnel,
  Target,
  TrendingUp,
  X,
  Plus,
  Check,
  AlertCircle,
  Cpu,
  Sparkles,
  Zap,
  ChevronRight,
  TrendingDown
} from 'lucide-react';
import { agents as catalogAgents, type Agent as CatalogAgent } from '../../data/agents';
import LuccaSpecialistChatModal from './LuccaSpecialistChatModal';
import LuccaEmbeddedChat from './LuccaEmbeddedChat';
import PrimaryTopMenu from './PrimaryTopMenu';
import ValuesResourcesSection from './ValuesResourcesSection';
import VideoParallaxBackground from './VideoParallaxBackground';

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
  },
  {
    q: 'Vocês atendem qual tipo de empresa?',
    a: 'Atendemos principalmente PMEs em fase de crescimento que já investem em marketing e precisam de mais controle sobre retorno financeiro. Em geral, são empresas com faturamento mensal entre R$ 30 mil e R$ 200 mil que querem escalar com dados reais, não com promessas vagas.',
  },
  {
    q: 'Em quanto tempo começam os resultados?',
    a: 'Os primeiros ganhos operacionais normalmente aparecem nas primeiras semanas, com ajustes de estrutura, segmentação e orçamento. Resultados comerciais mais robustos dependem de variáveis como oferta, histórico da conta e maturidade do funil, mas o foco desde o início é reduzir desperdício e aumentar eficiência de receita.',
  },
  {
    q: 'Quais canais vocês gerenciam?',
    a: 'Gerenciamos Google Ads e Meta Ads de forma integrada, além de estratégias de SEO + GEO para buscadores e motores generativos. O objetivo é alinhar tráfego pago, orgânico e inteligência de conteúdo para gerar crescimento previsível em todo o ciclo de aquisição.',
  },
  {
    q: 'Como é a implementação?',
    a: 'A implementação começa com diagnóstico estratégico para mapear gargalos e priorizar os agentes certos para sua operação. Em seguida, configuramos o ambiente, conectamos dados, ativamos os fluxos de execução e acompanhamos a evolução com indicadores traduzidos para impacto no caixa.',
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

export default function Suggestion5LandingPage() {
  const [activeTab, setActiveTab] = useState<'aquisicao' | 'conversao' | 'escala'>('aquisicao');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isLuccaChatOpen, setIsLuccaChatOpen] = useState(false);
  const [luccaAutoMessage, setLuccaAutoMessage] = useState<string | null>(null);
  const [visibleLogs, setVisibleLogs] = useState(() => 
    ALL_LOGS.slice(0, 5).map((log, i) => ({ ...log, uniqueId: `initial-${i}` }))
  );

  useEffect(() => {
    let index = 5;
    const interval = setInterval(() => {
      setVisibleLogs((prev) => {
        const nextLog = ALL_LOGS[index % ALL_LOGS.length];
        index++;
        // Add to bottom, remove the oldest (top) one, assigning a guaranteed unique ID
        return [...prev.slice(1, 5), { ...nextLog, uniqueId: `log-${Date.now()}-${index}` }];
      });
    }, 3500);
    return () => clearInterval(interval);
  }, []);
  
  // Slots states
  const [slots, setSlots] = useState<{
    aquisicao: CatalogAgent | null;
    conversao: CatalogAgent | null;
    escala: CatalogAgent | null;
  }>({
    aquisicao: null,
    conversao: null,
    escala: null
  });



  // terminalEndRef removed to prevent auto-scrolling

  // Group agents by stage for assembly choice
  const groupedAgents = useMemo(() => {
    const aqTitles = [
      'Analista de Tráfego',
      'Gerador de Criativos',
      'Análise Viral',
      'Analisador de Público',
      'DNA da Marca',
      'Público-Alvo Ideal',
      'SEO & GEO',
      'Agente Editorial',
      'Radar de Oportunidades',
      'Análise de Concorrentes'
    ];
    const cvTitles = [
      'Gerador de Copies de Conversão',
      'Rastreador Cirúrgico',
      'Diagnóstico de Landing Page',
      'Diagnóstico de Funil',
      'Gerador de Testes A/B',
      'Avaliador de Oferta'
    ];
    const esTitles = [
      'Preditor de Funil',
      'Simulador de ROAS',
      'Auditor de Desperdício',
      'Otimizador de Orçamento'
    ];

    const aqAgents = catalogAgents.filter(a => aqTitles.includes(a.title));
    const cvAgents = catalogAgents.filter(a => cvTitles.includes(a.title));
    const esAgents = catalogAgents.filter(a => esTitles.includes(a.title));

    return {
      aquisicao: aqAgents,
      conversao: cvAgents,
      escala: esAgents
    };
  }, []);

  // Calculate dynamic simulator metrics based on slots
  const metrics = useMemo(() => {
    let roas = 1.2;
    let cpl = 45.0;
    let conversion = 0.8;
    let savings = 0;

    if (slots.aquisicao) {
      roas += 1.1;
      cpl -= 12.0;
      savings += 1500;
    }
    if (slots.conversao) {
      conversion += 0.7;
      roas += 0.8;
      cpl -= 8.0;
      savings += 2200;
    }
    if (slots.escala) {
      roas += 1.1;
      conversion += 0.8;
      cpl -= 7.0;
      savings += 3500;
    }

    return {
      roas: roas.toFixed(1) + 'x',
      cpl: 'R$ ' + cpl.toFixed(2),
      conversion: conversion.toFixed(1) + '%',
      savings: 'R$ ' + savings.toLocaleString('pt-BR') + '/mês',
      status: slots.aquisicao && slots.conversao && slots.escala 
        ? 'Previsibilidade e Escala Ativadas'
        : (slots.aquisicao || slots.conversao || slots.escala ? 'Time em Configuração...' : 'Operação Manual Crítica')
    };
  }, [slots]);

  const handleAssignAgent = (stage: 'aquisicao' | 'conversao' | 'escala', agent: CatalogAgent) => {
    setSlots(prev => ({ ...prev, [stage]: agent }));
  };


  const handleClearSlots = () => {
    setSlots({ aquisicao: null, conversao: null, escala: null });
  };

  // Scroll terminal effect removed to prevent page jumping on load and agent allocation

  const handleOpenSpecialistChat = () => {
    setLuccaAutoMessage(null);
    setIsLuccaChatOpen(true);
  };

  const handleRequestDemo = () => {
    const teamSummary = `Olá! Montei meu time de IA no simulador: Atração [${slots.aquisicao?.title || 'Nenhum'}], Conversão [${slots.conversao?.title || 'Nenhum'}], Escala [${slots.escala?.title || 'Nenhum'}]. Gostaria de um diagnóstico e demonstração de implantação.`;
    setLuccaAutoMessage(teamSummary);
    setIsLuccaChatOpen(true);
  };

  return (
    <main className="relative min-h-screen bg-[#040811] text-white overflow-hidden selection:bg-[#ff6a00] selection:text-white">
      {/* Background radial overlays */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-[#ff6a00]/10 to-transparent rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute top-[800px] right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#12284c]/20 to-transparent rounded-full filter blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-gradient-to-br from-[#ff6a00]/5 to-transparent rounded-full filter blur-[120px] pointer-events-none" />
      
      {/* Header Grid Line patterns */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Header Menu Wrapper */}
      <div className="relative z-[240] mx-auto max-w-[1260px] px-5 md:px-8 pt-5">
        <PrimaryTopMenu
          onSpecialistClick={handleOpenSpecialistChat}
          onRequestDemoClick={handleRequestDemo}
        />
      </div>

      {/* HERO SECTION WITH STORYTELLING NARRATIVE */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center z-10 pt-[115px] pb-10 md:pb-20 overflow-hidden bg-transparent">
        <VideoParallaxBackground src={["/videos/vdhm.mp4", "/videos/vdhm1.mp4"]} overlayOpacity="bg-black/60" />
        
        {/* Cinematic Fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#03060c] to-transparent z-0 pointer-events-none" />
        
        <div className="relative z-10 mx-auto max-w-[1260px] px-5 md:px-8">
          <div className="rounded-[32px] border border-white/5 bg-zinc-950/50 backdrop-blur-md p-8 sm:p-12 shadow-[0_18px_48px_rgba(0,0,0,0.5)] transition-[box-shadow,border-color] duration-300">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-center">
              
              <div className="relative z-10">

            <h1 className="text-[34px] font-black leading-[1.2] tracking-tight text-white">
              Transforme dados em Receita:
              <br />
              <span className="bg-[linear-gradient(90deg,#ff8a00_0%,#ff6a00_50%,#ff9f1a_100%)] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(255,106,0,0.4)]">
                Automações Inteligentes
              </span>
              {' '}para
              <br />
              <span className="bg-[linear-gradient(90deg,#ff8a00_0%,#ff6a00_50%,#ff9f1a_100%)] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(255,106,0,0.4)]">
                Marketing & Vendas
              </span>
              {' '}de
              <br />
              <span className="bg-[linear-gradient(90deg,#ff8a00_0%,#ff6a00_50%,#ff9f1a_100%)] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(255,106,0,0.4)]">
                ALTA PERFORMANCE.
              </span>
            </h1>
            <p className="mt-6 text-[15px] sm:text-lg text-slate-300 leading-relaxed max-w-[540px]">
              Agentes de IA que orquestram dados, mídia e criatividade para gerar resultados consistentes e escaláveis.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-4">
              <button
                type="button"
                onClick={handleOpenSpecialistChat}
                className="w-full sm:w-auto justify-center inline-flex items-center gap-2 rounded-full bg-[#ff6a00] hover:bg-[#ff7b1a] transition-all px-8 py-4 text-[14px] font-extrabold text-white shadow-[0_4px_20px_rgba(255,106,0,0.4)] cursor-pointer"
              >
                Fale com um especialista
                <ArrowRight size={16} />
              </button>
              <button 
                type="button" 
                onClick={handleRequestDemo} 
                className="w-full sm:w-auto justify-center inline-flex items-center gap-2 rounded-full border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all px-6 py-4 text-[14px] font-bold cursor-pointer"
              >
                Solicite Demonstração
                <ArrowRight size={16} />
              </button>
            </div>
            
            <div className="mt-10 flex flex-col sm:flex-row flex-wrap gap-6 border-t border-white/10 pt-8">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ff6a00]/10 text-[#ff8f3a] border border-[#ff6a00]/20">
                  <Cpu size={18} />
                </span>
                <div>
                  <p className="text-sm font-bold text-white leading-none">IA Agêntica</p>
                  <p className="text-xs text-slate-400 mt-1.5">Autônoma e orientada a metas</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ff6a00]/10 text-[#ff8f3a] border border-[#ff6a00]/20">
                  <TrendingUp size={18} />
                </span>
                <div>
                  <p className="text-sm font-bold text-white leading-none">Dados em tempo real</p>
                  <p className="text-xs text-slate-400 mt-1.5">Decisões baseadas em sinal</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ff6a00]/10 text-[#ff8f3a] border border-[#ff6a00]/20">
                  <Target size={18} />
                </span>
                <div>
                  <p className="text-sm font-bold text-white leading-none">Resultados mensuráveis</p>
                  <p className="text-xs text-slate-400 mt-1.5">Foco no que importa</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Hero Graphic */}
          <div className="relative z-10 flex justify-center items-center h-[360px] sm:h-[450px]">
            <div className="absolute inset-0 bg-[#ff6a00]/5 rounded-[30px] filter blur-[40px] pointer-events-none" />
            
            <div className="relative w-full max-w-[420px] p-6 overflow-hidden">
              {/* Graphic Title */}
              <div className="flex items-center justify-between border-b border-[#ff6a00]/15 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff6a00] animate-ping" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Hub Operacional - Automações</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">STATUS: ATIVO</div>
              </div>
 
              {/* Floating nodes with Framer Motion Layout */}
              <div className="space-y-3 relative z-10 flex flex-col overflow-hidden h-[380px] pr-2 mask-image-bottom-fade">
                <AnimatePresence initial={false}>
                  {visibleLogs.map((log) => (
                    <motion.div 
                      layout
                      key={log.uniqueId}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -20, scale: 0.95, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.4 }}
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
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
 
              {/* Animated visual flow line on back */}
              <div className="absolute left-[36px] top-[70px] bottom-[50px] w-[2px] bg-gradient-to-b from-[#ff6a00] via-amber-500/50 to-emerald-500 opacity-30 pointer-events-none" />
            </div>
          </div>
            </div>
          </div>
        </div>
      </section>

        {/* NARRATIVE SECTION: COMO FUNCIONA? */}
        <section className="relative z-10 py-24 px-5 md:px-8 bg-[#03060c] w-full overflow-hidden">
          
          <div className="relative z-10 mx-auto max-w-[1260px]">
          <div className="text-center max-w-[760px] mx-auto mb-16">
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


        </div>
      </section>

      {/* HUB ESTRATÉGICO (ex-INTERACTIVE AGENT ASSEMBLY CONTROL ROOM) */}
      <section id="control-room" className="relative z-10 overflow-hidden py-16 w-full px-5 md:px-8">
        {/* Background image (Anexo 01) */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/images/backgrounds/bg-hub-novo.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        />
        <div className="absolute inset-0 z-0 bg-black/60" />
        
        {/* Smooth Fade Transitions */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#03060c] to-transparent z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#03060c] to-transparent z-0 pointer-events-none" />
        
        <div className="relative z-10 mx-auto max-w-[1260px]">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="max-w-[620px]">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#ff6a00]">Hub Estratégico (Interactive Assembly)</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold mt-2">
                Monte sua Equipe de Agentes de IA
              </h2>
              <p className="text-slate-400 mt-3">
                Preencha os slots de funil abaixo selecionando os agentes na lista. Veja em tempo real o chat de insights com Lucca e o impacto projetado nos indicadores de caixa.
              </p>
            </div>
            
            <button 
              type="button"
              onClick={handleClearSlots}
              className="inline-flex cursor-pointer items-center gap-1.5 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-wider text-slate-300 self-start lg:self-auto"
            >
              <X size={12} />
              Limpar Equipe
            </button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Left: The Slots & Selector Grid */}
            <div className="space-y-8 relative">



              {/* Active Slots Display */}
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Slot 1: Aquisição */}
                <div className={`relative rounded-[20px] border p-5 flex flex-col justify-between min-h-[170px] transition-all ${slots.aquisicao ? 'border-[#ff6a00] bg-[#ff6a00]/10 shadow-[0_10px_30px_rgba(255,106,0,0.1)]' : 'border-dashed border-[#ff6a00]/25 bg-zinc-950/45 backdrop-blur-md'}`}>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">1. Aquisição</span>
                      {slots.aquisicao ? (
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      ) : (
                        <span className="inline-flex h-2 w-2 rounded-full bg-amber-500/40" />
                      )}
                    </div>
                    {slots.aquisicao ? (
                      <div>
                        <h4 className="text-base font-bold text-white leading-tight">{slots.aquisicao.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-3">{slots.aquisicao.description}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-2 text-center">
                        <Plus size={20} className="text-slate-500 animate-bounce" />
                        <span className="text-xs font-semibold text-slate-500 mt-2">Slot Vazio</span>
                      </div>
                    )}
                  </div>
                  {slots.aquisicao && (
                    <div className="mt-4 flex items-center justify-between border-t border-[#ff6a00]/15 pt-3">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">ATIVO</span>
                      <span className="text-[10px] text-slate-400 font-mono">Rotina #01</span>
                    </div>
                  )}
                </div>

                {/* Slot 2: Conversão */}
                <div className={`relative rounded-[20px] border p-5 flex flex-col justify-between min-h-[170px] transition-all ${slots.conversao ? 'border-[#ff6a00] bg-[#ff6a00]/10 shadow-[0_10px_30px_rgba(255,106,0,0.1)]' : 'border-dashed border-[#ff6a00]/25 bg-zinc-950/45 backdrop-blur-md'}`}>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">2. Conversão</span>
                      {slots.conversao ? (
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      ) : (
                        <span className="inline-flex h-2 w-2 rounded-full bg-amber-500/40" />
                      )}
                    </div>
                    {slots.conversao ? (
                      <div>
                        <h4 className="text-base font-bold text-white leading-tight">{slots.conversao.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-3">{slots.conversao.description}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-2 text-center">
                        <Plus size={20} className="text-slate-500 animate-bounce" />
                        <span className="text-xs font-semibold text-slate-500 mt-2">Slot Vazio</span>
                      </div>
                    )}
                  </div>
                  {slots.conversao && (
                    <div className="mt-4 flex items-center justify-between border-t border-[#ff6a00]/15 pt-3">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">ATIVO</span>
                      <span className="text-[10px] text-slate-400 font-mono">Rotina #02</span>
                    </div>
                  )}
                </div>

                {/* Slot 3: Escala */}
                <div className={`relative rounded-[20px] border p-5 flex flex-col justify-between min-h-[170px] transition-all ${slots.escala ? 'border-[#ff6a00] bg-[#ff6a00]/10 shadow-[0_10px_30px_rgba(255,106,0,0.1)]' : 'border-dashed border-[#ff6a00]/25 bg-zinc-950/45 backdrop-blur-md'}`}>
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">3. Escala</span>
                      {slots.escala ? (
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      ) : (
                        <span className="inline-flex h-2 w-2 rounded-full bg-amber-500/40" />
                      )}
                    </div>
                    {slots.escala ? (
                      <div>
                        <h4 className="text-base font-bold text-white leading-tight">{slots.escala.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-3">{slots.escala.description}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-2 text-center">
                        <Plus size={20} className="text-slate-500 animate-bounce" />
                        <span className="text-xs font-semibold text-slate-500 mt-2">Slot Vazio</span>
                      </div>
                    )}
                  </div>
                  {slots.escala && (
                    <div className="mt-4 flex items-center justify-between border-t border-[#ff6a00]/15 pt-3">
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">ATIVO</span>
                      <span className="text-[10px] text-slate-400 font-mono">Rotina #03</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Selector Tab Controls */}
              <div className="flex border-b border-[#ff6a00]/15">
                <button
                  onClick={() => setActiveTab('aquisicao')}
                  className={`flex-1 pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${activeTab === 'aquisicao' ? 'border-[#ff6a00] text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
                >
                  Agentes de Aquisição
                </button>
                <button
                  onClick={() => setActiveTab('conversao')}
                  className={`flex-1 pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${activeTab === 'conversao' ? 'border-[#ff6a00] text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
                >
                  Agentes de Conversão
                </button>
                <button
                  onClick={() => setActiveTab('escala')}
                  className={`flex-1 pb-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${activeTab === 'escala' ? 'border-[#ff6a00] text-white' : 'border-transparent text-slate-400 hover:text-white'}`}
                >
                  Agentes de Escala
                </button>
              </div>

              {/* Selector Grid of Agents */}
              <div className="grid gap-3 sm:grid-cols-2">
                <AnimatePresence mode="wait">
                  {groupedAgents[activeTab].map((agent) => {
                    const isSelected = slots[activeTab]?.title === agent.title;
                    return (
                      <motion.div
                        key={agent.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`group relative rounded-[16px] border p-4 cursor-pointer transition-all flex flex-col justify-between min-h-[140px] ${isSelected ? 'border-[#ff6a00] bg-[#ff6a00]/10 shadow-[0_10px_30px_rgba(255,106,0,0.15)]' : 'border-[#ff6a00]/15 bg-zinc-950/65 hover:border-[#ff6a00]/30 hover:bg-zinc-950/85'}`}
                        onClick={() => handleAssignAgent(activeTab, agent)}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h4 className="text-sm font-bold text-white">{agent.title}</h4>
                            <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${isSelected ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-[#ff6a00]/25 text-slate-400 group-hover:border-[#ff6a00] group-hover:text-[#ff8f3a] transition-all'}`}>
                              {isSelected ? <Check size={10} /> : <Plus size={10} />}
                            </span>
                          </div>
                          <p className="text-[11px] leading-relaxed text-slate-400 line-clamp-3">
                            {agent.description}
                          </p>
                        </div>
                        <div className="mt-3 text-[10px] font-mono text-[#ff8f3a] uppercase font-bold tracking-wider">
                          {agent.category}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* Right: Lucca Insight Chat */}
            <div className="space-y-6">
              {/* Lucca Embedded Interactive Chat */}
              <LuccaEmbeddedChat slots={slots} />
            </div>
          </div>
        </div>
      </section>

      {/* SEGMENTOS IMPACTADOS */}
      <section id="segmentos" className="relative z-10 py-16 w-full px-5 md:px-8 overflow-hidden">
        {/* Background image (backgrd_dark.png) */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('/images/backgrd_dark.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 z-0 bg-black/60" />
        
        {/* Smooth Fade Transitions */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#040811] to-transparent z-0 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#040811] to-transparent z-0 pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-[1260px]">
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
                className="group relative overflow-hidden rounded-[24px] border border-[#ff6a00]/20 bg-zinc-950/85 backdrop-blur-xl min-h-[380px] flex flex-col justify-end p-6 hover:border-[#ff6a00]/40 transition-all hover:-translate-y-1 shadow-[0_18px_48px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_50px_rgba(255,106,0,0.15)]"
              >
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
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section id="depoimentos" className="relative z-10 py-16 bg-[#040811] w-full px-5 md:px-8">
        <div className="mx-auto max-w-[1260px]">
          <div className="text-center max-w-[720px] mx-auto mb-16">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#ff6a00]">Depoimentos</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-2">
              Quem Cresce com a Gente, Recomenda
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((item) => (
              <div 
                key={item.name} 
                className="rounded-[24px] border border-[#ff6a00]/20 bg-zinc-950/85 backdrop-blur-xl p-6 flex flex-col justify-between hover:border-[#ff6a00]/40 transition-[box-shadow,border-color] duration-300 hover:shadow-[0_20px_50px_rgba(255,106,0,0.15)] shadow-[0_18px_48px_rgba(0,0,0,0.5)]"
              >
                <div>
                  <span className="text-4xl font-black text-[#ff6a00] leading-none">“</span>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">{item.quote}</p>
                </div>
                <div className="mt-6 flex items-center gap-3 border-t border-[#ff6a00]/15 pt-4">
                  <Image 
                    src={item.avatar} 
                    alt={item.name} 
                    width={44} 
                    height={44} 
                    className="h-11 w-11 rounded-full object-cover border border-[#ff6a00]/30" 
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES AND RESOURCES SECTION (IMPORTED) */}
      <ValuesResourcesSection />

      {/* FAQ SECTION - layout inspired by Valores e Recursos card */}
      <section id="faq" className="relative z-10 py-16 border-b border-white/5 bg-[#040811] w-full px-5 md:px-8">
        <div className="mx-auto max-w-[1260px]">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] items-start">
            {/* Left: Like the pricing left column */}
            <div className="lg:sticky lg:top-28">
              <span className="text-xs font-extrabold uppercase tracking-widest text-[#ff6a00]">Perguntas Frequentes</span>
              <h2 className="text-3xl font-extrabold mt-2 leading-tight">Ficou com alguma dúvida?</h2>
              <p className="text-slate-400 mt-4 text-sm leading-relaxed">
                Separamos as principais perguntas de empresários sobre a implantação da inteligência artificial agêntica na operação de tráfego e vendas.
              </p>

              {/* Feature check list - like Valores e Recursos */}
              <ul className="mt-6 space-y-3">
                {[
                  'Consultoria 100% personalizada',
                  'Implantação em até 72 horas',
                  'Suporte prioritário e onboarding',
                  'IA Agêntica monitorando 24/7',
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ff6a00] text-white">
                      <Check size={11} strokeWidth={3.5} />
                    </span>
                    {feat}
                  </li>
                ))}
              </ul>

              <button 
                onClick={handleOpenSpecialistChat}
                className="mt-8 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#ff6a00] hover:bg-[#ff7b1a] transition-colors px-6 py-3 text-sm font-extrabold text-white shadow-[0_4px_20px_rgba(255,106,0,0.3)] hover:shadow-[0_4px_25px_rgba(255,106,0,0.45)]"
              >
                Falar com Especialista
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Right: Accordion card like pricing card */}
            <div className="rounded-[24px] border border-[#ff6a00]/20 bg-zinc-950/85 backdrop-blur-xl p-6 shadow-[0_18px_48px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff6a00]/5 filter blur-[50px] rounded-full pointer-events-none" />
              <div className="space-y-3 relative z-10">
                {faq.map((item, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div 
                      key={idx} 
                      className={`rounded-[16px] border transition-all duration-300 overflow-hidden ${
                        isOpen 
                          ? 'border-[#ff6a00]/30 bg-zinc-900/60 shadow-[0_4px_16px_rgba(255,106,0,0.08)]' 
                          : 'border-[#ff6a00]/10 bg-zinc-950/40 hover:border-[#ff6a00]/20'
                      }`}
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-white hover:text-[#ff8f3a] transition-colors cursor-pointer"
                      >
                        <span>{item.q}</span>
                        <span className={`shrink-0 ml-3 transform transition-transform ${isOpen ? 'rotate-90 text-[#ff6a00]' : 'text-slate-400'}`}>
                          <ChevronRight size={16} />
                        </span>
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
                            <div className="px-5 pb-5 text-xs leading-relaxed text-slate-300 border-t border-[#ff6a00]/15 pt-4">
                              {item.a}
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
        </div>
      </section>

      {/* PRIMARY FOOTER */}
      <footer className="relative z-10 w-full overflow-hidden border-t border-white/5 bg-[#040811]/95 backdrop-blur-xl">
        <div className="relative z-10 mx-auto max-w-[1260px] px-5 py-12 md:px-8">
          <div className="grid gap-8 border-b border-[#ff6a00]/15 pb-8 md:grid-cols-5 text-xs">
            <div>
              <h4 className="font-extrabold uppercase text-[#ff8f3a] mb-4">Soluções</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#control-room" className="hover:text-white transition-colors">Agentes IA</a></li>
                <li><a href="#segmentos" className="hover:text-white transition-colors">Segmentos</a></li>
                <li><a href="/servicos" className="hover:text-white transition-colors">Portfólio</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-extrabold uppercase text-[#ff8f3a] mb-4">Empresa</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="/a-neuroads" className="hover:text-white transition-colors">Sobre a NeuroAds</a></li>
                <li><a href="/whitepaper_ia_vendas" className="hover:text-white transition-colors">Whitepaper Vendas</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-extrabold uppercase text-[#ff8f3a] mb-4">Recursos</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="/conteudos" className="hover:text-white transition-colors">Blog Além do Algoritmo</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">Central de Ajuda</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-extrabold uppercase text-[#ff8f3a] mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="/privacidade" className="hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="/termos" className="hover:text-white transition-colors">Termos de Uso</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-extrabold uppercase text-[#ff8f3a] mb-4">Mídia Social</h4>
              <p className="text-slate-400 leading-relaxed mb-4">
                Acompanhe discussões de IA agêntica, automações e performance comercial.
              </p>
              <div className="flex items-center gap-3 mt-2">
                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/company/neuroads"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn NeuroAds"
                  className="group inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-[#0077B5]/20 hover:border-[#0077B5]/40 transition-all cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-slate-400 group-hover:fill-[#0077B5] transition-colors" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                {/* Instagram */}
                <a
                  href="https://www.instagram.com/neuroads.ia"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram NeuroAds"
                  className="group inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-[#E1306C]/20 hover:border-[#E1306C]/40 transition-all cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-slate-400 group-hover:fill-[#E1306C] transition-colors" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                  </svg>
                </a>
                {/* YouTube */}
                <a
                  href="https://www.youtube.com/@neuroads"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube NeuroAds"
                  className="group inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-[#FF0000]/20 hover:border-[#FF0000]/40 transition-all cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-slate-400 group-hover:fill-[#FF0000] transition-colors" xmlns="http://www.w3.org/2000/svg">
                    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-500">
            <p>© {new Date().getFullYear()} NeuroAds LP. Todos os direitos reservados.</p>
            <p className="flex items-center gap-1 font-mono uppercase">
              <Zap size={10} className="text-[#ff6a00]" /> Powered by Agential AI
            </p>
          </div>
        </div>
      </footer>

      {/* Specialist Lucca Chat Modal */}
      <LuccaSpecialistChatModal
        isOpen={isLuccaChatOpen}
        onClose={() => setIsLuccaChatOpen(false)}
        autoUserMessage={luccaAutoMessage}
      />
    </main>
  );
}
