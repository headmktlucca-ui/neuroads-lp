import { getAgentTier, type AgentTier } from './agent-pricing';

export type HubCreditOperation = 'agente' | 'criativo' | 'operacional';

/**
 * Plano único do Hub (mercado BR). Fonte de verdade dos limites do envelope:
 * os limites são verificados ANTES de iniciar uma execução, nunca durante.
 */
export const HUB_PLAN = {
  slug: 'neuroads-hub-unico',
  name: 'NeuroAds Hub — Plano Único',
  monthlyPriceCents: 49700,
  founderMonthlyPriceCents: 29700,
  annualPriceCents: 497000,
  monthlyCredits: 200,
  trialDays: 14,
  limits: {
    activeAutomations: 5,
    adAccounts: 2,
    hubUsers: 3,
    chatMessagesMonthly: 500,
    executionsPerHour: 10,
  },
  /** Fração de consumo que dispara o alerta de uso e a oferta do booster. */
  alertThreshold: 0.8,
  stripe: {
    productId: 'prod_UqUjULDXhGN7cE',
    priceIdMonthly: 'price_1TqnkLHwQDlUrIjsXgn3lg7t',
    priceIdFounderMonthly: 'price_1TqnkOHwQDlUrIjsZ2jXikei',
    priceIdAnnual: 'price_1TqnkYHwQDlUrIjsH5CXsYjI',
    lookupKeyMonthly: 'neuroads_hub-unico_monthly_v1',
    lookupKeyFounderMonthly: 'neuroads_hub-unico_founder_monthly_v1',
    lookupKeyAnnual: 'neuroads_hub-unico_annual_v1',
  },
} as const;

export const HUB_BOOSTER = {
  slug: 'booster-50',
  name: 'Booster +50 Créditos',
  priceCents: 9700,
  credits: 50,
  stripe: {
    productId: 'prod_UqUkud6Zc2Dr7x',
    priceId: 'price_1TqnklHwQDlUrIjs9VDrInNb',
    lookupKey: 'neuroads_booster-50_onetime_v1',
  },
} as const;

const CREDIT_COST_BY_TIER: Record<AgentTier, number> = {
  Simples: 1,
  Intermediário: 2,
  Avançado: 3,
};

const CREDIT_COST_BY_OPERATION: Record<Exclude<HubCreditOperation, 'agente'>, number> = {
  criativo: 2,
  operacional: 3,
};

export function getAgentCreditCost(agentTitle: string): number {
  return CREDIT_COST_BY_TIER[getAgentTier(agentTitle)];
}

export function getOperationCreditCost(operation: HubCreditOperation, agentTitle?: string): number {
  if (operation === 'agente') {
    return agentTitle ? getAgentCreditCost(agentTitle) : CREDIT_COST_BY_TIER.Intermediário;
  }
  return CREDIT_COST_BY_OPERATION[operation];
}
