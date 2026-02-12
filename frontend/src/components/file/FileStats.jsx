import React from 'react';
import { RefreshCw, Clock, Download, Shield } from 'lucide-react';

const FileStats = ({ 
  conversionType, 
  expiry, 
  downloadCount, 
  maxDownloads, 
  hasPassword 
}) => {
  const getTimeRemaining = (expiryDate) => {
    if (!expiryDate) return "Unknown";
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry - now;
    
    if (diff <= 0) return "Expired";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="file-stats">
      <div className="stat-item">
        <div className="stat-value conversion">
          {conversionType?.replace("->", " → ") || "none"}
        </div>
        <div className="stat-label">
          <RefreshCw className="w-3 h-3" />
          Conversion
        </div>
      </div>
      
      <div className="stat-item">
        <div className="stat-value time">
          {getTimeRemaining(expiry)}
        </div>
        <div className="stat-label">
          <Clock className="w-3 h-3" />
          Time Left
        </div>
      </div>
      
      <div className="stat-item">
        <div className="stat-value downloads">
          {downloadCount || 0}
          {maxDownloads ? `/${maxDownloads}` : ""}
        </div>
        <div className="stat-label">
          <Download className="w-3 h-3" />
          Downloads
        </div>
      </div>
      
      <div className="stat-item">
        <div className="stat-value protected">
          {hasPassword ? (
            <Shield className="w-5 h-5 inline" />
          ) : (
            "No"
          )}
        </div>
        <div className="stat-label">
          <Shield className="w-3 h-3" />
          Protected
        </div>
      </div>
    </div>
  );
};

export default FileStats;