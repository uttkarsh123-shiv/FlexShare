import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export default function PasswordModal({ isOpen, onSubmit, onCancel, isLoading }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  if (!isOpen) return null;

  const handleSubmit = (e) => { e.preventDefault(); if (password.length < 4) return; onSubmit(password); };
  const disabled = password.length < 4 || isLoading;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 9998 }}>
      <div style={{ background: '#ffffff', border: '2px solid #000000', padding: '2.5rem', width: '100%', maxWidth: '420px', boxShadow: '8px 8px 0px #000000', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ width: '52px', height: '52px', background: '#fff7ed', border: '1.5px solid #f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <Lock size={22} color="#f97316" />
        </div>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#000000', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Password Required</h2>
        <p style={{ color: '#555555', fontSize: '0.875rem', margin: '0 0 1.75rem', lineHeight: 1.65 }}>This file is password protected.</p>
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#000000', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Password</label>
          <div style={{ position: 'relative', marginBottom: '1.75rem' }}>
            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" autoFocus minLength={4}
              style={{ width: '100%', padding: '11px 40px 11px 13px', background: '#ffffff', border: '1px solid #000000', color: '#000000', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif" }}
              onFocus={e => { e.target.style.borderColor = '#f97316'; e.target.style.boxShadow = '3px 3px 0px #f97316'; }}
              onBlur={e => { e.target.style.borderColor = '#000000'; e.target.style.boxShadow = 'none'; }} />
            <button type="button" onClick={() => setShowPassword(p => !p)} tabIndex={-1}
              style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', color: '#888888', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={onCancel}
              style={{ flex: 1, padding: '11px', border: '1px solid #000000', background: 'transparent', color: '#000000', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', sans-serif", textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Cancel
            </button>
            <button type="submit" disabled={disabled}
              style={{ flex: 1, padding: '11px', border: 'none', background: disabled ? '#cccccc' : '#f97316', color: disabled ? '#888888' : 'white', fontSize: '0.875rem', fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: "'Inter', sans-serif", textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {isLoading ? 'Verifying...' : 'Download'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
