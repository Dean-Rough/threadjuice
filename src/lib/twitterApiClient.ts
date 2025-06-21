/**
 * Twitter API v2 Client for Real-Time Drama Detection
 * Handles authentication, streaming, and data retrieval from Twitter
 */

import { TwitterDramaData } from './twitterDramaDetector';
import { twitterRateLimiter } from './twitterRateLimiter';

export interface TwitterApiConfig {
  bearerToken: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  accessTokenSecret?: string;
  dramaEnabled: boolean;
  maxStoriesPerDay: number;
  minEngagement: number;
  minDramaScore: number;
}

export interface TwitterSearchQuery {
  query: string;
  max_results?: number;
  tweet_fields?: string[];
  user_fields?: string[];
  expansions?: string[];
  sort_order?: 'recency' | 'relevancy';
}

export interface TwitterStreamRule {
  value: string;
  tag?: string;
}

class TwitterApiClient {
  private config: TwitterApiConfig;
  private baseUrl = 'https://api.twitter.com/2';
  
  constructor() {
    this.config = {
      bearerToken: process.env.TWITTER_BEARER_TOKEN || '',
      apiKey: process.env.TWITTER_API_KEY || '',
      apiSecret: process.env.TWITTER_API_SECRET || '',
      accessToken: process.env.TWITTER_ACCESS_TOKEN || '',
      accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET || '',
      dramaEnabled: process.env.TWITTER_DRAMA_ENABLED === 'true',
      maxStoriesPerDay: parseInt(process.env.TWITTER_DRAMA_MAX_STORIES_PER_DAY || '3'),
      minEngagement: parseInt(process.env.TWITTER_DRAMA_MIN_ENGAGEMENT || '100'),
      minDramaScore: parseInt(process.env.TWITTER_DRAMA_MIN_DRAMA_SCORE || '60')
    };
  }

  /**
   * Check if Twitter API is properly configured
   */
  isConfigured(): boolean {
    return !!(this.config.bearerToken && this.config.dramaEnabled);
  }

  /**
   * Get authorization headers for Twitter API requests
   */
  private getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.config.bearerToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Search for tweets with high engagement that might indicate drama
   * FREE TIER: Maximum 10 results to conserve API calls
   */
  async searchDramaTweets(options: {
    timeWindow?: string;
    maxResults?: number;
  } = {}): Promise<TwitterDramaData[]> {
    if (!this.isConfigured()) {
      throw new Error('Twitter API not configured');
    }

    // Check rate limits before making API call
    const { allowed, reason, stats } = twitterRateLimiter.canMakeCall();
    if (!allowed) {
      throw new Error(`Rate limit exceeded: ${reason}`);
    }

    // Conservative limits for free tier
    const { timeWindow = '2h', maxResults = 10 } = options;
    
    // Minimal test query for free tier
    const searchQuery: TwitterSearchQuery = {
      query: 'hello world',
      max_results: maxResults,
      tweet_fields: [
        'id',
        'text', 
        'author_id',
        'created_at',
        'public_metrics',
        'context_annotations',
        'referenced_tweets'
      ],
      user_fields: [
        'id',
        'username',
        'name',
        'verified',
        'public_metrics'
      ],
      expansions: ['author_id', 'referenced_tweets.id'],
      sort_order: 'recency'
    };

    try {
      console.log(`🎭 Making Twitter API call (${stats.monthly_used + 1}/${stats.monthly_limit} this month)`);
      
      const response = await this.makeApiRequest('/tweets/search/recent', {
        method: 'GET',
        params: this.buildQueryParams(searchQuery)
      });

      // Log successful API call
      twitterRateLimiter.logCall('/tweets/search/recent', true);
      console.log(`✅ Twitter API call successful`);

      return this.transformTwitterResponse(response);
    } catch (error) {
      // Log failed API call
      twitterRateLimiter.logCall('/tweets/search/recent', false);
      console.error('❌ Twitter drama search failed:', error);
      throw error;
    }
  }

