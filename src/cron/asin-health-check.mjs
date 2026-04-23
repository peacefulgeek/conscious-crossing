/**
 * Cron #5 — Sundays 05:00 UTC
 * Weekly sweep: verify every ASIN in the catalog, invalidate dead ones,
 * and swap them out of articles.
 */
import { verifyAsinBatch, buildAmazonUrl, extractAsinsFromText, countAmazonLinks } from '../lib/amazon-verify.mjs';
import { query } from '../lib/db.mjs';
import fs from 'fs/promises';
import path from 'path';

const CACHE_PATH = path.resolve('src/data/verified-asins.json');

export async function runAsinHealthCheck() {
  console.log('[asin-health-check] Starting weekly sweep');

  let cache;
  try {
    cache = JSON.parse(await fs.readFile(CACHE_PATH, 'utf8'));
  } catch {
    console.log('[asin-health-check] No verified-asins.json — skipping');
    return { checked: 0, invalidated: 0 };
  }

  const asins = Object.keys(cache.asins || {});
  if (asins.length === 0) {
    console.log('[asin-health-check] Empty catalog — nothing to check');
    return { checked: 0, invalidated: 0 };
  }

  console.log(`[asin-health-check] Checking ${asins.length} ASINs`);
  const results = await verifyAsinBatch(asins, {
    delayMs: 2500,
    onProgress: (done, total) => {
      if (done % 25 === 0) console.log(`[asin-health-check] ${done}/${total}`);
    }
  });

  const now = new Date().toISOString();
  let invalidated = 0;
  const deadAsins = [];

  for (const r of results) {
    const existing = cache.asins[r.asin];
    if (r.valid) {
      if (existing) {
        existing.lastChecked = now;
        existing.status = 'valid';
        if (r.title) existing.title = r.title;
      }
    } else {
      deadAsins.push(r.asin);
      delete cache.asins[r.asin];
      if (!cache.failed) cache.failed = {};
      cache.failed[r.asin] = {
        reason: r.reason,
        lastAttempted: now,
        attempts: (cache.failed[r.asin]?.attempts || 0) + 1
      };
      invalidated++;
      console.warn(`[asin-health-check] INVALIDATED ${r.asin}: ${r.reason}`);
    }
  }

  cache.lastUpdated = now;
  await fs.writeFile(CACHE_PATH, JSON.stringify(cache, null, 2));
  console.log(`[asin-health-check] Invalidated ${invalidated} ASINs`);

  if (deadAsins.length > 0) {
    await swapDeadAsinsAcrossArticles(deadAsins, cache);
  }

  await query('INSERT INTO cron_log (job_name, status, details) VALUES ($1,$2,$3)',
    ['asin-health-check', 'success', JSON.stringify({ checked: asins.length, invalidated })]).catch(() => {});

  return { checked: asins.length, invalidated };
}

async function swapDeadAsinsAcrossArticles(deadAsins, cache) {
  const { matchProducts } = await import('../lib/match-products.mjs');

  const { rows: articles } = await query(`
    SELECT id, slug, body, category, tags, asins_used FROM articles
    WHERE asins_used::text != '[]'
  `);

  const affectedArticles = articles.filter(a => {
    const asins = Array.isArray(a.asins_used) ? a.asins_used : [];
    return asins.some(asin => deadAsins.includes(asin));
  });

  console.log(`[asin-health-check] Swapping dead ASINs in ${affectedArticles.length} articles`);

  const catalog = Object.entries(cache.asins || {}).map(([asin, entry]) => ({
    asin, name: entry.title, category: entry.category || '', tags: entry.tags || []
  }));

  for (const article of affectedArticles) {
    let body = article.body;

    for (const dead of deadAsins) {
      const re = new RegExp(
        `<a[^>]*href="[^"]*\\/dp\\/${dead}[^"]*"[^>]*>.*?<\\/a>\\s*(?:\\(paid link\\))?`,
        'gi'
      );
      body = body.replace(re, '');
    }

    const needed = Math.max(0, 3 - countAmazonLinks(body));
    if (needed > 0 && catalog.length > 0) {
      const picks = matchProducts({
        articleTitle: article.slug,
        articleTags: article.tags || [],
        articleCategory: article.category,
        catalog,
        minLinks: 3,
        maxLinks: 4
      });
      const existing = new Set(extractAsinsFromText(body));
      const toAdd = picks.filter(p => !existing.has(p.asin)).slice(0, needed);
      body += '\n' + toAdd.map(p =>
        `<p>A helpful option here is <a href="${buildAmazonUrl(p.asin)}" target="_blank" rel="nofollow sponsored noopener">${p.name}</a> (paid link).</p>`
      ).join('\n');
    }

    const newAsins = extractAsinsFromText(body);
    await query(
      'UPDATE articles SET body = $1, asins_used = $2 WHERE id = $3',
      [body, JSON.stringify(newAsins), article.id]
    );
    await new Promise(r => setTimeout(r, 200));
  }
}
