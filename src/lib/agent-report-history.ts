'use client';

import { addDoc, collection, deleteDoc, doc, getDocs, limit, orderBy, query, where } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

type AgentReportFormat = 'markdown' | 'plain_text';

type AgentReportMetadataPrimitive = string | number | boolean | null;
type AgentReportMetadataObject = {
  [key: string]: AgentReportMetadataValue;
};
type AgentReportMetadataValue =
  | AgentReportMetadataPrimitive
  | AgentReportMetadataObject
  | AgentReportMetadataValue[];

type AgentReportSection = {
  title: string;
  content: string;
};

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

function sanitizeMetadataValue(value: unknown): AgentReportMetadataValue | undefined {
  if (value === null) return null;

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  if (Array.isArray(value)) {
    const sanitizedArray = value
      .map((item) => sanitizeMetadataValue(item))
      .filter((item): item is AgentReportMetadataValue => typeof item !== 'undefined');
    return sanitizedArray;
  }

  if (typeof value === 'object') {
    const sanitizedObject = Object.entries(value as Record<string, unknown>).reduce<AgentReportMetadataObject>(
      (acc, [key, itemValue]) => {
        const sanitized = sanitizeMetadataValue(itemValue);
        if (typeof sanitized !== 'undefined') {
          acc[key] = sanitized;
        }
        return acc;
      },
      {}
    );
    return sanitizedObject;
  }

  return undefined;
}

function sanitizeMetadata(
  metadata?: Record<string, AgentReportMetadataValue | undefined>
): Record<string, AgentReportMetadataValue> {
  if (!metadata) return {};

  return Object.entries(metadata).reduce<Record<string, AgentReportMetadataValue>>((acc, [key, value]) => {
    const sanitized = sanitizeMetadataValue(value);
    if (typeof sanitized !== 'undefined') acc[key] = sanitized;
    return acc;
  }, {});
}

function normalizeIsoDate(dateValue?: string): string {
  if (!dateValue) return new Date().toISOString();
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString();
  return parsed.toISOString();
}

