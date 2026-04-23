/**
 * Cron #1 — Daily 02:00 UTC
 * Generate one new article per day using Anthropic API.
 * Passes full quality gate before storing.
 */
import { runQualityGate } from '../lib/article-quality-gate.mjs';
import { query } from '../lib/db.mjs';

const TOPICS_POOL = [
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
];

export async function runGenerateArticle() {
  if (process.env.AUTO_GEN_ENABLED !== 'true') {
    console.log('[generate-article] AUTO_GEN_ENABLED not true — skipping');
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log('[generate-article] No ANTHROPIC_API_KEY — skipping');
    return;
  }

  console.log('[generate-article] Starting daily article generation');

  // Pick a topic not yet in the database
  let topic = null;
  for (const t of TOPICS_POOL) {
    const slug = t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const { rows } = await query('SELECT id FROM articles WHERE slug = $1', [slug]);
    if (rows.length === 0) {
      topic = { ...t, slug };
      break;
    }
  }

  if (!topic) {
    console.log('[generate-article] All pool topics already generated — skipping');
    return;
  }

  console.log(`[generate-article] Generating: ${topic.title}`);

  let attempts = 0;
  const MAX_ATTEMPTS = 3;

  while (attempts < MAX_ATTEMPTS) {
    attempts++;
    try {
      const { generateArticle } = await import('../lib/anthropic-generate.mjs');
      const article = await generateArticle(topic);
      const gate = runQualityGate(article.body);

      if (!gate.passed) {
        console.warn(`[generate-article] Quality gate failed (attempt ${attempts}):`, gate.failures);
        continue;
      }

      await query(`
        INSERT INTO articles (slug, title, body, meta_description, category, tags, image_url, image_alt,
          reading_time, author, published_at, word_count, quality_gate_passed, quality_gate_failures, asins_used)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'Kalesh',NOW(),$10,$11,$12,$13)
        ON CONFLICT (slug) DO NOTHING
      `, [
        topic.slug, article.title, article.body, article.metaDescription,
        topic.category, JSON.stringify(topic.tags),
        `https://meditative-dying.b-cdn.net/articles/${topic.category}.webp`,
        `${topic.title} - The Conscious Crossing`,
        Math.ceil(article.body.split(' ').length / 200),
        article.wordCount, true, JSON.stringify([]),
        JSON.stringify(article.asins || [])
      ]);

      console.log(`[generate-article] Stored: ${topic.slug} (${article.wordCount} words)`);
      await query('INSERT INTO cron_log (job_name, status, details) VALUES ($1,$2,$3)',
        ['generate-article', 'success', JSON.stringify({ slug: topic.slug, wordCount: article.wordCount })]);
      return;
    } catch (err) {
      console.error(`[generate-article] Error (attempt ${attempts}):`, err.message);
    }
  }

  console.error('[generate-article] All attempts failed');
  await query('INSERT INTO cron_log (job_name, status, details) VALUES ($1,$2,$3)',
    ['generate-article', 'failed', JSON.stringify({ topic: topic.slug, attempts })]).catch(() => {});
}
