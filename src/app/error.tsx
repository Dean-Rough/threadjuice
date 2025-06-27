'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
          Oops! Something went wrong
        </h1>
        
        <p className="text-gray-600 mb-8">
          We&apos;re sorry, but something unexpected happened. This could be due to a configuration issue or a temporary problem.
        </p>

        {/* Error details in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 bg-gray-100 rounded-lg text-left">
            <p className="font-mono text-sm text-gray-800 break-words">
              {error.message}
            </p>
            {error.stack && (
              <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-32">
                {error.stack}
              </pre>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
          
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Link>
        </div>

        {/* Help text */}
        <p className="mt-8 text-sm text-gray-500">
          If this problem persists, please contact support or check our status page.
        </p>
      </div>
    </div>
  );
}