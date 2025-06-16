/**
 * Performance monitoring and analytics utilities
 */

// Performance metrics interface
export interface PerformanceMetrics {
  // Core Web Vitals
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  
  // Custom metrics
  loadTime: number;
  domContentLoaded: number;
  interactionReady: number;
  
  // Additional context
  url: string;
  userAgent: string;
  timestamp: number;
  sessionId: string;
}

// Analytics event interface
export interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

// User engagement metrics
export interface EngagementMetrics {
  pageViews: number;
  uniqueVisitors: number;
  sessionDuration: number;
  bounceRate: number;
  clickThroughRate: number;
  conversionRate: number;
}

/**
 * Performance observer utility
 */
class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private sessionId: string;
  private observers: PerformanceObserver[] = [];
  
  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeObservers();
  }
  
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private initializeObservers(): void {
    if (typeof window === 'undefined') return;
    
    // Observe Core Web Vitals
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeTTFB();
    
    // Observe custom metrics
    this.observeLoadMetrics();
  }
  
  private observeLCP(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.metrics.lcp = lastEntry.startTime;
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    }
  }
  
  private observeFID(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.processingStart) {
            this.metrics.fid = entry.processingStart - entry.startTime;
          }
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    }
  }
  
  private observeCLS(): void {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.metrics.cls = clsValue;
          }
        });
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    }
  }
  
  private observeTTFB(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navEntry) {
        this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
      }
    }
  }
  
  private observeLoadMetrics(): void {
    if (typeof window === 'undefined') return;
    
    // FCP
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.fcp = entry.startTime;
          }
        });
      });
      
      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    }
    
    // Page load timing
    window.addEventListener('load', () => {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navEntry) {
        this.metrics.loadTime = navEntry.loadEventEnd - navEntry.loadEventStart;
        this.metrics.domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.startTime;
      }
    });
    
    // Interaction ready
    document.addEventListener('DOMContentLoaded', () => {
      this.metrics.interactionReady = performance.now();
    });
  }
  
  /**
   * Get current performance metrics
   */
  getMetrics(): Partial<PerformanceMetrics> {
    return {
      ...this.metrics,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };
  }
  
  /**
   * Send metrics to analytics endpoint
   */
  async sendMetrics(): Promise<void> {
    const metrics = this.getMetrics();
    
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(metrics),
      });
    } catch (error) {
      console.error('Failed to send performance metrics:', error);
    }
  }
  
  /**
   * Clean up observers
   */
  disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

/**
 * Analytics event tracker
 */
class EventTracker {
  private sessionId: string;
  private userId?: string;
  
  constructor() {
    this.sessionId = this.generateSessionId();
  }
  
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Set user ID for tracking
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }
  
  /**
   * Track an event
   */
  async track(name: string, properties: Record<string, any> = {}): Promise<void> {
    const event: AnalyticsEvent = {
      name,
      properties,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
    };
    
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }
  
  /**
   * Track page view
   */
  trackPageView(url?: string): void {
    this.track('page_view', {
      url: url || (typeof window !== 'undefined' ? window.location.href : ''),
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      timestamp: Date.now(),
    });
  }
  
  /**
   * Track user interaction
   */
  trackClick(element: string, properties: Record<string, any> = {}): void {
    this.track('click', {
      element,
      ...properties,
    });
  }
  
  /**
   * Track form submission
   */
  trackFormSubmit(formId: string, properties: Record<string, any> = {}): void {
    this.track('form_submit', {
      formId,
      ...properties,
    });
  }
  
  /**
   * Track content engagement
   */
  trackEngagement(contentId: string, duration: number): void {
    this.track('content_engagement', {
      contentId,
      duration,
    });
  }
  
  /**
   * Track conversion
   */
  trackConversion(type: string, value?: number): void {
    this.track('conversion', {
      type,
      value,
    });
  }
}

/**
 * A/B testing utility
 */
class ABTester {
  private variants: Map<string, string> = new Map();
  
  /**
   * Get variant for A/B test
   */
  getVariant(testName: string, variants: string[], userId?: string): string {
    const key = `ab_test_${testName}`;
    
    // Check if variant is already assigned
    const existing = this.variants.get(key);
    if (existing) {
      return existing;
    }
    
    // Assign variant based on user ID or random
    const seed = userId || Math.random().toString();
    const hash = this.simpleHash(seed + testName);
    const variantIndex = hash % variants.length;
    const variant = variants[variantIndex];
    
    this.variants.set(key, variant);
    
    // Track assignment
    eventTracker.track('ab_test_assignment', {
      testName,
      variant,
      userId,
    });
    
    return variant;
  }
  
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}

/**
 * Error tracking utility
 */
class ErrorTracker {
  constructor() {
    this.initializeErrorHandling();
  }
  
  private initializeErrorHandling(): void {
    if (typeof window === 'undefined') return;
    
    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
      });
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: event.reason?.message || 'Unhandled promise rejection',
        stack: event.reason?.stack,
        type: 'unhandledrejection',
      });
    });
  }
  
  /**
   * Track an error
   */
  async trackError(error: {
    message: string;
    filename?: string;
    line?: number;
    column?: number;
    stack?: string;
    type?: string;
  }): Promise<void> {
    try {
      await fetch('/api/analytics/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...error,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now(),
        }),
      });
    } catch (err) {
      console.error('Failed to track error:', err);
    }
  }
}

