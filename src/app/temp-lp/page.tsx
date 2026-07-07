'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, useScroll, useTransform, MotionValue } from 'framer-motion';
import { Database, Filter, Cpu, ArrowRight, LayoutDashboard, BarChart3, Network, UserCheck, Mail, MessageSquare, CheckCircle2, ChevronDown } from 'lucide-react';
import RadialOrbitalTimeline from '../../components/ui/radial-orbital-timeline';

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
      <div className="w-[120px] h-[120px] md:w-[150px] md:h-[150px] rounded-3xl overflow-hidden border border-white/60 bg-[#EDF1F5] shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] z-10 shrink-0 relative">
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
      <div className="w-full md:w-[75%] md:-ml-8 p-6 md:p-6 rounded-3xl border border-white/80 bg-[#EDF1F5] shadow-[8px_8px_16px_#c8d0e7,-8px_-8px_16px_#ffffff] z-20 flex flex-col space-y-3">
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
                className="w-7 h-7 rounded-full bg-[#EDF1F5] border border-white/60 shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff] flex items-center justify-center text-slate-500 hover:text-[#FF5500] hover:scale-[1.05] transition-all duration-200 cursor-pointer"
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
    <div className="bg-[#EDF1F5] min-h-screen text-slate-800 font-sans antialiased overflow-x-clip pb-16 selection:bg-[#FF5500]/20 selection:text-[#FF5500]">
      
      {/* ========================================================================= */}
      {/* HEADER TEMPLATE 01 */}
      {/* ========================================================================= */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-[#EDF1F5] shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] border border-white/50 rounded-full py-4 px-8 flex items-center justify-between transition-all duration-300">
          {/* Logo */}
          <Link href="#" className="flex items-center group transition-transform duration-300 hover:scale-[1.01]">
            <Image
              src="/images/Logos/Logo_primario.png"
              alt="NeuroAds Logo"
              width={132}
              height={30}
              className="h-7 w-auto object-contain"
              priority
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <div 
              className="relative"
              onMouseEnter={() => setIsSobreOpen(true)}
              onMouseLeave={() => setIsSobreOpen(false)}
            >
              <span 
                className="flex items-center gap-1 text-slate-600 font-medium text-sm hover:text-[#FF5500] transition-colors duration-200 py-2 focus:outline-none cursor-pointer select-none"
              >
                Sobre
                <motion.span
                  animate={{ rotate: isSobreOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={14} className="text-slate-400" />
                </motion.span>
              </span>

              <AnimatePresence>
                {isSobreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-56 z-50"
                  >
                    <div className="bg-[#EDF1F5] shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] border border-white/50 rounded-2xl p-2.5 flex flex-col gap-1">
                      <Link 
                        href="/a-neuroads/sobre#posicionamento" 
                        onClick={() => setIsSobreOpen(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl hover:bg-[#e4ecf5] hover:text-[#FF5500] transition-all duration-150"
                      >
                        Posicionamento
                      </Link>
                      <Link 
                        href="/a-neuroads/sobre#pilares" 
                        onClick={() => setIsSobreOpen(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl hover:bg-[#e4ecf5] hover:text-[#FF5500] transition-all duration-150"
                      >
                        Nossos pilares
                      </Link>
                      <Link 
                        href="/a-neuroads/sobre" 
                        onClick={() => setIsSobreOpen(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl hover:bg-[#e4ecf5] hover:text-[#FF5500] transition-all duration-150"
                      >
                        Quem somos
                      </Link>
                      <Link 
                        href="/a-neuroads/sobre#imprensa" 
                        onClick={() => setIsSobreOpen(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl hover:bg-[#e4ecf5] hover:text-[#FF5500] transition-all duration-150"
                      >
                        Imprensa
                      </Link>
                      <Link 
                        href="/privacidade" 
                        onClick={() => setIsSobreOpen(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl hover:bg-[#e4ecf5] hover:text-[#FF5500] transition-all duration-150"
                      >
                        Política de Privacidade
                      </Link>
                      <Link 
                        href="/termos" 
                        onClick={() => setIsSobreOpen(false)}
                        className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl hover:bg-[#e4ecf5] hover:text-[#FF5500] transition-all duration-150"
                      >
                        Termos e DPA
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link href="#agentes" className="text-slate-600 font-medium text-sm hover:text-[#FF5500] transition-colors duration-200">
              Agentes IA
            </Link>
            <Link href="#campanhas" className="text-slate-600 font-medium text-sm hover:text-[#FF5500] transition-colors duration-200">
              Campanhas
            </Link>
            <Link href="#algoritmo" className="text-slate-600 font-medium text-sm hover:text-[#FF5500] transition-colors duration-200">
              Além do Algoritmo
            </Link>
            <Link href="#valores" className="text-slate-600 font-medium text-sm hover:text-[#FF5500] transition-colors duration-200">
              Valores
            </Link>
          </nav>

          {/* Action Button */}
          <div>
            <Link
              href="/login"
              className="inline-flex items-center justify-center font-bold text-xs px-6 py-2.5 rounded-full bg-[#EDF1F5] text-slate-700 shadow-[4px_4px_8px_#c8d0e7,-4px_-4px_8px_#ffffff] border border-white/60 hover:shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff] hover:bg-[#e4ecf5] active:scale-[0.98] transition-all duration-200"
            >
              Acessar Hub
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* HERO SECTION TEMPLATE 01 */}
      {/* ========================================================================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Side Info */}
        <div className="lg:col-span-7 flex flex-col items-start">
          {/* Category Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#EDF1F5] shadow-[inset_2px_2px_5px_#c8d0e7,inset_-2px_-2px_5px_#ffffff] border border-white/30 text-[9px] font-bold tracking-widest text-slate-500 uppercase">
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
        <div className="lg:col-span-5 flex items-center justify-center relative mt-8 lg:mt-0">
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



      {/* ========================================================================= */}
      {/* TRANSFORME DADOS EM CRESCIMENTO */}
      {/* ========================================================================= */}
      <DataTransformationSection />

      {/* ========================================================================= */}
      {/* RECURSOS INTEGRADOS (USE CASES SECTION) */}
      {/* ========================================================================= */}
      <UseCasesSection />

      {/* ========================================================================= */}
      {/* SOLUTIONS SECTION TEMPLATE 02 */}
      {/* ========================================================================= */}
      <section id="solucoes" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
        
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDF1F5] shadow-[inset_2px_2px_4px_#c8d0e7,inset_-2px_-2px_4px_#ffffff] border border-white/30 text-[9px] font-bold tracking-widest text-slate-500 uppercase mb-4">
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
            className="bg-[#EDF1F5] shadow-[8px_8px_16px_#c8d0e7,-8px_-8px_16px_#ffffff] border border-white/50 rounded-[28px] p-8 flex flex-col justify-between min-h-[380px] relative transition-all duration-300 hover:shadow-[10px_10px_20px_#c8d0e7,-10px_-10px_20px_#ffffff]"
          >
            {/* Mais procurado badge */}
            <div className="absolute top-6 right-6">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#EDF1F5] shadow-[inset_1px_1px_3px_#c8d0e7,inset_-1px_-1px_3px_#ffffff] border border-white/20 text-[8px] font-extrabold tracking-wider text-orange-600 uppercase">
                Mais procurado
              </span>
            </div>
            
            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-[#EDF1F5] shadow-[inset_3px_3px_6px_#c8d0e7,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center border border-white/40 mb-6">
              <svg className="w-6 h-6 text-[#FF5500]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-start">
              <h3 className="font-head font-bold text-slate-800 text-lg tracking-tight mb-3">
                Agentes IA Comerciais
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-6">
                Ecossistema com 10 agentes especializados — SDR, atendimento, follow-up e orquestração — qualificando e conduzindo leads até a proposta, sem pausa.
              </p>
            </div>

            {/* Bottom metric & Action */}
            <div className="flex items-center justify-between mt-auto">
              <div className="bg-[#EDF1F5] shadow-[inset_2px_2px_5px_#c8d0e7,inset_-2px_-2px_5px_#ffffff] rounded-xl px-4 py-2 flex items-baseline gap-1 border border-white/30">
                <span className="text-[#FF5500] font-head font-extrabold text-sm">3,2x</span>
                <span className="text-[9px] font-bold text-slate-500 leading-none">mais reuniões<br/>agendadas / mês</span>
              </div>
              <button className="w-8 h-8 rounded-full bg-[#FF5500] text-white flex items-center justify-center shadow-[3px_3px_6px_rgba(255,85,0,0.3),-3px_-3px_6px_#ffffff] hover:scale-105 active:scale-95 transition-all duration-200 border border-orange-400/20 cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </motion.div>

          {/* Card 2: Campanhas Patrocinadas */}
          <motion.div
            variants={cardVariants}
            className="bg-[#EDF1F5] shadow-[8px_8px_16px_#c8d0e7,-8px_-8px_16px_#ffffff] border border-white/50 rounded-[28px] p-8 flex flex-col justify-between min-h-[380px] transition-all duration-300 hover:shadow-[10px_10px_20px_#c8d0e7,-10px_-10px_20px_#ffffff]"
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-[#EDF1F5] shadow-[inset_3px_3px_6px_#c8d0e7,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center border border-white/40 mb-6">
              <svg className="w-6 h-6 text-[#FF5500]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-start">
              <h3 className="font-head font-bold text-slate-800 text-lg tracking-tight mb-3">
                Campanhas Patrocinadas
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-6">
                Gestão de tráfego pago em Google e Meta com otimização contínua por dados, criativos de alta conversão e foco absoluto em CAC e ROI para B2B.
              </p>
            </div>

            {/* Bottom metric & Action */}
            <div className="flex items-center justify-between mt-auto">
              <div className="bg-[#EDF1F5] shadow-[inset_2px_2px_5px_#c8d0e7,inset_-2px_-2px_5px_#ffffff] rounded-xl px-4 py-2 flex items-baseline gap-1 border border-white/30">
                <span className="text-[#FF5500] font-head font-extrabold text-sm">-41%</span>
                <span className="text-[9px] font-bold text-slate-500 leading-none">de redução média<br/>no custo por lead</span>
              </div>
              <button className="w-8 h-8 rounded-full bg-[#FF5500] text-white flex items-center justify-center shadow-[3px_3px_6px_rgba(255,85,0,0.3),-3px_-3px_6px_#ffffff] hover:scale-105 active:scale-95 transition-all duration-200 border border-orange-400/20 cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </motion.div>

          {/* Card 3: Automação & CRM */}
          <motion.div
            variants={cardVariants}
            className="bg-[#EDF1F5] shadow-[8px_8px_16px_#c8d0e7,-8px_-8px_16px_#ffffff] border border-white/50 rounded-[28px] p-8 flex flex-col justify-between min-h-[380px] transition-all duration-300 hover:shadow-[10px_10px_20px_#c8d0e7,-10px_-10px_20px_#ffffff]"
          >
            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-[#EDF1F5] shadow-[inset_3px_3px_6px_#c8d0e7,inset_-3px_-3px_6px_#ffffff] flex items-center justify-center border border-white/40 mb-6">
              <svg className="w-6 h-6 text-[#FF5500]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-start">
              <h3 className="font-head font-bold text-slate-800 text-lg tracking-tight mb-3">
                Automação & CRM
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed mb-6">
                Fluxos de nutrição, integrações e RAG conectados ao seu CRM. Cada lead recebe a mensagem certa, no momento certo — automaticamente.
              </p>
            </div>

            {/* Bottom metric & Action */}
            <div className="flex items-center justify-between mt-auto">
              <div className="bg-[#EDF1F5] shadow-[inset_2px_2px_5px_#c8d0e7,inset_-2px_-2px_5px_#ffffff] rounded-xl px-4 py-2 flex items-baseline gap-1 border border-white/30">
                <span className="text-[#FF5500] font-head font-extrabold text-sm">+68%</span>
                <span className="text-[9px] font-bold text-slate-500 leading-none">de aumento na<br/>taxa de conversão</span>
              </div>
              <button className="w-8 h-8 rounded-full bg-[#FF5500] text-white flex items-center justify-center shadow-[3px_3px_6px_rgba(255,85,0,0.3),-3px_-3px_6px_#ffffff] hover:scale-105 active:scale-95 transition-all duration-200 border border-orange-400/20 cursor-pointer">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </motion.div>

        </motion.div>

        {/* Bottom CTA Bar */}
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", stiffness: 80, damping: 15, delay: 0.2 }}
          className="bg-[#EDF1F5] shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] rounded-[24px] p-6 border border-white/50 w-full mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all"
        >
          <p className="text-slate-800 font-head font-bold text-sm text-center sm:text-left">
            Não sabe por onde começar? <span className="text-[#FF5500]">Faça o diagnóstico gratuito da sua operação.</span>
          </p>
          <Link
            href="/cadastro"
            className="inline-flex items-center justify-center font-bold text-xs px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#FF7A00] text-white shadow-[3px_3px_8px_rgba(255,85,0,0.25),-3px_-3px_8px_#ffffff] hover:shadow-[4px_4px_12px_rgba(255,85,0,0.4),-4px_-4px_12px_#ffffff] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 border border-orange-400/10 cursor-pointer"
          >
            Solicitar diagnóstico <span className="ml-1 text-xs">→</span>
          </Link>
        </motion.div>

      </section>



      {/* ========================================================================= */}
      {/* PRICING & SOCIAL PROOF TEMPLATE 03 */}
      {/* ========================================================================= */}
      <section id="valores" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28">
        
        {/* Header section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center pb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EDF1F5] shadow-[inset_2px_2px_4px_#c8d0e7,inset_-2px_-2px_4px_#ffffff] border border-white/30 text-[9px] font-bold tracking-widest text-slate-500 uppercase mb-4">
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            VALORES & RECURSOS
          </div>
          <h2 className="font-head font-extrabold text-3xl md:text-4xl text-slate-900 leading-tight tracking-tight max-w-2xl mx-auto">
            Invista em uma operação que <span className="text-[#FF5500]">se paga sozinha.</span>
          </h2>
          <p className="text-slate-500 text-xs md:text-sm mt-4 max-w-xl mx-auto">
            Planos flexíveis para cada estágio do seu comercial B2B. Sem fidelidade, com resultado.
          </p>
        </motion.div>

        {/* Pricing Grid */}
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
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4"
        >
          
          {/* Plan 1: Tração */}
          <motion.div
            variants={cardVariants}
            className="bg-[#EDF1F5] shadow-[8px_8px_16px_#c8d0e7,-8px_-8px_16px_#ffffff] border border-white/50 rounded-[28px] p-8 flex flex-col justify-between relative transition-all duration-300 hover:shadow-[10px_10px_20px_#c8d0e7,-10px_-10px_20px_#ffffff]"
          >
            <div>
              <div className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">Tração</div>
              
              {/* Pricing row */}
              <div className="flex items-baseline gap-1 mt-4">
                <span className="font-head font-extrabold text-3xl text-slate-900">R$ 2.970</span>
                <span className="text-[10px] font-bold text-slate-500">/mês</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed mt-2 pb-6 border-b border-slate-300/30">
                Para empresas que precisam de leads previsíveis agora.
              </p>

              {/* Feature List */}
              <ul className="space-y-3.5 mt-6 pb-6">
                {[
                  'Gestão de campanhas patrocinadas',
                  'Criativos de alta conversão',
                  'Dashboard de resultados',
                  'Reuniões mensais de estratégia'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                    <div className="w-4 h-4 rounded-full bg-[#EDF1F5] shadow-[inset_1px_1px_3px_#c8d0e7,inset_-1px_-1px_3px_#ffffff] border border-white/20 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action */}
            <Link
              href="/cadastro"
              className="inline-flex items-center justify-center font-bold text-xs px-6 py-4 rounded-2xl bg-[#EDF1F5] text-slate-700 shadow-[4px_4px_8px_#c8d0e7,-4px_-4px_8px_#ffffff] border border-white/60 hover:shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff] hover:bg-[#e4ecf5] active:scale-[0.98] transition-all duration-200 mt-4 w-full"
            >
              Começar agora
            </Link>
          </motion.div>

          {/* Plan 2: Ecossistema IA (Recommended) */}
          <motion.div
            variants={cardVariants}
            className="bg-[#EDF1F5] border-2 border-orange-500/60 shadow-[12px_12px_24px_#c8d0e7,-12px_-12px_24px_#ffffff,0_0_20px_rgba(255,85,0,0.1)] rounded-[28px] p-8 flex flex-col justify-between relative md:scale-[1.03] z-10 transition-all duration-300"
          >
            {/* Recommended Tag */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center px-4 py-1 rounded-full bg-gradient-to-r from-[#FF5500] to-[#FF7A00] text-white text-[9px] font-extrabold tracking-widest uppercase shadow-[0_4px_10px_rgba(255,85,0,0.3)]">
                Recomendado
              </span>
            </div>

            <div>
              <div className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mt-2">Ecossistema IA</div>
              
              {/* Pricing row */}
              <div className="flex items-baseline gap-1 mt-4">
                <span className="font-head font-extrabold text-3xl text-slate-900">R$ 6.970</span>
                <span className="text-[10px] font-bold text-slate-500">/mês</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed mt-2 pb-6 border-b border-slate-300/30">
                A operação completa: tráfego, automação e agentes IA vendendo 24/7.
              </p>

              {/* Feature List */}
              <ul className="space-y-3.5 mt-6 pb-6">
                {[
                  'Tudo do plano Tração',
                  '10 Agentes IA especializados',
                  'Orquestração central + RAG',
                  'Automação e integração com CRM',
                  'SDR IA com follow-up ativo'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-700 font-bold">
                    <div className="w-4 h-4 rounded-full bg-[#EDF1F5] shadow-[inset_1px_1px_3px_#c8d0e7,inset_-1px_-1px_3px_#ffffff] border border-white/20 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action */}
            <Link
              href="/cadastro"
              className="inline-flex items-center justify-center font-bold text-xs px-6 py-4 rounded-2xl bg-gradient-to-r from-[#FF5500] to-[#FF7A00] text-white shadow-[3px_3px_8px_rgba(255,85,0,0.2),-3px_-3px_8px_#ffffff] hover:shadow-[4px_4px_12px_rgba(255,85,0,0.35),-4px_-4px_12px_#ffffff] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 border border-orange-400/20 mt-4 w-full"
            >
              Ativar ecossistema <span className="ml-1 text-xs">→</span>
            </Link>
          </motion.div>

          {/* Plan 3: Enterprise */}
          <motion.div
            variants={cardVariants}
            className="bg-[#EDF1F5] shadow-[8px_8px_16px_#c8d0e7,-8px_-8px_16px_#ffffff] border border-white/50 rounded-[28px] p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-[10px_10px_20px_#c8d0e7,-10px_-10px_20px_#ffffff]"
          >
            <div>
              <div className="text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">Enterprise</div>
              
              {/* Pricing row */}
              <div className="flex items-baseline gap-1 mt-4">
                <span className="font-head font-extrabold text-2xl text-slate-900">Sob consulta</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed mt-3.5 pb-6 border-b border-slate-300/30">
                Para operações complexas e times comerciais em escala.
              </p>

              {/* Feature List */}
              <ul className="space-y-3.5 mt-6 pb-6">
                {[
                  'Agentes IA sob medida',
                  'Integrações dedicadas',
                  'SLA e suporte prioritário',
                  'Squad exclusivo NeuroAds'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
                    <div className="w-4 h-4 rounded-full bg-[#EDF1F5] shadow-[inset_1px_1px_3px_#c8d0e7,inset_-1px_-1px_3px_#ffffff] border border-white/20 flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action */}
            <Link
              href="/cadastro"
              className="inline-flex items-center justify-center font-bold text-xs px-6 py-4 rounded-2xl bg-[#EDF1F5] text-slate-700 shadow-[4px_4px_8px_#c8d0e7,-4px_-4px_8px_#ffffff] border border-white/60 hover:shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff] hover:bg-[#e4ecf5] active:scale-[0.98] transition-all duration-200 mt-4 w-full"
            >
              Falar com especialista
            </Link>
          </motion.div>

        </motion.div>

        {/* Testimonial & Grid Metrics Section */}
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
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-20 items-stretch"
        >
          
          {/* Testimonial Card */}
          <motion.div
            variants={cardVariants}
            className="lg:col-span-7 bg-[#EDF1F5] shadow-[8px_8px_16px_#c8d0e7,-8px_-8px_16px_#ffffff] border border-white/50 rounded-[28px] p-8 flex flex-col justify-between gap-8"
          >
            <div>
              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-4.5 h-4.5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              
              {/* Quote */}
              <blockquote className="text-slate-800 font-head font-medium text-base md:text-lg leading-relaxed italic">
                &ldquo;Em 90 dias, o ecossistema da NeuroAds triplicou nossas reuniões qualificadas. Os agentes IA fazem o follow-up que meu time nunca conseguia sustentar.&rdquo;
              </blockquote>
            </div>

            {/* Author Profile */}
            <div className="flex items-center gap-3 border-t border-slate-300/30 pt-6">
              <div className="w-10 h-10 rounded-full bg-[#EDF1F5] shadow-[2px_2px_5px_#c8d0e7,-2px_-2px_5px_#ffffff] border border-white/60 flex items-center justify-center font-head font-bold text-xs text-[#FF5500]">
                RM
              </div>
              <div>
                <cite className="font-head font-bold text-xs text-slate-800 not-italic leading-none block">Ricardo M.</cite>
                <span className="text-[10px] text-slate-500 mt-1 block">Diretor Comercial · Shift Mobilidade</span>
              </div>
            </div>
          </motion.div>

          {/* Right Grid Stats (4 elements) */}
          <motion.div
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.08
                }
              }
            }}
            className="lg:col-span-5 grid grid-cols-2 gap-4"
          >
            
            {/* Stat 1 */}
            <motion.div
              variants={cardVariants}
              className="bg-[#EDF1F5] shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] border border-white/50 rounded-2xl p-4 flex flex-col justify-between"
            >
              <div className="text-[#FF5500] font-head font-extrabold text-2xl">+312%</div>
              <div className="text-[9px] font-bold text-slate-500 uppercase mt-2 tracking-wider">ROI médio das campanhas gerenciadas</div>
            </motion.div>

            {/* Stat 2 */}
            <motion.div
              variants={cardVariants}
              className="bg-[#EDF1F5] shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] border border-white/50 rounded-2xl p-4 flex flex-col justify-between"
            >
              <div className="text-slate-800 font-head font-extrabold text-2xl">90 dias</div>
              <div className="text-[9px] font-bold text-slate-500 uppercase mt-2 tracking-wider">para o ecossistema completo operar</div>
            </motion.div>

            {/* Stat 3 */}
            <motion.div
              variants={cardVariants}
              className="bg-[#EDF1F5] shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] border border-white/50 rounded-2xl p-4 flex flex-col justify-between"
            >
              <div className="text-slate-800 font-head font-extrabold text-2xl">24/7</div>
              <div className="text-[9px] font-bold text-slate-500 uppercase mt-2 tracking-wider">de operação comercial ininterrupta</div>
            </motion.div>

            {/* Stat 4 */}
            <motion.div
              variants={cardVariants}
              className="bg-[#EDF1F5] shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] border border-white/50 rounded-2xl p-4 flex flex-col justify-between"
            >
              <div className="text-[#FF5500] font-head font-extrabold text-2xl">R$ 0</div>
              <div className="text-[9px] font-bold text-slate-500 uppercase mt-2 tracking-wider">de multa — sem fidelidade contratual</div>
            </motion.div>

          </motion.div>

        </motion.div>

      </section>

      {/* ========================================================================= */}
      {/* FOOTER */}
      {/* ========================================================================= */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="bg-[#EDF1F5] shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] border border-white/50 rounded-[32px] p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="font-head font-extrabold text-lg text-slate-900">
                  Neuro<span className="text-[#FF5500]">Ads</span>
                </span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">
                Operações IA estratégicas para marketing e vendas B2B. Conectando dados em tempo real, automatizando funis e convertendo oportunidades.
              </p>
            </div>
            
            <div>
              <h4 className="font-head font-bold text-xs text-slate-800 uppercase tracking-wider mb-4">Plataforma</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="#solucoes" className="text-slate-500 hover:text-[#FF5500] transition">Soluções</Link></li>
                <li><Link href="#valores" className="text-slate-500 hover:text-[#FF5500] transition">Valores</Link></li>
                <li><Link href="/cadastro" className="text-slate-500 hover:text-[#FF5500] transition">Começar</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-head font-bold text-xs text-slate-800 uppercase tracking-wider mb-4">Recursos</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/conteudos" className="text-slate-500 hover:text-[#FF5500] transition">Blog</Link></li>
                <li><Link href="/whitepaper_ia_vendas" className="text-slate-500 hover:text-[#FF5500] transition">Whitepapers</Link></li>
                <li><Link href="/conteudos/faq" className="text-slate-500 hover:text-[#FF5500] transition">FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-head font-bold text-xs text-slate-800 uppercase tracking-wider mb-4">Contato</h4>
              <ul className="space-y-2 text-xs text-slate-500">
                <li>contato@neuroads.com.br</li>
                <li>Suporte 24/7</li>
                <li className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EDF1F5] shadow-[inset_1.5px_1.5px_3px_#c8d0e7,inset_-1.5px_-1.5px_3px_#ffffff] text-[8px] font-bold text-emerald-600">
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
      <div className="relative z-20 flex flex-col items-center justify-center p-6 rounded-full bg-[#EDF1F5] shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] border border-white/80 w-28 h-28 animate-pulse">
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
                className="px-2.5 py-1.5 rounded-lg border text-[9px] font-bold bg-[#EDF1F5] text-slate-700 shadow-[3px_3px_6px_#c8d0e7,-3px_-3px_6px_#ffffff] border-white/60 transition-all duration-300 hover:scale-105"
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
    <div className="w-full rounded-2xl border border-white/60 bg-[#EDF1F5] p-5 shadow-[8px_8px_16px_#c8d0e7,-8px_-8px_16px_#ffffff] text-slate-800">
      <div className="flex items-center gap-1.5 pb-3 border-b border-slate-300/40 mb-3">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        <span className="ml-3 text-[10px] text-slate-400 font-mono">segmentador_neuroads.ui</span>
      </div>

      <div className="space-y-3 font-sans text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-[#ff6a00] tracking-wider">Regras Comerciais</span>
          <span className="text-[10px] bg-[#EDF1F5] shadow-[inset_1.5px_1.5px_3px_#c8d0e7,inset_-1.5px_-1.5px_3px_#ffffff] text-slate-600 px-2 py-0.5 rounded-full font-semibold">Segmentação Dinâmica</span>
        </div>

        <div className="p-3 bg-[#EDF1F5] rounded-xl border border-white/80 shadow-[inset_2px_2px_5px_#c8d0e7,inset_-2px_-2px_5px_#ffffff] space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#ff6a00]">
            <Filter size={10} />
            <span>REGRA DE ENTRADA</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 p-2 rounded-lg bg-[#EDF1F5] border border-slate-300/30 text-[10px] font-semibold text-slate-700 shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff]">
              Evento
            </div>
            <div className="flex-1 p-2 rounded-lg bg-[#EDF1F5] border border-slate-300/30 text-[10px] font-semibold text-slate-700 shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff]">
              Nome do Evento...
            </div>
            <div className="p-2 rounded-lg bg-[#EDF1F5] border border-slate-300/30 text-[10px] text-slate-500 font-semibold shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff]">
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

        <div className="p-3 bg-[#EDF1F5] rounded-xl border border-white/80 shadow-[inset_2px_2px_5px_#c8d0e7,inset_-2px_-2px_5px_#ffffff] space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600">
            <Filter size={10} />
            <span>CONDIÇÃO SECUNDÁRIA</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 p-2 rounded-lg bg-[#EDF1F5] border border-slate-300/30 text-[10px] font-semibold text-slate-700 shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff]">
              Evento
            </div>
            <div className="flex-1 p-2 rounded-lg bg-[#EDF1F5] border border-slate-300/30 text-[10px] font-semibold text-slate-700 shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff]">
              UTM Medium...
            </div>
            <div className="p-2 rounded-lg bg-[#EDF1F5] border border-slate-300/30 text-[10px] text-slate-500 font-semibold shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff]">
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
    <div className="w-full rounded-2xl border border-white/60 bg-[#EDF1F5] p-5 shadow-[8px_8px_16px_#c8d0e7,-8px_-8px_16px_#ffffff] text-slate-700 text-xs font-sans">
      <div className="flex items-center justify-between pb-3 border-b border-slate-300/40 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="font-bold text-[10px] uppercase tracking-wider text-slate-500">NeuroAds &gt; Dashboard</span>
        </div>
        <div className="text-[9px] bg-[#EDF1F5] shadow-[inset_1.5px_1.5px_3px_#c8d0e7,inset_-1.5px_-1.5px_3px_#ffffff] border border-white/60 px-2 py-0.5 rounded text-slate-600">
          Últimos 30 dias
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="p-3 rounded-xl border border-white/80 bg-[#EDF1F5] shadow-[3px_3px_6px_#c8d0e7,-3px_-3px_6px_#ffffff]">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tempo de Resposta</p>
          <p className="text-lg font-black text-slate-850 mt-1">1m 13s</p>
          <p className="text-[9px] text-emerald-600 font-semibold mt-0.5">▲ -85% vs. humano</p>
        </div>
        <div className="p-3 rounded-xl border border-white/80 bg-[#EDF1F5] shadow-[3px_3px_6px_#c8d0e7,-3px_-3px_6px_#ffffff]">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Investimento Otimizado</p>
          <p className="text-lg font-black text-slate-850 mt-1">R$ 5.000,00</p>
          <p className="text-[9px] text-emerald-600 font-semibold mt-0.5">▼ -12% desperdício</p>
        </div>
        <div className="p-3 rounded-xl border border-white/80 bg-[#EDF1F5] shadow-[3px_3px_6px_#c8d0e7,-3px_-3px_6px_#ffffff]">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Custo por Lead (CPL)</p>
          <p className="text-lg font-black text-slate-850 mt-1">R$ 135,57</p>
          <p className="text-[9px] text-[#ff6a00] font-semibold mt-0.5">▼ -41% redução média</p>
        </div>
        <div className="p-3 rounded-xl border border-white/80 bg-[#EDF1F5] shadow-[3px_3px_6px_#c8d0e7,-3px_-3px_6px_#ffffff]">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Conversões no Funil</p>
          <p className="text-lg font-black text-slate-850 mt-1">37</p>
          <p className="text-[9px] text-emerald-600 font-semibold mt-0.5">▲ +40.2% vs. mês ant.</p>
        </div>
      </div>

      <div className="p-3 rounded-xl border border-white/80 bg-[#EDF1F5] shadow-[inset_2px_2px_5px_#c8d0e7,inset_-2px_-2px_5px_#ffffff] space-y-2">
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
    <div className="w-full rounded-2xl border border-white/60 bg-[#EDF1F5] p-5 shadow-[8px_8px_16px_#c8d0e7,-8px_-8px_16px_#ffffff] space-y-4 text-xs font-sans text-slate-700">
      <div className="flex items-center justify-between pb-2 border-b border-slate-300/40">
        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Métricas Customizadas</span>
        <span className="text-[9px] font-semibold text-[#ff6a00]">Cálculo Ativo</span>
      </div>

      <div className="p-4 rounded-xl border border-white/80 bg-[#EDF1F5] shadow-[3px_3px_6px_#c8d0e7,-3px_-3px_6px_#ffffff] relative overflow-hidden group">
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

      <div className="p-4 rounded-xl border border-white/80 bg-[#EDF1F5] shadow-[3px_3px_6px_#c8d0e7,-3px_-3px_6px_#ffffff]">
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
    <div className="w-full rounded-2xl border border-white/60 bg-[#EDF1F5] p-6 shadow-[8px_8px_16px_#c8d0e7,-8px_-8px_16px_#ffffff] flex flex-col items-center justify-center min-h-[260px] relative overflow-hidden">
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
    <div className="w-full rounded-2xl border border-white/60 bg-[#EDF1F5] p-4 shadow-[8px_8px_16px_#c8d0e7,-8px_-8px_16px_#ffffff] text-slate-700 text-[11px] font-sans">
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
        <div className="p-3 rounded-xl border border-white/80 bg-[#EDF1F5] shadow-[inset_2px_2px_5px_#c8d0e7,inset_-2px_-2px_5px_#ffffff] space-y-2">
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
          className="flex-1 px-3 py-2 rounded-xl bg-[#EDF1F5] border border-slate-300/30 text-[10px] text-slate-800 shadow-[inset_1px_1px_3px_#c8d0e7,inset_-1px_-1px_3px_#ffffff] placeholder:text-slate-400 focus:outline-none"
        />
        <div className="w-8 h-8 rounded-xl bg-[#ff6a00]/10 border border-[#ff6a00]/30 flex items-center justify-center cursor-pointer hover:bg-[#ff6a00]/20 shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff]">
          <ArrowRight size={12} className="text-[#ff6a00]" />
        </div>
      </div>
    </div>
  );
}

interface SectorCardProps {
  i: number;
  sector: typeof useCasesSectors[number];
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}

function SectorCard({ i, sector, progress, range, targetScale }: SectorCardProps) {
  const container = useRef<HTMLDivElement>(null);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      ref={container}
      className="h-screen flex items-center justify-center sticky top-0 overflow-hidden"
    >
      <motion.div
        style={{
          scale,
          top: `calc(4vh + ${i * 24}px)`,
        }}
        className="relative flex flex-col lg:flex-row h-[520px] w-[90%] max-w-[1200px] rounded-[32px] border border-white/80 bg-[#EDF1F5] shadow-[12px_12px_24px_#c8d0e7,-12px_-12px_24px_#ffffff] p-8 lg:p-12 origin-top overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff6a00]/5 rounded-full filter blur-[100px] pointer-events-none" />

        {/* LEFT COLUMN — Text and differentials */}
        <div className="flex-1 flex flex-col justify-between z-10 lg:pr-8">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-1.5 h-8 bg-[#ff6a00] rounded-full shadow-[0_0_12px_rgba(255,106,0,0.6)]" />
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{sector.title}</h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              {sector.description}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-auto">
            {sector.cards.map((card, cIdx) => (
              <div
                key={cIdx}
                className="rounded-2xl border border-white/80 bg-[#EDF1F5] shadow-[4px_4px_8px_#c8d0e7,-4px_-4px_8px_#ffffff] p-5 hover:shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff] transition-all duration-300 group/card"
              >
                <span className="text-[9px] font-black uppercase tracking-widest text-[#ff8f3a]">
                  Diferencial
                </span>
                <h4 className="text-[14px] font-bold text-slate-800 mt-1.5">{card.title}</h4>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN — Visual mockup */}
        <div className="hidden lg:flex w-[45%] flex-col justify-center items-center relative pl-8 border-l border-slate-300/30 z-10 min-h-[300px]">
          {sector.id === 'centralizar-dados' && <CentralizarMockup />}
          {sector.id === 'segmentar-base' && <SegmentarMockup />}
          {sector.id === 'dashboards-dinamicos' && <DashboardsMockup />}
          {sector.id === 'metricas-calculadas' && <MetricasMockup />}
          {sector.id === 'processamento-dados' && <ProcessamentoMockup />}
          {sector.id === 'analise-ia' && <AnaliseIaMockup />}
        </div>
      </motion.div>
    </div>
  );
}

function UseCasesSection() {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ['start start', 'end end'],
  });

  return (
    <section ref={container} className="relative min-h-[600vh] bg-transparent w-full pb-20 mt-16 md:mt-24">
      {/* Scrollable header */}
      <div className="w-full text-center max-w-[720px] mx-auto mb-10 pt-24 px-5">
        <span className="text-[13px] font-bold text-[#ff6a00] uppercase tracking-wider">Arquitetura de Dados</span>
        <h2 className="text-3xl sm:text-4xl font-black mt-2 text-slate-900">Recursos Integrados</h2>
        <p className="text-slate-600 mt-4 text-sm leading-relaxed">
          Descubra como a NeuroAds centraliza, segmenta e automatiza a inteligência dos seus dados comerciais em tempo real.
        </p>
      </div>

      <div className="w-full relative z-10">
        {useCasesSectors.map((sector, idx) => {
          const targetScale = 1 - (useCasesSectors.length - idx) * 0.025;
          return (
            <SectorCard
              key={sector.id}
              i={idx}
              sector={sector}
              progress={scrollYProgress}
              range={[idx * (1 / useCasesSectors.length), 1]}
              targetScale={targetScale}
            />
          );
        })}
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
            className="p-5 rounded-2xl border border-white/60 bg-[#EDF1F5] shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] hover:shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff] hover:scale-[1.01] transition-all duration-300 flex gap-5 group"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#EDF1F5] shadow-[inset_2.5px_2.5px_5px_#c8d0e7,inset_-2.5px_-2.5px_5px_#ffffff] text-[#FF5500] shrink-0">
              <LayoutDashboard size={22} className="stroke-[1.5]" />
            </div>
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
            className="p-5 rounded-2xl border border-white/60 bg-[#EDF1F5] shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] hover:shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff] hover:scale-[1.01] transition-all duration-300 flex gap-5 group"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#EDF1F5] shadow-[inset_2.5px_2.5px_5px_#c8d0e7,inset_-2.5px_-2.5px_5px_#ffffff] text-[#FF5500] shrink-0">
              <BarChart3 size={22} className="stroke-[1.5]" />
            </div>
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
            className="p-5 rounded-2xl border border-white/60 bg-[#EDF1F5] shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] hover:shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff] hover:scale-[1.01] transition-all duration-300 flex gap-5 group"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#EDF1F5] shadow-[inset_2.5px_2.5px_5px_#c8d0e7,inset_-2.5px_-2.5px_5px_#ffffff] text-[#FF5500] shrink-0">
              <Network size={22} className="stroke-[1.5]" />
            </div>
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
            className="p-5 rounded-2xl border border-white/60 bg-[#EDF1F5] shadow-[6px_6px_12px_#c8d0e7,-6px_-6px_12px_#ffffff] hover:shadow-[2px_2px_4px_#c8d0e7,-2px_-2px_4px_#ffffff] hover:scale-[1.01] transition-all duration-300 flex gap-5 group"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#EDF1F5] shadow-[inset_2.5px_2.5px_5px_#c8d0e7,inset_-2.5px_-2.5px_5px_#ffffff] text-[#FF5500] shrink-0">
              <UserCheck size={22} className="stroke-[1.5]" />
            </div>
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
