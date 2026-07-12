'use server';

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { getAdminDb } from '../../lib/firebase-admin';
import { getTeamAgentById, TEAM_AGENTS } from '../../data/team-agents';
import { describeConnections } from '../../lib/connectors';
import { buildOperationBlock } from '../../lib/operation-prompt';
import { retrieveRelevantReports, retrieveRelevantChatSessions } from '../../lib/knowledge-rag';
import { fetchGoogleAdsContext, fetchMetaAdsContext, fetchSearchConsoleContext } from '../../lib/connector-collectors';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Fallback legado quando ANTHROPIC_API_KEY não está configurada
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/* ── Roteamento por classe de operação ──────────────────────────────
   Leve (chat livre/refino)  → Haiku 4.5  (rápido e barato)
   Operação ativa            → Sonnet 5   (+ web search nativo)     */
const MODEL_LIGHT = 'claude-haiku-4-5';
const MODEL_OPERATION = 'claude-sonnet-5';

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
  agentId?: string;
  specialty?: string;             // operação/especialidade ativa (Acessar Operação)
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
  /** Fontes efetivamente usadas na geração (rastreabilidade — protocolo de operação) */
  sources?: string[];
};

/* ══════════════════════════════════════════════════════════════════
   BASE DE CONHECIMENTO (Firestore, server-side)
   users/{uid}/agent_reports  → relatórios gerados pelos Agentes
   users/{uid}/chat_sessions  → conversas anteriores com os Agentes
══════════════════════════════════════════════════════════════════ */

async function loadAgentReports(userId: string, queryText: string): Promise<string> {
  const relevant = await retrieveRelevantReports(userId, queryText, 5);
  if (relevant.length === 0) return '';

  const entries = relevant.map((r) => {
    const date = r.createdAtMs ? new Date(r.createdAtMs).toLocaleDateString('pt-BR') : 'sem data';
    return `• [${r.agentTitle}] "${r.reportTitle}" (${date}):\n${r.reportContent.slice(0, 600)}${r.reportContent.length > 600 ? '…' : ''}`;
  });

  return `RELATÓRIOS REAIS DOS AGENTES (Base de Conhecimento — recuperados por relevância ao pedido atual; use como fonte primária):\n${entries.join('\n\n')}`;
}

async function loadRecentChatHistory(userId: string, queryText: string): Promise<string> {
  const relevant = await retrieveRelevantChatSessions(userId, queryText, 3);
  if (relevant.length === 0) return '';

  const summaries = relevant.map((s) => {
    const exchanges = s.exchanges.map(
      (e) => `• Usuário perguntou: "${e.userText.slice(0, 120)}"\n  Resposta dada: "${e.assistantText.slice(0, 200)}"`
    );
    return `Sessão "${s.title}":\n${exchanges.join('\n')}`;
  });

  return `HISTÓRICO RECENTE DE CONVERSAS (Base de Conhecimento — recuperado por relevância ao pedido atual):\n${summaries.join('\n\n')}`;
}

/* ══════════════════════════════════════════════════════════════════
   PERFIL + CANAIS (Firestore, server-side — fonte da verdade)
══════════════════════════════════════════════════════════════════ */

type UserSnapshot = {
  connected: string[];
  disconnected: string[];
  activeAgents: string[];
  activeAutomations: string[];
  ga4Connection: { accessToken?: string; accountId?: string } | null;
  googleAdsConnection: { accessToken?: string; accountId?: string; loginCustomerId?: string } | null;
  metaAdsConnection: { accessToken?: string; accountId?: string } | null;
  searchConsoleConnection: { accessToken?: string; accountId?: string } | null;
  instagram?: string;
  linkedin?: string;
  tiktok?: string;
  blog?: string;
};

