import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { ingestionService } from '@/lib/ingestionService';
import { RedditIngestionSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

// POST /api/ingest/reddit - Start Reddit content ingestion
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = RedditIngestionSchema.parse(body);

    logger.info('Reddit ingestion requested', {
      userId,
      subreddit: validatedData.subreddit,
      persona: validatedData.persona,
      limit: validatedData.limit
    });

    // Start ingestion job
    const jobId = await ingestionService.startIngestion({
      ...validatedData,
      userId
    });

    return NextResponse.json({
      success: true,
      message: 'Reddit ingestion started',
      data: {
        jobId,
        status: 'pending',
        subreddit: validatedData.subreddit,
        persona: validatedData.persona,
        estimatedTime: `${(validatedData.limit || 5) * 30} seconds`
      }
    }, { status: 202 });

  } catch (error) {
    logger.error('Reddit ingestion request failed', { error });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid ingestion parameters',
          details: error.flatten(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to start ingestion' },
      { status: 500 }
    );
  }
}

// GET /api/ingest/reddit - Get ingestion statistics
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    const stats = ingestionService.getStats();

    return NextResponse.json({
      success: true,
      data: {
        queue: stats,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    logger.error('Failed to get ingestion stats', { error });

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to get statistics' },
      { status: 500 }
    );
  }
} 