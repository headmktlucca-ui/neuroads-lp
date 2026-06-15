'use server';

import OpenAI from 'openai';

export type LandingPageDiagnosisInput = {
  landingPageUrl: string;
  adPromise: string;
  businessGoal?: string;
};

type ScoreKey =
  | 'conversion'
  | 'offerClarity'
  | 'ux'
  | 'copy'
  | 'mobile'
  | 'scannability'
  | 'authority'
  | 'messageMatch'
  | 'formFriction'
  | 'socialProof';

export type LandingPageScore = {
  score: number;
  justification: string;
};

export type LandingPageSectionDiagnosis = {
  summary: string;
  findings: string[];
  frictionPoints: string[];
};

export type LandingPageDiagnosisData = {
  analyzedUrl: string;
  analyzedAt: string;
  pageSnapshot: {
    title: string;
    metaDescription: string;
    h1: string[];
    h2: string[];
    textSample: string;
    formCount?: number;
    inputCount?: number;
    hasVideo?: boolean;
    hasTestimonials?: boolean;
  };
  scores: Record<ScoreKey, LandingPageScore>;
  executiveSummary: {
    overallScore: number;
    keyTakeaway: string;
    criticalBottleneck: string;
    quickWin: string;
  };
  diagnostics: {
    offerClarity: LandingPageSectionDiagnosis;
    croFlow: LandingPageSectionDiagnosis;
    uxAccessibility: LandingPageSectionDiagnosis;
    emotionalPerception: LandingPageSectionDiagnosis;
    copywriting: LandingPageSectionDiagnosis;
    socialProofAuthority: LandingPageSectionDiagnosis;
    adToPageConsistency: LandingPageSectionDiagnosis;
  };
  cognitiveHeatmap: {
    attentionZones: string[];
    deadZones: string[];
    likelyDropOffPoints: string[];
    doubtMoments: string[];
  };
  criticalIssues: string[];
  priorityRecommendations: Array<{
    title: string;
    action: string;
    impact: 'Alto' | 'Médio' | 'Baixo';
    ease: 'Fácil' | 'Médio' | 'Difícil';
    urgency: 'Alta' | 'Média' | 'Baixa';
    rationale: string;
  }>;
  impactForecast: {
    conversionUpliftPct: string;
    abandonmentReductionPct: string;
    retentionImprovementPct: string;
    ctrImprovementPct: string;
    confidence: number;
    note: string;
  };
  strategicSuggestions: {
    layout: string[];
    copy: string[];
    structure: string[];
    cta: string[];
  };
};

export type LandingPageDiagnosisResult = {
  success: boolean;
  data?: LandingPageDiagnosisData;
  error?: string;
  warning?: string;
  usedFallback?: boolean;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readStringArray(value: unknown, max = 8): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, max);
}

function ensureHttpUrl(rawValue: string): string {
  const normalized = rawValue.trim();
  if (!normalized) return '';
  const withProtocol = /^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`;
  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
    return parsed.toString();
  } catch {
    return '';
  }
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

function stripHtml(html: string): string {
  return decodeHtmlEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

function extractTagList(html: string, tag: 'h1' | 'h2', max = 8): string[] {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  const values: string[] = [];
  let match: RegExpExecArray | null = regex.exec(html);
  while (match && values.length < max) {
    const parsed = stripHtml(match[1]);
    if (parsed) values.push(parsed);
    match = regex.exec(html);
  }
  return values;
}

function extractMetaContent(html: string, key: string): string {
  const regex = new RegExp(
    `<meta[^>]+(?:name|property)=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    'i'
  );
  const match = html.match(regex);
  return match?.[1]?.trim() || '';
}

function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return stripHtml(match?.[1] || '');
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(10, Number(value.toFixed(1))));
}

function buildSection(raw: unknown, fallbackSummary: string): LandingPageSectionDiagnosis {
  const row = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    summary: readString(row.summary) || fallbackSummary,
    findings: readStringArray(row.findings, 6),
    frictionPoints: readStringArray(row.frictionPoints, 6),
  };
}

function scoreFromPayload(raw: unknown, fallbackJustification: string): LandingPageScore {
  const row = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const numericRaw = row.score;
  const score =
    typeof numericRaw === 'number'
      ? clampScore(numericRaw)
      : clampScore(Number(typeof numericRaw === 'string' ? numericRaw.replace(',', '.') : 0));
  return {
    score,
    justification: readString(row.justification) || fallbackJustification,
  };
}

