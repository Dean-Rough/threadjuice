import { config } from './env';
import { logger } from './logger';
import { redditRateLimiter, redditBackoff } from './rateLimiter';
import {
  RedditAuthResponse,
  RedditPostsResponse,
  RedditCommentsResponse,
  RedditPost,
  RedditComment,
  RedditAPIError,
  RedditRateLimitError,
  RedditAuthError,
  RedditScraperConfig,
  GetPostsOptions,
  GetCommentsOptions,
  RateLimitInfo
} from '@/types/reddit';

/**
 * Reddit API client with OAuth2 authentication and rate limiting
 * Implements Reddit API v1 with proper error handling and retry logic
 */
export class RedditScraper {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private readonly config: RedditScraperConfig;
  private readonly baseUrl = 'https://oauth.reddit.com';
  private readonly authUrl = 'https://www.reddit.com/api/v1/access_token';

  constructor(scraperConfig?: Partial<RedditScraperConfig>) {
    this.config = {
      clientId: scraperConfig?.clientId || config.reddit.clientId,
      clientSecret: scraperConfig?.clientSecret || config.reddit.clientSecret,
      userAgent: scraperConfig?.userAgent || config.reddit.userAgent,
      rateLimitPerMinute: scraperConfig?.rateLimitPerMinute || 60,
      maxRetries: scraperConfig?.maxRetries || 3,
      retryDelay: scraperConfig?.retryDelay || 1000,
    };

    logger.info('RedditScraper initialized', {
      userAgent: this.config.userAgent,
      rateLimitPerMinute: this.config.rateLimitPerMinute
    });
  }

