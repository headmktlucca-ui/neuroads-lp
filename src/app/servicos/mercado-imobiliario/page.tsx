import type { Metadata } from 'next';
import SubmenuPageShell, {
  type SubmenuPageContent,
  type AgentExample,
} from '@/components/neuroads/SubmenuPageShell';

export const metadata: Metadata = {
  title: 'Mercado Imobiliário | NeuroAds',
  description:
    'Página de captura para imobiliárias e incorporadoras que precisam transformar mídia em visitas, propostas e vendas com previsibilidade.',
};

const agentExamples: AgentExample[] = [
  {
    name: 'Agente de Triagem de Perfil',
    icon: '🏠',
    trigger:
      'Lead preenche formulário ou envia mensagem pelo WhatsApp após ver um anúncio',
    action:
      'Analisa histórico de navegação, perfil declarado, bairro de interesse e faixa de ticket para classificar o potencial real de compra em tempo real',
    result:
      'O corretor recebe apenas leads com alta aderência ao perfil ideal — sem desperdiçar tempo com curiosos',
    metric: '↑ 68% qualificados',
  },
  {
    name: 'Agente de Cadência Inteligente',
    icon: '🔄',
    trigger: 'Lead qualificado não responde em 24 h após o primeiro contato',
    action:
      'Ativa sequência personalizada por canal (WhatsApp → e-mail → retargeting) com mensagens adaptadas ao imóvel e região de interesse do lead',
    result:
      'Taxa de resposta 3× maior sem nenhum esforço manual adicional da equipe de corretores',
    metric: '3× mais respostas',
  },
  {
    name: 'Agente de Inteligência de Mercado',
    icon: '📊',
    trigger:
      'Variação de busca detectada por bairro, tipologia ou faixa de preço nas últimas 48 h',
    action:
      'Redistribui automaticamente a verba de campanha para os imóveis e regiões com maior intenção de compra naquele momento',
    result:
      'Custo por visita agendada reduzido sem perder volume — verba sempre alocada onde converte mais',
    metric: '↓ 45% custo/visita',
  },
  {
    name: 'Agente de Reativação de Pipeline',
    icon: '🎯',
    trigger: 'Lead inativo há mais de 14 dias sem interação registrada no CRM',
    action:
      'Monitora sinais de retorno (nova visita ao site, busca pelo imóvel) e aciona mensagem personalizada no timing exato da reativação de interesse',
    result:
      'Recupera até 30% dos leads considerados perdidos — receita que voltaria para o concorrente',
    metric: '30% leads recuperados',
  },
];

const content: SubmenuPageContent = {
  slug: 'servicos-mercado-imobiliario',
  eyebrow: 'Soluções por segmento',
  headline: 'Mercado Imobiliário com',
  highlightedHeadline: 'escala previsível',
  subheadline:
    'Se o seu time depende de plantão cheio para fechar, existe desperdício no funil. A NeuroAds estrutura um sistema para transformar busca ativa em visitas qualificadas e proposta na mesa.',
  serviceContext: 'Mercado Imobiliário',
  agentExamples,
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
    'Leads curiosos consumindo tempo da equipe de corretores sem potencial real.',
    'Campanhas sem segmentação por perfil e potencial de compra.',
    'Baixa previsibilidade entre lead gerado e visita agendada.',
    'Dificuldade para escalar verba com segurança e previsibilidade de retorno.',
  ],
  impactPoints: [
    'Custo por oportunidade qualificada elevado e crescente.',
    'Pipeline comercial com baixa taxa de avanço para proposta.',
    'Perda de margem por ineficiência operacional do time.',
    'Crescimento travado por ausência de sistema previsível.',
  ],
  howItWorks: [
    'Diagnóstico de origem de leads e qualidade de atendimento por canal.',
    'Estrutura de campanhas por intenção de compra, região e tipologia.',
    'Rotina de otimização com foco em visita, proposta e taxa de fechamento.',
    'Painel executivo traduzindo performance de mídia em impacto direto no caixa.',
  ],
  proofMetrics: [
    {
      value: '↑ 68%',
      label: 'Leads qualificados',
      detail: 'Aumento médio de leads com perfil real de compra após estruturação do funil',
    },
    {
      value: '↓ 45%',
      label: 'Custo por visita',
      detail: 'Redução no custo de cada visita qualificada agendada com o corretor',
    },
    {
      value: '↑ 3.2×',
      label: 'Propostas avançadas',
      detail: 'Aumento na taxa de leads que evoluíram para proposta formal de compra',
    },
  ],
  faq: [
    {
      question: 'Vocês atendem imobiliária pequena ou só grandes operações?',
      answer:
        'Atendemos principalmente PMEs. O foco é criar escala previsível com o tamanho de equipe e verba que você tem hoje, sem complicar a operação.',
    },
    {
      question: 'Como vocês melhoram a qualidade dos leads?',
      answer:
        'Combinamos segmentação por intenção, filtros de oferta e ajuste de criativos para atrair público mais aderente ao perfil de compra — e os agentes de IA filtram antes de chegar ao corretor.',
    },
    {
      question: 'Quando começo a enxergar impacto?',
      answer:
        'Os primeiros ganhos operacionais aparecem nas primeiras semanas, principalmente em qualidade de lead e melhor uso do tempo do time comercial.',
    },
    {
      question: 'Isso substitui meu time de vendas?',
      answer:
        'Não. Os agentes organizam e aceleram o processo, mas o fechamento continua com o especialista humano — que agora chega à visita com muito mais contexto.',
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
    poster: '/images/segment-highlights/mercado-imobiliario-destaque.png',
  },
};

export default function Page() {
  return <SubmenuPageShell content={content} />;
}
