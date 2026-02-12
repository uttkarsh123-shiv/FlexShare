import { FileText, Image as ImageIcon, File, Lock } from 'lucide-react';

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
      {/* If file has password, show password protection notice */}
      {hasPassword ? (
        <div className="flex flex-col items-center">
          <div className="file-icon-container">
            {getFileIcon()}
          </div>
          
          <h2 className="file-title">
            {filename}
          </h2>
          
          {conversionType && conversionType !== "none" && (
            <p className="file-conversion">
              {conversionType?.replace("->", " → ")}
            </p>
          )}
          
          {description && description !== "No description provided" && (
            <p className="file-description">
              {description}
            </p>
          )}
          
          {/* Password Protection Notice */}
          <div className="mt-8 px-8 py-6 bg-gradient-to-br from-orange-500/5 via-orange-600/5 to-orange-500/5 border border-orange-500/20 rounded-2xl backdrop-blur-sm max-w-md">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Lock className="w-5 h-5 text-orange-400" strokeWidth={2} />
              </div>
              <h3 className="text-orange-400 text-lg font-bold">
                Password Protected
              </h3>
            </div>
            <p className="text-gray-400 text-sm text-center leading-relaxed">
              This file requires a password to access. Enter the password below to view and download.
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
              style={{ maxHeight: '16rem' }}
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
              
              {conversionType && conversionType !== "none" && (
                <p className="file-conversion">
                  {conversionType?.replace("->", " → ")}
                </p>
              )}
              
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