import stripeOffersCatalog from '../data/stripe-offers.json';
import { hasActiveHubSubscription } from './hub-access';

type PlanLimits = {
  agents: number;
  includedExecutions: number;
};

type PlanOffer = {
  slug: string;
  name: string;
  amount: number;
  limits: PlanLimits;
};

type HubProfileSummary = {
  companyName: string;
  site: string;
  hasCompanyProfile: boolean;
  isSubscriptionActive: boolean;
  isTrialing: boolean;
  trialEndsAt: number | null;
  trialRemainingMs: number | null;
  statusLabel: string;
  accessLabel: string;
  resourcesLabel: string;
  operationLabel: string;
  planName: string | null;
  planSlug: string | null;
  planAmountCents: number | null;
  agentLimit: number | null;
  includedExecutions: number | null;
};

function readRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null;
  return value as Record<string, unknown>;
}

function readString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function readNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const parsed = Number(value.replace(/[^\d,.-]/g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
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
    const maybeWithToMillis = value as { toMillis?: () => number };
    if (typeof maybeWithToMillis.toMillis === 'function') {
      const millis = maybeWithToMillis.toMillis();
      return Number.isFinite(millis) ? millis : null;
    }
  }

  return null;
}

function normalizeToken(value: string | null): string {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function isSubscriptionActive(profileRecord: Record<string, unknown>): boolean {
  return hasActiveHubSubscription(profileRecord);
}

function resolveSubscriptionStatus(
  profileRecord: Record<string, unknown>,
  onboarding: Record<string, unknown> | null
): string | null {
  const status = normalizeToken(
    readString(profileRecord.subscriptionStatus) ??
      readString(profileRecord.stripeSubscriptionStatus) ??
      readString(profileRecord.status) ??
      readString(onboarding?.subscriptionStatus) ??
      readString(onboarding?.stripeSubscriptionStatus) ??
      readString(onboarding?.status)
  );
  return status || null;
}

function resolveTrialEndsAt(
  profileRecord: Record<string, unknown>,
  onboarding: Record<string, unknown> | null
): number | null {
  const candidates: unknown[] = [
    profileRecord.trialEndsAt,
    profileRecord.trialEndAt,
    profileRecord.trialEnd,
    profileRecord.trial_end,
    profileRecord.currentPeriodEnd,
    profileRecord.current_period_end,
    onboarding?.trialEndsAt,
    onboarding?.trialEndAt,
    onboarding?.trialEnd,
    onboarding?.trial_end,
    onboarding?.currentPeriodEnd,
    onboarding?.current_period_end,
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

  return null;
}

function resolveCompanyName(
  profileRecord: Record<string, unknown>,
  onboarding: Record<string, unknown> | null,
  profileDetails: Record<string, unknown> | null
): string {
  return (
    readString(profileRecord.companyName) ??
    readString(profileRecord.company) ??
    readString(profileRecord.empresa) ??
    readString(profileRecord.company_name) ??
    readString(profileRecord.businessName) ??
    readString(profileRecord.brandName) ??
    readString(onboarding?.companyName) ??
    readString(onboarding?.company) ??
    readString(onboarding?.empresa) ??
    readString(onboarding?.company_name) ??
    readString(onboarding?.businessName) ??
    readString(onboarding?.brandName) ??
    readString(profileDetails?.companyName) ??
    readString(profileDetails?.company) ??
    readString(profileDetails?.empresa) ??
    readString(profileDetails?.company_name) ??
    readString(profileDetails?.businessName) ??
    readString(profileDetails?.brandName) ??
    'Empresa não cadastrada'
  );
}

function resolveSite(
  profileRecord: Record<string, unknown>,
  onboarding: Record<string, unknown> | null,
  profileDetails: Record<string, unknown> | null
): string {
  const raw =
    readString(profileRecord.site) ??
    readString(profileRecord.website) ??
    readString(profileRecord.empresaSite) ??
    readString(profileRecord.siteUrl) ??
    readString(profileRecord.websiteUrl) ??
    readString(profileRecord.domain) ??
    readString(profileRecord.url) ??
    readString(onboarding?.site) ??
    readString(onboarding?.website) ??
    readString(onboarding?.empresaSite) ??
    readString(onboarding?.siteUrl) ??
    readString(onboarding?.websiteUrl) ??
    readString(onboarding?.domain) ??
    readString(onboarding?.url) ??
    readString(profileDetails?.site) ??
    readString(profileDetails?.website) ??
    readString(profileDetails?.empresaSite) ??
    readString(profileDetails?.siteUrl) ??
    readString(profileDetails?.websiteUrl) ??
    readString(profileDetails?.domain) ??
    readString(profileDetails?.url);
  if (!raw || raw === 'https://') return 'Site não cadastrado';
  return raw.replace(/^https?:\/\//i, '');
}

function matchPlanOffer(
  profileRecord: Record<string, unknown>,
  onboarding: Record<string, unknown> | null,
  profileDetails: Record<string, unknown> | null
): PlanOffer | null {
  const offers = ((stripeOffersCatalog as { plans?: PlanOffer[] }).plans ?? []) as PlanOffer[];
  if (offers.length === 0) return null;

  const slugCandidates = [
    readString(profileRecord.selectedPlanSlug),
    readString(profileRecord.planSlug),
    readString(profileRecord.subscriptionPlanSlug),
    readString(onboarding?.planSlug),
    readString(profileDetails?.planSlug),
  ]
    .map((value) => normalizeToken(value))
    .filter(Boolean);

  for (const slug of slugCandidates) {
    const bySlug = offers.find((offer) => normalizeToken(offer.slug) === slug);
    if (bySlug) return bySlug;
  }

  const nameCandidates = [
    readString(profileRecord.selectedPlan),
    readString(profileRecord.planName),
    readString(profileRecord.currentPlan),
    readString(profileRecord.subscriptionPlan),
    readString(profileRecord.plan),
    readString(profileRecord.tier),
    readString(onboarding?.planName),
    readString(profileDetails?.planName),
    readString(profileDetails?.plan),
    readString(profileDetails?.tier),
  ]
    .map((value) => normalizeToken(value))
    .filter(Boolean);

  for (const nameCandidate of nameCandidates) {
    const byName = offers.find((offer) => normalizeToken(offer.name) === nameCandidate);
    if (byName) return byName;

    if (nameCandidate.includes('starter') || nameCandidate.includes('5 agentes') || nameCandidate === 'lite') {
      const match = offers.find((offer) => normalizeToken(offer.slug) === 'starter-5');
      if (match) return match;
    }
    if (nameCandidate.includes('growth') || nameCandidate.includes('10 agentes')) {
      const match = offers.find((offer) => normalizeToken(offer.slug) === 'growth-10');
      if (match) return match;
    }
    if (nameCandidate.includes('scale') || nameCandidate.includes('15 agentes') || nameCandidate.includes('pro scale')) {
      const match = offers.find((offer) => normalizeToken(offer.slug) === 'scale-15');
      if (match) return match;
    }
    if (nameCandidate.includes('performance') || nameCandidate.includes('20 agentes') || nameCandidate.includes('enterprise')) {
      const match = offers.find((offer) => normalizeToken(offer.slug) === 'performance-20');
      if (match) return match;
    }
  }

  const profileAmount =
    readNumber(profileRecord.planAmountCents) ??
    readNumber(profileRecord.planAmount) ??
    readNumber(onboarding?.planAmountCents) ??
    readNumber(onboarding?.planAmount) ??
    readNumber(profileDetails?.planAmountCents) ??
    readNumber(profileDetails?.planAmount);
  if (profileAmount != null) {
    const byAmount = offers.find((offer) => offer.amount === profileAmount);
    if (byAmount) return byAmount;
  }

  return null;
}

export function getHubProfileSummary(profile: unknown): HubProfileSummary {
  const profileRecord = readRecord(profile) ?? {};
  const onboarding = readRecord(profileRecord.onboarding);
  const profileDetails = readRecord(profileRecord.profileDetails);

  const companyName = resolveCompanyName(profileRecord, onboarding, profileDetails);
  const site = resolveSite(profileRecord, onboarding, profileDetails);
  const hasCompanyProfile = companyName !== 'Empresa não cadastrada' && site !== 'Site não cadastrado';
  const subscriptionActive = isSubscriptionActive(profileRecord);
  const subscriptionStatus = resolveSubscriptionStatus(profileRecord, onboarding);
  const isTrialing = subscriptionStatus === 'trialing';
  const trialEndsAt = isTrialing ? resolveTrialEndsAt(profileRecord, onboarding) : null;
  const trialRemainingMs = trialEndsAt != null ? Math.max(trialEndsAt - Date.now(), 0) : null;
  const planOffer = matchPlanOffer(profileRecord, onboarding, profileDetails);

  const resourcesLabel = planOffer?.name ?? (subscriptionActive ? 'Plano ativo' : 'Aguardando contratação');
  const operationLabel = planOffer
    ? `${planOffer.limits.agents} agentes • ${planOffer.limits.includedExecutions.toLocaleString('pt-BR')} exec./mês`
    : 'Em tempo real';

  return {
    companyName,
    site,
    hasCompanyProfile,
    isSubscriptionActive: subscriptionActive,
    isTrialing,
    trialEndsAt,
    trialRemainingMs,
    statusLabel: subscriptionActive ? 'Ativo' : 'Pendente',
    accessLabel: hasCompanyProfile ? 'Hub Aberto' : 'Configuração pendente',
    resourcesLabel,
    operationLabel,
    planName: planOffer?.name ?? null,
    planSlug: planOffer?.slug ?? null,
    planAmountCents: planOffer?.amount ?? null,
    agentLimit: planOffer?.limits.agents ?? null,
    includedExecutions: planOffer?.limits.includedExecutions ?? null,
  };
}
