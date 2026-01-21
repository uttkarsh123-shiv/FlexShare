import React from 'react';
import { Download } from 'lucide-react';

const FileActions = ({ 
  onDownload, 
  isDownloading = false 
}) => {
  return (
    <div className="file-actions">
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