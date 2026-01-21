import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
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

  // Fetch file information
  const fetchFileInfo = useCallback(async (markFirstView = false) => {
    try {
      setLoading(true);
      const url = `${API_URL}/api/file/${code}/info${markFirstView ? '?markFirstView=true' : ''}`;
      const res = await axios.get(url);
      setFile(res.data);
      setError(null);
      setRequiresPassword(false);
    } catch (err) {
      if (err.response?.status === 404) {
        setError("File not found");
      } else if (err.response?.status === 410) {
        setError("File has expired");
      } else {
        setError("Failed to load file");
      }
    } finally {
      setLoading(false);
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
    } catch (err) {
      if (err.response?.status === 401) {
        if (err.response.data.requiresPassword) {
          setRequiresPassword(true);
          if (password) {
            showToast("Invalid password", "error");
          }
        }
      } else if (err.response?.status === 404) {
        setError("File not found");
      } else if (err.response?.status === 410) {
        setError("File has expired");
      } else if (err.response?.status === 403) {
        setError("Download limit reached");
      } else {
        setError("Failed to load file");
      }
    } finally {
      setLoading(false);
    }
  }, [code, showToast]);

  // Download function
  const downloadFileFromURL = useCallback(async (url, filename) => {
    try {
      const fileResponse = await fetch(url);
      if (!fileResponse.ok) {
        throw new Error(`Failed to fetch file: ${fileResponse.status}`);
      }
      
      const blob = await fileResponse.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download error:', error);
      // Fallback to direct link method
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, []);

  // Perform download
  const performDownload = useCallback(async (downloadPassword = null) => {
    if (isDownloading) return;
    
    setIsDownloading(true);

    try {
      const requestBody = downloadPassword ? { password: downloadPassword } : {};
      const response = await axios.post(`${API_URL}/api/file/${code}`, requestBody);
      
      if (response.data && response.data.fileUrl) {
        await downloadFileFromURL(
          response.data.fileUrl, 
          response.data.originalFileName || 'download'
        );
        
        showToast('Download started!', 'success');
        
        setFile(prev => ({
          ...prev,
          downloadCount: response.data.downloadCount
        }));
      } else {
        throw new Error('No download URL received');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        showToast('Invalid password', 'error');
        return;
      } else if (err.response?.status === 403) {
        showToast('Download limit reached', 'error');
      } else if (err.response?.status === 410) {
        showToast('File has expired', 'error');
      } else {
        showToast('Download failed. Please try again.', 'error');
      }
    } finally {
      setIsDownloading(false);
    }
  }, [code, isDownloading, downloadFileFromURL, showToast]);

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

  // Render loading state
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

      <Suspense fallback={<PasswordModalLoader />}>
        <LazyPasswordModal
          isOpen={requiresPassword}
          onSubmit={handlePasswordSubmit}
          onCancel={handlePasswordCancel}
          isLoading={loading || isDownloading}
          isForDownload={file && file.fileUrl}
        />
      </Suspense>

      <div className="file-container">
        <div className="file-card">
          
          <ErrorBoundary FallbackComponent={SimpleErrorFallback}>
            <Suspense fallback={<FilePreviewLoader />}>
              <LazyFilePreview
                fileUrl={fileUrl}
                filename={filename}
                conversionType={conversionType}
                description={description}
                isImage={isImage}
              />
            </Suspense>
          </ErrorBoundary>

          <div className="file-content">
            <ErrorBoundary FallbackComponent={SimpleErrorFallback}>
              <Suspense fallback={<FileStatsLoader />}>
                <LazyFileStats
                  conversionType={conversionType}
                  expiry={expiry}
                  downloadCount={downloadCount}
                  maxDownloads={maxDownloads}
                  hasPassword={hasPassword}
                />
              </Suspense>
            </ErrorBoundary>

            <ErrorBoundary FallbackComponent={SimpleErrorFallback}>
              <Suspense fallback={<FileActionsLoader />}>
                <LazyFileActions
                  onDownload={handleDownload}
                  isDownloading={isDownloading}
                />
              </Suspense>
            </ErrorBoundary>

            <ErrorBoundary FallbackComponent={SimpleErrorFallback}>
              <Suspense fallback={<FileInfoLoader />}>
                <LazyFileInfo
                  createdAt={createdAt}
                  expiry={expiry}
                  hasPassword={hasPassword}
                />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}