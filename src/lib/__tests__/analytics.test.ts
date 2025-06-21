/**
 * Simplified analytics tests focusing on core functionality
 */

import {
  ServerAnalytics,
  checkPerformanceBudgets,
  PERFORMANCE_BUDGETS,
} from '../analytics';

// Mock fetch
global.fetch = jest.fn();

describe('Analytics Core Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({}),
    });
  });

  describe('ServerAnalytics', () => {
    it('should track server events', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await ServerAnalytics.trackServerEvent(
        'test_event',
        { prop: 'value' },
        'user123'
      );

      expect(consoleSpy).toHaveBeenCalledWith('Server event:', {
        event: 'test_event',
        properties: { prop: 'value' },
        userId: 'user123',
      });

      consoleSpy.mockRestore();
    });

    it('should calculate engagement metrics', () => {
      const metrics = ServerAnalytics.calculateEngagementMetrics(
        1000, // pageViews
        500, // uniqueVisitors
        15000, // totalSessionTime
        100, // bounces
        25 // conversions
      );

      expect(metrics.pageViews).toBe(1000);
      expect(metrics.uniqueVisitors).toBe(500);
      expect(metrics.sessionDuration).toBe(30); // 15000 / 500
      expect(metrics.bounceRate).toBe(0.1); // 100 / 1000
      expect(metrics.conversionRate).toBe(0.05); // 25 / 500
    });
  });

  describe('Performance Budgets', () => {
    it('should have correct budget values', () => {
      expect(PERFORMANCE_BUDGETS.FCP).toBe(1500);
      expect(PERFORMANCE_BUDGETS.LCP).toBe(2500);
      expect(PERFORMANCE_BUDGETS.FID).toBe(100);
      expect(PERFORMANCE_BUDGETS.CLS).toBe(0.1);
      expect(PERFORMANCE_BUDGETS.TTFB).toBe(800);
    });

    it('should pass when all metrics meet budgets', () => {
      const metrics = {
        fcp: 1200,
        lcp: 2000,
        fid: 50,
        cls: 0.05,
        ttfb: 600,
      };

      const result = checkPerformanceBudgets(metrics);

      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should fail when metrics exceed budgets', () => {
      const metrics = {
        fcp: 2000, // Exceeds 1500ms
        lcp: 3000, // Exceeds 2500ms
        fid: 150, // Exceeds 100ms
        cls: 0.2, // Exceeds 0.1
        ttfb: 1000, // Exceeds 800ms
      };

      const result = checkPerformanceBudgets(metrics);

      expect(result.passed).toBe(false);
      expect(result.violations).toHaveLength(5);
      expect(result.violations[0]).toContain('FCP: 2000ms > 1500ms');
      expect(result.violations[1]).toContain('LCP: 3000ms > 2500ms');
      expect(result.violations[2]).toContain('FID: 150ms > 100ms');
      expect(result.violations[3]).toContain('CLS: 0.2 > 0.1');
      expect(result.violations[4]).toContain('TTFB: 1000ms > 800ms');
    });

    it('should handle partial metrics', () => {
      const metrics = {
        fcp: 2000, // Only this exceeds budget
      };

      const result = checkPerformanceBudgets(metrics);

      expect(result.passed).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0]).toContain('FCP: 2000ms > 1500ms');
    });

    it('should handle empty metrics', () => {
      const result = checkPerformanceBudgets({});

      expect(result.passed).toBe(true);
      expect(result.violations).toHaveLength(0);
    });
  });

  describe('Performance Utility Functions', () => {
    it('should handle edge cases in engagement calculations', () => {
      // Test division by zero
      const metricsZeroVisitors = ServerAnalytics.calculateEngagementMetrics(
        100,
        0,
        1000,
        10,
        5
      );

      expect(metricsZeroVisitors.sessionDuration).toBe(Infinity);
      expect(metricsZeroVisitors.conversionRate).toBe(Infinity);

      // Test zero page views
      const metricsZeroPageViews = ServerAnalytics.calculateEngagementMetrics(
        0,
        100,
        1000,
        10,
        5
      );

      expect(metricsZeroPageViews.bounceRate).toBe(Infinity);
    });
  });
});

// Basic module loading test
describe('Analytics Module Loading', () => {
  it('should export required functions', () => {
    expect(typeof ServerAnalytics.trackServerEvent).toBe('function');
    expect(typeof ServerAnalytics.calculateEngagementMetrics).toBe('function');
    expect(typeof checkPerformanceBudgets).toBe('function');
    expect(typeof PERFORMANCE_BUDGETS).toBe('object');
  });
});
