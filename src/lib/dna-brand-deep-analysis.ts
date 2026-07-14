import 'server-only';

import { GoogleGenAI } from '@google/genai';

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface DnaBrandDeepColor {
  nome: string;
  hex: string;
  tipo: string;
  uso: string;
}

export interface DnaBrandDeepResult {
  markdownReport: string;
  summary: string;
  colorPalette: DnaBrandDeepColor[];
  analysisItems: string[];
}

export async function runDnaBrandDeepAnalysis(params: {
  userId: string;
  site: string;
  companyName: string;
  instagram?: string;
  linkedin?: string;
}): Promise<DnaBrandDeepResult> {
  const { site, companyName, instagram, linkedin } = params;

  const prompt = `Você é a equipe de branding sênior da NeuroAds (LAÍS + especialistas de posicionamento). Sua missão é executar uma análise completa e profunda do DNA da Marca de ${companyName}, em três fases obrigatórias, usando o site real da empresa como fonte primária.

EMPRESA ANALISADA:
- Nome: ${companyName}
- Site: ${site}
${instagram ? `- Instagram: ${instagram}` : ''}
${linkedin ? `- LinkedIn: ${linkedin}` : ''}

INSTRUÇÕES DE PESQUISA (execute nesta ordem, sem pular etapas):

FASE 1 — BRAND SETUP (Diagnóstico e coleta):
Use o buscador (Google Search) para ler o site ${site} e qualquer presença digital pública associada (Instagram, LinkedIn, menções, reviews). Extraia: proposta de valor, produtos/serviços, tom de linguagem já usado no site, elementos visuais e de cor predominantes, e sinais de categoria/nicho de mercado.

FASE 2 — BRAND REVIEW (Auditoria crítica):
Avalie criticamente o posicionamento atual: o que está claro, o que está confuso ou genérico, onde a comunicação é inconsistente entre canais, e como a marca se compara a referências do mesmo nicho no Brasil. Identifique o arquétipo de marca (um dos 12 arquétipos de Carl Jung) que melhor representa a empresa hoje.

FASE 3 — BRAND COPYWRITER (Entrega acionável):
Com base nas fases 1 e 2, produza diretrizes de tom de voz prontas para uso (regras, do's e don'ts), pilares de conteúdo, mensagens por etapa de funil (topo/meio/fundo) e um plano de ação de 30 dias para fortalecer o posicionamento.

FORMATO DE RETORNO:
Retorne obrigatoriamente um JSON válido no formato abaixo. Apenas o JSON, sem nenhuma outra conversa ou cerca de código:
{
  "resumo": "Resumo executivo de 2 a 3 frases sobre o DNA da marca identificado.",
  "arquetipo": "Um dos 12 arquétipos de Carl Jung (ex: O Criador, O Mago, O Herói, O Governante)",
  "paleta_cores": [
    { "nome": "Nome da cor", "hex": "#RRGGBB", "tipo": "primaria | secundaria | destaque | neutra_clara | neutra_escura", "uso": "onde e como usar essa cor" }
  ],
  "insights": [
    "💡 OPORTUNIDADE: insight de oportunidade acionável de posicionamento ou comunicação.",
    "⚠️ RISCO: inconsistência ou fraqueza de marca que precisa de correção.",
    "🔁 PADRÃO: padrão de comunicação ou visual recorrente identificado no site/redes."
  ],
  "documento_completo": "Markdown extremamente completo e detalhado do DNA da Marca, para servir de Base de Conhecimento oficial e ser usado por outros agentes de IA da operação. Estruture com títulos # e ##, cobrindo OBRIGATORIAMENTE, nesta ordem: 1. Resumo Executivo; 2. Arquétipo de Marca e Posicionamento Central; 3. Identidade Visual e Paleta de Cores (com significado psicológico e diretrizes de estilo); 4. Perfil Ideal de Cliente (segmento, porte, faixa de receita, contexto de urgência, principais dores, gatilhos de decisão, medos subconscientes, valores, hábitos digitais); 5. Conteúdo de Maior Interesse e Interação do Público (formatos preferidos, temas de alta intenção, mix de conteúdo recomendado); 6. Regras de Voz da Marca (Do's e Don'ts detalhados); 7. Pilares de Conteúdo; 8. Mensagens por Etapa de Funil (topo, meio, fundo); 9. Oportunidades Práticas (posicionamento, ideias de conteúdo, materiais, funil de relacionamento, campanhas pagas, e-mail marketing); 10. Plano de Ação de 30 Dias."
}

REGRAS CRÍTICAS:
- O campo 'documento_completo' deve ser o mais completo e detalhado possível — com todos os detalhes possíveis em cada seção, sem placeholders genéricos e sem pular nenhuma das 10 seções listadas.
- 'paleta_cores' deve ter entre 3 e 6 cores reais, coerentes com o que foi observado no site.
- Apenas JSON válido. Não coloque markup de markdown no início ou final da resposta, apenas o objeto JSON bruto.`;

  try {
    const response = await genai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        maxOutputTokens: 16000,
      },
    });

    const text = response.text ?? '';
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start >= 0 && end > start) {
      const parsed = JSON.parse(text.slice(start, end + 1));
      const arquetipo = typeof parsed.arquetipo === 'string' ? parsed.arquetipo : '';
      const documentoCompleto =
        typeof parsed.documento_completo === 'string' ? parsed.documento_completo : '';
      return {
        markdownReport: arquetipo
          ? documentoCompleto.replace(/^# /, `# DNA da Marca — ${companyName}\n\n**Arquétipo:** ${arquetipo}\n\n# `)
          : documentoCompleto || 'Relatório de DNA da Marca indisponível.',
        summary: parsed.resumo || 'Análise profunda do DNA da marca realizada.',
        colorPalette: Array.isArray(parsed.paleta_cores)
          ? parsed.paleta_cores
              .filter((c: unknown) => c && typeof c === 'object')
              .map((c: Record<string, unknown>) => ({
                nome: typeof c.nome === 'string' ? c.nome : 'Cor',
                hex: typeof c.hex === 'string' ? c.hex : '#000000',
                tipo: typeof c.tipo === 'string' ? c.tipo : 'primaria',
                uso: typeof c.uso === 'string' ? c.uso : '',
              }))
          : [],
        analysisItems: Array.isArray(parsed.insights) ? parsed.insights : [],
      };
    }
  } catch (err) {
    console.error('[runDnaBrandDeepAnalysis] Gemini execution failed:', err);
  }

  return generateFallbackDnaBrand(site, companyName);
}

