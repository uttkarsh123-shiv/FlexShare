import React from 'react';
import { Download, Eye } from 'lucide-react';

const FileActions = ({ 
  onDownload, 
  onPreview,
  isDownloading = false,
  hasPassword = false 
}) => {
  return (
    <div className="file-actions">
      {/* Only show preview button for non-password-protected files */}
      {!hasPassword && (
        <button
          onClick={onPreview}
          className="preview-button"
          style={{
            background: 'rgba(59, 130, 246, 0.2)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#3b82f6',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            flex: 1
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(59, 130, 246, 0.3)';
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(59, 130, 246, 0.2)';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <Eye className="w-4 h-4" />
          Preview File
        </button>
      )}
      
      <button
        onClick={onDownload}
        disabled={isDownloading}
        className="download-button"
      >
        <Download className="w-4 h-4" />
        {isDownloading ? "Downloading..." : "Download File"}
      </button>
    </div>
  );
};

export default FileActions;