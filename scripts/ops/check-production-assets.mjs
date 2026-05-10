#!/usr/bin/env node
/**
 * Quick production asset integrity check.
 * Usage:
 *   node scripts/ops/check-production-assets.mjs https://neuroads.com.br
 */

const target = process.argv[2] ?? "https://neuroads.com.br";
const origin = new URL(target).origin;

const decodeHtml = (value) =>
  value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");

const html = await fetch(target).then(async (res) => {
  if (!res.ok) throw new Error(`Failed to fetch HTML (${res.status})`);
  return res.text();
});

const matches = [...html.matchAll(/(?:src|href)="([^"]+)"/g)];
const candidates = new Set();

for (const match of matches) {
  const raw = decodeHtml(match[1]);
  if (!raw) continue;
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    if (raw.startsWith(origin)) candidates.add(raw);
    continue;
  }
  if (raw.startsWith("/")) candidates.add(`${origin}${raw}`);
}

const urls = [...candidates].filter((url) => {
  const pathname = new URL(url).pathname;
  return (
    pathname.startsWith("/_next/static/") ||
    pathname.startsWith("/_next/image") ||
    /\.(?:css|js|woff2?|png|jpe?g|svg|gif|webp|ico)$/i.test(pathname)
  );
});

const failures = [];

for (const url of urls) {
  try {
    let response = await fetch(url, { method: "HEAD" });
    if (response.status === 405 || response.status === 400) {
      response = await fetch(url, { method: "GET" });
    }
    if (!response.ok) {
      failures.push(`${response.status} ${url}`);
    }
  } catch {
    failures.push(`ERR ${url}`);
  }
}

if (failures.length) {
  console.error(`Asset check failed (${failures.length}/${urls.length})`);
  for (const line of failures) console.error(line);
  process.exit(1);
}

console.log(`Asset check passed (${urls.length}/${urls.length})`);
