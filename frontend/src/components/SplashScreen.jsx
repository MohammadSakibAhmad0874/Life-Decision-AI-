/**
 * SplashScreen.jsx — branded loading screen shown while auth state initializes
 */
import { motion } from 'framer-motion';

export default function SplashScreen() {
  return (
    <motion.div
      className="splash-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeInOut' } }}
    >
      {/* Animated glowing orbs */}
      <div className="splash-orb splash-orb-1" />
      <div className="splash-orb splash-orb-2" />

      <div className="splash-content">
        {/* Logo */}
        <motion.div
          className="splash-logo"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] } }}
        >
          <motion.div
            className="splash-brain"
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            🧠
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.4 } }}
        >
          <h1 className="splash-title">
            Life Decision <span style={{ color: 'var(--accent-primary)' }}>AI</span>
          </h1>
          <p className="splash-subtitle">AI-Powered Career Guidance</p>
        </motion.div>

        {/* Loading dots */}
        <motion.div
          className="splash-dots"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.5 } }}
        >
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="splash-dot"
              animate={{ y: [0, -10, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
            />
          ))}
        </motion.div>

        <motion.p
          className="splash-loading-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.6 } }}
        >
          Initializing your AI system…
        </motion.p>
      </div>
    </motion.div>
  );
}
