'use server';

import { generateChatCompletion } from '../../lib/llm-router';

export type DnaBrandInput = {
  siteUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
};

export type DnaBrandColor = {
  hex: string;
  name: string;
  type: 'primary' | 'secondary' | 'accent' | 'neutral_light' | 'neutral_dark';
  usage: string;
};

export type DnaBrandColorPalette = {
  colors: DnaBrandColor[];
  psychologicalImpact: string;
  contrastAccessibility: string;
  visualStyleDescription: string;
};

export type DnaBrandSource = {
  label: 'site' | 'instagram' | 'linkedin';
  requestedUrl: string;
  finalUrl?: string;
  title?: string;
  description?: string;
  snippet?: string;
  error?: string;
  colors?: string[];
};

export type DnaBrandSlide = {
  title: string;
  analysis: string;
  recommendations: string[];
  financialImpact: string;
};

export type DnaIdealCustomerProfile = {
  headline: string;
  segment: string;
  companySize: string;
  annualRevenueRange: string;
  urgencyContext: string;
  probabilityScore: number;
  needScore: number;
  mainPainPoints: string[];
  buyingTriggers: string[];
  fears?: string[];
  values?: string[];
  digitalHabits?: string[];
};

export type DnaAudienceContentItem = {
  topic: string;
  format: string;
  channel: string;
  whyItWorks: string;
  engagementPotential: number;
};

export type DnaAudienceContentProfile = {
  summary: string;
  preferredFormats: string[];
  highIntentTopics: string[];
  interactionDrivers: string[];
  recommendedContentMix: DnaAudienceContentItem[];
};

export type DnaPracticalOpportunities = {
  positioningOpportunities: string[];
  contentIdeas: string[];
  materialSuggestions: string[];
  relationshipFunnel: string[];
  paidCampaignOpportunities: string[];
  emailMarketingOpportunities: string[];
  otherPracticalOpportunities: string[];
};

export type DnaBrandPresentation = {
  presentationTitle: string;
  executiveSummary: string;
  positioningStatement: string;
  colorPalette: DnaBrandColorPalette;
  idealCustomerProfile: DnaIdealCustomerProfile;
  audienceContentProfile: DnaAudienceContentProfile;
  practicalOpportunities?: DnaPracticalOpportunities;
  brandVoiceRules: string[];
  contentPillars: string[];
  funnelMessaging: string[];
  actionPlan30d: string[];
  sourceInsights: string[];
  slides: DnaBrandSlide[];
  brandArchetype?: string;
  brandVoiceDos?: string[];
  brandVoiceDonts?: string[];
};

