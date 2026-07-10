import 'server-only';

/**
 * RAG da Base de Conhecimento — Sprint 1 / P0
 *
 * Hoje a Base de Conhecimento (aba hub/configuracoes?tab=conhecimento) guarda
 * dois tipos de documento: relatórios gerados pelos Agentes (`agent_reports`)
 * e conversas salvas com o Lucca (`chat_sessions`). O acesso anterior em
 * lucca-hub-chat.ts pegava sempre os N mais recentes por data — este módulo
 * substitui isso por recuperação por relevância semântica ao pedido em curso.
 *
 * Arquitetura (v1, sem infraestrutura extra):
 *  - Embeddings via OpenAI text-embedding-3-small (reaproveita OPENAI_API_KEY
 *    já configurada; geração de texto continua no Claude).
 *  - Embedding é computado uma vez por documento e persistido no próprio doc
 *    do Firestore (campo `embedding`), com backfill preguiçoso nos documentos
 *    antigos que ainda não têm o campo.
 *  - Ranqueamento por similaridade de cosseno em memória sobre um lote
 *    limitado de candidatos (bounded scan) — dispensa índice vetorial do
 *    Firestore, adequado ao volume por usuário desta fase. Se o volume
 *    crescer muito, migrar para `findNearest` (Firestore vector search) sem
 *    mudar a assinatura pública deste módulo.
 */

import { getAdminDb } from './firebase-admin';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const CANDIDATE_SCAN_LIMIT = 60;

/* ── Embeddings ────────────────────────────────────────────────────── */

async function getEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !text.trim()) return null;

  try {
    const res = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: text.slice(0, 8000),
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const embedding = data?.data?.[0]?.embedding;
    return Array.isArray(embedding) ? embedding : null;
  } catch {
    return null;
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/* ── Relatórios de Agentes ─────────────────────────────────────────── */

type ReportDoc = {
  agentTitle?: string;
  reportTitle?: string;
  reportContent?: string;
  createdAtMs?: number;
  embedding?: number[];
};

export type RelevantReport = {
  id: string;
  agentTitle: string;
  reportTitle: string;
  reportContent: string;
  createdAtMs: number;
  similarity: number;
};

export async function retrieveRelevantReports(
  userId: string,
  queryText: string,
  topK = 5
): Promise<RelevantReport[]> {
  try {
    const db = getAdminDb();
    const snap = await db
      .collection('users')
      .doc(userId)
      .collection('agent_reports')
      .orderBy('createdAtMs', 'desc')
      .limit(CANDIDATE_SCAN_LIMIT)
      .get();

    if (snap.empty) return [];

    const queryEmbedding = await getEmbedding(queryText);

    // Sem embedding de query (sem OPENAI_API_KEY ou falha): cai para recência,
    // que é o comportamento anterior — nunca quebra a operação por isso.
    if (!queryEmbedding) {
      return snap.docs.slice(0, topK).map((d) => {
        const data = d.data() as ReportDoc;
        return {
          id: d.id,
          agentTitle: data.agentTitle || 'Agente',
          reportTitle: data.reportTitle || 'Relatório',
          reportContent: data.reportContent || '',
          createdAtMs: data.createdAtMs || 0,
          similarity: 0,
        };
      });
    }

    const scored = await Promise.all(
      snap.docs.map(async (d) => {
        const data = d.data() as ReportDoc;
        let embedding = data.embedding;

        if (!embedding) {
          const computed = await getEmbedding(`${data.reportTitle || ''}\n${data.reportContent || ''}`);
          if (computed) {
            embedding = computed;
            // Backfill preguiçoso — não bloqueia a resposta se falhar
            d.ref.update({ embedding: computed }).catch(() => {});
          }
        }

        const similarity = embedding ? cosineSimilarity(queryEmbedding, embedding) : 0;
        return {
          id: d.id,
          agentTitle: data.agentTitle || 'Agente',
          reportTitle: data.reportTitle || 'Relatório',
          reportContent: data.reportContent || '',
          createdAtMs: data.createdAtMs || 0,
          similarity,
        };
      })
    );

    return scored
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  } catch (err) {
    console.error('[knowledge-rag] retrieveRelevantReports falhou:', err);
    return [];
  }
}

/* ── Sessões de Chat ───────────────────────────────────────────────── */

type ChatSessionDoc = {
  title?: string;
  messages?: Array<{ role: string; text: string }>;
  updatedAtMs?: number;
  embedding?: number[];
};

export type RelevantChatSession = {
  id: string;
  title: string;
  exchanges: Array<{ userText: string; assistantText: string }>;
  similarity: number;
};

function buildSessionSummaryText(data: ChatSessionDoc): string {
  const msgs = data.messages || [];
  const parts: string[] = [data.title || ''];
  for (let i = 0; i < msgs.length - 1 && parts.length < 6; i++) {
    if (msgs[i].role === 'user' && msgs[i + 1]?.role === 'assistant') {
      parts.push(msgs[i].text, msgs[i + 1].text);
    }
  }
  return parts.join('\n');
}

export async function retrieveRelevantChatSessions(
  userId: string,
  queryText: string,
  topK = 3
): Promise<RelevantChatSession[]> {
  try {
    const db = getAdminDb();
    const snap = await db
      .collection('users')
      .doc(userId)
      .collection('chat_sessions')
      .orderBy('updatedAtMs', 'desc')
      .limit(CANDIDATE_SCAN_LIMIT)
      .get();

    if (snap.empty) return [];

    const toExchanges = (data: ChatSessionDoc): Array<{ userText: string; assistantText: string }> => {
      const msgs = data.messages || [];
      const exchanges: Array<{ userText: string; assistantText: string }> = [];
      for (let i = 0; i < msgs.length - 1 && exchanges.length < 3; i++) {
        if (msgs[i].role === 'user' && msgs[i + 1]?.role === 'assistant') {
          exchanges.push({ userText: msgs[i].text, assistantText: msgs[i + 1].text });
        }
      }
      return exchanges;
    };

    const queryEmbedding = await getEmbedding(queryText);

    if (!queryEmbedding) {
      return snap.docs.slice(0, topK).map((d) => {
        const data = d.data() as ChatSessionDoc;
        return { id: d.id, title: data.title || 'sem título', exchanges: toExchanges(data), similarity: 0 };
      });
    }

    const scored = await Promise.all(
      snap.docs.map(async (d) => {
        const data = d.data() as ChatSessionDoc;
        let embedding = data.embedding;

        if (!embedding) {
          const computed = await getEmbedding(buildSessionSummaryText(data));
          if (computed) {
            embedding = computed;
            d.ref.update({ embedding: computed }).catch(() => {});
          }
        }

        const similarity = embedding ? cosineSimilarity(queryEmbedding, embedding) : 0;
        return { id: d.id, title: data.title || 'sem título', exchanges: toExchanges(data), similarity };
      })
    );

    return scored
      .filter((s) => s.exchanges.length > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  } catch (err) {
    console.error('[knowledge-rag] retrieveRelevantChatSessions falhou:', err);
    return [];
  }
}
