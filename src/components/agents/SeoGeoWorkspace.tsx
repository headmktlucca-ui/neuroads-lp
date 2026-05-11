'use client';

import { useMemo, useState, useTransition } from 'react';
import type { ReactNode } from 'react';
import { Download, Globe, Loader2, Sparkles } from 'lucide-react';
import { generateSeoGeoAudit } from '../../app/actions/seo-geo-audit';
import { HTTPS_PREFIX, isHttpsPlaceholderOnly, normalizeHttpsMaskedUrlInput } from '../../lib/url-mask';

interface SeoGeoWorkspaceProps {
  agentTitle: string;
}

interface ReportSection {
  title: string;
  content: string;
}

interface SeoGeoReportState {
  websiteUrl: string;
  generatedAt: string;
  report: string;
  usedWebSearch: boolean;
}

function parseSections(markdown: string): ReportSection[] {
  const sectionDividerRegex = /^##\s+/gm;
  const matches = Array.from(markdown.matchAll(sectionDividerRegex));
  
  const sections: ReportSection[] = [];

  // Capture content before the first header as an "Introdução" section
  if (matches.length > 0 && matches[0].index! > 0) {
    const introContent = markdown.slice(0, matches[0].index).trim();
    if (introContent) {
      sections.push({
        title: 'Resumo Executivo',
        content: introContent,
      });
    }
  }

  if (matches.length === 0) {
    return [{ title: 'Relatório de Auditoria', content: markdown.trim() }];
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
      sections.push({ title, content });
    }
  }

  return sections;
}

function extractScore(report: string, keyword: string): number | null {
  const regex = new RegExp(`${keyword}[^\\d]{0,40}(\\d{1,3})`, 'i');
  const match = report.match(regex);
  if (!match?.[1]) return null;
  const score = Number(match[1]);
  if (Number.isNaN(score)) return null;
  return Math.max(0, Math.min(100, score));
}

function renderInlineStrong(text: string): ReactNode {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={`strong-${index}`} className="font-bold text-text-main">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`text-${index}`}>{part}</span>;
  });
}

function MarkdownSection({ content }: { content: string }) {
  const lines = content.split('\n');
  const nodes: ReactNode[] = [];
  let codeBuffer: string[] = [];
  let inCode = false;

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (!inCode) {
        inCode = true;
        codeBuffer = [];
      } else {
        inCode = false;
        nodes.push(
          <pre
            key={`code-${index}`}
            className="mt-3 overflow-x-auto rounded-xl border border-[#DCE3EE] bg-[#0E1117] p-4 text-[12px] leading-relaxed text-[#E6EDF3]"
          >
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        );
      }
      return;
    }

    if (inCode) {
      codeBuffer.push(line);
      return;
    }

    if (!trimmed) {
      nodes.push(<div key={`spacer-${index}`} className="h-2" />);
      return;
    }

    if (trimmed.startsWith('- ')) {
      nodes.push(
        <div key={`li-${index}`} className="flex items-start gap-3 py-1.5">
          <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          <p className="text-sm leading-relaxed text-text-muted">{renderInlineStrong(trimmed.slice(2))}</p>
        </div>
      );
      return;
    }

    if (trimmed.startsWith('### ')) {
      nodes.push(
        <h4 key={`h4-${index}`} className="mt-4 text-base font-bold text-text-main">
          {trimmed.replace(/^###\s+/, '')}
        </h4>
      );
      return;
    }

    nodes.push(
      <p key={`p-${index}`} className="text-sm leading-relaxed text-text-muted">
        {renderInlineStrong(trimmed)}
      </p>
    );
  });

  return <div>{nodes}</div>;
}

