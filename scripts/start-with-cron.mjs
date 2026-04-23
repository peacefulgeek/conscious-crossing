#!/usr/bin/env node
/**
 * Production entry point.
 * Starts the Express server as a child process, then registers all cron jobs.
 *
 * Cron schedule:
 * | # | When                          | Expression              | Job                         |
 * | 1 | Daily 02:00 UTC               | 0 2 * * *               | Generate new article        |
 * | 2 | Saturday 08:00 UTC            | 0 8 * * 6               | Product spotlight (1/week)  |
 * | 3 | 1st of month 03:00 UTC        | 0 3 1 * *               | Monthly content refresh     |
 * | 4 | Jan/Apr/Jul/Oct 1st 04:00 UTC | 0 4 1 1,4,7,10 *        | Quarterly content refresh   |
 * | 5 | Sunday 05:00 UTC              | 0 5 * * 0               | ASIN health check           |
 *
 * No external dispatcher. All in-process node-cron.
 */

import cron from 'node-cron';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// ─── Start web server as child process ────────────────────────
const proc = spawn('node', ['dist/index.js'], {
  cwd: root,
  env: { ...process.env, NODE_ENV: 'production' },
  stdio: 'inherit',
});

proc.on('exit', (code) => {
  console.log(`[start] Process exited with code ${code}`);
  process.exit(code ?? 0);
});

// ─── Register cron schedules ──────────────────────────────────
const AUTO_GEN = process.env.AUTO_GEN_ENABLED === 'true';

if (!AUTO_GEN) {
  console.log('[start-with-cron] AUTO_GEN_ENABLED not "true" — cron disabled');
} else {
  try {
    const [genMod, spotMod, rmMod, rqMod, ahcMod] = await Promise.all([
      import('../src/cron/generate-article.mjs'),
      import('../src/cron/product-spotlight.mjs'),
      import('../src/cron/refresh-monthly.mjs'),
      import('../src/cron/refresh-quarterly.mjs'),
      import('../src/cron/asin-health-check.mjs'),
    ]);

    // #1 — Daily 02:00 UTC — generate new article
    cron.schedule('0 2 * * *', async () => {
      console.log('[cron] #1 generate-article starting');
      try { await genMod.runGenerateArticle(); }
      catch (e) { console.error('[cron] #1 error:', e.message); }
    }, { timezone: 'UTC' });

    // #2 — Saturdays 08:00 UTC — product spotlight
    cron.schedule('0 8 * * 6', async () => {
      console.log('[cron] #2 product-spotlight starting');
      try { await spotMod.runProductSpotlight(); }
      catch (e) { console.error('[cron] #2 error:', e.message); }
    }, { timezone: 'UTC' });

    // #3 — 1st of month 03:00 UTC — monthly refresh
    cron.schedule('0 3 1 * *', async () => {
      console.log('[cron] #3 refresh-monthly starting');
      try { await rmMod.runRefreshMonthly(); }
      catch (e) { console.error('[cron] #3 error:', e.message); }
    }, { timezone: 'UTC' });

    // #4 — Jan/Apr/Jul/Oct 1st 04:00 UTC — quarterly refresh
    cron.schedule('0 4 1 1,4,7,10 *', async () => {
      console.log('[cron] #4 refresh-quarterly starting');
      try { await rqMod.runRefreshQuarterly(); }
      catch (e) { console.error('[cron] #4 error:', e.message); }
    }, { timezone: 'UTC' });

    // #5 — Sundays 05:00 UTC — ASIN health check
    cron.schedule('0 5 * * 0', async () => {
      console.log('[cron] #5 asin-health-check starting');
      try { await ahcMod.runAsinHealthCheck(); }
      catch (e) { console.error('[cron] #5 error:', e.message); }
    }, { timezone: 'UTC' });

    console.log('[start-with-cron] All 5 cron jobs registered');
  } catch (err) {
    console.error('[start-with-cron] Failed to register cron jobs:', err.message);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[start] SIGTERM received, shutting down...');
  proc.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('[start] SIGINT received, shutting down...');
  proc.kill('SIGINT');
});
