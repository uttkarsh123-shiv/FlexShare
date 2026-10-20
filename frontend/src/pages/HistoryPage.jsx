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

  useEffect(() => { setHistory(getHistory()); }, []);

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
      minHeight: 'calc(100vh - 64px)',
      background: 'var(--bg-soft)',
      padding: '2.5rem 1.5rem',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.01em' }}>
              File History
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
              Files you've shared from this browser — no account needed.
            </p>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleClear}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', background: 'transparent',
                color: 'var(--text-muted)', border: '1px solid var(--bg-border)',
                borderRadius: '999px', fontSize: '0.82rem', fontWeight: 500,
                cursor: 'pointer', fontFamily: 'var(--font-sans)', transition: 'all 0.15s',
                marginTop: '2px',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.borderColor = 'var(--error)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--bg-border)'; }}
            >
              <Trash size={13} /> Clear all
            </button>
          )}
        </div>

        {/* Empty state */}
        {history.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '4rem 2rem',
            background: 'var(--bg-base)', borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--bg-border)',
          }}>
            <Clock size={36} style={{ color: 'var(--text-subtle)', marginBottom: '1rem' }} />
            <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 0.4rem' }}>
              No history yet
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 1.5rem' }}>
              Files you upload will appear here so you can access them again.
            </p>
            <button
              onClick={() => window.dispatchEvent(new Event('flexshare:open-upload'))}
              style={{
                padding: '10px 22px', background: 'var(--accent)', color: '#ffffff',
                border: 'none', borderRadius: '999px', fontSize: '0.875rem',
                fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)',
              }}
            >
              Upload a file
            </button>
          </div>
        )}

        {/* History list */}
        {history.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {history.map((entry) => {
              const expired = isExpired(entry.expiresAt);
              return (
                <div
                  key={entry.code}
                  style={{
                    background: 'var(--bg-base)',
                    border: '1px solid var(--bg-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1rem 1.25rem',
                    opacity: expired ? 0.55 : 1,
                    transition: 'box-shadow 0.15s',
                  }}
                  onMouseEnter={e => { if (!expired) e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    {/* Icon */}
                    <div style={{
                      width: 40, height: 40, borderRadius: 'var(--radius-md)',
                      background: 'var(--accent-light)', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: 'var(--accent)', flexShrink: 0,
                    }}>
                      {getFileIcon(entry.conversionType, entry.fileName)}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px',
                        }} title={entry.fileName}>
                          {entry.fileName}
                        </span>
                        {expired && (
                          <span style={{
                            fontSize: '0.68rem', fontWeight: 600, padding: '2px 8px',
                            background: '#fce8e6', color: 'var(--error)',
                            borderRadius: '999px', letterSpacing: '0.04em',
                          }}>
                            EXPIRED
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{
                          fontFamily: 'var(--font-mono)', fontWeight: 600,
                          fontSize: '0.8rem', color: 'var(--text-body)', letterSpacing: '0.06em',
                        }}>{entry.code}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {conversionLabel(entry.conversionType)}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Clock size={11} /> {formatDate(entry.uploadedAt)}
                        </span>
                        {entry.expiresAt && (
                          <span style={{ fontSize: '0.78rem', color: expired ? 'var(--error)' : 'var(--text-subtle)' }}>
                            {expired ? 'Expired' : 'Expires'} {formatDate(entry.expiresAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                      {!expired && (
                        <button
                          onClick={() => navigate(`/file/${entry.code}`)}
                          title="View file"
                          style={iconBtnStyle}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <ExternalLink size={15} />
                        </button>
                      )}
                      <button
                        onClick={() => handleCopyCode(entry.code)}
                        title="Copy code"
                        style={iconBtnStyle}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-muted)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <Copy size={15} />
                      </button>
                      <button
                        onClick={() => handleRemove(entry.code)}
                        title="Remove from history"
                        style={{ ...iconBtnStyle }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fce8e6'; e.currentTarget.style.color = 'var(--error)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                      >
                        <Trash2 size={15} />
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
  width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'transparent', border: 'none', borderRadius: '50%',
  color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s',
  fontFamily: 'var(--font-sans)',
};
