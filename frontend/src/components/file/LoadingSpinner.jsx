export default function LoadingSpinner() {
  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '32px', height: '4px', background: '#000000', margin: '0 auto 1rem', animation: 'pulse 1s ease-in-out infinite', transformOrigin: 'left' }} />
        <p style={{ color: '#888888', fontSize: '0.78rem', margin: 0, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Loading</p>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scaleX(1)} 50%{opacity:0.4;transform:scaleX(0.6)} }`}</style>
    </div>
  );
}
