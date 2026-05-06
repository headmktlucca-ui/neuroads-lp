import type { Metadata } from 'next';
import SubmenuPageShell, { type SubmenuPageContent } from '@/components/neuroads/SubmenuPageShell';

export const metadata: Metadata = {
  title: 'Agentes de Conversão | NeuroAds',
  description:
    'Agentes de conversão para transformar tráfego em vendas: priorização de leads, automação de follow-up e otimização contínua de taxa de conversão.',
};

const content: SubmenuPageContent = {
  slug: 'agentes-conversao',
  eyebrow: 'Agentes IA',
  headline: 'Conversão previsível com',
  highlightedHeadline: 'decisão assistida',
  subheadline:
    'A conversão acontece quando mensagem, timing e processo comercial estão alinhados. Os agentes cuidam da cadência para evitar perda de oportunidade.',
  serviceContext: 'Agentes de Conversão',
  copyContract: {
    promise: 'Transformar tráfego em venda com consistência operacional.',
    pain: 'Leads entram no funil, mas travam entre atendimento, follow-up e fechamento por falta de processo e priorização.',
    impactoFinanceiro:
      'A cada lead não trabalhado no timing correto, a empresa paga novamente para recomprar atenção, elevando custo total de aquisição.',
    prova:
      'Os agentes monitoram avanço de estágio, sinalizam risco de abandono e priorizam ações comerciais com maior potencial de conversão.',
    metodo:
      'Mapeamos a jornada, estruturamos regras de qualificação e ativamos automações de follow-up para aumentar taxa de avanço até venda.',
    cta: 'Solicite diagnóstico de conversão e veja onde seu funil está perdendo receita hoje.',
  },
  painPoints: [
    'Leads sem classificação por intenção e maturidade.',
    'Follow-up irregular e sem padrão de qualidade.',
    'Página, oferta e atendimento com mensagens conflitantes.',
    'Baixa velocidade para responder sinais de interesse.',
  ],
  impactPoints: [
    'Conversão abaixo do potencial da base de leads.',
    'Aumento do custo por venda com menor retorno marginal.',
    'Ciclo comercial mais longo e caixa mais pressionado.',
    'Perda de previsibilidade em metas de faturamento mensal.',
  ],
  howItWorks: [
    'Diagnóstico das fricções entre tráfego, página e comercial.',
    'Definição de critérios de qualificação e prioridade de atendimento.',
    'Automação de follow-up com gatilhos por comportamento.',
    'Revisão contínua de copy, oferta e taxa de avanço por etapa.',
  ],
  proofMetrics: [],
  faq: [
    {
      question: 'Qual o primeiro ganho esperado com os agentes de conversão?',
      answer:
        'Geralmente, ganho de velocidade e consistência no follow-up. Isso reduz perda de oportunidade e já melhora eficiência do funil.',
    },
    {
      question: 'Serve para operação com time comercial pequeno?',
      answer:
        'Sim. Em equipes menores, a priorização inteligente de leads costuma gerar impacto ainda maior em produtividade e fechamento.',
    },
    {
      question: 'Os agentes substituem CRM?',
      answer:
        'Não. Eles potencializam o CRM com inteligência de prioridade, automação e recomendações acionáveis por etapa do processo.',
    },
    {
      question: 'Como medem evolução de conversão?',
      answer:
        'Acompanhamos taxa de avanço por estágio, tempo médio de fechamento, custo por venda e impacto final na receita.',
    },
  ],
  relatedPages: [
    {
      label: 'Estratégia de Funil e Conversão',
      href: '/servicos/estrategia-de-funil-e-conversao',
      description: 'Veja o framework completo de funil aplicado pela NeuroAds.',
    },
    {
      label: 'Agentes de Aquisição',
      href: '/agentes-ia/agentes-de-aquisicao',
      description: 'Alinhe entrada qualificada com fechamento mais eficiente.',
    },
    {
      label: 'Contato',
      href: '/a-neuroads/contato',
      description: 'Solicite diagnóstico com foco em avanço de conversão.',
    },
    {
      label: 'Materias de Apoio',
      href: '/conteudos/materias-de-apoio',
      description: 'Acesse materiais práticos de funil e conversão para PMEs.',
    },
  ],
  media: {
    title: 'Agentes de conversão',
    poster: '/images/tools/gerador_copies.png',
    desktopVideo: '/videos/fundovideo.mp4',
    mobileVideo: '/videos/fundovideo.mp4',
  },
};

export default function Page() {
  return <SubmenuPageShell content={content} />;
}

