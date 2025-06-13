import { 
  RateLimiter, 
  ExponentialBackoff, 
  RedditRateLimiter,
  redditRateLimiter,
  redditBackoff 
} from '@/lib/rateLimiter';
import { logger } from '@/lib/logger';

// Mock logger
jest.mock('@/lib/logger');

describe('RateLimiter', () => {
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    jest.clearAllMocks();
    rateLimiter = new RateLimiter(60, 15); // 60 requests per minute, burst of 15
  });

  describe('Constructor', () => {
    it('should initialize with correct parameters', () => {
      expect(rateLimiter).toBeInstanceOf(RateLimiter);
      expect(logger.info).toHaveBeenCalledWith('RateLimiter initialized', {
        maxRequestsPerMinute: 60,
        maxTokens: 15,
        refillRate: 1,
        minInterval: 1000
      });
    });

    it('should use default burst size if not provided', () => {
      const defaultRateLimiter = new RateLimiter(60);
      expect(defaultRateLimiter).toBeInstanceOf(RateLimiter);
    });
  });

  describe('Token Management', () => {
    it('should allow requests when tokens are available', () => {
      expect(rateLimiter.canMakeRequest()).toBe(true);
    });

    it('should return correct status', () => {
      const status = rateLimiter.getStatus();
      
      expect(status).toEqual({
        tokens: 15,
        maxTokens: 15,
        canMakeRequest: true,
        nextTokenIn: 0
      });
    });

    it('should consume tokens when waiting', async () => {
      const initialStatus = rateLimiter.getStatus();
      expect(initialStatus.tokens).toBe(15);

      await rateLimiter.waitForToken();
      
      const afterStatus = rateLimiter.getStatus();
      expect(afterStatus.tokens).toBeLessThan(15);
    });

    it('should handle token depletion', async () => {
      // Create a very limited rate limiter
      const limitedLimiter = new RateLimiter(60, 2); // 60 requests per minute, burst of 2
      
      // Consume all tokens
      await limitedLimiter.waitForToken();
      await limitedLimiter.waitForToken();

      const status = limitedLimiter.getStatus();
      expect(status.tokens).toBeLessThanOrEqual(1);
      expect(status.canMakeRequest).toBe(false);
    });
  });

  describe('Token Refill', () => {
    it('should track token refill status', async () => {
      // Test that the status method works correctly
      const status = rateLimiter.getStatus();
      expect(status).toHaveProperty('tokens');
      expect(status).toHaveProperty('maxTokens');
      expect(status).toHaveProperty('canMakeRequest');
      expect(status).toHaveProperty('nextTokenIn');
      expect(typeof status.nextTokenIn).toBe('number');
    });
  });
});

describe('ExponentialBackoff', () => {
  let backoff: ExponentialBackoff;

  beforeEach(() => {
    jest.clearAllMocks();
    backoff = new ExponentialBackoff(3, 100, 1000, false); // No jitter for predictable tests
  });

  describe('Successful Execution', () => {
    it('should execute function successfully on first try', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      
      const result = await backoff.execute(mockFn);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(backoff.getCurrentAttempt()).toBe(0);
    });
  });

  describe('Retry Logic', () => {
    it('should retry on failure and eventually succeed', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValue('success');
      
      const startTime = Date.now();
      const result = await backoff.execute(mockFn);
      const endTime = Date.now();
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);
      expect(endTime - startTime).toBeGreaterThan(300); // Should have waited for retries
      
      expect(logger.warn).toHaveBeenCalledTimes(2);
      expect(logger.info).toHaveBeenCalledWith('Request succeeded after retries', { attempt: 2 });
    });

    it('should fail after max retries', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Persistent failure'));
      
      await expect(backoff.execute(mockFn)).rejects.toThrow('Persistent failure');
      
      expect(mockFn).toHaveBeenCalledTimes(4); // Initial + 3 retries
      expect(logger.error).toHaveBeenCalledWith('Max retries exceeded', {
        attempt: 4,
        maxRetries: 3,
        error: 'Persistent failure'
      });
    });

    it('should respect shouldRetry function', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Non-retryable error'));
      const shouldRetry = jest.fn().mockReturnValue(false);
      
      await expect(backoff.execute(mockFn, shouldRetry)).rejects.toThrow('Non-retryable error');
      
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(shouldRetry).toHaveBeenCalledWith(expect.any(Error));
      expect(logger.debug).toHaveBeenCalledWith('Error not retryable', { error: 'Non-retryable error' });
    });
  });

  describe('Delay Calculation', () => {
    it('should increase delay exponentially', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockRejectedValueOnce(new Error('Third failure'))
        .mockResolvedValue('success');
      
      const delays: number[] = [];
      const originalWarn = logger.warn as jest.Mock;
      originalWarn.mockImplementation((message, data) => {
        if (data.delay) {
          delays.push(data.delay);
        }
      });
      
      await backoff.execute(mockFn);
      
      expect(delays).toHaveLength(3);
      expect(delays[0]).toBe(100); // Base delay
      expect(delays[1]).toBe(200); // 2x base delay
      expect(delays[2]).toBe(400); // 4x base delay
    });

    it('should cap delay at maximum', async () => {
      const longBackoff = new ExponentialBackoff(5, 100, 300, false);
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Failure 1'))
        .mockRejectedValueOnce(new Error('Failure 2'))
        .mockRejectedValueOnce(new Error('Failure 3'))
        .mockRejectedValueOnce(new Error('Failure 4'))
        .mockResolvedValue('success');
      
      const delays: number[] = [];
      const originalWarn = logger.warn as jest.Mock;
      originalWarn.mockImplementation((message, data) => {
        if (data.delay) {
          delays.push(data.delay);
        }
      });
      
      await longBackoff.execute(mockFn);
      
      expect(delays[0]).toBe(100); // Base delay
      expect(delays[1]).toBe(200); // 2x base delay
      expect(delays[2]).toBe(300); // Capped at max delay
      expect(delays[3]).toBe(300); // Still capped at max delay
    });
  });

  describe('Reset Functionality', () => {
    it('should reset attempt counter', () => {
      backoff.reset();
      expect(backoff.getCurrentAttempt()).toBe(0);
    });
  });
});

