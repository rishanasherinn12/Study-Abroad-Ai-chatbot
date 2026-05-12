import CountryCard from './CountryCard.jsx';

const COUNTRIES = [
  { flag: '🇺🇸', name: 'United States', tagline: 'Ivy League · STEM hubs', stat: '4,000+ universities' },
  { flag: '🇬🇧', name: 'United Kingdom', tagline: 'Oxbridge · Russell Group', stat: '160+ universities' },
  { flag: '🇨🇦', name: 'Canada', tagline: 'Post-study work visas', stat: '100+ universities' },
  { flag: '🇦🇺', name: 'Australia', tagline: 'Research powerhouse', stat: '40+ universities' },
  { flag: '🇩🇪', name: 'Germany', tagline: 'Tuition-free public unis', stat: '400+ institutions' },
  { flag: '🇸🇬', name: 'Singapore', tagline: 'Asia\'s academic hub', stat: '6 top-ranked unis' },
];

const SUGGESTIONS = [
  'What are the admission requirements for top US universities?',
  'How much does it cost to study a Master\'s in the UK?',
  'Tell me about scholarships for international students in Canada.',
  'What is the student visa process for Australia?',
];

export default function Welcome({ onPickCountry, onPickSuggestion }) {
  return (
    <div className="welcome">
      <div className="welcome-hero">
        <div className="hero-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l2.39 7.36H22l-6.19 4.5L18.2 22 12 17.27 5.8 22l2.39-8.14L2 9.36h7.61z" />
          </svg>
          AI-powered guidance
        </div>
        <h2>Plan your journey to study abroad</h2>
        <p>
          Ask anything about universities, scholarships, visas, and applications.
          Upload brochures or guides on the left, and I'll ground my answers in
          your documents.
        </p>
      </div>

      <section className="welcome-section">
        <header>
          <h3>Popular destinations</h3>
          <span>Tap a country to start exploring</span>
        </header>
        <div className="country-grid">
          {COUNTRIES.map((c) => (
            <CountryCard
              key={c.name}
              {...c}
              onClick={() =>
                onPickCountry(`Tell me about studying in ${c.name} as an international student.`)
              }
            />
          ))}
        </div>
      </section>

      <section className="welcome-section">
        <header>
          <h3>Try asking</h3>
          <span>Click a question to send it</span>
        </header>
        <div className="suggestion-list">
          {SUGGESTIONS.map((q) => (
            <button
              key={q}
              className="suggestion"
              onClick={() => onPickSuggestion(q)}
            >
              <span className="suggestion-icon">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              {q}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
