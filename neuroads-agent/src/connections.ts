// src/connections.ts — gestão de contas conectadas por usuário (NeuroAds)
import { composio, NEUROADS_TOOLKITS, type NeuroAdsToolkit } from "./composio.js";

export interface ConnectionStatus {
  toolkit: NeuroAdsToolkit;
  connected: boolean;
  connectionId?: string;
  redirectUrl?: string; // presente quando é preciso autorizar via OAuth
}

/**
 * Lista o status de conexão de um usuário para cada toolkit NeuroAds.
 */
export async function getConnectionStatus(userId: string): Promise<ConnectionStatus[]> {
  const accounts = await composio.connectedAccounts.list({
    userIds: [userId],
  });

  const active = new Map<string, string>();
  for (const acc of accounts.items ?? []) {
    if (acc.status === "ACTIVE") {
      active.set(acc.toolkit.slug.toLowerCase(), acc.id);
    }
  }

  return NEUROADS_TOOLKITS.map((toolkit) => ({
    toolkit,
    connected: active.has(toolkit),
    connectionId: active.get(toolkit),
  }));
}

/**
 * Garante que o usuário tenha todos os toolkits conectados.
 * Para os que faltam, inicia o fluxo OAuth e retorna a redirectUrl
 * — envie essa URL ao usuário (via painel, WhatsApp, e-mail etc.).
 */
export async function ensureConnections(userId: string): Promise<ConnectionStatus[]> {
  const statuses = await getConnectionStatus(userId);

  for (const status of statuses) {
    if (status.connected) continue;

    const request = await composio.connectedAccounts.initiate(userId, status.toolkit);
    status.redirectUrl = request.redirectUrl ?? undefined;
    status.connectionId = request.id;
  }

  return statuses;
}

/**
 * Aguarda o usuário concluir a autorização OAuth (polling gerenciado pelo SDK).
 * Use após enviar a redirectUrl, com timeout configurável.
 */
export async function waitForConnection(connectionId: string, timeoutMs = 120_000) {
  return composio.connectedAccounts.waitForConnection(connectionId, timeoutMs);
}
