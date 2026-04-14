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
    // Get current time in Brasilia (UTC-3)
    const now = new Date();
    const utcOffset = now.getTimezoneOffset(); // offset in minutes
    // Adjust for BRT (UTC-3) regardless of server location
    const brtTime = new Date(now.getTime() + (utcOffset - 180) * 60000);
    
    const day = brtTime.getDay(); // 0 (Sun) to 6 (Sat)
    const hour = brtTime.getHours();
    
    const isWeekday = day >= 1 && day <= 5;
    const isSupportHours = isWeekday && ((hour >= 8 && hour < 12) || (hour >= 14 && hour < 18));
    
    // Status message for the prompt
    const supportStatus = isSupportHours 
      ? "ATENDIMENTO HUMANO DISPONÍVEL (VIA WHATSAPP)" 
      : "ATENDIMENTO HUMANO INDISPONÍVEL (SOMENTE AGENDAMENTO VIA CAL.COM)";

    const systemPrompt: ChatMessage = {
      role: 'system',
      content: `Você é o Lucca, um Secretário Executivo com alta experiência na NeuroAds. 
Sua postura é impecável, profissional, proativa e extremamente resolutiva.

ESTADO ATUAL DO SUPORTE: ${supportStatus}

SUA MISSÃO:
1. COMPREENSÃO PROFUNDA: Entenda exatamente o problema, dificuldade ou motivo do contato do usuário.
2. RESOLUÇÃO PROATIVA: Use todo seu conhecimento para RESOLVER o atendimento ali mesmo. Não transfira o usuário sem antes tentar solucionar a dúvida de forma técnica e consultiva.
3. FILTRO DE QUALIDADE (SDR): Se a questão for complexa ou exigir intervenção humana, siga o fluxo:
   - Capte o NOME do usuário.
   - Gere o "summary" (resumo técnico) da necessidade.
   - Ofereça o direcionamento correto baseado no horário.

REGRAS DE DIRECIONAMENTO:
- SE ${isSupportHours ? 'VERDADEIRO' : 'FALSO'} (Atendimento Online): Ofereça o botão "Falar com Especialista" (WhatsApp).
- SE ${isSupportHours ? 'FALSO' : 'VERDADEIRO'} (Atendimento Offline): Explique que o time está em pausa ou fora do horário e ofereça o botão "Agendar Horário" com o Cláudio Müller.

REGRAS PARA LINKS E BOTÕES:
- NUNCA envie links (URLs) diretamente no campo "message".
- Sempre use o campo "buttons".
- Link da agenda: https://cal.com/atendimento-neuroads/atendimento
- O botão de WhatsApp deve ser ativado via "showHumanButton": true E também pode ser um botão manual no array "buttons" se você julgar pertinente.

VOCÊ DEVE RESPONDER SEMPRE NO SEGUINTE FORMATO JSON:
{
  "message": "Sua resposta executiva e resolutiva (SEM links no texto!)",
  "clientName": "O nome capturado",
  "summary": "Resumo objetivo da dor/contexto",
  "showHumanButton": ${isSupportHours ? 'true/false' : 'false'},
  "buttons": [
    { "label": "Texto do Botão", "url": "URL_AQUI" }
  ]
}`,
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
    const buttons = assistantData.buttons || [];

    if (!assistantMessage) {
      throw new Error('Sem resposta da IA.');
    }

    return {
      success: true,
      content: assistantMessage,
      showHumanButton: showHumanButton,
      clientName: clientName,
      summary: summary,
      buttons: buttons,
    };
  } catch (error: any) {
    console.error('Support Chat Error:', error);
    return {
      success: false,
      error: 'Ocorreu um erro na conexão com os sistemas neurais. Tente novamente em instantes.',
    };
  }
}

export async function transcribeAudio(formData: FormData) {
  if (!process.env.OPENAI_API_KEY) {
    return { success: false, error: 'API Key não configurada.' };
  }

  try {
    const file = formData.get('audio') as File;
    if (!file) throw new Error('Nenhum arquivo de áudio enviado.');

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'pt',
    });

    return {
      success: true,
      text: transcription.text,
    };
  } catch (error: any) {
    console.error('Transcription Error:', error);
    return {
      success: false,
      error: 'Falha ao processar áudio.',
    };
  }
}
