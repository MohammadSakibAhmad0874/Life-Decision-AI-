/**
 * Toast.jsx — lightweight global notification system.
 * Usage:
 *   const { showToast } = useToast();
 *   showToast('Saved!', 'success');  // types: success | error | info | warning
 */
import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext(null);

const TYPE_STYLES = {
  success: { border: 'rgba(16,185,129,0.4)',  bg: 'rgba(16,185,129,0.12)',  icon: '✅' },
  error:   { border: 'rgba(239,68,68,0.4)',   bg: 'rgba(239,68,68,0.1)',    icon: '❌' },
  warning: { border: 'rgba(245,158,11,0.4)',  bg: 'rgba(245,158,11,0.1)',   icon: '⚠️' },
  info:    { border: 'rgba(99,102,241,0.4)',  bg: 'rgba(99,102,241,0.1)',   icon: 'ℹ️' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Portal-like fixed overlay */}
      <div style={{
        position: 'fixed', top: 24, right: 24, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 380,
      }}>
        <AnimatePresence>
          {toasts.map(t => {
            const s = TYPE_STYLES[t.type] || TYPE_STYLES.info;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: 60, scale: 0.92 }}
                animate={{ opacity: 1, x: 0,  scale: 1    }}
                exit={{    opacity: 0, x: 60,  scale: 0.92 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                onClick={() => dismiss(t.id)}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                  background: s.bg, border: `1px solid ${s.border}`,
                  backdropFilter: 'blur(12px)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  color: 'var(--text-primary)', fontSize: '0.875rem', lineHeight: 1.5,
                }}
              >
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{s.icon}</span>
                <span>{t.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