async function loadUserSnapshot(userId: string): Promise<UserSnapshot | null> {
  try {
    const db = getAdminDb();
    const doc = await db.collection('users').doc(userId).get();
    if (!doc.exists) return null;
    const data = doc.data() as Record<string, unknown>;

    const rawConnections = (data.connections ?? {}) as Record<
      string,
      { isActive?: boolean; accessToken?: string; accountId?: string; loginCustomerId?: string } | undefined
    >;
    const { connected, disconnected } = describeConnections(rawConnections);

    const activeAgents: string[] = [];
    const agentsMap = (data.activeAgents ?? {}) as Record<string, { isActive?: boolean } | undefined>;
    Object.entries(agentsMap).forEach(([title, value]) => {
      if (value?.isActive) activeAgents.push(title);
    });

    const activeAutomations: string[] = [];
    const automationsMap = (data.automations ?? {}) as Record<
      string,
      { status?: string; agentTitle?: string; cadenceTitle?: string } | undefined
    >;
    Object.entries(automationsMap).forEach(([key, value]) => {
      if (value?.status === 'active') {
        activeAutomations.push(`${value.agentTitle || key}${value.cadenceTitle ? ` (${value.cadenceTitle})` : ''}`);
      }
    });

    const ga4 = rawConnections['ga4'];
    const ga4Connection = ga4?.isActive
      ? { accessToken: ga4.accessToken, accountId: ga4.accountId }
      : null;

    const googleAds = rawConnections['google_ads'];
    const googleAdsConnection = googleAds?.isActive
      ? { accessToken: googleAds.accessToken, accountId: googleAds.accountId, loginCustomerId: googleAds.loginCustomerId }
      : null;

    const metaAds = rawConnections['meta_ads'];
    const metaAdsConnection = metaAds?.isActive
      ? { accessToken: metaAds.accessToken, accountId: metaAds.accountId }
      : null;

    const searchConsole = rawConnections['search_console'];
    const searchConsoleConnection = searchConsole?.isActive
      ? { accessToken: searchConsole.accessToken, accountId: searchConsole.accountId }
      : null;

    const toStringValue = (val: unknown) => typeof val === 'string' ? val.trim() : '';

    return {
      connected,
      disconnected,
      activeAgents,
      activeAutomations,
      ga4Connection,
      googleAdsConnection,
      metaAdsConnection,
      searchConsoleConnection,
      instagram: toStringValue(data.instagram),
      linkedin: toStringValue(data.linkedin),
      tiktok: toStringValue(data.tiktok),
      blog: toStringValue(data.blog),
    };
  } catch {
    return null;
  }
}

/* ══════════════════════════════════════════════════════════════════
   MÉTRICAS REAIS — GA4 (busca server-side quando conectado)
══════════════════════════════════════════════════════════════════ */

