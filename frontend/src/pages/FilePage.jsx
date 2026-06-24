import { useEffect, useState, useCallback, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { throttle } from "lodash";
import { useToast } from "../context/ToastContext";
import "../styles/FilePage.css";

import LoadingSpinner from "../components/file/LoadingSpinner";
import ErrorDisplay from "../components/file/ErrorDisplay";
import { LazyPasswordModal, LazyFilePreview, LazyFileStats, LazyFileActions, LazyFileInfo } from "../components/LazyComponents";
import { PageLoader } from "../components/SuspenseLoaders";

const API_URL = import.meta.env.VITE_API_URL;

export default function FilePage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const fetchFileInfo = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/file/${code}/info`);
      setFile(res.data);
    } catch (err) {
      if (err.response?.status === 404) setError("File not found or has been removed");
      else if (err.response?.status === 410) setError("File has expired");
      else setError("Failed to load file information");
    } finally {
      setLoading(false);
    }
  }, [code]);

  const downloadFile = useCallback((url) => {
    // The presigned URL already carries response-content-disposition with the
    // correct filename set by S3 — just open it directly. Fetching through JS
    // and re-creating a blob strips the MIME type and causes browsers to save
    // the file as .txt regardless of the actual content.
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const performDownload = useCallback(
    throttle(async (password = null) => {
      if (isDownloading) return;
      setIsDownloading(true);
      try {
        const res = await axios.post(`${API_URL}/api/file/${code}`, password ? { password } : {});
        await downloadFile(res.data.fileUrl);
        showToast("Download started!", "success");
        setFile(prev => ({ ...prev, downloadCount: res.data.downloadCount }));
      } catch (err) {
        if (err.response?.status === 401) {
          setRequiresPassword(true);
          showToast("Invalid password", "error");
        } else if (err.response?.status === 403) {
          showToast("Download limit reached", "error");
        } else if (err.response?.status === 404 || err.response?.status === 410) {
          showToast("File no longer available", "error");
          navigate("/");
        } else {
          showToast("Download failed. Please try again.", "error");
        }
      } finally {
        setIsDownloading(false);
      }
    }, 2000),
    [code, isDownloading, downloadFile, showToast, navigate]
  );

  const handleDownload = useCallback(() => {
    if (!file || isDownloading) return;
    if (file.hasPassword) { setRequiresPassword(true); return; }
    performDownload();
  }, [file, isDownloading, performDownload]);

  const handlePasswordSubmit = useCallback((password) => {
    performDownload(password.trim());
    setRequiresPassword(false);
  }, [performDownload]);

  useEffect(() => {
    if (code) fetchFileInfo();
  }, [code, fetchFileInfo]);

  if (loading) return <LoadingSpinner />;
  if (error || !file) return <ErrorDisplay error={error} onGoHome={() => navigate("/")} />;

  const { fileUrl = "", conversionType = "", expiry = null, description = "", hasPassword = false, downloadCount = 0, maxDownloads = null, createdAt = null } = file;
  const filename = file.originalFileName || "download";
  const isImage = conversionType?.startsWith("image->") || filename?.match(/\.(jpg|jpeg|png|gif|webp|bmp|avif)$/i);

  const isExpired = expiry && new Date() > new Date(expiry);
  const isLimitReached = maxDownloads && downloadCount >= maxDownloads;
  const cannotDownload = isExpired || isLimitReached;

  return (
    <div className="file-page">
      <Suspense fallback={null}>
        <LazyPasswordModal
          isOpen={requiresPassword}
          onSubmit={handlePasswordSubmit}
          onCancel={() => setRequiresPassword(false)}
          isLoading={isDownloading}
        />
      </Suspense>

      <div className="file-container">
        <div className="file-card">
          <Suspense fallback={<PageLoader />}>
            <LazyFilePreview fileUrl={fileUrl} filename={filename} conversionType={conversionType} description={description} isImage={isImage} hasPassword={hasPassword} code={code} />
          </Suspense>

          <div className="file-content">
            <Suspense fallback={null}>
              <LazyFileStats conversionType={conversionType} expiry={expiry} downloadCount={downloadCount} maxDownloads={maxDownloads} hasPassword={hasPassword} />
            </Suspense>
            <Suspense fallback={null}>
              <LazyFileActions onDownload={handleDownload} isDownloading={isDownloading} disabled={cannotDownload} />
            </Suspense>
            <Suspense fallback={null}>
              <LazyFileInfo createdAt={createdAt} expiry={expiry} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
