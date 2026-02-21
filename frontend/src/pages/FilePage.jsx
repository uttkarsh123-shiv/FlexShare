import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { throttle } from "lodash";
import { useToast } from "../context/ToastContext";
import { ErrorBoundary } from "react-error-boundary";
import { SimpleErrorFallback } from "../components/ErrorFallback";
import "../styles/FilePage.css";

// Import components
import FileHeader from "../components/file/FileHeader";
import LoadingSpinner from "../components/file/LoadingSpinner";
import ErrorDisplay from "../components/file/ErrorDisplay";

// Lazy imports
import { 
  LazyPasswordModal, 
  LazyFilePreview, 
  LazyFileStats, 
  LazyFileActions, 
  LazyFileInfo 
} from "../components/LazyComponents";

// Suspense loaders
import { 
  PasswordModalLoader,
  FilePreviewLoader,
  FileStatsLoader,
  FileActionsLoader,
  FileInfoLoader
} from "../components/SuspenseLoaders";

const getApiUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3000';
  }
  return 'https://flexshare-backend.onrender.com';
};

const API_URL = import.meta.env.VITE_API_URL || getApiUrl();

export default function FilePage() {
  const { code } = useParams();
  const navigate = useNavigate(); 
  const { showToast } = useToast();
  
  // State management
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true); // Track initial load to prevent UI flash

  // Fetch file information
  const fetchFileInfo = useCallback(async (markFirstView = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const url = `${API_URL}/api/file/${code}/info${markFirstView ? '?markFirstView=true' : ''}`;
      const res = await axios.get(url);
      
      setFile(res.data);
      setRequiresPassword(false);
      setInitialLoad(false); // Mark initial load as complete
    } catch (err) {
      console.error('Fetch file info error:', err);
      
      if (err.response?.status === 404) {
        setError("File not found or has been removed");
      } else if (err.response?.status === 410) {
        setError("File has expired");
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else if (err.code === 'NETWORK_ERROR' || !err.response) {
        setError("Network error. Please check your connection.");
      } else {
        setError("Failed to load file information");
      }
    } finally {
      setLoading(false);
      setInitialLoad(false); // Ensure initial load is marked complete even on error
    }
  }, [code]);

  // Fetch file with password
  const fetchFileWithPassword = useCallback(async (password) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/file/${code}`, {
        password: password
      });
      
      setFile(res.data);
      setError(null);
      setRequiresPassword(false);
      setInitialLoad(false); // Mark initial load as complete
    } catch (err) {
      console.error('Fetch with password error:', err);
      
      if (err.response?.status === 401) {
        if (err.response.data?.requiresPassword) {
          setRequiresPassword(true);
          if (password) {
            showToast("Invalid password", "error");
          }
        } else {
          showToast("Authentication failed", "error");
        }
      } else if (err.response?.status === 404) {
        setError("File not found or has been removed");
      } else if (err.response?.status === 410) {
        setError("File has expired");
      } else if (err.response?.status === 403) {
        setError("Download limit reached for this file");
      } else {
        setError("Failed to access file");
        showToast("Failed to access file. Please try again.", "error");
      }
    } finally {
      setLoading(false);
      setInitialLoad(false); // Ensure initial load is marked complete even on error
    }
  }, [code, showToast]);

  // Download function
  const downloadFileFromURL = useCallback(async (url, filename) => {
    try {
      // Validate URL
      if (!url || typeof url !== 'string') {
        throw new Error('Invalid download URL');
      }

      // Add timeout and better error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const fileResponse = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': '*/*',
        }
      });

      clearTimeout(timeoutId);

      if (!fileResponse.ok) {
        throw new Error(`Failed to fetch file: ${fileResponse.status} ${fileResponse.statusText}`);
      }
      
      const blob = await fileResponse.blob();
      
      // Validate blob
      if (!blob || blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'download';
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL after a short delay
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 1000);

    } catch (error) {
      console.error('Download error:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('Download timeout. Please try again.');
      } else if (error.message.includes('Failed to fetch')) {
        // Fallback to direct link method for CORS issues
        try {
          const link = document.createElement('a');
          link.href = url;
          link.download = filename || 'download';
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (fallbackError) {
          throw new Error('Download failed. The file may no longer be available.');
        }
      } else {
        throw error;
      }
    }
  }, []);

  // Throttled download function - prevents spam clicking
  const performDownload = useCallback(
    throttle(async (downloadPassword = null) => {
      if (isDownloading) return;
      
      setIsDownloading(true);

      try {
        const requestBody = downloadPassword ? { password: downloadPassword } : {};
        
        // Use the correct API endpoint for file access
        const response = await axios.post(`${API_URL}/api/file/${code}`, requestBody);
        
        if (response.data && response.data.fileUrl) {
          await downloadFileFromURL(
            response.data.fileUrl, 
            response.data.originalFileName || 'download'
          );
          
          showToast('Download started!', 'success');
          
          // Update download count in local state
          setFile(prev => ({
            ...prev,
            downloadCount: response.data.downloadCount || (prev.downloadCount + 1)
          }));
        } else {
          throw new Error('No download URL received from server');
        }
      } catch (err) {
        console.error('Download error:', err);
        
        if (err.response?.status === 401) {
          if (err.response.data?.requiresPassword) {
            setRequiresPassword(true);
            showToast('Password required for this file', 'warning');
          } else {
            showToast('Invalid password', 'error');
          }
          return;
        } else if (err.response?.status === 403) {
          showToast('Download limit reached for this file', 'error');
        } else if (err.response?.status === 404) {
          showToast('File not found or has been removed', 'error');
          navigate('/');
        } else if (err.response?.status === 410) {
          showToast('File has expired', 'error');
          navigate('/');
        } else {
          showToast('Download failed. Please try again.', 'error');
        }
      } finally {
        setIsDownloading(false);
      }
    }, 2000), // 2 second throttle
    [code, isDownloading, downloadFileFromURL, showToast, navigate]
  );

  // Handle download
  const handleDownload = useCallback(async () => {
    if (!file || isDownloading) return;

    if (file.hasPassword) {
      setRequiresPassword(true);
      return;
    }

    await performDownload();
  }, [file, isDownloading, performDownload]);

  // Handle password submission
  const handlePasswordSubmit = useCallback(async (password) => {
    if (file && file.fileUrl) {
      await performDownload(password.trim());
      if (!isDownloading) {
        setRequiresPassword(false);
      }
    } else {
      fetchFileWithPassword(password);
    }
  }, [file, performDownload, fetchFileWithPassword, isDownloading]);

  // Handle back click
  const handleBackClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // Handle password cancel
  const handlePasswordCancel = useCallback(() => {
    setRequiresPassword(false);
    if (!file?.fileUrl) {
      navigate("/");
    }
  }, [file?.fileUrl, navigate]);

  // Handle go home
  const handleGoHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // Initialize component
  useEffect(() => {
    if (code) {
      const forceDetailed = new URLSearchParams(window.location.search).get('detailed') === 'true';
      const uploadSuccess = sessionStorage.getItem('uploadSuccess');
      const uploadCode = sessionStorage.getItem('uploadCode');
      
      const mark = forceDetailed || (uploadSuccess && uploadCode === code);
      
      fetchFileInfo(mark);
    }
  }, [code, fetchFileInfo]);

  // Render loading state - show unified skeleton during initial load
  if (loading && initialLoad) {
    return (
      <div className="file-page">
        <FileHeader 
          code={code} 
          onBackClick={handleBackClick} 
        />
        <div className="file-container">
          <div className="file-card">
            {/* Single unified skeleton loader */}
            <div style={{ padding: '2rem' }}>
              {/* File preview skeleton */}
              <div style={{
                background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                borderRadius: '12px',
                height: '300px',
                marginBottom: '1.5rem'
              }} />
              
              {/* Stats skeleton */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                {[1,2,3,4].map(i => (
                  <div key={i} style={{
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite',
                    borderRadius: '8px',
                    height: '60px'
                  }} />
                ))}
              </div>
              
              {/* Buttons skeleton */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                  borderRadius: '12px',
                  height: '48px',
                  flex: 1
                }} />
                <div style={{
                  background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 1.5s infinite',
                  borderRadius: '12px',
                  height: '48px',
                  flex: 1
                }} />
              </div>
              
              {/* Info skeleton */}
              <div style={{
                background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                borderRadius: '8px',
                height: '80px'
              }} />
            </div>
          </div>
        </div>
        <style>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
      </div>
    );
  }

  // Show regular loading spinner for subsequent loads
  if (loading) {
    return <LoadingSpinner />;
  }

  // Render error state
  if (error || !file) {
    return <ErrorDisplay error={error} onGoHome={handleGoHome} />;
  }

  // Extract file data
  const { 
    fileUrl = '', 
    conversionType = '', 
    expiry = null, 
    description = '', 
    hasPassword = false, 
    downloadCount = 0, 
    maxDownloads = null, 
    createdAt = null 
  } = file;
  
  const filename = file.originalFileName || fileUrl?.split("/").pop().split("?")[0] || "Unknown file";
  const isImage = fileUrl?.match(/\.(jpg|jpeg|png|gif|webp|bmp|avif)$/i) || conversionType?.startsWith("image->");

  // Render main component
  return (
    <div className="file-page">
      <FileHeader 
        code={code} 
        onBackClick={handleBackClick} 
      />

      <LazyPasswordModal
        isOpen={requiresPassword}
        onSubmit={handlePasswordSubmit}
        onCancel={handlePasswordCancel}
        isLoading={loading || isDownloading}
        isForDownload={file && file.fileUrl}
      />

      <div className="file-container">
        <div className="file-card">
          
          <ErrorBoundary FallbackComponent={SimpleErrorFallback}>
            <LazyFilePreview
              fileUrl={fileUrl}
              filename={filename}
              conversionType={conversionType}
              description={description}
              isImage={isImage}
              hasPassword={hasPassword}
            />
          </ErrorBoundary>

          <div className="file-content">
            <ErrorBoundary FallbackComponent={SimpleErrorFallback}>
              <LazyFileStats
                conversionType={conversionType}
                expiry={expiry}
                downloadCount={downloadCount}
                maxDownloads={maxDownloads}
                hasPassword={hasPassword}
              />
            </ErrorBoundary>

            <ErrorBoundary FallbackComponent={SimpleErrorFallback}>
              <LazyFileActions
                onDownload={handleDownload}
                isDownloading={isDownloading}
              />
            </ErrorBoundary>

            <ErrorBoundary FallbackComponent={SimpleErrorFallback}>
              <LazyFileInfo
                createdAt={createdAt}
                expiry={expiry}
                hasPassword={hasPassword}
              />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}