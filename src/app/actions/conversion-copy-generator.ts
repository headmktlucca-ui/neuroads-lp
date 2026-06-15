'use server';

import OpenAI from 'openai';

export type ReferenceCreativeInput = {
  title: string;
  source: string;
  summary: string;
  score?: number;
};

export type ConversionCopyRequest = {
  companyName: string;
  segment: string;
  offer: string;
  objective: string;
  funnelStage: string;
  contentType: string;
  creativeFormat: string;
  channels: string[];
  metrics: {
    ctrTarget: number;
    conversionTarget: number;
    cplTarget: number;
    roasTarget: number;
  };
  referenceCreatives?: ReferenceCreativeInput[];
  creativeInstruction?: string;
  suggestionImages?: Array<{
    name: string;
    type: string;
    sizeKb: number;
  }>;
  additionalContext?: string;
};

export type ConversionInsight = {
  id: string;
  title: string;
  insight: string;
  whyItMatters: string;
  priority: 'Alta' | 'Media' | 'Baixa';
  confidence: number;
};

export type GeneratedCopyItem = {
  id: string;
  channel: string;
  angle: string;
  headline: string;
  hook: string;
  body: string;
  cta: string;
  creativeDirection: string;
  expectedImpact: string;
};

export type ConversionCopyResponse = {
  insights: ConversionInsight[];
  copies: GeneratedCopyItem[];
  optimizationActions: string[];
  riskAlerts: string[];
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.'));
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function fallbackResponse(input: ConversionCopyRequest): ConversionCopyResponse {
  const bestReference = [...(input.referenceCreatives ?? [])].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))[0];
  const bestChannel = input.channels[0] || 'Canal principal';
  const angle = bestReference?.title || 'Clareza de resultado financeiro';
  const ctaStyle = 'Diagnostico estrategico';

  return {
    insights: [
      {
        id: `insight-${Date.now()}-1`,
        title: 'Padrao de conversao dominante',
        insight: `Os sinais mais fortes estao concentrados em ${bestChannel}, com referencia criativa "${angle}".`,
        whyItMatters: 'Padroes com maior conversao reduzem tempo de teste e preservam caixa.',
        priority: 'Alta',
        confidence: 82,
      },
      {
        id: `insight-${Date.now()}-2`,
        title: 'Risco de dispersao de mensagem',
        insight: 'A copia deve focar em uma unica promessa de valor por ativo para aumentar clareza.',
        whyItMatters: 'Excesso de argumentos simultaneos tende a reduzir CTR e taxa de resposta.',
        priority: 'Media',
        confidence: 76,
      },
      {
        id: `insight-${Date.now()}-3`,
        title: 'Oportunidade de ganho incremental',
        insight: 'Reforcar prova e urgencia no CTA tende a melhorar taxa de decisao no fundo do funil.',
        whyItMatters: 'Pequenas melhoras em CVR impactam diretamente CPL e margem de aquisicao.',
        priority: 'Alta',
        confidence: 79,
      },
    ],
    copies: [
      {
        id: `copy-${Date.now()}-1`,
        channel: bestChannel,
        angle,
        headline: `${input.companyName}: pare de investir no escuro e escale com previsibilidade`,
        hook: 'Se os numeros parecem bons, mas as vendas nao batem, existe um vazamento invisivel na sua operacao.',
        body: `Voce nao precisa de mais campanha solta. Precisa de um sistema que conecta estrategia, dados reais e execucao diaria. Com foco em ${input.objective.toLowerCase()}, sua operacao ganha clareza de decisao e reduz desperdicio com criterio financeiro.${input.creativeInstruction ? ` Diretriz adicional: ${input.creativeInstruction}` : ''}`,
        cta: `Solicitar ${ctaStyle.toLowerCase()}`,
        creativeDirection: `${input.creativeFormat} com comparativo antes/depois e destaque visual para indicador de caixa.`,
        expectedImpact: `Prioridade em elevar conversao acima de ${input.metrics.conversionTarget}% mantendo CPL proximo de R$ ${input.metrics.cplTarget}.`,
      },
      {
        id: `copy-${Date.now()}-2`,
        channel: bestChannel,
        angle: 'Reducao de desperdicio',
        headline: 'Seu marketing nao precisa de mais verba. Precisa de direcao.',
        hook: 'A maioria das PMEs perde dinheiro em campanhas que parecem ativas, mas nao geram caixa.',
        body: `Nosso foco e simples: identificar o que realmente converte e dobrar em cima disso. Sem achismo, sem relatorio vazio. Dados reais, rotina objetiva e performance que voce consegue acompanhar em dinheiro.`,
        cta: 'Ativar plano de otimizacao',
        creativeDirection: 'Criativo com contraste forte, dados financeiros em destaque e estrutura de leitura rapida.',
        expectedImpact: 'Ganho de eficiencia pela remocao de mensagens de baixa intencao e reforco de prova.',
      },
      {
        id: `copy-${Date.now()}-3`,
        channel: bestChannel,
        angle: 'Autoridade com metodo',
        headline: 'Chega de duvida: transforme marketing em sistema de crescimento previsivel',
        hook: 'Quem escala com consistencia nao depende de sorte; depende de metodo e sinais certos.',
        body: `Enquanto voce cuida da operacao, a estrategia de aquisicao precisa rodar com criterio tecnico e leitura de risco. O resultado e mais previsibilidade, menos volatilidade e decisao apoiada em indicadores que importam.`,
        cta: 'Falar com estrategista',
        creativeDirection: 'Formato editorial com prova numerica, autoridade e CTA limpo.',
        expectedImpact: 'Fortalecer decisao de compra para perfis ceticos em consideracao e decisao.',
      },
    ],
    optimizationActions: [
      'Executar teste A/B de headline principal por canal por 7 dias.',
      'Isolar uma variavel por rodada (angulo, prova ou CTA) para evitar ruído analitico.',
      'Promover para modelo vencedor apenas copys que superarem meta de CVR e CPL alvo.',
    ],
    riskAlerts: [
      'Evitar promessas absolutas de resultado garantido nas mensagens.',
      'Nao misturar multiplas ofertas na mesma copy quando o objetivo for conversao direta.',
    ],
  };
}

