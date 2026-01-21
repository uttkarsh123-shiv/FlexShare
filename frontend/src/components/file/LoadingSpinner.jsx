import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c0a09] via-[#171717] to-[#0c0a09] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading file...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;