'use client';

export type TrafficAnalystRunInput = {
  campaignName: string;
  periodLabel: string;
  investment: number;
  leads: number;
  ctr: number;
  cpc: number;
  conversionRate: number;
  roas: number;
  notes?: string;
  generatedAt: string;
  diagnosisMarkdown: string;
};

export type TrafficAnalystHistoryEntry = TrafficAnalystRunInput & {
  id: string;
};

const STORAGE_NAMESPACE = 'neuroads:traffic-analyst:history:v1';
const HISTORY_LIMIT = 30;

function getStorageKey(userId?: string | null): string {
  return `${STORAGE_NAMESPACE}:${userId ?? 'guest'}`;
}

function hasLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function readTrafficAnalystHistory(userId?: string | null): TrafficAnalystHistoryEntry[] {
  if (!hasLocalStorage()) return [];

  try {
    const raw = window.localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TrafficAnalystHistoryEntry[];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((entry) => Boolean(entry?.id) && Boolean(entry?.campaignName) && Boolean(entry?.generatedAt))
      .sort((a, b) => Number(new Date(b.generatedAt)) - Number(new Date(a.generatedAt)));
  } catch (error) {
    console.error('Erro ao ler histórico do Analista de Tráfego:', error);
    return [];
  }
}

export function appendTrafficAnalystHistory(
  input: TrafficAnalystRunInput,
  userId?: string | null
): TrafficAnalystHistoryEntry[] {
  if (!hasLocalStorage()) return [];

  const entry: TrafficAnalystHistoryEntry = {
    ...input,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
  };

  const merged = [entry, ...readTrafficAnalystHistory(userId)].slice(0, HISTORY_LIMIT);

  try {
    window.localStorage.setItem(getStorageKey(userId), JSON.stringify(merged));
  } catch (error) {
    console.error('Erro ao salvar histórico do Analista de Tráfego:', error);
  }

  return merged;
}
