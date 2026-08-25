import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const config = {
  success: {
    icon: CheckCircle2,
    iconColor: '#ffffff',
    accentColor: '#16a34a',
    label: 'Success',
  },
  error: {
    icon: XCircle,
    iconColor: '#ffffff',
    accentColor: '#dc2626',
    label: 'Error',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: '#ffffff',
    accentColor: '#d97706',
    label: 'Warning',
  },
  info: {
    icon: Info,
    iconColor: '#ffffff',
    accentColor: '#f97316',
    label: 'Info',
  },
};

export default function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  const [visible, setVisible]   = useState(false);
  const [leaving, setLeaving]   = useState(false);
  const { icon: Icon, iconColor, accentColor } = config[type] || config.info;

  const dismiss = () => {
    setLeaving(true);
    setTimeout(onClose, 280);
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(dismiss, duration);
    return () => { clearTimeout(timer); cancelAnimationFrame(frame); };
  }, [duration]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '14px',
      padding: '16px 18px',
      borderRadius: '14px',
      background: '#1a1a1a',
      border: '1px solid #2e2e2e',
      boxShadow: '0 8px 40px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.4)',
      minWidth: '300px',
      maxWidth: '420px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Space Grotesk', 'Inter', sans-serif",
      transform: visible && !leaving
        ? 'translateX(0) translateY(0) scale(1)'
        : 'translateX(12px) translateY(-4px) scale(0.96)',
      opacity: visible && !leaving ? 1 : 0,
      transition: 'transform 0.28s cubic-bezier(0.16,1,0.3,1), opacity 0.28s ease',
      backdropFilter: 'blur(12px)',
    }}>

      {/* Icon container */}
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        background: accentColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        marginTop: '1px',
      }}>
        <Icon size={17} style={{ color: '#ffffff' }} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0, paddingTop: '2px' }}>
        <p style={{
          color: '#f0f0f0',
          fontSize: '0.9rem',
          fontWeight: 600,
          margin: 0,
          lineHeight: 1.4,
          letterSpacing: '-0.01em',
        }}>
          {message}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={dismiss}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#555',
          display: 'flex',
          alignItems: 'center',
          padding: '2px',
          flexShrink: 0,
          marginTop: '2px',
          borderRadius: '6px',
          transition: 'color 0.15s, background 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.background = '#2a2a2a'; }}
        onMouseLeave={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.background = 'none'; }}
      >
        <X size={14} />
      </button>

      {/* Progress bar at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: '2px',
        width: '100%',
        background: '#2a2a2a',
      }}>
        <div style={{
          height: '100%',
          background: accentColor,
          width: '100%',
          transformOrigin: 'left',
          animation: `toast-shrink ${duration}ms linear forwards`,
          opacity: 0.7,
        }} />
      </div>

      <style>{`
        @keyframes toast-shrink {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}
