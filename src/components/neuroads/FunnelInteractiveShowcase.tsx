'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles, Terminal, CheckCircle2, ChevronRight, Zap, ArrowDown } from 'lucide-react';

interface FunnelStep {
  id: number;
  phase: string;
  badge: string;
  title: string;
  description: string;
  specialties: string[];
  agent: string;
  ioType: 'input' | 'output';
  ioTitle: string;
  ioData: string | React.ReactNode;
  ioImage?: string;
  ioImageWidth?: number;
  ioImageHeight?: number;
}

const FUNNEL_STEPS: FunnelStep[] = [
  {
    id: 1,
    phase: '01. Atração Orgânica & Paga',
    badge: 'Topo do Funil (TOFU)',
    title: 'Mapeamento de Intenção e SEO de IA',
    description: 'Os agentes capturam a demanda mapeando o mercado. Em vez de SEO tradicional, otimizam a marca para buscadores generativos e refinam o tom de voz.',
    specialties: ['Análise SEO & GEO', 'DNA da Marca', 'Análise de Concorrentes', 'Fadiga de Criativos'],
    agent: 'Laís (SEO & GEO) + Brand Voice',
    ioType: 'input',
    ioTitle: 'GEO_ENGINE_OPTIMIZATION',
    ioData: '',
    ioImage: '/images/111.png',
    ioImageWidth: 1309,
    ioImageHeight: 736,
  },
  {
    id: 2,
    phase: '02. Triagem & Engajamento',
    badge: 'Meio do Funil (MOFU)',
    title: 'Qualificação Imediata por Canal Ativo',
    description: 'Ao ingressar em nosso funil, o lead passa por etapas de concientização e qualificação. ',
    specialties: ['Qualificação de Leads B2B', 'Análise de Sentimento', 'FAQs Técnicas'],
    agent: 'Vitor (SDR) + Manu (Suporte)',
    ioType: 'output',
    ioTitle: 'CHAT_SDR_QUALIFICATION',
    ioData: '',
    ioImage: '/images/222.png',
    ioImageWidth: 1420,
    ioImageHeight: 799,
  },
  {
    id: 3,
    phase: '03. Conversão & Onboarding',
    badge: 'Fundo do Funil (BOFU)',
    title: 'Fechamento de Proposta & CRM Sync',
    description: 'Após a qualificação, o lead é acompanhado até o fechamento. Garantindo assim, total satisfação do cliente.',
    specialties: ['Integração de CRM & APIs', 'Auditoria de CAC & ROI', 'Upsell & Reativação'],
    agent: 'Heitor (Processos) + Breno (Closer)',
    ioType: 'input',
    ioTitle: 'HEITOR_WEBHOOK_ONBOARDING',
    ioData: '',
    ioImage: '/images/333.png',
    ioImageWidth: 1426,
    ioImageHeight: 802,
  }
];

