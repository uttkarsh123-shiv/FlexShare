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
      <button
        onClick={!isDisabled ? onDownload : undefined}
        disabled={isDisabled}
        className="download-button"
      >
        <Download size={15} />
        {label}
      </button>

      <button
        onClick={handleShare}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0.8rem 1rem',
          borderRadius: '10px',
          border: '1px solid #e7e5e4',
          background: 'transparent',
          color: '#78716c',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.875rem',
          whiteSpace: 'nowrap',
          fontFamily: "'Inter', sans-serif",
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#fed7aa';
          e.currentTarget.style.color = '#f97316';
          e.currentTarget.style.background = '#fff7ed';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = '#e7e5e4';
          e.currentTarget.style.color = '#78716c';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <Share2 size={14} /> Share
      </button>
    </div>
  );
}
