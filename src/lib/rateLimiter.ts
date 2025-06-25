/**
 * Rate Limiter Utility
 * Handles exponential backoff and request throttling for external APIs
 */

interface RateLimitConfig {
  maxRetries: number;
  baseDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
}

interface RequestTracker {
  lastRequest: number;
  requestCount: number;
  windowStart: number;
  windowDuration: number; // milliseconds
  maxRequests: number;
}

export class RateLimiter {
  private config: RateLimitConfig;
  private tracker: RequestTracker;

  constructor(
    maxRequests: number = 60,
    windowDuration: number = 60 * 1000, // 1 minute default
    config: Partial<RateLimitConfig> = {}
  ) {
    this.config = {
      maxRetries: 3,
      baseDelay: 1000, // 1 second
      maxDelay: 30000, // 30 seconds
      backoffMultiplier: 2,
      ...config,
    };

    this.tracker = {
      lastRequest: 0,
      requestCount: 0,
      windowStart: Date.now(),
      windowDuration,
      maxRequests,
    };
  }

  /**
   * Check if a request can be made and update tracking
   */
  async checkRateLimit(): Promise<void> {
    const now = Date.now();

    // Reset window if needed
    if (now - this.tracker.windowStart >= this.tracker.windowDuration) {
      this.tracker.windowStart = now;
      this.tracker.requestCount = 0;
    }

    // Check if we've exceeded rate limit
    if (this.tracker.requestCount >= this.tracker.maxRequests) {
      const waitTime =
        this.tracker.windowDuration - (now - this.tracker.windowStart);
      if (waitTime > 0) {
        // console.log(`Rate limit exceeded. Waiting ${waitTime}ms`);
        await this.delay(waitTime);

        // Reset after waiting
        this.tracker.windowStart = Date.now();
        this.tracker.requestCount = 0;
      }
    }

    // Update tracking
    this.tracker.requestCount++;
    this.tracker.lastRequest = now;
  }

  /**
   * Execute a request with exponential backoff retry logic
   */
  async executeWithBackoff<T>(
    requestFn: () => Promise<T>,
    retryCount: number = 0
  ): Promise<T> {
    try {
      await this.checkRateLimit();
      return await requestFn();
    } catch (error) {
      // Check if we should retry
      if (retryCount >= this.config.maxRetries) {
        throw error;
      }

      // Check if error is rate limit related
      if (this.isRateLimitError(error)) {
        const delay = this.calculateBackoffDelay(retryCount);
        // console.log(`Rate limit error. Retrying in ${delay}ms (attempt ${retryCount + 1}/${this.config.maxRetries})`);

        await this.delay(delay);
        return this.executeWithBackoff(requestFn, retryCount + 1);
      }

      // If it's not a rate limit error, check if it's a temporary error
      if (this.isTemporaryError(error)) {
        const delay = this.calculateBackoffDelay(retryCount);
        // console.log(`Temporary error. Retrying in ${delay}ms (attempt ${retryCount + 1}/${this.config.maxRetries})`);

        await this.delay(delay);
        return this.executeWithBackoff(requestFn, retryCount + 1);
      }

      // If it's not retryable, throw immediately
      throw error;
    }
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoffDelay(retryCount: number): number {
    const delay =
      this.config.baseDelay *
      Math.pow(this.config.backoffMultiplier, retryCount);
    return Math.min(delay, this.config.maxDelay);
  }

  /**
   * Check if error is rate limit related
   */
  private isRateLimitError(error: any): boolean {
    if (error?.response?.status === 429) return true;
    if (error?.status === 429) return true;
    if (error?.message?.includes('rate limit')) return true;
    if (error?.message?.includes('too many requests')) return true;
    return false;
  }

  /**
   * Check if error is temporary and should be retried
   */
  private isTemporaryError(error: any): boolean {
    // Network errors
    if (error?.code === 'ECONNRESET') return true;
    if (error?.code === 'ENOTFOUND') return true;
    if (error?.code === 'ETIMEDOUT') return true;

    // HTTP status codes that should be retried
    const retryableStatusCodes = [500, 502, 503, 504];
    if (
      error?.response?.status &&
      retryableStatusCodes.includes(error.response.status)
    ) {
      return true;
    }
    if (error?.status && retryableStatusCodes.includes(error.status)) {
      return true;
    }

    return false;
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current rate limit status
   */
  getStatus(): {
    requestsRemaining: number;
    windowTimeRemaining: number;
    lastRequestTime: number;
  } {
    const now = Date.now();
    const windowTimeRemaining = Math.max(
      0,
      this.tracker.windowDuration - (now - this.tracker.windowStart)
    );

    return {
      requestsRemaining: Math.max(
        0,
        this.tracker.maxRequests - this.tracker.requestCount
      ),
      windowTimeRemaining,
      lastRequestTime: this.tracker.lastRequest,
    };
  }

  /**
   * Reset rate limit tracking (useful for testing)
   */
  reset(): void {
    this.tracker = {
      lastRequest: 0,
      requestCount: 0,
      windowStart: Date.now(),
      windowDuration: this.tracker.windowDuration,
      maxRequests: this.tracker.maxRequests,
    };
  }
}

// Reddit-specific rate limiter (60 requests per minute)
export const redditRateLimiter = new RateLimiter(60, 60 * 1000, {
  maxRetries: 3,
  baseDelay: 2000, // 2 seconds
  maxDelay: 60000, // 1 minute
  backoffMultiplier: 2,
});

// OpenAI-specific rate limiter (more generous for GPT API)
export const openaiRateLimiter = new RateLimiter(200, 60 * 1000, {
  maxRetries: 5,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 1.5,
});
