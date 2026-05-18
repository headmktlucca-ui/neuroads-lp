import type { Metadata } from 'next';
import SubmenuPageShell, { type SubmenuPageContent } from '@/components/neuroads/SubmenuPageShell';

export const metadata: Metadata = {
  title: 'Mercado Imobiliário | NeuroAds',
  description:
    'Página de captura para imobiliárias e incorporadoras que precisam transformar mídia em visitas, propostas e vendas com previsibilidade.',
};

const content: SubmenuPageContent = {
  slug: 'servicos-mercado-imobiliario',
  eyebrow: 'Soluções por segmento',
  headline: 'Mercado Imobiliário com',
  highlightedHeadline: 'escala previsível',
  subheadline:
    'Se o seu time depende de plantão cheio para fechar, existe desperdício no funil. A NeuroAds estrutura um sistema para transformar busca ativa em visitas qualificadas e proposta na mesa.',
  serviceContext: 'Mercado Imobiliário',
  copyContract: {
    promise: 'Mais visitas qualificadas e mais propostas com controle real do custo por oportunidade.',
    pain: 'Muitas imobiliárias anunciam, mas não sabem quais campanhas geram visita com potencial real de fechamento.',
    impactoFinanceiro:
      'Quando o lead chega sem perfil ou no timing errado, o corretor perde produtividade e o custo comercial sobe sem retorno proporcional.',
    prova:
      'Organizamos tráfego, qualificação e cadência comercial com dados reais, priorizando bairros, tipologias e faixas de ticket com maior chance de conversão.',
    metodo:
      'Mapeamos histórico de mídia, jornada de contato e gargalos de atendimento para ativar um ecossistema de aquisição + qualificação + acompanhamento de proposta.',
    cta: 'Solicite seu diagnóstico imobiliário e receba um plano prático para aumentar visitas qualificadas.',
  },
  painPoints: [
    'Leads curiosos consumindo tempo da equipe de corretores.',
    'Campanhas sem segmentação por perfil e potencial de compra.',
    'Baixa previsibilidade entre lead gerado e visita agendada.',
    'Dificuldade para escalar verba com segurança.',
  ],
  impactPoints: [
    'Custo por oportunidade qualificada elevado.',
    'Pipeline comercial com baixa taxa de avanço.',
    'Perda de margem por ineficiência operacional.',
    'Crescimento travado por falta de sistema previsível.',
  ],
  howItWorks: [
    'Diagnóstico de origem de leads e qualidade de atendimento por canal.',
    'Estrutura de campanhas por intenção de compra e região.',
    'Rotina de otimização com foco em visita, proposta e venda.',
    'Painel executivo traduzindo performance para impacto no caixa.',
  ],
  proofMetrics: [],
  faq: [
    {
      question: 'Vocês atendem imobiliária pequena ou só grandes operações?',
      answer:
        'Atendemos principalmente PMEs. O foco é criar escala previsível com o tamanho de equipe e verba que você tem hoje, sem complicar a operação.',
    },
    {
      question: 'Como vocês melhoram a qualidade dos leads?',
      answer:
        'Combinamos segmentação por intenção, filtros de oferta e ajuste de criativos para atrair público mais aderente ao perfil de compra.',
    },
    {
      question: 'Quando começo a enxergar impacto?',
      answer:
        'Os primeiros ganhos operacionais aparecem nas primeiras semanas, principalmente em qualidade de lead e melhor uso do time comercial.',
    },
    {
      question: 'Isso substitui meu time de vendas?',
      answer:
        'Não. A tecnologia organiza e acelera o processo, mas o fechamento continua com o especialista humano.',
    },
  ],
  relatedPages: [
    {
      label: 'Gestão de Tráfego (Google + Meta)',
      href: '/servicos/gestao-de-trafego-google-meta',
      description: 'Base de aquisição com governança financeira diária.',
    },
    {
      label: 'Estratégia de Funil e Conversão',
      href: '/servicos/estrategia-de-funil-e-conversao',
      description: 'Conecte mídia, atendimento e fechamento em um único sistema.',
    },
    {
      label: 'Serviços Profissionais',
      href: '/servicos/servicos-profissionais',
      description: 'Veja como adaptar o mesmo método para vendas consultivas.',
    },
    {
      label: 'Contato',
      href: '/a-neuroads/contato',
      description: 'Fale com especialista e valide o cenário da sua operação.',
    },
  ],
  media: {
    title: 'Sistema de captação para imobiliárias',
    poster: '/images/tools/gestao-trafego-controle-caixa-hero-ultrarealista-v2.png',
  },
};

export default function Page() {
  return <SubmenuPageShell content={content} />;
}
