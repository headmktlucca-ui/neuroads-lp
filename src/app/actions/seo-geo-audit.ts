'use server';

import OpenAI from 'openai';

export interface SeoGeoAuditInput {
  websiteUrl: string;
  businessContext?: string;
}

export interface SeoGeoAuditResult {
  success: boolean;
  report?: string;
  error?: string;
  generatedAt?: string;
  model?: string;
  usedWebSearch?: boolean;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

function normalizeUrl(url: string): string {
  const candidate = url.trim();
  if (!candidate) return '';
  if (/^https?:\/\//i.test(candidate)) return candidate;
  return `https://${candidate}`;
}

const SYSTEM_PROMPT = `Você é um especialista sênior em SEO (Search Engine Optimization) e GEO (Generative Engine Optimization / AI Answer Optimization) com mais de 20 anos de experiência.
Seu trabalho é realizar uma auditoria profunda e entregar um plano estratégico completo para que o site informado alcance a primeira posição nos resultados — tanto em buscadores tradicionais (Google, Bing) quanto nas respostas de assistentes de IA (ChatGPT, Gemini, Claude, Manus, Perplexity).

Use a busca na web para coletar informações sobre o site, o setor em que atua, concorrentes, e melhores práticas atuais de SEO e GEO para o segmento identificado.

REGRAS DE ENTREGA:
- Seja específico e acionável — nada de recomendações genéricas
- Forneça exemplos reais aplicados ao site analisado
- Inclua código quando relevante (HTML, JSON-LD, robots.txt, etc.)
- Priorize por impacto: 🔴 CRÍTICO / 🟡 IMPORTANTE / 🟢 MELHORIA
- Use linguagem profissional e direta
- Cada seção deve ter no mínimo 3 recomendações concretas
- Formate em Markdown limpo com hierarquia clara de cabeçalhos`;

const REPORT_FORMAT_PROMPT = `Realize uma auditoria SEO e GEO completa e entregue o relatório estruturado EXATAMENTE neste formato:

## 📊 RELATÓRIO EXECUTIVO
- Score SEO estimado (0–100) e justificativa
- Score GEO estimado (0–100) e justificativa
- Top 3 problemas críticos
- Top 3 oportunidades imediatas

## 🔧 1. AUDITORIA TÉCNICA SEO
Analise e recomende ações sobre:
- Rastreabilidade: robots.txt, sitemap.xml, indexação
- Erros HTTP, redirecionamentos desnecessários
- Core Web Vitals estimados (LCP, CLS, INP) e velocidade
- Mobile-first e responsividade
- HTTPS e segurança
- Arquitetura de URLs, canonicais, estrutura de links internos
- Renderização e JavaScript SEO

## ✍️ 2. ON-PAGE & CONTEÚDO
Analise:
- Title tags e meta descriptions das páginas principais
- Hierarquia de headings (H1–H6)
- Qualidade de conteúdo e E-E-A-T (Experiência, Especialização, Autoridade, Confiança)
- Otimização de imagens: alt text, formatos, compressão
- Oportunidades de Featured Snippets e People Also Ask
- Thin content ou conteúdo duplicado

## 🤖 3. GEO — OTIMIZAÇÃO PARA IAs GENERATIVAS
(ChatGPT, Gemini, Claude, Manus, Perplexity)
Avalie e recomende:
- Autoridade citável: o site é reconhecido e mencionado por fontes externas?
- Estrutura de conteúdo para IAs: FAQs, respostas diretas, listas, definições
- Schema Markup relevante para GEO (FAQPage, HowTo, Article, Organization)
- Dados de identidade e E-E-A-T para confiança dos LLMs
- Estratégia de menções em fontes primárias (imprensa, fóruns, publicações)
- Plano de ação GEO em 3 fases: Quick Wins / 30 dias / 90 dias

## 🏷️ 4. SCHEMA MARKUP
Gere o JSON-LD completo e pronto para implementar:
- Organization ou LocalBusiness (conforme o caso)
- WebSite com SearchAction
- FAQPage com as 5 perguntas mais relevantes para o setor

## 🎯 5. EXPERIÊNCIA DO USUÁRIO (UX/CRO)
Avalie:
- Clareza do propósito e proposta de valor (above the fold)
- Calls-to-action: posicionamento, linguagem, contraste
- Jornada do usuário e funil de conversão estimado
- Pontos de atrito e oportunidades de melhoria

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
    const response = await (openai as any).responses.create({
      model: 'gpt-4o',
      tools: [{ type: 'web_search_preview' }],
      max_output_tokens: 4000, // O nome correto para este endpoint Beta é max_output_tokens
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

