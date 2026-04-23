import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface Article {
  id: number;
  slug: string;
  title: string;
  meta_description: string;
  category: string;
  tags: string[];
  image_url: string;
  image_alt: string;
  reading_time: number;
  author: string;
  published_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  'conscious-dying': 'Conscious Dying',
  'tibetan-buddhism': 'Tibetan Buddhism',
  'grief': 'Grief & Loss',
  'practical': 'Practical Planning',
  'spiritual': 'Spiritual Practice',
  'death-positive': 'Death Positive',
  'end-of-life': 'End of Life',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const [imgError, setImgError] = useState(false);
  const categoryLabel = CATEGORY_LABELS[article.category] || article.category;

  return (
    <article className={`article-card${featured ? ' featured' : ''}`}>
      <Link to={`/articles/${article.slug}`} className="card-image-link" tabIndex={-1} aria-hidden>
        <div className="card-image-wrapper">
          {!imgError && article.image_url ? (
            <img
              src={article.image_url}
              alt={article.image_alt || article.title}
              className="card-image"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="card-image-fallback">
              <span>&#9670;</span>
            </div>
          )}
          <div className="card-image-overlay" />
        </div>
      </Link>

      <div className="card-body">
        <div className="card-meta">
          <span className="card-category">{categoryLabel}</span>
          <span className="card-dot">&bull;</span>
          <span className="card-time">{article.reading_time} min read</span>
        </div>

        <h3 className="card-title">
          <Link to={`/articles/${article.slug}`}>{article.title}</Link>
        </h3>

        <p className="card-excerpt">{article.meta_description}</p>

        <div className="card-footer">
          <span className="card-author">{article.author}</span>
          {article.published_at && (
            <span className="card-date">{formatDate(article.published_at)}</span>
          )}
        </div>
      </div>

      <style>{`
        .article-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          transition: border-color var(--transition-base), transform var(--transition-base), box-shadow var(--transition-base);
        }

        .article-card:hover {
          border-color: var(--border);
          transform: translateY(-3px);
          box-shadow: var(--shadow-lg);
        }

        .card-image-link {
          display: block;
          text-decoration: none;
        }

        .card-image-wrapper {
          position: relative;
          aspect-ratio: 16/9;
          overflow: hidden;
          background: var(--bg-elevated);
        }

        .article-card.featured .card-image-wrapper {
          aspect-ratio: 16/10;
        }

        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-slow);
        }

        .article-card:hover .card-image {
          transform: scale(1.04);
        }

        .card-image-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--bg-elevated), var(--bg-secondary));
          color: var(--accent);
          font-size: 2.5rem;
          opacity: 0.5;
        }

        .card-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(30,27,24,0.4) 0%, transparent 60%);
        }

        .card-body {
          padding: var(--space-lg);
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .card-meta {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          margin-bottom: var(--space-sm);
          flex-wrap: wrap;
        }

        .card-category {
          font-family: var(--font-sans);
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--accent);
        }

        .card-dot {
          color: var(--text-muted);
          font-size: 0.6rem;
        }

        .card-time {
          font-family: var(--font-sans);
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .card-title {
          font-family: var(--font-display);
          font-size: clamp(1rem, 2vw, 1.2rem);
          font-weight: 700;
          line-height: 1.3;
          margin-bottom: var(--space-sm);
          margin-top: 0;
        }

        .card-title a {
          color: var(--text-primary);
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .card-title a:hover {
          color: var(--accent);
        }

        .card-excerpt {
          font-family: var(--font-sans);
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: var(--space-md);
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: var(--space-md);
          border-top: 1px solid var(--border-subtle);
        }

        .card-author {
          font-family: var(--font-sans);
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-muted);
        }

        .card-date {
          font-family: var(--font-sans);
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      `}</style>
    </article>
  );
}
