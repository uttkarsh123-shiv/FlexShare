import { AlertCircle } from 'lucide-react';

export default function ErrorDisplay({ error, onGoHome }) {
  return (
    <div style={{
      minHeight: 'calc(100vh - 68px)',
      background: '#fafaf9',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ textAlign: 'center', maxWidth: '380px' }}>
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
          <AlertCircle size={24} color="#dc2626" />
        </div>
        <h1 style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: '#1c1917',
          marginBottom: '0.5rem',
          letterSpacing: '-0.01em',
        }}>
          {error || 'File Not Found'}
        </h1>
        <p style={{
          color: '#78716c',
          fontSize: '0.875rem',
          marginBottom: '1.75rem',
          lineHeight: 1.65,
        }}>
          This file may have expired, reached its download limit, or been removed.
        </p>
        <button
          onClick={onGoHome}
          style={{
            background: '#f97316',
            color: 'white',
            border: 'none',
            padding: '10px 26px',
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
          Go Home
        </button>
      </div>
    </div>
  );
}
