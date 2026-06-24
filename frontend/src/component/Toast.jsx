import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const config = {
  success: { icon: CheckCircle2, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  error:   { icon: XCircle,      color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  warning: { icon: AlertTriangle,color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  info:    { icon: Info,         color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
};

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const { icon: Icon, color, bg, border } = config[type] || config.info;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => { setLeaving(true); setTimeout(onClose, 200); }, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '10px 14px',
      borderRadius: '8px',
      background: bg,
      border: `1px solid ${border}`,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      minWidth: '240px', maxWidth: '340px',
      position: 'relative', overflow: 'hidden',
      transform: visible && !leaving ? 'translateX(0)' : 'translateX(12px)',
      opacity: visible && !leaving ? 1 : 0,
      transition: 'transform 0.2s ease, opacity 0.2s ease',
    }}>
      <Icon size={15} style={{ color, flexShrink: 0 }} />
      <span style={{ color: '#111827', fontSize: '0.875rem', fontWeight: 500, flex: 1, lineHeight: 1.4 }}>
        {message}
      </span>
      <button onClick={() => { setLeaving(true); setTimeout(onClose, 200); }}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: '2px' }}>
        <X size={13} />
      </button>
      <div style={{ position: 'absolute', bottom: 0, left: 0, height: '2px', width: '100%', background: border }}>
        <div style={{ height: '100%', background: color, width: '100%', transformOrigin: 'left', animation: `shrink ${duration}ms linear forwards` }} />
      </div>
      <style>{`@keyframes shrink { from { transform: scaleX(1); } to { transform: scaleX(0); } }`}</style>
    </div>
  );
}
