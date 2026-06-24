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
    printImage: '/images/prints/social-media.png',
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
    printImage: '/images/prints/ecommerce.png',
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
    printImage: '/images/prints/marketing.png',
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
    printImage: '/images/prints/campanhas.png',
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
    printImage: '/images/prints/posicionamento.png',
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
  return (
    <section className="relative z-10 py-24 px-5 md:px-8 bg-transparent w-full overflow-hidden">
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

        <div className="space-y-20 lg:space-y-32">
          {useCasesSectors.map((sector, idx) => (
            <div key={sector.id} className="relative perspective-1000">
              <motion.div
                initial={{ opacity: 0, rotateX: 25, y: 120, scale: 0.95, translateZ: -100 }}
                whileInView={{ opacity: 1, rotateX: 0, y: 0, scale: 1, translateZ: 0 }}
                viewport={{ once: true, margin: "-120px" }}
                transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}
                className="w-full transform-style-3d group"
              >
                <div className="relative rounded-[24px] border border-white/5 bg-zinc-950/90 overflow-hidden shadow-[0_18px_48px_rgba(0,0,0,0.5)] hover:border-[#ff6a00]/30 transition-all duration-700">
                  {/* Subtle Glow Background */}
                  <div className={`absolute top-0 w-64 h-64 bg-[#ff6a00]/5 rounded-full filter blur-[80px] pointer-events-none transition-all duration-700 group-hover:bg-[#ff6a00]/15 group-hover:scale-150 ${idx % 2 !== 0 ? 'left-0' : 'right-0'}`} />
                  
                  <div className={`flex w-full p-8 lg:p-14 ${idx % 2 !== 0 ? 'lg:justify-end' : 'lg:justify-start'}`}>
                    
                    {/* Text Content and Benefits */}
                    <div className="flex flex-col gap-6 relative z-10 w-full lg:max-w-[70%]">
                      <div className="flex items-center gap-4">
                        <div className="w-1.5 h-8 bg-[#ff6a00] rounded-full shadow-[0_0_12px_rgba(255,106,0,0.6)]" />
                        <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">{sector.title}</h3>
                      </div>
                      <p className="text-slate-300 text-[15px] sm:text-base leading-relaxed">
                        {sector.description}
                      </p>
                      
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {sector.cards.map((card, cIdx) => (
                          <div
                            key={cIdx}
                            className="rounded-xl border border-white/5 bg-zinc-900/40 p-5 hover:bg-zinc-900/80 hover:border-white/10 transition-colors"
                          >
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#ff8f3a]">
                              Diferencial
                            </span>
                            <h4 className="text-[15px] font-bold text-white mt-1.5">{card.title}</h4>
                            <p className="text-[12px] text-slate-400 mt-2 leading-relaxed">{card.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
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
    <main className="relative min-h-screen bg-[#000000] text-white overflow-x-hidden selection:bg-[#ff6a00] selection:text-white">
      {/* Background radial overlays — CSS radial-gradient avoids filter layers entirely */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            'radial-gradient(ellipse 600px 600px at 25% 0%, rgba(255,106,0,0.06) 0%, transparent 70%)',
            'radial-gradient(ellipse 700px 700px at 75% 35%, rgba(30,30,30,0.10) 0%, transparent 70%)',
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

      {/* HERO SECTION — CENTERED COMMAND STRUCTURE */}
      <section className="relative w-full min-h-[92vh] flex items-center z-10 pt-[90px] pb-20 overflow-hidden bg-transparent">
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

        {/* Smooth top gradient */}
        <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-[#000000] via-[#000000]/70 to-transparent z-[1] pointer-events-none" />

        {/* Center readability vignette */}
        <div className="absolute inset-0 z-[1] pointer-events-none" style={{
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(4,8,17,0.55) 0%, rgba(4,8,17,0.10) 100%)'
        }} />

        {/* Side darkening */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#000000]/60 via-transparent to-[#000000]/60 z-[1] pointer-events-none" />

        {/* Cinematic bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#000000] to-transparent z-[1] pointer-events-none" />

        {/* CENTERED CONTENT */}
        <div className="relative z-10 w-full flex flex-col items-center text-center px-4 sm:px-6 max-w-[900px] mx-auto pt-2">

          {/* Feature badges row */}
          <motion.div
            variants={revealVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.05 }}
            className="mb-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
          >
            {[
              { icon: <Cpu size={15} />, label: 'IA Agêntica', sub: 'Autônoma e orientada a metas' },
              { icon: <TrendingUp size={15} />, label: 'Dados em tempo real', sub: 'Decisões baseadas em sinal' },
              { icon: <Target size={15} />, label: 'Resultados mensuráveis', sub: 'Foco no que importa' },
            ].map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.08] bg-black/30 backdrop-blur-sm min-w-[200px]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#ff6a00]/20 text-[#ff8f3a] border border-[#ff6a00]/30">
                  {badge.icon}
                </span>
                <div className="text-left">
                  <p className="text-[13px] font-bold text-white leading-none">{badge.label}</p>
                  <p className="text-[11px] text-white/50 mt-0.5">{badge.sub}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Main headline */}
          <motion.h1
            variants={revealVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.08 }}
            className="text-[50px] font-black leading-[1.08] tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.7)]"
          >
            Não é sobre investimento
            <br />
            <span className="text-[#ff6a00]">é sobre ESTRATÉGIA!</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={revealVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.16 }}
            className="mt-5 text-[17px] sm:text-[20px] text-white/65 leading-relaxed max-w-[680px] drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)] font-medium"
          >
            Agentes que monitoram, otimizam e executam{" "}
            <br className="hidden sm:inline" />
            insights e oportunidades.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={revealVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.24 }}
            className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
          >
            <button
              type="button"
              onClick={handleOpenSpecialistChat}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F24900] to-[#FF8805] hover:from-[#d93f00] hover:to-[#e07500] transition-all px-8 py-4 text-[14px] font-extrabold text-white shadow-[0_4px_28px_rgba(180,70,0,0.5)] cursor-pointer"
            >
              Fale com um especialista
              <ArrowRight size={16} />
            </button>
            <Link
              href="/hub"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 hover:border-white/40 bg-white/[0.04] hover:bg-white/[0.08] transition-all px-8 py-4 text-[14px] font-bold text-white/80 hover:text-white"
            >
              Explorar o Hub
              <ArrowRight size={14} />
            </Link>
          </motion.div>


        </div>
      </section>

      {/* CASOS DE USO POR SETOR */}
      <UseCasesSection />

      {/* AGENTES EM DESTAQUE */}
      <section className="relative z-10 py-24 px-5 md:px-8 bg-transparent w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-[0.10]" style={{ backgroundColor: '#ff6a00' }} />
          <div className="absolute bottom-0 -left-16 w-72 h-72 rounded-full blur-3xl opacity-[0.07]" style={{ backgroundColor: '#3b82f6' }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="dots-agentes" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="white" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#dots-agentes)" />
          </svg>
        </div>
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
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-16 left-1/3 w-80 h-80 rounded-full blur-3xl opacity-[0.08]" style={{ backgroundColor: '#ff6a00' }} />
          <div className="absolute -bottom-10 -right-20 w-72 h-72 rounded-full blur-3xl opacity-[0.06]" style={{ backgroundColor: '#10b981' }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="dots-implantacao" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="white" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#dots-implantacao)" />
          </svg>
        </div>
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
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-[0.10]" style={{ backgroundColor: '#ff6a00' }} />
          <div className="absolute top-1/2 -right-16 w-80 h-80 rounded-full blur-3xl opacity-[0.07]" style={{ backgroundColor: '#3b82f6' }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="dots-porque" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="white" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#dots-porque)" />
          </svg>
        </div>
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
                      <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-[#000000]/40 to-transparent z-0" />
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
      <section className="relative z-10 py-20 px-5 md:px-8 w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 -translate-y-1/2 -left-24 w-80 h-80 rounded-full blur-3xl opacity-[0.08]" style={{ backgroundColor: '#a855f7' }} />
          <div className="absolute top-0 right-1/4 w-64 h-64 rounded-full blur-3xl opacity-[0.06]" style={{ backgroundColor: '#ff6a00' }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="dots-depoimentos" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="white" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#dots-depoimentos)" />
          </svg>
        </div>
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
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-500/15 border border-slate-500/30">
                      <LayoutDashboard size={14} className="text-slate-400" />
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
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[280px] rounded-full blur-3xl opacity-[0.12]" style={{ backgroundColor: '#ff6a00' }} />
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full blur-3xl opacity-[0.05]" style={{ backgroundColor: '#ff6a00' }} />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-[0.05]" style={{ backgroundColor: '#a855f7' }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs><pattern id="dots-cta" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="white" /></pattern></defs>
            <rect width="100%" height="100%" fill="url(#dots-cta)" />
          </svg>
        </div>
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
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F24900] to-[#FF8805] hover:from-[#d93f00] hover:to-[#e07500] transition-all px-10 py-4 text-[15px] font-extrabold text-white shadow-[0_4px_32px_rgba(255,106,0,0.45)] cursor-pointer"
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
