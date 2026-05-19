import type { Metadata } from 'next';
import SubmenuPageShell, {
  type SubmenuPageContent,
  type AgentExample,
} from '@/components/neuroads/SubmenuPageShell';

export const metadata: Metadata = {
  title: 'E-commerce & Varejo | NeuroAds',
  description:
    'Página de captura para e-commerce e varejo que buscam vender mais com ROAS sustentável, redução de desperdício e crescimento previsível.',
};

const agentExamples: AgentExample[] = [
  {
    name: 'Agente de Recuperação de Carrinho',
    icon: '🛒',
    trigger:
      'Carrinho abandonado detectado há mais de 30 minutos sem conversão registrada',
    action:
      'Aciona sequência multicanal (push → e-mail → retargeting) com oferta personalizada baseada no valor do carrinho e histórico do comprador',
    result:
      'Recupera vendas que seriam definitivamente perdidas — receita adicional sem nenhum custo extra de aquisição',
    metric: '↑ 34% recuperação',
  },
  {
    name: 'Agente de Otimização de ROAS',
    icon: '📈',
    trigger:
      'Queda de ROAS detectada em campanha, produto ou horário específico em tempo real',
    action:
      'Redistribui verba entre produtos, audiências e horários com base nos dados de conversão das últimas 6 horas — sem intervenção manual',
    result:
      'ROAS mantido estável mesmo em períodos de alta competição — budget sempre alocado onde converte com mais margem',
    metric: '↑ 2.8× ROAS médio',
  },
  {
    name: 'Agente de Personalização de Oferta',
    icon: '🎯',
    trigger:
      'Cliente retorna ao site após mais de 7 dias sem compra ou abandona página de produto',
    action:
      'Identifica categoria de interesse e exibe oferta personalizada com urgência baseada em estoque real e comportamento anterior do comprador',
    result:
      'Taxa de clique e conversão significativamente superior a anúncios genéricos — cliente sente que a loja o conhece',
    metric: '↑ 47% LTV',
  },
  {
    name: 'Agente de Gestão de Margem',
    icon: '💰',
    trigger:
      'Produto com queda de margem detectada por CAC elevado ou mix de vendas desfavorável',
    action:
      'Emite alerta, sugere ajuste de bid e redireciona investimento para produtos com melhor margem de contribuição e ticket médio',
    result:
      'Mix de vendas mais rentável sem sacrificar o faturamento total — lucro cresce mesmo sem aumentar verba',
    metric: '↑ 22% margem líquida',
  },
];

const content: SubmenuPageContent = {
  slug: 'servicos-e-commerce-varejo',
  eyebrow: 'Soluções por segmento',
  headline: 'E-commerce & Varejo com',
  highlightedHeadline: 'ROAS sustentável',
  subheadline:
    'Seu faturamento não pode depender de pico promocional. A NeuroAds estrutura um sistema de performance para escalar receita com controle de margem — todos os dias do ano.',
  serviceContext: 'E-commerce & Varejo',
  agentExamples,
  copyContract: {
    promise: 'Mais vendas recorrentes com alocação de verba orientada a margem e LTV.',
    pain: 'O tráfego gera visitas, mas o funil perde eficiência entre produto visto, carrinho e compra final.',
    impactoFinanceiro:
      'Sem leitura integrada de mídia, oferta e conversão, o CAC sobe, o ROAS oscila e a operação perde previsibilidade de caixa.',
    prova:
      'Aplicamos rotina de otimização por categoria, criativo e estágio do funil para elevar conversão e reduzir desperdício em mídia.',
    metodo:
      'Começamos com diagnóstico de funil completo, priorizamos os maiores vazamentos de receita e implantamos ciclos de melhoria contínua com agentes IA.',
    cta: 'Solicite um diagnóstico de e-commerce e receba o plano para escalar com eficiência financeira.',
  },
  painPoints: [
    'Alto abandono de carrinho e baixa taxa de recompra ativa.',
    'Investimento alto em mídia sem clareza de rentabilidade por linha de produto.',
    'Dependência excessiva de campanhas sazonais para sustentar o faturamento.',
    'Dificuldade para ganhar escala sem aumentar proporcionalmente o desperdício.',
  ],
  impactPoints: [
    'Margem comprimida por custo de aquisição crescente e não gerenciado.',
    'Faturamento instável mês a mês, sem previsibilidade de caixa.',
    'Menor competitividade em categorias estratégicas por falta de dados.',
    'Equipe operacional sobrecarregada com ajustes manuais de campanha.',
  ],
  howItWorks: [
    'Auditoria completa de funil, catálogo e estrutura de campanhas ativas.',
    'Plano de mídia orientado por categoria, margem e intenção de compra.',
    'Otimização contínua de criativos e ofertas por etapa da jornada de compra.',
    'Dashboard executivo com foco em receita, CAC, ROAS e previsibilidade de caixa.',
  ],
  proofMetrics: [
    {
      value: '↑ 2.8×',
      label: 'ROAS médio',
      detail: 'Retorno sobre investimento em mídia comparado ao período anterior à gestão NeuroAds',
    },
    {
      value: '↓ 34%',
      label: 'Abandono de carrinho',
      detail: 'Redução na taxa de carrinhos abandonados com sistema de recuperação ativo 24 h',
    },
    {
      value: '↑ 47%',
      label: 'Receita por cliente',
      detail: 'Aumento no LTV médio após ativação de personalização e estratégia de recompra',
    },
  ],
  faq: [
    {
      question: 'Vocês trabalham com ticket baixo e ticket alto?',
      answer:
        'Sim. A estratégia muda conforme ciclo de compra, recompra e margem de contribuição de cada operação — adaptamos o sistema ao seu modelo.',
    },
    {
      question: 'Como melhorar ROAS sem cortar escala?',
      answer:
        'Ajustando mix de campanhas, criativos e audiência com base no retorno financeiro de cada etapa do funil — os agentes fazem isso em tempo real.',
    },
    {
      question: 'IA ajuda mesmo no varejo?',
      answer:
        'Sim, quando aplicada para decisão prática. A IA agêntica acelera análise e execução, mas com supervisão estratégica humana para manter qualidade.',
    },
    {
      question: 'Como vocês medem sucesso?',
      answer:
        'Traduzimos tudo para dinheiro: evolução de receita, eficiência de CAC, estabilidade de ROAS e previsibilidade de caixa mês a mês.',
    },
  ],
  relatedPages: [
    {
      label: 'Gestão de Tráfego (Google + Meta)',
      href: '/servicos/gestao-de-trafego-google-meta',
      description: 'Fortaleça aquisição com governança de investimento diária.',
    },
    {
      label: 'Estratégia de Funil e Conversão',
      href: '/servicos/estrategia-de-funil-e-conversao',
      description: 'Reduza vazamentos entre tráfego, checkout e venda.',
    },
    {
      label: 'Mercado Imobiliário',
      href: '/servicos/mercado-imobiliario',
      description: 'Compare aplicação do método em venda consultiva.',
    },
    {
      label: 'Agentes de Conversão',
      href: '/agentes-ia/agentes-de-conversao',
      description: 'Conheça os agentes que aceleram conversão com dados reais.',
    },
  ],
  media: {
    title: 'Escala de vendas para e-commerce',
    poster: '/images/tools/servico-funil-conversao-hero-ultrarealista-v2.png',
  },
};

export default function Page() {
  return <SubmenuPageShell content={content} />;
}
