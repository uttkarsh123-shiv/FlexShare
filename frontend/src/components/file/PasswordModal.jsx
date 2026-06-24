import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordModal({ isOpen, onSubmit, onCancel, isLoading }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password.length < 4) return;
    onSubmit(password);
  };

  const disabled = password.length < 4 || isLoading;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(28,25,23,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', zIndex: 9998,
    }}>
      <div style={{
        background: '#fffffe',
        border: '1px solid #e7e5e4',
        borderRadius: '14px',
        padding: '1.75rem',
        width: '100%', maxWidth: '380px',
        boxShadow: '0 8px 32px rgba(28,25,23,0.1)',
        fontFamily: "'Inter', sans-serif",
      }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1c1917', margin: '0 0 4px 0', letterSpacing: '-0.01em' }}>
          Password Required
        </h2>
        <p style={{ color: '#78716c', fontSize: '0.8rem', margin: '0 0 1.25rem 0' }}>
          This file is password protected
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#1c1917', marginBottom: '6px' }}>
            Password
          </label>
          <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              minLength={4}
              style={{
                width: '100%', padding: '9px 38px 9px 12px',
                background: '#fafaf9', border: '1px solid #e7e5e4',
                borderRadius: '8px', color: '#1c1917', fontSize: '0.85rem',
                outline: 'none', boxSizing: 'border-box',
                fontFamily: "'Inter', sans-serif",
              }}
              onFocus={(e) => { e.target.style.borderColor = '#9333ea'; e.target.style.boxShadow = '0 0 0 3px #f3e8ff'; }}
              onBlur={(e) => { e.target.style.borderColor = '#e7e5e4'; e.target.style.boxShadow = 'none'; }}
            />
            <button type="button" onClick={() => setShowPassword(p => !p)} tabIndex={-1} style={{
              position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
              color: '#a8a29e', background: 'none', border: 'none', cursor: 'pointer', display: 'flex',
            }}>
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={onCancel} style={{
              flex: 1, padding: '9px', borderRadius: '8px',
              border: '1px solid #e7e5e4', background: 'transparent',
              color: '#78716c', fontSize: '0.825rem', fontWeight: 600, cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
            }}>
              Cancel
            </button>
            <button type="submit" disabled={disabled} style={{
              flex: 1, padding: '9px', borderRadius: '8px', border: 'none',
              background: disabled ? '#f5f5f4' : '#9333ea',
              color: disabled ? '#a8a29e' : 'white',
              fontSize: '0.825rem', fontWeight: 600,
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontFamily: "'Inter', sans-serif",
            }}>
              {isLoading ? 'Verifying...' : 'Download'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
