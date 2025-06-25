/**
 * ThreadJuice Automation Engine
 * Handles automated content generation with multiple strategies
 */

export interface AutomationConfig {
  enabled: boolean;
  schedule: {
    interval: 'hourly' | 'daily' | 'weekly';
    time?: string; // e.g., "14:30" for daily
    timezone?: string;
  };
  generation: {
    storiesPerRun: number;
    maxConcurrent: number;
    retryAttempts: number;
    sources: ('reddit' | 'twitter')[];
  };
  filtering: {
    strictMode: boolean;
    customFilters: string[];
  };
  notifications: {
    onSuccess: boolean;
    onFailure: boolean;
    webhook?: string;
  };
}

export interface GenerationJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  type: 'manual' | 'scheduled' | 'bulk';
  config: Partial<AutomationConfig>;
  startTime: Date;
  endTime?: Date;
  results: {
    attempted: number;
    successful: number;
    failed: number;
    stories: string[]; // story IDs
    errors: string[];
  };
}

export class AutomationEngine {
  private config: AutomationConfig;
  private activeJobs = new Map<string, GenerationJob>();
  private scheduledJobs = new Map<string, NodeJS.Timeout>();

  constructor(config: AutomationConfig) {
    this.config = config;
  }

  /**
   * Start the automation engine
   */
  async start(): Promise<void> {
    if (!this.config.enabled) {
      console.log('🤖 Automation disabled');
      return;
    }

    console.log('🚀 Starting ThreadJuice automation engine...');
    
    // Setup scheduled generation
    this.setupScheduledGeneration();
    
    // Setup monitoring
    this.setupMonitoring();
    
    console.log('✅ Automation engine started');
  }

  /**
   * Stop the automation engine
   */
  stop(): void {
    console.log('🛑 Stopping automation engine...');
    
    // Clear all scheduled jobs
    this.scheduledJobs.forEach(timeout => clearTimeout(timeout));
    this.scheduledJobs.clear();
    
    // Cancel running jobs
    this.activeJobs.forEach(job => {
      if (job.status === 'running') {
        job.status = 'failed';
        job.endTime = new Date();
        job.results.errors.push('Cancelled by system shutdown');
      }
    });
    
    console.log('✅ Automation engine stopped');
  }

  /**
   * Queue a manual generation job
   */
  async queueGeneration(options: {
    count?: number;
    source?: 'reddit' | 'twitter';
    category?: string;
    priority?: 'low' | 'normal' | 'high';
  } = {}): Promise<string> {
    const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const job: GenerationJob = {
      id: jobId,
      status: 'pending',
      type: 'manual',
      config: {
        generation: {
          storiesPerRun: options.count || 1,
          maxConcurrent: 2,
          retryAttempts: 3,
          sources: options.source ? [options.source] : ['reddit'],
        }
      },
      startTime: new Date(),
      results: {
        attempted: 0,
        successful: 0,
        failed: 0,
        stories: [],
        errors: [],
      },
    };

    this.activeJobs.set(jobId, job);
    
    // Execute immediately for manual jobs
    if (options.priority === 'high') {
      this.executeJob(jobId);
    } else {
      // Queue for execution (simple FIFO for now)
      setTimeout(() => this.executeJob(jobId), 1000);
    }
    
    return jobId;
  }

  /**
   * Execute a generation job
   */
  private async executeJob(jobId: string): Promise<void> {
    const job = this.activeJobs.get(jobId);
    if (!job) return;

    console.log(`🔄 Executing job ${jobId}...`);
    job.status = 'running';

    try {
      // TODO: Move to API route - Node.js scripts can't be imported in client code
      // const { generateStoryWithMedia } = await import('../../scripts/content/generate-story-unified.js');
      const storiesPerRun = job.config.generation?.storiesPerRun || 1;
      const maxConcurrent = job.config.generation?.maxConcurrent || 2;
      
      // Generate stories in batches to avoid overwhelming the system
      const batches = this.createBatches(storiesPerRun, maxConcurrent);
      
      for (const batch of batches) {
        const promises = batch.map(async () => {
          try {
            job.results.attempted++;
            
            // Call API route instead
            const response = await fetch('/api/generate-story', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                source: job.config.generation?.sources?.[0] || 'reddit',
              }),
            });
            
            if (!response.ok) {
              throw new Error(`API error: ${response.statusText}`);
            }
            
            const story = await response.json();
            
            job.results.successful++;
            job.results.stories.push(story.id);
            
            console.log(`✅ Generated story: ${story.title}`);
            return story;
          } catch (error) {
            job.results.failed++;
            job.results.errors.push(error instanceof Error ? error.message : String(error));
            console.error(`❌ Story generation failed:`, error instanceof Error ? error.message : error);
            return null;
          }
        });

        // Wait for batch to complete
        await Promise.allSettled(promises);
        
