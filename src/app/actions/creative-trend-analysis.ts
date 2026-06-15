'use server';

import OpenAI from 'openai';

export type CreativeTrendAnalysisInput = {
  companyName: string;
  brandSegment: string;
  companyObjectives: string[];
  interestThemes: string[];
  preferredChannels: string[];
  toneOfVoice: string;
  additionalGuidance?: string;
};

export type CreativeTrendItem = {
  rank: number;
  title: string;
  whyTrendingNow: string;
  publishedWindow: string;
  sourceSignal: string;
  referenceUrl: string;
  baseFormat: string;
  primaryAngle: string;
  variations: string[];
  positioningForBusiness: string;
  expectedImpact: string;
  recommendedChannel: string;
  ctaSuggestion: string;
  riskNote: string;
  replicabilityScore?: number;
  timelineScripting?: string[];
};

export type CreativeTrendAnalysisResult = {
  success: boolean;
  data?: {
    generatedAt: string;
    executiveSummary: string;
    detectedThemes: string[];
    items: CreativeTrendItem[];
  };
  error?: string;
};

function normalizeStringArray(values: string[]): string[] {
  return values
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, arr) => arr.indexOf(item) === index);
}

function clampItems(items: CreativeTrendItem[]): CreativeTrendItem[] {
  return items.slice(0, 10).map((item, index) => ({
    ...item,
    rank: index + 1,
    variations: (Array.isArray(item.variations) ? item.variations : []).map((variation) => variation.trim()).filter(Boolean).slice(0, 4),
    timelineScripting: (Array.isArray(item.timelineScripting) ? item.timelineScripting : []).map((t) => t.trim()).filter(Boolean).slice(0, 5),
  }));
}

function extractJsonPayload(rawText: string): Record<string, unknown> | null {
  const trimmed = rawText.trim();
  if (!trimmed) return null;

  const withoutFence = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    const parsed = JSON.parse(withoutFence) as Record<string, unknown>;
    return parsed;
  } catch {
    const start = withoutFence.indexOf('{');
    const end = withoutFence.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) return null;
    try {
      const parsed = JSON.parse(withoutFence.slice(start, end + 1)) as Record<string, unknown>;
      return parsed;
    } catch {
      return null;
    }
  }
}

function mapItem(raw: unknown, fallbackRank: number): CreativeTrendItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const variations = Array.isArray(row.variations)
    ? row.variations.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];

  const title = typeof row.title === 'string' ? row.title.trim() : '';
  if (!title) return null;

  const timelineScripting = Array.isArray(row.timelineScripting)
    ? row.timelineScripting.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : [];

  return {
    rank: typeof row.rank === 'number' && Number.isFinite(row.rank) ? row.rank : fallbackRank,
    title,
    whyTrendingNow: typeof row.whyTrendingNow === 'string' ? row.whyTrendingNow.trim() : '',
    publishedWindow: typeof row.publishedWindow === 'string' ? row.publishedWindow.trim() : '',
    sourceSignal: typeof row.sourceSignal === 'string' ? row.sourceSignal.trim() : '',
    referenceUrl: typeof row.referenceUrl === 'string' ? row.referenceUrl.trim() : '',
    baseFormat: typeof row.baseFormat === 'string' ? row.baseFormat.trim() : '',
    primaryAngle: typeof row.primaryAngle === 'string' ? row.primaryAngle.trim() : '',
    variations,
    positioningForBusiness: typeof row.positioningForBusiness === 'string' ? row.positioningForBusiness.trim() : '',
    expectedImpact: typeof row.expectedImpact === 'string' ? row.expectedImpact.trim() : '',
    recommendedChannel: typeof row.recommendedChannel === 'string' ? row.recommendedChannel.trim() : '',
    ctaSuggestion: typeof row.ctaSuggestion === 'string' ? row.ctaSuggestion.trim() : '',
    riskNote: typeof row.riskNote === 'string' ? row.riskNote.trim() : '',
    replicabilityScore: typeof row.replicabilityScore === 'number' ? row.replicabilityScore : 50,
    timelineScripting,
  };
}

