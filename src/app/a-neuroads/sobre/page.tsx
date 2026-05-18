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
  title: 'Não vendemos campanhas.',
  highlightedTitle: 'Construímos sistemas de crescimento previsível.',
  subtitle:
    'A NeuroAds foi criada para PMEs que cansaram de investir sem clareza de retorno real. Aqui, estratégia, dados e execução funcionam no mesmo ecossistema para transformar marketing em receita previsível.',
  primaryCta: { label: 'Falar com especialista', href: '/a-neuroads/contato' },
  secondaryCta: { label: 'Conhecer nosso método', href: '/a-neuroads/nosso-metodo' },
  highlights: [
    { title: '25+ anos em growth', description: 'Experiência prática para decisões sem achismo.', icon: 'goal' },
    { title: 'R$ 10M+ gerenciados', description: 'Operação orientada a margem e previsibilidade.', icon: 'gauge' },
    { title: 'Ecossistema completo', description: 'Tráfego, SEO + GEO e IA agêntica em uma só estratégia.', icon: 'layers' },
    { title: 'Acesso sênior', description: 'Você fala com especialista, não com atendimento genérico.', icon: 'handshake' },
  ],
  sections: [
    {
      title: 'O problema que resolvemos',
      description:
        'A maioria das PMEs não precisa de mais ferramenta. Precisa de direção clara para saber onde o dinheiro está vazando e como escalar com segurança.',
      bullets: [
        'Relatórios que parecem bons, mas não explicam por que as vendas não batem.',
        'Canais e equipe comercial sem integração de dados e prioridade.',
        'Investimento mensal sem previsibilidade de retorno.',
        'Decisões operacionais lentas por falta de leitura financeira.',
      ],
    },
    {
      title: 'Como a NeuroAds atua',
      description:
        'Aplicamos uma operação de performance com governança. Cada ação precisa mostrar impacto no caixa: reduzir custo ineficiente, elevar conversão e proteger margem.',
      bullets: [
        'Diagnóstico da operação atual com foco em gargalos de receita.',
        'Plano de execução com prioridades de curto e médio prazo.',
        'Implantação de IA agêntica com supervisão humana estratégica.',
        'Ajustes recorrentes orientados por dados reais do negócio.',
      ],
    },
  ],
  process: [
    { title: 'Diagnóstico', detail: 'Mapeamos onde o sistema atual perde eficiência e margem.' },
    { title: 'Direção', detail: 'Definimos o plano com metas financeiras claras por etapa.' },
    { title: 'Execução', detail: 'Operamos mídia, conteúdo e IA com ritos de controle.' },
    { title: 'Escala', detail: 'Ajustamos continuamente para crescimento previsível.' },
  ],
  resources: [
    {
      title: 'Nosso Método',
      description: 'Veja o processo completo da NeuroAds para previsibilidade comercial.',
      href: '/a-neuroads/nosso-metodo',
    },
    {
      title: 'FAQ NeuroAds',
      description: 'Respostas objetivas sobre risco, investimento e execução.',
      href: '/conteudos/faq',
    },
    {
      title: 'Agentes IA',
      description: 'Entenda como os agentes apoiam aquisição, conversão e operação.',
      href: '/agentes-ia/visao-geral-dos-agentes',
    },
  ],
  faq: [
    {
      question: 'A NeuroAds atende somente empresas grandes?',
      answer: 'Não. O foco principal é PME entre R$ 30 mil e R$ 200 mil/mês que quer escala previsível sem depender de sorte.',
    },
    {
      question: 'Qual diferença da NeuroAds para uma agência tradicional?',
      answer:
        'Não trabalhamos por canal isolado. Construímos um sistema integrado com leitura financeira para cada decisão de marketing.',
    },
    {
      question: 'A IA substitui a estratégia humana?',
      answer: 'Não. A IA acelera execução e análise. A decisão estratégica continua com especialista por trás da operação.',
    },
  ],
  form: {
    title: 'Receba um diagnóstico inicial da sua operação',
    description: 'Em poucos dados, mapeamos o ponto de maior impacto no seu caixa e sugerimos o próximo passo estratégico.',
    ctaLabel: 'Solicitar diagnóstico',
    flow: 'analise',
    serviceContext: 'Sobre - Diagnóstico inicial',
    successMessage: 'Diagnóstico solicitado com sucesso. Nossa equipe vai seguir com os próximos passos.',
    includeMessage: true,
  },
};

export default function Page() {
  return <StrategicContentPageShell data={content} />;
}

