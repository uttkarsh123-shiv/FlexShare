import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    info: <AlertCircle className="w-5 h-5 text-blue-500" />
  };

  const bgColors = {
    success: 'bg-green-900/20 border-green-500/50',
    error: 'bg-red-900/20 border-red-500/50',
    warning: 'bg-yellow-900/20 border-yellow-500/50',
    info: 'bg-blue-900/20 border-blue-500/50'
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${bgColors[type]} backdrop-blur-sm shadow-lg animate-slide-in`}>
      {icons[type]}
      <p className="text-white text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 text-gray-400 hover:text-white transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;

