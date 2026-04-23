import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArticleCard } from '../components/ArticleCard';

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

const CATEGORIES = [
  { id: '', label: 'All Articles' },
  { id: 'conscious-dying', label: 'Conscious Dying' },
  { id: 'tibetan-buddhism', label: 'Tibetan Buddhism' },
  { id: 'grief', label: 'Grief & Loss' },
  { id: 'practical', label: 'Practical Planning' },
  { id: 'spiritual', label: 'Spiritual Practice' },
  { id: 'death-positive', label: 'Death Positive' },
];

export function ArticlesListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '12' });
    if (category) params.set('category', category);

    fetch(`/api/articles?${params}`)
      .then(r => r.json())
      .then(data => {
        setArticles(data.articles || []);
        setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category, page]);

  const setCategory = (cat: string) => {
    const params = new URLSearchParams();
    if (cat) params.set('category', cat);
    setSearchParams(params);
  };

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(p));
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentCatLabel = CATEGORIES.find(c => c.id === category)?.label || 'All Articles';

  return (
    <div className="articles-list-page">
      <div className="page-header">
        <div className="container">
          <h1>Articles on Conscious Dying</h1>
          <p className="page-subtitle">
            Practical and spiritual writing on death preparation, conscious dying, and the art of meeting mortality with presence.
          </p>
        </div>
      </div>

      <div className="container">
        {/* Category filter */}
        <div className="category-filter">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`filter-btn${category === cat.id ? ' active' : ''}`}
              onClick={() => setCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results info */}
        {!loading && (
          <p className="results-info">
            {pagination.total} article{pagination.total !== 1 ? 's' : ''} {category ? `in ${currentCatLabel}` : 'total'}
          </p>
        )}

        {/* Articles grid */}
        {loading ? (
          <div className="articles-grid">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="article-card-skeleton">
                <div className="skeleton" style={{ height: '200px', marginBottom: '1rem', borderRadius: '8px' }} />
                <div className="skeleton" style={{ height: '1.5rem', marginBottom: '0.5rem', borderRadius: '4px' }} />
                <div className="skeleton" style={{ height: '1rem', width: '70%', borderRadius: '4px' }} />
              </div>
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="articles-grid">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon">&#9670;</span>
            <p>No articles found in this category yet.</p>
            <button className="btn btn-ghost" onClick={() => setCategory('')}>View all articles</button>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              &larr; Previous
            </button>
            <span className="page-info">Page {page} of {pagination.pages}</span>
            <button
              className="page-btn"
              disabled={page >= pagination.pages}
              onClick={() => setPage(page + 1)}
            >
              Next &rarr;
            </button>
          </div>
        )}
      </div>

      <style>{`
        .articles-list-page {
          padding-bottom: var(--space-3xl);
        }

        .page-header {
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
          padding: var(--space-3xl) 0 var(--space-2xl);
          margin-bottom: var(--space-2xl);
        }

        .page-header h1 {
          margin-bottom: var(--space-md);
        }

        .page-subtitle {
          font-family: var(--font-serif);
          color: var(--text-secondary);
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0;
        }

        .category-filter {
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
          margin-bottom: var(--space-lg);
          padding-bottom: var(--space-lg);
          border-bottom: 1px solid var(--border-subtle);
        }

        .filter-btn {
          font-family: var(--font-sans);
          font-size: 0.8rem;
          font-weight: 500;
          padding: 0.4em 1em;
          border-radius: 100px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
          min-height: 36px;
        }

        .filter-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
        }

        .filter-btn.active {
          background: var(--accent);
          border-color: var(--accent);
          color: #1E1B18;
          font-weight: 600;
        }

        .results-info {
          font-family: var(--font-sans);
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: var(--space-xl);
        }

        .articles-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-xl);
          margin-bottom: var(--space-3xl);
        }

        @media (min-width: 640px) {
          .articles-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (min-width: 1024px) {
          .articles-grid { grid-template-columns: repeat(3, 1fr); }
        }

        .empty-state {
          text-align: center;
          padding: var(--space-3xl);
          color: var(--text-muted);
        }

        .empty-icon {
          display: block;
          font-size: 3rem;
          color: var(--accent);
          opacity: 0.3;
          margin-bottom: var(--space-lg);
        }

        .empty-state p {
          font-family: var(--font-serif);
          font-style: italic;
          margin-bottom: var(--space-lg);
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-xl);
        }

        .page-btn {
          font-family: var(--font-sans);
          font-size: 0.875rem;
          font-weight: 500;
          padding: 0.6em 1.4em;
          border-radius: var(--radius-md);
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
          min-height: var(--tap-target-min);
        }

        .page-btn:hover:not(:disabled) {
          border-color: var(--accent);
          color: var(--accent);
        }

        .page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .page-info {
          font-family: var(--font-sans);
          font-size: 0.875rem;
          color: var(--text-muted);
        }

        .btn-ghost {
          background: transparent;
          color: var(--accent);
          border: none;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          cursor: pointer;
          text-decoration: underline;
          padding: 0.5em 0;
        }
      `}</style>
    </div>
  );
}
