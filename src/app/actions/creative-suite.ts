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

export async function generateCreativeSuiteResult(
  input: string | 'creative' | 'copy' | 'viral', 
  links?: any
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
          Sua missão é criar anúncios de alta performance baseados em neuro-marketing e resposta direta.
          Sempre responda em formato JSON estruturado com os seguintes campos:
          - headlines: Array com 3 headlines magnéticas (máximo 40 caracteres cada).
          - videoHook: Um gancho explosivo para os primeiros 3 segundos de um vídeo.
          - adCopy: Uma copy completa seguindo o framework PAS (Problema, Agitação, Solução).
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
  } catch (error: any) {
    console.error(`Error in Creative analysis:`, error);
    return {
      success: false,
      error: error.message || 'Falha na conexão com os sistemas neurais da OpenAI.',
    };
  }
}
