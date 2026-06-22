'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  CircleGauge,
  Funnel,
  Headphones,
  Target,
  TrendingUp,
  X,
} from 'lucide-react';
import { agents as catalogAgents, type Agent as CatalogAgent } from '../../data/agents';
import LuccaSpecialistChatModal from './LuccaSpecialistChatModal';
import PrimaryTopMenu, { PRIMARY_HEADER_MENU_GROUPS } from './PrimaryTopMenu';
import ValuesResourcesSection from './ValuesResourcesSection';

const quickPoints = [
  {
    icon: <Bot size={14} strokeWidth={2.2} />,
    title: 'IA Agêntica',
    desc: 'Autônoma e orientada a metas',
  },
  {
    icon: <CircleGauge size={14} strokeWidth={2.2} />,
    title: 'Dados em tempo real',
    desc: 'Decisões baseadas em sinal',
  },
  {
    icon: <Target size={14} strokeWidth={2.2} />,
    title: 'Resultados mensuráveis',
    desc: 'Foco no que importa',
  },
];

const agentLayoutTitles = [
  'Analista de Tráfego',
  'Gerador de Criativos',
  'Gerador de Copies de Conversão',
  'Análise Viral',
  'Rastreador Cirúrgico',
  'Preditor de Funil',
  'Diagnóstico de Landing Page',
  'Simulador de ROAS',
  'Analisador de Público',
] as const;

const ecosystemRows = [
  {
    id: 'aquisicao',
    stage: 'Aquisição',
    stageDescription: 'Atrair o público certo com inteligência e criatividade.',
    stageIcon: Target,
    agentTitles: ['Analista de Tráfego', 'Gerador de Criativos', 'Gerador de Copies de Conversão'],
  },
  {
    id: 'conversao',
    stage: 'Conversão',
    stageDescription: 'Converter cliques em resultados com precisão e relevância.',
    stageIcon: Funnel,
    agentTitles: ['Análise Viral', 'Rastreador Cirúrgico', 'Preditor de Funil'],
  },
  {
    id: 'escala',
    stage: 'Escala',
    stageDescription: 'Aumentar performance com eficiência e crescimento sustentável.',
    stageIcon: TrendingUp,
    agentTitles: ['Diagnóstico de Landing Page', 'Simulador de ROAS', 'Analisador de Público'],
  },
] as const;

const painMatrix = [
  {
    step: '1',
    title: 'Sua dor hoje',
    visualImage: '/images/template-match/process/process-step-01-dor-chaos-v2.png',
    items: [
      'Resultados inconsistentes',
      'Dependência de achismos',
      'Tempo perdido com relatórios',
      'Equipe sobrecarregada',
      'Crescimento difícil de prever',
    ],
  },
  {
    step: '2',
    title: 'O impacto no caixa',
    visualImage: '/images/template-match/process/process-step-02-impacto-caixa-v2.png',
    items: [
      'ROAS baixo e instável',
      'CPL alto e fora de controle',
      'Recursos mal alocados',
      'Oportunidades desperdiçadas',
      'Previsibilidade zero',
    ],
  },
  {
    step: '3',
    title: 'Nossa solução',
    visualImage: '/images/template-match/process/process-step-03-solucao-agentes-v2.png',
    text: 'Agentes de IA trabalhando 24/7 para atrair, converter e escalar com eficiência e previsibilidade.',
    cta: 'Conheça os agentes',
  },
];

const beforeItems = [
  'Decisões reativas',
  'Relatórios demorados',
  'Campanhas desconectadas',
  'Baixo retorno e imprevisível',
];

const afterItems = [
  'Decisões guiadas por IA',
  'Dados em tempo real',
  'Estratégias integradas',
  'Performance previsível e escalável',
];

