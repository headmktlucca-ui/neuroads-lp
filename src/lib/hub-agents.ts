import { agents, type Agent } from '../data/agents';
import {
  getAgentPricingProfile,
  type AgentPlanName,
  type AgentPlanOption,
  type AgentPricingProfile,
} from '../data/agent-pricing';
import stripeCatalog from '../data/stripe-agent-price-ids.json';

export interface AgentContractStatus {
  isActive: boolean;
  planName?: string;
  monthlyPrice?: number;
  monthlyLimit?: number;
  usageUsed?: number;
  nextPaymentAt?: string;
}

export interface AgentPlanSummary {
  planName: string;
  monthlyPrice: number;
  monthlyLimit: number;
  usageUsed?: number;
  nextPaymentAt?: string;
}

export interface AgentEntryDefinition {
  slug: string;
  title: string;
  category: string;
  isActive: boolean;
  planSummary?: AgentPlanSummary;
}

type StripeCatalogData = {
  agents?: Record<
    string,
    {
      plans?: Record<AgentPlanName, { priceId?: string }>;
    }
  >;
};

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const normalized = value.replace(/[^\d,.-]/g, '').replace(',', '.');
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function isTruthyStatus(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.toLowerCase().trim();
    if (['active', 'ativo', 'contratado', 'paid', 'trialing'].includes(normalized)) return true;
    if (['inactive', 'inativo', 'cancelled', 'canceled'].includes(normalized)) return false;
  }
  return undefined;
}

function buildContractStatus(
  record: Record<string, unknown>,
  fallbackTitle?: string
): { title?: string; status: AgentContractStatus } {
  const explicitStatus =
    isTruthyStatus(record.isActive) ??
    isTruthyStatus(record.active) ??
    isTruthyStatus(record.status);

  const title =
    readString(record.title) ??
    readString(record.name) ??
    readString(record.agentTitle) ??
    readString(record.agent) ??
    fallbackTitle;

  return {
    title,
    status: {
      isActive: explicitStatus ?? true,
      planName: readString(record.planName) ?? readString(record.plan) ?? readString(record.tier),
      monthlyPrice: readNumber(record.monthlyPrice) ?? readNumber(record.price) ?? readNumber(record.value),
      monthlyLimit:
        readNumber(record.monthlyLimit) ?? readNumber(record.limit) ?? readNumber(record.executionsLimit),
      usageUsed:
        readNumber(record.usageUsed) ??
        readNumber(record.used) ??
        readNumber(record.inUse) ??
        readNumber(record.executionsUsed),
      nextPaymentAt:
        readString(record.nextPaymentAt) ??
        readString(record.nextPaymentDate) ??
        readString(record.billingDate),
    },
  };
}

function normalizeContractedAgents(input: unknown): Map<string, AgentContractStatus> {
  const contracts = new Map<string, AgentContractStatus>();

  if (Array.isArray(input)) {
    for (const item of input) {
      if (typeof item === 'string' && item.trim()) {
        contracts.set(item.trim(), { isActive: true });
        continue;
      }

      if (item && typeof item === 'object') {
        const { title, status } = buildContractStatus(item as Record<string, unknown>);
        if (title && status.isActive) {
          contracts.set(title, status);
        }
      }
    }
    return contracts;
  }

  if (input && typeof input === 'object') {
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (typeof value === 'boolean') {
        if (value && key.trim()) {
          contracts.set(key.trim(), { isActive: true });
        }
        continue;
      }

      if (typeof value === 'string' && value.trim()) {
        contracts.set(key.trim(), { isActive: true, planName: value.trim() });
        continue;
      }

      if (value && typeof value === 'object') {
        const { title, status } = buildContractStatus(value as Record<string, unknown>, key.trim());
        if (title && status.isActive) {
          contracts.set(title, status);
        }
      }
    }
  }

  return contracts;
}

export function slugifyAgentTitle(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getAgentBySlug(slug: string): Agent | undefined {
  return agents.find((agent) => slugifyAgentTitle(agent.title) === slug);
}

export function getContractedAgentsFromProfile(profile: unknown): Map<string, AgentContractStatus> {
  if (!profile || typeof profile !== 'object') return new Map<string, AgentContractStatus>();

  const dynamicProfile = profile as Record<string, unknown>;
  const possibleSources: unknown[] = [
    dynamicProfile.activeAgents,
    dynamicProfile.contractedAgents,
    dynamicProfile.hiredAgents,
    dynamicProfile.selectedAgents,
    dynamicProfile.userAgents,
  ];

  for (const source of possibleSources) {
    const normalized = normalizeContractedAgents(source);
    if (normalized.size > 0) {
      return normalized;
    }
  }

  return new Map<string, AgentContractStatus>();
}

export function getAgentContractStatus(
  title: string,
  contracts: Map<string, AgentContractStatus>
): AgentContractStatus {
  return contracts.get(title) ?? { isActive: false };
}

export function getAgentEntryDefinition(
  agent: Agent,
  contracts: Map<string, AgentContractStatus>
): AgentEntryDefinition {
  const status = getAgentContractStatus(agent.title, contracts);
  const pricing = getAgentPricingProfile(agent.title);
  const fallbackPlan = pricing.plans[0];

  const planSummary = status.isActive
    ? {
        planName: status.planName || 'Plano ativo',
        monthlyPrice: status.monthlyPrice ?? fallbackPlan.monthlyPrice,
        monthlyLimit: status.monthlyLimit ?? fallbackPlan.monthlyLimit,
        usageUsed: status.usageUsed,
        nextPaymentAt: status.nextPaymentAt,
      }
    : undefined;

  return {
    slug: slugifyAgentTitle(agent.title),
    title: agent.title,
    category: agent.category,
    isActive: status.isActive,
    planSummary,
  };
}

export function getAgentCheckoutPriceId(
  agentTitle: string,
  planName: AgentPlanName
): string | undefined {
  const catalog = stripeCatalog as StripeCatalogData;
  return catalog.agents?.[agentTitle]?.plans?.[planName]?.priceId;
}

export function getDefaultPlanName(
  contractStatus: AgentContractStatus,
  pricing: AgentPricingProfile
): AgentPlanName {
  const allowed = new Set<AgentPlanName>(['Lite', 'Growth', 'Pro']);
  const fromContract = contractStatus.planName as AgentPlanName | undefined;
  if (fromContract && allowed.has(fromContract)) return fromContract;

  const hasGrowth = pricing.plans.some((plan: AgentPlanOption) => plan.name === 'Growth');
  return hasGrowth ? 'Growth' : pricing.plans[0].name;
}
