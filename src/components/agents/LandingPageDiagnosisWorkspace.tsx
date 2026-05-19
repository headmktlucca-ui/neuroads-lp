'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, CheckCircle2, Sparkles, Target } from 'lucide-react';
import {
  generateLandingPageDiagnosis,
  type LandingPageDiagnosisData,
} from '../../app/actions/landing-page-diagnosis';
import { getLatestAgentReportsFromDb, saveAgentReportToDb } from '../../lib/agent-report-history';

type Props = {
  userId?: string;
  agentSlug: string;
  agentTitle: string;
  agentCategory: string;
};

type ScoreCardItem = {
  key: keyof LandingPageDiagnosisData['scores'];
  label: string;
};

const SCORE_ITEMS: ScoreCardItem[] = [
  { key: 'conversion', label: 'Conversão' },
  { key: 'offerClarity', label: 'Clareza da Oferta' },
  { key: 'ux', label: 'UX' },
  { key: 'copy', label: 'Copy' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'scannability', label: 'Escaneabilidade' },
  { key: 'authority', label: 'Autoridade' },
];

function readDomain(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./i, '');
  } catch {
    return value;
  }
}

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function formatDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Data indisponível';
  return parsed.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function priorityClass(value: 'Alta' | 'Média' | 'Baixa'): string {
  if (value === 'Alta') return 'border-[#FECACA] bg-[#FFF1F2] text-[#B42318]';
  if (value === 'Média') return 'border-[#FDD79A] bg-[#FFF8EA] text-[#B45309]';
  return 'border-[#BDE8CF] bg-[#F2FFF7] text-[#0A9D57]';
}

function impactClass(value: 'Alto' | 'Médio' | 'Baixo'): string {
  if (value === 'Alto') return 'border-[#FFD9C2] bg-[#FFF6EF] text-[#C2410C]';
  if (value === 'Médio') return 'border-[#DCE8FF] bg-[#F5F9FF] text-[#1D4ED8]';
  return 'border-[#E5E7EB] bg-[#F8FAFC] text-[#475467]';
}

function scoreClass(score: number): string {
  if (score >= 8) return 'text-[#0A9D57]';
  if (score >= 6) return 'text-[#B45309]';
  return 'text-[#B42318]';
}