function fallbackDiagnosis(input: LandingPageDiagnosisInput, analyzedUrl: string, reason: string): LandingPageDiagnosisData {
  const hasPromise = input.adPromise.trim().length > 0;
  const now = new Date().toISOString();
  return {
    analyzedUrl,
    analyzedAt: now,
    pageSnapshot: {
      title: 'Não foi possível capturar o título automaticamente',
      metaDescription: 'Sem metadados suficientes para leitura completa.',
      h1: [],
      h2: [],
      textSample: 'Diagnóstico mínimo gerado por fallback defensivo.',
    },
    scores: {
      conversion: { score: 5.8, justification: 'Há sinais de melhoria de fluxo e CTA para elevar conversão.' },
      offerClarity: { score: hasPromise ? 6.1 : 4.7, justification: 'A promessa do anúncio precisa ficar explícita no herói da página.' },
      ux: { score: 6.0, justification: 'Priorizar leitura rápida, escaneabilidade e redução de fricção inicial.' },
      copy: { score: 5.6, justification: 'A copy deve enfatizar resultado prático e prova concreta em linguagem direta.' },
      mobile: { score: 6.4, justification: 'Garantir hierarquia clara e CTA visível na primeira dobra mobile.' },
      scannability: { score: 5.3, justification: 'Blocos longos tendem a reduzir retenção; simplificar estrutura visual.' },
      authority: { score: 4.9, justification: 'Falta reforço de prova social e evidências de confiança.' },
      messageMatch: { score: 5.5, justification: 'A promessa do anúncio precisa ter maior consonância com a headline.' },
      formFriction: { score: 6.0, justification: 'Avaliar se a quantidade de campos e etapas do formulário afetam a taxa de conversão.' },
      socialProof: { score: 5.0, justification: 'Testemunhos textuais simples necessitam de fotos, logos ou vídeo para autenticidade.' }
    },
    executiveSummary: {
      overallScore: 5.7,
      keyTakeaway: 'A página pode ganhar tração rápida com clareza de oferta e CTA mais objetivo.',
      criticalBottleneck: 'Desalinhamento entre promessa do anúncio e mensagem inicial da landing page.',
      quickWin: 'Reescrever headline/subheadline com benefício financeiro claro e prova concreta.',
    },
    diagnostics: {
      offerClarity: {
        summary: 'A proposta de valor precisa ser compreendida em poucos segundos.',
        findings: ['Headline provavelmente genérica para público cético.', 'Benefício financeiro pouco explícito.'],
        frictionPoints: ['Promessa principal diluída entre mensagens secundárias.'],
      },
      croFlow: {
        summary: 'O fluxo deve reduzir etapas até a ação principal.',
        findings: ['CTA pode não estar em posição de destaque.', 'Sequência de blocos pode estar dispersa.'],
        frictionPoints: ['Excesso de scroll antes da geração de confiança.'],
      },
      uxAccessibility: {
        summary: 'Experiência deve priorizar leitura e contraste.',
        findings: ['Possível carga cognitiva elevada.', 'Hierarquia visual pode estar competindo por atenção.'],
        frictionPoints: ['Elementos críticos sem destaque consistente.'],
      },
      emotionalPerception: {
        summary: 'A página precisa transmitir segurança e autoridade real.',
        findings: ['Percepção de valor pode estar abaixo do esperado.', 'Urgência pode estar fraca ou difusa.'],
        frictionPoints: ['Falta de narrativa clara sobre transformação.'],
      },
      copywriting: {
        summary: 'Copy deve vender resultado, não apenas recurso.',
        findings: ['Texto pode estar explicando demais antes de criar desejo.', 'CTA pode estar genérico.'],
        frictionPoints: ['Argumentos sem provas específicas.'],
      },
      socialProofAuthority: {
        summary: 'Provas de autoridade precisam aparecer cedo.',
        findings: ['Depoimentos podem estar pouco específicos.', 'Faltam números claros de resultado.'],
        frictionPoints: ['Baixa validação externa percebida.'],
      },
      adToPageConsistency: {
        summary: 'A promessa do anúncio deve continuar na landing page sem quebra.',
        findings: ['Possível desalinhamento de mensagem.', 'Continuidade emocional pode estar fraca.'],
        frictionPoints: ['Usuário não confirma rapidamente que chegou ao lugar certo.'],
      },
    },
    cognitiveHeatmap: {
      attentionZones: ['Topo da página (headline + CTA)', 'Primeiro bloco de prova social'],
      deadZones: ['Blocos longos sem escaneabilidade', 'Áreas com excesso de texto técnico'],
      likelyDropOffPoints: ['Antes do primeiro CTA relevante', 'Após seções sem benefício claro'],
      doubtMoments: ['Quando a promessa não é comprovada', 'Quando CTA não explica próximo passo'],
    },
    criticalIssues: [
      'Headline e promessa inicial com clareza insuficiente para decisão rápida.',
      'Prova social e autoridade abaixo do necessário para reduzir ceticismo.',
      'Fluxo de conversão com fricções que aumentam abandono.',
    ],
    priorityRecommendations: [
      {
        title: 'Reforçar promessa principal no herói',
        action: 'Aplicar headline orientada a benefício financeiro direto + subheadline específica.',
        impact: 'Alto',
        ease: 'Fácil',
        urgency: 'Alta',
        rationale: 'Acelera compreensão e melhora retenção inicial.',
      },
      {
        title: 'Reestruturar prova social',
        action: 'Inserir cases curtos com números reais próximos ao CTA principal.',
        impact: 'Alto',
        ease: 'Médio',
        urgency: 'Alta',
        rationale: 'Reduz risco percebido e aumenta confiança de decisão.',
      },
      {
        title: 'Simplificar fluxo de ação',
        action: 'Reduzir etapas e campos antes da entrega de valor percebido.',
        impact: 'Médio',
        ease: 'Médio',
        urgency: 'Média',
        rationale: 'Diminui atrito e abandono no caminho até conversão.',
      },
    ],
    impactForecast: {
      conversionUpliftPct: '+8% a +22%',
      abandonmentReductionPct: '-10% a -24%',
      retentionImprovementPct: '+6% a +14%',
      ctrImprovementPct: '+7% a +19%',
      confidence: 61,
      note: `Estimativa baseada em padrões de páginas de alta conversão. Motivo do fallback: ${reason}`,
    },
    strategicSuggestions: {
      layout: ['Destacar CTA e proposta de valor acima da dobra.', 'Organizar blocos em sequência problema → solução → prova → ação.'],
      copy: ['Trocar linguagem genérica por benefício mensurável.', 'Antecipar ceticismo com dados reais e clareza de próximos passos.'],
      structure: ['Reduzir blocos redundantes.', 'Aumentar escaneabilidade com subtítulos e bullets curtos.'],
      cta: ['Usar CTA específico de resultado.', 'Repetir CTA em pontos de maior atenção.'],
    },
  };
}

