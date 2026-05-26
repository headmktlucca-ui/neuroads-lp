'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  CircleGauge,
  Copy,
  Download,
  FileText,
  HandCoins,
  HeartHandshake,
  Lightbulb,
  Loader2,
  Mail,
  Megaphone,
  Palette,
  Save,
  Sparkles,
  Target,
  UsersRound,
} from 'lucide-react';
import { setDoc } from 'firebase/firestore';
import {
  generateDnaBrandReport,
  type DnaBrandInput,
  type DnaBrandPresentation,
  type DnaBrandSource,
  type DnaBrandColor,
  type DnaBrandColorPalette,
} from '../../app/actions/dna-brand';
import { useAuth } from '../../context/AuthContext';
import { getFirebaseDb } from '../../lib/firebase';
import { getBrandDnaMemoryRef, type BrandDnaMemoryRecord } from '../../lib/brand-dna';
import { saveAgentReportToDb } from '../../lib/agent-report-history';

type Props = {
  userId?: string;
  agentSlug: string;
  agentTitle: string;
  agentCategory: string;
};

type GenerateState = {
  presentation: DnaBrandPresentation;
  reportMarkdown: string;
  sources: DnaBrandSource[];
  generatedAt: string;
};

const EMPTY_FORM: DnaBrandInput = {
  siteUrl: '',
  instagramUrl: '',
  linkedinUrl: '',
};

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object') return {};
  return value as Record<string, unknown>;
}

