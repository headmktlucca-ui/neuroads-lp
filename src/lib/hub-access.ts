import type { User } from 'firebase/auth';

export const HUB_PLAN_REQUIRED_REDIRECT = '/onboarding';
export const HUB_ONBOARDING_REDIRECT = HUB_PLAN_REQUIRED_REDIRECT;

export type HubAccessStatus = 'loading' | 'allowed' | 'unauthenticated' | 'unverified' | 'forbidden';
const INITIAL_TRIAL_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// Status que representam uma assinatura efetivamente contratada/paga.
const PAID_STATUSES = ['active', 'past_due', 'unpaid', 'incomplete', 'ativo', 'contratado', 'paid'];
// Status que representam apenas um período de teste (sem contratação confirmada).
const TRIAL_STATUSES = ['trialing', 'trial', 'teste', 'em_teste'];

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

function isValidWhatsapp(value: string | null): boolean {
  if (!value) return false;
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10;
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
  const topWhatsapp = readString(
    profileRecord.whatsapp ??
      profileRecord.phone ??
      profileRecord.phoneNumber ??
      profileRecord.telefone ??
      profileRecord.celular
  );

  if (topCompanyName && isValidSite(topSite) && isValidWhatsapp(topWhatsapp)) {
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
  const onboardingWhatsapp = readString(
    onboardingRecord?.whatsapp ??
      onboardingRecord?.phone ??
      onboardingRecord?.phoneNumber ??
      onboardingRecord?.telefone ??
      onboardingRecord?.celular
  );

  if (onboardingCompany && isValidSite(onboardingSite) && isValidWhatsapp(onboardingWhatsapp)) {
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
  const detailsWhatsapp = readString(
    profileDetailsRecord?.whatsapp ??
      profileDetailsRecord?.phone ??
      profileDetailsRecord?.phoneNumber ??
      profileDetailsRecord?.telefone ??
      profileDetailsRecord?.celular
  );

  if (detailsCompany && isValidSite(detailsSite) && isValidWhatsapp(detailsWhatsapp)) {
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

function hasPlanOrSubscriptionSignal(
  profileRecord: Record<string, unknown>,
  onboardingRecord: Record<string, unknown> | null
): boolean {
  const hasSubscriptionSignal = Boolean(
    readString(profileRecord.stripeSubscriptionId) ?? readString(onboardingRecord?.stripeSubscriptionId)
  );

  return hasSelectedPlan(profileRecord, onboardingRecord) || hasSubscriptionSignal;
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
  return hasPlanOrSubscriptionSignal(profileRecord, onboardingRecord) && (statusIndicatesTrial || !normalizedStatus);
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

  // Fallback operacional: mantém o trial inicial apenas para quem já concluiu
  // o cadastro da empresa, exigindo preenchimento dos dados do onboarding.
  return hasCompletedCompanyRegistration(profileRecord) && hasSelectedPlan(profileRecord, onboardingRecord);
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

  // Assinatura efetivamente contratada/paga: acesso liberado.
  if (PAID_STATUSES.includes(normalizedStatus)) {
    return true;
  }

  // Status de trial ("trialing"/"trial"/"teste"): só concede acesso enquanto o
  // período de teste ainda não expirou. Depois disso, sem contratação, bloqueia.
  if (TRIAL_STATUSES.includes(normalizedStatus)) {
    const trialEndsAt = resolveTrialEndsAt(profileRecord, onboardingRecord);
    return Boolean(trialEndsAt && trialEndsAt > Date.now());
  }

  if (hasActiveTrialPeriod(profileRecord, onboardingRecord)) {
    return true;
  }

  return isWithinInitialTrialWindow(profileRecord, onboardingRecord);
}

export interface HubTrialInfo {
  /** Está em trial ativo (dentro do prazo, sem contratação paga). */
  isTrialing: boolean;
  /** Trial existente porém já expirado (sem contratação). */
  expired: boolean;
  /** Timestamp (ms) do fim do trial, se houver. */
  trialEndsAt: number | null;
  /** Milissegundos restantes (0 se expirado/sem trial). */
  msRemaining: number;
  /** Dias inteiros restantes, arredondados para cima. */
  daysRemaining: number;
  /** Horas restantes, arredondadas para cima (para o último dia). */
  hoursRemaining: number;
}

const EMPTY_TRIAL_INFO: HubTrialInfo = {
  isTrialing: false,
  expired: false,
  trialEndsAt: null,
  msRemaining: 0,
  daysRemaining: 0,
  hoursRemaining: 0,
};

/**
 * Deriva o estado de trial de um profile. Retorna `isTrialing: true` apenas para
 * usuários que estão de fato no período de teste (sem contratação paga) e cujo
 * prazo ainda não expirou — usado para exibir o contador de período restante.
 */
export function getHubTrialInfo(profile: unknown, nowMs: number = Date.now()): HubTrialInfo {
  if (!profile || typeof profile !== 'object') return EMPTY_TRIAL_INFO;

  const profileRecord = profile as Record<string, unknown>;
  const onboardingRecord = readRecord(profileRecord.onboarding);

  // Clientes pagantes nunca estão "em trial".
  const isPaidCustomer =
    profileRecord.isPremium === true ||
    onboardingRecord?.isPremium === true ||
    Boolean(readString(profileRecord.stripeSubscriptionId) ?? readString(onboardingRecord?.stripeSubscriptionId));

  if (isPaidCustomer) return EMPTY_TRIAL_INFO;

  const normalizedStatus = normalizeStatus(
    readString(profileRecord.subscriptionStatus) ??
      readString(profileRecord.stripeSubscriptionStatus) ??
      readString(profileRecord.status) ??
      readString(onboardingRecord?.subscriptionStatus) ??
      readString(onboardingRecord?.stripeSubscriptionStatus) ??
      readString(onboardingRecord?.status)
  );

  if (PAID_STATUSES.includes(normalizedStatus)) return EMPTY_TRIAL_INFO;

  const trialEndsAt = resolveTrialEndsAt(profileRecord, onboardingRecord);
  const hasTrialSignal =
    TRIAL_STATUSES.includes(normalizedStatus) ||
    hasActiveTrialPeriod(profileRecord, onboardingRecord) ||
    isWithinInitialTrialWindow(profileRecord, onboardingRecord);

  if (!hasTrialSignal || !trialEndsAt) return EMPTY_TRIAL_INFO;

  const msRemaining = trialEndsAt - nowMs;
  const expired = msRemaining <= 0;

  return {
    isTrialing: !expired,
    expired,
    trialEndsAt,
    msRemaining: Math.max(0, msRemaining),
    daysRemaining: expired ? 0 : Math.max(1, Math.ceil(msRemaining / DAY_MS)),
    hoursRemaining: expired ? 0 : Math.max(1, Math.ceil(msRemaining / (60 * 60 * 1000))),
  };
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
  if (!user.emailVerified) return 'unverified';
  if (!profile) return 'loading';
  if (!hasHubPlanAccess(profile)) return 'forbidden';
  return 'allowed';
}
