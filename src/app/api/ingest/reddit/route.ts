import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  contentIngestionService,
  IngestionConfig,
} from '@/lib/contentIngestionService';

const IngestionRequestSchema = z.object({
  subreddits: z.array(z.string()).optional(),
  limit_per_subreddit: z.number().min(1).max(10).optional(),
  min_viral_score: z.number().min(1).max(10).optional(),
  max_age_hours: z.number().min(1).max(168).optional(), // Max 1 week
  auto_publish: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = IngestionRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const config: IngestionConfig = validationResult.data;

    // Start ingestion job
    const job = await contentIngestionService.startIngestionJob(config);

    return NextResponse.json({
      success: true,
      job_id: job.id,
      status: job.status,
      message: 'Content ingestion started',
      check_status_url: `/api/ingest/status/${job.id}`,
    });
  } catch (error) {
    console.error('Content ingestion API error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to start content ingestion',
        request_id: crypto.randomUUID(),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get all recent jobs
    const jobs = contentIngestionService.getAllJobs();

    return NextResponse.json({
      jobs: jobs.map(job => ({
        id: job.id,
        status: job.status,
        posts_processed: job.posts_processed,
        posts_created: job.posts_created,
        started_at: job.started_at,
        completed_at: job.completed_at,
        error_message: job.error_message,
      })),
    });
  } catch (error) {
    console.error('Jobs listing API error:', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch jobs',
        request_id: crypto.randomUUID(),
      },
      { status: 500 }
    );
  }
}
