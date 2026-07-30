import 'server-only';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { Anthropic } from '@anthropic-ai/sdk';

// Instâncias cacheadas em memória para reutilização
let openaiInstance: OpenAI | null = null;
let geminiInstance: GoogleGenAI | null = null;
let anthropicInstance: Anthropic | null = null;

/**
 * Retorna uma instância configurada do cliente OpenAI.
 */
export function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY || '';
    openaiInstance = new OpenAI({ apiKey });
  }
  return openaiInstance;
}

/**
 * Retorna uma instância configurada do cliente Google GenAI (Gemini).
 */
export function getGeminiClient(): GoogleGenAI {
  if (!geminiInstance) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    geminiInstance = new GoogleGenAI({ apiKey });
  }
  return geminiInstance;
}

/**
 * Retorna uma instância configurada do cliente Anthropic (Claude).
 */
export function getAnthropicClient(): Anthropic {
  if (!anthropicInstance) {
    const apiKey = process.env.ANTHROPIC_API_KEY || '';
    anthropicInstance = new Anthropic({ apiKey });
  }
  return anthropicInstance;
}

export type LLMRouterAgentKey =
  | 'ulisses'
  | 'sdr'
  | 'comercial'
  | 'marketing'
  | 'dados'
  | 'atendimento'
  | 'programacao'
  | 'auditoria'
  | 'juridico'
  | 'pesquisa';

export interface ChatCompletionOptions {
  agentKey: LLMRouterAgentKey;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  useSearch?: boolean; // Habilita busca na web se disponível no modelo
}

export interface ChatCompletionResult {
  success: boolean;
  content: string;
  modelUsed: string;
  error?: string;
}

/**
 * Mapeamento da arquitetura heterogênea Multi-LLM para cada especialidade.
 */
export const AGENT_MODEL_MAPPING: Record<
  LLMRouterAgentKey,
  { provider: 'openai' | 'gemini' | 'anthropic'; model: string }
> = {
  ulisses: { provider: 'openai', model: 'gpt-5.5' }, // Central Orchestrator
  sdr: { provider: 'openai', model: 'gpt-5.5' },
  comercial: { provider: 'openai', model: 'gpt-5.5' },
  marketing: { provider: 'openai', model: 'gpt-5.5' },
  dados: { provider: 'gemini', model: 'gemini-2.5-pro' },
  atendimento: { provider: 'openai', model: 'gpt-5.5-mini' }, // ou gemini-flash
  programacao: { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022' }, // Claude Sonnet 4
  auditoria: { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022' },
  juridico: { provider: 'anthropic', model: 'claude-3-5-opus' }, // Claude Opus 4.x
  pesquisa: { provider: 'gemini', model: 'gemini-2.5-pro' },
};

/**
 * Função de roteamento centralizada que executa chat completion de acordo com o agente.
 */
export async function generateChatCompletion(
  options: ChatCompletionOptions
): Promise<ChatCompletionResult> {
  const mapping = AGENT_MODEL_MAPPING[options.agentKey];
  if (!mapping) {
    return {
      success: false,
      content: '',
      modelUsed: '',
      error: `Agente não mapeado: ${options.agentKey}`,
    };
  }

  const { provider, model } = mapping;

  // Substitutos temporários para modelos futuros não lançados ou indisponíveis localmente (fallbacks)
  let activeModel = model;
  if (model === 'gpt-5.5' && !process.env.USE_GPT5) {
    activeModel = 'gpt-4o'; // Fallback estável atual
  } else if (model === 'gpt-5.5-mini' && !process.env.USE_GPT5) {
    activeModel = 'gpt-4o-mini';
  } else if (model === 'claude-3-5-opus' && !process.env.USE_OPUS4) {
    activeModel = 'claude-3-5-sonnet-20241022'; // Usar Sonnet 3.5 temporariamente
  } else if (model === 'gemini-2.5-pro' && !process.env.USE_GEMINI25) {
    activeModel = 'gemini-1.5-pro';
  }

  try {
    switch (provider) {
      case 'openai': {
        const openai = getOpenAIClient();
        if (!process.env.OPENAI_API_KEY) {
          throw new Error('OPENAI_API_KEY não configurada no ambiente.');
        }

        // Se o modelo suportar busca e for solicitado
        if (options.useSearch && activeModel.startsWith('gpt-4')) {
          // Utiliza a API experimental de responses com search se aplicável
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const response = await (openai as any).responses.create({
              model: activeModel,
              tools: [{ type: 'web_search_preview' }],
              max_output_tokens: options.maxTokens || 4000,
              input: [
                { role: 'system', content: [{ type: 'input_text', text: options.systemPrompt }] },
                { role: 'user', content: [{ type: 'input_text', text: options.userPrompt }] },
              ],
            });
            return {
              success: true,
              content: response.output_text?.trim() || '',
              modelUsed: activeModel,
            };
          } catch (err) {
            console.warn('[LLM Router] Falha ao executar OpenAI com Search. Fazendo fallback sem Search...', err);
          }
        }

        const completion = await openai.chat.completions.create({
          model: activeModel,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens,
          messages: [
            { role: 'system', content: options.systemPrompt },
            { role: 'user', content: options.userPrompt },
          ],
        });

        return {
          success: true,
          content: completion.choices[0]?.message?.content?.trim() || '',
          modelUsed: activeModel,
        };
      }

      case 'gemini': {
        const gemini = getGeminiClient();
        if (!process.env.GEMINI_API_KEY) {
          throw new Error('GEMINI_API_KEY não configurada no ambiente.');
        }

        const response = await gemini.models.generateContent({
          model: activeModel,
          config: {
            temperature: options.temperature ?? 0.7,
            maxOutputTokens: options.maxTokens,
            systemInstruction: options.systemPrompt,
          },
          contents: options.userPrompt,
        });

        return {
          success: true,
          content: response.text?.trim() || '',
          modelUsed: activeModel,
        };
      }

      case 'anthropic': {
        const anthropic = getAnthropicClient();
        if (!process.env.ANTHROPIC_API_KEY) {
          throw new Error('ANTHROPIC_API_KEY não configurada no ambiente.');
        }

        const response = await anthropic.messages.create({
          model: activeModel,
          max_tokens: options.maxTokens || 4000,
          temperature: options.temperature ?? 0.7,
          system: options.systemPrompt,
          messages: [{ role: 'user', content: options.userPrompt }],
        });

        const textContent = response.content
          .filter((c) => c.type === 'text')
          .map((c) => (c as { text: string }).text)
          .join('\n');

        return {
          success: true,
          content: textContent.trim(),
          modelUsed: activeModel,
        };
      }

      default:
        throw new Error(`Provedor desconhecido: ${provider}`);
    }
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error(`[LLM Router] Falha ao processar requisição no agente ${options.agentKey}:`, error);
    return {
      success: false,
      content: '',
      modelUsed: activeModel,
      error: errMessage || 'Erro interno na chamada de IA.',
    };
  }
}
