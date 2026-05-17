'use client';

import { addDoc, collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

type AgentReportFormat = 'markdown' | 'plain_text';

type AgentReportMetadataValue = string | number | boolean | null;

export type AgentReportHistoryEntry = {
  id: string;
  agentKey: string;
  agentTitle: string;
  agentCategory: string;
  reportTitle: string;
  reportContent: string;
  reportFormat: AgentReportFormat;
  generatedAt: string;
  createdAtMs: number;
  metadata: Record<string, AgentReportMetadataValue>;
};

export type SaveAgentReportInput = {
  userId: string;
  agentKey: string;
  agentTitle: string;
  agentCategory: string;
  reportContent: string;
  reportTitle?: string;
  reportFormat?: AgentReportFormat;
  generatedAt?: string;
  metadata?: Record<string, AgentReportMetadataValue | undefined>;
};

function sanitizeMetadata(
  metadata?: Record<string, AgentReportMetadataValue | undefined>
): Record<string, AgentReportMetadataValue> {
  if (!metadata) return {};

  return Object.entries(metadata).reduce<Record<string, AgentReportMetadataValue>>((acc, [key, value]) => {
    if (typeof value !== 'undefined') acc[key] = value;
    return acc;
  }, {});
}

function normalizeIsoDate(dateValue?: string): string {
  if (!dateValue) return new Date().toISOString();
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString();
  return parsed.toISOString();
}

function buildTxtFilename(entry: Pick<AgentReportHistoryEntry, 'agentKey' | 'generatedAt'>): string {
  const safeAgentKey = entry.agentKey.replace(/[^\w-]+/g, '-');
  const safeDate = new Date(entry.generatedAt).toISOString().replace(/[:.]/g, '-');
  return `relatorio-${safeAgentKey}-${safeDate}.txt`;
}

export async function saveAgentReportToDb(input: SaveAgentReportInput): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const db = getFirebaseDb();
    const generatedAt = normalizeIsoDate(input.generatedAt);
    const createdAtMs = new Date(generatedAt).getTime();
    const reportsRef = collection(db, 'users', input.userId, 'agent_reports');
    const payload = {
      agentKey: input.agentKey,
      agentTitle: input.agentTitle,
      agentCategory: input.agentCategory,
      reportTitle: input.reportTitle?.trim() || `Relatório ${input.agentTitle}`,
      reportContent: input.reportContent,
      reportFormat: input.reportFormat ?? 'plain_text',
      generatedAt,
      createdAtMs,
      metadata: sanitizeMetadata(input.metadata),
    };

    const docRef = await addDoc(reportsRef, payload);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Erro ao salvar relatório do agente:', error);
    return { success: false, error: 'Erro ao salvar relatório no banco de dados.' };
  }
}

export async function getLatestAgentReportsFromDb(
  userId: string,
  agentKey: string,
  maxItems = 10
): Promise<AgentReportHistoryEntry[]> {
  try {
    const db = getFirebaseDb();
    const reportsRef = collection(db, 'users', userId, 'agent_reports');
    const reportsQuery = query(
      reportsRef,
      where('agentKey', '==', agentKey),
      orderBy('createdAtMs', 'desc'),
      limit(Math.max(1, Math.min(maxItems, 10)))
    );
    const snapshot = await getDocs(reportsQuery);

    return snapshot.docs.map((docSnapshot) => {
      const data = docSnapshot.data() as Omit<AgentReportHistoryEntry, 'id'>;
      return {
        id: docSnapshot.id,
        agentKey: data.agentKey,
        agentTitle: data.agentTitle,
        agentCategory: data.agentCategory,
        reportTitle: data.reportTitle,
        reportContent: data.reportContent,
        reportFormat: data.reportFormat,
        generatedAt: data.generatedAt,
        createdAtMs: data.createdAtMs,
        metadata: data.metadata ?? {},
      };
    });
  } catch (error) {
    console.error('Erro ao carregar histórico de relatórios:', error);
    return [];
  }
}

export function downloadAgentReport(entry: AgentReportHistoryEntry) {
  const header = [
    `Relatório: ${entry.reportTitle}`,
    `Agente: ${entry.agentTitle}`,
    `Categoria: ${entry.agentCategory}`,
    `Gerado em: ${new Date(entry.generatedAt).toLocaleString('pt-BR')}`,
  ];
  const metadataLines = Object.entries(entry.metadata).map(([key, value]) => `${key}: ${String(value)}`);
  const body = [header.join('\n'), metadataLines.length ? metadataLines.join('\n') : null, entry.reportContent]
    .filter(Boolean)
    .join('\n\n');

  const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = buildTxtFilename(entry);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
