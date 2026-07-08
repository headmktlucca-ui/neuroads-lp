# NeuroAds Agent — Composio + Vercel AI SDK + Claude

Agente operacional da NeuroAds com acesso real a **Gmail, HubSpot e Slack** via Composio (tool router), orquestrado pelo Claude através do Vercel AI SDK.

## Setup

```bash
npm install
cp .env.example .env   # preencha COMPOSIO_API_KEY e ANTHROPIC_API_KEY
```

## 1. Conectar contas (uma vez por usuário)

```bash
npm run connect                    # usa NEUROADS_USER_ID do .env
npm run connect -- cliente-xyz     # ou um userId específico
```

O script verifica o que já está conectado, gera as URLs de autorização OAuth para o que falta e aguarda a confirmação. Em produção, envie a `redirectUrl` ao usuário pelo painel/WhatsApp/e-mail.

## 2. Executar o agente

```bash
npm run agent -- "Liste meus 3 deals mais recentes no HubSpot"
npm run agent -- "Envie um resumo do pipeline para o canal #vendas no Slack"
npm run agent -- "Responda o último e-mail do cliente X confirmando a reunião"
```

## Uso programático (ex.: rota Next.js ou workflow n8n via webhook)

```typescript
import { runAgent } from "./src/agent.js";

const result = await runAgent({
  userId: "cliente-xyz",
  prompt: "Crie um contato no HubSpot para joao@empresa.com.br",
  maxSteps: 10,
});
console.log(result.text);
```

## Arquitetura

| Arquivo | Responsabilidade |
|---|---|
| `src/composio.ts` | Cliente Composio + toolkits NeuroAds |
| `src/connections.ts` | Status, OAuth e espera de conexão por usuário |
| `src/agent.ts` | Tool router session + Claude (streamText, multi-step) |
| `src/connect.ts` | CLI de onboarding de contas |

- **Multi-tenant por design:** cada `userId` (cliente da agência) tem suas próprias contas conectadas e sessão de tools isolada.
- **Tool router:** o Composio expõe dinamicamente as tools certas para a tarefa — sem registrar dezenas de tools manualmente.
- **Segurança:** keys apenas via `.env` (nunca commitadas); rotacione keys expostas.
