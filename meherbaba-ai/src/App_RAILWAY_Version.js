import React, { useState, useRef } from 'react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([{ id: 1, text: "Welcome to Meherbaba.ai.", from: 'bot' }]);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const scrollRef = useRef();

  const BASE_URL = 'http://localhost:8080';

  const handleLogin = async () => {
    if (!userId || !password) {
      setLoginError("Please enter your User ID and Password.");
      return;
    }
    setLoginError('');
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userId, password: password }),
      });
      const data = await response.json();
      if (data.success) setIsLoggedIn(true);
      else setLoginError(data.message || "Login failed. Please try again.");
    } catch (e) {
      setLoginError("Server unreachable. Make sure app.py is running.");
    }
  };

  const sendToGPT = async () => {
    if (!question.trim()) return;
    const userMsg = { id: Date.now(), text: question, from: 'user' };
    setChatHistory(prev => [...prev, userMsg]);
    setLoading(true);
    setQuestion('');

    try {
      const response = await fetch(`${BASE_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg.text }),
      });
      const data = await response.json();
      setChatHistory(prev => [...prev, { id: Date.now() + 1, text: data.answer || "No answer received.", from: 'bot' }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { id: Date.now() + 1, text: "Network Error. Please check your connection.", from: 'bot' }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendToGPT();
    }
  };

  // ─── LOGIN SCREEN ───────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div style={styles.loginPage}>

        {/* Soft background decorative circles */}
        <div style={styles.bgCircle1} />
        <div style={styles.bgCircle2} />

        <div style={styles.loginCard}>

          {/* Photo — NO borderRadius, natural rectangle with warm border */}
          <div style={styles.photoFrame}>
            <img
              src={require('./assets/icon.png')}
              alt="Meher Baba"
              style={styles.photo}
            />
          </div>

          <h1 style={styles.loginTitle}>Meherbaba.ai</h1>
          <p style={styles.loginSubtitle}>A spiritual companion</p>
          <div style={styles.divider} />

          {loginError && <div style={styles.errorBox}>{loginError}</div>}

          <div style={styles.inputGroup}>
            <label style={styles.label}>User ID</label>
            <input
              style={styles.loginInput}
              type="text"
              placeholder="Enter your User ID"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.loginInput}
              type="password"
              placeholder="Enter your Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <button style={styles.loginButton} onClick={handleLogin}>
            Login
          </button>

          <p style={styles.footerText}>
            "I have come not to teach but to awaken." — Meher Baba
          </p>
        </div>
      </div>
    );
  }

  // ─── CHAT SCREEN ────────────────────────────────────────────────────────────
  return (
    <div style={styles.appContainer}>

      {/* Header */}
      <div style={styles.header}>
        <img
          src={require('./assets/icon.png')}
          alt="Meher Baba"
          style={styles.headerPhoto}
        />
        <div>
          <div style={styles.headerTitle}>Meherbaba.ai</div>
          <div style={styles.headerSubtitle}>A spiritual companion</div>
        </div>
      </div>

      {/* Chat Area */}
      <div style={styles.chatArea} ref={scrollRef}>
        {chatHistory.map(msg => (
          <div
            key={msg.id}
            style={{
              ...styles.messageRow,
              justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            {msg.from === 'bot' && (
              <img
                src={require('./assets/icon.png')}
                alt="bot"
                style={styles.botAvatar}
              />
            )}
            <div
              style={{
                ...styles.bubble,
                backgroundColor: msg.from === 'user' ? '#2C5F8A' : '#FFFFFF',
                color: msg.from === 'user' ? '#FFF' : '#2A2A2A',
                borderBottomRightRadius: msg.from === 'user' ? 4 : 18,
                borderBottomLeftRadius: msg.from === 'bot' ? 4 : 18,
                boxShadow: msg.from === 'bot' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
            <img
              src={require('./assets/icon.png')}
              alt="bot"
              style={styles.botAvatar}
            />
            <div style={{ ...styles.bubble, backgroundColor: '#FFF', color: '#999', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={styles.inputContainer}>
        <textarea
          style={styles.input}
          placeholder="Ask a question... (Enter to send, Shift+Enter for new line)"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          style={{
            ...styles.sendButton,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          onClick={sendToGPT}
          disabled={loading}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

// ─── STYLES ─────────────────────────────────────────────────────────────────
const styles = {

  // ── Login Page ──
  loginPage: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #e8f0fe 0%, #fce4d6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Palatino Linotype", Palatino, Georgia, serif',
    position: 'relative',
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'rgba(44, 95, 138, 0.08)',
    top: -100,
    right: -100,
  },
  bgCircle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: 'rgba(255, 160, 80, 0.08)',
    bottom: -80,
    left: -80,
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: '40px 44px 32px',
    width: '100%',
    maxWidth: 400,
    boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },

  // ── Photo: NO borderRadius — natural portrait rectangle, fully centered ──
  photoFrame: {
    width: 140,
    height: 170,
    overflow: 'hidden',
    marginBottom: 20,
    marginLeft: 'auto',
    marginRight: 'auto',
    boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
    border: '3px solid #e8d5b7',
    backgroundColor: '#f5ede0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: 'auto',
    height: '100%',
    maxWidth: '100%',
    objectFit: 'contain',
    display: 'block',
    margin: '0 auto',
  },

  loginTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    margin: '0 0 4px 0',
    color: '#2C3E5A',
    letterSpacing: '0.5px',
  },
  loginSubtitle: {
    fontSize: 14,
    color: '#9A8F82',
    margin: '0 0 16px 0',
    fontStyle: 'italic',
  },
  divider: {
    width: 50,
    height: 2,
    backgroundColor: '#e8d5b7',
    borderRadius: 2,
    marginBottom: 24,
  },
  errorBox: {
    backgroundColor: '#FFF0F0',
    color: '#CC0000',
    borderRadius: 8,
    padding: '10px 14px',
    marginBottom: 16,
    width: '100%',
    fontSize: 14,
    boxSizing: 'border-box',
    border: '1px solid #FFCCCC',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7A7060',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: 6,
    display: 'block',
  },
  loginInput: {
    width: '100%',
    backgroundColor: '#F8F5F0',
    border: '1.5px solid #E8DDD0',
    borderRadius: 10,
    padding: '13px 16px',
    fontSize: 15,
    outline: 'none',
    boxSizing: 'border-box',
    color: '#2A2A2A',
    fontFamily: '"Palatino Linotype", Palatino, Georgia, serif',
  },
  loginButton: {
    width: '100%',
    background: 'linear-gradient(135deg, #2C5F8A, #1A3F6F)',
    color: '#FFF',
    border: 'none',
    borderRadius: 12,
    padding: '15px',
    fontSize: 16,
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: 8,
    letterSpacing: '0.5px',
    boxShadow: '0 4px 16px rgba(44, 95, 138, 0.35)',
    fontFamily: '"Palatino Linotype", Palatino, Georgia, serif',
  },
  footerText: {
    fontSize: 12,
    color: '#B0A090',
    marginTop: 24,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 1.6,
  },

  // ── Chat Screen ──
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#F4F0EB',
    fontFamily: '"Palatino Linotype", Palatino, Georgia, serif',
  },
  header: {
    padding: '14px 20px',
    background: 'linear-gradient(135deg, #2C5F8A, #1A3F6F)',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
  },
  headerPhoto: {
    width: 44,
    height: 52,
    objectFit: 'cover',
    objectPosition: 'top',
    border: '2px solid rgba(255,255,255,0.4)',
    display: 'block',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: '0.3px',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
  },
  chatArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  messageRow: {
    display: 'flex',
    width: '100%',
    alignItems: 'flex-end',
    gap: 8,
  },
  botAvatar: {
    width: 32,
    height: 38,
    objectFit: 'cover',
    objectPosition: 'top',
    flexShrink: 0,
    border: '1.5px solid #D4C4A8',
  },
  bubble: {
    maxWidth: '72%',
    padding: '12px 16px',
    borderRadius: 18,
    fontSize: 15,
    lineHeight: 1.6,
    wordBreak: 'break-word',
  },
  inputContainer: {
    display: 'flex',
    padding: '12px 16px',
    backgroundColor: '#FFFFFF',
    borderTop: '1px solid #E0D8CC',
    gap: 10,
    alignItems: 'flex-end',
    boxShadow: '0 -2px 12px rgba(0,0,0,0.05)',
  },
  input: {
    flex: 1,
    backgroundColor: '#F8F5F0',
    border: '1.5px solid #E0D8CC',
    borderRadius: 20,
    padding: '12px 18px',
    fontSize: 15,
    outline: 'none',
    resize: 'none',
    fontFamily: '"Palatino Linotype", Palatino, Georgia, serif',
    maxHeight: 120,
    overflowY: 'auto',
    color: '#2A2A2A',
  },
  sendButton: {
    backgroundColor: '#2C5F8A',
    color: '#FFF',
    border: 'none',
    borderRadius: '50%',
    width: 46,
    height: 46,
    fontSize: 18,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(44, 95, 138, 0.35)',
  },
};
