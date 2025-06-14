export default function SimplePage() {
  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        backgroundColor: '#f0f0f0',
        minHeight: '100vh',
      }}
    >
      <h1
        style={{
          color: '#333',
          fontSize: '24px',
          marginBottom: '20px',
        }}
      >
        🎉 ThreadJuice Simple Test
      </h1>

      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <p style={{ marginBottom: '15px' }}>✅ Next.js is working</p>
        <p style={{ marginBottom: '15px' }}>✅ React is rendering</p>
        <p style={{ marginBottom: '15px' }}>✅ TypeScript is compiled</p>
        <p style={{ color: '#666' }}>
          Server running on <strong>localhost:3000/simple</strong>
        </p>
      </div>

      <div
        style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#e7f3ff',
          borderRadius: '6px',
          border: '1px solid #b3d9ff',
        }}
      >
        <h3 style={{ margin: '0 0 10px 0', color: '#0066cc' }}>Next Steps:</h3>
        <p style={{ margin: '0', fontSize: '14px' }}>
          If you see this styled page, the basic setup is working!
          <br />
          Try:{' '}
          <a href='/test' style={{ color: '#0066cc' }}>
            /test
          </a>{' '}
          (with Tailwind) or{' '}
          <a href='/demo' style={{ color: '#0066cc' }}>
            /demo
          </a>{' '}
          (with components)
        </p>
      </div>
    </div>
  );
}
