import {
  redditScraper,
  isPostSuitable,
  cleanRedditText,
} from './redditScraper';
import { gptSummariser } from './gptSummariser';
import { createPost } from './database';
import { jobQueue, type Job } from './jobQueue';
import { logger } from './logger';
import type { RedditPost, RedditComment } from '@/types/reddit';
import type { RedditIngestionInput } from './validations';

export interface IngestionResult {
  postId: string;
  redditThreadId: string;
  subreddit: string;
  persona: 'snarky-sage' | 'buddy' | 'cynic';
  processingTime: number;
  tokensUsed: number;
}

export interface IngestionJobData extends RedditIngestionInput {
  userId?: string;
}

/**
 * Complete Reddit-to-database ingestion pipeline
 */
export class IngestionService {
  constructor() {
    // Register the Reddit ingestion worker
    jobQueue.registerWorker(
      'reddit_ingestion',
      this.processRedditIngestion.bind(this)
    );
  }

  /**
   * Start a Reddit ingestion job
   */
  async startIngestion(data: IngestionJobData): Promise<string> {
    logger.info('Starting Reddit ingestion', {
      subreddit: data.subreddit,
      persona: data.persona,
      limit: data.limit,
    });

    const jobId = await jobQueue.addJob('reddit_ingestion', data, {
      maxRetries: 2,
    });

    return jobId;
  }

