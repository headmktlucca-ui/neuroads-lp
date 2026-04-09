'use server';

import OpenAI from 'openai';
import { TrafficData, generateTrafficAnalystPrompt } from '../../lib/prompt-master';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeTraffic(data: TrafficData) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }

  try {
    const prompt = generateTrafficAnalystPrompt(data);

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é o Analista de Tráfego Sênior da NeuroAds. Sua missão é fornecer diagnósticos brutais, honestos e altamente lucrativos."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0].message.content;

    if (!content) {
      throw new Error('A IA não retornou um conteúdo válido.');
    }

    // Since our prompt asks for structured data (MARKDOWN + Executive Checklists), 
    // we return the raw string to be parsed or displayed by the UI.
    return {
      success: true,
      diagnosis: content,
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    console.error('Error in AI Analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'Falha na conexão com os sistemas neurais.';
    return {
      success: false,
      error: errorMessage,
    };
  }
}
