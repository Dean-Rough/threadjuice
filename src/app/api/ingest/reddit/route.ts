import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ingestionService } from '@/lib/ingestionService';
import { redditIngestionSchema, validateRequestBody } from '@/lib/validations';

/**
 * POST /api/ingest/reddit - Start Reddit content ingestion
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication (optional - could allow anonymous ingestion)
    const { userId } = await auth();
    
    // Parse and validate request body
    const body = await request.json();
    const validation = validateRequestBody(redditIngestionSchema, body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body', message: validation.error },
        { status: 400 }
      );
    }

    const ingestionRequest = validation.data;

    // Add user ID to the request if authenticated
    const requestWithUser = {
      ...ingestionRequest,
      userId: userId || undefined,
    };

    console.log(`📥 Ingestion request for r/${ingestionRequest.subreddit} from ${userId || 'anonymous'}`);

    // Start ingestion process
    const jobId = await ingestionService.startIngestion(requestWithUser);

    return NextResponse.json({
      success: true,
      data: {
        jobId,
        message: `Ingestion started for r/${ingestionRequest.subreddit}`,
        estimatedPosts: ingestionRequest.limit || 25,
      },
      timestamp: new Date().toISOString(),
    }, { status: 202 }); // 202 Accepted for async operation

  } catch (error) {
    console.error('Ingestion API Error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded', message: 'Please try again later' },
          { status: 429 }
        );
      }
      
      if (error.message.includes('authentication')) {
        return NextResponse.json(
          { error: 'Authentication failed', message: 'Reddit API authentication failed' },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred during ingestion' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ingest/reddit - Get ingestion status and statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Get ingestion status
    const status = await ingestionService.getIngestionStatus();

    return NextResponse.json({
      success: true,
      data: {
        queue: status.queue,
        recentJobs: status.recentJobs,
        isHealthy: status.queue.failed < status.queue.total * 0.1, // Less than 10% failure rate
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Ingestion status API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'Failed to get ingestion status' },
      { status: 500 }
    );
  }
}