async function captureLandingPageSnapshot(landingPageUrl: string): Promise<LandingPageDiagnosisData['pageSnapshot']> {
  const response = await fetch(landingPageUrl, {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; NeuroAdsLandingDiagnosis/1.0)',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Falha ao capturar conteúdo da URL (HTTP ${response.status}).`);
  }

  const html = await response.text();
  const text = stripHtml(html);

  const formCount = (html.match(/<form/gi) || []).length;
  const inputCount = (html.match(/<input|<select|<textarea/gi) || []).length;
  const hasVideo = /<video|youtube\.com|vimeo\.com|player\./i.test(html);
  const hasTestimonials = /depoimento|cliente|avaliaç/i.test(text);

  return {
    title: extractTitle(html),
    metaDescription: extractMetaContent(html, 'description') || extractMetaContent(html, 'og:description'),
    h1: extractTagList(html, 'h1', 6),
    h2: extractTagList(html, 'h2', 10),
    textSample: text.slice(0, 9000),
    formCount,
    inputCount,
    hasVideo,
    hasTestimonials,
  };
}

function parseDiagnosisPayload(raw: string, input: LandingPageDiagnosisInput, analyzedUrl: string, snapshot: LandingPageDiagnosisData['pageSnapshot']): LandingPageDiagnosisData {
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  const scoresRaw = parsed.scores && typeof parsed.scores === 'object' ? (parsed.scores as Record<string, unknown>) : {};
  const diagnosticsRaw = parsed.diagnostics && typeof parsed.diagnostics === 'object' ? (parsed.diagnostics as Record<string, unknown>) : {};
  const executiveRaw = parsed.executiveSummary && typeof parsed.executiveSummary === 'object'
    ? (parsed.executiveSummary as Record<string, unknown>)
    : {};
  const heatmapRaw = parsed.cognitiveHeatmap && typeof parsed.cognitiveHeatmap === 'object'
    ? (parsed.cognitiveHeatmap as Record<string, unknown>)
    : {};
  const impactRaw = parsed.impactForecast && typeof parsed.impactForecast === 'object'
    ? (parsed.impactForecast as Record<string, unknown>)
    : {};
  const strategicRaw = parsed.strategicSuggestions && typeof parsed.strategicSuggestions === 'object'
    ? (parsed.strategicSuggestions as Record<string, unknown>)
    : {};

  const scores: LandingPageDiagnosisData['scores'] = {
    conversion: scoreFromPayload(scoresRaw.conversion, 'Conversão dependente de ajustes de clareza e fluxo.'),
    offerClarity: scoreFromPayload(scoresRaw.offerClarity, 'A oferta precisa ficar mais explícita na primeira dobra.'),
    ux: scoreFromPayload(scoresRaw.ux, 'UX deve priorizar leitura rápida e navegação sem fricção.'),
    copy: scoreFromPayload(scoresRaw.copy, 'Copy pode reforçar benefício e prova social com maior objetividade.'),
    mobile: scoreFromPayload(scoresRaw.mobile, 'Experiência mobile requer CTA visível e blocos mais enxutos.'),
    scannability: scoreFromPayload(scoresRaw.scannability, 'Escaneabilidade pode ser otimizada com estrutura mais clara.'),
    authority: scoreFromPayload(scoresRaw.authority, 'Autoridade deve ser reforçada com evidências concretas.'),
    messageMatch: scoreFromPayload(scoresRaw.messageMatch, 'Consistência de promessa entre o anúncio e o topo da página.'),
    formFriction: scoreFromPayload(scoresRaw.formFriction, 'Atrito cognitivo de formulários e etapas necessárias para conversão.'),
    socialProof: scoreFromPayload(scoresRaw.socialProof, 'Concretude e nível de autenticidade dos depoimentos exibidos.'),
  };

  const scoreValues = Object.values(scores).map((item) => item.score);
  const overallScore = Number((scoreValues.reduce((acc, item) => acc + item, 0) / scoreValues.length).toFixed(1));

  const priorityRecommendationsRaw = Array.isArray(parsed.priorityRecommendations) ? parsed.priorityRecommendations : [];
  const priorityRecommendations = priorityRecommendationsRaw
    .map((item) => (item && typeof item === 'object' ? (item as Record<string, unknown>) : null))
    .filter((item): item is Record<string, unknown> => Boolean(item))
    .map((item) => ({
      title: readString(item.title) || 'Ajuste estratégico prioritário',
      action: readString(item.action) || 'Executar ajuste recomendado na página.',
      impact: (readString(item.impact) as 'Alto' | 'Médio' | 'Baixo') || 'Médio',
      ease: (readString(item.ease) as 'Fácil' | 'Médio' | 'Difícil') || 'Médio',
      urgency: (readString(item.urgency) as 'Alta' | 'Média' | 'Baixa') || 'Média',
      rationale: readString(item.rationale) || 'Ação sugerida para melhorar performance de conversão.',
    }))
    .slice(0, 8);

  const criticalIssues = readStringArray(parsed.criticalIssues, 10);

  return {
    analyzedUrl,
    analyzedAt: new Date().toISOString(),
    pageSnapshot: snapshot,
    scores,
    executiveSummary: {
      overallScore,
      keyTakeaway: readString(executiveRaw.keyTakeaway) || 'A página possui oportunidades claras de otimização de conversão.',
      criticalBottleneck:
        readString(executiveRaw.criticalBottleneck) || criticalIssues[0] || 'Desalinhamento entre proposta e fluxo de conversão.',
      quickWin: readString(executiveRaw.quickWin) || 'Ajustar headline + CTA para aumentar clareza e ação imediata.',
    },
    diagnostics: {
      offerClarity: buildSection(diagnosticsRaw.offerClarity, 'A proposta precisa ficar explícita em poucos segundos.'),
      croFlow: buildSection(diagnosticsRaw.croFlow, 'O fluxo CRO pode reduzir etapas até o CTA principal.'),
      uxAccessibility: buildSection(diagnosticsRaw.uxAccessibility, 'A experiência deve reduzir atrito e carga cognitiva.'),
      emotionalPerception: buildSection(diagnosticsRaw.emotionalPerception, 'A percepção emocional deve reforçar confiança e valor.'),
      copywriting: buildSection(diagnosticsRaw.copywriting, 'A copy precisa aumentar especificidade e persuasão.'),
      socialProofAuthority: buildSection(diagnosticsRaw.socialProofAuthority, 'A prova social precisa ser mais concreta.'),
      adToPageConsistency: buildSection(diagnosticsRaw.adToPageConsistency, 'A promessa do anúncio deve continuar na página sem quebra.'),
    },
    cognitiveHeatmap: {
      attentionZones: readStringArray(heatmapRaw.attentionZones, 8),
      deadZones: readStringArray(heatmapRaw.deadZones, 8),
      likelyDropOffPoints: readStringArray(heatmapRaw.likelyDropOffPoints, 8),
      doubtMoments: readStringArray(heatmapRaw.doubtMoments, 8),
    },
    criticalIssues,
    priorityRecommendations,
    impactForecast: {
      conversionUpliftPct: readString(impactRaw.conversionUpliftPct) || '+0% a +0%',
      abandonmentReductionPct: readString(impactRaw.abandonmentReductionPct) || '0%',
      retentionImprovementPct: readString(impactRaw.retentionImprovementPct) || '0%',
      ctrImprovementPct: readString(impactRaw.ctrImprovementPct) || '0%',
      confidence: Math.max(0, Math.min(100, Number(readString(impactRaw.confidence) || 0))),
      note: readString(impactRaw.note) || 'Estimativa preditiva baseada em heurísticas de conversão.',
    },
    strategicSuggestions: {
      layout: readStringArray(strategicRaw.layout, 8),
      copy: readStringArray(strategicRaw.copy, 8),
      structure: readStringArray(strategicRaw.structure, 8),
      cta: readStringArray(strategicRaw.cta, 8),
    },
  };
}

