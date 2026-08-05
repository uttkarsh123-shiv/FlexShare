export const PageLoader = ({ message = "Loading..." }) => (
  <div style={{
    minHeight: 'calc(100vh - 68px)',
    background: '#fafaf9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Inter', sans-serif",
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '32px',
        height: '32px',
        border: '3px solid #fed7aa',
        borderTopColor: '#f97316',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
        margin: '0 auto 1rem',
      }} />
      <p style={{ color: '#a8a29e', fontSize: '0.85rem', margin: 0 }}>{message}</p>
    </div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);
