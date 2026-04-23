import express from 'express';
import compression from 'compression';
import serveStatic from 'serve-static';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import { healthRouter } from './routes/health.js';
import { articlesRouter } from './routes/articles.js';
import { sitemapRouter } from './routes/sitemap.js';
import { renderPage } from './ssr.js';
import { getPool } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV !== 'production';
const PORT = parseInt(process.env.PORT ?? '3000', 10);

// ── Cron: Weekly article generation ping ──────────────────────────
// Runs every Monday at 6am UTC
cron.schedule('0 6 * * 1', async () => {
  console.log('[cron] Weekly article generation job triggered');
  try {
    const db = getPool();
    await db.query(
      "INSERT INTO cron_log (job_name, status, message) VALUES ($1, $2, $3)",
      ['weekly-article-gen', 'triggered', 'Scheduled Monday 06:00 UTC']
    );
  } catch (err: any) {
    console.error('[cron] Log error:', err.message);
  }
});

async function createServer() {
  const app = express();
  app.use(compression());
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(express.json());

  // Security headers
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  // Health check FIRST — must work even if other routes fail
  app.use('/health', healthRouter);

  // Robots.txt
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain').send(
      'User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: https://meditativedying.com/sitemap.xml\n'
    );
  });

  // API routes
  app.use('/api/articles', articlesRouter);
  app.use('/sitemap.xml', sitemapRouter);

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });
    app.use(vite.middlewares);
    app.use('*', async (req, res, next) => {
      try {
        const html = await renderPage(req.originalUrl, { vite });
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) { next(e); }
    });
  } else {
    const clientDir = path.resolve(__dirname, '../dist/client');
    app.use(serveStatic(clientDir, {
      index: false,
      maxAge: '1y',
      setHeaders(res, filepath) {
        if (/\.(html)$/.test(filepath)) {
          res.setHeader('Cache-Control', 'no-cache');
        }
        if (/\.(webp|jpg|jpeg|png|gif|svg)$/.test(filepath)) {
          res.setHeader('Cache-Control', 'public, max-age=2592000');
        }
      }
    }));
    app.use('*', async (req, res, next) => {
      try {
        const html = await renderPage(req.originalUrl);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
      } catch (e) { next(e); }
    });
  }

  app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[server error]', err);
    res.status(500).send('Internal Server Error');
  });

  return app;
}

const app = await createServer();
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[server] Listening on 0.0.0.0:${PORT} (NODE_ENV=${process.env.NODE_ENV})`);
});

export default app;
