import { NextRequest, NextResponse } from 'next/server';
import { jobQueue } from '@/lib/jobQueue';

/**
 * GET /api/ingest/status/[jobId] - Get status of a specific ingestion job
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Missing job ID', message: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Get job status from queue
    const job = jobQueue.getJob(jobId);

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found', message: `Job ${jobId} not found` },
        { status: 404 }
      );
    }

    // Get related jobs (for batch operations)
    const allJobs = jobQueue.getAllJobs();
    const relatedJobs = allJobs.filter(j => 
      j.id.includes('post-generation') // Assuming post generation jobs are related
    );

    // Calculate progress if this is a batch job
    let progress = 0;
    if (job.status === 'completed') {
      progress = 100;
    } else if (job.status === 'processing') {
      // Estimate progress based on related jobs
      const completed = relatedJobs.filter(j => j.status === 'completed').length;
      const total = relatedJobs.length;
      progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        jobId: job.id,
        status: job.status,
        progress,
        error: job.error,
        relatedJobs: {
          total: relatedJobs.length,
          completed: relatedJobs.filter(j => j.status === 'completed').length,
          failed: relatedJobs.filter(j => j.status === 'failed').length,
          processing: relatedJobs.filter(j => j.status === 'processing').length,
          pending: relatedJobs.filter(j => j.status === 'pending').length,
        },
        message: getStatusMessage(job.status, progress),
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Job status API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to get job status' },
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
      return 'Job is queued and waiting to be processed';
    case 'processing':
      return `Job is currently being processed (${progress}% complete)`;
    case 'completed':
      return 'Job completed successfully';
    case 'failed':
      return 'Job failed to complete';
    default:
      return 'Unknown job status';
  }
}