import type { Metadata } from 'next';
import SubmenuPageShell, { type SubmenuPageContent } from '@/components/neuroads/SubmenuPageShell';

export const metadata: Metadata = {
  title: 'Visão Geral dos Agentes IA | NeuroAds',
  description:
    'Entenda como os Agentes IA da NeuroAds conectam Gestão de Tráfego, SEO + GEO e estratégias de relacionamento para gerar crescimento previsível.',
};

const content: SubmenuPageContent = {
  slug: 'agentes-visao-geral',
  eyebrow: 'Ecossistema de Agentes IA',
  headline: 'Agentes IA conectados',
  highlightedHeadline: 'para escala previsível',
  subheadline:
    'A NeuroAds orquestra agentes especializados em Gestão de Tráfego, SEO + GEO e relacionamento comercial para transformar sinais em decisões e decisões em receita.',
  serviceContext: 'Visão Geral dos Agentes',
  copyContract: {
    promise: 'Um sistema único para aquisição, posicionamento e relacionamento.',
    pain: 'Quando mídia, conteúdo e relacionamento operam separados, o empresário perde visibilidade do que realmente gera venda.',
    impactoFinanceiro:
      'Sem orquestração entre frentes, o custo por lead tende a subir, o CAC oscila e o caixa perde previsibilidade de entrada no mês.',
    prova:
      'Hoje, a NeuroAds opera 18 agentes proprietários conectando tráfego, SEO + GEO e CRM para acelerar decisões com dados reais.',
    metodo:
      'Mapeamos o estágio do funil, priorizamos agentes por impacto no caixa e implementamos uma rotina de otimização contínua com supervisão sênior.',
    cta: 'Solicite o diagnóstico e receba o plano de quais agentes ativar primeiro no seu cenário.',
  },
  painPoints: [
    'Gestão de tráfego sem aprendizado contínuo do pós-venda.',
    'Conteúdo sem estratégia de GEO para buscadores generativos.',
    'Relacionamento comercial reativo, sem cadência inteligente.',
    'Métricas espalhadas e pouca clareza sobre desperdício.',
  ],
  impactPoints: [
    'Maior custo de aquisição por falta de ajuste entre canais.',
    'Perda de oportunidades por baixa velocidade de resposta comercial.',
    'Queda de margem por decisões sem leitura consolidada de funil.',
    'Baixa previsibilidade de receita para planejar crescimento.',
  ],
  howItWorks: [
    'Gestão de Tráfego: agentes ajustam segmentação, criativos e budget com foco em CPL e ROAS.',
    'SEO + GEO: agentes estruturam conteúdo para Google e motores generativos, ampliando presença qualificada.',
    'Relacionamento e Posicionamento: agentes ativam follow-ups, qualificação e narrativa comercial por estágio.',
    'Camada de Inteligência: dashboards e alertas traduzem performance em impacto financeiro para decisão rápida.',
  ],
  proofMetrics: [
    {
      value: '5,2×',
      label: 'ROAS médio',
      detail: 'Retorno médio em contas com operação integrada entre tráfego e IA agêntica.',
    },
    {
      value: '-18,2%',
      label: 'CPL médio',
      detail: 'Queda no custo por lead com priorização de sinais de maior potencial comercial.',
    },
    {
      value: '6,42%',
      label: 'Conversão média',
      detail: 'Taxa média de conversão com otimização contínua do funil de aquisição a fechamento.',
    },
  ],
  agentExamples: [
    {
      name: 'Agente de Gestão de Tráfego',
      icon: '🎯',
      trigger: 'Oscilação de CPL e queda de qualidade dos leads em Google/Meta.',
      action: 'Recalibra público, distribuição de budget e variações criativas com base em dados reais.',
      result: 'Mais leads qualificados mantendo eficiência de investimento.',
      metric: 'Foco: CPL + ROAS',
    },
    {
      name: 'Agente de SEO + GEO',
      icon: '🔎',
      trigger: 'Baixa presença orgânica em buscas tradicionais e respostas de IA.',
      action: 'Organiza pauta, estrutura semântica e intenção de busca para Google, ChatGPT e Gemini.',
      result: 'Aumento de autoridade digital e geração recorrente de demanda qualificada.',
      metric: 'Foco: demanda orgânica',
    },
    {
      name: 'Agente de Relacionamento',
      icon: '🤝',
      trigger: 'Leads sem resposta e follow-up comercial inconsistente.',
      action: 'Dispara cadências inteligentes por etapa do funil e prioriza oportunidades quentes.',
      result: 'Redução de perdas no meio do funil e aumento da taxa de avanço para proposta.',
      metric: 'Foco: taxa de avanço',
    },
    {
      name: 'Agente de Posicionamento',
      icon: '📍',
      trigger: 'Mensagem comercial genérica e baixa diferenciação no mercado.',
      action: 'Ajusta propostas de valor por segmento e reforça o DNA da marca em pontos críticos da jornada.',
      result: 'Percepção de valor mais clara e maior consistência no discurso de venda.',
      metric: 'Foco: conversão qualificada',
    },
  ],
  faq: [
    {
      question: 'Preciso ativar todos os agentes de uma vez?',
      answer:
        'Não. A ativação é feita por prioridade de impacto financeiro. Começamos pelo que reduz desperdício agora e cria base para escalar com segurança.',
    },
    {
      question: 'Isso funciona para qualquer segmento de PME?',
      answer:
        'A lógica é adaptável. O que muda é a ordem de implantação, considerando ticket médio, ciclo comercial, maturidade de dados e metas de caixa.',
    },
    {
      question: 'Quem supervisiona as decisões dos agentes IA?',
      answer:
        'O direcionamento continua humano. A equipe sênior da NeuroAds supervisiona estratégia, governança e priorização das ações dos agentes.',
    },
    {
      question: 'Qual a vantagem prática de integrar tráfego, GEO e relacionamento?',
      answer:
        'Você reduz retrabalho entre áreas, acelera resposta ao mercado e melhora previsibilidade de receita sem depender de decisões por achismo.',
    },
  ],
  relatedPages: [
    {
      label: 'Gestão de Tráfego',
      href: '/servicos/gestao-de-trafego-google-meta',
      description: 'Entenda como a operação de mídia é conectada ao restante do ecossistema.',
    },
    {
      label: 'SEO + GEO',
      href: '/servicos/seo-geo',
      description: 'Veja como posicionar sua marca para Google e buscadores generativos.',
    },
    {
      label: 'Estratégia de Funil de Conversão',
      href: '/servicos/estrategia-de-funil-e-conversao',
      description: 'Organize aquisição, qualificação e fechamento com critérios financeiros.',
    },
    {
      label: 'Agentes de Aquisição',
      href: '/agentes-ia/agentes-de-aquisicao',
      description: 'Frente para atrair público qualificado com menor custo.',
    },
  ],
  media: {
    title: 'Mapa do ecossistema de agentes',
    poster: '/images/tools/agentes-visao-geral-hero-ultrarealista-v2.png',
  },
};

export default function Page() {
  return <SubmenuPageShell content={content} />;
}