function buildReportMarkdown(data: LandingPageDiagnosisData, adPromise: string, businessGoal: string): string {
  const lines: string[] = [];
  lines.push(`# Diagnóstico de Landing Page • ${readDomain(data.analyzedUrl)}`);
  lines.push('');
  lines.push(`Gerado em: ${formatDate(data.analyzedAt)}`);
  lines.push(`URL analisada: ${data.analyzedUrl}`);
  lines.push(`Promessa do anúncio: ${adPromise}`);
  if (businessGoal.trim()) lines.push(`Objetivo de negócio: ${businessGoal.trim()}`);
  lines.push('');
  lines.push('## Diagnóstico Executivo');
  lines.push(`- Score geral: ${data.executiveSummary.overallScore}/10`);
  lines.push(`- Síntese: ${data.executiveSummary.keyTakeaway}`);
  lines.push(`- Gargalo crítico: ${data.executiveSummary.criticalBottleneck}`);
  lines.push(`- Quick win: ${data.executiveSummary.quickWin}`);
  lines.push('');
  lines.push('## Scorecards');
  SCORE_ITEMS.forEach((item) => {
    const score = data.scores[item.key];
    lines.push(`- ${item.label}: ${score.score}/10 — ${score.justification}`);
  });
  lines.push('');
  lines.push('## Diagnóstico Detalhado');
  const detailRows: Array<[string, LandingPageDiagnosisData['diagnostics'][keyof LandingPageDiagnosisData['diagnostics']]]> = [
    ['Clareza da oferta', data.diagnostics.offerClarity],
    ['CRO e fluxo', data.diagnostics.croFlow],
    ['UX e acessibilidade', data.diagnostics.uxAccessibility],
    ['Percepção emocional', data.diagnostics.emotionalPerception],
    ['Copywriting', data.diagnostics.copywriting],
    ['Prova social e autoridade', data.diagnostics.socialProofAuthority],
    ['Consistência anúncio ↔ página', data.diagnostics.adToPageConsistency],
  ];

  detailRows.forEach(([title, section]) => {
    lines.push(`### ${title}`);
    lines.push(section.summary);
    if (section.findings.length) {
      lines.push('- Achados:');
      section.findings.forEach((item) => lines.push(`  - ${item}`));
    }
    if (section.frictionPoints.length) {
      lines.push('- Fricções:');
      section.frictionPoints.forEach((item) => lines.push(`  - ${item}`));
    }
    lines.push('');
  });

  lines.push('## Heatmap Cognitivo Simulado');
  lines.push(`- Zonas de atenção: ${data.cognitiveHeatmap.attentionZones.join(' | ') || 'N/D'}`);
  lines.push(`- Zonas mortas: ${data.cognitiveHeatmap.deadZones.join(' | ') || 'N/D'}`);
  lines.push(`- Pontos de abandono: ${data.cognitiveHeatmap.likelyDropOffPoints.join(' | ') || 'N/D'}`);
  lines.push(`- Pontos de dúvida: ${data.cognitiveHeatmap.doubtMoments.join(' | ') || 'N/D'}`);
  lines.push('');

  lines.push('## Problemas Críticos');
  data.criticalIssues.forEach((item) => lines.push(`- ${item}`));
  lines.push('');

  lines.push('## Recomendações Priorizadas');
  data.priorityRecommendations.forEach((item) =>
    lines.push(`- ${item.title}: ${item.action} | Impacto: ${item.impact} | Facilidade: ${item.ease} | Urgência: ${item.urgency}`)
  );
  lines.push('');

  lines.push('## Simulação de Impacto');
  lines.push(`- Uplift de conversão: ${data.impactForecast.conversionUpliftPct}`);
  lines.push(`- Redução de abandono: ${data.impactForecast.abandonmentReductionPct}`);
  lines.push(`- Melhora de retenção: ${data.impactForecast.retentionImprovementPct}`);
  lines.push(`- Melhora estimada de CTR: ${data.impactForecast.ctrImprovementPct}`);
  lines.push(`- Confiança: ${data.impactForecast.confidence}/100`);
  lines.push(`- Nota: ${data.impactForecast.note}`);
  lines.push('');

  lines.push('## Sugestões Estratégicas');
  lines.push(`- Layout: ${data.strategicSuggestions.layout.join(' | ') || 'N/D'}`);
  lines.push(`- Copy: ${data.strategicSuggestions.copy.join(' | ') || 'N/D'}`);
  lines.push(`- Estrutura: ${data.strategicSuggestions.structure.join(' | ') || 'N/D'}`);
  lines.push(`- CTA: ${data.strategicSuggestions.cta.join(' | ') || 'N/D'}`);

  return lines.join('\n');
}

