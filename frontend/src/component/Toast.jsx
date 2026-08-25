import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const config = {
  success: {
    icon: CheckCircle2,
    iconColor: '#16a34a',
    borderColor: '#16a34a',
    bg: '#f0fdf4',
    textColor: '#14532d',
    subColor: '#166534',
  },
  error: {
    icon: XCircle,
    iconColor: '#dc2626',
    borderColor: '#dc2626',
    bg: '#fef2f2',
    textColor: '#7f1d1d',
    subColor: '#991b1b',
  },
  warning: {
    icon: AlertTriangle,
    iconColor: '#d97706',
    borderColor: '#d97706',
    bg: '#fffbeb',
    textColor: '#78350f',
    subColor: '#92400e',
  },
  info: {
    icon: Info,
    iconColor: '#f97316',
    borderColor: '#f97316',
    bg: '#fff7ed',
    textColor: '#431407',
    subColor: '#9a3412',
  },
};

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const { icon: Icon, iconColor, borderColor, bg, textColor } = config[type] || config.info;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => {
      setLeaving(true);
      setTimeout(onClose, 220);
    }, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px',
      padding: '12px 14px 12px 0',
      borderRadius: '10px',
      background: '#ffffff',
      border: '1px solid #e7e5e4',
      borderLeft: `3.5px solid ${borderColor}`,
      boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
      minWidth: '260px',
      maxWidth: '360px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif",
      transform: visible && !leaving ? 'translateX(0) scale(1)' : 'translateX(16px) scale(0.97)',
      opacity: visible && !leaving ? 1 : 0,
      transition: 'transform 0.22s cubic-bezier(0.16,1,0.3,1), opacity 0.22s ease',
    }}>

      {/* Icon */}
      <div style={{
        flexShrink: 0,
        paddingLeft: '12px',
        paddingTop: '1px',
      }}>
        <Icon size={16} style={{ color: iconColor, display: 'block' }} />
      </div>

      {/* Message */}
      <span style={{
        color: textColor,
        fontSize: '0.875rem',
        fontWeight: 500,
        flex: 1,
        lineHeight: 1.45,
        paddingTop: '1px',
      }}>
        {message}
      </span>

      {/* Close button */}
      <button
        onClick={() => { setLeaving(true); setTimeout(onClose, 220); }}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#a8a29e',
          display: 'flex',
          alignItems: 'center',
          padding: '2px 10px 0 0',
          flexShrink: 0,
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#57534e'}
        onMouseLeave={e => e.currentTarget.style.color = '#a8a29e'}
      >
        <X size={13} />
      </button>

      {/* Progress bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: '2px',
        width: '100%',
        background: '#f0efee',
      }}>
        <div style={{
          height: '100%',
          background: borderColor,
          opacity: 0.4,
          width: '100%',
          transformOrigin: 'left',
          animation: `toast-shrink ${duration}ms linear forwards`,
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
