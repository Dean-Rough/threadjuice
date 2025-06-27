'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '2rem',
          backgroundColor: '#f9fafb'
        }}>
          <div style={{ maxWidth: '28rem', width: '100%', textAlign: 'center' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Critical Application Error
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              The application encountered a critical error during initialization. This is often due to missing configuration.
            </p>
            
            {process.env.NODE_ENV === 'development' && (
              <div style={{
                backgroundColor: '#fee',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '2rem',
                textAlign: 'left',
                fontSize: '0.875rem',
                fontFamily: 'monospace',
                wordBreak: 'break-word'
              }}>
                {error.message}
              </div>
            )}
            
            <button
              onClick={reset}
              style={{
                backgroundColor: '#ea580c',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
            
            <p style={{ marginTop: '2rem', fontSize: '0.875rem', color: '#9ca3af' }}>
              Please ensure all required environment variables are configured.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}