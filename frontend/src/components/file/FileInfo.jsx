import { CalendarDays, Timer } from 'lucide-react';

const fmt = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
};

export default function FileInfo({ createdAt, expiry }) {
  return (
    <div className="file-info-row">
      <div className="file-info-item">
        <CalendarDays size={13} color="var(--text-subtle)" />
        <span>Created <strong>{fmt(createdAt)}</strong></span>
      </div>
      {expiry && (
        <div className="file-info-item">
          <Timer size={13} color="var(--text-subtle)" />
          <span>Expires <strong>{fmt(expiry)}</strong></span>
        </div>
      )}
    </div>
  );
}
