import { NextRequest, NextResponse } from 'next/server.js';

/**
 * Cache configuration and utilities for optimizing API performance
 */

// Cache duration constants (in seconds)
export const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 1800, // 30 minutes
  HOUR: 3600, // 1 hour
  DAY: 86400, // 24 hours
  WEEK: 604800, // 7 days
  MONTH: 2592000, // 30 days
} as const;

// Cache keys for different types of data
export const CACHE_KEYS = {
  POSTS: 'posts',
  POST_DETAIL: 'post_detail',
  TRENDING: 'trending',
  CATEGORIES: 'categories',
  PERSONAS: 'personas',
  REDDIT_DATA: 'reddit_data',
  GPT_CONTENT: 'gpt_content',
  QUIZ_DATA: 'quiz_data',
  USER_PROFILE: 'user_profile',
  ANALYTICS: 'analytics',
} as const;

/**
 * In-memory cache implementation
 * For production, consider using Redis or Vercel KV
 */
class MemoryCache {
  private cache = new Map<string, { data: any; expires: number }>();

  /**
   * Set cache entry with expiration
   */
  set(key: string, data: any, ttl: number = CACHE_DURATIONS.MEDIUM): void {
    const expires = Date.now() + ttl * 1000;
    this.cache.set(key, { data, expires });
  }

  /**
   * Get cache entry if not expired
   */
  get<T = any>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Delete cache entry
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Global cache instance
export const memoryCache = new MemoryCache();

// Auto-cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(
    () => {
      memoryCache.cleanup();
    },
    5 * 60 * 1000
  );
}

/**
 * Generate cache key with parameters
 */
export function generateCacheKey(
  baseKey: string,
  params: Record<string, any> = {}
): string {
  const paramString = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join('|');

  return paramString ? `${baseKey}:${paramString}` : baseKey;
}

/**
 * Cached function wrapper
 */
export function withCache<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    keyGenerator: (...args: Parameters<T>) => string;
    ttl?: number;
  }
): T {
  return (async (...args: Parameters<T>) => {
    const cacheKey = options.keyGenerator(...args);

    // Try to get from cache first
    const cached = memoryCache.get(cacheKey);
    if (cached !== null) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn(...args);
    memoryCache.set(cacheKey, result, options.ttl);

    return result;
  }) as T;
}

/**
 * HTTP cache headers for Next.js responses
 */
export function setCacheHeaders(
  response: NextResponse,
  duration: number = CACHE_DURATIONS.MEDIUM,
  options: {
    staleWhileRevalidate?: number;
    mustRevalidate?: boolean;
    noCache?: boolean;
  } = {}
): NextResponse {
  const {
    staleWhileRevalidate = duration / 2,
    mustRevalidate = false,
    noCache = false,
  } = options;

  if (noCache) {
    response.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  } else {
    const cacheControl = [
      `max-age=${duration}`,
      `s-maxage=${duration}`,
      `stale-while-revalidate=${staleWhileRevalidate}`,
    ];

    if (mustRevalidate) {
      cacheControl.push('must-revalidate');
    }

    response.headers.set('Cache-Control', cacheControl.join(', '));
  }

  return response;
}

/**
 * Invalidate cache entries by pattern
 */
export function invalidateCache(pattern: string): number {
  let count = 0;
  const regex = new RegExp(pattern.replace(/\*/g, '.*'));

  for (const key of memoryCache.stats().keys) {
    if (regex.test(key)) {
      memoryCache.delete(key);
      count++;
    }
  }

  return count;
}

/**
 * Cache middleware for API routes
 */
export function cacheMiddleware(
  duration: number = CACHE_DURATIONS.MEDIUM,
  keyGenerator?: (req: NextRequest) => string
) {
  return async (
    req: NextRequest,
    context: { params?: any },
    next: () => Promise<NextResponse>
  ): Promise<NextResponse> => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator
      ? keyGenerator(req)
      : generateCacheKey(req.url, Object.fromEntries(req.nextUrl.searchParams));

    // Try to get from cache
    const cached = memoryCache.get(cacheKey);
    if (cached !== null) {
      const response = NextResponse.json(cached);
      response.headers.set('X-Cache', 'HIT');
      return setCacheHeaders(response, duration);
    }

    // Execute handler and cache result
    const response = await next();

    if (response.ok) {
      const data = await response.json();
      memoryCache.set(cacheKey, data, duration);

      const newResponse = NextResponse.json(data);
      newResponse.headers.set('X-Cache', 'MISS');
      return setCacheHeaders(newResponse, duration);
    }

    return response;
  };
}

/**
 * Redis cache implementation (for production)
 * Requires Redis client to be configured
 */
export class RedisCache {
  private client: any; // Redis client type

  constructor(client: any) {
    this.client = client;
  }

  async set(
    key: string,
    data: any,
    ttl: number = CACHE_DURATIONS.MEDIUM
  ): Promise<void> {
    const serialized = JSON.stringify(data);
    await this.client.setex(key, ttl, serialized);
  }

  async get<T = any>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async delete(key: string): Promise<boolean> {
    const result = await this.client.del(key);
    return result > 0;
  }

  async flush(): Promise<void> {
    await this.client.flushall();
  }

  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  async invalidate(pattern: string): Promise<number> {
    const keys = await this.keys(pattern);
    if (keys.length === 0) return 0;

    return this.client.del(...keys);
  }
}

/**
 * Edge cache for Vercel deployments
 */
export function setEdgeCacheHeaders(
  response: NextResponse,
  duration: number = CACHE_DURATIONS.MEDIUM
): NextResponse {
  // Vercel Edge Cache headers
  response.headers.set(
    'Cache-Control',
    `s-maxage=${duration}, stale-while-revalidate`
  );
  response.headers.set('CDN-Cache-Control', `max-age=${duration}`);
  response.headers.set('Vercel-CDN-Cache-Control', `max-age=${duration}`);

  return response;
}

/**
 * Cache warmup utility
 */
export async function warmupCache(
  urls: string[],
  options: RequestInit = {}
): Promise<void> {
  const promises = urls.map(url =>
    fetch(url, {
      ...options,
      headers: {
        'Cache-Control': 'no-cache',
        ...options.headers,
      },
    }).catch(console.error)
  );

  await Promise.allSettled(promises);
}

/**
 * Cache performance monitoring
 */
export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  memory: number;
}

export class CacheMonitor {
  private hits = 0;
  private misses = 0;

  recordHit(): void {
    this.hits++;
  }

  recordMiss(): void {
    this.misses++;
  }

  getMetrics(): CacheMetrics {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? this.hits / total : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      size: memoryCache.size(),
      memory: process.memoryUsage?.()?.heapUsed || 0,
    };
  }

  reset(): void {
    this.hits = 0;
    this.misses = 0;
  }
}

export const cacheMonitor = new CacheMonitor();
