import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Cron job to generate new content
 * Runs daily at 6 AM UTC (configured in vercel.json)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is from Vercel Cron
    const authHeader = headers().get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting content generation cron job...');

    // Generate 5 new stories
    const numberOfStories = 5;
    const results = [];

    for (let i = 0; i < numberOfStories; i++) {
      try {
        console.log(`Generating story ${i + 1}/${numberOfStories}...`);
        
        // Run the story generation script
        const { stdout, stderr } = await execAsync(
          'node scripts/content/generate-story-unified.js --source reddit --real-data',
          { 
            cwd: process.cwd(),
            env: process.env 
          }
        );

        if (stderr) {
          console.error(`Story ${i + 1} stderr:`, stderr);
        }

        results.push({
          story: i + 1,
          success: true,
          output: stdout.slice(-200), // Last 200 chars
        });

        // Wait 5 seconds between stories to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error(`Failed to generate story ${i + 1}:`, error);
        results.push({
          story: i + 1,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      message: `Generated ${successCount}/${numberOfStories} stories`,
      results,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Content generation cron failed:', error);
    return NextResponse.json(
      { 
        error: 'Content generation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}