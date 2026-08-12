import { AlertCircle } from 'lucide-react';

export default function ErrorDisplay({ error, onGoHome }) {
  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ textAlign: 'center', maxWidth: '400px', border: '2px solid #000000', padding: '3rem 2.5rem', boxShadow: '6px 6px 0px #000000' }}>
        <div style={{ width: '56px', height: '56px', background: '#fef2f2', border: '1.5px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 0 1.5rem' }}>
          <AlertCircle size={26} color="#dc2626" />
        </div>
        <h1 style={{ fontSize: '1rem', fontWeight: 800, color: '#000000', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {error || 'File Not Found'}
        </h1>
        <p style={{ color: '#555555', fontSize: '0.875rem', marginBottom: '2rem', lineHeight: 1.65 }}>
          This file may have expired, reached its download limit, or been removed.
        </p>
        <button onClick={onGoHome} style={{ background: '#000000', color: 'white', border: 'none', padding: '12px 28px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', fontFamily: "'Inter', sans-serif", textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#333333'}
          onMouseLeave={e => e.currentTarget.style.background = '#000000'}>
          Go Home
        </button>
      </div>
    </div>
  );
}