// Global instances - lazy initialization
let _performanceMonitor: PerformanceMonitor;
let _eventTracker: EventTracker;
let _abTester: ABTester;
let _errorTracker: ErrorTracker;

export const performanceMonitor = new Proxy({} as PerformanceMonitor, {
  get(target, prop) {
    if (!_performanceMonitor) {
      _performanceMonitor = new PerformanceMonitor();
    }
    return _performanceMonitor[prop as keyof PerformanceMonitor];
  }
});

export const eventTracker = new Proxy({} as EventTracker, {
  get(target, prop) {
    if (!_eventTracker) {
      _eventTracker = new EventTracker();
    }
    return _eventTracker[prop as keyof EventTracker];
  }
});

export const abTester = new Proxy({} as ABTester, {
  get(target, prop) {
    if (!_abTester) {
      _abTester = new ABTester();
    }
    return _abTester[prop as keyof ABTester];
  }
});

export const errorTracker = new Proxy({} as ErrorTracker, {
  get(target, prop) {
    if (!_errorTracker) {
      _errorTracker = new ErrorTracker();
    }
    return _errorTracker[prop as keyof ErrorTracker];
  }
});

/**
 * Initialize analytics for the application
 */
export function initializeAnalytics(config: {
  userId?: string;
  enableErrorTracking?: boolean;
  enablePerformanceMonitoring?: boolean;
} = {}): void {
  const { userId, enableErrorTracking = true, enablePerformanceMonitoring = true } = config;
  
  if (userId) {
    eventTracker.setUserId(userId);
  }
  
  // Track initial page view
  eventTracker.trackPageView();
  
  // Send performance metrics after page load
  if (enablePerformanceMonitoring) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        performanceMonitor.sendMetrics();
      }, 1000);
    });
  }
}

/**
 * Custom hook for React components
 */
export function useAnalytics() {
  return {
    track: eventTracker.track.bind(eventTracker),
    trackPageView: eventTracker.trackPageView.bind(eventTracker),
    trackClick: eventTracker.trackClick.bind(eventTracker),
    trackEngagement: eventTracker.trackEngagement.bind(eventTracker),
    trackConversion: eventTracker.trackConversion.bind(eventTracker),
    getVariant: abTester.getVariant.bind(abTester),
  };
}

/**
 * Server-side analytics utilities
 */
export class ServerAnalytics {
  /**
   * Track server-side event
   */
  static async trackServerEvent(
    event: string,
    properties: Record<string, any>,
    userId?: string
  ): Promise<void> {
    // Implementation would depend on your analytics backend
    console.log('Server event:', { event, properties, userId });
  }
  
  /**
   * Calculate engagement metrics
   */
  static calculateEngagementMetrics(
    pageViews: number,
    uniqueVisitors: number,
    totalSessionTime: number,
    bounces: number,
    conversions: number
  ): EngagementMetrics {
    return {
      pageViews,
      uniqueVisitors,
      sessionDuration: totalSessionTime / uniqueVisitors,
      bounceRate: bounces / pageViews,
      clickThroughRate: 0, // Would need click data
      conversionRate: conversions / uniqueVisitors,
    };
  }
}

/**
 * Performance budgets and monitoring
 */
export const PERFORMANCE_BUDGETS = {
  FCP: 1500, // First Contentful Paint should be under 1.5s
  LCP: 2500, // Largest Contentful Paint should be under 2.5s
  FID: 100,  // First Input Delay should be under 100ms
  CLS: 0.1,  // Cumulative Layout Shift should be under 0.1
  TTFB: 800, // Time to First Byte should be under 800ms
} as const;

/**
 * Check if performance metrics meet budgets
 */
export function checkPerformanceBudgets(metrics: Partial<PerformanceMetrics>): {
  passed: boolean;
  violations: string[];
} {
  const violations: string[] = [];
  
  if (metrics.fcp && metrics.fcp > PERFORMANCE_BUDGETS.FCP) {
    violations.push(`FCP: ${metrics.fcp}ms > ${PERFORMANCE_BUDGETS.FCP}ms`);
  }
  
  if (metrics.lcp && metrics.lcp > PERFORMANCE_BUDGETS.LCP) {
    violations.push(`LCP: ${metrics.lcp}ms > ${PERFORMANCE_BUDGETS.LCP}ms`);
  }
  
  if (metrics.fid && metrics.fid > PERFORMANCE_BUDGETS.FID) {
    violations.push(`FID: ${metrics.fid}ms > ${PERFORMANCE_BUDGETS.FID}ms`);
  }
  
  if (metrics.cls && metrics.cls > PERFORMANCE_BUDGETS.CLS) {
    violations.push(`CLS: ${metrics.cls} > ${PERFORMANCE_BUDGETS.CLS}`);
  }
  
  if (metrics.ttfb && metrics.ttfb > PERFORMANCE_BUDGETS.TTFB) {
    violations.push(`TTFB: ${metrics.ttfb}ms > ${PERFORMANCE_BUDGETS.TTFB}ms`);
  }
  
  return {
    passed: violations.length === 0,
    violations,
  };
}