export async function generateCreativeTrendAnalysis(
  input: CreativeTrendAnalysisInput
): Promise<CreativeTrendAnalysisResult> {
  if (!process.env.OPENAI_API_KEY) {
    return { success: false, error: 'OPENAI_API_KEY não configurada no servidor.' };
  }

  const companyName = input.companyName.trim() || 'Empresa';
  const brandSegment = input.brandSegment.trim() || 'Segmento não informado';
  const companyObjectives = normalizeStringArray(input.companyObjectives).slice(0, 6);
  const interestThemes = normalizeStringArray(input.interestThemes).slice(0, 12);
  const preferredChannels = normalizeStringArray(input.preferredChannels).slice(0, 8);
  const toneOfVoice = input.toneOfVoice.trim() || 'Tom consultivo e orientado a conversão';
  const additionalGuidance = input.additionalGuidance?.trim() || '';

  if (!interestThemes.length) {
    return {
      success: false,
      error: 'Não foi possível identificar temas de interesse. Gere ou atualize o DNA da Marca antes da análise.',
    };
  }

  const nowIso = new Date().toISOString();
  const userPrompt = [
    `Data/hora atual (UTC): ${nowIso}`,
    `Empresa: ${companyName}`,
    `Segmento da empresa: ${brandSegment}`,
    `Objetivos da empresa: ${companyObjectives.join(' | ') || 'Não informado'}`,
    `Temas de interesse da marca: ${interestThemes.join(' | ')}`,
    `Canais prioritários: ${preferredChannels.join(' | ') || 'Google Ads | Meta Ads | LinkedIn | YouTube'}`,
    `Tom de voz desejado: ${toneOfVoice}`,
    additionalGuidance ? `Orientações adicionais: ${additionalGuidance}` : null,
    'Tarefa: faça pesquisa web com foco em redes sociais (TikTok Creative Center, Meta Ad Library, LinkedIn e YouTube Trends) e monte um estudo robusto com EXATAMENTE 10 exemplos de conteúdos com alto potencial de engajamento e compartilhamento nas últimas 24 horas, alinhados aos temas de interesse da marca.',
    'Obrigatório: priorize conteúdos com sinais reais de tração recente e explique por que cada exemplo é relevante para os objetivos da empresa. Para cada exemplo viral, defina um cronograma detalhado de script do vídeo/formato e um score de replicabilidade.',
    'Não invente links nem sinais. Se não houver confirmação de recência nas últimas 24h para um item, descarte esse item e busque outro.',
    'Segurança e qualidade: não inclua recomendações enganosas, discurso de ódio, manipulação abusiva, promessas irreais, conteúdo ilegal ou sensível sem contexto.',
    'Retorne SOMENTE JSON válido, sem markdown, no formato:',
    `{
  "executiveSummary": "string",
  "detectedThemes": ["string"],
  "items": [
    {
      "rank": 1,
      "title": "string",
      "whyTrendingNow": "string",
      "publishedWindow": "string",
      "sourceSignal": "string",
      "referenceUrl": "https://...",
      "baseFormat": "string",
      "primaryAngle": "string",
      "variations": ["string", "string", "string"],
      "positioningForBusiness": "string",
      "expectedImpact": "string",
      "recommendedChannel": "string",
      "ctaSuggestion": "string",
      "riskNote": "string",
      "replicabilityScore": 0-100,
      "timelineScripting": [
        "0-3s Hook: Descrição da quebra de padrão visual/gancho verbal",
        "3-10s Problema: Agitação da dor do cliente ideal",
        "10-25s Solução: Apresentação sutil do produto/diferencial",
        "25-30s CTA: Chamada para ação objetiva conectada à oferta"
      ]
    }
  ]
}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

    const response = await openai.responses.create({
      model: 'gpt-4o',
      tools: [{ type: 'web_search_preview' }],
      max_output_tokens: 5000,
      input: [
        {
          role: 'system',
          content: [
            {
              type: 'input_text',
              text: 'Você é Diretor de Conteúdo de Alta Conversão da NeuroAds. Faça pesquisa web com rigor de recência (24h), precisão e foco em impacto de negócio.',
            },
          ],
        },
        { role: 'user', content: [{ type: 'input_text', text: userPrompt }] },
      ],
    });

    const payload = extractJsonPayload(response.output_text || '');
    if (!payload) {
      return { success: false, error: 'A resposta da análise veio em formato inválido.' };
    }

    const executiveSummary =
      typeof payload.executiveSummary === 'string' ? payload.executiveSummary.trim() : '';
    const detectedThemes = Array.isArray(payload.detectedThemes)
      ? payload.detectedThemes.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).slice(0, 8)
      : [];
    const itemsRaw = Array.isArray(payload.items) ? payload.items : [];
    const itemsParsed = itemsRaw
      .map((item, index) => mapItem(item, index + 1))
      .filter((item): item is CreativeTrendItem => Boolean(item));
    const items = clampItems(itemsParsed);

    if (items.length < 10) {
      return {
        success: false,
        error: 'Não foi possível confirmar 10 conteúdos relevantes nas últimas 24h. Tente novamente em instantes.',
      };
    }

    return {
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        executiveSummary: executiveSummary || 'Estudo concluído com foco em tendências e conversão.',
        detectedThemes: detectedThemes.length ? detectedThemes : interestThemes.slice(0, 6),
        items,
      },
    };
  } catch (error) {
    console.error('Falha ao gerar análise de criativos:', error);
    return {
      success: false,
      error: 'Falha ao gerar estudo de conteúdos em destaque. Tente novamente em alguns minutos.',
    };
  }
}
