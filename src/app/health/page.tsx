'use client';

import { useEffect, useState } from 'react';
import { getSafeEnv, isSupabaseConfigured, isClerkConfigured } from '@/lib/env-safe';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface HealthCheck {
  name: string;
  status: 'ok' | 'error' | 'warning';
  message: string;
}

export default function HealthPage() {
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function runHealthChecks() {
      const results: HealthCheck[] = [];
      
      // Check environment variables
      const env = getSafeEnv();
      
      // Supabase check
      results.push({
        name: 'Supabase Configuration',
        status: isSupabaseConfigured() ? 'ok' : 'error',
        message: isSupabaseConfigured() 
          ? 'Supabase is configured' 
          : 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
      });
      
      // Clerk check
      results.push({
        name: 'Clerk Authentication',
        status: isClerkConfigured() ? 'ok' : 'warning',
        message: isClerkConfigured() 
          ? 'Clerk is configured' 
          : 'Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY (optional)'
      });
      
      // App URL check
      results.push({
        name: 'App URL',
        status: env.NEXT_PUBLIC_APP_URL ? 'ok' : 'warning',
        message: env.NEXT_PUBLIC_APP_URL 
          ? `App URL: ${env.NEXT_PUBLIC_APP_URL}` 
          : 'Using fallback app URL'
      });
      
      // API Health check
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        results.push({
          name: 'API Health',
          status: response.ok ? 'ok' : 'error',
          message: response.ok ? 'API is responding' : `API Error: ${data.error || 'Unknown'}`
        });
      } catch (error) {
        results.push({
          name: 'API Health',
          status: 'error',
          message: `API is not responding: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
      
      // Posts API check
      try {
        const response = await fetch('/api/posts?limit=1');
        const data = await response.json();
        results.push({
          name: 'Posts API',
          status: response.ok ? 'ok' : 'error',
          message: response.ok 
            ? `Posts API working (${data.meta?.source || 'unknown source'})` 
            : `Posts API Error: ${data.error || 'Unknown'}`
        });
      } catch (error) {
        results.push({
          name: 'Posts API',
          status: 'error',
          message: `Posts API failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
      
      setChecks(results);
      setIsLoading(false);
    }
    
    runHealthChecks();
  }, []);
  
  const getIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold mb-8">System Health Check</h1>
        
        {isLoading ? (
          <p className="text-muted-foreground">Running health checks...</p>
        ) : (
          <div className="space-y-4">
            {checks.map((check, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-card rounded-lg border">
                {getIcon(check.status)}
                <div className="flex-1">
                  <h3 className="font-semibold">{check.name}</h3>
                  <p className="text-sm text-muted-foreground">{check.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h2 className="font-semibold mb-2">Environment</h2>
          <p className="text-sm font-mono">NODE_ENV: {process.env.NODE_ENV}</p>
          <p className="text-sm font-mono">Build Time: {new Date().toISOString()}</p>
        </div>
      </div>
    </div>
  );
}