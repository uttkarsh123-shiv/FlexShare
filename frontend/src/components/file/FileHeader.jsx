import React, { memo } from 'react';
import { ArrowLeft } from 'lucide-react';

const FileHeader = memo(({ code, onBackClick }) => {
  return (
    <div className="flex items-center justify-between p-6">
      <button
        onClick={onBackClick}
        className="flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/5"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Home</span>
      </button>
      
      <div className="text-center">
        <h1 className="text-xl font-bold">
          File: <span className="text-orange-500 font-mono">{code}</span>
        </h1>
        <p className="text-gray-400 text-sm">Shared via FlexShare</p>
      </div>
      
      <div className="w-24"></div> {/* Spacer for centering */}
    </div>
  );
});

FileHeader.displayName = 'FileHeader';

export default FileHeader;