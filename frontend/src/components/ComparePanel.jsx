import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { compareCareer, listCareers } from '../insforgeApi';
import { formatINR, formatINRCompact } from '../utils/format';

const CAREERS = [
  "AI / ML Engineer", "Data Scientist", "Full-Stack Developer", "Cybersecurity Analyst",
  "Product Manager", "Business Analyst", "Entrepreneur / Founder", "Marketing Strategist",
  "UX / Product Designer", "Content Creator / Writer", "Research Scientist",
  "Biomedical Engineer", "Healthcare Professional", "Pharmacist / Medical Tech",
  "Software Engineer", "Data Analyst", "Cloud Architect", "Finance Analyst",
];

const WinnerBadge = ({ winner, name }) => winner === name ? (
  <span style={{
    fontSize: '0.7rem', fontWeight: 700, padding: '1px 8px',
    background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: 100, color: 'var(--accent-green)',
  }}>✓ Better</span>
) : null;

export default function ComparePanel({ initialSkill = 5, initialInterest = 5, initialRisk = 5 }) {
  const [careerA, setCareerA] = useState('AI / ML Engineer');
  const [careerB, setCareerB] = useState('Data Scientist');
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const compare = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await compareCareer({
        career_a: careerA, career_b: careerB,
        skill:    Math.min(10, Math.max(0, Number(initialSkill))),
        interest: Math.min(10, Math.max(0, Number(initialInterest))),
        risk:     Math.min(10, Math.max(0, Number(initialRisk))),
      });
      // insforgeApi.compareCareer returns result directly (not wrapped in .data)
      setResult(r);
    } catch (e) {
      console.error(e);
      setError(e?.message || 'Comparison failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { compare(); }, []);

  // Explicit winner-key map — avoids fragile string splitting
  const metrics = result ? [
    { key: 'salary_inr',     label: 'Starting Salary',  fmt: v => formatINRCompact(v), unit: '/yr',  wk: 'salary'       },
    { key: 'salary_5yr_inr', label: '5-Year Salary',    fmt: v => formatINRCompact(v), unit: '/yr',  wk: 'salary'       },
    { key: 'success_prob',   label: 'Success Rate',     fmt: v => `${v.toFixed(1)}%`,  unit: '',     wk: 'success'      },
    { key: 'job_demand',     label: 'Job Market Demand',fmt: v => `${v}/10`,            unit: '',     wk: 'demand'       },
    { key: 'growth_pct',     label: 'Annual Growth',    fmt: v => `${v}%`,              unit: '',     wk: 'growth'       },
    { key: 'difficulty',     label: 'Difficulty',       fmt: v => `${v}/10`,            unit: '',     wk: 'demand'       },
    { key: 'satisfaction',   label: 'Job Satisfaction', fmt: v => `${v}%`,              unit: '',     wk: 'satisfaction' },
  ] : [];

  const chartData = result ? [
    { name: 'Demand',        [result.career_a.name]: result.career_a.job_demand * 10,  [result.career_b.name]: result.career_b.job_demand * 10 },
    { name: 'Growth',        [result.career_a.name]: result.career_a.growth_pct * 5,   [result.career_b.name]: result.career_b.growth_pct * 5 },
    { name: 'Success',       [result.career_a.name]: result.career_a.success_prob,     [result.career_b.name]: result.career_b.success_prob },
    { name: 'Satisfaction',  [result.career_a.name]: result.career_a.satisfaction,     [result.career_b.name]: result.career_b.satisfaction },
  ] : [];

  return (
    <div className="tab-content fade-slide">
      <h2 className="section-title">⚖️ Career Comparison Mode</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>
        Compare two career paths side-by-side — salary (₹), success probability, growth, and beyond.
      </p>

      {/* Selector row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center', marginBottom: 24 }}>
        <div className="card" style={{ padding: 16 }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Career A</label>
          <select
            value={careerA}
            onChange={e => setCareerA(e.target.value)}
            style={{
              width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
              borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)',
              fontSize: '0.9rem', cursor: 'pointer',
            }}
          >
            {CAREERS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)', fontWeight: 800 }}>VS</span>

        <div className="card" style={{ padding: 16 }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Career B</label>
          <select
            value={careerB}
            onChange={e => setCareerB(e.target.value)}
            style={{
              width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
              borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)',
              fontSize: '0.9rem', cursor: 'pointer',
            }}
          >
            {CAREERS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <button onClick={compare} disabled={loading} className="btn-primary" style={{ marginBottom: 28, width: '100%' }}>
        {loading ? 'Comparing…' : '⚖️ Compare Careers'}
      </button>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10,
          padding: '12px 16px', color: '#fca5a5', marginBottom: 20, fontSize: '0.9rem' }}>
          ❌ {error}
        </div>
      )}

      {result && (
        <>
          {/* Table */}
          <div className="card" style={{ overflow: 'auto', marginBottom: 24 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, borderBottom: '1px solid var(--border-color)' }}>Metric</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--accent-primary)', borderBottom: '1px solid var(--border-color)' }}>
                    {result.career_a.name}
                  </th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', color: '#f59e0b', borderBottom: '1px solid var(--border-color)' }}>
                    {result.career_b.name}
                  </th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((m, i) => (
                  <tr key={m.key} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                    <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>{m.label}</td>
                    <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700, color: 'var(--text-primary)' }}>
                      <span>{m.fmt(result.career_a[m.key])}{m.unit}</span>{' '}
                      <WinnerBadge winner={result.winner[m.wk]} name={result.career_a.name} />
                    </td>
                    <td style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700, color: 'var(--text-primary)' }}>
                      <span>{m.fmt(result.career_b[m.key])}{m.unit}</span>{' '}
                      <WinnerBadge winner={result.winner[m.wk]} name={result.career_b.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bar chart */}
          <div className="card">
            <div className="card-header"><span>📊</span><h3>Visual Comparison</h3></div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 8 }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey={result.career_a.name} fill="var(--accent-primary)" radius={[4,4,0,0]} />
                <Bar dataKey={result.career_b.name} fill="#f59e0b" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
