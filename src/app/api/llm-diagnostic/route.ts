import { NextResponse } from 'next/server';

// ──────────────────────────────────────────────────────────────────
//  /api/llm-diagnostic  — Teste Live de cada provedor LLM
//  Testa 1 agente por LLM com chamada real à API
// ──────────────────────────────────────────────────────────────────

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface TestResult {
  agentKey: string;
  provider: 'openai' | 'gemini' | 'anthropic';
  model: string;
  status: 'ok' | 'error' | 'missing_key';
  responsePreview?: string;
  error?: string;
  latencyMs: number;
  keyPresent: boolean;
}

const PING_PROMPT = 'Responda exatamente: "NEUROADS_OK"';

async function testOpenAI(): Promise<TestResult> {
  const start = Date.now();
  const apiKey = process.env.OPENAI_API_KEY || '';
  if (!apiKey) {
    return {
      agentKey: 'marketing',
      provider: 'openai',
      model: 'gpt-4o',
      status: 'missing_key',
      error: 'OPENAI_API_KEY não configurada no .env.local',
      latencyMs: 0,
      keyPresent: false,
    };
  }
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 20,
        temperature: 0,
        messages: [
          { role: 'system', content: 'Você é um agente de teste.' },
          { role: 'user', content: PING_PROMPT },
        ],
      }),
    });

    const latencyMs = Date.now() - start;
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return {
        agentKey: 'marketing',
        provider: 'openai',
        model: 'gpt-4o',
        status: 'error',
        error: `HTTP ${res.status}: ${JSON.stringify(errBody?.error || errBody)}`,
        latencyMs,
        keyPresent: true,
      };
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content?.trim() || '';
    return {
      agentKey: 'marketing',
      provider: 'openai',
      model: 'gpt-4o',
      status: 'ok',
      responsePreview: content.slice(0, 80),
      latencyMs,
      keyPresent: true,
    };
  } catch (err: unknown) {
    return {
      agentKey: 'marketing',
      provider: 'openai',
      model: 'gpt-4o',
      status: 'error',
      error: err instanceof Error ? err.message : String(err),
      latencyMs: Date.now() - start,
      keyPresent: true,
    };
  }
}

async function testGemini(): Promise<TestResult> {
  const start = Date.now();
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    return {
      agentKey: 'dados',
      provider: 'gemini',
      model: 'gemini-1.5-pro',
      status: 'missing_key',
      error: 'GEMINI_API_KEY não configurada no .env.local',
      latencyMs: 0,
      keyPresent: false,
    };
  }
  try {
    const model = 'gemini-1.5-pro';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: PING_PROMPT }] }],
        generationConfig: { maxOutputTokens: 20, temperature: 0 },
      }),
    });

    const latencyMs = Date.now() - start;
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return {
        agentKey: 'dados',
        provider: 'gemini',
        model,
        status: 'error',
        error: `HTTP ${res.status}: ${JSON.stringify(errBody?.error || errBody)}`,
        latencyMs,
        keyPresent: true,
      };
    }

    const data = await res.json();
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    return {
      agentKey: 'dados',
      provider: 'gemini',
      model,
      status: 'ok',
      responsePreview: content.slice(0, 80),
      latencyMs,
      keyPresent: true,
    };
  } catch (err: unknown) {
    return {
      agentKey: 'dados',
      provider: 'gemini',
      model: 'gemini-1.5-pro',
      status: 'error',
      error: err instanceof Error ? err.message : String(err),
      latencyMs: Date.now() - start,
      keyPresent: true,
    };
  }
}

async function testAnthropic(): Promise<TestResult> {
  const start = Date.now();
  const apiKey = process.env.ANTHROPIC_API_KEY || '';
  if (!apiKey) {
    return {
      agentKey: 'programacao',
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      status: 'missing_key',
      error: 'ANTHROPIC_API_KEY não configurada no .env.local — Crie em: https://console.anthropic.com/settings/keys',
      latencyMs: 0,
      keyPresent: false,
    };
  }
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 20,
        temperature: 0,
        system: 'Você é um agente de teste.',
        messages: [{ role: 'user', content: PING_PROMPT }],
      }),
    });

    const latencyMs = Date.now() - start;
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      return {
        agentKey: 'programacao',
        provider: 'anthropic',
        model: 'claude-3-5-sonnet-20241022',
        status: 'error',
        error: `HTTP ${res.status}: ${JSON.stringify(errBody?.error || errBody)}`,
        latencyMs,
        keyPresent: true,
      };
    }

    const data = await res.json();
    const content = data?.content?.[0]?.text?.trim() || '';
    return {
      agentKey: 'programacao',
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      status: 'ok',
      responsePreview: content.slice(0, 80),
      latencyMs,
      keyPresent: true,
    };
  } catch (err: unknown) {
    return {
      agentKey: 'programacao',
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      status: 'error',
      error: err instanceof Error ? err.message : String(err),
      latencyMs: Date.now() - start,
      keyPresent: true,
    };
  }
}

export async function GET(): Promise<NextResponse> {
  const [openaiResult, geminiResult, anthropicResult] = await Promise.all([
    testOpenAI(),
    testGemini(),
    testAnthropic(),
  ]);

  const results: TestResult[] = [openaiResult, geminiResult, anthropicResult];
  const allOk = results.every((r) => r.status === 'ok');
  const missingKeys = results.filter((r) => r.status === 'missing_key');
  const errors = results.filter((r) => r.status === 'error');

  const summary = {
    testedAt: new Date().toISOString(),
    overallStatus: allOk ? 'ALL_PROVIDERS_OK' : missingKeys.length > 0 ? 'MISSING_API_KEYS' : 'PROVIDER_ERRORS',
    passed: results.filter((r) => r.status === 'ok').length,
    failed: results.filter((r) => r.status !== 'ok').length,
    results,
    actionRequired: [
      ...missingKeys.map((r) => `❌ [${r.provider.toUpperCase()}] ${r.error}`),
      ...errors.map((r) => `⚠️ [${r.provider.toUpperCase()}] ${r.error}`),
    ],
    agentMapping: {
      openai: ['ulisses', 'sdr', 'comercial', 'marketing', 'atendimento'],
      gemini: ['dados', 'pesquisa'],
      anthropic: ['programacao', 'auditoria', 'juridico'],
    },
  };

  return NextResponse.json(summary, { status: allOk ? 200 : 207 });
}
