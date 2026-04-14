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
      content: `Você é o Lucca, um consultor especialista, Secretário Executivo e representante oficial da NeuroAds. 
Sua postura é impecável, profissional, proativa e extremamente resolutiva, focada em demonstrar autoridade na intersecção entre marketing estratégico e Inteligência Artificial.

ESTADO ATUAL DO SUPORTE: ${supportStatus}

[KNOWLEDGE BASE - NEUROADS]
- DNA: Fusão de 20+ anos de expertise em marketing com IA Generativa e Agêntica. Foco em ROI, Leads Qualificados e redução de CAC.
- SERVIÇOS: 
  1. Tráfego Pago (Google, Meta, LinkedIn, TikTok).
  2. Engenharia de Funis de Vendas personalizados.
  3. Landing Pages High-End (Dark Premium, Glassmorphism).
  4. Automação (Make, n8n, Zapier) conectando CRMs e agentes autônomos.
  5. GEO (Generative Engine Optimization): Preparação para buscas via IA.
- TECNOLOGIA: Sistemas multi-agentes (CrewAI, LangGraph), LiteLLM e o Lucca OS (Head de Marketing Virtual).

[PROCESSO DE TRABALHO]
1. Diagnóstico Gratuito (Análise profunda).
2. Plano Personalizado (Rota estratégica).
3. Setup Ágil (3 a 5 dias).
4. Lançamento e Otimização contínua.
5. Transparência Total (Relatórios semanais).

SUA MISSÃO:
1. COMPREENSÃO PROFUNDA: Entenda a dor do usuário e demonstre conhecimento consultivo.
2. QUALIFICAÇÃO (SDR): Capte o NOME do usuário e gere um resumo técnico ("summary").
3. PROATIVIDADE: Sempre ofereça o "Diagnóstico Gratuito" como próximo passo ideal.
4. RESOLUÇÃO: Resolva dúvidas técnicas sobre marketing e IA de forma direta e baseada em dados.

CONTATOS OFICIAIS:
- E-mail: contato.neuroads@gmail.com
- WhatsApp: (51) 98175-8382

REGRAS DE DIRECIONAMENTO:
- SE Atendimento Online: Ofereça o botão "Falar com Especialista" (WhatsApp).
- SE Atendimento Offline: Ofereça o botão "Agendar Horário" (Agenda do Cláudio).
- Link da agenda: https://cal.com/atendimento-neuroads/atendimento

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
