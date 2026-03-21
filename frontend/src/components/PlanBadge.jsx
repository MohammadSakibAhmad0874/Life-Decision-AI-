/**
 * PlanBadge — inline Free/Premium badge.
 */
export default function PlanBadge({ plan, size = 'sm' }) {
  const isPremium = plan === 'premium';
  const styles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: size === 'lg' ? '8px 18px' : '4px 10px',
    borderRadius: 100,
    fontSize: size === 'lg' ? '0.9rem' : '0.75rem',
    fontWeight: 700,
    background: isPremium
      ? 'linear-gradient(135deg, rgba(245,158,11,0.25), rgba(251,191,36,0.15))'
      : 'rgba(99,102,241,0.15)',
    border: `1px solid ${isPremium ? 'rgba(245,158,11,0.5)' : 'rgba(99,102,241,0.35)'}`,
    color: isPremium ? '#fbbf24' : 'var(--accent-primary)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  };

  return (
    <span style={styles}>
      {isPremium ? '⭐ Premium' : '🔓 Free'}
    </span>
  );
}
