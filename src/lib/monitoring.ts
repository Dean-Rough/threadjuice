/**
 * Production monitoring and error tracking setup
 */

import { NextRequest, NextResponse } from 'next/server.js';

// Environment configuration
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';
const SENTRY_DSN = process.env.SENTRY_DSN;
const VERCEL_ENV = process.env.VERCEL_ENV;

/**
 * Initialize Sentry for error tracking
 */
export function initSentry() {
  if (typeof window !== 'undefined' && SENTRY_DSN) {
    // Client-side Sentry initialization
    import('@sentry/nextjs').then(({ init, browserTracingIntegration }) => {
      init({
        dsn: SENTRY_DSN,
        environment: VERCEL_ENV || ENVIRONMENT,
        release: APP_VERSION,
        tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
        integrations: [
          browserTracingIntegration(),
        ],
        beforeSend(event, hint) {
          // Filter out non-critical errors
          if (event.exception) {
            const error = hint.originalException;
            if (error instanceof Error) {
              // Skip network errors
              if (error.message.includes('NetworkError') || 
                  error.message.includes('fetch')) {
                return null;
              }
              
              // Skip third-party script errors
              if (error.stack?.includes('extension://') || 
                  error.stack?.includes('moz-extension://')) {
                return null;
              }
            }
          }
          
          return event;
        },
      });
    });
  }
}

/**
 * Server-side error tracking
 */
export function trackServerError(error: Error, context?: Record<string, any>) {
  if (SENTRY_DSN) {
    import('@sentry/nextjs').then(({ captureException, withScope }) => {
      withScope((scope) => {
        scope.setLevel('error');
        scope.setContext('server_context', {
          environment: ENVIRONMENT,
          version: APP_VERSION,
          ...context,
        });
        captureException(error);
      });
    });
  }
  
  // Also log to console in development
  if (ENVIRONMENT === 'development') {
    console.error('Server Error:', error, context);
  }
}

/**
 * Performance monitoring
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceTracker {
  private metrics: PerformanceMetric[] = [];
  
  track(name: string, value: number, metadata?: Record<string, any>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };
    
    this.metrics.push(metric);
    
    // Send to monitoring service
    this.sendMetric(metric);
  }
  
  private async sendMetric(metric: PerformanceMetric) {
    try {
      // Send to Vercel Analytics
      if (typeof window !== 'undefined' && (window as any).va) {
        (window as any).va('track', metric.name, { value: metric.value });
      }
      
      // Send to custom analytics endpoint
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      });
    } catch (error) {
      // Silently fail to avoid disrupting user experience
      console.debug('Failed to send performance metric:', error);
    }
  }
  
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }
  
  clearMetrics() {
    this.metrics = [];
  }
}

export const performanceTracker = new PerformanceTracker();

/**
 * API endpoint monitoring middleware
 */
export function withMonitoring<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  options: {
    name: string;
    timeout?: number;
  }
): T {
  return (async (...args: any[]) => {
    const startTime = Date.now();
    const request = args[0] as NextRequest;
    
    try {
      // Set timeout
      const timeoutMs = options.timeout || 30000;
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
      });
      
      // Execute handler with timeout
      const response = await Promise.race([
        handler(...args),
        timeoutPromise,
      ]);
      
      // Track successful request
      const duration = Date.now() - startTime;
      performanceTracker.track(`api.${options.name}.duration`, duration, {
        method: request.method,
        status: response.status,
        url: request.url,
      });
      
      return response;
    } catch (error) {
      // Track error
      const duration = Date.now() - startTime;
      const errorToTrack = error instanceof Error ? error : new Error(String(error));
      
      trackServerError(errorToTrack, {
        endpoint: options.name,
        method: request.method,
        url: request.url,
        duration,
      });
      
      performanceTracker.track(`api.${options.name}.error`, 1, {
        method: request.method,
        error: errorToTrack.message,
        url: request.url,
      });
      
      // Return error response
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }) as T;
}

/**
 * Health check endpoint data
 */
export interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: number;
  version: string;
  environment: string;
  checks: {
    database?: 'healthy' | 'unhealthy';
    redis?: 'healthy' | 'unhealthy';
    external_apis?: 'healthy' | 'unhealthy';
  };
  performance: {
    memory_usage: number;
    uptime: number;
    response_time: number;
  };
}

