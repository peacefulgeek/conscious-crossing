import express from 'express';
import { getDb } from '../db.js';

export const sitemapRouter = express.Router();

sitemapRouter.get('/', async (req, res) => {
  try {
    const db = getDb();
    const { rows } = await db.query(
      `SELECT slug, published_at, updated_at FROM articles WHERE published_at IS NOT NULL ORDER BY published_at DESC`
    );

    const domain = 'https://meditativedying.com';
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'weekly' },
      { url: '/about', priority: '0.8', changefreq: 'monthly' },
      { url: '/library', priority: '0.8', changefreq: 'weekly' },
      { url: '/quiz', priority: '0.7', changefreq: 'monthly' },
      { url: '/assessment', priority: '0.7', changefreq: 'monthly' },
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(p => `  <url>
    <loc>${domain}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
${rows.map(a => `  <url>
    <loc>${domain}/articles/${a.slug}</loc>
    <lastmod>${new Date(a.updated_at || a.published_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('[sitemap] Error:', err);
    res.status(500).send('Error generating sitemap');
  }
});
