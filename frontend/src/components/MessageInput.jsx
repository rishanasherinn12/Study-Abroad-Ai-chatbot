import { useEffect, useRef, useState } from 'react';

export default function MessageInput({ onSend, disabled, value, onChange }) {
  const [internal, setInternal] = useState('');
  const taRef = useRef(null);

  const text = value !== undefined ? value : internal;
  const setText = onChange || setInternal;

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [text]);

  function submit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit(e);
    }
  }

  return (
    <form className="composer" onSubmit={submit}>
      <div className="composer-inner">
        <textarea
          ref={taRef}
          rows={1}
          placeholder="Ask about scholarships, visas, universities…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          disabled={disabled}
        />
        <button
          type="submit"
          className="send-btn"
          disabled={disabled || !text.trim()}
          aria-label="Send"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
      <div className="composer-hint">
        Enter to send · Shift + Enter for newline · Answers cite uploaded sources
      </div>
    </form>
  );
}
