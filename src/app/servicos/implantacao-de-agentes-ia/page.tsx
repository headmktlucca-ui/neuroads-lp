import type { Metadata } from 'next';
import SubmenuPageShell, { type SubmenuPageContent } from '@/components/neuroads/SubmenuPageShell';

export const metadata: Metadata = {
  title: 'Implantação de Agentes IA Comercial | NeuroAds',
  description:
    'Implantação de agentes de IA comercial com integração real de dados e operação 24/7. Menos gargalo manual, mais previsibilidade de crescimento.',
};

const content: SubmenuPageContent = {
  slug: 'servicos-implantacao-de-agentes-ia',
  eyebrow: 'Serviços NeuroAds',
  headline: 'Implantação de Agentes IA',
  highlightedHeadline: 'com operação real',
  subheadline:
    'IA não é camada decorativa. Implantamos agentes com função clara, rotina de decisão e supervisão estratégica para gerar resultado financeiro contínuo.',
  serviceContext: 'Implantação de Agentes IA',
  copyContract: {
    promise: 'Operação autônoma com direção humana e foco em receita.',
    pain: 'A empresa já usa ferramentas, mas sem integração. O time perde horas com tarefas repetitivas e a tomada de decisão fica lenta.',
    impactoFinanceiro:
      'Sem agentes bem implementados, o custo operacional sobe, a equipe dispersa energia e oportunidades de venda são perdidas por falta de timing.',
    prova:
      'Implantamos com blueprint por frente (aquisição, conversão e dados), com ritos operacionais, critérios de priorização e medição por impacto no caixa.',
    metodo:
      'Mapeamos gargalos, definimos agentes prioritários, conectamos dados/canais e ativamos uma rotina de aprendizado contínuo supervisionada pelo time sênior.',
    cta: 'Solicite o diagnóstico de implantação e entenda quais agentes entram primeiro na sua operação.',
  },
  painPoints: [
    'Automação fragmentada sem visão de processo inteiro.',
    'Dependência de tarefas manuais para decisões repetitivas.',
    'Ferramentas que não conversam entre mídia, CRM e comercial.',
    'Baixa visibilidade de prioridade diária para crescer com consistência.',
  ],
  impactPoints: [
    'Perda de velocidade em oportunidades de mercado.',
    'Crescimento com custo operacional desproporcional.',
    'Baixa previsibilidade de entrega do time em semanas críticas.',
    'Dificuldade de escalar sem aumentar complexidade interna.',
  ],
  howItWorks: [
    'Diagnóstico dos gargalos de aquisição, conversão e dados.',
    'Desenho do blueprint de agentes por objetivo financeiro.',
    'Integração com canais, CRM e rotina de execução 24/7.',
    'Acompanhamento com indicadores de eficiência operacional e caixa.',
  ],
  proofMetrics: [],
  faq: [
    {
      question: 'IA substitui totalmente o time humano?',
      answer:
        'Não. IA acelera execução e leitura de dados; a estratégia e as decisões críticas continuam sob supervisão humana especializada.',
    },
    {
      question: 'Quanto tempo leva a implantação inicial?',
      answer:
        'Depende da maturidade da operação e integrações existentes. O foco é colocar agentes prioritários em produção rápido, sem comprometer governança.',
    },
    {
      question: 'Quais áreas ganham mais no início?',
      answer:
        'Normalmente aquisição, qualificação de leads e inteligência de dados. Essas frentes costumam gerar ganhos visíveis em eficiência e previsibilidade.',
    },
    {
      question: 'Como garantir que a IA aprenda com o negócio?',
      answer:
        'Com parâmetros de operação, feedback estruturado e ciclos de ajuste contínuos. Quanto mais contexto de dados reais, maior a qualidade das recomendações.',
    },
  ],
  relatedPages: [
    {
      label: 'Visão Geral dos Agentes',
      href: '/agentes-ia/visao-geral-dos-agentes',
      description: 'Entenda o ecossistema completo e o papel de cada agente.',
    },
    {
      label: 'Agentes de Conversão',
      href: '/agentes-ia/agentes-de-conversao',
      description: 'Veja como os agentes transformam tráfego em oportunidade de venda.',
    },
    {
      label: 'Nosso Método',
      href: '/a-neuroads/nosso-metodo',
      description: 'Conheça as etapas de diagnóstico, execução e escala com previsibilidade.',
    },
    {
      label: 'Contato',
      href: '/a-neuroads/contato',
      description: 'Solicite implantação com contexto da sua operação atual.',
    },
  ],
  media: {
    title: 'Orquestração de agentes IA',
    poster: '/images/tools/servico-implantacao-agentes-hero-ultrarealista-v2.png',
  },
};

export default function Page() {
  return <SubmenuPageShell content={content} />;
}

