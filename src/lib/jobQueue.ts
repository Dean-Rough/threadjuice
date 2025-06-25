/**
 * Simple in-memory job queue for background processing
 * For production, consider using Redis Queue or similar
 */

export interface JobData {
  id: string;
  type: string;
  payload: any;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
  retryCount: number;
  maxRetries: number;
  priority: number; // Higher number = higher priority
}

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface JobResult {
  id: string;
  status: JobStatus;
  data?: any;
  error?: string;
  progress?: number;
}

export interface JobHandler {
  (job: JobData): Promise<any>;
}

export class JobQueue {
  private jobs = new Map<string, JobData>();
  private handlers = new Map<string, JobHandler>();
  private processing = new Set<string>();
  private concurrency: number;

  constructor(concurrency: number = 3) {
    this.concurrency = concurrency;
    this.startProcessor();
  }

  /**
   * Register a job handler for a specific job type
   */
  registerHandler(jobType: string, handler: JobHandler): void {
    this.handlers.set(jobType, handler);
  }

  /**
   * Add a job to the queue
   */
  addJob(
    type: string,
    payload: any,
    options: {
      priority?: number;
      maxRetries?: number;
      id?: string;
    } = {}
  ): string {
    const jobId = options.id || this.generateJobId();

    const job: JobData = {
      id: jobId,
      type,
      payload,
      createdAt: new Date(),
      retryCount: 0,
      maxRetries: options.maxRetries || 3,
      priority: options.priority || 0,
    };

    this.jobs.set(jobId, job);
    // console.log(`📥 Job added: ${jobId} (${type})`);

    return jobId;
  }

  /**
   * Get job status and result
   */
  getJob(jobId: string): JobResult | null {
    const job = this.jobs.get(jobId);
    if (!job) return null;

    let status: JobStatus;
    if (job.completedAt) {
      status = 'completed';
    } else if (job.failedAt) {
      status = 'failed';
    } else if (this.processing.has(jobId)) {
      status = 'processing';
    } else {
      status = 'pending';
    }

    return {
      id: job.id,
      status,
      error: job.error,
    };
  }

  /**
   * Get all jobs with optional filtering
   */
  getAllJobs(filter?: { status?: JobStatus; type?: string }): JobResult[] {
    const results: JobResult[] = [];

    for (const job of this.jobs.values()) {
      const result = this.getJob(job.id);
      if (!result) continue;

      if (filter?.status && result.status !== filter.status) continue;
      if (filter?.type && job.type !== filter.type) continue;

      results.push(result);
    }

    return results.sort((a, b) => {
      const jobA = this.jobs.get(a.id)!;
      const jobB = this.jobs.get(b.id)!;
      return jobB.createdAt.getTime() - jobA.createdAt.getTime();
    });
  }

  /**
   * Remove completed or failed jobs older than specified time
   */
  cleanup(maxAge: number = 24 * 60 * 60 * 1000): number {
    // 24 hours default
    let removed = 0;
    const cutoff = new Date(Date.now() - maxAge);

    for (const [jobId, job] of this.jobs.entries()) {
      const isFinished = job.completedAt || job.failedAt;
      const isOld = job.createdAt < cutoff;

      if (isFinished && isOld) {
        this.jobs.delete(jobId);
        removed++;
      }
    }

    if (removed > 0) {
      // console.log(`🧹 Cleaned up ${removed} old jobs`);
    }

    return removed;
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
    let pending = 0;
    let processing = 0;
    let completed = 0;
    let failed = 0;

    for (const job of this.jobs.values()) {
      if (job.completedAt) {
        completed++;
      } else if (job.failedAt) {
        failed++;
      } else if (this.processing.has(job.id)) {
        processing++;
      } else {
        pending++;
      }
    }

    return {
      total: this.jobs.size,
      pending,
      processing,
      completed,
      failed,
    };
  }

  /**
   * Start the job processor
   */
  private startProcessor(): void {
    setInterval(() => {
      this.processJobs();
    }, 1000); // Check every second

    // Cleanup old jobs every hour
    setInterval(
      () => {
        this.cleanup();
      },
      60 * 60 * 1000
    );
  }

  /**
   * Process pending jobs
   */
  private async processJobs(): Promise<void> {
    if (this.processing.size >= this.concurrency) {
      return; // Already at max concurrency
    }

    // Get pending jobs sorted by priority and creation time
    const pendingJobs = Array.from(this.jobs.values())
      .filter(
        job => !job.completedAt && !job.failedAt && !this.processing.has(job.id)
      )
      .sort((a, b) => {
        // First by priority (higher first)
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        // Then by creation time (older first)
        return a.createdAt.getTime() - b.createdAt.getTime();
      });

    const jobsToProcess = pendingJobs.slice(
      0,
      this.concurrency - this.processing.size
    );

    for (const job of jobsToProcess) {
      this.processJob(job);
    }
  }

  /**
   * Process a single job
   */
  private async processJob(job: JobData): Promise<void> {
    const handler = this.handlers.get(job.type);
    if (!handler) {
      console.error(`❌ No handler for job type: ${job.type}`);
      this.failJob(job, `No handler registered for job type: ${job.type}`);
      return;
    }

    this.processing.add(job.id);
    job.startedAt = new Date();

    // console.log(`⚡ Processing job: ${job.id} (${job.type})`);

    try {
      const result = await handler(job);

      job.completedAt = new Date();
      // console.log(`✅ Job completed: ${job.id} (${job.type})`);
    } catch (error) {
      console.error(`❌ Job failed: ${job.id} (${job.type})`, error);

      job.retryCount++;

      if (job.retryCount <= job.maxRetries) {
        // console.log(`🔄 Retrying job: ${job.id} (attempt ${job.retryCount}/${job.maxRetries})`);
        // Job will be retried in next processing cycle
      } else {
        this.failJob(
          job,
          error instanceof Error ? error.message : String(error)
        );
      }
    } finally {
      this.processing.delete(job.id);
    }
  }

  /**
   * Mark a job as failed
   */
  private failJob(job: JobData, error: string): void {
    job.failedAt = new Date();
    job.error = error;
    console.error(`💀 Job permanently failed: ${job.id} - ${error}`);
  }

  /**
   * Generate a unique job ID
   */
  private generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const jobQueue = new JobQueue(3);