function generateFallbackDnaBrand(site: string, companyName: string): DnaBrandDeepResult {
  const report = `# DNA da Marca — ${companyName}

## 1. Resumo Executivo
Análise inicial do posicionamento digital de **${companyName}** a partir do domínio institucional [${site}](https://${site}). Este documento consolida o DNA de marca disponível até o momento e deve ser revisado assim que a pesquisa completa puder ser reexecutada.

## 2. Arquétipo de Marca e Posicionamento Central
Arquétipo provisório: **O Criador** — marca orientada a resolver problemas de forma prática e inovadora para seu público.

## 3. Identidade Visual e Paleta de Cores
- **Laranja Neuro** (\`#FF6B00\`, primária): cor de destaque para CTAs e elementos de ação.
- **Cinza Escuro** (\`#111827\`, neutra escura): textos principais e fundos escuros.

## 4. Perfil Ideal de Cliente
- **Segmento:** empresas em crescimento que buscam previsibilidade de aquisição.
- **Principais dores:** falta de constância em geração de leads qualificados e desperdício de verba em canais não otimizados.

## 5. Conteúdo de Maior Interesse
Conteúdo educativo e orientado a resultado prático tende a gerar mais engajamento com este público.

## 6. Regras de Voz da Marca
- **Fazer:** comunicação direta, orientada a resultado, com prova concreta.
- **Evitar:** jargão vazio e promessas sem lastro em dado real.

## 7. Pilares de Conteúdo
- Autoridade técnica no nicho
- Prova social e cases reais
- Educação sobre o problema que a marca resolve

## 8. Mensagens por Etapa de Funil
- **Topo:** educar sobre o problema e despertar consciência.
- **Meio:** comparar alternativas e demonstrar diferencial.
- **Fundo:** reduzir risco percebido da decisão de compra.

## 9. Oportunidades Práticas
Reforçar prova social no site e padronizar tom de voz entre site, redes sociais e materiais comerciais.

## 10. Plano de Ação de 30 Dias
1. Semana 1-2: consolidar mensagens-chave e atualizar o site com base neste documento.
2. Semana 3: alinhar redes sociais ao novo tom de voz.
3. Semana 4: revisar materiais comerciais e scripts de vendas.

*Este relatório foi gerado em modo de contingência — recomenda-se reexecutar a operação para uma análise com pesquisa ao vivo do site.*`;

  return {
    markdownReport: report,
    summary: `Diagnóstico inicial de DNA da marca para ${companyName}, com base no domínio ${site}. Recomenda-se reexecutar a operação para aprofundar a pesquisa.`,
    colorPalette: [
      { nome: 'Laranja Neuro', hex: '#FF6B00', tipo: 'primaria', uso: 'CTAs e elementos de destaque.' },
      { nome: 'Cinza Escuro', hex: '#111827', tipo: 'neutra_escura', uso: 'Textos principais e fundos escuros.' },
    ],
    analysisItems: [
      '💡 OPORTUNIDADE: Padronizar o tom de voz entre site e redes sociais para reforçar reconhecimento de marca.',
      '⚠️ RISCO: Sem pesquisa ao vivo, mensagens genéricas podem não refletir o posicionamento real já construído.',
      '🔁 PADRÃO: Marcas do mesmo estágio de crescimento costumam ganhar tração priorizando prova social concreta.',
    ],
  };
}
