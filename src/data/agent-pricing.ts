export type AgentTier = 'Simples' | 'Intermediário' | 'Avançado';
export type AgentPlanName = 'Lite' | 'Growth' | 'Pro';

export interface AgentPlanOption {
  name: AgentPlanName;
  monthlyPrice: number;
  monthlyLimit: number;
}

export interface AgentPricingProfile {
  tier: AgentTier;
  plans: AgentPlanOption[];
  startingPrice: number;
}

const PLAN_LIMITS: Record<AgentPlanName, number> = {
  Lite: 8,
  Growth: 20,
  Pro: 40
};

const PRICE_BY_TIER: Record<AgentTier, Record<AgentPlanName, number>> = {
  Simples: { Lite: 29.9, Growth: 39.9, Pro: 49.9 },
  Intermediário: { Lite: 39.9, Growth: 59.9, Pro: 79.9 },
  Avançado: { Lite: 49.9, Growth: 69.9, Pro: 89.9 }
};

const SIMPLES_AGENTS = new Set([
  'DNA da Marca',
  'Analisador de Público',
  'Análise de Concorrentes',
  'Público-Alvo Ideal',
  'Avaliador de Oferta'
]);

const AVANCADO_AGENTS = new Set([
  'Analista de Tráfego',
  'Rastreador Cirúrgico',
  'Preditor de Funil',
  'Diagnóstico de Funil',
  'Gerador de Testes A/B'
]);

export function getAgentTier(title: string): AgentTier {
  if (SIMPLES_AGENTS.has(title)) return 'Simples';
  if (AVANCADO_AGENTS.has(title)) return 'Avançado';
  return 'Intermediário';
}

export function getAgentPricingProfile(title: string): AgentPricingProfile {
  const tier = getAgentTier(title);
  const prices = PRICE_BY_TIER[tier];

  const plans: AgentPlanOption[] = (['Lite', 'Growth', 'Pro'] as AgentPlanName[]).map((name) => ({
    name,
    monthlyPrice: prices[name],
    monthlyLimit: PLAN_LIMITS[name]
  }));

  return {
    tier,
    plans,
    startingPrice: plans[0].monthlyPrice
  };
}

export function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
