// ─── Visual Analysis Engine — NeuroAds ──────────────────────────────────────
// Tipos, interfaces e funções mock para análise visual preditiva.
// Preparado para integração futura com APIs como Attention Insight ou EyeQuant.

export type AttentionLevel = 'high' | 'medium' | 'low' | 'none';

export type Platform = 'Meta Ads' | 'Google Ads' | 'LinkedIn Ads' | 'TikTok Ads' | 'Orgânico';

// ─── Score de Atenção Individual ─────────────────────────────────────────────

export interface AttentionScoreCriterion {
  key: string;
  label: string;
  score: number;         // 0–100
  description: string;
  recommendation: string;
  level: AttentionLevel;
}

export interface AttentionScore {
  overall: number;       // 0–100 (média ponderada)
  criteria: AttentionScoreCriterion[];
  analyzedAt: Date;
  subjectLabel: string;  // e.g. "Banner Meta Ads — BF2026"
}

// ─── Heatmap Data ─────────────────────────────────────────────────────────────

export interface HeatmapFocusPoint {
  x: number;             // 0–1 (percentual da largura)
  y: number;             // 0–1 (percentual da altura)
  intensity: number;     // 0–1 (nível de calor)
  radius: number;        // raio em pixels
}

export interface HeatmapData {
  focusPoints: HeatmapFocusPoint[];
  width: number;
  height: number;
  aboveFoldY: number;    // posição em % da "dobra" (above-the-fold)
}

// ─── Análise de Criativo ──────────────────────────────────────────────────────

export interface CreativeAnalysis {
  id: string;
  platform: Platform;
  creativeName: string;
  imageUrl?: string;
  attentionScore: AttentionScore;
  heatmap: HeatmapData;
  predictedCTR: number;      // percentual estimado
  ctrBenchmark: number;      // benchmark da plataforma
  ctrDelta: number;          // diff vs benchmark (+/-)
  aboveFoldScore: number;    // 0–100
  analyzedAt: Date;
}

// ─── Relatório Above-the-Fold ─────────────────────────────────────────────────

export interface AboveFoldReport {
  url: string;
  screenshotDataUrl?: string;
  valuePropositionScore: number;  // 0–100
  firstImpression5s: string;      // o que o usuário percebe em 5s
  ctaPositioning: AttentionLevel;
  headlineClarity: AttentionLevel;
  recommendations: string[];
  analyzedAt: Date;
}

// ─── Helpers: Nível de atenção ────────────────────────────────────────────────

export function getAttentionLevel(score: number): AttentionLevel {
  if (score >= 75) return 'high';
  if (score >= 50) return 'medium';
  if (score >= 25) return 'low';
  return 'none';
}

export function getScoreColor(score: number): string {
  if (score >= 75) return '#22c55e';   // verde
  if (score >= 50) return '#f97316';   // laranja
  if (score >= 25) return '#ef4444';   // vermelho
  return '#94a3b8';                    // cinza
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excelente';
  if (score >= 65) return 'Bom';
  if (score >= 50) return 'Regular';
  if (score >= 35) return 'Fraco';
  return 'Crítico';
}

// ─── Mock: Critérios de Atenção ───────────────────────────────────────────────

function buildCriteria(overrides?: Partial<Record<string, number>>): AttentionScoreCriterion[] {
  const base: Omit<AttentionScoreCriterion, 'level'>[] = [
    {
      key: 'focal_point',
      label: 'Focal Point Clarity',
      score: overrides?.focal_point ?? Math.floor(Math.random() * 35) + 55,
      description: 'Clareza do ponto focal principal da imagem',
      recommendation: 'Centralize o elemento mais importante e aumente o contraste em relação ao fundo.',
    },
    {
      key: 'cta_visibility',
      label: 'CTA Visibility',
      score: overrides?.cta_visibility ?? Math.floor(Math.random() * 40) + 50,
      description: 'Visibilidade e destaque do botão de chamada para ação',
      recommendation: 'Use cor contrastante e posicione o CTA no terço inferior da dobra visível.',
    },
    {
      key: 'info_hierarchy',
      label: 'Info Hierarchy',
      score: overrides?.info_hierarchy ?? Math.floor(Math.random() * 30) + 60,
      description: 'Hierarquia visual das informações (título > subtítulo > corpo)',
      recommendation: 'Reduza o número de elementos com peso visual similar para criar fluxo claro.',
    },
    {
      key: 'distraction_score',
      label: 'Minimize Distractions',
      score: overrides?.distraction_score ?? Math.floor(Math.random() * 40) + 45,
      description: 'Ausência de elementos que desviam a atenção do objetivo principal',
      recommendation: 'Remova ou reduza elementos gráficos secundários que competem com o CTA.',
    },
  ];

  return base.map(c => ({ ...c, level: getAttentionLevel(c.score) }));
}

function calcOverall(criteria: AttentionScoreCriterion[]): number {
  const weights: Record<string, number> = {
    focal_point: 0.25,
    cta_visibility: 0.35,
    info_hierarchy: 0.25,
    distraction_score: 0.15,
  };
  return Math.round(
    criteria.reduce((acc, c) => acc + c.score * (weights[c.key] ?? 0.25), 0)
  );
}

