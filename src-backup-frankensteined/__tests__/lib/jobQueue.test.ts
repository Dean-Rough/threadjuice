import { JobQueue, type Job } from '@/lib/jobQueue';

describe('JobQueue', () => {
  let jobQueue: JobQueue;

  beforeEach(() => {
    jobQueue = new JobQueue(2); // Concurrency of 2 for testing
  });

  afterEach(() => {
    jobQueue.stop();
  });

  describe('Job Management', () => {
    it('should add jobs to the queue', async () => {
      const jobId = await jobQueue.addJob('reddit_ingestion', { test: 'data' });

      expect(jobId).toBeDefined();
      expect(jobId).toMatch(/^job_\d+_[a-z0-9]+$/);

      const job = jobQueue.getJob(jobId);
      expect(job).toBeDefined();
      expect(job?.status).toBe('pending');
      expect(job?.data).toEqual({ test: 'data' });
    });

    it('should register and execute workers', async () => {
      const mockWorker = jest.fn().mockResolvedValue({ result: 'success' });
      jobQueue.registerWorker('test_job', mockWorker);

      const jobId = await jobQueue.addJob('test_job', { input: 'test' });

      // Wait for job to be processed
      await new Promise(resolve => setTimeout(resolve, 1100));

      const job = jobQueue.getJob(jobId);
      expect(job?.status).toBe('completed');
      expect(job?.result).toEqual({ result: 'success' });
      expect(mockWorker).toHaveBeenCalledWith(
        expect.objectContaining({
          id: jobId,
          type: 'test_job',
          data: { input: 'test' },
        })
      );
    });

    it('should handle job failures with retry logic', async () => {
      let attempts = 0;
      const mockWorker = jest.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Test error');
        }
        return { result: 'success after retries' };
      });

      jobQueue.registerWorker('retry_job', mockWorker);

      const jobId = await jobQueue.addJob(
        'retry_job',
        { test: 'retry' },
        { maxRetries: 3 }
      );

      // Wait for retries to complete
      await new Promise(resolve => setTimeout(resolve, 3000));

      const job = jobQueue.getJob(jobId);
      expect(job?.status).toBe('completed');
      expect(job?.result).toEqual({ result: 'success after retries' });
      expect(mockWorker).toHaveBeenCalledTimes(3);
    });

    it('should fail jobs permanently after max retries', async () => {
      const mockWorker = jest
        .fn()
        .mockRejectedValue(new Error('Persistent error'));
      jobQueue.registerWorker('fail_job', mockWorker);

      const jobId = await jobQueue.addJob(
        'fail_job',
        { test: 'fail' },
        { maxRetries: 2 }
      );

      // Wait for retries to complete
      await new Promise(resolve => setTimeout(resolve, 3000));

      const job = jobQueue.getJob(jobId);
      expect(job?.status).toBe('failed');
      expect(job?.error).toBe('Persistent error');
      expect(job?.retryCount).toBe(2);
      expect(mockWorker).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });

    it('should respect concurrency limits', async () => {
      let activeJobs = 0;
      let maxConcurrent = 0;

      const mockWorker = jest.fn().mockImplementation(async () => {
        activeJobs++;
        maxConcurrent = Math.max(maxConcurrent, activeJobs);
        await new Promise(resolve => setTimeout(resolve, 500));
        activeJobs--;
        return { result: 'done' };
      });

      jobQueue.registerWorker('concurrent_job', mockWorker);

      // Add 5 jobs
      const jobIds = await Promise.all([
        jobQueue.addJob('concurrent_job', { id: 1 }),
        jobQueue.addJob('concurrent_job', { id: 2 }),
        jobQueue.addJob('concurrent_job', { id: 3 }),
        jobQueue.addJob('concurrent_job', { id: 4 }),
        jobQueue.addJob('concurrent_job', { id: 5 }),
      ]);

      // Wait for all jobs to complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      expect(maxConcurrent).toBeLessThanOrEqual(2); // Should respect concurrency limit
      expect(mockWorker).toHaveBeenCalledTimes(5);
    });
  });

  describe('Progress Tracking', () => {
    it('should update job progress', async () => {
      const mockWorker = jest.fn().mockImplementation(async (job: Job) => {
        jobQueue.updateProgress(job.id, 50);
        await new Promise(resolve => setTimeout(resolve, 100));
        jobQueue.updateProgress(job.id, 100);
        return { result: 'done' };
      });

      jobQueue.registerWorker('progress_job', mockWorker);

      const jobId = await jobQueue.addJob('progress_job', { test: 'progress' });

      // Check initial progress
      let job = jobQueue.getJob(jobId);
      expect(job?.progress).toBe(0);

      // Wait for job to start and update progress
      await new Promise(resolve => setTimeout(resolve, 1200));

      job = jobQueue.getJob(jobId);
      expect(job?.status).toBe('completed');
      expect(job?.progress).toBe(100);
    });

    it('should clamp progress values', () => {
      const jobId = 'test-job-id';
      const job: Job = {
        id: jobId,
        type: 'reddit_ingestion',
        data: {},
        status: 'processing',
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        retryCount: 0,
        maxRetries: 3,
      };

      // Manually add job to test progress clamping
      (jobQueue as any).jobs.set(jobId, job);

      jobQueue.updateProgress(jobId, -10);
      expect(jobQueue.getJob(jobId)?.progress).toBe(0);

      jobQueue.updateProgress(jobId, 150);
      expect(jobQueue.getJob(jobId)?.progress).toBe(100);
    });
  });

  describe('Statistics and Cleanup', () => {
    it('should provide accurate statistics', async () => {
      const mockWorker = jest.fn().mockResolvedValue({ result: 'done' });
      jobQueue.registerWorker('stats_job', mockWorker);

      // Add jobs with different outcomes
      await jobQueue.addJob('stats_job', { id: 1 });
      await jobQueue.addJob('stats_job', { id: 2 });
      await jobQueue.addJob('unknown_job', { id: 3 }); // Will fail - no worker

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      const stats = jobQueue.getStats();
      expect(stats.total).toBe(3);
      expect(stats.completed).toBe(2);
      expect(stats.failed).toBe(1);
      expect(stats.pending).toBe(0);
      expect(stats.processing).toBe(0);
    });

    it('should clean up old jobs', async () => {
      const mockWorker = jest.fn().mockResolvedValue({ result: 'done' });
      jobQueue.registerWorker('cleanup_job', mockWorker);

      const jobId = await jobQueue.addJob('cleanup_job', { test: 'cleanup' });

      // Wait for job to complete
      await new Promise(resolve => setTimeout(resolve, 1100));

      expect(jobQueue.getJob(jobId)).toBeDefined();

      // Cleanup with very short max age
      jobQueue.cleanup(1);

      expect(jobQueue.getJob(jobId)).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle jobs with no registered worker', async () => {
      const jobId = await jobQueue.addJob('nonexistent_job', { test: 'data' });

      // Wait for processing attempt
      await new Promise(resolve => setTimeout(resolve, 1100));

      const job = jobQueue.getJob(jobId);
      expect(job?.status).toBe('failed');
      expect(job?.error).toBe('No worker registered');
    });

    it('should handle worker exceptions gracefully', async () => {
      const mockWorker = jest.fn().mockImplementation(() => {
        throw new Error('Worker crashed');
      });

      jobQueue.registerWorker('crash_job', mockWorker);

      const jobId = await jobQueue.addJob('crash_job', { test: 'crash' });

      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 1100));

      const job = jobQueue.getJob(jobId);
      expect(job?.status).toBe('pending'); // Should be queued for retry
      expect(job?.retryCount).toBe(1);
    });
  });

  describe('Queue Control', () => {
    it('should start and stop processing', () => {
      expect((jobQueue as any).isRunning).toBe(false);

      jobQueue.start();
      expect((jobQueue as any).isRunning).toBe(true);

      jobQueue.stop();
      expect((jobQueue as any).isRunning).toBe(false);
    });

    it('should not start multiple times', () => {
      const setIntervalSpy = jest.spyOn(global, 'setInterval');

      jobQueue.start();
      jobQueue.start(); // Second start should be ignored

      expect(setIntervalSpy).toHaveBeenCalledTimes(1);

      setIntervalSpy.mockRestore();
    });
  });
});
