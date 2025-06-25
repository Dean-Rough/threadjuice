/**
 * Source Stage
 *
 * Responsible for acquiring content from various sources.
 * Normalizes different source formats into a common structure.
 */

import { BasePipelineStage } from '../core/PipelineStage';
import {
  PipelineContext,
  RedditStoryContext,
  AIStoryContext,
} from '../core/PipelineContext';
import { redditAdapter } from '../integrations';
import { twitterAdapter } from '../integrations';
import { ProcessedRedditPost } from '@/types/reddit';

export interface SourceOptions {
  type: 'reddit' | 'twitter' | 'ai-generated';
  reddit?: {
    subreddit: string;
    sort?: 'hot' | 'top' | 'new';
    limit?: number;
    minScore?: number;
  };
  twitter?: {
    query?: string;
    maxResults?: number;
  };
  ai?: {
    category: string;
    persona: string;
    prompt?: string;
  };
}

export class SourceStage extends BasePipelineStage {
  name = 'SourceStage';
  description = 'Acquires content from various sources';

  constructor(private options: SourceOptions) {
    super();
  }

  async process(context: PipelineContext): Promise<PipelineContext> {
    this.log(`Acquiring content from ${this.options.type}`);

    switch (this.options.type) {
      case 'reddit':
        return this.fetchRedditContent(context);
      case 'twitter':
        return this.fetchTwitterContent(context);
      case 'ai-generated':
        return this.generateAIContent(context);
      default:
        throw new Error(`Unsupported source type: ${this.options.type}`);
    }
  }

  private async fetchRedditContent(
    context: PipelineContext
  ): Promise<PipelineContext> {
    if (!this.options.reddit) {
      throw new Error('Reddit options not provided');
    }

    const {
      subreddit,
      sort = 'hot',
      limit = 10,
      minScore = 100,
    } = this.options.reddit;

    try {
      // Fetch posts from Reddit using adapter
      const posts = await this.timeOperation('Fetch Reddit posts', () =>
        redditAdapter.fetchPosts({
          subreddit,
          sort,
          limit,
          minScore,
        })
      );

      if (posts.length === 0) {
        throw new Error('No posts found matching criteria');
      }

      // Select the best post using adapter's intelligent selection
      const selectedPost = redditAdapter.selectBestPost(posts);

      if (!selectedPost) {
        throw new Error('No suitable post found');
      }

      // Create Reddit-specific context
      const redditContext = new RedditStoryContext(selectedPost);

      // Copy over any existing pipeline metadata
      redditContext.pipeline = context.pipeline;

      this.log(
        `Selected post: "${selectedPost.title}" (score: ${selectedPost.score})`
      );

      return redditContext;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.log(`Failed to fetch Reddit content: ${errorMessage}`);
      throw error;
    }
  }

  private async fetchTwitterContent(
    context: PipelineContext
  ): Promise<PipelineContext> {
    if (!this.options.twitter) {
      throw new Error('Twitter options not provided');
    }

    const { query = '', maxResults = 10 } = this.options.twitter;

    try {
      // Check if Twitter is available
      if (!twitterAdapter.isAvailable()) {
        throw new Error('Twitter API not configured');
      }

      // Fetch dramatic Twitter content
      const threads = await this.timeOperation('Fetch Twitter drama', () =>
        twitterAdapter.fetchDramaticContent({
          query,
          maxResults,
          minDramaScore: 60,
        })
      );

      if (threads.length === 0) {
        throw new Error('No Twitter content found');
      }

      // Select the best thread
      const selectedThread = threads[0]; // For now, take the highest drama score

      // Create Twitter context (we'd need to extend PipelineContext for this)
      // For now, we'll create a generic context
      const twitterContext = new PipelineContext('twitter', {
        id: selectedThread.id,
        title: `Twitter Drama: ${selectedThread.author.username}`,
        content: selectedThread.content.main,
        thread: selectedThread.content.thread,
        author: selectedThread.author.username,
        metrics: selectedThread.metrics,
        url: selectedThread.url,
      });

      // Set metadata
      twitterContext.source.metadata = {
        platform: 'twitter',
        fetchedAt: new Date(),
        url: selectedThread.url,
        author: selectedThread.author.username,
        engagement: {
          upvotes: selectedThread.metrics.likes,
          comments: selectedThread.metrics.replies,
          shares: selectedThread.metrics.retweets,
        },
      };

      // Copy pipeline metadata
      twitterContext.pipeline = context.pipeline;

      this.log(
        `Selected Twitter thread from @${selectedThread.author.username} (drama score: ${selectedThread.dramaScore})`
      );

      return twitterContext;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.log(`Failed to fetch Twitter content: ${errorMessage}`);
      throw error;
    }
  }

  private async generateAIContent(
    context: PipelineContext
  ): Promise<PipelineContext> {
    if (!this.options.ai) {
      throw new Error('AI options not provided');
    }

    const { category, persona, prompt } = this.options.ai;

    // Create AI context
    const aiContext = new AIStoryContext(
      prompt || `Generate a viral ${category} story`,
      category,
      persona
    );

    // Copy over pipeline metadata
    aiContext.pipeline = context.pipeline;

    this.log(`Prepared AI generation for ${category} with ${persona}`);

    return aiContext;
  }

  async validate(context: PipelineContext): Promise<boolean> {
    // Validate that we have the required source configuration
    if (!this.options.type) {
      this.log('No source type specified');
      return false;
    }

    switch (this.options.type) {
      case 'reddit':
        return !!this.options.reddit?.subreddit;
      case 'twitter':
        return !!this.options.twitter;
      case 'ai-generated':
        return !!this.options.ai?.category && !!this.options.ai?.persona;
      default:
        return false;
    }
  }
}

/**
 * Factory functions for common source configurations
 */
export const RedditSource = (
  subreddit: string,
  options?: Partial<SourceOptions['reddit']>
) =>
  new SourceStage({
    type: 'reddit',
    reddit: {
      subreddit,
      ...options,
    },
  });

export const TwitterSource = (
  query: string,
  options?: Partial<SourceOptions['twitter']>
) =>
  new SourceStage({
    type: 'twitter',
    twitter: {
      query,
      ...options,
    },
  });

export const AISource = (category: string, persona: string, prompt?: string) =>
  new SourceStage({
    type: 'ai-generated',
    ai: {
      category,
      persona,
      prompt,
    },
  });
