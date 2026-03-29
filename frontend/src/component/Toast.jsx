import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const config = {
  success: {
    icon: CheckCircle2,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
    glow: '0 0 20px rgba(34,197,94,0.15)',
  },
  error: {
    icon: XCircle,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    glow: '0 0 20px rgba(239,68,68,0.15)',
  },
  warning: {
    icon: AlertTriangle,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    glow: '0 0 20px rgba(245,158,11,0.15)',
  },
  info: {
    icon: Info,
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.08)',
    glow: '0 0 20px rgba(59,130,246,0.15)',
  },
};

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const { icon: Icon, color, bg, glow } = config[type] || config.info;

  useEffect(() => {
    // enter
    requestAnimationFrame(() => setVisible(true));

    const leaveTimer = setTimeout(() => {
      setLeaving(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(leaveTimer);
  }, [duration, onClose]);

  const progress = {
    animation: `shrink ${duration}ms linear forwards`,
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        borderRadius: '12px',
        background: bg,
        border: `1px solid ${color}30`,
        boxShadow: `${glow}, 0 4px 24px rgba(0,0,0,0.4)`,
        backdropFilter: 'blur(12px)',
        minWidth: '280px',
        maxWidth: '380px',
        position: 'relative',
        overflow: 'hidden',
        transform: visible && !leaving ? 'translateX(0) scale(1)' : 'translateX(20px) scale(0.97)',
        opacity: visible && !leaving ? 1 : 0,
        transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
      }}
    >
      {/* icon */}
      <Icon size={18} style={{ color, flexShrink: 0 }} />

      {/* message */}
      <span style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: 500, flex: 1, lineHeight: 1.4 }}>
        {message}
      </span>

      {/* close */}
      <button
        onClick={() => { setLeaving(true); setTimeout(onClose, 300); }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#64748b', padding: '2px', display: 'flex', flexShrink: 0,
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = '#f1f5f9'}
        onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
      >
        <X size={14} />
      </button>

      {/* progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, height: '2px',
        width: '100%', background: `${color}20`,
      }}>
        <div style={{
          height: '100%', background: color,
          width: '100%', transformOrigin: 'left',
          ...progress,
        }} />
      </div>

      <style>{`
        @keyframes shrink {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
};

export default Toast;
