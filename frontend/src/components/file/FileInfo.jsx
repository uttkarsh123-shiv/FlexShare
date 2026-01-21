import React from 'react';
import { Clock, AlertCircle, Shield } from 'lucide-react';

const FileInfo = ({ createdAt, expiry, hasPassword }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="file-info">
      <div className="file-info-content">
        <div className="info-item">
          <Clock className="w-3 h-3" />
          <span>Created: {formatDate(createdAt)}</span>
        </div>
        
        <div className="info-item">
          <AlertCircle className="w-3 h-3" />
          <span>Expires: {formatDate(expiry)}</span>
        </div>
        
        {hasPassword && (
          <div className="info-item protected">
            <Shield className="w-3 h-3" />
            <span>Password Protected</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileInfo;