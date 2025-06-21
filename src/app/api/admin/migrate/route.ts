import { NextRequest, NextResponse } from 'next/server';
import { StoryIngestionService } from '@/lib/storyIngestion';

export async function POST(request: NextRequest) {
  try {
    // console.log('Starting story migration...');

    // Migrate all existing file-based stories
    const migrationResults = await StoryIngestionService.migrateAllStories();

    // Auto-approve all stories
    const approvedCount = await StoryIngestionService.autoApproveAll();

    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      results: {
        migrated: migrationResults.success,
        errors: migrationResults.errors,
        approved: approvedCount,
      },
    });
  } catch (error) {
    console.error('Migration failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Migration failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Migration endpoint ready. Use POST to trigger migration.',
    endpoints: {
      migrate: 'POST /api/admin/migrate',
      generate: 'POST /api/admin/generate',
    },
  });
}
