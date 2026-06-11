'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { ConnectorStatus } from '../../lib/connectors';
import { Users, UserCheck, Star, Handshake, Trophy, AlertTriangle, ArrowUp, ArrowRight, X } from 'lucide-react';

// Nomes de exibição amigáveis para os canais
const CHANNEL_NAMES: Record<string, string> = {
  ga4: 'Google Analytics 4',
  googleAds: 'Google Ads',
  metaAds: 'Meta Ads',
  rdStationMarketing: 'RD Station Mkt',
  crm: 'Integração CRM',
  payments: 'Plataforma de Vendas'
};

// Mock de dados para oscilação
const MOCK_OSCILLATIONS = [
  { period: '15 dias', value: '+12%', isPositive: true },
  { period: '30 dias', value: '+5%', isPositive: true },
  { period: '60 dias', value: '-2%', isPositive: false },
  { period: '06 meses', value: '+24%', isPositive: true },
  { period: '01 ano', value: '+48%', isPositive: true },
];

function useCountUp(end: number, duration: number = 2000, isFloat: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setCount(easeProgress * end);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  if (isFloat) {
    return Number(count.toFixed(1));
  }
  return Math.floor(count);
}

const AnimatedValue = ({ value, isFloat = false, suffix = '' }: { value: number, isFloat?: boolean, suffix?: string }) => {
  const count = useCountUp(value, 2000, isFloat);
  const formatted = isFloat 
    ? count.toFixed(1).replace('.', ',') 
    : count.toLocaleString('pt-BR');
  
  return <span>{formatted}{suffix}</span>;
};

const AnimatedProgressBar = ({ percent, colorFrom, colorTo, delay = 0 }: { percent: number, colorFrom: string, colorTo: string, delay?: number }) => {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setWidth(percent), 500 + delay);
    return () => clearTimeout(timer);
  }, [percent, delay]);

  return (
    <div className="w-full h-1.5 bg-slate-800/50 rounded-full mt-3 overflow-hidden">
      <div 
        className="h-full rounded-full transition-all duration-1000 ease-out"
        style={{ 
          width: `${width}%`,
          background: `linear-gradient(to right, ${colorFrom}, ${colorTo})`,
          boxShadow: `0 0 10px ${colorTo}80`
        }}
      />
    </div>
  );
};

type FunnelStage = {
  id: string;
  title: string;
  icon: React.ElementType;
  colorFrom: string;
  colorTo: string;
  valueNum: number;
  percentNum: number;
  connectors: (keyof ConnectorStatus)[];
  stepNumber: string;
};