  /**
   * Get trending topics to identify potential drama sources
   */
  async getTrendingTopics(woeid = 1): Promise<any[]> {
    if (!this.isConfigured()) {
      throw new Error('Twitter API not configured');
    }

    try {
      // Note: Trending topics require Twitter API v1.1
      const response = await fetch(`https://api.twitter.com/1.1/trends/place.json?id=${woeid}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Twitter API error: ${response.status}`);
      }

      const data = await response.json();
      return data[0]?.trends || [];
    } catch (error) {
      console.error('❌ Failed to get trending topics:', error);
      return [];
    }
  }

  /**
   * Set up filtered stream rules for real-time drama detection
   */
  async setupDramaStreamRules(): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('Twitter API not configured');
    }

    const dramaRules: TwitterStreamRule[] = [
      {
        value: 'has:mentions has:hashtags (ratio OR "tell me you" OR "imagine thinking" OR "unpopular opinion") lang:en -is:retweet',
        tag: 'drama_indicators'
      },
      {
        value: '(controversial OR drama OR debate) has:links lang:en -is:retweet',
        tag: 'controversy_content'
      },
      {
        value: 'context:60.1220701888179359745 OR context:60.869434538163826689', // Food & Drink, Business & Finance contexts
        tag: 'drama_prone_topics'
      }
    ];

    try {
      // First, get existing rules
      const existingRules = await this.getStreamRules();
      
      // Delete existing drama rules
      if (existingRules.length > 0) {
        const ruleIds = existingRules
          .filter(rule => rule.tag?.includes('drama'))
          .map(rule => rule.id);
        
        if (ruleIds.length > 0) {
          await this.deleteStreamRules(ruleIds);
        }
      }

      // Add new drama detection rules
      await this.addStreamRules(dramaRules);
      console.log('✅ Twitter drama stream rules configured');
      
    } catch (error) {
      console.error('❌ Failed to setup stream rules:', error);
      throw error;
    }
  }

  /**
   * Transform Twitter API response to our drama data format
   */
  private transformTwitterResponse(response: any): TwitterDramaData[] {
    const tweets = response.data || [];
    const users = response.includes?.users || [];
    const referencedTweets = response.includes?.tweets || [];

    return tweets.map((tweet: any) => {
      const author = users.find((user: any) => user.id === tweet.author_id);
      
      return {
        id: tweet.id,
        text: tweet.text,
        author: {
          username: author?.username || 'unknown',
          name: author?.name || 'Unknown User',
          verified: author?.verified || false,
          follower_count: author?.public_metrics?.followers_count || 0
        },
        metrics: {
          retweets: tweet.public_metrics?.retweet_count || 0,
          likes: tweet.public_metrics?.like_count || 0,
          replies: tweet.public_metrics?.reply_count || 0,
          quotes: tweet.public_metrics?.quote_count || 0,
          impressions: tweet.public_metrics?.impression_count
        },
        created_at: tweet.created_at,
        context_annotations: tweet.context_annotations,
        referenced_tweets: tweet.referenced_tweets
      };
    });
  }

  /**
   * Build query parameters for Twitter API requests
   */
  private buildQueryParams(query: TwitterSearchQuery): URLSearchParams {
    const params = new URLSearchParams();
    
    params.append('query', query.query);
    if (query.max_results) params.append('max_results', query.max_results.toString());
    if (query.tweet_fields) params.append('tweet.fields', query.tweet_fields.join(','));
    if (query.user_fields) params.append('user.fields', query.user_fields.join(','));
    if (query.expansions) params.append('expansions', query.expansions.join(','));
    if (query.sort_order) params.append('sort_order', query.sort_order);
    
    return params;
  }

  /**
   * Make authenticated request to Twitter API
   */
  private async makeApiRequest(endpoint: string, options: {
    method: 'GET' | 'POST' | 'DELETE';
    params?: URLSearchParams;
    body?: any;
  }): Promise<any> {
    const { method, params, body } = options;
    let url = `${this.baseUrl}${endpoint}`;
    
    if (method === 'GET' && params) {
      url += `?${params.toString()}`;
    }

    const requestOptions: RequestInit = {
      method,
      headers: this.getAuthHeaders()
    };

    if (method !== 'GET' && body) {
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Twitter API ${response.status}: ${errorData}`);
    }

    return response.json();
  }

  /**
   * Stream rules management
   */
  private async getStreamRules(): Promise<any[]> {
    const response = await this.makeApiRequest('/tweets/search/stream/rules', {
      method: 'GET'
    });
    return response.data || [];
  }

  private async addStreamRules(rules: TwitterStreamRule[]): Promise<void> {
    await this.makeApiRequest('/tweets/search/stream/rules', {
      method: 'POST',
      body: { add: rules }
    });
  }

  private async deleteStreamRules(ruleIds: string[]): Promise<void> {
    await this.makeApiRequest('/tweets/search/stream/rules', {
      method: 'POST',
      body: { delete: { ids: ruleIds } }
    });
  }

  /**
   * Get configuration for debugging
   */
  getConfig() {
    return {
      configured: this.isConfigured(),
      dramaEnabled: this.config.dramaEnabled,
      maxStoriesPerDay: this.config.maxStoriesPerDay,
      minEngagement: this.config.minEngagement,
      minDramaScore: this.config.minDramaScore,
      hasCredentials: {
        bearerToken: !!this.config.bearerToken,
        apiKey: !!this.config.apiKey,
        accessToken: !!this.config.accessToken
      }
    };
  }
}

// Export singleton instance
export const twitterApiClient = new TwitterApiClient();
export default twitterApiClient;