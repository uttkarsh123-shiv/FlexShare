import React, { memo } from 'react';
import { ArrowLeft, Copy } from 'lucide-react';

const FileHeader = memo(({ code, onBackClick }) => {
  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    // You can add a toast notification here if needed
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1.5rem 2rem',
      background: 'rgba(23, 23, 23, 0.5)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      {/* Back Button */}
      <button
        onClick={onBackClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#9ca3af',
          background: 'transparent',
          border: 'none',
          padding: '10px 16px',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.color = '#ea580c';
          e.target.style.background = 'rgba(234, 88, 12, 0.1)';
        }}
        onMouseLeave={(e) => {
          e.target.style.color = '#9ca3af';
          e.target.style.background = 'transparent';
        }}
      >
        <ArrowLeft style={{ width: '16px', height: '16px' }} />
        <span>Back to Home</span>
      </button>
      
      {/* Code Display - Centered and Prominent */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%)',
        padding: '12px 24px',
        borderRadius: '12px',
        border: '1px solid rgba(234, 88, 12, 0.3)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            File Code
          </div>
          <div style={{ 
            fontSize: '24px', 
            fontWeight: '700', 
            color: '#ea580c',
            fontFamily: 'monospace',
            letterSpacing: '2px'
          }}>
            {code}
          </div>
        </div>
        <button
          onClick={handleCopyCode}
          style={{
            background: 'rgba(234, 88, 12, 0.2)',
            border: '1px solid rgba(234, 88, 12, 0.3)',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            color: '#ea580c',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(234, 88, 12, 0.3)';
            e.target.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(234, 88, 12, 0.2)';
            e.target.style.transform = 'scale(1)';
          }}
          title="Copy code"
        >
          <Copy size={16} />
        </button>
      </div>
      
      {/* Spacer for centering */}
      <div style={{ width: '140px' }}></div>
    </div>
  );
});

FileHeader.displayName = 'FileHeader';

export default FileHeader;