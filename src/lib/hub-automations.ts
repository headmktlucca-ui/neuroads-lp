export type HubAutomationStatus = 'active' | 'paused' | 'inactive';

export type HubAutomationEntry = {
  key: string;
  status: HubAutomationStatus;
  agentTitle: string;
  agentCategory: string;
  cadenceId: string;
  cadenceTitle: string;
  cadence: string;
  monthlyExecutions: number;
  distribution: string;
  objective: string;
  planName: string | null;
  monthlyLimit: number | null;
  activatedAt: number | null;
  updatedAt: number | null;
  lastUpdateAt: number | null;
  nextUpdateAt: number | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value.trim() : fallback;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function asStatus(value: unknown): HubAutomationStatus {
  const normalized = asString(value).toLowerCase();
  if (normalized === 'active' || normalized === 'paused' || normalized === 'inactive') {
    return normalized;
  }
  if (normalized === 'ativo') return 'active';
  if (normalized === 'inativo') return 'inactive';
  return 'inactive';
}

function titleFromKey(key: string): string {
  if (!key) return 'Agente';
  return key
    .split('-')
    .map((chunk) => (chunk ? `${chunk[0].toUpperCase()}${chunk.slice(1)}` : chunk))
    .join(' ');
}

function getWeeklyExecutions(cadence: string, monthlyExecutions: number): number {
  const byParenthesis = cadence.match(/\((\d+)\s*rotinas\/semana\)/i);
  if (byParenthesis) {
    const parsed = Number(byParenthesis[1]);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  const byTimes = cadence.match(/(\d+)x\s*por\s*semana/i);
  if (byTimes) {
    const parsed = Number(byTimes[1]);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  const fallback = Math.round(monthlyExecutions / 4);
  return Math.max(fallback, 1);
}

function inferNextUpdateAt(referenceTimestamp: number, cadence: string, monthlyExecutions: number): number {
  const weeklyExecutions = getWeeklyExecutions(cadence, monthlyExecutions);
  const intervalDays = Math.max(1, Math.round(7 / Math.max(weeklyExecutions, 1)));
  return referenceTimestamp + intervalDays * 24 * 60 * 60 * 1000;
}

export function getHubAutomationsFromProfile(profile: unknown): HubAutomationEntry[] {
  if (!isRecord(profile) || !isRecord(profile.automations)) return [];

  const entries: HubAutomationEntry[] = [];

  for (const [key, rawValue] of Object.entries(profile.automations)) {
    if (!isRecord(rawValue)) continue;

    const monthlyExecutions = asNumber(rawValue.monthlyExecutions) ?? 0;
    const activatedAt = asNumber(rawValue.activatedAt);
    const updatedAt = asNumber(rawValue.updatedAt);
    const lastUpdateAt = asNumber(rawValue.lastUpdateAt) ?? updatedAt ?? activatedAt;
    const cadence = asString(rawValue.cadence);
    const persistedNextUpdateAt = asNumber(rawValue.nextUpdateAt);
    const nextUpdateAt =
      persistedNextUpdateAt ??
      (lastUpdateAt && cadence ? inferNextUpdateAt(lastUpdateAt, cadence, monthlyExecutions) : null);

    entries.push({
      key,
      status: asStatus(rawValue.status),
      agentTitle: asString(rawValue.agentTitle, titleFromKey(key)),
      agentCategory: asString(rawValue.agentCategory, 'Hub'),
      cadenceId: asString(rawValue.cadenceId),
      cadenceTitle: asString(rawValue.cadenceTitle, 'Cadência personalizada'),
      cadence,
      monthlyExecutions,
      distribution: asString(rawValue.distribution),
      objective: asString(rawValue.objective),
      planName: asString(rawValue.planName) || null,
      monthlyLimit: asNumber(rawValue.monthlyLimit),
      activatedAt,
      updatedAt,
      lastUpdateAt,
      nextUpdateAt,
    });
  }

  return entries.sort((a, b) => {
    const nextA = a.nextUpdateAt ?? 0;
    const nextB = b.nextUpdateAt ?? 0;
    return nextA - nextB;
  });
}

export function buildAutomationTimestamps({
  cadence,
  monthlyExecutions,
  now = Date.now(),
}: {
  cadence: string;
  monthlyExecutions: number;
  now?: number;
}): { lastUpdateAt: number; nextUpdateAt: number } {
  return {
    lastUpdateAt: now,
    nextUpdateAt: inferNextUpdateAt(now, cadence, monthlyExecutions),
  };
}

export function formatAutomationDateTime(value: number | null): string {
  if (!value || !Number.isFinite(value)) return 'Não informado';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value));
}
