export default function LoadingSpinner() {
  return (
    <div style={{
      minHeight: 'calc(100vh - 62px)',
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '26px',
          height: '26px',
          border: '2px solid var(--bg-elevated)',
          borderTopColor: 'var(--text-body)',
          borderRadius: '50%',
          animation: 'spin 0.65s linear infinite',
          margin: '0 auto 1rem',
        }} />
        <p style={{
          color: 'var(--text-subtle)',
          fontSize: '0.84rem',
          fontWeight: 500,
          margin: 0,
          letterSpacing: '0.02em',
        }}>
          Loading...
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
