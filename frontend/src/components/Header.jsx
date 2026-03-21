import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { label: 'Home',      href: '#home' },
  { label: 'Features',  href: '#features' },
  { label: 'Pricing',   href: '#pricing' },
];

export default function Header({ activePage, onNav }) {
  const { user, logout } = useAuth();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Logo */}
        <motion.div
          className="header-logo"
          whileHover={{ scale: 1.05 }}
          onClick={() => onNav && onNav('home')}
          style={{ cursor: 'pointer' }}
        >
          <span className="header-logo-icon">🧠</span>
          <span className="header-logo-text">Life Decision <span style={{ color: 'var(--accent-primary)' }}>AI</span></span>
        </motion.div>

        {/* Nav links */}
        <nav className="header-nav">
          {NAV_LINKS.map(({ label, href }) => (
            <motion.a
              key={label}
              href={href}
              className="header-nav-link"
              whileHover={{ color: 'var(--accent-primary)' }}
            >
              {label}
            </motion.a>
          ))}
        </nav>

        {/* Right: user profile or auth buttons */}
        {user ? (
          <div className="header-user" ref={dropRef}>
            <motion.button
              className="header-avatar-btn"
              onClick={() => setDropOpen(v => !v)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
            >
              <div className="header-avatar">{user.name?.[0]?.toUpperCase() || 'U'}</div>
              <span className="header-username">{user.name?.split(' ')[0]}</span>
              <span className={`plan-badge-sm ${user.plan_type === 'premium' ? 'premium' : 'free'}`}>
                {user.plan_type === 'premium' ? '⭐' : '🔓'} {user.plan_type}
              </span>
              <span style={{ fontSize: '0.7rem', opacity: 0.6, marginLeft: 4 }}>▼</span>
            </motion.button>

            <AnimatePresence>
              {dropOpen && (
                <motion.div
                  className="profile-dropdown"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                >
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">{user.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <div className="dropdown-name">{user.name}</div>
                      <div className="dropdown-email">{user.email}</div>
                      <span className={`plan-badge-sm ${user.plan_type === 'premium' ? 'premium' : 'free'}`} style={{ marginTop: 4 }}>
                        {user.plan_type === 'premium' ? '⭐ Premium' : '🔓 Free Plan'}
                      </span>
                    </div>
                  </div>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item" onClick={() => { onNav && onNav('profile'); setDropOpen(false); }}>
                    👤 My Profile
                  </button>
                  <button className="dropdown-item" onClick={() => { onNav && onNav('pricing'); setDropOpen(false); }}>
                    💎 Upgrade Plan
                  </button>
                  <hr className="dropdown-divider" />
                  <button className="dropdown-item danger" onClick={() => { logout(); setDropOpen(false); }}>
                    → Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="header-auth-btns">
            <motion.button className="btn-ghost" whileHover={{ scale: 1.04 }} onClick={() => onNav && onNav('login')}>
              Sign In
            </motion.button>
            <motion.button className="btn-primary" style={{ padding: '8px 20px' }} whileHover={{ scale: 1.04 }} onClick={() => onNav && onNav('signup')}>
              Get Started Free
            </motion.button>
          </div>
        )}
      </div>
    </header>
  );
}
