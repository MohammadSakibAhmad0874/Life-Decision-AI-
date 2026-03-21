import { useState, useEffect } from 'react';
import { getExplanation } from '../insforgeApi';

const IMPACT_COLORS = [
  { bar: 'var(--accent-primary)', bg: 'rgba(99,102,241,0.12)' },
  { bar: 'var(--accent-green)',   bg: 'rgba(16,185,129,0.12)' },
  { bar: '#f59e0b',               bg: 'rgba(245,158,11,0.12)' },
];

export default function XAIPanel({ result }) {
  const [xai, setXai] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExplanation()
      .then(r => setXai(r.data.data))
      .catch(() => setXai(null))
      .finally(() => setLoading(false));
  }, []);

  // Override with profile-specific values if we have a result
  const userFacing = xai?.user_facing || { skill_impact: 40, interest_impact: 30, risk_impact: 10 };

  const factors = [
    {
      label:   'Skill Level Impact',
      weight:  userFacing.skill_impact,
      value:   result ? Math.round((result.ml?.probability || 0) * userFacing.skill_impact / 100 * 10) / 10 : null,
      icon:    '🎯',
      desc:    'How much your skill level drives the success prediction',
    },
    {
      label:   'Interest Level Impact',
      weight:  userFacing.interest_impact,
      value:   null,
      icon:    '💡',
      desc:    'How strongly your interest score influences career alignment',
    },
    {
      label:   'Risk Tolerance Impact',
      weight:  userFacing.risk_impact,
      value:   null,
      icon:    '⚡',
      desc:    'How your risk appetite shapes the recommended path',
    },
  ];

  return (
    <div className="xai-panel card" style={{ marginTop: 24 }}>
      <div className="card-header">
        <span>🔍</span>
        <h3>Explainable AI — Why This Decision?</h3>
      </div>

      {loading ? (
        <div className="loading-dots" style={{ padding: '20px 0' }}>
          <span/><span/><span/>
        </div>
      ) : (
        <>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
            Feature importance from the trained ML model. These weights show what drives your career score.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {factors.map((f, i) => (
              <div key={f.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.1rem' }}>{f.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {f.label}
                    </span>
                  </div>
                  <span style={{
                    fontWeight: 700, fontSize: '0.95rem',
                    color: IMPACT_COLORS[i].bar,
                    background: IMPACT_COLORS[i].bg,
                    padding: '2px 10px', borderRadius: 100,
                  }}>
                    {f.weight.toFixed(1)}%
                  </span>
                </div>
                {/* Animated progress bar */}
                <div style={{
                  height: 8, borderRadius: 100,
                  background: 'rgba(255,255,255,0.06)',
                  overflow: 'hidden',
                }}>
                  <div
                    className="xai-bar"
                    style={{
                      height: '100%',
                      width: `${Math.min(f.weight, 100)}%`,
                      background: `linear-gradient(90deg, ${IMPACT_COLORS[i].bar}, ${IMPACT_COLORS[i].bar}aa)`,
                      borderRadius: 100,
                      transition: 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)',
                    }}
                  />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {result && (
            <div style={{
              marginTop: 20, padding: '12px 16px', borderRadius: 10,
              background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
            }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                <strong style={{ color: 'var(--accent-primary)' }}>AI Summary:</strong>{' '}
                {userFacing.skill_impact > userFacing.interest_impact
                  ? `Skill level is the #1 driver (${userFacing.skill_impact}% weight). `
                  : `Interest alignment is the #1 driver (${userFacing.interest_impact}% weight). `}
                {result.ml?.probability > 0.5
                  ? 'Your ML success probability is positive — strong career alignment detected.'
                  : 'Focus on upskilling to improve your ML success probability.'}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
