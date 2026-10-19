import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Trash2, ExternalLink, Copy, FileText, Image as ImageIcon, File, FileSpreadsheet, Trash } from 'lucide-react';
import { getHistory, removeFromHistory, clearHistory } from '../hooks/useFileHistory';
import { useToast } from '../context/ToastContext';

const formatDate = (iso) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const isExpired = (expiresAt) => {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
};

const getFileIcon = (conversionType, fileName) => {
  const name = (fileName || '').toLowerCase();
  if (conversionType?.startsWith('image') || /\.(png|jpg|jpeg|webp|gif|bmp|avif)$/.test(name))
    return <ImageIcon size={18} />;
  if (/\.(pdf)$/.test(name) || conversionType?.includes('pdf'))
    return <FileText size={18} />;
  if (/\.(xlsx|xls|csv)$/.test(name) || conversionType?.includes('excel'))
    return <FileSpreadsheet size={18} />;
  return <File size={18} />;
};

const conversionLabel = (type) => {
  if (!type || type === 'none') return 'No conversion';
  return type.replace('->', ' → ');
};

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleRemove = (code) => {
    setHistory(removeFromHistory(code));
    showToast('Removed from history', 'success');
  };

  const handleClear = () => {
    clearHistory();
    setHistory([]);
    showToast('History cleared', 'success');
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    showToast('Code copied!', 'success');
  };

  const handleCopyLink = (code) => {
    navigator.clipboard.writeText(`${window.location.origin}/file/${code}`);
    showToast('Link copied!', 'success');
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 62px)',
      background: 'var(--bg-base)',
      padding: '2.5rem 1.5rem',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.03em' }}>
              File History
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0.3rem 0 0' }}>
              Files you've shared from this browser — no account needed.
            </p>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleClear}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', background: 'transparent',
                color: 'var(--text-muted)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)', fontSize: '0.85rem', fontWeight: 500,
                cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef4444'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
            >
              <Trash size={13} /> Clear All
            </button>
          )}
        </div>

        {/* Empty state */}
        {history.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '5rem 2rem',
            background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
          }}>
            <Clock size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>
              No history yet
            </p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 0 1.5rem' }}>
              Files you upload will appear here so you can access them again.
            </p>
            <button
              onClick={() => window.dispatchEvent(new Event('flexshare:open-upload'))}
              style={{
                padding: '10px 22px', background: 'var(--btn-bg)', color: 'var(--btn-fg)',
                border: 'none', borderRadius: 'var(--radius-md)', fontSize: '0.9rem',
                fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)',
              }}
            >
              Upload a File
            </button>
          </div>
        )}

        {/* History list */}
        {history.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {history.map((entry) => {
              const expired = isExpired(entry.expiresAt);
              return (
                <div
                  key={entry.code}
                  style={{
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '16px',
                    padding: '1.25rem 1.5rem',
                    opacity: expired ? 0.5 : 1,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                    transition: 'box-shadow 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.28)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.18)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {/* Icon */}
                    <div style={{
                      width: 46, height: 46, borderRadius: '12px',
                      background: 'var(--bg-base)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0,
                    }}>
                      {getFileIcon(entry.conversionType, entry.fileName)}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px',
                        }} title={entry.fileName}>
                          {entry.fileName}
                        </span>
                        {expired && (
                          <span style={{
                            fontSize: '0.7rem', fontWeight: 700, padding: '3px 9px',
                            background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                            borderRadius: '999px', letterSpacing: '0.04em',
                          }}>
                            EXPIRED
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '14px', marginTop: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono, monospace)', fontWeight: 700,
                          fontSize: '0.85rem', color: 'var(--text-body)', letterSpacing: '0.06em',
                        }}>{entry.code}</span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {conversionLabel(entry.conversionType)}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={12} /> {formatDate(entry.uploadedAt)}
                        </span>
                        {entry.expiresAt && (
                          <span style={{ fontSize: '0.85rem', color: expired ? '#ef4444' : 'var(--text-muted)' }}>
                            {expired ? 'Expired' : 'Expires'} {formatDate(entry.expiresAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                      {!expired && (
                        <button
                          onClick={() => navigate(`/file/${entry.code}`)}
                          title="View file"
                          style={iconBtnStyle}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-base)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <ExternalLink size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleCopyCode(entry.code)}
                        title="Copy code"
                        style={iconBtnStyle}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-base)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => handleRemove(entry.code)}
                        title="Remove from history"
                        style={{ ...iconBtnStyle, color: 'var(--text-muted)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#ef4444'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const iconBtnStyle = {
  width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'transparent', border: 'none', borderRadius: '10px',
  color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s',
  fontFamily: 'var(--font-sans)',
};
