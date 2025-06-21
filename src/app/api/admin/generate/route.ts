import { NextRequest, NextResponse } from 'next/server.js';
import { StoryIngestionService } from '@/lib/storyIngestion';

export async function POST(request: NextRequest) {
  try {
    const { count = 5 } = await request.json();

    // console.log(`Starting bulk story generation (${count} stories)...`);

    // Generate new stories
    const generationResults =
      await StoryIngestionService.generateBulkStories(count);

    // Migrate any new story files to database
    const migrationResults = await StoryIngestionService.migrateAllStories();

    return NextResponse.json({
      success: true,
      message: `Bulk generation completed`,
      results: {
        generated: generationResults.success,
        generationErrors: generationResults.errors,
        migrated: migrationResults.success,
        migrationErrors: migrationResults.errors,
      },
    });
  } catch (error) {
    console.error('Bulk generation failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Bulk generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Story generation endpoint ready. Use POST to generate stories.',
    usage: {
      endpoint: 'POST /api/admin/generate',
      body: '{ "count": 5 }',
      description: 'Generate specified number of new stories and ingest them',
    },
  });
}
