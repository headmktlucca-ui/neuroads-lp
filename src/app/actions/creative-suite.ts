'use server';

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export interface CreativeResult {
  headlines: string[];
  videoHook: string;
  adCopy: string;
  strategy: string;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export async function generateCreativeSuiteResult(
  input: string | 'creative' | 'copy' | 'viral',
  links?: Record<string, unknown>
) {
  if (!process.env.OPENAI_API_KEY) {
    return { success: false, error: 'OPENAI_API_KEY não configurada no servidor.' };
  }

  // Handle legacy signature (type, links) or new signature (productInfo)
  let productInfo = '';
  if (typeof input === 'string' && links) {
    // Legacy mode: Convert links object to a string for the AI
    productInfo = `Nicho/Tipo: ${input}. Contexto: ${JSON.stringify(links)}`;
  } else if (typeof input === 'string') {
    // New mode: direct string input
    productInfo = input;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Você é o Diretor Criativo e Copywriter Master da NeuroAds. 
          Sua missão é criar anúncios de alta performance baseados em neuro-marketing (gatilhos como Aversão à Perda, Status Social, Ganho Prático e Simplicidade Cognitiva) e resposta direta.
          Sempre responda em formato JSON estruturado com os seguintes campos:
          - headlines: Array com 3 headlines magnéticas (máximo 40 caracteres cada).
          - videoHook: Um gancho explosivo para os primeiros 3 segundos de um vídeo (usando quebra de padrão visual e auditivo).
          - adCopy: Uma copy completa seguindo o framework PAS (Problema, Agitação, Solução) adaptada para capturar atenção e gerar ação rápida.
          - strategy: Uma breve explicação da estratégia neuro-cognitiva utilizada.`
        },
        {
          role: "user",
          content: `Crie uma estratégia de anúncios para o seguinte produto/serviço: ${productInfo}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('Falha na resposta da IA.');

    const result = JSON.parse(content) as CreativeResult;

    // LEGACY COMPATIBILITY: 
    // If called with links, return the copy string in 'data' to avoid breaking 
    // components like CopyGeneratorContainer which expect a string.
    // If called without links (new CreativeStudio), return the full object.
    return {
      success: true,
      data: links ? result.adCopy : result,
      // Provide the other fields in case anyone needs them
      headlines: result.headlines,
      videoHook: result.videoHook,
      adCopy: result.adCopy,
      strategy: result.strategy,
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    console.error(`Error in Creative analysis:`, error);
    return {
      success: false,
      error: getErrorMessage(error, 'Falha na conexão com os sistemas neurais da OpenAI.'),
    };
  }
}

export interface HybridCreativeInput {
  companyName: string;
  brandSegment: string;
  interestThemes: string[];
  toneOfVoice: string;
  channel: string;
  format: string;
  contentType: string;
  styleName: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface HybridCreativeOutput {
  id: string;
  createdAt: number;
  channel: string;
  format: string;
  contentType: string;
  styleName: string;
  title: string;
  concept: string;
  copy: string;
  cta: string;
  headline: string;
  subheading: string;
  backgroundImagePrompt: string;
  backgroundImageUrl: string;
}

// Curated high-quality abstract/studio background images to act as rock-solid premium fallbacks
const CURATED_FALLBACK_IMAGES: Record<string, string[]> = {
  tech: [
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1024', // Abstract premium curve dark slate
    'https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1024', // 3D tech node mesh blue-teal
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1024'  // Cyberpunk clean grey tech
  ],
  minimal: [
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1024', // Minimal studio grey concrete shadow
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1024', // Minimalist premium architecture lines
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1024'  // Calm warm premium abstract horizon
  ],
  wellness: [
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1024', // Zen stones cream warm beige
    'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80&w=1024', // Soft studio warm abstract backdrop
    'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?auto=format&fit=crop&q=80&w=1024'  // Natural leaf shadow aesthetic beige
  ],
  brutalism: [
    'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=1024', // Brutalist abstract high-contrast art
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80&w=1024', // 3D geometric high-contrast floating shapes
    'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=1024'  // Solid red/orange modern gradient flow
  ]
};

function getRandomFallback(style: string): string {
  const normalized = style.toLowerCase();
  let key = 'tech';
  if (normalized.includes('wellness') || normalized.includes('beleza') || normalized.includes('saúde') || normalized.includes('natural')) {
    key = 'wellness';
  } else if (normalized.includes('minimal') || normalized.includes('clean') || normalized.includes('corporativo')) {
    key = 'minimal';
  } else if (normalized.includes('brutalista') || normalized.includes('brutalist') || normalized.includes('negrito') || normalized.includes('bold')) {
    key = 'brutalism';
  }
  const list = CURATED_FALLBACK_IMAGES[key] || CURATED_FALLBACK_IMAGES.tech;
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}

export async function generateHybridCreative(input: HybridCreativeInput) {
  if (!process.env.OPENAI_API_KEY) {
    return { success: false, error: 'OPENAI_API_KEY não configurada no servidor.' };
  }

  const {
    companyName,
    brandSegment,
    interestThemes,
    toneOfVoice,
    channel,
    format,
    contentType,
    styleName
  } = input;

  const promptText = `
    Empresa: ${companyName}
    Segmento: ${brandSegment}
    Temas de Interesse: ${interestThemes.join(', ')}
    Tom de Voz: ${toneOfVoice}
    Canal de Veiculação: ${channel}
    Formato: ${format}
    Tipo de Conteúdo/Funil: ${contentType}
    Estilo de Design: ${styleName}
    Cores da Marca: Primária ${input.primaryColor || '#FF6B00'}, Secundária ${input.secondaryColor || '#111827'}
  `;

  try {
    // 1. Generate text strategy & visual prompts
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Você é o Diretor Criativo e de Arte da NeuroAds.
          Sua missão é criar anúncios híbridos de altíssima performance para Meta Ads, Google Ads e LinkedIn Ads.
          Sempre responda em formato JSON estruturado com os seguintes campos:
          - title: Título curto identificador do criativo.
          - concept: Ideia conceitual e psicológica por trás da arte.
          - copy: A copy completa do anúncio (legenda primária ou corpo).
          - cta: Chamada para ação objetiva (máximo 25 caracteres).
          - headline: Uma headline magnética extremamente curta de impacto para ser estampada no meio do banner/arte (máximo 40 caracteres, letras maiúsculas e minúsculas).
          - subheading: Um subtítulo curto ou frase de apoio para ser estampada logo abaixo da headline (máximo 60 caracteres).
          - backgroundImagePrompt: Um prompt detalhado, em inglês, para gerar a imagem de fundo ideal usando o DALL-E 3. O prompt NÃO deve conter nenhum texto sobreposto, logos ou marcas. Deve focar apenas no fundo estético, incorporando de forma harmônica e elegante as cores da marca fornecidas (primária ${input.primaryColor || '#FF6B00'} e secundária ${input.secondaryColor || '#111827'}). Exemplo: "Premium 3D abstract studio background with smooth curves, incorporating subtle highlights of the primary color and deep gradients of the secondary color, minimalist, professional studio lighting, deep textures, no text". Evite rostos realistas ou elementos complexos para garantir que o texto sobreposto fique perfeitamente legível.`
        },
        {
          role: "user",
          content: `Crie a estratégia de criativo visual híbrido para os seguintes dados: ${promptText}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error('Falha na resposta do gerador de texto por IA.');

    const parsedResult = JSON.parse(content) as {
      title: string;
      concept: string;
      copy: string;
      cta: string;
      headline: string;
      subheading: string;
      backgroundImagePrompt: string;
    };

    // 2. Generate the background image using DALL-E 3 (with error fallback)
    let backgroundUrl = '';
    let usedDalle = false;

    try {
      // Clean and polish prompt for DALL-E 3
      const cleanPrompt = parsedResult.backgroundImagePrompt.trim() + ", clean, high resolution, professional photography, studio lighting, commercial style, 8k resolution, photorealistic, no text, no letters, no words, no watermark, no logos";
      
      const imageResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: cleanPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard"
      });

      if (imageResponse.data && imageResponse.data[0]?.url) {
        backgroundUrl = imageResponse.data[0].url;
        usedDalle = true;
      }
    } catch (imageError) {
      console.warn("DALL-E 3 generation failed or was throttled, falling back to curated premium stock:", imageError);
    }

    // If DALL-E failed or returned empty, get a gorgeous style-matched fallback from Unsplash
    if (!backgroundUrl) {
      backgroundUrl = getRandomFallback(styleName + ' ' + brandSegment);
    }

    const output: HybridCreativeOutput = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: Date.now(),
      channel,
      format,
      contentType,
      styleName,
      title: parsedResult.title || `${companyName}: Criativo ${contentType}`,
      concept: parsedResult.concept || 'Conceito focado em clareza e neuro-marketing.',
      copy: parsedResult.copy || 'Destaque o principal diferencial da sua marca.',
      cta: parsedResult.cta || 'Saiba Mais',
      headline: parsedResult.headline || 'DIGITE SUA HEADLINE AQUI',
      subheading: parsedResult.subheading || 'Escreva o subtítulo da sua oferta para tráfego.',
      backgroundImagePrompt: parsedResult.backgroundImagePrompt,
      backgroundImageUrl: backgroundUrl
    };

    return {
      success: true,
      data: output,
      usedDalle,
      timestamp: new Date().toISOString()
    };

  } catch (error: unknown) {
    console.error(`Error in generateHybridCreative:`, error);
    return {
      success: false,
      error: getErrorMessage(error, 'Falha ao processar criativo neural híbrido. Tente novamente.')
    };
  }
}

