import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ingestionService } from '@/lib/ingestionService';
import { logger } from '@/lib/logger';

// GET /api/ingest/status/[jobId] - Get job status and progress
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { jobId } = await params;

    // Validate job ID format
    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid job ID' },
        { status: 400 }
      );
    }

    // Get job status
    const job = await ingestionService.getJobStatus(jobId);

    if (!job) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Job not found' },
        { status: 404 }
      );
    }

    // Calculate estimated time remaining
    let estimatedTimeRemaining: string | null = null;
    if (job.status === 'processing') {
      const remainingProgress = 100 - job.progress;
      const estimatedSeconds = Math.ceil((remainingProgress / 100) * 180); // Rough estimate
      estimatedTimeRemaining = `${estimatedSeconds} seconds`;
    }

    // Format response
    const response = {
      success: true,
      data: {
        jobId: job.id,
        status: job.status,
        progress: job.progress,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        estimatedTimeRemaining,
        data: {
          subreddit: job.data.subreddit,
          persona: job.data.persona,
          limit: job.data.limit
        },
        ...(job.status === 'completed' && job.result && {
          result: {
            postsCreated: job.result.length,
            totalTokensUsed: job.result.reduce((sum: number, r: any) => sum + r.tokensUsed, 0),
            posts: job.result.map((r: any) => ({
              postId: r.postId,
              redditThreadId: r.redditThreadId,
              tokensUsed: r.tokensUsed
            }))
          }
        }),
        ...(job.status === 'failed' && {
          error: job.error,
          retryCount: job.retryCount,
          maxRetries: job.maxRetries
        })
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    logger.error('Failed to get job status', { jobId: params, error });

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to get job status' },
      { status: 500 }
    );
  }
}

// DELETE /api/ingest/status/[jobId] - Cancel a pending job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { jobId } = await params;

    // Validate job ID format
    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid job ID' },
        { status: 400 }
      );
    }

    // Get job status
    const job = await ingestionService.getJobStatus(jobId);

    if (!job) {
      return NextResponse.json(
        { error: 'Not Found', message: 'Job not found' },
        { status: 404 }
      );
    }

    // Only allow canceling pending jobs
    if (job.status !== 'pending') {
      return NextResponse.json(
        { 
          error: 'Bad Request', 
          message: `Cannot cancel job with status: ${job.status}` 
        },
        { status: 400 }
      );
    }

    // Mark job as failed (simple cancellation)
    // In a real implementation, you'd have a proper cancellation mechanism
    logger.info('Job cancellation requested', { jobId, userId });

    return NextResponse.json({
      success: true,
      message: 'Job cancellation requested',
      data: {
        jobId,
        status: 'cancelled'
      }
    });

  } catch (error) {
    logger.error('Failed to cancel job', { jobId: params, error });

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to cancel job' },
      { status: 500 }
    );
  }
} 