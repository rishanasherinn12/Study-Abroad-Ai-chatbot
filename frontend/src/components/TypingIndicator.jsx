export default function TypingIndicator() {
  return (
    <div className="message assistant">
      <div className="avatar avatar-assistant" aria-hidden>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a4 4 0 0 0-4 4v6a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4z" />
          <path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3" />
        </svg>
      </div>
      <div className="bubble bubble-assistant typing-bubble">
        <div className="typing">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
}
