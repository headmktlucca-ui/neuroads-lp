'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { 
  KnowledgeLinks, 
  generateCreativePrompt, 
  generateCopyPrompt, 
  generateViralPrompt 
} from "../../lib/creative-suite-prompts";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateCreativeSuiteResult(type: 'creative' | 'copy' | 'viral', links: KnowledgeLinks) {
  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: 'GEMINI_API_KEY is not set in environment variables' };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = '';
    let systemInstruction = '';

    switch (type) {
      case 'creative':
        prompt = generateCreativePrompt(links);
        systemInstruction = "Você é o Diretor de Arte Sênior da NeuroAds. Gere conceitos visuais e copies baseados em dados neurais.";
        break;
      case 'copy':
        prompt = generateCopyPrompt(links);
        systemInstruction = "Você é o Copywriter Master da NeuroAds. Transforme links em argumentos de vendas imbatíveis.";
        break;
      case 'viral':
        prompt = generateViralPrompt(links);
        systemInstruction = "Você é o Estrategista de Viralização da NeuroAds. Identifique padrões de retenção e ganchos explosivos.";
        break;
    }

    const result = await model.generateContent([
      { text: systemInstruction },
      { text: prompt }
    ]);

    const response = await result.response;
    const text = response.text();

    if (!text) {
      throw new Error('A IA não retornou um conteúdo válido.');
    }

    return {
      success: true,
      data: text,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error(`Error in ${type} analysis:`, error);
    return {
      success: false,
      error: error.message || 'Falha na conexão com os sistemas neurais do Gemini.',
    };
  }
}