  /**
   * Authenticate with Reddit API using OAuth2 client credentials flow
   */
  async authenticate(): Promise<void> {
    try {
      logger.info('Authenticating with Reddit API');

      const credentials = Buffer.from(
        `${this.config.clientId}:${this.config.clientSecret}`
      ).toString('base64');

      const response = await fetch(this.authUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'User-Agent': this.config.userAgent,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new RedditAuthError(
          `Authentication failed: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const authData: RedditAuthResponse = await response.json();
      
      this.accessToken = authData.access_token;
      this.tokenExpiry = Date.now() + (authData.expires_in * 1000) - 60000; // Refresh 1 minute early
      
      logger.info('Reddit authentication successful', {
        tokenType: authData.token_type,
        expiresIn: authData.expires_in,
        scope: authData.scope
      });
    } catch (error) {
      logger.error('Reddit authentication failed', { error });
      throw error;
    }
  }

  /**
   * Check if current token is valid and refresh if needed
   */
  private async ensureAuthenticated(): Promise<void> {
    if (!this.accessToken || Date.now() >= this.tokenExpiry) {
      await this.authenticate();
    }
  }

  /**
   * Make authenticated request to Reddit API with rate limiting and retry logic
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    await this.ensureAuthenticated();
    await redditRateLimiter.waitForToken();

    const url = `${this.baseUrl}${endpoint}`;
    
    return redditBackoff.execute(
      async () => {
        logger.debug('Making Reddit API request', { url, method: options.method || 'GET' });

        const response = await fetch(url, {
          ...options,
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'User-Agent': this.config.userAgent,
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });

        // Update rate limiter with response headers
        redditRateLimiter.updateFromHeaders(response.headers);

        if (!response.ok) {
          await this.handleErrorResponse(response);
        }

        const data = await response.json();
        logger.debug('Reddit API request successful', { url, status: response.status });
        
        return data;
      },
      (error) => this.shouldRetryError(error)
    );
  }

  /**
   * Handle error responses from Reddit API
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    const errorText = await response.text();
    let errorData;
    
    try {
      errorData = JSON.parse(errorText);
    } catch {
      errorData = { error: errorText };
    }

    const errorMessage = `Reddit API error: ${response.status} ${response.statusText}`;
    
    switch (response.status) {
      case 401:
        // Clear token to force re-authentication
        this.accessToken = null;
        this.tokenExpiry = 0;
        throw new RedditAuthError(`${errorMessage} - ${errorData.error || 'Unauthorized'}`);
      
      case 429:
        const resetTime = response.headers.get('x-ratelimit-reset');
        const remaining = response.headers.get('x-ratelimit-remaining');
        throw new RedditRateLimitError(
          `${errorMessage} - Rate limit exceeded`,
          resetTime ? parseInt(resetTime) : Date.now() + 60000,
          remaining ? parseInt(remaining) : 0
        );
      
      case 403:
        throw new RedditAPIError(`${errorMessage} - Forbidden: ${errorData.error || 'Access denied'}`, 403, errorData);
      
      case 404:
        throw new RedditAPIError(`${errorMessage} - Not found: ${errorData.error || 'Resource not found'}`, 404, errorData);
      
      case 500:
      case 502:
      case 503:
      case 504:
        throw new RedditAPIError(`${errorMessage} - Server error: ${errorData.error || 'Internal server error'}`, response.status, errorData);
      
      default:
        throw new RedditAPIError(`${errorMessage} - ${errorData.error || 'Unknown error'}`, response.status, errorData);
    }
  }

  /**
   * Determine if an error should be retried
   */
  private shouldRetryError(error: any): boolean {
    if (error instanceof RedditRateLimitError) {
      return true; // Rate limit errors should be retried
    }
    
    if (error instanceof RedditAuthError) {
      return true; // Auth errors should be retried (will trigger re-authentication)
    }
    
    if (error instanceof RedditAPIError) {
      // Retry server errors but not client errors
      return error.statusCode ? error.statusCode >= 500 : false;
    }
    
    // Retry network errors
    return error.name === 'TypeError' || error.name === 'FetchError';
  }

  /**
   * Get hot posts from a subreddit
   */
  async getHotPosts(options: GetPostsOptions): Promise<RedditPost[]> {
    const {
      subreddit,
      sort = 'hot',
      time,
      limit = 25,
      after,
      before
    } = options;

    const params = new URLSearchParams({
      limit: limit.toString(),
      raw_json: '1'
    });

    if (after) params.append('after', after);
    if (before) params.append('before', before);
    if (time && sort === 'top') params.append('t', time);

    const endpoint = `/r/${subreddit}/${sort}?${params.toString()}`;
    
    try {
      const response: RedditPostsResponse = await this.makeRequest(endpoint);
      const posts = response.data.children.map(child => child.data);
      
      logger.info('Retrieved Reddit posts', {
        subreddit,
        sort,
        count: posts.length,
        after: response.data.after
      });
      
      return posts;
    } catch (error) {
      logger.error('Failed to get Reddit posts', { subreddit, sort, error });
      throw error;
    }
  }

  /**
   * Get comments for a specific post
   */
  async getComments(options: GetCommentsOptions): Promise<{
    post: RedditPost;
    comments: RedditComment[];
  }> {
    const {
      subreddit,
      postId,
      sort = 'confidence',
      limit = 100,
      depth = 10,
      context = 3
    } = options;

    const params = new URLSearchParams({
      sort,
      limit: limit.toString(),
      depth: depth.toString(),
      context: context.toString(),
      raw_json: '1'
    });

    const endpoint = `/r/${subreddit}/comments/${postId}?${params.toString()}`;
    
    try {
      const response: RedditCommentsResponse = await this.makeRequest(endpoint);
      
      const post = response[0].data.children[0].data;
      const comments = this.flattenComments(response[1].data.children);
      
      logger.info('Retrieved Reddit comments', {
        subreddit,
        postId,
        commentCount: comments.length
      });
      
      return { post, comments };
    } catch (error) {
      logger.error('Failed to get Reddit comments', { subreddit, postId, error });
      throw error;
    }
  }

  /**
   * Flatten nested comment structure into a flat array
   */
  private flattenComments(commentThings: any[], depth: number = 0): RedditComment[] {
    const comments: RedditComment[] = [];
    
    for (const thing of commentThings) {
      if (thing.kind === 't1') { // Comment
        const comment = { ...thing.data, depth };
        comments.push(comment);
        
        // Process replies if they exist
        if (comment.replies && typeof comment.replies === 'object' && comment.replies.data) {
          const nestedComments = this.flattenComments(
            comment.replies.data.children,
            depth + 1
          );
          comments.push(...nestedComments);
        }
      }
    }
    
    return comments;
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(): RateLimitInfo & { canMakeRequest: boolean } {
    const status = redditRateLimiter.getStatus();
    return {
      remaining: Math.floor(status.tokens),
      used: status.maxTokens - Math.floor(status.tokens),
      resetTime: Date.now() + status.nextTokenIn,
      canMakeRequest: status.canMakeRequest
    };
  }

  /**
   * Check if the scraper is authenticated
   */
  isAuthenticated(): boolean {
    return this.accessToken !== null && Date.now() < this.tokenExpiry;
  }
}

/**
 * Create a default Reddit scraper instance
 */
export const redditScraper = new RedditScraper();

/**
 * Utility function to extract post ID from Reddit URL
 */
export function extractPostIdFromUrl(url: string): string | null {
  const match = url.match(/\/comments\/([a-z0-9]+)\//);
  return match ? match[1] : null;
}

/**
 * Utility function to clean Reddit text content
 */
export function cleanRedditText(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/\n{3,}/g, '\n\n') // Reduce multiple newlines
    .trim();
}

/**
 * Utility function to determine if a post is suitable for processing
 */
export function isPostSuitable(post: RedditPost): boolean {
  // Filter out removed, deleted, or locked posts
  if (post.removed_by_category || post.locked || post.archived) {
    return false;
  }

  // Filter out posts without content
  if (!post.selftext && !post.url) {
    return false;
  }

  // Filter out very short posts
  if (post.selftext && post.selftext.length < 100) {
    return false;
  }

  // Filter out posts with very low engagement
  if (post.score < 10 || post.num_comments < 5) {
    return false;
  }

  return true;
} 