async function fetchGa4Context(
  userId: string,
  ga4Connection: { accessToken?: string; accountId?: string }
): Promise<string> {
  try {
    let accessToken = ga4Connection.accessToken ?? '';
    try {
      const { getValidAccessToken } = await import('../../lib/connector-refresh-server');
      const fresh = await getValidAccessToken(userId, 'ga4');
      if (fresh) accessToken = fresh;
    } catch { /* usa o token persistido */ }

    if (!accessToken || !ga4Connection.accountId) return '';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const propRes = await fetch(
      `https://analyticsadmin.googleapis.com/v1beta/properties?filter=parent:accounts/${ga4Connection.accountId}`,
      { headers: { Authorization: `Bearer ${accessToken}` }, cache: 'no-store', signal: controller.signal }
    );
    const propData = await propRes.json();
    const propertyName: string | undefined = propData?.properties?.[0]?.name;
    if (!propertyName) { clearTimeout(timeout); return ''; }

    const reportRes = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/${propertyName}:batchRunReports`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          requests: [
            {
              dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
              metrics: [
                { name: 'activeUsers' },
                { name: 'sessions' },
                { name: 'conversions' },
                { name: 'engagementRate' },
                { name: 'purchaseRevenue' },
              ],
            },
            {
              dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
              dimensions: [{ name: 'sessionSourceMedium' }],
              metrics: [{ name: 'sessions' }],
              orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
              limit: 5,
            },
          ],
        }),
      }
    );
    clearTimeout(timeout);
    if (!reportRes.ok) return '';
    const data = await reportRes.json();

    const summaryRow = data?.reports?.[0]?.rows?.[0]?.metricValues as Array<{ value?: string }> | undefined;
    const sourcesRows = data?.reports?.[1]?.rows as
      | Array<{ dimensionValues?: Array<{ value?: string }>; metricValues?: Array<{ value?: string }> }>
      | undefined;

    const lines: string[] = [];
    if (summaryRow) {
      const engagement = (parseFloat(summaryRow[3]?.value || '0') * 100).toFixed(1);
      lines.push(
        `Usuários ativos: ${summaryRow[0]?.value || '0'} · Sessões: ${summaryRow[1]?.value || '0'} · Conversões: ${summaryRow[2]?.value || '0'} · Taxa de engajamento: ${engagement}% · Receita (purchase): R$ ${summaryRow[4]?.value || '0'}`
      );
    }
    if (sourcesRows?.length) {
      lines.push(
        `Top origens de tráfego (sessões): ${sourcesRows
          .map((r) => `${r.dimensionValues?.[0]?.value || '?'} = ${r.metricValues?.[0]?.value || '0'}`)
          .join(' · ')}`
      );
    }

    return lines.length > 0
      ? `MÉTRICAS REAIS — GA4 (últimos 28 dias, extraídas agora da conta conectada):\n${lines.join('\n')}`
      : '';
  } catch {
    return '';
  }
}

/* ══════════════════════════════════════════════════════════════════
   BLOCO DE CANAIS ATIVOS (Integrações)
══════════════════════════════════════════════════════════════════ */

function buildDataAccessBlock(connected: string[], disconnected: string[]): { block: string; hasRealData: boolean } {
  const hasRealData = connected.length > 0;

  const block = hasRealData
    ? `CANAIS CONECTADOS EM INTEGRAÇÕES (fontes de dados reais do usuário):
${connected.map((s) => `• ${s} ✓`).join('\n')}
${disconnected.length > 0
    ? `\nCANAIS NÃO CONECTADOS (sem acesso a dados):
${disconnected.map((s) => `• ${s}`).join('\n')}`
    : ''}`
    : `ATENÇÃO — NENHUM CANAL CONECTADO EM INTEGRAÇÕES:
${disconnected.map((s) => `• ${s}`).join('\n')}
O usuário ainda não conectou nenhuma plataforma. Você NÃO tem dados de campanhas para analisar.`;

  return { block, hasRealData };
}

/* ══════════════════════════════════════════════════════════════════
   IDENTIDADE E MÉTODO DE TRABALHO DO AGENTE
══════════════════════════════════════════════════════════════════ */

function buildTeamRoster(excludeId?: string): string {
  return TEAM_AGENTS
    .filter((a) => a.id !== excludeId && (a.specialtyTitles.length > 0 || a.id === 'ulisses'))
    .map((a) => `- **${a.nome}** (${a.funcao}): ${a.specialtyTitles.length > 0 ? a.specialtyTitles.join(', ') : a.habilidades.join(', ')}`)
    .join('\n');
}

function buildAgentIdentity(agentId: string | undefined): string {
  const agent = getTeamAgentById(agentId || 'ulisses');

  if (!agent) {
    return `Você é o **Lucca**, Agente Consultor de Marketing com IA da NeuroAds.
Especialista em performance digital: campanhas pagas, ROAS, CPA, criativos, audiências, CRM e atribuição.`;
  }

  const orchestration =
    agent.id === 'ulisses'
      ? `Como orquestrador principal (Chief of Staff), você conhece as capacidades dos outros agentes:
${buildTeamRoster('ulisses')}
Quando uma atividade estiver fora do seu escopo, delegue ao especialista correspondente e explique o porquê.`
      : `Você faz parte de uma equipe de agentes. Quando o pedido estiver fora do seu domínio, indique o colega certo:
${buildTeamRoster(agent.id)}`;

  return `Você é o(a) **${agent.nome}**, ${agent.funcao} da NeuroAds.
Identidade: ${agent.descricao}
Personalidade: ${agent.personalidade}. Tagline: "${agent.tagline}".
Habilidades-chave: ${agent.habilidades.join(', ')}.
${agent.specialtyTitles.length > 0 ? `Operações que você executa: ${agent.specialtyTitles.join(', ')}.` : ''}

Seu tom de voz reflete sua personalidade de forma autêntica — você é um(a) especialista sênior, não um chatbot genérico.

${orchestration}

${agent.prompt || ''}`;
}

/* ══════════════════════════════════════════════════════════════════
   AÇÃO PRINCIPAL DE CHAT
══════════════════════════════════════════════════════════════════ */

export async function chatWithLuccaHub(
  messages: ChatMessage[],
  context: LuccaHubContext
): Promise<LuccaHubResponse> {
  // ─── Sem nenhuma API Key: fallback informativo ────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
    const hasConnections = (context.connectedSources?.length ?? 0) > 0;
    return {
      success: true,
      message: hasConnections
        ? `Olá, **${context.userName}**! Identifiquei que você tem **${context.connectedSources?.join(', ')}** conectados.\n\nPorém, meu motor de IA não está configurado no ambiente. Para ativar análises em tempo real, adicione **ANTHROPIC_API_KEY** ao arquivo \`.env.local\`.`
        : `Olá, **${context.userName}**! Ainda não identifiquei canais conectados na sua conta.\n\nPara que eu possa entregar análises com dados reais, conecte pelo menos uma plataforma em **Integrações**.`,
      nextSteps: [
        'Conectar Meta Ads em Integrações',
        'Conectar Google Ads em Integrações',
        'Conectar GA4 em Integrações',
        'Ativar Agentes no Laboratório de Agentes',
      ],
      dataAccessWarning: 'Motor de IA offline — ANTHROPIC_API_KEY não configurada.',
      leftPanelData: null,
    };
  }

  // ─── Carrega estado real do usuário (Firestore = fonte da verdade) ───────
  const snapshot = context.userId ? await loadUserSnapshot(context.userId) : null;

  const connected = snapshot?.connected ?? context.connectedSources ?? [];
  const disconnected = snapshot?.disconnected ?? context.disconnectedSources ?? [];
  const activeAgents = snapshot?.activeAgents?.length
    ? snapshot.activeAgents
    : context.activeAgents ?? [];

  // ─── Base de Conhecimento (RAG por relevância) + métricas reais ──────────
  // Query de relevância: operação ativa tem prioridade (é o que define o
  // escopo do pedido); sem operação, usa a última mensagem do usuário.
  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  const kbQueryText = context.specialty ? `${context.specialty} ${lastUserMessage}` : lastUserMessage;

  const [reportsContext, chatContext, ga4Context, googleAdsContext, metaAdsContext, searchConsoleContext] =
    await Promise.all([
      context.userId ? loadAgentReports(context.userId, kbQueryText) : Promise.resolve(''),
      context.userId ? loadRecentChatHistory(context.userId, kbQueryText) : Promise.resolve(''),
      context.userId && snapshot?.ga4Connection
        ? fetchGa4Context(context.userId, snapshot.ga4Connection)
        : Promise.resolve(''),
      context.userId && snapshot?.googleAdsConnection
        ? fetchGoogleAdsContext(context.userId, snapshot.googleAdsConnection)
        : Promise.resolve(''),
      context.userId && snapshot?.metaAdsConnection
        ? fetchMetaAdsContext(context.userId, snapshot.metaAdsConnection)
        : Promise.resolve(''),
      context.userId && snapshot?.searchConsoleConnection
        ? fetchSearchConsoleContext(context.userId, snapshot.searchConsoleConnection)
        : Promise.resolve(''),
    ]);

  const kbBlocks = [reportsContext, chatContext, ga4Context, googleAdsContext, metaAdsContext, searchConsoleContext]
    .filter(Boolean)
    .join('\n\n');
  const { block: dataAccessBlock, hasRealData } = buildDataAccessBlock(connected, disconnected);
  const agentIdentity = buildAgentIdentity(context.agentId);
  const specialtyBlock = buildOperationBlock({
    specialtyTitle: context.specialty,
    connected,
    disconnected,
  });

  // ─── System prompt em 2 blocos: estável (cacheável) + volátil ────────────
  // O bloco estável muda apenas por agente → prompt caching reduz ~90% do
  // custo de entrada nas chamadas seguintes. O volátil fica depois do cache.
  const staticSystem = `${agentIdentity}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGRAS DE DADOS REAIS E CANAIS ATIVOS (INVIOLÁVEIS):
1. USE APENAS OS DADOS REAIS DOS CANAIS CONECTADOS. Você só tem acesso às ferramentas marcadas como conectadas (✓) no bloco CANAIS CONECTADOS. Se o usuário solicitar uma ação que necessita de um canal indisponível, explique com profissionalismo qual plataforma falta e recomende que ele a integre através da página de Integrações.
2. NUNCA UTILIZE DADOS FICTÍCIOS OU SIMULADOS PARA MASCARAR A FALTA DE INTEGRAÇÕES. Se o canal estiver desconectado, não invente números de campanha ou tráfego. Declare a ausência dos dados reais e use a Base de Conhecimento (relatórios salvos) para embasar sua resposta com o histórico que o usuário já possui no perfil.
3. CADA RESPOSTA DEVE GERAR INSIGHTS CONCRETOS E REAIS, classificados conforme o protocolo:
   - 💡 OPORTUNIDADE: Ações de crescimento ou otimização escaláveis de acordo com os dados reais da conta.
   - ⚠️ RISCO IMINENTE: Gargalos no funil, criativos fatigados ou canais que não estão gerando ROI ideal.
   - 🔁 PADRÃO DETECTADO: Comportamentos recorrentes do tráfego ou audiência do site.
4. Benchmarks externos podem ser citados apenas se explicitamente rotulados como "benchmark de mercado" para efeito comparativo, nunca como dados próprios do usuário. Resultados de pesquisa web entram nessa categoria.
5. Quando não houver dados reais suficientes para executar a operação solicitada, apresente o diagnóstico com o que você já sabe, o que falta coletar, e os passos práticos recomendados.

MÉTODO DE TRABALHO (estruture toda análise assim):
1. DIAGNÓSTICO — o que os dados reais disponíveis mostram (com fonte)
2. INSIGHTS E OPORTUNIDADES — padrões, anomalias e ações práticas classificadas com os emojis correspondentes (💡, ⚠️, 🔁)
3. PRÓXIMO PASSO IMEDIATO — a primeira ação prática a executar hoje

INSTRUÇÕES DE RESPOSTA:
- Profissional, consultivo, direto — máximo 4 parágrafos no campo "message"
- Nada de conselho genérico: toda recomendação amarrada ao contexto real do usuário (empresa, site, canais, KB)
- Responda em português do Brasil
- Use **negrito** para termos importantes, • para listas

FORMATO DE SAÍDA — JSON OBRIGATÓRIO E VÁLIDO:
{
  "message": "resposta principal — pode usar **negrito**, • listas, \\n para quebras",
  "dataAccessWarning": null ou "aviso curto quando faltar canal essencial para o pedido",
  "nextSteps": [
    "ação específica 1",
    "ação específica 2",
    "ação específica 3",
    "ação específica 4"
  ],
  "leftPanel": {
    "title": "título do entregável (OBRIGATÓRIO — nunca null)",
    "badge": "fonte principal usada: GA4 | Base de Conhecimento | Multi-Canal | Plano de Ação",
    "description": "resumo executivo de 2-3 frases do que está sendo exibido",
    "tableHeaders": ["Col1", "Col2"] ou null,
    "tableRows": [{"Col1": "valor", "Col2": "valor"}] ou null (máx 6 linhas — apenas dados reais ou etapas do plano),
    "analysisTitle": "Análise",
    "analysisItems": ["insight 1 com o porquê", "insight 2", "oportunidade priorizada"],
    "sources": ["fonte usada 1 (ex: GA4 — últimos 28 dias)", "fonte 2 (ex: Base de Conhecimento — relatório X)", "fonte 3 (ex: benchmark de mercado)"]
  }
}

REGRAS CRÍTICAS DO JSON:
- JSON DEVE ser válido e completo
- nextSteps DEVE ter EXATAMENTE 4 itens acionáveis e específicos
- leftPanel é SEMPRE preenchido: se houver dados reais tabuláveis, use tabela; senão, monte um plano de ação/checklist com etapas concretas (tableHeaders ["Etapa","Ação","Status"]) — nunca invente números
- analysisItems DEVE ter 2 a 5 insights reais e específicos
- sources lista SOMENTE as fontes efetivamente consultadas nesta resposta — nunca fontes que não foram usadas
- A resposta final deve ser SOMENTE o JSON (sem texto antes ou depois, sem cercas de código)`;

  const dynamicSystem = `PERFIL DO USUÁRIO:
- Nome: ${context.userName}
- Empresa: ${context.companyName || 'não informada'}
- Site: ${context.site || 'não informado'}
- Perfil Instagram: ${snapshot?.instagram || 'não informado'}
- Perfil LinkedIn: ${snapshot?.linkedin || 'não informado'}
- Canal TikTok: ${snapshot?.tiktok || 'não informado'}
- Blog Institucional: ${snapshot?.blog || 'não informado'}
- Agentes ativos: ${activeAgents.length > 0 ? activeAgents.join(', ') : 'nenhum ativado'}
- Automações ativas: ${snapshot?.activeAutomations?.length ? snapshot.activeAutomations.join(', ') : 'nenhuma'}
${context.recentMetrics?.length ? `- Métricas recentes: ${JSON.stringify(context.recentMetrics)}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${dataAccessBlock}

