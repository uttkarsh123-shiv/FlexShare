import { useState, memo, useCallback } from 'react';
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
    if (password.length < 4) return;
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
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      zIndex: 50
    }}>
      <div style={{
        background: '#1e2530',
        borderRadius: '1.5rem',
        padding: '2.5rem',
        border: '1px solid rgba(107, 114, 128, 0.3)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        width: '100%',
        maxWidth: '32rem'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <h2 style={{
            fontSize: '1.875rem',
            fontWeight: 700,
            color: 'white',
            marginBottom: '0.75rem'
          }}>
            Password Protected
          </h2>
          <p style={{
            color: '#9ca3af',
            fontSize: '1rem'
          }}>
            This file requires a password to access
          </p>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Password Input */}
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#d1d5db',
              marginBottom: '0.75rem'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '1rem 3.5rem 1rem 1.25rem',
                  background: '#0f1419',
                  border: '1px solid rgba(107, 114, 128, 0.5)',
                  borderRadius: '0.75rem',
                  color: 'white',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#ea580c';
                  e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(107, 114, 128, 0.5)';
                  e.target.style.boxShadow = 'none';
                }}
                autoFocus
                minLength={4}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9ca3af',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#d1d5db'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            paddingTop: '1rem'
          }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '1rem 1.5rem',
                borderRadius: '0.75rem',
                border: '1px solid #4b5563',
                background: 'transparent',
                color: '#d1d5db',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#6b7280';
                e.currentTarget.style.background = 'rgba(31, 41, 55, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#4b5563';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={password.length < 4 || isLoading}
              style={{
                flex: 1,
                background: password.length < 4 || isLoading ? '#374151' : '#ea580c',
                color: 'white',
                padding: '1rem 1.5rem',
                borderRadius: '0.75rem',
                fontSize: '1rem',
                fontWeight: 600,
                border: 'none',
                cursor: password.length < 4 || isLoading ? 'not-allowed' : 'pointer',
                opacity: password.length < 4 || isLoading ? 0.5 : 1,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                if (password.length >= 4 && !isLoading) {
                  e.currentTarget.style.background = '#c2410c';
                }
              }}
              onMouseLeave={(e) => {
                if (password.length >= 4 && !isLoading) {
                  e.currentTarget.style.background = '#ea580c';
                }
              }}
            >
              {isLoading ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    width: '1.25rem',
                    height: '1.25rem',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                "Download"
              )}
            </button>
          </div>
        </form>
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input::placeholder {
          color: #6b7280;
        }
      `}</style>
    </div>
  );
});

PasswordModal.displayName = 'PasswordModal';

export default PasswordModal;
