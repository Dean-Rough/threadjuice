export default function HealthCheck() {
  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        padding: '40px',
        textAlign: 'center',
        backgroundColor: '#f0f8ff',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h1 style={{ color: '#2563eb', fontSize: '3rem', marginBottom: '1rem' }}>
        ✅ ThreadJuice is Running!
      </h1>
      <p style={{ fontSize: '1.2rem', color: '#475569', marginBottom: '2rem' }}>
        Server Status: <strong style={{ color: '#059669' }}>HEALTHY</strong>
      </p>
      <div
        style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          maxWidth: '600px',
        }}
      >
        <h2 style={{ color: '#374151', marginBottom: '1rem' }}>
          Available Pages:
        </h2>
        <ul style={{ textAlign: 'left', color: '#6b7280' }}>
          <li>
            <a href='/' style={{ color: '#2563eb' }}>
              Home - Full component showcase
            </a>
          </li>
          <li>
            <a href='/demo' style={{ color: '#2563eb' }}>
              Demo - Basic component tests
            </a>
          </li>
          <li>
            <a href='/simple' style={{ color: '#2563eb' }}>
              Simple - Minimal test page
            </a>
          </li>
          <li>
            <a href='/test' style={{ color: '#2563eb' }}>
              Test - React + Tailwind test
            </a>
          </li>
        </ul>
      </div>
      <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#9ca3af' }}>
        Server running on port 3000 • {new Date().toLocaleString()}
      </p>
    </div>
  );
}
