/**
 * ErrorBoundary — catches any React render error and shows a diagnostic screen.
 */
import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#0a0e1a',
          color: '#f9fafb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 16,
          padding: 32,
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          <div style={{ fontSize: '3rem' }}>💥</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171' }}>
            App crashed — check DevTools console (F12)
          </h2>
          <pre style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 8,
            padding: '16px 20px',
            fontSize: '0.78rem',
            color: '#fca5a5',
            maxWidth: 700,
            overflowX: 'auto',
            whiteSpace: 'pre-wrap',
          }}>
            {String(this.state.error?.message || this.state.error || 'Unknown error')}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 24px',
              background: 'rgba(99,102,241,0.2)',
              border: '1px solid rgba(99,102,241,0.4)',
              borderRadius: 100,
              color: '#a5b4fc',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.875rem',
            }}
          >
            🔄 Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
