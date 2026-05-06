import type { Metadata } from 'next';
import SubmenuPageShell, { type SubmenuPageContent } from '@/components/neuroads/SubmenuPageShell';

export const metadata: Metadata = {
  title: 'Agentes de Inteligência de Dados | NeuroAds',
  description:
    'Agentes de inteligência de dados para unificar sinais, antecipar anomalias e transformar métricas em decisões financeiras claras.',
};

const content: SubmenuPageContent = {
  slug: 'agentes-inteligencia-de-dados',
  eyebrow: 'Agentes IA',
  headline: 'Dados reais para decidir',
  highlightedHeadline: 'com previsibilidade',
  subheadline:
    'Quando mídia, funil e receita são lidos juntos, o empresário deixa de operar no escuro e passa a priorizar alavancas com impacto direto no caixa.',
  serviceContext: 'Agentes de Inteligência de Dados',
  copyContract: {
    promise: 'Decisão financeira com leitura de sinal, não de vaidade.',
    pain: 'Dados espalhados em plataformas diferentes geram relatórios confusos e decisões atrasadas.',
    impactoFinanceiro:
      'Sem visão consolidada, problemas são descobertos tarde demais e o custo da correção cresce com o tempo.',
    prova:
      'Os agentes unificam fontes, detectam anomalias e entregam recomendações práticas com foco em CAC, CPL, ROAS e receita atribuída.',
    metodo:
      'Conectamos dados críticos da operação, definimos alertas de risco e estruturamos painéis executivos para tomada de decisão rápida e segura.',
    cta: 'Solicite diagnóstico de dados e descubra os pontos cegos que estão comprometendo seu crescimento.',
  },
  painPoints: [
    'Dados de mídia e vendas sem reconciliação confiável.',
    'Excesso de indicadores sem clareza de prioridade.',
    'Atraso para detectar queda de performance.',
    'Falta de histórico organizado para decisões estratégicas.',
  ],
  impactPoints: [
    'Ações reativas que elevam custo operacional.',
    'Verba alocada em frentes sem retorno comprovado.',
    'Baixa confiança para projeção de faturamento.',
    'Risco maior de erros de escala e caixa pressionado.',
  ],
  howItWorks: [
    'Mapeamento de fontes e qualidade dos dados atuais.',
    'Unificação de indicadores críticos por objetivo de negócio.',
    'Configuração de alertas para desvios e oportunidades.',
    'Painel executivo com leitura financeira acionável.',
  ],
  proofMetrics: [],
  faq: [
    {
      question: 'Vocês trabalham com dados em tempo real?',
      answer:
        'Sim, com atualização recorrente e alertas para desvios relevantes. O objetivo é agir rápido quando a operação sai do trilho esperado.',
    },
    {
      question: 'Preciso trocar as ferramentas atuais?',
      answer:
        'Nem sempre. Primeiro avaliamos o que já existe e conectamos o necessário para consolidar leitura e governança antes de propor mudanças maiores.',
    },
    {
      question: 'Quais indicadores vocês priorizam?',
      answer:
        'Os que têm relação direta com dinheiro: CAC, CPL, ROAS, taxa de conversão, receita atribuída e eficiência por canal/etapa do funil.',
    },
    {
      question: 'Como isso ajuda a equipe comercial?',
      answer:
        'Com melhor priorização de oportunidades e previsibilidade de demanda, o comercial atua com foco no que tem maior chance de fechamento.',
    },
  ],
  relatedPages: [
    {
      label: 'Visão Geral dos Agentes',
      href: '/agentes-ia/visao-geral-dos-agentes',
      description: 'Entenda onde a inteligência de dados se conecta ao ecossistema.',
    },
    {
      label: 'Agentes de Conversão',
      href: '/agentes-ia/agentes-de-conversao',
      description: 'Aplique leitura de dados para elevar taxa de fechamento.',
    },
    {
      label: 'SEO + GEO',
      href: '/servicos/seo-geo',
      description: 'Use inteligência para priorizar temas com retorno comercial.',
    },
    {
      label: 'Nosso Método',
      href: '/a-neuroads/nosso-metodo',
      description: 'Veja como integramos dados no ciclo de execução e escala.',
    },
  ],
  media: {
    title: 'Inteligência de dados',
    poster: '/images/tools/analise.png',
    desktopVideo: '/videos/fundovideo.mp4',
    mobileVideo: '/videos/fundovideo.mp4',
  },
};

export default function Page() {
  return <SubmenuPageShell content={content} />;
}

