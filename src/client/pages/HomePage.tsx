import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  { id: 'conscious-dying', label: 'Conscious Dying', icon: '◆', desc: 'What it means to die with awareness' },
  { id: 'tibetan-buddhism', label: 'Tibetan Buddhism', icon: '○', desc: 'The bardo, phowa, and the clear light' },
  { id: 'grief', label: 'Grief & Loss', icon: '◇', desc: 'Anticipatory grief, caregiver grief, what remains' },
  { id: 'practical', label: 'Practical Planning', icon: '■', desc: 'Advance directives, hospice, legacy letters' },
  { id: 'spiritual', label: 'Spiritual Practice', icon: '●', desc: 'Death meditation, Vedanta, the year to live' },
];

export function HomePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/articles?limit=6')
      .then(r => r.json())
      .then(data => {
        setArticles(data.articles || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="home-page">

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg">
          <img
            src="https://meditative-dying.b-cdn.net/articles/fear-of-death.webp"
            alt="Misty forest path — the threshold between life and death"
            className="hero-image"
            loading="eager"
            onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
          />
          <div className="hero-overlay" />
        </div>
        <div className="hero-content container">
          <div className="hero-eyebrow">
            <span className="eyebrow-dot">◆</span>
            <span>Conscious Dying &bull; Death as Practice</span>
          </div>
          <h1 className="hero-title">
            Death is not the<br />
            opposite of life.<br />
            <span className="hero-accent">It's the opposite of birth.</span>
          </h1>
          <p className="hero-subtitle">
            This is the site for people who know they're going to die — which is everyone — and want to meet that reality with clarity, preparation, and spiritual depth rather than terror and denial.
          </p>
          <div className="hero-actions">
            <Link to="/articles" className="btn btn-primary">Read the Articles</Link>
            <Link to="/assessment" className="btn btn-outline">Take the Assessment</Link>
          </div>
          <div className="hero-author">
            Written by{' '}
            <a href="https://kalesh.love" target="_blank" rel="noopener noreferrer">Kalesh</a>
            {' '}— Consciousness Teacher &amp; Writer
          </div>
        </div>
        <div className="hero-scroll-hint">
          <span>◆</span>
        </div>
      </section>

      {/* ── INTRO QUOTE ──────────────────────────────── */}
      <section className="intro-quote-section">
        <div className="container">
          <blockquote className="intro-quote">
            <p>"Conscious dying isn't morbid. It's the most honest thing you can do with the time you have."</p>
            <cite>— Kalesh</cite>
          </blockquote>
        </div>
      </section>

      {/* ── WHAT THIS SITE IS ────────────────────────── */}
      <section className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <div className="section-label">The Work</div>
              <h2>What If Preparing for Death Is What Teaches You How to Live?</h2>
              <p>
                The culture's terror of death is not your terror. You can put that down. Every tradition that has looked honestly at mortality — Tibetan Buddhism, Vedanta, the death positive movement, modern palliative care — has arrived at the same quiet truth: the person who has made peace with death lives differently.
              </p>
              <p>
                Not recklessly. Not morbidly. With a quality of presence that the death-denying mind can't access.
              </p>
              <p>
                This site is for that work. Practical and spiritual. Unflinching and warm. The fire-lit room, not the hospital corridor.
              </p>
              <Link to="/about" className="btn btn-ghost">About Kalesh →</Link>
            </div>
            <div className="about-features">
              {[
                { icon: '◆', title: 'Depth Without Bypass', desc: 'No "they\'re in a better place" platitudes. The Vedantic truth is earned through honesty, not offered as a platitude.' },
                { icon: '○', title: 'Practical & Spiritual', desc: 'Advance directives and death meditation. Legacy letters and Tibetan bardo teachings. Both matter.' },
                { icon: '◇', title: 'Unflinching Warmth', desc: 'Death preparation demands gravitas. But warm — this is a fire-lit room, not a hospital corridor.' },
                { icon: '●', title: 'Evidence-Based', desc: 'Grounded in Stephen Levine, Sogyal Rinpoche, Frank Ostaseski, and modern palliative research.' },
              ].map((f, i) => (
                <div key={i} className="feature-card">
                  <div className="feature-icon-wrap">
                    <span className="feature-icon">{f.icon}</span>
                  </div>
                  <div className="feature-body">
                    <h3>{f.title}</h3>
                    <p>{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────────── */}
      <section className="categories-section">
        <div className="container">
          <div className="section-label center">Explore by Topic</div>
          <h2 className="section-title center">Five Doorways Into the Work</h2>
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <Link key={cat.id} to={`/articles?category=${cat.id}`} className="category-card">
                <div className="cat-icon-wrap">
                  <span className="cat-icon">{cat.icon}</span>
                </div>
                <h3 className="cat-label">{cat.label}</h3>
                <p className="cat-desc">{cat.desc}</p>
                <span className="cat-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── RECENT ARTICLES ──────────────────────────── */}
      <section className="articles-section">
        <div className="container">
          <div className="section-header">
            <div>
              <div className="section-label">From the Archive</div>
              <h2 className="section-title left">Recent Articles</h2>
            </div>
            <Link to="/articles" className="see-all-link">See all 30 articles →</Link>
          </div>

          {loading ? (
            <div className="articles-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card-skeleton">
                  <div className="skeleton" style={{ height: '200px', marginBottom: '1rem', borderRadius: '8px' }} />
                  <div className="skeleton" style={{ height: '0.7rem', marginBottom: '0.5rem', width: '40%' }} />
                  <div className="skeleton" style={{ height: '1.4rem', marginBottom: '0.75rem' }} />
                  <div className="skeleton" style={{ height: '0.9rem', marginBottom: '0.4rem', width: '90%' }} />
                  <div className="skeleton" style={{ height: '0.9rem', width: '70%' }} />
                </div>
              ))}
            </div>
          ) : articles.length > 0 ? (
            <div className="articles-grid">
              {articles.map((article, i) => (
                <ArticleCard key={article.id} article={article} featured={i === 0} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Articles are being prepared. Check back soon.</p>
            </div>
          )}

          <div className="section-cta">
            <Link to="/articles" className="btn btn-primary">Browse All 30 Articles</Link>
          </div>
        </div>
      </section>

      {/* ── ASSESSMENT CTA ───────────────────────────── */}
      <section className="assessment-cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-card-bg">
              <img
                src="https://meditative-dying.b-cdn.net/articles/death-meditation.webp"
                alt=""
                aria-hidden="true"
                className="cta-bg-img"
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
              />
              <div className="cta-bg-overlay" />
            </div>
            <div className="cta-content">
              <div className="section-label">Self-Assessment</div>
              <h2>How Prepared Are You for Death?</h2>
              <p>
                Not in a morbid way. In the way that matters. Take the Death Readiness Assessment — 10 questions that reveal where you are in your relationship with mortality, and what might be worth exploring next.
              </p>
              <div className="cta-actions">
                <Link to="/assessment" className="btn btn-primary">Take the Assessment</Link>
                <Link to="/quiz" className="btn btn-outline">Knowledge Quiz</Link>
              </div>
            </div>
            <div className="cta-visual">
              <div className="cta-flame-icon">◆</div>
              <blockquote className="cta-quote">
                <p>"The question isn't whether you'll die. The question is whether you'll be present for it."</p>
                <cite>— Kalesh</cite>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ── LIBRARY TEASER ───────────────────────────── */}
      <section className="library-teaser-section">
        <div className="container">
          <div className="library-teaser-inner">
            <div className="library-teaser-text">
              <div className="section-label">The Crossing Library</div>
              <h2>Tools for the Work</h2>
              <p>
                Books, planning tools, and meditation supplies chosen with exceptional care. No "buy this for your dying mother" energy. These are tools for the person preparing, for the caregiver, for the one sitting at the threshold.
              </p>
              <Link to="/library" className="btn btn-ghost">Browse the Library →</Link>
            </div>
            <div className="library-teaser-books">
              {[
                { title: 'Who Dies?', author: 'Stephen Levine', tag: 'Essential' },
                { title: 'The Tibetan Book of Living and Dying', author: 'Sogyal Rinpoche', tag: 'Essential' },
                { title: 'The Five Invitations', author: 'Frank Ostaseski', tag: 'Essential' },
                { title: 'The Grace in Dying', author: 'K.D. Singh', tag: 'Spiritual Depth' },
              ].map((book, i) => (
                <div key={i} className="book-card">
                  <div className="book-spine">
                    <span className="book-icon">◆</span>
                  </div>
                  <div className="book-info">
                    <div className="book-tag">{book.tag}</div>
                    <div className="book-title">{book.title}</div>
                    <div className="book-author">{book.author}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CLOSING QUOTE ────────────────────────────── */}
      <section className="closing-section">
        <div className="container">
          <div className="closing-inner">
            <div className="closing-flame">◆</div>
            <p className="closing-text">
              "You've been preparing for this your entire existence. You just didn't know it."
            </p>
            <p className="closing-author">
              — <a href="https://kalesh.love" target="_blank" rel="noopener noreferrer">Kalesh</a>
            </p>
          </div>
        </div>
      </section>

      <style>{`
        /* ── HERO ──────────────────────────────────── */
        .hero {
          position: relative;
          min-height: 92vh;
          display: flex;
          align-items: center;
          overflow: hidden;
          background: #0E0C0A;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
          opacity: 0.45;
          transition: opacity 0.5s ease;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to right, rgba(14,12,10,0.92) 0%, rgba(14,12,10,0.55) 60%, rgba(14,12,10,0.3) 100%),
            linear-gradient(to top, rgba(14,12,10,0.8) 0%, transparent 50%);
          z-index: 1;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          padding-top: 8rem;
          padding-bottom: 8rem;
          max-width: 760px;
        }

        .hero-eyebrow {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-family: var(--font-sans);
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 1.75rem;
        }

        .eyebrow-dot {
          font-size: 0.55rem;
          opacity: 0.8;
        }

        .hero-title {
          font-family: var(--font-display);
          font-size: clamp(2.2rem, 5.5vw, 4rem);
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.1;
          margin-bottom: 1.75rem;
          letter-spacing: -0.01em;
        }

        .hero-accent {
          color: var(--accent);
          display: block;
          font-style: italic;
        }

        .hero-subtitle {
          font-family: var(--font-serif);
          font-size: clamp(1rem, 2.2vw, 1.2rem);
          color: var(--text-secondary);
          line-height: 1.75;
          margin-bottom: 2.5rem;
          max-width: 580px;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 2rem;
        }

        .hero-author {
          font-family: var(--font-sans);
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .hero-author a {
          color: var(--accent);
          text-decoration: none;
          font-weight: 500;
        }

        .hero-author a:hover { color: var(--accent-hover); }

        .hero-scroll-hint {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
          color: var(--accent);
          font-size: 0.6rem;
          opacity: 0.5;
          animation: bounce 2s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(6px); }
        }

        /* ── BUTTONS ───────────────────────────────── */
        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.8em 2em;
          border-radius: 4px;
          font-family: var(--font-sans);
          font-size: 0.875rem;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          border: none;
          transition: all 0.25s ease;
          min-height: 44px;
          letter-spacing: 0.03em;
          white-space: nowrap;
        }

        .btn-primary {
          background: var(--accent);
          color: #1A1612;
        }

        .btn-primary:hover {
          background: var(--accent-hover);
          color: #1A1612;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(212, 168, 87, 0.4);
          text-decoration: none;
        }

        .btn-outline {
          background: transparent;
          color: var(--text-primary);
          border: 1px solid rgba(232, 223, 208, 0.35);
        }

        .btn-outline:hover {
          border-color: var(--accent);
          color: var(--accent);
          text-decoration: none;
        }

        .btn-ghost {
          background: transparent;
          color: var(--accent);
          padding-left: 0;
          padding-right: 0;
          text-decoration: none;
          font-size: 0.9rem;
        }

        .btn-ghost:hover {
          color: var(--accent-hover);
          text-decoration: none;
        }

        /* ── SECTION LABELS ────────────────────────── */
        .section-label {
          font-family: var(--font-sans);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 0.75rem;
        }

        .section-label.center { text-align: center; }

        .section-title {
          font-family: var(--font-display);
          font-size: clamp(1.5rem, 3vw, 2.2rem);
          color: var(--text-primary);
          margin-bottom: 2.5rem;
          margin-top: 0;
        }

        .section-title.center { text-align: center; }
        .section-title.left { text-align: left; margin-bottom: 0; }

        /* ── INTRO QUOTE ───────────────────────────── */
        .intro-quote-section {
          padding: 5rem 0;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }

        .intro-quote {
          max-width: 680px;
          margin: 0 auto;
          text-align: center;
          border: none;
          background: none;
          padding: 0;
        }

        .intro-quote p {
          font-family: var(--font-display);
          font-size: clamp(1.3rem, 3vw, 1.8rem);
          font-style: italic;
          color: var(--text-primary);
          line-height: 1.5;
          margin-bottom: 1.25rem;
        }

        .intro-quote cite {
          font-family: var(--font-sans);
          font-size: 0.85rem;
          color: var(--accent);
          font-style: normal;
          letter-spacing: 0.06em;
        }

        /* ── ABOUT SECTION ─────────────────────────── */
        .about-section {
          padding: 6rem 0;
        }

        .about-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 4rem;
        }

        @media (min-width: 900px) {
          .about-grid {
            grid-template-columns: 1.1fr 0.9fr;
            align-items: start;
          }
        }

        .about-text h2 {
          font-size: clamp(1.4rem, 3vw, 2rem);
          margin-bottom: 1.5rem;
          margin-top: 0.5rem;
          color: var(--text-primary);
          line-height: 1.25;
        }

        .about-text p {
          color: var(--text-secondary);
          margin-bottom: 1.25rem;
          font-family: var(--font-serif);
          font-size: 1.05rem;
          line-height: 1.75;
        }

        .about-features {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .feature-card {
          display: flex;
          gap: 1.25rem;
          padding: 1.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-left: 3px solid var(--accent);
          border-radius: 0 8px 8px 0;
          transition: border-color 0.25s ease, transform 0.25s ease;
        }

        .feature-card:hover {
          border-left-color: var(--accent-hover);
          transform: translateX(3px);
        }

        .feature-icon-wrap {
          flex-shrink: 0;
          width: 2.5rem;
          height: 2.5rem;
          background: rgba(212, 168, 87, 0.12);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .feature-icon {
          font-size: 0.9rem;
          color: var(--accent);
        }

        .feature-body h3 {
          font-family: var(--font-sans);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.35rem;
          margin-top: 0;
        }

        .feature-body p {
          font-family: var(--font-sans);
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.55;
        }

        /* ── CATEGORIES ────────────────────────────── */
        .categories-section {
          padding: 6rem 0;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-subtle);
          border-bottom: 1px solid var(--border-subtle);
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1.25rem;
        }

        .category-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 2rem 1.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }

        .category-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(212,168,87,0.06) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        .category-card:hover {
          border-color: rgba(212, 168, 87, 0.4);
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          text-decoration: none;
        }

        .category-card:hover::before { opacity: 1; }

        .cat-icon-wrap {
          width: 2.75rem;
          height: 2.75rem;
          background: rgba(212, 168, 87, 0.15);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.25s ease;
        }

        .category-card:hover .cat-icon-wrap {
          background: rgba(212, 168, 87, 0.25);
        }

        .cat-icon {
          font-size: 1rem;
          color: var(--accent);
        }

        .cat-label {
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          letter-spacing: 0.01em;
        }

        .cat-desc {
          font-family: var(--font-sans);
          font-size: 0.78rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.5;
          flex: 1;
        }

        .cat-arrow {
          font-size: 0.85rem;
          color: var(--accent);
          opacity: 0;
          transition: opacity 0.25s ease, transform 0.25s ease;
          transform: translateX(-4px);
        }

        .category-card:hover .cat-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        /* ── ARTICLES SECTION ──────────────────────── */
        .articles-section {
          padding: 6rem 0;
        }

        .section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 3rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .see-all-link {
          font-family: var(--font-sans);
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--accent);
          text-decoration: none;
          white-space: nowrap;
          padding-bottom: 0.25rem;
          border-bottom: 1px solid rgba(212, 168, 87, 0.3);
          transition: border-color 0.2s ease, color 0.2s ease;
        }

        .see-all-link:hover {
          color: var(--accent-hover);
          border-color: var(--accent-hover);
          text-decoration: none;
        }

        .articles-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
        }

        @media (min-width: 640px) {
          .articles-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (min-width: 1024px) {
          .articles-grid { grid-template-columns: repeat(3, 1fr); }
        }

        .section-cta {
          text-align: center;
          margin-top: 4rem;
          padding-top: 3rem;
          border-top: 1px solid var(--border-subtle);
        }

        .empty-state {
          text-align: center;
          padding: 4rem;
          color: var(--text-muted);
          font-family: var(--font-serif);
          font-style: italic;
        }

        .card-skeleton {
          background: var(--bg-card);
          border-radius: 8px;
          padding: 0;
          overflow: hidden;
        }

        /* ── ASSESSMENT CTA ────────────────────────── */
        .assessment-cta-section {
          padding: 6rem 0;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }

        .cta-card {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 3.5rem;
          position: relative;
          overflow: hidden;
        }

        @media (min-width: 900px) {
          .cta-card {
            grid-template-columns: 1.2fr 0.8fr;
            align-items: center;
          }
        }

        .cta-card-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        .cta-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.08;
        }

        .cta-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--bg-elevated) 30%, transparent 100%);
        }

        .cta-content {
          position: relative;
          z-index: 1;
        }

        .cta-content h2 {
          font-size: clamp(1.4rem, 3vw, 2rem);
          margin-bottom: 1rem;
          margin-top: 0.5rem;
          color: var(--text-primary);
        }

        .cta-content p {
          color: var(--text-secondary);
          margin-bottom: 2rem;
          font-family: var(--font-serif);
          font-size: 1.05rem;
          line-height: 1.7;
        }

        .cta-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .cta-visual {
          position: relative;
          z-index: 1;
          text-align: center;
          padding: 2rem;
          border-left: 1px solid var(--border-subtle);
        }

        @media (max-width: 899px) {
          .cta-visual {
            border-left: none;
            border-top: 1px solid var(--border-subtle);
          }
        }

        .cta-flame-icon {
          font-size: 2.5rem;
          color: var(--accent);
          margin-bottom: 1.5rem;
          opacity: 0.8;
        }

        .cta-quote {
          border: none;
          background: none;
          padding: 0;
          margin: 0;
        }

        .cta-quote p {
          font-family: var(--font-display);
          font-size: 1.05rem;
          font-style: italic;
          color: var(--text-secondary);
          line-height: 1.6;
          margin-bottom: 0.75rem;
        }

        .cta-quote cite {
          font-family: var(--font-sans);
          font-size: 0.8rem;
          color: var(--accent);
          font-style: normal;
        }

        /* ── LIBRARY TEASER ────────────────────────── */
        .library-teaser-section {
          padding: 6rem 0;
        }

        .library-teaser-inner {
          display: grid;
          grid-template-columns: 1fr;
          gap: 4rem;
        }

        @media (min-width: 900px) {
          .library-teaser-inner {
            grid-template-columns: 1fr 1fr;
            align-items: center;
          }
        }

        .library-teaser-text h2 {
          font-size: clamp(1.4rem, 3vw, 2rem);
          margin-bottom: 1rem;
          margin-top: 0.5rem;
        }

        .library-teaser-text p {
          color: var(--text-secondary);
          font-family: var(--font-serif);
          font-size: 1.05rem;
          line-height: 1.75;
          margin-bottom: 2rem;
        }

        .library-teaser-books {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .book-card {
          display: flex;
          gap: 1.25rem;
          align-items: center;
          padding: 1.25rem 1.5rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: 8px;
          transition: border-color 0.25s ease, transform 0.25s ease;
        }

        .book-card:hover {
          border-color: var(--border);
          transform: translateX(4px);
        }

        .book-spine {
          width: 2.5rem;
          height: 2.5rem;
          background: rgba(212, 168, 87, 0.12);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .book-icon {
          font-size: 0.75rem;
          color: var(--accent);
        }

        .book-tag {
          font-family: var(--font-sans);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 0.2rem;
        }

        .book-title {
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.15rem;
        }

        .book-author {
          font-family: var(--font-sans);
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        /* ── CLOSING QUOTE ─────────────────────────── */
        .closing-section {
          padding: 7rem 0;
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
        }

        .closing-inner {
          max-width: 640px;
          margin: 0 auto;
          text-align: center;
        }

        .closing-flame {
          font-size: 1rem;
          color: var(--accent);
          margin-bottom: 2rem;
          opacity: 0.6;
        }

        .closing-text {
          font-family: var(--font-display);
          font-size: clamp(1.2rem, 3vw, 1.7rem);
          font-style: italic;
          color: var(--text-primary);
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }

        .closing-author {
          font-family: var(--font-sans);
          font-size: 0.9rem;
          color: var(--accent);
          margin: 0;
        }

        .closing-author a {
          color: var(--accent);
          text-decoration: none;
          font-weight: 500;
        }

        .closing-author a:hover { color: var(--accent-hover); }
      `}</style>
    </div>
  );
}
