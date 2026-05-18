import type { Metadata } from 'next';
import StrategicContentPageShell, { type StrategicContentPageData } from '@/components/neuroads/StrategicContentPageShell';

export const metadata: Metadata = {
  title: 'Sobre a NeuroAds | Growth com IA Agêntica',
  description:
    'Conheça a NeuroAds: posicionamento, experiência e método para construir sistemas de marketing que geram resultado enquanto o empresário foca no negócio.',
};

const content: StrategicContentPageData = {
  slug: 'a-neuroads-sobre',
  eyebrow: 'A NeuroAds',
  title: 'Crescer sem previsibilidade',
  highlightedTitle: 'não é estratégia. É risco.',
  subtitle:
    'A NeuroAds foi criada para PMEs que cansaram de investir no escuro. Não vendemos campanhas isoladas. Construímos um sistema de performance com dados reais, governança e IA agêntica para gerar escala previsível enquanto você cuida do negócio.',
  primaryCta: { label: 'Começar com diagnóstico estratégico', href: '/a-neuroads/contato' },
  secondaryCta: { label: 'Ver nosso método em detalhes', href: '/a-neuroads/nosso-metodo' },
  highlights: [
    { title: '25+ anos em growth', description: 'Direção estratégica com base em operação real, não em achismo.', icon: 'goal' },
    { title: 'R$ 10M+ gerenciados', description: 'Leitura financeira contínua para proteger margem e acelerar receita.', icon: 'gauge' },
    { title: 'ROAS médio de 5,2x', description: 'Performance orientada a retorno real, não métricas de vaidade.', icon: 'layers' },
    { title: 'Acesso direto ao Claudio', description: 'Sem repasse para júnior. Especialista sênior na linha de frente.', icon: 'handshake' },
  ],
  sections: [
    {
      title: 'O cenário que trava a escala',
      description:
        'A maioria das PMEs já investe em marketing, mas sem um sistema integrado de decisão. O resultado é dúvida constante sobre o que realmente está trazendo vendas.',
      bullets: [
        'Canais com números isolados e sem visão de impacto no caixa.',
        'Leads entram, mas comercial e marketing não compartilham prioridade.',
        'Investimento mensal acontece, porém sem previsibilidade de receita.',
        'A operação depende de esforço manual para decisões que já deveriam ser automáticas.',
      ],
    },
    {
      title: 'A lógica do nosso sistema',
      description:
        'A NeuroAds conecta gestão de tráfego, SEO + GEO e Agentes de IA em um único ecossistema operacional. Cada ajuste precisa responder a uma pergunta simples: isso melhora margem, conversão ou previsibilidade?',
      bullets: [
        'Diagnóstico do funil com foco nos gargalos que mais drenam receita.',
        'Plano de execução por prioridade financeira e velocidade de retorno.',
        'Implantação de IA agêntica com supervisão humana para reduzir risco.',
        'Rotina de otimização com dados reais para transformar eficiência em crescimento previsível.',
      ],
    },
  ],
  process: [
    { title: 'Diagnóstico', detail: 'Mapeamos vazamentos de verba, gargalos de conversão e falhas de integração comercial.' },
    { title: 'Direção', detail: 'Definimos metas financeiras objetivas para CPL, taxa de conversão e receita por canal.' },
    { title: 'Execução', detail: 'Ativamos tráfego, GEO e IA agêntica com ritos operacionais e responsáveis claros.' },
    { title: 'Otimização', detail: 'Refinamos campanhas, oferta e funil com base em dados reais e leitura de margem.' },
    { title: 'Escala', detail: 'Expandimos o que funciona com consistência, sem perder controle financeiro da operação.' },
  ],
  processTitle: 'Jornada de escala previsível em 5 etapas',
  processDescription:
    'Processo desenhado para PME que quer sair da operação reativa e construir crescimento com previsibilidade mês a mês.',
  comparison: {
    eyebrow: 'Operação reativa vs. sistema previsível',
    title: 'A diferença entre “rodar campanha” e construir um ecossistema de performance',
    description:
      'Quando marketing, comercial e dados não conversam, a empresa opera no escuro. Com sistema integrado, cada decisão passa a ter impacto financeiro claro.',
    left: {
      title: 'Operação Reativa',
      points: [
        'Decisões por urgência, sem critério financeiro consolidado.',
        'Relatórios cheios de número, mas sem clareza de dinheiro no caixa.',
        'Equipe comercial recebendo lead sem qualificação consistente.',
        'Escala travada por falta de previsibilidade mensal.',
      ],
    },
    right: {
      title: 'Sistema NeuroAds',
      points: [
        'Direção estratégica com metas de receita e eficiência por etapa.',
        'Leitura de performance traduzida para impacto financeiro real.',
        'Agentes de IA apoiando qualificação e velocidade operacional.',
        'Crescimento previsível com ajustes recorrentes e governança.',
      ],
    },
  },
  miniCases: [
    {
      segment: 'Serviços B2B',
      bottleneck: 'Leads caros e baixa taxa de avanço comercial.',
      result: 'Ajuste de segmentação e oferta reduziu CPL e aumentou volume de oportunidades qualificadas.',
    },
    {
      segment: 'Saúde e Bem-estar',
      bottleneck: 'Mídia ativa sem visibilidade de retorno por etapa do funil.',
      result: 'Leitura integrada de dados permitiu cortar desperdício e melhorar conversão com a mesma verba.',
    },
    {
      segment: 'Educação e Treinamentos',
      bottleneck: 'Operação manual lenta, com follow-up inconsistente.',
      result: 'IA agêntica acelerou triagem comercial e aumentou ritmo de resposta para transformar demanda em reunião.',
    },
  ],
  resources: [
    {
      title: 'Nosso Método',
      description: 'Entenda como organizamos diagnóstico, direção, execução e escala previsível.',
      href: '/a-neuroads/nosso-metodo',
    },
    {
      title: 'FAQ NeuroAds',
      description: 'Respostas diretas sobre risco, investimento e modelo de atuação.',
      href: '/conteudos/faq',
    },
    {
      title: 'Além do Algoritmo',
      description: 'Canal editorial com visão prática sobre performance, GEO e IA para PME.',
      href: '/conteudos/alem-do-algoritmo',
    },
  ],
  resourcesTitle: 'Trilhas estratégicas para aprofundar',
  faq: [
    {
      question: 'Isso é para empresa grande ou funciona para PME?',
      answer:
        'O foco da NeuroAds é PME entre R$ 30 mil e R$ 200 mil/mês que precisa previsibilidade. A lógica é simplificar a operação, não complicar.',
    },
    {
      question: 'Qual a diferença entre NeuroAds e uma agência tradicional?',
      answer:
        'A diferença é o modelo. Não atuamos por canal isolado. Construímos um sistema integrado de performance, comercial e dados reais para decidir com segurança.',
    },
    {
      question: 'Vou falar com júnior ou com especialista?',
      answer:
        'Você fala com especialista sênior. A IA acelera execução e análise, mas a estratégia e a leitura de negócio continuam com direção humana.',
    },
  ],
  form: {
    title: 'Receba um diagnóstico inicial com foco em caixa',
    description:
      'Em poucos dados, mostramos onde está o maior gargalo de crescimento e qual ação priorizar para ganhar previsibilidade.',
    ctaLabel: 'Quero meu diagnóstico',
    flow: 'analise',
    serviceContext: 'Sobre - Jornada de escala previsivel',
    successMessage: 'Diagnóstico solicitado com sucesso. Vamos retornar com o próximo passo de maior impacto na sua operação.',
    includeMessage: true,
  },
  finalCtaBanner: {
    eyebrow: 'Chega de operar no escuro',
    title: 'Comece a escalar com inteligência e dados reais',
    description:
      'Se hoje você investe sem previsibilidade, o próximo passo é estruturar um sistema. Menos ruído operacional, mais clareza de receita.',
    primaryCta: { label: 'Agendar diagnóstico estratégico', href: '/a-neuroads/contato' },
    secondaryCta: { label: 'Conhecer o método completo', href: '/a-neuroads/nosso-metodo' },
  },
};

export default function Page() {
  return <StrategicContentPageShell data={content} />;
}
