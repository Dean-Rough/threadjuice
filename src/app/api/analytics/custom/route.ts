import { NextRequest, NextResponse } from 'next/server.js';
import { z } from 'zod';
import { withMonitoring } from '@/lib/monitoring';

const analyticsEventSchema = z.object({
  event: z.string().min(1),
  properties: z.record(z.any()).optional(),
  timestamp: z.number().optional(),
  url: z.string().optional(),
  referrer: z.string().optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
});

/**
 * Custom analytics tracking endpoint
 * POST /api/analytics/custom
 */
async function handleAnalyticsEvent(request: NextRequest) {
  try {
    const body = await request.json();
    const eventData = analyticsEventSchema.parse(body);

    // Add server-side metadata
    const enrichedEvent = {
      ...eventData,
      timestamp: eventData.timestamp || Date.now(),
      serverTimestamp: Date.now(),
      userAgent: request.headers.get('user-agent'),
      ip:
        request.headers.get('x-forwarded-for') ||
        request.headers.get('x-real-ip'),
      environment: process.env.NODE_ENV,
    };

    // Log event for debugging (in production, send to analytics service)
    // console.log('Analytics Event:', enrichedEvent);

    // In a real implementation, you would:
    // 1. Send to your analytics service (e.g., Mixpanel, Amplitude)
    // 2. Store in your database for custom analytics
    // 3. Send to Google Analytics via Measurement Protocol
    // 4. Forward to other tracking services

    // Example: Send to Google Analytics 4
    if (process.env.GA_MEASUREMENT_ID) {
      await sendToGoogleAnalytics(enrichedEvent);
    }

    // Store in your own analytics database
    await storeAnalyticsEvent(enrichedEvent);

    return NextResponse.json({ success: true }, { status: 201 });
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

    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Send event to Google Analytics 4
 */
async function sendToGoogleAnalytics(event: any) {
  try {
    const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID;
    const GA_API_SECRET = process.env.GA_API_SECRET;

    if (!GA_MEASUREMENT_ID || !GA_API_SECRET) {
      return;
    }

    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`,
      {
        method: 'POST',
        body: JSON.stringify({
          client_id: event.sessionId || 'anonymous',
          events: [
            {
              name: event.event.toLowerCase().replace(/\s+/g, '_'),
              params: {
                ...event.properties,
                page_location: event.url,
                page_referrer: event.referrer,
                timestamp_micros: (event.timestamp * 1000).toString(),
              },
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error('Google Analytics error:', await response.text());
    }
  } catch (error) {
    console.error('Failed to send to Google Analytics:', error);
  }
}

/**
 * Store analytics event in database
 */
async function storeAnalyticsEvent(event: any) {
  try {
    // In a real implementation, you would store this in your database
    // Example with Supabase:
    /*
    const { supabase } = await import('@/lib/database');
    
    await supabase.from('analytics_events').insert({
      event_name: event.event,
      properties: event.properties,
      timestamp: new Date(event.timestamp),
      url: event.url,
      referrer: event.referrer,
      user_id: event.userId,
      session_id: event.sessionId,
      user_agent: event.userAgent,
      ip_address: event.ip,
      environment: event.environment,
    });
    */
    // console.log('Analytics event stored (placeholder):', {
    //   event: event.event,
    //   timestamp: new Date(event.timestamp),
    // });
  } catch (error) {
    console.error('Failed to store analytics event:', error);
  }
}

export const POST = withMonitoring(handleAnalyticsEvent, {
  name: 'analytics_custom',
  timeout: 5000,
});
