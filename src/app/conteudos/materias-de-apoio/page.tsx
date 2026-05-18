import type { Metadata } from 'next';
import StrategicContentPageShell, { type StrategicContentPageData } from '@/components/neuroads/StrategicContentPageShell';

export const metadata: Metadata = {
  title: 'Materiais de Apoio | Conteúdos NeuroAds',
  description:
    'Biblioteca prática da NeuroAds com guias e playbooks para PMEs: aplicação em 7 dias, foco em execução e impacto financeiro.',
};

const content: StrategicContentPageData = {
  slug: 'conteudos-materias-de-apoio',
  eyebrow: 'Conteúdos NeuroAds',
  title: 'Materiais de apoio para',
  highlightedTitle: 'executar com clareza e previsibilidade.',
  subtitle:
    'Esta biblioteca foi criada para tirar sua equipe do improviso. São trilhas práticas para reduzir retrabalho, aumentar conversão e transformar estratégia em rotina operacional.',
  primaryCta: { label: 'Receber trilha recomendada', href: '/a-neuroads/contato' },
  secondaryCta: { label: 'Acessar FAQ', href: '/conteudos/faq' },
  highlights: [
    { title: 'Aplicação prática', description: 'Conteúdo para executar, não para acumular teoria.', icon: 'resource' },
    { title: 'Foco em caixa', description: 'Cada material conecta ação com impacto financeiro.', icon: 'gauge' },
    { title: 'Ritmo de equipe', description: 'Checklists para padronizar operação entre times.', icon: 'layers' },
    { title: 'Curadoria NeuroAds', description: 'Base alinhada ao método e ao DNA da marca.', icon: 'goal' },
  ],
  sections: [
    {
      title: 'O que você encontra aqui',
      description: 'Os materiais estão organizados por necessidade de negócio para facilitar decisão e execução.',
      bullets: [
        'Playbooks de aquisição para reduzir CPL com previsibilidade.',
        'Roteiros de funil comercial para melhorar taxa de conversão.',
        'Modelos de acompanhamento para leitura de performance semanal.',
        'Guias de GEO e IA agêntica para acelerar operação com controle.',
      ],
    },
    {
      title: 'Como usar sem complicar',
      description: 'O objetivo é aplicar rápido e medir resultado em linguagem de negócio.',
      bullets: [
        'Escolha a trilha pelo gargalo mais urgente da operação.',
        'Implemente em ciclos curtos de 7 dias com checklist.',
        'Meça resultado com indicadores de eficiência e receita.',
        'Ajuste com base em evidência, não em opinião.',
      ],
    },
  ],
  process: [
    { title: 'Priorizar o gargalo', detail: 'Definir o problema com maior impacto no caixa hoje.' },
    { title: 'Aplicar a trilha', detail: 'Executar o playbook da semana com responsáveis claros.' },
    { title: 'Medir e revisar', detail: 'Comparar evolução de custo, conversão e qualidade de lead.' },
    { title: 'Padronizar', detail: 'Documentar o que funcionou para escalar com consistência.' },
  ],
  resources: [
    {
      title: 'Além do Algoritmo',
      description: 'Canal editorial com visão estratégica para empresários.',
      href: '/conteudos/alem-do-algoritmo',
    },
    {
      title: 'Nosso Método',
      description: 'Entenda a lógica de execução por trás dos materiais.',
      href: '/a-neuroads/nosso-metodo',
    },
    {
      title: 'Agentes de Conversão',
      description: 'Aplique a biblioteca com apoio de IA na jornada comercial.',
      href: '/agentes-ia/agentes-de-conversao',
    },
  ],
  faq: [
    {
      question: 'Esses materiais substituem acompanhamento estratégico?',
      answer:
        'Eles aceleram execução, mas o acompanhamento estratégico garante prioridade correta e ajuste mais rápido de rota.',
    },
    {
      question: 'Minha equipe é pequena. Ainda faz sentido?',
      answer: 'Sim. A curadoria foi feita para PMEs com equipe enxuta e foco em ação de maior retorno.',
    },
    {
      question: 'Qual trilha devo começar primeiro?',
      answer: 'Comece pelo gargalo que mais pressiona caixa hoje. Se precisar, solicite diagnóstico para definir essa ordem.',
    },
  ],
  form: {
    title: 'Receba a trilha mais aderente ao seu momento',
    description: 'Informe seu cenário e indicamos por onde começar para gerar resultado com mais velocidade.',
    ctaLabel: 'Quero minha trilha',
    flow: 'analise',
    serviceContext: 'Materiais de Apoio - Trilha recomendada',
    successMessage: 'Solicitação enviada. Vamos indicar a trilha inicial mais aderente ao seu cenário.',
    includeMessage: true,
  },
};

export default function Page() {
  return <StrategicContentPageShell data={content} />;
}

