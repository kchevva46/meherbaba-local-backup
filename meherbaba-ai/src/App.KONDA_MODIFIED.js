import React, { useState, useRef } from 'react';
import meherbabaIcon from './assets/meherbaba.png'; 

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([{ id: 1, text: "Welcome to Meherbaba.ai.", from: 'bot' }]);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const scrollRef = useRef();

  // ✅ FIXED: Removed /ask from BASE_URL (was causing double /ask/ask bug)
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
        <div style={styles.loginCard}>
		  <img src={meherbabaIcon} alt="Meher Baba" style={styles.loginLogo} />
          <h1 style={styles.loginTitle}>Meherbaba.ai</h1>
          <p style={styles.loginSubtitle}>A spiritual companion</p>

          {loginError && <div style={styles.errorBox}>{loginError}</div>}

          <input
            style={styles.loginInput}
            type="text"
            placeholder="User ID"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            autoComplete="username"
          />
          <input
            style={styles.loginInput}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          <button style={styles.loginButton} onClick={handleLogin}>
            Login
          </button>
        </div>
      </div>
    );
  }

  // ─── CHAT SCREEN ────────────────────────────────────────────────────────────
  return (
    <div style={styles.appContainer}>

      {/* Header */}
      <div style={styles.header}>
		<img src={meherbabaIcon} alt="Meher Baba" style={styles.headerIcon} />
        <span style={styles.headerTitle}>Meherbaba.ai</span>
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
            <div
              style={{
                ...styles.bubble,
                backgroundColor: msg.from === 'user' ? '#007AFF' : '#E9E9EB',
                color: msg.from === 'user' ? '#FFF' : '#000',
                borderBottomRightRadius: msg.from === 'user' ? 4 : 18,
                borderBottomLeftRadius: msg.from === 'bot' ? 4 : 18,
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ ...styles.messageRow, justifyContent: 'flex-start' }}>
            <div style={{ ...styles.bubble, backgroundColor: '#E9E9EB', color: '#888' }}>
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={styles.inputContainer}>
        <textarea
          style={styles.input}
          placeholder="Ask a question... (Enter to send)"
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
          Send
        </button>
      </div>
    </div>
  );
}

// ─── STYLES ─────────────────────────────────────────────────────────────────
const styles = {
  // Login
  loginPage: {
    minHeight: '100vh',
    backgroundColor: '#F0F4FF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Georgia, serif',
  },
  loginCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: '40px',
    width: '100%',
    maxWidth: 380,
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  logoCircle: {
    fontSize: 56,
    marginBottom: 12,
  },
  loginTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    margin: '0 0 4px 0',
    color: '#1A1A2E',
  },
  loginSubtitle: {
    fontSize: 14,
    color: '#888',
    margin: '0 0 24px 0',
  },
  errorBox: {
    backgroundColor: '#FFF0F0',
    color: '#CC0000',
    borderRadius: 8,
    padding: '10px 14px',
    marginBottom: 14,
    width: '100%',
    fontSize: 14,
    boxSizing: 'border-box',
  },
  loginInput: {
    width: '100%',
    backgroundColor: '#F2F2F7',
    border: 'none',
    borderRadius: 10,
    padding: '14px 16px',
    marginBottom: 14,
    fontSize: 16,
    outline: 'none',
    boxSizing: 'border-box',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#007AFF',
    color: '#FFF',
    border: 'none',
    borderRadius: 10,
    padding: '14px',
    fontSize: 16,
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: 4,
  },

  // Chat App
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#F8F9FA',
    fontFamily: 'Georgia, serif',
  },
  header: {
    padding: '16px 20px',
    backgroundColor: '#FFF',
    borderBottom: '1px solid #EEE',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  headerIcon: {
    fontSize: 28,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  chatArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  messageRow: {
    display: 'flex',
    width: '100%',
  },
  bubble: {
    maxWidth: '75%',
    padding: '12px 16px',
    borderRadius: 18,
    fontSize: 15,
    lineHeight: 1.5,
    wordBreak: 'break-word',
  },
  inputContainer: {
    display: 'flex',
    padding: '12px 16px',
    backgroundColor: '#FFF',
    borderTop: '1px solid #EEE',
    gap: 10,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    border: 'none',
    borderRadius: 20,
    padding: '12px 16px',
    fontSize: 15,
    outline: 'none',
    resize: 'none',
    fontFamily: 'Georgia, serif',
    maxHeight: 120,
    overflowY: 'auto',
  },
  sendButton: {
    backgroundColor: '#007AFF',
    color: '#FFF',
    border: 'none',
    borderRadius: 20,
    padding: '12px 22px',
    fontSize: 15,
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  loginLogo: {
  width: 100,
  height: 100,
  borderRadius: 50,
  objectFit: 'cover',
  marginBottom: 12,
},
headerIcon: {
  width: 35,
  height: 35,
  borderRadius: '50%',
  objectFit: 'cover',
},
};
