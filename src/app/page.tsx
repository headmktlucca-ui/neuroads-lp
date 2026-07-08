'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform, MotionValue } from 'framer-motion';
import { Database, Filter, Cpu, ArrowRight, LayoutDashboard, BarChart3, Network, UserCheck, Mail, MessageSquare, CheckCircle2, ChevronDown, Menu, X } from 'lucide-react';
import RadialOrbitalTimeline from '../components/ui/radial-orbital-timeline';
import HeroCircuitBackground from '@/components/ui/HeroCircuitBackground';
import FunnelInteractiveShowcase from '@/components/neuroads/FunnelInteractiveShowcase';
import PricingValuesSection from '@/components/neuroads/PricingValuesSection';
import VideoPlayerPro from '@/components/ui/VideoPlayerPro';

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
  hidden: { opacity: 0, y: 25, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 90,
      damping: 14
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
          <h4 className="font-head font-extrabold text-xl text-slate-900 tracking-tight leading-none">
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

  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 1000], [0, 500]);

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
              Público-Alvo
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
                Público-Alvo
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
      {/* HERO SECTION WITH PARALLAX BACKGROUND */}
      {/* ========================================================================= */}
      <div className="relative w-full overflow-hidden pt-28 pb-8 md:pb-16">
        {/* Parallax Background Wrapper */}
        <motion.div
          style={{ y: backgroundY }}
          className="absolute -top-80 -bottom-80 inset-x-0 overflow-hidden bg-gradient-to-br from-[#FAFBFD] to-[#ECEFF4] z-[1]"
        >
          <div className="absolute top-80 bottom-80 inset-x-0">
            <HeroCircuitBackground />
          </div>
        </motion.div>

        {/* HERO CONTENT */}
        <section className="relative z-[2] w-full px-4 sm:px-8 lg:px-24 pt-6 md:pt-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Side Info */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Category Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-[inset_2px_2px_5px_#c8d0e7,inset_-2px_-2px_5px_#ffffff] border border-white/30 text-[9px] font-bold tracking-widest text-slate-500 uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF5500] shadow-[0_0_8px_rgba(255,85,0,0.5)]"></span>
              MARKETING · VENDAS · AUTOMAÇÃO · AGENTES IA
            </div>

            {/* Headline */}
            <h1 className="font-head font-extrabold text-3xl md:text-4xl lg:text-5xl text-slate-900 leading-[1.12] tracking-tight mt-6 max-w-3xl">
              Operações IA Estratégicas em <span className="text-[#FF5500]">Marketing & Vendas B2B</span>.
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-base md:text-lg leading-relaxed mt-6 max-w-xl">
              A NeuroAds une campanhas patrocinadas, automação e um ecossistema de agentes inteligentes para transformar o marketing e o comercial da sua empresa B2B em uma máquina previsível de receita.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col items-start mt-8 w-full">
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

            {/* Dynamic Interactive Agent Profile Card (Anexo 03 Style) */}
            <AgentProfileCard agent={activeAgent} />
          </div>

          {/* Right Side - Radial Orbit Animation */}
          <div className="hidden lg:flex lg:col-span-5 items-center justify-center relative mt-8 lg:mt-0">
            <RadialOrbitalTimeline
              items={orbitalItems}
              centerLabel={centerLogoNode}
              theme="light"
              onActiveItemChange={(item) => {
                if (item) {
                  const fullAgent = orbitalItems.find((a) => a.id === item.id);
                  setActiveAgent(fullAgent || item);
                }
              }}
              showTooltip={false}
            />
          </div>
        </section>
      </div>



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
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pb-12 border-b border-slate-300/40"
        >
          <div className="md:col-span-2">
            {/* Category tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-[inset_2px_2px_4px_#c8d0e7,inset_-2px_-2px_4px_#ffffff] border border-white/30 text-[9px] font-bold tracking-widest text-slate-500 uppercase mb-4">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              SOLUÇÕES NEUROADS
            </div>
            {/* Title */}
            <h2 className="font-head font-extrabold text-3xl md:text-4xl text-slate-900 leading-[1.15] tracking-tight">
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
          viewport={{ once: true, margin: "-100px" }}
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
              <h3 className="font-head font-bold text-slate-800 text-lg tracking-tight mb-3">
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
              <h3 className="font-head font-bold text-slate-800 text-lg tracking-tight mb-3">
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
              <h3 className="font-head font-bold text-slate-800 text-lg tracking-tight mb-3">
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
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.2 }}
          className="bg-white shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] rounded-[24px] p-6 border border-white/50 w-full mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all"
        >
          <p className="text-slate-800 font-head font-bold text-sm text-center sm:text-left">
            Não sabe por onde começar? <span className="text-[#FF5500]">Faça o diagnóstico gratuito da sua operação.</span>
          </p>
          <Link
            href="#demonstracao"
            className="inline-flex items-center justify-center font-bold text-xs px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#FF7A00] text-white shadow-[3px_3px_8px_rgba(255,85,0,0.25),-3px_-3px_8px_#ffffff] hover:shadow-[4px_4px_12px_rgba(255,85,0,0.4),-4px_-4px_12px_#ffffff] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 border border-orange-400/10 cursor-pointer"
          >
            Solicitar diagnóstico <span className="ml-1 text-xs">→</span>
          </Link>
        </motion.div>

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
                <span className="font-head font-extrabold text-lg text-slate-900">
                  Neuro<span className="text-[#FF5500]">Ads</span>
                </span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed max-w-2xl">
                Operações IA estratégicas para marketing e vendas B2B. Conectando dados em tempo real, automatizando funis e convertendo oportunidades.
              </p>
            </div>
            
            <div className="md:col-span-4 space-y-4 text-left md:text-right">
              <h4 className="font-head font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">Contato</h4>
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
    const list: { x: number; y: number; size: number; color: string; delay: number }[] = [];
    const addEdgeDots = (x1: number, y1: number, x2: number, y2: number, count: number) => {
      for (let i = 0; i <= count; i++) {
        const t = i / count;
        const baseX = x1 + (x2 - x1) * t;
        const baseY = y1 + (y2 - y1) * t;
        
        const jitterX = (Math.random() - 0.5) * 8;
        const jitterY = (Math.random() - 0.5) * 8;
        const size = Math.random() * 2 + 1.5;
        
        const colors = ['#8B5CF6', '#3B82F6', '#FF5500', '#A78BFA', '#93C5FD'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        list.push({
          x: baseX + jitterX,
          y: baseY + jitterY,
          size,
          color,
          delay: Math.random() * 2,
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
              animation: `pulse ${1.5 + Math.random()}s infinite alternate`,
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

function TAFreelancerSVG() {
  return (
    <svg viewBox="0 0 210 185" width="210" height="185" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ta-fl-lid" x1="0" y1="0" x2="100%" y2="100%"><stop stopColor="#E8EAED"/><stop offset="1" stopColor="#BDC1C8"/></linearGradient>
        <linearGradient id="ta-fl-base" x1="0" y1="0" x2="100%" y2="100%"><stop stopColor="#D4D8DD"/><stop offset="1" stopColor="#AAAFB6"/></linearGradient>
        <linearGradient id="ta-cup-g" x1="0" y1="0" x2="100%" y2="100%"><stop stopColor="#FFB07A"/><stop offset="1" stopColor="#FF6535"/></linearGradient>
        <filter id="ta-fl-drop"><feDropShadow dx="2" dy="10" stdDeviation="12" floodColor="#FF5500" floodOpacity="0.2"/></filter>
      </defs>
      <ellipse cx="98" cy="178" rx="72" ry="9" fill="#FF5500" fillOpacity="0.11"/>
      <g filter="url(#ta-fl-drop)">
        <path d="M28 100 L162 100 L152 14 L38 14 Z" fill="url(#ta-fl-lid)"/>
        <path d="M38 94 L152 94 L144 21 L46 21 Z" fill="#131822"/>
        <path d="M44 89 L147 89 L140 27 L51 27 Z" fill="#0C1321"/>
        <path d="M44 27 L76 27 L71 55 L44 55 Z" fill="white" fillOpacity="0.032"/>
        <rect x="53" y="31" width="24" height="2.5" rx="1.25" fill="#FF8B4D" fillOpacity="0.75"/>
        <rect x="53" y="37" width="46" height="1.5" rx="0.75" fill="white" fillOpacity="0.16"/>
        <rect x="53" y="42" width="34" height="1.5" rx="0.75" fill="white" fillOpacity="0.1"/>
        <rect x="55" y="66" width="8" height="18" rx="1.5" fill="#FF8B4D" fillOpacity="0.9"/>
        <rect x="67" y="59" width="8" height="25" rx="1.5" fill="#FF6535"/>
        <rect x="79" y="63" width="8" height="21" rx="1.5" fill="#FF9F70" fillOpacity="0.85"/>
        <rect x="91" y="55" width="8" height="29" rx="1.5" fill="#FF4500"/>
        <rect x="103" y="59" width="8" height="25" rx="1.5" fill="#FF8B4D"/>
        <rect x="115" y="51" width="8" height="33" rx="1.5" fill="#E03A00"/>
        <polyline points="59,78 71,72 83,75 95,67 107,70 119,63" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.55" strokeLinejoin="round" strokeLinecap="round"/>
        <line x1="52" y1="84" x2="129" y2="84" stroke="white" strokeWidth="0.75" strokeOpacity="0.2"/>
        <path d="M23 100 L167 100 L162 122 L28 122 Z" fill="url(#ta-fl-base)"/>
        <rect x="32" y="103" width="114" height="1.5" rx="0.75" fill="white" fillOpacity="0.28"/>
        <rect x="33" y="107" width="112" height="1.5" rx="0.75" fill="white" fillOpacity="0.22"/>
        <rect x="35" y="111" width="106" height="1.5" rx="0.75" fill="white" fillOpacity="0.16"/>
        <rect x="75" y="113" width="40" height="8" rx="2.5" fill="#B8BBC0"/>
      </g>
      <g transform="translate(128, 72)">
        <ellipse cx="16" cy="56" rx="14" ry="4" fill="#FF5500" fillOpacity="0.13"/>
        <path d="M1 3 L31 3 L27 52 L5 52 Z" fill="url(#ta-cup-g)"/>
        <ellipse cx="16" cy="3" rx="16" ry="4.5" fill="#FFBE95"/>
        <ellipse cx="16" cy="3" rx="12" ry="3" fill="#2A1004"/>
        <path d="M31 14 Q46 15 45 30 Q44 43 31 41" fill="none" stroke="#FFB07A" strokeWidth="6.5" strokeLinecap="round"/>
        <path d="M31 14 Q44 15 43 30 Q42 41 31 39" fill="none" stroke="#FFDEC4" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.45"/>
        <path d="M2 3 L11 3 L9 23 L2 23 Z" fill="white" fillOpacity="0.18"/>
        <path d="M8 -9 Q12 -17 8 -26" fill="none" stroke="#FF9F70" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.4"/>
        <path d="M17 -11 Q21 -19 17 -28" fill="none" stroke="#FF9F70" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.28"/>
      </g>
    </svg>
  );
}

function TAAgenciaSVG() {
  return (
    <svg viewBox="0 0 210 185" width="210" height="185" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ta-ag-b1" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#5AAEFF"/><stop offset="1" stopColor="#1248B8"/></linearGradient>
        <linearGradient id="ta-ag-b2" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#3D8DFF"/><stop offset="1" stopColor="#0044CC"/></linearGradient>
        <linearGradient id="ta-ag-b3" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#74AAFF"/><stop offset="1" stopColor="#2060E8"/></linearGradient>
        <filter id="ta-ag-drop"><feDropShadow dx="2" dy="10" stdDeviation="12" floodColor="#1A73E8" floodOpacity="0.22"/></filter>
      </defs>
      <ellipse cx="105" cy="178" rx="78" ry="9" fill="#1A73E8" fillOpacity="0.12"/>
      <g filter="url(#ta-ag-drop)">
        <path d="M20 150 L190 150 L200 160 L10 160 Z" fill="#D0D8E8" fillOpacity="0.5"/>
        <path d="M33 82 L72 82 L77 88 L38 88 Z" fill="#6CB5FF"/>
        <path d="M38 88 L77 88 L77 148 L38 148 Z" fill="url(#ta-ag-b1)"/>
        <path d="M72 82 L83 88 L83 152 L77 148 L77 88 Z" fill="#0C3E9E" fillOpacity="0.85"/>
        <rect x="42" y="92" width="7" height="42" rx="2" fill="white" fillOpacity="0.1"/>
        <path d="M90 42 L129 42 L134 48 L95 48 Z" fill="#7AB8FF"/>
        <path d="M95 48 L134 48 L134 148 L95 148 Z" fill="url(#ta-ag-b2)"/>
        <path d="M129 42 L140 48 L140 153 L134 148 L134 48 Z" fill="#003A8C" fillOpacity="0.85"/>
        <rect x="99" y="52" width="7" height="58" rx="2" fill="white" fillOpacity="0.1"/>
        <path d="M145 102 L184 102 L189 108 L150 108 Z" fill="#6CB5FF"/>
        <path d="M150 108 L189 108 L189 148 L150 148 Z" fill="url(#ta-ag-b3)"/>
        <path d="M184 102 L195 108 L195 152 L189 148 L189 108 Z" fill="#0D3888" fillOpacity="0.85"/>
        <rect x="154" y="112" width="7" height="24" rx="2" fill="white" fillOpacity="0.1"/>
        <polyline points="55,84 112,44 167,104" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.8"/>
        <circle cx="55" cy="84" r="4.5" fill="white" fillOpacity="0.9"/>
        <circle cx="112" cy="44" r="4.5" fill="white" fillOpacity="0.9"/>
        <circle cx="167" cy="104" r="4.5" fill="white" fillOpacity="0.9"/>
        <circle cx="112" cy="24" r="13" fill="#1A73E8"/>
        <path d="M112 31 L112 17 M108 22 L112 17 L116 22" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
    </svg>
  );
}

function TAConsultoriaSVG() {
  return (
    <svg viewBox="0 0 210 185" width="210" height="185" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ta-br-body" x1="0" y1="0" x2="100%" y2="100%"><stop stopColor="#34D98C"/><stop offset="1" stopColor="#047857"/></linearGradient>
        <linearGradient id="ta-br-top" x1="0" y1="0" x2="100%" y2="0"><stop stopColor="#4EEEA3"/><stop offset="1" stopColor="#0EA873"/></linearGradient>
        <filter id="ta-br-drop"><feDropShadow dx="2" dy="10" stdDeviation="12" floodColor="#047857" floodOpacity="0.28"/></filter>
      </defs>
      <ellipse cx="100" cy="178" rx="72" ry="9" fill="#047857" fillOpacity="0.13"/>
      <g transform="translate(128, 22) rotate(14)">
        <rect x="0" y="0" width="58" height="74" rx="5" fill="white" fillOpacity="0.94"/>
        <rect x="0" y="0" width="58" height="8" rx="5" fill="#059669" fillOpacity="0.15"/>
        <rect x="7" y="14" width="32" height="2.5" rx="1.25" fill="#047857" fillOpacity="0.5"/>
        <rect x="7" y="21" width="44" height="1.5" rx="0.75" fill="#64748B" fillOpacity="0.28"/>
        <rect x="7" y="26" width="38" height="1.5" rx="0.75" fill="#64748B" fillOpacity="0.22"/>
        <rect x="7" y="31" width="44" height="1.5" rx="0.75" fill="#64748B" fillOpacity="0.18"/>
        <rect x="7" y="36" width="30" height="1.5" rx="0.75" fill="#64748B" fillOpacity="0.14"/>
        <circle cx="12" cy="50" r="5.5" fill="#059669" fillOpacity="0.18"/>
        <path d="M9 50 L11 52.5 L15.5 47.5" fill="none" stroke="#059669" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="63" r="5.5" fill="#059669" fillOpacity="0.18"/>
        <path d="M9 63 L11 65.5 L15.5 60.5" fill="none" stroke="#059669" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="22" y="48" width="30" height="2.5" rx="1.25" fill="#64748B" fillOpacity="0.18"/>
        <rect x="22" y="61" width="24" height="2.5" rx="1.25" fill="#64748B" fillOpacity="0.18"/>
      </g>
      <g filter="url(#ta-br-drop)">
        <path d="M76 58 Q76 42 105 42 Q134 42 134 58" fill="none" stroke="url(#ta-br-top)" strokeWidth="11" strokeLinecap="round"/>
        <path d="M76 58 Q76 45 105 45 Q134 45 134 58" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.38"/>
        <rect x="44" y="58" width="120" height="90" rx="11" fill="url(#ta-br-body)"/>
        <ellipse cx="104" cy="67" rx="46" ry="9" fill="white" fillOpacity="0.18"/>
        <rect x="88" y="94" width="32" height="17" rx="5" fill="#0A5C40" fillOpacity="0.8"/>
        <rect x="95" y="98" width="18" height="9" rx="2.5" fill="white" fillOpacity="0.18"/>
        <circle cx="104" cy="102" r="3" fill="white" fillOpacity="0.38"/>
        <line x1="44" y1="102" x2="88" y2="102" stroke="white" strokeWidth="0.8" strokeOpacity="0.18"/>
        <line x1="120" y1="102" x2="164" y2="102" stroke="white" strokeWidth="0.8" strokeOpacity="0.18"/>
        <rect x="48" y="72" width="7" height="34" rx="3.5" fill="white" fillOpacity="0.08"/>
        <rect x="152" y="72" width="7" height="34" rx="3.5" fill="white" fillOpacity="0.08"/>
        <rect x="90" y="87" width="28" height="5" rx="2.5" fill="#0F6B4A" fillOpacity="0.75"/>
      </g>
    </svg>
  );
}

function TAEcommerceSVG() {
  return (
    <svg viewBox="0 0 210 185" width="210" height="185" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ta-ec-bag1" x1="0" y1="0" x2="100%" y2="100%"><stop stopColor="#A78BFA"/><stop offset="1" stopColor="#5B21B6"/></linearGradient>
        <linearGradient id="ta-ec-bag2" x1="0" y1="0" x2="100%" y2="100%"><stop stopColor="#C4B5FD"/><stop offset="1" stopColor="#7C3AED"/></linearGradient>
        <linearGradient id="ta-ec-box" x1="0" y1="0" x2="100%" y2="100%"><stop stopColor="#DDD6FE"/><stop offset="1" stopColor="#A78BFA"/></linearGradient>
        <filter id="ta-ec-drop"><feDropShadow dx="2" dy="10" stdDeviation="12" floodColor="#7C3AED" floodOpacity="0.25"/></filter>
      </defs>
      <ellipse cx="105" cy="178" rx="72" ry="9" fill="#7C3AED" fillOpacity="0.12"/>
      <g filter="url(#ta-ec-drop)">
        <g transform="translate(122, 102)">
          <path d="M0 0 L50 0 L62 -12 L12 -12 Z" fill="#C4B5FD"/>
          <path d="M0 0 L50 0 L50 50 L0 50 Z" fill="url(#ta-ec-box)"/>
          <path d="M50 0 L62 -12 L62 38 L50 50 Z" fill="#7C3AED" fillOpacity="0.65"/>
          <rect x="20" y="-10" width="10" height="54" fill="white" fillOpacity="0.18"/>
          <ellipse cx="16" cy="12" rx="13" ry="5.5" fill="white" fillOpacity="0.16"/>
        </g>
        <path d="M72 68 Q72 44 93 44 Q114 44 114 68" fill="none" stroke="#A78BFA" strokeWidth="8" strokeLinecap="round"/>
        <path d="M72 68 Q72 46 93 46 Q114 46 114 68" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeOpacity="0.38"/>
        <path d="M50 68 L158 68 L150 158 L58 158 Z" fill="url(#ta-ec-bag1)"/>
        <path d="M48 68 L160 68 L160 79 L48 79 Z" fill="#C4B5FD"/>
        <ellipse cx="104" cy="76" rx="44" ry="8" fill="white" fillOpacity="0.18"/>
        <circle cx="104" cy="116" r="20" fill="white" fillOpacity="0.1"/>
        <path d="M104 101 L107.5 111 L119 111 L110 118 L113.5 128 L104 121 L94.5 128 L98 118 L89 111 L100.5 111 Z" fill="white" fillOpacity="0.42"/>
        <line x1="58" y1="79" x2="62" y2="154" stroke="white" strokeWidth="0.75" strokeOpacity="0.14"/>
        <line x1="150" y1="79" x2="146" y2="154" stroke="white" strokeWidth="0.75" strokeOpacity="0.14"/>
        <path d="M28 86 Q28 72 40 72 Q52 72 52 86" fill="none" stroke="#C4B5FD" strokeWidth="5.5" strokeLinecap="round"/>
        <path d="M16 86 L64 86 L59 138 L21 138 Z" fill="url(#ta-ec-bag2)"/>
        <ellipse cx="40" cy="93" rx="20" ry="4.5" fill="white" fillOpacity="0.18"/>
      </g>
    </svg>
  );
}

function TACrossBorderSVG() {
  return (
    <svg viewBox="0 0 210 185" width="210" height="185" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ta-gl-ocean" cx="38%" cy="33%" r="60%"><stop stopColor="#38D4E8"/><stop offset="1" stopColor="#0E7490"/></radialGradient>
        <radialGradient id="ta-gl-land" cx="50%" cy="50%" r="50%"><stop stopColor="#4ADE80"/><stop offset="1" stopColor="#15803D"/></radialGradient>
        <filter id="ta-gl-drop"><feDropShadow dx="2" dy="10" stdDeviation="14" floodColor="#0E7490" floodOpacity="0.28"/></filter>
        <clipPath id="ta-gl-clip"><circle cx="105" cy="95" r="74"/></clipPath>
        <linearGradient id="ta-pin-g" x1="0" y1="0" x2="100%" y2="100%"><stop stopColor="#22D3EE"/><stop offset="1" stopColor="#0891B2"/></linearGradient>
      </defs>
      <ellipse cx="105" cy="178" rx="72" ry="9" fill="#0891B2" fillOpacity="0.13"/>
      <g filter="url(#ta-gl-drop)">
        <circle cx="105" cy="95" r="74" fill="url(#ta-gl-ocean)"/>
        <g clipPath="url(#ta-gl-clip)">
          <path d="M42 52 Q58 40 72 62 Q86 85 68 100 Q55 115 42 104 Q26 87 32 66 Z" fill="url(#ta-gl-land)" fillOpacity="0.85"/>
          <path d="M98 48 Q116 44 127 58 Q140 74 132 90 Q124 110 112 120 Q97 123 89 108 Q82 90 89 67 Z" fill="url(#ta-gl-land)" fillOpacity="0.85"/>
          <path d="M138 42 Q166 36 177 58 Q188 80 176 100 Q164 112 148 106 Q132 94 132 72 Z" fill="url(#ta-gl-land)" fillOpacity="0.7"/>
          <ellipse cx="105" cy="95" rx="74" ry="22" fill="none" stroke="white" strokeWidth="0.75" strokeOpacity="0.14"/>
          <ellipse cx="105" cy="95" rx="68" ry="44" fill="none" stroke="white" strokeWidth="0.75" strokeOpacity="0.1"/>
          <path d="M105 21 Q138 95 105 169" fill="none" stroke="white" strokeWidth="0.75" strokeOpacity="0.1"/>
          <path d="M105 21 Q72 95 105 169" fill="none" stroke="white" strokeWidth="0.75" strokeOpacity="0.1"/>
          <line x1="31" y1="95" x2="179" y2="95" stroke="white" strokeWidth="0.75" strokeOpacity="0.1"/>
          <ellipse cx="79" cy="65" rx="24" ry="19" fill="white" fillOpacity="0.17"/>
        </g>
        <circle cx="105" cy="95" r="74" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.14"/>
      </g>
      <g transform="translate(152, 22)">
        <path d="M20 0 C9 0 0 9 0 20 C0 35 20 56 20 56 C20 56 40 35 40 20 C40 9 31 0 20 0 Z" fill="url(#ta-pin-g)"/>
        <circle cx="20" cy="20" r="8" fill="white" fillOpacity="0.55"/>
        <circle cx="20" cy="20" r="4.5" fill="white" fillOpacity="0.82"/>
        <ellipse cx="13" cy="12" rx="5.5" ry="3.5" fill="white" fillOpacity="0.32"/>
        <ellipse cx="20" cy="58" rx="10" ry="3" fill="#0891B2" fillOpacity="0.18"/>
      </g>
    </svg>
  );
}

function TAIncorporadoraSVG() {
  return (
    <svg viewBox="0 0 210 185" width="210" height="185" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ta-bd-main" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#FBBF24"/><stop offset="1" stopColor="#92400E"/></linearGradient>
        <linearGradient id="ta-bd-side" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#F59E0B"/><stop offset="1" stopColor="#78350F"/></linearGradient>
        <linearGradient id="ta-bd-top" x1="0" y1="0" x2="100%" y2="100%"><stop stopColor="#FDE68A"/><stop offset="1" stopColor="#FBBF24"/></linearGradient>
        <linearGradient id="ta-key-g" x1="0" y1="0" x2="100%" y2="100%"><stop stopColor="#FCD34D"/><stop offset="1" stopColor="#D97706"/></linearGradient>
        <filter id="ta-bd-drop"><feDropShadow dx="2" dy="10" stdDeviation="12" floodColor="#92400E" floodOpacity="0.25"/></filter>
      </defs>
      <ellipse cx="95" cy="178" rx="72" ry="9" fill="#92400E" fillOpacity="0.12"/>
      <g filter="url(#ta-bd-drop)">
        <path d="M138 82 L170 82 L170 152 L138 152 Z" fill="#D97706" fillOpacity="0.85"/>
        <path d="M170 82 L182 72 L182 142 L170 152 Z" fill="#92400E" fillOpacity="0.68"/>
        <path d="M138 82 L170 82 L182 72 L150 72 Z" fill="#FDE68A" fillOpacity="0.78"/>
        {[0,1,2,3,4,5].map((row) => [0,1].map((col) => (
          <rect key={`sb-${row}-${col}`} x={144 + col*16} y={90 + row*11} width={9} height={7} rx={1} fill="white" fillOpacity={0.22 + row * 0.02}/>
        )))}
        <path d="M38 15 L118 15 L118 152 L38 152 Z" fill="url(#ta-bd-main)"/>
        <path d="M118 15 L134 5 L134 142 L118 152 Z" fill="url(#ta-bd-side)"/>
        <path d="M38 15 L118 15 L134 5 L54 5 Z" fill="url(#ta-bd-top)"/>
        <ellipse cx="72" cy="28" rx="24" ry="9" fill="white" fillOpacity="0.18"/>
        {[0,1,2,3,4,5,6,7,8].map((row) => [0,1,2].map((col) => (
          <rect key={`bw-${row}-${col}`} x={46 + col*24} y={28 + row*14} width={16} height={10} rx={1.5}
            fill={row > 5 ? '#FDE68A' : 'white'}
            fillOpacity={row > 5 ? 0.48 : 0.18 + row * 0.02}
          />
        )))}
        <rect x="74" y="-12" width="6" height="17" rx="3" fill="#D97706"/>
        <circle cx="77" cy="-14" r="3.5" fill="#FCD34D"/>
        <rect x="60" y="120" width="36" height="32" rx="4" fill="#7C2D0A" fillOpacity="0.45"/>
        <rect x="74" y="122" width="6" height="30" fill="#7C2D0A" fillOpacity="0.28"/>
      </g>
      <g transform="translate(118, 115) rotate(-28)">
        <circle cx="16" cy="16" r="14" fill="none" stroke="url(#ta-key-g)" strokeWidth="6.5"/>
        <circle cx="16" cy="16" r="6" fill="none" stroke="url(#ta-key-g)" strokeWidth="4.5"/>
        <rect x="28" y="13" width="44" height="7" rx="3.5" fill="url(#ta-key-g)"/>
        <rect x="58" y="20" width="5.5" height="9" rx="2" fill="url(#ta-key-g)"/>
        <rect x="47" y="20" width="5" height="7" rx="2" fill="url(#ta-key-g)"/>
        <circle cx="16" cy="16" r="5.5" fill="white" fillOpacity="0.28"/>
        <ellipse cx="10" cy="11" rx="4.5" ry="3.2" fill="white" fillOpacity="0.2"/>
        <ellipse cx="16" cy="34" rx="15" ry="3" fill="#92400E" fillOpacity="0.14"/>
      </g>
    </svg>
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
      illustration: <TAFreelancerSVG />,
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
      illustration: <TAAgenciaSVG />,
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
      illustration: <TAConsultoriaSVG />,
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
      illustration: <TAEcommerceSVG />,
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
      illustration: <TACrossBorderSVG />,
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
      illustration: <TAIncorporadoraSVG />,
    },
  ];

  return (
    <section id="publico-alvo" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 space-y-12">
      <div className="space-y-4 max-w-xl text-center mx-auto">
        <span className="text-[10px] font-black text-[#FF5500] uppercase tracking-widest block">PÚBLICO-ALVO</span>
        <h2 className="font-head text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Para quem é a NeuroAds?
        </h2>
        <p className="text-slate-600 text-xs md:text-sm leading-relaxed">
          Unifique dados, automatize funis e coloque agentes de IA para otimizar suas conversões comerciais todos os dias.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {cards.map((card, idx) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: idx * 0.09 }}
            className="relative overflow-hidden rounded-[24px] p-8 min-h-[220px] flex flex-col"
            style={{ backgroundColor: card.bg }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 self-start bg-white/70 backdrop-blur-sm rounded-full px-3.5 py-1.5 mb-5 shadow-sm">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: card.badgeDot }} />
              <span className="text-[10px] font-bold text-slate-600 tracking-wide whitespace-nowrap">{card.badge}</span>
            </div>

            {/* Title */}
            <h3 className="font-head font-black text-[22px] text-slate-900 mb-3 leading-snug max-w-[58%]">
              {card.title}
            </h3>

            {/* Description */}
            <p className="text-slate-600 text-sm leading-relaxed max-w-[58%] mb-6 flex-1">
              {card.description}
            </p>

            {/* CTA */}
            <a
              href="#"
              className="inline-flex items-center gap-1.5 text-sm font-bold transition-all duration-200 hover:gap-2.5 group"
              style={{ color: card.accentColor }}
            >
              {card.cta}
              <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </a>

            {/* Illustration — overflowing bottom-right */}
            <div className="absolute -bottom-3 -right-3 pointer-events-none select-none">
              {card.illustration}
            </div>
          </motion.div>
        ))}
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
    <section id="agentes" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24 text-center space-y-16">
      <div className="space-y-4 max-w-2xl mx-auto">
        <span className="text-[10px] font-black text-[#FF5500] uppercase tracking-widest block">RECURSOS PRINCIPAIS</span>
        <h2 className="font-head text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Projetamos uma experiência de marketing focada em lucro
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
                      <span className="text-white font-head font-black text-xl leading-tight">
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
                <h3 className="font-head text-3xl font-black text-slate-900">
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
    </section>
  );
}


function DataTransformationSection() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 border-t border-slate-300/30 relative">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ff6a00]/3 filter blur-3xl rounded-full pointer-events-none" />
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start relative z-10">
        {/* Left Column - Main Copy */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="lg:col-span-6 space-y-6"
        >
          <h2 className="font-head font-extrabold text-3xl md:text-4xl text-slate-900 leading-tight tracking-tight">
            Transforme dados em crescimento
          </h2>
          
          <p className="text-slate-650 text-base md:text-lg leading-relaxed font-normal">
            Se você não confia 100% nos seus dados hoje, podemos presumir que toda decisão tomada é, estatisticamente, uma <strong className="underline decoration-[#FF5500]/40 decoration-2 underline-offset-4 text-slate-800">aposta</strong>.
          </p>
          
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            Acredite, dados soltos, espalhados entre diversas ferramentas, são um grande problema de produtividade e eficiência na empresa.
          </p>
          
          <div className="pt-6 border-t border-slate-300/40 space-y-4">
            <h3 className="font-head font-bold text-xl md:text-2xl text-slate-900 leading-snug">
              A NeuroAds te ajuda a organizar os dados e a identificar os gargalos.
            </h3>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              Integre as ferramentas que você já utiliza e organize toda a informação usando a <strong className="text-[#FF5500]">NeuroAds</strong>.
            </p>
          </div>
        </motion.div>

        {/* Right Column - Neumorphic Bullet List */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.12
              }
            }
          }}
          className="lg:col-span-6 space-y-6"
        >
          {/* Feature 1 */}
          <motion.div
            variants={cardVariants}
            className="p-5 rounded-2xl border border-white/60 bg-white shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] hover:shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff] hover:scale-[1.01] transition-all duration-300 flex gap-5 group"
          >
            <div className="shrink-0"><IconPieChart /></div>
            <div className="space-y-1.5">
              <h4 className="font-head font-bold text-base text-slate-850 group-hover:text-[#FF5500] transition-colors duration-200">
                Crie dashboards
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Crie dashboards, funis e relatórios a partir de dados centralizados de marketing e vendas.
              </p>
            </div>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            variants={cardVariants}
            className="p-5 rounded-2xl border border-white/60 bg-white shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] hover:shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff] hover:scale-[1.01] transition-all duration-300 flex gap-5 group"
          >
            <div className="shrink-0"><IconLineChart /></div>
            <div className="space-y-1.5">
              <h4 className="font-head font-bold text-base text-slate-850 group-hover:text-[#FF5500] transition-colors duration-200">
                Visualize indicadores
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Acompanhe suas principais métricas e indicadores de crescimento em tempo real.
              </p>
            </div>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            variants={cardVariants}
            className="p-5 rounded-2xl border border-white/60 bg-white shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] hover:shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff] hover:scale-[1.01] transition-all duration-300 flex gap-5 group"
          >
            <div className="shrink-0"><IconNodesMerge /></div>
            <div className="space-y-1.5">
              <h4 className="font-head font-bold text-base text-slate-850 group-hover:text-[#FF5500] transition-colors duration-200">
                Processe dados
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Construa fluxos de dados para integrar, coletar e mover informação entre as ferramentas que você já utiliza.
              </p>
            </div>
          </motion.div>

          {/* Feature 4 */}
          <motion.div
            variants={cardVariants}
            className="p-5 rounded-2xl border border-white/60 bg-white shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] hover:shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff] hover:scale-[1.01] transition-all duration-300 flex gap-5 group"
          >
            <div className="shrink-0"><IconCrosshairTarget /></div>
            <div className="space-y-1.5">
              <h4 className="font-head font-bold text-base text-slate-850 group-hover:text-[#FF5500] transition-colors duration-200">
                Atribuição de mídia
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed">
                Saiba exatamente quais ações e campanhas geram mais resultado e prove o impacto do trabalho.
              </p>
            </div>
          </motion.div>
        </motion.div>
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
      <section id="demonstracao" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
      {/* Header section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
        className="text-center pb-16"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white shadow-[inset_2px_2px_4px_#c8d0e7,inset_-2px_-2px_4px_#ffffff] border border-white/30 text-[9px] font-bold tracking-widest text-slate-500 uppercase mb-4">
          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
          DEMONSTRAÇÃO & ACESSO
        </div>
        <h2 className="font-head font-extrabold text-3xl md:text-4xl text-slate-900 leading-tight tracking-tight max-w-2xl mx-auto">
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
          <div className="relative aspect-video rounded-[32px] overflow-hidden bg-slate-950 shadow-[0_20px_40px_rgba(255,85,0,0.12),_0_1px_3px_rgba(255,85,0,0.05)]">
            <VideoPlayerPro src="/videos/VD_BV.mp4" />
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
            <h3 className="font-head font-extrabold text-black text-lg mb-2 text-left">
              Solicite seu acesso
            </h3>
            <p className="text-slate-500 text-xs leading-relaxed mb-6 text-left">
              Preencha os campos abaixo e entraremos em contato para liberar seu painel NeuroAds.
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
                    Solicitar Acesso Completo
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
                    <h4 className="font-head font-extrabold text-slate-900 text-base">Solicitação enviada!</h4>
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
    </section>
    </div>
  );
}
function TestimonialSection() {
  return (
    <section className="bg-white border-y border-slate-300/40 py-12 px-6 text-center">
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
        <p className="text-slate-700 text-sm md:text-base font-semibold italic leading-relaxed">
          &ldquo;A NeuroAds resolveu o que nenhuma outra empresa conseguiu: personalização de IA real com dados de verdade. Conseguimos ver o comportamento, o que funciona e acompanhar o processo comercial completo — tudo isso com atendimento muito próximo.&rdquo;
        </p>
        <div className="shrink-0 text-left border-t md:border-t-0 md:border-l border-slate-300/40 pt-3 md:pt-0 md:pl-6">
          <span className="text-xs font-bold text-black block">Claudio Müller</span>
          <span className="text-[9px] font-extrabold text-[#FF5500] uppercase tracking-wider block">Analista em Marketing & IA</span>
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
    <section id="comparacao" className="py-20 bg-white border-y border-slate-300/40 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        <div className="lg:col-span-5 space-y-6 flex flex-col items-start text-left">
          <span className="text-[10px] font-black text-[#FF5500] uppercase tracking-widest block">O PROBLEMA DAS AGÊNCIAS</span>
          <h2 className="font-head text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            A maior parte das agências de tráfego é lenta, cara e confusa.
          </h2>
          <p className="text-slate-650 text-xs md:text-sm leading-relaxed">
            Sua operação comercial precisa de dados integrados de marketing e vendas rodando em tempo real, sem planilhas confusas e sem ter que delegar tarefas manualmente.
          </p>
          <Link 
            href="/cadastro" 
            className="inline-flex items-center font-bold text-xs bg-black hover:bg-neutral-800 text-white px-6 py-3.5 rounded-xl transition-all shadow-sm"
          >
            Conectar Minhas Campanhas
          </Link>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {cards.map((card, idx) => (
            <div 
              key={idx} 
              className="border border-white/80 rounded-2xl p-6 bg-white space-y-4 hover:scale-[1.01] transition-transform duration-300 shadow-[4px_4px_10px_#c8d0e7]"
            >
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest block">{card.tag}</span>
              <h4 className="font-head font-bold text-slate-800 text-sm">{card.title}</h4>
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
      <h2 className="font-head text-3xl font-black text-center text-slate-900 tracking-tight">
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
