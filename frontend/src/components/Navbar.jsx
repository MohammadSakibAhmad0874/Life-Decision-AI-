/**
 * Navbar v7.0 — top bar with sidebar toggle, global search, theme toggle, profile dropdown.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import PlanBadge from './PlanBadge';
import ThemeToggle from './ThemeToggle';

const TAB_LABELS = {
  'user-dashboard': '🏠 Home',
  input:            '📝 Profile',
  dashboard:        '📊 Report',
  simulation:       '🔮 Simulation',
  compare:          '⚖️ Compare',
  roadmap:          '🗺️ Roadmap',
  mentor:           '🤖 AI Mentor',
  history:          '📋 History',
  pricing:          '💎 Pricing',
  about:            'ℹ️ About',
};

// All searchable features/pages
const SEARCH_ITEMS = [
  { id: 'user-dashboard', label: 'Home Dashboard',      desc: 'Your personal overview', icon: '🏠' },
  { id: 'input',          label: 'Career Profile',       desc: 'Enter skills & interests', icon: '📝' },
  { id: 'dashboard',      label: 'AI Report',            desc: 'View AI analysis results', icon: '📊' },
  { id: 'simulation',     label: 'Future Simulation',    desc: 'Simulate 5-year trajectory', icon: '🔮' },
  { id: 'compare',        label: 'Career Comparison',    desc: 'Compare two career paths', icon: '⚖️' },
  { id: 'roadmap',        label: 'Career Roadmap',       desc: 'Step-by-step career plan', icon: '🗺️' },
  { id: 'mentor',         label: 'AI Mentor Chat',       desc: 'Chat with your AI mentor', icon: '🤖' },
  { id: 'history',        label: 'Decision History',     desc: 'Past AI analyses', icon: '📋' },
  { id: 'pricing',        label: 'Pricing & Plans',      desc: 'Free vs Premium', icon: '💎' },
  { id: 'about',          label: 'About',                desc: 'Technologies & contact', icon: 'ℹ️' },
];

function fuzzyMatch(text, query) {
  return text.toLowerCase().includes(query.toLowerCase());
}

export default function Navbar({ activeTab, onNavigate, sidebarCollapsed, onSidebarToggle }) {
  const { user, logout } = useAuth();
  const [dropOpen, setDropOpen]   = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const dropRef   = useRef(null);
  const searchRef = useRef(null);
  const inputRef  = useRef(null);

  const searchResults = searchVal.trim().length > 0
    ? SEARCH_ITEMS.filter(item =>
        fuzzyMatch(item.label, searchVal) ||
        fuzzyMatch(item.desc, searchVal)
      )
    : [];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = e => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false); setSearchVal('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handler = e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') { setSearchOpen(false); setSearchVal(''); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSearchSelect = (id) => {
    onNavigate && onNavigate(id);
    setSearchOpen(false);
    setSearchVal('');
  };

  return (
    <header className="navbar">
      {/* LEFT: sidebar toggle + breadcrumb */}
      <div className="navbar-left" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <motion.button
          onClick={onSidebarToggle}
          title={sidebarCollapsed ? 'Expand sidebar (☰)' : 'Collapse sidebar (☰)'}
          whileHover={{ scale: 1.1, backgroundColor: 'var(--bg-glass)' }}
          whileTap={{ scale: 0.9 }}
          style={{
            background: 'transparent', border: '1px solid var(--border)',
            borderRadius: 8, width: 36, height: 36, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', color: 'var(--text-secondary)', flexShrink: 0,
          }}
        >
          ☰
        </motion.button>
        <span className="navbar-breadcrumb">{TAB_LABELS[activeTab] || activeTab}</span>
      </div>

      {/* CENTER: Global Search */}
      <div className="navbar-search-wrap" ref={searchRef}>
        <motion.div
          className={`navbar-search ${searchOpen ? 'open' : ''}`}
          onClick={() => { setSearchOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
          animate={{ width: searchOpen ? 280 : 180 }}
          transition={{ duration: 0.2 }}
        >
          <span className="navbar-search-icon">🔍</span>
          <input
            ref={inputRef}
            className="navbar-search-input"
            placeholder="Search features… (Ctrl+K)"
            value={searchVal}
            onChange={e => { setSearchVal(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
          />
          {searchVal && (
            <button
              className="navbar-search-clear"
              onClick={e => { e.stopPropagation(); setSearchVal(''); inputRef.current?.focus(); }}
            >
              ✕
            </button>
          )}
        </motion.div>

        {/* Search results dropdown */}
        <AnimatePresence>
          {searchOpen && searchResults.length > 0 && (
            <motion.div
              className="search-results"
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
            >
              {searchResults.map(item => (
                <motion.button
                  key={item.id}
                  className="search-result-item"
                  onClick={() => handleSearchSelect(item.id)}
                  whileHover={{ backgroundColor: 'var(--bg-glass)', x: 4 }}
                >
                  <span className="search-result-icon">{item.icon}</span>
                  <div>
                    <div className="search-result-label">{item.label}</div>
                    <div className="search-result-desc">{item.desc}</div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}
          {searchOpen && searchVal.trim().length > 0 && searchResults.length === 0 && (
            <motion.div
              className="search-results"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
                No results for "{searchVal}"
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT: theme toggle + plan badge + profile dropdown */}
      <div className="navbar-right">
        <ThemeToggle />
        <PlanBadge plan={user?.plan_type} />

        <div className="navbar-profile" ref={dropRef}>
          <motion.button
            className="navbar-avatar-btn"
            onClick={() => setDropOpen(v => !v)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
          >
            <div className="navbar-avatar">{user?.name?.[0]?.toUpperCase() || '?'}</div>
            <span className="navbar-name">{user?.name?.split(' ')[0]}</span>
            <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>▼</span>
          </motion.button>

          <AnimatePresence>
            {dropOpen && (
              <motion.div
                className="profile-dropdown"
                style={{ top: 52, right: 0 }}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.18 }}
              >
                <div className="dropdown-header">
                  <div className="dropdown-avatar">{user?.name?.[0]?.toUpperCase()}</div>
                  <div>
                    <div className="dropdown-name">{user?.name}</div>
                    <div className="dropdown-email">{user?.email}</div>
                    <span className={`plan-badge-sm ${user?.plan_type === 'premium' ? 'premium' : 'free'}`} style={{ marginTop: 4, display: 'inline-block' }}>
                      {user?.plan_type === 'premium' ? '⭐ Premium' : '🔓 Free Plan'}
                    </span>
                  </div>
                </div>
                <hr className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => { onNavigate && onNavigate('input'); setDropOpen(false); }}>
                  📝 My Profile
                </button>
                <button className="dropdown-item" onClick={() => { onNavigate && onNavigate('about'); setDropOpen(false); }}>
                  ℹ️ About
                </button>
                <button className="dropdown-item" onClick={() => { onNavigate && onNavigate('pricing'); setDropOpen(false); }}>
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
      </div>
    </header>
  );
}
