import { motion } from 'framer-motion';

/**
 * Shimmer skeleton loader — use while content is loading.
 * Props: width (CSS), height (CSS), radius (CSS), style (optional object)
 */
export function SkeletonCard({ width = '100%', height = '80px', radius = '12px', style = {} }) {
  return (
    <div
      className="skeleton-shimmer"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}

/**
 * Animated stat card with icon + value + label
 */
export function StatCard({ icon, value, label, accent = false, delay = 0 }) {
  return (
    <motion.div
      className={`stat-card ${accent ? 'accent' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}
    >
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </motion.div>
  );
}
