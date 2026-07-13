'use server';

/**
 * Salvar na Base de Conhecimento — Sprint 3 / P0
 *
 * Server action chamada pelo painel de resultados do hub/assistente-ia.
 * Grava o resultado como documento da Base (coleção agent_reports) já com
 * embedding, para que ele volte a alimentar as próximas operações via RAG.
 */

import { saveKnowledgeDocument } from '../../lib/knowledge-rag';

export type SaveResultInput = {
  userId: string;
  title: string;
  content: string;
  agentKey: string;
  agentTitle: string;
  category: string;
  tags: string[];
};

export async function saveResultToKnowledge(
  input: SaveResultInput
): Promise<{ success: boolean; id?: string; error?: string }> {
  const userId = input.userId?.trim();
  const title = input.title?.trim();
  const content = input.content?.trim();

  if (!userId) return { success: false, error: 'Usuário não identificado.' };
  if (!title) return { success: false, error: 'Informe um título para o documento.' };
  if (!content) return { success: false, error: 'O resultado está vazio — nada para salvar.' };

  return saveKnowledgeDocument({
    userId,
    title,
    content,
    agentKey: input.agentKey?.trim() || 'assistente',
    agentTitle: input.agentTitle?.trim() || 'Assistente IA',
    category: input.category?.trim() || 'Operações',
    tags: (input.tags || []).map((t) => t.trim()).filter(Boolean).slice(0, 8),
  });
}
