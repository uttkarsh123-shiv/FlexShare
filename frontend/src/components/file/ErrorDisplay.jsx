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
    <div className="min-h-screen bg-gradient-to-br from-[#0c0a09] via-[#171717] to-[#0c0a09] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">{error || "File not found"}</h2>
        <p className="text-gray-400 mb-6">
          {getErrorMessage(error)}
        </p>
        <button
          onClick={onGoHome}
          className="bg-orange-600 hover:bg-orange-700 px-6 py-3 rounded-lg text-white font-medium transition"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;