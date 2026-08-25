import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function Notfound() {
  const navigate = useNavigate();

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
      <div style={{ textAlign: 'center', maxWidth: '420px' }}>
        <p style={{
          fontSize: '7rem',
          fontWeight: 700,
          color: 'var(--bg-elevated)',
          lineHeight: 1,
          margin: '0 0 1.75rem',
          letterSpacing: '-0.05em',
          userSelect: 'none',
        }}>
          404
        </p>

        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 0.6rem',
          letterSpacing: '-0.03em',
        }}>
          Page not found
        </h1>

        <p style={{
          fontSize: '0.95rem',
          color: 'var(--text-muted)',
          lineHeight: 1.7,
          margin: '0 0 2.25rem',
        }}>
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <button
          onClick={() => navigate('/')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '9px',
            padding: '12px 26px',
            background: 'var(--btn-bg)',
            color: 'var(--btn-fg)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            transition: 'background 0.15s',
            letterSpacing: '-0.01em',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--btn-hover)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--btn-bg)'}
        >
          <ArrowLeft size={16} /> Back to Home
        </button>
      </div>
    </div>
  );
}
