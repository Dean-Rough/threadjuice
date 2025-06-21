import { NextRequest, NextResponse } from 'next/server';
import { contentIngestionService } from '@/lib/contentIngestionService';

/**
 * GET /api/ingest/status/[jobId] - Get status of a specific content ingestion job
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        {
          error: 'INVALID_REQUEST',
          message: 'Job ID is required',
        },
        { status: 400 }
      );
    }

    // Get job status
    const job = contentIngestionService.getJobStatus(jobId);

    if (!job) {
      return NextResponse.json(
        {
          error: 'JOB_NOT_FOUND',
          message: `Job with ID ${jobId} not found`,
        },
        { status: 404 }
      );
    }

    // Calculate progress percentage
    const progress =
      job.status === 'completed'
        ? 100
        : job.status === 'failed'
          ? 0
          : job.status === 'running'
            ? Math.min((job.posts_processed / 10) * 100, 95)
            : 0;

    // Estimate remaining time for running jobs
    const estimatedTimeRemaining =
      job.status === 'running'
        ? `${Math.max(10 - job.posts_processed, 0) * 30} seconds`
        : null;

    return NextResponse.json({
      success: true,
      job_id: job.id,
      status: job.status,
      subreddit: job.subreddit,
      posts_processed: job.posts_processed,
      posts_created: job.posts_created,
      started_at: job.started_at,
      completed_at: job.completed_at,
      error_message: job.error_message,
      logs: job.logs.slice(-10), // Return last 10 log entries
      progress: {
        percentage: progress,
        estimated_time_remaining: estimatedTimeRemaining,
        status_message: getStatusMessage(job.status, progress),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Job status API error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch job status',
        request_id: crypto.randomUUID(),
      },
      { status: 500 }
    );
  }
}

/**
 * Get a human-readable status message
 */
function getStatusMessage(status: string, progress: number): string {
  switch (status) {
    case 'pending':
      return 'Content ingestion job is queued and waiting to start';
    case 'running':
      return `Fetching Reddit content and transforming with GPT (${progress}% complete)`;
    case 'completed':
      return 'Content ingestion completed successfully - new posts are live!';
    case 'failed':
      return 'Content ingestion failed - check logs for details';
    default:
      return 'Unknown job status';
  }
}
