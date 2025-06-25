import {
  redditClient,
  VIRAL_SUBREDDITS,
  RedditPost,
  RedditComment,
} from './redditClient';
import { contentTransformer, TransformedContent } from './contentTransformer';
import { imageService } from './imageService';
import { prisma } from './prisma';

export interface IngestionJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  subreddit?: string;
  posts_processed: number;
  posts_created: number;
  started_at: Date;
  completed_at?: Date;
  error_message?: string;
  logs: string[];
}

export interface IngestionConfig {
  subreddits?: string[];
  limit_per_subreddit?: number;
  min_viral_score?: number;
  max_age_hours?: number;
  auto_publish?: boolean;
}

export class ContentIngestionService {
  private jobs = new Map<string, IngestionJob>();

  /**
   * Start a content ingestion job
   */
  async startIngestionJob(config: IngestionConfig = {}): Promise<IngestionJob> {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const job: IngestionJob = {
      id: jobId,
      status: 'pending',
      posts_processed: 0,
      posts_created: 0,
      started_at: new Date(),
      logs: [],
    };

    this.jobs.set(jobId, job);

    // Start processing in background
    this.processIngestionJob(jobId, config).catch(error => {
      console.error(`Ingestion job ${jobId} failed:`, error);
      this.updateJobStatus(jobId, 'failed', error.message);
    });

    return job;
  }

  /**
   * Process the ingestion job
   */
  private async processIngestionJob(
    jobId: string,
    config: IngestionConfig
  ): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error(`Job ${jobId} not found`);

