// src/agent.ts — Agente NeuroAds: Vercel AI SDK + Composio (tool router)
import { anthropic } from "@ai-sdk/anthropic";
import { stepCountIs, streamText } from "ai";
import { composio } from "./composio.js";

const SYSTEM_PROMPT = `Você é um agente operacional da NeuroAds (neuroads.com.br), agência brasileira de marketing digital, vendas, automação e agentes de IA.

Regras:
- Responda sempre em português brasileiro.
- Use as ferramentas conectadas (Gmail, HubSpot, Slack) para executar ações reais, não apenas descrevê-las.
- Antes de enviar e-mails ou mensagens em nome do usuário, confirme destinatário e conteúdo se houver ambiguidade.
- Ao consultar o HubSpot, prefira dados reais do CRM a suposições.
- Relate ao final o que foi executado, com IDs/links quando disponíveis.`;

export interface RunAgentOptions {
  userId: string;
  prompt: string;
  maxSteps?: number;
  onText?: (chunk: string) => void;
}

/**
 * Executa o agente NeuroAds para um usuário com sessão de tool router.
 * O tool router expõe dinamicamente as tools dos toolkits conectados.
 */
export async function runAgent({ userId, prompt, maxSteps = 10, onText }: RunAgentOptions) {
  // Sessão de tool router: descobre e roteia tools conforme a tarefa
  const session = await composio.create(userId);
  const tools = await session.tools();

  const stream = await streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: SYSTEM_PROMPT,
    prompt,
    stopWhen: stepCountIs(maxSteps),
    tools,
  });

  let fullText = "";
  for await (const chunk of stream.textStream) {
    fullText += chunk;
    onText?.(chunk);
  }

  return {
    text: fullText,
    steps: await stream.steps,
    usage: await stream.usage,
  };
}

// Execução direta via CLI: npx tsx --env-file=.env src/agent.ts "seu prompt"
if (import.meta.url === `file://${process.argv[1]}`) {
  const userId = process.env.NEUROADS_USER_ID ?? "claudio-neuroads";
  const prompt = process.argv[2] ?? "Liste meus 3 deals mais recentes no HubSpot.";

  console.log(`🧠 NeuroAds Agent — usuário: ${userId}\n📝 Tarefa: ${prompt}\n`);

  const result = await runAgent({
    userId,
    prompt,
    onText: (chunk) => process.stdout.write(chunk),
  });

  console.log(`\n\n✅ Concluído em ${result.steps.length} step(s).`);
}
