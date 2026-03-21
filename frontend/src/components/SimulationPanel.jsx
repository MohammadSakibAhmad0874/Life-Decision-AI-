import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatINRCompact } from '../utils/format';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
        borderRadius: 10, padding: '10px 16px',
      }}>
        <p style={{ color: 'var(--text-muted)', margin: '0 0 4px', fontSize: '0.8rem' }}>{label}</p>
        <p style={{ color: 'var(--accent-primary)', margin: 0, fontSize: '1rem', fontWeight: 700 }}>
          {formatINRCompact(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export default function SimulationPanel({ simulation }) {
  if (!simulation) {
    return (
      <div className="tab-content fade-slide" style={{ textAlign: 'center', padding: '60px 0' }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>📈</div>
        <p style={{ color: 'var(--text-muted)' }}>Run a Profile Analysis first to see your 5-year salary simulation.</p>
      </div>
    );
  }

  const { career_path, salary_chart, year_1_fmt, year_3_fmt, year_5_fmt, peak_salary_fmt,
          milestones, income_growth, satisfaction, difficulty } = simulation;

  return (
    <div className="tab-content fade-slide">
      <h2 className="section-title">📈 5-Year Career Simulation</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>
        INR salary projection for <strong style={{ color: 'var(--accent-primary)' }}>{career_path}</strong>
      </p>

      {/* Salary callouts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Year 1 Salary', value: year_1_fmt },
          { label: 'Year 3 Salary', value: year_3_fmt },
          { label: 'Year 5 Salary', value: year_5_fmt },
          { label: 'Peak (5 yr)',   value: peak_salary_fmt },
        ].map((s, i) => (
          <div key={s.label} className="card" style={{
            padding: '14px 16px', textAlign: 'center',
            background: i === 3 ? 'rgba(99,102,241,0.08)' : undefined,
            border: i === 3 ? '1px solid rgba(99,102,241,0.2)' : undefined,
          }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.76rem', margin: '0 0 6px' }}>{s.label}</p>
            <p style={{ fontWeight: 800, fontSize: '1.05rem', color: i === 3 ? 'var(--accent-primary)' : 'var(--text-primary)', margin: 0 }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card" style={{ marginBottom: 24, padding: 20 }}>
        <div className="card-header" style={{ marginBottom: 16 }}>
          <span>💹</span><h3>Salary Growth Curve (₹ INR)</h3>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={salary_chart} margin={{ top: 5, right: 20, bottom: 5, left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="year" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => formatINRCompact(v)} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone" dataKey="salary"
              stroke="url(#salGrad)" strokeWidth={3}
              dot={{ r: 5, fill: 'var(--accent-primary)', stroke: '#1e1e2e', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: '#fff' }}
              isAnimationActive={true} animationDuration={1200} animationEasing="ease-out"
            />
            <defs>
              <linearGradient id="salGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--accent-primary)" />
                <stop offset="100%" stopColor="var(--accent-green)" />
              </linearGradient>
            </defs>
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Meta stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Income Growth',    value: income_growth,         icon: '📈' },
          { label: 'Job Satisfaction', value: satisfaction,          icon: '😊' },
          { label: 'Difficulty Level', value: `${difficulty}/10`,    icon: '⚡' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span>{s.icon}</span>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{s.label}</span>
            </div>
            <p style={{ fontWeight: 700, color: 'var(--text-primary)', margin: 0, fontSize: '0.9rem' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Milestones */}
      {milestones?.length > 0 && (
        <div className="card">
          <div className="card-header"><span>🏆</span><h3>Key Milestones</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
            {milestones.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', background: 'rgba(99,102,241,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-primary)', flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  {m}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
