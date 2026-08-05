import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileQuestion } from 'lucide-react';

const Notfound = () => {
  const navigate = useNavigate();

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
      <div style={{ textAlign: 'center', maxWidth: '400px' }}>
        {/* Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          background: '#fff7ed',
          border: '1px solid #fed7aa',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <FileQuestion size={28} color="#f97316" />
        </div>

        {/* Heading */}
        <h1 style={{
          fontSize: '1.375rem',
          fontWeight: 700,
          color: '#1c1917',
          margin: '0 0 0.625rem',
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        }}>
          Page not found
        </h1>

        <p style={{
          fontSize: '0.9rem',
          color: '#78716c',
          lineHeight: 1.7,
          margin: '0 0 2rem',
        }}>
          The page you're looking for doesn't exist or may have been moved.
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#f97316',
            color: 'white',
            border: 'none',
            padding: '11px 26px',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            transition: 'background 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#ea580c';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(249,115,22,0.25)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#f97316';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Notfound;
