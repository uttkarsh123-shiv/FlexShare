import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function ErrorDisplay({ error, onGoHome }) {
  return (
    <div style={{
      minHeight: 'calc(100vh - 62px)',
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '380px' }}>
        <div style={{
          width: '54px',
          height: '54px',
          background: 'rgba(248,113,113,0.08)',
          border: '1px solid rgba(248,113,113,0.2)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <AlertCircle size={22} color="var(--error)" />
        </div>

        <h1 style={{
          fontSize: '1.15rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 0.5rem',
          letterSpacing: '-0.02em',
        }}>
          {error || 'File Not Found'}
        </h1>

        <p style={{
          color: 'var(--text-muted)',
          fontSize: '0.9rem',
          lineHeight: 1.7,
          margin: '0 0 2rem',
        }}>
          This file may have expired, reached its download limit, or been removed.
        </p>

        <button
          onClick={onGoHome}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 24px',
            background: 'var(--btn-bg)',
            color: 'var(--btn-fg)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            transition: 'background 0.15s',
            letterSpacing: '-0.01em',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--btn-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--btn-bg)'}
        >
          <ArrowLeft size={15} /> Go Home
        </button>
      </div>
    </div>
  );
}
