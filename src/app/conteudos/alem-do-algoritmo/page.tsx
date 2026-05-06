import type { Metadata } from 'next';
import SubmenuPageShell, { type SubmenuPageContent } from '@/components/neuroads/SubmenuPageShell';

export const metadata: Metadata = {
  title: 'Além do Algoritmo | Conteúdos NeuroAds',
  description:
    'Conteúdo estratégico para empresários que querem previsibilidade de crescimento com dados reais, IA aplicada e decisões orientadas a receita.',
};

const content: SubmenuPageContent = {
  slug: 'conteudos-alem-do-algoritmo',
  eyebrow: 'Conteúdos NeuroAds',
  headline: 'Além do algoritmo:',
  highlightedHeadline: 'estratégia aplicada',
  subheadline:
    'Conteúdo para quem precisa decidir melhor em marketing e vendas. Sem teoria vazia: foco em execução prática, previsibilidade e impacto no caixa.',
  serviceContext: 'Além do Algoritmo',
  copyContract: {
    promise: 'Conhecimento aplicado para decisões comerciais mais inteligentes.',
    pain: 'A empresa consome muito conteúdo, mas continua sem clareza sobre o que priorizar no dia a dia para crescer com consistência.',
    impactoFinanceiro:
      'Sem direção prática, o time investe energia em iniciativas com baixo retorno e perde velocidade em oportunidades relevantes.',
    prova:
      'Publicamos conteúdos orientados por dores reais de PMEs e traduzimos conceitos técnicos para decisões de receita, margem e escala.',
    metodo:
      'Organizamos trilhas por estágio de maturidade, com leitura rápida e aplicação direta em aquisição, conversão e governança de dados.',
    cta: 'Solicite um diagnóstico para transformar conteúdo em plano de ação comercial.',
  },
  painPoints: [
    'Excesso de informação sem priorização prática.',
    'Dificuldade de conectar teoria com execução.',
    'Time sem repertório comum para decidir rápido.',
    'Baixa consistência entre marketing, vendas e operação.',
  ],
  impactPoints: [
    'Perda de tempo em ações de baixo impacto financeiro.',
    'Execução fragmentada entre áreas-chave do funil.',
    'Atraso em ajustes que protegeriam margem e caixa.',
    'Menor velocidade de aprendizado da operação.',
  ],
  howItWorks: [
    'Curadoria de temas por dor real do empresário.',
    'Conteúdo traduzido para linguagem de decisão financeira.',
    'Aplicação prática por etapa do funil comercial.',
    'Conexão com diagnóstico para priorizar próximos passos.',
  ],
  proofMetrics: [],
  faq: [
    {
      question: 'Esse conteúdo é técnico demais para PME?',
      answer:
        'Não. A linguagem é objetiva e orientada à prática. O foco é ajudar o empresário a decidir melhor, sem jargão desnecessário.',
    },
    {
      question: 'Como usar esse conteúdo com minha equipe?',
      answer:
        'Use como base de alinhamento entre marketing, comercial e operação. Cada tema aponta ações que podem ser executadas imediatamente.',
    },
    {
      question: 'Vocês atualizam com temas de GEO e IA generativa?',
      answer:
        'Sim. GEO e IA aplicada fazem parte central da nossa linha editorial, sempre conectando tendência com execução prática para PMEs.',
    },
    {
      question: 'Quando vale partir do conteúdo para um diagnóstico?',
      answer:
        'Quando você já identificou dor recorrente e precisa priorizar ações com impacto direto no caixa. O diagnóstico acelera a tomada de decisão.',
    },
  ],
  relatedPages: [
    {
      label: 'Materias de Apoio',
      href: '/conteudos/materias-de-apoio',
      description: 'Acesse guias, playbooks e checklists para aplicação rápida.',
    },
    {
      label: 'FAQ',
      href: '/conteudos/faq',
      description: 'Respostas objetivas para dúvidas frequentes sobre operação e resultado.',
    },
    {
      label: 'SEO + GEO',
      href: '/servicos/seo-geo',
      description: 'Aplique conteúdo estratégico para ganhar presença em Google e IA.',
    },
    {
      label: 'Contato',
      href: '/a-neuroads/contato',
      description: 'Leve sua dúvida para um diagnóstico com contexto da sua empresa.',
    },
  ],
  media: {
    title: 'Conteúdo estratégico aplicado',
    poster: '/images/tools/dna_marca.png',
    desktopVideo: '/videos/fundovideo.mp4',
    mobileVideo: '/videos/fundovideo.mp4',
  },
};

export default function Page() {
  return <SubmenuPageShell content={content} />;
}

