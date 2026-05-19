'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { AlertTriangle, Copy, Download, Sparkles, Star, Target, Upload } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { getFirebaseDb } from '../../lib/firebase';
import { getLatestAgentReportsFromDb, type AgentReportHistoryEntry } from '../../lib/agent-report-history';
import {
  generateConversionCopyReport,
  type ConversionCopyResponse,
  type GeneratedCopyItem,
  type ReferenceCreativeInput,
} from '../../app/actions/conversion-copy-generator';

type ConversionCopyWorkspaceProps = {
  userId?: string;
  agentSlug: string;
  agentTitle: string;
  agentCategory: string;
};

type ConversionMetrics = {
  ctrTarget: number;
  conversionTarget: number;
  cplTarget: number;
  roasTarget: number;
};

type StoredLibrary = {
  copies: GeneratedCopyItem[];
  selectedModelId: string | null;
  report: ConversionCopyResponse | null;
};

type CreativeReferenceItem = {
  id: string;
  title: string;
  source: string;
  summary: string;
  score: number;
  createdAtMs: number;
};

const CHANNELS = ['Google Ads', 'Meta Ads', 'LinkedIn Ads', 'YouTube Ads', 'Email', 'WhatsApp'] as const;
const CONTENT_TYPES = ['Anuncio direto', 'Landing Page', 'WhatsApp comercial', 'Email comercial', 'Roteiro de video curto'] as const;
const CREATIVE_FORMATS = ['Imagem estatica', 'Carrossel', 'Video UGC', 'Video institucional curto', 'Texto + grafico'] as const;
const FUNNEL_STAGES = ['Topo de funil', 'Meio de funil', 'Fundo de funil'] as const;

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.'));
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readSegmentFromDnaMetadata(metadata: AgentReportHistoryEntry['metadata']): string {
  if (!isRecord(metadata)) return '';

  const directCandidates = ['segment', 'companySegment', 'businessSegment', 'marketSegment'] as const;
  for (const candidate of directCandidates) {
    const raw = metadata[candidate];
    if (typeof raw === 'string' && raw.trim()) return raw.trim();
  }

  const presentationRaw = metadata.dnaPresentation;
  if (!isRecord(presentationRaw)) return '';

  const profileRaw = presentationRaw.idealCustomerProfile;
  if (!isRecord(profileRaw)) return '';

  const segmentRaw = profileRaw.segment;
  if (typeof segmentRaw === 'string' && segmentRaw.trim()) return segmentRaw.trim();

  return '';
}

function readSegmentFromReportContent(reportContent: string): string {
  const lines = reportContent.split('\n').map((line) => line.trim());
  const segmentLine = lines.find((line) => /^-?\s*Segmento\s*:/i.test(line));
  if (!segmentLine) return '';
  return segmentLine.replace(/^-?\s*Segmento\s*:/i, '').trim();
}

function downloadCopy(item: GeneratedCopyItem) {
  const content = [
    `Canal: ${item.channel}`,
    `Angulo: ${item.angle}`,
    `Headline: ${item.headline}`,
    '',
    `Hook: ${item.hook}`,
    '',
    'Body:',
    item.body,
    '',
    `CTA: ${item.cta}`,
    '',
    `Direcao criativa: ${item.creativeDirection}`,
    `Impacto esperado: ${item.expectedImpact}`,
  ].join('\n');

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = `copy-conversao-${item.id}.txt`;
  anchor.click();
  URL.revokeObjectURL(href);
}

