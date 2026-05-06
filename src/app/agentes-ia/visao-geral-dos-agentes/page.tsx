import type { Metadata } from 'next';
import SubmenuPageShell, { type SubmenuPageContent } from '@/components/neuroads/SubmenuPageShell';

export const metadata: Metadata = {
  title: 'Visão Geral dos Agentes IA | NeuroAds',
  description:
    'Conheça o ecossistema de agentes IA da NeuroAds e como cada frente de aquisição, conversão e dados impacta receita e previsibilidade.',
};

const content: SubmenuPageContent = {
  slug: 'agentes-visao-geral',
  eyebrow: 'Ecossistema de Agentes IA',
  headline: 'Um ecossistema que opera',
  highlightedHeadline: 'em fluxo contínuo',
  subheadline:
    'Nossos agentes não funcionam isolados. Eles atuam em cadeia: atração qualificada, avanço de conversão e inteligência de dados para escalar com consistência.',
  serviceContext: 'Visão Geral dos Agentes',
  copyContract: {
    promise: 'Agentes integrados para escalar sem perder controle.',
    pain: 'Empresas adotam ferramentas soltas e perdem clareza de prioridade. O resultado é esforço alto e pouca previsibilidade.',
    impactoFinanceiro:
      'Sem integração entre aquisição, conversão e inteligência, o custo operacional aumenta e o retorno comercial fica irregular.',
    prova:
      'A estrutura da NeuroAds conecta 18 agentes proprietários em frentes complementares, com leitura contínua de desempenho financeiro.',
    metodo:
      'Classificamos agentes por função no funil, definimos handoff entre etapas e monitoramos desempenho em ciclos de melhoria contínua.',
    cta: 'Solicite o diagnóstico e receba o mapa de quais agentes priorizar na sua operação.',
  },
  painPoints: [
    'Excesso de ferramentas sem integração prática.',
    'Decisões lentas por falta de visão consolidada.',
    'Time atuando no urgente, não no estratégico.',
    'Dificuldade para saber onde escalar primeiro.',
  ],
  impactPoints: [
    'Aumento de custos sem ganho proporcional de receita.',
    'Maior risco de erro operacional em decisões críticas.',
    'Baixa previsibilidade de performance por trimestre.',
    'Menor capacidade de reação frente à concorrência.',
  ],
  howItWorks: [
    'Mapeamento do estágio atual de maturidade da operação.',
    'Definição de agentes por prioridade de caixa e crescimento.',
    'Integração entre aquisição, conversão e dados em rotina única.',
    'Acompanhamento com métricas traduzidas para impacto financeiro.',
  ],
  proofMetrics: [],
  faq: [
    {
      question: 'Preciso implantar todos os agentes de uma vez?',
      answer:
        'Não. A implantação é faseada por impacto financeiro. Começamos pelos agentes que reduzem desperdício e aceleram resultado mais rápido.',
    },
    {
      question: 'Os agentes funcionam para qualquer segmento?',
      answer:
        'A lógica é adaptável, mas a priorização muda conforme estágio, ticket, ciclo de venda e canais ativos da empresa.',
    },
    {
      question: 'Quem supervisiona as decisões dos agentes?',
      answer:
        'A equipe sênior da NeuroAds supervisiona estratégia e governança. A IA acelera execução, mas o direcionamento continua humano.',
    },
    {
      question: 'Qual a principal vantagem de um ecossistema integrado?',
      answer:
        'Reduzir fricção entre times e transformar dados em ação coordenada. Isso melhora previsibilidade e protege margem ao escalar.',
    },
  ],
  relatedPages: [
    {
      label: 'Agentes de Aquisição',
      href: '/agentes-ia/agentes-de-aquisicao',
      description: 'Frente para atrair público qualificado com menor custo.',
    },
    {
      label: 'Agentes de Conversão',
      href: '/agentes-ia/agentes-de-conversao',
      description: 'Frente para transformar demanda em vendas consistentes.',
    },
    {
      label: 'Agentes de Inteligência de Dados',
      href: '/agentes-ia/agentes-de-inteligencia-de-dados',
      description: 'Frente para decisões orientadas a sinal e caixa.',
    },
    {
      label: 'Implantação de Agentes IA',
      href: '/servicos/implantacao-de-agentes-ia',
      description: 'Veja como colocar os agentes em produção com governança.',
    },
  ],
  media: {
    title: 'Mapa do ecossistema de agentes',
    poster: '/images/template-match/process/process-step-02-ia-em-acao-v1.png',
    desktopVideo: '/videos/fundovideo.mp4',
    mobileVideo: '/videos/fundovideo.mp4',
  },
};

export default function Page() {
  return <SubmenuPageShell content={content} />;
}

