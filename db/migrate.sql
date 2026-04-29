-- The Conscious Crossing - Database Schema
-- Queue-based publishing: status = 'queued' | 'published'
-- Run once on DigitalOcean Managed PostgreSQL

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id                    SERIAL PRIMARY KEY,
  slug                  VARCHAR(120) UNIQUE NOT NULL,
  title                 TEXT NOT NULL,
  body                  TEXT NOT NULL,
  meta_description      VARCHAR(200),
  og_title              VARCHAR(200),
  og_description        VARCHAR(300),
  category              VARCHAR(60) NOT NULL DEFAULT 'conscious-dying',
  tags                  JSONB NOT NULL DEFAULT '[]',
  image_url             TEXT,
  image_alt             TEXT,
  reading_time          INTEGER NOT NULL DEFAULT 8,
  author                VARCHAR(100) NOT NULL DEFAULT 'Kalesh',
  -- Queue-based publishing fields
  status                VARCHAR(20) NOT NULL DEFAULT 'queued',  -- 'queued' | 'published'
  queued_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at          TIMESTAMPTZ,
  word_count            INTEGER,
  quality_gate_passed   BOOLEAN DEFAULT FALSE,
  quality_gate_failures JSONB DEFAULT '[]',
  asins_used            JSONB DEFAULT '[]',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_queued_at ON articles(queued_at ASC);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles USING GIN(tags);

-- Cron job log table
CREATE TABLE IF NOT EXISTS cron_log (
  id          SERIAL PRIMARY KEY,
  job_name    VARCHAR(100) NOT NULL,
  status      VARCHAR(20) NOT NULL,
  details     JSONB DEFAULT '{}',
  ran_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Health check table
CREATE TABLE IF NOT EXISTS health_checks (
  id          SERIAL PRIMARY KEY,
  checked_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status      VARCHAR(20) NOT NULL DEFAULT 'ok'
);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Migration: add status/queued_at to existing tables (safe to run on existing DB)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='articles' AND column_name='status'
  ) THEN
    ALTER TABLE articles ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'published';
    ALTER TABLE articles ADD COLUMN queued_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    -- Existing articles are already published
    UPDATE articles SET status = 'published' WHERE published_at IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
    CREATE INDEX IF NOT EXISTS idx_articles_queued_at ON articles(queued_at ASC);
    RAISE NOTICE 'Added status/queued_at columns to articles table';
  END IF;
END $$;

-- Migration: add details column to cron_log if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='cron_log' AND column_name='details'
  ) THEN
    ALTER TABLE cron_log ADD COLUMN details JSONB DEFAULT '{}';
    RAISE NOTICE 'Added details column to cron_log table';
  END IF;
END $$;