export default function FunnelInteractiveShowcase() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  return (
    <div className="w-full py-16 text-left relative overflow-hidden bg-transparent">
      {/* Section Header */}
      <div className="max-w-3xl mb-16">
        <span className="text-[10px] font-black text-[#FF5500] uppercase tracking-widest block mb-2">
          Fluxo de Operação
        </span>
        <h3 className="font-head text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Como os Agentes Operam seu Funil na Prática
        </h3>
        <p className="text-slate-500 text-xs md:text-sm mt-3 leading-relaxed max-w-xl">
          Visualize a passagem de bastão automática entre as etapas de atração, qualificação e conversão dos seus leads B2B.
        </p>
      </div>

      {/* Visual Pipeline Container (Timeline) */}
      <div className="relative max-w-5xl mx-auto px-4 md:px-0">
        
        {/* Central vertical track line (Desktop only) */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-4 bottom-4 w-[2px] bg-slate-300/40 md:block hidden" />

        {/* Steps mapping */}
        <div className="space-y-16 md:space-y-24">
          {FUNNEL_STEPS.map((step, idx) => {
            const isEven = idx % 2 === 0;
            const isHovered = hoveredStep === step.id;

            return (
              <div 
                key={step.id} 
                className={`relative flex flex-col md:flex-row items-stretch gap-8 md:gap-16 ${
                  isEven ? 'md:flex-row-reverse' : ''
                }`}
                onMouseEnter={() => setHoveredStep(step.id)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Visual Circle Node on Central Line */}
                <div className="absolute left-1/2 transform -translate-x-1/2 top-4 md:flex hidden items-center justify-center z-20">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
                    isHovered 
                      ? 'bg-[#FF5500] border-[#FF5500] scale-110 shadow-[0_0_12px_rgba(255,85,0,0.4)] text-white' 
                      : 'bg-white border-slate-300 text-slate-650'
                  }`}>
                    {step.id}
                  </div>
                </div>

                {/* Left Side: Step Content description */}
                <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-block md:hidden w-5 h-5 rounded-full bg-[#FF5500] text-white text-[10px] font-black text-center leading-5 shrink-0">
                        {step.id}
                      </span>
                      <span className="text-[10px] font-black text-[#FF5500] uppercase tracking-wider">
                        {step.badge}
                      </span>
                    </div>
                    <h4 className="font-head text-lg md:text-xl font-black text-slate-900">
                      {step.phase}
                    </h4>
                  </div>

                  <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                    {step.description}
                  </p>

                  {/* Specialties Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {step.specialties.map((specialty) => (
                      <span 
                        key={specialty} 
                        className={`text-[9px] font-bold px-2.5 py-1 rounded-full border transition-all duration-200 ${
                          isHovered 
                            ? 'bg-[#FF5500]/10 border-[#FF5500]/25 text-[#FF5500]' 
                            : 'bg-slate-100 border-slate-200 text-slate-500'
                        }`}
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>

                  <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Zap size={11} className="text-[#FF5500] shrink-0" />
                    <span>Liderado por: <strong className="text-slate-600 font-bold">{step.agent}</strong></span>
                  </div>
                </div>

                {/* Right Side: Transparent Code / Dialogue Simulation Box */}
                <div className="w-full md:w-1/2 flex items-center">
                  {step.ioImage ? (
                    <motion.div
                      animate={{
                        borderColor: isHovered ? 'rgba(255, 85, 0, 0.25)' : 'rgba(255, 255, 255, 0.5)',
                        boxShadow: isHovered ? '0 10px 25px rgba(255, 85, 0, 0.08)' : '0 4px 6px rgba(0, 0, 0, 0.04)'
                      }}
                      transition={{ duration: 0.3 }}
                      className="w-full rounded-2xl border overflow-hidden shadow-md relative"
                    >
                      <Image
                        src={step.ioImage}
                        alt={step.ioTitle}
                        width={step.ioImageWidth || 1309}
                        height={step.ioImageHeight || 736}
                        className="w-full h-auto object-cover"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{
                        borderColor: isHovered ? 'rgba(255, 85, 0, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                        boxShadow: isHovered ? '0 10px 25px rgba(255, 85, 0, 0.05)' : '0 4px 6px rgba(0, 0, 0, 0.02)'
                      }}
                      transition={{ duration: 0.3 }}
                      className="w-full bg-[#0E131F]/90 backdrop-blur-md border border-white/10 rounded-2xl p-5 font-mono text-[11px] text-slate-350 shadow-md relative overflow-hidden"
                    >
                      {/* Visual Grid Lines inside Code Box */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

                      {/* Console Header */}
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3.5 relative z-10">
                        <div className="flex items-center gap-1.5">
                          <Terminal size={11} className="text-[#FF5500]" />
                          <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                            {step.ioTitle}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                        </div>
                      </div>

                      {/* Code Data Content */}
                      <div className="relative z-10">
                        {typeof step.ioData === 'string' ? (
                          <pre className="overflow-x-auto text-slate-300 font-mono whitespace-pre leading-relaxed scrollbar-thin">
                            <code>{step.ioData}</code>
                          </pre>
                        ) : (
                          step.ioData
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
        
      </div>
    </div>
  );
}
