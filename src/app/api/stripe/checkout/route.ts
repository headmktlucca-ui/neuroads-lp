import { NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripeClient() {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY não configurada.');
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: '2026-03-25.dahlia',
  });
}

export async function POST(req: Request) {
  try {
    const stripe = getStripeClient();
    const body = await req.json();
    const { priceId, userId, email, returnUrl } = body;

    if (!priceId) {
      return NextResponse.json({ error: 'O ID do preço é obrigatório.' }, { status: 400 });
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?canceled=true`,
      // Attach the Firebase UID to the stripe session so we can identify them via Webhooks later
      client_reference_id: userId || undefined,
      // Pre-fill email to reduce friction
      customer_email: email || undefined,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno no checkout.';
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