export default function SalesFunnelWidget({ 
  connectorStatus, 
  onStageClick 
}: { 
  connectorStatus: ConnectorStatus,
  onStageClick?: (stageId: string | null) => void 
}) {
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleStageClick = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newStage = activeStage === id ? null : id;
    setActiveStage(newStage);
    if (onStageClick) onStageClick(newStage);
  };

  const closePopover = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveStage(null);
    if (onStageClick) onStageClick(null);
  };

  const stages: FunnelStage[] = useMemo(() => [
    {
      id: 'visitantes',
      title: 'Visitantes',
      icon: Users,
      colorFrom: '#2563EB',
      colorTo: '#3B82F6',
      valueNum: 12540,
      percentNum: 100,
      connectors: ['ga4', 'googleAds', 'metaAds'],
      stepNumber: '01'
    },
    {
      id: 'leads',
      title: 'Leads',
      icon: UserCheck,
      colorFrom: '#0EA5A4',
      colorTo: '#14B8A6',
      valueNum: 4320,
      percentNum: 34.4,
      connectors: ['rdStationMarketing', 'crm', 'metaAds'],
      stepNumber: '02'
    },
    {
      id: 'oportunidades',
      title: 'Oportunidades',
      icon: Star,
      colorFrom: '#F59E0B',
      colorTo: '#FBBF24',
      valueNum: 1980,
      percentNum: 15.8,
      connectors: ['crm'],
      stepNumber: '03'
    },
    {
      id: 'propostas',
      title: 'Propostas',
      icon: Handshake,
      colorFrom: '#F97316',
      colorTo: '#FB923C',
      valueNum: 850,
      percentNum: 6.8,
      connectors: ['crm'],
      stepNumber: '04'
    },
    {
      id: 'vendas',
      title: 'Vendas',
      icon: Trophy,
      colorFrom: '#7C3AED',
      colorTo: '#A855F7',
      valueNum: 320,
      percentNum: 2.5,
      connectors: ['crm', 'payments'],
      stepNumber: '05'
    }
  ], []);

  const getStageStatus = (stage: FunnelStage) => {
    return stage.connectors.some(c => connectorStatus[c]);
  };

  const disconnectedStages = stages.filter(s => !getStageStatus(s));
  const isFullyConnected = disconnectedStages.length === 0;

  return (
    <section className="mb-8 w-full flex flex-col gap-4 font-sans">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dataFlow {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes neonPulse {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(59,130,246,0.3)); }
          50% { filter: drop-shadow(0 0 8px rgba(59,130,246,0.6)); }
        }
        @keyframes popIn {
          0% { opacity: 0; transform: translateY(10px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}} />

      {/* Container Principal: Novo Fundo Tecnológico */}
      <div 
        className="relative w-full rounded-3xl p-6 flex flex-col xl:flex-row items-stretch justify-between gap-6 overflow-visible shadow-2xl min-h-[260px] bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('/images/img_Funnel_bg.png')",
          backgroundColor: '#F8FAFC' // Fundo de fallback claro
        }}
      >

        {/* LADO ESQUERDO: Título e Imagem do Funil (25%) */}
        <div className="relative z-10 w-full xl:w-[25%] flex flex-col items-start justify-start pr-4 border-b xl:border-b-0 xl:border-r border-slate-300 pb-6 xl:pb-0">
          <h2 className="text-2xl xl:text-3xl font-black text-slate-800 flex items-center gap-2 mb-2 tracking-tight">
            Funil de Vendas
          </h2>
          <p className="text-slate-600 text-sm leading-snug mb-6 max-w-[220px]">
            Acompanhe cada etapa e impulsione seus resultados.
          </p>
          
          <div className="relative w-[180px] h-[100px] mt-auto opacity-90">
            <Image 
              src="/images/img_Funnel.png" 
              alt="Ilustração do Funil" 
              fill 
              className="object-contain object-left"
              priority
            />
          </div>
        </div>

        {/* ÁREA CENTRAL: Cards Interativos */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-2">
          <div className="flex flex-col xl:flex-row items-center justify-between gap-3 w-full h-full relative">
            {stages.map((stage, index) => {
              const isActiveData = getStageStatus(stage);
              const isSelected = activeStage === stage.id;
              const isDimmed = activeStage !== null && activeStage !== stage.id;

              return (
                <React.Fragment key={stage.id}>
                  {/* Container do Card */}
                  <div className="relative flex-1 w-full">
                    {/* O Card da Etapa */}
                    <div 
                      onClick={(e) => handleStageClick(stage.id, e)}
                      className={`
                        w-full min-h-[160px] rounded-[20px] p-4 flex flex-col justify-between
                        border cursor-pointer transition-all duration-300 ease-out group backdrop-blur-sm
                        ${isDimmed ? 'opacity-40 grayscale-[50%] scale-95' : 'opacity-100'}
                        ${isSelected ? 'scale-105 shadow-2xl z-20 ring-2 ring-white/50' : 'hover:scale-[1.02] hover:-translate-y-1 z-10 shadow-lg'}
                      `}
                      style={{
                        background: isActiveData 
                          ? `linear-gradient(145deg, ${stage.colorFrom}, ${stage.colorTo})` 
                          : 'rgba(203,213,225,0.8)',
                        borderColor: isActiveData ? `${stage.colorFrom}40` : 'rgba(255,255,255,0.5)',
                      }}
                    >
                      {/* Topo: Número */}
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-bold tracking-widest ${isActiveData ? 'text-white/60' : 'text-slate-500'}`}>
                          {stage.stepNumber}
                        </span>
                        <stage.icon 
                          className={`w-5 h-5 transition-colors duration-300 ${isActiveData ? 'text-white' : 'text-slate-400'}`} 
                        />
                      </div>

                      {/* Centro: Título */}
                      <div className="mb-3">
                        <h3 className={`text-[13px] font-bold uppercase tracking-wide ${isActiveData ? 'text-white' : 'text-slate-600'}`}>
                          {stage.title}
                        </h3>
                      </div>

                      {/* Base: Valores e Progresso */}
                      <div className="mt-auto">
                        <div className="flex items-baseline gap-2">
                          <span className={`text-2xl font-black ${isActiveData ? 'text-white' : 'text-slate-600'}`}>
                            {isActiveData && isLoaded ? <AnimatedValue value={stage.valueNum} /> : 'N/A'}
                          </span>
                          {isActiveData && (
                            <span 
                              className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-white/20 text-white"
                            >
                              <AnimatedValue value={stage.percentNum} isFloat suffix="%" />
                            </span>
                          )}
                        </div>
                        
                        {/* Barra de Progresso Animada */}
                        {isActiveData ? (
                          <AnimatedProgressBar 
                            percent={stage.percentNum} 
                            colorFrom="rgba(255,255,255,0.5)" 
                            colorTo="#ffffff" 
                            delay={index * 150} 
                          />
                        ) : (
                          <div className="w-full h-1.5 bg-slate-400/30 rounded-full mt-3" />
                        )}
                      </div>
                    </div>

                    {/* Popover / Balão Informativo */}
                    {isSelected && (
                      <div 
                        className="absolute left-1/2 -translate-x-1/2 mt-4 w-72 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200 z-[100] p-5 cursor-default"
                        style={{ animation: 'popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Seta superior do balão */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-slate-200 rotate-45" />
                        
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-black text-slate-800 flex items-center gap-2">
                            <stage.icon className="w-4 h-4" style={{ color: stage.colorTo }} />
                            Detalhes: {stage.title}
                          </h4>
                          <button onClick={closePopover} className="p-1 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Canais Relacionados</p>
                          <div className="flex flex-wrap gap-1.5">
                            {stage.connectors.map((c, idx) => {
                              const totalChannels = stage.connectors.length;
                              let val = stage.valueNum;
                              if (totalChannels === 2) {
                                val = idx === 0 ? Math.floor(stage.valueNum * 0.6) : stage.valueNum - Math.floor(stage.valueNum * 0.6);
                              } else if (totalChannels === 3) {
                                const ratios = [0.5, 0.3, 0.2];
                                val = idx < 2 ? Math.floor(stage.valueNum * ratios[idx]) : stage.valueNum - Math.floor(stage.valueNum * 0.5) - Math.floor(stage.valueNum * 0.3);
                              } else if (totalChannels > 3) {
                                val = Math.floor(stage.valueNum / totalChannels);
                              }
                              
                              return (
                                <span key={c} className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md border border-slate-200 flex items-center gap-1.5">
                                  {CHANNEL_NAMES[c] || c}
                                  <span className="text-slate-800 font-black">{val.toLocaleString('pt-BR')}</span>
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Oscilação (Histórico)</p>
                          <div className="flex flex-col gap-1.5">
                            {MOCK_OSCILLATIONS.map((osc, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-slate-50 last:border-0">
                                <span className="text-slate-600 font-medium">{osc.period}</span>
                                <span className={`font-bold flex items-center gap-1 ${osc.isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                  {osc.isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowRight className="w-3 h-3 rotate-45" />}
                                  {osc.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Seta Conectora (Neon Arrow) */}
                  {index < stages.length - 1 && (
                    <div className="hidden xl:flex items-center justify-center w-6 text-slate-400" style={{ animation: 'neonPulse 2s infinite' }}>
                      <ArrowRight className="w-5 h-5 text-blue-500" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Linha Inferior de Fluxo Contínuo */}
          <div className="hidden xl:block absolute -bottom-3 left-0 right-0 h-[3px] rounded-full overflow-hidden bg-slate-200">
            <div 
              className="h-full w-[200%]"
              style={{
                background: 'linear-gradient(90deg, #2563EB, #14B8A6, #FBBF24, #FB923C, #A855F7, #2563EB)',
                animation: 'dataFlow 3s linear infinite'
              }}
            />
          </div>
        </div>

        {/* PAINEL DIREITO: KPI Radial (Donut) */}
        <div className="relative z-10 w-full xl:w-[180px] bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200 p-4 flex flex-col items-center justify-center xl:ml-6 shadow-sm">
          <h3 className="text-slate-800 text-xs font-bold mb-4 text-center tracking-wide uppercase">Taxa de Conversão</h3>
          
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <path
                className="text-slate-200"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className={`${isFullyConnected ? 'text-[#A855F7]' : 'text-slate-400'} transition-all duration-[2000ms] ease-out`}
                strokeDasharray={`${isFullyConnected && isLoaded ? '2.5' : '0'}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className={`text-lg font-black tracking-tighter ${isFullyConnected ? 'text-slate-800' : 'text-slate-400'}`}>
                {isFullyConnected && isLoaded ? <AnimatedValue value={2.5} isFloat suffix="%" /> : 'N/A'}
              </span>
            </div>
          </div>
          
          <div className={`mt-4 flex items-center gap-1 text-[10px] bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200 ${isFullyConnected ? 'text-emerald-600' : 'text-slate-400 grayscale'}`}>
            <ArrowUp className="w-3 h-3" />
            <span className="font-bold">{isFullyConnected ? '18% vs anterior' : 'Sem dados'}</span>
          </div>
        </div>
      </div>

      {/* Resumo Executivo (Alertas de Conexão) */}
      {!isFullyConnected && (
        <div className="w-full rounded-xl border border-rose-200 bg-rose-50 p-4 mt-2 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="bg-rose-100 p-2 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-rose-700 font-bold text-sm">Problemas de Integração no Funil</h4>
              <p className="text-rose-600/80 text-xs mb-2">
                O dashboard não pode processar o fluxo pois os seguintes estágios carecem de fontes de dados ativas:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {disconnectedStages.map(stage => (
                  <div key={`alert-${stage.id}`} className="bg-white rounded border border-rose-100 px-3 py-2 flex flex-col gap-1">
                    <span className="text-slate-700 text-xs font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      {stage.title}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Requer: <span className="text-slate-700 font-medium">{stage.connectors.map(c => CHANNEL_NAMES[c]).join(' ou ')}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
