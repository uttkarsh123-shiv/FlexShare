import { CalendarDays, Timer, ShieldCheck } from 'lucide-react';

const fmt = (d) => d ? new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

const FileInfo = ({ createdAt, expiry, hasPassword }) => (
  <div className="file-info">
    <div className="file-info-content">
      <span className="info-item"><CalendarDays size={12} />Created {fmt(createdAt)}</span>
      <span className="info-item"><Timer size={12} />Expires {fmt(expiry)}</span>
      {hasPassword && <span className="info-item protected"><ShieldCheck size={12} />Password protected</span>}
    </div>
  </div>
);

export default FileInfo;