/**
 * Generate health check status
 */
export async function generateHealthCheck(): Promise<HealthCheck> {
  const startTime = Date.now();
  const checks: HealthCheck['checks'] = {};
  
  // Check database connection
  try {
    // This would check your actual database
    // const { supabase } = await import('./database');
    // await supabase.from('health_check').select('1').limit(1);
    checks.database = 'healthy';
  } catch (error) {
    checks.database = 'unhealthy';
    trackServerError(error as Error, { check: 'database' });
  }
  
  // Check external APIs
  try {
    // Check critical external services
    const responses = await Promise.allSettled([
      fetch('https://oauth.reddit.com/api/v1/me', { 
        method: 'HEAD',
        headers: { 'User-Agent': 'ThreadJuice/1.0' }
      }),
    ]);
    
    const allHealthy = responses.every(result => 
      result.status === 'fulfilled' && result.value.ok
    );
    
    checks.external_apis = allHealthy ? 'healthy' : 'unhealthy';
  } catch (error) {
    checks.external_apis = 'unhealthy';
    trackServerError(error as Error, { check: 'external_apis' });
  }
  
  // Calculate overall status
  const allChecks = Object.values(checks);
  const hasUnhealthy = allChecks.includes('unhealthy');
  const hasDegraded = false; // No longer using degraded status
  
  let status: HealthCheck['status'] = 'healthy';
  if (hasUnhealthy) status = 'unhealthy';
  
  const responseTime = Date.now() - startTime;
  
  return {
    status,
    timestamp: Date.now(),
    version: APP_VERSION,
    environment: VERCEL_ENV || ENVIRONMENT,
    checks,
    performance: {
      memory_usage: process.memoryUsage().heapUsed,
      uptime: process.uptime(),
      response_time: responseTime,
    },
  };
}

/**
 * Log structured application events
 */
export function logEvent(
  level: 'info' | 'warn' | 'error',
  message: string,
  metadata?: Record<string, any>
) {
  const logData = {
    level,
    message,
    timestamp: new Date().toISOString(),
    environment: ENVIRONMENT,
    version: APP_VERSION,
    ...metadata,
  };
  
  if (ENVIRONMENT === 'production') {
    // Send to external logging service
    // console.log(JSON.stringify(logData));
  } else {
    // Pretty print in development
    console[level](message, metadata);
  }
}

/**
 * Custom analytics tracking
 */
export function trackCustomEvent(
  event: string,
  properties?: Record<string, any>
) {
  if (typeof window !== 'undefined') {
    // Vercel Analytics
    if ((window as any).va) {
      (window as any).va('track', event, properties);
    }
    
    // Custom analytics
    fetch('/api/analytics/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        properties: {
          ...properties,
          timestamp: Date.now(),
          url: window.location.href,
          referrer: document.referrer,
        },
      }),
    }).catch(() => {
      // Silently fail
    });
  }
}

/**
 * Database query performance monitoring
 */
export function monitorDatabaseQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  
  return queryFn()
    .then(result => {
      const duration = Date.now() - startTime;
      performanceTracker.track(`db.${queryName}.duration`, duration);
      
      if (duration > 1000) {
        logEvent('warn', `Slow database query: ${queryName}`, {
          duration,
          query: queryName,
        });
      }
      
      return result;
    })
    .catch(error => {
      const duration = Date.now() - startTime;
      performanceTracker.track(`db.${queryName}.error`, 1);
      
      trackServerError(error, {
        query: queryName,
        duration,
      });
      
      throw error;
    });
}

/**
 * Initialize monitoring for the application
 */
export function initializeMonitoring() {
  // Initialize Sentry
  initSentry();
  
  // Set up global error handlers
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (event) => {
      trackServerError(new Error(event.reason), {
        type: 'unhandledrejection',
        reason: event.reason,
      });
    });
    
    window.addEventListener('error', (event) => {
      trackServerError(event.error || new Error(event.message), {
        type: 'javascript_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });
  }
  
  // Log initialization
  logEvent('info', 'Monitoring initialized', {
    environment: ENVIRONMENT,
    version: APP_VERSION,
  });
}