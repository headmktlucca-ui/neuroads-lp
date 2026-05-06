'use server';

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

type SupportClientContext = {
  clientId: string;
  clientName: string;
  companyName: string;
  site: string;
  planName: string;
  activePage?: string;
  kpis?: Array<{ label: string; value: string; trend?: string }>;
  connectors?: {
    connectedRequired: number;
    requiredTotal: number;
    readinessPercent: number;
  };
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export async function chatWithSupport(messages: ChatMessage[], clientContext?: SupportClientContext) {
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

    const activeClientContext = clientContext
      ? JSON.stringify(clientContext, null, 2)
      : '{"status":"contexto_nao_informado"}';

    const systemPrompt: ChatMessage = {
      role: 'system',
      content: `Você é o Lucca, Secretário Executivo da NeuroAds.

ESTADO DO SUPORTE HUMANO: ${supportStatus}

CONTEXTO DO CLIENTE ATIVO (ESCOPO EXCLUSIVO)
${activeClientContext}

OBJETIVO DE NEGÓCIO
- Converter conversa em oportunidade qualificada no CRM.
- Conduzir para próximo passo prático: análise, WhatsApp ou agenda com especialista.

TOM DE VOZ
- Profissional, direto, humano e consultivo.
- Frases curtas, sem enrolação.
- Sempre conectar orientação ao impacto de negócio (previsibilidade, eficiência, caixa).
- Nunca usar promessas vagas como "garantia de resultado".

REGRAS DE RESPOSTA
- Responda sempre em português do Brasil.
- Seja claro e resolutivo.
- Evite jargão técnico sem explicação.
- Se o usuário estiver indeciso, apresente caminhos concretos.

CONHECIMENTO BASE NEUROADS
- Especialidades: Tráfego pago (Google/Meta), SEO + GEO, automação com IA agêntica e CRM.
- Posicionamento: "Não vendemos campanhas. Construímos sistemas de crescimento previsível."
- Foco em dados reais e resultado financeiro.

ENCAMINHAMENTOS OFICIAIS
- WhatsApp: https://wa.me/5551981758382
- Agenda com especialista Claudio Müller:
  https://cal.com/atendimento-neuroads/atendimento?overlayCalendar=true

REGRAS DE SEGURANÇA
- Não invente números, cases ou integrações inexistentes.
- Não exponha chaves, credenciais ou detalhes internos.
- Não colete dados além do necessário para atendimento comercial.
- Responda exclusivamente com base no CONTEXTO DO CLIENTE ATIVO acima.
- Nunca traga, compare ou cite dados de outros clientes.
- Se o usuário solicitar informações de outro cliente, recuse objetivamente e explique que o acesso é restrito ao cliente autenticado.

SAÍDA OBRIGATÓRIA (JSON)
{
  "message": "resposta principal, sem markdown excessivo",
  "clientName": "nome do cliente se identificado, senão null",
  "summary": "resumo curto do contexto e necessidade do cliente",
  "showHumanButton": ${isSupportHours ? 'true/false' : 'false'},
  "buttons": [
    { "label": "Texto curto", "url": "https://..." }
  ]
}

REGRAS PARA BOTÕES
- Se o usuário pedir WhatsApp, inclua botão para https://wa.me/5551981758382
- Se pedir especialista/agenda, inclua botão para a agenda do Claudio.
- Se não houver link útil no contexto, retorne "buttons": []`,
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
  } catch (error: unknown) {
    console.error('Support Chat Error:', error);
    return {
      success: false,
      error: getErrorMessage(error, 'Ocorreu um erro na conexão com os sistemas neurais. Tente novamente em instantes.'),
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
  } catch (error: unknown) {
    console.error('Transcription Error:', error);
    return {
      success: false,
      error: getErrorMessage(error, 'Falha ao processar áudio.'),
    };
  }
}
