import { NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripeClient() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY não configurada.');
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: '2022-11-15' as never,
  });
}

export async function POST(req: Request) {
  try {
    const { sessionId }: { sessionId?: string } = await req.json();

    if (!sessionId || !sessionId.trim()) {
      return NextResponse.json({ error: 'sessionId é obrigatório.' }, { status: 400 });
    }

    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    let subscriptionStatus: Stripe.Subscription.Status | null = null;
    let trialEndsAt: number | null = null;

    if (session.mode === 'subscription' && typeof session.subscription === 'string') {
      const subscription = await stripe.subscriptions.retrieve(session.subscription);
      subscriptionStatus = subscription.status;

      const trialEndSeconds =
        typeof subscription.trial_end === 'number'
          ? subscription.trial_end
          : null;
      trialEndsAt = trialEndSeconds ? trialEndSeconds * 1000 : null;
    }

    return NextResponse.json({
      id: session.id,
      mode: session.mode,
      status: session.status,
      paymentStatus: session.payment_status,
      kind: session.metadata?.checkout_kind ?? null,
      clientReferenceId: session.client_reference_id ?? null,
      customerId: typeof session.customer === 'string' ? session.customer : null,
      subscriptionId: typeof session.subscription === 'string' ? session.subscription : null,
      subscriptionStatus,
      trialEndsAt,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Falha ao verificar sessão.';
    console.error('Stripe Verify Session Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

