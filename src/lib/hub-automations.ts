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
  scheduleOptionId: string;
  scheduleOptionLabel: string;
  scheduleOptionDetail: string;
  planName: string | null;
  monthlyLimit: number | null;
  activatedAt: number | null;
  updatedAt: number | null;
  lastUpdateAt: number | null;
  nextUpdateAt: number | null;
  customFieldsData?: Record<string, string> | null;
};

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

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

function asTimestampNumber(value: unknown): number | null {
  const parsed = asNumber(value);
  if (parsed == null) return null;
  return parsed > 1_000_000_000_000 ? parsed : parsed * 1000;
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

type ScheduleConfig = {
  days: number[];
  hour: number;
  minute: number;
  dayOfMonth?: number;
};

const DAY_TOKEN_MAP: Array<{ pattern: RegExp; day: number }> = [
  { pattern: /\bseg(?:unda)?\b/i, day: 1 },
  { pattern: /\bter(?:ca)?\b/i, day: 2 },
  { pattern: /\bqua(?:rta)?\b/i, day: 3 },
  { pattern: /\bqui(?:nta)?\b/i, day: 4 },
  { pattern: /\bsex(?:ta)?\b/i, day: 5 },
  { pattern: /\bsab(?:ado)?\b/i, day: 6 },
  { pattern: /\bdom(?:ingo)?\b/i, day: 0 },
];

function normalizeToken(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function parseScheduleConfig(scheduleOptionLabel: string): ScheduleConfig | null {
  const label = asString(scheduleOptionLabel);
  if (!label) return null;

  const timeMatch = label.match(/(\d{1,2})[:h](\d{2})/i);
  if (!timeMatch) return null;

  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  const normalized = normalizeToken(label);
  if (/\b(seg|segunda)\s*a\s*(dom|domingo)\b/i.test(normalized) || /\bdiari[oa]\b/i.test(normalized)) {
    return { days: [0, 1, 2, 3, 4, 5, 6], hour, minute };
  }
  if (/\b(seg|segunda)\s*a\s*(sex|sexta)\b/i.test(normalized)) {
    return { days: [1, 2, 3, 4, 5], hour, minute };
  }

  const dayOfMonthMatch = normalized.match(/\bdia\s*(\d{1,2})\b/i);
  if (dayOfMonthMatch) {
    const dayOfMonth = Number(dayOfMonthMatch[1]);
    if (Number.isFinite(dayOfMonth) && dayOfMonth >= 1 && dayOfMonth <= 31) {
      return { days: [], hour, minute, dayOfMonth };
    }
  }

  const daysSet = new Set<number>();
  for (const token of DAY_TOKEN_MAP) {
    if (token.pattern.test(normalized)) {
      daysSet.add(token.day);
    }
  }

  if (daysSet.size === 0) return null;
  return { days: [...daysSet], hour, minute };
}

function inferNextUpdateAtFromSchedule(referenceTimestamp: number, scheduleOptionLabel: string): number | null {
  const config = parseScheduleConfig(scheduleOptionLabel);
  if (!config) return null;

  const reference = new Date(referenceTimestamp);
  reference.setSeconds(0, 0);

  if (config.dayOfMonth) {
    for (let offsetMonths = 0; offsetMonths <= 12; offsetMonths += 1) {
      const candidate = new Date(reference);
      candidate.setDate(1);
      candidate.setMonth(candidate.getMonth() + offsetMonths);
      const maxDay = new Date(candidate.getFullYear(), candidate.getMonth() + 1, 0).getDate();
      candidate.setDate(Math.min(config.dayOfMonth, maxDay));
      candidate.setHours(config.hour, config.minute, 0, 0);
      if (candidate.getTime() > referenceTimestamp + MINUTE_MS) {
        return candidate.getTime();
      }
    }
  }

  for (let offsetDays = 0; offsetDays <= 14; offsetDays += 1) {
    const candidate = new Date(reference.getTime() + offsetDays * DAY_MS);
    if (!config.days.includes(candidate.getDay())) continue;

    candidate.setHours(config.hour, config.minute, 0, 0);
    if (candidate.getTime() > referenceTimestamp + MINUTE_MS) {
      return candidate.getTime();
    }
  }

  return referenceTimestamp + DAY_MS;
}

function getWeeklyExecutions(cadence: string, monthlyExecutions: number): number {
  const normalizedCadence = normalizeToken(cadence);
  if (/\bcada\s*duas?\s*semanas\b/i.test(normalizedCadence) || /\bquinzenal\b/i.test(normalizedCadence)) {
    return 0.5;
  }
  if (/\bmensal\b/i.test(normalizedCadence) || /\bpor\s*mes\b/i.test(normalizedCadence)) {
    return 0.25;
  }

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

function inferNextUpdateAt(
  referenceTimestamp: number,
  cadence: string,
  monthlyExecutions: number,
  scheduleOptionLabel = ''
): number {
  const bySchedule = inferNextUpdateAtFromSchedule(referenceTimestamp, scheduleOptionLabel);
  if (bySchedule) return bySchedule;
  const weeklyExecutions = getWeeklyExecutions(cadence, monthlyExecutions);
  const intervalDays = Math.max(1, Math.round(7 / Math.max(weeklyExecutions, 1)));
  return referenceTimestamp + intervalDays * DAY_MS;
}

export function getHubAutomationsFromProfile(profile: unknown): HubAutomationEntry[] {
  if (!isRecord(profile) || !isRecord(profile.automations)) return [];

  const entries: HubAutomationEntry[] = [];

  for (const [key, rawValue] of Object.entries(profile.automations)) {
    if (!isRecord(rawValue)) continue;

    const monthlyExecutions = asNumber(rawValue.monthlyExecutions) ?? 0;
    const activatedAt = asTimestampNumber(rawValue.activatedAt);
    const updatedAt = asTimestampNumber(rawValue.updatedAt);
    const lastUpdateAt = asTimestampNumber(rawValue.lastUpdateAt) ?? updatedAt ?? activatedAt;
    const cadence = asString(rawValue.cadence);
    const scheduleOptionLabel = asString(rawValue.scheduleOptionLabel);
    const persistedNextUpdateAt = asTimestampNumber(rawValue.nextUpdateAt);
    const nextUpdateAt =
      persistedNextUpdateAt ??
      (lastUpdateAt && cadence ? inferNextUpdateAt(lastUpdateAt, cadence, monthlyExecutions, scheduleOptionLabel) : null);

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
      scheduleOptionId: asString(rawValue.scheduleOptionId),
      scheduleOptionLabel,
      scheduleOptionDetail: asString(rawValue.scheduleOptionDetail),
      planName: asString(rawValue.planName) || null,
      monthlyLimit: asNumber(rawValue.monthlyLimit),
      activatedAt,
      updatedAt,
      lastUpdateAt,
      nextUpdateAt,
      customFieldsData: isRecord(rawValue.customFieldsData) ? (rawValue.customFieldsData as Record<string, string>) : null,
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
  scheduleOptionLabel,
  now = Date.now(),
}: {
  cadence: string;
  monthlyExecutions: number;
  scheduleOptionLabel?: string;
  now?: number;
}): { lastUpdateAt: number; nextUpdateAt: number } {
  return {
    lastUpdateAt: now,
    nextUpdateAt: inferNextUpdateAt(now, cadence, monthlyExecutions, scheduleOptionLabel ?? ''),
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
