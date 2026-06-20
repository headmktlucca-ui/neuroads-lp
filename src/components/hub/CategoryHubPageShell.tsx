'use client';

import CategoryAgentManagementSection, { type AgentCategorySlug } from './CategoryAgentManagementSection';

export default function CategoryHubPageShell({ categorySlug }: { categorySlug: AgentCategorySlug }) {
  return (
    <div className="w-full space-y-6">
      <CategoryAgentManagementSection categorySlug={categorySlug} />
    </div>
  );
}
