import { FileText, Image as ImageIcon, File } from 'lucide-react';

const FilePreview = ({ 
  fileUrl, 
  filename, 
  conversionType, 
  description, 
  isImage,
  hasPassword = false 
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
      {/* If file has password, only show file info, not the actual preview */}
      {hasPassword ? (
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
          
          <div className="mt-6 px-6 py-4 bg-gradient-to-r from-orange-500/10 via-orange-600/10 to-orange-500/10 border border-orange-500/20 rounded-xl backdrop-blur-sm">
            <div className="flex items-center justify-center gap-3 mb-2">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-orange-400 text-sm font-semibold">
                Password Protected File
              </p>
            </div>
            <p className="text-orange-300/80 text-xs text-center leading-relaxed">
              Enter the password to view full preview and download this file
            </p>
          </div>
        </div>
      ) : (
        // No password - show full preview as before
        <>
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
        </>
      )}
      
      <div className="file-type-badge">
        {getFileType()}
      </div>
    </div>
  );
};

export default FilePreview;