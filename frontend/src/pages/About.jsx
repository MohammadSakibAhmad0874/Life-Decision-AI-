/**
 * About.jsx — Professional About page for Life Decision AI
 * Sections: What is it, How it Works, Technologies, Features, Contact
 */
import { motion } from 'framer-motion';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay, ease: 'easeOut' } },
});

const TECHNOLOGIES = [
  {
    icon: '🔮',
    name: 'Fuzzy Logic',
    desc: 'Handles uncertainty and imprecision in human decision-making. Maps vague inputs like "medium skill" into precise career recommendations.',
  },
  {
    icon: '🤖',
    name: 'Machine Learning',
    desc: 'Logistic Regression & Decision Tree models trained on real career datasets to predict the best-fit career path with confidence scores.',
  },
  {
    icon: '🧬',
    name: 'Genetic Algorithm',
    desc: 'Evolutionary optimization that generates optimal career sequences — simulating natural selection to find the best 5-year career path.',
  },
  {
    icon: '🧠',
    name: 'XAI (Explainable AI)',
    desc: 'Every decision comes with a transparent explanation — you know exactly WHY the AI recommended a path, not just what it recommends.',
  },
];

const FEATURES = [
  { icon: '🎯', name: 'AI Decision Engine',   desc: 'Enter your skills, interests, and risk appetite — get an AI-powered career recommendation in seconds.' },
  { icon: '🔮', name: 'Future Simulation',    desc: 'Simulate your career trajectory over 5 years with salary projections, growth rates, and milestone predictions.' },
  { icon: '🤖', name: 'AI Career Mentor',     desc: 'Chat with your personal AI mentor. Ask anything about careers, skills, preparation, and job markets.' },
  { icon: '🗺️', name: 'Career Roadmap',       desc: 'Get a step-by-step personalized roadmap: milestones, certifications, timelines, and skill-building plan.' },
  { icon: '⚖️', name: 'Career Comparison',    desc: 'Compare two career paths side-by-side: job demand, salary, growth, and AI-generated winner analysis.' },
  { icon: '📋', name: 'Decision History',      desc: 'Track all your past AI analyses. Review your growth, compare decisions, and monitor your career progress.' },
];

const HOW_IT_WORKS = [
  { step: '01', icon: '📝', title: 'Input Your Profile',  desc: 'Enter your domain, skill level (0–10), interest level, and risk tolerance. Select your preferred career field.' },
  { step: '02', icon: '⚙️', title: 'AI Processing',       desc: 'Our system runs Fuzzy Logic, ML models, and a Genetic Algorithm simultaneously to analyze your profile.' },
  { step: '03', icon: '📊', title: 'Smart Recommendation', desc: 'Receive a career recommendation with confidence score, XAI explanation, simulation, and a full roadmap.' },
];

