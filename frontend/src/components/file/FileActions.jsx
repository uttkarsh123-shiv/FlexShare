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
      {/* Orange — the one accent on this page */}
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
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--bg-border)',
          background: 'transparent',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.875rem',
          fontFamily: 'var(--font-sans)',
          whiteSpace: 'nowrap',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#9ca3af';
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.background = 'var(--bg-muted)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--bg-border)';
          e.currentTarget.style.color = 'var(--text-muted)';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <Share2 size={14} /> Share
      </button>
    </div>
  );
}