function readPriority(value: unknown): 'Alta' | 'Media' | 'Baixa' {
  if (value === 'Alta' || value === 'Media' || value === 'Baixa') return value;
  return 'Media';
}

function parseResponse(content: string): ConversionCopyResponse {
  const parsed = JSON.parse(content) as Record<string, unknown>;

  const insightsRaw = Array.isArray(parsed.insights) ? parsed.insights : [];
  const copiesRaw = Array.isArray(parsed.copies) ? parsed.copies : [];
  const actionsRaw = Array.isArray(parsed.optimizationActions) ? parsed.optimizationActions : [];
  const risksRaw = Array.isArray(parsed.riskAlerts) ? parsed.riskAlerts : [];

  const insights: ConversionInsight[] = insightsRaw.map((item, index) => {
    const row = item as Record<string, unknown>;
    return {
      id: String(row.id || `insight-${Date.now()}-${index}`),
      title: String(row.title || 'Insight estrategico'),
      insight: String(row.insight || ''),
      whyItMatters: String(row.whyItMatters || ''),
      priority: readPriority(row.priority),
      confidence: Math.max(0, Math.min(100, toNumber(row.confidence))),
    };
  });

  const copies: GeneratedCopyItem[] = copiesRaw.map((item, index) => {
    const row = item as Record<string, unknown>;
    return {
      id: String(row.id || `copy-${Date.now()}-${index}`),
      channel: String(row.channel || ''),
      angle: String(row.angle || ''),
      headline: String(row.headline || ''),
      hook: String(row.hook || ''),
      body: String(row.body || ''),
      cta: String(row.cta || ''),
      creativeDirection: String(row.creativeDirection || ''),
      expectedImpact: String(row.expectedImpact || ''),
    };
  });

  const optimizationActions = actionsRaw.map((item) => String(item)).filter(Boolean);
  const riskAlerts = risksRaw.map((item) => String(item)).filter(Boolean);

  return {
    insights: insights.slice(0, 6),
    copies: copies.slice(0, 8),
    optimizationActions: optimizationActions.slice(0, 8),
    riskAlerts: riskAlerts.slice(0, 8),
  };
}

export async function generateConversionCopyReport(
  input: ConversionCopyRequest
): Promise<{ success: true; data: ConversionCopyResponse } | { success: false; error: string; data?: ConversionCopyResponse }> {
  if (!input.channels.length) {
    return { success: false, error: 'Selecione ao menos um canal.' };
  }

  if (!process.env.OPENAI_API_KEY) {
    return { success: true, data: fallbackResponse(input) };
  }

  const prompt = `
Voce e um estrategista senior de conversao da NeuroAds, especialista em performance para PMEs.
Objetivo: gerar insights mensuraveis e copies com foco em resultado financeiro real.
 
REGRAS OBRIGATORIAS:
- Proibido prometer "resultado garantido".
- Linguagem direta e profissional, sem corporativês.
- Explicar impacto das recomendacoes em dinheiro, eficiencia ou previsibilidade.
- Evitar vieses discriminatorios e qualquer conteudo sensivel inadequado.
- Adapte a linguagem e o tom de cada copy baseado no nível de consciência do consumidor informado (Inconsciente, Consciente do Problema, Consciente da Solução, Consciente do Produto, Totalmente Consciente).
- Inclua argumentos específicos direcionados a quebrar as principais objeções de venda (como objeção de preço, falta de tempo, ceticismo técnico, ou complexidade).
 
CONTEXTO:
${JSON.stringify(input, null, 2)}
 
ENTREGUE EXATAMENTE EM JSON COM ESTE SCHEMA:
{
  "insights": [
    {
      "id": "string",
      "title": "string",
      "insight": "string",
      "whyItMatters": "string",
      "priority": "Alta|Media|Baixa",
      "confidence": 0-100
    }
  ],
  "copies": [
    {
      "id": "string",
      "channel": "string",
      "angle": "string",
      "headline": "string",
      "hook": "string",
      "body": "string",
      "cta": "string",
      "creativeDirection": "string",
      "expectedImpact": "string"
    }
  ],
  "optimizationActions": ["string"],
  "riskAlerts": ["string"]
}
`.trim();

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Atue com rigor analitico. Gere saida estruturada, segura e orientada a conversao. Priorize clareza e aplicabilidade.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return { success: true, data: fallbackResponse(input) };
    }

    return {
      success: true,
      data: parseResponse(content),
    };
  } catch (error) {
    console.error('Erro ao gerar relatorio de copies de conversao:', error);
    return {
      success: false,
      error: 'Falha ao consultar motor de IA. Retornando sugestoes baseadas nas configuracoes atuais.',
      data: fallbackResponse(input),
    };
  }
}
