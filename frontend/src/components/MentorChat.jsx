import { useState, useRef, useEffect } from 'react';
import { sendMentorMessage } from '../insforgeApi';

const formatTime = () => {
  const now = new Date();
  return now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

export default function MentorChat({ decisionContext }) {
  const [messages, setMessages] = useState([{
    role: 'mentor',
    content: `Hello! I'm your AI Life Mentor 🤖. I've analysed thousands of career profiles and I'm here to help you make smarter life and career decisions.\n\nYou can ask me about **skills**, **salary projections**, **career risks**, **roadmaps**, or the **XAI decision breakdown**. I'll give you real, data-driven answers tailored to your profile.`,
    follow_up: 'What would you like to explore first?',
    time: formatTime(),
  }]);
  const [input, setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text = input) => {
    const msg = text.trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg, time: formatTime() }]);
    setLoading(true);
    try {
      const r = await sendMentorMessage(msg, decisionContext);
      const d = r.data.data;
      setMessages(prev => [...prev, {
        role: 'mentor',
        content:   d.response,
        follow_up: d.follow_up,
        reasoning: d.reasoning,
        warnings:  d.warnings,
        time: formatTime(),
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'mentor',
        content: '⚠️ Could not reach the AI Mentor. Please check your connection and try again.',
        time: formatTime(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const suggestions = ['What career suits me?', 'Explain my XAI score', 'How to improve my salary?', 'Roadmap for tech'];

  return (
    <div className="tab-content fade-slide" style={{ display: 'flex', flexDirection: 'column', height: '72vh' }}>
      <div style={{ marginBottom: 12 }}>
        <h2 className="section-title" style={{ margin: 0 }}>🤖 AI Life Mentor</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', margin: '4px 0 0' }}>
          Profile-aware chatbot — reasoning, warnings, and INR salary guidance included.
        </p>
      </div>

      {/* Suggestion chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {suggestions.map(s => (
          <button key={s} onClick={() => send(s)}
            style={{
              padding: '5px 14px', borderRadius: 100, fontSize: '0.78rem', fontWeight: 600,
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
              color: 'var(--accent-primary)', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14,
        padding: '12px 0', scrollbarGutter: 'stable',
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              padding: '12px 16px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, var(--accent-primary), #8b5cf6)'
                : 'var(--bg-secondary)',
              border: msg.role === 'mentor' ? '1px solid var(--border-color)' : 'none',
            }}>
              <p style={{
                margin: 0, fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                color: msg.role === 'user' ? '#fff' : 'var(--text-secondary)',
              }}>
                {msg.content}
              </p>

              {msg.follow_up && (
                <p style={{
                  margin: '10px 0 0', padding: '8px 12px', borderRadius: 8, fontSize: '0.82rem',
                  background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)',
                  color: 'var(--accent-primary)', fontStyle: 'italic',
                }}>
                  💬 {msg.follow_up}
                </p>
              )}

              {msg.reasoning && (
                <p style={{
                  margin: '8px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)',
                  borderTop: '1px solid var(--border-color)', paddingTop: 8,
                }}>
                  🔍 {msg.reasoning}
                </p>
              )}

              {msg.warnings?.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {msg.warnings.map((w, j) => (
                    <p key={j} style={{
                      margin: 0, fontSize: '0.78rem', color: '#fbbf24',
                      background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                      borderRadius: 6, padding: '4px 10px',
                    }}>
                      {w}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '4px 4px 0' }}>{msg.time}</span>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}>
            <div className="loading-dots"><span/><span/><span/></div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Mentor is thinking…</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 10, paddingTop: 12, borderTop: '1px solid var(--border-color)' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask about careers, skills, salary, roadmap…"
          style={{
            flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
            borderRadius: 12, padding: '10px 16px', color: 'var(--text-primary)',
            fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none',
          }}
        />
        <button onClick={() => send()} disabled={loading || !input.trim()}
          className="btn-primary"
          style={{ padding: '10px 20px', borderRadius: 12 }}
        >
          ↑
        </button>
      </div>
    </div>
  );
}
