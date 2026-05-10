import type { Metadata } from 'next';
import SubmenuPageShell, { type SubmenuPageContent } from '@/components/neuroads/SubmenuPageShell';

export const metadata: Metadata = {
  title: 'Gestão de Tráfego (Google + Meta) | NeuroAds',
  description:
    'Gestão de tráfego orientada a receita para PMEs: previsibilidade de aquisição, controle de verba e decisões em dados reais com NeuroAds.',
};

const content: SubmenuPageContent = {
  slug: 'servicos-gestao-de-trafego-google-meta',
  eyebrow: 'Serviços NeuroAds',
  headline: 'Gestão de Tráfego com',
  highlightedHeadline: 'controle de caixa',
  subheadline:
    'Não é sobre subir campanha. É sobre transformar investimento em mídia em previsibilidade comercial, com governança diária de CPL, CAC e ROAS.',
  serviceContext: 'Gestão de Tráfego (Google + Meta)',
  copyContract: {
    promise: 'Previsibilidade de aquisição sem depender de achismo.',
    pain: 'Campanhas parecem ativas, mas o empresário não enxerga com clareza o que realmente gera venda e o que só consome verba.',
    impactoFinanceiro:
      'Sem controle fino de segmentação, criativo e orçamento, o custo por lead sobe, o CAC pressiona margem e o caixa perde eficiência mês após mês.',
    prova:
      'Operação com leitura de sinal diário, testes controlados e ajuste de verba por retorno real. Indicador técnico só entra quando vira decisão de dinheiro.',
    metodo:
      'Começamos com diagnóstico do histórico, redesenhamos estrutura por intenção de compra e operamos ciclos de otimização com prioridade nas alavancas de maior impacto em receita.',
    cta: 'Solicite um diagnóstico de tráfego e receba os próximos ajustes prioritários para sua operação.',
  },
  painPoints: [
    'Verba pulverizada em campanhas sem prioridade comercial.',
    'CPL oscilando sem diagnóstico claro de causa.',
    'Decisão baseada em sensação, não em sinais de conversão.',
    'Time comercial recebendo lead com baixa aderência.',
  ],
  impactPoints: [
    'Aumento progressivo de CAC e redução da margem por venda.',
    'Perda de competitividade em leilões relevantes.',
    'Dependência de “mês bom” em vez de rotina previsível.',
    'Baixa confiança para escalar investimento com segurança.',
  ],
  howItWorks: [
    'Leitura de conta e mapeamento de desperdícios em Google + Meta.',
    'Plano de estrutura com foco em intenção de compra e estágio do funil.',
    'Rotina de otimização com testes de criativo, audiência e orçamento.',
    'Painel executivo traduzindo mídia em impacto no caixa.',
  ],
  proofMetrics: [],
  faq: [
    {
      question: 'Em quanto tempo dá para perceber melhora no tráfego?',
      answer:
        'Os primeiros ganhos operacionais costumam aparecer nas primeiras semanas com cortes de desperdício e ajuste de estrutura. Ganhos comerciais consistentes dependem da oferta e do ciclo de venda da empresa.',
    },
    {
      question: 'Vocês cuidam de Google e Meta ao mesmo tempo?',
      answer:
        'Sim. A gestão é integrada para evitar leitura isolada de canal. O objetivo é alocar verba onde o retorno financeiro está mais eficiente em cada momento.',
    },
    {
      question: 'Como vocês evitam que o custo por lead suba com escala?',
      answer:
        'Com governança de criativo, segmentação e frequência, além de redistribuição de orçamento baseada em sinais reais de conversão e não só em volume de clique.',
    },
    {
      question: 'Qual a diferença para uma gestão tradicional de mídia?',
      answer:
        'A diferença está no sistema: diagnóstico recorrente, execução com IA agêntica e leitura financeira contínua. Não entregamos relatório bonito; entregamos decisão de caixa.',
    },
  ],
  relatedPages: [
    {
      label: 'Estratégia de Funil e Conversão',
      href: '/servicos/estrategia-de-funil-e-conversao',
      description: 'Conecte tráfego com qualificação e fechamento para reduzir vazamento comercial.',
    },
    {
      label: 'Agentes de Aquisição',
      href: '/agentes-ia/agentes-de-aquisicao',
      description: 'Veja como os agentes reduzem custo e elevam qualidade do lead.',
    },
    {
      label: 'SEO + GEO',
      href: '/servicos/seo-geo',
      description: 'Integre mídia paga com presença orgânica e motores generativos.',
    },
    {
      label: 'Contato',
      href: '/a-neuroads/contato',
      description: 'Solicite um diagnóstico inicial com contexto da sua operação atual.',
    },
  ],
  media: {
    title: 'Controle de tráfego e orçamento',
    poster: '/images/tools/gestao-trafego-controle-caixa-hero-ultrarealista-v2.png',
  },
};

export default function Page() {
  return <SubmenuPageShell content={content} />;
}

