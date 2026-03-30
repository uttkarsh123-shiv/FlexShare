import { Download, Share2 } from 'lucide-react';

const FileActions = ({ onDownload, isDownloading = false }) => {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: 'FlexShare file', url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="file-actions">
      <button onClick={onDownload} disabled={isDownloading} className="download-button">
        <Download size={16} />
        {isDownloading ? 'Downloading...' : 'Download File'}
      </button>

      <button onClick={handleShare} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        padding: '0.9rem 1.25rem', borderRadius: '14px', fontWeight: 600,
        fontSize: '0.9rem', border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.04)', color: '#94a3b8',
        cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#f1f5f9'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#94a3b8'; }}
      >
        <Share2 size={15} />
        Share
      </button>
    </div>
  );
};

export default FileActions;
