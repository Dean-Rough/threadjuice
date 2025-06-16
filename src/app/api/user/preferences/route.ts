import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { withMonitoring } from '@/lib/monitoring';

const preferencesSchema = z.object({
  preferences: z.object({
    categories: z.array(z.string()),
    frequency: z.enum(['daily', 'weekly', 'instant']),
    writers: z.array(z.string()),
  }),
  profile: z.object({
    firstName: z.string().optional(),
    interests: z.array(z.string()).optional(),
  }).optional(),
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
  }).optional(),
});

/**
 * User preferences endpoint
 * GET /api/user/preferences - Get user preferences
 * POST /api/user/preferences - Save user preferences
 */

async function handleGetPreferences(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // In a real implementation, you would fetch from your database
    // For now, return default preferences
    const defaultPreferences = {
      preferences: {
        categories: [],
        frequency: 'daily' as const,
        writers: [],
      },
      profile: {
        firstName: '',
        interests: [],
      },
      notifications: {
        email: true,
        push: false,
      },
    };

    return NextResponse.json(defaultPreferences);
  } catch (error) {
    console.error('Error fetching preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleSavePreferences(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = preferencesSchema.parse(body);

    // In a real implementation, you would save to your database
    console.log('Saving user preferences:', {
      userId,
      preferences: validatedData,
    });

    // Track preference update
    if (typeof globalThis !== 'undefined' && (globalThis as any).va) {
      (globalThis as any).va('track', 'Preferences Updated', {
        userId,
        categories: validatedData.preferences.categories.length,
        frequency: validatedData.preferences.frequency,
        writers: validatedData.preferences.writers.length,
      });
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Preferences saved successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    console.error('Error saving preferences:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withMonitoring(handleGetPreferences, {
  name: 'user_preferences_get',
  timeout: 5000,
});

export const POST = withMonitoring(handleSavePreferences, {
  name: 'user_preferences_save',
  timeout: 5000,
});