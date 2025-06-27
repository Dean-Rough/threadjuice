import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { emailService } from '@/lib/email-with-db';

/**
 * Cron job to send daily newsletter
 * Runs daily at 9 AM UTC (configured in vercel.json)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is from Vercel Cron
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting newsletter send cron job...');

    // Create daily digest
    const template = await emailService.createDailyDigest();
    
    if (!template) {
      console.log('No content for daily digest, skipping newsletter');
      return NextResponse.json({
        success: true,
        message: 'No content to send',
        timestamp: new Date().toISOString(),
      });
    }

    // Send to daily subscribers
    const result = await emailService.sendNewsletter(template, 'daily');

    console.log(`Newsletter sent to ${result.sent} subscribers`);

    return NextResponse.json({
      success: result.success,
      message: `Newsletter sent to ${result.sent} subscribers`,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Newsletter send cron failed:', error);
    return NextResponse.json(
      { 
        error: 'Newsletter send failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}