function sanitizeForPdf(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '')
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapTextForPdf(text: string, maxChars: number): string[] {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [''];

  const words = normalized.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function buildPdfBinary(params: {
  title: string;
  websiteUrl: string;
  generatedAt: string;
  sections: ReportSection[];
}): Uint8Array {
  const pageWidth = 595;
  const pageHeight = 842;
  const marginX = 42;
  const contentWidth = pageWidth - marginX * 2;
  const lineHeight = 15;
  const footerOffset = 36;
  const topHeaderHeight = 74;

  const drawPageHeader = (title: string, websiteUrl: string, generatedAt: string): string[] => {
    const ops: string[] = [];
    ops.push('q');
    ops.push('0.97 0.97 0.98 rg');
    ops.push(`0 ${pageHeight - topHeaderHeight} ${pageWidth} ${topHeaderHeight} re f`);
    ops.push('Q');
    ops.push('BT');
    ops.push('/F2 16 Tf');
    ops.push('1 0.42 0 rg');
    ops.push(`${marginX} ${pageHeight - 36} Td`);
    ops.push(`(${sanitizeForPdf(title)}) Tj`);
    ops.push('ET');
    ops.push('BT');
    ops.push('/F1 10 Tf');
    ops.push('0.28 0.33 0.41 rg');
    ops.push(`${marginX} ${pageHeight - 54} Td`);
    ops.push(`(Site: ${sanitizeForPdf(websiteUrl)}) Tj`);
    ops.push('ET');
    ops.push('BT');
    ops.push('/F1 9 Tf');
    ops.push('0.45 0.51 0.58 rg');
    ops.push(`${pageWidth - 220} ${pageHeight - 54} Td`);
    ops.push(`(Gerado em: ${sanitizeForPdf(generatedAt)}) Tj`);
    ops.push('ET');
    return ops;
  };

  const pageContents: string[] = [];
  let currentOps: string[] = [];
  let y = pageHeight - topHeaderHeight - 24;

  const flushPage = () => {
    if (currentOps.length === 0) {
      currentOps = drawPageHeader(params.title, params.websiteUrl, params.generatedAt);
    }
    currentOps.push('BT');
    currentOps.push('/F1 8 Tf');
    currentOps.push('0.45 0.51 0.58 rg');
    currentOps.push(`${marginX} ${footerOffset - 8} Td`);
    currentOps.push('(NeuroAds | Relatorio SEO & GEO Premium) Tj');
    currentOps.push('ET');
    pageContents.push(currentOps.join('\n'));
    currentOps = [];
    y = pageHeight - topHeaderHeight - 24;
  };

  const ensureSpace = (neededHeight: number) => {
    if (y - neededHeight <= footerOffset) {
      flushPage();
    }
  };

  const pushText = (
    text: string,
    options: { bold?: boolean; size?: number; color?: [number, number, number]; topGap?: number; maxChars?: number }
  ) => {
    const size = options.size ?? 10;
    const topGap = options.topGap ?? 0;
    const color = options.color ?? [0.2, 0.23, 0.29];
    const maxChars = options.maxChars ?? 95;
    const lines = wrapTextForPdf(text, maxChars);
    ensureSpace(topGap + lines.length * (lineHeight + (size > 11 ? 2 : 0)));
    y -= topGap;
    lines.forEach((line) => {
      currentOps.push('BT');
      currentOps.push(`/${options.bold ? 'F2' : 'F1'} ${size} Tf`);
      currentOps.push(`${color[0]} ${color[1]} ${color[2]} rg`);
      currentOps.push(`${marginX} ${y} Td`);
      currentOps.push(`(${sanitizeForPdf(line)}) Tj`);
      currentOps.push('ET');
      y -= lineHeight + (size > 11 ? 2 : 0);
    });
  };

  currentOps = drawPageHeader(params.title, params.websiteUrl, params.generatedAt);

  params.sections.forEach((section) => {
    ensureSpace(64);
    currentOps.push('q');
    currentOps.push('1 0.96 0.92 rg');
    currentOps.push(`${marginX - 8} ${y - 12} ${contentWidth + 16} 26 re f`);
    currentOps.push('Q');
    pushText(section.title, {
      bold: true,
      size: 12,
      color: [0.8, 0.31, 0.04],
      topGap: 2,
      maxChars: 80,
    });

    const sectionLines = section.content.split('\n');
    sectionLines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        y -= 6;
        return;
      }

      const isBullet = trimmed.startsWith('- ');
      const printable = isBullet ? `• ${trimmed.slice(2)}` : trimmed.replace(/^###\s+/, '');
      const isMiniHeading = trimmed.startsWith('### ') || /^FASE\s+\d/i.test(trimmed);

      pushText(printable, {
        bold: isMiniHeading,
        size: isMiniHeading ? 10.5 : 9.5,
        color: isMiniHeading ? [0.11, 0.14, 0.19] : [0.25, 0.31, 0.39],
        topGap: isMiniHeading ? 6 : 2,
        maxChars: 102,
      });
    });

    y -= 8;
  });

  flushPage();

  const objects: string[] = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
  const pageIds: number[] = [];
  const contentIds: number[] = [];
  let objectId = 5;

  for (let i = 0; i < pageContents.length; i += 1) {
    pageIds.push(objectId);
    objectId += 1;
    contentIds.push(objectId);
    objectId += 1;
  }

  const kids = pageIds.map((id) => `${id} 0 R`).join(' ');
  objects.push(`2 0 obj\n<< /Type /Pages /Count ${pageIds.length} /Kids [ ${kids} ] >>\nendobj`);
  objects.push('3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');
  objects.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj');

  for (let i = 0; i < pageContents.length; i += 1) {
    const pageId = pageIds[i];
    const contentId = contentIds[i];
    const content = pageContents[i];
    const length = new TextEncoder().encode(content).length;
    objects.push(
      `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>\nendobj`
    );
    objects.push(`${contentId} 0 obj\n<< /Length ${length} >>\nstream\n${content}\nendstream\nendobj`);
  }

  const chunks: string[] = ['%PDF-1.4\n'];
  const offsets: number[] = [0];
  let cursor = chunks[0].length;

  objects.forEach((obj) => {
    offsets.push(cursor);
    chunks.push(`${obj}\n`);
    cursor += obj.length + 1;
  });

  const xrefStart = cursor;
  const totalObjects = objects.length + 1;
  let xref = `xref\n0 ${totalObjects}\n`;
  xref += '0000000000 65535 f \n';

  for (let i = 1; i < totalObjects; i += 1) {
    xref += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size ${totalObjects} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  const pdf = `${chunks.join('')}${xref}${trailer}`;
  return new TextEncoder().encode(pdf);
}