export default function LandingPageDiagnosisWorkspace({ userId, agentSlug, agentTitle, agentCategory }: Props) {
  const [landingPageUrl, setLandingPageUrl] = useState('');
  const [adPromise, setAdPromise] = useState('');
  const [businessGoal, setBusinessGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [result, setResult] = useState<LandingPageDiagnosisData | null>(null);
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    const loadHistory = async () => {
      if (!userId) return;
      try {
        const entries = await getLatestAgentReportsFromDb(userId, agentSlug, 10);
        setHistoryCount(entries.length);
      } catch (historyError) {
        console.error('Erro ao carregar histórico do Diagnóstico de Landing Page:', historyError);
      }
    };
    void loadHistory();
  }, [agentSlug, userId]);

  const canRun = useMemo(() => {
    return Boolean(landingPageUrl.trim() && adPromise.trim() && !loading);
  }, [adPromise, landingPageUrl, loading]);

  const runDiagnosis = async () => {
    if (!canRun) {
      setError('Informe URL da landing page e promessa do anúncio para iniciar o diagnóstico.');
      return;
    }

    setLoading(true);
    setError(null);
    setNotice(null);

    const normalizedUrl = normalizeUrl(landingPageUrl);

    try {
      const response = await generateLandingPageDiagnosis({
        landingPageUrl: normalizedUrl,
        adPromise,
        businessGoal,
      });

      if (!response.success || !response.data) {
        setError(response.error || 'Não foi possível gerar o diagnóstico neste momento.');
        return;
      }

      setResult(response.data);
      if (response.warning) setNotice(response.warning);

      if (userId) {
        const reportTitle = `Diagnóstico LP • ${readDomain(response.data.analyzedUrl)} • ${new Date(response.data.analyzedAt).toLocaleDateString('pt-BR')}`;
        const reportContent = buildReportMarkdown(response.data, adPromise, businessGoal);

        await saveAgentReportToDb({
          userId,
          agentKey: agentSlug,
          agentTitle,
          agentCategory,
          reportTitle,
          reportContent,
          reportFormat: 'markdown',
          generatedAt: response.data.analyzedAt,
          metadata: {
            websiteUrl: response.data.analyzedUrl,
            adPromise,
            businessGoal: businessGoal.trim() || '',
            overallScore: response.data.executiveSummary.overallScore,
            criticalBottleneck: response.data.executiveSummary.criticalBottleneck,
            topPriority: response.data.priorityRecommendations[0]?.title || '',
            principalImpact: response.data.impactForecast.conversionUpliftPct,
            confidence: response.data.impactForecast.confidence,
          },
        });

        const latest = await getLatestAgentReportsFromDb(userId, agentSlug, 10);
        setHistoryCount(latest.length);
      }
    } catch (diagnosisError) {
      console.error('Erro ao gerar diagnóstico de landing page:', diagnosisError);
      setError(diagnosisError instanceof Error ? diagnosisError.message : 'Erro inesperado ao gerar diagnóstico.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[30px] p-[2px] bg-gradient-to-br from-white/40 via-orange-300/80 to-[#FF6B00] shadow-[0_24px_52px_-30px_rgba(255,107,0,0.42)]">
      <div className="rounded-[28px] bg-white/85 p-[1px]">
        <div className="rounded-[26px] border border-[#FFF1E8] bg-white p-6 md:p-8 space-y-6">
          <section className="rounded-2xl border border-[#E4EAF2] bg-[#FBFCFF] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-text-main">1. Entrada da análise</h3>
                <p className="mt-1 text-sm text-text-muted">
                  Informe a URL final e a promessa do anúncio para calibrar diagnóstico estratégico de conversão.
                </p>
              </div>
              <span className="rounded-full border border-[#DCE8FF] bg-[#F5F9FF] px-3 py-1 text-xs font-bold text-[#1D4ED8]">
                Histórico: {historyCount} relatório(s)
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                value={landingPageUrl}
                onChange={(event) => setLandingPageUrl(event.target.value)}
                placeholder="URL da landing page (ex: https://site.com/oferta)"
                className="rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main"
              />
              <input
                value={adPromise}
                onChange={(event) => setAdPromise(event.target.value)}
                placeholder="Promessa do anúncio (ex: Reduzir CPL em 20%)"
                className="rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main"
              />
            </div>

            <textarea
              value={businessGoal}
              onChange={(event) => setBusinessGoal(event.target.value)}
              rows={2}
              placeholder="Objetivo da campanha (opcional) — ex: aumentar leads qualificados sem elevar CAC."
              className="mt-3 w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main"
            />

            <button
              type="button"
              onClick={() => {
                void runDiagnosis();
              }}
              disabled={!canRun}
              className={`mt-4 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black uppercase tracking-[0.08em] transition-all ${
                canRun
                  ? 'bg-[#FF6B00] text-white shadow-[0_10px_22px_rgba(255,107,0,0.30)] hover:brightness-105'
                  : 'bg-[#E2E8F0] text-[#64748B] cursor-not-allowed'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              {loading ? 'Analisando...' : 'Executar Diagnóstico'}
            </button>
          </section>

          {error ? (
            <div className="rounded-xl border border-[#FFD2B5] bg-[#FFF7F1] px-4 py-3 text-sm text-[#B45309] flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {notice ? (
            <div className="rounded-xl border border-[#DCE8FF] bg-[#F5F9FF] px-4 py-3 text-sm text-[#1D4ED8] flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{notice}</span>
            </div>
          ) : null}

          {result ? (
            <>
              <section className="rounded-2xl border border-[#E4EAF2] bg-white p-5">
                <h3 className="text-sm font-black text-text-main">2. Diagnóstico executivo</h3>
                <p className="mt-1 text-sm text-text-muted">
                  Score geral {result.executiveSummary.overallScore}/10 • Analisado em {formatDate(result.analyzedAt)}
                </p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <article className="rounded-xl border border-[#E5ECF5] bg-[#FBFCFF] p-3">
                    <p className="text-[10px] font-black uppercase tracking-wide text-text-dim">Score geral</p>
                    <p className={`mt-1 text-lg font-black ${scoreClass(result.executiveSummary.overallScore)}`}>
                      {result.executiveSummary.overallScore}/10
                    </p>
                  </article>
                  <article className="rounded-xl border border-[#E5ECF5] bg-[#FBFCFF] p-3 md:col-span-3">
                    <p className="text-[10px] font-black uppercase tracking-wide text-text-dim">Síntese executiva</p>
                    <p className="mt-1 text-sm text-text-main">{result.executiveSummary.keyTakeaway}</p>
                  </article>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <article className="rounded-xl border border-[#FFE1CF] bg-[#FFF8F3] p-3">
                    <p className="text-[10px] font-black uppercase tracking-wide text-[#C2410C]">Gargalo crítico</p>
                    <p className="mt-1 text-sm text-[#7C2D12]">{result.executiveSummary.criticalBottleneck}</p>
                  </article>
                  <article className="rounded-xl border border-[#CDE7D9] bg-[#F2FFF7] p-3">
                    <p className="text-[10px] font-black uppercase tracking-wide text-[#0A9D57]">Quick win</p>
                    <p className="mt-1 text-sm text-[#065F46]">{result.executiveSummary.quickWin}</p>
                  </article>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                  {SCORE_ITEMS.map((item) => {
                    const score = result.scores[item.key];
                    return (
                      <article key={item.key} className="rounded-xl border border-[#E4EAF2] bg-[#FBFCFF] p-3">
                        <p className="text-[10px] font-black uppercase tracking-wide text-text-dim">{item.label}</p>
                        <p className={`mt-1 text-base font-black ${scoreClass(score.score)}`}>{score.score}/10</p>
                        <p className="mt-1 text-xs text-text-muted leading-relaxed">{score.justification}</p>
                      </article>
                    );
                  })}
                </div>
              </section>

              <section className="rounded-2xl border border-[#E4EAF2] bg-white p-5 space-y-4">
                <h3 className="text-sm font-black text-text-main">3. Diagnóstico detalhado</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { title: 'Clareza da oferta', data: result.diagnostics.offerClarity },
                    { title: 'CRO e fluxo', data: result.diagnostics.croFlow },
                    { title: 'UX, mobile e acessibilidade', data: result.diagnostics.uxAccessibility },
                    { title: 'Diagnóstico emocional', data: result.diagnostics.emotionalPerception },
                    { title: 'Copywriting e persuasão', data: result.diagnostics.copywriting },
                    { title: 'Prova social e autoridade', data: result.diagnostics.socialProofAuthority },
                    { title: 'Consistência anúncio ↔ landing page', data: result.diagnostics.adToPageConsistency },
                  ].map((section) => (
                    <article key={section.title} className="rounded-xl border border-[#E4EAF2] bg-[#FBFCFF] p-4">
                      <p className="text-sm font-black text-text-main">{section.title}</p>
                      <p className="mt-2 text-xs text-text-muted leading-relaxed">{section.data.summary}</p>
                      <div className="mt-2 space-y-2">
                        {section.data.findings.length ? (
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wide text-text-dim">Achados</p>
                            <ul className="mt-1 space-y-1">
                              {section.data.findings.map((item) => (
                                <li key={item} className="text-xs text-text-main leading-relaxed">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                        {section.data.frictionPoints.length ? (
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wide text-text-dim">Fricções</p>
                            <ul className="mt-1 space-y-1">
                              {section.data.frictionPoints.map((item) => (
                                <li key={item} className="text-xs text-text-main leading-relaxed">• {item}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>

                <article className="rounded-xl border border-[#E4EAF2] bg-[#FBFCFF] p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-[#1D4ED8]" />
                    <p className="text-sm font-black text-text-main">Heatmap cognitivo simulado</p>
                  </div>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-[#DCE8FF] bg-[#F5F9FF] p-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-[#1D4ED8]">Zonas de atenção</p>
                      <ul className="mt-1 space-y-1">
                        {result.cognitiveHeatmap.attentionZones.map((item) => (
                          <li key={item} className="text-xs text-[#1E3A8A]">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg border border-[#FECACA] bg-[#FFF1F2] p-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-[#B42318]">Zonas mortas</p>
                      <ul className="mt-1 space-y-1">
                        {result.cognitiveHeatmap.deadZones.map((item) => (
                          <li key={item} className="text-xs text-[#7F1D1D]">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg border border-[#FFE1CF] bg-[#FFF8F3] p-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-[#C2410C]">Pontos de abandono</p>
                      <ul className="mt-1 space-y-1">
                        {result.cognitiveHeatmap.likelyDropOffPoints.map((item) => (
                          <li key={item} className="text-xs text-[#7C2D12]">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg border border-[#FDD79A] bg-[#FFF8EA] p-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-[#B45309]">Pontos de dúvida</p>
                      <ul className="mt-1 space-y-1">
                        {result.cognitiveHeatmap.doubtMoments.map((item) => (
                          <li key={item} className="text-xs text-[#92400E]">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              </section>

              <section className="rounded-2xl border border-[#E4EAF2] bg-white p-5 space-y-4">
                <h3 className="text-sm font-black text-text-main">4. Ação e impacto</h3>

                <article className="rounded-xl border border-[#FFE1CF] bg-[#FFF8F3] p-4">
                  <p className="text-[11px] font-black uppercase tracking-wide text-[#C2410C]">Problemas críticos</p>
                  <ul className="mt-2 space-y-1">
                    {result.criticalIssues.map((item) => (
                      <li key={item} className="text-sm text-[#7C2D12] leading-relaxed">• {item}</li>
                    ))}
                  </ul>
                </article>

                <article className="rounded-xl border border-[#E4EAF2] bg-[#FBFCFF] p-4">
                  <p className="text-[11px] font-black uppercase tracking-wide text-text-dim">Recomendações priorizadas</p>
                  <div className="mt-3 space-y-3">
                    {result.priorityRecommendations.map((recommendation) => (
                      <div key={`${recommendation.title}-${recommendation.action}`} className="rounded-lg border border-[#E4EAF2] bg-white p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-black text-text-main">{recommendation.title}</p>
                          <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-wide">
                            <span className={`rounded-full border px-2.5 py-1 ${impactClass(recommendation.impact)}`}>Impacto: {recommendation.impact}</span>
                            <span className="rounded-full border border-[#E5E7EB] bg-[#F8FAFC] px-2.5 py-1 text-[#475467]">Facilidade: {recommendation.ease}</span>
                            <span className={`rounded-full border px-2.5 py-1 ${priorityClass(recommendation.urgency)}`}>Urgência: {recommendation.urgency}</span>
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-text-main leading-relaxed">{recommendation.action}</p>
                        <p className="mt-1 text-xs text-text-muted leading-relaxed">{recommendation.rationale}</p>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="rounded-xl border border-[#B9EBD1] bg-[#F2FFF7] p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-[#0A9D57]" />
                    <p className="text-[11px] font-black uppercase tracking-wide text-[#0A9D57]">Simulação de impacto esperado</p>
                  </div>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="rounded-lg border border-[#CDE7D9] bg-white p-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-text-dim">Conversão</p>
                      <p className="mt-1 text-sm font-black text-[#065F46]">{result.impactForecast.conversionUpliftPct}</p>
                    </div>
                    <div className="rounded-lg border border-[#CDE7D9] bg-white p-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-text-dim">Abandono</p>
                      <p className="mt-1 text-sm font-black text-[#065F46]">{result.impactForecast.abandonmentReductionPct}</p>
                    </div>
                    <div className="rounded-lg border border-[#CDE7D9] bg-white p-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-text-dim">Retenção</p>
                      <p className="mt-1 text-sm font-black text-[#065F46]">{result.impactForecast.retentionImprovementPct}</p>
                    </div>
                    <div className="rounded-lg border border-[#CDE7D9] bg-white p-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-text-dim">CTR</p>
                      <p className="mt-1 text-sm font-black text-[#065F46]">{result.impactForecast.ctrImprovementPct}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-[#065F46]">
                    Confiança preditiva: <strong>{result.impactForecast.confidence}/100</strong> • {result.impactForecast.note}
                  </p>
                </article>

                <article className="rounded-xl border border-[#DCE8FF] bg-[#F5F9FF] p-4">
                  <p className="text-[11px] font-black uppercase tracking-wide text-[#1D4ED8]">Sugestões estratégicas</p>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="rounded-lg border border-[#DCE8FF] bg-white p-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-text-dim">Layout</p>
                      <ul className="mt-1 space-y-1">
                        {result.strategicSuggestions.layout.map((item) => (
                          <li key={item} className="text-xs text-[#1E3A8A]">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg border border-[#DCE8FF] bg-white p-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-text-dim">Copy</p>
                      <ul className="mt-1 space-y-1">
                        {result.strategicSuggestions.copy.map((item) => (
                          <li key={item} className="text-xs text-[#1E3A8A]">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg border border-[#DCE8FF] bg-white p-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-text-dim">Estrutura</p>
                      <ul className="mt-1 space-y-1">
                        {result.strategicSuggestions.structure.map((item) => (
                          <li key={item} className="text-xs text-[#1E3A8A]">• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-lg border border-[#DCE8FF] bg-white p-3">
                      <p className="text-[10px] font-black uppercase tracking-wide text-text-dim">CTA</p>
                      <ul className="mt-1 space-y-1">
                        {result.strategicSuggestions.cta.map((item) => (
                          <li key={item} className="text-xs text-[#1E3A8A]">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              </section>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

