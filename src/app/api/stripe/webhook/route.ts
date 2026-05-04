import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getFirebaseDb } from '../../../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

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
      apiVersion: '2026-03-25.dahlia',
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
        const userId = session.client_reference_id;

        if (userId) {
          const db = getFirebaseDb();
          // Update Firebase User to Premium
          const userRef = doc(db, 'users', userId);
          await updateDoc(userRef, {
            isPremium: true,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            updatedAt: Date.now()
          });
          console.log(`User ${userId} upgraded to Premium via Webhook.`);
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
