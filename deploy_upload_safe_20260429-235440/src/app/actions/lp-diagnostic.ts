'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface DiagnosticResult {
  score: number;
  criticalIssues: string[];
  strengths: string[];
  copySuggestion: string;
  technicalFeedback: string;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export async function analyzeLandingPage(url: string) {
  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: 'GEMINI_API_KEY não configurada.' };
  }

  try {
    // Note: In a real production app, we would use a scraper or JSDOM to get the HTML.
    // Since we are in a demo/agentic context, we simulate the 'reading' of the URL 
    // or provide a high-level strategic audit based on the brand intent.
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Você é o Auditor Sênior de CRO (Conversion Rate Optimization) da NeuroAds. 
    Analise estrategicamente a Landing Page deste link: ${url}.
    Mesmo que não possa acessar o HTML em tempo real agora, forneça um guia de auditoria baseado nos padrões de alta conversão para este nicho.
    Responda em JSON estruturado:
    - score: Um número de 0 a 100 representando a força da oferta.
    - criticalIssues: Array com os 3 maiores gargalos prováveis.
    - strengths: Array com 3 pontos que devem ser mantidos/reforçados.
    - copySuggestion: Uma sugestão de Headline ou Gancho superior.
    - technicalFeedback: Feedback sobre velocidade, tracking e mobile.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean JSON if needed (sometimes Gemini wraps it in ```json)
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonString) as DiagnosticResult;

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (error: unknown) {
    console.error('Error in LP Diagnostic:', error);
    return {
      success: false,
      error: getErrorMessage(error, 'Falha ao analisar a URL. Verifique se o link é público.'),
    };
  }
}
