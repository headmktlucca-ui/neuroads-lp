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

    // Evita bloquear login quando o ambiente admin estiver indisponível.
    try {
      getAdminDb();
    } catch (adminInitError) {
      console.warn('Stripe Premium Sync skipped: Firebase Admin indisponível.', adminInitError);
      return NextResponse.json({ hasAccess: false, reason: 'admin_unavailable' });
    }

    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;

    const db = getAdminDb();
    const userRef = db.collection('users').doc(userId);
    const userSnapshot = await userRef.get();
    const currentProfile = userSnapshot.exists ? userSnapshot.data() : {};

    if (hasActiveHubSubscription(currentProfile)) {
      return NextResponse.json({ hasAccess: true, source: 'firestore' });
    }

    const stripe = getStripeClient();

    let body: Record<string, unknown> = {};
    try {
      body = (await req.json()) as Record<string, unknown>;
    } catch {}
    const sessionId = body?.sessionId;

    if (sessionId) {
      try {
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
          expand: ['subscription'],
        });
        const sessionUserId = session.client_reference_id || session.metadata?.userId;
        
        if (sessionUserId === userId) {
          const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
          const subscription = session.subscription as Stripe.Subscription | undefined;
          
          if (customerId && (!subscription || isAllowedSubscriptionStatus(subscription.status))) {
            await userRef.set(
              {
                isPremium: true,
                stripeCustomerId: customerId,
                ...(subscription ? {
                  stripeSubscriptionId: subscription.id,
                  subscriptionStatus: subscription.status,
                  trialEndsAt: typeof subscription.trial_end === 'number' ? subscription.trial_end * 1000 : null,
                } : {}),
                updatedAt: Date.now(),
              },
              { merge: true }
            );
            return NextResponse.json({ hasAccess: true, source: 'stripe_session' });
          }
        }
      } catch (err) {
        console.warn('Falha ao buscar session no sync-premium:', err);
      }
    }

    const email = decoded.email || (typeof currentProfile?.authEmail === 'string' ? currentProfile.authEmail : null);
    if (!email) {
      return NextResponse.json({ hasAccess: false, reason: 'email_not_found' });
    }

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
          trialEndsAt:
            typeof activeSubscription.trial_end === 'number'
              ? activeSubscription.trial_end * 1000
              : null,
          authEmail: email,
          email,
          updatedAt: Date.now(),
        },
        { merge: true }
      );

      return NextResponse.json({ hasAccess: true, source: 'stripe_sync' });
    }

    return NextResponse.json({ hasAccess: false, reason: 'active_subscription_not_found' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Falha ao sincronizar assinatura.';
    const code = error && typeof error === 'object' && 'code' in error ? String((error as { code?: string }).code ?? '') : '';
    if (code.startsWith('auth/')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    console.error('Stripe Premium Sync Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

