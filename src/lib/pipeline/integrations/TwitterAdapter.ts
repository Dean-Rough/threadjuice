/**
 * Twitter API Adapter for Pipeline Integration
 *
 * Bridges the Twitter API client with the pipeline architecture.
 * Handles Twitter drama detection and thread reconstruction.
 */

import { twitterDramaDetector } from '@/lib/twitterDramaDetector';
import { twitterToStoryConverter } from '@/lib/twitterToStoryConverter';
import { twitterApiClient } from '@/lib/twitterApiClient';

export interface TwitterFetchOptions {
  query?: string;
  timeWindow?: string;
  maxResults?: number;
  minEngagement?: number;
  minDramaScore?: number;
  includeReplies?: boolean;
}

export interface ProcessedTwitterThread {
  id: string;
  author: {
    username: string;
    name: string;
    verified: boolean;
  };
  content: {
    main: string;
    thread: string[];
    quotes: Array<{
      author: string;
      text: string;
      engagement: number;
    }>;
  };
  metrics: {
    likes: number;
    retweets: number;
    replies: number;
    quotes: number;
  };
  dramaScore: number;
  createdAt: Date;
  url: string;
}

export class TwitterAdapter {
  private dramaDetector = twitterDramaDetector;
  private storyConverter = twitterToStoryConverter;
  private apiClient = twitterApiClient;

  /**
   * Check if Twitter integration is available
   */
  isAvailable(): boolean {
    return this.apiClient.isConfigured();
  }

  /**
   * Fetch high-drama Twitter content
   */
  async fetchDramaticContent(
    options: TwitterFetchOptions = {}
  ): Promise<ProcessedTwitterThread[]> {
    if (!this.isAvailable()) {
      console.warn('⚠️ Twitter API not configured - skipping Twitter content');
      return [];
    }

    try {
      console.log('🐦 Searching for Twitter drama...');

      // Get drama tweets
      const dramaTweets = await this.dramaDetector.searchForDrama({
        timeWindow: options.timeWindow || '24h',
        minEngagement: options.minEngagement || 100,
        minDramaScore: options.minDramaScore || 60,
      });

      if (dramaTweets.length === 0) {
        console.log('📭 No dramatic tweets found');
        return [];
      }

      console.log(`🎭 Found ${dramaTweets.length} dramatic tweets`);

      // Process and convert to threads
      const threads: ProcessedTwitterThread[] = [];

      for (const tweet of dramaTweets) {
        try {
          const thread = await this.processTwitterDrama(tweet);
          if (thread) {
            threads.push(thread);
          }
        } catch (error) {
          console.error(`Failed to process tweet ${tweet.tweetId}:`, error);
        }
      }

      return threads;
    } catch (error) {
      console.error('❌ Twitter drama fetch failed:', error);
      return [];
    }
  }

  /**
   * Process a single Twitter drama into a thread
   */
  private async processTwitterDrama(
    drama: any
  ): Promise<ProcessedTwitterThread | null> {
    try {
      // Convert to story format
      const storyData = await this.storyConverter.convertToStory({
        ...drama,
        platform: 'twitter',
      });

      if (!storyData) {
        return null;
      }

      // Extract thread structure
      const thread: ProcessedTwitterThread = {
        id: drama.tweetId,
        author: {
          username: drama.authorUsername || 'unknown',
          name: drama.authorName || 'Unknown User',
          verified: drama.verified || false,
        },
        content: {
          main: drama.text || '',
          thread: this.extractThread(drama),
          quotes: this.extractQuotes(drama),
        },
        metrics: {
          likes: drama.metrics?.like_count || 0,
          retweets: drama.metrics?.retweet_count || 0,
          replies: drama.metrics?.reply_count || 0,
          quotes: drama.metrics?.quote_count || 0,
        },
        dramaScore: drama.dramaScore || 0,
        createdAt: new Date(drama.created_at || Date.now()),
        url: `https://twitter.com/${drama.authorUsername}/status/${drama.tweetId}`,
      };

      return thread;
    } catch (error) {
      console.error('Failed to process Twitter drama:', error);
      return null;
    }
  }

