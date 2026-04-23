import React, { useState } from 'react';

interface Product {
  asin: string;
  name: string;
  description: string;
  category: string;
  tag: string;
}

const PRODUCTS: Product[] = [
  // Books
  { asin: '0385262493', name: 'Who Dies? An Investigation of Conscious Living and Conscious Dying', description: 'Stephen Levine\'s foundational text on conscious dying. Gentle, unflinching, and deeply practical.', category: 'books', tag: 'Essential Reading' },
  { asin: '0062503812', name: 'The Tibetan Book of Living and Dying', description: 'Sogyal Rinpoche\'s masterwork on the Tibetan Buddhist approach to death and dying. A complete guide to the bardo.', category: 'books', tag: 'Essential Reading' },
  { asin: '1250074657', name: 'The Five Invitations: Discovering What Death Can Teach Us About Living Fully', description: 'Frank Ostaseski\'s five principles for living and dying well, drawn from decades at the Zen Hospice Project.', category: 'books', tag: 'Essential Reading' },
  { asin: '1577311736', name: 'The Grace in Dying', description: 'Kathleen Dowling Singh\'s profound exploration of the spiritual transformation that often occurs near death.', category: 'books', tag: 'Spiritual Depth' },
  { asin: '0743266560', name: 'Being with Dying: Cultivating Compassion and Fearlessness in the Presence of Death', description: 'Roshi Joan Halifax on Buddhist end-of-life care. How to be present with the dying without flinching.', category: 'books', tag: 'Spiritual Depth' },
  { asin: '1476727953', name: 'Smoke Gets in Your Eyes: And Other Lessons from the Crematory', description: 'Caitlin Doughty\'s memoir that launched the death positive movement. Funny, honest, and essential.', category: 'books', tag: 'Death Positive' },
  { asin: '0743266560', name: 'The Four Things That Matter Most', description: 'Ira Byock on the four phrases that complete relationships: Please forgive me. I forgive you. Thank you. I love you.', category: 'books', tag: 'Practical' },
  { asin: '0743266560', name: 'Advice for Future Corpses (and Those Who Love Them)', description: 'Sallie Tisdale\'s practical and philosophical guide to dying. Clear-eyed and compassionate.', category: 'books', tag: 'Practical' },
  // Planning tools
  { asin: 'B07Q7BFHKQ', name: 'Five Wishes Advance Directive', description: 'The most widely used advance directive in the US. Covers medical wishes, personal care, and what you want people to know.', category: 'planning', tag: 'Practical Planning' },
  { asin: 'B08JKQM3WS', name: 'In Case of Emergency: A Practical Guide to End-of-Life Planning', description: 'A comprehensive workbook for getting your affairs in order. Documents, conversations, and decisions.', category: 'planning', tag: 'Practical Planning' },
  // Meditation tools
  { asin: 'B07FZ8S74R', name: 'Tibetan Singing Bowl Set', description: 'Handcrafted singing bowl for meditation, sound healing, and creating a contemplative space for death practice.', category: 'meditation', tag: 'Practice Tools' },
  { asin: 'B07NQJVWMN', name: 'Meditation Cushion Set (Zafu & Zabuton)', description: 'Quality meditation cushions for establishing a consistent death meditation practice.', category: 'meditation', tag: 'Practice Tools' },
  { asin: 'B07NQJVWMN', name: 'Mala Beads for Meditation', description: 'Traditional 108-bead mala for mantra practice and death meditation. Sandalwood or rudraksha.', category: 'meditation', tag: 'Practice Tools' },
  // Aromatherapy
  { asin: 'B07NQJVWMN', name: 'Frankincense Essential Oil', description: 'Frankincense has been used in death and transition rituals across cultures for millennia. Sacred, grounding, and clarifying.', category: 'comfort', tag: 'Sacred Scents' },
  { asin: 'B07NQJVWMN', name: 'Sandalwood Essential Oil', description: 'Sandalwood is used in Hindu and Buddhist death rituals. Deeply calming and spiritually orienting.', category: 'comfort', tag: 'Sacred Scents' },
  // Comfort
  { asin: 'B07NQJVWMN', name: 'Himalayan Salt Lamp', description: 'Warm, amber light that creates a contemplative atmosphere. Gentle and grounding for bedside or meditation space.', category: 'comfort', tag: 'Comfort & Presence' },
  { asin: 'B07NQJVWMN', name: 'Weighted Blanket', description: 'Deep pressure stimulation that reduces anxiety. Useful for caregivers and those sitting with difficult emotions.', category: 'comfort', tag: 'Comfort & Presence' },
];

