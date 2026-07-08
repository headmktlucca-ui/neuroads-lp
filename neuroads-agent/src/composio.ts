// src/composio.ts — cliente Composio compartilhado (NeuroAds)
import { Composio } from "@composio/core";
import { VercelProvider } from "@composio/vercel";

if (!process.env.COMPOSIO_API_KEY) {
  throw new Error("COMPOSIO_API_KEY ausente. Configure no .env");
}

export const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  provider: new VercelProvider(),
});

// Toolkits usados pelos agentes NeuroAds
export const NEUROADS_TOOLKITS = ["gmail", "hubspot", "slack"] as const;
export type NeuroAdsToolkit = (typeof NEUROADS_TOOLKITS)[number];
