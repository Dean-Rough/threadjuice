/**
 * Reddit API Adapter for Pipeline Integration
 *
 * Bridges the existing RedditScraper with the pipeline architecture.
 * Handles authentication, rate limiting, and error recovery.
 */

import { redditScraper, RedditScraper } from '@/lib/redditScraper';
import { ProcessedRedditPost, ProcessedRedditComment } from '@/types/reddit';

export interface RedditFetchOptions {
  subreddit: string;
  sort?: 'hot' | 'top' | 'new' | 'controversial';
  time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
  limit?: number;
  minScore?: number;
  includeComments?: boolean;
  maxComments?: number;
}

export class RedditAdapter {
  private scraper: RedditScraper;
  private authenticated: boolean = false;

  constructor() {
    this.scraper = redditScraper;
  }

  /**
   * Ensure authentication before making requests
   */
  private async ensureAuth(): Promise<void> {
    if (!this.authenticated) {
      await this.scraper.authenticate();
      this.authenticated = true;
    }
  }

  /**
   * Fetch posts with automatic retry and error handling
   */
  async fetchPosts(
    options: RedditFetchOptions
  ): Promise<ProcessedRedditPost[]> {
    await this.ensureAuth();

    try {
      const posts = await this.scraper.getHotPosts({
        subreddit: options.subreddit,
        sort: options.sort || 'hot',
        time: options.time || 'day',
        limit: options.limit || 25,
        minScore: options.minScore || 0,
      });

      console.log(
        `🔍 Reddit: Fetched ${posts.length} posts from r/${options.subreddit}`
      );
      return posts;
    } catch (error) {
      console.error('❌ Reddit fetch failed:', error);

      // Reset auth on 401
      if (error instanceof Error && error.message.includes('401')) {
        this.authenticated = false;
        // Retry once with fresh auth
        await this.ensureAuth();
        return this.scraper.getHotPosts(options);
      }

      throw error;
    }
  }

  /**
   * Fetch comments for a post
   */
  async fetchComments(
    postId: string,
    options: {
      sort?: 'top' | 'best' | 'new';
      limit?: number;
      depth?: number;
    } = {}
  ): Promise<ProcessedRedditComment[]> {
    await this.ensureAuth();

    try {
      const comments = await this.scraper.getComments({
        postId,
        sort: options.sort || 'top',
        limit: options.limit || 100,
        depth: options.depth || 5,
      });

      console.log(
        `💬 Reddit: Fetched ${comments.length} comments for post ${postId}`
      );
      return comments;
    } catch (error) {
      console.error('❌ Reddit comment fetch failed:', error);
      // Return empty array on comment fetch failure (non-critical)
      return [];
    }
  }

  /**
   * Search posts across Reddit
   */
  async searchPosts(
    query: string,
    options: Partial<RedditFetchOptions> = {}
  ): Promise<ProcessedRedditPost[]> {
    await this.ensureAuth();

    try {
      const posts = await this.scraper.searchPosts(query, options);
      console.log(
        `🔍 Reddit: Search found ${posts.length} posts for "${query}"`
      );
      return posts;
    } catch (error) {
      console.error('❌ Reddit search failed:', error);
      throw error;
    }
  }

  /**
   * Get subreddit info
   */
  async getSubredditInfo(subreddit: string): Promise<any> {
    await this.ensureAuth();

    try {
      const info = await this.scraper.getSubredditInfo(subreddit);
      console.log(`ℹ️ Reddit: Got info for r/${subreddit}`);
      return info;
    } catch (error) {
      console.error('❌ Reddit subreddit info failed:', error);
      throw error;
    }
  }

  /**
   * Get rate limit status
   */
  getRateLimitStatus() {
    return this.scraper.getRateLimitStatus();
  }

  /**
   * Enhanced post selection with scoring
   */
  selectBestPost(posts: ProcessedRedditPost[]): ProcessedRedditPost | null {
    if (posts.length === 0) return null;

    // Score posts based on multiple factors
    const scoredPosts = posts.map(post => {
      let score = 0;

      // Engagement score
      score += post.score / 1000; // Normalize upvotes
      score += post.commentCount * 2; // Comments are more valuable
      score += post.upvoteRatio * 10; // High ratio indicates quality

      // Content quality
      if (post.content && post.content.length > 500) score += 5;
      if (post.content && post.content.length > 1000) score += 5;

      // Media bonus
      if (post.imageUrl) score += 3;
      if (post.videoUrl) score += 5;

      // Recency bonus (posts from last 24 hours)
      const hoursOld =
        (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60);
      if (hoursOld < 24) score += 10 - hoursOld / 2.4;

      // Flair bonus (indicates quality content)
      if (post.flairText) score += 2;

      return { post, score };
    });

    // Sort by score and return the best
    scoredPosts.sort((a, b) => b.score - a.score);

    const selected = scoredPosts[0].post;
    console.log(
      `🏆 Selected post: "${selected.title}" (score: ${selected.score}, comments: ${selected.commentCount})`
    );

    return selected;
  }

  /**
   * Batch fetch posts from multiple subreddits
   */
  async fetchFromMultipleSubreddits(
    subreddits: string[],
    options: Partial<RedditFetchOptions> = {}
  ): Promise<ProcessedRedditPost[]> {
    const allPosts: ProcessedRedditPost[] = [];

    for (const subreddit of subreddits) {
      try {
        const posts = await this.fetchPosts({ ...options, subreddit });
        allPosts.push(...posts);

        // Rate limit between subreddit fetches
        if (subreddits.indexOf(subreddit) < subreddits.length - 1) {
          await this.delay(1000);
        }
      } catch (error) {
        console.error(`Failed to fetch from r/${subreddit}:`, error);
        // Continue with other subreddits
      }
    }

    return allPosts;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const redditAdapter = new RedditAdapter();
