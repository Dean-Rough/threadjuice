import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withMonitoring } from '@/lib/monitoring';

const conversionEventSchema = z.object({
  type: z.enum([
    'signup',
    'newsletter_subscription',
    'first_post_read',
    'quiz_completed',
    'content_shared',
    'profile_completed',
    'onboarding_completed',
    'email_verified',
    'preferences_set',
  ]),
  userId: z.string().optional(),
  sessionId: z.string(),
  value: z.number().optional(), // Monetary value or engagement score
  properties: z.record(z.any()).optional(),
  funnel: z.object({
    step: z.string(),
    stage: z.string(),
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
  }).optional(),
});

/**
 * Conversion tracking endpoint for funnel analysis and optimization
 * POST /api/analytics/conversion
 */
async function handleConversionEvent(request: NextRequest) {
  try {
    const body = await request.json();
    const conversionData = conversionEventSchema.parse(body);

    const enrichedConversion = {
      ...conversionData,
      timestamp: Date.now(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      referer: request.headers.get('referer'),
      environment: process.env.NODE_ENV,
    };

    // Log conversion for debugging
    console.log('Conversion Event:', enrichedConversion);

    // Track key conversion events
    await Promise.all([
      trackConversionInAnalytics(enrichedConversion),
      storeConversionInDatabase(enrichedConversion),
      updateUserFunnel(enrichedConversion),
    ]);

    // Send conversion webhook if configured
    if (process.env.CONVERSION_WEBHOOK_URL) {
      await sendConversionWebhook(enrichedConversion);
    }

    return NextResponse.json(
      { success: true },
      { status: 201 }
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

    console.error('Conversion tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Track conversion in external analytics services
 */
async function trackConversionInAnalytics(conversion: any) {
  const promises = [];

  // Google Analytics 4 conversion
  if (process.env.GA_MEASUREMENT_ID) {
    promises.push(trackGoogleAnalyticsConversion(conversion));
  }

  // Facebook Pixel conversion
  if (process.env.FACEBOOK_PIXEL_ID) {
    promises.push(trackFacebookConversion(conversion));
  }

  // Custom analytics service
  promises.push(trackCustomConversion(conversion));

  await Promise.allSettled(promises);
}

/**
 * Track conversion in Google Analytics 4
 */
async function trackGoogleAnalyticsConversion(conversion: any) {
  try {
    const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID;
    const GA_API_SECRET = process.env.GA_API_SECRET;

    if (!GA_MEASUREMENT_ID || !GA_API_SECRET) {
      return;
    }

    const eventName = getGoogleAnalyticsEventName(conversion.type);
    const eventParams: any = {
      currency: 'USD',
      ...conversion.properties,
    };

    // Add value for important conversions
    if (conversion.value) {
      eventParams.value = conversion.value;
    }

    // Add ecommerce parameters for signup/subscription events
    if (['signup', 'newsletter_subscription'].includes(conversion.type)) {
      eventParams.transaction_id = conversion.sessionId;
      eventParams.affiliation = 'ThreadJuice';
    }

    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`,
      {
        method: 'POST',
        body: JSON.stringify({
          client_id: conversion.sessionId,
          user_id: conversion.userId,
          events: [
            {
              name: eventName,
              params: eventParams,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error('Google Analytics conversion error:', await response.text());
    }
  } catch (error) {
    console.error('Failed to track Google Analytics conversion:', error);
  }
}

/**
 * Track conversion on Facebook Pixel
 */
async function trackFacebookConversion(conversion: any) {
  try {
    const FACEBOOK_PIXEL_ID = process.env.FACEBOOK_PIXEL_ID;
    const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

    if (!FACEBOOK_PIXEL_ID || !FACEBOOK_ACCESS_TOKEN) {
      return;
    }

    const eventName = getFacebookEventName(conversion.type);
    
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${FACEBOOK_PIXEL_ID}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: FACEBOOK_ACCESS_TOKEN,
          data: [
            {
              event_name: eventName,
              event_time: Math.floor(conversion.timestamp / 1000),
              action_source: 'website',
              event_source_url: conversion.referer,
              user_data: {
                client_ip_address: conversion.ip,
                client_user_agent: conversion.userAgent,
                external_id: conversion.userId,
              },
              custom_data: {
                value: conversion.value,
                currency: 'USD',
                ...conversion.properties,
              },
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error('Facebook Pixel conversion error:', await response.text());
    }
  } catch (error) {
    console.error('Failed to track Facebook conversion:', error);
  }
}

/**
 * Track conversion in custom analytics
 */
async function trackCustomConversion(conversion: any) {
  try {
    // Send to your custom analytics service
    console.log('Custom conversion tracked:', {
      type: conversion.type,
      userId: conversion.userId,
      value: conversion.value,
      timestamp: new Date(conversion.timestamp),
    });
  } catch (error) {
    console.error('Failed to track custom conversion:', error);
  }
}

/**
 * Store conversion in database for funnel analysis
 */
async function storeConversionInDatabase(conversion: any) {
  try {
    // In a real implementation, store in your database
    /*
    const { supabase } = await import('@/lib/database');
    
    await supabase.from('conversion_events').insert({
      type: conversion.type,
      user_id: conversion.userId,
      session_id: conversion.sessionId,
      value: conversion.value,
      properties: conversion.properties,
      funnel_step: conversion.funnel?.step,
      funnel_stage: conversion.funnel?.stage,
      source: conversion.funnel?.source,
      medium: conversion.funnel?.medium,
      campaign: conversion.funnel?.campaign,
      timestamp: new Date(conversion.timestamp),
      user_agent: conversion.userAgent,
      ip_address: conversion.ip,
      referer: conversion.referer,
    });
    */
    
    console.log('Conversion stored in database (placeholder):', conversion.type);
  } catch (error) {
    console.error('Failed to store conversion in database:', error);
  }
}

/**
 * Update user funnel progress
 */
async function updateUserFunnel(conversion: any) {
  try {
    if (!conversion.userId) return;

    // Update user's funnel progress in database
    /*
    const { supabase } = await import('@/lib/database');
    
    await supabase.from('user_funnel_progress').upsert({
      user_id: conversion.userId,
      current_stage: conversion.funnel?.stage || 'unknown',
      last_conversion: conversion.type,
      last_activity: new Date(conversion.timestamp),
      total_conversions: 1, // Would increment existing value
    });
    */
    
    console.log('User funnel updated (placeholder):', {
      userId: conversion.userId,
      stage: conversion.funnel?.stage,
      conversion: conversion.type,
    });
  } catch (error) {
    console.error('Failed to update user funnel:', error);
  }
}

/**
 * Send conversion webhook for external integrations
 */
async function sendConversionWebhook(conversion: any) {
  try {
    const webhookUrl = process.env.CONVERSION_WEBHOOK_URL;
    if (!webhookUrl) return;

    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Source': 'ThreadJuice',
      },
      body: JSON.stringify({
        event: 'conversion',
        data: conversion,
      }),
    });
  } catch (error) {
    console.error('Failed to send conversion webhook:', error);
  }
}

/**
 * Map conversion types to Google Analytics event names
 */
function getGoogleAnalyticsEventName(type: string): string {
  const mapping: Record<string, string> = {
    signup: 'sign_up',
    newsletter_subscription: 'subscribe',
    first_post_read: 'engage_content',
    quiz_completed: 'complete_quiz',
    content_shared: 'share',
    profile_completed: 'complete_profile',
    onboarding_completed: 'complete_onboarding',
    email_verified: 'verify_email',
    preferences_set: 'set_preferences',
  };
  
  return mapping[type] || 'custom_conversion';
}

/**
 * Map conversion types to Facebook Pixel event names
 */
function getFacebookEventName(type: string): string {
  const mapping: Record<string, string> = {
    signup: 'CompleteRegistration',
    newsletter_subscription: 'Subscribe',
    first_post_read: 'ViewContent',
    quiz_completed: 'CompleteRegistration',
    content_shared: 'Share',
    profile_completed: 'CompleteRegistration',
    onboarding_completed: 'CompleteRegistration',
    email_verified: 'CompleteRegistration',
    preferences_set: 'CustomizeProduct',
  };
  
  return mapping[type] || 'CustomEvent';
}

export const POST = withMonitoring(handleConversionEvent, {
  name: 'analytics_conversion',
  timeout: 5000,
});