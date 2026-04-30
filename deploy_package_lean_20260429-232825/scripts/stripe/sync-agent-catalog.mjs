#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const DRY_RUN = process.env.STRIPE_AGENT_SYNC_DRY_RUN === 'true';
const CURRENCY = 'brl';
const INTERVAL = 'month';
const OUTPUT_PATH = path.join(process.cwd(), 'src', 'data', 'stripe-agent-price-ids.json');

if (!STRIPE_SECRET_KEY) {
  console.error('Missing STRIPE_SECRET_KEY. Configure your Stripe secret key in environment variables.');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const PLAN_LIMITS = {
  Lite: 8,
  Growth: 20,
  Pro: 40,
};

const TIER_PRICES = {
  Simples: { Lite: 29.9, Growth: 39.9, Pro: 49.9 },
  Intermediario: { Lite: 39.9, Growth: 59.9, Pro: 79.9 },
  Avancado: { Lite: 49.9, Growth: 69.9, Pro: 89.9 },
};

const AGENTS = [
  { title: 'Analista de Tráfego', category: 'Performance', tier: 'Avancado' },
  { title: 'Gerador de Criativos', category: 'Criativos', tier: 'Intermediario' },
  { title: 'Gerador de Copies de Conversão', category: 'Criativos', tier: 'Intermediario' },
  { title: 'Análise Viral', category: 'Criativos', tier: 'Intermediario' },
  { title: 'Rastreador Cirúrgico', category: 'Técnico', tier: 'Avancado' },
  { title: 'Preditor de Funil', category: 'Técnico', tier: 'Avancado' },
  { title: 'Diagnóstico de Landing Page', category: 'Inteligência', tier: 'Intermediario' },
  { title: 'Simulador de ROAS', category: 'Performance', tier: 'Intermediario' },
  { title: 'Analisador de Público', category: 'Inteligência', tier: 'Simples' },
  { title: 'Diagnóstico de Funil', category: 'Técnico', tier: 'Avancado' },
  { title: 'Auditor de Desperdício', category: 'Performance', tier: 'Intermediario' },
  { title: 'Otimizador de Orçamento', category: 'Performance', tier: 'Intermediario' },
  { title: 'Gerador de Testes A/B', category: 'Técnico', tier: 'Avancado' },
  { title: 'Avaliador de Oferta', category: 'Inteligência', tier: 'Simples' },
  { title: 'Radar de Oportunidades', category: 'Inteligência', tier: 'Intermediario' },
  { title: 'SEO & GEO', category: 'Inteligência', tier: 'Intermediario' },
  { title: 'DNA da Marca', category: 'Inteligência', tier: 'Simples' },
  { title: 'Análise de Concorrentes', category: 'Inteligência', tier: 'Simples' },
  { title: 'Público-Alvo Ideal', category: 'Inteligência', tier: 'Simples' },
];

function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function amountToCents(value) {
  return Math.round(value * 100);
}

function planLookupKey(agentSlug, planName) {
  return `neuroads_agent_${agentSlug}_${planName.toLowerCase()}_${INTERVAL}_${CURRENCY}`;
}

async function findProductByCatalogKey(catalogKey) {
  let hasMore = true;
  let startingAfter;

  while (hasMore) {
    const page = await stripe.products.list({
      limit: 100,
      starting_after: startingAfter,
      active: true,
    });

    const found = page.data.find((p) => p.metadata?.catalog_key === catalogKey);
    if (found) return found;

    hasMore = page.has_more;
    startingAfter = page.data[page.data.length - 1]?.id;
  }

  return null;
}

async function upsertProduct(agent) {
  const slug = slugify(agent.title);
  const catalogKey = `neuroads_agent_${slug}`;
  const description = `Agente IA ${agent.title} (${agent.category}). Cadência mensal com limite de execuções por plano.`;
  const metadata = {
    kind: 'agent_subscription',
    catalog_key: catalogKey,
    agent_title: agent.title,
    agent_slug: slug,
    tier: agent.tier,
    category: agent.category,
    billing_interval: INTERVAL,
  };

  const existing = await findProductByCatalogKey(catalogKey);
  if (existing) {
    if (DRY_RUN) {
      console.log(`[DRY_RUN] Update product ${existing.id} (${agent.title})`);
      return existing;
    }
    return stripe.products.update(existing.id, {
      name: `Agente IA • ${agent.title}`,
      description,
      metadata,
      active: true,
    });
  }

  if (DRY_RUN) {
    console.log(`[DRY_RUN] Create product (${agent.title})`);
    return {
      id: `dry_prod_${slug}`,
      name: `Agente IA • ${agent.title}`,
      metadata,
    };
  }

  return stripe.products.create({
    name: `Agente IA • ${agent.title}`,
    description,
    metadata,
    active: true,
  });
}

async function findPriceByLookupKey(lookupKey) {
  const list = await stripe.prices.list({
    lookup_keys: [lookupKey],
    active: true,
    limit: 1,
  });
  return list.data[0] || null;
}

async function upsertPrice(product, agent, planName, monthlyPrice, monthlyLimit) {
  const agentSlug = slugify(agent.title);
  const lookupKey = planLookupKey(agentSlug, planName);
  const expectedUnitAmount = amountToCents(monthlyPrice);
  const existing = await findPriceByLookupKey(lookupKey);

  const sameAsExpected = existing
    && existing.product === product.id
    && existing.unit_amount === expectedUnitAmount
    && existing.currency === CURRENCY;

  if (sameAsExpected) {
    return existing;
  }

  if (DRY_RUN) {
    console.log(`[DRY_RUN] Create price ${lookupKey} (${monthlyPrice}) for ${agent.title}`);
    return {
      id: `dry_price_${agentSlug}_${planName.toLowerCase()}`,
      lookup_key: lookupKey,
      unit_amount: expectedUnitAmount,
      currency: CURRENCY,
      recurring: { interval: INTERVAL },
      product: product.id,
    };
  }

  return stripe.prices.create({
    product: product.id,
    currency: CURRENCY,
    unit_amount: expectedUnitAmount,
    recurring: { interval: INTERVAL },
    lookup_key: lookupKey,
    transfer_lookup_key: true,
    metadata: {
      kind: 'agent_subscription_price',
      agent_title: agent.title,
      agent_slug: agentSlug,
      plan_name: planName,
      monthly_limit: String(monthlyLimit),
      billing_interval: INTERVAL,
      category: agent.category,
      tier: agent.tier,
    },
    nickname: `${agent.title} • ${planName} • Mensal`,
  });
}

async function main() {
  console.log(`Stripe agent catalog sync started (${DRY_RUN ? 'DRY_RUN' : 'LIVE'})`);

  const catalogOutput = {
    generatedAt: new Date().toISOString(),
    mode: DRY_RUN ? 'dry_run' : 'live',
    currency: CURRENCY,
    interval: INTERVAL,
    agents: {},
  };

  for (const agent of AGENTS) {
    const product = await upsertProduct(agent);
    const tierPrices = TIER_PRICES[agent.tier];
    const plans = {};

    for (const [planName, monthlyLimit] of Object.entries(PLAN_LIMITS)) {
      const monthlyPrice = tierPrices[planName];
      const price = await upsertPrice(product, agent, planName, monthlyPrice, monthlyLimit);

      plans[planName] = {
        priceId: price.id,
        lookupKey: planLookupKey(slugify(agent.title), planName),
        monthlyPrice,
        monthlyLimit,
      };
    }

    catalogOutput.agents[agent.title] = {
      productId: product.id,
      productName: `Agente IA • ${agent.title}`,
      category: agent.category,
      tier: agent.tier,
      plans,
    };

    console.log(`✔ Synced: ${agent.title}`);
  }

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(catalogOutput, null, 2)}\n`, 'utf-8');

  console.log(`\nCatalog saved to: ${OUTPUT_PATH}`);
  console.log('Done.');
}

main().catch((error) => {
  console.error('Stripe sync failed:', error);
  process.exit(1);
});