        // Brief pause between batches
        if (batches.indexOf(batch) < batches.length - 1) {
          await this.delay(2000);
        }
      }

      job.status = 'completed';
      job.endTime = new Date();
      
      console.log(`✅ Job ${jobId} completed: ${job.results.successful}/${job.results.attempted} stories generated`);
      
      // Send success notification
      if (this.config.notifications?.onSuccess) {
        await this.sendNotification('success', job);
      }
      
    } catch (error) {
      job.status = 'failed';
      job.endTime = new Date();
      job.results.errors.push(error instanceof Error ? error.message : String(error));
      
      console.error(`❌ Job ${jobId} failed:`, error instanceof Error ? error.message : error);
      
      // Send failure notification
      if (this.config.notifications?.onFailure) {
        await this.sendNotification('failure', job);
      }
    }
  }

  /**
   * Setup scheduled content generation
   */
  private setupScheduledGeneration(): void {
    const { schedule, generation } = this.config;
    
    let intervalMs: number;
    
    switch (schedule.interval) {
      case 'hourly':
        intervalMs = 60 * 60 * 1000; // 1 hour
        break;
      case 'daily':
        intervalMs = 24 * 60 * 60 * 1000; // 24 hours
        break;
      case 'weekly':
        intervalMs = 7 * 24 * 60 * 60 * 1000; // 7 days
        break;
      default:
        intervalMs = 60 * 60 * 1000; // Default to hourly
    }

    // Initial delay to align with schedule if time specified
    let initialDelay = 0;
    if (schedule.time && schedule.interval === 'daily') {
      const [hours, minutes] = schedule.time.split(':').map(Number);
      const now = new Date();
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);
      
      if (target <= now) {
        target.setDate(target.getDate() + 1);
      }
      
      initialDelay = target.getTime() - now.getTime();
    }

    const scheduleGeneration = () => {
      console.log(`⏰ Scheduled generation triggered - ${generation.storiesPerRun} stories`);
      
      const jobId = `scheduled-${Date.now()}`;
      const job: GenerationJob = {
        id: jobId,
        status: 'pending',
        type: 'scheduled',
        config: this.config,
        startTime: new Date(),
        results: {
          attempted: 0,
          successful: 0,
          failed: 0,
          stories: [],
          errors: [],
        },
      };

      this.activeJobs.set(jobId, job);
      this.executeJob(jobId);
    };

    // Setup the recurring schedule
    const setupRecurring = () => {
      const timeoutId = setInterval(scheduleGeneration, intervalMs);
      this.scheduledJobs.set('main-schedule', timeoutId as any);
      console.log(`📅 Scheduled generation every ${schedule.interval} (${intervalMs}ms)`);
    };

    if (initialDelay > 0) {
      // Wait for initial alignment, then start recurring
      setTimeout(() => {
        scheduleGeneration(); // Run immediately when aligned
        setupRecurring();
      }, initialDelay);
      
      console.log(`⏰ Initial generation scheduled in ${Math.round(initialDelay / 1000)}s`);
    } else {
      // Start immediately
      setupRecurring();
    }
  }

  /**
   * Setup monitoring and health checks
   */
  private setupMonitoring(): void {
    // Clean up completed jobs every hour
    const cleanupInterval = setInterval(() => {
      const now = new Date();
      const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
      
      for (const [jobId, job] of this.activeJobs.entries()) {
        if (job.status === 'completed' || job.status === 'failed') {
          if (job.endTime && job.endTime < cutoff) {
            this.activeJobs.delete(jobId);
          }
        }
      }
    }, 60 * 60 * 1000); // Every hour
    
    this.scheduledJobs.set('cleanup', cleanupInterval as any);
  }

  /**
   * Get status of all jobs
   */
  getJobStatus(): {
    active: GenerationJob[];
    summary: {
      running: number;
      pending: number;
      completed: number;
      failed: number;
    };
  } {
    const jobs = Array.from(this.activeJobs.values());
    
    return {
      active: jobs,
      summary: {
        running: jobs.filter(j => j.status === 'running').length,
        pending: jobs.filter(j => j.status === 'pending').length,
        completed: jobs.filter(j => j.status === 'completed').length,
        failed: jobs.filter(j => j.status === 'failed').length,
      },
    };
  }

  /**
   * Update automation configuration
   */
  updateConfig(newConfig: Partial<AutomationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart if enabled state changed
    if (newConfig.enabled !== undefined) {
      this.stop();
      if (newConfig.enabled) {
        this.start();
      }
    }
  }

  // Helper methods
  private createBatches<T>(total: number, batchSize: number): number[][] {
    const batches: number[][] = [];
    for (let i = 0; i < total; i += batchSize) {
      const batch = Array.from({ length: Math.min(batchSize, total - i) }, (_, idx) => i + idx);
      batches.push(batch);
    }
    return batches;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async sendNotification(type: 'success' | 'failure', job: GenerationJob): Promise<void> {
    if (!this.config.notifications?.webhook) return;

    try {
      const message = type === 'success' 
        ? `✅ ThreadJuice: Generated ${job.results.successful} stories`
        : `❌ ThreadJuice: Generation failed - ${job.results.errors[0]}`;

      // Simple webhook notification (adapt for your notification system)
      await fetch(this.config.notifications.webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: message,
          job: {
            id: job.id,
            type: job.type,
            results: job.results,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to send notification:', error instanceof Error ? error.message : error);
    }
  }
}

// Default configuration
export const defaultAutomationConfig: AutomationConfig = {
  enabled: false, // Start disabled
  schedule: {
    interval: 'daily',
    time: '09:00', // 9 AM
    timezone: 'America/New_York',
  },
  generation: {
    storiesPerRun: 5,
    maxConcurrent: 2,
    retryAttempts: 3,
    sources: ['reddit'],
  },
  filtering: {
    strictMode: true,
    customFilters: [],
  },
  notifications: {
    onSuccess: true,
    onFailure: true,
  },
};

// Singleton instance
let automationEngine: AutomationEngine | null = null;

export function getAutomationEngine(): AutomationEngine {
  if (!automationEngine) {
    automationEngine = new AutomationEngine(defaultAutomationConfig);
  }
  return automationEngine;
}