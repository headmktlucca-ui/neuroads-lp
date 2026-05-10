#!/usr/bin/env node
/**
 * Check domain parity between apex and www hosts.
 * Usage:
 *   node scripts/ops/check-domain-parity.mjs
 *   node scripts/ops/check-domain-parity.mjs https://neuroads.com.br https://www.neuroads.com.br
 */

const targets = process.argv.slice(2);
const domains =
  targets.length >= 2
    ? targets
    : ["https://neuroads.com.br", "https://www.neuroads.com.br"];

if (domains.length !== 2) {
  console.error("Provide exactly two domains to compare.");
  process.exit(1);
}

const decodeHtml = (value) =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");

const collect = async (target) => {
  const response = await fetch(target);
  if (!response.ok) {
    throw new Error(`Failed to fetch HTML (${response.status}) from ${target}`);
  }

  const html = await response.text();
  const origin = new URL(target).origin;
  const matches = [...html.matchAll(/(?:src|href)="([^"]+)"/g)];
  const assets = new Set();

  for (const match of matches) {
    const raw = decodeHtml(match[1]);
    if (!raw) continue;

    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      if (raw.startsWith(origin)) assets.add(raw);
      continue;
    }

    if (raw.startsWith("/")) assets.add(`${origin}${raw}`);
  }

  const assetList = [...assets].filter((url) => {
    const pathname = new URL(url).pathname;
    return /^\/_next\/static\/.+\.(?:css|js|woff2?)$/i.test(pathname);
  });

  const failures = [];
  for (const url of assetList) {
    const head = await fetch(url, { method: "HEAD" });
    if (!head.ok) failures.push(`${head.status} ${url}`);
  }

  return {
    target,
    cacheControl: response.headers.get("cache-control") ?? "n/a",
    nextCache: response.headers.get("x-nextjs-cache") ?? "n/a",
    nextPrerender: response.headers.get("x-nextjs-prerender") ?? "n/a",
    age: response.headers.get("age") ?? "n/a",
    assetList,
    failures,
  };
};

const [left, right] = await Promise.all(domains.map((d) => collect(d)));

const leftPaths = new Set(left.assetList.map((u) => new URL(u).pathname));
const rightPaths = new Set(right.assetList.map((u) => new URL(u).pathname));
const missingOnRight = [...leftPaths].filter((path) => !rightPaths.has(path));
const missingOnLeft = [...rightPaths].filter((path) => !leftPaths.has(path));

const printSummary = (data) => {
  console.log(`\n=== ${data.target} ===`);
  console.log(`cache-control: ${data.cacheControl}`);
  console.log(`x-nextjs-cache: ${data.nextCache}`);
  console.log(`x-nextjs-prerender: ${data.nextPrerender}`);
  console.log(`age: ${data.age}`);
  console.log(`assets checked: ${data.assetList.length}`);
  if (data.failures.length) {
    console.log(`asset failures: ${data.failures.length}`);
    for (const failure of data.failures) console.log(failure);
  } else {
    console.log("asset failures: 0");
  }
};

printSummary(left);
printSummary(right);

let hasError = false;
if (left.failures.length || right.failures.length) hasError = true;
if (missingOnRight.length || missingOnLeft.length) {
  hasError = true;
  console.log("\n=== Asset Manifest Drift Detected ===");
  if (missingOnRight.length) {
    console.log(`Missing on ${right.target}:`);
    for (const path of missingOnRight.slice(0, 15)) console.log(path);
  }
  if (missingOnLeft.length) {
    console.log(`Missing on ${left.target}:`);
    for (const path of missingOnLeft.slice(0, 15)) console.log(path);
  }
}

if (hasError) {
  process.exit(1);
}

console.log("\nDomain parity check passed.");
