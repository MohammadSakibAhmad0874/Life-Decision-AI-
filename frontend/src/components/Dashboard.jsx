import { RadialBarChart, RadialBar, Cell, ResponsiveContainer } from 'recharts';
import XAIPanel from './XAIPanel';
import { formatINRCompact, usdToINR } from '../utils/format';

const DOMAIN_COLORS = {
  Tech: '#6366f1', Business: '#f59e0b', Creative: '#ec4899',
  Science: '#06b6d4', Healthcare: '#10b981',
};

function ScoreRing({ score }) {
  const pct = Math.round(score * 100);
  const color = pct >= 65 ? '#10b981' : pct >= 40 ? '#6366f1' : '#f87171';
  const data = [
    { value: pct,       fill: color },
    { value: 100 - pct, fill: 'rgba(255,255,255,0.05)' },
  ];
  return (
    <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto' }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius={45} outerRadius={65} data={data} startAngle={90} endAngle={-270} barSize={12}>
          <RadialBar dataKey="value" cornerRadius={8} background={false}>
            {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
          </RadialBar>
        </RadialBarChart>
      </ResponsiveContainer>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: '1.8rem', fontWeight: 800, color, lineHeight: 1 }}>{pct}%</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>SCORE</span>
      </div>
    </div>
  );
}

export default function Dashboard({ result, modelTrained }) {
  if (!result) {
    return (
      <div className="glass-card empty-state">
        <div className="e-icon">🎯</div>
        <p>Fill in your profile and click <strong>Analyse Profile</strong> to see your AI-powered decision report here.</p>
      </div>
    );
  }

  const { suggested_path, advice, domain, risk_label, overall_score, fuzzy, ml, genetic_algorithm } = result;
  const domainColor = DOMAIN_COLORS[domain] || 'var(--accent-primary)';
  const riskColor = risk_label === 'Low Risk' ? 'var(--accent-green)'
    : risk_label === 'Moderate Risk' ? '#f59e0b' : '#f87171';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Hero row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center' }} className="glass-card">
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: domainColor, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            {domain} · {risk_label}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.3, marginBottom: 10 }}>{suggested_path}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{advice}</p>
          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {modelTrained && (
              <span style={{
                fontSize: '0.75rem', fontWeight: 600,
                background: 'rgba(16,185,129,0.12)', color: 'var(--accent-green)',
                border: '1px solid rgba(16,185,129,0.3)', borderRadius: 100, padding: '3px 10px',
              }}>✓ Trained ML Model Active</span>
            )}
            <span style={{
              fontSize: '0.75rem', fontWeight: 600,
              background: `${domainColor}15`, color: domainColor,
              border: `1px solid ${domainColor}30`, borderRadius: 100, padding: '3px 10px',
            }}>🌐 {domain} Domain</span>
          </div>
        </div>
        <ScoreRing score={overall_score} />
      </div>

      {/* Stat cards */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon">🔵</div>
          <div className="stat-label">Fuzzy Logic Path</div>
          <div className="stat-value" style={{ fontSize: '0.9rem', color: domainColor }}>{fuzzy.path}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Confidence: {Math.round(fuzzy.confidence * 100)}%
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🤖</div>
          <div className="stat-label">ML Model</div>
          <div className="stat-value green">{Math.round(ml.probability * 100)}%</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{ml.label}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-label">Risk Profile</div>
          <div className="stat-value" style={{ color: riskColor, fontSize: '1rem' }}>{risk_label}</div>
        </div>
      </div>

      {/* Progress bars */}
      <div className="glass-card">
        <div className="section-title">📊 AI Engine Confidence Breakdown</div>
        {[
          { label: 'Fuzzy Logic Confidence', value: fuzzy.confidence, color: 'var(--accent-primary)' },
          { label: 'ML Success Probability', value: ml.probability, color: 'var(--accent-green)' },
          { label: 'GA Fitness Score',       value: Math.min(1, genetic_algorithm.fitness_score * 4), color: '#06b6d4' },
        ].map(({ label, value, color }) => (
          <div className="progress-bar-wrap" key={label}>
            <div className="progress-bar-header">
              <span style={{ fontSize: '0.875rem' }}>{label}</span>
              <span style={{ fontWeight: 700, color }}>{Math.round(value * 100)}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${value * 100}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
            </div>
          </div>
        ))}
      </div>

      {/* XAI Explainability */}
      <XAIPanel result={result} />

      {/* GA Top 3 Careers */}
      <div className="glass-card">
        <div className="section-title">🧬 Top 3 GA-Optimised Careers</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {(genetic_algorithm.top_3_careers || []).map((c, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: 'var(--bg-glass)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', padding: '14px 18px',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: i === 0 ? 'var(--gradient-hero)' : 'var(--bg-glass)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '0.9rem',
                color: i === 0 ? 'white' : 'var(--text-muted)',
              }}>#{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.career}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {c.domain} · Demand {c.job_demand}/10
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, color: 'var(--accent-green)', fontSize: '1rem' }}>
                  {formatINRCompact(usdToINR(c.salary_estimate))}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  ₹/yr · Fitness {Math.round(c.fitness_score * 100)}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Top actions */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>🏆 Top Recommended Actions</div>
          <div className="top-actions">
            {(genetic_algorithm.top_actions || []).map(a => (
              <span key={a} className="action-tag">✦ {a}</span>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
