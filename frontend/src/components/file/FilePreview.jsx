import { FileText, Image as ImageIcon, File, FileSpreadsheet, Lock, Copy } from 'lucide-react';
import { useState } from 'react';

const iconMap = {
  image:   { icon: ImageIcon,       color: '#fb923c' },
  pdf:     { icon: FileText,        color: '#f87171' },
  word:    { icon: FileText,        color: '#60a5fa' },
  excel:   { icon: FileSpreadsheet, color: '#34d399' },
  ppt:     { icon: File,            color: '#a78bfa' },
  default: { icon: File,            color: '#94a3b8' },
};

const getIconConfig = (conversionType, fileUrl) => {
  if (conversionType?.startsWith('image->') || fileUrl?.match(/\.(jpg|jpeg|png|gif|webp|bmp|avif)$/i)) return iconMap.image;
  if (conversionType?.includes('pdf')   || fileUrl?.match(/\.pdf$/i))         return iconMap.pdf;
  if (conversionType?.includes('word')  || fileUrl?.match(/\.(doc|docx)$/i))  return iconMap.word;
  if (conversionType?.includes('excel') || fileUrl?.match(/\.(xls|xlsx)$/i))  return iconMap.excel;
  if (conversionType?.includes('ppt')   || fileUrl?.match(/\.(ppt|pptx)$/i))  return iconMap.ppt;
  return iconMap.default;
};

const FilePreview = ({ fileUrl, filename, conversionType, description, isImage, hasPassword = false, code }) => {
  const { icon: Icon, color } = getIconConfig(conversionType, fileUrl);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="file-preview">
      {/* image preview */}
      {isImage && !hasPassword ? (
        <img src={fileUrl} alt={filename} className="file-image" loading="lazy" />
      ) : (
        <div className="file-icon-container" style={{ borderColor: `${color}25` }}>
          <Icon size={36} style={{ color }} />
        </div>
      )}

      {/* filename */}
      <h2 className="file-title">{filename}</h2>

      {/* conversion pill */}
      {conversionType && conversionType !== 'none' && (
        <span className="file-conversion">
          {conversionType.replace('->', ' → ')}
        </span>
      )}

      {/* description */}
      {description && description !== 'No description provided' && (
        <p className="file-description">{description}</p>
      )}

      {/* file code — lives in the card now */}
      {code && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          marginTop: '1.5rem',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px', padding: '10px 18px',
        }}>
          <div>
            <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600, marginBottom: '3px' }}>
              File Code
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#f1f5f9', fontFamily: 'monospace', letterSpacing: '4px' }}>
              {code}
            </div>
          </div>
          <button onClick={handleCopy} title="Copy code" style={{
            background: copied ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: '8px', padding: '7px', cursor: 'pointer',
            color: copied ? '#22c55e' : '#64748b',
            display: 'flex', alignItems: 'center', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { if (!copied) { e.currentTarget.style.background = 'rgba(234,88,12,0.12)'; e.currentTarget.style.color = '#ea580c'; }}}
            onMouseLeave={e => { if (!copied) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#64748b'; }}}
          >
            <Copy size={14} />
          </button>
        </div>
      )}

      {/* password notice */}
      {hasPassword && (
        <div style={{
          marginTop: '1.5rem', padding: '1.25rem 1.75rem',
          background: 'rgba(234,88,12,0.06)', border: '1px solid rgba(234,88,12,0.18)',
          borderRadius: '16px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '8px', maxWidth: '360px',
        }}>
          <Lock size={18} style={{ color: '#fb923c' }} />
          <p style={{ color: '#fb923c', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>Password Protected</p>
          <p style={{ color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
            Enter the password below to download this file.
          </p>
        </div>
      )}
    </div>
  );
};

export default FilePreview;
