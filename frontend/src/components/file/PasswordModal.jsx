import React, { useState, memo, useCallback } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordModal = memo(({ 
  isOpen, 
  onSubmit, 
  onCancel, 
  isLoading, 
  isForDownload = false 
}) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (password.length < 4) return; // Changed from 6 to 4
    onSubmit(password);
  }, [password, onSubmit]);

  const handlePasswordChange = useCallback((value) => {
    setPassword(value);
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center p-6 z-50 animate-in fade-in duration-300">
      <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-2xl p-8 border border-orange-500/20 shadow-2xl w-full max-w-md transform animate-in zoom-in-95 duration-300">
        {/* Decorative gradient border */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-transparent to-orange-500/20 rounded-2xl blur-sm -z-10"></div>
        
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-full flex items-center justify-center mb-6 border border-orange-500/30">
            <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            Enter Password
          </h2>
          
          <p className="text-gray-400 text-sm mb-8 leading-relaxed">
            This file is password protected. Enter the password to download.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Enter password"
                className="w-full max-w-xs px-4 py-3 text-center text-lg font-medium bg-gray-800/60 border border-gray-600/50 rounded-xl text-white focus:border-orange-500 focus:bg-gray-700/60 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 focus:outline-none placeholder-gray-500"
                autoFocus
                minLength={4}
              />
            </div>
            
            <div className="flex justify-center">
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="flex items-center gap-2 text-gray-400 hover:text-orange-400 transition-colors duration-200 text-sm font-medium"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPassword ? "Hide" : "Show"} password
              </button>
            </div>
            
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={password.length < 4 || isLoading}
                className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-[1.02] disabled:hover:scale-100 shadow-lg hover:shadow-orange-500/25"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download File
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 rounded-xl border border-gray-600/50 hover:border-gray-500 hover:bg-gray-800/50 text-gray-300 hover:text-white font-semibold text-sm transition-all duration-300 hover:scale-[1.02]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

PasswordModal.displayName = 'PasswordModal';

export default PasswordModal;