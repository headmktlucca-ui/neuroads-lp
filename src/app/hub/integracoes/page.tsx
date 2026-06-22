'use client';

import React from 'react';
import { Link2, ShieldCheck, ArrowRight, CheckCircle2, CreditCard } from 'lucide-react';
import Image from 'next/image';

const INTEGRATIONS = [
  { 
    id: 'ga4', 
    name: 'GA4', 
    status: 'available', 
    desc: 'Monitore eventos, sessões e conversões para leitura real de funil e receita.',
    icon: '/images/connectors/ga4-photorealistic-icon-hd-v1.png'
  },
  { 
    id: 'googleAds', 
    name: 'Google Ads', 
    status: 'connected', 
    desc: 'Acompanhe campanhas, custos e conversões para otimizar seus investimentos.',
    icon: '/images/connectors/google-ads-icon-white-v1.png'
  },
  { 
    id: 'searchConsole', 
    name: 'Google Search Console', 
    status: 'available', 
    desc: 'Acompanhe métricas de SEO orgânico, palavras-chave e cliques no Google Busca.',
    icon: '/images/connectors/google-trends-photorealistic-icon-hd-v1.png'
  },
  { 
    id: 'hubspot', 
    name: 'HubSpot', 
    status: 'available', 
    desc: 'Sincronize leads, empresas e oportunidades para uma visão completa do funil.',
    icon: '/images/connectors/hubspot-photorealistic-icon-hd-v1.png'
  },
  { 
    id: 'instagram', 
    name: 'Instagram', 
    status: 'available', 
    desc: 'Consolide sinais de engajamento comercial e conteúdo com potencial de conversão.',
    icon: '/images/connectors/instagram-photorealistic-icon-hd-v2.png'
  },
  { 
    id: 'linkedinPage', 
    name: 'LinkedIn Page', 
    status: 'available', 
    desc: 'Acompanhe conteúdo orgânico, crescimento de audiência e sinais de intenção B2B.',
    icon: '/images/connectors/linkedin-page-photorealistic-icon-hd-v1.png'
  },
  { 
    id: 'metaAds', 
    name: 'Meta Ads', 
    status: 'connected', 
    desc: 'Importe dados de anúncios do Facebook e Instagram para análises mais precisas.',
    icon: '/images/connectors/meta-ads-photorealistic-icon-hd-v1.png'
  },
  { 
    id: 'rdStationConversas', 
    name: 'RD Station Conversas', 
    status: 'available', 
    desc: 'Integre WhatsApp e canais de atendimento para dar escala ao time comercial sem perder contexto.',
    icon: '/images/connectors/rd-station-conversas-photorealistic-icon-hd-v1.png'
  },
  { 
    id: 'rdStationCrm', 
    name: 'RD Station CRM', 
    status: 'available', 
    desc: 'Centralize contatos, empresas e estágios do pipeline para acelerar repasse e previsibilidade comercial.',
    icon: '/images/connectors/rd-station-conversas-photorealistic-icon-hd-v1.png'
  },
  { 
    id: 'rdStationMarketing', 
    name: 'RD Station Marketing', 
    status: 'available', 
    desc: 'Conecte formulários, campanhas e automações para elevar a qualificação de leads com dados reais.',
    icon: '/images/connectors/rd-station-conversas-photorealistic-icon-hd-v1.png'
  },
  { 
    id: 'stripe', 
    name: 'Stripe', 
    status: 'available', 
    desc: 'Conecte pagamentos para liberar receita confirmada, LTV e conciliação comercial no Hub.',
    isComponentIcon: true
  },
  { 
    id: 'tiktok', 
    name: 'Tik Tok', 
    status: 'available', 
    desc: 'Mapeie comportamento de audiência e tendências de formato para escalar criativos.',
    icon: '/images/connectors/tiktok-icon-from-reference-v1.png'
  },
  { 
    id: 'tiktokAds', 
    name: 'Tik Tok Ads', 
    status: 'available', 
    desc: 'Integre performance de mídia com custo por aquisição e receita incremental.',
    icon: '/images/connectors/tiktok-photorealistic-icon-hd-v2.png'
  },
];

export default function HubIntegracoesPage() {
  return (
    <div className="w-full space-y-6 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="py-8 border-b border-white/[0.06] mb-8">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF6A00] shadow-[0_0_6px_rgba(255,106,0,0.8)] animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-[0.16em] text-[#FF6A00]">Integrações</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight leading-tight">Conecte Seus Canais</h1>
            <p className="text-[#8fa0b5] text-[15px] mt-2 max-w-xl leading-relaxed">
              Vincule suas plataformas de mídia paga e analytics para alimentar os Agentes de IA com dados reais da sua operação.
            </p>
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#0d1a2a]/60 border border-[#FF6A00]/20 border-l-gradient-orange border-l-transparent backdrop-blur-md">
              <Link2 className="w-4 h-4 text-[#FF6A00]" />
              <span className="text-[13px] font-bold text-white">13+ plataformas</span>
              <span className="text-[13px] text-[#8fa0b5]">disponíveis</span>
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-2.5 rounded-2xl bg-[#0d1a2a]/60 border border-[#FF6A00]/20 border-l-gradient-orange border-l-transparent backdrop-blur-md">
              <span className="text-[13px] text-[#8fa0b5]">Conectadas</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] font-black text-white">2</span>
                <Link2 className="w-3.5 h-3.5 text-[#FF6A00]" />
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 px-4 py-2.5 rounded-2xl bg-[#0d1a2a]/60 border border-[#FF6A00]/20 border-l-gradient-orange border-l-transparent backdrop-blur-md">
              <span className="text-[13px] text-[#8fa0b5]">Sincronização</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] font-black text-white">Saudável</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* List */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#0d1a2a]/40 backdrop-blur-md overflow-hidden shadow-lg mt-6">
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between bg-white/[0.02]">
          <h2 className="text-[15px] font-bold text-white">Catálogo de Integrações</h2>
        </div>
        
        {/* Distribuição em 2 colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:gap-x-0">
          {INTEGRATIONS.map((integ, index) => (
            <div 
              key={integ.id} 
              className={`p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors group
                ${index % 2 !== 0 ? 'lg:border-l border-white/[0.06]' : ''}
                ${index >= 2 ? 'border-t border-white/[0.06]' : ''}
              `}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center border bg-white/[0.02] border-white/[0.05] shadow-sm overflow-hidden p-1">
                  {integ.isComponentIcon ? (
                    <CreditCard className="h-6 w-6 text-[#635BFF]" />
                  ) : (
                    <Image
                      src={integ.icon as string}
                      alt={`Ícone ${integ.name}`}
                      width={40}
                      height={40}
                      className="h-full w-full rounded-lg object-cover"
                    />
                  )}
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-white group-hover:text-[#FF6A00] transition-colors">{integ.name}</h3>
                  <p className="mt-1 text-[13px] text-[#8fa0b5]">{integ.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                {integ.status === 'connected' ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-[12px] font-bold uppercase tracking-wider">Conectado</span>
                  </div>
                ) : (
                  <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white/[0.05] text-white hover:bg-white/[0.1] border border-white/[0.1] transition-colors">
                    <span className="text-[13px] font-bold">Conectar</span>
                    <ArrowRight className="w-4 h-4 text-white/50" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
