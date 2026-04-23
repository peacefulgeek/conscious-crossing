-- The Conscious Crossing - Database Schema
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
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_tags ON articles USING GIN(tags);

-- Cron job log table
CREATE TABLE IF NOT EXISTS cron_log (
  id          SERIAL PRIMARY KEY,
  job_name    VARCHAR(100) NOT NULL,
  status      VARCHAR(20) NOT NULL,
  message     TEXT,
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
