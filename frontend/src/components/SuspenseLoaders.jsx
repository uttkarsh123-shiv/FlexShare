export const PageLoader = ({ message = "Loading..." }) => (
  <div style={{ minHeight: 'calc(100vh - 58px)', background: '#fafaf9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: '28px', height: '28px', border: '3px solid #e9d5ff', borderTopColor: '#9333ea', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 0.75rem' }} />
      <p style={{ color: '#a8a29e', fontSize: '0.825rem' }}>{message}</p>
    </div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);
