/**
 * Cron — Queue-Drain Article Publisher
 * Spec: ADDENDUMSCOPENOCLAUDE.md
 *
 * Phase 1 (first 30 days): publish 3 articles/day at 06:00, 12:00, 18:00 UTC
 * Phase 2 (after 30 days): publish 1 article/day at 08:00 UTC
 *
 * Each run:
 *   1. Check AUTO_GEN_ENABLED and DEEPSEEK_API_KEY
 *   2. Pull the oldest queued article (status = 'queued', ORDER BY queued_at ASC)
 *   3. If queue is empty, generate a new article via DeepSeek, pass quality gate, insert as queued
 *   4. Assign hero image from Bunny library
 *   5. Set status = 'published', published_at = NOW()
 *   6. Log to cron_log
 *
 * Schedules (set in start-with-cron.mjs):
 *   Phase 1: node-cron '0 6,12,18 * * *'   (runs 3x/day)
 *   Phase 2: node-cron '0 8 * * *'          (runs 1x/day)
 */

import { runQualityGate } from '../lib/article-quality-gate.mjs';
import { assignHeroImage } from '../lib/image-assign.mjs';
import { query } from '../lib/db.mjs';

const MAX_ATTEMPTS = 4;

// Fallback topic pool for when the queue is empty
const FALLBACK_TOPICS = [
  { title: 'The Art of Dying Alone: Solitude at the End of Life', category: 'conscious-dying', tags: ['solitude', 'dying', 'presence'] },
  { title: 'What Happens in the Final Hours: A Gentle Guide', category: 'conscious-dying', tags: ['dying-process', 'hospice', 'presence'] },
  { title: 'The Language of the Dying: What They Are Trying to Tell You', category: 'conscious-dying', tags: ['communication', 'dying', 'caregiving'] },
  { title: 'Nearing Death Awareness: The Visions and Visitors at the End', category: 'tibetan-buddhism', tags: ['visions', 'dying', 'awareness'] },
  { title: 'How to Meditate on Death Without Becoming Morbid', category: 'spiritual', tags: ['meditation', 'death-meditation', 'practice'] },
  { title: 'The Buddhist Teaching on Impermanence and Why It Matters Now', category: 'tibetan-buddhism', tags: ['impermanence', 'buddhism', 'practice'] },
  { title: 'Grief Is Not a Problem to Solve', category: 'grief', tags: ['grief', 'loss', 'healing'] },
  { title: 'When the Caregiver Needs Care: Burnout and Renewal', category: 'practical', tags: ['caregiver', 'burnout', 'self-care'] },
  { title: 'The Ethics of Assisted Dying: A Thoughtful Overview', category: 'practical', tags: ['assisted-dying', 'ethics', 'end-of-life'] },
  { title: 'How to Hold Space for Someone Who Is Dying', category: 'conscious-dying', tags: ['presence', 'caregiving', 'dying'] },
  { title: 'The Relationship Between Dying and Waking Up', category: 'conscious-dying', tags: ['awakening', 'dying', 'consciousness'] },
  { title: 'What Dying Teaches the Living', category: 'conscious-dying', tags: ['lessons', 'dying', 'wisdom'] },
  { title: 'The Sacred Space of the Deathbed', category: 'conscious-dying', tags: ['sacred', 'deathbed', 'presence'] },
  { title: 'How to Be With Someone in Their Last Days', category: 'conscious-dying', tags: ['presence', 'last-days', 'caregiving'] },
  { title: 'The Practice of Dying Into Love', category: 'spiritual', tags: ['love', 'dying', 'practice'] },
];

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

/**
 * Pull the oldest queued article from the database.
 * Returns null if queue is empty.
 */
async function dequeueOldest() {
  const { rows } = await query(
    `SELECT id, slug, title, category, tags, image_url
     FROM articles
     WHERE status = 'queued'
     ORDER BY queued_at ASC
     LIMIT 1`
  );
  return rows[0] || null;
}

/**
 * Generate a new article via DeepSeek and insert it as 'queued'.
 * Returns the new article row, or null on failure.
 */
