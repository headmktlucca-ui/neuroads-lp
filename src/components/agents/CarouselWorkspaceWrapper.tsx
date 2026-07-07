'use client';

/**
 * CarouselWorkspaceWrapper
 *
 * Adapter entre WorkspaceProps (interface do registry) e
 * CreativeCarouselWorkspace (que exige props específicas).
 * Fornece valores padrão sensatos para todas as props obrigatórias.
 */

import CreativeCarouselWorkspace from './CreativeCarouselWorkspace';
import type { WorkspaceProps } from '../../lib/agent-workspace-registry';

export default function CarouselWorkspaceWrapper(_props: WorkspaceProps) {
  return (
    <CreativeCarouselWorkspace
      initialSlides={[]}
      backgroundImageUrl=""
      primaryColor="#FF5500"
      secondaryColor="#1e293b"
      companyName=""
      channel="Instagram / LinkedIn"
    />
  );
}
