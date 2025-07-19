import React, { useState } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { X } from "lucide-react"; // Optional, or replace with ❌ text

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [conversionType, setConversionType] = useState("");
  const [code, setCode] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [hasPublished, setHasPublished] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);


  const [step, setStep] = useState(1);
const [description, setDescription] = useState("");

  const onDrop = (acceptedFiles) => {
    setFile(acceptedFiles[0]);
    setCode("");
    setHasPublished(false);
  };

  const onRemove = () => {
    setFile(null);
    setCode("");
    setHasPublished(false);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handlePublish = async () => {
    if (isUploading || hasPublished) return;

    if (!file || !conversionType) {
      alert("Please select file and conversion type");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("conversionType", conversionType);

    try {
      const res = await axios.post("https://flexshare.onrender.com/api/uploads", formData);
      setCode(res.data.code);
      setHasPublished(true); // prevents repeat clicks
    } catch (err) {
      alert("Upload failed");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8 h-screen mt-8 max-w-screen mx-auto bg-[#0c0a09] text-[#e5e7eb]">
  {/* Step Indicators */}
  <div className="flex justify-center mb-8 gap-8 text-sm">
    <div className={step >= 1 ? "text-orange-500 font-bold" : "text-gray-500"}>1. Upload</div>
    <div className={step >= 2 ? "text-orange-500 font-bold" : "text-gray-500"}>2. Description</div>
    <div className={step >= 3 ? "text-orange-500 font-bold" : "text-gray-500"}>3. Convert</div>
  </div>

  {/* Step 1: Upload */}
  {step === 1 && (
   <div>
  <div
    {...getRootProps()}
    className="w-[55vw] h-[45vh] mx-auto bg-transparent border border-dashed border-[#383838] rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition"
  >
    <input {...getInputProps()} />
    {!file ? (
      <>
     
        <p className="font-semibold mb-2 text-[#e5e7eb]">Upload file</p>
        <p className="text-[#a8a29e] mb-4">Drag or drop your files here</p>
        <div className="w-30 h-30 flex justify-center items-center rounded-lg bg-[#171717]">
             <svg
          xmlns="http://www.w3.org/2000/svg"
          className=" w-4 mb-4"
          fill="none"
          viewBox="0 0 20 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12"
          />
        </svg>
        </div>
      </>
    ) : (
      <div className="flex items-center justify-between bg-[#1a1a1a] px-4 py-5 rounded w-full max-w-lg border border-[#383838]">
        <div className="overflow-hidden">
          <p className="text-gray-100 font-medium truncate">{file.name}</p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className="text-xs bg-gray-700 text-gray-100 px-2 py-0.5 rounded">
            {(file.size / (1024 * 1024)).toFixed(2)} MB
          </span>
          <button onClick={onRemove} className="text-gray-400 hover:text-red-500">
            <X size={16} />
          </button>
        </div>
      </div>
    )}
  </div>

  {/* ✅ Next button outside dropzone */}
  <div className="w-[55vw] mx-auto text-right">
    <button
      disabled={!file}
      onClick={() => setStep(2)}
      className="mt-6 bg-orange-700 hover:bg-orange-600 px-4 py-2 rounded text-white disabled:opacity-50"
    >
      Next
    </button>
  </div>
</div>

  )}

  {/* Step 2: Description */}
  {step === 2 && (
    <div className="w-[55vw] mx-auto text-left">
      <label className="block mb-2 text-sm">Add a description (optional):</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={5}
        placeholder="write..."
        className="w-full p-3 rounded bg-[#1a1a1a] border border-[#383838] focus:outline-none"
      />
      <div className="flex justify-between mt-4">
        <button onClick={() => setStep(1)} className="text-gray-400 hover:text-orange-400">← Back</button>
        <button onClick={() => setStep(3)} className="bg-orange-700 hover:bg-orange-600 px-4 py-2 rounded text-white">
          Next →
        </button>
      </div>
    </div>
  )}

  {/* Step 3: Conversion & Submit */}
  {step === 3 && (
    <div className="mx-auto w-[55vw] text-left">
      <label className="block mb-2">Conversion Type:</label>
   <div className="relative inline-block w-[13vw] text-left mt-2">
  <div className="relative">
    <button
      onClick={() => setShowDropdown(!showDropdown)}
      className="w-full bg-[#0c0a09] border border-[#383838] text-[#e5e7eb] px-4 py-2 rounded flex justify-between items-center"
    >
      {conversionType ? conversionType.replace("->", " → ") : "Select type"}
      <svg
        className="w-4 h-4 ml-2 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    {showDropdown && (
      <div className="absolute z-10 mt-2 w-full rounded-md bg-[#1a1a1a] border border-[#383838] shadow-lg">
        {[
          { label: "Word → PDF", value: "word->pdf" },
          { label: "PDF → Word", value: "pdf->word" },
          { label: "Image → PNG", value: "image->png" },
          { label: "Image → JPG", value: "image->jpg" },
        ].map((item) => (
          <div
            key={item.value}
            onClick={() => {
              setConversionType(item.value);
              setShowDropdown(false);
            }}
            className="cursor-pointer px-4 py-2 text-sm text-[#e5e7eb] hover:bg-[#333] transition"
          >
            {item.label}
          </div>
        ))}
      </div>
    )}
  </div>
</div>


      <div className="flex justify-between items-center mt-6">
        <button onClick={() => setStep(2)} className="text-gray-400 hover:text-orange-400">← Back</button>

        <button
          onClick={handlePublish}
          disabled={isUploading || hasPublished}
          className={`flex items-center justify-center px-4 py-2 rounded text-white ${
            isUploading || hasPublished
              ? "bg-orange-900 cursor-not-allowed"
              : "bg-orange-800 hover:bg-orange-600"
          }`}
        >
          {isUploading ? <span className="loader"></span> : "Submit"}
        </button>
      </div>

      {code && (
        <p className="mt-4 text-green-500">
          Your code: <span className="font-mono">{code}</span>
        </p>
      )}
    </div>
  )}
</div>

  );
}
