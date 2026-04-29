import express from 'express';
import { getDb } from '../db.js';

export const articlesRouter = express.Router();

// ── CRITICAL: ALL public routes filter by status = 'published' ────────────────
// Queued articles MUST NEVER leak to the frontend.

articlesRouter.get('/', async (req, res) => {
  try {
    const db = getDb();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const offset = (page - 1) * limit;
    const category = req.query.category as string;

    let query = `SELECT id, slug, title, meta_description, category, tags, image_url, image_alt, reading_time, author, published_at, word_count
                 FROM articles
                 WHERE status = 'published' AND published_at IS NOT NULL`;
    const params: any[] = [];

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    query += ` ORDER BY published_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const { rows } = await db.query(query, params);

    const countQuery = category
      ? `SELECT COUNT(*) FROM articles WHERE status = 'published' AND published_at IS NOT NULL AND category = $1`
      : `SELECT COUNT(*) FROM articles WHERE status = 'published' AND published_at IS NOT NULL`;
    const countParams = category ? [category] : [];
    const { rows: countRows } = await db.query(countQuery, countParams);
    const total = parseInt(countRows[0].count);

    res.json({
      articles: rows,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    console.error('[articles] Error fetching articles:', err);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// IMPORTANT: /related/:slug MUST come before /:slug to avoid route collision
articlesRouter.get('/related/:slug', async (req, res) => {
  try {
    const db = getDb();
    const { rows: current } = await db.query(
      `SELECT category, tags FROM articles WHERE slug = $1 AND status = 'published'`,
      [req.params.slug]
    );
    if (current.length === 0) return res.json([]);

    const { category, tags } = current[0];
    const { rows } = await db.query(
      `SELECT id, slug, title, meta_description, image_url, image_alt, reading_time, category
       FROM articles
       WHERE slug != $1
         AND status = 'published'
         AND published_at IS NOT NULL
         AND (category = $2 OR tags && $3::text[])
       ORDER BY published_at DESC LIMIT 3`,
      [req.params.slug, category, tags || []]
    );
    res.json(rows);
  } catch (err) {
    console.error('[articles] Error fetching related:', err);
    res.json([]);
  }
});

articlesRouter.get('/:slug', async (req, res) => {
  try {
    const db = getDb();
    const { rows } = await db.query(
      `SELECT * FROM articles WHERE slug = $1 AND status = 'published' AND published_at IS NOT NULL`,
      [req.params.slug]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('[articles] Error fetching article:', err);
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});