// ─── Mock: Heatmap ────────────────────────────────────────────────────────────

function generateMockHeatmap(seed: number = 1): HeatmapData {
  const rng = (s: number) => ((Math.sin(s) + 1) / 2);
  return {
    width: 1200,
    height: 628,
    aboveFoldY: 0.55,
    focusPoints: [
      { x: 0.3 + rng(seed) * 0.1, y: 0.15 + rng(seed * 2) * 0.1, intensity: 0.9,  radius: 90 },
      { x: 0.5 + rng(seed * 3) * 0.15, y: 0.35 + rng(seed * 4) * 0.1, intensity: 0.75, radius: 70 },
      { x: 0.65 + rng(seed * 5) * 0.1, y: 0.6 + rng(seed * 6) * 0.1, intensity: 0.55, radius: 55 },
      { x: 0.2 + rng(seed * 7) * 0.1, y: 0.7 + rng(seed * 8) * 0.15, intensity: 0.3, radius: 40 },
    ],
  };
}

// ─── Mock: Score Completo para um Criativo ────────────────────────────────────

export function generateAttentionScore(
  label: string,
  overrides?: Partial<Record<string, number>>
): AttentionScore {
  const criteria = buildCriteria(overrides);
  return {
    overall: calcOverall(criteria),
    criteria,
    analyzedAt: new Date(),
    subjectLabel: label,
  };
}

export function scoreCreative(
  id: string,
  platform: Platform,
  creativeName: string,
  seed?: number
): CreativeAnalysis {
  const s = seed ?? creativeName.length;
  const criteria = buildCriteria({
    focal_point:      55 + (s % 35),
    cta_visibility:   50 + (s % 40),
    info_hierarchy:   60 + (s % 30),
    distraction_score:45 + (s % 40),
  });
  const overall = calcOverall(criteria);

  const benchmarks: Record<Platform, number> = {
    'Meta Ads':     1.2,
    'Google Ads':   2.1,
    'LinkedIn Ads': 0.4,
    'TikTok Ads':   1.8,
    'Orgânico':     0,
  };

  const benchmark = benchmarks[platform];
  const predictedCTR = parseFloat((benchmark * (overall / 75)).toFixed(2));

  return {
    id,
    platform,
    creativeName,
    attentionScore: { overall, criteria, analyzedAt: new Date(), subjectLabel: creativeName },
    heatmap: generateMockHeatmap(s),
    predictedCTR,
    ctrBenchmark: benchmark,
    ctrDelta: parseFloat((predictedCTR - benchmark).toFixed(2)),
    aboveFoldScore: 45 + (s % 45),
    analyzedAt: new Date(),
  };
}

// ─── Mock: Relatório Above-the-Fold ──────────────────────────────────────────

export function generateAboveFoldReport(url: string): AboveFoldReport {
  return {
    url,
    valuePropositionScore: 72,
    firstImpression5s: 'Plataforma de IA para Marketing B2B',
    ctaPositioning: 'medium',
    headlineClarity: 'high',
    recommendations: [
      'Mova o CTA principal 40px para cima — atualmente está na zona fria da primeira dobra.',
      'Aumente o contraste do subtítulo em pelo menos 20% para legibilidade em mobile.',
      'Remova o banner rotativo — está consumindo 28% da atenção disponível do topo.',
    ],
    analyzedAt: new Date(),
  };
}

// ─── Mock: Score de Template de Mensagem ─────────────────────────────────────

export interface MessageCTAScore {
  templateTitle: string;
  score: number;
  level: AttentionLevel;
  tip: string;
}

export function scoreMessageTemplate(title: string, text: string): MessageCTAScore {
  // Heurística simples baseada em presença de elementos persuasivos
  let score = 50;
  if (/\?/.test(text)) score += 8;           // pergunta engaja
  if (/link|url|http/i.test(text)) score -= 5; // links reduzem atenção no texto
  if (text.length < 150) score += 10;        // mensagem curta = mais foco
  if (/agora|hoje|amanhã/i.test(text)) score += 12; // urgência
  if (/garantimos|100%/i.test(text)) score += 8;    // confiança
  if (/\!/.test(text)) score += 5;            // emoção
  score = Math.min(100, Math.max(20, score));

  return {
    templateTitle: title,
    score,
    level: getAttentionLevel(score),
    tip: score >= 75
      ? 'Template com alto potencial de resposta. CTA claro e urgência presente.'
      : score >= 50
      ? 'Adicione uma pergunta direta ou elemento de urgência para aumentar o engajamento.'
      : 'Simplifique a mensagem e destaque apenas uma ação desejada.',
  };
}

// ─── Requisição Real para API ────────────────────────────────────────────────
export async function analyzeVisually(params: {
  url?: string;
  creativeName?: string;
  platform?: Platform;
}) {
  const response = await fetch('/api/visual-analysis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Erro ao processar análise visual na API');
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Erro na resposta da API');
  }
  return data;
}

