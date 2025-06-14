import { logger } from './logger';

export interface Job {
  id: string;
  type: 'reddit_ingestion';
  data: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  retryCount: number;
  maxRetries: number;
}

export interface JobOptions {
  maxRetries?: number;
  priority?: number;
  delay?: number;
}

/**
 * Simple in-memory job queue for background processing
 * In production, this would be replaced with Redis or a proper queue system
 */
export class JobQueue {
  private jobs = new Map<string, Job>();
  private processing = new Set<string>();
  private workers = new Map<string, (job: Job) => Promise<any>>();
  private isRunning = false;
  private processingInterval?: NodeJS.Timeout;

  constructor(private concurrency: number = 3) {}

  /**
   * Register a worker function for a job type
   */
  registerWorker(jobType: string, worker: (job: Job) => Promise<any>): void {
    this.workers.set(jobType, worker);
    logger.info('Job worker registered', { jobType });
  }

  /**
   * Add a job to the queue
   */
  async addJob(
    type: string,
    data: any,
    options: JobOptions = {}
  ): Promise<string> {
    const jobId = this.generateJobId();
    const job: Job = {
      id: jobId,
      type: type as 'reddit_ingestion',
      data,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      retryCount: 0,
      maxRetries: options.maxRetries || 3,
    };

    this.jobs.set(jobId, job);
    logger.info('Job added to queue', { jobId, type });

    // Start processing if not already running
    if (!this.isRunning) {
      this.start();
    }

    return jobId;
  }

  /**
   * Get job status
   */
  getJob(jobId: string): Job | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get all jobs (for debugging/monitoring)
   */
  getAllJobs(): Job[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Start processing jobs
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.processingInterval = setInterval(() => {
      this.processJobs();
    }, 1000);

    logger.info('Job queue started', { concurrency: this.concurrency });
  }

  /**
   * Stop processing jobs
   */
  stop(): void {
    this.isRunning = false;
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = undefined;
    }
    logger.info('Job queue stopped');
  }

  /**
   * Process pending jobs
   */
  private async processJobs(): Promise<void> {
    if (this.processing.size >= this.concurrency) {
      return; // Already at max concurrency
    }

    const pendingJobs = Array.from(this.jobs.values())
      .filter(job => job.status === 'pending')
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    for (const job of pendingJobs) {
      if (this.processing.size >= this.concurrency) {
        break;
      }

      if (!this.workers.has(job.type)) {
        logger.error('No worker registered for job type', {
          jobType: job.type,
          jobId: job.id,
        });
        this.updateJobStatus(
          job.id,
          'failed',
          0,
          undefined,
          'No worker registered'
        );
        continue;
      }

      this.processJob(job);
    }
  }

  /**
   * Process a single job
   */
  private async processJob(job: Job): Promise<void> {
    this.processing.add(job.id);
    this.updateJobStatus(job.id, 'processing', 0);

    const worker = this.workers.get(job.type)!;

    try {
      logger.info('Processing job', { jobId: job.id, type: job.type });

      const result = await worker(job);

      this.updateJobStatus(job.id, 'completed', 100, result);
      logger.info('Job completed successfully', { jobId: job.id });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      logger.error('Job failed', { jobId: job.id, error: errorMessage });

      // Retry logic
      if (job.retryCount < job.maxRetries) {
        job.retryCount++;
        this.updateJobStatus(job.id, 'pending', 0);
        logger.info('Job queued for retry', {
          jobId: job.id,
          retryCount: job.retryCount,
        });
      } else {
        this.updateJobStatus(
          job.id,
          'failed',
          job.progress,
          undefined,
          errorMessage
        );
        logger.error('Job failed permanently', {
          jobId: job.id,
          maxRetries: job.maxRetries,
        });
      }
    } finally {
      this.processing.delete(job.id);
    }
  }

  /**
   * Update job status
   */
  private updateJobStatus(
    jobId: string,
    status: Job['status'],
    progress: number,
    result?: any,
    error?: string
  ): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = status;
    job.progress = progress;
    job.updatedAt = new Date();

    if (result !== undefined) {
      job.result = result;
    }

    if (error) {
      job.error = error;
    }

    this.jobs.set(jobId, job);
  }

  /**
   * Update job progress (called by workers)
   */
  updateProgress(jobId: string, progress: number): void {
    const job = this.jobs.get(jobId);
    if (job && job.status === 'processing') {
      job.progress = Math.max(0, Math.min(100, progress));
      job.updatedAt = new Date();
      this.jobs.set(jobId, job);
    }
  }

  /**
   * Clean up old completed/failed jobs
   */
  cleanup(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = new Date(Date.now() - maxAge);
    let cleaned = 0;

    for (const [jobId, job] of this.jobs.entries()) {
      if (
        (job.status === 'completed' || job.status === 'failed') &&
        job.updatedAt < cutoff
      ) {
        this.jobs.delete(jobId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info('Cleaned up old jobs', { count: cleaned });
    }
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  } {
    const jobs = Array.from(this.jobs.values());
    return {
      total: jobs.length,
      pending: jobs.filter(j => j.status === 'pending').length,
      processing: jobs.filter(j => j.status === 'processing').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
    };
  }
}

// Export singleton instance
export const jobQueue = new JobQueue();

// Auto-cleanup every hour
setInterval(
  () => {
    jobQueue.cleanup();
  },
  60 * 60 * 1000
);