describe('RedditRateLimiter', () => {
  let redditLimiter: RedditRateLimiter;

  beforeEach(() => {
    jest.clearAllMocks();
    redditLimiter = new RedditRateLimiter();
  });

  describe('Reddit-specific Features', () => {
    it('should initialize with Reddit-specific settings', () => {
      expect(redditLimiter).toBeInstanceOf(RedditRateLimiter);
      expect(redditLimiter).toBeInstanceOf(RateLimiter);
    });

    it('should handle Reddit rate limit headers', () => {
      const headers = new Headers({
        'x-ratelimit-remaining': '45',
        'x-ratelimit-reset': String(Date.now() + 60000),
        'x-ratelimit-used': '15'
      });

      redditLimiter.updateFromHeaders(headers);

      expect(logger.debug).toHaveBeenCalledWith('Reddit rate limit info', {
        remaining: 45,
        resetTime: expect.any(Number),
        used: 15
      });
    });

    it('should warn when approaching rate limit', () => {
      const headers = new Headers({
        'x-ratelimit-remaining': '3',
        'x-ratelimit-reset': String(Date.now() + 60000),
        'x-ratelimit-used': '57'
      });

      redditLimiter.updateFromHeaders(headers);

      expect(logger.warn).toHaveBeenCalledWith('Approaching Reddit rate limit', { remaining: 3 });
    });

    it('should handle missing headers gracefully', () => {
      const headers = new Headers();
      
      expect(() => redditLimiter.updateFromHeaders(headers)).not.toThrow();
    });
  });
});

describe('Default Instances', () => {
  it('should export default Reddit rate limiter', () => {
    expect(redditRateLimiter).toBeInstanceOf(RedditRateLimiter);
  });

  it('should export default Reddit backoff', () => {
    expect(redditBackoff).toBeInstanceOf(ExponentialBackoff);
  });
});

describe('Integration Tests', () => {
  it('should work together for realistic scenarios', async () => {
    const limiter = new RateLimiter(120, 5); // 120 requests per minute (faster for testing), burst of 5
    const backoff = new ExponentialBackoff(2, 50, 200, false);

    let requestCount = 0;
    const mockApiCall = async () => {
      await limiter.waitForToken();
      requestCount++;
      
      // Simulate occasional failures
      if (requestCount === 3) {
        throw new Error('Temporary failure');
      }
      
      return `Request ${requestCount}`;
    };

    // Make multiple requests
    const results = await Promise.all([
      backoff.execute(mockApiCall),
      backoff.execute(mockApiCall),
      backoff.execute(mockApiCall), // This will fail and retry
      backoff.execute(mockApiCall),
      backoff.execute(mockApiCall)
    ]);

    expect(results).toHaveLength(5);
    expect(results[0]).toBe('Request 1');
    expect(results[1]).toBe('Request 2');
    expect(requestCount).toBeGreaterThan(5); // Should be higher due to retry
  }, 15000);
}); 