import type { Metadata } from 'next';
import SubmenuPageShell, { type SubmenuPageContent } from '@/components/neuroads/SubmenuPageShell';

export const metadata: Metadata = {
  title: 'E-commerce & Varejo | NeuroAds',
  description:
    'Página de captura para e-commerce e varejo que buscam vender mais com ROAS sustentável, redução de desperdício e crescimento previsível.',
};

const content: SubmenuPageContent = {
  slug: 'servicos-e-commerce-varejo',
  eyebrow: 'Soluções por segmento',
  headline: 'E-commerce & Varejo com',
  highlightedHeadline: 'ROAS sustentável',
  subheadline:
    'Seu faturamento não pode depender de pico promocional. A NeuroAds estrutura um sistema de performance para escalar receita com controle de margem.',
  serviceContext: 'E-commerce & Varejo',
  copyContract: {
    promise: 'Mais vendas recorrentes com alocação de verba orientada a margem e LTV.',
    pain: 'O tráfego gera visitas, mas o funil perde eficiência entre produto visto, carrinho e compra final.',
    impactoFinanceiro:
      'Sem leitura integrada de mídia, oferta e conversão, o CAC sobe, o ROAS oscila e a operação perde previsibilidade de caixa.',
    prova:
      'Aplicamos rotina de otimização por categoria, criativo e estágio do funil para elevar conversão e reduzir desperdício em mídia.',
    metodo:
      'Começamos com diagnóstico de funil completo, priorizamos os maiores vazamentos de receita e implantamos ciclos de melhoria contínua.',
    cta: 'Solicite um diagnóstico de e-commerce e receba o plano para escalar com eficiência financeira.',
  },
  painPoints: [
    'Alto abandono de carrinho e baixa recompra.',
    'Investimento alto sem clareza de rentabilidade por linha.',
    'Dependência excessiva de campanhas sazonais.',
    'Dificuldade para ganhar escala sem aumentar desperdício.',
  ],
  impactPoints: [
    'Margem comprimida por custo de aquisição crescente.',
    'Faturamento instável mês a mês.',
    'Menor previsibilidade de estoque e operação.',
    'Perda de competitividade em categorias estratégicas.',
  ],
  howItWorks: [
    'Auditoria de funil, catálogo e estrutura de campanhas.',
    'Plano de mídia por categoria e intenção de compra.',
    'Otimização de criativos e ofertas por etapa da jornada.',
    'Dashboard executivo com foco em receita, CAC e ROAS.',
  ],
  proofMetrics: [],
  faq: [
    {
      question: 'Vocês trabalham com ticket baixo e ticket alto?',
      answer:
        'Sim. A estratégia muda conforme ciclo de compra, recompra e margem de contribuição de cada operação.',
    },
    {
      question: 'Como melhorar ROAS sem cortar escala?',
      answer:
        'Ajustando mix de campanhas, criativos e audiência com base no retorno financeiro de cada etapa do funil.',
    },
    {
      question: 'IA ajuda mesmo no varejo?',
      answer:
        'Sim, quando aplicada para decisão prática. A IA agêntica acelera análise e execução, mas com supervisão estratégica humana.',
    },
    {
      question: 'Como vocês medem sucesso?',
      answer:
        'Traduzimos tudo para dinheiro: evolução de receita, eficiência de CAC, estabilidade de ROAS e previsibilidade de caixa.',
    },
  ],
  relatedPages: [
    {
      label: 'Gestão de Tráfego (Google + Meta)',
      href: '/servicos/gestao-de-trafego-google-meta',
      description: 'Fortaleça aquisição com governança de investimento.',
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
