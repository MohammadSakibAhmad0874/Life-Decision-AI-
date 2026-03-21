/**
 * UserDashboard — post-login landing with profile, usage meter, history.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserHistory } from '../insforgeApi';
import PlanBadge from '../components/PlanBadge';
import Skeleton from '../components/Skeleton';
import { useToast } from '../components/Toast';

export default function UserDashboard({ onNavigate }) {
  const { user, refreshUser }   = useAuth();
  const [history,  setHistory]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    getUserHistory({ page: 1, limit: 5 })
      .then(r => setHistory(r.data?.decisions || []))
      .catch((e) => showToast(e?.message || 'Could not load history.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const isPremium = user?.plan_type === 'premium';
  const joinDate  = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  return (
    <div className="udash-container fade-slide">
      {/* Greeting */}
      <div className="udash-greeting">
        <div>
          <h2 className="udash-hello">Welcome back, <span>{user?.name?.split(' ')[0]}</span> 👋</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Here's your AI career dashboard</p>
        </div>
        <PlanBadge plan={user?.plan_type} size="lg" />
      </div>

      {/* Quick Stats */}
      {loading ? (
        <Skeleton.StatCards />
      ) : (
      <div className="udash-stats-grid">
        <div className="udash-stat-card">
          <div className="udash-stat-icon">📊</div>
          <div className="udash-stat-value">{history.length}</div>
          <div className="udash-stat-label">Decisions Made</div>
        </div>
        <div className="udash-stat-card">
          <div className="udash-stat-icon">🎯</div>
          <div className="udash-stat-value">
            {history.length > 0
              ? `${Math.round(history.reduce((a, d) => a + ((d.result_score ?? 0) * 10), 0) / history.length)}%`
              : '—'}
          </div>
          <div className="udash-stat-label">Avg Success Score</div>
        </div>
        <div className="udash-stat-card">
          <div className="udash-stat-icon">📅</div>
          <div className="udash-stat-value" style={{ fontSize: '1rem' }}>{joinDate}</div>
          <div className="udash-stat-label">Member Since</div>
        </div>
        <div className="udash-stat-card">
          <div className="udash-stat-icon">{isPremium ? '⭐' : '🔓'}</div>
          <div className="udash-stat-value" style={{ fontSize: '1.1rem', color: isPremium ? 'var(--accent-amber)' : 'var(--accent-primary)' }}>
            {isPremium ? 'Premium' : 'Free'}
          </div>
          <div className="udash-stat-label">Plan</div>
        </div>
      </div>
      )}


      <div className="udash-content-grid">
        {/* Upgrade card for free users */}
        {!isPremium && (
          <div className="udash-upgrade-card">
            <div className="udash-upgrade-icon">⭐</div>
            <h3>Upgrade to Premium</h3>
            <p>Unlock unlimited predictions, career comparison, 12-month roadmaps, and full XAI explanations.</p>
            <ul className="upgrade-features">
              <li>✅ Unlimited predictions (currently 3/day)</li>
              <li>✅ Career Comparison mode</li>
              <li>✅ 12-Month Roadmap generator</li>
              <li>✅ Full Explainable AI panel</li>
            </ul>
            <button className="btn-primary" onClick={() => onNavigate('pricing')} style={{ marginTop: 16 }}>
              💎 View Pricing Plans →
            </button>
          </div>
        )}

        {/* Recent Decisions */}
        <div className="udash-history-card">
          <div className="card-header">
            <span>📋</span>
            <h3>Recent Decisions</h3>
          </div>
          {history.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 20px' }}>
              <div className="e-icon">🤖</div>
              <p>No decisions yet. Go to <strong>Profile</strong> tab to get started!</p>
              <button className="btn-primary" style={{ marginTop: 16, width: 'auto', padding: '10px 24px' }} onClick={() => onNavigate('input')}>
                Start My First Decision →
              </button>
            </div>
          ) : (
            <div className="udash-history-list">
              {history.map((d, i) => (
                <div key={d.id ?? i} className="udash-history-item">
                  <div className="udash-history-left">
                    <div className="udash-history-career">{d.suggested_path || d.domain || 'Unknown'}</div>
                    <div className="udash-history-date">{d.created_at ? new Date(d.created_at).toLocaleDateString('en-IN') : '—'}</div>
                  </div>
                  <div className="udash-history-score" style={{ color: (d.result_score ?? 0) * 10 > 70 ? 'var(--accent-green)' : (d.result_score ?? 0) * 10 > 40 ? 'var(--accent-amber)' : 'var(--accent-red)' }}>
                    {Math.round((d.result_score ?? 0) * 10)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="udash-quick-actions">
        <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Quick Actions</h4>
        <div className="quick-action-grid">
          {[
            { icon: '📝', label: 'New Decision',   tab: 'input'      },
            { icon: '📊', label: 'View Report',     tab: 'dashboard'  },
            { icon: '🔮', label: 'Simulation',      tab: 'simulation' },
            { icon: '🤖', label: 'Ask AI Mentor',   tab: 'mentor'     },
            ...(isPremium ? [
              { icon: '⚖️', label: 'Compare Careers', tab: 'compare' },
              { icon: '🗺️', label: 'My Roadmap',       tab: 'roadmap' },
            ] : []),
          ].map(a => (
            <button key={a.tab} className="quick-action-btn" onClick={() => onNavigate(a.tab)}>
              <span style={{ fontSize: '1.5rem' }}>{a.icon}</span>
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
