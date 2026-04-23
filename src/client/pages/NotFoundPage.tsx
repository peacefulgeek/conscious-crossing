import React from 'react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="container">
        <div className="not-found-content">
          <div className="not-found-symbol">&#9670;</div>
          <h1>Page Not Found</h1>
          <p>
            This page doesn't exist - or perhaps it's in the bardo.
          </p>
          <div className="not-found-actions">
            <Link to="/" className="btn btn-primary">Return Home</Link>
            <Link to="/articles" className="btn btn-secondary">Browse Articles</Link>
          </div>
        </div>
      </div>

      <style>{`
        .not-found-page {
          padding: var(--space-3xl) 0;
          min-height: 60vh;
          display: flex;
          align-items: center;
        }

        .not-found-content {
          text-align: center;
          max-width: 500px;
          margin: 0 auto;
        }

        .not-found-symbol {
          font-size: 4rem;
          color: var(--accent);
          opacity: 0.3;
          margin-bottom: var(--space-xl);
        }

        .not-found-content h1 {
          margin-bottom: var(--space-md);
        }

        .not-found-content p {
          font-family: var(--font-serif);
          font-style: italic;
          color: var(--text-secondary);
          margin-bottom: var(--space-2xl);
        }

        .not-found-actions {
          display: flex;
          gap: var(--space-md);
          justify-content: center;
          flex-wrap: wrap;
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
          transition: all var(--transition-base);
          min-height: var(--tap-target-min);
          border: 1px solid var(--border);
        }

        .btn-primary {
          background: var(--accent);
          color: #1E1B18;
          border-color: var(--accent);
        }

        .btn-primary:hover {
          background: var(--accent-hover);
          border-color: var(--accent-hover);
          color: #1E1B18;
        }

        .btn-secondary {
          background: transparent;
          color: var(--text-secondary);
        }

        .btn-secondary:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
      `}</style>
    </div>
  );
}
