import type { User } from 'firebase/auth';

export const HUB_PLAN_REQUIRED_REDIRECT = '/onboarding';
export const HUB_ONBOARDING_REDIRECT = HUB_PLAN_REQUIRED_REDIRECT;

export type HubAccessStatus = 'loading' | 'allowed' | 'unauthenticated' | 'forbidden';
const INITIAL_TRIAL_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

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

function readTimestamp(value: unknown): number | null {
  if (!value) return null;

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value > 1_000_000_000_000 ? value : value * 1000;
  }

  if (typeof value === 'string') {
    const normalized = value.trim();
    if (!normalized) return null;

    const parsedNumber = Number(normalized);
    if (Number.isFinite(parsedNumber)) {
      return parsedNumber > 1_000_000_000_000 ? parsedNumber : parsedNumber * 1000;
    }

    const parsedDate = Date.parse(normalized);
    return Number.isFinite(parsedDate) ? parsedDate : null;
  }

  if (typeof value === 'object') {
    const maybeTimestamp = value as { toMillis?: () => number };
    if (typeof maybeTimestamp.toMillis === 'function') {
      const millis = maybeTimestamp.toMillis();
      return Number.isFinite(millis) ? millis : null;
    }
  }

  return null;
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
    .replace(/[\s-]+/g, '_')
    .toLowerCase()
    .trim();
}

function hasSelectedPlan(profileRecord: Record<string, unknown>, onboardingRecord: Record<string, unknown> | null): boolean {
  const profileDetails = readRecord(profileRecord.profileDetails);

  const topLevelPlan =
    readString(profileRecord.selectedPlanSlug) ??
    readString(profileRecord.planSlug) ??
    readString(profileRecord.selectedPlan) ??
    readString(profileRecord.planName) ??
    readString(profileRecord.currentPlan) ??
    readString(profileRecord.plan) ??
    readString(profileRecord.tier) ??
    readString(profileDetails?.selectedPlanSlug) ??
    readString(profileDetails?.planSlug) ??
    readString(profileDetails?.selectedPlan) ??
    readString(profileDetails?.planName) ??
    readString(profileDetails?.currentPlan) ??
    readString(profileDetails?.plan) ??
    readString(profileDetails?.tier);

  if (topLevelPlan) return true;

  const onboardingPlan =
    readString(onboardingRecord?.selectedPlanSlug) ??
    readString(onboardingRecord?.planSlug) ??
    readString(onboardingRecord?.selectedPlan) ??
    readString(onboardingRecord?.planName) ??
    readString(onboardingRecord?.currentPlan) ??
    readString(onboardingRecord?.plan) ??
    readString(onboardingRecord?.tier);

  return Boolean(onboardingPlan);
}

function resolveTrialEndsAt(
  profileRecord: Record<string, unknown>,
  onboardingRecord: Record<string, unknown> | null
): number | null {
  const candidates: unknown[] = [
    profileRecord.trialEndsAt,
    profileRecord.trialEndAt,
    profileRecord.trialEnd,
    profileRecord.trial_end,
    profileRecord.currentPeriodEnd,
    profileRecord.current_period_end,
    onboardingRecord?.trialEndsAt,
    onboardingRecord?.trialEndAt,
    onboardingRecord?.trialEnd,
    onboardingRecord?.trial_end,
    onboardingRecord?.currentPeriodEnd,
    onboardingRecord?.current_period_end,
  ];

  for (const candidate of candidates) {
    const parsed = readTimestamp(candidate);
    if (parsed && Number.isFinite(parsed)) {
      return parsed;
    }
  }

  const onboardingCompletedAt = readTimestamp(profileRecord.onboardingCompletedAt);
  if (onboardingCompletedAt) {
    return onboardingCompletedAt + 14 * 24 * 60 * 60 * 1000;
  }

  const onboardingRecordCompletedAt =
    readTimestamp(onboardingRecord?.onboardingCompletedAt) ?? readTimestamp(onboardingRecord?.completedAt);
  if (onboardingRecordCompletedAt) {
    return onboardingRecordCompletedAt + 14 * 24 * 60 * 60 * 1000;
  }

  const registeredAt = readTimestamp(profileRecord.registeredAt);
  if (registeredAt) {
    return registeredAt + 14 * 24 * 60 * 60 * 1000;
  }

  const createdAt = readTimestamp(profileRecord.createdAt);
  if (createdAt) {
    return createdAt + 14 * 24 * 60 * 60 * 1000;
  }

  return null;
}

function hasActiveTrialPeriod(profileRecord: Record<string, unknown>, onboardingRecord: Record<string, unknown> | null): boolean {
  const trialEndsAt = resolveTrialEndsAt(profileRecord, onboardingRecord);
  if (!trialEndsAt || trialEndsAt <= Date.now()) return false;

  const normalizedStatus = normalizeStatus(
    readString(profileRecord.subscriptionStatus) ??
      readString(profileRecord.stripeSubscriptionStatus) ??
      readString(profileRecord.status) ??
      readString(onboardingRecord?.subscriptionStatus) ??
      readString(onboardingRecord?.stripeSubscriptionStatus) ??
      readString(onboardingRecord?.status)
  );

  const statusIndicatesTrial = normalizedStatus.includes('trial') || normalizedStatus === 'teste' || normalizedStatus === 'em_teste';
  const hasSubscriptionSignal = Boolean(
    readString(profileRecord.stripeSubscriptionId) ?? readString(onboardingRecord?.stripeSubscriptionId)
  );

  return (hasSelectedPlan(profileRecord, onboardingRecord) || hasSubscriptionSignal) && (statusIndicatesTrial || !normalizedStatus);
}

function isWithinInitialTrialWindow(
  profileRecord: Record<string, unknown>,
  onboardingRecord: Record<string, unknown> | null
): boolean {
  const now = Date.now();
  const registeredAt =
    readTimestamp(profileRecord.onboardingCompletedAt) ??
    readTimestamp(onboardingRecord?.onboardingCompletedAt) ??
    readTimestamp(onboardingRecord?.completedAt) ??
    readTimestamp(profileRecord.registeredAt) ??
    readTimestamp(profileRecord.createdAt) ??
    readTimestamp(onboardingRecord?.registeredAt) ??
    readTimestamp(onboardingRecord?.createdAt);

  if (!registeredAt) return false;
  if (registeredAt > now) return false;
  if (now - registeredAt > INITIAL_TRIAL_WINDOW_MS) return false;

  const normalizedStatus = normalizeStatus(
    readString(profileRecord.subscriptionStatus) ??
      readString(profileRecord.stripeSubscriptionStatus) ??
      readString(profileRecord.status) ??
      readString(onboardingRecord?.subscriptionStatus) ??
      readString(onboardingRecord?.stripeSubscriptionStatus) ??
      readString(onboardingRecord?.status)
  );

  if (['canceled', 'cancelled', 'incomplete_expired', 'expired', 'unpaid'].includes(normalizedStatus)) {
    return false;
  }

  // Fallback operacional: durante os primeiros 14 dias, não bloquear usuários com
  // cadastro completo por ausência de sinalização premium já sincronizada.
  return hasCompletedCompanyRegistration(profileRecord);
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

  if (['trialing', 'trial', 'active', 'past_due', 'unpaid', 'incomplete', 'ativo', 'contratado', 'paid'].includes(normalizedStatus)) {
    return true;
  }

  if (hasActiveTrialPeriod(profileRecord, onboardingRecord)) {
    return true;
  }

  return isWithinInitialTrialWindow(profileRecord, onboardingRecord);
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
