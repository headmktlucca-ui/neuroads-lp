import { NextResponse } from 'next/server';
import Stripe from 'stripe';

type FirebaseLookupUser = {
  localId?: string;
  email?: string;
};

type FirebaseLookupResponse = {
  users?: FirebaseLookupUser[];
  error?: { message?: string };
};

function getStripeClient() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY não configurada.');
  }
  return new Stripe(stripeSecretKey, {
    apiVersion: '2026-02-25.clover' as never,
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

function shouldCancelSubscription(status: Stripe.Subscription.Status): boolean {
  return ['trialing', 'active', 'past_due', 'unpaid', 'incomplete'].includes(status);
}

async function verifyFirebaseIdToken(idToken: string): Promise<{ uid: string; email: string | null }> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_FIREBASE_API_KEY não configurada para validar sessão.');
  }

  const endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });

  const data = (await response.json().catch(() => null)) as FirebaseLookupResponse | null;
  if (!response.ok) {
    const reason = data?.error?.message || 'Falha ao validar sessão Firebase.';
    throw new Error(reason);
  }

  const user = data?.users?.[0];
  const uid = readString(user?.localId);
  if (!uid) {
    throw new Error('Usuário inválido na sessão Firebase.');
  }

  const email = readString(user?.email) || null;
  return { uid, email };
}

export async function POST(req: Request) {
  try {
    const token = extractBearerToken(req.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Token ausente.' }, { status: 401 });
    }

    const session = await verifyFirebaseIdToken(token);
    const body = (await req.json().catch(() => ({}))) as {
      uid?: unknown;
      email?: unknown;
      stripeCustomerId?: unknown;
      stripeSubscriptionId?: unknown;
      onboardingStripeSubscriptionId?: unknown;
    };

    const payloadUid = readString(body.uid);
    if (payloadUid && payloadUid !== session.uid) {
      return NextResponse.json({ error: 'Sessão inválida para este usuário.' }, { status: 403 });
    }

    const stripeCustomerId = readString(body.stripeCustomerId);
    const primaryEmail = readString(body.email) || session.email || '';
    const subscriptionIds = new Set<string>();
    const directSubscriptionId = readString(body.stripeSubscriptionId);
    const onboardingSubscriptionId = readString(body.onboardingStripeSubscriptionId);

    if (directSubscriptionId) subscriptionIds.add(directSubscriptionId);
    if (onboardingSubscriptionId) subscriptionIds.add(onboardingSubscriptionId);

    const stripe = getStripeClient();
    const canceledSubscriptionIds: string[] = [];

    if (stripeCustomerId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: 'all',
        limit: 30,
      });
      subscriptions.data
        .filter((subscription) => shouldCancelSubscription(subscription.status))
        .forEach((subscription) => subscriptionIds.add(subscription.id));
    }

    if (primaryEmail) {
      const customers = await stripe.customers.list({ email: primaryEmail, limit: 10 });
      for (const customer of customers.data) {
        if (typeof customer.id !== 'string') continue;
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'all',
          limit: 30,
        });
        subscriptions.data
          .filter((subscription) => shouldCancelSubscription(subscription.status))
          .forEach((subscription) => subscriptionIds.add(subscription.id));
      }
    }

    for (const subscriptionId of subscriptionIds) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      if (!shouldCancelSubscription(subscription.status)) continue;
      await stripe.subscriptions.cancel(subscriptionId);
      canceledSubscriptionIds.push(subscriptionId);
    }

    return NextResponse.json({
      ok: true,
      canceledSubscriptions: canceledSubscriptionIds,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Falha ao excluir conta.';
    console.error('Account Deletion Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

