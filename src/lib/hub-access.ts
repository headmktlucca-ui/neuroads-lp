import type { User } from 'firebase/auth';

export const HUB_PLAN_REQUIRED_REDIRECT = '/onboarding';
export const HUB_ONBOARDING_REDIRECT = HUB_PLAN_REQUIRED_REDIRECT;

export type HubAccessStatus = 'loading' | 'allowed' | 'unauthenticated' | 'forbidden';

function normalizePathCandidate(value: string | null | undefined): string | null {
  if (!value || !value.startsWith('/')) return null;
  if (value.startsWith('//')) return null;
  return value;
}

export function normalizeHubNextPath(path: string | null | undefined, fallback = '/hub'): string {
  const normalized = normalizePathCandidate(path);
  if (!normalized) return fallback;
  if (normalized.startsWith('/login')) return fallback;
  if (normalized.startsWith('/onboarding')) return fallback;
  return normalized;
}

function readString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function readRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null;
  return value as Record<string, unknown>;
}

function isValidSite(value: string | null): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;

  // Placeholders que não representam um site real.
  if (
    normalized === 'https://' ||
    normalized === 'http://' ||
    normalized === 'https://www.' ||
    normalized === 'http://www.' ||
    normalized === 'www.' ||
    normalized === 'site não cadastrado'
  ) {
    return false;
  }

  // Aceita domínio simples, com ou sem protocolo, desde que tenha ao menos um ponto.
  const withoutProtocol = normalized.replace(/^https?:\/\//, '');
  return withoutProtocol.includes('.');
}

function hasCompletedCompanyRegistration(profileRecord: Record<string, unknown>): boolean {
  const topCompanyName = readString(
    profileRecord.companyName ??
      profileRecord.company ??
      profileRecord.empresa ??
      profileRecord.company_name ??
      profileRecord.businessName ??
      profileRecord.brandName
  );
  const topSite = readString(
    profileRecord.site ??
      profileRecord.website ??
      profileRecord.empresaSite ??
      profileRecord.siteUrl ??
      profileRecord.websiteUrl ??
      profileRecord.domain ??
      profileRecord.url
  );

  if (topCompanyName && isValidSite(topSite)) {
    return true;
  }

  const onboardingRecord = readRecord(profileRecord.onboarding);
  const onboardingCompany = readString(
    onboardingRecord?.companyName ??
      onboardingRecord?.company ??
      onboardingRecord?.empresa ??
      onboardingRecord?.company_name ??
      onboardingRecord?.businessName ??
      onboardingRecord?.brandName
  );
  const onboardingSite = readString(
    onboardingRecord?.site ??
      onboardingRecord?.website ??
      onboardingRecord?.empresaSite ??
      onboardingRecord?.siteUrl ??
      onboardingRecord?.websiteUrl ??
      onboardingRecord?.domain ??
      onboardingRecord?.url
  );

  if (onboardingCompany && isValidSite(onboardingSite)) {
    return true;
  }

  const profileDetailsRecord = readRecord(profileRecord.profileDetails);
  const detailsCompany = readString(
    profileDetailsRecord?.companyName ??
      profileDetailsRecord?.company ??
      profileDetailsRecord?.empresa ??
      profileDetailsRecord?.company_name ??
      profileDetailsRecord?.businessName ??
      profileDetailsRecord?.brandName
  );
  const detailsSite = readString(
    profileDetailsRecord?.site ??
      profileDetailsRecord?.website ??
      profileDetailsRecord?.empresaSite ??
      profileDetailsRecord?.siteUrl ??
      profileDetailsRecord?.websiteUrl ??
      profileDetailsRecord?.domain ??
      profileDetailsRecord?.url
  );

  if (detailsCompany && isValidSite(detailsSite)) {
    return true;
  }

  // Fallback de segurança: onboarding já finalizado no perfil.
  const onboardingCompletedAt = profileRecord.onboardingCompletedAt;
  if (typeof onboardingCompletedAt === 'number' && Number.isFinite(onboardingCompletedAt)) {
    return true;
  }

  return false;
}

export function hasHubRegistration(profile: unknown): boolean {
  if (!profile || typeof profile !== 'object') return false;
  return hasCompletedCompanyRegistration(profile as Record<string, unknown>);
}

function normalizeStatus(value: string | null): string {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function hasActiveHubSubscription(profile: unknown): boolean {
  if (!profile || typeof profile !== 'object') return false;

  const profileRecord = profile as Record<string, unknown>;
  if (profileRecord.isPremium === true) return true;
  if (readString(profileRecord.stripeSubscriptionId)) return true;

  const onboardingRecord = readRecord(profileRecord.onboarding);
  if (onboardingRecord?.isPremium === true) return true;
  if (readString(onboardingRecord?.stripeSubscriptionId)) return true;

  const normalizedStatus = normalizeStatus(
    readString(profileRecord.subscriptionStatus) ??
      readString(profileRecord.stripeSubscriptionStatus) ??
      readString(profileRecord.status) ??
      readString(onboardingRecord?.subscriptionStatus) ??
      readString(onboardingRecord?.stripeSubscriptionStatus) ??
      readString(onboardingRecord?.status)
  );

  return ['trialing', 'active', 'past_due', 'unpaid', 'incomplete', 'ativo'].includes(normalizedStatus);
}

export function hasHubPlanAccess(profile: unknown): boolean {
  // Regra de elegibilidade do Hub:
  // 1) assinatura ativa, e
  // 2) cadastro de empresa/site concluído.
  return hasActiveHubSubscription(profile) && hasHubRegistration(profile);
}

export function getHubLoginRedirect(pathname?: string): string {
  const safePath = normalizeHubNextPath(pathname, '/hub');
  return `/login?next=${encodeURIComponent(safePath)}`;
}

export function getHubOnboardingRedirect(pathname?: string): string {
  const safePath = normalizeHubNextPath(pathname, '/hub');
  return `/onboarding?next=${encodeURIComponent(safePath)}`;
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
