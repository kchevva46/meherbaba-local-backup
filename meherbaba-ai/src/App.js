import React, { useState, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL CSS
// ─────────────────────────────────────────────────────────────────────────────
const globalStyle = document.createElement('style');
globalStyle.textContent = `
  * { box-sizing: border-box; }
  body { margin: 0; }
  @keyframes spin { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }
  .spinner { width:22px;height:22px;border:3px solid #ddd;
    border-top:3px solid #2C5F8A;border-radius:50%;
    animation:spin 0.8s linear infinite;display:inline-block; }
  .field-row  { margin-bottom:18px;width:100%; }
  .field-header { display:flex;justify-content:space-between;align-items:center;margin-bottom:6px; }
  .field-label  { font-size:14px;font-weight:600;color:#111;font-family:Arial,sans-serif; }
  .field-req    { color:#CC0000;margin-left:2px; }
  .field-forgot { font-size:13px;color:#777;cursor:pointer;text-decoration:underline; }
  .minput { width:100%;border:1.5px solid #D5CFC8;border-radius:8px;
    padding:13px 16px;font-size:16px;outline:none;
    font-family:Arial,sans-serif;background:#FAFAFA;color:#222;
    -webkit-appearance:none; }
  .minput:focus { border-color:#2C5F8A;background:#fff; }
  .pw-wrap { position:relative; }
  .pw-wrap .minput { padding-right:46px; }
  .pw-eye { position:absolute;right:12px;top:50%;transform:translateY(-50%);
    background:none;border:none;cursor:pointer;font-size:18px;
    padding:4px;color:#999;-webkit-tap-highlight-color:transparent; }
  .mbtn-gold { width:100%;background:#C8A84B;color:#fff;border:none;
    border-radius:10px;padding:15px;font-size:16px;font-weight:700;
    cursor:pointer;font-family:Arial,sans-serif;margin-top:6px;
    -webkit-appearance:none; }
  .mbtn-gold:active { background:#B8952A; }
  .mbtn-outline { width:100%;background:transparent;color:#2C5F8A;
    border:1.5px solid #2C5F8A;border-radius:10px;padding:14px;font-size:15px;
    font-weight:600;cursor:pointer;font-family:Arial,sans-serif;margin-top:10px; }
  .mbtn-red  { width:100%;background:#CC0000;color:#fff;border:none;
    border-radius:10px;padding:14px;font-size:15px;font-weight:700;
    cursor:pointer;font-family:Arial,sans-serif;margin-top:6px; }
  .mbtn-grey { width:100%;background:#888;color:#fff;border:none;
    border-radius:10px;padding:14px;font-size:15px;font-weight:600;
    cursor:pointer;font-family:Arial,sans-serif;margin-top:8px; }
  .merror   { background:#FFF0F0;color:#CC0000;border:1px solid #FFCCCC;
    border-radius:8px;padding:10px 14px;font-size:14px;margin-bottom:16px;
    font-family:Arial,sans-serif; }
  .msuccess { background:#F0FFF4;color:#276749;border:1px solid #9AE6B4;
    border-radius:8px;padding:10px 14px;font-size:14px;margin-bottom:16px;
    font-family:Arial,sans-serif; }
  .mh2  { margin:0 0 4px 0;font-size:26px;font-weight:700;color:#111;
    font-family:Arial,sans-serif; }
  .msub { font-size:14px;color:#888;margin:0 0 24px 0;font-family:Arial,sans-serif; }
  .mbot { text-align:center;margin-top:20px;font-size:14px;
    color:#666;font-family:Arial,sans-serif; }
  .mbot-link { color:#C8A84B;cursor:pointer;font-weight:700; }
  .phone-row { display:flex;gap:8px; }
  .phone-code { flex-shrink:0;width:130px;border:1.5px solid #D5CFC8;
    border-radius:8px;padding:13px 8px;font-size:14px;outline:none;
    background:#FAFAFA;font-family:Arial,sans-serif; }
  .phone-num  { flex:1;border:1.5px solid #D5CFC8;border-radius:8px;
    padding:13px 14px;font-size:16px;outline:none;
    background:#FAFAFA;font-family:Arial,sans-serif; }
  .modal-overlay { position:fixed;top:0;left:0;width:100%;height:100%;
    background:rgba(0,0,0,0.5);display:flex;align-items:center;
    justify-content:center;z-index:1000; }
  .modal-box { background:#fff;border-radius:16px;padding:32px;width:90%;
    max-width:440px;box-shadow:0 20px 60px rgba(0,0,0,0.2);
    max-height:90vh;overflow-y:auto; }
  .modal-label { font-size:11px;font-weight:700;color:#7A7060;
    text-transform:uppercase;letter-spacing:0.7px;display:block;margin-bottom:5px; }
  .user-menu { position:absolute;top:62px;right:16px;background:#fff;
    border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,0.18);
    min-width:210px;z-index:999;overflow:hidden; }
  .umi { padding:14px 18px;font-size:14px;cursor:pointer;color:#222;
    font-family:Arial,sans-serif;border-bottom:1px solid #F0EBE0; }
  .umi:last-child { border-bottom:none; }
  .umi:active { background:#F8F5F0; }
  .umi.danger { color:#CC0000; }
  .umi.hdr { font-weight:700;color:#2C5F8A;font-size:13px;cursor:default; }
`;
document.head.appendChild(globalStyle);

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const BASE_URL = 'https://web-production-bd27a.up.railway.app';
const HEADERS  = { 'Content-Type':'application/json', 'ngrok-skip-browser-warning':'true' };

const COUNTRY_CODES = [
  {code:'+1',name:'USA (+1)'},{code:'+1',name:'Canada (+1)'},
  {code:'+44',name:'UK (+44)'},{code:'+91',name:'India (+91)'},
  {code:'+61',name:'Australia (+61)'},{code:'+49',name:'Germany (+49)'},
  {code:'+33',name:'France (+33)'},{code:'+39',name:'Italy (+39)'},
  {code:'+34',name:'Spain (+34)'},{code:'+55',name:'Brazil (+55)'},
  {code:'+52',name:'Mexico (+52)'},{code:'+81',name:'Japan (+81)'},
  {code:'+65',name:'Singapore (+65)'},{code:'+971',name:'UAE (+971)'},
  {code:'+92',name:'Pakistan (+92)'},{code:'+91',name:'India (+91)'},
  {code:'+64',name:'New Zealand (+64)'},{code:'+27',name:'South Africa (+27)'},
];

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UI HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function FormattedText({ text, isUser }) {
  if (!text) return null;
  return (
    <div>
      {text.split(/\n\n+/).map((para, i) => {
        const lines  = para.split('\n');
        const bullet = lines.every(l => l.trim().startsWith('•') || l.trim().startsWith('-') || !l.trim());
        if (bullet && lines.length > 1) return (
          <ul key={i} style={{ margin:'4px 0 8px 0', paddingLeft:18 }}>
            {lines.filter(l=>l.trim()).map((ln,j) => (
              <li key={j} style={{ marginBottom:4, lineHeight:1.6, color:isUser?'#FFF':'#2A2A2A' }}>
                {ln.replace(/^[•-]\s*/,'')}
              </li>
            ))}
          </ul>
        );
        return (
          <p key={i} style={{ margin:i===text.split(/\n\n+/).length-1?0:'0 0 10px 0', lineHeight:1.7, color:isUser?'#FFF':'#2A2A2A' }}>
            {lines.map((ln,j) => <span key={j}>{ln}{j<lines.length-1&&<br/>}</span>)}
          </p>
        );
      })}
    </div>
  );
}

function Citations({ citations }) {
  if (!citations?.length) return null;
  return (
    <div style={{ marginTop:10, paddingTop:8, borderTop:'1px solid #E0D8CC' }}>
      <div style={{ fontSize:11, fontWeight:700, color:'#8A7060', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:6 }}>📖 Sources</div>
      {citations.map((c,i) => (
        <div key={i} style={{ marginBottom:6 }}>
          <span style={{ fontSize:12, marginRight:4 }}>📄</span>
          <span style={{ fontSize:12, color:'#2C5F8A', fontWeight:600, fontStyle:'italic' }}>{c.filename}</span>
          {c.quote && <div style={{ fontSize:11, color:'#9A8F82', marginTop:2, marginLeft:18, fontStyle:'italic' }}>"{c.quote}..."</div>}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN PAGE — NO <form> tag, refs only — fixes iPhone Safari autofill hijack
// ─────────────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin, onRegister, onBack }) {
  const emailRef = React.useRef(null);
  const pwRef    = React.useRef(null);
  const [showPw, setShowPw] = useState(false);
  const [err,    setErr]    = useState('');

  const submit = async () => {
    const email = emailRef.current?.value?.trim() || '';
    const pw    = pwRef.current?.value || '';
    if (!email || !pw) { setErr('Please enter email and password.'); return; }
    setErr('');
    try {
      const res  = await fetch(`${BASE_URL}/login`, {
        method:'POST', headers:HEADERS,
        body:JSON.stringify({ email, password:pw })
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data);
      } else {
        setErr(data.message || 'Login failed.');
        if (pwRef.current) { pwRef.current.value = ''; pwRef.current.focus(); }
      }
    } catch { setErr('Server unreachable. Make sure app.py is running.'); }
  };

  return (
    <div style={ST.authPage}>
      <div style={ST.bgCircle1}/><div style={ST.bgCircle2}/>
      <button style={ST.backBtn} onClick={onBack}>← Back</button>
      <div style={ST.authCard}>
        <div style={ST.authLogoRow}>
          <img src={require('./assets/icon.png')} alt="Meher Baba" style={ST.authLogo}/>
          <span style={ST.authLogoText}>MeherBaba.AI</span>
        </div>
        <p className="mh2">Login</p>
        <p className="msub">Enter your email address and password.</p>
        {err && <div className="merror">{err}</div>}

        {/* NO <form> tag — prevents iPhone Safari autofill from hijacking focus */}
        <div style={{ width:'100%' }}>
          <div className="field-row">
            <div className="field-header">
              <span className="field-label">Email Address <span className="field-req">*</span></span>
            </div>
            <input
              ref={emailRef}
              className="minput"
              type="text"
              inputMode="email"
              placeholder="Enter your email address"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              onKeyDown={e => e.key === 'Enter' && pwRef.current?.focus()}
            />
          </div>

          <div className="field-row">
            <div className="field-header">
              <span className="field-label">Password <span className="field-req">*</span></span>
              <span className="field-forgot">Forgot Password?</span>
            </div>
            <div className="pw-wrap">
              <input
                ref={pwRef}
                className="minput"
                type={showPw ? 'text' : 'password'}
                placeholder="Enter your Password"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                onKeyDown={e => e.key === 'Enter' && submit()}
              />
              <button className="pw-eye" type="button"
                onMouseDown={e => {
                  e.preventDefault();
                  setShowPw(p => !p);
                  setTimeout(() => pwRef.current?.focus(), 0);
                }}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button className="mbtn-gold" type="button" onClick={submit}>Login</button>
        </div>

        <div className="mbot">
          New on our platform?{' '}
          <span className="mbot-link" onClick={onRegister}>Create an account</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTER PAGE — NO <form> tag, refs only — fixes iPhone Safari autofill
// ─────────────────────────────────────────────────────────────────────────────
function RegisterPage({ onBack, onLogin, onSuccess }) {
  const firstRef  = React.useRef(null);
  const lastRef   = React.useRef(null);
  const emailRef  = React.useRef(null);
  const phoneRef  = React.useRef(null);
  const pwRef     = React.useRef(null);
  const confRef   = React.useRef(null);
  const [cc,     setCC]     = useState('+1');
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [err,    setErr]    = useState('');
  const [ok,     setOk]     = useState('');

  const submit = async () => {
    const first = firstRef.current?.value?.trim() || '';
    const last  = lastRef.current?.value?.trim()  || '';
    const email = emailRef.current?.value?.trim() || '';
    const phone = phoneRef.current?.value?.trim() || '';
    const pw    = pwRef.current?.value   || '';
    const conf  = confRef.current?.value || '';
    if (!first||!last||!email||!pw||!conf) { setErr('All fields except phone are required.'); return; }
    if (pw !== conf) { setErr('Passwords do not match.'); return; }
    setErr(''); setOk('');
    try {
      const res  = await fetch(`${BASE_URL}/register`, {
        method:'POST', headers:HEADERS,
        body:JSON.stringify({ first_name:first, last_name:last,
          email, phone, country_code:cc, password:pw, confirm_password:conf })
      });
      const data = await res.json();
      if (data.success) {
        setOk('Account created! Redirecting to login...');
        setTimeout(onSuccess, 1500);
      } else { setErr(data.message || 'Registration failed.'); }
    } catch { setErr('Server unreachable.'); }
  };

  const inputProps = {
    autoComplete: 'off',
    autoCorrect:  'off',
    autoCapitalize: 'off',
    spellCheck: false,
  };

  return (
    <div style={ST.authPage}>
      <div style={ST.bgCircle1}/><div style={ST.bgCircle2}/>
      <button style={ST.backBtn} onClick={onBack}>← Back</button>
      <div style={{ ...ST.authCard, maxWidth:500 }}>
        <div style={ST.authLogoRow}>
          <img src={require('./assets/icon.png')} alt="Meher Baba" style={ST.authLogo}/>
          <span style={ST.authLogoText}>MeherBaba.AI</span>
        </div>
        <p className="mh2">Create Account</p>
        <p className="msub">Join MeherBaba.AI — it's free.</p>
        {err && <div className="merror">{err}</div>}
        {ok  && <div className="msuccess">{ok}</div>}

        <div style={{ width:'100%' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 14px' }}>
            <div className="field-row">
              <span className="field-label">First Name <span className="field-req">*</span></span>
              <input ref={firstRef} className="minput" type="text"
                placeholder="First Name" {...inputProps} />
            </div>
            <div className="field-row">
              <span className="field-label">Last Name <span className="field-req">*</span></span>
              <input ref={lastRef} className="minput" type="text"
                placeholder="Last Name" {...inputProps} />
            </div>
          </div>

          <div className="field-row">
            <span className="field-label">Email Address <span className="field-req">*</span></span>
            <input ref={emailRef} className="minput" type="text"
              inputMode="email" placeholder="your@email.com" {...inputProps} />
          </div>

          <div className="field-row">
            <span className="field-label">Phone <span style={{ color:'#999', fontWeight:400 }}>(optional)</span></span>
            <div className="phone-row">
              <select className="phone-code" value={cc} onChange={e=>setCC(e.target.value)}>
                {[
                  ['+1','USA (+1)'],['+1','Canada (+1)'],['+44','UK (+44)'],
                  ['+91','India (+91)'],['+61','Australia (+61)'],['+49','Germany (+49)'],
                  ['+33','France (+33)'],['+39','Italy (+39)'],['+34','Spain (+34)'],
                  ['+55','Brazil (+55)'],['+52','Mexico (+52)'],['+81','Japan (+81)'],
                  ['+65','Singapore (+65)'],['+971','UAE (+971)'],['+92','Pakistan (+92)'],
                  ['+64','New Zealand (+64)'],['+27','South Africa (+27)'],
                ].map(([code,name],i) => <option key={i} value={code}>{name}</option>)}
              </select>
              <input ref={phoneRef} className="phone-num" type="tel"
                placeholder="Phone number" {...inputProps} />
            </div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 14px' }}>
            <div className="field-row">
              <span className="field-label">Password <span className="field-req">*</span></span>
              <div className="pw-wrap">
                <input ref={pwRef} className="minput"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min 6 chars" {...inputProps} />
                <button className="pw-eye" type="button"
                  onMouseDown={e => { e.preventDefault(); setShowPw(p=>!p);
                    setTimeout(()=>pwRef.current?.focus(),0); }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div className="field-row">
              <span className="field-label">Confirm <span className="field-req">*</span></span>
              <div className="pw-wrap">
                <input ref={confRef} className="minput"
                  type={showCf ? 'text' : 'password'}
                  placeholder="Repeat" {...inputProps}
                  onKeyDown={e => e.key==='Enter' && submit()} />
                <button className="pw-eye" type="button"
                  onMouseDown={e => { e.preventDefault(); setShowCf(p=>!p);
                    setTimeout(()=>confRef.current?.focus(),0); }}>
                  {showCf ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          </div>

          <button className="mbtn-gold" type="button" onClick={submit}>Create Account</button>
        </div>

        <div className="mbot">
          Already have an account?{' '}
          <span className="mbot-link" onClick={onLogin}>Login</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {

  // ── State ──
  const [screen,       setScreen]       = useState('home');
  const [isLoggedIn,   setIsLoggedIn]   = useState(false);
  const [currentUser,  setCurrentUser]  = useState(null);
  const [chatHistory,  setChatHistory]  = useState([]);
  const [question,     setQuestion]     = useState('');
  const [loading,      setLoading]      = useState(false);
  const [histLoading,  setHistLoading]  = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHamburger,setShowHamburger]= useState(false);
  const [showPricing,  setShowPricing]  = useState(false);
  const [guestQ,       setGuestQ]       = useState('');

  // ── Modals ──
  const [showProfile,    setShowProfile]    = useState(false);
  const [showChangePw,   setShowChangePw]   = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [cpErr, setCpErr] = useState(''); const [cpOk, setCpOk] = useState('');
  const [dErr,  setDErr]  = useState('');

  const scrollRef = useRef();

  // ── Fetch history ──────────────────────────────────────────────────────────
  const fetchHistory = async (email) => {
    setHistLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/history?email=${encodeURIComponent(email)}`,
        { headers:{ 'ngrok-skip-browser-warning':'true' } });
      const data = await res.json();
      setChatHistory([
        { id:0, text:'Welcome back! Ask a question from the Meher Baba archives.', citations:[], from:'bot' },
        ...(data.history || [])
      ]);
    } catch {
      setChatHistory([{ id:0, text:'Welcome to MeherBaba.AI.', citations:[], from:'bot' }]);
    } finally {
      setHistLoading(false);
      setTimeout(() => scrollRef.current?.scrollTo({ top:scrollRef.current.scrollHeight, behavior:'smooth' }), 200);
    }
  };

  // ── Login callback ─────────────────────────────────────────────────────────
  const handleLoginSuccess = async (data) => {
    setCurrentUser({ email:data.email, first_name:data.first_name,
      last_name:data.last_name, phone:data.phone, country_code:data.country_code });
    setIsLoggedIn(true);
    setScreen('home');
    await fetchHistory(data.email);
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    setIsLoggedIn(false); setCurrentUser(null);
    setChatHistory([]); setQuestion('');
    setShowUserMenu(false); setScreen('home');
  };

  // ── Change password ────────────────────────────────────────────────────────
  const handleChangePw = async (e) => {
    e.preventDefault();
    const old_pw = e.target.old_pw.value;
    const new_pw = e.target.new_pw.value;
    const conf   = e.target.conf_pw.value;
    if (new_pw !== conf) { setCpErr('New passwords do not match.'); return; }
    setCpErr(''); setCpOk('');
    try {
      const res  = await fetch(`${BASE_URL}/change-password`, {
        method:'POST', headers:HEADERS,
        body:JSON.stringify({ email:currentUser.email,
          old_password:old_pw, new_password:new_pw, confirm_password:conf })
      });
      const data = await res.json();
      if (data.success) { setCpOk('Password changed!'); e.target.reset(); }
      else setCpErr(data.message || 'Failed.');
    } catch { setCpErr('Server unreachable.'); }
  };

  // ── Deactivate ─────────────────────────────────────────────────────────────
  const handleDeactivate = async (e) => {
    e.preventDefault();
    const pw = e.target.deact_pw.value;
    setDErr('');
    try {
      const res  = await fetch(`${BASE_URL}/deactivate`, {
        method:'POST', headers:HEADERS,
        body:JSON.stringify({ email:currentUser.email, password:pw })
      });
      const data = await res.json();
      if (data.success) { setShowDeactivate(false); handleLogout(); }
      else setDErr(data.message || 'Failed.');
    } catch { setDErr('Server unreachable.'); }
  };

  // ── Send question ──────────────────────────────────────────────────────────
  const sendToGPT = async () => {
    if (!question.trim()) return;
    const userMsg = { id:Date.now(), text:question, citations:[], from:'user' };
    setChatHistory(prev => [...prev, userMsg]);
    setLoading(true); setQuestion('');
    try {
      const res  = await fetch(`${BASE_URL}/ask`, {
        method:'POST', headers:HEADERS,
        body:JSON.stringify({ question:userMsg.text, email:currentUser?.email||'' })
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, {
        id:Date.now()+1, text:data.answer||'No answer received.',
        citations:data.citations||[], from:'bot'
      }]);
    } catch {
      setChatHistory(prev => [...prev, {
        id:Date.now()+1, text:'Network Error. Please check your connection.',
        citations:[], from:'bot'
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollTo({ top:scrollRef.current.scrollHeight, behavior:'smooth' }), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendToGPT(); }
  };

  // ─── SCREENS ───────────────────────────────────────────────────────────────
  if (!isLoggedIn) {
    if (screen === 'login')    return (
      <LoginPage
        onLogin={handleLoginSuccess}
        onRegister={() => setScreen('register')}
        onBack={() => setScreen('home')}
      />
    );
    if (screen === 'register') return (
      <RegisterPage
        onBack={() => setScreen('home')}
        onLogin={() => setScreen('login')}
        onSuccess={() => setScreen('login')}
      />
    );

    // ── LANDING ──
    return (
      <div style={ST.landingPage}>
        <div style={ST.bgCircle1}/><div style={ST.bgCircle2}/>
        <div style={ST.loginCard}>

          {/* Top bar */}
          <div style={ST.cardTopBar}>
            <div style={{ position:'relative' }}>
              <button style={ST.hamburgerBtn} onClick={() => setShowHamburger(p=>!p)}>
                <span style={ST.hLine}/><span style={ST.hLine}/><span style={ST.hLine}/>
              </button>
              {showHamburger && (
                <div style={ST.hamburgerMenu}>
                  {[
                    ['💰 Pricing',        () => { setShowHamburger(false); setShowPricing(true); }],
                    ['✨ Create Account', () => { setShowHamburger(false); setScreen('register'); }],
                    ['🔑 Login',          () => { setShowHamburger(false); setScreen('login'); }],
                    ['📖 About',          () => setShowHamburger(false)],
                    ['📞 Contact',        () => setShowHamburger(false)],
                  ].map(([label, fn]) => (
                    <div key={label} style={ST.hmItem} onClick={fn}>{label}</div>
                  ))}
                </div>
              )}
            </div>
            <button style={ST.topLoginBtn} onClick={() => setScreen('login')}>Login</button>
          </div>

          {/* Pricing overlay */}
          {showPricing && (
            <div style={ST.pricingOverlay}>
              <button style={ST.pricingClose} onClick={() => setShowPricing(false)}>✕</button>
              <div style={ST.pricingTitle}>💰 Pricing Plans</div>
              <div style={ST.pricingCard}>
                <div style={ST.pricingBadge}>FREE</div>
                <div style={ST.pricingPrice}>$0 <span style={ST.pricingPer}>/ session</span></div>
                <ul style={ST.pricingList}>
                  <li>✅ First 10 chats per session</li>
                  <li>✅ Full Meher Baba archives</li>
                  <li>✅ Source citations</li>
                  <li>❌ No chat history saved</li>
                </ul>
                <button className="mbtn-outline" onClick={() => { setShowPricing(false); setScreen('login'); }}>
                  Get Started Free
                </button>
              </div>
              <div style={{ ...ST.pricingCard, borderColor:'#C8A84B', background:'#FFFDF5' }}>
                <div style={{ ...ST.pricingBadge, background:'#C8A84B' }}>UNLIMITED</div>
                <div style={ST.pricingPrice}>$8 <span style={ST.pricingPer}>/ month</span></div>
                <ul style={ST.pricingList}>
                  <li>✅ Unlimited chats</li>
                  <li>✅ Full Meher Baba archives</li>
                  <li>✅ Source citations</li>
                  <li>✅ Chat history saved</li>
                </ul>
                <button className="mbtn-gold" onClick={() => { setShowPricing(false); setScreen('register'); }}>
                  Subscribe — $8/month
                </button>
              </div>
            </div>
          )}

          <div style={ST.photoFrame}>
            <img src={require('./assets/icon.png')} alt="Meher Baba" style={ST.photo}/>
          </div>
          <h1 style={ST.loginTitle}>MeherBaba.AI</h1>
          <h2 style={ST.loginSubheading}>Your Spiritual Companion</h2>
          <p  style={ST.loginSubtitle}>Ask a question or share a thought</p>
          <div style={ST.divider}/>

          {/* Guest chat box */}
          <textarea style={ST.guestInput}
            placeholder="Ask a question or share a thought..."
            value={guestQ} rows={3}
            onChange={e => setGuestQ(e.target.value)}
            onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){ e.preventDefault(); if(guestQ.trim()) setScreen('login'); }}}
          />
          <button style={ST.guestSendBtn}
            onClick={() => { if(guestQ.trim()) setScreen('login'); }}>
            ➤ Send
          </button>
          <p style={ST.guestHint}>Login to get your answer from Meher Baba archives</p>
          <p style={ST.footerText}>"I have come not to teach but to awaken." — Meher Baba</p>
        </div>
      </div>
    );
  }

  // ─── CHAT SCREEN ───────────────────────────────────────────────────────────
  return (
    <div style={ST.appContainer}>

      {/* Change Password Modal */}
      {showChangePw && (
        <div className="modal-overlay" onClick={() => setShowChangePw(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <p className="mh2">Change Password</p>
            {cpErr && <div className="merror">{cpErr}</div>}
            {cpOk  && <div className="msuccess">{cpOk}</div>}
            <form onSubmit={handleChangePw} autoComplete="on" style={{ width:'100%' }}>
              <div className="field-row"><span className="modal-label">Current Password</span>
                <input className="minput" type="password" name="old_pw" placeholder="Current password" autoComplete="current-password"/></div>
              <div className="field-row"><span className="modal-label">New Password</span>
                <input className="minput" type="password" name="new_pw" placeholder="New password" autoComplete="new-password"/></div>
              <div className="field-row"><span className="modal-label">Confirm New Password</span>
                <input className="minput" type="password" name="conf_pw" placeholder="Repeat new password" autoComplete="new-password"/></div>
              <button className="mbtn-gold" type="submit">Change Password</button>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <p className="mh2">My Profile</p>
            <div style={{ fontSize:15, lineHeight:2.2, color:'#333', fontFamily:'Arial,sans-serif' }}>
              <div><strong>Name:</strong> {currentUser?.first_name} {currentUser?.last_name}</div>
              <div><strong>Email:</strong> {currentUser?.email}</div>
              <div><strong>Phone:</strong> {currentUser?.phone ? `${currentUser.country_code} ${currentUser.phone}` : 'Not provided'}</div>
            </div>
            <button className="mbtn-gold" style={{ marginTop:20 }} onClick={() => setShowProfile(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Deactivate Modal */}
      {showDeactivate && (
        <div className="modal-overlay" onClick={() => setShowDeactivate(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <p className="mh2" style={{ color:'#CC0000' }}>Deactivate Account</p>
            <p style={{ fontSize:14, color:'#555', fontFamily:'Arial,sans-serif' }}>
              Enter your password to permanently deactivate your account.
            </p>
            {dErr && <div className="merror">{dErr}</div>}
            <form onSubmit={handleDeactivate} style={{ width:'100%' }}>
              <div className="field-row"><span className="modal-label">Password</span>
                <input className="minput" type="password" name="deact_pw" placeholder="Enter your password" autoComplete="current-password"/></div>
              <button className="mbtn-red" type="submit">Deactivate My Account</button>
              <button className="mbtn-grey" type="button" onClick={() => setShowDeactivate(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ ...ST.header, position:'relative' }}>
        <img src={require('./assets/icon.png')} alt="Meher Baba" style={ST.headerPhoto}/>
        <div style={{ flex:1 }}>
          <div style={ST.headerSubtitle}>Ask a question or share a thought</div>
          <div style={ST.headerTitle}>MeherBaba.AI</div>
        </div>
        <button style={ST.userButton} onClick={() => setShowUserMenu(p=>!p)}>
          {currentUser?.first_name} ▾
        </button>
        {showUserMenu && (
          <div className="user-menu">
            <div className="umi hdr">{currentUser?.first_name} {currentUser?.last_name}</div>
            <div className="umi" onClick={() => { setShowUserMenu(false); setShowProfile(true); }}>👤 Profile</div>
            <div className="umi" onClick={() => setShowUserMenu(false)}>📋 Subscription History</div>
            <div className="umi" onClick={() => { setShowUserMenu(false); setShowChangePw(true); setCpErr(''); setCpOk(''); }}>🔑 Change Password</div>
            <div className="umi danger" onClick={() => { setShowUserMenu(false); setShowDeactivate(true); setDErr(''); }}>⚠️ Deactivate Account</div>
            <div className="umi danger" onClick={handleLogout}>🚪 Logout</div>
          </div>
        )}
      </div>

      {histLoading && <div style={ST.historyBar}>Loading your conversation history...</div>}

      {/* Chat area */}
      <div style={ST.chatArea} ref={scrollRef}>
        {chatHistory.map(msg => (
          <div key={msg.id} style={{ ...ST.messageRow, justifyContent:msg.from==='user'?'flex-end':'flex-start' }}>
            {msg.from==='bot' && <img src={require('./assets/icon.png')} alt="bot" style={ST.botAvatar}/>}
            <div style={{ ...ST.bubble,
              backgroundColor:msg.from==='user'?'#2C5F8A':'#FFFFFF',
              borderBottomRightRadius:msg.from==='user'?4:18,
              borderBottomLeftRadius:msg.from==='bot'?4:18,
              boxShadow:msg.from==='bot'?'0 2px 8px rgba(0,0,0,0.08)':'none',
            }}>
              <FormattedText text={msg.text} isUser={msg.from==='user'}/>
              {msg.from==='bot' && <Citations citations={msg.citations}/>}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ ...ST.messageRow, justifyContent:'flex-start' }}>
            <img src={require('./assets/icon.png')} alt="bot" style={ST.botAvatar}/>
            <div style={{ ...ST.bubble, backgroundColor:'#FFF', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', display:'flex', alignItems:'center', gap:10 }}>
              <span className="spinner"/>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div style={ST.inputContainer}>
        <textarea style={ST.input}
          placeholder="Ask a question... (Enter to send, Shift+Enter for new line)"
          value={question} onChange={e=>setQuestion(e.target.value)}
          onKeyDown={handleKeyDown} rows={1}/>
        <button style={{ ...ST.sendButton, opacity:loading?0.6:1, cursor:loading?'not-allowed':'pointer' }}
          onClick={sendToGPT} disabled={loading}>➤</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────
const ST = {
  landingPage: { minHeight:'100vh', background:'linear-gradient(135deg,#e8f0fe 0%,#fce4d6 100%)',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontFamily:'Arial,Helvetica,sans-serif', position:'relative', overflow:'hidden' },
  bgCircle1: { position:'absolute', width:400, height:400, borderRadius:'50%',
    background:'rgba(44,95,138,0.08)', top:-100, right:-100 },
  bgCircle2: { position:'absolute', width:300, height:300, borderRadius:'50%',
    background:'rgba(255,160,80,0.08)', bottom:-80, left:-80 },
  loginCard: { backgroundColor:'#FFF', borderRadius:24, padding:'24px 36px 36px',
    width:'92%', maxWidth:440, minHeight:580,
    boxShadow:'0 20px 60px rgba(0,0,0,0.12)',
    display:'flex', flexDirection:'column', alignItems:'center',
    position:'relative', zIndex:1, overflow:'hidden' },
  cardTopBar: { width:'100%', display:'flex', justifyContent:'space-between',
    alignItems:'center', marginBottom:16 },
  hamburgerBtn: { background:'transparent', border:'none', cursor:'pointer',
    padding:'6px 4px', display:'flex', flexDirection:'column', gap:5 },
  hLine: { display:'block', width:24, height:2.5, background:'#555', borderRadius:2 },
  hamburgerMenu: { position:'absolute', top:42, left:0, background:'#fff',
    borderRadius:12, boxShadow:'0 8px 32px rgba(0,0,0,0.16)',
    minWidth:200, zIndex:100, overflow:'hidden' },
  hmItem: { padding:'13px 18px', fontSize:14, cursor:'pointer', color:'#222',
    fontFamily:'Arial,sans-serif', borderBottom:'1px solid #F0EBE0' },
  topLoginBtn: { background:'#C8A84B', color:'#fff', border:'none',
    borderRadius:8, padding:'8px 20px', fontSize:14, fontWeight:700, cursor:'pointer' },
  pricingOverlay: { position:'absolute', top:0, left:0, right:0, bottom:0,
    background:'#fff', borderRadius:24, padding:'24px', overflowY:'auto', zIndex:50 },
  pricingClose: { position:'absolute', top:14, right:14, background:'#EEE',
    border:'none', borderRadius:'50%', width:32, height:32,
    fontSize:16, cursor:'pointer' },
  pricingTitle: { fontSize:20, fontWeight:700, textAlign:'center',
    marginBottom:16, fontFamily:'Arial,sans-serif' },
  pricingCard: { border:'2px solid #E0D8CC', borderRadius:12,
    padding:'18px 20px', marginBottom:14, background:'#FAFAFA' },
  pricingBadge: { display:'inline-block', background:'#2C5F8A', color:'#fff',
    fontSize:11, fontWeight:700, borderRadius:20, padding:'3px 12px',
    letterSpacing:'1px', marginBottom:8, fontFamily:'Arial,sans-serif' },
  pricingPrice: { fontSize:30, fontWeight:800, color:'#111',
    fontFamily:'Arial,sans-serif', marginBottom:10 },
  pricingPer: { fontSize:14, fontWeight:400, color:'#888' },
  pricingList: { margin:'0 0 14px 0', paddingLeft:4, listStyle:'none',
    fontSize:13, lineHeight:2, color:'#444', fontFamily:'Arial,sans-serif' },
  photoFrame: { position:'relative', marginBottom:14, display:'inline-flex',
    justifyContent:'center', alignItems:'center', overflow:'hidden',
    borderRadius:'50%', width:140, height:140 },
  photo: { width:'100%', height:'100%', objectFit:'cover', objectPosition:'center top',
    display:'block', boxShadow:'0 6px 24px rgba(0,0,0,0.15)',
    border:'3px solid #e8d5b7', borderRadius:'50%' },
  loginTitle: { fontSize:22, fontWeight:'bold', margin:'0 0 4px 0',
    color:'#CC0000', letterSpacing:'1px', textAlign:'center' },
  loginSubheading: { fontSize:13, fontWeight:600, margin:'0 0 4px 0',
    color:'#CC0000', textAlign:'center' },
  loginSubtitle: { fontSize:12, color:'#9A8F82', margin:'0 0 10px 0',
    fontStyle:'italic', textAlign:'center' },
  divider: { width:50, height:2, backgroundColor:'#e8d5b7',
    borderRadius:2, marginBottom:16 },
  guestInput: { width:'100%', border:'1.5px solid #D5CFC8', borderRadius:12,
    padding:'13px 16px', fontSize:15, fontFamily:'"Palatino Linotype",Palatino,Georgia,serif',
    resize:'none', outline:'none', color:'#2A2A2A', background:'#FAFAF8',
    lineHeight:1.6, WebkitAppearance:'none' },
  guestSendBtn: { width:'100%', background:'#C8A84B', color:'#fff', border:'none',
    borderRadius:12, padding:'13px', fontSize:15, fontWeight:700,
    cursor:'pointer', marginTop:10 },
  guestHint: { fontSize:11, color:'#AAA', textAlign:'center', marginTop:8,
    fontStyle:'italic' },
  footerText: { fontSize:11, color:'#B0A090', marginTop:12,
    textAlign:'center', fontStyle:'italic', lineHeight:1.6 },
  authPage: { minHeight:'100vh', background:'linear-gradient(135deg,#e8f0fe 0%,#fce4d6 100%)',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontFamily:'Arial,Helvetica,sans-serif', position:'relative',
    overflow:'hidden', padding:'40px 16px' },
  authCard: { background:'#fff', borderRadius:16, padding:'36px 40px',
    width:'100%', maxWidth:480,
    boxShadow:'0 20px 60px rgba(0,0,0,0.14)', position:'relative', zIndex:1 },
  authLogoRow: { display:'flex', alignItems:'center', gap:12, marginBottom:20 },
  authLogo: { width:44, height:44, borderRadius:'50%', objectFit:'cover',
    objectPosition:'center top', border:'2px solid #e8d5b7' },
  authLogoText: { fontSize:18, fontWeight:700, color:'#CC0000' },
  backBtn: { position:'absolute', top:20, left:24, background:'transparent',
    color:'#555', border:'1px solid #CCC', borderRadius:8,
    padding:'7px 16px', fontSize:13, cursor:'pointer', zIndex:10 },
  appContainer: { display:'flex', flexDirection:'column', height:'100vh',
    backgroundColor:'#F4F0EB',
    fontFamily:'"Palatino Linotype",Palatino,Georgia,serif' },
  header: { padding:'14px 20px',
    background:'linear-gradient(135deg,#2C5F8A,#1A3F6F)',
    display:'flex', alignItems:'center', gap:14,
    boxShadow:'0 2px 12px rgba(0,0,0,0.15)' },
  headerPhoto: { width:48, height:48, objectFit:'cover',
    objectPosition:'center top', borderRadius:'50%',
    border:'2px solid rgba(255,255,255,0.4)', display:'block' },
  headerSubtitle: { fontSize:12, color:'rgba(255,255,255,0.85)',
    fontStyle:'italic', marginBottom:2 },
  headerTitle: { fontSize:18, fontWeight:700, color:'#FFFFFF', letterSpacing:'0.3px' },
  userButton: { backgroundColor:'rgba(255,255,255,0.2)', color:'#FFF',
    border:'1px solid rgba(255,255,255,0.4)', borderRadius:20,
    padding:'7px 16px', fontSize:13, fontWeight:600,
    cursor:'pointer', whiteSpace:'nowrap' },
  historyBar: { backgroundColor:'#2C5F8A', color:'#FFF', textAlign:'center',
    padding:'8px', fontSize:13, fontStyle:'italic' },
  chatArea: { flex:1, overflowY:'auto', padding:'20px 16px',
    display:'flex', flexDirection:'column', gap:12 },
  messageRow: { display:'flex', width:'100%', alignItems:'flex-end', gap:8 },
  botAvatar: { width:36, height:36, objectFit:'cover',
    objectPosition:'center top', borderRadius:'50%',
    flexShrink:0, border:'1.5px solid #D4C4A8' },
  bubble: { maxWidth:'72%', padding:'12px 16px', borderRadius:18,
    fontSize:15, lineHeight:1.6, wordBreak:'break-word' },
  inputContainer: { display:'flex', padding:'12px 16px', backgroundColor:'#FFFFFF',
    borderTop:'1px solid #E0D8CC', gap:10, alignItems:'flex-end',
    boxShadow:'0 -2px 12px rgba(0,0,0,0.05)' },
  input: { flex:1, backgroundColor:'#F8F5F0', border:'1.5px solid #E0D8CC',
    borderRadius:20, padding:'12px 18px', fontSize:15, outline:'none',
    resize:'none', fontFamily:'"Palatino Linotype",Palatino,Georgia,serif',
    maxHeight:120, overflowY:'auto', color:'#2A2A2A' },
  sendButton: { backgroundColor:'#2C5F8A', color:'#FFF', border:'none',
    borderRadius:'50%', width:46, height:46, fontSize:18, cursor:'pointer',
    display:'flex', alignItems:'center', justifyContent:'center',
    flexShrink:0, boxShadow:'0 4px 12px rgba(44,95,138,0.35)' },
};
