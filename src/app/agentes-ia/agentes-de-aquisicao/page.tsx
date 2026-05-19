import type { Metadata } from 'next';
import SubmenuPageShell, { type SubmenuPageContent } from '@/components/neuroads/SubmenuPageShell';
import { getAgentExamplesForStage } from '@/data/agent-examples';

export const metadata: Metadata = {
  title: 'Agentes de Aquisição | NeuroAds',
  description:
    'Agentes de aquisição para reduzir custo e elevar qualidade de lead com governança de investimento e foco em escala previsível.',
};

const content: SubmenuPageContent = {
  slug: 'agentes-aquisicao',
  eyebrow: 'Agentes IA',
  headline: 'Aquisição inteligente com',
  highlightedHeadline: 'custo controlado',
  subheadline:
    'Os agentes de aquisição combinam segmentação, criativo e orçamento para atrair o público certo com eficiência, sem inflar custo por lead.',
  serviceContext: 'Agentes de Aquisição',
  copyContract: {
    promise: 'Atrair demanda qualificada sem desperdiçar verba.',
    pain: 'Muito tráfego, pouca qualidade. Leads entram, mas não sustentam taxa de fechamento saudável para o comercial.',
    impactoFinanceiro:
      'Quando aquisição não é qualificada, o time comercial perde produtividade, o CAC sobe e a margem de contribuição encolhe.',
    prova:
      'Usamos agentes de análise de tráfego, criativos e público para realocar verba em tempo hábil e priorizar o que realmente converte.',
    metodo:
      'Definimos ICP operacional, criamos hipóteses por canal e executamos otimizações diárias com foco em qualidade do lead e eficiência de aquisição.',
    cta: 'Solicite diagnóstico e veja quais ajustes de aquisição podem reduzir custo e elevar retorno.',
  },
  painPoints: [
    'Segmentação ampla sem aderência ao perfil de compra.',
    'Criativos sem alinhamento com intenção de conversão.',
    'Distribuição de verba sem critério de qualidade de lead.',
    'Relatórios de mídia desconectados da venda real.',
  ],
  impactPoints: [
    'Aumento de CPL com baixa conversão comercial.',
    'Equipe de vendas sobrecarregada com oportunidades frias.',
    'ROAS pressionado por baixa eficiência de entrada.',
    'Dificuldade para escalar com segurança financeira.',
  ],
  howItWorks: [
    'Classificação de audiências por potencial de compra.',
    'Rotina de testes criativos orientada a performance.',
    'Ajuste de investimento com foco em custo e qualidade.',
    'Integração de sinais de mídia com resultado comercial.',
  ],
  proofMetrics: [],
  agentExamples: getAgentExamplesForStage('aquisicao'),
  faq: [
    {
      question: 'Como vocês medem qualidade de lead na aquisição?',
      answer:
        'Combinamos indicadores de mídia com dados de avanço no funil comercial. O lead só é considerado bom quando evolui para oportunidade real.',
    },
    {
      question: 'Os agentes tomam decisões de orçamento sozinhos?',
      answer:
        'Eles recomendam e executam dentro de parâmetros definidos. A supervisão estratégica garante segurança e alinhamento ao momento do negócio.',
    },
    {
      question: 'Funciona para mercados com ticket mais alto?',
      answer:
        'Sim, e costuma ser ainda mais relevante. Quanto maior o ticket, maior o impacto de acertar a aquisição desde o início.',
    },
    {
      question: 'O que muda na prática no dia a dia da operação?',
      answer:
        'Mais rapidez em ajustes críticos, menos desperdício de verba e visibilidade clara de quais frentes estão gerando oportunidade de receita.',
    },
  ],
  relatedPages: [
    {
      label: 'Gestão de Tráfego (Google + Meta)',
      href: '/servicos/gestao-de-trafego-google-meta',
      description: 'Veja como a gestão integrada potencializa os agentes de aquisição.',
    },
    {
      label: 'Agentes de Conversão',
      href: '/agentes-ia/agentes-de-conversao',
      description: 'Conecte aquisição qualificada com taxa de fechamento maior.',
    },
    {
      label: 'Agentes de Inteligência de Dados',
      href: '/agentes-ia/agentes-de-inteligencia-de-dados',
      description: 'Use dados para decidir onde alocar investimento com precisão.',
    },
    {
      label: 'FAQ',
      href: '/conteudos/faq',
      description: 'Entenda critérios, prazos e indicadores do processo.',
    },
  ],
  media: {
    title: 'Agentes de aquisição',
    poster: '/images/tools/agentes-aquisicao-hero-ultrarealista-v2.png',
  },
};

export default function Page() {
  return <SubmenuPageShell content={content} />;
}