export type DnaBrandResult = {
  success: boolean;
  presentation?: DnaBrandPresentation;
  reportMarkdown?: string;
  sources?: DnaBrandSource[];
  error?: string;
};

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function toNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function normalizePresentation(raw: unknown): DnaBrandPresentation {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const idealRaw = (data.idealCustomerProfile as Record<string, unknown>) ?? {};
  const audienceRaw = (data.audienceContentProfile as Record<string, unknown>) ?? {};
  const practicalRaw = (data.practicalOpportunities as Record<string, unknown>) ?? {};
  const paletteRaw = (data.colorPalette as Record<string, unknown>) ?? {};

  const colorsRaw = Array.isArray(paletteRaw.colors) ? paletteRaw.colors : [];
  const colors: DnaBrandColor[] = colorsRaw.map((item) => {
    const current = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
    const type = current.type as DnaBrandColor['type'];
    return {
      hex: typeof current.hex === 'string' ? current.hex.trim() : '#000000',
      name: typeof current.name === 'string' ? current.name.trim() : 'Cor',
      type: ['primary', 'secondary', 'accent', 'neutral_light', 'neutral_dark'].includes(type)
        ? type
        : 'primary',
      usage: typeof current.usage === 'string' ? current.usage.trim() : '',
    };
  });

  const colorPalette: DnaBrandColorPalette = {
    colors: colors.length > 0 ? colors : [
      { hex: '#FF6B00', name: 'Laranja Neuro', type: 'primary', usage: 'Cor principal da marca para botões e destaque.' },
      { hex: '#111827', name: 'Cinza Escuro', type: 'neutral_dark', usage: 'Textos principais e fundos escuros.' }
    ],
    psychologicalImpact: typeof paletteRaw.psychologicalImpact === 'string' ? paletteRaw.psychologicalImpact.trim() : '',
    contrastAccessibility: typeof paletteRaw.contrastAccessibility === 'string' ? paletteRaw.contrastAccessibility.trim() : '',
    visualStyleDescription: typeof paletteRaw.visualStyleDescription === 'string' ? paletteRaw.visualStyleDescription.trim() : '',
  };

  const slidesRaw = Array.isArray(data.slides) ? data.slides : [];
  const slides: DnaBrandSlide[] = slidesRaw.map((item) => {
    const current = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
    return {
      title: typeof current.title === 'string' ? current.title : 'Slide estratégico',
      analysis: typeof current.analysis === 'string' ? current.analysis : '',
      recommendations: toStringArray(current.recommendations),
      financialImpact: typeof current.financialImpact === 'string' ? current.financialImpact : '',
    };
  });

  const contentMixRaw = Array.isArray(audienceRaw.recommendedContentMix) ? audienceRaw.recommendedContentMix : [];
  const recommendedContentMix: DnaAudienceContentItem[] = contentMixRaw.map((item) => {
    const current = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
    return {
      topic: typeof current.topic === 'string' ? current.topic : '',
      format: typeof current.format === 'string' ? current.format : '',
      channel: typeof current.channel === 'string' ? current.channel : '',
      whyItWorks: typeof current.whyItWorks === 'string' ? current.whyItWorks : '',
      engagementPotential: toNumber(current.engagementPotential),
    };
  });

  return {
    presentationTitle: typeof data.presentationTitle === 'string' ? data.presentationTitle : 'DNA da Marca',
    executiveSummary: typeof data.executiveSummary === 'string' ? data.executiveSummary : '',
    positioningStatement: typeof data.positioningStatement === 'string' ? data.positioningStatement : '',
    colorPalette,
    idealCustomerProfile: {
      headline: typeof idealRaw.headline === 'string' ? idealRaw.headline : '',
      segment: typeof idealRaw.segment === 'string' ? idealRaw.segment : '',
      companySize: typeof idealRaw.companySize === 'string' ? idealRaw.companySize : '',
      annualRevenueRange: typeof idealRaw.annualRevenueRange === 'string' ? idealRaw.annualRevenueRange : '',
      urgencyContext: typeof idealRaw.urgencyContext === 'string' ? idealRaw.urgencyContext : '',
      probabilityScore: toNumber(idealRaw.probabilityScore),
      needScore: toNumber(idealRaw.needScore),
      mainPainPoints: toStringArray(idealRaw.mainPainPoints),
      buyingTriggers: toStringArray(idealRaw.buyingTriggers),
      fears: toStringArray(idealRaw.fears),
      values: toStringArray(idealRaw.values),
      digitalHabits: toStringArray(idealRaw.digitalHabits),
    },
    audienceContentProfile: {
      summary: typeof audienceRaw.summary === 'string' ? audienceRaw.summary : '',
      preferredFormats: toStringArray(audienceRaw.preferredFormats),
      highIntentTopics: toStringArray(audienceRaw.highIntentTopics),
      interactionDrivers: toStringArray(audienceRaw.interactionDrivers),
      recommendedContentMix,
    },
    practicalOpportunities: {
      positioningOpportunities: toStringArray(practicalRaw.positioningOpportunities),
      contentIdeas: toStringArray(practicalRaw.contentIdeas),
      materialSuggestions: toStringArray(practicalRaw.materialSuggestions),
      relationshipFunnel: toStringArray(practicalRaw.relationshipFunnel),
      paidCampaignOpportunities: toStringArray(practicalRaw.paidCampaignOpportunities),
      emailMarketingOpportunities: toStringArray(practicalRaw.emailMarketingOpportunities),
      otherPracticalOpportunities: toStringArray(practicalRaw.otherPracticalOpportunities),
    },
    brandVoiceRules: toStringArray(data.brandVoiceRules),
    contentPillars: toStringArray(data.contentPillars),
    funnelMessaging: toStringArray(data.funnelMessaging),
    actionPlan30d: toStringArray(data.actionPlan30d),
    sourceInsights: toStringArray(data.sourceInsights),
    slides,
    brandArchetype: typeof data.brandArchetype === 'string' ? data.brandArchetype : 'Criador',
    brandVoiceDos: toStringArray(data.brandVoiceDos),
    brandVoiceDonts: toStringArray(data.brandVoiceDonts),
  };
}



