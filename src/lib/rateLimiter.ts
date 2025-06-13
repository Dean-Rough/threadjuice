import { logger } from './logger';

/**
 * Rate limiter with exponential backoff for API requests
 * Implements token bucket algorithm with sliding window
 */
export class RateLimiter {
  protected tokens: number;
  protected lastRefill: number;
  protected readonly maxTokens: number;
  protected readonly refillRate: number; // tokens per second
  protected readonly minInterval: number; // minimum time between requests (ms)
  protected lastRequestTime: number = 0;

  constructor(
    maxRequestsPerMinute: number = 60,
    burstSize?: number
  ) {
    this.maxTokens = burstSize || Math.ceil(maxRequestsPerMinute / 4); // Allow burst of 1/4 of rate limit
    this.refillRate = maxRequestsPerMinute / 60; // Convert to tokens per second
    this.minInterval = (60 * 1000) / maxRequestsPerMinute; // Minimum interval between requests
    this.tokens = this.maxTokens;
    this.lastRefill = Date.now();
    
    logger.info('RateLimiter initialized', {
      maxRequestsPerMinute,
      maxTokens: this.maxTokens,
      refillRate: this.refillRate,
      minInterval: this.minInterval
    });
  }

  /**
   * Refill tokens based on elapsed time
   */
  protected refillTokens(): void {
    const now = Date.now();
    const timePassed = (now - this.lastRefill) / 1000; // Convert to seconds
    const tokensToAdd = timePassed * this.refillRate;
    
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Check if a request can be made immediately
   */
  canMakeRequest(): boolean {
    this.refillTokens();
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    return this.tokens >= 1 && timeSinceLastRequest >= this.minInterval;
  }

  /**
   * Wait until a request can be made, then consume a token
   */
  async waitForToken(): Promise<void> {
    while (!this.canMakeRequest()) {
      this.refillTokens();
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      let waitTime = 0;
      
      if (this.tokens < 1) {
        // Wait for token refill
        const timeForNextToken = (1 - this.tokens) / this.refillRate * 1000;
        waitTime = Math.max(waitTime, timeForNextToken);
      }
      
      if (timeSinceLastRequest < this.minInterval) {
        // Wait for minimum interval
        waitTime = Math.max(waitTime, this.minInterval - timeSinceLastRequest);
      }
      
      if (waitTime > 0) {
        logger.debug('Rate limiter waiting', { waitTime, tokens: this.tokens });
        await this.sleep(Math.ceil(waitTime));
      }
    }
    
    // Consume token
    this.tokens -= 1;
    this.lastRequestTime = Date.now();
  }

  /**
   * Get current rate limit status
   */
  getStatus(): {
    tokens: number;
    maxTokens: number;
    canMakeRequest: boolean;
    nextTokenIn: number;
  } {
    this.refillTokens();
    const nextTokenIn = this.tokens >= this.maxTokens 
      ? 0 
      : ((1 - (this.tokens % 1)) / this.refillRate) * 1000;
    
    return {
      tokens: this.tokens,
      maxTokens: this.maxTokens,
      canMakeRequest: this.canMakeRequest(),
      nextTokenIn
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Exponential backoff utility for retrying failed requests
 */
export class ExponentialBackoff {
  private attempt: number = 0;
  private readonly maxRetries: number;
  private readonly baseDelay: number;
  private readonly maxDelay: number;
  private readonly jitter: boolean;

  constructor(
    maxRetries: number = 3,
    baseDelay: number = 1000,
    maxDelay: number = 30000,
    jitter: boolean = true
  ) {
    this.maxRetries = maxRetries;
    this.baseDelay = baseDelay;
    this.maxDelay = maxDelay;
    this.jitter = jitter;
  }

  /**
   * Execute a function with exponential backoff retry logic
   */
  async execute<T>(
    fn: () => Promise<T>,
    shouldRetry?: (error: any) => boolean
  ): Promise<T> {
    this.attempt = 0;
    
    while (this.attempt <= this.maxRetries) {
      try {
        const result = await fn();
        if (this.attempt > 0) {
          logger.info('Request succeeded after retries', { attempt: this.attempt });
        }
        return result;
             } catch (error) {
         this.attempt++;
         const errorMessage = error instanceof Error ? error.message : String(error);
         
         // Check if we should retry this error
         if (shouldRetry && !shouldRetry(error)) {
           logger.debug('Error not retryable', { error: errorMessage });
           throw error;
         }
         
         // Check if we've exceeded max retries
         if (this.attempt > this.maxRetries) {
           logger.error('Max retries exceeded', { 
             attempt: this.attempt, 
             maxRetries: this.maxRetries,
             error: errorMessage 
           });
           throw error;
         }
         
         // Calculate delay with exponential backoff
         const delay = this.calculateDelay();
         logger.warn('Request failed, retrying', { 
           attempt: this.attempt, 
           delay, 
           error: errorMessage 
         });
         
         await this.sleep(delay);
       }
    }
    
    throw new Error('Unexpected end of retry loop');
  }

  /**
   * Calculate delay for current attempt with exponential backoff
   */
  private calculateDelay(): number {
    const exponentialDelay = this.baseDelay * Math.pow(2, this.attempt - 1);
    let delay = Math.min(exponentialDelay, this.maxDelay);
    
    // Add jitter to prevent thundering herd
    if (this.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }
    
    return Math.floor(delay);
  }

  /**
   * Reset attempt counter
   */
  reset(): void {
    this.attempt = 0;
  }

  /**
   * Get current attempt number
   */
  getCurrentAttempt(): number {
    return this.attempt;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Reddit-specific rate limiter that handles Reddit API rate limits
 * Reddit allows 60 requests per minute for OAuth apps
 */
export class RedditRateLimiter extends RateLimiter {
  constructor() {
    super(60, 15); // 60 requests per minute, burst of 15
  }

  /**
   * Handle Reddit API rate limit headers
   */
  updateFromHeaders(headers: Headers): void {
    const remaining = headers.get('x-ratelimit-remaining');
    const resetTime = headers.get('x-ratelimit-reset');
    const used = headers.get('x-ratelimit-used');
    
    if (remaining && resetTime) {
      logger.debug('Reddit rate limit info', {
        remaining: parseInt(remaining),
        resetTime: parseInt(resetTime),
        used: used ? parseInt(used) : undefined
      });
      
             // If we're close to the limit, be more conservative
       const remainingRequests = parseInt(remaining);
       if (remainingRequests < 5) {
         logger.warn('Approaching Reddit rate limit', { remaining: remainingRequests });
         // Force a longer wait by consuming extra tokens
         this.refillTokens();
         this.tokens = Math.min(this.tokens, 1);
       }
    }
  }
}

/**
 * Create a default Reddit rate limiter instance
 */
export const redditRateLimiter = new RedditRateLimiter();

/**
 * Create an exponential backoff instance for Reddit API
 */
export const redditBackoff = new ExponentialBackoff(
  3, // max retries
  1000, // base delay (1 second)
  10000, // max delay (10 seconds)
  true // jitter enabled
); 