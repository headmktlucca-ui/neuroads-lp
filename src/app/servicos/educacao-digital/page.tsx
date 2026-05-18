import type { Metadata } from 'next';
import SubmenuPageShell, { type SubmenuPageContent } from '@/components/neuroads/SubmenuPageShell';

export const metadata: Metadata = {
  title: 'Educação Digital | NeuroAds',
  description:
    'Página de captura para negócios de educação digital que querem escalar matrículas com previsibilidade e otimização contínua do funil.',
};

const content: SubmenuPageContent = {
  slug: 'servicos-educacao-digital',
  eyebrow: 'Soluções por segmento',
  headline: 'Educação Digital com',
  highlightedHeadline: 'crescimento previsível',
  subheadline:
    'Lançamento pontual não sustenta negócio no longo prazo. A NeuroAds estrutura um sistema de aquisição e conversão para gerar matrículas com consistência.',
  serviceContext: 'Educação Digital',
  copyContract: {
    promise: 'Mais matrículas qualificadas com controle de CAC e melhor previsibilidade de receita.',
    pain: 'A operação depende de picos de campanha, e o funil esfria entre lançamentos.',
    impactoFinanceiro:
      'Sem rotina contínua de geração e nutrição, o custo por matrícula sobe e o caixa fica refém de janelas curtas de venda.',
    prova:
      'Unimos tráfego, conteúdo e automação para criar jornada de decisão mais eficiente, com foco em conversão e retenção de valor.',
    metodo:
      'Mapeamos oferta, funil e objeções, implantamos IA agêntica para acelerar execução e acompanhamos o desempenho com indicadores financeiros.',
    cta: 'Solicite seu diagnóstico de educação digital e receba os próximos ajustes para escalar matrículas.',
  },
  painPoints: [
    'Dependência de lançamentos para gerar faturamento.',
    'Baixa conversão entre lead e matrícula efetiva.',
    'CAC crescente em campanhas de aquisição.',
    'Falta de integração entre mídia, conteúdo e comercial.',
  ],
  impactPoints: [
    'Receita imprevisível e pressão sobre fluxo de caixa.',
    'Menor aproveitamento de audiência construída.',
    'Escala travada por funil inconsistente.',
    'Redução da margem por ineficiência de aquisição.',
  ],
  howItWorks: [
    'Diagnóstico do funil de captação até matrícula.',
    'Estratégia de aquisição contínua com Google + Meta + GEO.',
    'Otimização de páginas, mensagens e rotinas de conversão.',
    'Monitoramento executivo com foco em CAC, conversão e receita.',
  ],
  proofMetrics: [],
  faq: [
    {
      question: 'Funciona para cursos de ticket menor e maior?',
      answer:
        'Sim. A estrutura muda conforme ciclo de decisão, proposta de valor e meta de crescimento da operação.',
    },
    {
      question: 'É só para lançamentos ou também perpétuo?',
      answer:
        'Atuamos nos dois modelos. O objetivo é construir um sistema que gere demanda previsível, não depender de picos isolados.',
    },
    {
      question: 'Como a IA entra nesse processo?',
      answer:
        'A IA agêntica acelera análise, recomendação e execução. Claudio e equipe sênior fazem a supervisão estratégica para manter qualidade de decisão.',
    },
    {
      question: 'Qual o primeiro passo?',
      answer:
        'Um diagnóstico sem compromisso para identificar gargalos de aquisição e conversão com impacto direto no caixa.',
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