  /**
   * Process a Reddit ingestion job
   */
  private async processRedditIngestion(job: Job): Promise<IngestionResult[]> {
    const data = job.data as IngestionJobData;
    const startTime = Date.now();
    const results: IngestionResult[] = [];

    try {
      // Step 1: Fetch Reddit posts (10% progress)
      jobQueue.updateProgress(job.id, 10);
      logger.info('Fetching Reddit posts', {
        subreddit: data.subreddit,
        limit: data.limit,
      });

      const redditPosts = await redditScraper.getHotPosts({
        subreddit: data.subreddit,
        limit: data.limit || 5,
        sort: 'hot',
      });

      if (redditPosts.length === 0) {
        throw new Error(`No posts found in r/${data.subreddit}`);
      }

      // Filter suitable posts
      const suitablePosts = redditPosts.filter(isPostSuitable);
      logger.info('Filtered suitable posts', {
        total: redditPosts.length,
        suitable: suitablePosts.length,
      });

      if (suitablePosts.length === 0) {
        throw new Error('No suitable posts found for processing');
      }

      // Step 2: Process each post (20-90% progress)
      const progressPerPost = 70 / suitablePosts.length;
      let currentProgress = 20;

      for (const [index, redditPost] of suitablePosts.entries()) {
        try {
          logger.info('Processing Reddit post', {
            postId: redditPost.id,
            title: redditPost.title,
            index: index + 1,
            total: suitablePosts.length,
          });

          // Fetch comments for the post
          const { comments } = await redditScraper.getComments({
            subreddit: data.subreddit,
            postId: redditPost.id,
            limit: 50,
            sort: 'top',
          });

          // Map persona to GPT persona format
          const gptPersona = this.mapPersonaToGPT(data.persona);

          // Generate content using GPT
          const generationResult = await gptSummariser.generateContent(
            redditPost,
            comments,
            {
              persona: gptPersona,
              contentType: 'article',
              includeComments: true,
              maxComments: 10,
              targetWordCount: 800,
              validateContent: true,
            }
          );

          // Create slug from title
          const slug = this.generateSlug(redditPost.title);

          // Prepare post data for database
          const postData = {
            title: generationResult.content.seoTitle || redditPost.title,
            slug,
            hook: generationResult.content.hook,
            content: generationResult.content.content as any, // Cast to Json type
            status: 'published' as const,
            category: this.mapSubredditToCategory(data.subreddit),
            reddit_thread_id: redditPost.id,
            subreddit: data.subreddit,
            seo_title: generationResult.content.seoTitle,
            seo_description: generationResult.content.seoDescription,
            author_id: data.userId || 'system',
            featured: false,
            layout_style: 1,
          };

          // Save to database
          const savedPost = await createPost(postData);

          results.push({
            postId: savedPost.id,
            redditThreadId: redditPost.id,
            subreddit: data.subreddit,
            persona: data.persona,
            processingTime: generationResult.metadata.processingTime,
            tokensUsed: generationResult.metadata.tokensUsed,
          });

          // Update progress
          currentProgress += progressPerPost;
          jobQueue.updateProgress(job.id, Math.round(currentProgress));

          logger.info('Successfully processed Reddit post', {
            postId: savedPost.id,
            redditThreadId: redditPost.id,
            tokensUsed: generationResult.metadata.tokensUsed,
          });
        } catch (error) {
          logger.error('Failed to process Reddit post', {
            redditPostId: redditPost.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          // Continue with next post instead of failing the entire job
        }
      }

      // Step 3: Finalize (90-100% progress)
      jobQueue.updateProgress(job.id, 100);

      const totalProcessingTime = Date.now() - startTime;
      const totalTokens = results.reduce((sum, r) => sum + r.tokensUsed, 0);

      logger.info('Reddit ingestion completed', {
        jobId: job.id,
        subreddit: data.subreddit,
        postsProcessed: results.length,
        totalProcessingTime,
        totalTokens,
      });

      return results;
    } catch (error) {
      logger.error('Reddit ingestion failed', {
        jobId: job.id,
        subreddit: data.subreddit,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Map validation persona to GPT persona format
   */
  private mapPersonaToGPT(
    persona: 'snarky-sage' | 'buddy' | 'cynic'
  ): 'The Snarky Sage' | 'The Down-to-Earth Buddy' | 'The Dry Cynic' {
    const personaMap = {
      'snarky-sage': 'The Snarky Sage' as const,
      buddy: 'The Down-to-Earth Buddy' as const,
      cynic: 'The Dry Cynic' as const,
    };
    return personaMap[persona];
  }

  /**
   * Generate URL-friendly slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 100); // Limit length
  }

  /**
   * Map subreddit to content category
   */
  private mapSubredditToCategory(subreddit: string): string {
    const categoryMap: Record<string, string> = {
      tifu: 'TIFU',
      amitheasshole: 'AITA',
      publicfreakout: 'Public Freakouts',
      relationship_advice: 'Relationships',
      legaladvice: 'Legal Drama',
      maliciouscompliance: 'Revenge',
      choosingbeggars: 'Choosing Beggars',
      entitledparents: 'Entitled People',
      pettyrevenge: 'Revenge',
      prorevenge: 'Revenge',
      nuclearrevenge: 'Revenge',
    };

    return categoryMap[subreddit.toLowerCase()] || 'General';
  }

  /**
   * Get ingestion job status
   */
  async getJobStatus(jobId: string): Promise<Job | null> {
    return jobQueue.getJob(jobId) || null;
  }

  /**
   * Get ingestion statistics
   */
  getStats() {
    return jobQueue.getStats();
  }

  /**
   * Process a specific Reddit thread by URL or ID
   */
  async processSpecificThread(
    subreddit: string,
    threadId: string,
    persona: 'snarky-sage' | 'buddy' | 'cynic',
    userId?: string
  ): Promise<string> {
    const jobData: IngestionJobData = {
      subreddit,
      thread_id: threadId,
      persona,
      limit: 1,
      userId,
    };

    return this.startIngestion(jobData);
  }

  /**
   * Bulk process multiple subreddits
   */
  async processBulkSubreddits(
    subreddits: string[],
    persona: 'snarky-sage' | 'buddy' | 'cynic',
    postsPerSubreddit: number = 3,
    userId?: string
  ): Promise<string[]> {
    const jobIds: string[] = [];

    for (const subreddit of subreddits) {
      const jobData: IngestionJobData = {
        subreddit,
        persona,
        limit: postsPerSubreddit,
        userId,
      };

      const jobId = await this.startIngestion(jobData);
      jobIds.push(jobId);

      // Small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return jobIds;
  }
}

// Export singleton instance
export const ingestionService = new IngestionService();
