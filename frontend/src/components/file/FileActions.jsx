import { Download, Share2 } from 'lucide-react';

export default function FileActions({ onDownload, isDownloading = false, disabled = false }) {
  const handleShare = () => {
    if (navigator.share) { navigator.share({ title: 'FlexShare file', url: window.location.href }); }
    else { navigator.clipboard.writeText(window.location.href); }
  };

  const isDisabled = isDownloading || disabled;
  const label = isDownloading ? 'Downloading...' : disabled ? 'Unavailable' : 'Download File';

  return (
    <div className="file-actions">
      <button onClick={!isDisabled ? onDownload : undefined} disabled={isDisabled} className="download-button">
        <Download size={15} />{label}
      </button>
      <button onClick={handleShare} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.875rem 1rem', border: '1px solid #000000', background: 'transparent', color: '#000000', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap', fontFamily: "'Inter', sans-serif", textTransform: 'uppercase', letterSpacing: '0.06em', transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.background = '#000000'; e.currentTarget.style.color = '#ffffff'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#000000'; }}>
        <Share2 size={14} /> Share
      </button>
    </div>
  );
}
