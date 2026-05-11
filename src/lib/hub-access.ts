import type { User } from 'firebase/auth';
import { getContractedAgentsFromProfile } from './hub-agents';

export const HUB_PLAN_REQUIRED_REDIRECT = '/?hubAccess=plan-required#pricing';

export type HubAccessStatus = 'loading' | 'allowed' | 'unauthenticated' | 'forbidden';

function readTruthyFlag(value: unknown): boolean {
  if (value === true) return true;
  if (typeof value !== 'string') return false;
  const normalized = value.trim().toLowerCase();
  return ['true', '1', 'yes', 'sim', 'premium', 'ativo', 'active'].includes(normalized);
}

function readSubscriptionStatus(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  return value.trim().toLowerCase();
}

function hasRegisteredProfile(profileRecord: Record<string, unknown>): boolean {
  if (typeof profileRecord.authEmail === 'string' && profileRecord.authEmail.trim()) return true;
  if (typeof profileRecord.email === 'string' && profileRecord.email.trim()) return true;
  if (typeof profileRecord.createdAt === 'number' && Number.isFinite(profileRecord.createdAt)) return true;
  if (profileRecord.usageStats && typeof profileRecord.usageStats === 'object') return true;
  return false;
}

export function hasHubPlanAccess(profile: unknown): boolean {
  if (!profile || typeof profile !== 'object') return false;

  const profileRecord = profile as Record<string, unknown>;

  if (readTruthyFlag(profileRecord.isPremium)) return true;

  if (typeof profileRecord.stripeSubscriptionId === 'string' && profileRecord.stripeSubscriptionId.trim()) {
    return true;
  }

  const subscriptionStatus = readSubscriptionStatus(
    profileRecord.subscriptionStatus ?? profileRecord.stripeSubscriptionStatus ?? profileRecord.status
  );
  if (subscriptionStatus && ['trialing', 'active', 'past_due', 'unpaid', 'incomplete'].includes(subscriptionStatus)) {
    return true;
  }

  const planMarkers = [
    profileRecord.planName,
    profileRecord.currentPlan,
    profileRecord.selectedPlan,
    profileRecord.subscriptionPlan,
    profileRecord.plan,
    profileRecord.tier,
  ];
  if (planMarkers.some((marker) => typeof marker === 'string' && marker.trim())) {
    return true;
  }

  const contractedAgents = getContractedAgentsFromProfile(profile);
  if (Array.from(contractedAgents.values()).some((entry) => entry.isActive)) {
    return true;
  }

  // Re-adicionado o fallback para usuários cadastrados conforme solicitação.
  // Agora usuários autenticados com perfil válido têm acesso ao Hub sem necessidade de plano pago.
  return hasRegisteredProfile(profileRecord);
}

export function getHubLoginRedirect(pathname?: string): string {
  const safePath = pathname && pathname.startsWith('/') ? pathname : '/hub';
  return `/login?next=${encodeURIComponent(safePath)}`;
}

export function resolveHubAccessState({
  loading,
  user,
  profile,
}: {
  loading: boolean;
  user: User | null;
  profile: unknown;
}): HubAccessStatus {
  if (loading) return 'loading';
  if (!user) return 'unauthenticated';
  if (!hasHubPlanAccess(profile)) return 'forbidden';
  return 'allowed';
}
