'use client';

/**
 * VideoWorkspaceWrapper
 *
 * Adapter entre WorkspaceProps (interface do registry) e
 * CreativeVideoWorkspace (que exige props específicas).
 * Fornece valores padrão sensatos para todas as props obrigatórias.
 */

import CreativeVideoWorkspace from './CreativeVideoWorkspace';
import type { WorkspaceProps } from '../../lib/agent-workspace-registry';

export default function VideoWorkspaceWrapper(_props: WorkspaceProps) {
  return (
    <CreativeVideoWorkspace
      initialScenes={[]}
      backgroundImageUrl=""
      primaryColor="#FF5500"
      secondaryColor="#1e293b"
      companyName=""
      ctaText="Fale com um especialista"
    />
  );
}
