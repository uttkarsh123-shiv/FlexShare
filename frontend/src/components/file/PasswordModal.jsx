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
    if (password.length < 6) return;
    onSubmit(password);
  }, [password, onSubmit]);

  const handlePasswordChange = useCallback((index, value) => {
    const newPassword = password.split('');
    newPassword[index] = value.toUpperCase();
    const updatedPassword = newPassword.join('');
    setPassword(updatedPassword);
  }, [password]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center px-4 z-50 animate-in fade-in duration-300">
      <div className="relative bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl w-full max-w-lg transform animate-in zoom-in-95 duration-300">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            {isForDownload ? "Enter Password" : "Enter File Code"}
          </h2>
          
          <p className="text-gray-400 text-lg mb-8">
            {isForDownload 
              ? "Enter the password to download this file" 
              : "Enter the 6-character code to access your file"
            }
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-center gap-3">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  type={showPassword ? "text" : "password"}
                  maxLength="1"
                  value={password[index] || ''}
                  onChange={(e) => {
                    handlePasswordChange(index, e.target.value);
                    
                    // Auto-focus next input
                    if (e.target.value && index < 5) {
                      const nextInput = e.target.parentElement.children[index + 1];
                      if (nextInput) nextInput.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    // Handle backspace to go to previous input
                    if (e.key === 'Backspace' && !password[index] && index > 0) {
                      const prevInput = e.target.parentElement.children[index - 1];
                      if (prevInput) prevInput.focus();
                    }
                  }}
                  className="w-16 h-16 text-center text-2xl font-bold bg-gray-800/50 border border-gray-600 rounded-2xl text-white focus:border-blue-500 focus:bg-gray-700/50 transition-all duration-200 focus:outline-none"
                  autoFocus={index === 0}
                />
              ))}
            </div>
            
            <div className="flex justify-center">
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200 text-sm"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPassword ? "Hide" : "Show"} characters
              </button>
            </div>
            
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={password.length < 6 || isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  isForDownload ? "Download File" : "Access File"
                )}
              </button>
              
              <button
                type="button"
                onClick={onCancel}
                className="px-8 py-4 rounded-2xl border border-gray-600 hover:border-gray-500 hover:bg-gray-800/50 text-gray-300 hover:text-white font-semibold text-lg transition-all duration-300"
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