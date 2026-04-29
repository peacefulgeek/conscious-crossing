#!/usr/bin/env node
/**
 * Production entry point.
 * Starts the Express server as a child process, then registers all cron jobs.
 *
 * Queue-Drain Schedule (Spec: ADDENDUMSCOPENOCLAUDE.md):
 * ─────────────────────────────────────────────────────────────────────────────
 * Phase 1 (days 1-30 after SITE_LAUNCH_DATE):
 *   Publish 3 articles/day at 06:00, 12:00, 18:00 UTC
 *   Expression: '0 6,12,18 * * *'
 *
 * Phase 2 (day 31+ after SITE_LAUNCH_DATE):
 *   Publish 1 article/day at 08:00 UTC
 *   Expression: '0 8 * * *'
 *
 * Other cron jobs:
 * | # | When                          | Expression              | Job                         |
 * | 2 | Saturday 08:00 UTC            | 0 8 * * 6               | Product spotlight (1/week)  |
 * | 3 | 1st of month 03:00 UTC        | 0 3 1 * *               | Monthly content refresh     |
 * | 4 | Jan/Apr/Jul/Oct 1st 04:00 UTC | 0 4 1 1,4,7,10 *        | Quarterly content refresh   |
 * | 5 | Sunday 05:00 UTC              | 0 5 * * 0               | ASIN health check           |
 *
 * SITE_LAUNCH_DATE env var (ISO string, e.g. "2025-05-01T00:00:00Z"):
 *   Set this to the date the site went live. Used to determine Phase 1 vs Phase 2.
 *   If not set, defaults to the current process start time (Phase 1 from now).
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

// ─── Phase detection ──────────────────────────────────────────
function isPhase1() {
  const launchDate = process.env.SITE_LAUNCH_DATE
    ? new Date(process.env.SITE_LAUNCH_DATE)
    : new Date(); // default: now = Phase 1 from start

  const daysSinceLaunch = (Date.now() - launchDate.getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceLaunch <= 30;
}

// ─── Register cron schedules ──────────────────────────────────
const AUTO_GEN = process.env.AUTO_GEN_ENABLED === 'true';

if (!AUTO_GEN) {
  console.log('[start-with-cron] AUTO_GEN_ENABLED not "true" — article generation cron disabled');
} else {
  try {
    const [genMod, spotMod, rmMod, rqMod, ahcMod] = await Promise.all([
      import('../src/cron/generate-article.mjs'),
      import('../src/cron/product-spotlight.mjs'),
      import('../src/cron/refresh-monthly.mjs'),
      import('../src/cron/refresh-quarterly.mjs'),
      import('../src/cron/asin-health-check.mjs'),
    ]);

    const phase = isPhase1() ? 1 : 2;
    console.log(`[start-with-cron] Phase ${phase} detected`);

    if (phase === 1) {
      // Phase 1: 3x/day at 06:00, 12:00, 18:00 UTC
      cron.schedule('0 6,12,18 * * *', async () => {
        // Re-check phase on each run (may transition mid-day)
        const currentPhase = isPhase1() ? 1 : 2;
        if (currentPhase !== 1) {
          console.log('[cron] Phase transitioned to 2 — skipping Phase 1 run');
          return;
        }
        console.log('[cron] Phase 1 — generate-article starting');
        try { await genMod.runGenerateArticle(); }
        catch (e) { console.error('[cron] Phase 1 error:', e.message); }
      }, { timezone: 'UTC' });

      console.log('[start-with-cron] Phase 1 cron: 3x/day at 06:00, 12:00, 18:00 UTC');
    }

    // Phase 2: 1x/day at 08:00 UTC (always registered, skips if Phase 1)
    cron.schedule('0 8 * * *', async () => {
      if (isPhase1()) {
        console.log('[cron] Phase 1 still active — Phase 2 08:00 run skipped');
        return;
      }
      console.log('[cron] Phase 2 — generate-article starting');
      try { await genMod.runGenerateArticle(); }
      catch (e) { console.error('[cron] Phase 2 error:', e.message); }
    }, { timezone: 'UTC' });

    console.log('[start-with-cron] Phase 2 cron: 1x/day at 08:00 UTC (active when Phase 1 ends)');

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

    console.log('[start-with-cron] All cron jobs registered');
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
