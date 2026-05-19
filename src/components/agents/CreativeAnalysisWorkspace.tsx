'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ExternalLink, Sparkles, Target } from 'lucide-react';
import { getDoc } from 'firebase/firestore';
import { generateCreativeTrendAnalysis, type CreativeTrendItem } from '../../app/actions/creative-trend-analysis';
import { useAuth } from '../../context/AuthContext';
import { getFirebaseDb } from '../../lib/firebase';
import { getBrandDnaMemoryRef } from '../../lib/brand-dna';
import { saveAgentReportToDb } from '../../lib/agent-report-history';

type CreativeAnalysisWorkspaceProps = {
  userId?: string;
  agentSlug: string;
  agentTitle: string;
  agentCategory: string;
};

type TrendReport = {
  generatedAt: string;
  executiveSummary: string;
  detectedThemes: string[];
  items: CreativeTrendItem[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
}

function toUnique(values: string[], max = 10): string[] {
  const deduped = values.filter((item, index, arr) => arr.indexOf(item) === index);
  return deduped.slice(0, max);
}

function buildMarkdownReport(report: TrendReport): string {
  const lines: string[] = [];
  lines.push('# Análise de Criativos • Tendências das Últimas 24h');
  lines.push('');
  lines.push(`Gerado em: ${new Date(report.generatedAt).toLocaleString('pt-BR')}`);
  lines.push('');
  lines.push('## Resumo Executivo');
  lines.push(report.executiveSummary);
  lines.push('');
  lines.push('## Temas Identificados');
  report.detectedThemes.forEach((theme) => lines.push(`- ${theme}`));
  lines.push('');
  lines.push('## Top 10 Conteúdos em Destaque');
  report.items.forEach((item) => {
    lines.push(`### ${item.rank}. ${item.title}`);
    lines.push(`- Janela de publicação: ${item.publishedWindow}`);
    lines.push(`- Sinal de tendência: ${item.sourceSignal}`);
    lines.push(`- Referência: ${item.referenceUrl}`);
    lines.push(`- Formato base: ${item.baseFormat}`);
    lines.push(`- Ângulo principal: ${item.primaryAngle}`);
    lines.push(`- Relevância para o negócio: ${item.positioningForBusiness}`);
    lines.push(`- Impacto esperado: ${item.expectedImpact}`);
    lines.push(`- Canal recomendado: ${item.recommendedChannel}`);
    lines.push(`- CTA sugerido: ${item.ctaSuggestion}`);
    lines.push(`- Observação de risco: ${item.riskNote}`);
    lines.push('- Variações recomendadas:');
    item.variations.forEach((variation) => lines.push(`  - ${variation}`));
    lines.push('');
  });
  return lines.join('\n');
}

export default function CreativeAnalysisWorkspace({
  userId,
  agentSlug,
  agentTitle,
  agentCategory,
}: CreativeAnalysisWorkspaceProps) {
  const { profile } = useAuth();
  const [segment, setSegment] = useState('');
  const [themes, setThemes] = useState<string[]>([]);
  const [tone, setTone] = useState('');
  const [isLoadingDna, setIsLoadingDna] = useState(false);
  const [additionalGuidance, setAdditionalGuidance] = useState('');
  const [report, setReport] = useState<TrendReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const companyName = useMemo(() => {
    if (!profile || typeof profile !== 'object') return 'Empresa';
    const root = profile as Record<string, unknown>;
    const onboarding = isRecord(root.onboarding) ? root.onboarding : {};
    return (
      readString(root.companyName) ||
      readString(root.company) ||
      readString((onboarding as Record<string, unknown>).companyName) ||
      'Empresa'
    );
  }, [profile]);

  const companyObjectives = useMemo(() => {
    if (!profile || typeof profile !== 'object') return [];
    const root = profile as Record<string, unknown>;
    const onboarding = isRecord(root.onboarding) ? root.onboarding : {};
    const objectives = readStringArray((onboarding as Record<string, unknown>).objectives);
    return toUnique(objectives, 6);
  }, [profile]);

  useEffect(() => {
    const loadBrandDna = async () => {
      if (!userId) return;
      setIsLoadingDna(true);
      try {
        const db = getFirebaseDb();
        const dnaSnap = await getDoc(getBrandDnaMemoryRef(db, userId));
        if (!dnaSnap.exists()) return;

        const dnaData = dnaSnap.data() as Record<string, unknown>;
        const structured = isRecord(dnaData.structuredPresentation) ? dnaData.structuredPresentation : {};
        const ideal = isRecord(structured.idealCustomerProfile) ? structured.idealCustomerProfile : {};
        const audience = isRecord(structured.audienceContentProfile) ? structured.audienceContentProfile : {};
        const practical = isRecord(structured.practicalOpportunities) ? structured.practicalOpportunities : {};

        const dnaSegment = readString(ideal.segment);
        const dnaTone = readStringArray(structured.brandVoiceRules).join(' | ');
        const pillarThemes = readStringArray(structured.contentPillars);
        const highIntentThemes = readStringArray(audience.highIntentTopics);
        const practicalThemes = readStringArray(practical.contentIdeas);
        const mergedThemes = toUnique([...pillarThemes, ...highIntentThemes, ...practicalThemes], 12);

        if (dnaSegment) setSegment((current) => current || dnaSegment);
        if (dnaTone) setTone((current) => current || dnaTone);
        if (mergedThemes.length) setThemes(mergedThemes);
      } catch (loadError) {
        console.error('Erro ao carregar DNA da Marca para Análise de Criativos:', loadError);
      } finally {
        setIsLoadingDna(false);
      }
    };

    void loadBrandDna();
  }, [userId]);

  const canGenerate = Boolean(segment.trim() && themes.length >= 3 && !isGenerating);

  const generateStudy = async () => {
    if (!canGenerate) {
      setError('Defina segmento e ao menos 3 temas de interesse para gerar o estudo.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateCreativeTrendAnalysis({
        companyName,
        brandSegment: segment,
        companyObjectives,
        interestThemes: themes,
        preferredChannels: ['Meta Ads', 'Google Ads', 'LinkedIn', 'YouTube', 'Instagram'],
        toneOfVoice: tone || 'Tom consultivo com foco em conversão',
        additionalGuidance: additionalGuidance.trim(),
      });

      if (!result.success || !result.data) {
        setError(result.error || 'Não foi possível gerar o estudo agora.');
        return;
      }

      const nextReport: TrendReport = {
        generatedAt: result.data.generatedAt,
        executiveSummary: result.data.executiveSummary,
        detectedThemes: result.data.detectedThemes,
        items: result.data.items,
      };

      setReport(nextReport);

      if (userId) {
        await saveAgentReportToDb({
          userId,
          agentKey: agentSlug,
          agentTitle,
          agentCategory,
          reportTitle: `Análise de Criativos • Últimas 24h • ${companyName}`,
          reportContent: buildMarkdownReport(nextReport),
          reportFormat: 'markdown',
          generatedAt: nextReport.generatedAt,
          metadata: {
            companyName,
            companySegment: segment,
            themes,
            totalItems: nextReport.items.length,
            timeframe: 'last_24_hours',
            source: 'web_search_preview',
          },
        });
      }
    } catch (generationError) {
      console.error('Erro ao gerar Análise de Criativos:', generationError);
      setError(generationError instanceof Error ? generationError.message : 'Erro ao gerar análise.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="rounded-[30px] p-[2px] bg-gradient-to-br from-white/40 via-orange-300/80 to-[#FF6B00] shadow-[0_24px_52px_-30px_rgba(255,107,0,0.42)]">
      <div className="rounded-[28px] bg-white/85 p-[1px]">
        <div className="rounded-[26px] border border-[#FFF1E8] bg-white p-6 md:p-8 space-y-6">
          <header className="rounded-2xl border border-[#E4EAF2] bg-[#FBFCFF] p-5">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-primary">Análise de Criativos</p>
            <h3 className="mt-1 text-xl md:text-2xl font-black text-text-main">Top 10 conteúdos em destaque nas últimas 24 horas</h3>
            <p className="mt-2 text-sm text-text-muted">
              Estudo orientado por sinais reais de tendência para gerar variações de conteúdo com alta relevância para os objetivos da sua empresa.
            </p>
          </header>

          <section className="rounded-2xl border border-[#E4EAF2] bg-[#FBFCFF] p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={segment}
                onChange={(event) => setSegment(event.target.value)}
                placeholder="Segmento da empresa"
                className="rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main"
              />
              <input
                value={tone}
                onChange={(event) => setTone(event.target.value)}
                placeholder="Tom de voz da marca"
                className="rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main"
              />
            </div>

            <div>
              <p className="text-[11px] font-black uppercase tracking-wide text-text-dim">Temas de interesse (DNA da Marca)</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {themes.length ? (
                  themes.map((theme) => (
                    <span key={theme} className="rounded-full border border-[#D9E2F4] bg-white px-3 py-1 text-xs font-semibold text-[#334155]">
                      {theme}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-text-muted">Nenhum tema detectado. Gere o DNA da Marca para alimentar esta etapa.</span>
                )}
              </div>
            </div>

            <textarea
              value={additionalGuidance}
              onChange={(event) => setAdditionalGuidance(event.target.value)}
              rows={3}
              placeholder="Orientação opcional: foco em geração de leads, autoridade, oferta premium, etc."
              className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main"
            />

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  void generateStudy();
                }}
                disabled={!canGenerate}
                className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.08em] transition-all ${
                  canGenerate
                    ? 'bg-[#FF6B00] text-white shadow-[0_10px_22px_rgba(255,107,0,0.30)] hover:brightness-105'
                    : 'bg-[#E2E8F0] text-[#64748B] cursor-not-allowed'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                {isGenerating ? 'Gerando estudo...' : 'Gerar estudo 24h'}
              </button>
              {isLoadingDna ? <span className="text-xs font-semibold text-text-dim">Carregando DNA da Marca...</span> : null}
            </div>
          </section>

          {error ? (
            <div className="rounded-xl border border-[#FFD2B5] bg-[#FFF7F1] px-4 py-3 text-sm text-[#B45309] flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {report ? (
            <section className="rounded-2xl border border-[#E4EAF2] bg-white p-5 space-y-4">
              <div className="rounded-xl border border-[#E5ECF5] bg-[#FBFCFF] p-4">
                <p className="text-[11px] font-black uppercase tracking-wide text-text-dim">Resumo executivo</p>
                <p className="mt-2 text-sm leading-relaxed text-text-main">{report.executiveSummary}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {report.detectedThemes.map((theme) => (
                    <span key={theme} className="rounded-full border border-[#DCE8FF] bg-[#F5F9FF] px-3 py-1 text-xs font-semibold text-[#1E3A8A]">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {report.items.map((item) => (
                  <article key={`${item.rank}-${item.title}`} className="rounded-xl border border-[#E4EAF2] bg-[#FBFCFF] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-black text-text-main">
                        {item.rank}. {item.title}
                      </p>
                      <span className="rounded-full border border-[#FFE1CF] bg-[#FFF6EF] px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#C2410C]">
                        {item.publishedWindow}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-text-muted leading-relaxed">{item.whyTrendingNow}</p>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[#334155]">
                      <p><strong>Sinal:</strong> {item.sourceSignal}</p>
                      <p><strong>Formato:</strong> {item.baseFormat}</p>
                      <p><strong>Ângulo:</strong> {item.primaryAngle}</p>
                      <p><strong>Canal recomendado:</strong> {item.recommendedChannel}</p>
                      <p className="md:col-span-2"><strong>Posicionamento:</strong> {item.positioningForBusiness}</p>
                      <p className="md:col-span-2"><strong>Impacto esperado:</strong> {item.expectedImpact}</p>
                      <p className="md:col-span-2"><strong>CTA sugerido:</strong> {item.ctaSuggestion}</p>
                    </div>

                    <div className="mt-3">
                      <p className="text-[11px] font-black uppercase tracking-wide text-text-dim">Variações sugeridas</p>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                        {item.variations.slice(0, 3).map((variation) => (
                          <div key={variation} className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs text-text-main">
                            {variation}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] text-[#64748B]">Risco/atenção: {item.riskNote || 'Sem risco crítico identificado.'}</p>
                      {item.referenceUrl ? (
                        <a
                          href={item.referenceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#1D4ED8] hover:underline"
                        >
                          Ver referência
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>

              <div className="rounded-xl border border-[#B9EBD1] bg-[#F2FFF7] px-4 py-3 text-xs text-[#0A9D57] flex items-start gap-2">
                <Target className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  Estudo concluído com 10 referências recentes. Use os ângulos e variações para criar campanhas com escala previsível e consistência de performance.
                </span>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </section>
  );
}
