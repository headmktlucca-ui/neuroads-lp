'use client';

export interface SeoGeoHistoryEntry {
  id: string;
  websiteUrl: string;
  businessContext: string;
  generatedAt: string;
  report: string;
  usedWebSearch: boolean;
}

interface SeoGeoHistoryInput {
  websiteUrl: string;
  businessContext?: string;
  generatedAt: string;
  report: string;
  usedWebSearch: boolean;
}

const STORAGE_NAMESPACE = 'neuroads:seo-geo:history:v1';
const HISTORY_LIMIT = 20;

function getStorageKey(userId?: string | null): string {
  return `${STORAGE_NAMESPACE}:${userId ?? 'guest'}`;
}

function hasLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function readSeoGeoHistory(userId?: string | null): SeoGeoHistoryEntry[] {
  if (!hasLocalStorage()) return [];

  try {
    const raw = window.localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SeoGeoHistoryEntry[];
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((entry) => {
        return (
          Boolean(entry?.id) &&
          Boolean(entry?.websiteUrl) &&
          Boolean(entry?.generatedAt) &&
          Boolean(entry?.report)
        );
      })
      .sort((a, b) => Number(new Date(b.generatedAt)) - Number(new Date(a.generatedAt)));
  } catch (error) {
    console.error('Erro ao ler histórico do SEO & GEO:', error);
    return [];
  }
}

export function appendSeoGeoHistory(input: SeoGeoHistoryInput, userId?: string | null): SeoGeoHistoryEntry[] {
  if (!hasLocalStorage()) return [];

  const entry: SeoGeoHistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    websiteUrl: input.websiteUrl,
    businessContext: input.businessContext?.trim() ?? '',
    generatedAt: input.generatedAt,
    report: input.report,
    usedWebSearch: input.usedWebSearch,
  };

  const merged = [entry, ...readSeoGeoHistory(userId)].slice(0, HISTORY_LIMIT);

  try {
    window.localStorage.setItem(getStorageKey(userId), JSON.stringify(merged));
  } catch (error) {
    console.error('Erro ao salvar histórico do SEO & GEO:', error);
  }

  return merged;
}
