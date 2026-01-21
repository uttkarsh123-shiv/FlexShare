import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Download, Copy, Check, Share2, ArrowLeft, FileText, Image as ImageIcon, File, Clock, AlertCircle, Shield, Eye, EyeOff } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useToast } from "../context/ToastContext";

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
  
  // Rate limiting for API calls
  const [lastApiCall, setLastApiCall] = useState(0);
  const [apiCallCount, setApiCallCount] = useState(0);
  const [manageButtonDisabled, setManageButtonDisabled] = useState(false);
  const API_RATE_LIMIT = 2; // Max 2 calls per minute
  const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds

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
    // Rate limiting check
    const now = Date.now();
    
    // Reset counter if window has passed
    if (now - lastApiCall > RATE_LIMIT_WINDOW) {
      setApiCallCount(0);
    }
    
    // Check if rate limit exceeded
    if (apiCallCount >= API_RATE_LIMIT && now - lastApiCall <= RATE_LIMIT_WINDOW) {
      const timeRemaining = Math.ceil((RATE_LIMIT_WINDOW - (now - lastApiCall)) / 1000);
      showToast(`Rate limit exceeded. Please wait ${timeRemaining} seconds before trying again.`, "warning");
      return;
    }
    
    try {
      setLoading(true);
      const url = `${API_URL}/api/file/${code}/info${markFirstView ? '?markFirstView=true' : ''}`;
      const res = await axios.get(url);
      setFile(res.data);
      setAllowDetailedView(!!res.data.allowDetailedView);
      setError(null);
      setRequiresPassword(false);
      
      // Update rate limiting counters
      setLastApiCall(now);
      setApiCallCount(prev => prev + 1);
      
    } catch (err) {
      // Handle server-side rate limiting
      if (err.response?.status === 429) {
        const retryAfter = err.response.data?.retryAfter || 60;
        showToast(`Server rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`, "error");
        setError("Rate limit exceeded");
        return;
      }
      
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
    // Rate limiting check
    const now = Date.now();
    
    // Reset counter if window has passed
    if (now - lastApiCall > RATE_LIMIT_WINDOW) {
      setApiCallCount(0);
    }
    
    // Check if rate limit exceeded
    if (apiCallCount >= API_RATE_LIMIT && now - lastApiCall <= RATE_LIMIT_WINDOW) {
      const timeRemaining = Math.ceil((RATE_LIMIT_WINDOW - (now - lastApiCall)) / 1000);
      showToast(`Rate limit exceeded. Please wait ${timeRemaining} seconds before trying again.`, "warning");
      return;
    }
    
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/file/${code}`, {
        password: password
      });
      setFile(res.data);
      setError(null);
      setRequiresPassword(false);
      
      // Update rate limiting counters
      setLastApiCall(now);
      setApiCallCount(prev => prev + 1);
      
    } catch (err) {
      // Handle server-side rate limiting
      if (err.response?.status === 429) {
        const retryAfter = err.response.data?.retryAfter || 60;
        showToast(`Server rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`, "error");
        return;
      }
      
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
      // Always show compact card view by default (old UI)
      // Only show detailed view if explicitly requested
      const forceDetailed = new URLSearchParams(window.location.search).get('detailed') === 'true';
      const uploadSuccess = sessionStorage.getItem('uploadSuccess');
      const uploadCode = sessionStorage.getItem('uploadCode');
      
      // Only mark as first view (detailed) if explicitly requested or uploader's first visit
      const mark = forceDetailed || (uploadSuccess && uploadCode === code);
      
      // Add a small delay to prevent rapid successive calls
      const timeoutId = setTimeout(() => {
        fetchFileInfo(mark);
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [code]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      showToast("Please enter a password", "warning");
      return;
    }

    // Check if this is for download or initial file access
    if (file && file.fileUrl) {
      // File info already loaded, this is for download
      await performDownload(password.trim());
      if (!isDownloading) {
        // Download was successful, close password modal
        setRequiresPassword(false);
        setPassword("");
      }
    } else {
      // Initial file access
      fetchFileWithPassword();
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
    if (!file) {
      showToast('No file information available', 'error');
      return;
    }

    // If file has password protection, show password modal first
    if (file.hasPassword) {
      setRequiresPassword(true);
      return;
    }

    // For non-password protected files, proceed with download
    await performDownload();
  };

  const performDownload = async (downloadPassword = null) => {
    setIsDownloading(true);
    showToast('Preparing download...', 'info');

    try {
      // Make request to backend to get authenticated download URL
      const requestBody = downloadPassword ? { password: downloadPassword } : {};
      
      const response = await axios.post(`${API_URL}/api/file/${code}`, requestBody);
      
      if (response.data && response.data.fileUrl) {
        // Create a temporary link to trigger download
        const link = document.createElement('a');
        link.href = response.data.fileUrl;
        link.download = response.data.originalFileName || 'download';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        // Add to DOM, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Download started!', 'success');
        
        // Update download count in UI
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
        return; // Keep password modal open
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

  const handleManageFileSettings = () => {
    // Check rate limiting
    const now = Date.now();
    
    // Reset counter if window has passed
    if (now - lastApiCall > RATE_LIMIT_WINDOW) {
      setApiCallCount(0);
    }
    
    // Check if rate limit exceeded
    if (apiCallCount >= API_RATE_LIMIT && now - lastApiCall <= RATE_LIMIT_WINDOW) {
      const timeRemaining = Math.ceil((RATE_LIMIT_WINDOW - (now - lastApiCall)) / 1000);
      showToast(`Rate limit exceeded. Please wait ${timeRemaining} seconds before trying again.`, "warning");
      return;
    }
    
    // Disable button temporarily to prevent rapid clicks
    setManageButtonDisabled(true);
    
    // Update rate limiting counters
    setLastApiCall(now);
    setApiCallCount(prev => prev + 1);
    
    // Show the message
    showToast("File management features coming soon!", "info");
    
    // Re-enable button after 2 seconds
    setTimeout(() => {
      setManageButtonDisabled(false);
    }, 2000);
  };

  const getRateLimitStatus = () => {
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCall;
    
    if (timeSinceLastCall > RATE_LIMIT_WINDOW) {
      return { remaining: API_RATE_LIMIT, resetTime: 0 };
    }
    
    const remaining = Math.max(0, API_RATE_LIMIT - apiCallCount);
    const resetTime = Math.ceil((RATE_LIMIT_WINDOW - timeSinceLastCall) / 1000);
    
    return { remaining, resetTime };
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
    const isForDownload = file && file.fileUrl; // If we have file info, this is for download
    
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center px-4 z-50 animate-in fade-in duration-300">
        <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl w-full max-w-lg transform animate-in zoom-in-95 duration-300">
          {/* Content */}
          <div className="text-center">
            {/* Header */}
            <h2 className="text-4xl font-bold text-white mb-4">
              {isForDownload ? "Enter Password" : "Enter File Code"}
            </h2>
            
            <p className="text-gray-400 text-lg mb-8">
              {isForDownload 
                ? "Enter the password to download this file" 
                : "Enter the 6-character code to access your file"
              }
            </p>
            
            {/* Password Input Boxes */}
            <form onSubmit={handlePasswordSubmit} className="space-y-8">
              <div className="flex justify-center gap-3">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    type={showPassword ? "text" : "password"}
                    maxLength="1"
                    value={password[index] || ''}
                    onChange={(e) => {
                      const newPassword = password.split('');
                      newPassword[index] = e.target.value.toUpperCase();
                      const updatedPassword = newPassword.join('');
                      setPassword(updatedPassword);
                      
                      // Auto-focus next input
                      if (e.target.value && index < 5) {
                        const nextInput = e.target.parentElement.children[index + 1];
                        if (nextInput) nextInput.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      // Handle backspace to go to previous input
                      if (e.key === 'Backspace' && !password[index] && index > 0) {
                        const prevInput = e.target.parentElement.children[index - 1];
                        if (prevInput) prevInput.focus();
                      }
                    }}
                    className="w-16 h-16 text-center text-2xl font-bold bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:border-blue-500 focus:bg-gray-700/50 transition-all duration-200 focus:outline-none"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              
              {/* Show/Hide Password Toggle */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPassword ? "Hide" : "Show"} characters
                </button>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={password.length < 6 || loading || isDownloading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
                >
                  {loading || isDownloading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    isForDownload ? "Download File" : "Access File"
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setRequiresPassword(false);
                    setPassword("");
                    if (!isForDownload) {
                      navigate("/");
                    }
                  }}
                  className="px-8 py-4 rounded-2xl border border-gray-600 hover:border-gray-500 hover:bg-gray-800/50 text-gray-300 hover:text-white font-semibold text-lg transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
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
  // Default to compact view (old UI), only show detailed if explicitly allowed
  const renderDetailed = showDetailed;
  
  const filename = file.originalFileName || fileUrl?.split("/").pop().split("?")[0] || "Unknown file";
  const shareUrl = window.location.href;
  const isImage = fileUrl?.match(/\.(jpg|jpeg|png|gif|webp|bmp|avif)$/i) || conversionType?.startsWith("image->");

  // If not allowed detailed view, render a compact card UI instead
  if (!renderDetailed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c0a09] via-[#171717] to-[#0c0a09] text-[#e5e7eb] py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              File: <span className="text-orange-500 font-mono">{code}</span>
            </h1>
            <p className="text-gray-400">Shared via FlexShare</p>
          </div>

          {/* Main File Card */}
          <div className="bg-[#171717]/80 backdrop-blur-xl rounded-2xl border border-[#383838]/50 shadow-2xl overflow-hidden">
            {/* File Preview/Icon Section */}
            <div className="relative bg-gradient-to-br from-[#0c0a09] to-[#1a1a1a] p-12 flex items-center justify-center min-h-[300px]">
              {isImage ? (
                <img
                  src={file.fileUrl}
                  alt={filename}
                  className="max-w-full max-h-[400px] object-contain rounded-lg shadow-2xl"
                />
              ) : (
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 mb-6">
                    {getFileIcon(file.fileUrl, conversionType)}
                  </div>
                  <div className="max-w-2xl">
                    <h2 className="text-2xl font-bold text-white mb-2 break-words px-4">
                      {filename}
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {conversionType?.replace('->', ' → ') || 'Original format'}
                    </p>
                  </div>
                </div>
              )}
              
              {/* File type badge */}
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-white border border-white/10">
                {(() => {
                  if (conversionType && conversionType.includes('->')) {
                    return conversionType.split('->')[1]?.toUpperCase() || 'FILE';
                  }
                  // Fallback: detect from filename
                  const ext = filename.split('.').pop()?.toUpperCase();
                  return ext || 'FILE';
                })()}
              </div>
            </div>

            {/* File Info Section */}
            <div className="p-8 space-y-6">
              {/* Filename - Always visible, wrapped properly */}
              {isImage && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2 break-words">
                    {filename}
                  </h2>
                  <p className="text-gray-400">
                    {conversionType?.replace('->', ' → ') || 'Original format'}
                  </p>
                </div>
              )}

              {/* Description if available */}
              {description && (
                <div className="pt-4 border-t border-[#383838]">
                  <p className="text-gray-300 leading-relaxed">{description}</p>
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="bg-[#0c0a09]/50 rounded-xl p-4 text-center border border-[#383838]/30">
                  <div className="text-orange-400 font-bold text-lg mb-1">
                    {conversionType?.replace("->", " → ") || "None"}
                  </div>
                  <div className="text-gray-400 text-xs">Conversion</div>
                </div>
                <div className="bg-[#0c0a09]/50 rounded-xl p-4 text-center border border-[#383838]/30">
                  <div className="text-red-400 font-bold text-lg mb-1">
                    {getTimeRemaining(expiry)}
                  </div>
                  <div className="text-gray-400 text-xs">Time Left</div>
                </div>
                <div className="bg-[#0c0a09]/50 rounded-xl p-4 text-center border border-[#383838]/30">
                  <div className="text-blue-400 font-bold text-lg mb-1">
                    {downloadCount || 0}
                    {maxDownloads ? `/${maxDownloads}` : ""}
                  </div>
                  <div className="text-gray-400 text-xs">Downloads</div>
                </div>
                <div className="bg-[#0c0a09]/50 rounded-xl p-4 text-center border border-[#383838]/30">
                  <div className="text-green-400 font-bold text-lg mb-1">
                    {hasPassword ? "Yes" : "No"}
                  </div>
                  <div className="text-gray-400 text-xs">Protected</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:from-gray-700 disabled:to-gray-800 flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-white font-semibold transition-all hover:scale-105 disabled:hover:scale-100 shadow-lg shadow-orange-600/30 disabled:shadow-none"
                >
                  <Download className="w-5 h-5" />
                  {isDownloading ? "Downloading..." : "Download File"}
                </button>
                <button
                  onClick={() => {
                    // Check rate limiting before navigating
                    const now = Date.now();
                    if (apiCallCount >= API_RATE_LIMIT && now - lastApiCall <= RATE_LIMIT_WINDOW) {
                      const timeRemaining = Math.ceil((RATE_LIMIT_WINDOW - (now - lastApiCall)) / 1000);
                      showToast(`Rate limit exceeded. Please wait ${timeRemaining} seconds before trying again.`, "warning");
                      return;
                    }
                    
                    const currentUrl = new URL(window.location);
                    currentUrl.searchParams.set('detailed', 'true');
                    window.location.href = currentUrl.toString();
                  }}
                  className="px-8 py-4 rounded-xl border-2 border-[#383838] hover:border-orange-600 text-gray-300 hover:text-orange-400 font-semibold transition-all hover:scale-105 bg-[#0c0a09]/30"
                >
                  View Details
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-8 py-4 rounded-xl border-2 border-[#383838] hover:border-orange-600 text-gray-300 hover:text-orange-400 font-semibold transition-all hover:scale-105 bg-[#0c0a09]/30"
                >
                  Back to Home
                </button>
              </div>

              {/* Info Footer */}
              <div className="pt-6 border-t border-[#383838] space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Created: {formatDate(createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Expires: {formatDate(expiry)}</span>
                </div>
                {hasPassword && (
                  <div className="flex items-center gap-2 text-green-400">
                    <Shield className="w-4 h-4" />
                    <span>This file is password protected</span>
                  </div>
                )}
              </div>
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
                {(() => {
                  if (conversionType && conversionType.includes('->')) {
                    return conversionType.split('->')[1]?.toUpperCase() || 'FILE';
                  }
                  // Fallback: detect from filename
                  const ext = filename.split('.').pop()?.toUpperCase();
                  return ext || 'FILE';
                })()}
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
                    onClick={handleManageFileSettings}
                    disabled={manageButtonDisabled}
                    className="w-full px-4 py-2 bg-[#383838] hover:bg-[#484848] disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition text-sm"
                  >
                    {manageButtonDisabled ? "Please wait..." : "Manage File Settings"}
                  </button>
                  
                  {/* Rate limit indicator */}
                  {(() => {
                    const { remaining, resetTime } = getRateLimitStatus();
                    if (remaining < API_RATE_LIMIT || resetTime > 0) {
                      return (
                        <div className="mt-2 text-xs text-gray-500 text-center">
                          {remaining === 0 ? (
                            <span className="text-orange-400">
                              Rate limit reached. Reset in {resetTime}s
                            </span>
                          ) : (
                            <span>
                              {remaining}/{API_RATE_LIMIT} requests remaining
                            </span>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}
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
