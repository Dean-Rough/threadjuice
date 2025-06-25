import { redditScraper } from './redditScraper';
import { gptSummariser } from './gptSummariser';
import { createClient } from '@supabase/supabase-js';
import { env } from './env';
import { jobQueue, type JobData } from './jobQueue';
import type {
  ProcessedRedditPost,
  ProcessedRedditComment,
  RedditIngestionRequest,
} from '@/types/reddit';
import type { SummarizationResult } from './gptSummariser';

// Initialize Supabase client
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Complete Reddit-to-database ingestion pipeline
 */

export interface IngestionJobPayload extends RedditIngestionRequest {
  userId?: string;
}

export interface IngestionResult {
  jobId: string;
  postsProcessed: number;
  postsCreated: number;
  errors: string[];
}

export class IngestionService {
  private readonly PERSONA_IDS = [
    'snarky-sage',
    'down-to-earth-buddy',
    'dry-cynic',
    'wholesome-cheerleader',
    'chaos-chronicler',
    'reddit-anthropologist',
    'millennial-translator',
    'drama-detective',
  ];

  constructor() {
    // Register job handlers
    jobQueue.registerHandler(
      'reddit-ingestion',
      this.processIngestionJob.bind(this)
    );
    jobQueue.registerHandler(
      'post-generation',
      this.processPostGenerationJob.bind(this)
    );
  }

  /**
   * Start Reddit content ingestion
   */
  async startIngestion(request: IngestionJobPayload): Promise<string> {
    // console.log(`🚀 Starting ingestion for r/${request.subreddit}`);

    const jobId = jobQueue.addJob('reddit-ingestion', request, {
      priority: 10,
      maxRetries: 2,
    });

    return jobId;
  }

  /**
   * Process Reddit ingestion job
   */
  private async processIngestionJob(job: JobData): Promise<void> {
    const payload = job.payload as IngestionJobPayload;
    const {
      subreddit,
      limit = 25,
      timeFilter = 'day',
      minScore = 100,
      forceRefresh = false,
    } = payload;

    // console.log(`📡 Fetching posts from r/${subreddit} (limit: ${limit}, minScore: ${minScore})`);

    try {
      // Fetch posts from Reddit
      const posts = await redditScraper.getHotPosts({
        subreddit,
        sort: 'hot',
        time: timeFilter,
        limit,
        minScore,
      });

      // console.log(`✅ Fetched ${posts.length} posts from r/${subreddit}`);

      if (posts.length === 0) {
        // console.log(`ℹ️ No posts found matching criteria for r/${subreddit}`);
        return;
      }

      // Filter out posts we've already processed (unless force refresh)
      let postsToProcess = posts;
      if (!forceRefresh) {
        postsToProcess = await this.filterExistingPosts(posts);
        // console.log(`📝 ${postsToProcess.length} new posts to process (${posts.length - postsToProcess.length} already exist)`);
      }

      // Create individual post generation jobs
      for (const post of postsToProcess) {
        const personaId = this.selectRandomPersona();

        jobQueue.addJob(
          'post-generation',
          {
            post,
            personaId,
            userId: payload.userId,
            subreddit,
          },
          {
            priority: 5,
            maxRetries: 3,
          }
        );
      }

      // console.log(`🎯 Created ${postsToProcess.length} post generation jobs`);
    } catch (error) {
      console.error(`❌ Ingestion job failed for r/${subreddit}:`, error);
      throw error;
    }
  }

  /**
   * Process individual post generation job
   */
  private async processPostGenerationJob(job: JobData): Promise<void> {
    const { post, personaId, userId, subreddit } = job.payload;

    // console.log(`🤖 Generating content for "${post.title}" with ${personaId}`);

    try {
      // Fetch comments for the post
      const comments = await redditScraper.getComments({
        postId: post.redditId,
        sort: 'top',
        limit: 20,
        depth: 2,
      });

      // Generate content using GPT
      const summary = await gptSummariser.summarizePost(post, comments, {
        personaId,
        includeComments: true,
        maxComments: 10,
        temperature: 0.7,
        validateOutput: true,
      });

      // Validate content quality
      if (summary.validation && !summary.validation.isValid) {
        console.warn(
          `⚠️ Content validation failed for "${post.title}":`,
          summary.validation.issues
        );
        // Still save it but mark as draft
      }

      // Save to database
      const dbPost = await this.savePostToDatabase(
        post,
        summary,
        personaId,
        userId,
        subreddit
      );

      // console.log(`✅ Created post: ${dbPost.id} - "${summary.title}"`);
    } catch (error) {
      console.error(`❌ Post generation failed for "${post.title}":`, error);
      throw error;
    }
  }

