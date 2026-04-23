import React from 'react';
import { Link } from 'react-router-dom';

export function AboutPage() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="container">
          <div className="about-hero-content">
            <div className="about-avatar">K</div>
            <div>
              <h1>Kalesh</h1>
              <p className="about-title">Consciousness Teacher & Writer</p>
              <a href="https://kalesh.love" target="_blank" rel="noopener noreferrer" className="about-site-link">
                kalesh.love &rarr;
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="about-body content-width">
          <div className="about-quote">
            <p>"Death is not the opposite of life. It's the opposite of birth. Life has no opposite."</p>
          </div>

          <h2>About This Work</h2>
          <p>
            This site exists because most people in the modern world are completely unprepared for the most certain event of their lives. Not unprepared in a moral sense - unprepared in the way that a culture systematically removes death from view, medicalizes it, institutionalizes it, and leaves individuals alone with their terror when it finally arrives.
          </p>
          <p>
            That's not how it has to be. Every tradition that has looked honestly at mortality - Tibetan Buddhism, Vedanta, the death positive movement, modern palliative care - has arrived at the same quiet conclusion: the person who has made peace with death lives differently. Not recklessly. Not morbidly. With a quality of presence that the death-denying mind can't access.
          </p>
          <p>
            The Conscious Crossing is for that work. Practical and spiritual. Unflinching and warm. The fire-lit room, not the hospital corridor.
          </p>

          <h2>The Approach</h2>
          <p>
            This site walks a razor's edge. It has to be unflinching about death without being morbid, spiritual without bypassing grief, practical without being clinical. The Vedantic truth is deployed here - Atman does not die, what dies was always temporary - but it's earned through honesty, not offered as a platitude.
          </p>
          <p>
            No "they're in a better place" bypassing. No "death is just a transition" spoken casually. The culture's terror of death is not your terror. You can put that down. But you have to actually put it down - not just say the words.
          </p>
          <p>
            The researchers and teachers whose work informs this site include Stephen Levine, Sogyal Rinpoche, Frank Ostaseski, Kathleen Dowling Singh, Roshi Joan Halifax, Caitlin Doughty, Ira Byock, and Elisabeth Kübler-Ross - used critically, not reverently.
          </p>

          <h2>A Note on Voice</h2>
          <p>
            The writing here is direct. It uses contractions. It has opinions. It doesn't hedge. That's intentional. Death is too important for the kind of careful, hedged, liability-aware language that most writing about it uses.
          </p>
          <p>
            "Conscious dying isn't morbid. It's the most honest thing you can do with the time you have."
          </p>
          <p>
            "What if preparing for death is actually what teaches you how to live?"
          </p>
          <p>
            "The Tibetans call it bardo. The Vedantists call it dissolution. Your grandmother called it 'crossing over.' They're all pointing at the same door."
          </p>

          <div className="about-cta">
            <h3>Start Here</h3>
            <div className="about-cta-links">
              <Link to="/assessment" className="cta-link">
                <span className="cta-link-icon">&#9670;</span>
                <div>
                  <strong>Take the Death Readiness Assessment</strong>
                  <p>10 questions that reveal where you are in your relationship with mortality.</p>
                </div>
              </Link>
              <Link to="/quiz" className="cta-link">
                <span className="cta-link-icon">&#9675;</span>
                <div>
                  <strong>Take the Knowledge Quiz</strong>
                  <p>Test what you know about conscious dying, Tibetan Buddhism, and practical end-of-life planning.</p>
                </div>
              </Link>
              <Link to="/articles" className="cta-link">
                <span className="cta-link-icon">&#9671;</span>
                <div>
                  <strong>Read the Articles</strong>
                  <p>30+ articles on death preparation, spiritual practice, and the art of dying well.</p>
                </div>
              </Link>
              <a href="https://kalesh.love" target="_blank" rel="noopener noreferrer" className="cta-link">
                <span className="cta-link-icon">&#9679;</span>
                <div>
                  <strong>Visit kalesh.love</strong>
                  <p>The full body of Kalesh's work on consciousness, spirituality, and the examined life.</p>
                </div>
              </a>
            </div>
          </div>

          <div className="health-disclaimer">
            <strong>A note:</strong> Content on this site is for educational and reflective purposes only. It is not medical advice. If you or someone you love is facing a terminal diagnosis or end-of-life decisions, please consult with your healthcare team and consider working with a palliative care specialist or death doula.
          </div>
        </div>
      </div>

      <style>{`
        .about-page {
          padding-bottom: var(--space-3xl);
        }

        .about-hero {
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
          padding: var(--space-3xl) 0;
          margin-bottom: var(--space-3xl);
        }

        .about-hero-content {
          display: flex;
          align-items: center;
          gap: var(--space-xl);
          flex-wrap: wrap;
        }

        .about-avatar {
          width: 96px;
          height: 96px;
          border-radius: 50%;
          background: var(--accent);
          color: #1E1B18;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 2.5rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .about-hero h1 {
          margin-bottom: var(--space-xs);
          font-size: clamp(1.8rem, 4vw, 2.5rem);
        }

        .about-title {
          font-family: var(--font-sans);
          color: var(--text-secondary);
          font-size: 1rem;
          margin-bottom: var(--space-sm);
        }

        .about-site-link {
          font-family: var(--font-sans);
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--accent);
          text-decoration: none;
        }

        .about-site-link:hover { color: var(--accent-hover); }

        .about-body {
          padding-bottom: var(--space-3xl);
        }

        .about-quote {
          background: var(--bg-elevated);
          border-left: 3px solid var(--accent);
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
          padding: var(--space-xl);
          margin-bottom: var(--space-2xl);
        }

        .about-quote p {
          font-family: var(--font-display);
          font-style: italic;
          font-size: clamp(1.1rem, 2.5vw, 1.4rem);
          color: var(--text-primary);
          margin: 0;
          line-height: 1.5;
        }

        .about-body h2 {
          color: var(--accent);
          border-bottom: 1px solid var(--border);
          padding-bottom: var(--space-sm);
        }

        .about-body p {
          color: var(--text-secondary);
          font-family: var(--font-serif);
        }

        .about-cta {
          margin-top: var(--space-3xl);
          padding-top: var(--space-2xl);
          border-top: 1px solid var(--border-subtle);
        }

        .about-cta h3 {
          font-family: var(--font-sans);
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: var(--space-xl);
          margin-top: 0;
        }

        .about-cta-links {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .cta-link {
          display: flex;
          gap: var(--space-md);
          align-items: flex-start;
          padding: var(--space-lg);
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          text-decoration: none;
          transition: all var(--transition-base);
        }

        .cta-link:hover {
          border-color: var(--accent);
          background: var(--accent-dim);
        }

        .cta-link-icon {
          font-size: 1rem;
          color: var(--accent);
          flex-shrink: 0;
          margin-top: 3px;
        }

        .cta-link strong {
          display: block;
          font-family: var(--font-sans);
          font-size: 0.95rem;
          color: var(--text-primary);
          margin-bottom: var(--space-xs);
        }

        .cta-link p {
          font-family: var(--font-sans);
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 0;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