function readMetricScore(metadata: AgentReportHistoryEntry['metadata']): number {
  const fields = ['resultScore', 'performanceScore', 'roas', 'ctr', 'conversionRate', 'cvr'] as const;
  for (const field of fields) {
    const raw = metadata[field];
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
    if (typeof raw === 'string') {
      const parsed = Number(raw.replace(',', '.'));
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return 0;
}

function buildReference(entry: AgentReportHistoryEntry): CreativeReferenceItem {
  const contentLines = (entry.reportContent || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 3);
  return {
    id: entry.id,
    title: readString(entry.reportTitle) || 'Criativo de referência',
    source: `${entry.agentTitle} • ${new Date(entry.generatedAt).toLocaleDateString('pt-BR')}`,
    summary: contentLines.join(' ').slice(0, 250) || 'Referência extraída do histórico de relatórios.',
    score: readMetricScore(entry.metadata),
    createdAtMs: entry.createdAtMs,
  };
}

export default function ConversionCopyWorkspace({ userId }: ConversionCopyWorkspaceProps) {
  const { profile } = useAuth();
  const [channels, setChannels] = useState<string[]>(['Google Ads']);
  const [funnelStage, setFunnelStage] = useState<string>('Meio de funil');
  const [contentType, setContentType] = useState<string>('Anuncio direto');
  const [creativeFormat, setCreativeFormat] = useState<string>('Imagem estatica');
  const [segment, setSegment] = useState('');
  const [offer, setOffer] = useState('');
  const [objective, setObjective] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [creativeInstruction, setCreativeInstruction] = useState('');
  const [suggestionImages, setSuggestionImages] = useState<File[]>([]);
  const [metrics, setMetrics] = useState<ConversionMetrics>({
    ctrTarget: 2.5,
    conversionTarget: 4,
    cplTarget: 40,
    roasTarget: 4.5,
  });

  const [report, setReport] = useState<ConversionCopyResponse | null>(null);
  const [copies, setCopies] = useState<GeneratedCopyItem[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [referenceCreatives, setReferenceCreatives] = useState<CreativeReferenceItem[]>([]);
  const [isLoadingReferences, setIsLoadingReferences] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const companyName = useMemo(() => {
    if (!profile || typeof profile !== 'object') return 'Empresa';
    const root = profile as Record<string, unknown>;
    const onboarding = root.onboarding && typeof root.onboarding === 'object' ? (root.onboarding as Record<string, unknown>) : {};
    return readString(root.companyName) || readString(root.company) || readString(onboarding.companyName) || 'Empresa';
  }, [profile]);

  const imagePreviews = useMemo(
    () =>
      suggestionImages.map((file) => ({
        name: file.name,
        src: URL.createObjectURL(file),
        sizeKb: Math.round(file.size / 1024),
      })),
    [suggestionImages]
  );

  useEffect(() => {
    return () => {
      imagePreviews.forEach((image) => URL.revokeObjectURL(image.src));
    };
  }, [imagePreviews]);

  const topReferences = useMemo(() => referenceCreatives.slice(0, 3), [referenceCreatives]);

  const selectedModel = useMemo(
    () => copies.find((item) => item.id === selectedModelId) ?? null,
    [copies, selectedModelId]
  );

  useEffect(() => {
    const loadPersistedLibrary = async () => {
      if (!userId) return;
      try {
        const db = getFirebaseDb();
        const userRef = doc(db, 'users', userId);
        const snapshot = await getDoc(userRef);
        if (!snapshot.exists()) return;
        const userData = snapshot.data() as Record<string, unknown>;
        const libraryRaw = userData.conversionCopyLibrary;
        if (!libraryRaw || typeof libraryRaw !== 'object') return;
        const library = libraryRaw as Record<string, unknown>;
        const configRaw = library.lastConfig;

        if (configRaw && typeof configRaw === 'object') {
          const config = configRaw as Record<string, unknown>;
          const savedChannels = Array.isArray(config.channels) ? config.channels.map((item) => String(item)).filter(Boolean) : [];
          if (savedChannels.length) setChannels(savedChannels);
          if (readString(config.funnelStage)) setFunnelStage(readString(config.funnelStage));
          if (readString(config.contentType)) setContentType(readString(config.contentType));
          if (readString(config.creativeFormat)) setCreativeFormat(readString(config.creativeFormat));
          const savedSegment = readString(config.segment);
          setSegment((current) => savedSegment || current);
          setOffer(readString(config.offer));
          setObjective(readString(config.objective));
          setAdditionalContext(readString(config.additionalContext));
          setCreativeInstruction(readString(config.creativeInstruction));
          setMetrics({
            ctrTarget: readNumber(config.ctrTarget) || 2.5,
            conversionTarget: readNumber(config.conversionTarget) || 4,
            cplTarget: readNumber(config.cplTarget) || 40,
            roasTarget: readNumber(config.roasTarget) || 4.5,
          });
        }

        const latestItemsRaw = Array.isArray(library.latestItems) ? library.latestItems : [];
        const parsedCopies = latestItemsRaw.map((item) => {
          const row = item as Record<string, unknown>;
          return {
            id: readString(row.id) || `copy-${Date.now()}`,
            channel: readString(row.channel),
            angle: readString(row.angle),
            headline: readString(row.headline),
            hook: readString(row.hook),
            body: readString(row.body),
            cta: readString(row.cta),
            creativeDirection: readString(row.creativeDirection),
            expectedImpact: readString(row.expectedImpact),
          } as GeneratedCopyItem;
        });
        if (parsedCopies.length) setCopies(parsedCopies);

        const selectedId = readString(library.selectedModelId);
        if (selectedId) setSelectedModelId(selectedId);

        const reportRaw = library.latestReport;
        if (reportRaw && typeof reportRaw === 'object') {
          setReport(reportRaw as ConversionCopyResponse);
        }
      } catch (loadError) {
        console.error('Erro ao carregar biblioteca de copies:', loadError);
      }
    };

    void loadPersistedLibrary();
  }, [userId]);

  useEffect(() => {
    const loadSegmentFromDnaReport = async () => {
      if (!userId || segment.trim()) return;
      try {
        const reports = await getLatestAgentReportsFromDb(userId, 'dna-da-marca', 1);
        if (!reports.length) return;
        const latest = reports[0];
        const fromMetadata = readSegmentFromDnaMetadata(latest.metadata);
        const fromContent = fromMetadata ? '' : readSegmentFromReportContent(latest.reportContent || '');
        const resolved = fromMetadata || fromContent;
        if (!resolved) return;
        setSegment((current) => (current.trim() ? current : resolved));
      } catch (dnaError) {
        console.error('Erro ao carregar segmento via DNA da Marca:', dnaError);
      }
    };

    void loadSegmentFromDnaReport();
  }, [userId, segment]);

  useEffect(() => {
    const loadCreativeReferences = async () => {
      if (!userId) return;
      setIsLoadingReferences(true);
      try {
        const reports = await getLatestAgentReportsFromDb(userId, 'gerador-de-criativos', 10);
        const parsed = reports
          .map((entry) => buildReference(entry))
          .sort((a, b) => (b.score !== a.score ? b.score - a.score : b.createdAtMs - a.createdAtMs));
        setReferenceCreatives(parsed);
      } catch (referenceError) {
        console.error('Erro ao carregar referências criativas:', referenceError);
        setReferenceCreatives([]);
      } finally {
        setIsLoadingReferences(false);
      }
    };

    void loadCreativeReferences();
  }, [userId]);

  const toggleChannel = (channel: string) => {
    setChannels((current) => {
      if (current.includes(channel)) {
        if (current.length === 1) return current;
        return current.filter((item) => item !== channel);
      }
      return [...current, channel];
    });
  };

  const persistLibrary = async (nextLibrary: StoredLibrary) => {
    if (!userId) return;
    const db = getFirebaseDb();
    await setDoc(
      doc(db, 'users', userId),
      {
        conversionCopyLibrary: {
          updatedAt: Date.now(),
          selectedModelId: nextLibrary.selectedModelId,
          totalItems: nextLibrary.copies.length,
          latestItems: nextLibrary.copies.slice(0, 20),
          latestReport: nextLibrary.report,
          lastConfig: {
            channels,
            funnelStage,
            contentType,
            creativeFormat,
            segment,
            offer,
            objective,
            additionalContext,
            creativeInstruction,
            suggestionImageNames: suggestionImages.map((item) => item.name),
            ctrTarget: metrics.ctrTarget,
            conversionTarget: metrics.conversionTarget,
            cplTarget: metrics.cplTarget,
            roasTarget: metrics.roasTarget,
          },
        },
      },
      { merge: true }
    );
  };

  const handleSuggestionImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith('image/'));
    if (!files.length) return;
    setSuggestionImages((current) => [...current, ...files].slice(0, 5));
    event.target.value = '';
  };

  const generateReport = async () => {
    if (!segment.trim() || !offer.trim() || !objective.trim()) {
      setError('Preencha segmento, oferta e objetivo para gerar a analise.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const referencePayload: ReferenceCreativeInput[] = topReferences.map((item) => ({
        title: item.title,
        source: item.source,
        summary: item.summary,
        score: item.score,
      }));

      const result = await generateConversionCopyReport({
        companyName,
        segment: segment.trim(),
        offer: offer.trim(),
        objective: objective.trim(),
        funnelStage,
        contentType,
        creativeFormat,
        channels,
        metrics,
        referenceCreatives: referencePayload,
        creativeInstruction: creativeInstruction.trim(),
        suggestionImages: suggestionImages.map((file) => ({
          name: file.name,
          type: file.type,
          sizeKb: Math.round(file.size / 1024),
        })),
        additionalContext: additionalContext.trim(),
      });

      if (!result.success && !result.data) {
        setError(result.error);
        return;
      }
      if (!result.success && result.data) {
        setError(result.error);
      }

      const responseData = result.data as ConversionCopyResponse;
      setReport(responseData);
      const merged = [...responseData.copies, ...copies]
        .filter((item, index, arr) => arr.findIndex((target) => target.id === item.id) === index)
        .slice(0, 40);
      setCopies(merged);
      await persistLibrary({ copies: merged, selectedModelId, report: responseData });
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'Erro ao gerar estudo de copies.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveSelectedModel = async (copyId: string) => {
    setSelectedModelId(copyId);
    await persistLibrary({ copies, selectedModelId: copyId, report });
  };

  return (
    <section className="rounded-[30px] p-[2px] bg-gradient-to-br from-white/40 via-orange-300/80 to-[#FF6B00] shadow-[0_24px_52px_-30px_rgba(255,107,0,0.42)]">
      <div className="rounded-[28px] bg-white/85 p-[1px]">
        <div className="rounded-[26px] border border-[#FFF1E8] bg-white p-6 md:p-8 space-y-6">
          <section className="rounded-2xl border border-[#E4EAF2] bg-[#FBFCFF] p-5">
            <h3 className="text-sm font-black text-text-main">1. Fontes e sinais de performance</h3>
            <p className="mt-1 text-sm text-text-muted">Configure os canais e metas reais para calibrar a análise de conversão.</p>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-text-dim mb-2">Canais de referência</p>
                <div className="flex flex-wrap gap-2">
                  {CHANNELS.map((channel) => {
                    const selected = channels.includes(channel);
                    return (
                      <button
                        key={channel}
                        type="button"
                        onClick={() => toggleChannel(channel)}
                        className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                          selected ? 'border-[#FF9A63] bg-[#FFF4EC] text-[#C2410C]' : 'border-[#D6DEE8] bg-white text-text-muted hover:border-[#FFBE94]'
                        }`}
                      >
                        {channel}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={segment} onChange={(event) => setSegment(event.target.value)} placeholder="Segmento da empresa" className="rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main" />
                <input value={offer} onChange={(event) => setOffer(event.target.value)} placeholder="Oferta principal" className="rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main" />
                <input value={objective} onChange={(event) => setObjective(event.target.value)} placeholder="Objetivo comercial (ex: reduzir CPL em 20%)" className="rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main md:col-span-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select value={funnelStage} onChange={(event) => setFunnelStage(event.target.value)} className="rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main">
                  {FUNNEL_STAGES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <select value={contentType} onChange={(event) => setContentType(event.target.value)} className="rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main">
                  {CONTENT_TYPES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <select value={creativeFormat} onChange={(event) => setCreativeFormat(event.target.value)} className="rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main">
                  {CREATIVE_FORMATS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <label className="space-y-1"><span className="text-[11px] font-black uppercase tracking-wide text-text-dim">CTR alvo (%)</span><input type="number" value={metrics.ctrTarget} onChange={(event) => setMetrics((prev) => ({ ...prev, ctrTarget: readNumber(event.target.value) }))} className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main" /></label>
                <label className="space-y-1"><span className="text-[11px] font-black uppercase tracking-wide text-text-dim">Conversão alvo (%)</span><input type="number" value={metrics.conversionTarget} onChange={(event) => setMetrics((prev) => ({ ...prev, conversionTarget: readNumber(event.target.value) }))} className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main" /></label>
                <label className="space-y-1"><span className="text-[11px] font-black uppercase tracking-wide text-text-dim">CPL alvo (R$)</span><input type="number" value={metrics.cplTarget} onChange={(event) => setMetrics((prev) => ({ ...prev, cplTarget: readNumber(event.target.value) }))} className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main" /></label>
                <label className="space-y-1"><span className="text-[11px] font-black uppercase tracking-wide text-text-dim">ROAS alvo</span><input type="number" value={metrics.roasTarget} onChange={(event) => setMetrics((prev) => ({ ...prev, roasTarget: readNumber(event.target.value) }))} className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main" /></label>
              </div>

              <textarea value={additionalContext} onChange={(event) => setAdditionalContext(event.target.value)} placeholder="Contexto adicional: objeções, diferenciais e cenário atual." rows={3} className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main" />
            </div>
          </section>

          <section className="rounded-2xl border border-[#E4EAF2] bg-[#FBFCFF] p-5">
            <h3 className="text-sm font-black text-text-main">2. Configurações que mais geram resultado</h3>
            <p className="mt-1 text-sm text-text-muted">Mostra referências reais (quando houver), aceita até 5 imagens e orientações textuais para guiar a geração.</p>

            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-text-dim mb-2">Criativos de referência (melhores resultados)</p>
                {isLoadingReferences ? (
                  <p className="text-sm text-text-muted">Carregando referências...</p>
                ) : topReferences.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {topReferences.map((item) => (
                      <article key={item.id} className="rounded-xl border border-[#E4EAF2] bg-white p-3">
                        <p className="text-sm font-black text-text-main">{item.title}</p>
                        <p className="mt-1 text-[11px] text-text-dim">{item.source}</p>
                        <p className="mt-2 text-xs text-text-muted leading-relaxed">{item.summary}</p>
                        <p className="mt-2 text-[11px] font-bold text-[#0A9D57]">Score: {item.score.toFixed(1)}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">Sem referências atuais de criativos no histórico para este usuário.</p>
                )}
              </div>

              <div className="rounded-xl border border-[#E1E7F0] bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-text-dim">Imagens de sugestão (máximo 5)</p>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#D9E2F4] bg-[#EEF4FF] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#1D4ED8]">
                    <Upload className="h-3.5 w-3.5" />
                    Enviar imagens
                    <input type="file" accept="image/*" multiple onChange={handleSuggestionImagesChange} className="hidden" />
                  </label>
                </div>
                {imagePreviews.length ? (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
                    {imagePreviews.map((image) => (
                      <div key={`${image.name}-${image.sizeKb}`} className="rounded-lg border border-[#E4EAF2] bg-[#FBFCFF] p-2">
                        <Image src={image.src} alt={image.name} width={320} height={160} unoptimized className="h-20 w-full rounded-md object-cover" />
                        <p className="mt-1 line-clamp-1 text-[10px] font-semibold text-text-main">{image.name}</p>
                        <p className="text-[10px] text-text-dim">{image.sizeKb} KB</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="mt-3 text-sm text-text-muted">Nenhuma imagem enviada.</p>}
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-text-dim mb-2">Instruções e orientações</p>
                <textarea value={creativeInstruction} onChange={(event) => setCreativeInstruction(event.target.value)} placeholder="Exemplo: priorizar abordagem consultiva, evitar promessa agressiva, usar tom premium e CTA para diagnóstico." rows={4} className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main" />
              </div>
            </div>
          </section>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => { void generateReport(); }} disabled={isGenerating} className="inline-flex items-center gap-2 rounded-full bg-[#FF6B00] px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-white shadow-[0_10px_22px_rgba(255,107,0,0.30)] disabled:opacity-60">
              <Sparkles className="h-4 w-4" />
              {isGenerating ? 'Processando estudo...' : 'Gerar estudo e copies'}
            </button>
            {selectedModel ? <span className="inline-flex items-center gap-1 rounded-full border border-[#BDE8CF] bg-[#F2FFF7] px-3 py-1 text-xs font-bold text-[#0A9D57]"><Star className="h-3.5 w-3.5" />Modelo ativo: {selectedModel.headline}</span> : null}
          </div>

          {error ? (
            <div className="rounded-xl border border-[#FFD2B5] bg-[#FFF7F1] px-4 py-3 text-sm text-[#B45309] flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {report ? (
            <section className="rounded-2xl border border-[#E4EAF2] bg-white p-5">
              <h3 className="text-sm font-black text-text-main">3. Insights de alta conversão</h3>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.insights.map((insight) => (
                  <article key={insight.id} className="rounded-xl border border-[#E4EAF2] bg-[#FCFDFF] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-black text-text-main">{insight.title}</p>
                      <span className="rounded-full border border-[#DCE8FF] bg-[#F5F9FF] px-2 py-1 text-[10px] font-black uppercase tracking-wide text-[#1E3A8A]">{insight.priority}</span>
                    </div>
                    <p className="mt-2 text-xs text-text-muted leading-relaxed">{insight.insight}</p>
                    <p className="mt-2 text-xs text-[#334155] leading-relaxed">{insight.whyItMatters}</p>
                    <p className="mt-2 text-[11px] font-bold text-[#0A9D57]">Confianca: {insight.confidence}%</p>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          <section className="rounded-2xl border border-[#E4EAF2] bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-black text-text-main">4. Matriz de copies e gestão de modelos</h3>
              <span className="text-xs font-semibold text-text-dim">{copies.length} copy(s)</span>
            </div>

            {!copies.length ? (
              <p className="mt-3 text-sm text-text-muted">Gere o estudo para criar copies, selecionar um modelo vencedor e baixar para execução.</p>
            ) : (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {copies.map((item) => {
                  const isModel = selectedModelId === item.id;
                  return (
                    <article key={item.id} className={`rounded-xl border p-4 ${isModel ? 'border-[#FF9A63] bg-[#FFF8F3]' : 'border-[#E4EAF2] bg-[#FCFDFF]'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-black text-text-main">{item.headline}</p>
                          <p className="text-xs text-text-dim mt-1">{item.channel} • {item.angle}</p>
                        </div>
                        {isModel ? <span className="inline-flex items-center gap-1 rounded-full border border-[#FFD0B2] bg-[#FFF1E8] px-2 py-1 text-[10px] font-black uppercase tracking-wide text-[#C2410C]">Modelo</span> : null}
                      </div>
                      <p className="mt-3 text-xs text-text-muted leading-relaxed">{item.hook}</p>
                      <p className="mt-2 text-xs text-text-main leading-relaxed">{item.body}</p>
                      <p className="mt-2 text-xs font-bold text-[#0A9D57]">CTA: {item.cta}</p>
                      <div className="mt-3 rounded-lg border border-[#E4EAF2] bg-white px-3 py-2 text-[11px] text-text-dim">
                        <p><span className="font-bold text-text-main">Direção criativa:</span> {item.creativeDirection}</p>
                        <p className="mt-1"><span className="font-bold text-text-main">Impacto esperado:</span> {item.expectedImpact}</p>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" onClick={() => { void saveSelectedModel(item.id); }} className="inline-flex items-center gap-1 rounded-full border border-[#D6DEE8] bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-text-main">
                          <Copy className="h-3.5 w-3.5" />Usar como modelo
                        </button>
                        <button type="button" onClick={() => downloadCopy(item)} className="inline-flex items-center gap-1 rounded-full border border-[#B5E8CB] bg-[#F2FFF7] px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#0A9D57]">
                          <Download className="h-3.5 w-3.5" />Download
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <div className="rounded-xl border border-[#DCE8FF] bg-[#F5F9FF] px-4 py-3 text-xs text-[#1E3A8A]">
            <p className="font-black uppercase tracking-wide mb-1 inline-flex items-center gap-2">
              <Target className="h-3.5 w-3.5" />
              Diretriz de eficiência
            </p>
            <p>Promova para modelo principal apenas copies que entregarem ganho real em conversão com CPL controlado. Esse ciclo reduz desperdício e acelera escala previsível.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
