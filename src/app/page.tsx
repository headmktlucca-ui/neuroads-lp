'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform, MotionValue } from 'framer-motion';
import { Database, Filter, Cpu, ArrowRight, LayoutDashboard, BarChart3, Network, UserCheck, Mail, MessageSquare, CheckCircle2, ChevronDown, Menu, X, Volume2, VolumeX } from 'lucide-react';
import HeroCircuitBackground from '@/components/ui/HeroCircuitBackground';
import HeroSilkBackground from '@/components/ui/HeroSilkBackground';
import FunnelInteractiveShowcase from '@/components/neuroads/FunnelInteractiveShowcase';
import PricingValuesSection from '@/components/neuroads/PricingValuesSection';
import { ScreenshotShowcase } from '@/components/ui/screenshot-showcase';

function IconBotAI() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="p-bot-grad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF8040" /><stop offset="1" stopColor="#E03A00" />
        </linearGradient>
        <filter id="p-bot-shadow"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#FF4500" floodOpacity="0.3" /></filter>
      </defs>
      <rect x="9" y="13" width="30" height="23" rx="7" fill="url(#p-bot-grad)" filter="url(#p-bot-shadow)" />
      <ellipse cx="19" cy="18" rx="8" ry="4" fill="white" fillOpacity="0.22" />
      <circle cx="18" cy="24" r="3.5" fill="white" fillOpacity="0.95" />
      <circle cx="30" cy="24" r="3.5" fill="white" fillOpacity="0.95" />
      <circle cx="18" cy="24" r="1.8" fill="#CC3300" fillOpacity="0.75" />
      <circle cx="30" cy="24" r="1.8" fill="#CC3300" fillOpacity="0.75" />
      <rect x="17" y="30" width="14" height="2" rx="1" fill="white" fillOpacity="0.75" />
      <rect x="22.5" y="6" width="3" height="7" rx="1.5" fill="#FF7040" />
      <circle cx="24" cy="6" r="2.5" fill="#FF9060" />
      <ellipse cx="24" cy="42" rx="11" ry="2.5" fill="#CC3300" fillOpacity="0.15" />
    </svg>
  );
}

function IconBullseye() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="p-bull-grad" x1="5" y1="5" x2="43" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5AAEFF" /><stop offset="1" stopColor="#003EB3" />
        </linearGradient>
        <linearGradient id="p-bull-mid" x1="10" y1="10" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3D8DFF" /><stop offset="1" stopColor="#0044CC" />
        </linearGradient>
        <filter id="p-bull-shadow"><feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#0044CC" floodOpacity="0.35" /></filter>
      </defs>
      <circle cx="24" cy="24" r="17" fill="url(#p-bull-grad)" filter="url(#p-bull-shadow)" />
      <ellipse cx="17" cy="15" rx="8" ry="5" fill="white" fillOpacity="0.22" />
      <circle cx="24" cy="24" r="11.5" fill="white" fillOpacity="0.18" />
      <circle cx="24" cy="24" r="10.5" fill="url(#p-bull-mid)" />
      <circle cx="24" cy="24" r="5.5" fill="white" fillOpacity="0.25" />
      <circle cx="24" cy="24" r="4.5" fill="url(#p-bull-grad)" />
      <circle cx="24" cy="24" r="2" fill="white" fillOpacity="0.9" />
      <ellipse cx="24" cy="44" rx="13" ry="2.5" fill="#003EB3" fillOpacity="0.15" />
    </svg>
  );
}

function IconGearWorkflow() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="p-gearw-grad" x1="5" y1="5" x2="43" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9B6EE8" /><stop offset="1" stopColor="#4B1FA8" />
        </linearGradient>
        <filter id="p-gearw-shadow"><feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#4B1FA8" floodOpacity="0.35" /></filter>
      </defs>
      <path d="M24 6 L26.5 9.5 L30.5 8.5 L31.5 12.5 L35.5 13 L35 17 L38.5 19 L37 22.5 L40 25.5 L37.5 28 L38.5 32 L35 32.5 L33.5 36 L30 35 L27 38.5 L24 36.5 L21 38.5 L18 35 L14.5 36 L13 32.5 L9.5 32 L10.5 28 L8 25.5 L11 22.5 L9.5 19 L13 17 L12.5 13 L16.5 12.5 L17.5 8.5 L21.5 9.5 Z" fill="url(#p-gearw-grad)" filter="url(#p-gearw-shadow)" />
      <ellipse cx="18" cy="14" rx="7" ry="4" fill="white" fillOpacity="0.22" />
      <circle cx="24" cy="24" r="7" fill="white" fillOpacity="0.2" />
      <circle cx="24" cy="24" r="6" fill="url(#p-gearw-grad)" />
      <circle cx="24" cy="24" r="3" fill="white" fillOpacity="0.3" />
      <ellipse cx="24" cy="43" rx="13" ry="2.5" fill="#4B1FA8" fillOpacity="0.15" />
    </svg>
  );
}

function IconPieChart() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="p-pie-grad" x1="5" y1="5" x2="43" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF8040" /><stop offset="1" stopColor="#E03A00" />
        </linearGradient>
        <filter id="p-pie-shadow"><feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#E03A00" floodOpacity="0.3" /></filter>
      </defs>
      <circle cx="24" cy="24" r="17" fill="url(#p-pie-grad)" filter="url(#p-pie-shadow)" />
      <ellipse cx="17" cy="15" rx="8" ry="4.5" fill="white" fillOpacity="0.22" />
      <line x1="24" y1="24" x2="24" y2="7" stroke="white" strokeWidth="2" strokeOpacity="0.7" />
      <line x1="24" y1="24" x2="39" y2="31" stroke="white" strokeWidth="2" strokeOpacity="0.7" />
      <line x1="24" y1="24" x2="10" y2="35" stroke="white" strokeWidth="2" strokeOpacity="0.7" />
      <path d="M24 24 L24 7 A17 17 0 0 1 39 31 Z" fill="white" fillOpacity="0.15" />
      <ellipse cx="24" cy="44" rx="13" ry="2.5" fill="#E03A00" fillOpacity="0.15" />
    </svg>
  );
}

function IconLineChart() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="p-lc-grad" x1="5" y1="5" x2="43" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38D4C0" /><stop offset="1" stopColor="#0369A1" />
        </linearGradient>
        <filter id="p-lc-shadow"><feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#0369A1" floodOpacity="0.35" /></filter>
      </defs>
      <rect x="7" y="9" width="34" height="27" rx="7" fill="url(#p-lc-grad)" filter="url(#p-lc-shadow)" />
      <ellipse cx="18" cy="15" rx="9" ry="4" fill="white" fillOpacity="0.22" />
      <polyline points="12,30 18,22 24,26 30,16 36,20" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.9" />
      <circle cx="18" cy="22" r="2" fill="white" fillOpacity="0.9" />
      <circle cx="30" cy="16" r="2" fill="white" fillOpacity="0.9" />
      <line x1="11" y1="33" x2="37" y2="33" stroke="white" strokeWidth="1.5" strokeOpacity="0.4" />
      <ellipse cx="24" cy="42" rx="13" ry="2.5" fill="#0369A1" fillOpacity="0.15" />
    </svg>
  );
}

function IconNodesMerge() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="p-nm-grad" x1="5" y1="5" x2="43" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D98C" /><stop offset="1" stopColor="#047857" />
        </linearGradient>
        <filter id="p-nm-shadow"><feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#047857" floodOpacity="0.35" /></filter>
      </defs>
      <circle cx="24" cy="24" r="17" fill="url(#p-nm-grad)" filter="url(#p-nm-shadow)" />
      <ellipse cx="17" cy="15" rx="8" ry="4.5" fill="white" fillOpacity="0.22" />
      <line x1="15" y1="13" x2="15" y2="35" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.85" />
      <line x1="15" y1="21" x2="24" y2="28" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.85" />
      <line x1="33" y1="13" x2="24" y2="28" stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.85" />
      <circle cx="15" cy="13" r="3" fill="white" fillOpacity="0.95" />
      <circle cx="33" cy="13" r="3" fill="white" fillOpacity="0.95" />
      <circle cx="15" cy="35" r="3" fill="white" fillOpacity="0.95" />
      <circle cx="24" cy="28" r="3.5" fill="white" fillOpacity="0.95" />
      <ellipse cx="24" cy="44" rx="13" ry="2.5" fill="#047857" fillOpacity="0.15" />
    </svg>
  );
}

function IconCrosshairTarget() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="p-ch-grad" x1="5" y1="5" x2="43" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFC040" /><stop offset="1" stopColor="#B45309" />
        </linearGradient>
        <filter id="p-ch-shadow"><feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#B45309" floodOpacity="0.35" /></filter>
      </defs>
      <circle cx="24" cy="24" r="17" fill="url(#p-ch-grad)" filter="url(#p-ch-shadow)" />
      <ellipse cx="17" cy="15" rx="8" ry="4.5" fill="white" fillOpacity="0.22" />
      <circle cx="24" cy="24" r="10" fill="white" fillOpacity="0.18" />
      <circle cx="24" cy="24" r="9" fill="url(#p-ch-grad)" />
      <line x1="24" y1="8" x2="24" y2="17" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.9" />
      <line x1="24" y1="31" x2="24" y2="40" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.9" />
      <line x1="8" y1="24" x2="17" y2="24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.9" />
      <line x1="31" y1="24" x2="40" y2="24" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.9" />
      <circle cx="24" cy="24" r="3" fill="white" fillOpacity="0.9" />
      <ellipse cx="24" cy="44" rx="13" ry="2.5" fill="#B45309" fillOpacity="0.15" />
    </svg>
  );
}

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 80,
      damping: 20
    }
  }
};

