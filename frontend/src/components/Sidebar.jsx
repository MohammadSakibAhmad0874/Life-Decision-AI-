/**
 * Sidebar v6.0 — ChatGPT-style collapsible sidebar with smooth Framer Motion animation.
 * Props: activeTab, onTabChange, collapsed, onToggle
 */
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import PlanBadge from './PlanBadge';

const NAV_ITEMS = [
  { id: 'user-dashboard', label: 'Home',       icon: '🏠' },
  { id: 'input',          label: 'Profile',    icon: '📝' },
  { id: 'dashboard',      label: 'Report',     icon: '📊' },
  { id: 'simulation',     label: 'Simulation', icon: '🔮' },
  { id: 'mentor',         label: 'AI Mentor',  icon: '🤖' },
  { id: 'history',        label: 'History',    icon: '📋' },
  { id: 'about',          label: 'About',      icon: 'ℹ️' },
];

const PREMIUM_ITEMS = [
  { id: 'compare', label: 'Compare', icon: '⚖️' },
  { id: 'roadmap', label: 'Roadmap', icon: '🗺️' },
];

const SIDEBAR_W   = 240;
const COLLAPSED_W = 64;

export default function Sidebar({ activeTab, onTabChange, collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const isPremium = user?.plan_type === 'premium';

  const NavBtn = ({ item, locked = false }) => (
    <motion.button
      className={`sidebar-item ${activeTab === item.id ? 'active' : ''} ${locked ? 'locked' : ''} ${collapsed ? 'collapsed' : ''}`}
      onClick={() => locked ? onTabChange('pricing') : onTabChange(item.id)}
      title={item.label + (locked ? ' (Premium)' : '')}
      whileHover={{ x: collapsed ? 0 : 4, backgroundColor: 'rgba(124,107,254,0.12)' }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.15 }}
      style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
    >
      <motion.span
        className="sidebar-item-icon"
        whileHover={{ scale: 1.2, rotate: 8 }}
        transition={{ duration: 0.15 }}
      >
        {item.icon}
      </motion.span>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            className="sidebar-item-label"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {locked && !collapsed && (
          <motion.span
            className="sidebar-lock"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            🔒
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );

  return (
    <motion.aside
      className="sidebar"
      animate={{ width: collapsed ? COLLAPSED_W : SIDEBAR_W }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      style={{ overflow: 'hidden' }}
    >
      {/* Logo row + collapse toggle */}
      <div className="sidebar-logo" style={{ justifyContent: collapsed ? 'center' : 'space-between', padding: collapsed ? '22px 0' : '22px 16px 22px 20px' }}>
        <motion.div
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', minWidth: 0 }}
          whileHover={{ scale: 1.03 }}
          onClick={() => onTabChange('user-dashboard')}
        >
          <span className="sidebar-logo-icon">🧠</span>
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                className="sidebar-logo-text"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
              >
                Life Decision AI
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Collapse button — only show when expanded (toggle is in navbar too) */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.button
              onClick={onToggle}
              title="Collapse sidebar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                background: 'transparent', border: '1px solid var(--border)',
                borderRadius: 6, width: 28, height: 28, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0,
                transition: 'background 0.2s',
              }}
              whileHover={{ background: 'var(--bg-glass)' }}
              whileTap={{ scale: 0.9 }}
            >
              ◀
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => <NavBtn key={item.id} item={item} />)}

        {/* Premium section label */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              className="sidebar-section-label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {isPremium ? '⭐ Premium' : '🔒 Premium Only'}
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && <div style={{ height: 12 }} />}

        {PREMIUM_ITEMS.map(item => <NavBtn key={item.id} item={item} locked={!isPremium} />)}

        {/* Pricing */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              className="sidebar-section-label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ marginTop: 8 }}
            >
              💼 Account
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && <div style={{ height: 4 }} />}
        <NavBtn item={{ id: 'pricing', label: 'Pricing', icon: '💎' }} />
      </nav>

      {/* User footer */}
      <div className="sidebar-footer" style={{ padding: collapsed ? '16px 8px' : '16px' }}>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <PlanBadge plan={user?.plan_type} />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="sidebar-user" style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <motion.div
            className="sidebar-avatar"
            title={user?.name}
            whileHover={{ scale: 1.08 }}
          >
            {user?.name?.[0]?.toUpperCase() || '?'}
          </motion.div>

          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                className="sidebar-user-info"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="sidebar-user-name">{user?.name}</div>
                <div className="sidebar-user-email">{user?.email}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.button
          onClick={logout}
          className="sidebar-logout"
          title="Logout"
          whileHover={{ scale: 1.03, backgroundColor: 'rgba(239,68,68,0.15)' }}
          whileTap={{ scale: 0.96 }}
          style={{ padding: collapsed ? '8px' : '8px', textAlign: 'center' }}
        >
          {collapsed ? '→' : '→ Logout'}
        </motion.button>
      </div>
    </motion.aside>
  );
}