const metrics = [
  { value: '+320%', label: 'Aumento médio de ROAS', path: 'M0 22 C 8 22, 12 22, 16 21 C 20 20, 24 17, 28 17 C 32 17, 36 22, 40 22 C 44 22, 48 21, 52 22 C 56 23, 60 20, 64 20 C 68 20, 72 16, 76 15 C 80 14, 84 18, 88 19 C 92 20, 96 19, 100 13 C 104 8, 108 10, 112 8 C 116 7, 120 8, 124 8' },
  { value: '-45%', label: 'Redução média de CPL', path: 'M0 22 C 6 22, 10 17, 14 16 C 18 15, 22 10, 26 13 C 30 16, 34 14, 38 14 C 42 14, 46 8, 50 10 C 54 12, 58 6, 62 6 C 66 6, 70 14, 74 15 C 78 16, 82 17, 86 18 C 90 19, 94 20, 98 20 C 102 20, 106 15, 110 14 C 114 13, 118 18, 122 18 C 126 18, 130 14, 134 17' },
  { value: '+68%', label: 'Aumento médio de conversão', path: 'M0 22 C 8 22, 12 21, 16 18 C 20 15, 24 14, 28 15 C 32 16, 36 15, 40 16 C 44 17, 48 14, 52 8 C 56 5, 60 7, 64 9 C 68 11, 72 8, 76 7 C 80 6, 84 12, 88 17 C 92 22, 96 19, 100 19 C 104 19, 108 17, 112 19 C 116 21, 120 18, 124 10 C 128 4, 132 7, 136 5' },
  { value: '+25%', label: 'Crescimento de receita', path: 'M0 22 C 8 22, 12 20, 16 16 C 20 12, 24 13, 28 17 C 32 21, 36 20, 40 16 C 44 12, 48 12, 52 17 C 56 22, 60 22, 64 17 C 68 12, 72 17, 76 18 C 80 19, 84 16, 88 10 C 92 4, 96 8, 100 8 C 104 8, 108 2, 112 2 C 116 2, 120 12, 124 13 C 128 14, 132 8, 136 8' },
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

type HeaderMenuGroup = {
  label: string;
  href: string;
  submenu: HeaderSubmenuItem[];
};

type HeaderMenuLinkItem = {
  label: string;
  href: string;
};

type HeaderMenuCategoryItem = {
  label: string;
  items: HeaderMenuLinkItem[];
};

type HeaderSubmenuItem = HeaderMenuLinkItem | HeaderMenuCategoryItem;

function isCategorySubmenuItem(item: HeaderSubmenuItem): item is HeaderMenuCategoryItem {
  return 'items' in item;
}

const headerMenuGroups: HeaderMenuGroup[] = PRIMARY_HEADER_MENU_GROUPS;

function Sparkline({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 136 30" className="h-[32px] w-full" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="none" stroke="#ff6a00" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function extractActivities(longDescription: string): string[] {
  return longDescription
    .split('. ')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => (item.endsWith('.') ? item : `${item}.`))
    .slice(0, 4);
}

export default function Suggestion3LandingPage() {
  const [detailsAgent, setDetailsAgent] = useState<CatalogAgent | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isLuccaChatOpen, setIsLuccaChatOpen] = useState(false);
  const [luccaAutoMessage, setLuccaAutoMessage] = useState<string | null>(null);

  const layoutAgents = useMemo(() => {
    const agentIndex = new Map(catalogAgents.map((agent) => [agent.title, agent]));
    return agentLayoutTitles
      .map((title) => agentIndex.get(title))
      .filter((agent): agent is CatalogAgent => Boolean(agent));
  }, []);

  const ecosystemRowsWithAgents = useMemo(() => {
    const agentIndex = new Map(layoutAgents.map((agent) => [agent.title, agent]));
    return ecosystemRows.map((row) => ({
      ...row,
      agents: row.agentTitles
        .map((title) => agentIndex.get(title))
        .filter((agent): agent is CatalogAgent => Boolean(agent)),
    }));
  }, [layoutAgents]);

  const handleOpenSpecialistChat = () => {
    setLuccaAutoMessage(null);
    setIsLuccaChatOpen(true);
  };

  const handleRequestDemo = () => {
    setLuccaAutoMessage(
      'Solicito Demonstração. Quero enviar meus dados cadastrais iniciais (Nome, Email, WhatsApp e Site da Empresa). Aguardo por email as instruções de acesso e detalhes para implantação.',
    );
    setIsLuccaChatOpen(true);
  };

  return (
    <main className="relative overflow-hidden bg-white text-[#1a1d23]">
      <style jsx global>{`
        @keyframes neuroadsGradientFlow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes neuroadsFlowArrowPulse {
          0%,
          100% {
            opacity: 0.48;
            transform: translateX(0);
          }
          50% {
            opacity: 1;
            transform: translateX(4px);
          }
        }

        @keyframes neuroadsFlowDash {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: -32px 0;
          }
        }

        .neuroads-smooth-bg-card {
          background: transparent;
        }

        .neuroads-smooth-bg-image {
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 21%, #000 79%, transparent 100%);
          mask-image: linear-gradient(to bottom, transparent 0%, #000 21%, #000 79%, transparent 100%);
          filter: saturate(1.02) contrast(1.01);
        }

        .neuroads-smooth-bg-fade {
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(255, 255, 255, 0.21) 24%,
            rgba(255, 255, 255, 0.1) 68%,
            rgba(255, 255, 255, 0.95) 100%
          );
        }
      `}</style>
      <div
        className="pointer-events-none absolute inset-0 bg-top bg-repeat-y bg-[length:100%_auto]"
        style={{ backgroundImage: "url('/images/background_hub_repeat_flow.png')" }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-transparent via-[#f7f8fa]/75 to-bg-main" />
      <div className="relative z-10">
        <section className="relative overflow-hidden pt-5">
        <div className="mx-auto max-w-[1260px] px-5 md:px-8">
          <PrimaryTopMenu
            onSpecialistClick={handleOpenSpecialistChat}
            onRequestDemoClick={handleRequestDemo}
          />

          <div className="h-[84px]" aria-hidden="true" />

          <div className="neuroads-smooth-bg-card relative overflow-hidden rounded-[34px] px-5 pb-10 pt-12 sm:px-7 lg:min-h-[560px] lg:px-10">
            <div className="relative z-10 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="max-w-[560px] lg:pr-8">
              <h1 className="mt-4 text-[30px] font-extrabold leading-[1.08] tracking-[-0.02em] text-[#111317] sm:text-[34px] lg:text-[34px]">
                Desbloqueie o Potencial Oculto:
                <br />
                Marketing & Vendas de
                <br />
                <span className="bg-[linear-gradient(90deg,#ff6a00_0%,#ff8f3a_40%,#22160f_70%,#000000_100%)] bg-[length:220%_100%] bg-clip-text text-transparent [animation:neuroadsGradientFlow_6s_ease-in-out_infinite]">
                  Alta Performance com IA Agêntica.
                </span>
              </h1>
              <p className="mt-6 max-w-[520px] text-[15px] leading-[1.65] text-[#4f5665]">
                Agentes de IA que orquestram dados, mídia e criatividade para gerar resultados consistentes e escaláveis.
              </p>

              <div className="mt-7 grid gap-4 sm:grid-cols-3">
                {quickPoints.map((item) => (
                  <div key={item.title} className="flex items-start gap-2.5">
                    <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#ffd9c4] bg-transparent text-[#ff7a21]">
                      {item.icon}
                    </span>
                    <div>
                      <p className="text-[12px] font-bold text-[#2a313e]">{item.title}</p>
                      <p className="text-[11px] text-[#7a8190]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <button type="button" onClick={handleOpenSpecialistChat} className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#F24900] to-[#FF8805] hover:from-[#d93f00] hover:to-[#e07500] transition-all px-6 py-3 text-[13px] font-extrabold text-white">
                  Fale com um especialista
                  <ArrowRight size={13} />
                </button>
                <button type="button" onClick={handleRequestDemo} className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#d9dee7] bg-transparent px-6 py-3 text-[13px] font-bold text-[#2a2f3a]">
                  Solicite Demonstração
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#d1d6e0] text-[#434b5a]">
                    <ArrowRight size={10} />
                  </span>
                </button>
              </div>
              </div>

              <div className="relative mx-auto w-full max-w-[470px] lg:max-w-[520px]">
                <Image
                  src="/images/hero/hero-cube-anexo-222.png"
                  alt="Ilustração de IA agêntica aplicada à performance de marketing e vendas"
                  width={1428}
                  height={2048}
                  className="h-auto w-full object-contain"
                  priority
                />
              </div>
            </div>
          </div>

          <div className="mb-16">
            <div className="relative">
              <div className="pointer-events-none absolute left-[14.8%] top-[140px] z-0 hidden w-[34.5%] lg:block" aria-hidden="true">
                <Image
                  src="/images/template-match/process/process-connector-segment-left-v1.png"
                  alt=""
                  width={960}
                  height={150}
                  className="h-auto w-full object-contain opacity-94"
                />
              </div>

              <div className="pointer-events-none absolute right-[14.8%] top-[140px] z-0 hidden w-[34.5%] lg:block" aria-hidden="true">
                <Image
                  src="/images/template-match/process/process-connector-segment-right-v1.png"
                  alt=""
                  width={965}
                  height={150}
                  className="h-auto w-full opacity-95"
                />
              </div>

              <div className="relative z-10 grid gap-6 lg:grid-cols-3">
                {painMatrix.map((col) => (
                  <article
                    key={col.title}
                    className="rounded-[30px] border border-[#edf0f4] bg-transparent px-7 pb-8 pt-5 shadow-none"
                  >
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#ffd8c2] bg-white text-[16px] font-extrabold leading-none text-[#ff6a00] shadow-[0_4px_10px_rgba(255,122,33,0.14)]">
                      {col.step}
                    </span>

                    <div className="relative mx-auto mt-2 h-[210px] w-full max-w-[290px]">
                      <Image src={col.visualImage} alt={col.title} fill className="object-contain" />
                    </div>

                    <h3 className="mt-1 text-[26px] font-extrabold leading-tight tracking-[-0.01em] text-[#1b1e26]">{col.title}</h3>

                    {col.items ? (
                      <ul className="mt-3 space-y-2.5 text-[14px] leading-[1.45] text-[#5f6775]">
                        {col.items.map((item) => (
                          <li key={item} className="flex items-start gap-2.5">
                            <span className="mt-[8px] h-1.5 w-1.5 rounded-full bg-[#b6bfcb]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <>
                        <p className="mt-3 text-[14px] leading-[1.6] text-[#5f6775]">{col.text}</p>
                        <a href="#agentes" className="mt-6 inline-flex items-center gap-2 text-[13px] font-extrabold text-[#ff6a00]">
                          {col.cta}
                          <ArrowRight size={12} />
                        </a>
                      </>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="compare" className="mx-auto max-w-[1260px] px-5 md:px-8">
        <div className="relative overflow-hidden rounded-[30px] border border-[#122035] bg-[#030914] px-5 py-10 sm:px-12 sm:py-12">
          <Image src="/images/template-match/compare-bg-v1.png" alt="" fill className="pointer-events-none object-cover opacity-80" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,8,18,0.70)_0%,rgba(2,8,18,0.82)_100%)]" />

          <div className="relative">
            <h2 className="text-center text-[24px] font-extrabold leading-[1.08] tracking-[-0.01em] text-white sm:text-[30px] lg:text-[35px]">
              <span className="bg-[linear-gradient(90deg,#ffb36a_0%,#ff8a2b_45%,#d55a00_100%)] bg-clip-text text-transparent">
                Posicionamento inteligente e aprendizado contínuo.
              </span>
            </h2>
            <p className="mt-2 text-center text-[16px] font-medium text-white/82 sm:text-[20px] lg:text-[25px]">
              Agentes que transformam dados em oportunidades.
            </p>

            <div className="relative mx-auto mt-8 grid max-w-[1080px] rounded-[22px] border border-white/12 bg-[linear-gradient(100deg,rgba(9,24,45,0.86)_0%,rgba(4,10,22,0.90)_40%,rgba(24,17,28,0.86)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] lg:grid-cols-2">
              <div className="absolute left-1/2 top-1/2 z-10 hidden h-full w-[2px] -translate-x-1/2 -translate-y-1/2 bg-[linear-gradient(180deg,rgba(255,122,33,0)_0%,rgba(255,122,33,0.98)_50%,rgba(255,122,33,0)_100%)] shadow-[0_0_12px_rgba(255,122,33,0.78),0_0_26px_rgba(255,122,33,0.4)] lg:block" />
              <span className="absolute left-1/2 top-1/2 z-20 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#ffc38f] bg-[#ff7a21] text-white shadow-[0_0_0_2px_rgba(255,122,33,0.48),0_0_14px_rgba(255,122,33,0.75),0_0_28px_rgba(255,122,33,0.5)] lg:inline-flex">
                <ArrowRight size={14} />
              </span>

              <div className="p-7 sm:p-8 lg:pr-12">
                <h3 className="text-[24px] font-bold leading-none text-white sm:text-[32px] md:text-[36px] lg:text-[42px]">Antes</h3>
                <ul className="mt-6 space-y-3.5 text-[16px] font-medium leading-[1.2] text-white/86 sm:text-[16px]">
                  {beforeItems.map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle2 size={17} className="text-white/80" strokeWidth={2.1} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative rounded-b-[22px] border-t border-white/10 bg-[linear-gradient(180deg,rgba(255,122,33,0.04)_0%,rgba(255,122,33,0.01)_100%)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),inset_0_-1px_0_rgba(255,255,255,0.04),8px_0_24px_rgba(7,12,22,0.45),2px_0_10px_rgba(255,255,255,0.05)] sm:p-8 lg:-ml-px lg:rounded-b-none lg:rounded-l-none lg:rounded-r-[22px] lg:border-y lg:border-r lg:border-l-0 lg:pl-12">
                <h3 className="bg-[linear-gradient(90deg,#ffb065_0%,#ff8f3a_45%,#ff6a00_100%)] bg-clip-text text-[24px] font-bold leading-none text-transparent sm:text-[32px] md:text-[36px] lg:text-[42px]">
                  Depois com NeuroAds
                </h3>
                <ul className="mt-6 space-y-3.5 text-[16px] font-medium leading-[1.2] text-white sm:text-[16px]">
                  {afterItems.map((item) => (
                    <li key={item} className="flex items-center gap-3 border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
                      <CheckCircle2 size={17} className="text-white" strokeWidth={2.1} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="agentes" className="mx-auto max-w-[1260px] px-5 pb-2 pt-14 md:px-8">
        <div className="rounded-[28px] border border-[#e7ebf1] bg-white px-5 py-8 shadow-[0_16px_34px_rgba(20,28,40,0.04)] md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div className="max-w-[760px]">
              <h2 className="text-[28px] font-extrabold leading-[1.08] tracking-[-0.02em] text-[#111827] sm:text-[34px] md:text-[44px]">
                Ecossistema de Agentes IA <span className="text-[#ff6a00]">em ação.</span>
              </h2>
              <p className="mt-4 text-[16px] leading-[1.55] text-[#5f6778] md:text-[18px]">
                Agentes especializados que trabalham juntos em um fluxo contínuo
                <br className="hidden md:block" />
                para maximizar resultados em cada etapa do funil.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e5e9f0] bg-white px-5 py-2.5 text-[13px] font-bold text-[#2a3242]">
                <span className="inline-flex items-center text-[#ff6a00]">
                  <span className="h-[1.5px] w-9 bg-[#ff6a00]" />
                  <ArrowRight size={13} className="-ml-1 [animation:neuroadsFlowArrowPulse_1.3s_ease-in-out_infinite]" />
                </span>
                Fluxo contínuo
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e5e9f0] bg-white px-5 py-2.5 text-[13px] font-bold text-[#2a3242]">
                <span className="h-4 w-4 rounded-full border border-dashed border-[#ff6a00] [animation:neuroadsFlowDash_1.1s_linear_infinite]" />
                Aprendizado contínuo
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            {ecosystemRowsWithAgents.map((row, rowIndex) => {
              const StageIcon = row.stageIcon;
              return (
                <div
                  key={row.id}
                  className="relative rounded-[24px] border border-dashed border-[#ffbf93] bg-[#fffefe] p-3 md:p-4"
                >
                  <div className="pointer-events-none absolute left-[240px] right-5 top-0 hidden h-[2px] xl:block">
                    <span className="block h-full bg-[repeating-linear-gradient(90deg,rgba(255,106,0,0.5)_0_8px,transparent_8px_18px)] [animation:neuroadsFlowDash_1.2s_linear_infinite]" />
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[210px_repeat(3,minmax(0,1fr))]">
                    <article className="rounded-[18px] border border-[#0c1930] bg-[radial-gradient(circle_at_30%_20%,#142745_0%,#070f1f_58%,#040913_100%)] p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_24px_rgba(8,12,22,0.4)]">
                      <span className="inline-flex h-14 w-14 items-center justify-center rounded-[14px] border border-[#ff8b39]/45 bg-[#091427] text-[#ff7a21]">
                        <StageIcon size={28} strokeWidth={2.1} />
                      </span>
                      <h3 className="mt-4 text-[24px] font-extrabold leading-none text-[#ff7a21] sm:text-[28px] md:text-[30px]">
                        {row.stage}
                      </h3>
                      <p className="mt-3 text-[14px] leading-[1.45] text-white/90 md:text-[15px]">{row.stageDescription}</p>
                    </article>

                    {row.agents.map((agent, index) => {
                      const orderNumber = rowIndex * 3 + index + 1;
                      return (
                        <article
                          key={agent.title}
                          className="group relative flex min-h-[228px] flex-col overflow-hidden rounded-[18px] border border-[#e6ebf2] bg-white px-4 pb-4 pt-4 shadow-[0_8px_18px_rgba(17,26,39,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_24px_rgba(17,26,39,0.1)]"
                        >
                          <div className="relative z-10 flex h-full flex-col">
                            <div className="min-w-0 pr-1">
                              <h4
                                className="text-[14px] font-extrabold leading-[1.2] text-[#121a29] md:text-[16px]"
                                style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {orderNumber}. {agent.title}
                              </h4>
                              <p
                                className="mt-2 text-[12px] leading-[1.45] text-[#596277] md:text-[13px]"
                                style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 4,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                }}
                              >
                                {agent.description}
                              </p>
                            </div>

                            <div className="mt-auto flex flex-col items-start gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between">
                              <button
                                type="button"
                                onClick={() => setDetailsAgent(agent)}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#ffbd93] bg-white px-4 py-2 text-[12px] font-extrabold uppercase tracking-[0.04em] text-[#ff6a00] transition hover:bg-[#fff3ea] sm:w-auto sm:whitespace-nowrap"
                              >
                                Mais detalhes
                                <ArrowRight size={12} className="[animation:neuroadsFlowArrowPulse_1.2s_ease-in-out_infinite]" />
                              </button>

                              <Image
                                src={agent.icon}
                                alt={`Ícone oficial do agente ${agent.title}`}
                                width={76}
                                height={76}
                                className="h-[76px] w-[76px] self-end rounded-[10px] object-cover shadow-[0_6px_14px_rgba(10,20,40,0.22)] sm:self-auto"
                              />
                            </div>
                          </div>

                          {index < row.agents.length - 1 && (
                            <span className="pointer-events-none absolute -right-3 top-1/2 hidden -translate-y-1/2 xl:inline-flex items-center text-[#ff6a00]">
                              <span className="h-[1.5px] w-10 bg-[#ff6a00]/75" />
                              <ArrowRight size={14} className="-ml-1 [animation:neuroadsFlowArrowPulse_1.2s_ease-in-out_infinite]" />
                            </span>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {detailsAgent && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-[#090f1a]/70 px-4 py-6 sm:items-center" onClick={() => setDetailsAgent(null)}>
          <div
            className="relative w-full max-w-[760px] max-h-[88vh] overflow-y-auto rounded-[24px] border border-[#e9edf4] bg-white p-6 shadow-[0_25px_60px_rgba(8,16,30,0.28)] sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setDetailsAgent(null)}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#dde4ef] text-[#4e586b] transition hover:bg-[#f4f7fb]"
              aria-label="Fechar detalhes do agente"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col gap-4 pr-10 sm:flex-row sm:items-start">
              <div className="inline-flex rounded-[14px] border border-[#2b3f68] bg-[linear-gradient(180deg,#111c32_0%,#0b1428_100%)] p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_18px_rgba(10,20,40,0.35)]">
                <Image src={detailsAgent.icon} alt={`Ícone oficial do agente ${detailsAgent.title}`} width={64} height={64} className="h-16 w-16 rounded-[10px] object-cover" />
              </div>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#ff7a21]">Agente de IA</p>
                <h3 className="mt-1 text-[24px] font-extrabold leading-tight text-[#171f2d] sm:text-[30px]">{detailsAgent.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-[#5b6476]">{detailsAgent.description}</p>
              </div>
            </div>

            <div className="mt-7 rounded-[18px] border border-[#edf1f7] bg-[#f9fbff] p-5">
              <p className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-[#ff6a00]">Atividades Relacionadas</p>
              <ul className="mt-3 space-y-2.5">
                {extractActivities(detailsAgent.longDescription).map((activity) => (
                  <li key={activity} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-[#3b4558]">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#ff7a21]" />
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <section id="segmentos" className="mx-auto max-w-[1260px] px-5 pb-2 pt-10 md:px-8">
        <div className="relative overflow-hidden rounded-[30px] border border-[#e8edf5] bg-[radial-gradient(circle_at_0%_0%,#fff3e8_0%,#ffffff_42%),linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-5 py-7 sm:px-7 sm:py-9">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_15%,rgba(255,121,32,0.12)_0%,rgba(255,121,32,0)_52%)]" />
          <div className="relative">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#ff6a00]">Soluções por Segmento</p>
            <h2 className="mt-2 text-center text-[28px] font-extrabold leading-tight text-[#191e29] sm:text-[34px] lg:text-[40px]">
              <span className="block">Agentes Autônomos especialistas</span>
              <span className="block bg-[linear-gradient(90deg,#ff6a00_0%,#ff8f3a_42%,#d55a00_100%)] bg-clip-text text-transparent">no seu modelo de negócio.</span>
            </h2>
            <p className="mt-4 max-w-[850px] text-[14px] leading-relaxed text-[#586174] sm:text-[15px]">
              Cada segmento tem uma lógica de compra diferente. Aqui você encontra páginas de captura específicas para reduzir desperdício e aumentar previsibilidade de receita.
            </p>

            <div className="mt-12 flex flex-wrap justify-center gap-4">
              {segmentLandingCards.map((segment) => {
                const hasBackgroundImage = Boolean(segment.backgroundImage);

                return (
                  <Link
                    key={segment.href}
                    href={segment.href}
                    aria-label={`Abrir oportunidade de ${segment.title}`}
                    className={`group relative w-full max-w-[420px] overflow-hidden rounded-[22px] border border-[#e9edf4] shadow-[0_10px_24px_rgba(16,24,40,0.05)] transition hover:-translate-y-0.5 hover:border-[#ffd4b2] hover:shadow-[0_14px_28px_rgba(255,122,36,0.13)] md:w-[calc(50%-0.5rem)] xl:w-[calc(33.333%-0.75rem)] ${
                      hasBackgroundImage ? 'min-h-[360px] p-0 md:min-h-[420px]' : 'bg-white p-5'
                    }`}
                  >
                    {hasBackgroundImage ? (
                      <>
                        <Image src={segment.backgroundImage ?? ''} alt="" fill className="object-cover object-center" sizes="(max-width: 768px) 100vw, 50vw" aria-hidden />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[56%] bg-[linear-gradient(180deg,rgba(6,12,22,0)_0%,rgba(6,12,22,0.46)_44%,rgba(6,12,22,0.86)_100%)]" />
                        <div className="relative z-10 flex min-h-[360px] flex-col justify-end p-4 md:min-h-[420px] md:p-5">
                          <div className="rounded-[14px] border border-white/30 bg-white/12 p-4 backdrop-blur-[2.5px]">
                            <h3 className="text-[22px] font-black leading-snug text-white [text-shadow:0_2px_10px_rgba(3,8,15,0.55)]">{segment.title}</h3>
                            <p className="mt-2 text-[14px] leading-relaxed text-white/90 [text-shadow:0_1px_6px_rgba(3,8,15,0.5)]">{segment.pain}</p>
                            <p className="mt-3 text-[13px] font-semibold leading-relaxed text-white/95 [text-shadow:0_1px_6px_rgba(3,8,15,0.45)]">{segment.impact}</p>
                            <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-extrabold text-[#ffd1ad] transition group-hover:gap-2.5">
                              Conheça as oportunidades
                              <ArrowRight size={13} />
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-[20px] font-extrabold leading-snug text-[#1f2531]">{segment.title}</h3>
                        <p className="mt-2 text-[14px] leading-relaxed text-[#5b6577]">{segment.pain}</p>
                        <p className="mt-3 text-[13px] font-semibold leading-relaxed text-[#2d3648]">{segment.impact}</p>
                        <span className="mt-4 inline-flex items-center gap-2 text-[13px] font-extrabold text-[#ff6a00] transition group-hover:gap-2.5">
                          Conheça as oportunidades
                          <ArrowRight size={13} />
                        </span>
                      </>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col items-center gap-2 text-center">
              <button
                type="button"
                onClick={handleOpenSpecialistChat}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F24900] to-[#FF8805] hover:from-[#d93f00] hover:to-[#e07500] px-6 py-2.5 text-[13px] font-extrabold text-white shadow-[0_10px_22px_rgba(255,106,0,0.28)] transition-all"
              >
                Solicitar diagnóstico do meu segmento
                <ArrowRight size={13} />
              </button>
              <p className="text-[13px] font-medium text-[#667083]">Sem compromisso. Com foco em impacto no caixa.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1260px] px-5 pb-2 pt-10 md:px-8">
        <div className="relative overflow-hidden rounded-[32px] border border-[#122034] bg-[#040a13] px-4 pb-32 pt-7 sm:px-8 sm:pb-40 sm:pt-7">
          <Image src="/images/template-match/metrics-wave-v1.png" alt="" fill className="pointer-events-none object-cover object-bottom opacity-[1]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,8,15,0.9)_0%,rgba(3,8,15,0.92)_40%,rgba(3,8,15,0.14)_100%)]" />

          <div className="relative">
            <h2 className="text-center text-[28px] font-extrabold leading-tight text-white sm:text-[34px] lg:text-[42px]">Métricas que importam. Impacto que fica.</h2>
            <div className="mx-auto mt-5 grid max-w-[1150px] gap-4 md:grid-cols-2 xl:grid-cols-4">
              {metrics.map((metric) => (
                <article key={metric.label} className="min-h-[190px] rounded-[20px] border border-[#20324b] border-l-gradient-orange border-l-transparent bg-[#091423]/76 px-6 pb-3 pt-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                  <p className="text-[38px] font-extrabold leading-none text-[#ff6a00] sm:text-[44px] lg:text-[48px]">{metric.value}</p>
                  <p className="mt-2 text-[15px] leading-snug text-white/88">{metric.label}</p>
                  <div className="mt-4">
                    <Sparkline d={metric.path} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="depoimentos" className="mx-auto max-w-[1260px] px-5 pb-4 pt-14 md:px-8">
        <h2 className="text-center text-[28px] font-extrabold text-[#1a1c22] sm:text-[34px] lg:text-[42px]">Quem cresce com a gente, recomenda.</h2>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article key={item.name} className="min-h-[230px] rounded-[18px] border border-[#f3e6dc] border-l-gradient-orange border-l-transparent bg-white p-6 shadow-[0_4px_12px_rgba(10,20,30,0.03)]">
              <span className="text-[30px] font-extrabold leading-none text-[#ff7a21]">“</span>
              <p className="mt-1 text-[13px] leading-[1.75] text-[#4e5665]">{item.quote}</p>
              <div className="mt-5 flex items-center gap-3">
                <Image src={item.avatar} alt={item.name} width={44} height={44} className="h-11 w-11 rounded-full object-cover" />
                <div>
                  <p className="text-[18px] font-bold text-[#21252d]">{item.name}</p>
                  <p className="text-[13px] text-[#727a88]">{item.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff6a00]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#d7dbe2]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#d7dbe2]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#d7dbe2]" />
        </div>
      </section>

      <ValuesResourcesSection />

      <section className="mx-auto grid max-w-[1260px] gap-5 px-5 pb-10 pt-8 lg:grid-cols-[1.08fr_0.92fr] md:px-8">
        <div>
          <h3 className="text-[28px] font-extrabold text-[#1d2028] sm:text-[34px]">Perguntas frequentes</h3>
          <div className="mt-4 overflow-hidden rounded-[16px] border border-[#eceef2] bg-white">
            {faq.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={item.q} className={`${idx !== faq.length - 1 ? 'border-b border-[#eef0f4]' : ''}`}>
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-[#fafbfd]"
                    aria-expanded={isOpen}
                  >
                    <p className="pr-4 text-[16px] font-semibold text-[#2b313e]">{item.q}</p>
                    <span className="text-[21px] leading-none text-[#535c6b]">{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4">
                      <p className="text-[14px] leading-relaxed text-[#5f6878]">{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div
          id="contato"
          className="relative overflow-hidden rounded-[22px] border border-[#ff8f45]/30 bg-[linear-gradient(115deg,#0b0e14_0%,#070a11_56%,#0f1219_100%)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_22px_rgba(8,10,16,0.35)] sm:p-7"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_42%,rgba(255,123,34,0.32)_0%,rgba(255,123,34,0)_52%),radial-gradient(circle_at_15%_-5%,rgba(255,124,38,0.16)_0%,rgba(255,124,38,0)_45%)]" />
          <div className="relative z-10 grid items-center gap-5 sm:grid-cols-[1fr_auto]">
            <div className="max-w-[355px]">
              <h3 className="text-[30px] font-extrabold leading-tight text-white sm:text-[36px] lg:text-[42px]">Ainda com dúvidas?</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-white/86">
                Fale com um especialista e descubra como podemos acelerar seus resultados.
              </p>
              <button
                type="button"
                onClick={handleOpenSpecialistChat}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F24900] to-[#FF8805] hover:from-[#d93f00] hover:to-[#e07500] px-6 py-3 text-[13px] font-extrabold text-white shadow-[0_10px_22px_rgba(255,106,0,0.35)] transition-all"
              >
                Falar com especialista
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="relative mx-auto h-[170px] w-[170px] sm:mx-0">
              <span className="absolute inset-0 rounded-full border border-[#ff8f43]/42" />
              <span className="absolute inset-[17px] rounded-full border border-[#ff8f43]/35" />
              <span className="absolute inset-[34px] rounded-full border border-[#ff8f43]/22" />
              <span className="absolute inset-[48px] flex items-center justify-center rounded-full border border-[#ff8f43]/60 bg-[radial-gradient(circle,rgba(255,130,46,0.22)_0%,rgba(255,130,46,0.02)_65%,rgba(255,130,46,0)_100%)] text-[#ff8a40] shadow-[0_0_28px_rgba(255,122,36,0.55),inset_0_0_20px_rgba(255,122,36,0.18)]">
                <Headphones size={54} strokeWidth={2.15} />
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1260px] px-5 pb-8 md:px-8">
        <div className="relative overflow-hidden rounded-[28px] border border-[#111a2b] bg-[#050b14] px-5 py-7 sm:px-7 sm:py-8">
          <Image src="/images/template-match/cta-orbit-dark-v1.png" alt="" fill className="pointer-events-none object-cover object-right opacity-[0.96]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(4,9,16,0.94)_0%,rgba(4,9,16,0.9)_42%,rgba(4,9,16,0.42)_100%)]" />

          <div className="relative max-w-[700px]">
            <h2 className="text-[30px] font-extrabold leading-[1.12] text-white sm:text-[34px] lg:text-[40px]">
              Pronto para transformar dados
              <br />
              em{' '}
              <span className="bg-[linear-gradient(90deg,#ffb36a_0%,#ff8a2b_45%,#d55a00_100%)] bg-clip-text text-transparent">
                crescimento previsível?
              </span>
            </h2>
            <p className="mt-2.5 text-[13px] text-white/82 sm:text-[14px]">Agentes de IA trabalhando para seu negócio 24/7.</p>
            <p className="text-[13px] text-white/82 sm:text-[14px]">Mais performance. Menos achismo.</p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <button type="button" onClick={handleOpenSpecialistChat} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#F24900] to-[#FF8805] hover:from-[#d93f00] hover:to-[#e07500] transition-all px-6 py-2.5 text-[13px] font-extrabold text-white">
                Fale com um especialista
                <ArrowRight size={13} />
              </button>
              <button type="button" onClick={handleRequestDemo} className="inline-flex items-center gap-2 rounded-xl border border-white/24 bg-black/25 px-6 py-2.5 text-[13px] font-bold text-white">
                Solicite Demonstração
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/30 text-white">
                  <ArrowRight size={10} />
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer id="rodape" className="relative z-10 w-full overflow-hidden border-t border-white/5 bg-[#000000]/95 backdrop-blur-xl">
        <div className="relative z-10 mx-auto max-w-[1260px] px-5 py-12 md:px-8">
          <div>
            <Image src="/images/Logos/LLNeuroAds.png" alt="NeuroAds" width={190} height={40} className="h-10 w-auto" />
            <p className="mt-3 max-w-[280px] text-[13px] text-[#707887]">IA agêntica para marketing de alta performance.</p>
            <div className="mt-4 flex items-center gap-3 text-[#525b6b]">
              <a
                href="https://www.linkedin.com/company/neuroads"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="inline-flex h-8 w-8 overflow-hidden rounded-lg border border-[#e5e8ee] bg-white"
              >
                <Image src="/images/linkedin-3d.png" alt="LinkedIn" width={32} height={32} className="h-full w-full object-cover" />
              </a>
              <a
                href="https://www.instagram.com/neuroads.oficial/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex h-8 w-8 overflow-hidden rounded-lg border border-[#e5e8ee] bg-white"
              >
                <Image src="/images/instagram-final.png" alt="Instagram" width={32} height={32} className="h-full w-full object-cover" />
              </a>
              <a
                href="https://www.youtube.com/@claudiomullermkt"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="inline-flex h-8 w-8 overflow-hidden rounded-lg border border-[#e5e8ee] bg-white"
              >
                <Image src="/images/youtube-final.png" alt="YouTube" width={32} height={32} className="h-full w-full object-cover" />
              </a>
            </div>
          </div>

          {headerMenuGroups.map((group) => (
            <div key={group.label}>
              <Link href={group.href} className="text-[14px] font-extrabold text-[#242934] transition hover:text-[#ff6a00]">
                {group.label}
              </Link>
              <ul className="mt-3 space-y-2 text-[13px] text-[#656d7c]">
                {group.submenu.map((item) => {
                  if (isCategorySubmenuItem(item)) {
                    return (
                      <li key={item.label} className="pt-1">
                        <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#ff6a00]">{item.label}</p>
                        <div className="mt-1.5 space-y-1.5 pl-2">
                          {item.items.map((nestedItem) => (
                            <Link key={nestedItem.href} href={nestedItem.href} className="block transition hover:text-[#ff6a00]">
                              {nestedItem.label}
                            </Link>
                          ))}
                        </div>
                      </li>
                    );
                  }

                  return (
                    <li key={item.href}>
                      <Link href={item.href} className="transition hover:text-[#ff6a00]">
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 text-[11px] text-[#8c93a0]">
          <p>© 2026 NeuroAds. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <a href="/privacidade">Política de Privacidade</a>
            <a href="/termos">Termos de Uso</a>
          </div>
        </div>
        </footer>
      </div>

      {isLuccaChatOpen && (
        <LuccaSpecialistChatModal
          isOpen={isLuccaChatOpen}
          onClose={() => setIsLuccaChatOpen(false)}
          autoUserMessage={luccaAutoMessage}
        />
      )}
    </main>
  );
}