function sanitizeFilenameToken(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function buildPdfFilename(entry: Pick<AgentReportHistoryEntry, 'agentKey' | 'generatedAt'>): string {
  const safeAgentKey = sanitizeFilenameToken(entry.agentKey) || 'agente';
  const safeDate = new Date(entry.generatedAt).toISOString().replace(/[:.]/g, '-');
  return `relatorio-${safeAgentKey}-${safeDate}.pdf`;
}

function normalizePdfText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseReportSections(entry: AgentReportHistoryEntry): AgentReportSection[] {
  const markdown = entry.reportContent?.trim() ?? '';
  if (!markdown) return [];

  if (entry.reportFormat !== 'markdown') {
    return [{ title: 'Resultado Completo', content: markdown }];
  }

  const sectionDividerRegex = /^##\s+/gm;
  const matches = Array.from(markdown.matchAll(sectionDividerRegex));
  const sections: AgentReportSection[] = [];

  if (matches.length > 0 && (matches[0].index ?? 0) > 0) {
    const intro = markdown.slice(0, matches[0].index).trim();
    if (intro) {
      sections.push({
        title: 'Resumo Executivo',
        content: intro,
      });
    }
  }

  if (matches.length === 0) {
    return [{ title: 'Resultado Completo', content: markdown }];
  }

  for (let i = 0; i < matches.length; i += 1) {
    const current = matches[i];
    const start = current.index ?? 0;
    const nextStart = matches[i + 1]?.index ?? markdown.length;
    const chunk = markdown.slice(start, nextStart).trim();
    const lines = chunk.split('\n');
    const firstLine = lines[0] ?? '## Seção';
    const title = firstLine.replace(/^##\s+/, '').trim();
    const content = lines.slice(1).join('\n').trim();

    if (title || content) {
      sections.push({
        title: title || 'Seção',
        content,
      });
    }
  }

  return sections;
}

function serializeMetadataValue(value: AgentReportMetadataValue): string {
  if (value === null) return 'N/A';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return JSON.stringify(value);
}

function readMetadataLines(entry: AgentReportHistoryEntry): string[] {
  const lines: string[] = [];

  Object.entries(entry.metadata).forEach(([key, value]) => {
    const renderedKey = key.replace(/([a-z])([A-Z])/g, '$1 $2');
    const renderedValue = serializeMetadataValue(value);
    lines.push(`${renderedKey}: ${renderedValue}`);
  });

  return lines;
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

export async function deleteAgentReportFromDb(
  userId: string,
  reportId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const db = getFirebaseDb();
    const reportRef = doc(db, 'users', userId, 'agent_reports', reportId);
    await deleteDoc(reportRef);
    return { success: true };
  } catch (error) {
    console.error('Erro ao excluir relatório do agente:', error);
    return { success: false, error: 'Erro ao excluir relatório no banco de dados.' };
  }
}

export async function downloadAgentReport(entry: AgentReportHistoryEntry) {
  const jsPdfModule = await import('jspdf');
  const JsPdfCtor = jsPdfModule.jsPDF;
  const doc = new JsPdfCtor({ unit: 'pt', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 44;
  const maxWidth = pageWidth - marginX * 2;
  const lineHeight = 16;
  const bottomSafe = 56;
  const nowLabel = new Date(entry.generatedAt).toLocaleString('pt-BR');

  const sectionTitleStyle = {
    fontSize: 12,
    color: [198, 67, 14] as const,
  };
  const bodyStyle = {
    fontSize: 10.5,
    color: [31, 41, 55] as const,
  };

  let y = 132;

  const drawPageHeader = () => {
    doc.setFillColor(255, 248, 243);
    doc.rect(0, 0, pageWidth, 92, 'F');

    doc.setDrawColor(255, 200, 169);
    doc.line(0, 92, pageWidth, 92);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(198, 67, 14);
    doc.text('INTELIGENCIA | HISTORICO NEUROADS', marginX, 36);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(15, 23, 42);
    doc.text(normalizePdfText(entry.reportTitle || 'Relatorio de Agente'), marginX, 58, {
      maxWidth,
    });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Gerado em: ${normalizePdfText(nowLabel)} | Agente: ${normalizePdfText(entry.agentTitle)}`, marginX, 78, {
      maxWidth,
    });
  };

  const drawFooter = () => {
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, pageHeight - 40, pageWidth - marginX, pageHeight - 40);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(107, 114, 128);
    doc.text('Relatorio exportado pelo Historico do Hub NeuroAds.', marginX, pageHeight - 26);
  };

  const ensureSpace = (needed: number) => {
    if (y + needed <= pageHeight - bottomSafe) return;
    drawFooter();
    doc.addPage();
    drawPageHeader();
    y = 120;
  };

  const writeWrappedText = (text: string, options?: { bold?: boolean; gapTop?: number; size?: number; color?: readonly [number, number, number] }) => {
    const normalized = normalizePdfText(text);
    if (!normalized) return;

    const fontSize = options?.size ?? bodyStyle.fontSize;
    const gapTop = options?.gapTop ?? 0;
    const color = options?.color ?? bodyStyle.color;
    const lines = doc.splitTextToSize(normalized, maxWidth) as string[];

    ensureSpace(gapTop + lines.length * lineHeight + 4);
    y += gapTop;
    doc.setFont('helvetica', options?.bold ? 'bold' : 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);

    lines.forEach((line) => {
      doc.text(line, marginX, y);
      y += lineHeight;
    });
  };

  const writeSectionTitle = (text: string) => {
    writeWrappedText(text, {
      bold: true,
      size: sectionTitleStyle.fontSize,
      color: sectionTitleStyle.color,
      gapTop: 10,
    });
  };

  drawPageHeader();

  writeSectionTitle('Resumo do Relatorio');
  writeWrappedText(`Agente: ${entry.agentTitle}`, { bold: true, gapTop: 4 });
  writeWrappedText(`Categoria: ${entry.agentCategory}`);
  writeWrappedText(`Formato: ${entry.reportFormat}`);
  writeWrappedText(`Gerado em: ${nowLabel}`);

  const metadataLines = readMetadataLines(entry);
  if (metadataLines.length) {
    writeSectionTitle('Metadados');
    metadataLines.forEach((line) => writeWrappedText(line, { gapTop: 2 }));
  }

  const sections = parseReportSections(entry);
  if (sections.length) {
    writeSectionTitle('Resultado Completo');
    sections.forEach((section) => {
      if (section.title) {
        writeWrappedText(section.title, {
          bold: true,
          size: 11,
          color: [17, 24, 39],
          gapTop: 8,
        });
      }

      section.content.split('\n').forEach((rawLine) => {
        const trimmed = rawLine.trim();
        if (!trimmed) {
          y += 6;
          return;
        }

        const line = trimmed.startsWith('- ')
          ? `• ${trimmed.slice(2)}`
          : trimmed.replace(/^###\s+/, '');
        writeWrappedText(line, { gapTop: 2 });
      });
    });
  } else {
    writeSectionTitle('Resultado Completo');
    writeWrappedText(entry.reportContent || 'Sem conteúdo disponível para exportação.');
  }

  drawFooter();
  doc.save(buildPdfFilename(entry));
}
