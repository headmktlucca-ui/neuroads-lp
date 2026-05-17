import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAuth } from 'firebase-admin/auth';
import { getAdminDb } from '../../../../lib/firebase-admin';
import { hasActiveHubSubscription } from '../../../../lib/hub-access';

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

function isAllowedSubscriptionStatus(status: Stripe.Subscription.Status): boolean {
  return ['trialing', 'active', 'past_due', 'unpaid', 'incomplete'].includes(status);
}

export async function POST(req: Request) {
  try {
    const token = extractBearerToken(req.headers.get('authorization'));
    if (!token) {
      return NextResponse.json({ error: 'Token ausente.' }, { status: 401 });
    }

    // Garante inicialização do app do Firebase Admin antes de verificar o token.
    getAdminDb();
    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;

    const db = getAdminDb();
    const userRef = db.collection('users').doc(userId);
    const userSnapshot = await userRef.get();
    const currentProfile = userSnapshot.exists ? userSnapshot.data() : {};

    if (hasActiveHubSubscription(currentProfile)) {
      return NextResponse.json({ hasAccess: true, source: 'firestore' });
    }

    const email = decoded.email || (typeof currentProfile?.authEmail === 'string' ? currentProfile.authEmail : null);
    if (!email) {
      return NextResponse.json({ hasAccess: false, reason: 'email_not_found' });
    }

    const stripe = getStripeClient();
    const customers = await stripe.customers.list({ email, limit: 5 });

    for (const customer of customers.data) {
      if (typeof customer.id !== 'string') continue;

      const subscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        status: 'all',
        limit: 20,
      });

      const activeSubscription = subscriptions.data.find((subscription) =>
        isAllowedSubscriptionStatus(subscription.status)
      );

      if (!activeSubscription) {
        continue;
      }

      await userRef.set(
        {
          isPremium: true,
          stripeCustomerId: customer.id,
          stripeSubscriptionId: activeSubscription.id,
          subscriptionStatus: activeSubscription.status,
          authEmail: email,
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      return NextResponse.json({ hasAccess: true, source: 'stripe_sync' });
    }

    return NextResponse.json({ hasAccess: false, reason: 'active_subscription_not_found' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Falha ao sincronizar assinatura.';
    console.error('Stripe Premium Sync Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
