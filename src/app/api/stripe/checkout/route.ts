import { NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripeClient() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY não configurada.');
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: '2026-02-25.clover' as never,
  });
}

export async function POST(req: Request) {
  try {
    const stripe = getStripeClient();
    const body = await req.json();
    const {
      priceId,
      userId,
      email,
      returnUrl,
      mode = 'subscription',
      kind = 'plano',
      trialDays = 14,
    }: {
      priceId?: string;
      userId?: string;
      email?: string;
      returnUrl?: string;
      mode?: 'subscription' | 'payment';
      kind?: 'plano' | 'credito';
      trialDays?: number;
    } = body;

    if (!priceId || !returnUrl) {
      return NextResponse.json({ error: 'O ID do preço é obrigatório.' }, { status: 400 });
    }

    const isSubscription = mode === 'subscription';
    if (isSubscription && !userId) {
      return NextResponse.json(
        { error: 'Faça login antes de contratar um plano para liberar o Hub corretamente.' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: isSubscription ? 'subscription' : 'payment',
      success_url: `${returnUrl}?success=true&kind=${kind}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?canceled=true`,
      client_reference_id: userId || undefined,
      customer_email: email || undefined,
      allow_promotion_codes: true,
      subscription_data: isSubscription ? { trial_period_days: trialDays } : undefined,
      metadata: {
        checkout_kind: kind,
        userId: userId || '',
        email: email || '',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno no checkout.';
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
