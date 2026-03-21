/**
 * Skeleton.jsx — shimmer skeleton loader for loading states.
 * Usage: <Skeleton width="100%" height={20} borderRadius={8} />
 *        <Skeleton.Card />   — pre-built card skeleton
 *        <Skeleton.List n={5} />  — list of n row skeletons
 */

function SkeletonBase({ width = '100%', height = 16, borderRadius = 6, style = {} }) {
  return (
    <div
      className="skeleton-shimmer"
      style={{ width, height, borderRadius, ...style }}
    />
  );
}

function SkeletonCard() {
  return (
    <div style={{
      background: 'var(--bg-glass)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 20, display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <SkeletonBase width={36} height={36} borderRadius={8} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SkeletonBase width="60%" height={14} />
          <SkeletonBase width="40%" height={11} />
        </div>
      </div>
      <SkeletonBase width="100%" height={11} />
      <SkeletonBase width="80%" height={11} />
      <SkeletonBase width="90%" height={11} />
    </div>
  );
}

function SkeletonList({ n = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} style={{
          display: 'flex', gap: 16, alignItems: 'center',
          background: 'var(--bg-glass)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)', padding: '14px 18px',
        }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SkeletonBase width={`${55 + (i % 3) * 15}%`} height={13} />
            <SkeletonBase width="40%" height={10} />
          </div>
          <SkeletonBase width={52} height={28} borderRadius={100} />
        </div>
      ))}
    </div>
  );
}

function SkeletonStatCards() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px,1fr))', gap: 16 }}>
      {[1,2,3,4].map(i => (
        <div key={i} style={{ background:'var(--bg-glass)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:20, textAlign:'center', display:'flex', flexDirection:'column', gap:10, alignItems:'center' }}>
          <SkeletonBase width={36} height={36} borderRadius="50%" />
          <SkeletonBase width="60%" height={20} />
          <SkeletonBase width="80%" height={11} />
        </div>
      ))}
    </div>
  );
}

const Skeleton       = SkeletonBase;
Skeleton.Card        = SkeletonCard;
Skeleton.List        = SkeletonList;
Skeleton.StatCards   = SkeletonStatCards;
export default Skeleton;
