import FileUpload from './FileUpload.jsx';

const QUICK_TOPICS = [
  { label: 'Scholarships', query: 'What scholarship opportunities are available?' },
  { label: 'Student visas', query: 'Walk me through the student visa application process.' },
  { label: 'Tuition costs', query: 'Give me an overview of tuition costs for international students.' },
  { label: 'Application docs', query: 'What documents do I need for a university application?' },
];

export default function Sidebar({
  open,
  sources,
  messageCount,
  onUploaded,
  onDeleteSource,
  onClearChat,
  onQuickTopic,
  onClose,
}) {
  return (
    <>
      <div className={`sidebar-backdrop ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-section">
          <button className="new-chat-btn" onClick={onClearChat} disabled={messageCount === 0}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New chat
          </button>
        </div>

        <div className="sidebar-section">
          <h3 className="sidebar-heading">Knowledge base</h3>
          <FileUpload onUploaded={onUploaded} />
        </div>

        <div className="sidebar-section sidebar-grow">
          <h3 className="sidebar-heading">Documents</h3>
          {sources.length === 0 ? (
            <div className="empty-hint">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <p>No documents uploaded yet.</p>
              <span>Upload PDFs or text to ground answers.</span>
            </div>
          ) : (
            <ul className="doc-list">
              {sources.map((s) => (
                <li key={s.source} className="doc-item">
                  <div className="doc-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div className="doc-meta">
                    <span className="doc-name" title={s.source}>{s.source}</span>
                    <span className="doc-count">{s.chunks} chunks</span>
                  </div>
                  <button
                    className="icon-btn doc-delete"
                    onClick={() => onDeleteSource(s.source)}
                    aria-label={`Remove ${s.source}`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="sidebar-section">
          <h3 className="sidebar-heading">Quick topics</h3>
          <div className="topic-list">
            {QUICK_TOPICS.map((t) => (
              <button
                key={t.label}
                className="topic-chip"
                onClick={() => onQuickTopic(t.query)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <footer className="sidebar-footer">
          <span>StudyAbroad AI · v1.0</span>
        </footer>
      </aside>
    </>
  );
}
