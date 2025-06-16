import { env } from './env';
import { redditRateLimiter } from './rateLimiter';
import type {
  RedditResponse,
  RedditListing,
  RedditPost,
  RedditComment,
  RedditTokenResponse,
  RedditScraperConfig,
  RedditFetchOptions,
  RedditCommentsOptions,
  ProcessedRedditPost,
  ProcessedRedditComment,
} from '@/types/reddit';

/**
 * Reddit API Client with OAuth2 authentication and rate limiting
 */
export class RedditScraper {
  private config: RedditScraperConfig;
  private baseUrl = 'https://oauth.reddit.com';
  private authUrl = 'https://www.reddit.com/api/v1/access_token';

  constructor() {
    this.config = {
      clientId: env.REDDIT_CLIENT_ID,
      clientSecret: env.REDDIT_CLIENT_SECRET,
      userAgent: env.REDDIT_USER_AGENT,
    };
  }

  /**
   * Authenticate with Reddit API using OAuth2 client credentials flow
   */
  async authenticate(): Promise<void> {
    try {
      const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64');
      
      const response = await redditRateLimiter.executeWithBackoff(async () => {
        return fetch(this.authUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'User-Agent': this.config.userAgent,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials',
        });
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Reddit OAuth failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const tokenData: RedditTokenResponse = await response.json();
      
      this.config.accessToken = tokenData.access_token;
      this.config.tokenExpiresAt = Date.now() + (tokenData.expires_in * 1000);
      
      console.log('✅ Reddit authentication successful');
    } catch (error) {
      console.error('❌ Reddit authentication failed:', error);
      throw error;
    }
  }

  /**
   * Check if access token is valid and refresh if needed
   */
  private async ensureAuthenticated(): Promise<void> {
    if (!this.config.accessToken || !this.config.tokenExpiresAt) {
      await this.authenticate();
      return;
    }

    // Refresh token if it expires in the next 5 minutes
    if (Date.now() > (this.config.tokenExpiresAt - 5 * 60 * 1000)) {
      console.log('🔄 Refreshing Reddit access token...');
      await this.authenticate();
    }
  }

  /**
   * Make authenticated request to Reddit API
   */
  private async makeRequest<T>(endpoint: string): Promise<T> {
    await this.ensureAuthenticated();

    const response = await redditRateLimiter.executeWithBackoff(async () => {
      return fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'User-Agent': this.config.userAgent,
        },
      });
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Reddit API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  /**
   * Get hot posts from a subreddit
   */
  async getHotPosts(options: RedditFetchOptions): Promise<ProcessedRedditPost[]> {
    const { subreddit, sort = 'hot', time = 'day', limit = 25, after, minScore = 0 } = options;
    
    let endpoint = `/r/${subreddit}/${sort}?limit=${limit}`;
    
    if (time && (sort === 'top' || sort === 'controversial')) {
      endpoint += `&t=${time}`;
    }
    
    if (after) {
      endpoint += `&after=${after}`;
    }

    console.log(`📡 Fetching ${sort} posts from r/${subreddit} (limit: ${limit}, minScore: ${minScore})`);

    const response: RedditResponse<RedditListing> = await this.makeRequest(endpoint);
    
    const posts = response.data.children
      .map(child => child.data as RedditPost)
      .filter(post => post.score >= minScore)
      .map(post => this.processRedditPost(post));

    console.log(`✅ Fetched ${posts.length} posts from r/${subreddit}`);
    return posts;
  }

  /**
   * Get comments for a specific post
   */
  async getComments(options: RedditCommentsOptions): Promise<ProcessedRedditComment[]> {
    const { postId, sort = 'top', limit = 100, depth = 5 } = options;
    
    const endpoint = `/comments/${postId}?sort=${sort}&limit=${limit}&depth=${depth}`;
    
    console.log(`💬 Fetching comments for post ${postId} (limit: ${limit}, depth: ${depth})`);

    const response: [RedditResponse<RedditListing>, RedditResponse<RedditListing>] = await this.makeRequest(endpoint);
    
    // Reddit returns an array: [post_data, comments_data]
    const commentsListing = response[1];
    const comments = commentsListing.data.children
      .map(child => child.data as RedditComment)
      .filter(comment => comment.body && comment.body !== '[deleted]' && comment.body !== '[removed]')
      .map(comment => this.processRedditComment(comment));

    console.log(`✅ Fetched ${comments.length} comments for post ${postId}`);
    return comments;
  }

  /**
   * Get subreddit information
   */
  async getSubredditInfo(subreddit: string): Promise<any> {
    const endpoint = `/r/${subreddit}/about`;
    console.log(`ℹ️ Fetching info for r/${subreddit}`);
    
    const response: RedditResponse<any> = await this.makeRequest(endpoint);
    return response.data;
  }

  /**
   * Search posts across Reddit
   */
  async searchPosts(query: string, options: Partial<RedditFetchOptions> = {}): Promise<ProcessedRedditPost[]> {
    const { subreddit, sort = 'relevance', time = 'week', limit = 25 } = options;
    
    let endpoint = `/search?q=${encodeURIComponent(query)}&sort=${sort}&limit=${limit}`;
    
    if (subreddit) {
      endpoint += `&restrict_sr=true&sr_name=${subreddit}`;
    }
    
    if (time && sort === 'top') {
      endpoint += `&t=${time}`;
    }

    console.log(`🔍 Searching for "${query}" (limit: ${limit})`);

    const response: RedditResponse<RedditListing> = await this.makeRequest(endpoint);
    
    const posts = response.data.children
      .map(child => child.data as RedditPost)
      .map(post => this.processRedditPost(post));

    console.log(`✅ Found ${posts.length} posts for query "${query}"`);
    return posts;
  }

  /**
   * Process raw Reddit post data into our format
   */
  private processRedditPost(post: RedditPost): ProcessedRedditPost {
    return {
      redditId: post.id,
      title: post.title,
      content: post.selftext || '',
      url: post.url,
      permalink: `https://reddit.com${post.permalink}`,
      subreddit: post.subreddit,
      author: post.author,
      score: post.score,
      upvoteRatio: post.upvote_ratio,
      commentCount: post.num_comments,
      createdAt: new Date(post.created_utc * 1000),
      isVideo: post.is_video,
      isNsfw: post.is_nsfw,
      imageUrl: this.extractImageUrl(post),
      videoUrl: this.extractVideoUrl(post),
      thumbnailUrl: post.thumbnail && post.thumbnail.startsWith('http') ? post.thumbnail : undefined,
      flairText: post.link_flair_text || undefined,
      rawData: post,
    };
  }

  /**
   * Process raw Reddit comment data into our format
   */
  private processRedditComment(comment: RedditComment): ProcessedRedditComment {
    const replies: ProcessedRedditComment[] = [];
    
    if (comment.replies && typeof comment.replies === 'object') {
      replies.push(...comment.replies.data.children
        .map(child => child.data as RedditComment)
        .filter(reply => reply.body && reply.body !== '[deleted]' && reply.body !== '[removed]')
        .map(reply => this.processRedditComment(reply))
      );
    }

    return {
      redditId: comment.id,
      content: comment.body,
      author: comment.author,
      score: comment.score,
      depth: comment.depth,
      parentId: comment.parent_id.startsWith('t1_') ? comment.parent_id.slice(3) : undefined,
      createdAt: new Date(comment.created_utc * 1000),
      isSubmitter: comment.is_submitter,
      replies,
      rawData: comment,
    };
  }

  /**
   * Extract image URL from Reddit post
   */
  private extractImageUrl(post: RedditPost): string | undefined {
    // Check preview images
    if (post.preview?.images?.[0]?.source?.url) {
      return post.preview.images[0].source.url.replace(/&amp;/g, '&');
    }

    // Check if URL is a direct image link
    if (post.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return post.url;
    }

    return undefined;
  }

  /**
   * Extract video URL from Reddit post
   */
  private extractVideoUrl(post: RedditPost): string | undefined {
    if (post.media?.reddit_video?.fallback_url) {
      return post.media.reddit_video.fallback_url;
    }

    if (post.is_video && post.url) {
      return post.url;
    }

    return undefined;
  }

  /**
   * Get rate limit status
   */
  getRateLimitStatus() {
    return redditRateLimiter.getStatus();
  }
}

// Export singleton instance
export const redditScraper = new RedditScraper();