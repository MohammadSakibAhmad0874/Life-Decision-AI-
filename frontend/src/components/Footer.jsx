/**
 * Footer v2 — with real wired navigation links + real contact info.
 */
import { motion } from 'framer-motion';

const SOCIAL = [
  { icon: '🐦', label: 'Twitter',  href: 'https://twitter.com' },
  { icon: '💼', label: 'LinkedIn', href: 'https://linkedin.com' },
  { icon: '🐙', label: 'GitHub',   href: 'https://github.com' },
];

export default function Footer({ onNavigate }) {
  const nav = (tab) => { onNavigate && onNavigate(tab); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const FOOTER_SECTIONS = [
    {
      title: 'Product',
      links: [
        { label: 'AI Decision',  tab: 'input' },
        { label: 'Simulation',   tab: 'simulation' },
        { label: 'AI Mentor',    tab: 'mentor' },
        { label: 'Career Roadmap', tab: 'roadmap' },
      ],
    },
    {
      title: 'Features',
      links: [
        { label: 'Dashboard',    tab: 'dashboard' },
        { label: 'Compare Paths', tab: 'compare' },
        { label: 'History',      tab: 'history' },
        { label: 'Home',         tab: 'user-dashboard' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About',        tab: 'about' },
        { label: 'Pricing',      tab: 'pricing' },
        { label: 'Contact',      href: 'mailto:ahmadsakib263@gmail.com' },
      ],
    },
  ];

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        {/* Brand */}
        <div className="footer-brand">
          <motion.div
            className="footer-logo"
            whileHover={{ scale: 1.04 }}
            style={{ cursor: 'pointer' }}
            onClick={() => nav('user-dashboard')}
          >
            🧠 Life Decision <span style={{ color: 'var(--accent-primary)' }}>AI</span>
          </motion.div>
          <p className="footer-tagline">
            AI-powered career guidance for smarter life decisions.<br />Built with ❤️ in India.
          </p>
          <div className="footer-contact-info">
            <a href="mailto:ahmadsakib263@gmail.com" className="footer-contact-link">📧 ahmadsakib263@gmail.com</a>
            <a href="tel:+918797330646" className="footer-contact-link">📞 +91 8797330646</a>
          </div>
          <div className="footer-socials">
            {SOCIAL.map(s => (
              <motion.a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-icon"
                aria-label={s.label}
                whileHover={{ scale: 1.2, rotate: 5 }}
                title={s.label}
              >
                {s.icon}
              </motion.a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {FOOTER_SECTIONS.map(({ title, links }) => (
          <div key={title} className="footer-col">
            <div className="footer-col-title">{title}</div>
            <ul className="footer-links">
              {links.map(l => (
                <li key={l.label}>
                  {l.tab ? (
                    <motion.button
                      className="footer-link footer-link-btn"
                      onClick={() => nav(l.tab)}
                      whileHover={{ x: 4, color: 'var(--accent-primary)' }}
                    >
                      {l.label}
                    </motion.button>
                  ) : (
                    <motion.a
                      href={l.href}
                      className="footer-link"
                      whileHover={{ x: 4, color: 'var(--accent-primary)' }}
                    >
                      {l.label}
                    </motion.a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <span>© 2026 Life Decision AI. All rights reserved.</span>
        <span>Made with ❤️ in Bharat 🇮🇳 · Prices in ₹ INR</span>
      </div>
    </footer>
  );
}
