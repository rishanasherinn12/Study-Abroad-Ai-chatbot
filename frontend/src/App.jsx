import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import Welcome from './components/Welcome.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import MessageInput from './components/MessageInput.jsx';
import { chat, deleteSource, listSources } from './api.js';
import './App.css';

export default function App() {
  const [theme, setTheme] = useState(
    () => document.documentElement.dataset.theme || 'light'
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [messages, setMessages] = useState([]);
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    refreshSources();
    if (window.matchMedia('(max-width: 880px)').matches) {
      setSidebarOpen(false);
    }
  }, []);

  async function refreshSources() {
    try {
      const data = await listSources();
      setSources(data.sources || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSend(question) {
    const userMsg = { role: 'user', content: question };
    const next = [...messages, userMsg];
    setMessages(next);
    setLoading(true);
    try {
      const history = next.map(({ role, content }) => ({ role, content }));
      const result = await chat(question, history.slice(0, -1));
      setMessages([
        ...next,
        { role: 'assistant', content: result.answer, sources: result.sources },
      ]);
    } catch (err) {
      setMessages([
        ...next,
        { role: 'assistant', content: `⚠️ ${err.message}`, sources: [] },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteSource(name) {
    if (!confirm(`Remove ${name} from the index?`)) return;
    try {
      await deleteSource(name);
      refreshSources();
    } catch (err) {
      console.error(err);
    }
  }

  function handleClearChat() {
    setMessages([]);
    setDraft('');
  }

  function handlePick(question) {
    setDraft(question);
  }

  return (
    <div className="app">
      <Header
        theme={theme}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />

      <div className="app-body">
        <Sidebar
          open={sidebarOpen}
          sources={sources}
          messageCount={messages.length}
          onUploaded={refreshSources}
          onDeleteSource={handleDeleteSource}
          onClearChat={handleClearChat}
          onQuickTopic={handlePick}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="main">
          <div className="main-scroll">
            {messages.length === 0 && !loading ? (
              <Welcome
                onPickCountry={handlePick}
                onPickSuggestion={handlePick}
              />
            ) : (
              <ChatWindow messages={messages} loading={loading} />
            )}
          </div>
          <MessageInput
            value={draft}
            onChange={setDraft}
            onSend={handleSend}
            disabled={loading}
          />
        </main>
      </div>
    </div>
  );
}
