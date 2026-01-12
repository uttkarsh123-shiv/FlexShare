import React, { useState, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { X, Upload, FileText, Image as ImageIcon, File, CheckCircle2, Loader2, Clock, Shield, Download, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import ThemeToggle from "../component/ThemeToggle";
import "../styles/upload-page.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [conversionType, setConversionType] = useState("");
  const [code, setCode] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [password, setPassword] = useState("");
  const [expiryHours, setExpiryHours] = useState(1);
  const [maxDownloads, setMaxDownloads] = useState("");
  const navigate = useNavigate();
  const { showToast } = useToast();

  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    
    if (!selectedFile) return;

    // File size validation (50MB max)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (selectedFile.size > maxSize) {
      showToast("File size exceeds 50MB limit", "error");
      return;
    }

    setFile(selectedFile);
    setCode("");
    setUploadProgress(0);
    setConversionType(""); // Reset conversion type when new file is selected

    // Always use card-style UI, no image preview
  }, [showToast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"],
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
      "application/vnd.ms-powerpoint": [".ppt"]
    },
    maxFiles: 1
  });

  const onRemove = () => {
    setFile(null);
    setCode("");
    setUploadProgress(0);
    setConversionType("");
    setDescription("");
    setPassword("");
    setExpiryHours(1);
    setMaxDownloads("");
    setStep(1);
  };

  const getFileIcon = () => {
    if (!file) return <Upload style={{ width: '48px', height: '48px', color: '#9ca3af' }} />;
    if (file.type.startsWith("image/")) return <ImageIcon style={{ width: '48px', height: '48px', color: '#f97316' }} />;
    if (file.type === "application/pdf") return <FileText style={{ width: '48px', height: '48px', color: '#ef4444' }} />;
    if (file.type.includes("word") || file.type.includes("document")) return <FileText style={{ width: '48px', height: '48px', color: '#3b82f6' }} />;
    if (file.type.includes("sheet") || file.type.includes("excel")) return <File style={{ width: '48px', height: '48px', color: '#22c55e' }} />;
    if (file.type.includes("presentation") || file.type.includes("powerpoint")) return <File style={{ width: '48px', height: '48px', color: '#a855f7' }} />;
    return <File style={{ width: '48px', height: '48px', color: '#3b82f6' }} />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const truncateFileName = (fileName, maxLength = 40) => {
    if (fileName.length <= maxLength) return fileName;
    
    const extension = fileName.split('.').pop();
    const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
    const maxNameLength = maxLength - extension.length - 4; // 4 for "..." and "."
    
    if (maxNameLength <= 0) return fileName.substring(0, maxLength - 3) + "...";
    
    return nameWithoutExt.substring(0, maxNameLength) + "..." + "." + extension;
  };

  const handlePublish = async () => {
    if (isUploading) return;

    // Check if conversion is required and selected
    if (availableConversions.length > 0 && !conversionType) {
      showToast("Please select a conversion type", "warning");
      return;
    }

    if (!file) {
      showToast("Please select a file", "warning");
      return;
    }

    // Validate password if provided
    if (password.trim() && password.trim().length < 4) {
      showToast("Password must be at least 4 characters long", "error");
      return;
    }

    // Validate maxDownloads if provided
    if (maxDownloads && maxDownloads.trim()) {
      const downloadLimit = parseInt(maxDownloads.trim(), 10);
      if (isNaN(downloadLimit) || downloadLimit < 1 || downloadLimit > 100) {
        showToast("Download limit must be between 1 and 100", "error");
        return;
      }
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("conversionType", conversionType || "none");
    formData.append("description", description || "");
    
    // Always send expiryHours
    formData.append("expiryHours", expiryHours.toString());
    
    // Only send password if it's provided and valid
    if (password.trim() && password.trim().length >= 4) {
      formData.append("password", password.trim());
    }
    
    // Only send maxDownloads if it's provided and valid
    if (maxDownloads && maxDownloads.trim()) {
      const downloadLimit = parseInt(maxDownloads.trim(), 10);
      if (!isNaN(downloadLimit) && downloadLimit >= 1 && downloadLimit <= 100) {
        formData.append("maxDownloads", downloadLimit.toString());
      }
    }

    try {
      const res = await axios.post(`${API_URL}/api/uploads`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
        timeout: 300000 // 5 minutes timeout for large files
      });

      setCode(res.data.code);
      showToast(res.data.message || "File uploaded successfully!", "success");
      
      // Mark user as sender for the FilePage
      sessionStorage.setItem('uploadSuccess', 'true');
      sessionStorage.setItem('uploadCode', res.data.code);
      
      // File work completed - no auto-redirect
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err.response?.data?.message || err.response?.data?.errors || err.message || "Upload failed";
      showToast(errorMessage, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const getAvailableConversions = (file) => {
    if (!file) return [];
    
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    
    // Image conversions
    if (fileType.startsWith('image/')) {
      return [
        { label: "Image → PNG", value: "image->png", icon: "🖼️", category: "Image" },
        { label: "Image → JPG", value: "image->jpg", icon: "🖼️", category: "Image" },
        { label: "Image → JPEG", value: "image->jpeg", icon: "🖼️", category: "Image" },
        { label: "Image → WebP", value: "image->webp", icon: "🖼️", category: "Image" },
        { label: "Image → GIF", value: "image->gif", icon: "🖼️", category: "Image" },
        { label: "Image → BMP", value: "image->bmp", icon: "🖼️", category: "Image" },
        { label: "Image → AVIF", value: "image->avif", icon: "🖼️", category: "Image" },
        { label: "Image → PDF", value: "image->pdf", icon: "📄", category: "Document" }
      ];
    }
    
    // PDF conversions
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return [
        { label: "PDF → Word", value: "pdf->word", icon: "�", category: "Document" },
        { label: "PDF → Text", value: "pdf->txt", icon: "�", category: "Document" },
        { label: "PDF → Images", value: "pdf->images", icon: "🖼️", category: "Image" }
      ];
    }
    
    // Word document conversions
    if (fileType.includes('word') || fileType.includes('document') || 
        fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      return [
        { label: "Word → PDF", value: "word->pdf", icon: "📄", category: "Document" },
        { label: "Word → Text", value: "word->txt", icon: "📄", category: "Document" }
      ];
    }
    
    // Excel conversions
    if (fileType.includes('sheet') || fileType.includes('excel') || 
        fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
      return [
        { label: "Excel → PDF", value: "excel->pdf", icon: "�", category: "Spreadsheet" },
        { label: "Excel → CSV", value: "excel->csv", icon: "📊", category: "Spreadsheet" }
      ];
    }
    
    // PowerPoint conversions
    if (fileType.includes('presentation') || fileType.includes('powerpoint') || 
        fileName.endsWith('.ppt') || fileName.endsWith('.pptx')) {
      return [
        { label: "PowerPoint → PDF", value: "ppt->pdf", icon: "📊", category: "Presentation" }
      ];
    }
    
    // Default - no conversions available
    return [];
  };

  const availableConversions = getAvailableConversions(file);
  const groupedOptions = availableConversions.reduce((acc, option) => {
    if (!acc[option.category]) {
      acc[option.category] = [];
    }
    acc[option.category].push(option);
    return acc;
  }, {});

  return (
    <div className="upload-page">
      {/* Theme Toggle */}
      <ThemeToggle />
      
      <div className="upload-container">
        {/* Header */}
        <div className="upload-header">
          <h1 className="upload-title">
            Upload & <span className="upload-title-accent">Convert</span>
          </h1>
          <p className="upload-subtitle">
            Upload your file, choose conversion format, and share instantly. <br/> Files are automatically deleted after expiry.
          </p>
        </div>

        {/* Step Indicators */}
        <div className="step-indicators">
          {[
            { num: 1, label: "Upload" },
            { num: 2, label: "Configure" },
            { num: 3, label: "Convert" }
          ].map((s) => (
            <div key={s.num} className={`step-indicator-item ${step >= s.num ? 'active' : ''}`}>
              <div className="step-indicator-content">
                <div
                  className={`step-indicator-circle ${
                    step >= s.num
                      ? "step-indicator-active"
                      : "step-indicator-inactive"
                  }`}
                >
                  {step > s.num ? <CheckCircle2 className="step-indicator-check" /> : s.num}
                </div>
                <span className="step-indicator-label">{s.label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="upload-step-1">
            <div
              {...getRootProps()}
              className={`file-dropzone ${
                isDragActive ? "file-dropzone-active" : ""
              }`}
            >
              <input {...getInputProps()} />
              <div className="file-dropzone-content">
                {file ? (
                  <div className="file-preview-card">
                    <div className="file-icon">{getFileIcon()}</div>
                    <div className="file-info">
                      <p title={file.name}>{truncateFileName(file.name)}</p>
                      <p>{formatFileSize(file.size)}</p>
                      <p>{file.type}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                      }}
                      className="file-remove-btn"
                    >
                      <X style={{ width: '20px', height: '20px' }} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div>{getFileIcon()}</div>
                    <div>
                      <p>
                        {isDragActive ? "Drop your file here" : "Upload file"}
                      </p>
                      <p>
                        Drag & drop or click to browse
                      </p>
                      <p>
                        Supports: Images, PDF, Word, Excel, PowerPoint (Max 50MB)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Next Button - Always visible */}
            <div className="upload-step-1-navigation">
              <button
                onClick={() => setStep(2)}
                disabled={!file}
                className="upload-step-1-next-btn"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Configure */}
        {step === 2 && (
          <div className="upload-step-2">
            {/* Description */}
            <div className="description-section">
              <label className="description-label">
                <FileText style={{ width: '16px', height: '16px' }} />
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Describe your file or add notes..."
                className="description-input"
              />
              <p className="description-counter">
                <span>Help others understand what this file contains</span>
                <span>{description.length}/500</span>
              </p>
            </div>

            {/* Advanced Settings */}
            <div className="advanced-settings">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="advanced-settings-header"
              >
                <div>
                  <Settings style={{ width: '20px', height: '20px' }} />
                  <span>Advanced Settings</span>
                </div>
                <svg
                  className={showAdvanced ? "rotate-180" : ""}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showAdvanced && (
                <div className="advanced-settings-content">
                  {/* Password Protection */}
                  <div className="password-section">
                    <label className="password-label">
                      <Shield style={{ width: '16px', height: '16px' }} />
                      Password Protection
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password (min 4 characters)"
                      className="password-input"
                    />
                    <p>Leave empty for no password protection. Minimum 4 characters required.</p>
                  </div>

                  {/* Expiry Time */}
                  <div className="expiry-section">
                    <label className="expiry-label">
                      <Clock style={{ width: '16px', height: '16px' }} />
                      Expiry Time
                    </label>
                    <select
                      value={expiryHours}
                      onChange={(e) => setExpiryHours(Number(e.target.value))}
                      className="expiry-select"
                    >
                      <option value={1}>1 Hour</option>
                      <option value={6}>6 Hours</option>
                      <option value={12}>12 Hours</option>
                      <option value={24}>1 Day</option>
                      <option value={72}>3 Days</option>
                      <option value={168}>1 Week</option>
                    </select>
                  </div>

                  {/* Download Limit */}
                  <div className="download-limit-section">
                    <label className="download-limit-label">
                      <Download style={{ width: '16px', height: '16px' }} />
                      Download Limit
                    </label>
                    <input
                      type="number"
                      value={maxDownloads}
                      onChange={(e) => setMaxDownloads(e.target.value)}
                      placeholder="Unlimited"
                      min="1"
                      max="100"
                      className="download-limit-input"
                    />
                    <p>Leave empty for unlimited downloads (1-100 allowed)</p>
                  </div>
                </div>
              )}
            </div>

            <div className="step-navigation">
              <button
                onClick={() => setStep(1)}
                className="step-back-btn"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="step-next-btn"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Conversion & Submit */}
        {step === 3 && (
          <div className="upload-step-3">
            <div className="conversion-section">
              <label className="conversion-label">
                Select Conversion Type
              </label>
              <div className="conversion-dropdown">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="conversion-dropdown-btn"
                >
                  <span>
                    {conversionType
                      ? availableConversions.find((opt) => opt.value === conversionType)?.label
                      : availableConversions.length > 0 
                        ? "Select conversion type"
                        : "No conversions available for this file type"}
                  </span>
                  {availableConversions.length > 0 && (
                    <svg
                      className={showDropdown ? "rotate-180" : ""}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </button>

                {showDropdown && availableConversions.length > 0 && (
                  <>
                    <div
                      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}
                      onClick={() => setShowDropdown(false)}
                    />
                    <div className="conversion-dropdown-menu">
                      {Object.entries(groupedOptions).map(([category, options]) => (
                        <div key={category}>
                          <div className="conversion-category">
                            {category}
                          </div>
                          {options.map((option) => (
                            <div
                              key={option.value}
                              onClick={() => {
                                setConversionType(option.value);
                                setShowDropdown(false);
                              }}
                              className={`conversion-option ${
                                conversionType === option.value
                                  ? "conversion-option-active"
                                  : ""
                              }`}
                            >
                              <span>{option.icon}</span>
                              <span>{option.label}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="upload-progress">
                <div>
                  <span>
                    <Loader2 style={{ animation: 'spin 1s linear infinite', width: '16px', height: '16px' }} />
                    Processing your file...
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="upload-progress-bar">
                  <div
                    className="upload-progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p>
                  Converting {conversionType?.replace("->", " to ")} format...
                </p>
              </div>
            )}

            {/* Success Message */}
            {code && (
              <div className="upload-success">
                <CheckCircle2 className="upload-success-icon" />
                <div className="upload-success-content">
                  <p>🎉 File Upload Complete!</p>
                  <p>
                    Your file code is: <span>{code}</span>
                  </p>
                  <p>
                    Share this code or use the link below to access your file.
                  </p>
                  <div className="upload-success-actions">
                    <button
                      onClick={() => navigate(`/file/${code}`)}
                      className="upload-success-view-btn"
                    >
                      View File
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/file/${code}`);
                        showToast("Link copied to clipboard!", "success");
                      }}
                      className="upload-success-copy-btn"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                onClick={() => setStep(2)}
              >
                ← Back
              </button>

              <button
                onClick={handlePublish}
                disabled={isUploading || (availableConversions.length > 0 && !conversionType) || code}
                className={`upload-submit-btn ${
                  isUploading ? "upload-submit-btn-loading" : ""
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 style={{ animation: 'spin 1s linear infinite', width: '20px', height: '20px' }} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Upload style={{ width: '20px', height: '20px' }} />
                    <span>{availableConversions.length > 0 ? "Convert & Share" : "Upload & Share"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}