import { FileText, Image as ImageIcon, File, FileSpreadsheet } from 'lucide-react';

const iconMap = {
  image:   { icon: ImageIcon,       color: 'var(--text-body)' },
  pdf:     { icon: FileText,        color: 'var(--text-body)' },
  word:    { icon: FileText,        color: 'var(--text-body)' },
  excel:   { icon: FileSpreadsheet, color: 'var(--text-body)' },
  ppt:     { icon: File,            color: 'var(--text-body)' },
  default: { icon: File,            color: 'var(--text-muted)' },
};

const getIconConfig = (conversionType, fileUrl) => {
  if (conversionType?.startsWith('image->') || fileUrl?.match(/\.(jpg|jpeg|png|gif|webp|bmp|avif)$/i))
    return iconMap.image;
  if (conversionType?.includes('pdf')   || fileUrl?.match(/\.pdf$/i))
    return iconMap.pdf;
  if (conversionType?.includes('word')  || fileUrl?.match(/\.(doc|docx)$/i))
    return iconMap.word;
  if (conversionType?.includes('excel') || fileUrl?.match(/\.(xls|xlsx)$/i))
    return iconMap.excel;
  if (conversionType?.includes('ppt')   || fileUrl?.match(/\.(ppt|pptx)$/i))
    return iconMap.ppt;
  return iconMap.default;
};

export default function FilePreview({ fileUrl, filename, conversionType, description, isImage, hasPassword, code }) {
  const { icon: Icon, color } = getIconConfig(conversionType, fileUrl);
  const showConversion = conversionType && conversionType !== 'none';

  return (
    <div className="file-preview">
      {isImage && !hasPassword && fileUrl
        ? <img src={fileUrl} alt={filename} className="file-image" loading="lazy" />
        : (
          <div className="file-icon-container">
            <Icon size={24} style={{ color }} />
          </div>
        )
      }

      <h2 className="file-title">{filename}</h2>

      {description && description !== 'No description provided' && description.length <= 80 && (
        <p className="file-description">{description}</p>
      )}

      {showConversion && (
        <div className="file-meta-row">
          <span className="file-conversion">{conversionType.replace('->', ' → ')}</span>
        </div>
      )}
    </div>
  );
}
