'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { TrafficData, generateTrafficAnalystPrompt } from '../../lib/prompt-master';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function analyzeTraffic(data: TrafficData) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not set in environment variables');
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = generateTrafficAnalystPrompt(data);

    const result = await model.generateContent([
      { text: "Você é o Analista de Tráfego Sênior da NeuroAds. Sua missão é fornecer diagnósticos brutais, honestos e altamente lucrativos." },
      { text: prompt }
    ]);

    const response = await result.response;
    const content = response.text();

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