export async function generateLandingPageDiagnosis(
  input: LandingPageDiagnosisInput
): Promise<LandingPageDiagnosisResult> {
  const landingPageUrl = ensureHttpUrl(input.landingPageUrl);
  if (!landingPageUrl) {
    return { success: false, error: 'Informe uma URL válida da landing page (http/https).' };
  }

  if (!input.adPromise.trim()) {
    return { success: false, error: 'Informe a promessa principal do anúncio para calibrar o diagnóstico.' };
  }

  let snapshot: LandingPageDiagnosisData['pageSnapshot'];
  try {
    snapshot = await captureLandingPageSnapshot(landingPageUrl);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao capturar a URL.';
    return {
      success: true,
      data: fallbackDiagnosis(input, landingPageUrl, message),
      warning: `${message} Retornamos um diagnóstico mínimo para não interromper sua operação.`,
      usedFallback: true,
    };
  }

  if (!process.env.OPENAI_API_KEY) {
    return {
      success: true,
      data: fallbackDiagnosis(input, landingPageUrl, 'OPENAI_API_KEY não configurada.'),
      warning: 'OPENAI_API_KEY não configurada no servidor. Exibindo diagnóstico mínimo.',
      usedFallback: true,
    };
  }

  const prompt = [
    'Você é um laboratório sênior de CRO, UX, Copywriting e Performance da NeuroAds.',
    'Objetivo: diagnosticar a landing page com foco em conversão real, experiência e clareza da oferta.',
    'Regras obrigatórias:',
    '- Não faça promessas absolutas de resultado.',
    '- Evite recomendações enganosas, manipulativas ou antiéticas.',
    '- Linguagem objetiva, prática e acionável.',
    '- Justifique cada score e recomendação com base em sinais observáveis.',
    '- Escala de score: 0 a 10.',
    '',
    `URL analisada: ${landingPageUrl}`,
    `Promessa do anúncio: ${input.adPromise}`,
    `Objetivo de negócio (opcional): ${input.businessGoal?.trim() || 'Não informado'}`,
    '',
    `Título da página: ${snapshot.title || 'N/D'}`,
    `Meta descrição: ${snapshot.metaDescription || 'N/D'}`,
    `H1s: ${snapshot.h1.join(' | ') || 'N/D'}`,
    `H2s: ${snapshot.h2.join(' | ') || 'N/D'}`,
    `Trecho textual: ${snapshot.textSample || 'N/D'}`,
    `Indicadores extraídos do código-fonte HTML da página:`,
    `- Quantidade de formulários (<form>): ${snapshot.formCount ?? 0}`,
    `- Quantidade de campos de input/select/textarea: ${snapshot.inputCount ?? 0}`,
    `- Contém elementos de vídeo ou embeds (YouTube/Vimeo): ${snapshot.hasVideo ? 'Sim' : 'Não'}`,
    `- Foram identificadas palavras-chave de depoimentos/avaliações no texto: ${snapshot.hasTestimonials ? 'Sim' : 'Não'}`,
    '',
    'Retorne SOMENTE JSON válido com o schema abaixo:',
    JSON.stringify(
      {
        scores: {
          conversion: { score: 0, justification: 'string' },
          offerClarity: { score: 0, justification: 'string' },
          ux: { score: 0, justification: 'string' },
          copy: { score: 0, justification: 'string' },
          mobile: { score: 0, justification: 'string' },
          scannability: { score: 0, justification: 'string' },
          authority: { score: 0, justification: 'string' },
          messageMatch: { score: 0, justification: 'string' },
          formFriction: { score: 0, justification: 'string' },
          socialProof: { score: 0, justification: 'string' }
        },
        executiveSummary: {
          keyTakeaway: 'string',
          criticalBottleneck: 'string',
          quickWin: 'string',
        },
        diagnostics: {
          offerClarity: { summary: 'string', findings: ['string'], frictionPoints: ['string'] },
          croFlow: { summary: 'string', findings: ['string'], frictionPoints: ['string'] },
          uxAccessibility: { summary: 'string', findings: ['string'], frictionPoints: ['string'] },
          emotionalPerception: { summary: 'string', findings: ['string'], frictionPoints: ['string'] },
          copywriting: { summary: 'string', findings: ['string'], frictionPoints: ['string'] },
          socialProofAuthority: { summary: 'string', findings: ['string'], frictionPoints: ['string'] },
          adToPageConsistency: { summary: 'string', findings: ['string'], frictionPoints: ['string'] },
        },
        cognitiveHeatmap: {
          attentionZones: ['string'],
          deadZones: ['string'],
          likelyDropOffPoints: ['string'],
          doubtMoments: ['string'],
        },
        criticalIssues: ['string'],
        priorityRecommendations: [
          {
            title: 'string',
            action: 'string',
            impact: 'Alto',
            ease: 'Fácil',
            urgency: 'Alta',
            rationale: 'string',
          },
        ],
        impactForecast: {
          conversionUpliftPct: 'string',
          abandonmentReductionPct: 'string',
          retentionImprovementPct: 'string',
          ctrImprovementPct: 'string',
          confidence: 0,
          note: 'string',
        },
        strategicSuggestions: {
          layout: ['string'],
          copy: ['string'],
          structure: ['string'],
          cta: ['string'],
        },
      },
      null,
      2
    ),
  ].join('\n');

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      temperature: 0.35,
      messages: [
        {
          role: 'system',
          content:
            'Atue como especialista sênior de CRO e UX orientado a resultado financeiro. Priorize clareza, pragmatismo e segurança.',
        },
        { role: 'user', content: prompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return {
        success: true,
        data: fallbackDiagnosis(input, landingPageUrl, 'Resposta vazia do modelo de IA.'),
        warning: 'Resposta vazia do modelo. Exibindo fallback estruturado.',
        usedFallback: true,
      };
    }

    const diagnosis = parseDiagnosisPayload(raw, input, landingPageUrl, snapshot);
    return { success: true, data: diagnosis };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Falha ao gerar diagnóstico com IA.';
    return {
      success: true,
      data: fallbackDiagnosis(input, landingPageUrl, message),
      warning: `${message} Exibindo fallback estruturado para manter continuidade operacional.`,
      usedFallback: true,
    };
  }
}

