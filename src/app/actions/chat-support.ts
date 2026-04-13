'use server';

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function chatWithSupport(messages: ChatMessage[]) {
  if (!process.env.OPENAI_API_KEY) {
    return {
      success: false,
      error: 'OPENAI_API_KEY não configurada. Por favor, adicione-a ao arquivo .env.local.',
    };
  }

  try {
    const systemPrompt: ChatMessage = {
      role: 'system',
      content: `Você é o Especialista Neural de Suporte da NeuroAds. 
      Sua missão é ajudar usuários da landing page, tirar dúvidas sobre gestão de tráfego, automação de funis e inteligência neural aplicada ao marketing.
      
      Diretrizes:
      1. Seja profissional, prestativo e utilize uma linguagem que remeta à tecnologia e alta performance.
      2. Se o usuário perguntar algo muito específico que você não saiba responder sobre a conta dele ou precisar de suporte técnico humano, sugira clicar no botão "Falar com Humano" (WhatsApp).
      3. Mantenha as respostas concisas e diretas ao ponto.
      4. NeuroAds foca em ROI, escalas previsíveis e tecnologia de ponta.
      
      Não invente preços ou promoções que não foram mencionadas. Se perguntarem sobre preços, direcione-os para o Hub Estratégico ou suporte humano.`,
    };

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [systemPrompt, ...messages],
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage = response.choices[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error('Sem resposta da IA.');
    }

    return {
      success: true,
      content: assistantMessage,
    };
  } catch (error: any) {
    console.error('Support Chat Error:', error);
    return {
      success: false,
      error: 'Ocorreu um erro na conexão com os sistemas neurais. Tente novamente em instantes.',
    };
  }
}
