import type { Metadata } from 'next';
import SubmenuPageShell, { type SubmenuPageContent } from '@/components/neuroads/SubmenuPageShell';

export const metadata: Metadata = {
  title: 'Materias de Apoio | Conteúdos NeuroAds',
  description:
    'Biblioteca prática da NeuroAds com guias e playbooks para PMEs: aplicação em 7 dias, foco em execução e impacto financeiro.',
};

const content: SubmenuPageContent = {
  slug: 'conteudos-materias-de-apoio',
  eyebrow: 'Conteúdos NeuroAds',
  headline: 'Materiais de apoio para',
  highlightedHeadline: 'execução em 7 dias',
  subheadline:
    'Guias, checklists e playbooks para transformar estratégia em rotina operacional. Conteúdo direto para reduzir ruído e aumentar previsibilidade.',
  serviceContext: 'Materias de Apoio',
  copyContract: {
    promise: 'Material prático para acelerar execução com padrão de qualidade.',
    pain: 'Mesmo com boas ideias, o time trava na hora de operacionalizar por falta de processo documentado e prioridades claras.',
    impactoFinanceiro:
      'Sem padronização, a operação repete erros, aumenta retrabalho e perde eficiência financeira na aquisição e conversão.',
    prova:
      'A biblioteca organiza materiais por maturidade e frente de atuação, com foco em reduzir tempo de implementação e aumentar clareza de execução.',
    metodo:
      'Você escolhe a trilha por prioridade de negócio, aplica os checklists na rotina e mede ganho de performance com base em indicadores de caixa.',
    cta: 'Solicite diagnóstico para receber a trilha mais aderente ao momento da sua operação.',
  },
  painPoints: [
    'Falta de playbook para repetir acertos com consistência.',
    'Onboarding lento de novas pessoas no time.',
    'Execução desalinhada entre marketing e comercial.',
    'Baixa cadência de melhoria contínua.',
  ],
  impactPoints: [
    'Retrabalho frequente e desperdício de horas operacionais.',
    'Menor velocidade para capturar oportunidades de mercado.',
    'Custo maior para alcançar metas de faturamento.',
    'Perda de previsibilidade em entregas críticas.',
  ],
  howItWorks: [
    'Seleção da trilha por objetivo de crescimento.',
    'Aplicação de checklists por etapa do funil.',
    'Ritual de revisão semanal com indicadores financeiros.',
    'Ajustes contínuos com suporte de diagnóstico especializado.',
  ],
  proofMetrics: [],
  faq: [
    {
      question: 'Esses materiais substituem consultoria?',
      answer:
        'Eles aceleram a execução, mas a consultoria estratégica garante priorização correta para o contexto específico da sua empresa.',
    },
    {
      question: 'Posso aplicar com equipe enxuta?',
      answer:
        'Sim. Os materiais foram desenhados para PMEs e focam em ações de alto impacto sem exigir estrutura grande.',
    },
    {
      question: 'Qual a diferença entre guia, checklist e playbook?',
      answer:
        'Guia orienta, checklist garante execução e playbook estrutura recorrência. Os três juntos aumentam consistência operacional.',
    },
    {
      question: 'Como saber qual trilha começar?',
      answer:
        'Pelo gargalo com maior impacto no caixa hoje. O diagnóstico inicial ajuda a definir a sequência ideal de implementação.',
    },
  ],
  relatedPages: [
    {
      label: 'Além do Algoritmo',
      href: '/conteudos/alem-do-algoritmo',
      description: 'Complete a base estratégica com visão aplicada para PMEs.',
    },
    {
      label: 'Agentes de Conversão',
      href: '/agentes-ia/agentes-de-conversao',
      description: 'Aplique materiais para elevar consistência de fechamento.',
    },
    {
      label: 'Nosso Método',
      href: '/a-neuroads/nosso-metodo',
      description: 'Entenda o processo que organiza execução e escala.',
    },
    {
      label: 'Contato',
      href: '/a-neuroads/contato',
      description: 'Solicite recomendação da trilha ideal para sua empresa.',
    },
  ],
  media: {
    title: 'Biblioteca prática',
    poster: '/images/tools/diagnostico_lp.png',
    desktopVideo: '/videos/fundovideo.mp4',
    mobileVideo: '/videos/fundovideo.mp4',
  },
};

export default function Page() {
  return <SubmenuPageShell content={content} />;
}

