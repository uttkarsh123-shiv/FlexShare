import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c0a09] via-[#1c1917] to-[#0c0a09] flex items-center justify-center p-4">
      <div className="bg-[#171717]/80 backdrop-blur-xl rounded-2xl border border-red-500/30 p-8 max-w-md w-full text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
        <p className="text-gray-400 mb-6">
          An error occurred while loading this component. Please try refreshing the page.
        </p>
        <div className="bg-[#0c0a09]/50 rounded-lg p-3 mb-6 text-left">
          <p className="text-red-400 text-sm font-mono break-all">
            {error.message}
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={resetErrorBoundary}
            className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all hover:scale-105"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <a
            href="/"
            className="bg-gray-600 hover:bg-gray-700 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-semibold transition-all hover:scale-105"
          >
            <Home className="w-4 h-4" />
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
};

export const SimpleErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-center">
    <p className="text-red-400 mb-2">Something went wrong</p>
    <p className="text-red-300 text-sm mb-3">{error.message}</p>
    <button 
      onClick={resetErrorBoundary}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
    >
      Try again
    </button>
  </div>
);

export default ErrorFallback;