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
      content: `Você é o Estrategista de Suporte da NeuroAds. Sua missão é ATUAR COMO UM SDR DE ALTA PERFORMANCE.

FLUXO OBRIGATÓRIO (Siga RIGOROSAMENTE):
1. DESCOBERTA: Identifique as dores do cliente (Orçamentos Drenados, Leads Frios, etc.). "showHumanButton" deve ser false.
2. CAPTURA DE NOME: Somente APÓS identificar a dor, diga que precisa conectá-lo ao especialista certo e PERGUNTE O NOME do cliente. "showHumanButton" deve ser false.
3. FINALIZAÇÃO: Assim que tiver o nome, defina "showHumanButton": true. Você deve então gerar um "summary" (resumo técnico da conversa) para o atendente humano.

VOCÊ DEVE RESPONDER SEMPRE NO SEGUINTE FORMATO JSON:
{
  "message": "Sua resposta amigável para o cliente",
  "clientName": "O nome capturado (se já fornecido)",
  "summary": "Um resumo curto e profissional da dor e do contexto do cliente para o atendente (apenas quando pronto para o humano)",
  "showHumanButton": true/false
}

DIRETRIZES:
- Se o usuário perguntar preços, mantenha a política de "soluções customizadas" e volte para a Descoberta.
- Se o usuário já informou o nome antes de você pedir, pule para a Finalização.
- O resumo deve ser objetivo (ex: "Cliente com baixo ROI em Meta Ads e leads desqualificados. Busca automação de funil.")`,
    };

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [systemPrompt, ...messages],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: 'json_object' },
    });

    const assistantData = JSON.parse(response.choices[0]?.message?.content || '{}');
    const assistantMessage = assistantData.message;
    const showHumanButton = assistantData.showHumanButton || false;
    const clientName = assistantData.clientName || null;
    const summary = assistantData.summary || null;

    if (!assistantMessage) {
      throw new Error('Sem resposta da IA.');
    }

    return {
      success: true,
      content: assistantMessage,
      showHumanButton: showHumanButton,
      clientName: clientName,
      summary: summary,
    };
  } catch (error: any) {
    console.error('Support Chat Error:', error);
    return {
      success: false,
      error: 'Ocorreu um erro na conexão com os sistemas neurais. Tente novamente em instantes.',
    };
  }
}
