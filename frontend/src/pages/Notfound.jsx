import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Notfound = () => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ textAlign: 'center', maxWidth: '480px', border: '2px solid #000000', padding: '4rem 3rem', boxShadow: '8px 8px 0px #000000' }}>
        <p style={{ fontSize: '5rem', fontWeight: 400, color: '#000000', margin: '0 0 0.5rem', lineHeight: 1, fontFamily: "'DM Serif Display', serif", letterSpacing: '-0.02em' }}>404</p>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 400, color: '#000000', margin: '0 0 0.75rem', fontFamily: "'DM Serif Display', serif", letterSpacing: '-0.01em' }}>Page Not Found</h1>
        <p style={{ fontSize: '0.9rem', color: '#555555', lineHeight: 1.7, margin: '0 0 2.5rem' }}>The page you're looking for doesn't exist or may have been moved.</p>
        <button onClick={() => navigate('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f97316', color: 'white', border: 'none', padding: '13px 28px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', fontFamily: "'Inter', sans-serif", textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'background 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#ea580c'}
          onMouseLeave={e => e.currentTarget.style.background = '#f97316'}>
          <ArrowLeft size={16} /> Back to Home
        </button>
      </div>
    </div>
  );
};

export default Notfound;
