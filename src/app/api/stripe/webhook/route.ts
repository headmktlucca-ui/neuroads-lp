import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAdminDb } from '../../../../lib/firebase-admin';

function getStripeConfig() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY não configurada.');
  }

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET não configurada.');
  }

  return {
    stripe: new Stripe(stripeSecretKey, {
      apiVersion: '2026-02-25.clover' as never,
    }),
    webhookSecret,
  };
}

export async function POST(req: Request) {
  let stripe: Stripe;
  let webhookSecret: string;

  try {
    const config = getStripeConfig();
    stripe = config.stripe;
    webhookSecret = config.webhookSecret;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Configuração Stripe inválida.';
    console.error(message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const body = await req.text();
  const signature = (await headers()).get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro de assinatura';
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: 'Assinatura inválida.' }, { status: 400 });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id ?? session.metadata?.userId;
        const isSubscriptionCheckout = session.mode === 'subscription';

        if (isSubscriptionCheckout && userId) {
          const subscriptionId = typeof session.subscription === 'string' ? session.subscription : null;
          const subscription = subscriptionId ? await stripe.subscriptions.retrieve(subscriptionId) : null;
          const trialEndsAt =
            typeof subscription?.trial_end === 'number'
              ? subscription.trial_end * 1000
              : null;
          const db = getAdminDb();
          const userRef = db.collection('users').doc(userId);
          await userRef.set(
            {
              isPremium: true,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscriptionId,
              subscriptionStatus: subscription?.status ?? 'active',
              trialEndsAt,
              updatedAt: Date.now(),
            },
            { merge: true }
          );
          console.log(`User ${userId} upgraded to Premium via Webhook.`);
        } else if (isSubscriptionCheckout) {
          console.warn(
            `Checkout concluído sem userId para assinatura. Session: ${session.id}, customer: ${String(session.customer ?? '')}`
          );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        // In a real scenario, you'd find the user by stripeCustomerId
        // For simplicity, we assume we need to handle cancellation
        // We'd ideally query Firestore for the user with this subscription ID
        console.log(`Subscription ${subscription.id} deleted.`);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
  }
}
