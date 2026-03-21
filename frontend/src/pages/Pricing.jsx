import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { createPaymentOrder, verifyPayment } from '../insforgeApi';

const FREE_FEATURES = [
  '✅ 3 AI predictions per day',
  '✅ Basic career simulation',
  '✅ AI Mentor (5 messages/day)',
  '✅ Decision history (last 10)',
  '❌ Career comparison mode',
  '❌ 12-month roadmap',
  '❌ XAI explainability',
  '❌ Unlimited predictions',
];

const PREMIUM_FEATURES = [
  '✅ Unlimited AI predictions',
  '✅ Advanced career simulation',
  '✅ AI Mentor (unlimited)',
  '✅ Full decision history',
  '✅ Career comparison mode',
  '✅ 12-month personalized roadmap',
  '✅ XAI full explainability',
  '✅ Priority support',
];

const cardVariants = {
  hidden:  { opacity: 0, y: 30 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.5, ease: 'easeOut' } }),
};

export default function Pricing({ onUpgradeSuccess }) {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState('');
  const [msgType, setMsgType] = useState('info');
  const isPremium = user?.plan_type === 'premium';

  const handleUpgrade = async () => {
    setLoading(true);
    setMsg('');
    setMsgType('info');
    try {
      // Step 1: Create Razorpay order via Insforge
      setMsg('⚡ Initialising payment…');
      const orderData = await createPaymentOrder();

      // Step 2: Launch Razorpay checkout modal
      await new Promise((resolve, reject) => {
        if (!window.Razorpay) {
          reject(new Error('Razorpay SDK not loaded. Please refresh the page.'));
          return;
        }
        const rzp = new window.Razorpay({
          key:         orderData.key_id,
          amount:      orderData.amount,
          currency:    orderData.currency,
          order_id:    orderData.order_id,
          name:        'Life Decision AI',
          description: 'Premium Plan — ₹999/month',
          prefill: { email: user?.email ?? '' },
          theme: { color: '#7c6bfe' },
          handler: async (response) => {
            try {
              // Step 3: Verify payment via Insforge + update DB
              await verifyPayment({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              });
              resolve();
            } catch (verifyErr) {
              reject(verifyErr);
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled.')),
          },
        });
        rzp.open();
      });

      setMsgType('success');
      setMsg('🎉 Welcome to Premium! All features are now unlocked. ⭐');
      if (refreshUser) await refreshUser();
      if (onUpgradeSuccess) onUpgradeSuccess();
    } catch (err) {
      setMsgType('error');
      setMsg(`❌ ${err?.message || 'Upgrade failed. Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const palette = {
    success: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)', color: '#34d399' },
    error:   { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)',  color: '#fca5a5' },
    info:    { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.35)', color: '#a5b4fc' },
  };

  return (
    <motion.section
      id="pricing"
      className="pricing-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        className="pricing-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="pricing-badge">💎 Simple Pricing</div>
        <h2 className="pricing-title">Choose Your Plan</h2>
        <p className="pricing-subtitle">
          Start free — upgrade when you need more AI power. All prices in ₹ INR.
        </p>
      </motion.div>

      {/* Cards */}
      <div className="pricing-cards">
        {/* Free */}
        <motion.div
          className="pricing-card"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={0}
          whileHover={{ y: -6 }}
        >
          <div className="pricing-card-header">
            <div className="pricing-plan-name">Free</div>
            <div className="pricing-price">
              <span className="pricing-currency">₹</span>
              <span className="pricing-amount">0</span>
              <span className="pricing-period">/ forever</span>
            </div>
            <p className="pricing-plan-sub">Perfect for getting started</p>
          </div>
          <ul className="pricing-features">
            {FREE_FEATURES.map(f => <li key={f}>{f}</li>)}
          </ul>
          <motion.button
            className="btn-ghost pricing-btn"
            style={{ cursor: 'default', opacity: 0.6 }}
          >
            {isPremium ? '✅ Previous plan' : '✅ Your current plan'}
          </motion.button>
        </motion.div>

        {/* Premium */}
        <motion.div
          className="pricing-card premium"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={1}
          whileHover={{ y: -6 }}
        >
          <div className="pricing-popular-badge">⭐ MOST POPULAR</div>
          <div className="pricing-card-header">
            <div className="pricing-plan-name" style={{ color: '#f5c842' }}>Premium</div>
            <div className="pricing-price">
              <span className="pricing-currency">₹</span>
              <span className="pricing-amount">999</span>
              <span className="pricing-period">/ month</span>
            </div>
            <p className="pricing-plan-sub">Full AI power, no limits</p>
          </div>
          <ul className="pricing-features">
            {PREMIUM_FEATURES.map(f => <li key={f}>{f}</li>)}
          </ul>

          {isPremium ? (
            <motion.button className="btn-primary pricing-btn" disabled style={{ opacity: 0.7 }}>
              ⭐ You are Premium!
            </motion.button>
          ) : (
            <motion.button
              className="btn-primary pricing-btn"
              onClick={handleUpgrade}
              disabled={loading}
              whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(124,107,254,0.6)' }}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? (
                <><span className="spinner" style={{ width: 16, height: 16, marginRight: 8 }} />Activating…</>
              ) : '💎 Upgrade to Premium — ₹999/mo'}
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Status message */}
      <AnimatePresence>
        {msg && (
          <motion.div
            className="pricing-msg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background:   palette[msgType].bg,
              border:       `1px solid ${palette[msgType].border}`,
              color:        palette[msgType].color,
              borderRadius: 12,
              padding:      '14px 20px',
              textAlign:    'center',
              fontWeight:   500,
              marginTop:    16,
            }}
          >
            {msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trust section */}
      <motion.div
        className="pricing-trust"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <span>🔒 Secured by Razorpay</span>
        <span>•</span>
        <span>🇮🇳 Indian Payment Gateway</span>
        <span>•</span>
        <span>💳 UPI, Cards, Net Banking</span>
      </motion.div>
    </motion.section>
  );
}
