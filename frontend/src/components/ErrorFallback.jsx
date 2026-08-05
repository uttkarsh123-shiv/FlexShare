import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div style={{
    minHeight: '100vh',
    background: '#fafaf9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    fontFamily: "'Inter', sans-serif",
  }}>
    <div style={{
      background: '#ffffff',
      border: '1px solid #e7e5e4',
      borderRadius: '18px',
      padding: '2.5rem',
      maxWidth: '420px',
      width: '100%',
      textAlign: 'center',
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.25rem',
      }}>
        <AlertTriangle size={26} color="#dc2626" />
      </div>
      <h2 style={{
        color: '#1c1917',
        fontSize: '1.1rem',
        fontWeight: 700,
        marginBottom: '0.5rem',
        letterSpacing: '-0.01em',
      }}>
        Something went wrong
      </h2>
      <p style={{ color: '#78716c', marginBottom: '1rem', fontSize: '0.875rem', lineHeight: 1.6 }}>
        An error occurred. Please try refreshing the page.
      </p>
      <p style={{
        color: '#dc2626',
        fontSize: '0.75rem',
        fontFamily: 'monospace',
        marginBottom: '1.75rem',
        wordBreak: 'break-all',
        background: '#fef2f2',
        padding: '0.625rem 0.875rem',
        borderRadius: '8px',
        textAlign: 'left',
        lineHeight: 1.5,
      }}>
        {error.message}
      </p>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button
          onClick={resetErrorBoundary}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#f97316',
            color: 'white',
            border: 'none',
            padding: '9px 20px',
            borderRadius: '10px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontFamily: "'Inter', sans-serif",
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#ea580c'}
          onMouseLeave={e => e.currentTarget.style.background = '#f97316'}
        >
          <RefreshCw size={14} /> Try Again
        </button>
        <a
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'transparent',
            color: '#78716c',
            border: '1px solid #e7e5e4',
            padding: '9px 20px',
            borderRadius: '10px',
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: '0.875rem',
            fontFamily: "'Inter', sans-serif",
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#d6d3d1'; e.currentTarget.style.color = '#1c1917'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e7e5e4'; e.currentTarget.style.color = '#78716c'; }}
        >
          <Home size={14} /> Go Home
        </a>
      </div>
    </div>
  </div>
);

export default ErrorFallback;