function downloadReportPdf(params: {
  title: string;
  websiteUrl: string;
  generatedAt: string;
  sections: ReportSection[];
}) {
  const bytes = buildPdfBinary(params);
  const safeBytes = Uint8Array.from(bytes);
  const blob = new Blob([safeBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  const safeHost = params.websiteUrl.replace(/^https?:\/\//i, '').replace(/[^\w.-]+/g, '-');
  link.href = URL.createObjectURL(blob);
  link.download = `relatorio-seo-geo-${safeHost}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

function StatCard({
  label,
  value,
  helper,
  valueClassName,
}: {
  label: string;
  value: string;
  helper: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#FFE1CF] bg-white p-4 shadow-[0_10px_28px_rgba(255,107,0,0.08)]">
      <p className="text-[11px] font-bold uppercase tracking-widest text-text-dim">{label}</p>
      <p className={`mt-2 text-2xl font-black text-text-main ${valueClassName ?? ''}`}>{value}</p>
      <p className="mt-1 text-xs text-text-muted">{helper}</p>
    </div>
  );
}

export default function SeoGeoWorkspace({ agentTitle }: SeoGeoWorkspaceProps) {
  const [websiteUrl, setWebsiteUrl] = useState(HTTPS_PREFIX);
  const [businessContext, setBusinessContext] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [reportState, setReportState] = useState<SeoGeoReportState | null>(null);
  const [isPending, startTransition] = useTransition();

  const sections = useMemo(() => parseSections(reportState?.report ?? ''), [reportState?.report]);
  const seoScore = useMemo(() => extractScore(reportState?.report ?? '', 'Score SEO estimado'), [reportState?.report]);
  const geoScore = useMemo(() => extractScore(reportState?.report ?? '', 'Score GEO estimado'), [reportState?.report]);

  const formattedDate = reportState
    ? new Date(reportState.generatedAt).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const handleGenerate = () => {
    if (isHttpsPlaceholderOnly(websiteUrl)) {
      setError('Informe a URL completa do site para análise.');
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await generateSeoGeoAudit({
        websiteUrl,
        businessContext,
      });

      if (!result.success || !result.report || !result.generatedAt) {
        setReportState(null);
        setError(result.error ?? 'Não foi possível gerar o relatório.');
        return;
      }

      setReportState({
        websiteUrl,
        generatedAt: result.generatedAt,
        report: result.report,
        usedWebSearch: Boolean(result.usedWebSearch),
      });
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[30px] p-[2px] bg-gradient-to-br from-white/40 via-orange-300/80 to-[#FF6B00] shadow-[0_24px_52px_-30px_rgba(255,107,0,0.42)]">
        <div className="rounded-[28px] bg-white/85 p-[1px]">
          <div className="rounded-[26px] border border-[#FFF1E8] bg-white p-6 md:p-8">
            <h2 className="text-sm uppercase tracking-widest text-primary font-bold mb-5">Entrada de Auditoria SEO & GEO</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-2">
                <label htmlFor="seo-url" className="text-xs font-bold uppercase tracking-widest text-text-dim">
                  URL do site para análise
                </label>
                <input
                  id="seo-url"
                  type="text"
                  value={websiteUrl}
                  onChange={(event) => setWebsiteUrl(normalizeHttpsMaskedUrlInput(event.target.value))}
                  onBlur={(event) => setWebsiteUrl(normalizeHttpsMaskedUrlInput(event.target.value))}
                  placeholder="https://seudominio.com.br"
                  className="w-full rounded-xl border border-[#E3E8EF] bg-white px-4 py-3 text-sm text-text-main outline-none transition-all focus:border-[#FFB485] focus:shadow-[0_0_0_3px_rgba(255,107,0,0.12)]"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="seo-context" className="text-xs font-bold uppercase tracking-widest text-text-dim">
                  Contexto extra (opcional)
                </label>
                <input
                  id="seo-context"
                  type="text"
                  value={businessContext}
                  onChange={(event) => setBusinessContext(event.target.value)}
                  placeholder="Setor, praça e objetivos"
                  className="w-full rounded-xl border border-[#E3E8EF] bg-white px-4 py-3 text-sm text-text-main outline-none transition-all focus:border-[#FFB485] focus:shadow-[0_0_0_3px_rgba(255,107,0,0.12)]"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isPending || isHttpsPlaceholderOnly(websiteUrl)}
                className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold tracking-wide transition-all ${
                  isPending || isHttpsPlaceholderOnly(websiteUrl)
                    ? 'cursor-not-allowed bg-[#E2E8F0] text-[#64748B]'
                    : 'bg-gradient-to-br from-[#FF6B00] to-[#FF9D00] text-white shadow-[0_10px_24px_rgba(255,107,0,0.34)] hover:brightness-105'
                }`}
              >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {isPending ? 'Gerando auditoria...' : 'Gerar relatório completo'}
              </button>

              {reportState && (
                <button
                  type="button"
                  onClick={() =>
                    downloadReportPdf({
                      title: `${agentTitle} | Auditoria SEO & GEO`,
                      websiteUrl: reportState.websiteUrl,
                      generatedAt: formattedDate,
                      sections,
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-[#B5E8CB] bg-gradient-to-br from-[#08B760] to-[#0A9D57] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(8,183,96,0.3)] transition-all hover:brightness-105"
                >
                  <Download size={16} />
                  Baixar PDF premium
                </button>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-text-muted">
              <span className="inline-flex items-center gap-1 rounded-full border border-[#E3E8EF] bg-[#F8FAFC] px-3 py-1">
                <Globe size={12} />
                Busca na web aplicada
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-[#E3E8EF] bg-[#F8FAFC] px-3 py-1">
                Estrutura: SEO + GEO + Roadmap + KPIs
              </span>
              {reportState?.usedWebSearch && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#CDE7D9] bg-[#F2FFF7] px-3 py-1 text-[#0A9D57]">
                  Fontes web consultadas em tempo real
                </span>
              )}
            </div>

            {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}
          </div>
        </div>
      </div>

      {reportState && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Score SEO"
              value={seoScore !== null ? `${seoScore}/100` : 'N/A'}
              helper="Estimativa estratégica atual"
            />
            <StatCard
              label="Score GEO"
              value={geoScore !== null ? `${geoScore}/100` : 'N/A'}
              helper="Prontidão para IA generativa"
            />
            <StatCard
              label="Site analisado"
              value={reportState.websiteUrl.replace(/^https?:\/\//, '')}
              helper="Domínio auditado"
              valueClassName="text-lg md:text-xl leading-tight break-all"
            />
            <StatCard label="Gerado em" value={formattedDate} helper="Relatório atualizado" />
          </div>

          <div className="rounded-[30px] p-[2px] bg-gradient-to-br from-white/40 via-orange-300/80 to-[#FF6B00] shadow-[0_24px_52px_-30px_rgba(255,107,0,0.42)]">
            <div className="rounded-[28px] bg-white/85 p-[1px]">
              <div className="rounded-[26px] border border-[#FFF1E8] bg-white p-6 md:p-8">
                <h3 className="text-sm uppercase tracking-widest text-primary font-bold mb-5">Resultado Estruturado</h3>
                <div className="space-y-4">
                  {sections.map((section, index) => (
                    <article
                      key={`${section.title}-${index}`}
                      className="rounded-2xl border border-[#E7ECF3] bg-[#FBFCFE] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                    >
                      <h4 className="text-base font-black text-text-main mb-3">{section.title}</h4>
                      <MarkdownSection content={section.content} />
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
