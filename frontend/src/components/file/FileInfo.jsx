import { CalendarDays, Timer } from 'lucide-react';

const fmt = (d) => d
  ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  : 'N/A';

export default function FileInfo({ createdAt, expiry }) {
  return (
    <div className="file-info">
      <div className="file-info-content">
        <span className="info-item"><CalendarDays size={11} />Created {fmt(createdAt)}</span>
        <span className="info-item"><Timer size={11} />Expires {fmt(expiry)}</span>
      </div>
    </div>
  );
}
