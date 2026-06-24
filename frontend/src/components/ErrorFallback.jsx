import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div style={{ minHeight: '100vh', background: '#fafaf9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', fontFamily: "'Inter', sans-serif" }}>
    <div style={{ background: '#fffffe', border: '1px solid #e7e5e4', borderRadius: '14px', padding: '2rem', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
      <AlertTriangle size={36} color="#dc2626" style={{ margin: '0 auto 1rem' }} />
      <h2 style={{ color: '#1c1917', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.4rem', letterSpacing: '-0.01em' }}>Something went wrong</h2>
      <p style={{ color: '#78716c', marginBottom: '1rem', fontSize: '0.825rem' }}>An error occurred. Please try refreshing the page.</p>
      <p style={{ color: '#dc2626', fontSize: '0.75rem', fontFamily: 'monospace', marginBottom: '1.5rem', wordBreak: 'break-all', background: '#fef2f2', padding: '0.5rem 0.75rem', borderRadius: '6px', textAlign: 'left' }}>{error.message}</p>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button onClick={resetErrorBoundary} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#9333ea', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.825rem', fontFamily: "'Inter', sans-serif" }}>
          <RefreshCw size={13} /> Try Again
        </button>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', color: '#78716c', border: '1px solid #e7e5e4', padding: '8px 18px', borderRadius: '8px', fontWeight: 600, textDecoration: 'none', fontSize: '0.825rem', fontFamily: "'Inter', sans-serif" }}>
          <Home size={13} /> Go Home
        </a>
      </div>
    </div>
  </div>
);

export default ErrorFallback;
