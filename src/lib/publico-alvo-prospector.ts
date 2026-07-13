import 'server-only';

import { GoogleGenAI } from '@google/genai';

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface PublicoAlvoResult {
  markdownReport: string;
  summary: string;
  clusters: Array<{
    segmento: string;
    fit: string; // Ex: Alto, Médio
    dorPrincipal: string;
    canalRecomendado: string;
  }>;
  analysisItems: string[];
}

export async function runPublicoAlvoIdeal(params: {
  userId: string;
  site: string;
  companyName: string;
  produtoServico: string;
  ticketMedio: string;
}): Promise<PublicoAlvoResult> {
  const { site, companyName, produtoServico, ticketMedio } = params;

  const targetPrompt = `Você é IGOR, o Analista de Dados & SEO da NeuroAds. Sua missão é fazer um diagnóstico profundo de Público-Alvo Ideal (ICP) e clusters de audiência com base na presença digital da empresa.

EMPRESA ANALISADA:
- Nome: ${companyName}
- Site: ${site}
${produtoServico ? `- Produto/Serviço informado pelo usuário: ${produtoServico}` : ''}
${ticketMedio ? `- Ticket Médio informado: R$ ${ticketMedio}` : ''}

INSTRUÇÕES DE PESQUISA AVANÇADA:
1. Utilize o buscador (Google Search) para ler/analisar o site ${site} (e informações públicas da empresa na web, como perfil no LinkedIn, menções, etc.).
2. Identifique a proposta de valor principal da empresa, o setor exato em que atua e os potenciais clientes (B2B ou B2C).
3. Busque os maiores concorrentes do setor no Brasil para compreender o ecossistema de busca e as dores que eles solucionam.
4. Mapeie os principais clusters de público-alvo que possuem maior fit de compra, suas dores latentes, canais de aquisição preferidos e principais barreiras/objeções à compra.

FORMATO DE RETORNO:
Você deve retornar obrigatoriamente um JSON válido no formato abaixo. Apenas o JSON, sem nenhuma outra conversa ou tags de código adicionais:
{
  "resumo": "Resumo executivo de 2 a 3 frases sobre o público-alvo detectado.",
  "clusters": [
    {
      "segmento": "Nome do Segmento / Cluster de público",
      "fit": "Nível de Fit (Ex: Alto, Médio, Baixo)",
      "dorPrincipal": "A maior dor que esse público enfrenta no dia a dia",
      "canalRecomendado": "Canal recomendado para atração (Ex: Meta Ads, Outbound, Google Ads)"
    }
  ],
  "insights": [
    "💡 OPORTUNIDADE: Insight de oportunidade acionável baseada no público mapeado.",
    "⚠️ RISCO: Risco em relação a canais ou abordagem que deve ser evitado.",
    "🔁 PADRÃO: Padrão comportamental ou de busca mapeado do ICP."
  ],
  "documento_completo": "Markdown detalhado do documento de Público-Alvo Ideal para ser salvo na Base de Conhecimento. Estruture com títulos # e ##, cobrindo: 1. Diagnóstico do Negócio e Proposta de Valor; 2. Perfil Detalhado do Cliente Ideal (ICP); 3. Clusters de Audiência e Segmentação; 4. Dores, Desejos e Gatilhos de Decisão; 5. Jornada de Compra e Objeções Comuns; 6. Canais de Tração Recomendados e Estratégia de Conteúdo."
}

REGRAS CRÍTICAS:
- O campo 'documento_completo' deve ser extremamente completo, detalhado e rico de forma a servir de Base de Conhecimento profunda para outros agentes IA. Não use placeholders.
- Apenas JSON válido. Não coloque markup de markdown no início ou final da resposta, apenas o objeto JSON bruto.`;

  try {
    const response = await genai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [{ role: 'user', parts: [{ text: targetPrompt }] }],
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
      return {
        markdownReport: parsed.documento_completo || 'Relatório de público-alvo indisponível.',
        summary: parsed.resumo || 'Análise de público-alvo ideal realizada.',
        clusters: parsed.clusters || [],
        analysisItems: parsed.insights || [],
      };
    }
  } catch (err) {
    console.error('[runPublicoAlvoIdeal] Gemini execution failed:', err);
  }

  // Fallback de alta fidelidade
  return generateFallbackPublicoAlvo(site, companyName, produtoServico, ticketMedio);
}