function normalizeUrl(value: string): string {
  const raw = value.trim();
  if (!raw) return '';
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

function isInputValid(input: DnaBrandInput): boolean {
  return Boolean(input.siteUrl.trim() && input.instagramUrl.trim() && input.linkedinUrl.trim());
}

function extractMetaContent(html: string, key: string): string {
  const regex = new RegExp(
    `<meta[^>]+(?:name|property)=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    'i'
  );
  const match = html.match(regex);
  return match?.[1]?.trim() || '';
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1]?.replace(/\s+/g, ' ').trim() || '';
}

function htmlToSnippet(html: string, maxChars = 2800): string {
  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ');

  const text = withoutScripts
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();

  return text.slice(0, maxChars);
}

function extractColorsFromHtml(html: string): string[] {
  if (!html) return [];
  const hexRegex = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3}|[0-9a-fA-F]{8})\b/g;
  const matches = html.match(hexRegex) || [];
  
  const counts: Record<string, number> = {};
  for (const match of matches) {
    const color = match.toLowerCase();
    counts[color] = (counts[color] || 0) + 1;
  }
  
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([color]) => color)
    .slice(0, 15);
}

async function fetchSource(label: DnaBrandSource['label'], rawUrl: string): Promise<DnaBrandSource> {
  const requestedUrl = normalizeUrl(rawUrl);
  if (!requestedUrl) {
    return {
      label,
      requestedUrl: rawUrl,
      error: 'URL não informada.',
    };
  }

  try {
    const response = await fetch(requestedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NeuroAdsBrandResearch/1.0)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(12000),
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        label,
        requestedUrl,
        finalUrl: response.url,
        error: `HTTP ${response.status} ao buscar fonte.`,
      };
    }

    const html = await response.text();
    const title = extractTitle(html);
    const description = extractMetaContent(html, 'description') || extractMetaContent(html, 'og:description');
    const snippet = htmlToSnippet(html);
    const colors = label === 'site' ? extractColorsFromHtml(html) : undefined;

    return {
      label,
      requestedUrl,
      finalUrl: response.url,
      title,
      description,
      snippet,
      colors,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao capturar a fonte.';
    return {
      label,
      requestedUrl,
      error: message,
    };
  }
}

function buildMarkdown(presentation: DnaBrandPresentation, sources: DnaBrandSource[]): string {
  const opportunities = presentation.practicalOpportunities;
  const slideBlocks = presentation.slides
    .map((slide, index) => {
      const recs = slide.recommendations.map((item) => `- ${item}`).join('\n');
      return `### ${index + 1}. ${slide.title}\n\n${slide.analysis}\n\n**Recomendações:**\n${recs}\n\n**Impacto financeiro esperado:** ${slide.financialImpact}`;
    })
    .join('\n\n');

  const sourcesBlock = sources
    .map((source) => {
      const lineA = `- ${source.label.toUpperCase()}: ${source.finalUrl || source.requestedUrl}`;
      const lineB = source.error
        ? `  - status: ${source.error}`
        : `  - title: ${source.title || 'Sem título'} | description: ${source.description || 'Sem descrição'}`;
      return `${lineA}\n${lineB}`;
    })
    .join('\n');

  const colorsList = presentation.colorPalette.colors
    .map(c => `- **${c.name}** (\`${c.hex}\` - ${c.type}): ${c.usage}`)
    .join('\n');
 
  const paletteBlock = `### Cores da Marca\n${colorsList}\n\n### Psicologia e Estilo Visual\n- **Impacto Psicológico:** ${presentation.colorPalette.psychologicalImpact}\n- **Contraste e Acessibilidade:** ${presentation.colorPalette.contrastAccessibility}\n- **Diretrizes de Estilo Visual:** ${presentation.colorPalette.visualStyleDescription}`;

  const voiceDosBlock = (presentation.brandVoiceDos ?? []).map((item) => `  - **Como usar:** ${item}`).join('\n');
  const voiceDontsBlock = (presentation.brandVoiceDonts ?? []).map((item) => `  - **O que evitar:** ${item}`).join('\n');

  return `# ${presentation.presentationTitle}
 
 ## Resumo Executivo
 ${presentation.executiveSummary}
 
 ## Posicionamento Central e Arquétipo
 - **Arquétipo de Marca:** ${presentation.brandArchetype || 'Criador'}
 - **Posicionamento:** ${presentation.positioningStatement}
 
 ## Identidade Visual e Paleta de Cores
 ${paletteBlock}
 
 ## Perfil Ideal De Cliente (Maior Probabilidade E Necessidade)
 - Headline: ${presentation.idealCustomerProfile.headline}
 - Segmento: ${presentation.idealCustomerProfile.segment}
 - Porte: ${presentation.idealCustomerProfile.companySize}
 - Faixa de receita anual: ${presentation.idealCustomerProfile.annualRevenueRange}
 - Contexto de urgência: ${presentation.idealCustomerProfile.urgencyContext}
 - Score de probabilidade: ${presentation.idealCustomerProfile.probabilityScore}/100
 - Score de necessidade: ${presentation.idealCustomerProfile.needScore}/100
 - Principais dores:
 ${presentation.idealCustomerProfile.mainPainPoints.map((item) => `  - ${item}`).join('\n')}
 - Gatilhos de decisão:
 ${presentation.idealCustomerProfile.buyingTriggers.map((item) => `  - ${item}`).join('\n')}
 - Medos Subconscientes do ICP:
 ${(presentation.idealCustomerProfile.fears ?? []).map((item) => `  - ${item}`).join('\n')}
 - Valores do ICP:
 ${(presentation.idealCustomerProfile.values ?? []).map((item) => `  - ${item}`).join('\n')}
 - Hábitos Digitais do ICP:
 ${(presentation.idealCustomerProfile.digitalHabits ?? []).map((item) => `  - ${item}`).join('\n')}
 
 ## Conteúdo Com Maior Interesse E Interação Do Público Ideal
 - Resumo: ${presentation.audienceContentProfile.summary}
 - Formatos preferidos:
 ${presentation.audienceContentProfile.preferredFormats.map((item) => `  - ${item}`).join('\n')}
 - Temas de alta intenção:
 ${presentation.audienceContentProfile.highIntentTopics.map((item) => `  - ${item}`).join('\n')}
 - Drivers de interação:
 ${presentation.audienceContentProfile.interactionDrivers.map((item) => `  - ${item}`).join('\n')}
 - Mix recomendado:
 ${presentation.audienceContentProfile.recommendedContentMix
   .map(
     (item) =>
       `  - ${item.topic} | ${item.format} | ${item.channel} | potencial ${item.engagementPotential}/100 | ${item.whyItWorks}`
   )
   .join('\n')}
 
 ## Oportunidades Práticas Para Fortalecer Posicionamento
 - Oportunidades de posicionamento:
 ${(opportunities?.positioningOpportunities ?? []).map((item) => `  - ${item}`).join('\n')}
 - Ideias de conteúdo:
 ${(opportunities?.contentIdeas ?? []).map((item) => `  - ${item}`).join('\n')}
 - Sugestões de materiais:
 ${(opportunities?.materialSuggestions ?? []).map((item) => `  - ${item}`).join('\n')}
 - Funil de relacionamento:
 ${(opportunities?.relationshipFunnel ?? []).map((item) => `  - ${item}`).join('\n')}
 - Oportunidades em campanhas patrocinadas:
 ${(opportunities?.paidCampaignOpportunities ?? []).map((item) => `  - ${item}`).join('\n')}
 - Oportunidades em email marketing:
 ${(opportunities?.emailMarketingOpportunities ?? []).map((item) => `  - ${item}`).join('\n')}
 - Outras oportunidades práticas:
 ${(opportunities?.otherPracticalOpportunities ?? []).map((item) => `  - ${item}`).join('\n')}
 
 ## Regras de Voz da Marca e Diretrizes de Comunicação
 - **Regras de Voz:**
 ${presentation.brandVoiceRules.map((item) => `  - ${item}`).join('\n')}
 - **O que fazer (Do's):**
 ${voiceDosBlock || '  - Não informado'}
 - **O que NÃO fazer (Dont's):**
 ${voiceDontsBlock || '  - Não informado'}
 
 ## Pilares de Conteúdo
 ${presentation.contentPillars.map((item) => `- ${item}`).join('\n')}
 
 ## Mensagens por Funil
 ${presentation.funnelMessaging.map((item) => `- ${item}`).join('\n')}
 
 ## Plano 30 Dias
 ${presentation.actionPlan30d.map((item) => `- ${item}`).join('\n')}
 
 ## Apresentação Estratégica
 ${slideBlocks}
 
 ## Fontes Analisadas
 ${sourcesBlock}`;
}

