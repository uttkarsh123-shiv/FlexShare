import { Download, Share2 } from 'lucide-react';

export default function FileActions({ onDownload, isDownloading = false, disabled = false }) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'FlexShare file', url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const isDisabled = isDownloading || disabled;
  const label = isDownloading ? 'Downloading...' : disabled ? 'Unavailable' : 'Download File';

  return (
    <div className="file-actions">
      <button onClick={!isDisabled ? onDownload : undefined} disabled={isDisabled} className="download-button">
        <Download size={15} />
        {label}
      </button>

      <button onClick={handleShare} style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '0.75rem 1rem', borderRadius: '8px',
        border: '1px solid #e5e7eb',
        background: 'transparent', color: '#6b7280',
        cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem',
        whiteSpace: 'nowrap',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#374151'; e.currentTarget.style.color = '#111827'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280'; }}
      >
        <Share2 size={14} /> Share
      </button>
    </div>
  );
}
