import React, { useState, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { X, Upload, FileText, Image as ImageIcon, File, CheckCircle2, Loader2, Clock, Shield, Download, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [conversionType, setConversionType] = useState("");
  const [code, setCode] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState("");
  const [filePreview, setFilePreview] = useState(null);
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

    // Generate preview for images
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setFilePreview(null);
    }
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
    setFilePreview(null);
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
    if (!file) return <Upload className="w-12 h-12 text-gray-400" />;
    if (file.type.startsWith("image/")) return <ImageIcon className="w-12 h-12 text-orange-500" />;
    if (file.type === "application/pdf") return <FileText className="w-12 h-12 text-red-500" />;
    if (file.type.includes("word") || file.type.includes("document")) return <FileText className="w-12 h-12 text-blue-500" />;
    if (file.type.includes("sheet") || file.type.includes("excel")) return <File className="w-12 h-12 text-green-500" />;
    if (file.type.includes("presentation") || file.type.includes("powerpoint")) return <File className="w-12 h-12 text-purple-500" />;
    return <File className="w-12 h-12 text-blue-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
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

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("conversionType", conversionType || "none");
    formData.append("description", description || "");
    
    if (password.trim()) {
      formData.append("password", password);
    }
    
    if (expiryHours !== 1) {
      formData.append("expiryHours", expiryHours);
    }
    
    if (maxDownloads) {
      formData.append("maxDownloads", maxDownloads);
    }

    console.log('Uploading to:', `${API_URL}/api/uploads`);
    console.log('Form data:', {
      fileName: file.name,
      conversionType: conversionType || "none",
      description: description || "",
      hasPassword: !!password.trim(),
      expiryHours,
      maxDownloads
    });

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

      console.log('Upload response:', res.data);
      setCode(res.data.code);
      showToast(res.data.message || "File uploaded successfully!", "success");
      
      // Mark user as sender for the FilePage
      sessionStorage.setItem('uploadSuccess', 'true');
      sessionStorage.setItem('uploadCode', res.data.code);
      
      // Auto-navigate after 2 seconds
      setTimeout(() => {
        navigate(`/file/${res.data.code}`);
      }, 2000);
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err.response?.data?.message || err.message || "Upload failed";
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
        { label: "PDF → Word", value: "pdf->word", icon: "📄", category: "Document" },
        { label: "PDF → Text", value: "pdf->txt", icon: "📄", category: "Document" },
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
        { label: "Excel → PDF", value: "excel->pdf", icon: "📊", category: "Spreadsheet" },
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
    <div className="min-h-screen bg-gradient-to-br from-[#0c0a09] via-[#171717] to-[#0c0a09] text-[#e5e7eb] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 instrument-serif-regular">
            Upload & <span className="text-orange-500">Convert</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Upload your file, choose conversion format, and share instantly. Files are automatically deleted after expiry.
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center mb-12 gap-4 md:gap-8">
          {[
            { num: 1, label: "Upload" },
            { num: 2, label: "Configure" },
            { num: 3, label: "Convert" }
          ].map((s, index) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= s.num
                      ? "bg-orange-600 text-white scale-110 shadow-lg shadow-orange-600/30"
                      : "bg-[#383838] text-gray-500"
                  }`}
                >
                  {step > s.num ? <CheckCircle2 className="w-6 h-6" /> : s.num}
                </div>
                <span className="text-xs text-gray-400 mt-2">{s.label}</span>
              </div>
              {index < 2 && (
                <div
                  className={`h-1 w-8 md:w-16 transition-all mx-4 ${
                    step > s.num ? "bg-orange-600" : "bg-[#383838]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="space-y-6">
            <div
              {...getRootProps()}
              className={`relative border-2 border-dashed rounded-xl p-12 transition-all cursor-pointer ${
                isDragActive
                  ? "border-orange-500 bg-orange-900/10 scale-105 shadow-lg shadow-orange-600/20"
                  : "border-[#383838] bg-[#171717]/50 hover:border-orange-600/50 hover:bg-[#171717]/70"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                {filePreview ? (
                  <div className="relative w-full max-w-md">
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="w-full h-64 object-contain rounded-lg border border-[#383838] shadow-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                      }}
                      className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-2 transition shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : file ? (
                  <div className="flex items-center gap-4 bg-[#1a1a1a] px-6 py-4 rounded-lg border border-[#383838] w-full max-w-md shadow-lg">
                    {getFileIcon()}
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium truncate">{file.name}</p>
                      <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>
                      <p className="text-orange-400 text-xs">{file.type}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemove();
                      }}
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    {getFileIcon()}
                    <div>
                      <p className="font-semibold text-xl mb-2">
                        {isDragActive ? "Drop your file here" : "Upload file"}
                      </p>
                      <p className="text-[#a8a29e] mb-2">
                        Drag & drop or click to browse
                      </p>
                      <p className="text-xs text-gray-600">
                        Supports: Images, PDF, Word, Excel, PowerPoint (Max 50MB)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {file && (
              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="bg-orange-600 hover:bg-orange-700 px-8 py-3 rounded-lg text-white font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-600/20"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Configure */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Description */}
            <div className="bg-[#171717] rounded-xl p-6 border border-[#383838] shadow-lg">
              <label className="block mb-3 text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Describe your file or add notes..."
                className="w-full p-4 rounded-lg bg-[#1a1a1a] border border-[#383838] focus:outline-none focus:border-orange-600 transition text-white placeholder-gray-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-2 flex justify-between">
                <span>Help others understand what this file contains</span>
                <span>{description.length}/500</span>
              </p>
            </div>

            {/* Advanced Settings */}
            <div className="bg-[#171717] rounded-xl border border-[#383838] shadow-lg">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-[#1a1a1a] transition rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Advanced Settings</span>
                </div>
                <svg
                  className={`w-5 h-5 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showAdvanced && (
                <div className="px-6 pb-6 space-y-4 border-t border-[#383838]">
                  {/* Password Protection */}
                  <div>
                    <label className="block mb-2 text-sm font-medium flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Password Protection
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password (optional)"
                      className="w-full p-3 rounded-lg bg-[#1a1a1a] border border-[#383838] focus:outline-none focus:border-orange-600 transition text-white placeholder-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty for no password protection</p>
                  </div>

                  {/* Expiry Time */}
                  <div>
                    <label className="block mb-2 text-sm font-medium flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Expiry Time
                    </label>
                    <select
                      value={expiryHours}
                      onChange={(e) => setExpiryHours(Number(e.target.value))}
                      className="w-full p-3 rounded-lg bg-[#1a1a1a] border border-[#383838] focus:outline-none focus:border-orange-600 transition text-white"
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
                  <div>
                    <label className="block mb-2 text-sm font-medium flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download Limit
                    </label>
                    <input
                      type="number"
                      value={maxDownloads}
                      onChange={(e) => setMaxDownloads(e.target.value)}
                      placeholder="Unlimited"
                      min="1"
                      max="100"
                      className="w-full p-3 rounded-lg bg-[#1a1a1a] border border-[#383838] focus:outline-none focus:border-orange-600 transition text-white placeholder-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty for unlimited downloads</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-lg border border-[#383838] hover:border-orange-600 text-gray-400 hover:text-orange-400 transition"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="bg-orange-600 hover:bg-orange-700 px-8 py-3 rounded-lg text-white font-medium transition-all hover:scale-105 shadow-lg shadow-orange-600/20"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Conversion & Submit */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-[#171717] rounded-xl p-6 border border-[#383838] shadow-lg">
              <label className="block mb-4 text-sm font-medium">
                Select Conversion Type
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-full bg-[#1a1a1a] border border-[#383838] text-white px-4 py-3 rounded-lg flex justify-between items-center hover:border-orange-600 transition"
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
                      className={`w-5 h-5 transition-transform ${showDropdown ? "rotate-180" : ""}`}
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
                      className="fixed inset-0 z-10"
                      onClick={() => setShowDropdown(false)}
                    />
                    <div className="absolute z-20 mt-2 w-full rounded-lg bg-[#1a1a1a] border border-[#383838] shadow-xl overflow-hidden max-h-80 overflow-y-auto">
                      {Object.entries(groupedOptions).map(([category, options]) => (
                        <div key={category}>
                          <div className="px-4 py-2 bg-[#0c0a09] text-orange-400 text-sm font-medium border-b border-[#383838]">
                            {category}
                          </div>
                          {options.map((option) => (
                            <div
                              key={option.value}
                              onClick={() => {
                                setConversionType(option.value);
                                setShowDropdown(false);
                              }}
                              className={`cursor-pointer px-4 py-3 text-sm hover:bg-[#2a2a2a] transition flex items-center gap-3 ${
                                conversionType === option.value
                                  ? "bg-orange-900/30 text-orange-400"
                                  : "text-[#e5e7eb]"
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
              <div className="bg-[#171717] rounded-xl p-6 border border-[#383838] shadow-lg space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing your file...
                  </span>
                  <span className="font-mono">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-[#383838] rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-orange-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">
                  Converting {conversionType?.replace("->", " to ")} format...
                </p>
              </div>
            )}

            {/* Success Message */}
            {code && (
              <div className="bg-green-900/20 border border-green-500/50 rounded-xl p-6 flex items-center gap-3 shadow-lg">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <div className="flex-1">
                  <p className="text-green-400 font-medium text-lg">Upload successful!</p>
                  <p className="text-sm text-gray-400">
                    Your file code is: <span className="font-mono text-green-400 font-bold">{code}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Redirecting to file page...
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-lg border border-[#383838] hover:border-orange-600 text-gray-400 hover:text-orange-400 transition"
              >
                ← Back
              </button>

              <button
                onClick={handlePublish}
                disabled={isUploading || (availableConversions.length > 0 && !conversionType) || code}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-8 py-3 rounded-lg text-white font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-orange-600/20"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
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