export default function About({ onNavigate }) {
  return (
    <div className="about-page">

      {/* ── Hero ──────────────────────────────────────────── */}
      <motion.section className="about-hero" {...fadeUp(0)}>
        <div className="about-hero-badge">ℹ️ About Us</div>
        <h1 className="about-hero-title">
          What is <span style={{ color: 'var(--accent-primary)' }}>Life Decision AI</span>?
        </h1>
        <p className="about-hero-sub">
          Life Decision AI is an intelligent career guidance platform built for students, freshers,
          and professionals who want data-driven clarity about their career choices. Powered by
          Machine Learning, Fuzzy Logic, and Genetic Algorithms — it delivers personalized, explainable
          career recommendations in real-time.
        </p>
        <div className="about-hero-actions">
          <motion.button
            className="btn-primary"
            onClick={() => onNavigate && onNavigate('input')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            style={{ padding: '14px 32px' }}
          >
            🚀 Try It Now — It's Free
          </motion.button>
          <motion.button
            className="btn-ghost"
            onClick={() => onNavigate && onNavigate('pricing')}
            whileHover={{ scale: 1.04 }}
            style={{ padding: '14px 24px' }}
          >
            💎 View Pricing
          </motion.button>
        </div>
      </motion.section>

      {/* ── How it works ──────────────────────────────────── */}
      <motion.section className="about-section" {...fadeUp(0.1)}>
        <div className="about-section-header">
          <div className="about-section-badge">⚙️ Process</div>
          <h2 className="about-section-title">How It Works</h2>
          <p className="about-section-sub">Three simple steps from profile to personalized AI guidance.</p>
        </div>

        <div className="about-steps">
          {HOW_IT_WORKS.map((item, i) => (
            <motion.div
              key={item.step}
              className="about-step-card"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.15 + i * 0.08 } }}
              whileHover={{ y: -4 }}
            >
              <div className="about-step-num">{item.step}</div>
              <div className="about-step-icon">{item.icon}</div>
              <div className="about-step-title">{item.title}</div>
              <div className="about-step-desc">{item.desc}</div>
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="about-step-arrow">→</div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Technologies ─────────────────────────────────── */}
      <motion.section className="about-section about-section-alt" {...fadeUp(0.15)}>
        <div className="about-section-header">
          <div className="about-section-badge">🔬 Under the Hood</div>
          <h2 className="about-section-title">Technologies Used</h2>
          <p className="about-section-sub">Built on a stack of advanced AI & computational intelligence techniques.</p>
        </div>

        <div className="about-tech-grid">
          {TECHNOLOGIES.map((tech, i) => (
            <motion.div
              key={tech.name}
              className="about-tech-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1, transition: { delay: 0.1 + i * 0.06 } }}
              whileHover={{ y: -5, boxShadow: '0 12px 40px rgba(99,102,241,0.2)' }}
            >
              <div className="about-tech-icon">{tech.icon}</div>
              <div className="about-tech-name">{tech.name}</div>
              <div className="about-tech-desc">{tech.desc}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Features ──────────────────────────────────────── */}
      <motion.section className="about-section" {...fadeUp(0.2)}>
        <div className="about-section-header">
          <div className="about-section-badge">⭐ Features</div>
          <h2 className="about-section-title">Everything You Need</h2>
          <p className="about-section-sub">A complete AI career toolkit — from first decision to long-term roadmap.</p>
        </div>

        <div className="about-features-grid">
          {FEATURES.map((feat, i) => (
            <motion.div
              key={feat.name}
              className="about-feature-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.1 + i * 0.05 } }}
              whileHover={{ y: -4, borderColor: 'var(--accent-primary)' }}
            >
              <div className="about-feature-icon">{feat.icon}</div>
              <div>
                <div className="about-feature-name">{feat.name}</div>
                <div className="about-feature-desc">{feat.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Contact ───────────────────────────────────────── */}
      <motion.section className="about-section about-contact-section" {...fadeUp(0.25)}>
        <div className="about-contact-card">
          <div className="about-section-badge" style={{ marginBottom: 16 }}>💬 Contact &amp; Help</div>
          <h2 className="about-section-title" style={{ marginBottom: 8 }}>Get In Touch</h2>
          <p className="about-section-sub" style={{ marginBottom: 32 }}>
            Have questions, feedback, or need help? Reach out — we're here to guide you.
          </p>

          <div className="about-contact-grid">
            <motion.a
              href="mailto:ahmadsakib263@gmail.com"
              className="about-contact-item"
              whileHover={{ scale: 1.03 }}
            >
              <div className="about-contact-icon">📧</div>
              <div>
                <div className="about-contact-label">Email</div>
                <div className="about-contact-value">ahmadsakib263@gmail.com</div>
              </div>
            </motion.a>

            <motion.a
              href="tel:+918797330646"
              className="about-contact-item"
              whileHover={{ scale: 1.03 }}
            >
              <div className="about-contact-icon">📞</div>
              <div>
                <div className="about-contact-label">Phone</div>
                <div className="about-contact-value">+91 8797330646</div>
              </div>
            </motion.a>
          </div>

          <motion.button
            className="btn-primary"
            style={{ marginTop: 32, padding: '12px 28px', width: 'auto' }}
            onClick={() => onNavigate && onNavigate('input')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
          >
            🚀 Start Your Free Career Analysis
          </motion.button>
        </div>
      </motion.section>

    </div>
  );
}
