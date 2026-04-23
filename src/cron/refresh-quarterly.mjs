/**
 * Cron #4 — Jan/Apr/Jul/Oct 1st 04:00 UTC
 * Quarterly deep refresh: regenerate the 3 lowest-performing articles.
 */
import { query } from '../lib/db.mjs';

export async function runRefreshQuarterly() {
  if (process.env.AUTO_GEN_ENABLED !== 'true') {
    console.log('[refresh-quarterly] AUTO_GEN_ENABLED not true — skipping');
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log('[refresh-quarterly] No ANTHROPIC_API_KEY — skipping');
    return;
  }

  console.log('[refresh-quarterly] Starting quarterly deep refresh');

  try {
    // Get 3 articles that failed quality gate or are oldest
    const { rows: articles } = await query(`
      SELECT id, slug, title, category, tags
      FROM articles
      WHERE quality_gate_passed = false
      ORDER BY published_at ASC
      LIMIT 3
    `);

    if (articles.length === 0) {
      console.log('[refresh-quarterly] No failed-gate articles to refresh — skipping');
      await query('INSERT INTO cron_log (job_name, status, details) VALUES ($1,$2,$3)',
        ['refresh-quarterly', 'skipped', JSON.stringify({ reason: 'no-failed-articles' })]);
      return;
    }

    const { generateArticle } = await import('../lib/anthropic-generate.mjs');
    const { runQualityGate } = await import('../lib/article-quality-gate.mjs');

    let regenerated = 0;
    for (const article of articles) {
      try {
        const topic = {
          title: article.title,
          category: article.category,
          tags: article.tags || []
        };
        const newArticle = await generateArticle(topic);
        const gate = runQualityGate(newArticle.body);

        if (gate.passed) {
          await query(`
            UPDATE articles
            SET body = $1, word_count = $2, quality_gate_passed = true,
                quality_gate_failures = '[]', updated_at = NOW()
            WHERE id = $3
          `, [newArticle.body, newArticle.wordCount, article.id]);
          regenerated++;
          console.log(`[refresh-quarterly] Regenerated: ${article.slug}`);
        } else {
          console.warn(`[refresh-quarterly] Still failing gate after regen: ${article.slug}`);
        }
      } catch (err) {
        console.error(`[refresh-quarterly] Error regenerating ${article.slug}:`, err.message);
      }
    }

    console.log(`[refresh-quarterly] Regenerated ${regenerated} articles`);
    await query('INSERT INTO cron_log (job_name, status, details) VALUES ($1,$2,$3)',
      ['refresh-quarterly', 'success', JSON.stringify({ regenerated })]);
  } catch (err) {
    console.error('[refresh-quarterly] Error:', err.message);
    await query('INSERT INTO cron_log (job_name, status, details) VALUES ($1,$2,$3)',
      ['refresh-quarterly', 'failed', JSON.stringify({ error: err.message })]).catch(() => {});
  }
}
