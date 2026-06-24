import { AlertCircle } from 'lucide-react';

export default function ErrorDisplay({ error, onGoHome }) {
  return (
    <div style={{ minHeight: 'calc(100vh - 58px)', background: '#fafaf9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ textAlign: 'center', maxWidth: '360px' }}>
        <div style={{ width: '48px', height: '48px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <AlertCircle size={22} color="#dc2626" />
        </div>
        <h1 style={{ fontSize: '1rem', fontWeight: 700, color: '#1c1917', marginBottom: '0.4rem', letterSpacing: '-0.01em' }}>
          {error || 'File Not Found'}
        </h1>
        <p style={{ color: '#78716c', fontSize: '0.825rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          This file may have expired, reached its download limit, or been removed.
        </p>
        <button onClick={onGoHome} style={{ background: '#9333ea', color: 'white', border: 'none', padding: '9px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.825rem', fontFamily: "'Inter', sans-serif" }}>
          Go Home
        </button>
      </div>
    </div>
  );
}