  /**
   * Filter out posts that already exist in our database
   */
  private async filterExistingPosts(
    posts: ProcessedRedditPost[]
  ): Promise<ProcessedRedditPost[]> {
    if (posts.length === 0) return posts;

    const redditIds = posts.map(p => p.redditId);

    const { data: existingPosts, error } = await supabase
      .from('posts')
      .select('reddit_thread_id')
      .in('reddit_thread_id', redditIds);

    if (error) {
      console.error('Error checking existing posts:', error);
      return posts; // Return all posts if we can't check
    }

    const existingIds = new Set(existingPosts.map(p => p.reddit_thread_id));
    return posts.filter(post => !existingIds.has(post.redditId));
  }

  /**
   * Select a random persona for content generation
   */
  private selectRandomPersona(): string {
    return this.PERSONA_IDS[
      Math.floor(Math.random() * this.PERSONA_IDS.length)
    ];
  }

  /**
   * Save generated post to database
   */
  private async savePostToDatabase(
    redditPost: ProcessedRedditPost,
    summary: SummarizationResult,
    personaId: string,
    userId?: string,
    subreddit?: string
  ): Promise<any> {
    // Get persona from database
    const { data: persona, error: personaError } = await supabase
      .from('personas')
      .select('id')
      .eq('slug', personaId)
      .single();

    if (personaError || !persona) {
      throw new Error(`Persona not found: ${personaId}`);
    }

    // Determine category based on subreddit and content
    const category = this.categorizePost(redditPost, summary, subreddit);

    // Generate slug
    const slug = summary.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 100);

    const postData = {
      title: summary.title,
      slug,
      content: summary.content,
      excerpt: summary.excerpt,
      category,
      persona_id: persona.id,
      author_id: userId || null,
      reddit_thread_id: redditPost.redditId,
      reddit_url: redditPost.permalink,
      featured_image_url: redditPost.imageUrl,
      tags: summary.tags,
      published: summary.validation?.isValid !== false, // Publish if validation passed
      seo_title: summary.seoTitle,
      seo_description: summary.seoDescription,
      view_count: 0,
      share_count: 0,
      comment_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Store metadata
      metadata: {
        reddit_score: redditPost.score,
        reddit_comment_count: redditPost.commentCount,
        reddit_subreddit: redditPost.subreddit,
        generation_metadata: summary.metadata,
        validation_result: summary.validation,
      },
    };

    const { data: savedPost, error } = await supabase
      .from('posts')
      .insert(postData)
      .select()
      .single();

    if (error) {
      console.error('Database error saving post:', error);
      throw error;
    }

    return savedPost;
  }

  /**
   * Categorize post based on content and source
   */
  private categorizePost(
    redditPost: ProcessedRedditPost,
    summary: SummarizationResult,
    subreddit?: string
  ): 'viral' | 'trending' | 'chaos' | 'wholesome' | 'drama' {
    const content = (summary.content + summary.title).toLowerCase();
    const sub = redditPost.subreddit.toLowerCase();

    // Check for specific subreddit patterns
    if (['amitheasshole', 'aita'].includes(sub)) return 'drama';
    if (['wholesome', 'mademesmile', 'humansbeingbros'].includes(sub))
      return 'wholesome';
    if (['tifu', 'facepalm', 'whatcouldgowrong'].includes(sub)) return 'chaos';

    // Check content for keywords
    if (
      content.includes('drama') ||
      content.includes('conflict') ||
      content.includes('argument')
    ) {
      return 'drama';
    }

    if (
      content.includes('wholesome') ||
      content.includes('heartwarming') ||
      content.includes('sweet')
    ) {
      return 'wholesome';
    }

    if (
      content.includes('chaos') ||
      content.includes('disaster') ||
      content.includes('went wrong')
    ) {
      return 'chaos';
    }

    // Check viral indicators
    if (redditPost.score > 10000 || redditPost.commentCount > 1000) {
      return 'viral';
    }

    // Default to trending
    return 'trending';
  }

  /**
   * Get ingestion status and statistics
   */
  async getIngestionStatus(): Promise<{
    queue: ReturnType<typeof jobQueue.getStats>;
    recentJobs: Array<{
      id: string;
      type: string;
      status: string;
      createdAt: Date;
      error?: string;
    }>;
  }> {
    const queueStats = jobQueue.getStats();
    const recentJobs = jobQueue
      .getAllJobs()
      .slice(0, 20)
      .map(job => ({
        id: job.id,
        type: 'unknown', // JobResult doesn't include type, would need to enhance
        status: job.status,
        createdAt: new Date(), // Would need to get from JobData
        error: job.error,
      }));

    return {
      queue: queueStats,
      recentJobs,
    };
  }

  /**
   * Cancel all pending jobs for a specific subreddit
   */
  async cancelIngestion(subreddit: string): Promise<number> {
    // This would require enhancing the job queue to support cancellation
    // console.log(`⚠️ Cancellation requested for r/${subreddit} (not implemented)`);
    return 0;
  }
}

// Export singleton instance
export const ingestionService = new IngestionService();
