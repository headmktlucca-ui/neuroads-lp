'use server';

import OpenAI from 'openai';
import { SeoGeoAuditInput, SeoGeoAuditResult } from '../../types/seo-geo';

function normalizeUrl(url: string): string {
  const candidate = url.trim();
  if (!candidate) return '';
  if (/^https?:\/\//i.test(candidate)) return candidate;
  return `https://${candidate}`;
}

const SYSTEM_PROMPT = `Você é um especialista sênior em SEO (Search Engine Optimization) e GEO (Generative Engine Optimization / AI Answer Optimization) com mais de 20 anos de experiência.
 Seu trabalho é realizar uma auditoria profunda e entregar um plano estratégico completo.
 
 Use a busca na web para coletar informações sobre o site, o setor em que atua, concorrentes, e melhores práticas atuais de SEO e GEO para o segmento identificado.
 
 REGRAS DE ENTREGA:
 - Seja específico e acionável — nada de recomendações genéricas
 - Forneça exemplos reais aplicados ao site analisado
 - Inclua código de Schema Markup completo, enriquecido com dados semânticos (ex: sameAs apontando para entidades oficiais na Wikidata ou Wikipedia)
 - Priorize por impacto: 🔴 CRÍTICO / 🟡 IMPORTANTE / 🟢 MELHORIA
 - Use linguagem profissional e direta
 - Formate em Markdown limpo com hierarquia clara de cabeçalhos
 - IMPORTANTE: Finalize sempre o relatório com todas as seções solicitadas, sem cortes.`;

const REPORT_FORMAT_PROMPT = `Realize uma auditoria SEO e GEO completa e entregue o relatório estruturado EXATAMENTE neste formato:

## 📊 RELATÓRIO EXECUTIVO
- Score SEO estimado (0–100) e justificativa
- Score GEO / RAG Readiness Index (0–100) e justificativa técnica de indexabilidade para IAs
- Top 3 problemas críticos de visibilidade
- Top 3 oportunidades imediatas (Quick Wins)

## 🔧 1. AUDITORIA TÉCNICA SEO
Analise e recomende ações sobre:
- Rastreabilidade: robots.txt, sitemap.xml, indexação
- Erros HTTP, redirecionamentos desnecessários e canonicalização
- Core Web Vitals estimados (LCP, CLS, INP) e impacto na performance
- Mobile-first e responsividade estrutural
- HTTPS, segurança e tags de cabeçalho de segurança
- Arquitetura de URLs, taxonomia de diretórios e links internos
- Renderização e JavaScript SEO (SSR vs Client-side)

## ✍️ 2. ON-PAGE & CONTEÚDO
Analise:
- Title tags e meta descriptions das páginas principais
- Hierarquia de headings (H1–H6)
- Qualidade de conteúdo e E-E-A-T (Experiência, Especialização, Autoridade, Confiança)
- Otimização de imagens: alt text descritivo, formatos modernos, compressão
- Oportunidades de Featured Snippets e People Also Ask
- Thin content, conteúdo duplicado e canibalização de palavras-chave

## 🤖 3. GEO — OTIMIZAÇÃO PARA IAs GENERATIVAS & MOTORES RAG
(ChatGPT, Gemini, Claude, Perplexity)
Avalie e recomende:
- Autoridade citável: menções estruturadas da marca em fontes externas autoritativas
- Estrutura de conteúdo adaptada para IA: criação de respostas diretas, definições conceituais claras, listas ordenadas e tabelas fáceis de ler por rastreadores de LLMs
- Estratégia de Menções e Co-ocorrência em publicações e fóruns confiáveis (Wikipedia, PR digital, Reddit)
- Alinhamento de dados com a base de conhecimento de LLMs (redução de alucinações sobre a marca)
- Plano de ação GEO em 3 fases: Quick Wins / 30 dias / 90 dias

## 🏷️ 4. SCHEMA MARKUP SEMÂNTICO (JSON-LD)
Gere o JSON-LD completo e pronto para implementar:
- Organization ou LocalBusiness com propriedades avançadas e links "sameAs" apontando para perfis oficiais da marca e para entidades da Wikidata ou Wikipedia correspondentes ao nicho
- WebSite com SearchAction
- FAQPage com as 5 perguntas mais relevantes e respostas otimizadas para citação direta por IAs

## 🎯 5. EXPERIÊNCIA DO USUÁRIO (UX/CRO)
Avalie:
- Clareza do propósito e proposta de valor (above the fold)
- Calls-to-action: posicionamento, linguagem, contraste e Fitts' Law
- Jornada do usuário e funil de conversão estimado
- Pontos de atrito cognitivo e oportunidades de melhoria

## 🔗 6. AUTORIDADE & LINK BUILDING
- Perfil de backlinks estimado e Domain Authority
- 8 táticas de link building específicas para o setor identificado
- Oportunidades de PR digital e menções em mídia

## 🗺️ 7. ROADMAP DE IMPLEMENTAÇÃO
Organize em fases:
**FASE 1 — QUICK WINS (Semana 1–2):** ações de alto impacto e baixo esforço
**FASE 2 — FUNDAÇÃO (Mês 1–2):** correções técnicas e conteúdo estrutural
**FASE 3 — ESCALADA (Mês 2–3):** link building, GEO avançado, autoridade
**FASE 4 — DOMÍNIO (Mês 3–6):** consolidação e expansão

## 📈 8. KPIs & PROJEÇÕES
- Crescimento de tráfego orgânico esperado em 3 e 6 meses
- Posições alvo no Google para as principais keywords do setor
- GEO Score projetado (frequência de citação em IAs)
- Metas de conversão e Domain Authority alvo`;

export async function generateSeoGeoAudit(input: SeoGeoAuditInput): Promise<SeoGeoAuditResult> {
  if (!process.env.OPENAI_API_KEY) {
    return {
      success: false,
      error: 'OPENAI_API_KEY não configurada no ambiente.',
    };
  }

  const normalizedUrl = normalizeUrl(input.websiteUrl);
  if (!normalizedUrl) {
    return {
      success: false,
      error: 'Informe uma URL válida para auditoria.',
    };
  }

  try {
    new URL(normalizedUrl);
  } catch {
    return {
      success: false,
      error: 'A URL informada não é válida.',
    };
  }

  const userPrompt = [
    `Site para auditoria: ${normalizedUrl}`,
    input.businessContext?.trim() ? `Contexto adicional do usuário: ${input.businessContext.trim()}` : null,
    REPORT_FORMAT_PROMPT,
    'Resposta obrigatória em português do Brasil.',
  ]
    .filter(Boolean)
    .join('\n\n');

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });

    const response = await (openai as any).responses.create({
      model: 'gpt-4o',
      tools: [{ type: 'web_search_preview' }],
      max_output_tokens: 8000, // Increased for full report
      input: [
        { role: 'system', content: [{ type: 'input_text', text: SYSTEM_PROMPT }] },
        { role: 'user', content: [{ type: 'input_text', text: userPrompt }] },
      ],
    });

    const report = response.output_text?.trim();
    if (!report) {
      return {
        success: false,
        error: 'Não foi possível gerar o relatório no momento.',
      };
    }

    return {
      success: true,
      report,
      generatedAt: new Date().toISOString(),
      model: 'gpt-4o',
      usedWebSearch: true,
    };
  } catch (error) {
    console.error('SEO/GEO audit generation failed:', error);
    return {
      success: false,
      error: 'Falha ao gerar auditoria SEO & GEO. Tente novamente em instantes.',
    };
  }
}

