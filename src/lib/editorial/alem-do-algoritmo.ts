export type EditorialOrder = 'latest24h' | 'mostAccessed' | 'recent';

export type EditorialTag =
  | 'Noticias'
  | 'IA'
  | 'Automacao'
  | 'Vendas'
  | 'Comercial'
  | 'Operacoes'
  | 'SEO+GEO'
  | 'Performance'
  | 'Dados Reais'
  | 'Gestao';

export interface EditorialSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface EditorialPost {
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  category: string;
  tags: EditorialTag[];
  readTimeMinutes: number;
  publishedAt: string;
  updatedAt?: string;
  views24h: number;
  viewsTotal: number;
  coverImage: string;
  coverAlt: string;
  midImage: string;
  midAlt: string;
  geoFocus: string[];
  keywords: string[];
  sections: EditorialSection[];
}

const BASE_URL = 'https://www.neuroads.com.br';

export const EDITORIAL_TEMPLATE_NAME = 'Claude Code Cowork Editorial Template';

export const editorialPosts: EditorialPost[] = [
  {
    slug: 'seo-geo-para-pme-que-quer-escala-previsivel',
    title: 'SEO + GEO para PME que quer escala previsível',
    excerpt: 'Como unir busca clássica e IA de resposta para transformar demanda em receita previsível.',
    description:
      'Guia prático para empresários que querem dominar Google e mecanismos generativos com estratégia integrada a vendas e operação.',
    category: 'SEO + GEO',
    tags: ['SEO+GEO', 'IA', 'Comercial', 'Dados Reais'],
    readTimeMinutes: 8,
    publishedAt: '2026-05-19T08:10:00-03:00',
    updatedAt: '2026-05-19T10:40:00-03:00',
    views24h: 1480,
    viewsTotal: 5620,
    coverImage: '/images/tools/servico-seo-geo-hero-ultrarealista-v2.png',
    coverAlt: 'Executivo analisando dados de busca em painel moderno de SEO e GEO.',
    midImage: '/images/tools/agentes-inteligencia-dados-hero-ultrarealista-v2.png',
    midAlt: 'Time comercial usando inteligência de dados em operação integrada.',
    geoFocus: ['ChatGPT', 'Gemini', 'Perplexity', 'Google Search'],
    keywords: [
      'seo para pme',
      'geo generative engine optimization',
      'escala previsivel',
      'neuroads lucca',
      'marketing orientado a receita',
    ],
    sections: [
      {
        heading: 'O problema que trava a maioria das PMEs',
        paragraphs: [
          'A empresa publica conteúdo, investe em mídia e ainda sente insegurança sobre o caixa. O ponto crítico não é volume de ações, é falta de ecossistema.',
          'Quando SEO, mídia paga e comercial não conversam, o empresário vê número no dashboard e não vê previsibilidade na receita.',
        ],
      },
      {
        heading: 'Como o GEO muda o jogo na prática',
        paragraphs: [
          'SEO não morreu. Ele evoluiu para GEO: conteúdo estruturado para buscadores tradicionais e motores generativos responderem com contexto de marca.',
          'Com isso, sua empresa não disputa só clique. Ela disputa autoridade em decisões de compra com intenção alta.',
        ],
        bullets: [
          'Conteúdo com intenção comercial clara por etapa de jornada.',
          'Estrutura técnica para indexação, contexto e resposta por IA.',
          'Integração entre páginas, CRM e sinais de conversão real.',
        ],
      },
      {
        heading: 'Impacto financeiro esperado',
        paragraphs: [
          'Quando o tráfego orgânico e generativo entra qualificado, o custo por aquisição tende a cair e o ciclo comercial acelera.',
          'A leitura correta é simples: mais oportunidades certas no mesmo orçamento significa maior margem por venda.',
        ],
      },
    ],
  },
  {
    slug: 'ia-agentica-no-comercial-sem-perder-controle-humano',
    title: 'IA agêntica no comercial sem perder controle humano',
    excerpt: 'Use automação para ganhar velocidade de resposta sem terceirizar julgamento estratégico.',
    description:
      'Modelo operacional para implantar agentes comerciais com governança, qualificação e foco em conversão.',
    category: 'IA Comercial',
    tags: ['IA', 'Automacao', 'Comercial', 'Vendas'],
    readTimeMinutes: 7,
    publishedAt: '2026-05-19T06:35:00-03:00',
    views24h: 1265,
    viewsTotal: 4870,
    coverImage: '/images/tools/servico-implantacao-agentes-hero-ultrarealista-v2.png',
    coverAlt: 'Especialista supervisionando agentes de IA em operação comercial.',
    midImage: '/images/tools/agentes-conversao-hero-ultrarealista-v2.png',
    midAlt: 'Painel de conversão com atendimento automatizado e métricas de vendas.',
    geoFocus: ['WhatsApp Business', 'CRM', 'ChatGPT'],
    keywords: [
      'agente de ia comercial',
      'automacao de vendas pme',
      'qualificacao de leads',
      'neuroads lucca',
    ],
    sections: [
      {
        heading: 'Erro comum: automação sem método',
        paragraphs: [
          'Muitas empresas colocam bot no ar para responder rápido, mas sem critério de qualificação. Resultado: conversa longa, pouca venda.',
          'IA sem processo aumenta volume e ruído. IA com processo aumenta conversão.',
        ],
      },
      {
        heading: 'Estrutura mínima para funcionar',
        paragraphs: [
          'Defina critérios de qualificação, handoff para humano e métricas que importam para caixa.',
        ],
        bullets: [
          'Tempo de resposta inicial em minutos, não horas.',
          'Taxa de qualificação e agendamento por canal.',
          'Conversão por origem e custo por oportunidade válida.',
        ],
      },
      {
        heading: 'Onde o Lucca entra',
        paragraphs: [
          'O Lucca conecta dados de aquisição, comportamento e comercial para os agentes priorizarem quem tem maior probabilidade de compra.',
          'Quanto mais dados reais entram no sistema, mais inteligente fica a operação.',
        ],
      },
    ],
  },
  {
    slug: 'cpl-baixo-sem-venda-o-gargalo-esta-no-funil',
    title: 'CPL baixo sem venda? O gargalo está no funil',
    excerpt: 'Reduzir custo de lead não resolve sozinho quando a operação comercial está desalinhada.',
    description:
      'Diagnóstico para identificar perda entre geração de demanda, qualificação e fechamento.',
    category: 'Funil e Conversão',
    tags: ['Performance', 'Vendas', 'Comercial', 'Gestao'],
    readTimeMinutes: 6,
    publishedAt: '2026-05-18T16:20:00-03:00',
    views24h: 910,
    viewsTotal: 5335,
    coverImage: '/images/tools/servico-funil-conversao-hero-ultrarealista-v2.png',
    coverAlt: 'Funil de vendas digital com análise de performance por etapa.',
    midImage: '/images/tools/diagnostico_funil.png',
    midAlt: 'Tela de diagnóstico com gargalos entre marketing e comercial.',
    geoFocus: ['Google Ads', 'Meta Ads', 'CRM'],
    keywords: ['cpl baixo sem vendas', 'funil comercial pme', 'taxa de conversao', 'roas com lucro'],
    sections: [
      {
        heading: 'O sintoma',
        paragraphs: [
          'O dashboard mostra CPL em queda, mas o financeiro não sente avanço proporcional.',
          'Isso costuma indicar ruptura entre aquisição e conversão, não necessariamente problema de mídia.',
        ],
      },
      {
        heading: 'Checklist de diagnóstico',
        paragraphs: ['Antes de aumentar orçamento, valide estes pontos:'],
        bullets: [
          'Lead recebe contato rápido?',
          'Equipe tem roteiro de qualificação padronizado?',
          'Oferta e prova social estão alinhadas ao perfil de compra?',
          'Existe feedback estruturado do comercial para mídia?',
        ],
      },
      {
        heading: 'A tradução para caixa',
        paragraphs: [
          'Ganhar 1 ponto percentual de conversão no meio do funil pode valer mais do que dobrar investimento em topo.',
          'Em resumo: menos desperdício por lead e mais receita por oportunidade.',
        ],
      },
    ],
  },
  {
    slug: 'operacao-comercial-com-menos-ferramenta-e-mais-sistema',
    title: 'Operação comercial com menos ferramenta e mais sistema',
    excerpt: 'A integração certa reduz retrabalho e libera o time para vender.',
    description:
      'Como simplificar stack e transformar dados dispersos em execução orientada a resultado financeiro.',
    category: 'Operações',
    tags: ['Operacoes', 'Automacao', 'Dados Reais', 'Comercial'],
    readTimeMinutes: 6,
    publishedAt: '2026-05-18T10:15:00-03:00',
    views24h: 740,
    viewsTotal: 4010,
    coverImage: '/images/tools/agentes-visao-geral-hero-ultrarealista-v2.png',
    coverAlt: 'Central operacional com visão integrada de marketing e vendas.',
    midImage: '/images/tools/automacao.png',
    midAlt: 'Fluxo de automação empresarial em interface moderna.',
    geoFocus: ['CRM', 'Automacao de processos', 'Integracao de dados'],
    keywords: ['operacao comercial pme', 'integracao marketing vendas', 'automacao empresarial'],
    sections: [
      {
        heading: 'Complexidade custa caro',
        paragraphs: [
          'Quando cada área usa uma ferramenta isolada, a empresa paga duas vezes: em assinatura e em perda de velocidade.',
          'Sem linguagem comum de dados, decisões viram opinião.',
        ],
      },
      {
        heading: 'Arquitetura operacional recomendada',
        paragraphs: ['A operação enxuta prioriza três camadas:'],
        bullets: [
          'Aquisição com rastreio confiável.',
          'Qualificação com regra de negócio clara.',
          'Inteligência contínua para priorizar ações com maior impacto.',
        ],
      },
      {
        heading: 'Resultado prático',
        paragraphs: [
          'Seu time passa menos tempo consolidando planilha e mais tempo negociando com leads quentes.',
          'Isso reduz custo oculto de operação e melhora a taxa de fechamento.',
        ],
      },
    ],
  },
  {
    slug: 'noticias-ia-marketing-o-que-afeta-pme-este-mes',
    title: 'Notícias de IA no marketing: o que afeta PME este mês',
    excerpt: 'Leitura executiva para separar tendência real de ruído.',
    description:
      'Resumo prático das movimentações de IA e busca que mais impactam aquisição e conversão de PMEs.',
    category: 'Notícias',
    tags: ['Noticias', 'IA', 'SEO+GEO', 'Gestao'],
    readTimeMinutes: 5,
    publishedAt: '2026-05-17T15:00:00-03:00',
    views24h: 650,
    viewsTotal: 3780,
    coverImage: '/images/tools/agentes-aquisicao-hero-ultrarealista-v2.png',
    coverAlt: 'Análise de mercado com sinais de IA e aquisição digital.',
    midImage: '/images/tools/analise.png',
    midAlt: 'Analista observando painéis estratégicos de marketing digital.',
    geoFocus: ['ChatGPT', 'Google Search', 'Meta Ads'],
    keywords: ['noticias ia marketing', 'tendencias pme', 'geo para empresas'],
    sections: [
      {
        heading: 'Mais ferramenta não significa mais resultado',
        paragraphs: [
          'A cada semana surgem novos recursos. O que importa não é testar tudo, é selecionar o que reduz custo e melhora previsibilidade.',
        ],
      },
      {
        heading: 'Três movimentos para observar',
        paragraphs: ['Se você lidera uma PME, monitore:'],
        bullets: [
          'Mudanças na forma como buscadores exibem respostas de IA.',
          'Impacto de automações na velocidade de atendimento comercial.',
          'Evolução de rastreio para medir melhor receita por canal.',
        ],
      },
      {
        heading: 'Próximo passo',
        paragraphs: [
          'Crie um ritual semanal curto para revisar impacto financeiro por decisão tomada. Sem esse ciclo, tendência vira distração.',
        ],
      },
    ],
  },
  {
    slug: 'dados-reais-que-o-empresario-precisa-ver-toda-semana',
    title: 'Dados reais que o empresário precisa ver toda semana',
    excerpt: 'Menos vaidade, mais leitura financeira da operação de marketing.',
    description:
      'Painel executivo para decisão: CPL, ROAS, conversão e receita por origem traduzidos para caixa.',
    category: 'Gestão',
    tags: ['Dados Reais', 'Gestao', 'Performance', 'Comercial'],
    readTimeMinutes: 6,
    publishedAt: '2026-05-16T11:30:00-03:00',
    views24h: 540,
    viewsTotal: 4495,
    coverImage: '/images/tools/gestao-trafego-controle-caixa-hero-ultrarealista-v2.png',
    coverAlt: 'Diretor financeiro avaliando impacto de marketing no caixa.',
    midImage: '/images/tools/simulador_roas.png',
    midAlt: 'Simulação de ROAS e margem em dashboard estratégico.',
    geoFocus: ['BI Comercial', 'ROAS', 'CPL'],
    keywords: ['kpis financeiros marketing', 'cpl roas receita', 'painel executivo pme'],
    sections: [
      {
        heading: 'Métrica sem tradução não gera decisão',
        paragraphs: [
          'Se o relatório não mostra efeito no faturamento e na margem, ele não ajuda a liderar a operação.',
        ],
      },
      {
        heading: 'Painel mínimo de decisão',
        paragraphs: ['Toda semana, responda quatro perguntas:'],
        bullets: [
          'Quanto custa gerar uma oportunidade real?',
          'Quanto cada canal retorna em receita?',
          'Qual etapa do funil está reduzindo conversão?',
          'Onde está o maior desperdício de verba hoje?',
        ],
      },
      {
        heading: 'Disciplina de crescimento previsível',
        paragraphs: [
          'Com esse ritual, você troca sensação por evidência e ganha previsibilidade para escalar com menor risco.',
        ],
      },
    ],
  },
];

