import { memo } from 'react';
import { ArrowLeft } from 'lucide-react';

// Minimal header — just navigation, no floating code badge
const FileHeader = memo(({ code, onBackClick }) => {
  return (
    <div style={{
      position: 'relative', zIndex: 10,
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
        fontSize: '14px', fontWeight: '500', transition: 'all 0.2s',
      }}
        onMouseEnter={e => { e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
      >
        <ArrowLeft size={15} />
        Back to Home
      </button>
    </div>
  );
});

FileHeader.displayName = 'FileHeader';
export default FileHeader;
