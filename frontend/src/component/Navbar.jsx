import { useState, useCallback, useEffect, useRef } from "react";
import {
  Upload, X, CheckCircle2, Loader2, Copy,
  FileText, Image as ImageIcon, File, Clock, Shield, Download, Settings,
  FileImage, FileType2, FileSpreadsheet, Eye, AlertCircle, ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import OtpInput from "react-otp-input";
import axios from "axios";
import { throttle } from "lodash";
import { useToast } from "../context/ToastContext";
import { useUploadQueue } from "../context/UploadQueueContext";
import "../styles/navbar.css";

const API_URL = import.meta.env.VITE_API_URL;

/* ── Helpers ──────────────────────────────────────────────────────────────── */
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
    { label: "No Conversion (Share Original)", value: "none", icon: File, category: "Original" },
  ];
  if (t.startsWith("image/")) {
    list.push(
      { label: "Image → PNG",  value: "image->png",  icon: FileImage, category: "Image" },
      { label: "Image → JPG",  value: "image->jpg",  icon: FileImage, category: "Image" },
      { label: "Image → JPEG", value: "image->jpeg", icon: FileImage, category: "Image" },
      { label: "Image → WebP", value: "image->webp", icon: FileImage, category: "Image" },
      { label: "Image → GIF",  value: "image->gif",  icon: FileImage, category: "Image" },
      { label: "Image → BMP",  value: "image->bmp",  icon: FileImage, category: "Image" },
      { label: "Image → AVIF", value: "image->avif", icon: FileImage, category: "Image" },
      { label: "Image → PDF",  value: "image->pdf",  icon: FileText,  category: "Document" }
    );
  }
  if (t === "application/pdf" || n.endsWith(".pdf")) {
    list.push(
      { label: "PDF → Word", value: "pdf->word", icon: FileType2, category: "Document" },
      { label: "PDF → Text", value: "pdf->txt",  icon: FileText,  category: "Document" }
    );
  }
  if (t.includes("word") || t.includes("wordprocessingml") || n.endsWith(".doc") || n.endsWith(".docx")) {
    list.push(
      { label: "Word → PDF",  value: "word->pdf", icon: FileText, category: "Document" },
      { label: "Word → Text", value: "word->txt", icon: FileText, category: "Document" }
    );
  }
  if (t.includes("sheet") || t.includes("excel") || n.endsWith(".xls") || n.endsWith(".xlsx")) {
    list.push(
      { label: "Excel → PDF", value: "excel->pdf", icon: FileSpreadsheet, category: "Spreadsheet" },
      { label: "Excel → CSV", value: "excel->csv", icon: FileSpreadsheet, category: "Spreadsheet" }
    );
  }
  if (t.includes("presentation") || t.includes("powerpoint") || n.endsWith(".ppt") || n.endsWith(".pptx")) {
    list.push(
      { label: "PowerPoint → PDF", value: "ppt->pdf", icon: FileText, category: "Presentation" }
    );
  }
  return list;
};

const getFileIcon = (file) => {
  if (!file) return <Upload size={28} color="var(--text-subtle)" />;
  if (file.type.startsWith("image/"))     return <ImageIcon    size={28} color="var(--text-body)" />;
  if (file.type === "application/pdf")    return <FileText     size={28} color="var(--text-body)" />;
  if (file.type.includes("word"))         return <FileText     size={28} color="var(--text-body)" />;
  if (file.type.includes("sheet") || file.type.includes("excel")) return <File size={28} color="var(--text-body)" />;
  if (file.type.includes("presentation")) return <File        size={28} color="var(--text-body)" />;
  return <File size={28} color="var(--text-body)" />;
};

