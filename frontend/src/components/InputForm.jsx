import { useState, useEffect, useCallback, useRef } from 'react';
import { predictDecision } from '../insforgeApi';

const DOMAINS = ['Tech', 'Business', 'Creative', 'Science', 'Healthcare'];

const DOMAIN_ICONS = { Tech: '💻', Business: '💼', Creative: '🎨', Science: '🔬', Healthcare: '🏥' };
const DOMAIN_COLORS = {
  Tech:       'var(--accent-primary)',
  Business:   '#f59e0b',
  Creative:   '#ec4899',
  Science:    'var(--accent-green)',
  Healthcare: '#06b6d4',
};

function Slider({ label, value, setValue, icon }) {
  const color = value >= 7 ? 'var(--accent-green)' : value >= 4 ? 'var(--accent-primary)' : '#f87171';
  return (
    <div className="slider-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <span>{icon}</span>{label}
        </label>
        <span style={{
          fontWeight: 800, fontSize: '1.1rem', color,
          background: `${color}15`, padding: '2px 12px', borderRadius: 100,
          minWidth: 48, textAlign: 'center', transition: 'color 0.3s',
        }}>
          {value.toFixed(1)}
        </span>
      </div>
      <input
        type="range" min={0} max={10} step={0.5} value={value}
        onChange={e => setValue(Number(e.target.value))}
        style={{ width: '100%', accentColor: color }}
        className="slider"
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>
        <span>0 — Low</span>
        <span>10 — High</span>
      </div>
    </div>
  );
}

export default function InputForm({ onResult, onLiveUpdate }) {
  const [domain,    setDomain]    = useState('Tech');
  const [skill,     setSkill]     = useState(7);
  const [interest,  setInterest]  = useState(7);
  const [risk,      setRisk]      = useState(5);
  const [interests, setInterests] = useState('');
  const [loading,   setLoading]   = useState(false);
  const [liveLoading, setLiveLoading] = useState(false);
  const debounceRef = useRef(null);

  // Real-time debounced update
  useEffect(() => {
    if (!onLiveUpdate) return;
    setLiveLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await predictDecision({ skill_level: skill, interest_level: interest, risk_tolerance: risk, domain });
        onLiveUpdate(r.data, domain);
      } catch {}
      finally { setLiveLoading(false); }
    }, 600);
    return () => clearTimeout(debounceRef.current);
  }, [skill, interest, risk, domain]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await predictDecision({ skill_level: skill, interest_level: interest, risk_tolerance: risk, domain });
      onResult(r.data, domain);
    } catch (err) {
      alert('Prediction failed: ' + (err?.message || 'Please check your connection and try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-content fade-slide">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h2 className="section-title" style={{ margin: 0 }}>📝 Your Profile</h2>
        {liveLoading && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} />
            Updating live…
          </span>
        )}
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 28 }}>
        Move the sliders — results update in real-time. Click Analyse Profile for the full report.
      </p>

      <form onSubmit={handleSubmit}>
        {/* Domain selection */}
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 14, fontWeight: 600 }}>
            🌐 Choose Your Domain
          </h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {DOMAINS.map(d => {
              const active = domain === d;
              const col = DOMAIN_COLORS[d];
              return (
                <button
                  key={d} type="button"
                  onClick={() => setDomain(d)}
                  style={{
                    padding: '8px 18px', borderRadius: 100,
                    fontWeight: 700, fontSize: '0.88rem',
                    border: `2px solid ${active ? col : 'var(--border-color)'}`,
                    background: active ? `${col}18` : 'transparent',
                    color: active ? col : 'var(--text-muted)',
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'all 0.2s',
                    transform: active ? 'scale(1.04)' : 'scale(1)',
                  }}
                >
                  {DOMAIN_ICONS[d]} {d}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sliders */}
        <div className="card" style={{ padding: 24, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Slider label="Skill Level" value={skill} setValue={setSkill} icon="🎯" />
          <Slider label="Interest Level" value={interest} setValue={setInterest} icon="💡" />
          <Slider label="Risk Tolerance" value={risk} setValue={setRisk} icon="⚡" />
        </div>

        {/* Interests text */}
        <div className="card" style={{ padding: 20, marginBottom: 24 }}>
          <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
            ✍️ Your interests (optional)
          </label>
          <textarea
            value={interests}
            onChange={e => setInterests(e.target.value)}
            placeholder="e.g. AI, startup, design, research, data science..."
            rows={2}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)',
              borderRadius: 10, padding: '10px 14px', resize: 'vertical',
              color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '0.9rem',
            }}
          />
        </div>

        <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', fontSize: '1rem' }}>
          {loading ? (
            <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Analysing…</>
          ) : '🚀 Analyse Profile'}
        </button>
      </form>
    </div>
  );
}
