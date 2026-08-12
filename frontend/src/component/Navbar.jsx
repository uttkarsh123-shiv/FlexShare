import { useState, useCallback, useEffect, useRef } from "react";
import { Github, Upload, Search, X, CheckCircle2, Loader2, Copy,
  FileText, Image as ImageIcon, File, Clock, Shield, Download, Settings,
  FileImage, FileType2, FileSpreadsheet, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import OtpInput from "react-otp-input";
import axios from "axios";
import { throttle } from "lodash";
import { useToast } from "../context/ToastContext";
import "../styles/navbar.css";

const API_URL = import.meta.env.VITE_API_URL;

const formatFileSize = (bytes) => {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const truncateFileName = (name, max = 38) => {
  if (name.length <= max) return name;
  const ext = name.split(".").pop();
  const base = name.substring(0, name.lastIndexOf("."));
  const trim = max - ext.length - 4;
  if (trim <= 0) return name.substring(0, max - 3) + "...";
  return base.substring(0, trim) + "..." + "." + ext;
};

const getAvailableConversions = (file) => {
  if (!file) return [];
  const t = file.type;
  const n = file.name.toLowerCase();
  const list = [
    { label: "No Conversion (Share Original)", value: "none", icon: File, color: "#94a3b8", category: "Original" },
  ];
  if (t.startsWith("image/")) {
    list.push(
      { label: "Image → PNG",  value: "image->png",  icon: FileImage, color: "#fb923c", category: "Image" },
      { label: "Image → JPG",  value: "image->jpg",  icon: FileImage, color: "#fb923c", category: "Image" },
      { label: "Image → JPEG", value: "image->jpeg", icon: FileImage, color: "#fb923c", category: "Image" },
      { label: "Image → WebP", value: "image->webp", icon: FileImage, color: "#fb923c", category: "Image" },
      { label: "Image → GIF",  value: "image->gif",  icon: FileImage, color: "#fb923c", category: "Image" },
      { label: "Image → BMP",  value: "image->bmp",  icon: FileImage, color: "#fb923c", category: "Image" },
      { label: "Image → AVIF", value: "image->avif", icon: FileImage, color: "#fb923c", category: "Image" },
      { label: "Image → PDF",  value: "image->pdf",  icon: FileText,  color: "#f87171", category: "Document" }
    );
  }
  if (t === "application/pdf" || n.endsWith(".pdf")) {
    list.push(
      { label: "PDF → Word", value: "pdf->word", icon: FileType2, color: "#60a5fa", category: "Document" },
      { label: "PDF → Text", value: "pdf->txt",  icon: FileText,  color: "#94a3b8", category: "Document" }
    );
  }
  if (t.includes("word") || t.includes("wordprocessingml") || n.endsWith(".doc") || n.endsWith(".docx")) {
    list.push(
      { label: "Word → PDF",  value: "word->pdf", icon: FileText, color: "#f87171", category: "Document" },
      { label: "Word → Text", value: "word->txt", icon: FileText, color: "#94a3b8", category: "Document" }
    );
  }
  if (t.includes("sheet") || t.includes("excel") || n.endsWith(".xls") || n.endsWith(".xlsx")) {
    list.push(
      { label: "Excel → PDF", value: "excel->pdf", icon: FileSpreadsheet, color: "#34d399", category: "Spreadsheet" },
      { label: "Excel → CSV", value: "excel->csv", icon: FileSpreadsheet, color: "#34d399", category: "Spreadsheet" }
    );
  }
  if (t.includes("presentation") || t.includes("powerpoint") || n.endsWith(".ppt") || n.endsWith(".pptx")) {
    list.push(
      { label: "PowerPoint → PDF", value: "ppt->pdf", icon: FileText, color: "#a78bfa", category: "Presentation" }
    );
  }
  return list;
};

const getFileIcon = (file) => {
  if (!file) return <Upload size={32} color="#a8a29e" />;
  if (file.type.startsWith("image/"))    return <ImageIcon size={32} color="#f97316" />;
  if (file.type === "application/pdf")   return <FileText  size={32} color="#ef4444" />;
  if (file.type.includes("word"))        return <FileText  size={32} color="#3b82f6" />;
  if (file.type.includes("sheet") || file.type.includes("excel")) return <File size={32} color="#22c55e" />;
  if (file.type.includes("presentation")) return <File size={32} color="#a855f7" />;
  return <File size={32} color="#3b82f6" />;
};

function UploadModal({ onClose }) {
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(1);
  const [conversionType, setConversionType] = useState("");
  const [code, setCode] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [description, setDescription] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [password, setPassword] = useState("");
  const [expiryHours, setExpiryHours] = useState(1);
  const [maxDownloads, setMaxDownloads] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const resetAll = () => {
    setFile(null); setStep(1); setConversionType(""); setCode("");
    setIsUploading(false); setUploadProgress(0); setDescription("");
    setShowAdvanced(false); setPassword(""); setExpiryHours(1);
    setMaxDownloads(""); setShowDropdown(false);
  };

  const onDrop = useCallback((acceptedFiles) => {
    const f = acceptedFiles[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { showToast("File size exceeds 10MB limit", "error"); return; }
    setFile(f); setCode(""); setUploadProgress(0); setConversionType("");
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
      "application/vnd.ms-powerpoint": [".ppt"],
    },
    maxFiles: 1,
  });

  const handleCopyCode = useCallback(
    throttle(() => { navigator.clipboard.writeText(code); showToast("Code copied!", "success"); }, 1000),
    [code, showToast]
  );
  const handleCopyLink = useCallback(
    throttle(() => { navigator.clipboard.writeText(`${window.location.origin}/file/${code}`); showToast("Link copied!", "success"); }, 1000),
    [code, showToast]
  );

  const availableConversions = getAvailableConversions(file);
  const groupedOptions = availableConversions.reduce((acc, opt) => {
    if (!acc[opt.category]) acc[opt.category] = [];
    acc[opt.category].push(opt);
    return acc;
  }, {});

  const handlePublish = useCallback(
    throttle(async () => {
      if (isUploading) return;
      if (!file) { showToast("Please select a file", "warning"); return; }
      if (availableConversions.length > 0 && !conversionType) {
        showToast("Please select a conversion type or 'No Conversion'", "warning"); return;
      }
      if (password.trim() && password.trim().length < 4) {
        showToast("Password must be at least 4 characters", "error"); return;
      }
      if (maxDownloads && maxDownloads.trim()) {
        const dl = parseInt(maxDownloads.trim(), 10);
        if (isNaN(dl) || dl < 1 || dl > 100) {
          showToast("Download limit must be between 1 and 100", "error"); return;
        }
      }
      setIsUploading(true); setUploadProgress(0);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("conversionType", conversionType || "none");
      formData.append("description", description || "");
      formData.append("expiryHours", expiryHours.toString());
      if (password.trim() && password.trim().length >= 4) formData.append("password", password.trim());
      if (maxDownloads && maxDownloads.trim()) {
        const dl = parseInt(maxDownloads.trim(), 10);
        if (!isNaN(dl) && dl >= 1 && dl <= 100) formData.append("maxDownloads", dl.toString());
      }
      try {
        const res = await axios.post(`${API_URL}/api/uploads`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total)),
          timeout: 300000,
        });
        if (res.data.status === "pending") {
          const pollCode = res.data.code;
          showToast("File uploaded! Converting...", "success");
          await new Promise((resolve, reject) => {
            const iv = setInterval(async () => {
              try {
                const sr = await axios.get(`${API_URL}/api/uploads/status/${pollCode}`);
                if (sr.data.status === "done") { clearInterval(iv); resolve(); }
                else if (sr.data.status === "failed") { clearInterval(iv); reject(new Error("Conversion failed")); }
              } catch (e) { clearInterval(iv); reject(e); }
            }, 2000);
          });
        }
        setCode(res.data.code);
        setShowDropdown(false);
        showToast("File ready!", "success");
        sessionStorage.setItem("uploadSuccess", "true");
        sessionStorage.setItem("uploadCode", res.data.code);
      } catch (err) {
        const msg = err.response?.data?.message || err.response?.data?.errors || err.message || "Upload failed";
        showToast(msg, "error");
      } finally {
        setIsUploading(false);
      }
    }, 3000),
    [isUploading, conversionType, file, password, maxDownloads, expiryHours, description, showToast, availableConversions]
  );

  const StepIndicators = () => (
    <div className="modal-step-indicators">
      {[{ num: 1, label: "Upload" }, { num: 2, label: "Configure" }, { num: 3, label: "Convert" }].map((s, idx, arr) => (
        <div key={s.num} className="modal-step-item">
          <div className="modal-step-content">
            <div className={`modal-step-circle ${step >= s.num ? "active" : "inactive"}`}>
              {step > s.num ? <CheckCircle2 size={13} /> : s.num}
            </div>
            <span className="modal-step-label">{s.label}</span>
          </div>
          {idx < arr.length - 1 && <div className="modal-step-connector" />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}><X size={14} /></button>
        <div className="upload-modal-inner">
          <div className="upload-modal-header">
            <h2 className="upload-modal-title">Upload &amp; Convert</h2>
            <p className="upload-modal-subtitle">Upload your file, choose a format, and share instantly.</p>
          </div>
          <StepIndicators />

          {/* ── Step 1: Upload ── */}
          {step === 1 && (
            <>
              {file ? (
                <div className="modal-file-preview">
                  {getFileIcon(file)}
                  <div className="modal-file-info">
                    <p className="modal-file-name" title={file.name}>{truncateFileName(file.name)}</p>
                    <p className="modal-file-meta">{formatFileSize(file.size)} · {file.type || "unknown"}</p>
                  </div>
                  <button className="modal-file-remove" onClick={() => { setFile(null); setConversionType(""); }}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div {...getRootProps()} className={`modal-dropzone${isDragActive ? " active" : ""}`}>
                  <input {...getInputProps()} />
                  <Upload size={32} className="modal-dropzone-icon" />
                  <p><strong>{isDragActive ? "Drop your file here" : "Click to browse or drag & drop"}</strong></p>
                  <p>Supports Images, PDF, Word, Excel, PowerPoint</p>
                  <small>Max 10MB per file</small>
                </div>
              )}
              <div className="modal-nav-row" style={{ justifyContent: "flex-end" }}>
                <button className="modal-btn-primary" disabled={!file} onClick={() => setStep(2)}>
                  Next →
                </button>
              </div>
            </>
          )}

          {/* ── Step 2: Configure ── */}
          {step === 2 && (
            <>
              <div className="modal-field">
                <label className="modal-label"><FileText size={14} /> Description (Optional)</label>
                <textarea className="modal-textarea" value={description} rows={3} maxLength={500}
                  placeholder="Describe your file or add notes..."
                  onChange={(e) => setDescription(e.target.value)} />
                <p className="modal-hint">{description.length}/500 characters</p>
              </div>
              <button className="modal-advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}><Settings size={14} /> Advanced Settings</span>
                <svg className={showAdvanced ? "open" : ""} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showAdvanced && (
                <div className="modal-advanced-content">
                  <div className="modal-field" style={{ marginBottom: 0 }}>
                    <label className="modal-label"><Shield size={14} /> Password Protection</label>
                    <input className="modal-input" type="password" value={password} placeholder="Min 4 characters (leave empty for none)"
                      onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <div className="modal-field" style={{ marginBottom: 0 }}>
                    <label className="modal-label"><Clock size={14} /> Expiry Time</label>
                    <select className="modal-select" value={expiryHours} onChange={(e) => setExpiryHours(Number(e.target.value))}>
                      <option value={1}>1 Hour</option>
                      <option value={6}>6 Hours</option>
                      <option value={12}>12 Hours</option>
                      <option value={24}>1 Day</option>
                      <option value={72}>3 Days</option>
                      <option value={168}>1 Week</option>
                    </select>
                  </div>
                  <div className="modal-field" style={{ marginBottom: 0 }}>
                    <label className="modal-label"><Download size={14} /> Download Limit</label>
                    <input className="modal-input" type="number" value={maxDownloads} placeholder="Unlimited (1–100)"
                      min="1" max="100" onChange={(e) => setMaxDownloads(e.target.value)} />
                  </div>
                </div>
              )}
              <div className="modal-nav-row">
                <button className="modal-btn-back" onClick={() => setStep(1)}>← Back</button>
                <button className="modal-btn-primary" onClick={() => setStep(3)}>Next →</button>
              </div>
            </>
          )}

          {/* ── Step 3: Convert ── */}
          {step === 3 && (
            <>
              {!code && (
                <>
                  <div className="modal-field">
                    <label className="modal-label">Conversion Type</label>
                    <div className="modal-conversion-wrap">
                      <button
                        className="modal-conversion-btn"
                        id="conv-btn"
                        onClick={() => setShowDropdown(!showDropdown)}
                      >
                        <span>
                          {conversionType
                            ? availableConversions.find((o) => o.value === conversionType)?.label
                            : "Select conversion or 'No Conversion'"}
                        </span>
                        <svg style={{ width: 14, height: 14, transition: "transform 0.2s", transform: showDropdown ? "rotate(180deg)" : "none" }}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {showDropdown && (() => {
                        const btn = document.getElementById("conv-btn");
                        const rect = btn ? btn.getBoundingClientRect() : { bottom: 0, left: 0, width: 500 };
                        return (
                          <>
                            <div style={{ position: "fixed", inset: 0, zIndex: 9998 }} onClick={() => setShowDropdown(false)} />
                            <div className="modal-conversion-menu" style={{
                              position: "fixed",
                              top: rect.bottom + 6,
                              left: rect.left,
                              width: rect.width,
                              zIndex: 9999,
                            }}>
                              {Object.entries(groupedOptions).map(([cat, opts]) => (
                                <div key={cat}>
                                  <div className="modal-conv-category">{cat}</div>
                                  {opts.map((opt) => (
                                    <div key={opt.value}
                                      className={`modal-conv-option${conversionType === opt.value ? " selected" : ""}`}
                                      onClick={() => { setConversionType(opt.value); setShowDropdown(false); }}>
                                      <opt.icon size={14} color={opt.color} />
                                      <span>{opt.label}</span>
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  {isUploading && (
                    <div className="modal-progress-wrap">
                      <div className="modal-progress-header">
                        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                          Processing...
                        </span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="modal-progress-bar">
                        <div className="modal-progress-fill" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <p className="modal-progress-status">
                        {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : `Converting ${conversionType?.replace("->", " to ")} format...`}
                      </p>
                    </div>
                  )}
                  <div className="modal-nav-row">
                    <button className="modal-btn-back" onClick={() => setStep(2)}>← Back</button>
                    <button className="modal-btn-primary"
                      disabled={isUploading || (availableConversions.length > 0 && !conversionType)}
                      onClick={handlePublish}>
                      {isUploading
                        ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Processing...</>
                        : <><Upload size={14} /> {availableConversions.length > 0 ? "Convert & Share" : "Upload & Share"}</>}
                    </button>
                  </div>
                </>
              )}

              {/* Success */}
              {code && (
                <div className="modal-success">
                  <CheckCircle2 className="modal-success-icon" />
                  <p className="modal-success-title">File Ready!</p>
                  <p className="modal-success-subtitle">Share this code with anyone who needs the file.</p>
                  <div className="modal-code-boxes">
                    {code.split("").map((ch, i) => (
                      <div key={i} className="modal-code-box">{ch}</div>
                    ))}
                  </div>
                  <div className="modal-success-actions">
                    <button className="modal-btn-primary" style={{ flex: "0 0 auto" }}
                      onClick={() => { navigate(`/file/${code}`); onClose(); }}>
                      <Eye size={14} /> View File
                    </button>
                    <button className="modal-btn-secondary" style={{ flex: "0 0 auto" }} onClick={handleCopyCode}>
                      <Copy size={14} /> Copy Code
                    </button>
                    <button className="modal-btn-secondary" style={{ flex: "0 0 auto" }} onClick={handleCopyLink}>
                      <Copy size={14} /> Copy Link
                    </button>
                  </div>
                  <button className="modal-btn-back" style={{ marginTop: "1rem", width: "100%", textAlign: "center" }}
                    onClick={resetAll}>
                    Upload Another File
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AccessModal({ onClose }) {
  const { showToast } = useToast();
  const [code, setCode] = useState("");

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);
  const [fileInfo, setFileInfo] = useState(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  const errorMessages = {
    410: { title: "File Expired", msg: "This file has expired and is no longer available." },
    403: { title: "Download Limit Reached", msg: "This file has reached its maximum download count." },
    404: { title: "File Not Found", msg: "No file was found for that code. Check the code and try again." },
    401: { title: "Invalid Password", msg: "The password you entered is incorrect." },
  };

  const handleLookup = async () => {
    if (code.length !== 6) return;
    setLoading(true); setError(null); setFileInfo(null);
    try {
      const res = await axios.get(`${API_URL}/api/file/${code.toUpperCase()}/info`);
      setFileInfo(res.data);
    } catch (err) {
      const status = err.response?.status;
      const known = errorMessages[status];
      setError(known || { title: "Error", msg: err.response?.data?.message || "Could not load file info." });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true); setError(null);
    try {
      const res = await axios.post(`${API_URL}/api/file/${code.toUpperCase()}`,
        { password: password || undefined }
      );
      const a = document.createElement("a");
      a.href = res.data.fileUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast("Download started!", "success");
      onClose();
    } catch (err) {
      const status = err.response?.status;
      const known = errorMessages[status];
      setError(known || { title: "Download Failed", msg: err.response?.data?.message || "Could not download file." });
    } finally {
      setDownloading(false);
    }
  };

  const formatExpiry = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        <button className="modal-close-btn" onClick={onClose}><X size={14} /></button>
        <div className="access-modal-inner">
          <div className="access-modal-header">
            <h2 className="access-modal-title">Access a File</h2>
            <p className="access-modal-subtitle">Enter the 6-digit code to access a shared file.</p>
          </div>

          <div className="access-otp-section">
            <OtpInput
              value={code}
              onChange={(v) => { setCode(v); setError(null); setFileInfo(null); setPassword(""); }}
              numInputs={6}
              renderInput={(props) => <input {...props} className="access-otp-input" />}
              containerStyle={{ gap: "8px" }}
            />
          </div>

          {error && (
            <div className="access-error-card">
              <p className="access-error-title">{error.title}</p>
              <p className="access-error-msg">{error.msg}</p>
            </div>
          )}

          {fileInfo && !error && (
            <div className="file-info-card">
              <div className="file-info-row">
                <span className="file-info-label">File Name</span>
                <span className="file-info-value">{fileInfo.originalFileName || "—"}</span>
              </div>
              <div className="file-info-row">
                <span className="file-info-label">Size</span>
                <span className="file-info-value">{fileInfo.fileSize ? formatFileSize(fileInfo.fileSize) : "—"}</span>
              </div>
              <div className="file-info-row">
                <span className="file-info-label">Type</span>
                <span className="file-info-value">{fileInfo.conversionType?.replace('->', ' → ') || "—"}</span>
              </div>
              <div className="file-info-row">
                <span className="file-info-label">Expires</span>
                <span className="file-info-value" style={{ fontSize: "0.78rem" }}>{formatExpiry(fileInfo.expiry)}</span>
              </div>
              {fileInfo.maxDownloads && (
                <div className="file-info-row">
                  <span className="file-info-label">Downloads Left</span>
                  <span className="file-info-value">
                    <span className="file-info-badge orange">
                      {fileInfo.maxDownloads - (fileInfo.downloadCount || 0)} / {fileInfo.maxDownloads}
                    </span>
                  </span>
                </div>
              )}
              {fileInfo.hasPassword && (
                <div className="file-info-row">
                  <span className="file-info-label">Protected</span>
                  <span className="file-info-value"><span className="file-info-badge red">Password Required</span></span>
                </div>
              )}
            </div>
          )}

          {fileInfo?.hasPassword && !error && (
            <div className="modal-field">
              <label className="modal-label"><Shield size={14} /> Password</label>
              <input className="modal-input" type="password" value={password}
                placeholder="Enter file password"
                onChange={(e) => setPassword(e.target.value)} />
            </div>
          )}

          <div className="modal-nav-row">
            {!fileInfo && (
              <button className="modal-btn-primary"
                disabled={code.length !== 6 || loading}
                onClick={handleLookup}>
                {loading
                  ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Looking up...</>
                  : <>Look Up File</>}
              </button>
            )}
            {fileInfo && !error && (
              <>
                <button className="modal-btn-back" onClick={() => { setFileInfo(null); setPassword(""); setError(null); }}>
                  ← Back
                </button>
                <button className="modal-btn-primary"
                  disabled={downloading || (fileInfo.hasPassword && !password)}
                  onClick={handleDownload}>
                  {downloading
                    ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Downloading...</>
                    : <><Download size={14} /> Access File</>}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const Navbar = () => {
  const navigate = useNavigate();
  const [showUpload, setShowUpload] = useState(false);
  const [showAccess, setShowAccess] = useState(false);

  // Listen for events dispatched by Hero page CTA buttons
  useEffect(() => {
    const openUpload = () => { setShowUpload(true); setShowAccess(false); };
    const openAccess = () => { setShowAccess(true); setShowUpload(false); };
    window.addEventListener("flexshare:open-upload", openUpload);
    window.addEventListener("flexshare:open-access", openAccess);
    return () => {
      window.removeEventListener("flexshare:open-upload", openUpload);
      window.removeEventListener("flexshare:open-access", openAccess);
    };
  }, []);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          {/* Logo */}
          <div className="navbar-logo-group" onClick={() => navigate("/")}>
            <span className="navbar-brand">FlexShare</span>
          </div>

          {/* Icon buttons */}
          <div className="navbar-nav-group">
            <a
              href="https://github.com/uttkarsh124-shiv"
              target="_blank"
              rel="noopener noreferrer"
              className="navbar-nav-link"
            >
              <Github size={14} /> GitHub
            </a>
            <button
              className="navbar-nav-cta"
              onClick={() => { setShowUpload(true); setShowAccess(false); }}
            >
              <Upload size={14} /> Upload File
            </button>
            <button
              className="navbar-nav-link"
              onClick={() => { setShowAccess(true); setShowUpload(false); }}
            >
              <Search size={14} /> Access File
            </button>
          </div>
        </div>
      </nav>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      {showAccess && <AccessModal onClose={() => setShowAccess(false)} />}
    </>
  );
};

export default Navbar;