${specialtyBlock ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${specialtyBlock}\n` : ''}
${kbBlocks ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${kbBlocks}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━` : ''}`;

  // ─── Conversa no formato Anthropic (primeira mensagem deve ser 'user') ───
  const firstUserIdx = messages.findIndex((m) => m.role === 'user');
  const claudeMessages: Anthropic.Messages.MessageParam[] = (
    firstUserIdx >= 0 ? messages.slice(firstUserIdx) : messages
  )
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  // ─── Motores ──────────────────────────────────────────────────────────────
  const runClaude = async (): Promise<string> => {
    const isOperation = Boolean(context.specialty);
    const model = isOperation ? MODEL_OPERATION : MODEL_LIGHT;

    // Pesquisa profunda: web search nativo apenas em operações (Sonnet 5)
    const tools = isOperation
      ? ([
          { type: 'web_search_20260209', name: 'web_search', max_uses: 5 },
        ] as unknown as Anthropic.Messages.ToolUnion[])
      : undefined;

    const baseParams = {
      model,
      max_tokens: isOperation ? 8000 : 2000,
      system: [
        {
          type: 'text' as const,
          text: staticSystem,
          cache_control: { type: 'ephemeral' as const },
        },
        { type: 'text' as const, text: dynamicSystem },
      ],
      ...(tools ? { tools } : {}),
    };

    let convo = [...claudeMessages];
    let response = await anthropic.messages.create({ ...baseParams, messages: convo });

    // Ferramentas server-side podem pausar o turno — retoma até 3 vezes
    let continuations = 0;
    while (response.stop_reason === 'pause_turn' && continuations < 3) {
      convo = [
        ...convo,
        { role: 'assistant', content: response.content as Anthropic.Messages.ContentBlockParam[] },
      ];
      response = await anthropic.messages.create({ ...baseParams, messages: convo });
      continuations++;
    }

    const text = response.content
      .filter((block): block is Anthropic.Messages.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    return start >= 0 && end > start ? text.slice(start, end + 1) : '{}';
  };

  const runOpenAI = async (): Promise<string> => {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `${staticSystem}\n\n━━━\n${dynamicSystem}` },
        ...messages,
      ],
      temperature: 0.55,
      max_tokens: 1600,
      response_format: { type: 'json_object' },
    });
    return completion.choices[0]?.message?.content || '{}';
  };

  try {
    let raw = '';

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        raw = await runClaude();
      } catch (claudeErr) {
        // Sem créditos, rate limit ou indisponibilidade: não derruba o chat —
        // cai para o motor legado quando disponível.
        console.error('[chatWithLuccaHub] Claude indisponível, tentando fallback OpenAI:', claudeErr);
        if (!process.env.OPENAI_API_KEY) throw claudeErr;
        raw = await runOpenAI();
      }
    } else {
      raw = await runOpenAI();
    }

    const parsed = JSON.parse(raw) as {
      message?: string;
      dataAccessWarning?: string | null;
      nextSteps?: string[];
      leftPanel?: {
        title?: string | null;
        badge?: string | null;
        description?: string | null;
        tableHeaders?: string[] | null;
        tableRows?: Array<Record<string, string>> | null;
        analysisTitle?: string | null;
        analysisItems?: string[] | null;
        sources?: string[] | null;
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
          sources: parsed.leftPanel.sources?.length ? parsed.leftPanel.sources : undefined,
        }
      : null;

    const fallbackSteps = hasRealData
      ? [
          'Analisar desempenho do período atual',
          'Priorizar oportunidades por impacto',
          'Revisar relatórios na Base de Conhecimento',
          'Ativar automações dos Agentes',
        ]
      : [
          'Conectar GA4 em Integrações',
          'Conectar Meta Ads ou Google Ads em Integrações',
          'Ativar Agentes no Laboratório de Agentes',
          'Definir metas de CPA e ROAS da operação',
        ];

    return {
      success: true,
      message: parsed.message || 'Desculpe, não consegui gerar uma resposta.',
      nextSteps: parsed.nextSteps?.length === 4 ? parsed.nextSteps : fallbackSteps,
      leftPanelData,
      dataAccessWarning:
        parsed.dataAccessWarning ??
        (!hasRealData
          ? 'Nenhum canal conectado — os Agentes trabalham somente com dados reais. Conecte suas plataformas em Integrações.'
          : null),
    };
  } catch (err) {
    console.error('[chatWithLuccaHub]', err);
    return {
      success: false,
      error: 'Erro ao processar sua mensagem. Tente novamente.',
    };
  }
}
