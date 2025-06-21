import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { emailService, validateEmail } from '@/lib/email';
import { withMonitoring } from '@/lib/monitoring';

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().optional(),
  preferences: z
    .object({
      frequency: z.enum(['daily', 'weekly', 'instant']).default('daily'),
      categories: z.array(z.string()).default([]),
    })
    .optional(),
});

/**
 * Newsletter subscription endpoint
 * POST /api/newsletter/subscribe
 */
async function handleSubscribe(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, preferences } = subscribeSchema.parse(body);

    // Additional email validation
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Subscribe to newsletter
    const result = await emailService.subscribeToNewsletter(email, preferences);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    // Track successful subscription
    if (typeof globalThis !== 'undefined' && (globalThis as any).va) {
      (globalThis as any).va('track', 'Newsletter Subscription', {
        email,
        frequency: preferences?.frequency || 'daily',
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      { status: 201 }
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

    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withMonitoring(handleSubscribe, {
  name: 'newsletter_subscribe',
  timeout: 10000,
});
