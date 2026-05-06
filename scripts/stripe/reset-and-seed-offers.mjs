import fs from 'node:fs/promises';
import path from 'node:path';
import Stripe from 'stripe';

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
  throw new Error('STRIPE_SECRET_KEY não configurada.');
}

const stripe = new Stripe(stripeKey, {
  apiVersion: '2026-02-25.clover',
});

const currency = 'brl';

const subscriptionPlans = [
  { slug: 'starter-5', name: 'Starter 5 Agentes', amount: 29900, description: 'Plano mensal com 5 agentes e limite operacional de 1.000 execuções/mês.', limits: { agents: 5, includedExecutions: 1000, extraCreditUnitPrice: 0.45 } },
  { slug: 'growth-10', name: 'Growth 10 Agentes', amount: 39900, description: 'Plano mensal com 10 agentes e limite operacional de 2.500 execuções/mês.', limits: { agents: 10, includedExecutions: 2500, extraCreditUnitPrice: 0.39 } },
  { slug: 'scale-15', name: 'Scale 15 Agentes', amount: 49900, description: 'Plano mensal com 15 agentes e limite operacional de 4.500 execuções/mês.', limits: { agents: 15, includedExecutions: 4500, extraCreditUnitPrice: 0.34 } },
  { slug: 'performance-20', name: 'Performance 20 Agentes', amount: 59900, description: 'Plano mensal com 20 agentes e limite operacional de 7.000 execuções/mês.', limits: { agents: 20, includedExecutions: 7000, extraCreditUnitPrice: 0.30 } },
];

const creditPacks = [
  { slug: 'credit-pack-100', name: 'Créditos Avulsos 100 Execuções', amount: 4500, description: 'Pacote avulso com 100 execuções adicionais.', limits: { includedExecutions: 100, unitPrice: 0.45 } },
  { slug: 'credit-pack-500', name: 'Créditos Avulsos 500 Execuções', amount: 19000, description: 'Pacote avulso com 500 execuções adicionais.', limits: { includedExecutions: 500, unitPrice: 0.38 } },
  { slug: 'credit-pack-1000', name: 'Créditos Avulsos 1000 Execuções', amount: 33000, description: 'Pacote avulso com 1.000 execuções adicionais.', limits: { includedExecutions: 1000, unitPrice: 0.33 } },
];

async function listAllActivePrices() {
  const prices = [];
  let hasMore = true;
  let startingAfter;

  while (hasMore) {
    const page = await stripe.prices.list({ active: true, limit: 100, starting_after: startingAfter });
    prices.push(...page.data);
    hasMore = page.has_more;
    startingAfter = page.data.at(-1)?.id;
  }

  return prices;
}

async function listAllActiveProducts() {
  const products = [];
  let hasMore = true;
  let startingAfter;

  while (hasMore) {
    const page = await stripe.products.list({ active: true, limit: 100, starting_after: startingAfter });
    products.push(...page.data);
    hasMore = page.has_more;
    startingAfter = page.data.at(-1)?.id;
  }

  return products;
}

async function deactivateExistingCatalog() {
  const activeProducts = await listAllActiveProducts();
  for (const product of activeProducts) {
    await stripe.products.update(product.id, { active: false });
  }

  const activePrices = await listAllActivePrices();
  let skippedPrices = 0;

  for (const price of activePrices) {
    try {
      await stripe.prices.update(price.id, { active: false });
    } catch {
      skippedPrices += 1;
    }
  }

  return {
    deactivatedProducts: activeProducts.length,
    deactivatedPrices: activePrices.length - skippedPrices,
    skippedPrices,
  };
}

async function createOfferProduct(offer, type) {
  return stripe.products.create({
    name: offer.name,
    description: offer.description,
    metadata: {
      catalog_scope: 'neuroads-offers-v2',
      offer_slug: offer.slug,
      offer_type: type,
      ...Object.fromEntries(Object.entries(offer.limits).map(([k, v]) => [k, String(v)])),
    },
  });
}

async function main() {
  const deactivation = await deactivateExistingCatalog();

  const plans = [];
  for (const plan of subscriptionPlans) {
    const product = await createOfferProduct(plan, 'subscription');
    const price = await stripe.prices.create({
      currency,
      unit_amount: plan.amount,
      recurring: { interval: 'month' },
      product: product.id,
      lookup_key: `neuroads_${plan.slug}_monthly_v2`,
    });

    plans.push({ ...plan, productId: product.id, priceId: price.id, mode: 'subscription', trialDays: 14 });
  }

  const creditPacksOut = [];
  for (const pack of creditPacks) {
    const product = await createOfferProduct(pack, 'credit_pack');
    const price = await stripe.prices.create({
      currency,
      unit_amount: pack.amount,
      product: product.id,
      lookup_key: `neuroads_${pack.slug}_onetime_v2`,
    });

    creditPacksOut.push({ ...pack, productId: product.id, priceId: price.id, mode: 'payment' });
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    currency,
    stripeApiVersion: '2026-02-25.clover',
    deactivation,
    plans,
    creditPacks: creditPacksOut,
  };

  const outPath = path.resolve('src/data/stripe-offers.json');
  await fs.writeFile(outPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log(`Catálogo Stripe atualizado em ${outPath}`);
  console.log(JSON.stringify(deactivation));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
