'use server';

import OpenAI from 'openai';
import { getAdminDb } from '../../lib/firebase-admin';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export type LuccaHubContext = {
  userName: string;
  companyName?: string;
  site?: string;
  userId?: string;
  connectedSources?: string[];    // e.g. ['Meta Ads', 'Google Ads']
  disconnectedSources?: string[]; // e.g. ['TikTok Ads', 'LinkedIn Ads']
  activeAgents?: string[];
  recentMetrics?: Array<{ label: string; value: string; trend?: string }>;
};

export type LuccaHubResponse = {
  success: boolean;
  message?: string;
  nextSteps?: string[];
  leftPanelData?: LuccaLeftPanelData | null;
  dataAccessWarning?: string | null; // shown when data couldn't be fetched
  error?: string;
};

export type LuccaLeftPanelData = {
  title: string;
  badge?: string;
  description?: string;
  tableHeaders?: string[];
  tableRows?: Array<Record<string, string>>;
  analysisItems?: string[];
  analysisTitle?: string;
  isSimulated?: boolean; // true when data is fictional/illustrative
};

/* ── Load recent KB chat history from Firestore (server-side) ── */
async function loadRecentChatHistory(userId: string): Promise<string> {
  try {
    const db = getAdminDb();
    // Fetch the 3 most recent chat sessions to use as KB context
    const sessionsSnap = await db
      .collection('users')
      .doc(userId)
      .collection('chat_sessions')
      .orderBy('updatedAtMs', 'desc')
      .limit(3)
      .get();

    if (sessionsSnap.empty) return '';

    const summaries: string[] = [];
    sessionsSnap.docs.forEach((docSnap) => {
      const data = docSnap.data();
      const msgs = (data.messages || []) as Array<{ role: string; text: string }>;
      if (msgs.length < 2) return;

      // Extract key exchanges (user Q + assistant A pairs)
      const exchanges: string[] = [];
      for (let i = 0; i < msgs.length - 1 && exchanges.length < 3; i++) {
        const m = msgs[i];
        const next = msgs[i + 1];
        if (m.role === 'user' && next.role === 'assistant') {
          exchanges.push(
            `• Usuário perguntou: "${m.text.slice(0, 120)}"\n  Lucca respondeu: "${next.text.slice(0, 200)}"`
          );
        }
      }
      if (exchanges.length > 0) {
        summaries.push(`Sessão "${data.title || 'sem título'}":\n${exchanges.join('\n')}`);
      }
    });

    return summaries.length > 0
      ? `HISTÓRICO RECENTE DE CONVERSAS (Base de Conhecimento):\n${summaries.join('\n\n')}`
      : '';
  } catch {
    return '';
  }
}

/* ── Build the data-access status block for the system prompt ── */
function buildDataAccessBlock(
  connected: string[],
  disconnected: string[]
): { block: string; hasRealData: boolean } {
  const hasRealData = connected.length > 0;

  const block = hasRealData
    ? `FONTES DE DADOS CONECTADAS (dados reais disponíveis):
${connected.map((s) => `• ${s} ✓`).join('\n')}
${disconnected.length > 0
    ? `\nFONTES NÃO CONECTADAS (sem acesso a dados reais):
${disconnected.map((s) => `• ${s} — não conectada`).join('\n')}`
    : ''}`
    : `ATENÇÃO — NENHUMA FONTE DE DADOS CONECTADA:
${disconnected.map((s) => `• ${s}`).join('\n')}
O usuário ainda não conectou nenhuma plataforma. Use dados ILUSTRATIVOS e deixe claro que são exemplos simulados.`;

  return { block, hasRealData };
}

