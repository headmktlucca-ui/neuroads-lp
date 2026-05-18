import type { Metadata } from 'next';
import StrategicContentPageShell, { type StrategicContentPageData } from '@/components/neuroads/StrategicContentPageShell';

export const metadata: Metadata = {
  title: 'Nosso Método | NeuroAds',
  description:
    'Conheça o método NeuroAds: diagnóstico, estratégia, execução, otimização e escala com foco em previsibilidade financeira para PMEs.',
};

const content: StrategicContentPageData = {
  slug: 'a-neuroads-nosso-metodo',
  eyebrow: 'A NeuroAds',
  title: 'Método NeuroAds para',
  highlightedTitle: 'escala previsível com dados reais.',
  subtitle:
    'Nosso método conecta marketing e vendas em um fluxo operacional claro. Cada etapa tem objetivo financeiro definido para reduzir desperdício e aumentar conversão com consistência.',
  primaryCta: { label: 'Solicitar diagnóstico', href: '/a-neuroads/contato' },
  secondaryCta: { label: 'Entender os serviços', href: '/servicos' },
  highlights: [
    { title: 'Estrutura replicável', description: 'Processo padronizado, adaptado ao contexto da PME.', icon: 'layers' },
    { title: 'Decisão por impacto', description: 'Priorização orientada a caixa e velocidade de retorno.', icon: 'goal' },
    { title: 'Ritmo operacional', description: 'Cadência semanal para evitar execução inconsistente.', icon: 'gauge' },
    { title: 'Especialista + IA', description: 'Tecnologia com direção humana para reduzir risco.', icon: 'handshake' },
  ],
  sections: [
    {
      title: 'Por que um método importa',
      description:
        'Sem método, o crescimento fica refém de campanhas isoladas. Com método, a empresa ganha previsibilidade e clareza de prioridade.',
      bullets: [
        'Reduz retrabalho entre marketing, operação e comercial.',
        'Aumenta velocidade de correção de gargalos críticos.',
        'Evita decisões de investimento baseadas em percepção.',
        'Cria governança para escalar sem perder margem.',
      ],
    },
    {
      title: 'O que entregamos em cada ciclo',
      description:
        'Cada ciclo de execução é fechado com leitura financeira, melhoria de processo e novas prioridades para o próximo sprint operacional.',
      bullets: [
        'Mapa de gargalos atualizado por etapa do funil.',
        'Plano tático com foco em CPL, conversão e receita.',
        'Ajustes de criativos, ofertas e fluxo comercial.',
        'Relatório objetivo: o que melhorou, o que trava, o próximo passo.',
      ],
    },
  ],
  process: [
    { title: 'Imersão inicial', detail: 'Levantamento do cenário atual de aquisição, oferta e comercial.' },
    { title: 'Priorização', detail: 'Definição da sequência de ações por impacto financeiro imediato.' },
    { title: 'Operação integrada', detail: 'Mídia, conteúdo, GEO e agentes IA atuando no mesmo objetivo.' },
    { title: 'Revisão de performance', detail: 'Leitura em números de negócio para corrigir rota rápido.' },
  ],
  resources: [
    {
      title: 'Sobre a NeuroAds',
      description: 'Conheça o posicionamento e os diferenciais do ecossistema.',
      href: '/a-neuroads/sobre',
    },
    {
      title: 'Implantação de Agentes de IA',
      description: 'Veja como automatizamos rotinas sem perder governança.',
      href: '/servicos/implantacao-de-agentes-ia',
    },
    {
      title: 'Estratégia de Funil de Conversão',
      description: 'Entenda como elevamos conversão com processo comercial.',
      href: '/servicos/estrategia-de-funil-e-conversao',
    },
  ],
  faq: [
    {
      question: 'Esse método serve para qualquer segmento?',
      answer:
        'A lógica do método é padrão, mas as prioridades mudam conforme segmento, ticket médio, ciclo de venda e maturidade da operação.',
    },
    {
      question: 'Em quanto tempo o método começa a gerar resultado?',
      answer:
        'Os primeiros ganhos normalmente aparecem na eficiência operacional e qualidade de lead. Escala de receita vem na sequência, com consistência.',
    },
    {
      question: 'Como vocês evitam que o plano vire só teoria?',
      answer:
        'Cada etapa já sai com responsável, prazo e métrica de impacto. O método foi desenhado para execução prática, não para apresentação.',
    },
  ],
  form: {
    title: 'Quer aplicar esse método na sua operação?',
    description: 'Envie seu contexto e receba uma recomendação de prioridade para os próximos 30 dias.',
    ctaLabel: 'Receber recomendação',
    flow: 'analise',
    serviceContext: 'Nosso Método - Recomendação 30 dias',
    successMessage: 'Solicitação enviada. Vamos retornar com uma recomendação inicial por ordem de impacto.',
    includeMessage: true,
  },
};

export default function Page() {
  return <StrategicContentPageShell data={content} />;
}

