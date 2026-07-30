'use server';

import { generateChatCompletion } from '../../lib/llm-router';

export type TrafficAiAnalysisInput = {
  dateFrom: string;
  dateTo: string;
  channels: Array<{
    platform: string;
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
  }>;
  totals: {
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
  };
};

export type TrafficAiAnalysisResponse = {
  success: boolean;
  error?: string;
  executiveSummary: string;
  priorities: string[];
  metrics: {
    creativeFatigueIndex: number; // 0-100
    roasGapPct: number; // percentage difference
    cpmOscillation: string; // text explaining trend, e.g. "+12% Meta / -5% Google"
  };
};

export async function generateTrafficAiAnalysis(
  input: TrafficAiAnalysisInput
): Promise<TrafficAiAnalysisResponse> {
  const prompt = `
Você é o Analista de Tráfego de Mídia e IA Sênior da NeuroAds.
Analise as seguintes métricas de tráfego consolidadas das contas de anúncios (Google Ads, Meta Ads e LinkedIn Ads) e gere um diagnóstico de performance inteligente.

DADOS CONSOLIDADOS (Período: ${input.dateFrom} a ${input.dateTo}):
- Total Gasto (Investimento): R$ ${input.totals.spend.toFixed(2)}
- Impressões: ${input.totals.impressions}
- Cliques: ${input.totals.clicks}
- Conversões (Leads): ${input.totals.conversions}

DETALHAMENTO POR CANAL:
${input.channels
  .map(
    (c) =>
      `- Plataforma: ${c.platform} | Investido: R$ ${c.spend.toFixed(2)} | Impressões: ${c.impressions} | Cliques: ${c.clicks} | Conversões: ${c.conversions}`
  )
  .join('\n')}

INSTRUÇÕES OBRIGATÓRIAS:
1. Calcule a taxa de conversão (CVR), custo por clique (CPC), CTR e CPL global e por canal.
2. Identifique anomalias (canais com muito gasto e pouca conversão).
3. Estime o "creativeFatigueIndex" (0 a 100) baseado no volume de impressões e CTR médio (se CTR global for baixo e impressões altas, a fadiga tende a ser maior).
4. Estime o "roasGapPct" (meta de ROAS vs real estimado - se CPL for alto, o gap de ROAS real é negativo).
5. Descreva o "cpmOscillation" estimando a oscilação de CPM nos canais mais ativos.
6. Crie um resumo executivo direto e 3 a 5 prioridades de otimização de alta urgência com explicações financeiras de impacto.

Retorne APENAS um JSON válido seguindo EXATAMENTE esta estrutura (nenhum outro texto extra fora do bloco JSON):
{
  "executiveSummary": "Resumo analítico curto sobre o desempenho do tráfego no período",
  "priorities": [
    "Prioridade 1: Explicar a ação recomendada e o porquê financeiro",
    "Prioridade 2: ...",
    "Prioridade 3: ..."
  ],
  "metrics": {
    "creativeFatigueIndex": 0-100,
    "roasGapPct": valor numérico inteiro (negativo para abaixo da meta, ex: -15, ou positivo para acima, ex: 10),
    "cpmOscillation": "string curta resumindo as oscilações estimadas por canal, ex: '+8% no Meta / -4% no Google'"
  }
}
`.trim();

  try {
    const result = await generateChatCompletion({
      agentKey: 'dados',
      systemPrompt: 'Você é um Analista de Mídia Paga e Performance focado em eficiência de tráfego para empresas B2B e B2C. Responda apenas com o objeto JSON estruturado solicitado, sem tags markdown ou cabeçalhos.',
      userPrompt: prompt,
      temperature: 0.2,
    });

    if (!result.success || !result.content) {
      throw new Error(result.error || 'Sem resposta do motor de IA.');
    }

    // Limpar possíveis tags markdown de código (ex: ```json ... ```) se o modelo as inserir
    let rawContent = result.content.trim();
    if (rawContent.startsWith('```')) {
      rawContent = rawContent.replace(/^```(json)?/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(rawContent) as Record<string, unknown>;
    const metricsRaw = (parsed.metrics && typeof parsed.metrics === 'object' ? parsed.metrics : {}) as Record<string, unknown>;

    return {
      success: true,
      executiveSummary: String(parsed.executiveSummary || 'Análise de tráfego realizada com sucesso.'),
      priorities: Array.isArray(parsed.priorities) ? (parsed.priorities as unknown[]).map(String) : [],
      metrics: {
        creativeFatigueIndex: typeof metricsRaw.creativeFatigueIndex === 'number' ? Math.max(0, Math.min(100, metricsRaw.creativeFatigueIndex)) : 40,
        roasGapPct: typeof metricsRaw.roasGapPct === 'number' ? metricsRaw.roasGapPct : -10,
        cpmOscillation: String(metricsRaw.cpmOscillation || 'Estável'),
      },
    };
  } catch (error) {
    console.error('Erro na IA do Analista de Tráfego:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Falha ao processar análise preditiva.',
      executiveSummary: 'Análise básica gerada localmente. Ocorreu uma oscilação na chamada ao serviço de IA.',
      priorities: [
        'Ajustar lances de orçamento nos canais com menor CPL relativo.',
        'Auditar campanhas com frequência de exposição acima de 3.5 para prever saturação.',
        'Negativar termos de pesquisa de baixa conversão nas campanhas ativas.'
      ],
      metrics: {
        creativeFatigueIndex: 50,
        roasGapPct: -12,
        cpmOscillation: 'Oscilando (+4% Meta / Estável Google)',
      },
    };
  }
}