async function generateAndQueue(topic) {
  const { generateArticle } = await import('../lib/deepseek-generate.mjs');

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const article = await generateArticle(topic);
      const gate = runQualityGate(article.body);

      if (!gate.passed) {
        console.warn(`[generate-article] Gate failed attempt ${attempt}: ${gate.failures.join(', ')}`);
        continue;
      }

      const slug = slugify(topic.title);
      const imageUrl = await assignHeroImage(slug);
      const readingTime = Math.ceil(gate.wordCount / 200);

      const { rows } = await query(`
        INSERT INTO articles (
          slug, title, body, meta_description, category, tags,
          image_url, image_alt, reading_time, author,
          status, queued_at, published_at,
          word_count, quality_gate_passed, quality_gate_failures, asins_used
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'Kalesh','queued',NOW(),NULL,$10,$11,$12,$13)
        ON CONFLICT (slug) DO NOTHING
        RETURNING id, slug, title, category, tags, image_url
      `, [
        slug,
        article.title,
        gate.body,
        article.metaDescription,
        topic.category,
        JSON.stringify(topic.tags),
        imageUrl,
        `${article.title} - The Conscious Crossing`,
        readingTime,
        gate.wordCount,
        true,
        JSON.stringify(gate.failures),
        JSON.stringify(gate.asins || []),
      ]);

      if (rows.length > 0) {
        console.log(`[generate-article] Generated and queued: ${slug} (${gate.wordCount} words)`);
        return rows[0];
      }
      return null;
    } catch (err) {
      console.error(`[generate-article] Generate attempt ${attempt} error: ${err.message}`);
      if (attempt < MAX_ATTEMPTS) await new Promise(r => setTimeout(r, 2000));
    }
  }
  return null;
}

/**
 * Publish a queued article: set status='published', published_at=NOW(), assign image if missing.
 */
async function publishArticle(articleId, slug, existingImageUrl) {
  let imageUrl = existingImageUrl;
  if (!imageUrl || imageUrl.includes('undefined')) {
    imageUrl = await assignHeroImage(slug);
  }

  await query(`
    UPDATE articles
    SET status = 'published',
        published_at = NOW(),
        image_url = $1,
        updated_at = NOW()
    WHERE id = $2
  `, [imageUrl, articleId]);

  console.log(`[generate-article] Published: ${slug}`);
}

export async function runGenerateArticle() {
  if (process.env.AUTO_GEN_ENABLED !== 'true') {
    console.log('[generate-article] AUTO_GEN_ENABLED not true — skipping');
    return;
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.log('[generate-article] No DEEPSEEK_API_KEY — skipping');
    return;
  }

  console.log('[generate-article] Starting queue-drain publish run');

  try {
    // Step 1: Try to dequeue the oldest queued article
    let article = await dequeueOldest();

    if (!article) {
      console.log('[generate-article] Queue is empty — generating new article');

      // Pick a fallback topic not already in the DB
      let topic = null;
      for (const t of FALLBACK_TOPICS) {
        const slug = slugify(t.title);
        const { rows } = await query('SELECT id FROM articles WHERE slug = $1', [slug]);
        if (rows.length === 0) {
          topic = t;
          break;
        }
      }

      if (!topic) {
        console.log('[generate-article] All fallback topics exhausted — skipping');
        await query('INSERT INTO cron_log (job_name, status, details) VALUES ($1,$2,$3)',
          ['generate-article', 'skipped', JSON.stringify({ reason: 'queue_empty_all_topics_used' })]);
        return;
      }

      article = await generateAndQueue(topic);
      if (!article) {
        console.error('[generate-article] Failed to generate new article');
        await query('INSERT INTO cron_log (job_name, status, details) VALUES ($1,$2,$3)',
          ['generate-article', 'failed', JSON.stringify({ reason: 'generation_failed' })]);
        return;
      }
    }

    // Step 2: Publish the article
    await publishArticle(article.id, article.slug, article.image_url);

    // Step 3: Log success
    const { rows: queueCount } = await query(
      `SELECT COUNT(*) FROM articles WHERE status = 'queued'`
    );
    const remaining = parseInt(queueCount[0].count);

    await query('INSERT INTO cron_log (job_name, status, details) VALUES ($1,$2,$3)',
      ['generate-article', 'success', JSON.stringify({
        published: article.slug,
        queueRemaining: remaining,
      })]);

    console.log(`[generate-article] Done. Queue remaining: ${remaining}`);
  } catch (err) {
    console.error('[generate-article] Fatal error:', err.message);
    await query('INSERT INTO cron_log (job_name, status, details) VALUES ($1,$2,$3)',
      ['generate-article', 'error', JSON.stringify({ error: err.message })]).catch(() => {});
  }
}
