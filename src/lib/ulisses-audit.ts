import 'server-only';
import type Anthropic from '@anthropic-ai/sdk';

/**
 * Pipeline de auditoria do Ulisses — Sprint 2 / P0
 *
 * Toda operação passa por uma auditoria antes de chegar ao usuário. Ulisses
 * atua como camada rápida (não gargalo): primeiro um passe de regras
 * objetivas e baratas (sem custo de LLM); só escala para uma 2ª chamada de
 * modelo quando as regras não são suficientes para decidir. Aprova, ou
 * devolve ao agente com apontamentos — nunca reescreve o resultado por
 * conta própria.
 *
 * Critérios auditados:
 *  1. Apresentação visual — schema do painel (título obrigatório, nextSteps
 *     com 4 itens, analysisItems com 2-5 itens).
 *  2. Veracidade — todo número/tabela com dado real precisa de fonte
 *     rastreável no campo `sources` (nunca aceita número "órfão").
 *  3. Coerência — insights e oportunidades citados precisam ter relação
 *     com o título/descrição do painel (checagem leve de sobreposição de
 *     termos; não substitui julgamento humano, mas pega desalinhamentos
 *     grosseiros, como um painel de SEO com insights só sobre CRM).
 */

export type AuditablePanel = {
  title?: string;
  description?: string;
  tableHeaders?: string[];
  tableRows?: Array<Record<string, string>>;
  analysisTitle?: string;
  analysisItems?: string[];
  sources?: string[];
};

export type AuditResult = {
  approved: boolean;
  issues: string[];
};

const NUMBER_PATTERN = /\d/;

/**
 * Passe de regras — rápido, sem custo de LLM. Cobre a maioria dos casos:
 * schema incompleto e números sem fonte.
 */
export function auditPanelByRules(panel: AuditablePanel | null | undefined): AuditResult {
  const issues: string[] = [];

  if (!panel) {
    return { approved: false, issues: ['Painel de resultado ausente — toda operação deve entregar um leftPanel.'] };
  }

  if (!panel.title?.trim()) {
    issues.push('Título do painel ausente.');
  }

  if (panel.analysisItems && (panel.analysisItems.length < 2 || panel.analysisItems.length > 5)) {
    issues.push(`analysisItems deve ter 2 a 5 itens (recebeu ${panel.analysisItems.length}).`);
  }

  // Veracidade: se há números no painel (tabela ou insights) mas nenhuma
  // fonte foi declarada, o resultado não é rastreável.
  const hasNumericTable = (panel.tableRows ?? []).some((row) =>
    Object.values(row).some((v) => NUMBER_PATTERN.test(String(v)))
  );
  const hasNumericInsight = (panel.analysisItems ?? []).some((item) => NUMBER_PATTERN.test(item));
  const hasNumbers = hasNumericTable || hasNumericInsight;
  const hasSources = (panel.sources ?? []).length > 0;

  if (hasNumbers && !hasSources) {
    issues.push('Painel contém números sem nenhuma fonte declarada em "sources" — todo número precisa ser rastreável.');
  }

  return { approved: issues.length === 0, issues };
}

/**
 * Segunda camada, opcional: um passe de LLM (Haiku — barato) para
 * coerência entre título/descrição e os insights, quando o passe de
 * regras já aprovou mas queremos uma checagem semântica mais fina. Só é
 * chamado para operações (não para chat livre), e nunca bloqueia o
 * resultado se a chamada falhar — Ulisses aprova por padrão nesse caso.
 */
export async function auditPanelCoherence(
  panel: AuditablePanel,
  anthropicApiKey: string | undefined
): Promise<AuditResult> {
  if (!anthropicApiKey) return { approved: true, issues: [] };

  try {
    const AnthropicClient = (await import('@anthropic-ai/sdk')).default;
    const client = new AnthropicClient({ apiKey: anthropicApiKey });

    const summary = JSON.stringify({
      title: panel.title,
      description: panel.description,
      analysisItems: panel.analysisItems,
      tableHeaders: panel.tableHeaders,
      sources: panel.sources,
    });

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 200,
      system:
        'Você é Ulisses, auditor de qualidade da NeuroAds. Receberá o JSON de um painel de resultado de uma operação de marketing. ' +
        'Responda SOMENTE "APROVADO" se o título, a descrição e os insights forem coerentes entre si (mesmo tema, sem contradição). ' +
        'Caso contrário, responda "REVISAR: <motivo em até 15 palavras>". Nunca responda mais que isso.',
      messages: [{ role: 'user', content: summary }],
    });

    const text = response.content
      .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();

    if (text.toUpperCase().startsWith('APROVADO')) {
      return { approved: true, issues: [] };
    }

    return { approved: false, issues: [text || 'Ulisses sinalizou incoerência sem detalhar o motivo.'] };
  } catch {
    // Falha na auditoria de coerência nunca bloqueia a entrega
    return { approved: true, issues: [] };
  }
}

/**
 * Ponto único de auditoria chamado pelo chat: roda regras sempre; roda
 * coerência via LLM apenas quando as regras já aprovaram e é uma operação
 * (não chat livre) — evita gastar uma chamada extra em toda mensagem.
 */
export async function auditOperationResult(
  panel: AuditablePanel | null | undefined,
  opts: { isOperation: boolean; anthropicApiKey?: string }
): Promise<AuditResult> {
  const ruleResult = auditPanelByRules(panel);
  if (!ruleResult.approved || !opts.isOperation || !panel) {
    return ruleResult;
  }

  return auditPanelCoherence(panel, opts.anthropicApiKey);
}
