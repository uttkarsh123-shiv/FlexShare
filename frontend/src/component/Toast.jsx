import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const config = {
  success: {
    icon: CheckCircle2,
    accentColor: '#1e8e3e',
    bg: '#e6f4ea',
    border: '#ceead6',
  },
  error: {
    icon: XCircle,
    accentColor: '#d93025',
    bg: '#fce8e6',
    border: '#f5c6c2',
  },
  warning: {
    icon: AlertTriangle,
    accentColor: '#e37400',
    bg: '#fef3e2',
    border: '#fde3b8',
  },
  info: {
    icon: Info,
    accentColor: '#1a73e8',
    bg: '#e8f0fe',
    border: '#c5d8fd',
  },
};

export default function Toast({ message, type = 'success', onClose, duration = 3500 }) {
  const [visible, setVisible]   = useState(false);
  const [leaving, setLeaving]   = useState(false);
  const { icon: Icon, accentColor, bg, border } = config[type] || config.info;

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
      gap: '12px',
      padding: '14px 16px',
      borderRadius: '12px',
      background: bg,
      border: `1px solid ${border}`,
      boxShadow: '0 2px 8px rgba(60,64,67,0.15), 0 1px 3px rgba(60,64,67,0.08)',
      minWidth: '280px',
      maxWidth: '380px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Google Sans', 'Inter', sans-serif",
      transform: visible && !leaving
        ? 'translateX(0) translateY(0) scale(1)'
        : 'translateX(8px) translateY(-4px) scale(0.97)',
      opacity: visible && !leaving ? 1 : 0,
      transition: 'transform 0.25s cubic-bezier(0.16,1,0.3,1), opacity 0.25s ease',
    }}>

      {/* Icon */}
      <div style={{ paddingTop: '1px', flexShrink: 0 }}>
        <Icon size={16} style={{ color: accentColor }} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          color: accentColor,
          fontSize: '0.875rem',
          fontWeight: 500,
          margin: 0,
          lineHeight: 1.5,
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
          color: accentColor,
          display: 'flex',
          alignItems: 'center',
          padding: '2px',
          flexShrink: 0,
          borderRadius: '4px',
          opacity: 0.6,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = '0.6'; }}
      >
        <X size={13} />
      </button>

      {/* Progress bar at bottom */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, height: '2px', width: '100%', background: `${accentColor}22` }}>
        <div style={{
          height: '100%',
          background: accentColor,
          width: '100%',
          transformOrigin: 'left',
          animation: `toast-shrink ${duration}ms linear forwards`,
          opacity: 0.5,
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
