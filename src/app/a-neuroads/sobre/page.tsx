import type { Metadata } from 'next';
import SubmenuPageShell, { type SubmenuPageContent } from '@/components/neuroads/SubmenuPageShell';

export const metadata: Metadata = {
  title: 'Sobre a NeuroAds | Growth com IA Agêntica',
  description:
    'Conheça a NeuroAds: posicionamento, experiência e método para construir sistemas de marketing que geram resultado enquanto o empresário foca no negócio.',
};

const content: SubmenuPageContent = {
  slug: 'a-neuroads-sobre',
  eyebrow: 'A NeuroAds',
  headline: 'Não vendemos campanhas.',
  highlightedHeadline: 'Construímos sistema.',
  subheadline:
    'A NeuroAds nasceu para resolver uma dor recorrente de PMEs: investir em marketing sem clareza de resultado financeiro real. Nosso foco é previsibilidade com dados e execução.',
  serviceContext: 'Sobre a NeuroAds',
  copyContract: {
    promise: 'Estratégia, execução e IA no mesmo sistema de crescimento.',
    pain: 'Empresários chegam à NeuroAds após frustração com operações desconectadas: agência, tecnologia e comercial sem conversa entre si.',
    impactoFinanceiro:
      'Sem integração, o investimento mensal vira custo incerto. O caixa sente primeiro quando não existe governança de aquisição e conversão.',
    prova:
      'Com 25+ anos de experiência em growth e R$ 10M+ gerenciados, estruturamos operações com indicadores financeiros e supervisão sênior direta.',
    metodo:
      'Diagnóstico profundo, definição de prioridades e execução contínua orientada por dados reais para gerar crescimento previsível com menor desperdício.',
    cta: 'Solicite um diagnóstico e veja como aplicar esse sistema no seu cenário atual.',
  },
  painPoints: [
    'Marketing tratado como ação isolada, não como sistema.',
    'Relatórios que não respondem a pergunta principal: “isso vende?”.',
    'Falta de direção clara para equipe comercial e operação.',
    'Baixa confiança para escalar investimento com segurança.',
  ],
  impactPoints: [
    'Crescimento irregular e dependente de “mês bom”.',
    'Desperdício de verba por decisões sem base sólida.',
    'Dificuldade para manter margem em escala.',
    'Maior pressão de caixa em períodos de oscilação.',
  ],
  howItWorks: [
    'Entendimento estratégico do contexto comercial da empresa.',
    'Mapeamento de gargalos de aquisição, conversão e dados.',
    'Implantação de operação com IA agêntica e governança humana.',
    'Ajuste contínuo com foco em previsibilidade de receita.',
  ],
  proofMetrics: [],
  faq: [
    {
      question: 'A NeuroAds atende apenas empresas grandes?',
      answer:
        'Não. Nossa especialidade é PME em crescimento que precisa sair do ciclo de tentativa e erro e construir previsibilidade comercial.',
    },
    {
      question: 'Qual é o diferencial da NeuroAds frente a agências comuns?',
      answer:
        'Integração real entre tráfego, SEO + GEO, conversão e agentes IA, com leitura de resultado em dinheiro e não só em métricas de vaidade.',
    },
    {
      question: 'Vocês trabalham com acompanhamento próximo?',
      answer:
        'Sim. O modelo é consultivo-operacional, com acesso a especialista e rotina de decisões práticas conforme evolução da operação.',
    },
    {
      question: 'A IA substitui estratégia humana no processo?',
      answer:
        'Não. A IA acelera análise e execução. A estratégia, priorização e direção de negócio permanecem sob liderança especializada.',
    },
  ],
  relatedPages: [
    {
      label: 'Nosso Método',
      href: '/a-neuroads/nosso-metodo',
      description: 'Veja o processo completo de diagnóstico, execução e escala.',
    },
    {
      label: 'Contato',
      href: '/a-neuroads/contato',
      description: 'Fale com a equipe para avaliar aderência ao seu momento.',
    },
    {
      label: 'Visão Geral dos Agentes',
      href: '/agentes-ia/visao-geral-dos-agentes',
      description: 'Entenda como o ecossistema IA opera no dia a dia.',
    },
    {
      label: 'FAQ',
      href: '/conteudos/faq',
      description: 'Tire dúvidas sobre prazo, risco e previsibilidade.',
    },
  ],
  media: {
    title: 'Sobre a NeuroAds',
    poster: '/images/especialista-sobre.jpg',
    desktopVideo: '/videos/fundovideo.mp4',
    mobileVideo: '/videos/fundovideo.mp4',
  },
};

export default function Page() {
  return <SubmenuPageShell content={content} />;
}

