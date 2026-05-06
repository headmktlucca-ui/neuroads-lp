import type { Metadata } from 'next';
import SubmenuPageShell, { type SubmenuPageContent } from '@/components/neuroads/SubmenuPageShell';

export const metadata: Metadata = {
  title: 'FAQ NeuroAds | Dúvidas Frequentes',
  description:
    'FAQ da NeuroAds com respostas objetivas sobre prazo, risco, custo e operação. Entenda como escalar com dados reais e previsibilidade.',
};

const content: SubmenuPageContent = {
  slug: 'conteudos-faq',
  eyebrow: 'Conteúdos NeuroAds',
  headline: 'Dúvidas reais de PMEs,',
  highlightedHeadline: 'respostas objetivas',
  subheadline:
    'Reunimos as perguntas mais comuns de empresários que querem previsibilidade em marketing e vendas sem promessas vagas.',
  serviceContext: 'FAQ',
  copyContract: {
    promise: 'Clareza para decidir com segurança e sem ruído.',
    pain: 'A principal trava na contratação de marketing é insegurança: custo, prazo, risco e falta de transparência em resultado real.',
    impactoFinanceiro:
      'Quando a decisão atrasa por falta de clareza, a empresa segue desperdiçando verba e perde oportunidades que poderiam entrar no caixa.',
    prova:
      'Respondemos com base em operação real, métricas financeiras e método aplicado em PMEs, sem promessas de resultado garantido.',
    metodo:
      'Você traz o contexto da sua operação e estruturamos um diagnóstico inicial para separar o que é prioridade de curto prazo e o que é escala.',
    cta: 'Se sua dúvida for específica, solicite diagnóstico e receba direcionamento direto para o seu cenário.',
  },
  painPoints: [
    'Receio de investir e não ter retorno claro.',
    'Desconfiança de relatórios difíceis de entender.',
    'Dúvida sobre nível técnico de quem vai operar a conta.',
    'Incerteza sobre prazo para gerar ganho consistente.',
  ],
  impactPoints: [
    'Procrastinação de decisões importantes para crescer.',
    'Manutenção de custos ineficientes por falta de direção.',
    'Baixa integração entre marketing e metas de faturamento.',
    'Maior risco de repetir ciclos de tentativa e erro.',
  ],
  howItWorks: [
    'Leitura rápida da sua operação atual e gargalos principais.',
    'Esclarecimento de risco, esforço e expectativa de resultado.',
    'Plano de ação inicial com prioridade de impacto no caixa.',
    'Acompanhamento por especialista com linguagem objetiva.',
  ],
  proofMetrics: [],
  faq: [
    {
      question: 'Vocês garantem resultado?',
      answer:
        'Não fazemos promessa vazia. Trabalhamos com diagnóstico, método, execução e melhoria contínua para aumentar previsibilidade e retorno.',
    },
    {
      question: 'Quem conduz a operação do meu projeto?',
      answer:
        'Você fala com especialista sênior e tem acompanhamento estratégico direto, sem repasse para operação júnior sem contexto.',
    },
    {
      question: 'Em quanto tempo consigo medir evolução?',
      answer:
        'Depende do estágio da operação, mas ganhos de eficiência tendem a aparecer primeiro. O foco é evoluir indicadores que impactam receita e margem.',
    },
    {
      question: 'IA funciona para PME de faturamento médio?',
      answer:
        'Sim. Para PME, IA bem aplicada simplifica operação e aumenta velocidade de decisão, desde que exista supervisão e método.',
    },
  ],
  relatedPages: [
    {
      label: 'Contato',
      href: '/a-neuroads/contato',
      description: 'Envie sua dúvida com contexto e receba orientação inicial.',
    },
    {
      label: 'Gestão de Tráfego (Google + Meta)',
      href: '/servicos/gestao-de-trafego-google-meta',
      description: 'Veja como estruturamos mídia para previsibilidade de aquisição.',
    },
    {
      label: 'Implantação de Agentes IA',
      href: '/servicos/implantacao-de-agentes-ia',
      description: 'Entenda como aplicar IA comercial sem complexidade desnecessária.',
    },
    {
      label: 'Nosso Método',
      href: '/a-neuroads/nosso-metodo',
      description: 'Conheça o processo de diagnóstico, execução e escala.',
    },
  ],
  media: {
    title: 'FAQ com foco em decisão',
    poster: '/images/tools/concorrentes.png',
    desktopVideo: '/videos/fundovideo.mp4',
    mobileVideo: '/videos/fundovideo.mp4',
  },
};

export default function Page() {
  return <SubmenuPageShell content={content} />;
}

