import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export default function PasswordModal({ isOpen, onSubmit, onCancel, isLoading }) {
  const [password, setPassword]         = useState('');
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
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', zIndex: 9998,
    }}>
      <div style={{
        background: 'var(--bg-soft)',
        border: '1px solid var(--bg-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.25rem',
        width: '100%', maxWidth: '400px',
        boxShadow: 'var(--shadow-lg)',
        fontFamily: 'var(--font-sans)',
        animation: 'fadeUp 0.18s ease',
      }}>
        {/* Icon */}
        <div style={{
          width: '48px', height: '48px',
          background: 'var(--bg-muted)',
          border: '1px solid var(--bg-border)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '1.25rem',
        }}>
          <Lock size={20} color="var(--text-body)" />
        </div>

        <h2 style={{
          fontSize: '1.2rem', fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 5px', letterSpacing: '-0.025em',
        }}>
          Password Required
        </h2>
        <p style={{
          color: 'var(--text-muted)', fontSize: '0.9rem',
          margin: '0 0 1.75rem', lineHeight: 1.6,
        }}>
          This file is password protected.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{
            display: 'block', fontSize: '0.8rem',
            fontWeight: 600, color: 'var(--text-body)',
            marginBottom: '7px', letterSpacing: '0.01em',
          }}>
            Password
          </label>

          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              minLength={4}
              style={{
                width: '100%', padding: '11px 42px 11px 14px',
                background: 'var(--bg-muted)',
                border: '1px solid var(--bg-border)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)', fontSize: '0.9rem',
                outline: 'none', boxSizing: 'border-box',
                fontFamily: 'var(--font-sans)',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#555';
                e.target.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.05)';
                e.target.style.background = 'var(--bg-elevated)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--bg-border)';
                e.target.style.boxShadow = 'none';
                e.target.style.background = 'var(--bg-muted)';
              }}
            />
            <button type="button" onClick={() => setShowPassword(p => !p)} tabIndex={-1} style={{
              position: 'absolute', right: '12px', top: '50%',
              transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-subtle)', display: 'flex', padding: 0,
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-muted)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-subtle)'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '9px' }}>
            <button type="button" onClick={onCancel} style={{
              flex: 1, padding: '11px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--bg-border)',
              background: 'transparent',
              color: 'var(--text-muted)', fontSize: '0.9rem',
              fontWeight: 500, cursor: 'pointer',
              fontFamily: 'var(--font-sans)', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-muted)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              Cancel
            </button>
            <button type="submit" disabled={disabled} style={{
              flex: 1, padding: '11px',
              borderRadius: 'var(--radius-md)', border: 'none',
              background: disabled ? 'var(--bg-elevated)' : 'var(--btn-bg)',
              color: disabled ? 'var(--text-subtle)' : 'var(--btn-fg)',
              fontSize: '0.9rem', fontWeight: 600,
              cursor: disabled ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-sans)', transition: 'background 0.15s',
              letterSpacing: '-0.01em',
            }}>
              {isLoading ? 'Verifying...' : 'Download'}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}