  /**
   * Extract thread from drama data
   */
  private extractThread(drama: any): string[] {
    const thread: string[] = [];

    // Add main tweet
    if (drama.text) {
      thread.push(drama.text);
    }

    // Add thread continuation
    if (drama.thread && Array.isArray(drama.thread)) {
      thread.push(...drama.thread.map((t: any) => t.text || ''));
    }

    // Add relevant replies
    if (drama.replies && Array.isArray(drama.replies)) {
      const topReplies = drama.replies
        .filter((r: any) => r.metrics?.like_count > 10)
        .sort((a: any, b: any) => b.metrics.like_count - a.metrics.like_count)
        .slice(0, 3)
        .map((r: any) => `@${r.author}: ${r.text}`);

      thread.push(...topReplies);
    }

    return thread;
  }

  /**
   * Extract notable quotes
   */
  private extractQuotes(drama: any): Array<{
    author: string;
    text: string;
    engagement: number;
  }> {
    const quotes: any[] = [];

    // Add quote tweets
    if (drama.quotes && Array.isArray(drama.quotes)) {
      for (const quote of drama.quotes) {
        quotes.push({
          author: quote.author || 'Unknown',
          text: quote.text || '',
          engagement: quote.metrics?.like_count || 0,
        });
      }
    }

    // Add high-engagement replies as quotes
    if (drama.replies && Array.isArray(drama.replies)) {
      const notableReplies = drama.replies
        .filter((r: any) => r.metrics?.like_count > 50)
        .map((r: any) => ({
          author: r.author || 'Unknown',
          text: r.text || '',
          engagement: r.metrics?.like_count || 0,
        }));

      quotes.push(...notableReplies);
    }

    // Sort by engagement and return top quotes
    return quotes.sort((a, b) => b.engagement - a.engagement).slice(0, 5);
  }

  /**
   * Search for specific Twitter content
   */
  async searchTweets(
    query: string,
    options: TwitterFetchOptions = {}
  ): Promise<ProcessedTwitterThread[]> {
    if (!this.isAvailable()) {
      console.warn('⚠️ Twitter API not configured');
      return [];
    }

    try {
      // Use drama detector with custom query
      const results = await this.dramaDetector.searchForDrama({
        query,
        timeWindow: options.timeWindow || '24h',
        minEngagement: options.minEngagement || 50,
        minDramaScore: options.minDramaScore || 0, // No drama requirement for search
      });

      const threads: ProcessedTwitterThread[] = [];

      for (const result of results) {
        const thread = await this.processTwitterDrama(result);
        if (thread) {
          threads.push(thread);
        }
      }

      return threads;
    } catch (error) {
      console.error('Twitter search failed:', error);
      return [];
    }
  }

  /**
   * Get trending drama topics
   */
  async getTrendingDrama(): Promise<{
    topics: string[];
    threads: ProcessedTwitterThread[];
  }> {
    if (!this.isAvailable()) {
      return { topics: [], threads: [] };
    }

    try {
      // Get current trending drama
      const dramaTweets = await this.fetchDramaticContent({
        timeWindow: '6h',
        maxResults: 5,
        minDramaScore: 70,
      });

      // Extract topics from drama
      const topics = this.extractTrendingTopics(dramaTweets);

      return {
        topics,
        threads: dramaTweets,
      };
    } catch (error) {
      console.error('Failed to get trending drama:', error);
      return { topics: [], threads: [] };
    }
  }

  /**
   * Extract trending topics from threads
   */
  private extractTrendingTopics(threads: ProcessedTwitterThread[]): string[] {
    const topicCounts = new Map<string, number>();

    for (const thread of threads) {
      // Extract hashtags
      const hashtags = thread.content.main.match(/#\w+/g) || [];
      for (const tag of hashtags) {
        const topic = tag.toLowerCase();
        topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
      }

      // Extract @mentions as potential topics
      const mentions = thread.content.main.match(/@\w+/g) || [];
      for (const mention of mentions) {
        if (mention.length > 4) {
          // Skip short mentions
          const topic = mention.toLowerCase();
          topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
        }
      }
    }

    // Sort by frequency and return top topics
    return Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([topic]) => topic);
  }

  /**
   * Check rate limit status
   */
  getRateLimitStatus() {
    return this.dramaDetector.getRateLimiter().getDetailedStatus();
  }
}

// Export singleton instance
export const twitterAdapter = new TwitterAdapter();
