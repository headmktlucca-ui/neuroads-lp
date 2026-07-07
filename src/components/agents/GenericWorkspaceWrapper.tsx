'use client';

/**
 * GenericWorkspaceWrapper
 *
 * Adapter between WorkspaceProps (interface do registry) e
 * GenericAgentWorkspace (que exige category, description, etc.).
 * Procura o agente no array global para obter a descrição e limites reais.
 */

import GenericAgentWorkspace from './GenericAgentWorkspace';
import { agents } from '../../data/agents';
import type { WorkspaceProps } from '../../lib/agent-workspace-registry';

export default function GenericWorkspaceWrapper({
  userId,
  agentTitle,
  agentCategory,
}: WorkspaceProps) {
  const agentInfo = agents.find((a) => a.title === agentTitle);
  const description = agentInfo?.longDescription || agentInfo?.description || '';

  return (
    <GenericAgentWorkspace
      userId={userId}
      agentTitle={agentTitle}
      category={agentCategory}
      description={description}
      monthlyLimit={50} // Default limit if not found in context
    />
  );
}
