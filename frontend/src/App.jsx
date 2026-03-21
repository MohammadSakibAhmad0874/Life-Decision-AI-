/**
 * App.jsx — Life Decision AI v6.0 (SaaS Edition + Theme + Collapsible Sidebar)
 * Auth-gated. Sidebar layout when logged in. AnimatePresence for transitions.
 */
import { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './index.css';

import { AuthProvider, useAuth }     from './context/AuthContext';
import { ThemeProvider }             from './context/ThemeContext';

// Auth pages
import Login         from './pages/Login';
import Signup        from './pages/Signup';
import UserDashboard from './pages/UserDashboard';
import Pricing       from './pages/Pricing';
import About         from './pages/About';

// Layout
import Sidebar       from './components/Sidebar';
import Navbar        from './components/Navbar';
import SplashScreen  from './components/SplashScreen';

// AI panels
import InputForm       from './components/InputForm';
import Dashboard       from './components/Dashboard';
import SimulationPanel from './components/SimulationPanel';
import MentorChat      from './components/MentorChat';
import HistoryPanel    from './components/HistoryPanel';
// Premium-only panels — lazy loaded to reduce initial bundle
const ComparePanel = lazy(() => import('./components/ComparePanel'));
const RoadmapPanel = lazy(() => import('./components/RoadmapPanel'));

import { simulateCareer, saveDecision } from './insforgeApi';

const SIDEBAR_W   = 240;
const COLLAPSED_W = 64;

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

// ─── Inner app (needs AuthContext) ────────────────────────────────────────────
function AppInner() {
  const { isAuthenticated, loading, user } = useAuth();
  const [authView,   setAuthView]   = useState('login');
  const [activeTab,  setActiveTab]  = useState('user-dashboard');
  const [result,     setResult]     = useState(null);
  const [simulation, setSimulation] = useState(null);
  const [domain,     setDomain]     = useState('Tech');
  const [skill,      setSkill]      = useState(5);
  const [modelTrained, setModelTrained] = useState(true); // Always true — serverless ML

  // Sidebar collapse state — auto-collapse on mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth < 768);

  // Auto-collapse on resize
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth < 768) setSidebarCollapsed(true);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggleSidebar = () => setSidebarCollapsed(v => !v);

  const isPremium = user?.plan_type === 'premium';

  const handleResult = async (data, dom) => {
    setResult(data);
    setDomain(dom || 'Tech');
    setSkill(data?.ml?.probability ?? 5);
    setActiveTab('dashboard');
    // Save decision to Insforge DB
    try {
      await saveDecision({
        skill_level:    data?.ml?.probability ? data.ml.probability * 10 : 5,
        interest_level: 5,
        risk_tolerance: 5,
        domain:         dom || 'Tech',
        result_score:   data?.overall_score ?? 5,
        suggested_path: data?.suggested_path ?? '',
        fuzzy_score:    data?.fuzzy?.score ?? 5,
        ml_probability: data?.ml?.probability ?? 0.5,
        result_json:    data,
      });
    } catch {}
    // Fetch Insforge career simulation (map to SimulationPanel format)
    try {
      const simR = await simulateCareer({
        domain:           dom || 'Tech',
        skill_level:      data?.ml?.probability ? data.ml.probability * 10 : 5,
        experience_years: 0,
      });
      const s = simR.data;
      setSimulation({
        career_path:    s.career_tier ?? dom,
        year_1_fmt:     s.projections?.year_1?.formatted ?? '—',
        year_3_fmt:     s.projections?.year_3?.formatted ?? '—',
        year_5_fmt:     s.projections?.year_5?.formatted ?? '—',
        peak_salary_fmt: s.projections?.year_5?.formatted ?? '—',
        salary_chart:   [
          { year: 'Year 0', salary: s.projections?.year_1?.amount ? Math.round(s.projections.year_1.amount / 1.18) : 0 },
          { year: 'Year 1', salary: s.projections?.year_1?.amount ?? 0 },
          { year: 'Year 3', salary: s.projections?.year_3?.amount ?? 0 },
          { year: 'Year 5', salary: s.projections?.year_5?.amount ?? 0 },
        ],
        income_growth: s.growth_rate ?? '12% per year',
        satisfaction:  'High',
        difficulty:    Math.round((data?.ml?.probability ?? 0.5) * 10),
        milestones: [
          `Get established as ${data?.suggested_path ?? 'professional'} in your domain`,
          `Build expertise — target ₹${s.projections?.year_3?.formatted ?? '—'} CTC by year 3`,
          `Senior role — aim for ${s.projections?.year_5?.formatted ?? '—'} by year 5`,
        ],
      });
    } catch {}
  };

  const handleLiveUpdate = async (data, dom) => {
    setResult(data);
    setDomain(dom || 'Tech');
    setSkill(data?.ml?.probability ?? 5);
    try {
      const simR = await simulateCareer({
        domain:           dom || 'Tech',
        skill_level:      data?.ml?.probability ? data.ml.probability * 10 : 5,
        experience_years: 0,
      });
      const s = simR.data;
      setSimulation({
        career_path:    s.career_tier ?? dom,
        year_1_fmt:     s.projections?.year_1?.formatted ?? '—',
        year_3_fmt:     s.projections?.year_3?.formatted ?? '—',
        year_5_fmt:     s.projections?.year_5?.formatted ?? '—',
        peak_salary_fmt: s.projections?.year_5?.formatted ?? '—',
        salary_chart:   [
          { year: 'Year 0', salary: s.projections?.year_1?.amount ? Math.round(s.projections.year_1.amount / 1.18) : 0 },
          { year: 'Year 1', salary: s.projections?.year_1?.amount ?? 0 },
          { year: 'Year 3', salary: s.projections?.year_3?.amount ?? 0 },
          { year: 'Year 5', salary: s.projections?.year_5?.amount ?? 0 },
        ],
        income_growth: s.growth_rate ?? '12% per year',
        satisfaction:  'High',
        difficulty:    Math.round((data?.ml?.probability ?? 0.5) * 10),
        milestones: [],
      });
    } catch {}
  };

  // ── Loading splash ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <AnimatePresence>
        <SplashScreen key="splash" />
      </AnimatePresence>
    );
  }

  // ── Unauthenticated ──────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <AnimatePresence mode="wait">
        {authView === 'login' ? (
          <motion.div key="login" {...pageVariants}>
            <Login onSwitchToSignup={() => setAuthView('signup')} />
          </motion.div>
        ) : (
          <motion.div key="signup" {...pageVariants}>
            <Signup onSwitchToLogin={() => setAuthView('login')} />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // ── Authenticated: sidebar layout ────────────────────────────────────────
  const premiumLocked = !isPremium && (activeTab === 'compare' || activeTab === 'roadmap');
  const sidebarWidth  = sidebarCollapsed ? COLLAPSED_W : SIDEBAR_W;

  return (
    <div className="saas-layout">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />

      <motion.div
        className="saas-main"
        animate={{ marginLeft: sidebarWidth }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      >
        <Navbar
          activeTab={activeTab}
          onNavigate={setActiveTab}
          sidebarCollapsed={sidebarCollapsed}
          onSidebarToggle={toggleSidebar}
        />

        {/* Serverless AI status pill */}
        <div className="train-banner">
          <span className="train-btn" style={{
            background: 'rgba(16,185,129,0.12)',
            border: '1px solid rgba(16,185,129,0.35)',
            color: 'var(--accent-green)',
            cursor: 'default',
          }}>
            ✓ Serverless AI Ready
          </span>
        </div>

        {/* Tab content */}
        <div className="saas-content">
          {/* Premium lock overlay */}
          <AnimatePresence>
            {premiumLocked && (
              <motion.div
                className="premium-lock-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="premium-lock-card"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 20 }}
                >
                  <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔒</div>
                  <h3>Premium Feature</h3>
                  <p>This feature is available to Premium users only.</p>
                  <motion.button
                    className="btn-primary"
                    style={{ marginTop: 16, width: 'auto', padding: '12px 28px' }}
                    onClick={() => setActiveTab('pricing')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    💎 View Pricing Plans
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {!premiumLocked && (
              <motion.div key={activeTab} {...pageVariants} style={{ width: '100%' }}>
                {activeTab === 'user-dashboard' && <UserDashboard onNavigate={setActiveTab} />}
                {activeTab === 'pricing'        && <Pricing onUpgradeSuccess={() => setActiveTab('user-dashboard')} />}
                {activeTab === 'about'          && <About onNavigate={setActiveTab} />}
                {activeTab === 'input'          && <InputForm onResult={handleResult} onLiveUpdate={handleLiveUpdate} />}
                {activeTab === 'dashboard'      && <Dashboard result={result} modelTrained={modelTrained} />}
                {activeTab === 'simulation'     && <SimulationPanel simulation={simulation} />}
                {activeTab === 'compare'        && (
                  <Suspense fallback={<div className="skeleton-shimmer" style={{ height: 300, borderRadius: 16 }} />}>
                    <ComparePanel initialSkill={skill} initialInterest={7} initialRisk={5} />
                  </Suspense>
                )}
                {activeTab === 'roadmap'        && (
                  <Suspense fallback={<div className="skeleton-shimmer" style={{ height: 300, borderRadius: 16 }} />}>
                    <RoadmapPanel initialSkill={skill} initialDomain={domain} initialCareer={result?.suggested_path || ''} />
                  </Suspense>
                )}
                {activeTab === 'mentor'         && <MentorChat decisionContext={result} />}
                {activeTab === 'history'        && <HistoryPanel />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Root: wrap with AuthProvider + ThemeProvider ────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </ThemeProvider>
  );
}
