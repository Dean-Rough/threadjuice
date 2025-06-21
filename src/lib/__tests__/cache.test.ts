import {
  memoryCache,
  generateCacheKey,
  withCache,
  setCacheHeaders,
  invalidateCache,
  CACHE_DURATIONS,
  CACHE_KEYS,
  CacheMonitor,
  cacheMonitor,
} from '../cache';
import { NextResponse } from 'next/server.js';

// Mock Next.js response
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn().mockImplementation(data => ({
      data,
      headers: new Map(),
      ok: true,
      json: jest.fn().mockResolvedValue(data),
    })),
  },
}));

describe('Cache Utilities', () => {
  beforeEach(() => {
    memoryCache.clear();
    jest.clearAllMocks();
  });

  describe('memoryCache', () => {
    it('should set and get cache entries', () => {
      const key = 'test-key';
      const data = { message: 'test data' };

      memoryCache.set(key, data, CACHE_DURATIONS.SHORT);
      const result = memoryCache.get(key);

      expect(result).toEqual(data);
    });

    it('should return null for expired entries', async () => {
      const key = 'test-key';
      const data = { message: 'test data' };

      // Set with very short TTL
      memoryCache.set(key, data, 0.001); // 1ms

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 10));

      const result = memoryCache.get(key);
      expect(result).toBeNull();
    });

    it('should delete cache entries', () => {
      const key = 'test-key';
      const data = { message: 'test data' };

      memoryCache.set(key, data);
      expect(memoryCache.get(key)).toEqual(data);

      const deleted = memoryCache.delete(key);
      expect(deleted).toBe(true);
      expect(memoryCache.get(key)).toBeNull();
    });

    it('should cleanup expired entries', async () => {
      memoryCache.set('key1', 'data1', 0.001); // 1ms
      memoryCache.set('key2', 'data2', CACHE_DURATIONS.HOUR);

      expect(memoryCache.size()).toBe(2);

      // Wait for first entry to expire
      await new Promise(resolve => setTimeout(resolve, 10));

      memoryCache.cleanup();
      expect(memoryCache.size()).toBe(1);
      expect(memoryCache.get('key2')).toBe('data2');
    });

    it('should provide cache statistics', () => {
      memoryCache.set('key1', 'data1');
      memoryCache.set('key2', 'data2');

      const stats = memoryCache.stats();
      expect(stats.size).toBe(2);
      expect(stats.keys).toContain('key1');
      expect(stats.keys).toContain('key2');
    });
  });

  describe('generateCacheKey', () => {
    it('should generate consistent cache keys', () => {
      const baseKey = 'posts';
      const params = { page: 1, limit: 10 };

      const key1 = generateCacheKey(baseKey, params);
      const key2 = generateCacheKey(baseKey, params);

      expect(key1).toBe(key2);
      expect(key1).toBe('posts:limit:10|page:1');
    });

    it('should handle empty parameters', () => {
      const baseKey = 'posts';
      const key = generateCacheKey(baseKey);

      expect(key).toBe('posts');
    });

    it('should sort parameters consistently', () => {
      const baseKey = 'posts';
      const params1 = { page: 1, limit: 10, sort: 'date' };
      const params2 = { sort: 'date', limit: 10, page: 1 };

      const key1 = generateCacheKey(baseKey, params1);
      const key2 = generateCacheKey(baseKey, params2);

      expect(key1).toBe(key2);
    });
  });

  describe('withCache', () => {
    it('should cache function results', async () => {
      let callCount = 0;
      const mockFn = jest.fn().mockImplementation(async (id: string) => {
        callCount++;
        return { id, data: `result-${id}` };
      });

      const cachedFn = withCache(mockFn, {
        keyGenerator: (id: string) => `test:${id}`,
        ttl: CACHE_DURATIONS.SHORT,
      });

      // First call
      const result1 = await cachedFn('123');
      expect(result1).toEqual({ id: '123', data: 'result-123' });
      expect(callCount).toBe(1);

      // Second call should use cache
      const result2 = await cachedFn('123');
      expect(result2).toEqual({ id: '123', data: 'result-123' });
      expect(callCount).toBe(1); // No additional call

      // Different parameter should call function again
      const result3 = await cachedFn('456');
      expect(result3).toEqual({ id: '456', data: 'result-456' });
      expect(callCount).toBe(2);
    });
  });

  describe('setCacheHeaders', () => {
    it('should set cache headers on response', () => {
      const mockResponse = {
        headers: new Map<string, string>(),
      } as any;

      const response = setCacheHeaders(mockResponse, CACHE_DURATIONS.HOUR);

      expect(response.headers.get('Cache-Control')).toContain('max-age=3600');
      expect(response.headers.get('Cache-Control')).toContain('s-maxage=3600');
      expect(response.headers.get('Cache-Control')).toContain(
        'stale-while-revalidate=1800'
      );
    });

    it('should set no-cache headers when specified', () => {
      const mockResponse = {
        headers: new Map<string, string>(),
      } as any;

      const response = setCacheHeaders(mockResponse, CACHE_DURATIONS.HOUR, {
        noCache: true,
      });

      expect(response.headers.get('Cache-Control')).toBe(
        'no-cache, no-store, must-revalidate'
      );
      expect(response.headers.get('Pragma')).toBe('no-cache');
      expect(response.headers.get('Expires')).toBe('0');
    });
  });

  describe('invalidateCache', () => {
    it('should invalidate cache entries by pattern', () => {
      memoryCache.set('posts:page:1', 'data1');
      memoryCache.set('posts:page:2', 'data2');
      memoryCache.set('users:profile:123', 'data3');

      const count = invalidateCache('posts:*');

      expect(count).toBe(2);
      expect(memoryCache.get('posts:page:1')).toBeNull();
      expect(memoryCache.get('posts:page:2')).toBeNull();
      expect(memoryCache.get('users:profile:123')).toBe('data3');
    });
  });

  describe('CacheMonitor', () => {
    let monitor: CacheMonitor;

    beforeEach(() => {
      monitor = new CacheMonitor();
    });

    it('should track cache hits and misses', () => {
      monitor.recordHit();
      monitor.recordHit();
      monitor.recordMiss();

      const metrics = monitor.getMetrics();

      expect(metrics.hits).toBe(2);
      expect(metrics.misses).toBe(1);
      expect(metrics.hitRate).toBe(0.67); // 2/3 rounded
    });

    it('should calculate hit rate correctly', () => {
      // No hits or misses initially
      expect(monitor.getMetrics().hitRate).toBe(0);

      monitor.recordHit();
      expect(monitor.getMetrics().hitRate).toBe(1);

      monitor.recordMiss();
      expect(monitor.getMetrics().hitRate).toBe(0.5);
    });

    it('should reset metrics', () => {
      monitor.recordHit();
      monitor.recordMiss();

      monitor.reset();

      const metrics = monitor.getMetrics();
      expect(metrics.hits).toBe(0);
      expect(metrics.misses).toBe(0);
      expect(metrics.hitRate).toBe(0);
    });
  });

  describe('Cache Constants', () => {
    it('should have correct cache durations', () => {
      expect(CACHE_DURATIONS.SHORT).toBe(60);
      expect(CACHE_DURATIONS.MEDIUM).toBe(300);
      expect(CACHE_DURATIONS.LONG).toBe(1800);
      expect(CACHE_DURATIONS.HOUR).toBe(3600);
      expect(CACHE_DURATIONS.DAY).toBe(86400);
    });

    it('should have cache keys defined', () => {
      expect(CACHE_KEYS.POSTS).toBe('posts');
      expect(CACHE_KEYS.TRENDING).toBe('trending');
      expect(CACHE_KEYS.REDDIT_DATA).toBe('reddit_data');
    });
  });
});

describe('Cache Integration', () => {
  it('should handle concurrent access', async () => {
    const key = 'concurrent-test';
    const promises = [];

    // Start multiple concurrent cache operations
    for (let i = 0; i < 10; i++) {
      promises.push(
        new Promise(resolve => {
          memoryCache.set(`${key}-${i}`, `data-${i}`);
          const result = memoryCache.get(`${key}-${i}`);
          resolve(result);
        })
      );
    }

    const results = await Promise.all(promises);

    // All operations should complete successfully
    results.forEach((result, index) => {
      expect(result).toBe(`data-${index}`);
    });
  });

  it('should handle memory pressure gracefully', () => {
    const initialSize = memoryCache.size();

    // Fill cache with many entries
    for (let i = 0; i < 1000; i++) {
      memoryCache.set(`stress-test-${i}`, `data-${i}`, CACHE_DURATIONS.SHORT);
    }

    expect(memoryCache.size()).toBe(initialSize + 1000);

    // Cache should still function normally
    memoryCache.set('test-key', 'test-data');
    expect(memoryCache.get('test-key')).toBe('test-data');
  });
});
