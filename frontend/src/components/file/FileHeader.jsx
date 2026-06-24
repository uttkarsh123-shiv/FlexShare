import { ArrowLeft } from 'lucide-react';

export default function FileHeader({ onBackClick }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '1rem 2rem',
      background: 'rgba(8,11,20,0.8)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <button onClick={onBackClick} style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        color: '#64748b', background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '8px 16px', borderRadius: '10px', cursor: 'pointer',
        fontSize: '14px', fontWeight: '500',
      }}>
        <ArrowLeft size={15} />
        Back to Home
      </button>
    </div>
  );
}
