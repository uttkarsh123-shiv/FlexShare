import { ArrowRightLeft, Clock, Download, ShieldCheck } from 'lucide-react';

const getTimeRemaining = (expiryDate) => {
  if (!expiryDate) return 'Unknown';
  const diff = new Date(expiryDate) - new Date();
  if (diff <= 0) return 'Expired';
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const Stat = ({ value, label, icon: Icon, className }) => (
  <div className="stat-item">
    <span className={`stat-value ${className}`}>{value}</span>
    <div className="stat-label">
      <Icon size={10} />
      {label}
    </div>
  </div>
);

export default function FileStats({ conversionType, expiry, downloadCount, maxDownloads, hasPassword }) {
  return (
    <div className="file-stats">
      <Stat
        value={conversionType?.replace('->', ' → ') || 'none'}
        label="Conversion"
        icon={ArrowRightLeft}
        className="conversion"
      />
      <Stat
        value={getTimeRemaining(expiry)}
        label="Expires in"
        icon={Clock}
        className="time"
      />
      <Stat
        value={`${downloadCount || 0}${maxDownloads ? `/${maxDownloads}` : ''}`}
        label="Downloads"
        icon={Download}
        className="downloads"
      />
      <Stat
        value={hasPassword ? <ShieldCheck size={16} /> : 'Open'}
        label="Access"
        icon={ShieldCheck}
        className="protected"
      />
    </div>
  );
}
