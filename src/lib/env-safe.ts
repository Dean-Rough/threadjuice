/**
 * Safe environment variable access for production
 * Returns safe defaults to prevent crashes when env vars are missing
 */

export function getSafeEnv() {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';
  
  // Critical environment variables with safe fallbacks
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || '',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || (isBrowser ? window.location.origin : 'https://threadjuice.com'),
    NODE_ENV: process.env.NODE_ENV || 'production',
  };

  // Log missing critical variables (but don't crash)
  const missingVars: string[] = [];
  
  if (!env.NEXT_PUBLIC_SUPABASE_URL) missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!env.NEXT_PUBLIC_SUPABASE_ANON_KEY) missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  
  if (missingVars.length > 0 && isBrowser) {
    console.warn('Missing critical environment variables:', missingVars.join(', '));
  }

  return env;
}

export function isSupabaseConfigured() {
  const env = getSafeEnv();
  return !!(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function isClerkConfigured() {
  const env = getSafeEnv();
  return !!env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
}