/* ── Main chat action ── */
export async function chatWithLuccaHub(
  messages: ChatMessage[],
  context: LuccaHubContext
): Promise<LuccaHubResponse> {
  // ─── No API Key: informative fallback ───────────────────────────────────
  if (!process.env.OPENAI_API_KEY) {
    const hasConnections = (context.connectedSources?.length ?? 0) > 0;
    return {
      success: true,
      message: hasConnections
        ? `Olá, **${context.userName}**! Identifiquei que você tem **${context.connectedSources?.join(', ')}** conectados.\n\nPorém, meu motor de IA (OpenAI) não está configurado no ambiente. Para ativar análises em tempo real, adicione **OPENAI_API_KEY** ao arquivo \`.env.local\`.`
        : `Olá, **${context.userName}**! Ainda não identifiquei fontes de dados conectadas na sua conta.\n\nPara que eu possa entregar análises reais de performance, conecte pelo menos uma plataforma de mídia em **Integrações**. Enquanto isso, posso trabalhar com dados ilustrativos.`,
      nextSteps: [
        'Conectar Meta Ads em Integrações',
        'Conectar Google Ads em Integrações',
        'Ver oportunidades detectadas pelos Agentes',
        'Configurar alertas automáticos de performance',
      ],
      dataAccessWarning: 'Motor de IA offline — OPENAI_API_KEY não configurada.',
      leftPanelData: null,
    };
  }

  // ─── Load KB context from Firestore ─────────────────────────────────────
  const kbContext = context.userId
    ? await loadRecentChatHistory(context.userId)
    : '';

  const connected = context.connectedSources ?? [];
  const disconnected = context.disconnectedSources ?? [];
  const { block: dataAccessBlock, hasRealData } = buildDataAccessBlock(connected, disconnected);

  // ─── System prompt ────────────────────────────────────────────────────────
  const systemPrompt: ChatMessage = {
    role: 'system',
    content: `Você é o **Lucca**, Agente Consultor de Marketing com IA da NeuroAds.
Especialista em performance digital: campanhas pagas, ROAS, CPA, criativos, audiências, CRM e atribuição.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERFIL DO USUÁRIO:
- Nome: ${context.userName}
- Empresa: ${context.companyName || 'não informada'}
- Site: ${context.site || 'não informado'}
- Agentes ativos: ${context.activeAgents?.join(', ') || 'não informado'}
${context.recentMetrics?.length ? `- Métricas recentes: ${JSON.stringify(context.recentMetrics)}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${dataAccessBlock}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${kbContext ? kbContext + '\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' : ''}

REGRAS DE ACESSO A DADOS:
1. Se ${hasRealData ? 'a fonte pedida ESTÁ conectada' : 'NENHUMA fonte está conectada'}:
   ${hasRealData
     ? '— Use os dados reais disponíveis. Se precisar de uma plataforma específica não conectada, indique qual está faltando.'
     : '— SEMPRE avise que os dados são SIMULADOS. Use valores realistas mas marcados como "dados ilustrativos".'}
2. Quando usar dados simulados:
   — Deixe claro no início: "⚠️ Dados abaixo são ilustrativos (sem integração ativa para [plataforma])"
   — Ofereça 4 opções concretas como próximos passos, incluindo conectar a fonte real
3. Priorize o histórico da Base de Conhecimento para personalizar respostas

INSTRUÇÕES DE RESPOSTA:
- Profissional, consultivo, direto — máximo 4 parágrafos
- Use dados concretos e números (reais se disponíveis, simulados se não)
- Explique SEMPRE o "por quê" das recomendações
- Responda em português do Brasil
- Use **negrito** para termos importantes, • para listas

FORMATO DE SAÍDA — JSON OBRIGATÓRIO E VÁLIDO:
{
  "message": "resposta principal — pode usar **negrito**, • listas, \\n para quebras. Se dados simulados, comece com '⚠️ Dados ilustrativos — [plataforma] não conectada.'",
  "dataAccessWarning": null,
  "isSimulated": ${!hasRealData},
  "nextSteps": [
    "ação específica 1",
    "ação específica 2",
    "ação específica 3",
    "ação específica 4"
  ],
  "leftPanel": {
    "title": "título do painel ou null",
    "badge": "Meta Ads | Google Ads | Multi-Canal | Simulado ou null",
    "description": "resumo do que está sendo exibido ou null",
    "tableHeaders": ["Col1", "Col2"] ou null,
    "tableRows": [{"Col1": "valor"}] ou null (máx 6 linhas),
    "analysisTitle": "Análise" ou null,
    "analysisItems": ["insight 1", "insight 2"] ou null,
    "isSimulated": ${!hasRealData}
  }
}

REGRAS CRÍTICAS:
- JSON DEVE ser válido e completo
- nextSteps DEVE ter EXATAMENTE 4 itens
- Se dados simulados, leftPanel.badge deve incluir "(Simulado)"
- Se não há dados tabulares relevantes, leftPanel.title = null
- Responda SOMENTE com o JSON`,
  };

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [systemPrompt, ...messages],
      temperature: 0.65,
      max_tokens: 1400,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw) as {
      message?: string;
      dataAccessWarning?: string | null;
      isSimulated?: boolean;
      nextSteps?: string[];
      leftPanel?: {
        title?: string | null;
        badge?: string | null;
        description?: string | null;
        tableHeaders?: string[] | null;
        tableRows?: Array<Record<string, string>> | null;
        analysisTitle?: string | null;
        analysisItems?: string[] | null;
        isSimulated?: boolean;
      } | null;
    };

    const leftPanelData: LuccaLeftPanelData | null = parsed.leftPanel?.title
      ? {
          title: parsed.leftPanel.title,
          badge: parsed.leftPanel.badge ?? undefined,
          description: parsed.leftPanel.description ?? undefined,
          tableHeaders: parsed.leftPanel.tableHeaders ?? undefined,
          tableRows: parsed.leftPanel.tableRows ?? undefined,
          analysisTitle: parsed.leftPanel.analysisTitle ?? undefined,
          analysisItems: parsed.leftPanel.analysisItems ?? undefined,
          isSimulated: parsed.leftPanel.isSimulated ?? !hasRealData,
        }
      : null;

    return {
      success: true,
      message: parsed.message || 'Desculpe, não consegui gerar uma resposta.',
      nextSteps:
        parsed.nextSteps?.length === 4
          ? parsed.nextSteps
          : [
              'Analisar ROAS das últimas 4 semanas',
              'Identificar campanhas abaixo da meta de CPA',
              'Ver criativos com maior CTR',
              'Conectar fontes de dados em Integrações',
            ],
      leftPanelData,
      dataAccessWarning: parsed.dataAccessWarning ?? null,
    };
  } catch (err) {
    console.error('[chatWithLuccaHub]', err);
    return {
      success: false,
      error: 'Erro ao processar sua mensagem. Tente novamente.',
    };
  }
}
