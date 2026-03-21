import { useState, useEffect } from 'react';
import { getUserHistory } from '../insforgeApi';
import Skeleton from './Skeleton';
import { useToast } from './Toast';

const DOMAIN_COLORS = {
  Tech: '#6366f1', Business: '#f59e0b', Creative: '#ec4899',
  Science: '#06b6d4', Healthcare: '#10b981',
};

export default function HistoryPanel() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');
  const { showToast } = useToast();

  useEffect(() => { fetchHistory(); }, []);

  const fetchHistory = async () => {
    setLoading(true); setError('');
    try {
      const res = await getUserHistory({ page: 1, limit: 20 });
      setHistory(res.data?.decisions ?? []);
    } catch (e) {
      const msg = e?.message || 'Could not load history.';
      setError(msg);
      showToast(msg, 'error');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="glass-card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Skeleton width={160} height={18} borderRadius={6} />
        <Skeleton width={72} height={30} borderRadius={8} />
      </div>
      <Skeleton.List n={5} />
    </div>
  );

  if (error) return (
    <div className="glass-card">
      <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>
      <button className="btn-secondary" onClick={fetchHistory} style={{ width: '100%' }}>↺ Try Again</button>
    </div>
  );

  if (!history.length) return (
    <div className="glass-card empty-state">
      <div className="e-icon">📋</div>
      <p>No decisions yet. Run an AI analysis to record your first decision here.</p>
      <button className="btn-secondary" onClick={fetchHistory} style={{ marginTop: 12 }}>↺ Refresh</button>
    </div>
  );


  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>📋 Past Decisions ({history.length})</h2>
        <button
          onClick={fetchHistory}
          style={{
            background: 'var(--bg-glass)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '6px 14px', color: 'var(--text-secondary)',
            fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >↺ Refresh</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {history.map((row) => {
          // Insforge fields: skill_level, interest_level, risk_tolerance,
          // result_score (0-10), suggested_path, domain, ml_probability, created_at
          const score  = Math.round((row.result_score ?? 0) * 10); // 0-100
          const dc     = DOMAIN_COLORS[row.domain] || 'var(--accent-primary)';
          return (
            <div key={row.id} style={{
              display: 'grid', gridTemplateColumns: '1fr auto',
              gap: 16, alignItems: 'center',
              background: 'var(--bg-glass)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '14px 18px',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px',
                    borderRadius: 100, background: `${dc}22`, color: dc, border: `1px solid ${dc}44`,
                  }}>{row.domain}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>{row.suggested_path}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Skill {row.skill_level?.toFixed(1)} · Interest {row.interest_level?.toFixed(1)} · Risk {row.risk_tolerance?.toFixed(1)}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>
                  {row.created_at ? new Date(row.created_at).toLocaleDateString('en-IN') : ''}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontSize: '1.3rem', fontWeight: 800,
                  color: score >= 60 ? 'var(--accent-green)' : score >= 40 ? 'var(--accent-amber)' : 'var(--accent-red)',
                }}>{score}%</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {row.ml_probability ? `${Math.round(row.ml_probability * 100)}% ML confidence` : ''}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