/* ══════════════════════════════════════════════════════════════════════════════
   UPLOAD MODAL
══════════════════════════════════════════════════════════════════════════════ */
function UploadModal({ onClose }) {
  const { showToast } = useToast();
  const { enqueue } = useUploadQueue();
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const [file, setFile]                   = useState(null);
  const [step, setStep]                   = useState(1);
  const [conversionType, setConversionType] = useState("");
  const [description, setDescription]     = useState("");
  const [showAdvanced, setShowAdvanced]   = useState(false);
  const [password, setPassword]           = useState("");
  const [expiryHours, setExpiryHours]     = useState(1);
  const [maxDownloads, setMaxDownloads]   = useState("");
  const [showDropdown, setShowDropdown]   = useState(false);

  const resetAll = () => {
    setFile(null); setStep(1); setConversionType("");
    setDescription(""); setShowAdvanced(false); setPassword("");
    setExpiryHours(1); setMaxDownloads(""); setShowDropdown(false);
  };

  const onDrop = useCallback((acceptedFiles) => {
    const f = acceptedFiles[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { showToast("File size exceeds 10MB limit", "error"); return; }
    setFile(f); setConversionType("");
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

  const availableConversions = getAvailableConversions(file);
  const groupedOptions = availableConversions.reduce((acc, opt) => {
    if (!acc[opt.category]) acc[opt.category] = [];
    acc[opt.category].push(opt);
    return acc;
  }, {});

  const handlePublish = useCallback(
    throttle(() => {
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
      enqueue({ file, conversionType, description, expiryHours, password, maxDownloads });
      showToast("Upload queued!", "success");
      onClose();
    }, 1000),
    [file, conversionType, description, expiryHours, password, maxDownloads, showToast, enqueue, onClose, availableConversions]
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

          {/* Step 1: Upload */}
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
                  <Upload size={30} className="modal-dropzone-icon" />
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

          {/* Step 2: Configure */}
          {step === 2 && (
            <>
              <div className="modal-field">
                <label className="modal-label"><FileText size={13} /> Description (Optional)</label>
                <textarea className="modal-textarea" value={description} rows={3} maxLength={500}
                  placeholder="Describe your file or add notes..."
                  onChange={(e) => setDescription(e.target.value)} />
                <p className="modal-hint">{description.length}/500 characters</p>
              </div>
              <button className="modal-advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Settings size={13} /> Advanced Settings
                </span>
                <svg className={showAdvanced ? "open" : ""} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showAdvanced && (
                <div className="modal-advanced-content">
                  <div className="modal-field" style={{ marginBottom: 0 }}>
                    <label className="modal-label"><Shield size={13} /> Password Protection</label>
                    <input className="modal-input" type="password" value={password}
                      placeholder="Min 4 characters (leave empty for none)"
                      onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <div className="modal-field" style={{ marginBottom: 0 }}>
                    <label className="modal-label"><Clock size={13} /> Expiry Time</label>
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
                    <label className="modal-label"><Download size={13} /> Download Limit</label>
                    <input className="modal-input" type="number" value={maxDownloads}
                      placeholder="Unlimited (1–100)" min="1" max="100"
                      onChange={(e) => setMaxDownloads(e.target.value)} />
                  </div>
                </div>
              )}
              <div className="modal-nav-row">
                <button className="modal-btn-back" onClick={() => setStep(1)}>← Back</button>
                <button className="modal-btn-primary" onClick={() => setStep(3)}>Next →</button>
              </div>
            </>
          )}

          {/* Step 3: Convert */}
          {step === 3 && (
            <>
              <div className="modal-field">
                <label className="modal-label">Conversion Type</label>
                <div className="modal-conversion-wrap">
                  <button className="modal-conversion-btn" id="conv-btn"
                    onClick={() => setShowDropdown(!showDropdown)}>
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
                          position: "fixed", top: rect.bottom + 6,
                          left: rect.left, width: rect.width, zIndex: 9999,
                        }}>
                          {Object.entries(groupedOptions).map(([cat, opts]) => (
                            <div key={cat}>
                              <div className="modal-conv-category">{cat}</div>
                              {opts.map((opt) => (
                                <div key={opt.value}
                                  className={`modal-conv-option${conversionType === opt.value ? " selected" : ""}`}
                                  onClick={() => { setConversionType(opt.value); setShowDropdown(false); }}>
                                  <opt.icon size={14} color="var(--text-muted)" />
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
              <div className="modal-nav-row">
                <button className="modal-btn-back" onClick={() => setStep(2)}>← Back</button>
                <button className="modal-btn-primary"
                  disabled={availableConversions.length > 0 && !conversionType}
                  onClick={handlePublish}>
                  <Upload size={14} /> {availableConversions.length > 0 ? "Convert & Share" : "Upload & Share"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   ACCESS MODAL
══════════════════════════════════════════════════════════════════════════════ */
function AccessModal({ onClose }) {
  const { showToast } = useToast();
  const [code, setCode]           = useState("");
  const [fileInfo, setFileInfo]   = useState(null);
  const [password, setPassword]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError]         = useState(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const errorMessages = {
    410: { title: "File Expired",           msg: "This file has expired and is no longer available." },
    403: { title: "Download Limit Reached", msg: "This file has reached its maximum download count." },
    404: { title: "File Not Found",         msg: "No file was found for that code. Check and try again." },
    401: { title: "Invalid Password",       msg: "The password you entered is incorrect." },
  };

  const handleLookup = async () => {
    if (code.length !== 6) return;
    setLoading(true); setError(null); setFileInfo(null);
    try {
      const res = await axios.get(`${API_URL}/api/file/${code.toUpperCase()}/info`);
      setFileInfo(res.data);
    } catch (err) {
      const status = err.response?.status;
      setError(errorMessages[status] || { title: "Error", msg: err.response?.data?.message || "Could not load file info." });
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
      setError(errorMessages[status] || { title: "Download Failed", msg: err.response?.data?.message || "Could not download file." });
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
        <div className="upload-modal-inner">
          <div className="upload-modal-header">
            <h2 className="upload-modal-title">Access a File</h2>
            <p className="upload-modal-subtitle">Enter the 6-digit code to access a shared file.</p>
          </div>

          {/* OTP input */}
          <div className="access-otp-wrap">
            <OtpInput
              value={code}
              onChange={(v) => { setCode(v); setError(null); setFileInfo(null); setPassword(""); }}
              numInputs={6}
              renderInput={(props) => <input {...props} />}
              containerStyle={{ gap: "8px", justifyContent: "center" }}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="access-error-card">
              <p><strong>{error.title}</strong></p>
              <span>{error.msg}</span>
            </div>
          )}

          {/* File info card */}
          {fileInfo && !error && (
            <div className="access-file-card">
              <div className="access-file-row">
                <div className="access-file-icon">
                  <File size={18} color="var(--text-muted)" />
                </div>
                <div>
                  <p className="access-file-name">{fileInfo.originalFileName || "File"}</p>
                  <p className="access-file-meta">
                    {fileInfo.fileSize ? formatFileSize(fileInfo.fileSize) : ""}
                    {fileInfo.conversionType && fileInfo.conversionType !== "none"
                      ? " · " + fileInfo.conversionType.replace("->", " → ")
                      : ""}
                  </p>
                </div>
              </div>
              <div className="access-badges">
                {fileInfo.expiry && (
                  <span className="access-badge">
                    <Clock size={10} /> Expires {formatExpiry(fileInfo.expiry)}
                  </span>
                )}
                {fileInfo.maxDownloads && (
                  <span className="access-badge">
                    <Download size={10} />
                    {fileInfo.maxDownloads - (fileInfo.downloadCount || 0)}/{fileInfo.maxDownloads} left
                  </span>
                )}
                {fileInfo.hasPassword && (
                  <span className="access-badge">
                    <Shield size={10} /> Password protected
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Password field */}
          {fileInfo?.hasPassword && !error && (
            <div className="modal-field">
              <label className="modal-label"><Shield size={13} /> Password</label>
              <input className="modal-input" type="password" value={password}
                placeholder="Enter file password"
                onChange={(e) => setPassword(e.target.value)} />
            </div>
          )}

          {/* Actions */}
          <div className="modal-nav-row">
            {!fileInfo && (
              <button className="modal-btn-primary"
                style={{ width: "100%" }}
                disabled={code.length !== 6 || loading}
                onClick={handleLookup}>
                {loading
                  ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Looking up...</>
                  : <>Look Up File</>}
              </button>
            )}
            {fileInfo && !error && (
              <>
                <button className="modal-btn-back"
                  onClick={() => { setFileInfo(null); setPassword(""); setError(null); }}>
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
            {error && (
              <button className="modal-btn-back" style={{ width: "100%" }}
                onClick={() => { setError(null); setFileInfo(null); setCode(""); }}>
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   UPLOAD QUEUE TRAY
══════════════════════════════════════════════════════════════════════════════ */
function UploadQueueTray({ onClose }) {
  const { jobs, removeJob, clearDone } = useUploadQueue();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    showToast("Code copied!", "success");
  };

  const convLabel = (t) => (!t || t === 'none' ? 'No conversion' : t.replace('->', ' → '));

  return (
    <div style={{
      position: 'fixed', top: 72, right: 16, width: 380, zIndex: 10000,
      background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
      borderRadius: '20px', boxShadow: '0 12px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.2)',
      fontFamily: 'var(--font-sans)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)',
      }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          Uploads
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          {jobs.some(j => j.status === 'done' || j.status === 'failed') && (
            <button onClick={clearDone} style={trayBtnStyle}>Clear done</button>
          )}
          <button onClick={onClose} style={{ ...trayBtnStyle, padding: '2px 4px' }}><X size={13} /></button>
        </div>
      </div>

      {/* Jobs list */}
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {jobs.length === 0 && (
          <p style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            No uploads yet
          </p>
        )}
        {jobs.map(job => (
          <div key={job.id} style={{
            padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', gap: 14, alignItems: 'flex-start',
          }}>
            {/* Status icon */}
            <div style={{ paddingTop: 2, flexShrink: 0 }}>
              {job.status === 'uploading' && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite', color: '#60a5fa' }} />}
              {job.status === 'converting' && <Loader2 size={15} style={{ animation: 'spin 1s linear infinite', color: '#a78bfa' }} />}
              {job.status === 'done' && <CheckCircle2 size={15} style={{ color: '#34d399' }} />}
              {job.status === 'failed' && <AlertCircle size={15} style={{ color: '#f87171' }} />}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{
                margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }} title={job.fileName}>{job.fileName}</p>
              <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {convLabel(job.conversionType)}
                {job.status === 'uploading' && ` · ${job.progress}%`}
                {job.status === 'converting' && ' · Converting...'}
                {job.status === 'failed' && ` · ${job.error}`}
              </p>

              {/* Progress bar */}
              {(job.status === 'uploading') && (
                <div style={{ marginTop: 5, height: 3, background: 'var(--bg-base)', borderRadius: 2 }}>
                  <div style={{ height: '100%', width: `${job.progress}%`, background: '#60a5fa', borderRadius: 2, transition: 'width 0.2s' }} />
                </div>
              )}

              {/* Done actions */}
              {job.status === 'done' && job.code && (
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <button
                    onClick={() => { navigate(`/file/${job.code}`); onClose(); }}
                    style={trayActionBtnStyle}
                  >
                    <Eye size={11} /> View
                  </button>
                  <button onClick={() => copyCode(job.code)} style={trayActionBtnStyle}>
                    <Copy size={11} /> {job.code}
                  </button>
                </div>
              )}
            </div>

            {/* Remove */}
            {(job.status === 'done' || job.status === 'failed') && (
              <button onClick={() => removeJob(job.id)} style={{ ...trayBtnStyle, padding: '2px 4px', flexShrink: 0 }}>
                <X size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const trayBtnStyle = {
  background: 'transparent', border: 'none', color: 'var(--text-muted)',
  cursor: 'pointer', fontSize: '0.82rem', fontFamily: 'var(--font-sans)',
  padding: '3px 10px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: 4,
};

const trayActionBtnStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  padding: '5px 12px', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)',
  borderRadius: 'var(--radius-md)', fontSize: '0.8rem', fontWeight: 500,
  color: 'var(--text-body)', cursor: 'pointer', fontFamily: 'var(--font-sans)',
};

/* ══════════════════════════════════════════════════════════════════════════════
   NAVBAR
══════════════════════════════════════════════════════════════════════════════ */
const Navbar = () => {
  const navigate = useNavigate();
  const [showUpload, setShowUpload] = useState(false);
  const [showAccess, setShowAccess] = useState(false);
  const [showTray, setShowTray] = useState(false);
  const { jobs, activeCount } = useUploadQueue();
  const prevActiveCount = useRef(0);

  // auto-open tray when a new upload starts
  useEffect(() => {
    if (activeCount > prevActiveCount.current) setShowTray(true);
    prevActiveCount.current = activeCount;
  }, [activeCount]);

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

  const doneCount = jobs.filter(j => j.status === 'done').length;
  const failedCount = jobs.filter(j => j.status === 'failed').length;

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-logo-group" onClick={() => navigate("/")}>
            <span className="navbar-brand">FlexShare</span>
          </div>
          <div className="navbar-icon-group">
            <a href="https://github.com/uttkarsh123-shiv" target="_blank" rel="noopener noreferrer"
              className="navbar-text-btn" aria-label="GitHub">
              GitHub
            </a>
            <button className="navbar-text-btn" onClick={() => navigate('/history')}>
              History
            </button>

            {/* Queue indicator — only visible when there are jobs */}
            {jobs.length > 0 && (
              <button
                onClick={() => setShowTray(t => !t)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 18px',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '999px',
                  color: 'var(--text-body)',
                  fontSize: '0.88rem', fontWeight: 500, cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.28)',
                  transition: 'box-shadow 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.38)'; e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.28)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
              >
                {activeCount > 0
                  ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
                  : failedCount > 0
                  ? <AlertCircle size={15} style={{ color: 'var(--text-muted)' }} />
                  : <CheckCircle2 size={15} style={{ color: 'var(--text-muted)' }} />}
                {activeCount > 0
                  ? `${activeCount} uploading`
                  : failedCount > 0
                  ? `${failedCount} failed`
                  : `${doneCount} done`}
                <ChevronDown size={13} style={{ color: 'var(--text-muted)', transform: showTray ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>
            )}

            <button className="navbar-text-btn" onClick={() => { setShowUpload(true); setShowAccess(false); }}>
              Upload
            </button>
            <button className="navbar-text-btn navbar-text-btn--primary" onClick={() => { setShowAccess(true); setShowUpload(false); }}>
              Access File
            </button>
          </div>
        </div>
      </nav>

      {showTray && <UploadQueueTray onClose={() => setShowTray(false)} />}
      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      {showAccess && <AccessModal onClose={() => setShowAccess(false)} />}
    </>
  );
};

export default Navbar;
