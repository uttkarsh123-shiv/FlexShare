import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

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
      position: 'fixed',
      inset: 0,
      background: 'rgba(28,25,23,0.45)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      zIndex: 9998,
    }}>
      <div style={{
        background: '#ffffff',
        border: '1px solid #e7e5e4',
        borderRadius: '18px',
        padding: '2rem',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 12px 40px rgba(28,25,23,0.12)',
        fontFamily: "'Inter', sans-serif",
      }}>
        {/* Icon */}
        <div style={{
          width: '52px',
          height: '52px',
          background: '#fff7ed',
          border: '1px solid #fed7aa',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 0 1.25rem',
        }}>
          <Lock size={22} color="#f97316" />
        </div>

        <h2 style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: '#1c1917',
          margin: '0 0 5px',
          letterSpacing: '-0.01em',
        }}>
          Password Required
        </h2>
        <p style={{ color: '#78716c', fontSize: '0.85rem', margin: '0 0 1.5rem', lineHeight: 1.6 }}>
          This file is password protected. Enter the password to continue.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{
            display: 'block',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: '#1c1917',
            marginBottom: '7px',
          }}>
            Password
          </label>
          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              minLength={4}
              style={{
                width: '100%',
                padding: '10px 40px 10px 13px',
                background: '#fafaf9',
                border: '1px solid #e7e5e4',
                borderRadius: '10px',
                color: '#1c1917',
                fontSize: '0.875rem',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: "'Inter', sans-serif",
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#f97316';
                e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.1)';
              }}
              onBlur={e => {
                e.target.style.borderColor = '#e7e5e4';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              tabIndex={-1}
              style={{
                position: 'absolute',
                right: '11px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#a8a29e',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                padding: '2px',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#78716c'}
              onMouseLeave={e => e.currentTarget.style.color = '#a8a29e'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                border: '1px solid #e7e5e4',
                background: 'transparent',
                color: '#78716c',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#d6d3d1'; e.currentTarget.style.color = '#1c1917'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e7e5e4'; e.currentTarget.style.color = '#78716c'; }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={disabled}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                border: 'none',
                background: disabled ? '#f5f5f4' : '#f97316',
                color: disabled ? '#a8a29e' : 'white',
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontFamily: "'Inter', sans-serif",
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = '#ea580c'; }}
              onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = '#f97316'; }}
            >
              {isLoading ? 'Verifying...' : 'Download'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
