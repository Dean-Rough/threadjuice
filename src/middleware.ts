import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAICrawler } from '@/lib/seo/ai-search-optimization';

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const pathname = request.nextUrl.pathname;
  
  // Track AI crawler visits
  if (isAICrawler(userAgent) && pathname.startsWith('/posts/')) {
    // Extract post slug
    const postSlug = pathname.split('/posts/')[1];
    
    // Determine AI source
    let source: 'perplexity' | 'chatgpt' | 'claude' | 'other' = 'other';
    if (userAgent.toLowerCase().includes('perplexity')) source = 'perplexity';
    else if (userAgent.toLowerCase().includes('gpt') || userAgent.toLowerCase().includes('openai')) source = 'chatgpt';
    else if (userAgent.toLowerCase().includes('anthropic') || userAgent.toLowerCase().includes('claude')) source = 'claude';
    
    // Log AI crawler visit (async, non-blocking)
    fetch(`${request.nextUrl.origin}/api/analytics/ai-hit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postSlug, source, userAgent })
    }).catch(() => {}); // Ignore errors to not block response
  }
  
  // Add performance headers
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  
  // Performance headers
  response.headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/admin (admin endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/admin|_next/static|_next/image|favicon.ico).*)',
  ],
};