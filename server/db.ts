import pg from 'pg';

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  return getDb();
}

export function getDb(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('sslmode=require') ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    pool.on('error', (err) => {
      console.error('[db] Pool error:', err);
    });
  }
  return pool;
}

export async function query(text: string, params?: any[]) {
  const db = getDb();
  return db.query(text, params);
}

export async function initDb() {
  const db = getDb();
  await db.query(`
    CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      meta_description TEXT,
      og_title TEXT,
      og_description TEXT,
      category TEXT NOT NULL DEFAULT 'conscious-dying',
      tags TEXT[] DEFAULT '{}',
      image_url TEXT,
      image_alt TEXT,
      reading_time INTEGER DEFAULT 8,
      author TEXT DEFAULT 'Kalesh',
      published_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      word_count INTEGER DEFAULT 0,
      asins_used TEXT[] DEFAULT '{}',
      last_refreshed_30d TIMESTAMPTZ,
      last_refreshed_90d TIMESTAMPTZ,
      opener_type TEXT,
      conclusion_type TEXT,
      researchers TEXT[] DEFAULT '{}'
    )
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
    CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
    CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at DESC);
  `);

  console.log('[db] Database initialized');
}
