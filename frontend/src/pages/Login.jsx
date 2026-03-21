import { useState } from 'react';
import { motion } from 'framer-motion';
import { login as insforgeLogin, getToken } from '../insforgeApi';
import { useAuth } from '../context/AuthContext';

function FloatingField({ label, name, type = 'text', value, onChange, autoComplete }) {
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
    </div>
  );
}

export default function Login({ onSwitchToSignup }) {
  const { login } = useAuth();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await insforgeLogin({ email: form.email, password: form.password });
      login(getToken(), user);
    } catch (err) {
      setError(err?.message || 'Invalid email or password.');
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
            <span>🔒</span> Secure Login
          </div>
          <h1 className="auth-brand-title">Welcome Back to Life Decision AI</h1>
          <p className="auth-brand-sub">
            Your personalized AI career advisor is ready. Log in to access your dashboard and continue your journey.
          </p>
          <div className="auth-brand-features">
            {[
              '🧠 AI-powered career decisions',
              '📊 Track your decision history',
              '🤖 AI Mentor available 24/7',
              '🔒 JWT-secured session',
            ].map(f => (
              <motion.div
                key={f}
                className="auth-brand-feature"
                whileHover={{ x: 6 }}
              >
                {f}
              </motion.div>
            ))}
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
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              🔐
            </motion.div>
            <h2 className="auth-title">Sign in to your account</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Enter your credentials below</p>
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
              autoComplete="current-password"
            />

            <motion.button
              type="submit"
              className="btn-primary auth-btn"
              disabled={loading}
              whileHover={{ scale: 1.02, boxShadow: '0 0 24px rgba(124,107,254,0.5)' }}
              whileTap={{ scale: 0.97 }}
            >
              {loading
                ? <><span className="spinner" style={{ width: 16, height: 16, marginRight: 8 }} /> Signing in…</>
                : '→ Sign In'
              }
            </motion.button>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <button onClick={onSwitchToSignup} className="auth-link">Create one free →</button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
