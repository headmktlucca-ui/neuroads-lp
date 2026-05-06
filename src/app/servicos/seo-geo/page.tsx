import type { Metadata } from 'next';
import SubmenuPageShell, { type SubmenuPageContent } from '@/components/neuroads/SubmenuPageShell';

export const metadata: Metadata = {
  title: 'SEO + GEO | NeuroAds',
  description:
    'SEO evoluiu para GEO. Estruturamos sua presença em Google e motores generativos para transformar busca em demanda qualificada e receita recorrente.',
};

const content: SubmenuPageContent = {
  slug: 'servicos-seo-geo',
  eyebrow: 'Serviços NeuroAds',
  headline: 'SEO evoluiu para',
  highlightedHeadline: 'GEO com intenção',
  subheadline:
    'Sua marca precisa aparecer onde o cliente pesquisa e onde as IAs recomendam soluções. SEO + GEO é autoridade prática aplicada ao funil de vendas.',
  serviceContext: 'SEO + GEO',
  copyContract: {
    promise: 'Visibilidade orgânica orientada a oportunidade comercial.',
    pain: 'A empresa publica conteúdo, mas não domina termos estratégicos nem aparece nas recomendações de motores generativos.',
    impactoFinanceiro:
      'Sem presença qualificada em busca e IA, o custo de aquisição fica concentrado em mídia paga e o funil perde eficiência no médio prazo.',
    prova:
      'Aplicamos arquitetura semântica, clusters de intenção e otimização técnica para elevar relevância em buscadores e aumentar chance de citação em respostas de IA.',
    metodo:
      'Começamos por diagnóstico técnico + semântico, priorizamos temas com retorno comercial e estruturamos uma rotina de conteúdo e autoridade tópica por estágio do funil.',
    cta: 'Solicite um diagnóstico SEO + GEO e veja onde sua marca perde demanda hoje.',
  },
  painPoints: [
    'Conteúdo sem conexão com dor real de compra.',
    'Baixa autoridade em temas críticos do nicho.',
    'Site lento e estrutura técnica limitando indexação.',
    'Ausência da marca em respostas de IA generativa.',
  ],
  impactPoints: [
    'Dependência excessiva de mídia paga para gerar demanda.',
    'Menor volume de leads qualificados por busca ativa.',
    'Perda de share para concorrentes mais organizados em conteúdo.',
    'Baixa previsibilidade de aquisição orgânica recorrente.',
  ],
  howItWorks: [
    'Auditoria técnica e mapeamento de intenção de busca por receita.',
    'Plano editorial em clusters com foco em decisão de compra.',
    'Otimização de páginas-chave para SEO tradicional e GEO.',
    'Monitoramento de visibilidade, citações e impacto em pipeline.',
  ],
  proofMetrics: [],
  faq: [
    {
      question: 'SEO e GEO substituem tráfego pago?',
      answer:
        'Não. Eles complementam e fortalecem a aquisição. O objetivo é reduzir dependência exclusiva de mídia e construir demanda previsível ao longo do tempo.',
    },
    {
      question: 'Quanto tempo para perceber resultado?',
      answer:
        'SEO e GEO têm efeito acumulativo. Melhorias técnicas e de estrutura aparecem primeiro; ganho robusto de autoridade e demanda geralmente vem em ciclos contínuos.',
    },
    {
      question: 'GEO serve para PME ou só para grandes marcas?',
      answer:
        'Serve para PME, especialmente para quem precisa competir com inteligência e foco. A vantagem vem de estrutura, consistência e posicionamento temático correto.',
    },
    {
      question: 'Como vocês medem resultado em SEO + GEO?',
      answer:
        'Medimos visibilidade qualificada, evolução de páginas estratégicas, geração de oportunidades e impacto no funil, traduzindo tudo para impacto financeiro.',
    },
  ],
  relatedPages: [
    {
      label: 'Além do Algoritmo',
      href: '/conteudos/alem-do-algoritmo',
      description: 'Acesse conteúdos que sustentam autoridade e presença contínua.',
    },
    {
      label: 'Agentes de Inteligência de Dados',
      href: '/agentes-ia/agentes-de-inteligencia-de-dados',
      description: 'Use sinais de dados para priorizar temas e oportunidades.',
    },
    {
      label: 'Gestão de Tráfego (Google + Meta)',
      href: '/servicos/gestao-de-trafego-google-meta',
      description: 'Integre aquisição paga e orgânica no mesmo sistema.',
    },
    {
      label: 'FAQ',
      href: '/conteudos/faq',
      description: 'Entenda dúvidas comuns sobre prazo, risco e previsibilidade.',
    },
  ],
  media: {
    title: 'Visibilidade orgânica e GEO',
    poster: '/images/tools/otimizacao.png',
    desktopVideo: '/videos/fundovideo.mp4',
    mobileVideo: '/videos/fundovideo.mp4',
  },
};

export default function Page() {
  return <SubmenuPageShell content={content} />;
}

