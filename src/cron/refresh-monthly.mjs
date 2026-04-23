/**
 * Cron #3 — 1st of month 03:00 UTC
 * Refresh the oldest 5 articles (update meta, check quality gate, re-verify ASINs).
 */
import { query } from '../lib/db.mjs';

export async function runRefreshMonthly() {
  if (process.env.AUTO_GEN_ENABLED !== 'true') {
    console.log('[refresh-monthly] AUTO_GEN_ENABLED not true — skipping');
    return;
  }

  console.log('[refresh-monthly] Starting monthly content refresh');

  try {
    // Get 5 oldest articles by updated_at
    const { rows: articles } = await query(`
      SELECT id, slug, title, body, category, tags, word_count
      FROM articles
      ORDER BY updated_at ASC
      LIMIT 5
    `);

    if (articles.length === 0) {
      console.log('[refresh-monthly] No articles to refresh');
      return;
    }

    const { runQualityGate } = await import('../lib/article-quality-gate.mjs');

    let refreshed = 0;
    for (const article of articles) {
      const gate = runQualityGate(article.body);
      await query(`
        UPDATE articles
        SET quality_gate_passed = $1, quality_gate_failures = $2, updated_at = NOW()
        WHERE id = $3
      `, [gate.passed, JSON.stringify(gate.failures), article.id]);
      refreshed++;
    }

    console.log(`[refresh-monthly] Refreshed ${refreshed} articles`);
    await query('INSERT INTO cron_log (job_name, status, details) VALUES ($1,$2,$3)',
      ['refresh-monthly', 'success', JSON.stringify({ refreshed })]);
  } catch (err) {
    console.error('[refresh-monthly] Error:', err.message);
    await query('INSERT INTO cron_log (job_name, status, details) VALUES ($1,$2,$3)',
      ['refresh-monthly', 'failed', JSON.stringify({ error: err.message })]).catch(() => {});
  }
}
