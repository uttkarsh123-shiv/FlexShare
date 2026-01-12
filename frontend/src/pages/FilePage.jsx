import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Download, Copy, Check, Share2, ArrowLeft, FileText, Image as ImageIcon, File, Clock, AlertCircle, Shield, Eye, EyeOff } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "../context/ToastContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function FilePage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Check if user is the sender (came from upload) or receiver (direct link)
  const [isSender, setIsSender] = useState(false);
  const [allowDetailedView, setAllowDetailedView] = useState(false);

  useEffect(() => {
    // Check if user came from upload (has uploadSuccess in sessionStorage)
    const uploadSuccess = sessionStorage.getItem('uploadSuccess');
    const uploadCode = sessionStorage.getItem('uploadCode');

    if (uploadSuccess && uploadCode === code) {
      setIsSender(true);
      // Clear the session storage after checking
      sessionStorage.removeItem('uploadSuccess');
      sessionStorage.removeItem('uploadCode');
    }
  }, [code]);

  const fetchFileInfo = async (markFirstView = false) => {
    try {
      setLoading(true);
      const url = `${API_URL}/api/file/${code}/info${markFirstView ? '?markFirstView=true' : ''}`;
      const res = await axios.get(url);
      setFile(res.data);
      setAllowDetailedView(!!res.data.allowDetailedView);
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
  };

  const fetchFileWithPassword = async () => {
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
      showToast(err.response?.data?.message || "Failed to load file", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code) {
      // If this visit is immediately after an upload (sender), ask server to
      // mark and allow the one-time detailed view. For all other visitors, do
      // not request marking and they will see the compact/card view.
      const uploadSuccess = sessionStorage.getItem('uploadSuccess');
      const uploadCode = sessionStorage.getItem('uploadCode');
      const mark = uploadSuccess && uploadCode === code;
      fetchFileInfo(mark);
    }
  }, [code]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password.trim()) {
      fetchFileWithPassword();
    } else {
      showToast("Please enter a password", "warning");
    }
  };

  const copyToClipboard = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      showToast("Link copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showToast("Failed to copy link", "error");
    }
  };

  const shareFile = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this file",
          text: `File code: ${code}`,
          url: url
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      copyToClipboard();
    }
  };

  const handleDownload = async () => {
    if (!file) return;

    setIsDownloading(true);
    showToast('Preparing download...', 'info');

    // Prefer using the available file URL returned by the info endpoint.
    // Avoid calling the POST endpoint which may cause server errors; this
    // keeps logic changes limited to the frontend download flow only.
    const downloadUrl = file.fileUrl;

    if (!downloadUrl) {
      showToast('No download URL available', 'error');
      setIsDownloading(false);
      return;
    }

    try {
      // Attempt blob download first (better UX). If CORS prevents it or
      // the file is large, fall back to opening in a new tab.
      const resp = await fetch(downloadUrl, { mode: 'cors' });
      if (!resp.ok) throw new Error('Network response not ok');
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalFileName || downloadUrl.split('/').pop().split('?')[0];
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast('Download completed!', 'success');
    } catch (err) {
      // Fallback: open the file URL in a new tab so browser handles download
      console.warn('Blob download failed, falling back to opening URL', err);
      try {
        window.open(downloadUrl, '_blank', 'noopener');
        showToast('Opened file in new tab. Use browser Save to download.', 'info');
      } catch (e) {
        showToast('Unable to open file for download', 'error');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const getFileIcon = (fileUrl, conversionType) => {
    if (conversionType?.startsWith("image->") || fileUrl?.match(/\.(jpg|jpeg|png|gif|webp|bmp|avif)$/i)) {
      return <ImageIcon className="w-8 h-8 text-orange-500" />;
    }
    if (conversionType?.includes("pdf") || fileUrl?.match(/\.pdf$/i)) {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    if (conversionType?.includes("word") || fileUrl?.match(/\.(doc|docx)$/i)) {
      return <FileText className="w-8 h-8 text-blue-500" />;
    }
    if (conversionType?.includes("excel") || fileUrl?.match(/\.(xls|xlsx|csv)$/i)) {
      return <File className="w-8 h-8 text-green-500" />;
    }
    if (conversionType?.includes("ppt") || fileUrl?.match(/\.(ppt|pptx)$/i)) {
      return <File className="w-8 h-8 text-purple-500" />;
    }
    return <File className="w-8 h-8 text-gray-400" />;
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c0a09] via-[#171717] to-[#0c0a09] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading file...</p>
        </div>
      </div>
    );
  }

  if (requiresPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c0a09] via-[#171717] to-[#0c0a09] flex items-center justify-center px-4">
        <div className="bg-[#171717] rounded-xl p-8 border border-[#383838] shadow-xl w-full max-w-md">
          <div className="text-center mb-6">
            <Shield className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Password Protected</h2>
            <p className="text-gray-400">This file requires a password to access</p>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full p-4 pr-12 rounded-lg bg-[#1a1a1a] border border-[#383838] focus:outline-none focus:border-orange-600 transition text-white placeholder-gray-500"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={!password.trim() || loading}
                className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition"
              >
                {loading ? "Verifying..." : "Access File"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-6 py-3 rounded-lg border border-[#383838] hover:border-orange-600 text-gray-400 hover:text-orange-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c0a09] via-[#171717] to-[#0c0a09] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">{error || "File not found"}</h2>
          <p className="text-gray-400 mb-6">
            {error === "File has expired"
              ? "This file has expired and is no longer available."
              : error === "Download limit reached"
              ? "This file has reached its maximum download limit."
              : "The file you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-lg text-white font-medium transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const { 
    fileUrl = '', 
    conversionType = '', 
    expiry = null, 
    description = '', 
    hasPassword = false, 
    downloadCount = 0, 
    maxDownloads = null, 
    createdAt = null 
  } = file || {};
  const showDetailed = allowDetailedView === true; // server explicitly allowed this request
  // For safety, if sender flagged in-session, prefer detailed view on first load
  const renderDetailed = isSender ? true : showDetailed;
  const filename = file.originalFileName || fileUrl?.split("/").pop().split("?")[0] || "Unknown file";
  const shareUrl = window.location.href;
  const isImage = fileUrl?.match(/\.(jpg|jpeg|png|gif|webp|bmp|avif)$/i) || conversionType?.startsWith("image->");

  // If not allowed detailed view, render a compact card UI instead
  if (!renderDetailed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c0a09] via-[#171717] to-[#0c0a09] text-[#e5e7eb] py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#171717] rounded-xl p-6 border border-[#383838] shadow-xl flex items-center gap-4">
            <div className="flex-shrink-0">
              {getFileIcon(file.fileUrl, conversionType)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white truncate">{filename}</h3>
              <p className="text-gray-400 text-sm mt-1">{conversionType?.replace('->', ' → ') || 'Original format'}</p>
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                <span className="text-orange-400">{getTimeRemaining(expiry)}</span>
                <span>{downloadCount || 0}{maxDownloads ? `/${maxDownloads}` : ''} downloads</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={handleDownload} className="bg-orange-600 px-4 py-2 rounded-lg text-white">Download</button>
              <button onClick={() => navigate('/')} className="px-4 py-2 rounded-lg border border-[#383838] text-gray-300">Back</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c0a09] via-[#171717] to-[#0c0a09] text-[#e5e7eb] py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-gray-400 hover:text-orange-400 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold">
              {isSender ? (
                <>Your File: <span className="text-orange-500 font-mono">{code}</span></>
              ) : (
                <>File: <span className="text-orange-500 font-mono">{code}</span></>
              )}
            </h1>
            <p className="text-gray-400 text-sm">
              {isSender ? "Share this link with others" : "Shared via FlexShare"}
            </p>
          </div>
          
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* File Preview Card */}
          <div className="lg:col-span-2 bg-[#171717] rounded-xl overflow-hidden border border-[#383838] shadow-xl">
            {/* Preview */}
            <div className="relative bg-[#0c0a09] aspect-video flex items-center justify-center overflow-hidden">
              {isImage ? (
                <img
                  src={fileUrl}
                  alt={filename}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-8">
                  {getFileIcon(fileUrl, conversionType)}
                  <p className="mt-4 text-gray-400 text-lg font-medium">{filename}</p>
                  <p className="text-gray-500 text-sm mt-2">
                    {conversionType?.replace("->", " → ") || "Original format"}
                  </p>
                </div>
              )}
              
              {/* File type badge */}
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white">
                {conversionType?.split("->")[1]?.toUpperCase() || "FILE"}
              </div>
            </div>

            {/* File Info */}
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 truncate">{filename}</h2>
                <p className="text-[#a8a29e] leading-relaxed">
                  {description || "No description provided"}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-[#383838]">
                <div className="text-center">
                  <div className="text-orange-400 font-bold text-lg">
                    {conversionType?.replace("->", " → ") || "None"}
                  </div>
                  <div className="text-gray-400 text-xs">Conversion</div>
                </div>
                <div className="text-center">
                  <div className="text-red-400 font-bold text-lg">
                    {getTimeRemaining(expiry)}
                  </div>
                  <div className="text-gray-400 text-xs">Time Left</div>
                </div>
                <div className="text-center">
                  <div className="text-blue-400 font-bold text-lg">
                    {downloadCount || 0}
                    {maxDownloads ? `/${maxDownloads}` : ""}
                  </div>
                  <div className="text-gray-400 text-xs">Downloads</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-bold text-lg">
                    {hasPassword ? "Yes" : "No"}
                  </div>
                  <div className="text-gray-400 text-xs">Protected</div>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-orange-700/50 flex items-center justify-center gap-2 px-6 py-4 rounded-lg text-white font-medium transition-all hover:scale-105 disabled:hover:scale-100 shadow-lg shadow-orange-600/20"
              >
                <Download className="w-5 h-5" />
                {isDownloading ? "Downloading..." : "Download File"}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Share Card - Only show for sender */}
            {isSender && (
              <div className="bg-[#171717] rounded-xl p-6 border border-[#383838] shadow-xl">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Share Your File
                </h3>
                
                {/* Share URL */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Share Link</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 px-3 py-2 bg-[#0c0a09] border border-[#383838] rounded-lg text-sm text-white focus:outline-none focus:border-orange-600"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="px-3 py-2 bg-[#383838] hover:bg-[#484848] rounded-lg transition flex items-center gap-1"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-sm">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span className="text-sm">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={shareFile}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-[#383838] hover:bg-[#484848] rounded-lg transition"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm">Share</span>
                  </button>
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-[#383838] hover:bg-[#484848] rounded-lg transition"
                  >
                    <QRCodeSVG value={shareUrl} size={16} />
                    <span className="text-sm">QR Code</span>
                  </button>
                </div>
              </div>
            )}

            {/* QR Code Display - Only show for sender */}
            {isSender && showQR && (
              <div className="bg-[#171717] rounded-xl p-6 border border-[#383838] shadow-xl">
                <h3 className="text-lg font-bold mb-4 text-center">Scan to Share</h3>
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <QRCodeSVG
                    value={shareUrl}
                    size={180}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-center text-sm text-gray-400 mt-4">
                  Share this QR code with others
                </p>
              </div>
            )}

            {/* File Info Card - Different content for sender vs receiver */}
            <div className="bg-[#171717] rounded-xl p-6 border border-[#383838] shadow-xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {isSender ? "File Management" : "File Information"}
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white">{formatDate(createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Expires:</span>
                  <span className="text-white">{formatDate(expiry)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time Left:</span>
                  <span className={`font-medium ${getTimeRemaining(expiry) === "Expired" ? "text-red-400" : "text-orange-400"}`}>
                    {getTimeRemaining(expiry)}
                  </span>
                </div>
                
                {/* Sender-specific info */}
                {isSender && (
                  <>
                    {maxDownloads && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Downloads:</span>
                        <span className="text-white">{downloadCount}/{maxDownloads}</span>
                      </div>
                    )}
                    {!maxDownloads && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Downloads:</span>
                        <span className="text-white">{downloadCount}</span>
                      </div>
                    )}
                  </>
                )}
                
                {hasPassword && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Protection:</span>
                    <span className="text-green-400 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Password Protected
                    </span>
                  </div>
                )}
              </div>
              
              {/* Sender-only actions */}
              {isSender && (
                <div className="mt-4 pt-4 border-t border-[#383838]">
                  <button
                    onClick={() => showToast("File management features coming soon!", "info")}
                    className="w-full px-4 py-2 bg-[#383838] hover:bg-[#484848] rounded-lg transition text-sm"
                  >
                    Manage File Settings
                  </button>
                </div>
              )}
            </div>

            {/* Receiver-only: Simple download info */}
            {!isSender && (
              <div className="bg-[#171717] rounded-xl p-6 border border-[#383838] shadow-xl">
                <h3 className="text-lg font-bold mb-4">About This File</h3>
                <div className="space-y-2 text-sm text-gray-400">
                  <p>• Files are automatically deleted after expiry</p>
                  <p>• Your download is secure and private</p>
                  <p>• No registration required</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