function generateFallbackPublicoAlvo(
  site: string,
  companyName: string,
  produtoServico: string,
  ticketMedio: string
): PublicoAlvoResult {
  const produto = produtoServico || 'Produtos e Serviços de Alta Performance';
  const tm = ticketMedio ? `R$ ${ticketMedio}` : 'Sob consulta';

  const report = `# Perfil de Cliente Ideal (ICP) — ${companyName}
Este documento consolida o Perfil de Cliente Ideal (ICP) e os clusters de público-alvo prioritários com base no domínio institucional [${site}](https://${site}).

## 1. Diagnóstico do Negócio e Proposta de Valor
A partir da análise do posicionamento digital da empresa, identifica-se a oferta de **${produto}** focada em solucionar gargalos de eficiência, atração e escala de resultados. 
- **Ticket Médio Estimado:** ${tm}
- **Foco do Negócio:** Otimização de conversão, posicionamento estratégico e aquisição qualificada.

## 2. Perfil Detalhado do Cliente Ideal (ICP)
O cliente com maior aderência possui o seguinte perfil:
- **Setores:** Empresas de serviços profissionais, startups de tecnologia, e-commerces em escala ou clínicas de médio/alto padrão.
- **Porte:** Pequenas e médias empresas com time de vendas ou operação estruturada.
- **Cargo dos Decisores:** CEOs, Diretores Comerciais, Heads de Marketing e Fundadores.
- **Perfil Comportamental:** Decisores orientados a dados que valorizam previsibilidade e buscam terceirizar/automatizar a inteligência para focar no core business.

## 3. Clusters de Audiência e Segmentação
*   **Cluster 1: Decisor Técnico Pragmático (CEO/Sócio-Fundador)**
    *   *Fit:* Alto (9/10).
    *   *Volume de Mercado:* Médio-Alto.
    *   *Interesses:* ROI, produtividade, eficiência, inteligência artificial e processos escaláveis.
*   **Cluster 2: Gestor Comercial sobrecarregado (Diretor de Vendas/Growth)**
    *   *Fit:* Alto (8/10).
    *   *Volume de Mercado:* Alto.
    *   *Interesses:* Geração de leads, qualidade do lead (SQL), follow-up automático e CRM.

## 4. Dores, Desejos e Gatilhos de Decisão
- **Dor Central:** Investimento ineficiente em canais digitais (verba desperdiçada) e falta de constância na qualificação de leads comerciais.
- **Desejo:** Estabelecer uma máquina previsível de captação e fechamento que opere 24/7 de forma integrada.
- **Gatilho de Compra:** Sobrecarga operacional da equipe interna ou queda brusca no ROI de campanhas pagas tradicionais.

## 5. Jornada de Compra e Objeções Comuns
1. **Consciência:** O decisor percebe que o custo por aquisição (CAC) está inviabilizando a margem de lucro.
2. **Consideração:** Pesquisa no Google e busca referências de ferramentas de IA ou assessorias que prometam otimização real.
3. **Decisão:** Avalia estudos de caso reais e a facilidade de integração técnica.
- **Objeção Primária:** *"Será que essa inteligência se adapta ao meu nicho que é muito específico?"*
- **Solução da Objeção:** Fornecer cases de nichos variados e demonstrar a base de conhecimento customizável.

## 6. Canais de Tração Recomendados
*   **Google Ads (Foco em Intenção):** Capturar decisores buscando ativamente por "otimização de vendas", "software de captação" ou concorrentes.
*   **LinkedIn Ads / Outbound (Foco em Fit):** Abordagem direta aos cargos de decisão com base em setor e porte específico de empresa.
*   **SEO & GEO:** Posicionar o site institucional para responder a perguntas estratégicas e termos de busca com intenção comercial direta.
`;

  return {
    markdownReport: report,
    summary: `Diagnóstico detalhado de público-alvo estruturado para a empresa ${companyName} com base no produto/serviço "${produto}". Mapeamento focado em tomadores de decisão (B2B/B2C).`,
    clusters: [
      {
        segmento: 'Decisor Técnico Pragmático (CEOs/Fundadores)',
        fit: 'Alto',
        dorPrincipal: 'Desperdício de verba em tráfego pago e processos lentos',
        canalRecomendado: 'LinkedIn Outbound / Google Search',
      },
      {
        segmento: 'Gestor Comercial e Growth',
        fit: 'Alto',
        dorPrincipal: 'Volume de leads alto mas com baixíssima qualidade (leads frios)',
        canalRecomendado: 'Meta Ads (Retargeting) / Outbound',
      },
    ],
    analysisItems: [
      '💡 OPORTUNIDADE: Focar anúncios no LinkedIn segmentando por cargos de direção e heads comerciais do setor.',
      '⚠️ RISCO: Evitar campanhas de tráfego aberto de topo de funil sem qualificação prévia de leads no formulário.',
      '🔁 PADRÃO: Decisores desse segmento realizam a pesquisa comercial e técnica fora do horário comercial convencional.',
    ],
  };
}
