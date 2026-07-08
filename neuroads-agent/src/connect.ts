// src/connect.ts — CLI para conectar contas (Gmail, HubSpot, Slack)
// Uso: npx tsx --env-file=.env src/connect.ts [userId]
import { ensureConnections, waitForConnection } from "./connections.js";

const userId = process.argv[2] ?? process.env.NEUROADS_USER_ID ?? "claudio-neuroads";

console.log(`🔗 Verificando conexões do usuário: ${userId}\n`);

const statuses = await ensureConnections(userId);

const pending = statuses.filter((s) => !s.connected && s.redirectUrl);

for (const s of statuses) {
  if (s.connected) {
    console.log(`✅ ${s.toolkit} — conectado (${s.connectionId})`);
  } else if (s.redirectUrl) {
    console.log(`⏳ ${s.toolkit} — autorize em:\n   ${s.redirectUrl}`);
  } else {
    console.log(`❌ ${s.toolkit} — falha ao iniciar conexão`);
  }
}

if (pending.length > 0) {
  console.log(`\nAguardando autorização de ${pending.length} conta(s)... (timeout 2 min cada)`);
  for (const s of pending) {
    try {
      await waitForConnection(s.connectionId!);
      console.log(`✅ ${s.toolkit} — autorizado!`);
    } catch {
      console.log(`⚠️ ${s.toolkit} — não autorizado dentro do timeout. Rode novamente após autorizar.`);
    }
  }
}

console.log("\nPronto. Execute o agente com:\n  npx tsx --env-file=.env src/agent.ts \"sua tarefa\"");
