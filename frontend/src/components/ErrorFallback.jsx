import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export const ErrorFallback = ({ error, resetErrorBoundary }) => (
  <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Inter', sans-serif" }}>
    <div style={{ background: '#ffffff', border: '2px solid #000000', padding: '3rem', maxWidth: '440px', width: '100%', textAlign: 'center', boxShadow: '8px 8px 0px #000000' }}>
      <div style={{ width: '56px', height: '56px', background: '#fef2f2', border: '1.5px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
        <AlertTriangle size={26} color="#dc2626" />
      </div>
      <h2 style={{ color: '#000000', fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Something Went Wrong</h2>
      <p style={{ color: '#555555', marginBottom: '1rem', fontSize: '0.875rem', lineHeight: 1.65 }}>An error occurred. Please try refreshing the page.</p>
      <p style={{ color: '#dc2626', fontSize: '0.75rem', fontFamily: 'monospace', marginBottom: '2rem', wordBreak: 'break-all', background: '#fef2f2', padding: '0.625rem', border: '1px solid #fecaca', textAlign: 'left', lineHeight: 1.5 }}>{error.message}</p>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button onClick={resetErrorBoundary} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f97316', color: 'white', border: 'none', padding: '10px 20px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", textTransform: 'uppercase', letterSpacing: '0.04em' }}
          onMouseEnter={e => e.currentTarget.style.background = '#ea580c'} onMouseLeave={e => e.currentTarget.style.background = '#f97316'}>
          <RefreshCw size={13} /> Retry
        </button>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', color: '#000000', border: '1px solid #000000', padding: '10px 20px', fontWeight: 700, textDecoration: 'none', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          <Home size={13} /> Home
        </a>
      </div>
    </div>
  </div>
);

export default ErrorFallback;
