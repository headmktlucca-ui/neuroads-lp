'use client';

const AGENT_STATUS_CACHE_PREFIX = 'neuroads_agent_status_overrides_';
export const AGENT_STATUS_UPDATED_EVENT = 'neuroads-agent-status-updated';

export type AgentStatusOverrides = Record<string, boolean>;

function buildKey(uid: string): string {
  return `${AGENT_STATUS_CACHE_PREFIX}${uid}`;
}

export function readAgentStatusOverrides(uid: string | null | undefined): AgentStatusOverrides {
  if (typeof window === 'undefined' || !uid) return {};

  try {
    const raw = window.localStorage.getItem(buildKey(uid));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as AgentStatusOverrides;
    if (!parsed || typeof parsed !== 'object') return {};
    return parsed;
  } catch {
    return {};
  }
}

export function writeAgentStatusOverrides(
  uid: string | null | undefined,
  overrides: AgentStatusOverrides
): void {
  if (typeof window === 'undefined' || !uid) return;

  try {
    window.localStorage.setItem(buildKey(uid), JSON.stringify(overrides));
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent(AGENT_STATUS_UPDATED_EVENT, {
          detail: { uid, overrides },
        })
      );
    }, 0);
  } catch {
    // Ignore local cache write errors.
  }
}