function ensureProtocol(value: string): string {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

function normalizeSocialUrl(raw: string, kind: 'instagram' | 'linkedin'): string {
  const value = raw.trim();
  if (!value) return '';

  if (kind === 'instagram') {
    if (value.startsWith('@')) return `https://instagram.com/${value.slice(1)}`;
    if (!value.includes('.') && !value.includes('/')) return `https://instagram.com/${value}`;
    return ensureProtocol(value);
  }

  if (value.startsWith('@')) return `https://www.linkedin.com/in/${value.slice(1)}`;
  if (/^in\//i.test(value)) return `https://www.linkedin.com/${value}`;
  if (!value.includes('.') && !value.includes('/')) return `https://www.linkedin.com/in/${value}`;
  return ensureProtocol(value);
}

function normalizeSiteUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return '';
  return ensureProtocol(value);
}

function validateUrl(urlLike: string): boolean {
  if (!urlLike) return false;
  try {
    const parsed = new URL(ensureProtocol(urlLike));
    return Boolean(parsed.hostname && parsed.hostname.includes('.'));
  } catch {
    return false;
  }
}

function isInstagramUrl(urlLike: string): boolean {
  if (!validateUrl(urlLike)) return false;
  try {
    const host = new URL(ensureProtocol(urlLike)).hostname.toLowerCase();
    return host.includes('instagram.com');
  } catch {
    return false;
  }
}

function isLinkedinUrl(urlLike: string): boolean {
  if (!validateUrl(urlLike)) return false;
  try {
    const host = new URL(ensureProtocol(urlLike)).hostname.toLowerCase();
    return host.includes('linkedin.com');
  } catch {
    return false;
  }
}

function getPrefilledLinks(profile: unknown): DnaBrandInput {
  const root = asRecord(profile);
  const onboarding = asRecord(root.onboarding);
  const profileDetails = asRecord(root.profileDetails);

  const siteRaw =
    readString(root.site) ||
    readString(root.website) ||
    readString(root.siteUrl) ||
    readString(onboarding.site) ||
    readString(onboarding.website) ||
    readString(profileDetails.site) ||
    readString(profileDetails.website);

  const instagramRaw =
    readString(root.instagram) ||
    readString(onboarding.instagram) ||
    readString(profileDetails.instagram);

  const linkedinRaw =
    readString(root.linkedin) ||
    readString(onboarding.linkedin) ||
    readString(profileDetails.linkedin);

  return {
    siteUrl: normalizeSiteUrl(siteRaw),
    instagramUrl: normalizeSocialUrl(instagramRaw, 'instagram'),
    linkedinUrl: normalizeSocialUrl(linkedinRaw, 'linkedin'),
  };
}

function normalizePdfText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

async function downloadBrandDnaPdf(result: GenerateState) {
  const jsPdfModule = await import('jspdf');
  const JsPdfCtor = jsPdfModule.jsPDF;
  const doc = new JsPdfCtor({ unit: 'pt', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 44;
  const maxWidth = pageWidth - marginX * 2;
  const lineHeight = 16;
  let y = 56;

  const ensureSpace = (needed: number) => {
    if (y + needed <= pageHeight - 50) return;
    doc.addPage();
    y = 56;
  };

  const writeText = (text: string, opts?: { size?: number; bold?: boolean; gapTop?: number }) => {
    const content = normalizePdfText(text);
    if (!content) return;
    const size = opts?.size ?? 11;
    const gapTop = opts?.gapTop ?? 0;
    const fontStyle = opts?.bold ? 'bold' : 'normal';
    const lines = doc.splitTextToSize(content, maxWidth) as string[];

    ensureSpace(gapTop + lines.length * lineHeight + 10);
    y += gapTop;
    doc.setFont('helvetica', fontStyle);
    doc.setFontSize(size);

    for (const line of lines) {
      doc.text(line, marginX, y);
      y += lineHeight;
    }
  };

  writeText(result.presentation.presentationTitle, { size: 18, bold: true });
  writeText(`Gerado em: ${new Date(result.generatedAt).toLocaleString('pt-BR')}`, { size: 10, gapTop: 4 });
  writeText('Resumo Executivo', { size: 13, bold: true, gapTop: 12 });
  writeText(result.presentation.executiveSummary);
  writeText('Posicionamento Central', { size: 13, bold: true, gapTop: 10 });
  writeText(result.presentation.positioningStatement);

  const palette = result.presentation.colorPalette;
  if (palette && palette.colors) {
    writeText('Paleta de Cores da Marca', { size: 13, bold: true, gapTop: 10 });
    palette.colors.forEach((c) => {
      writeText(`- ${c.name} (${c.hex} - ${c.type}): ${c.usage}`);
    });
    if (palette.psychologicalImpact) {
      writeText(`Impacto Psicologico: ${palette.psychologicalImpact}`, { gapTop: 4 });
    }
    if (palette.visualStyleDescription) {
      writeText(`Diretrizes de Estilo: ${palette.visualStyleDescription}`, { gapTop: 4 });
    }
  }

  writeText('Perfil Ideal De Cliente', { size: 13, bold: true, gapTop: 10 });
  writeText(`Headline: ${result.presentation.idealCustomerProfile.headline}`);
  writeText(`Segmento: ${result.presentation.idealCustomerProfile.segment}`);
  writeText(`Porte: ${result.presentation.idealCustomerProfile.companySize}`);
  writeText(`Faixa de receita: ${result.presentation.idealCustomerProfile.annualRevenueRange}`);
  writeText(`Contexto de urgencia: ${result.presentation.idealCustomerProfile.urgencyContext}`);
  writeText(
    `Score de probabilidade: ${clampScore(result.presentation.idealCustomerProfile.probabilityScore)}/100`
  );
  writeText(`Score de necessidade: ${clampScore(result.presentation.idealCustomerProfile.needScore)}/100`);
  result.presentation.idealCustomerProfile.mainPainPoints.forEach((item) => writeText(`- Dor: ${item}`));
  result.presentation.idealCustomerProfile.buyingTriggers.forEach((item) =>
    writeText(`- Gatilho de decisao: ${item}`)
  );

  writeText('Conteudo De Maior Interesse E Interacao', { size: 13, bold: true, gapTop: 10 });
  writeText(result.presentation.audienceContentProfile.summary);
  result.presentation.audienceContentProfile.preferredFormats.forEach((item) =>
    writeText(`- Formato preferido: ${item}`)
  );
  result.presentation.audienceContentProfile.highIntentTopics.forEach((item) =>
    writeText(`- Tema de alta intencao: ${item}`)
  );
  result.presentation.audienceContentProfile.interactionDrivers.forEach((item) =>
    writeText(`- Driver de interacao: ${item}`)
  );
  result.presentation.audienceContentProfile.recommendedContentMix.forEach((item) =>
    writeText(
      `- ${item.topic} | ${item.format} | ${item.channel} | potencial ${clampScore(item.engagementPotential)}/100 | ${item.whyItWorks}`
    )
  );

  const practical = result.presentation.practicalOpportunities;
  if (practical) {
    writeText('Oportunidades Praticas Para Fortalecer O Posicionamento', { size: 13, bold: true, gapTop: 10 });
    practical.positioningOpportunities.forEach((item) => writeText(`- Posicionamento: ${item}`));
    practical.contentIdeas.forEach((item) => writeText(`- Conteudo: ${item}`));
    practical.materialSuggestions.forEach((item) => writeText(`- Materiais: ${item}`));
    practical.relationshipFunnel.forEach((item) => writeText(`- Funil de relacionamento: ${item}`));
    practical.paidCampaignOpportunities.forEach((item) => writeText(`- Campanhas patrocinadas: ${item}`));
    practical.emailMarketingOpportunities.forEach((item) => writeText(`- Email marketing: ${item}`));
    practical.otherPracticalOpportunities.forEach((item) => writeText(`- Outras oportunidades: ${item}`));
  }

  const writeList = (title: string, items: string[]) => {
    writeText(title, { size: 13, bold: true, gapTop: 10 });
    items.forEach((item) => writeText(`- ${item}`));
  };

  writeList('Regras de Voz da Marca', result.presentation.brandVoiceRules);
  writeList('Pilares de Conteudo', result.presentation.contentPillars);
  writeList('Mensagens por Funil', result.presentation.funnelMessaging);
  writeList('Plano de Acao 30 Dias', result.presentation.actionPlan30d);
  writeList('Insights das Fontes', result.presentation.sourceInsights);

  writeText('Slides Estrategicos', { size: 13, bold: true, gapTop: 10 });
  result.presentation.slides.forEach((slide, index) => {
    writeText(`${index + 1}. ${slide.title}`, { bold: true, gapTop: 8 });
    writeText(slide.analysis);
    slide.recommendations.forEach((rec) => writeText(`- ${rec}`));
    writeText(`Impacto financeiro: ${slide.financialImpact}`);
  });

  const downloadName = `dna-da-marca-${new Date(result.generatedAt).toISOString().slice(0, 10)}.pdf`;
  doc.save(downloadName);
}

export default function DnaBrandWorkspace({ userId, agentSlug, agentTitle, agentCategory }: Props) {
  const { profile } = useAuth();

  const [form, setForm] = useState<DnaBrandInput>(EMPTY_FORM);
  const [hasHydratedProfile, setHasHydratedProfile] = useState(false);
  const [userEdited, setUserEdited] = useState(false);
  const [linksConfirmed, setLinksConfirmed] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateState | null>(null);

  useEffect(() => {
    if (hasHydratedProfile || userEdited) return;
    const prefilled = getPrefilledLinks(profile);
    setForm(prefilled);
    setHasHydratedProfile(true);
  }, [hasHydratedProfile, profile, userEdited]);

  const formIsValid = useMemo(() => {
    return (
      validateUrl(form.siteUrl) &&
      isInstagramUrl(form.instagramUrl) &&
      isLinkedinUrl(form.linkedinUrl)
    );
  }, [form.instagramUrl, form.linkedinUrl, form.siteUrl]);

  const canGenerate = formIsValid && linksConfirmed && !isGenerating;

  const handleChange = (key: keyof DnaBrandInput, value: string) => {
    setUserEdited(true);
    setSaveSuccess(null);
    setSaveError(null);

    if (key === 'siteUrl') {
      setForm((prev) => ({ ...prev, [key]: normalizeSiteUrl(value) }));
      return;
    }

    if (key === 'instagramUrl') {
      setForm((prev) => ({ ...prev, [key]: normalizeSocialUrl(value, 'instagram') }));
      return;
    }

    setForm((prev) => ({ ...prev, [key]: normalizeSocialUrl(value, 'linkedin') }));
  };

  const handleGenerate = async () => {
    if (!canGenerate) {
      setError('Confirme os links válidos de site, Instagram e LinkedIn para gerar o DNA da Marca.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      const response = await generateDnaBrandReport(form);
      if (!response.success || !response.presentation || !response.reportMarkdown) {
        throw new Error(response.error || 'Falha ao gerar o DNA da Marca.');
      }

      setResult({
        presentation: response.presentation,
        reportMarkdown: response.reportMarkdown,
        sources: response.sources ?? [],
        generatedAt: new Date().toISOString(),
      });
    } catch (generateError) {
      const message = generateError instanceof Error ? generateError.message : 'Erro ao gerar DNA da Marca.';
      setError(message);
      setResult(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!userId) {
      setSaveError('Faça login para salvar o DNA da Marca.');
      return;
    }

    if (!result) {
      setSaveError('Gere o relatório antes de salvar.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const db = getFirebaseDb();
      const payload: BrandDnaMemoryRecord = {
        siteUrl: form.siteUrl,
        instagramUrl: form.instagramUrl,
        linkedinUrl: form.linkedinUrl,
        reportMarkdown: result.reportMarkdown,
        structuredPresentation: result.presentation,
        sources: result.sources,
        sourceAgent: agentSlug,
        savedByUserId: userId,
        generatedAt: result.generatedAt,
        updatedAt: Date.now(),
      };

      await setDoc(getBrandDnaMemoryRef(db, userId), payload, { merge: true });

      await saveAgentReportToDb({
        userId,
        agentKey: agentSlug,
        agentTitle,
        agentCategory,
        reportTitle: `DNA da Marca • ${new URL(ensureProtocol(form.siteUrl)).hostname}`,
        reportContent: result.reportMarkdown,
        reportFormat: 'markdown',
        generatedAt: result.generatedAt,
        metadata: {
          websiteUrl: form.siteUrl,
          instagramUrl: form.instagramUrl,
          linkedinUrl: form.linkedinUrl,
          dnaPresentation: result.presentation,
          dnaSources: result.sources,
        },
      });

      setSaveSuccess('DNA da Marca salvo no banco de dados para reutilização por outros agentes da NeuroAds.');
    } catch (persistError) {
      const message = persistError instanceof Error ? persistError.message : 'Falha ao salvar o DNA da Marca.';
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[30px] p-[2px] bg-gradient-to-br from-white/40 via-orange-300/80 to-[#FF6B00] shadow-[0_24px_52px_-30px_rgba(255,107,0,0.42)]">
        <div className="rounded-[28px] bg-white/85 p-[1px]">
          <div className="rounded-[26px] border border-[#FFF1E8] bg-white p-6 md:p-8 space-y-5">
            <h2 className="text-sm uppercase tracking-widest text-primary font-bold">DNA da Marca Operacional</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <InputField
                label="Site da empresa"
                value={form.siteUrl}
                placeholder="https://empresa.com.br"
                onChange={(value) => handleChange('siteUrl', value)}
              />
              <InputField
                label="Perfil do Instagram"
                value={form.instagramUrl}
                placeholder="https://instagram.com/suaempresa"
                onChange={(value) => handleChange('instagramUrl', value)}
              />
              <InputField
                label="Perfil do LinkedIn"
                value={form.linkedinUrl}
                placeholder="https://linkedin.com/company/suaempresa"
                onChange={(value) => handleChange('linkedinUrl', value)}
              />
            </div>

            <label className="inline-flex items-start gap-2 rounded-xl border border-[#E4EAF2] bg-[#FBFCFF] px-4 py-3">
              <input
                type="checkbox"
                checked={linksConfirmed}
                onChange={(event) => setLinksConfirmed(event.target.checked)}
                className="mt-0.5"
              />
              <span className="text-sm text-text-main">
                Confirmo que os links estão corretos para a análise profunda de branding e DNA da marca.
              </span>
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!canGenerate}
                className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold tracking-wide transition-all ${
                  canGenerate
                    ? 'bg-gradient-to-br from-[#FF6B00] to-[#FF9D00] text-white shadow-[0_10px_24px_rgba(255,107,0,0.34)] hover:brightness-105'
                    : 'bg-[#E2E8F0] text-[#64748B] cursor-not-allowed'
                }`}
              >
                {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {isGenerating ? 'Gerando apresentação...' : 'Gerar DNA da Marca'}
              </button>

              {result ? (
                <button
                  type="button"
                  onClick={() => {
                    void downloadBrandDnaPdf(result);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-[#B5E8CB] bg-gradient-to-br from-[#08B760] to-[#0A9D57] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(8,183,96,0.3)] transition-all hover:brightness-105"
                >
                  <Download size={16} />
                  Download PDF
                </button>
              ) : null}

              {result ? (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(17,24,39,0.22)] transition-all ${
                    isSaving ? 'bg-[#94A3B8] cursor-not-allowed' : 'bg-[#111827] hover:brightness-110'
                  }`}
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {isSaving ? 'Salvando...' : 'Salvar DNA da Marca'}
                </button>
              ) : null}
            </div>

            {!formIsValid ? (
              <p className="text-xs font-semibold text-[#B45309]">
                Informe um site válido e os perfis corretos de Instagram e LinkedIn para habilitar a geração.
              </p>
            ) : null}

            {error ? <p className="text-sm font-semibold text-[#B42318]">{error}</p> : null}
            {saveError ? <p className="text-sm font-semibold text-[#B42318]">{saveError}</p> : null}
            {saveSuccess ? (
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A9D57]">
                <CheckCircle2 className="h-4 w-4" />
                {saveSuccess}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {result ? (
        <div className="space-y-4">
          <DnaBrandPresentationPanel
            presentation={result.presentation}
            sources={result.sources}
            generatedAt={result.generatedAt}
          />
          <div className="rounded-2xl border border-[#E7ECF3] bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-bold uppercase tracking-wide text-text-dim">Ações do Relatório</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  void downloadBrandDnaPdf(result);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[#B5E8CB] bg-gradient-to-br from-[#08B760] to-[#0A9D57] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(8,183,96,0.3)] transition-all hover:brightness-105"
              >
                <Download size={16} />
                Download PDF
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(17,24,39,0.22)] transition-all ${
                  isSaving ? 'bg-[#94A3B8] cursor-not-allowed' : 'bg-[#111827] hover:brightness-110'
                }`}
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSaving ? 'Salvando...' : 'Salvar DNA da Marca'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InputField({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-bold uppercase tracking-wide text-text-dim">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#D6DEE8] bg-white px-3 py-2 text-sm text-text-main"
      />
    </label>
  );
}

function SectionCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-2xl border border-[#E7ECF3] bg-[#FBFCFE] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <h4 className="text-base font-black text-text-main mb-2">{title}</h4>
      <div className="space-y-2">
        {items.map((item, index) => (
          <p key={`${title}-${index}`} className="text-sm leading-relaxed text-text-muted">
            {item}
          </p>
        ))}
      </div>
    </article>
  );
}

function ScoreMeter({
  label,
  score,
  accentClass,
}: {
  label: string;
  score: number;
  accentClass: string;
}) {
  const safeScore = clampScore(score);
  return (
    <div className="rounded-2xl border border-[#E7ECF3] bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-text-dim">{label}</p>
        <p className="text-sm font-black text-text-main">{safeScore}%</p>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-[#E9EEF5]">
        <div className={`h-2 rounded-full ${accentClass}`} style={{ width: `${safeScore}%` }} />
      </div>
    </div>
  );
}

function IconList({
  items,
  icon,
}: {
  items: string[];
  icon: 'pain' | 'trigger' | 'format' | 'topic' | 'driver';
}) {
  const IconComponent =
    icon === 'pain'
      ? HeartHandshake
      : icon === 'trigger'
        ? HandCoins
        : icon === 'format'
          ? Megaphone
          : icon === 'topic'
            ? Lightbulb
            : Target;

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={`${icon}-${index}`} className="flex items-start gap-2 rounded-xl border border-[#EEF2F7] bg-white px-3 py-2">
          <IconComponent className="mt-0.5 h-4 w-4 text-[#FF6B00]" />
          <p className="text-sm text-text-muted">{item}</p>
        </div>
      ))}
    </div>
  );
}

function ColorCard({ color }: { color: DnaBrandColor }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(color.hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy hex color', err);
    }
  };

  const typeLabels: Record<string, string> = {
    primary: 'Primária',
    secondary: 'Secundária',
    accent: 'Destaque',
    neutral_light: 'Neutro Claro',
    neutral_dark: 'Neutro Escuro',
  };

  const isLight = color.type === 'neutral_light';

  return (
    <div
      onClick={handleCopy}
      style={{ '--color-glow': color.hex } as React.CSSProperties}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-[#E7ECF3] bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_-6px_var(--color-glow)] hover:border-gray-300"
    >
      <div className="flex items-center gap-3">
        <div
          className={`h-12 w-12 rounded-xl shadow-inner border transition-all duration-300 group-hover:scale-105 ${
            isLight ? 'border-gray-200' : 'border-transparent'
          }`}
          style={{ backgroundColor: color.hex }}
        />
        
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-text-dim">
            {typeLabels[color.type] || color.type}
          </p>
          <h5 className="text-sm font-black text-text-main truncate mt-0.5">
            {color.name}
          </h5>
          <p className="font-mono text-xs text-text-muted mt-0.5">
            {color.hex.toUpperCase()}
          </p>
        </div>

        <div className="rounded-lg p-2 bg-[#F8FAFC] border border-[#E2E8F0] transition-colors group-hover:bg-[#FFF1E8] group-hover:border-[#FFD0B3]">
          {copied ? (
            <Check size={14} className="text-[#08B760] animate-bounce" />
          ) : (
            <Copy size={14} className="text-[#64748B] group-hover:text-[#FF6B00]" />
          )}
        </div>
      </div>
      
      <p className="mt-3 text-xs leading-relaxed text-text-muted border-t border-[#EEF2F7] pt-2">
        {color.usage}
      </p>
    </div>
  );
}

function DesignTokensExporter({ colors }: { colors: DnaBrandColor[] }) {
  const [activeTab, setActiveTab] = useState<'css' | 'tailwind'>('css');
  const [copied, setCopied] = useState(false);

  const cssVariables = useMemo(() => {
    return `:root {
${colors
  .map(
    (c) =>
      `  --color-${c.type.replace('_', '-')}: ${c.hex}; /* ${c.name} */`
  )
  .join('\n')}
}`;
  }, [colors]);

  const tailwindConfig = useMemo(() => {
    const colorEntries = colors
      .map(
        (c) =>
          `        "${c.type.replace('_', '-')}": "${c.hex}", // ${c.name}`
      )
      .join('\n');
    return `module.exports = {
  theme: {
    extend: {
      colors: {
${colorEntries}
      }
    }
  }
}`;
  }, [colors]);

  const codeToCopy = activeTab === 'css' ? cssVariables : tailwindConfig;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy design tokens', err);
    }
  };

  return (
    <div className="rounded-2xl border border-[#E7ECF3] bg-[#F8FAFC] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex gap-1.5 p-1 rounded-xl bg-white border border-[#E4EAF2]">
          <button
            type="button"
            onClick={() => setActiveTab('css')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'css'
                ? 'bg-gradient-to-br from-[#FF6B00] to-[#FF9D00] text-white shadow-sm'
                : 'text-[#64748B] hover:text-text-main'
            }`}
          >
            CSS Variables
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tailwind')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'tailwind'
                ? 'bg-gradient-to-br from-[#FF6B00] to-[#FF9D00] text-white shadow-sm'
                : 'text-[#64748B] hover:text-text-main'
            }`}
          >
            Tailwind CSS
          </button>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white px-3 py-1 text-xs font-bold text-text-main transition-all hover:bg-gray-50 active:scale-95"
        >
          {copied ? (
            <>
              <Check size={12} className="text-[#08B760]" />
              <span className="text-[#08B760]">Copiado!</span>
            </>
          ) : (
            <>
              <Copy size={12} className="text-[#64748B]" />
              <span>Copiar Código</span>
            </>
          )}
        </button>
      </div>

      <pre className="font-mono text-xs overflow-x-auto p-3.5 rounded-xl border border-[#EEF2F7] bg-white text-[#0F172A] leading-relaxed max-h-48">
        <code>{codeToCopy}</code>
      </pre>
    </div>
  );
}

function BrandColorPaletteSection({ palette }: { palette: DnaBrandColorPalette }) {
  if (!palette || !palette.colors || palette.colors.length === 0) return null;

  return (
    <article className="rounded-2xl border border-[#E7ECF3] bg-[#FBFCFE] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)] space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Palette className="h-5 w-5 text-[#FF6B00]" />
        <h4 className="text-base font-black text-text-main">🎨 Paleta de Cores e Identidade Visual</h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {palette.colors.map((color, index) => (
          <ColorCard key={`${color.hex}-${index}`} color={color} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="space-y-4">
          {palette.psychologicalImpact ? (
            <div className="rounded-2xl border border-[#EEF2F7] bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-text-dim mb-1">🧠 Impacto Psicológico</p>
              <p className="text-sm leading-relaxed text-text-muted">{palette.psychologicalImpact}</p>
            </div>
          ) : null}

          {palette.contrastAccessibility ? (
            <div className="rounded-2xl border border-[#EEF2F7] bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-text-dim mb-1">♿ Contraste e Acessibilidade</p>
              <p className="text-sm leading-relaxed text-text-muted">{palette.contrastAccessibility}</p>
            </div>
          ) : null}

          {palette.visualStyleDescription ? (
            <div className="rounded-2xl border border-[#EEF2F7] bg-white p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-text-dim mb-1">📸 Estilo Visual Recomendado</p>
              <p className="text-sm leading-relaxed text-text-muted">{palette.visualStyleDescription}</p>
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wide text-text-dim px-1">💻 Exportador de Design Tokens</p>
          <DesignTokensExporter colors={palette.colors} />
        </div>
      </div>
    </article>
  );
}

export function DnaBrandPresentationPanel({
  presentation,
  sources,
  generatedAt,
}: {
  presentation: DnaBrandPresentation;
  sources: DnaBrandSource[];
  generatedAt: string;
}) {
  const probabilityScore = clampScore(presentation.idealCustomerProfile.probabilityScore);
  const needScore = clampScore(presentation.idealCustomerProfile.needScore);
  const practical = presentation.practicalOpportunities;

  return (
    <div className="rounded-[30px] p-[2px] bg-gradient-to-br from-white/40 via-orange-300/80 to-[#FF6B00] shadow-[0_24px_52px_-30px_rgba(255,107,0,0.42)]">
      <div className="rounded-[28px] bg-white/85 p-[1px]">
        <div className="rounded-[26px] border border-[#FFF1E8] bg-white p-6 md:p-8 space-y-5">
          <div>
            <p className="text-xs uppercase tracking-widest text-primary font-bold">📊 Apresentação Estratégica</p>
            <h3 className="mt-1 text-2xl md:text-3xl font-black text-text-main">{presentation.presentationTitle}</h3>
            <p className="mt-2 text-sm text-text-muted">
              Gerado em {new Date(generatedAt).toLocaleString('pt-BR')} com análise de branding, posicionamento e execução.
            </p>
          </div>

          <article className="rounded-2xl border border-[#E7ECF3] bg-[#FBFCFE] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <h4 className="text-base font-black text-text-main mb-2">🚀 Resumo Executivo</h4>
            <p className="text-sm leading-relaxed text-text-muted">{presentation.executiveSummary}</p>
          </article>

          <article className="rounded-2xl border border-[#E7ECF3] bg-[#FBFCFE] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <h4 className="text-base font-black text-text-main mb-2">🎯 Posicionamento Central</h4>
            <p className="text-sm leading-relaxed text-text-muted">{presentation.positioningStatement}</p>
          </article>

          <BrandColorPaletteSection palette={presentation.colorPalette} />

          <article className="rounded-2xl border border-[#E7ECF3] bg-[#FBFCFE] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <div className="flex flex-wrap items-center gap-2">
              <UsersRound className="h-5 w-5 text-[#FF6B00]" />
              <h4 className="text-base font-black text-text-main">👥 Perfil Ideal De Cliente Com Maior Probabilidade E Necessidade</h4>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-text-main font-semibold">{presentation.idealCustomerProfile.headline}</p>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-[#EEF2F7] bg-white p-4">
                <div className="flex items-center gap-2">
                  <BriefcaseBusiness className="h-4 w-4 text-[#FF6B00]" />
                  <p className="text-xs font-bold uppercase tracking-wide text-text-dim">Segmento E Porte</p>
                </div>
                <p className="mt-2 text-sm text-text-main">{presentation.idealCustomerProfile.segment}</p>
                <p className="mt-1 text-sm text-text-muted">{presentation.idealCustomerProfile.companySize}</p>
              </div>
              <div className="rounded-2xl border border-[#EEF2F7] bg-white p-4">
                <div className="flex items-center gap-2">
                  <HandCoins className="h-4 w-4 text-[#FF6B00]" />
                  <p className="text-xs font-bold uppercase tracking-wide text-text-dim">Faixa De Receita</p>
                </div>
                <p className="mt-2 text-sm text-text-main">{presentation.idealCustomerProfile.annualRevenueRange}</p>
              </div>
              <div className="rounded-2xl border border-[#EEF2F7] bg-white p-4">
                <div className="flex items-center gap-2">
                  <CircleGauge className="h-4 w-4 text-[#FF6B00]" />
                  <p className="text-xs font-bold uppercase tracking-wide text-text-dim">Contexto De Urgência</p>
                </div>
                <p className="mt-2 text-sm text-text-main">{presentation.idealCustomerProfile.urgencyContext}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <ScoreMeter
                label="Probabilidade de conversão"
                score={probabilityScore}
                accentClass="bg-gradient-to-r from-[#08B760] to-[#0A9D57]"
              />
              <ScoreMeter
                label="Nível de necessidade"
                score={needScore}
                accentClass="bg-gradient-to-r from-[#FF6B00] to-[#FF9D00]"
              />
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-dim">😣 Principais dores</p>
                <IconList items={presentation.idealCustomerProfile.mainPainPoints} icon="pain" />
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-dim">💡 Gatilhos de decisão</p>
                <IconList items={presentation.idealCustomerProfile.buyingTriggers} icon="trigger" />
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-[#E7ECF3] bg-[#FBFCFE] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <div className="flex flex-wrap items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#FF6B00]" />
              <h4 className="text-base font-black text-text-main">📣 Conteúdo Que Mais Gera Interesse E Interação</h4>
            </div>
            <p className="mt-2 text-sm text-text-muted">{presentation.audienceContentProfile.summary}</p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-dim">🎬 Formatos preferidos</p>
                <IconList items={presentation.audienceContentProfile.preferredFormats} icon="format" />
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-dim">🧠 Temas de alta intenção</p>
                <IconList items={presentation.audienceContentProfile.highIntentTopics} icon="topic" />
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-dim">⚡ Drivers de interação</p>
                <IconList items={presentation.audienceContentProfile.interactionDrivers} icon="driver" />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {presentation.audienceContentProfile.recommendedContentMix.map((item, index) => {
                const score = clampScore(item.engagementPotential);
                return (
                  <div key={`${item.topic}-${index}`} className="rounded-xl border border-[#E7ECF3] bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-black text-text-main">{item.topic}</p>
                      <span className="rounded-full border border-[#D6DEE8] bg-[#F8FAFC] px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-text-dim">
                        {item.format} • {item.channel}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-text-muted">{item.whyItWorks}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-text-dim">Engajamento potencial</p>
                      <p className="text-xs font-black text-text-main">{score}%</p>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-[#E9EEF5]">
                      <div className="h-2 rounded-full bg-gradient-to-r from-[#1D4ED8] to-[#06B6D4]" style={{ width: `${score}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          {practical ? (
            <article className="rounded-2xl border border-[#E7ECF3] bg-[#FBFCFE] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
              <div className="flex flex-wrap items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#FF6B00]" />
                <h4 className="text-base font-black text-text-main">🛠️ Oportunidades Práticas Para Fortalecer O Posicionamento</h4>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-dim">🎯 Posicionamento</p>
                  <IconList items={practical.positioningOpportunities} icon="topic" />
                </div>
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-dim">📚 Materiais sugeridos</p>
                  <div className="space-y-2">
                    {practical.materialSuggestions.map((item, index) => (
                      <div key={`material-${index}`} className="flex items-start gap-2 rounded-xl border border-[#EEF2F7] bg-white px-3 py-2">
                        <FileText className="mt-0.5 h-4 w-4 text-[#FF6B00]" />
                        <p className="text-sm text-text-muted">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-dim">💡 Ideias de conteúdo</p>
                  <IconList items={practical.contentIdeas} icon="format" />
                </div>
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-dim">🔁 Funil de relacionamento</p>
                  <IconList items={practical.relationshipFunnel} icon="driver" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-dim">📢 Campanhas patrocinadas</p>
                  <IconList items={practical.paidCampaignOpportunities} icon="format" />
                </div>
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-dim">✉️ Email marketing</p>
                  <div className="space-y-2">
                    {practical.emailMarketingOpportunities.map((item, index) => (
                      <div key={`email-${index}`} className="flex items-start gap-2 rounded-xl border border-[#EEF2F7] bg-white px-3 py-2">
                        <Mail className="mt-0.5 h-4 w-4 text-[#FF6B00]" />
                        <p className="text-sm text-text-muted">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {practical.otherPracticalOpportunities.length > 0 ? (
                <div className="mt-4">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-text-dim">🧩 Outras oportunidades práticas</p>
                  <IconList items={practical.otherPracticalOpportunities} icon="topic" />
                </div>
              ) : null}
            </article>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SectionCard title="Regras de Voz da Marca" items={presentation.brandVoiceRules} />
            <SectionCard title="Pilares de Conteúdo" items={presentation.contentPillars} />
            <SectionCard title="Mensagens por Funil" items={presentation.funnelMessaging} />
            <SectionCard title="Plano de Ação 30 Dias" items={presentation.actionPlan30d} />
          </div>

          <SectionCard title="Insights das Fontes" items={presentation.sourceInsights} />

          <div className="space-y-4">
            {presentation.slides.map((slide, index) => (
              <article
                key={`${slide.title}-${index}`}
                className="rounded-2xl border border-[#E7ECF3] bg-[#FBFCFE] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
              >
                <h4 className="text-base font-black text-text-main">🧭 {index + 1}. {slide.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{slide.analysis}</p>
                <div className="mt-3 space-y-1">
                  {slide.recommendations.map((rec, recIndex) => (
                    <p key={`${slide.title}-rec-${recIndex}`} className="text-sm text-text-muted">✅ {rec}</p>
                  ))}
                </div>
                <p className="mt-3 text-sm font-semibold text-text-main">💰 Impacto financeiro esperado: {slide.financialImpact}</p>
              </article>
            ))}
          </div>

          <article className="rounded-2xl border border-[#E7ECF3] bg-[#FBFCFE] p-5 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <h4 className="text-base font-black text-text-main mb-2">Fontes analisadas</h4>
            <div className="space-y-2">
              {sources.map((source) => (
                <div key={`${source.label}-${source.requestedUrl}`} className="rounded-xl border border-[#E7ECF3] bg-white px-3 py-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-text-dim">{source.label}</p>
                  <p className="text-sm text-text-main break-all">{source.finalUrl || source.requestedUrl}</p>
                  {source.error ? (
                    <p className="text-xs text-[#B42318] mt-1">{source.error}</p>
                  ) : (
                    <p className="text-xs text-text-muted mt-1">{source.title || source.description || 'Fonte capturada com sucesso.'}</p>
                  )}
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