export async function generateDnaBrandReport(input: DnaBrandInput): Promise<DnaBrandResult> {
  if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY && !process.env.GEMINI_API_KEY) {
    return {
      success: false,
      error: 'Serviço de IA não configurado no servidor.',
    };
  }

  if (!isInputValid(input)) {
    return {
      success: false,
      error: 'Preencha site, Instagram e LinkedIn para gerar o DNA da Marca.',
    };
  }

  const sources = await Promise.all([
    fetchSource('site', input.siteUrl),
    fetchSource('instagram', input.instagramUrl),
    fetchSource('linkedin', input.linkedinUrl),
  ]);
  try {
    const sourcePayload = sources.map((item) => JSON.stringify(item)).join('\n');
    const siteSource = sources.find((s) => s.label === 'site');
    const extractedColorsHint =
      siteSource?.colors && siteSource.colors.length > 0
        ? `\nCORES HEXADECIMAIS REAIS EXTRAÍDAS DO CÓDIGO FONTE DO SITE (Use como base principal para identificar a paleta real da marca): ${siteSource.colors.join(', ')}\n`
        : '';

    const systemPrompt = 'Você é especialista sênior em branding e posicionamento da NeuroAds. Faça análise profunda com base nas fontes fornecidas. Responda apenas com o JSON válido solicitado, sem blocos explicativos de texto ou tags markdown adicionais.';
    const userPrompt = `Analise profundamente as fontes e monte uma apresentação estratégica completa de DNA da Marca com foco em crescimento previsível e impacto financeiro.
${extractedColorsHint}
Fontes coletadas:
${sourcePayload}

Retorne JSON com esta estrutura EXATA:
{
  "presentationTitle": "string",
  "executiveSummary": "string",
  "positioningStatement": "string",
  "brandArchetype": "Um dos 12 arquétipos de Carl Jung que melhor define a marca (ex: O Criador, O Mago, O Herói, O Governante)",
  "colorPalette": {
    "colors": [
      {
        "hex": "#HEX",
        "name": "Nome da cor (ex: Laranja NeuroAds, Azul Corporativo)",
        "type": "primary | secondary | accent | neutral_light | neutral_dark",
        "usage": "Explicar onde e como essa cor deve ser usada"
      }
    ],
    "psychologicalImpact": "O significado emocional dessas cores e o impacto no público-alvo",
    "contrastAccessibility": "Comentários sobre contraste para legibilidade (ex: texto claro em fundo escuro)",
    "visualStyleDescription": "Estilo visual recomendado para imagens, design e mood da marca"
  },
  "idealCustomerProfile": {
    "headline": "string",
    "segment": "string",
    "companySize": "string",
    "annualRevenueRange": "string",
    "urgencyContext": "string",
    "probabilityScore": 0,
    "needScore": 0,
    "mainPainPoints": ["string", "..."],
    "buyingTriggers": ["string", "..."],
    "fears": ["Pelo menos 3 medos ou barreiras subconscientes do ICP com relação ao produto/nicho"],
    "values": ["Pelo menos 3 valores fundamentais ou crenças do ICP"],
    "digitalHabits": ["Hábitos digitais, canais e fontes de informação preferidos do ICP"]
  },
  "audienceContentProfile": {
    "summary": "string",
    "preferredFormats": ["string", "..."],
    "highIntentTopics": ["string", "..."],
    "interactionDrivers": ["string", "..."],
    "recommendedContentMix": [
      {
        "topic": "string",
        "format": "string",
        "channel": "string",
        "whyItWorks": "string",
        "engagementPotential": 0
      }
    ]
  },
  "practicalOpportunities": {
    "positioningOpportunities": ["string", "..."],
    "contentIdeas": ["string", "..."],
    "materialSuggestions": ["string", "..."],
    "relationshipFunnel": ["string", "..."],
    "paidCampaignOpportunities": ["string", "..."],
    "emailMarketingOpportunities": ["string", "..."],
    "otherPracticalOpportunities": ["string", "..."]
  },
  "brandVoiceRules": ["Regras e diretrizes verbais da voz da marca"],
  "brandVoiceDos": ["Pelo menos 3 diretrizes do que fazer (Como falar)"],
  "brandVoiceDonts": ["Pelo menos 3 diretrizes do que evitar (O que não falar)"],
  "contentPillars": ["string", "..."],
  "funnelMessaging": ["string", "..."],
  "actionPlan30d": ["string", "..."],
  "sourceInsights": ["string", "..."],
  "slides": [
    {
      "title": "string",
      "analysis": "string",
      "recommendations": ["string", "..."],
      "financialImpact": "string"
    }
  ]
}

Regras:
- Seja específico e orientado para execução prática.
- Traduza estratégia para impacto no caixa (aquisição, conversão, retenção, previsibilidade).
- probabilityScore, needScore e engagementPotential devem estar entre 0 e 100.
- As oportunidades práticas devem ser objetivas, acionáveis e alinhadas ao cliente ideal.
- Se alguma fonte estiver fraca/inacessível, sinalize com clareza e proponha contingência.`;

    const result = await generateChatCompletion({
      agentKey: 'juridico',
      systemPrompt,
      userPrompt,
      temperature: 0.55,
    });

    if (!result.success || !result.content) {
      return {
        success: false,
        sources,
        error: result.error || 'Falha ao gerar conteúdo do DNA da Marca.',
      };
    }

    let raw = result.content.trim();
    if (raw.startsWith('```')) {
      raw = raw.replace(/^```(json)?/, '').replace(/```$/, '').trim();
    }

    const presentation = normalizePresentation(JSON.parse(raw));
    const reportMarkdown = buildMarkdown(presentation, sources);

    return {
      success: true,
      presentation,
      reportMarkdown,
      sources,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao gerar DNA da Marca.';
    return {
      success: false,
      sources,
      error: message,
    };
  }
}