    try {
      this.updateJobStatus(jobId, 'running');
      this.addJobLog(jobId, 'Starting content ingestion...');

      const {
        subreddits = VIRAL_SUBREDDITS.slice(0, 5), // First 5 subreddits by default
        limit_per_subreddit = 5,
        min_viral_score = 5,
        max_age_hours = 48,
        auto_publish = true,
      } = config;

      this.addJobLog(
        jobId,
        `Targeting ${subreddits.length} subreddits: ${subreddits.join(', ')}`
      );

      const allPosts: Array<{
        post: RedditPost;
        comments: RedditComment[];
        subreddit: string;
      }> = [];

      // Collect posts from all target subreddits
      for (const subreddit of subreddits) {
        try {
          this.addJobLog(jobId, `Fetching posts from r/${subreddit}...`);

          const { posts } = await redditClient.getHotPosts(subreddit, {
            limit: limit_per_subreddit * 2, // Get extra to filter for quality
            timeframe: 'day',
          });

          // Filter for viral potential
          const viralPosts = redditClient
            .filterViralPosts(posts)
            .slice(0, limit_per_subreddit);

          this.addJobLog(
            jobId,
            `Found ${viralPosts.length} viral posts in r/${subreddit}`
          );

          // Get comments for each post
          for (const post of viralPosts) {
            try {
              const comments = await redditClient.getComments(
                subreddit,
                post.id,
                { limit: 25 }
              );
              allPosts.push({ post, comments, subreddit });

              // Rate limiting delay
              await new Promise(resolve => setTimeout(resolve, 1500));
            } catch (error) {
              this.addJobLog(
                jobId,
                `Failed to get comments for post ${post.id}: ${error}`
              );
            }
          }

          // Delay between subreddits
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          this.addJobLog(jobId, `Error processing r/${subreddit}: ${error}`);
        }
      }

      this.addJobLog(
        jobId,
        `Collected ${allPosts.length} posts total. Starting content transformation...`
      );

      // Transform posts into ThreadJuice content
      let createdCount = 0;
      for (const { post, comments, subreddit } of allPosts) {
        try {
          job.posts_processed++;
          this.addJobLog(
            jobId,
            `Transforming: "${post.title.slice(0, 50)}..."`
          );

          // Check if post already exists
          const existingPost = await prisma.post.findFirst({
            where: {
              OR: [{ redditThreadId: post.id }, { title: post.title }],
            },
          });

          if (existingPost) {
            this.addJobLog(jobId, 'Post already exists, skipping...');
            continue;
          }

          // Transform content with GPT
          const transformedContent = await contentTransformer.transformContent(
            post,
            comments
          );

          // Validate content quality
          if (!contentTransformer.validateContent(transformedContent)) {
            this.addJobLog(
              jobId,
              'Content failed quality validation, skipping...'
            );
            continue;
          }

          if (transformedContent.viral_score < min_viral_score) {
            this.addJobLog(
              jobId,
              `Viral score ${transformedContent.viral_score} below threshold ${min_viral_score}, skipping...`
            );
            continue;
          }

          // Find and process image with intelligent routing
          // Extract text content from sections for image search
          const contentText = typeof transformedContent.content === 'string' 
            ? transformedContent.content 
            : transformedContent.content?.sections
              ?.map((s: any) => s.content)
              .join(' ')
              .slice(0, 500) || transformedContent.excerpt;
              
          const imageResult = await imageService.findBestImageIntelligent(
            transformedContent.title,
            contentText,
            transformedContent.category
          );
          const processedImage =
            await imageService.processImageForStorage(imageResult);

          // Get persona from database
          const persona = await prisma.persona.findFirst({
            where: { slug: transformedContent.persona },
          });

          // Create post in database
          const createdPost = await prisma.post.create({
            data: {
              title: transformedContent.title,
              slug: transformedContent.slug,
              excerpt: transformedContent.excerpt,
              content: transformedContent.content,
              imageUrl: processedImage.processed_url,
              category: transformedContent.category,
              author: persona?.name || 'ThreadJuice',
              personaId: persona?.id,
              status: auto_publish ? 'published' : 'draft',
              trending: transformedContent.viral_score >= 8,
              featured: transformedContent.viral_score >= 9,
              redditThreadId: post.id,
              subreddit: subreddit,
              viewCount: Math.floor(post.score * 0.1), // Estimate initial views
              upvoteCount: Math.floor(post.score * 0.05), // Convert Reddit score
              commentCount: Math.floor(post.num_comments * 0.1),
              shareCount: Math.floor(post.score * 0.02),
              bookmarkCount: Math.floor(post.score * 0.01),
            },
          });

          // Create image record
          await prisma.image.create({
            data: {
              postId: createdPost.id,
              url: processedImage.processed_url,
              altText: processedImage.metadata.alt_text,
              author: processedImage.metadata.author,
              sourceName: processedImage.metadata.source_name,
              sourceUrl: processedImage.metadata.source_url,
              licenseType: processedImage.metadata.license_type,
              width: processedImage.metadata.width,
              height: processedImage.metadata.height,
              position: 'main',
            },
          });

          // Create tags
          for (const tagName of transformedContent.tags) {
            let tag = await prisma.tag.findUnique({
              where: { slug: tagName.toLowerCase().replace(/\s+/g, '-') },
            });

            if (!tag) {
              tag = await prisma.tag.create({
                data: {
                  name: tagName,
                  slug: tagName.toLowerCase().replace(/\s+/g, '-'),
                  usageCount: 1,
                },
              });
            } else {
              await prisma.tag.update({
                where: { id: tag.id },
                data: { usageCount: tag.usageCount + 1 },
              });
            }

            await prisma.postTag.create({
              data: {
                postId: createdPost.id,
                tagId: tag.id,
              },
            });
          }

          createdCount++;
          job.posts_created = createdCount;
          this.addJobLog(
            jobId,
            `✅ Created post: "${transformedContent.title}"`
          );

          // Rate limiting between posts
          await new Promise(resolve => setTimeout(resolve, 3000));
        } catch (error) {
          this.addJobLog(jobId, `❌ Failed to process post: ${error}`);
        }
      }

      this.addJobLog(
        jobId,
        `✅ Ingestion completed! Created ${createdCount} posts from ${job.posts_processed} processed.`
      );
      this.updateJobStatus(jobId, 'completed');
    } catch (error) {
      this.addJobLog(jobId, `❌ Ingestion failed: ${error}`);
      this.updateJobStatus(
        jobId,
        'failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Get job status
   */
  getJobStatus(jobId: string): IngestionJob | null {
    return this.jobs.get(jobId) || null;
  }

  /**
   * Get all jobs
   */
  getAllJobs(): IngestionJob[] {
    return Array.from(this.jobs.values()).sort(
      (a, b) => b.started_at.getTime() - a.started_at.getTime()
    );
  }

  /**
   * Update job status
   */
  private updateJobStatus(
    jobId: string,
    status: IngestionJob['status'],
    errorMessage?: string
  ): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = status;
    if (status === 'completed' || status === 'failed') {
      job.completed_at = new Date();
    }
    if (errorMessage) {
      job.error_message = errorMessage;
    }
  }

  /**
   * Add log entry to job
   */
  private addJobLog(jobId: string, message: string): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    const timestamp = new Date().toISOString();
    job.logs.push(`[${timestamp}] ${message}`);
    // console.log(`[Ingestion ${jobId}] ${message}`)
  }

  /**
   * Automated scheduled ingestion
   */
  async scheduleAutomaticIngestion(): Promise<void> {
    const config: IngestionConfig = {
      subreddits: VIRAL_SUBREDDITS.slice(0, 3), // Top 3 viral subreddits
      limit_per_subreddit: 3,
      min_viral_score: 6,
      auto_publish: true,
    };

    this.addJobLog('scheduler', 'Starting scheduled content ingestion...');
    await this.startIngestionJob(config);
  }

  /**
   * Clean up old jobs (keep last 50)
   */
  cleanupOldJobs(): void {
    const jobs = this.getAllJobs();
    if (jobs.length > 50) {
      const toDelete = jobs.slice(50);
      for (const job of toDelete) {
        this.jobs.delete(job.id);
      }
    }
  }
}

// Export singleton
export const contentIngestionService = new ContentIngestionService();
