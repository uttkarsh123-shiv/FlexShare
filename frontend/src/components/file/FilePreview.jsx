import { FileText, Image as ImageIcon, File } from 'lucide-react';

const FilePreview = ({ 
  fileUrl, 
  filename, 
  conversionType, 
  description, 
  isImage 
}) => {
  const getFileIcon = () => {
    if (conversionType?.startsWith("image->") || fileUrl?.match(/\.(jpg|jpeg|png|gif|webp|bmp|avif)$/i)) {
      return <ImageIcon className="w-20 h-20 text-orange-500" />;
    }
    if (conversionType?.includes("pdf") || fileUrl?.match(/\.pdf$/i)) {
      return <FileText className="w-20 h-20 text-red-500" />;
    }
    if (conversionType?.includes("word") || fileUrl?.match(/\.(doc|docx)$/i)) {
      return <FileText className="w-20 h-20 text-blue-500" />;
    }
    return <File className="w-20 h-20 text-gray-400" />;
  };

  const getFileType = () => {
    if (conversionType && conversionType.includes('->')) {
      return conversionType.split('->')[1]?.toUpperCase() || 'FILE';
    }
    const ext = filename.split('.').pop()?.toUpperCase();
    return ext || 'FILE';
  };

  return (
    <div className="file-preview">
      {isImage ? (
        <img
          src={fileUrl}
          alt={filename}
          className="file-image"
          style={{ maxHeight: '12rem' }}
          loading="lazy"
        />
      ) : (
        <div className="flex flex-col items-center">
          <div className="file-icon-container">
            {getFileIcon()}
          </div>
          
          <h2 className="file-title">
            {filename}
          </h2>
          
          <p className="file-conversion">
            {conversionType?.replace("->", " → ") || "Original format"}
          </p>
          
          {description && description !== "No description provided" && (
            <p className="file-description">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className="file-type-badge">
        {getFileType()}
      </div>
    </div>
  );
};

export default FilePreview;