export function getEditorialPosts(): EditorialPost[] {
  return editorialPosts
    .slice()
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getEditorialPostBySlug(slug: string): EditorialPost | undefined {
  return editorialPosts.find((post) => post.slug === slug);
}

export function getEditorialTags(): EditorialTag[] {
  const tags = new Set<EditorialTag>();
  for (const post of editorialPosts) {
    for (const tag of post.tags) tags.add(tag);
  }
  return Array.from(tags);
}

export function getEditorialPostUrl(slug: string): string {
  return `${BASE_URL}/conteudos/alem-do-algoritmo/${slug}`;
}

export function isPublishedInLast24Hours(isoDate: string): boolean {
  const publishedTime = new Date(isoDate).getTime();
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  return publishedTime >= oneDayAgo;
}

export function sortPostsByOrder(posts: EditorialPost[], order: EditorialOrder): EditorialPost[] {
  if (order === 'mostAccessed') {
    return posts.slice().sort((a, b) => b.viewsTotal - a.viewsTotal);
  }

  if (order === 'latest24h') {
    const recent24h = posts
      .filter((post) => isPublishedInLast24Hours(post.publishedAt))
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    if (recent24h.length > 0) return recent24h;
    return posts.slice().sort((a, b) => b.views24h - a.views24h);
  }

  return posts.slice().sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

export function getEditorialListingJsonLd(posts: EditorialPost[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Além do Algoritmo',
    description:
      'Canal editorial da NeuroAds com estratégia aplicada para PMEs: SEO + GEO, IA agêntica, vendas e operações com foco em dados reais.',
    publisher: {
      '@type': 'Organization',
      name: 'NeuroAds',
      url: BASE_URL,
    },
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt ?? post.publishedAt,
      keywords: post.keywords.join(', '),
      articleSection: post.category,
      url: getEditorialPostUrl(post.slug),
      image: [`${BASE_URL}${post.coverImage}`, `${BASE_URL}${post.midImage}`],
    })),
  };
}

export function getEditorialPostJsonLd(post: EditorialPost) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: getEditorialPostUrl(post.slug),
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    articleSection: post.category,
    keywords: post.keywords.join(', '),
    image: [`${BASE_URL}${post.coverImage}`, `${BASE_URL}${post.midImage}`],
    author: {
      '@type': 'Person',
      name: 'Claudio Muller',
    },
    publisher: {
      '@type': 'Organization',
      name: 'NeuroAds',
      url: BASE_URL,
    },
    about: post.geoFocus.map((topic) => ({
      '@type': 'Thing',
      name: topic,
    })),
  };
}

