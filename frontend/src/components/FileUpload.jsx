import { useRef, useState } from 'react';
import { uploadFile } from '../api.js';

export default function FileUpload({ onUploaded }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setStatus({ kind: 'info', text: `Uploading ${file.name}...` });
    try {
      const result = await uploadFile(file);
      setStatus({
        kind: 'success',
        text: `Indexed ${result.chunks_added} chunks from ${result.filename}`,
      });
      onUploaded?.(result);
    } catch (err) {
      setStatus({ kind: 'error', text: err.message });
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="upload">
      <input
        ref={inputRef}
        id="file-input"
        type="file"
        accept=".pdf,.txt,.md"
        onChange={handleFile}
        disabled={busy}
        style={{ display: 'none' }}
      />
      <label htmlFor="file-input" className={`upload-btn ${busy ? 'is-busy' : ''}`}>
        {busy ? (
          <>
            <span className="spinner" />
            Uploading...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Upload PDF / TXT
          </>
        )}
      </label>
      {status && <div className={`upload-status ${status.kind}`}>{status.text}</div>}
    </div>
  );
}
