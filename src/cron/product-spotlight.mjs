/**
 * Cron #2 — Saturdays 08:00 UTC
 * Generate a product spotlight article for one item from the verified ASIN catalog.
 */
import { runQualityGate } from '../lib/article-quality-gate.mjs';
import { query } from '../lib/db.mjs';
import fs from 'fs/promises';
import path from 'path';

const CACHE_PATH = path.resolve('src/data/verified-asins.json');
const MAX_ATTEMPTS = 3;

export async function runProductSpotlight() {
  if (process.env.AUTO_GEN_ENABLED !== 'true') {
    console.log('[product-spotlight] AUTO_GEN_ENABLED not true — skipping');
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log('[product-spotlight] No ANTHROPIC_API_KEY — skipping');
    return;
  }

  let cache;
  try {
    cache = JSON.parse(await fs.readFile(CACHE_PATH, 'utf8'));
  } catch {
    console.log('[product-spotlight] No verified-asins.json — skipping');
    return;
  }

  const validAsins = Object.entries(cache.asins || {})
    .filter(([, v]) => v.status === 'valid' && v.title)
    .map(([asin, v]) => ({ asin, ...v }));

  if (validAsins.length === 0) {
    console.log('[product-spotlight] No valid ASINs in catalog — skipping');
    return;
  }

  // Pick a random product
  const product = validAsins[Math.floor(Math.random() * validAsins.length)];
  const slug = `spotlight-${product.asin.toLowerCase()}`;

  const { rows: existing } = await query('SELECT id FROM articles WHERE slug = $1', [slug]);
  if (existing.length > 0) {
    console.log(`[product-spotlight] Spotlight for ${product.asin} already exists — skipping`);
    return;
  }

  console.log(`[product-spotlight] Generating spotlight for: ${product.title}`);

  let attempts = 0;
  while (attempts < MAX_ATTEMPTS) {
    attempts++;
    try {
      const { generateArticle } = await import('../lib/anthropic-generate.mjs');
      const topic = {
        title: `${product.title}: A Thoughtful Review for Conscious Dying Practice`,
        category: 'practical',
        tags: ['product-review', 'tools', 'practice'],
        spotlightAsin: product.asin,
        spotlightTitle: product.title
      };
      const article = await generateArticle(topic);
      const gate = runQualityGate(article.body);

      if (!gate.passed) {
        console.warn(`[product-spotlight] Quality gate failed (attempt ${attempts}):`, gate.failures);
        continue;
      }

      await query(`
        INSERT INTO articles (slug, title, body, meta_description, category, tags, image_url, image_alt,
          reading_time, author, published_at, word_count, quality_gate_passed, quality_gate_failures, asins_used)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'Kalesh',NOW(),$10,$11,$12,$13)
        ON CONFLICT (slug) DO NOTHING
      `, [
        slug, article.title, article.body, article.metaDescription,
        'practical', JSON.stringify(['product-review', 'tools']),
        `https://meditative-dying.b-cdn.net/articles/practical-planning.webp`,
        `${product.title} - The Conscious Crossing`,
        Math.ceil(article.body.split(' ').length / 200),
        article.wordCount, true, JSON.stringify([]),
        JSON.stringify([product.asin])
      ]);

      console.log(`[product-spotlight] Stored spotlight: ${slug}`);
      await query('INSERT INTO cron_log (job_name, status, details) VALUES ($1,$2,$3)',
        ['product-spotlight', 'success', JSON.stringify({ slug, asin: product.asin })]);
      return;
    } catch (err) {
      console.error(`[product-spotlight] Error (attempt ${attempts}):`, err.message);
    }
  }

  console.error('[product-spotlight] All attempts failed');
}