function AgentProfileCard({ agent }: { agent: any }) {
  if (!agent) return null;

  return (
    <motion.div
      key={agent.id}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="w-full mt-8 flex flex-col md:flex-row items-center gap-6 md:gap-0 relative pl-0 md:pl-4"
    >
      {/* Left Side: Avatar Image */}
      <div className="w-[120px] h-[120px] md:w-[150px] md:h-[150px] rounded-3xl overflow-hidden border border-white/60 bg-white shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] z-10 shrink-0 relative">
        <Image
          src={agent.image}
          alt={agent.title}
          fill
          className="object-cover object-center scale-[1.05]"
          sizes="(max-width: 768px) 100vw, 150px"
          priority
        />
      </div>

      {/* Right Side: Overlay Details Card */}
      <div className="w-full md:w-[75%] md:-ml-8 p-6 md:p-6 rounded-3xl border border-white/80 bg-white shadow-[8px_8px_16px_#c8d0e7,-8px_-8px_16px_#ffffff] z-20 flex flex-col space-y-3">
        <div className="space-y-0.5">
          <h4 className="font-title font-extrabold text-xl text-slate-900 tracking-tight leading-none">
            {agent.title}
          </h4>
          <p className="text-[10px] font-extrabold text-[#FF5500] uppercase tracking-wider">
            {agent.category}
          </p>
        </div>

        <p className="text-slate-600 text-[11px] leading-relaxed font-normal min-h-[50px]">
          {agent.bio}
        </p>

        <div className="pt-2.5 border-t border-slate-300/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
            Canais de Integração
          </span>
          <div className="flex gap-2">
            {agent.channels?.map((channel: string, idx: number) => (
              <div
                key={idx}
                className="w-7 h-7 rounded-full bg-white border border-white/60 shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff] flex items-center justify-center text-slate-500 hover:text-[#FF5500] hover:scale-[1.05] transition-all duration-200 cursor-pointer"
                title={channel}
              >
                {channel === 'Slack' && <Cpu size={12} className="stroke-[2.5]" />}
                {channel === 'E-mail' && <Mail size={12} className="stroke-[2.5]" />}
                {channel === 'WhatsApp' && <MessageSquare size={12} className="stroke-[2.5]" />}
                {channel === 'Hub' && <Database size={12} className="stroke-[2.5]" />}
                {channel !== 'Slack' && channel !== 'E-mail' && channel !== 'WhatsApp' && channel !== 'Hub' && (
                  <span className="text-[8px] font-black uppercase">{channel.slice(0, 2)}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function TempLandingPage() {
  const [pulse, setPulse] = useState(true);
  const [activeAgent, setActiveAgent] = useState<any>(null);
  const [isSobreOpen, setIsSobreOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const solutionsSectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: solutionsScrollYProgress } = useScroll({
    target: solutionsSectionRef,
    offset: ["start end", "end start"]
  });
  const solutionsBackgroundY = useTransform(solutionsScrollYProgress, [0, 1], [-300, 300]);

  // Live indicator pulsing effect
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => !prev);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const orbitalItems = [
    {
      id: 1,
      title: 'Ulisses',
      image: '/images/Avatar Agentes IA/Avatar_Ulisses.png',
      category: 'Orquestrador Central',
      description: 'Responsável por coordenar o fluxo operacional e unificar os insights estratégicos.',
      bio: 'Ulisses é o orquestrador central do ecossistema NeuroAds. Ele distribui os briefings diários para os demais agentes, acompanha o status de cada conversão e consolida relatórios analíticos de alta performance para os gestores, garantindo a integração contínua do funil comercial.',
      channels: ['Slack', 'E-mail', 'WhatsApp', 'Hub']
    },
    {
      id: 2,
      title: 'Vitor',
      image: '/images/Avatar Agentes IA/Avatar_Vitor.png',
      category: 'Agente SDR',
      description: 'Especialista em prospecção ativa e qualificação de novas oportunidades B2B.',
      bio: 'Vitor atua na linha de frente do comercial. Ele monitora páginas de captura de alta intenção, aciona sequências de qualificação personalizadas em tempo real e realiza o handoff automático de leads quentes para que o time humano finalize o fechamento.',
      channels: ['WhatsApp', 'E-mail', 'Hub']
    },
    {
      id: 3,
      title: 'Manu',
      image: '/images/Avatar Agentes IA/Avatar_Manu.png',
      category: 'Agente de Suporte',
      description: 'Atendimento inteligente e identificação de gargalos de experiência.',
      bio: 'Manu soluciona chamados recorrentes de nível 1 instantaneamente. Ela analisa o sentimento do cliente e, quando detecta um padrão de dúvida repetido, alerta o time de conteúdo para a criação imediata de materiais educativos de suporte.',
      channels: ['WhatsApp', 'Slack', 'Hub']
    },
    {
      id: 4,
      title: 'Igor',
      image: '/images/Avatar Agentes IA/Avatar_Igor.png',
      category: 'Agente de Inteligência de Dados',
      description: 'Monitoramento preditivo e alertas de anomalias em tempo real.',
      bio: 'Igor audita funis de vendas, cruzando dados de anúncios com o CRM. Ele calcula o custo de aquisição (CAC), o retorno de investimento (ROI) e envia notificações automáticas ao time de tráfego se detectar desvios de orçamento ou queda de performance.',
      channels: ['Hub', 'Slack', 'E-mail']
    },
    {
      id: 5,
      title: 'Tainá',
      image: '/images/Avatar Agentes IA/Avatar_Taina.png',
      category: 'Agente de Conteúdo',
      description: 'Geração automatizada de copys, artigos e materiais de conversão.',
      bio: 'Tainá desenvolve textos persuasivos para anúncios pagos, redige newsletters semanais e cria artigos focados em educação de leads, baseando-se nas objeções mapeadas pelo time comercial e nas dúvidas vindas do suporte.',
      channels: ['Hub', 'WordPress', 'E-mail']
    },
    {
      id: 6,
      title: 'Breno',
      image: '/images/Avatar Agentes IA/Avatar_Breno.png',
      category: 'Agente Closer',
      description: 'Foco total no fechamento de contas e propostas personalizadas.',
      bio: 'Breno gerencia negociações complexas. He formula propostas comerciais com base no budget do lead, automatiza follow-ups após o envio e encaminha o contrato assinado diretamente para a fase de onboarding de novos clientes.',
      channels: ['E-mail', 'WhatsApp', 'Hub']
    },
    {
      id: 7,
      title: 'Paola',
      image: '/images/Avatar Agentes IA/Avatar_Paola.png',
      category: 'Agente de Tráfego',
      description: 'Gestão, escala e otimização automatizada de campanhas.',
      bio: 'Paola atua no Google Ads e Meta Ads. Ela analisa o ROAS em tempo real, substitui criativos em fadiga, realiza testes A/B de headlines e descobre novos públicos semelhantes (lookalike) com menor custo por mil impressões (CPM).',
      channels: ['Google Ads', 'Meta Ads', 'Hub']
    },
    {
      id: 8,
      title: 'Raíssa',
      image: '/images/Avatar Agentes IA/Avatar_Raissa.png',
      category: 'Agente de Upsell & Reativação',
      description: 'Maximização de LTV e recuperação de contas inativas na base.',
      bio: 'Raíssa monitora a satisfação e o uso da plataforma pelos clientes ativos. Ela ativa campanhas automáticas de upsell no momento de maior engajamento e cria fluxos de recuperação para reativar clientes inativos há mais de 30 dias.',
      channels: ['WhatsApp', 'E-mail', 'Hub']
    },
    {
      id: 9,
      title: 'Heitor',
      image: '/images/Avatar Agentes IA/Avatar_Heitor.png',
      category: 'Agente de Processos & Integrações',
      description: 'Implementação ágil e automações de fluxo de trabalho.',
      bio: 'Heitor gerencia a integração técnica de novos leads. Ele conecta o CRM a ferramentas externas, valida chaves de API do cliente e garante que toda a esteira de onboarding de marketing/vendas funcione perfeitamente sem falhas.',
      channels: ['Hub', 'APIs', 'Webhooks']
    },
    {
      id: 10,
      title: 'Laís',
      image: '/images/Avatar Agentes IA/Avatar_Lais.png',
      category: 'Agente de SEO & GEO',
      description: 'Otimização orgânica para buscadores e motores baseados em IA.',
      bio: 'Laís monitora o posicionamento orgânico da marca. Ela otimiza o SEO do blog para novas palavras-chave de baixa concorrência e estrutura dados de forma a posicionar o negócio no topo de buscadores generativos de IA (GEO).',
      channels: ['Hub', 'Google Search', 'SEO Tools']
    }
  ];

  useEffect(() => {
    setActiveAgent(orbitalItems[0]);
  }, []);

  // Rotaciona automaticamente os agentes no mobile (quando a animação orbital está oculta)
  useEffect(() => {
    const handleAutoRotate = () => {
      if (window.innerWidth < 1024) { // Breakpoint lg
        setActiveAgent((current: any) => {
          if (!current) return orbitalItems[0];
          const currentIndex = orbitalItems.findIndex((a) => a.id === current.id);
          const nextIndex = (currentIndex + 1) % orbitalItems.length;
          return orbitalItems[nextIndex];
        });
      }
    };

    const interval = setInterval(handleAutoRotate, 5000); // Rotaciona a cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const centerLogoNode = (
    <div className="w-20 h-20 rounded-full overflow-hidden bg-black flex items-center justify-center shadow-[4px_4px_12px_rgba(0,0,0,0.15),_inset_2px_2px_5px_rgba(255,255,255,0.1)] border border-neutral-950 select-none">
      <Image
        src="/images/icon_neuroads_transparente.png"
        alt="NeuroAds"
        width={56}
        height={56}
        className="object-contain"
        priority
      />
    </div>
  );

  return (
    <div className="bg-[#EDF1F5] min-h-screen text-slate-800 font-sans antialiased overflow-x-clip pb-0 selection:bg-[#FF5500]/20 selection:text-[#FF5500]">
      
      {/* ========================================================================= */}
      {/* HEADER TEMPLATE 01 */}
      {/* ========================================================================= */}
      <header className="fixed top-4 left-0 right-0 w-full z-[999] px-4 sm:px-8 lg:px-24">
        <div className="bg-transparent md:bg-white shadow-none md:shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] border-none md:border md:border-white/50 rounded-none md:rounded-full py-2 md:py-4 px-0 md:px-8 flex items-center justify-between transition-all duration-300">
          {/* Logo */}
          <Link href="#" className="flex items-center group transition-transform duration-300 hover:scale-[1.01]">
            <Image
              src="/images/Logos/Logo_primario.png"
              alt="NeuroAds Logo"
              width={172}
              height={39}
              className="h-7 md:h-9 w-auto object-contain"
              priority
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#publico-alvo" className="text-slate-650 font-medium text-sm hover:text-[#FF5500] transition-colors duration-200">
              Oportunidades
            </Link>
            <Link href="#agentes" className="text-slate-650 font-medium text-sm hover:text-[#FF5500] transition-colors duration-200">
              Agentes IA
            </Link>
            <Link href="#solucoes" className="text-slate-650 font-medium text-sm hover:text-[#FF5500] transition-colors duration-200">
              Soluções
            </Link>
            <Link href="#valores" className="text-slate-650 font-medium text-sm hover:text-[#FF5500] transition-colors duration-200">
              Valores
            </Link>
            <Link href="#demonstracao" className="text-slate-650 font-medium text-sm hover:text-[#FF5500] transition-colors duration-200">
              Demonstração
            </Link>
          </nav>

          {/* Action Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden md:inline-flex items-center justify-center font-bold text-xs px-6 py-2.5 rounded-full bg-white text-slate-700 shadow-[4px_4px_8px_#c8d0e7,-4px_-4px_8px_#ffffff] border border-white/60 hover:shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff] hover:bg-[#e4ecf5] active:scale-[0.98] transition-all duration-200"
            >
              Acessar Hub
            </Link>

            {/* Hamburger Toggle for Mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex md:hidden w-11 h-11 items-center justify-center rounded-full text-slate-700 hover:text-[#FF5500] active:bg-slate-200/50 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-16 left-4 right-4 bg-white border border-white/50 shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] rounded-[24px] p-6 flex flex-col gap-4 md:hidden z-[998]"
            >
              <Link
                href="#publico-alvo"
                onClick={() => setIsMenuOpen(false)}
                className="text-slate-650 font-bold text-xs uppercase tracking-wider hover:text-[#FF5500] py-2 transition-colors duration-200"
              >
                Oportunidades
              </Link>
              <Link
                href="#agentes"
                onClick={() => setIsMenuOpen(false)}
                className="text-slate-650 font-bold text-xs uppercase tracking-wider hover:text-[#FF5500] py-2 transition-colors duration-200"
              >
                Agentes IA
              </Link>
              <Link
                href="#solucoes"
                onClick={() => setIsMenuOpen(false)}
                className="text-slate-650 font-bold text-xs uppercase tracking-wider hover:text-[#FF5500] py-2 transition-colors duration-200"
              >
                Soluções
              </Link>
              <Link
                href="#valores"
                onClick={() => setIsMenuOpen(false)}
                className="text-slate-650 font-bold text-xs uppercase tracking-wider hover:text-[#FF5500] py-2 transition-colors duration-200"
              >
                Valores
              </Link>
              <Link
                href="#demonstracao"
                onClick={() => setIsMenuOpen(false)}
                className="text-slate-650 font-bold text-xs uppercase tracking-wider hover:text-[#FF5500] py-2 transition-colors duration-200"
              >
                Demonstração
              </Link>
              <div className="border-t border-slate-200 pt-4 mt-2">
                <Link
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center font-bold text-xs py-3 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#FF7A00] text-white shadow-[3px_3px_8px_rgba(255,85,0,0.25)]"
                >
                  Acessar Hub
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* HERO SECTION WITH NEURAL SILK BACKGROUND */}
      {/* ========================================================================= */}
      <section className="hero relative min-h-[70vh] overflow-hidden bg-gradient-to-br from-[#FAFBFD] to-[#ECEFF4] flex items-center">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes rise {
            from { opacity: 0; transform: translateY(22px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-rise-eyebrow {
            opacity: 0;
            animation: rise .9s .15s cubic-bezier(.22,1,.36,1) forwards;
          }
          .animate-rise-title {
            opacity: 0;
            animation: rise .9s .3s cubic-bezier(.22,1,.36,1) forwards;
          }
          .animate-rise-sub {
            opacity: 0;
            animation: rise .9s .45s cubic-bezier(.22,1,.36,1) forwards;
          }
          .animate-rise-actions {
            opacity: 0;
            animation: rise .9s .6s cubic-bezier(.22,1,.36,1) forwards;
          }
          .animate-rise-image {
            opacity: 0;
            animation: rise .9s .75s cubic-bezier(.22,1,.36,1) forwards;
          }
          @media (prefers-reduced-motion: reduce) {
            .animate-rise-eyebrow, .animate-rise-title, .animate-rise-sub, .animate-rise-actions, .animate-rise-image {
              animation: none !important;
              opacity: 1 !important;
              transform: none !important;
            }
          }
          .hero-btn {
            font-size: 15px;
            font-weight: 500;
            padding: 15px 32px;
            border-radius: 12px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s, background-color .25s;
          }
          .hero-btn-primary {
            background: #FF6A00;
            color: #fff;
            border: none;
            box-shadow: 0 8px 28px rgba(255,106,0,.28);
          }
          .hero-btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 14px 36px rgba(255,106,0,.36);
          }
          .hero-btn-ghost {
            background: rgba(255,255,255,.55);
            color: #1A2230;
            border: 1px solid rgba(26,34,48,.12);
            backdrop-filter: blur(10px);
          }
          .hero-btn-ghost:hover {
            transform: translateY(-2px);
            background: rgba(255,255,255,.8);
          }
        `}} />
        
        {/* Animated Background (Circuit) */}
        <HeroCircuitBackground id="circuit-hero" />
        <div className="relative z-[2] w-full px-6 md:px-12 lg:px-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[calc(100vh-120px)] pt-20 lg:pt-0">
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <h1 className="font-title font-semibold text-[32px] md:text-[48px] leading-[1.14] text-slate-900 tracking-tight max-w-3xl mt-[26px] mb-[22px] animate-rise-title">
              Operações IA Estratégicas em <br /> <span className="font-extrabold text-[#FF5500]">Marketing &amp; Vendas B2B</span>.
            </h1>
            <p className="font-sans text-[clamp(1rem,1.4vw,1.15rem)] leading-[1.65] text-[#5A6678] max-w-[54ch] animate-rise-sub">
              A NeuroAds une campanhas patrocinadas, automação e um ecossistema de agentes inteligentes para transformar o marketing e o comercial da sua empresa B2B em uma máquina previsível de receita.
            </p>
            <div className="flex flex-col items-start mt-8 w-full animate-rise-actions">
              <Link
                href="/cadastro"
                className="inline-flex items-center justify-center font-bold text-sm px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF5500] to-[#FF7A00] text-white shadow-[4px_4px_12px_rgba(255,85,0,0.3),-4px_-4px_12px_#ffffff] hover:shadow-[6px_6px_16px_rgba(255,85,0,0.45),-6px_-6px_16px_#ffffff] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 gap-2 border border-orange-400/20"
              >
                Ativar meu ecossistema <span className="text-xs">→</span>
              </Link>
              <span className="text-slate-500 text-[11px] mt-2.5 ml-2 font-bold tracking-wider uppercase">
                Experimente por 14 dias sem custos.
              </span>
            </div>
          </div>
          
          <div className="lg:col-span-5 flex items-center justify-center lg:justify-end relative animate-rise-image group mt-8 lg:mt-0 w-full">
            <div className="relative w-full mx-auto lg:mx-0">
              <video
                ref={videoRef}
                src="/videos/VD_Ap_26_1.mp4"
                autoPlay
                loop
                muted={isMuted}
                playsInline
                webkit-playsinline="true"
                x5-playsinline="true"
                className="w-full h-auto max-h-[55vw] lg:max-h-none object-contain rounded-[20px] lg:rounded-[32px] shadow-[4px_4px_10px_#c8d0e7,-4px_-4px_10px_#ffffff] lg:shadow-[8px_8px_16px_#c8d0e7,-8px_-8px_16px_#ffffff] border border-white/50"
              />
              {/* Mute button */}
              <button
                onClick={toggleMute}
                className="absolute bottom-4 right-4 lg:bottom-6 lg:right-6 p-2.5 lg:p-3 rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 shadow-lg border border-white/20"
                title={isMuted ? "Ativar som" : "Desativar som"}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            </div>
          </div>
        </div>
      </section>



      {/* ========================================================================= */}
      {/* TRANSFORME DADOS EM CRESCIMENTO */}
      {/* ========================================================================= */}
      <DataTransformationSection />

      {/* ========================================================================= */}
      {/* DEPOIMENTO (TESTIMONIAL SECTION) */}
      {/* ========================================================================= */}
      <TestimonialSection />

      {/* ========================================================================= */}
      {/* PÚBLICO-ALVO (TARGET AUDIENCE SECTION) */}
      {/* ========================================================================= */}
      <TargetAudienceSection />

      {/* ========================================================================= */}
      {/* COMPARAÇÃO AGÊNCIAS VS NEUROADS (COMPARISON SECTION) */}
      {/* ========================================================================= */}
      <ComparisonSection />

      {/* ========================================================================= */}
      {/* CAPACIDADES DOS AGENTES IA (AGENTS GRID SECTION) */}
      {/* ========================================================================= */}
      <AgentsGridSection />

      {/* ========================================================================= */}
      {/* SOLUTIONS SECTION TEMPLATE 02 */}
      {/* ========================================================================= */}
      <div ref={solutionsSectionRef} className="relative w-full overflow-hidden py-24 md:py-28">
        {/* Top transition mask to blend with previous section (#EDF1F5) */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#EDF1F5] to-transparent z-[5] pointer-events-none" />

        {/* Parallax Background Wrapper */}
        <motion.div
          style={{ y: solutionsBackgroundY }}
          className="absolute -top-80 -bottom-80 inset-x-0 overflow-hidden bg-gradient-to-br from-[#FAFBFD] to-[#ECEFF4] z-[1]"
        >
          <div className="absolute top-80 bottom-80 inset-x-0">
            <HeroCircuitBackground id="circuit-solutions" />
          </div>
        </motion.div>

        <section id="solucoes" className="relative z-[2] max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header grid */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ type: "spring", stiffness: 80, damping: 20 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pb-12 border-b border-slate-300/40"
        >
          <div className="md:col-span-2">
            {/* Title */}
            <h2 className="font-title font-extrabold text-3xl md:text-4xl text-slate-900 leading-[1.15] tracking-tight">
              Uma operação completa de <span className="text-[#FF5500]">marketing e vendas</span>, orquestrada por IA.
            </h2>
          </div>
          <div className="md:col-span-1">
            <p className="text-slate-500 text-sm leading-relaxed md:pl-6 border-l-2 border-orange-500/20">
              Da atração ao fechamento: campanhas patrocinadas, automação e agentes inteligentes trabalhando em um único ecossistema.
            </p>
          </div>
        </motion.div>

        {/* Three solutions cards grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, margin: "-50px" }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12"
        >

          {/* Card 1: Agentes IA */}
          <motion.div
            variants={cardVariants}
            className="bg-white shadow-[8px_8px_16px_#c8d0e7,-8px_-8px_16px_#ffffff] border border-white/50 rounded-[28px] p-8 flex flex-col justify-start min-h-[260px] relative transition-all duration-300 hover:shadow-[10px_10px_20px_#c8d0e7,-10px_-10px_20px_#ffffff]"
          >
            {/* Mais procurado badge */}
            <div className="absolute top-6 right-6">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white shadow-[inset_1px_1px_3px_#c8d0e7,inset_-1px_-1px_3px_#ffffff] border border-white/20 text-[8px] font-extrabold tracking-wider text-orange-600 uppercase">
                Mais procurado
              </span>
            </div>

            {/* Icon */}
            <div className="mb-6 shrink-0"><IconBotAI /></div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-start">
              <h3 className="font-title font-bold text-slate-800 text-lg tracking-tight mb-3">
                Agentes IA Comerciais
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Ecossistema com 10 agentes especializados — SDR, atendimento, follow-up e orquestração — qualificando e conduzindo leads até a proposta, sem pausa.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Posicionamento & Autoridade */}
          <motion.div
            variants={cardVariants}
            className="bg-white shadow-[8px_8px_16px_#c8d0e7,-8px_-8px_16px_#ffffff] border border-white/50 rounded-[28px] p-8 flex flex-col justify-start min-h-[260px] transition-all duration-300 hover:shadow-[10px_10px_20px_#c8d0e7,-10px_-10px_20px_#ffffff]"
          >
            {/* Icon */}
            <div className="mb-6 shrink-0"><IconBullseye /></div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-start">
              <h3 className="font-title font-bold text-slate-800 text-lg tracking-tight mb-3">
                Posicionamento & Autoridade
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Otimização e consolidação da presença digital da sua marca em canais tradicionais e novos buscadores de IA (GEO), gerando relevância e liderança no seu setor B2B.
              </p>
            </div>
          </motion.div>

          {/* Card 3: Automação & CRM */}
          <motion.div
            variants={cardVariants}
            className="bg-white shadow-[8px_8px_16px_#c8d0e7,-8px_-8px_16px_#ffffff] border border-white/50 rounded-[28px] p-8 flex flex-col justify-start min-h-[260px] transition-all duration-300 hover:shadow-[10px_10px_20px_#c8d0e7,-10px_-10px_20px_#ffffff]"
          >
            {/* Icon */}
            <div className="mb-6 shrink-0"><IconGearWorkflow /></div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-start">
              <h3 className="font-title font-bold text-slate-800 text-lg tracking-tight mb-3">
                Automação & CRM
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Fluxos de nutrição, integrações e RAG conectados ao seu CRM. Cada lead recebe a mensagem certa, no momento certo — automaticamente.
              </p>
            </div>
          </motion.div>

        </motion.div>

        {/* Funnel Interactive Specialties Showcase */}
        <FunnelInteractiveShowcase />

        {/* Bottom CTA Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ type: "spring", stiffness: 80, damping: 20, delay: 0.2 }}
          className="bg-white shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] rounded-[24px] p-6 border border-white/50 w-full mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all relative z-10"
        >
          <p className="text-slate-800 font-title font-bold text-sm text-center sm:text-left">
            Não sabe por onde começar? <span className="text-[#FF5500]">Faça o diagnóstico gratuito da sua operação.</span>
          </p>
          <Link
            href="#demonstracao"
            className="inline-flex items-center justify-center font-bold text-xs px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#FF7A00] text-white shadow-[3px_3px_8px_rgba(255,85,0,0.25),-3px_-3px_8px_#ffffff] hover:shadow-[4px_4px_12px_rgba(255,85,0,0.4),-4px_-4px_12px_#ffffff] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 border border-orange-400/10 cursor-pointer"
          >
            Solicitar diagnóstico <span className="ml-1 text-xs">→</span>
          </Link>
        </motion.div>

        {/* Mask para remover a linha dura (borda) do fim do background parallax e suavizar com o resto da página */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#EDF1F5] to-transparent z-[5] pointer-events-none" />
      </section>
    </div>



      {/* ========================================================================= */}
      {/* VALORES & RECURSOS (PRICING VALUES SECTION) */}
      {/* ========================================================================= */}
      <PricingValuesSection />

      {/* ========================================================================= */}
      {/* DEMONSTRAÇÃO & FORMULÁRIO DE ACESSO */}
      {/* ========================================================================= */}
      <DemoAndAccessSection />

      {/* ========================================================================= */}
      {/* PERGUNTAS FREQUENTES (FAQ SECTION) */}
      {/* ========================================================================= */}
      <FaqSection />
      {/* ========================================================================= */}
      {/* FOOTER */}
      {/* ========================================================================= */}
      <div className="relative w-full overflow-hidden py-16 md:py-24 mt-24">
        {/* Footer Background Wrapper */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FAFBFD] to-[#ECEFF4] z-[1]">
          <HeroCircuitBackground id="circuit-footer" />
        </div>

        <footer className="relative z-[2] max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8 space-y-4">
              <div className="flex items-center">
                <span className="font-title font-extrabold text-lg text-slate-900">
                  Neuro<span className="text-[#FF5500]">Ads</span>
                </span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed max-w-2xl">
                Operações IA estratégicas para marketing e vendas B2B. Conectando dados em tempo real, automatizando funis e convertendo oportunidades.
              </p>
            </div>
            
            <div className="md:col-span-4 space-y-4 text-left md:text-right">
              <h4 className="font-title font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">Contato</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>avante@neuroads.com.br</li>
                <li>Suporte 24/7</li>
                <li className="pt-2 flex md:justify-end">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white shadow-[inset_1.5px_1.5px_3px_#c8d0e7,inset_-1.5px_-1.5px_3px_#ffffff] text-[8px] font-bold text-emerald-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Sistemas Online
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-300/30 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
            <p>© {new Date().getFullYear()} NeuroAds. Todos os direitos reservados.</p>
            <div className="flex gap-4">
              <Link href="/termos" className="hover:text-slate-800 transition">Termos de Uso</Link>
              <Link href="/privacidade" className="hover:text-slate-800 transition">Privacidade</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>



    </div>
  );
}

// =========================================================================
// HELPER COMPONENTS FOR RECURSOS INTEGRADOS (LIGHT NEUMORPHISM)
// =========================================================================

const useCasesSectors = [
  {
    id: 'centralizar-dados',
    title: 'Centralizar dados',
    description: 'Unifique dados de múltiplas ferramentas em um único lugar. Mídia paga, leads, prospects, negócios, clientes... Todos seus dados organizados e centralizados, prontos para análises que seriam muito complexas.',
    cards: [
      { title: 'Conectores Nativos', description: 'Integração nativa com as principais plataformas de tráfego, CRM e vendas do mercado.' },
      { title: 'Single Source of Truth', description: 'Evite discrepâncias entre plataformas tendo uma única base de dados consolidada.' },
    ],
  },
  {
    id: 'segmentar-base',
    title: 'Segmente sua base',
    description: 'Crie listas com base em qualquer dado do seu ecossistema: perfil do lead, comportamento, engajamento... Filtre, combine critérios e crie segmentações mais inteligentes para que seu time comercial possa trabalhar com eficiência.',
    cards: [
      { title: 'Filtros Avançados', description: 'Combine critérios de comportamento de compra, UTMs de origem e status de CRM.' },
      { title: 'Atualização Automática', description: 'Listas dinâmicas que se atualizam automaticamente à medida que novos dados entram.' },
    ],
  },
  {
    id: 'dashboards-dinamicos',
    title: 'Dashboards dinâmicos',
    description: 'Crie dashboards com gráficos dinâmicos a partir de dados de marketing e vendas. Cruze mídia com vendas, acompanhe funis, conversões e indicadores de crescimento praticamente em tempo real.',
    cards: [
      { title: 'Métricas Unificadas', description: 'Cruze dados de investimento de mídia diretamente com receita de vendas do CRM.' },
      { title: 'Tempo Real', description: 'Acompanhe o desempenho da sua operação comercial com dados sempre atualizados.' },
    ],
  },
  {
    id: 'metricas-calculadas',
    title: 'Métricas calculadas',
    description: 'Crie relatórios com métricas de negócio personalizadas. Faça operações de cálculo e acompanhe indicadores que fazem sentido dentro da sua operação.',
    cards: [
      { title: 'Indicadores Customizados', description: 'Calcule ROI real, LTV, taxa de conversão entre etapas e margem de contribuição.' },
      { title: 'Sem Planilhas Manuais', description: 'Automatize cálculos complexos e elimine o trabalho manual de consolidação semanal.' },
    ],
  },
  {
    id: 'processamento-dados',
    title: 'Processamento de dados',
    description: 'Construa workflows para enriquecer e normalizar qualquer dado recebido antes de enviá-lo ao destino final. Conecte qualquer plataforma com API pública e processe dados em tempo real.',
    cards: [
      { title: 'Tratamento Automático', description: 'Limpe nomes, padronize formatos de telefone e unifique parâmetros de UTM.' },
      { title: 'Roteamento de Leads', description: 'Envie os dados certos para o CRM ou vendedor no exato segundo da conversão.' },
    ],
  },
  {
    id: 'analise-ia',
    title: 'Análise com IA',
    description: 'Use inteligência artificial para analisar seus dados e gerar insights baseados no seu próprio funil. Faça perguntas sobre performance, campanhas e leads e receba respostas em segundos.',
    cards: [
      { title: 'Insights Preditivos', description: 'Identifique gargalos de conversão ou desvios de CAC antes que eles afetem seu caixa.' },
      { title: 'Chat Interativo', description: 'Consulte sua base de dados fazendo perguntas em português, como se estivesse conversando com um analista.' },
    ],
  },
];

function CentralizarMockup() {
  const platforms = [
    { name: 'Google Ads', color: '#4285F4' },
    { name: 'Meta Ads', color: '#1877F2' },
    { name: 'LinkedIn Ads', color: '#0077B5' },
    { name: 'RD Station', color: '#F95F62' },
    { name: 'Pipedrive', color: '#262626' },
    { name: 'Kommo CRM', color: '#3A9BEA' },
    { name: 'CVCRM', color: '#10B981' },
    { name: 'Exact Sales', color: '#F59E0B' },
  ];

  return (
    <div className="w-full h-full flex flex-col justify-center items-center relative overflow-hidden p-4 min-h-[300px]">
      <div className="relative z-20 flex flex-col items-center justify-center p-6 rounded-full bg-white shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] border border-white/80 w-28 h-28 animate-pulse">
        <Database size={32} className="text-[#ff6a00]" />
        <span className="text-xs font-black text-slate-800 mt-1.5">NeuroAds</span>
        <span className="text-[8px] text-[#ff8f3a] font-bold uppercase tracking-wider">DATABASE</span>
      </div>

      <div className="absolute inset-0 z-10 w-full h-full">
        {platforms.map((plat, idx) => {
          const angle = (idx * 360) / platforms.length;
          const radius = 110;
          const radians = (angle * Math.PI) / 180;
          const x = Math.round(radius * Math.cos(radians));
          const y = Math.round(radius * Math.sin(radians));

          return (
            <div
              key={idx}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center"
              style={{
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              }}
            >
              <div
                className="px-2.5 py-1.5 rounded-lg border text-[9px] font-bold bg-white text-slate-700 shadow-[3px_3px_6px_#c8d0e7,-3px_-3px_6px_#ffffff] border-white/60 transition-all duration-300 hover:scale-105"
                style={{
                  boxShadow: `3px 3px 6px #c8d0e7, -3px -3px 6px #ffffff, 0 4px 12px ${plat.color}15`,
                }}
              >
                {plat.name}
              </div>
              <svg className="absolute overflow-visible pointer-events-none z-0" style={{ left: '50%', top: '50%' }}>
                <line
                  x1={0}
                  y1={0}
                  x2={-x}
                  y2={-y}
                  stroke="#FF5500"
                  strokeOpacity="0.12"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              </svg>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SegmentarMockup() {
  return (
    <div className="w-full rounded-2xl border border-white/60 bg-white p-5 shadow-[8px_8px_16px_#c8d0e7,-8px_-8px_16px_#ffffff] text-slate-800">
      <div className="flex items-center gap-1.5 pb-3 border-b border-slate-300/40 mb-3">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 text-[10px] text-slate-400 font-mono">segmentador_neuroads.ui</span>
      </div>

      <div className="space-y-3 font-sans text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-[#ff6a00] tracking-wider">Regras Comerciais</span>
          <span className="text-[10px] bg-white shadow-[inset_1.5px_1.5px_3px_#c8d0e7,inset_-1.5px_-1.5px_3px_#ffffff] text-slate-600 px-2 py-0.5 rounded-full font-semibold">Segmentação Dinâmica</span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-white/80 shadow-[inset_2px_2px_5px_#c8d0e7,inset_-2px_-2px_5px_#ffffff] space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#ff6a00]">
            <Filter size={10} />
            <span>REGRA DE ENTRADA</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 p-2 rounded-lg bg-white border border-slate-300/30 text-[10px] font-semibold text-slate-700 shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff]">
              Evento
            </div>
            <div className="flex-1 p-2 rounded-lg bg-white border border-slate-300/30 text-[10px] font-semibold text-slate-700 shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff]">
              Nome do Evento...
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-300/30 text-[10px] text-slate-500 font-semibold shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff]">
              Igual a
            </div>
            <div className="flex-1 p-2 rounded-lg bg-[#ff6a00]/10 border border-[#ff6a00]/30 text-[10px] font-bold text-[#ff6a00] shadow-[2px_2px_4px_rgba(255,106,0,0.1)]">
              Lead Qualificado
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 pl-4">
          <span className="text-[9px] font-black bg-[#ff6a00]/10 text-[#ff6a00] border border-[#ff6a00]/25 px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff]">OU</span>
          <div className="flex-1 h-[1px] bg-slate-300/60" />
        </div>

        <div className="p-3 bg-white rounded-xl border border-white/80 shadow-[inset_2px_2px_5px_#c8d0e7,inset_-2px_-2px_5px_#ffffff] space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600">
            <Filter size={10} />
            <span>CONDIÇÃO SECUNDÁRIA</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 p-2 rounded-lg bg-white border border-slate-300/30 text-[10px] font-semibold text-slate-700 shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff]">
              Evento
            </div>
            <div className="flex-1 p-2 rounded-lg bg-white border border-slate-300/30 text-[10px] font-semibold text-slate-700 shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff]">
              UTM Medium...
            </div>
            <div className="p-2 rounded-lg bg-white border border-slate-300/30 text-[10px] text-slate-500 font-semibold shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff]">
              Igual a
            </div>
            <div className="flex-1 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold text-amber-650 shadow-[2px_2px_4px_rgba(245,158,11,0.1)]">
              cpc
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardsMockup() {
  return (
    <div className="w-full rounded-2xl border border-white/60 bg-white p-5 shadow-[8px_8px_16px_#c8d0e7,-8px_-8px_16px_#ffffff] text-slate-700 text-xs font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-300/40 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="font-bold text-[10px] uppercase tracking-wider text-slate-500">NeuroAds &gt; Dashboard</span>
        </div>
        <div className="text-[9px] bg-white shadow-[inset_1.5px_1.5px_3px_#c8d0e7,inset_-1.5px_-1.5px_3px_#ffffff] border border-white/60 px-2 py-0.5 rounded text-slate-600">
          Últimos 30 dias
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="p-3 rounded-xl border border-white/80 bg-white shadow-[3px_3px_6px_#c8d0e7,-3px_-3px_6px_#ffffff]">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tempo de Resposta</p>
          <p className="text-lg font-black text-slate-850 mt-1">1m 13s</p>
          <p className="text-[9px] text-emerald-600 font-semibold mt-0.5">▲ -85% vs. humano</p>
        </div>
        <div className="p-3 rounded-xl border border-white/80 bg-white shadow-[3px_3px_6px_#c8d0e7,-3px_-3px_6px_#ffffff]">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Investimento Otimizado</p>
          <p className="text-lg font-black text-slate-850 mt-1">R$ 5.000,00</p>
          <p className="text-[9px] text-emerald-600 font-semibold mt-0.5">▼ -12% desperdício</p>
        </div>
        <div className="p-3 rounded-xl border border-white/80 bg-white shadow-[3px_3px_6px_#c8d0e7,-3px_-3px_6px_#ffffff]">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Custo por Lead (CPL)</p>
          <p className="text-lg font-black text-slate-850 mt-1">R$ 135,57</p>
          <p className="text-[9px] text-[#ff6a00] font-semibold mt-0.5">▼ -41% redução média</p>
        </div>
        <div className="p-3 rounded-xl border border-white/80 bg-white shadow-[3px_3px_6px_#c8d0e7,-3px_-3px_6px_#ffffff]">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Conversões no Funil</p>
          <p className="text-lg font-black text-slate-850 mt-1">37</p>
          <p className="text-[9px] text-emerald-600 font-semibold mt-0.5">▲ +40.2% vs. mês ant.</p>
        </div>
      </div>

      <div className="p-3 rounded-xl border border-white/80 bg-white shadow-[inset_2px_2px_5px_#c8d0e7,inset_-2px_-2px_5px_#ffffff] space-y-2">
        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Funil de Aquisição</p>
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-slate-500 w-16 truncate">Cliques</span>
            <div className="flex-1 h-3 rounded bg-slate-300/40 overflow-hidden shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]">
              <div className="h-full bg-blue-500 rounded" style={{ width: '100%' }} />
            </div>
            <span className="text-[9px] font-black text-slate-850 w-8 text-right">440</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-slate-500 w-16 truncate">Conversões</span>
            <div className="flex-1 h-3 rounded bg-slate-300/40 overflow-hidden shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]">
              <div className="h-full bg-[#ff6a00] rounded" style={{ width: '60%' }} />
            </div>
            <span className="text-[9px] font-black text-slate-850 w-8 text-right">37</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold text-slate-500 w-16 truncate">Reuniões</span>
            <div className="flex-1 h-3 rounded bg-slate-300/40 overflow-hidden shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]">
              <div className="h-full bg-emerald-500 rounded" style={{ width: '35%' }} />
            </div>
            <span className="text-[9px] font-black text-slate-850 w-8 text-right">20</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricasMockup() {
  return (
    <div className="w-full rounded-2xl border border-white/60 bg-white p-5 shadow-[8px_8px_16px_#c8d0e7,-8px_-8px_16px_#ffffff] space-y-4 text-xs font-sans text-slate-700">
      <div className="flex items-center justify-between pb-2 border-b border-slate-300/40">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Métricas Customizadas</span>
        <span className="text-[9px] font-semibold text-[#ff6a00]">Cálculo Ativo</span>
      </div>

      <div className="p-4 rounded-xl border border-white/80 bg-white shadow-[3px_3px_6px_#c8d0e7,-3px_-3px_6px_#ffffff] relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pipeline de Vendas (ROI)</p>
          <span className="text-[8px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">Ver Metas</span>
        </div>
        <p className="text-2xl font-black text-slate-850 tracking-tight">R$ 6.750,00</p>
        
        <div className="h-10 mt-3 relative overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
            <path
              d="M0 15 Q20 5 40 12 T80 4 T100 8"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
            />
            <path
              d="M0 15 Q20 5 40 12 T80 4 T100 8 L100 20 L0 20 Z"
              fill="url(#gradient-green-lp)"
              opacity="0.1"
            />
            <defs>
              <linearGradient id="gradient-green-lp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-white/80 bg-white shadow-[3px_3px_6px_#c8d0e7,-3px_-3px_6px_#ffffff]">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Conversão de Reuniões</p>
        <div className="flex items-baseline gap-2 mt-1">
          <p className="text-xl font-black text-slate-850">24 Agendadas</p>
          <span className="text-[10px] text-emerald-600 font-bold">▲ +12% esta semana</span>
        </div>
      </div>
    </div>
  );
}

function ProcessamentoMockup() {
  const dots = React.useMemo(() => {
    let seed = 12345;
    const lcg = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const list: { x: number; y: number; size: number; color: string; delay: number; duration: number }[] = [];
    const addEdgeDots = (x1: number, y1: number, x2: number, y2: number, count: number) => {
      for (let i = 0; i <= count; i++) {
        const t = i / count;
        const baseX = x1 + (x2 - x1) * t;
        const baseY = y1 + (y2 - y1) * t;
        
        const jitterX = (lcg() - 0.5) * 8;
        const jitterY = (lcg() - 0.5) * 8;
        const size = lcg() * 2 + 1.5;
        
        const colors = ['#8B5CF6', '#3B82F6', '#FF5500', '#A78BFA', '#93C5FD'];
        const color = colors[Math.floor(lcg() * colors.length)];
        
        list.push({
          x: baseX + jitterX,
          y: baseY + jitterY,
          size,
          color,
          delay: lcg() * 2,
          duration: 1.5 + lcg(),
        });
      }
    };

    addEdgeDots(100, 40, 40, 160, 20);
    addEdgeDots(40, 160, 160, 160, 20);
    addEdgeDots(160, 160, 100, 40, 20);
    return list;
  }, []);

  return (
    <div className="w-full rounded-2xl border border-white/60 bg-white p-6 shadow-[8px_8px_16px_#c8d0e7,-8px_-8px_16px_#ffffff] flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff6a00]/5 filter blur-2xl rounded-full" />
      <span className="absolute top-4 left-4 text-[9px] uppercase font-bold text-slate-500 tracking-wider">Workflow Integrado</span>
      
      <svg className="w-40 h-40 overflow-visible" viewBox="0 0 200 200">
        {dots.map((dot, idx) => (
          <circle
            key={idx}
            cx={dot.x}
            cy={dot.y}
            r={dot.size}
            fill={dot.color}
            opacity="0.8"
            style={{
              animation: `pulse ${dot.duration}s infinite alternate`,
              animationDelay: `${dot.delay}s`,
            }}
          />
        ))}
      </svg>
      
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.4; }
          100% { transform: scale(1.1); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function AnaliseIaMockup() {
  return (
    <div className="w-full rounded-2xl border border-white/60 bg-white p-4 shadow-[8px_8px_16px_#c8d0e7,-8px_-8px_16px_#ffffff] text-slate-700 text-[11px] font-sans">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-300/40 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#ff6a00]/20 flex items-center justify-center border border-[#ff6a00]/30 animate-pulse">
            <Cpu size={10} className="text-[#ff6a00]" />
          </div>
          <span className="font-bold text-[10px] uppercase tracking-wider text-slate-650">NeuroAds Copilot</span>
        </div>
        <span className="text-[8px] bg-[#ff6a00]/10 text-[#ff8f3a] border border-[#ff6a00]/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">IA Insights</span>
      </div>

      <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
        <div className="p-3 rounded-xl border border-white/80 bg-white shadow-[inset_2px_2px_5px_#c8d0e7,inset_-2px_-2px_5px_#ffffff] space-y-2">
          <p className="font-bold text-slate-800 text-[10px] border-b border-slate-300/30 pb-1">Target de Campanha:</p>
          <ul className="space-y-1 text-slate-600">
            <li className="flex items-center gap-1.5">
              <span className="text-emerald-600">✓</span>
              <span>Reuniões Qualificadas: <strong className="text-slate-800">10+</strong></span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-emerald-600">✓</span>
              <span>CPL Alvo: <strong className="text-slate-800">R$ 80</strong> (Redução de 41%)</span>
            </li>
            <li className="flex items-center gap-1.5">
              <span className="text-emerald-600">✓</span>
              <span>Novas Oportunidades: <strong className="text-slate-800">3+ fechamentos</strong></span>
            </li>
          </ul>
          
          <p className="text-[10px] text-slate-500 pt-1 leading-relaxed border-t border-slate-300/30 mt-2">
            Com base na análise neural de criativos e anúncios da última semana.
          </p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          type="text"
          placeholder="Pergunte ao Copilot..."
          readOnly
          className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300/30 text-[10px] text-slate-800 shadow-[inset_1px_1px_3px_#c8d0e7,inset_-1px_-1px_3px_#ffffff] placeholder:text-slate-400 focus:outline-none"
        />
        <div className="w-8 h-8 rounded-xl bg-[#ff6a00]/10 border border-[#ff6a00]/30 flex items-center justify-center cursor-pointer hover:bg-[#ff6a00]/20 shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff]">
          <ArrowRight size={12} className="text-[#ff6a00]" />
        </div>
      </div>
    </div>
  );
}

function TargetAudienceSection() {
  const cards = [
    {
      id: 'freelancers',
      badge: 'Escala pessoal',
      badgeDot: '#FF6B35',
      title: 'Freelancers',
      description: 'Atraia clientes de alto ticket de forma previsível no piloto automático. Maximize seus ganhos em cada projeto sem taxas abusivas.',
      cta: 'Começar agora',
      bg: '#FFF3EC',
      accentColor: '#C53B00',
      image: '/images/publico-alvo/freelancers.jpg',
    },
    {
      id: 'agencias',
      badge: 'Alto volume',
      badgeDot: '#1A73E8',
      title: 'Agências',
      description: 'Recupere horas faturáveis e mude o foco do time de relatórios estáticos para o crescimento real dos clientes com IA.',
      cta: 'Ver soluções',
      bg: '#EEF4FF',
      accentColor: '#1248A0',
      image: '/images/publico-alvo/agencias.jpg',
    },
    {
      id: 'consultorias',
      badge: 'Propostas premium',
      badgeDot: '#059669',
      title: 'Consultorias',
      description: 'Atraia clientes ideais e ofereça propostas comerciais de alto padrão totalmente qualificadas por inteligência artificial.',
      cta: 'Saiba mais',
      bg: '#ECFDF5',
      accentColor: '#065F46',
      image: '/images/publico-alvo/consultorias.jpg',
    },
    {
      id: 'ecommerce',
      badge: 'Alta conversão',
      badgeDot: '#7C3AED',
      title: 'E-commerce',
      description: 'Converta cliques e carrinhos abandonados em vendas recorrentes sem capital congelado em canais de anúncios.',
      cta: 'Aumentar vendas',
      bg: '#F5F0FF',
      accentColor: '#5B21B6',
      image: '/images/publico-alvo/ecommerce.jpg',
    },
    {
      id: 'crossborder',
      badge: 'Mercado global',
      badgeDot: '#0891B2',
      title: 'Cross Border',
      description: 'Alcance novos mercados internacionais e conquiste contratos globais com estratégia ágil para capturar conversões em qualquer lugar.',
      cta: 'Expandir agora',
      bg: '#ECFEFF',
      accentColor: '#0E6B86',
      image: '/images/publico-alvo/crossborder.jpg',
    },
    {
      id: 'incorporadoras',
      badge: 'Alto valor',
      badgeDot: '#D97706',
      title: 'Incorporadoras',
      description: 'Mapeie e qualifique leads de alta renda para empreendimentos de luxo com score de compra automatizado por IA.',
      cta: 'Qualificar leads',
      bg: '#FFFBEB',
      accentColor: '#92400E',
      image: '/images/publico-alvo/incorporadoras.jpg',
    },
  ];

  return (
    <section id="publico-alvo" className="relative w-full bg-[#EDF1F5] py-24 overflow-hidden">
      {/* Top transition gradient */}
      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
      
      {/* Bottom transition gradient */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="space-y-4 max-w-xl text-center mx-auto">
          <span className="text-[10px] font-black text-[#FF5500] uppercase tracking-widest block">PARA QUEM É A NEUROADS</span>
          <h2 className="font-title text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Oportunidades
          </h2>
          <p className="text-slate-650 text-xs md:text-sm leading-relaxed">
            Unifique dados, automatize funis e coloque agentes de IA para otimizar suas conversões comerciais todos os dias.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {cards.map((card, idx) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, margin: '-60px' }}
              transition={{ duration: 0.55, delay: idx * 0.09, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-[24px] min-h-[250px]"
              style={{ backgroundColor: card.bg }}
            >
              {/* Photo — right half, blended into the card background */}
              <div className="absolute inset-y-0 right-0 w-[58%] sm:w-[52%]">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  sizes="(max-width: 768px) 60vw, 460px"
                  className="object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(to right, ${card.bg} 0%, ${card.bg}00 55%)` }}
                />
              </div>

              {/* Content */}
              <div className="relative z-10 p-8 flex flex-col h-full min-h-[250px] max-w-[62%] sm:max-w-[55%]">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 self-start bg-white/80 backdrop-blur-sm rounded-full px-3.5 py-1.5 mb-5 shadow-sm">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: card.badgeDot }} />
                  <span className="text-[10px] font-bold text-slate-600 tracking-wide whitespace-nowrap">{card.badge}</span>
                </div>

                {/* Title */}
                <h3 className="font-title font-extrabold text-[22px] text-slate-900 mb-3 leading-snug">
                  {card.title}
                </h3>

                {/* Description */}
                <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-1">
                  {card.description}
                </p>

                {/* CTA */}
                <a
                  href="#demonstracao"
                  className="inline-flex items-center gap-1.5 text-sm font-bold transition-all duration-200 hover:gap-2.5 group"
                  style={{ color: card.accentColor }}
                >
                  {card.cta}
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AgentsGridSection() {
  const agents = [
    {
      id: 1,
      title: 'Ulisses',
      image: '/images/Avatar Agentes IA/Avatar_Ulisses.png',
      category: 'Orquestrador Central',
      bio: 'Ulisses é o orquestrador central do ecossistema NeuroAds. Ele distribui os briefings diários para os demais agentes, acompanha o status de cada conversão e consolida relatórios analíticos de alta performance para os gestores, garantindo a integração contínua do funil comercial.',
      tag: 'ORQUESTRAÇÃO E BRIEFINGS DIÁRIOS',
    },
    {
      id: 2,
      title: 'Vitor',
      image: '/images/Avatar Agentes IA/Avatar_Vitor.png',
      category: 'Agente SDR',
      bio: 'Vitor atua na linha de frente do comercial. Ele monitora páginas de captura de alta intenção, aciona sequências de qualificação personalizadas em tempo real e realiza o handoff automático de leads quentes para que o time comercial finalize o fechamento.',
      tag: 'QUALIFICAÇÃO EM WHATSAPP E EMAIL',
    },
    {
      id: 3,
      title: 'Manu',
      image: '/images/Avatar Agentes IA/Avatar_Manu.png',
      category: 'Agente de Suporte',
      bio: 'Manu soluciona chamados recorrentes de nível 1 instantaneamente. Ela analisa o sentimento do cliente e, quando detecta um padrão de dúvida repetido, alerta o time de conteúdo para a criação imediata de materiais educativos de suporte.',
      tag: 'ATENDIMENTO E FAQs AUTOMATIZADOS',
    },
    {
      id: 4,
      title: 'Igor',
      image: '/images/Avatar Agentes IA/Avatar_Igor.png',
      category: 'Agente de Inteligência de Dados',
      bio: 'Igor audita funis de vendas, cruzando dados de anúncios com o CRM. Ele calcula o custo de aquisição (CAC), o retorno de investimento (ROI) e envia notificações automáticas ao time de tráfego se detectar desvios de orçamento ou queda de performance.',
      tag: 'AUDITORIA DE CAC E ALERTAS NO SLACK',
    },
    {
      id: 5,
      title: 'Tainá',
      image: '/images/Avatar Agentes IA/Avatar_Taina.png',
      category: 'Agente de Conteúdo',
      bio: 'Tainá desenvolve textos persuasivos para anúncios pagos, redige newsletters semanais e cria artigos focados em educação de leads, baseando-se nas objeções mapeadas pelo time comercial e nas dúvidas vindas do suporte.',
      tag: 'GERAÇÃO DE COPYS E ARTIGOS RÁPIDOS',
    },
    {
      id: 6,
      title: 'Breno',
      image: '/images/Avatar Agentes IA/Avatar_Breno.png',
      category: 'Agente Closer',
      bio: 'Breno gerencia negociações complexas. Ele formula propostas comerciais com base no budget do lead, automatiza follow-ups após o envio e encaminha o contrato assinado diretamente para a fase de onboarding de novos clientes.',
      tag: 'PROPOSTAS E FECHAMENTOS DE CONTRATOS',
    },
    {
      id: 7,
      title: 'Paola',
      image: '/images/Avatar Agentes IA/Avatar_Paola.png',
      category: 'Agente de Tráfego',
      bio: 'Paola atua no Google Ads e Meta Ads. Ela analisa o ROAS em tempo real, substitui criativos em fadiga, realiza testes A/B de headlines e descobre novos públicos semelhantes (lookalike) com menor custo por mil impressões (CPM).',
      tag: 'OTIMIZAÇÃO DE ROAS E CAMPANHAS',
    },
    {
      id: 8,
      title: 'Raíssa',
      image: '/images/Avatar Agentes IA/Avatar_Raissa.png',
      category: 'Agente de Upsell & Reativação',
      bio: 'Raíssa monitora a satisfação e o uso da plataforma pelos clientes ativos. Ela ativa campanhas automáticas de upsell no momento de maior engajamento e cria fluxos de recuperação para reativar clientes inativos há mais de 30 dias.',
      tag: 'REATIVAÇÃO DE LEADS E BASE ATIVA',
    },
    {
      id: 9,
      title: 'Heitor',
      image: '/images/Avatar Agentes IA/Avatar_Heitor.png',
      category: 'Agente de Processos & Integrações',
      bio: 'Heitor gerencia a integração técnica de novos leads. Ele conecta o CRM a ferramentas externas, valida chaves de API do cliente e garante que toda a esteira de onboarding de marketing/vendas funcione perfeitamente sem falhas.',
      tag: 'CONEXÃO COM CRM E APIS PÚBLICAS',
    },
    {
      id: 10,
      title: 'Laís',
      image: '/images/Avatar Agentes IA/Avatar_Lais.png',
      category: 'Agente de SEO & GEO',
      bio: 'Laís monitora o posicionamento orgânico da marca. Ela otimiza o SEO do blog para novas palavras-chave de baixa concorrência e estrutura dados de forma a posicionar o negócio no topo de buscadores generativos de IA (GEO).',
      tag: 'OTIMIZAÇÃO PARA BUSCADORES DE IA',
    },
  ];

  const [active, setActive] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const handleNext = React.useCallback(() => {
    setActive((prev) => (prev + 1) % agents.length);
  }, [agents.length]);

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + agents.length) % agents.length);
  };

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(handleNext, 5000);
    return () => clearInterval(interval);
  }, [handleNext, isPlaying, active]);

  const isActive = (index: number) => index === active;

  const getRotate = (index: number) => {
    const offsets = [-6, 4, -3, 7, -5, 3, -4, 6, -2, 5];
    return `${offsets[index % offsets.length]}deg`;
  };

  return (
    <section id="agentes" className="relative w-full bg-[#EDF1F5] py-24 overflow-hidden text-center">
      {/* Top transition gradient */}
      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-white to-transparent pointer-events-none z-10" />
      
      {/* Bottom transition gradient */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#EDF1F5] to-transparent pointer-events-none z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        <div className="space-y-4 max-w-2xl mx-auto">
          <span className="text-[10px] font-black text-[#FF5500] tracking-widest block">Inteligência | Automações | Estratégia</span>
          <h2 className="font-title text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Um time de Agentes IA
          </h2>
        <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
          Nossos Agentes de IA operam integrados ao seu ecossistema comercial, analisando dados, automatizando lances e executando tarefas complexas 24/7.
        </p>
      </div>

      {/* Animated Carousel */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center max-w-4xl mx-auto text-left">

        {/* Left: Stacked Agent Avatars */}
        <div className="flex items-center justify-center">
          <div className="relative h-80 w-full max-w-[280px]">
            <AnimatePresence>
              {agents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, scale: 0.9, y: 50, rotate: getRotate(index) }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.45,
                    scale: isActive(index) ? 1 : 0.92,
                    y: isActive(index) ? 0 : 16,
                    zIndex: isActive(index) ? agents.length : agents.length - Math.abs(index - active),
                    rotate: isActive(index) ? '0deg' : getRotate(index),
                  }}
                  exit={{ opacity: 0, scale: 0.9, y: -50 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="absolute inset-0 origin-bottom"
                >
                  <div className="h-full w-full rounded-[32px] overflow-hidden border border-white/60 bg-white shadow-[8px_8px_24px_#c8d0e7,-4px_-4px_12px_#ffffff] relative">
                    <Image
                      src={agent.image}
                      alt={agent.title}
                      fill
                      className="object-cover object-center scale-[1.04]"
                      sizes="280px"
                    />
                    {/* Gradient overlay at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    {/* Name badge */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="text-[10px] font-extrabold text-white/70 uppercase tracking-widest block">
                        {agent.category}
                      </span>
                      <span className="text-white font-title font-extrabold text-xl leading-tight">
                        {agent.title}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Agent Info + Controls */}
        <div className="flex flex-col justify-center py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex flex-col gap-4"
            >
              <div>
                <span className="text-[10px] font-extrabold text-[#FF5500] uppercase tracking-widest block mb-1">
                  {agents[active].category}
                </span>
                <h3 className="font-title text-3xl font-extrabold text-slate-900">
                  {agents[active].title}
                </h3>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                {agents[active].bio}
              </p>
              <div className="inline-flex">
                <span className="px-3 py-1.5 rounded-full bg-[#FF5500]/10 border border-[#FF5500]/20 text-[9px] font-extrabold text-[#FF5500] uppercase tracking-widest">
                  {agents[active].tag}
                </span>
              </div>

              {/* Dot indicators */}
              <div className="flex gap-1.5 mt-2">
                {agents.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActive(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === active ? 'w-6 bg-[#FF5500]' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                    }`}
                    aria-label={`Agente ${idx + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Prev / Next controls */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={handlePrev}
              aria-label="Agente anterior"
              className="group w-10 h-10 rounded-full bg-white border border-white/60 shadow-[4px_4px_8px_#c8d0e7,-4px_-4px_8px_#ffffff] flex items-center justify-center hover:shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff] active:scale-95 transition-all duration-200"
            >
              <svg className="w-4 h-4 text-slate-600 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? "Pausar rotação" : "Iniciar rotação"}
              className="group w-10 h-10 rounded-full bg-white border border-white/60 shadow-[4px_4px_8px_#c8d0e7,-4px_-4px_8px_#ffffff] flex items-center justify-center hover:shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff] active:scale-95 transition-all duration-200"
            >
              {isPlaying ? (
                <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-slate-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              onClick={handleNext}
              aria-label="Próximo agente"
              className="group w-10 h-10 rounded-full bg-[#FF5500] text-white shadow-[4px_4px_8px_rgba(255,85,0,0.3)] flex items-center justify-center hover:bg-[#FF6A00] active:scale-95 transition-all duration-200"
            >
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

      </div>
      </div>
    </section>
  );
}



function DataTransformationSection() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        backgroundImage: 'url(/images/backgrounds/Fund_ss.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Top transition gradient */}
      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#EDF1F5] to-transparent pointer-events-none z-10" />
      
      {/* Bottom transition gradient */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none z-10" />

      {/* Subtle white overlay so text stays crisp over the textured bg */}
      <div className="absolute inset-0 bg-white/60 pointer-events-none" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left Column — Copy ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-6 max-w-lg"
          >
            <h2 className="font-title font-extrabold text-3xl md:text-4xl text-slate-900 leading-tight tracking-tight">
              Transforme dados em faturamento
            </h2>

            <p className="text-slate-650 text-base md:text-lg leading-relaxed font-normal">
              Se você não confia 100% nos seus dados hoje, podemos presumir que toda decisão tomada é, estatisticamente, uma{' '}
              <strong className="underline decoration-[#FF5500]/40 decoration-2 underline-offset-4 text-slate-800">aposta</strong>.
            </p>

            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              Acredite, dados soltos, espalhados entre diversas ferramentas, são um grande problema de produtividade e eficiência na empresa.
            </p>

            <div className="pt-6 border-t border-slate-300/40 space-y-4">
              <h3 className="font-title font-bold text-xl md:text-2xl text-slate-900 leading-snug">
                A NeuroAds te ajuda a organizar os dados e a identificar os gargalos.
              </h3>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                Integre as ferramentas que você já utiliza e organize toda a informação usando a{' '}
                <strong className="text-[#FF5500]">NeuroAds</strong>.
              </p>
            </div>
          </motion.div>

          {/* ── Right Column — Screenshot Showcase (tabs) ── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="pb-8"
          >
            <ScreenshotShowcase />
          </motion.div>

        </div>
      </div>
    </section>
  );
}




function DemoAndAccessSection() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [isHuman, setIsHuman] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0);

  const [isDemoMuted, setIsDemoMuted] = useState(true);
  const demoVideoRef = useRef<HTMLVideoElement>(null);

  const toggleDemoMute = () => {
    if (demoVideoRef.current) {
      demoVideoRef.current.muted = !demoVideoRef.current.muted;
      setIsDemoMuted(demoVideoRef.current.muted);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && isHuman) {
      try {
        const res = await fetch('/api/access', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, company }),
        });
        if (res.ok) {
          setFormSubmitted(true);
        }
      } catch (err) {
        console.error("Access submission error", err);
      }
    }
  };

  return (
    <div className="bg-white w-full">
    <section id="demonstracao" className="relative w-full bg-white py-24 overflow-hidden">
      {/* Top transition gradient */}
      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#EDF1F5] to-transparent pointer-events-none z-10" />
      
      {/* Bottom transition gradient */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#EDF1F5] to-transparent pointer-events-none z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="text-center pb-16"
      >
        <h2 className="font-title font-extrabold text-3xl md:text-4xl text-slate-900 leading-tight tracking-tight max-w-2xl mx-auto">
          Conheça a NeuroAds em ação e <span className="text-[#FF5500]">solicite seu acesso.</span>
        </h2>
        <p className="text-slate-500 text-xs md:text-sm mt-4 max-w-xl mx-auto">
          Preencha o formulário para solicitar uma demonstração personalizada e garantir sua vaga exclusiva.
        </p>
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Video Mockup */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-7"
        >
          <div className="relative aspect-video rounded-[32px] overflow-hidden bg-slate-950 shadow-[0_20px_40px_rgba(255,85,0,0.12),_0_1px_3px_rgba(255,85,0,0.05)] group">
            <video
              ref={demoVideoRef}
              src="/videos/VD_BV.mp4"
              autoPlay
              loop
              muted={isDemoMuted}
              playsInline
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={toggleDemoMute}
              className="absolute bottom-6 right-6 p-3 rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 shadow-lg border border-white/20 z-10"
              title={isDemoMuted ? "Ativar som" : "Desativar som"}
            >
              {isDemoMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
        </motion.div>

        {/* Right Column: Request Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-5"
        >
          <div 
            className="bg-white border rounded-[28px] p-8 flex flex-col justify-between relative shadow-[0_20px_40px_rgba(255,85,0,0.12),_0_1px_3px_rgba(255,85,0,0.05)]"
            style={{ borderColor: 'rgba(255, 85, 0, 0.2)' }}
          >
            <h3 className="font-title font-extrabold text-black text-lg mb-2 text-left">
              Solicitar Demonstração
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-6 text-left">
              Preencha os campos abaixo e vamos elaborar uma demonstração prática das operações, oportunidades e resultados que podemos atingir na sua operação:
            </p>

            <AnimatePresence mode="wait">
              {!formSubmitted ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">Nome Completo</label>
                    <input
                      type="text"
                      required
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#EAEAEA] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5500]/25 focus:border-[#FF5500] text-xs font-bold transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">E-mail Corporativo</label>
                    <input
                      type="email"
                      required
                      placeholder="voce@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#EAEAEA] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5500]/25 focus:border-[#FF5500] text-xs font-bold transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-1 text-left">
                    <label className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">Empresa</label>
                    <input
                      type="text"
                      required
                      placeholder="Nome da sua empresa"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-[#EAEAEA] bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5500]/25 focus:border-[#FF5500] text-xs font-bold transition-all shadow-inner"
                    />
                  </div>

                  {/* Slide to Verify human challenge */}
                  <div className="relative w-full h-12 bg-[#EDF1F5] rounded-xl border border-slate-200/50 flex items-center justify-start overflow-hidden select-none mt-2 shadow-inner">
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pointer-events-none z-0">
                      {slideProgress >= 100 ? 'Humano Confirmado' : 'DESLIZE PARA VERIFICAR'}
                    </span>
                    
                    {/* Track area for the thumb (adds 6px padding on left and right) */}
                    <div className="absolute inset-y-0 left-1.5 right-1.5 flex items-center pointer-events-none z-10">
                      <div 
                        className="absolute h-9 w-20 rounded-lg bg-gradient-to-r from-[#FF5500] to-[#FF7A00] flex items-center justify-center text-white text-base font-bold shadow-md transition-all duration-75"
                        style={{ 
                          left: `calc(${slideProgress}% - ${slideProgress * 0.8}px)`
                        }}
                      >
                        {slideProgress >= 100 ? '✓' : '→'}
                      </div>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={slideProgress}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setSlideProgress(val);
                        if (val >= 100) {
                          setIsHuman(true);
                        }
                      }}
                      onMouseUp={() => {
                        if (slideProgress < 100) {
                          setSlideProgress(0);
                        }
                      }}
                      onTouchEnd={() => {
                        if (slideProgress < 100) {
                          setSlideProgress(0);
                        }
                      }}
                      disabled={isHuman}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!isHuman}
                    className={`w-full py-4 rounded-xl font-bold text-xs text-center transition-all shadow-sm mt-4 select-none ${
                      isHuman 
                        ? 'bg-black hover:bg-neutral-800 text-white cursor-pointer active:scale-[0.98]' 
                        : 'bg-[#EDF1F5] text-slate-400 cursor-not-allowed border border-slate-200/50'
                    }`}
                  >
                    Solicitar
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-500 shadow-sm">
                    <CheckCircle2 size={32} className="stroke-[1.5]" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-title font-extrabold text-slate-900 text-base">Solicitação enviada!</h4>
                    <p className="text-slate-500 text-[11px] leading-relaxed max-w-[240px] mx-auto">
                      Obrigado, {name.split(' ')[0]}. Nossa equipe entrará em contato em seu e-mail ({email}) para configurar seu onboarding.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
      </div>
    </section>
    </div>
  );
}
function TestimonialSection() {
  return (
    <section className="py-12 px-6 text-center bg-white">

      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
        <div className="w-[134px] h-[134px] rounded-full overflow-hidden border border-slate-300 shrink-0 relative shadow-sm">
          <Image
            src="/images/eu.jpeg"
            alt="Claudio Müller"
            fill
            className="object-cover"
          />
        </div>
        <div className="h-6 w-px bg-slate-300 hidden md:block shrink-0"></div>
        <p className="font-sans text-slate-700 text-sm md:text-base font-semibold italic leading-relaxed">
          &ldquo;A NeuroAds resolveu o que nenhuma outra empresa conseguiu: personalização de IA real com dados de verdade. Conseguimos ver o comportamento, o que funciona e acompanhar o processo comercial completo — tudo isso com atendimento muito próximo.&rdquo;
        </p>
        <div className="shrink-0 text-left border-t md:border-t-0 md:border-l border-slate-300/40 pt-3 md:pt-0 md:pl-6">
          <span className="font-title font-semibold text-xs text-black block">Claudio Müller</span>
          <span className="font-sans text-[9px] font-extrabold text-[#FF5500] uppercase tracking-wider block">Analista em Marketing & IA</span>
        </div>
      </div>
    </section>
  );
}

function ComparisonSection() {
  const cards = [
    {
      tag: 'LENTO',
      title: 'Relatórios Estáticos',
      desc: 'Você precisa de respostas rápidas para seus lances, mas recebe relatórios estáticos em PDF semanas após o encerramento do mês.'
    },
    {
      tag: 'CARO',
      title: 'Assinaturas Bloqueadas',
      desc: 'Paga dezenas de licenças mensais para ferramentas de marketing que não conversam entre si, acumulando custos no final do mês.'
    },
    {
      tag: 'CONFUSO',
      title: 'Falta de Contexto',
      desc: 'IAs comuns trabalham sem contexto de vendas e alucinam constantemente ao ler informações desorganizadas em arquivos de prompt.'
    }
  ];

  return (
    <section id="comparacao" className="py-20 bg-white px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        <div className="lg:col-span-5 space-y-6 flex flex-col items-start text-left">
          <span className="text-[10px] font-black text-[#FF5500] uppercase tracking-widest block">O PROBLEMA DAS AGÊNCIAS</span>
          <h2 className="font-title text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            A maior parte das agências de tráfego é lenta, cara e confusa.
          </h2>
          <p className="text-slate-650 text-xs md:text-sm leading-relaxed">
            Sua operação comercial precisa de dados integrados de marketing e vendas rodando em tempo real, sem planilhas confusas e sem ter que delegar tarefas manualmente.
          </p>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <div 
              key={idx} 
              className="border border-white/80 rounded-2xl p-6 bg-white space-y-4 hover:scale-[1.01] transition-transform duration-300 shadow-[4px_4px_10px_#c8d0e7]"
            >
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest block">{card.tag}</span>
              <h4 className="font-title font-bold text-slate-800 text-sm">{card.title}</h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "O que é a NeuroAds e como funcionam os Agentes de IA?",
      answer: "A NeuroAds une campanhas patrocinadas, automação e um ecossistema de 10 agentes de inteligência artificial especializados para transformar o marketing e o comercial da sua empresa B2B. Nossos agentes (como Vitor SDR, Paola Tráfego e Igor Dados) realizam tarefas diárias de qualificação de leads, criação de criativos e auditoria de campanhas 24/7."
    },
    {
      question: "Qual o valor do investimento e existe fidelidade?",
      answer: "Oferecemos um Plano Único de R$ 497/mês (ou R$ 4.970/ano, equivalente a dois meses grátis) com acesso aos 10 agentes especializados — responsáveis por mais de 30 operações pré-configuradas, além das operações personalizadas via chat —, 200 créditos mensais, 5 automações ativas e chat do assistente incluído. Você pode testar por 14 dias com 20 créditos inclusos e cancelar quando quiser, sem qualquer taxa ou fidelidade. Precisando de mais volume no meio do ciclo, há boosters avulsos de 50 créditos por R$ 97."
    },
    {
      question: "Como os dados são integrados com meu CRM?",
      answer: "Nossos workflows dinâmicos conectam o CRM a ferramentas externas via webhooks e APIs públicas. Cada lead qualificado pelo Vitor (SDR) ou fechado pelo Breno (Closer) é enviado automaticamente ao seu funil do CRM, sincronizando contatos, produtos e status de negociação sem a necessidade de digitação manual."
    },
    {
      question: "Como o Igor (Agente de Dados) ajuda a monitorar os resultados?",
      answer: "O Igor realiza análises preditivas cruzando o investimento de mídia com o faturamento do CRM. Ele monitora métricas como CAC, ROI e taxa de conversão em tempo real. Se detectar desvios de orçamento ou quedas na conversão do funil, ele notifica o time instantaneamente no Slack para ações corretivas."
    },
    {
      question: "Quais as garantias de segurança das credenciais de anúncios?",
      answer: "Adotamos padrões rígidos de criptografia (AES-256-GCM) para armazenar todas as credenciais de anúncios e tokens de CRM em repouso. O tráfego de dados é efetuado de forma blindada por canais HTTPS/TLS seguros, assegurando total governança e isolamento por usuário."
    }
  ];

  return (
    <section id="faq" className="py-24 px-6 max-w-4xl mx-auto space-y-12">
      <h2 className="font-title text-3xl font-extrabold text-center text-slate-900 tracking-tight">
        Perguntas Frequentes
      </h2>

      <div className="space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={idx}
              className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden transition-all shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full text-left px-6 py-5 flex justify-between items-center font-bold text-xs md:text-sm text-black focus:outline-none hover:bg-slate-50 transition-colors"
              >
                <span>{faq.question}</span>
                <ChevronDown 
                  size={16} 
                  className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                />
              </button>
              
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 pb-5 text-slate-500 text-xs md:text-sm leading-relaxed border-t border-[#EAEAEA] pt-4 bg-white">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
