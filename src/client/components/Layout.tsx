import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="site-wrapper">
      <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
        <div className="header-inner container">
          <Link to="/" className="site-logo" aria-label="The Conscious Crossing Home">
            <span className="logo-flame">&#9670;</span>
            <span className="logo-text">
              <span className="logo-title">The Conscious Crossing</span>
              <span className="logo-sub">Death as Spiritual Practice</span>
            </span>
          </Link>

          <nav className="main-nav" aria-label="Main navigation">
            <ul className="nav-list">
              <li><Link to="/articles" className={location.pathname.startsWith('/articles') ? 'active' : ''}>Articles</Link></li>
              <li><Link to="/assessment" className={location.pathname === '/assessment' ? 'active' : ''}>Assessment</Link></li>
              <li><Link to="/quiz" className={location.pathname === '/quiz' ? 'active' : ''}>Quiz</Link></li>
              <li><Link to="/library" className={location.pathname === '/library' ? 'active' : ''}>The Library</Link></li>
              <li><Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About</Link></li>
            </ul>
          </nav>

          <button
            className={`menu-toggle${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span></span><span></span><span></span>
          </button>
        </div>

        {menuOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            <ul>
              <li><Link to="/articles">Articles</Link></li>
              <li><Link to="/assessment">Assessment</Link></li>
              <li><Link to="/quiz">Quiz</Link></li>
              <li><Link to="/library">The Library</Link></li>
              <li><Link to="/about">About</Link></li>
            </ul>
          </nav>
        )}
      </header>

      <main id="main-content" className="site-main">
        {children}
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <span className="logo-flame">&#9670;</span> The Conscious Crossing
              </Link>
              <p className="footer-tagline">
                For those who know they're going to die - which is everyone - and want to meet that reality with clarity and depth.
              </p>
              <p className="footer-author">
                Written by <a href="https://kalesh.love" target="_blank" rel="noopener noreferrer">Kalesh</a>, Consciousness Teacher & Writer
              </p>
            </div>

            <div className="footer-nav">
              <h4>Explore</h4>
              <ul>
                <li><Link to="/articles">All Articles</Link></li>
                <li><Link to="/assessment">Death Readiness Assessment</Link></li>
                <li><Link to="/quiz">Knowledge Quiz</Link></li>
                <li><Link to="/library">The Crossing Library</Link></li>
                <li><Link to="/about">About Kalesh</Link></li>
              </ul>
            </div>

            <div className="footer-categories">
              <h4>Topics</h4>
              <ul>
                <li><Link to="/articles?category=conscious-dying">Conscious Dying</Link></li>
                <li><Link to="/articles?category=tibetan-buddhism">Tibetan Buddhism</Link></li>
                <li><Link to="/articles?category=grief">Grief & Loss</Link></li>
                <li><Link to="/articles?category=practical">Practical Planning</Link></li>
                <li><Link to="/articles?category=spiritual">Spiritual Practice</Link></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-disclaimer">
              Content on this site is for educational and reflective purposes only. It is not medical advice.
              If you or someone you love is facing end-of-life decisions, please consult with your healthcare team.
            </p>
            <p className="footer-affiliate">
              As an Amazon Associate, I earn from qualifying purchases. Links marked (paid link) are affiliate links.
            </p>
            <p className="footer-copy">
              &copy; {new Date().getFullYear()} The Conscious Crossing. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        .site-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .site-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(30, 27, 24, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid transparent;
          transition: border-color var(--transition-base), box-shadow var(--transition-base);
        }

        .site-header.scrolled {
          border-bottom-color: var(--border);
          box-shadow: 0 2px 20px rgba(0,0,0,0.4);
        }

        .header-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
          gap: var(--space-lg);
        }

        .site-logo {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          text-decoration: none;
          flex-shrink: 0;
        }

        .logo-flame {
          color: var(--accent);
          font-size: 1.4rem;
          line-height: 1;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .logo-title {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.1;
          letter-spacing: -0.01em;
        }

        .logo-sub {
          font-family: var(--font-sans);
          font-size: 0.65rem;
          color: var(--text-muted);
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .main-nav { display: none; }

        @media (min-width: 900px) {
          .main-nav { display: block; }
          .menu-toggle { display: none; }
        }

        .nav-list {
          display: flex;
          list-style: none;
          padding: 0;
          margin: 0;
          gap: var(--space-lg);
        }

        .nav-list a {
          font-family: var(--font-sans);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          letter-spacing: 0.03em;
          padding: var(--space-xs) 0;
          border-bottom: 2px solid transparent;
          transition: color var(--transition-fast), border-color var(--transition-fast);
        }

        .nav-list a:hover,
        .nav-list a.active {
          color: var(--accent);
          border-bottom-color: var(--accent);
        }

        .menu-toggle {
          display: flex;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: var(--space-sm);
          min-width: var(--tap-target-min);
          min-height: var(--tap-target-min);
          align-items: center;
          justify-content: center;
        }

        .menu-toggle span {
          display: block;
          width: 22px;
          height: 2px;
          background: var(--text-primary);
          border-radius: 2px;
          transition: transform var(--transition-fast), opacity var(--transition-fast);
        }

        .menu-toggle.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .menu-toggle.open span:nth-child(2) { opacity: 0; }
        .menu-toggle.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        .mobile-nav {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
          padding: var(--space-lg) var(--space-xl);
        }

        .mobile-nav ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .mobile-nav a {
          font-family: var(--font-sans);
          font-size: 1rem;
          font-weight: 500;
          color: var(--text-primary);
          text-decoration: none;
          display: block;
          padding: var(--space-sm) 0;
          border-bottom: 1px solid var(--border-subtle);
        }

        .site-main {
          flex: 1;
        }

        .site-footer {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
          padding: var(--space-3xl) 0 var(--space-xl);
          margin-top: var(--space-3xl);
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-2xl);
          margin-bottom: var(--space-2xl);
        }

        @media (min-width: 768px) {
          .footer-grid {
            grid-template-columns: 2fr 1fr 1fr;
          }
        }

        .footer-logo {
          font-family: var(--font-display);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          margin-bottom: var(--space-md);
        }

        .footer-tagline {
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: var(--space-md);
          font-family: var(--font-serif);
        }

        .footer-author {
          font-size: 0.85rem;
          color: var(--text-muted);
          font-family: var(--font-sans);
        }

        .footer-author a {
          color: var(--accent);
        }

        .footer-nav h4,
        .footer-categories h4 {
          font-family: var(--font-sans);
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: var(--space-md);
        }

        .footer-nav ul,
        .footer-categories ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .footer-nav a,
        .footer-categories a {
          font-family: var(--font-sans);
          font-size: 0.875rem;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .footer-nav a:hover,
        .footer-categories a:hover {
          color: var(--accent);
        }

        .footer-bottom {
          border-top: 1px solid var(--border-subtle);
          padding-top: var(--space-lg);
          display: flex;
          flex-direction: column;
          gap: var(--space-sm);
        }

        .footer-disclaimer,
        .footer-affiliate,
        .footer-copy {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-family: var(--font-sans);
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