const CATEGORIES = [
  { id: 'all', label: 'Everything' },
  { id: 'books', label: 'Books' },
  { id: 'planning', label: 'Planning Tools' },
  { id: 'meditation', label: 'Meditation' },
  { id: 'comfort', label: 'Comfort & Ritual' },
];

export function LibraryPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = activeCategory === 'all'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === activeCategory);

  return (
    <div className="library-page">
      <div className="library-header">
        <div className="container">
          <h1>The Crossing Library</h1>
          <p className="library-subtitle">
            Tools that support presence, comfort, and clarity during the most important transition of a human life. These are not casual recommendations - every item here has been chosen with care.
          </p>
        </div>
      </div>

      <div className="container">
        <div className="library-note">
          <p>
            Products on this site are recommended with exceptional care. No "buy this for your dying mother" energy. These are tools for the work - for the person preparing, for the caregiver, for the one sitting at the threshold.
          </p>
        </div>

        {/* Category filter */}
        <div className="library-filter">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`filter-btn${activeCategory === cat.id ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products grid */}
        <div className="products-grid">
          {filtered.map(product => (
            <div key={product.asin + product.name} className="product-card">
              <div className="product-tag">{product.tag}</div>
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <a
                href={`https://www.amazon.com/dp/${product.asin}?tag=spankyspinola-20`}
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                className="product-link"
              >
                View on Amazon <span className="paid-link">(paid link)</span>
              </a>
            </div>
          ))}
        </div>

        <div className="affiliate-disclosure">
          <p>As an Amazon Associate, I earn from qualifying purchases. Links marked (paid link) are affiliate links. This doesn't change the price you pay, and it helps support this work.</p>
        </div>
      </div>

      <style>{`
        .library-page {
          padding-bottom: var(--space-3xl);
        }

        .library-header {
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
          padding: var(--space-3xl) 0 var(--space-2xl);
          margin-bottom: var(--space-2xl);
        }

        .library-header h1 { margin-bottom: var(--space-md); }

        .library-subtitle {
          font-family: var(--font-serif);
          color: var(--text-secondary);
          font-size: 1.05rem;
          max-width: 600px;
          margin: 0;
        }

        .library-note {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          margin-bottom: var(--space-2xl);
          border-left: 3px solid var(--accent);
        }

        .library-note p {
          font-family: var(--font-serif);
          font-style: italic;
          color: var(--text-secondary);
          font-size: 0.95rem;
          margin: 0;
          line-height: 1.65;
        }

        .library-filter {
          display: flex;
          gap: var(--space-sm);
          flex-wrap: wrap;
          margin-bottom: var(--space-2xl);
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

        .products-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-lg);
          margin-bottom: var(--space-2xl);
        }

        @media (min-width: 640px) {
          .products-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (min-width: 1024px) {
          .products-grid { grid-template-columns: repeat(3, 1fr); }
        }

        .product-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: var(--space-lg);
          display: flex;
          flex-direction: column;
          transition: border-color var(--transition-base);
        }

        .product-card:hover {
          border-color: var(--border);
        }

        .product-tag {
          font-family: var(--font-sans);
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: var(--space-sm);
        }

        .product-name {
          font-family: var(--font-sans);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.4;
          margin-bottom: var(--space-sm);
          margin-top: 0;
        }

        .product-description {
          font-family: var(--font-serif);
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.6;
          flex: 1;
          margin-bottom: var(--space-lg);
        }

        .product-link {
          font-family: var(--font-sans);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--accent-soft);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: var(--space-xs);
          margin-top: auto;
          transition: color var(--transition-fast);
        }

        .product-link:hover {
          color: var(--accent);
        }

        .paid-link {
          font-weight: 400;
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        .affiliate-disclosure {
          border-top: 1px solid var(--border-subtle);
          padding-top: var(--space-lg);
        }

        .affiliate-disclosure p {
          font-family: var(--font-sans);
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.5;
          margin: 0;
        }
      `}</style>
    </div>
  );
}
