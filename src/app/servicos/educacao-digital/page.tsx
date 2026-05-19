import type { Metadata } from 'next';
import SubmenuPageShell, {
  type SubmenuPageContent,
  type AgentExample,
} from '@/components/neuroads/SubmenuPageShell';

export const metadata: Metadata = {
  title: 'Educação Digital | NeuroAds',
  description:
    'Página de captura para negócios de educação digital que querem escalar matrículas com previsibilidade e otimização contínua do funil.',
};

const agentExamples: AgentExample[] = [
  {
    name: 'Agente de Captação Contínua',
    icon: '🎓',
    trigger:
      'Potencial aluno pesquisa pelo tema do curso, dor relacionada ou solução que o produto resolve',
    action:
      'Garante presença nos resultados de busca, redes sociais e respostas de IA (GEO) com conteúdo que posiciona a oferta como solução ideal',
    result:
      'Geração de demanda ativa entre lançamentos — matrículas acontecendo sem dependência de picos promocionais',
    metric: '↑ 58% matrículas contínuas',
  },
  {
    name: 'Agente de Nutrição de Decisão',
    icon: '💡',
    trigger: 'Lead capturado que ainda não se matriculou após 7 dias de captura',
    action:
      'Conduz a jornada de decisão com conteúdo progressivo calibrado por etapa: consciência → interesse → avaliação → decisão',
    result:
      'Mais matrículas geradas da mesma base de leads existente — sem aumentar investimento em aquisição',
    metric: '↑ 71% conversão de leads',
  },
  {
    name: 'Agente de Gestão de CAC',
    icon: '📉',
    trigger:
      'Aumento de custo por lead acima do benchmark definido detectado em campanha ou canal',
    action:
      'Analisa criativos, segmentação e copy com menor performance e realoca verba automaticamente para combinações com melhor retorno por matrícula',
    result:
      'CAC mantido controlado mesmo em escala de investimento — crescimento sem degradação de margem',
    metric: '↓ 39% CAC',
  },
  {
    name: 'Agente de Retenção e Upgrade',
    icon: '🔄',
    trigger:
      'Aluno ativo que concluiu módulo, atingiu milestone ou está próximo do fim do curso',
    action:
      'Identifica o momento ideal para oferta de upgrade, curso avançado ou certificação com base no engajamento real do aluno',
    result:
      'Receita por aluno aumenta sem custo adicional de aquisição — base existente gerando crescimento incremental',
    metric: '↑ 2.4× receita/aluno',
  },
];

const content: SubmenuPageContent = {
  slug: 'servicos-educacao-digital',
  eyebrow: 'Soluções por segmento',
  headline: 'Educação Digital com',
  highlightedHeadline: 'crescimento previsível',
  subheadline:
    'Lançamento pontual não sustenta negócio no longo prazo. A NeuroAds estrutura um sistema de aquisição e conversão para gerar matrículas com consistência — dentro e fora das janelas de lançamento.',
  serviceContext: 'Educação Digital',
  agentExamples,
  copyContract: {
    promise: 'Mais matrículas qualificadas com controle de CAC e previsibilidade real de receita mensal.',
    pain: 'A operação depende de picos de campanha, e o funil esfria entre lançamentos — criando ciclos de estresse financeiro recorrente.',
    impactoFinanceiro:
      'Sem rotina contínua de geração e nutrição, o custo por matrícula sobe e o caixa fica refém de janelas curtas de venda com cada vez menos margem.',
    prova:
      'Unimos tráfego, conteúdo e automação para criar jornada de decisão mais eficiente, com foco em conversão contínua e retenção de valor por aluno.',
    metodo:
      'Mapeamos oferta, funil e objeções, implantamos agentes IA para acelerar execução e acompanhamos o desempenho com indicadores financeiros reais.',
    cta: 'Solicite seu diagnóstico de educação digital e receba os próximos ajustes para escalar matrículas.',
  },
  painPoints: [
    'Dependência de lançamentos para gerar faturamento — caixa sobe e desce com cada campanha.',
    'Baixa conversão entre lead captado e matrícula efetiva no produto.',
    'CAC crescente em campanhas de aquisição sem melhora de qualidade.',
    'Falta de integração entre mídia, conteúdo e processo comercial.',
  ],
  impactPoints: [
    'Receita imprevisível e pressão constante sobre fluxo de caixa.',
    'Menor aproveitamento da audiência e base já construída.',
    'Escala travada por funil inconsistente e operação dependente de pico.',
    'Redução da margem por ineficiência de aquisição e sem retenção estruturada.',
  ],
  howItWorks: [
    'Diagnóstico completo do funil — da captação até a matrícula efetiva.',
    'Estratégia de aquisição contínua com Google + Meta + SEO/GEO integrados.',
    'Otimização de páginas, mensagens e fluxos de conversão por etapa da jornada.',
    'Monitoramento executivo com foco em CAC, taxa de conversão e receita recorrente.',
  ],
  proofMetrics: [
    {
      value: '↑ 58%',
      label: 'Matrículas fora do lançamento',
      detail: 'Crescimento de matrículas contínuas sem depender de janelas de campanha',
    },
    {
      value: '↓ 39%',
      label: 'CAC médio',
      detail: 'Redução no custo de aquisição por matrícula após estruturação do funil',
    },
    {
      value: '↑ 73%',
      label: 'Previsibilidade de receita',
      detail: 'Negócios com modelo de receita recorrente previsível após 90 dias de operação',
    },
  ],
  faq: [
    {
      question: 'Funciona para cursos de ticket menor e maior?',
      answer:
        'Sim. A estrutura muda conforme ciclo de decisão, proposta de valor e meta de crescimento da operação — adaptamos o sistema ao seu modelo.',
    },
    {
      question: 'É só para lançamentos ou também para produto perpétuo?',
      answer:
        'Atuamos nos dois modelos. O objetivo é construir um sistema que gere demanda previsível — não depender de picos isolados para sobreviver.',
    },
    {
      question: 'Como a IA entra nesse processo?',
      answer:
        'Os agentes IA acceleram análise, nutrição de leads e execução de otimizações. A equipe sênior da NeuroAds faz a supervisão estratégica para manter qualidade de decisão.',
    },
    {
      question: 'Qual o primeiro passo?',
      answer:
        'Um diagnóstico sem compromisso para identificar os maiores gargalos de aquisição e conversão com impacto direto no caixa — entregue em até 48 h.',
    },
  ],
  relatedPages: [
    {
      label: 'SEO + GEO',
      href: '/servicos/seo-geo',
      description: 'Aumente presença em busca ativa e motores generativos.',
    },
    {
      label: 'E-commerce & Varejo',
      href: '/servicos/e-commerce-varejo',
      description: 'Veja o mesmo sistema aplicado em escala de vendas online.',
    },
    {
      label: 'Implantação de Agentes IA',
      href: '/servicos/implantacao-de-agentes-ia',
      description: 'Entenda a camada de automação aplicada na operação.',
    },
    {
      label: 'Além do Algoritmo',
      href: '/conteudos/alem-do-algoritmo',
      description: 'Conteúdos estratégicos para fortalecer seu ecossistema.',
    },
  ],
  media: {
    title: 'Escala de matrículas com previsibilidade',
    poster: '/images/tools/servico-funil-conversao-hero-ultrarealista-v2.png',
  },
};

export default function Page() {
  return <SubmenuPageShell content={content} />;
}
