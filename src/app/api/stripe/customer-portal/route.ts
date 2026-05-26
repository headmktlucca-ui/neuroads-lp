import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAuth } from 'firebase-admin/auth';
import { getAdminDb } from '../../../../lib/firebase-admin';

function getStripeClient() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY não configurada.');
  }
  return new Stripe(stripeSecretKey, {
    apiVersion: '2022-11-15' as never,
  });
}

function extractBearerToken(value: string | null): string | null {
  if (!value) return null;
  const [scheme, token] = value.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

function readString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object') return null;
  return value as Record<string, unknown>;
}

function canManageInPortal(status: Stripe.Subscription.Status): boolean {
  return ['trialing', 'active', 'past_due', 'unpaid', 'incomplete'].includes(status);
}

function buildFallbackReturnUrl(): string {
  const appUrl = readString(process.env.NEXT_PUBLIC_APP_URL).replace(/\/+$/g, '');
  if (appUrl) {
    return `${appUrl}/hub?financeiro=1`;
  }
  return 'https://neuroads.com.br/hub?financeiro=1';
}

function sanitizeReturnUrl(value: unknown): string {
  const rawValue = readString(value);
  const fallbackUrl = buildFallbackReturnUrl();
  if (!rawValue) return fallbackUrl;

  try {
    const parsed = new URL(rawValue);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return fallbackUrl;
    }
    return parsed.toString();
  } catch {
    return fallbackUrl;
  }
}

async function resolveCustomerId({
  stripe,
  directCustomerId,
  email,
}: {
  stripe: Stripe;
  directCustomerId: string;
  email: string;
}): Promise<string | null> {
  if (directCustomerId) {
    return directCustomerId;
  }

  if (!email) return null;

  const customers = await stripe.customers.list({ email, limit: 10 });
  if (customers.data.length === 0) {
    return null;
  }

  for (const customer of customers.data) {
    if (typeof customer.id !== 'string') continue;
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 20,
    });
    if (subscriptions.data.some((subscription) => canManageInPortal(subscription.status))) {
      return customer.id;
    }
  }

  return customers.data[0]?.id ?? null;
}

export async function POST(req: Request) {
  try {
    const token = extractBearerToken(req.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Token ausente.' }, { status: 401 });
    }

    getAdminDb();
    const decoded = await getAuth().verifyIdToken(token);

    const db = getAdminDb();
    const userRef = db.collection('users').doc(decoded.uid);
    const userSnapshot = await userRef.get();
    const userProfile = userSnapshot.exists ? userSnapshot.data() : {};
    const profileRecord = readRecord(userProfile);
    const onboardingRecord = readRecord(profileRecord?.onboarding);

    const body = (await req.json().catch(() => ({}))) as { returnUrl?: unknown };
    const returnUrl = sanitizeReturnUrl(body.returnUrl);
    const directCustomerId = readString(profileRecord?.stripeCustomerId ?? onboardingRecord?.stripeCustomerId);
    const email = readString(decoded.email ?? profileRecord?.authEmail ?? profileRecord?.email);

    const stripe = getStripeClient();
    const customerId = await resolveCustomerId({
      stripe,
      directCustomerId,
      email,
    });

    if (!customerId) {
      return NextResponse.json(
        { error: 'Não encontramos um cliente Stripe vinculado ao seu cadastro.' },
        { status: 404 }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Falha ao abrir o portal de cobrança.';
    console.error('Stripe Customer Portal Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

