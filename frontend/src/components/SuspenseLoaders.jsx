import React from 'react';

// Component-specific loading fallbacks
export const FilePreviewLoader = () => (
  <div className="relative bg-gradient-to-br from-[#0c0a09] to-[#1a1a1a] p-16 flex flex-col items-center justify-center text-center animate-pulse">
    <div className="w-24 h-24 rounded-2xl bg-gray-700 mb-8"></div>
    <div className="h-8 bg-gray-700 rounded w-64 mb-4"></div>
    <div className="h-4 bg-gray-700 rounded w-32"></div>
  </div>
);

export const FileStatsLoader = () => (
  <div className="grid grid-cols-4 gap-6 mb-8 animate-pulse">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="text-center">
        <div className="h-8 bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-16 mx-auto"></div>
      </div>
    ))}
  </div>
);

export const FileActionsLoader = () => (
  <div className="flex flex-col sm:flex-row gap-4 justify-center animate-pulse">
    <div className="h-14 bg-gray-700 rounded-2xl min-w-[200px]"></div>
    <div className="h-14 bg-gray-700 rounded-2xl min-w-[140px]"></div>
  </div>
);

export const FileInfoLoader = () => (
  <div className="bg-[#171717]/60 backdrop-blur-xl rounded-2xl border border-[#383838]/30 p-6 animate-pulse">
    <div className="flex items-center justify-center gap-8">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded w-24"></div>
        </div>
      ))}
    </div>
  </div>
);

export const PasswordModalLoader = () => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center px-4 z-50">
    <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl w-full max-w-lg animate-pulse">
      <div className="text-center">
        <div className="h-10 bg-gray-700 rounded mb-4 w-64 mx-auto"></div>
        <div className="h-6 bg-gray-700 rounded mb-8 w-80 mx-auto"></div>
        <div className="flex justify-center gap-3 mb-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-16 h-16 bg-gray-700 rounded-2xl"></div>
          ))}
        </div>
        <div className="flex gap-4">
          <div className="flex-1 h-14 bg-gray-700 rounded-2xl"></div>
          <div className="h-14 bg-gray-700 rounded-2xl w-24"></div>
        </div>
      </div>
    </div>
  </div>
);

// Generic page loader
export const PageLoader = ({ message = "Loading..." }) => (
  <div className="min-h-screen bg-gradient-to-br from-[#0c0a09] via-[#171717] to-[#0c0a09] flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-400">{message}</p>
    </div>
  </div>
);