import React from 'react';

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
          {conversionType?.replace("->", " → ") || "None"}
        </div>
        <div className="stat-label">Conversion</div>
      </div>
      
      <div className="stat-item">
        <div className="stat-value time">
          {getTimeRemaining(expiry)}
        </div>
        <div className="stat-label">Time Left</div>
      </div>
      
      <div className="stat-item">
        <div className="stat-value downloads">
          {downloadCount || 0}
          {maxDownloads ? `/${maxDownloads}` : ""}
        </div>
        <div className="stat-label">Downloads</div>
      </div>
      
      <div className="stat-item">
        <div className="stat-value protected">
          {hasPassword ? "Yes" : "No"}
        </div>
        <div className="stat-label">Protected</div>
      </div>
    </div>
  );
};

export default FileStats;