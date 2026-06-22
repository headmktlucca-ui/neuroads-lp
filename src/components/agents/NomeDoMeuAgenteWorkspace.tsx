'use client';

import React from 'react';
import type { WorkspaceProps } from '../../lib/agent-workspace-registry';

export default function NomeDoMeuAgenteWorkspace({ userId, agentSlug, agentTitle }: WorkspaceProps) {
  return (
    <div className="w-full flex items-center justify-center py-20 text-white/50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">{agentTitle} Workspace</h2>
        <p>A interface funcional deste agente será construída aqui.</p>
        <p className="text-sm mt-4 opacity-50">src/components/agents/NomeDoMeuAgenteWorkspace.tsx</p>
      </div>
    </div>
  );
}
