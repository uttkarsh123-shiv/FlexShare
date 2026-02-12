import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorDisplay = ({ error, onGoHome }) => {
  const getErrorMessage = (error) => {
    switch (error) {
      case "File has expired":
        return "This file has expired and is no longer available.";
      case "Download limit reached":
        return "This file has reached its maximum download limit.";
      case "Rate limit exceeded":
        return "Too many requests. Please wait a moment and try again.";
      default:
        return "The file you're looking for doesn't exist or has been removed.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c0a09] via-[#171717] to-[#0c0a09] flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-lg">
        {/* Icon Container */}
        <div className="mb-8 relative inline-block">
          <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full"></div>
          <div className="relative bg-gradient-to-br from-red-500/10 to-red-600/10 p-6 rounded-full border border-red-500/20">
            <AlertCircle className="w-12 h-12 text-red-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* Error Title */}
        <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">
          {error || "File Not Found"}
        </h1>
        
        {/* Error Description */}
        <p className="text-gray-400 text-lg mb-10 leading-relaxed">
          {getErrorMessage(error)}
        </p>
        
        {/* Action Button */}
        <button
          onClick={onGoHome}
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 px-8 py-3.5 rounded-xl text-white font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-600/25"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Go Home</span>
        </button>

        {/* Additional Help Text */}
        <p className="text-gray-500 text-sm mt-8">
          Need help? Contact support or try uploading a new file
        </p>
      </div>
    </div>
  );
};

export default ErrorDisplay;