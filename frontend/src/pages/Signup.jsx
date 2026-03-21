import { useState } from 'react';
import { motion } from 'framer-motion';
import { signup as insforgeSignup, getToken } from '../insforgeApi';
import { useAuth } from '../context/AuthContext';

function FloatingField({ label, name, type = 'text', value, onChange, autoComplete, hint }) {
  const [show, setShow]     = useState(false);
  const isPassword = type === 'password';
  const inputType  = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div className="float-field">
      <input
        type={inputType}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        placeholder=" "
        autoComplete={autoComplete}
        required
        className="float-input"
      />
      <label htmlFor={name} className="float-label">{label}</label>
      {isPassword && (
        <button type="button" className="pw-toggle" onClick={() => setShow(s => !s)} tabIndex={-1}>
          {show ? '🙈' : '👁'}
        </button>
      )}
      {hint && <div className="float-hint">{hint}</div>}
    </div>
  );
}

export default function Signup({ onSwitchToLogin }) {
  const { login } = useAuth();
  const [form,    setForm]    = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    try {
      const user = await insforgeSignup({ name: form.name, email: form.email, password: form.password });
      login(getToken(), user);
    } catch (err) {
      setError(err?.message || 'Signup failed. Email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      {/* Left branding */}
      <motion.div
        className="auth-brand"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-brand-inner">
          <div className="logo-badge" style={{ marginBottom: 28 }}>
            <span>✨</span> SaaS · Free &amp; Premium Plans
          </div>
          <h1 className="auth-brand-title">Join Life Decision AI</h1>
          <p className="auth-brand-sub">
            Create your free account and start making smarter career decisions powered by AI.
          </p>
          <div className="auth-brand-features">
            {[
              '✅ Free: 3 predictions/day',
              '⭐ Premium: Unlimited + all features',
              '📊 Personal dashboard &amp; history',
              '🤖 AI Mentor with reasoning',
            ].map(f => (
              <motion.div key={f} className="auth-brand-feature" whileHover={{ x: 6 }}>
                {f}
              </motion.div>
            ))}
          </div>

          <div className="auth-plan-compare">
            <div className="plan-card free">
              <div className="plan-name">FREE</div>
              <div className="plan-price">₹0</div>
              <ul>
                <li>3 predictions / day</li>
                <li>Basic simulation</li>
                <li>AI Mentor</li>
              </ul>
            </div>
            <div className="plan-card premium">
              <div className="plan-name">⭐ PREMIUM</div>
              <div className="plan-price">₹999/mo</div>
              <ul>
                <li>Unlimited predictions</li>
                <li>Advanced simulation</li>
                <li>Compare + Roadmap + XAI</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right form */}
      <motion.div
        className="auth-form-panel"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-card">
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <motion.div
              style={{ fontSize: '2.5rem', marginBottom: 8 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
            >
              🌟
            </motion.div>
            <h2 className="auth-title">Create your account</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Free forever. Upgrade anytime.</p>
          </div>

          {error && (
            <motion.div
              className="auth-error"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
            >
              ⚠️ {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <FloatingField
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
            <FloatingField
              label="Email address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
            <FloatingField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              hint="Minimum 6 characters"
            />

            <motion.button
              type="submit"
              className="btn-primary auth-btn"
              disabled={loading}
              whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(124,107,254,0.5)' }}
              whileTap={{ scale: 0.97 }}
            >
              {loading
                ? <><span className="spinner" style={{ width: 16, height: 16, marginRight: 8 }} /> Creating account…</>
                : '🎉 Create Free Account'
              }
            </motion.button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="auth-link">Sign in →</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
