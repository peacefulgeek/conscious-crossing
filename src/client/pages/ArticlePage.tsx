import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArticleCard } from '../components/ArticleCard';

interface Article {
  id: number;
  slug: string;
  title: string;
  body: string;
  meta_description: string;
  og_title: string;
  og_description: string;
  category: string;
  tags: string[];
  image_url: string;
  image_alt: string;
  reading_time: number;
  author: string;
  published_at: string;
  word_count: number;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    setImgError(false);

    fetch(`/api/articles/${slug}`)
      .then(r => {
        if (r.status === 404) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then(data => {
        if (data) {
          setArticle(data);
          setLoading(false);
        }
      })
      .catch(() => setLoading(false));

    fetch(`/api/articles/related/${slug}`)
      .then(r => r.json())
      .then(data => setRelated(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [slug]);

  if (loading) {
    return (
      <div className="article-loading container">
        <div className="skeleton" style={{ height: '400px', marginBottom: '2rem', borderRadius: '12px' }} />
        <div className="skeleton" style={{ height: '2.5rem', marginBottom: '1rem', maxWidth: '80%' }} />
        <div className="skeleton" style={{ height: '1rem', marginBottom: '0.5rem' }} />
        <div className="skeleton" style={{ height: '1rem', marginBottom: '0.5rem', width: '90%' }} />
        <div className="skeleton" style={{ height: '1rem', width: '75%' }} />
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="not-found container">
        <h1>Article Not Found</h1>
        <p>This article doesn't exist or has been removed.</p>
        <Link to="/articles" className="btn btn-primary">Browse All Articles</Link>
      </div>
    );
  }

  return (
    <article className="article-page">
      {/* Hero image */}
      <div className="article-hero">
        {!imgError && article.image_url ? (
          <img
            src={article.image_url}
            alt={article.image_alt || article.title}
            className="article-hero-img"
            loading="eager"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="article-hero-fallback">
            <span>&#9670;</span>
          </div>
        )}
        <div className="article-hero-overlay" />
      </div>

      {/* Article header */}
      <div className="article-header container">
        <div className="content-width">
          <div className="article-meta">
            <Link to={`/articles?category=${article.category}`} className="article-category">
              {article.category.replace(/-/g, ' ')}
            </Link>
            <span className="meta-dot">&bull;</span>
            <span className="article-time">{article.reading_time} min read</span>
            {article.published_at && (
              <>
                <span className="meta-dot">&bull;</span>
                <time className="article-date">{formatDate(article.published_at)}</time>
              </>
            )}
          </div>

          <h1 className="article-title">{article.title}</h1>

          <div className="article-byline">
            <span className="byline-by">By</span>
            <a
              href="https://kalesh.love"
              target="_blank"
              rel="noopener noreferrer"
              className="byline-author"
            >
              {article.author}
            </a>
          </div>
        </div>
      </div>

      {/* Article body */}
      <div className="article-body container">
        <div className="content-width">
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />

          {/* Health disclaimer */}
          <div className="health-disclaimer">
            <strong>A note:</strong> This article is for educational and reflective purposes only. It is not medical advice. If you or someone you love is facing a terminal diagnosis or end-of-life decisions, please consult with your healthcare team and consider working with a palliative care specialist or death doula.
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="article-tags">
              {article.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          )}

          {/* Author bio */}
          <div className="author-bio">
            <div className="author-bio-inner">
              <div className="author-avatar">K</div>
              <div className="author-info">
                <h4>
                  <a href="https://kalesh.love" target="_blank" rel="noopener noreferrer">
                    {article.author}
                  </a>
                </h4>
                <p>
                  Kalesh is a consciousness teacher and writer who has spent years studying death as a spiritual practice across Vedantic, Tibetan Buddhist, and contemplative traditions. His work holds death as a philosophical reality and a lived human experience simultaneously - without bypassing either.
                </p>
                <a href="https://kalesh.love" target="_blank" rel="noopener noreferrer" className="author-link">
                  Read more at kalesh.love &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="related-articles">
          <div className="container">
            <h2 className="related-title">Continue Reading</h2>
            <div className="related-grid">
              {related.map(a => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}

      <style>{`
        .article-loading {
          padding: var(--space-3xl) 0;
        }

        .not-found {
          padding: var(--space-3xl) 0;
          text-align: center;
        }

        .not-found h1 { margin-bottom: var(--space-md); }
        .not-found p { margin-bottom: var(--space-xl); color: var(--text-secondary); }

        .article-hero {
          position: relative;
          height: clamp(300px, 50vw, 500px);
          overflow: hidden;
          background: var(--bg-elevated);
        }

        .article-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }

        .article-hero-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--bg-elevated), var(--bg-secondary));
          color: var(--accent);
          font-size: 5rem;
          opacity: 0.3;
        }

        .article-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 40%, rgba(30,27,24,0.7) 100%);
        }

        .article-header {
          padding-top: var(--space-2xl);
          padding-bottom: var(--space-xl);
        }

        .article-meta {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          flex-wrap: wrap;
          margin-bottom: var(--space-lg);
        }

        .article-category {
          font-family: var(--font-sans);
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--accent);
          text-decoration: none;
        }

        .article-category:hover { color: var(--accent-hover); }

        .meta-dot {
          color: var(--text-muted);
          font-size: 0.5rem;
        }

        .article-time,
        .article-date {
          font-family: var(--font-sans);
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .article-title {
          font-family: var(--font-display);
          font-size: clamp(1.8rem, 4vw, 3rem);
          font-weight: 700;
          line-height: 1.2;
          color: var(--text-primary);
          margin-bottom: var(--space-lg);
        }

        .article-byline {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          padding-bottom: var(--space-xl);
          border-bottom: 1px solid var(--border-subtle);
        }

        .byline-by {
          font-family: var(--font-sans);
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .byline-author {
          font-family: var(--font-sans);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--accent);
          text-decoration: none;
        }

        .byline-author:hover { color: var(--accent-hover); }

        .article-body {
          padding-bottom: var(--space-3xl);
        }

        .article-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-sm);
          margin: var(--space-2xl) 0;
        }

        .tag {
          font-family: var(--font-sans);
          font-size: 0.75rem;
          padding: 0.3em 0.8em;
          border-radius: 100px;
          background: var(--bg-elevated);
          color: var(--text-muted);
          border: 1px solid var(--border-subtle);
        }

        .author-bio {
          margin-top: var(--space-2xl);
          padding-top: var(--space-2xl);
          border-top: 1px solid var(--border-subtle);
        }

        .author-bio-inner {
          display: flex;
          gap: var(--space-lg);
          align-items: flex-start;
        }

        .author-avatar {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--accent);
          color: #1E1B18;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 1.4rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .author-info h4 {
          font-family: var(--font-sans);
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: var(--space-sm);
          margin-top: 0;
        }

        .author-info h4 a {
          color: var(--text-primary);
          text-decoration: none;
        }

        .author-info h4 a:hover { color: var(--accent); }

        .author-info p {
          font-family: var(--font-sans);
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: var(--space-sm);
        }

        .author-link {
          font-family: var(--font-sans);
          font-size: 0.8rem;
          color: var(--accent);
          text-decoration: none;
          font-weight: 500;
        }

        .author-link:hover { color: var(--accent-hover); }

        .related-articles {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
          padding: var(--space-3xl) 0;
        }

        .related-title {
          font-family: var(--font-display);
          font-size: clamp(1.3rem, 2.5vw, 1.8rem);
          margin-bottom: var(--space-2xl);
          color: var(--text-primary);
        }

        .related-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-xl);
        }

        @media (min-width: 640px) {
          .related-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (min-width: 900px) {
          .related-grid { grid-template-columns: repeat(3, 1fr); }
        }

        /* Prose styles for article body */
        .prose {
          padding-top: var(--space-xl);
        }

        .prose h2 {
          color: var(--accent);
          border-bottom: 1px solid var(--border);
          padding-bottom: var(--space-sm);
        }

        .prose .affiliate-section {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: var(--space-xl);
          margin: var(--space-2xl) 0;
        }

        .prose .affiliate-section h3 {
          color: var(--accent);
          margin-top: 0;
          font-size: 1.1rem;
        }

        .prose .affiliate-section ul {
          list-style: none;
          padding: 0;
        }

        .prose .affiliate-section li {
          padding: var(--space-sm) 0;
          border-bottom: 1px solid var(--border-subtle);
          font-family: var(--font-sans);
          font-size: 0.9rem;
        }

        .prose .affiliate-section li:last-child {
          border-bottom: none;
        }

        .prose .affiliate-section a {
          color: var(--accent-soft);
          font-weight: 500;
        }

        .prose .affiliate-disclosure {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-family: var(--font-sans);
          margin-top: var(--space-md);
          font-style: italic;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          padding: 0.75em 1.75em;
          border-radius: var(--radius-md);
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          border: none;
          transition: all var(--transition-base);
          min-height: var(--tap-target-min);
        }

        .btn-primary {
          background: var(--accent);
          color: #1E1B18;
        }

        .btn-primary:hover {
          background: var(--accent-hover);
          color: #1E1B18;
        }
      `}</style>
    </article>
  );
}
