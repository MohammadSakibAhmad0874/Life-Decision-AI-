import { useState, useEffect } from 'react';
import { getRoadmap } from '../insforgeApi';

const DOMAINS = ['Tech', 'Business', 'Creative', 'Science', 'Healthcare'];

const DOMAIN_COLORS = {
  Tech:       'var(--accent-primary)',
  Business:   '#f59e0b',
  Creative:   '#ec4899',
  Science:    'var(--accent-green)',
  Healthcare: '#06b6d4',
};

export default function RoadmapPanel({ initialSkill = 5, initialDomain = 'Tech', initialCareer = '' }) {
  const [skill,   setSkill]   = useState(initialSkill);
  const [domain,  setDomain]  = useState(initialDomain);
  const [career,  setCareer]  = useState(initialCareer);
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRoadmap = async () => {
    setLoading(true);
    try {
      const r = await getRoadmap({ skill, domain, career_path: career });
      // insforgeApi.getRoadmap returns { data: { data: {...} } }
      setData(r.data.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRoadmap(); }, []);

  const color = DOMAIN_COLORS[domain] || 'var(--accent-primary)';

  return (
    <div className="tab-content fade-slide">
      <h2 className="section-title">🗺️ Personalized Learning Roadmap</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 24 }}>
        A 12-month step-by-step plan tailored to your domain and skill level.
      </p>

      {/* Controls */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Domain
            </label>
            <select
              value={domain}
              onChange={e => setDomain(e.target.value)}
              style={{
                width: '100%', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)', fontSize: '0.88rem',
              }}
            >
              {DOMAINS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Current Skill: <strong style={{ color: 'var(--text-primary)' }}>{skill}/10</strong>
            </label>
            <input type="range" min={0} max={10} step={0.5} value={skill}
              onChange={e => setSkill(Number(e.target.value))}
              style={{ width: '100%', accentColor: color }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={fetchRoadmap} className="btn-primary" style={{ width: '100%' }}>
              🗺️ Generate Plan
            </button>
          </div>
        </div>

        {data && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { label: 'Domain', value: data.domain },
              { label: 'Skill Tier', value: data.skill_tier },
              { label: 'Duration', value: '12 Months' },
            ].map(b => (
              <div key={b.label} style={{
                padding: '4px 14px', borderRadius: 100,
                background: `${color}15`, border: `1px solid ${color}30`,
                fontSize: '0.8rem', fontWeight: 600,
              }}>
                <span style={{ color: 'var(--text-muted)' }}>{b.label}: </span>
                <span style={{ color }}>{b.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <div className="spinner" />
        </div>
      ) : data ? (
        <>
          {/* Skill note */}
          {data.skill_note && (
            <div style={{
              marginBottom: 20, padding: '12px 16px', borderRadius: 10,
              background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
              fontSize: '0.85rem', color: '#fbbf24',
            }}>
              💡 {data.skill_note}
            </div>
          )}
          {data.career_focus && (
            <div style={{
              marginBottom: 20, padding: '12px 16px', borderRadius: 10,
              background: `${color}08`, border: `1px solid ${color}25`,
              fontSize: '0.85rem', color,
            }}>
              🎯 {data.career_focus}
            </div>
          )}

          {/* Timeline */}
          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{
              position: 'absolute', left: 19, top: 24, bottom: 24,
              width: 2, background: `linear-gradient(to bottom, ${color}, ${color}22)`,
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {data.months.map((step, i) => (
                <div key={i} className="roadmap-step" style={{
                  display: 'flex', gap: 20, paddingBottom: i < data.months.length - 1 ? 28 : 0,
                  animation: `fadeSlideIn 0.4s ease-out ${i * 0.1}s both`,
                }}>
                  {/* Dot */}
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: `linear-gradient(135deg, ${color}, ${color}99)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', fontWeight: 800, color: '#fff',
                    boxShadow: `0 0 12px ${color}40`, zIndex: 1,
                  }}>
                    {i + 1}
                  </div>
                  {/* Content */}
                  <div className="card" style={{ flex: 1, padding: '14px 18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{
                        fontWeight: 700, fontSize: '0.8rem',
                        background: `${color}15`, color,
                        padding: '2px 10px', borderRadius: 100,
                      }}>
                        {step.month}
                      </span>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                        {step.focus}
                      </span>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {step.tasks.map((task, j) => (
                        <li key={j} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Could not load roadmap. Please try again.</p>
      )}
    </div>
  );
}
