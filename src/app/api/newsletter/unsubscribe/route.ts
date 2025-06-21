import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { emailService } from '@/lib/email';
import { withMonitoring } from '@/lib/monitoring';

const unsubscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
});

/**
 * Newsletter unsubscribe endpoint
 * POST /api/newsletter/unsubscribe
 */
async function handleUnsubscribe(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = unsubscribeSchema.parse(body);

    // Unsubscribe from newsletter
    const result = await emailService.unsubscribeFromNewsletter(email);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    // Track unsubscription
    if (typeof globalThis !== 'undefined' && (globalThis as any).va) {
      (globalThis as any).va('track', 'Newsletter Unsubscription', { email });
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error('Newsletter unsubscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withMonitoring(handleUnsubscribe, {
  name: 'newsletter_unsubscribe',
  timeout: 10000,
});
