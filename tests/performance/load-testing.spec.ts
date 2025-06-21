import { test, expect } from '@playwright/test';

test.describe('Performance Testing', () => {
  test.describe('Core Web Vitals', () => {
    test('should meet Core Web Vitals benchmarks on homepage', async ({ page }) => {
      // Navigate to homepage with performance metrics collection
      const startTime = Date.now();
      await page.goto('/', { waitUntil: 'networkidle' });
      const navigationEnd = Date.now();
      
      // Measure total page load time
      const totalLoadTime = navigationEnd - startTime;
      expect(totalLoadTime).toBeLessThan(3000); // Should load within 3 seconds
      
      // Measure Core Web Vitals
      const webVitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const vitals: Record<string, number> = {};
          
          // First Contentful Paint (FCP)
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry) => {
              if (entry.name === 'first-contentful-paint') {
                vitals.fcp = entry.startTime;
              }
            });
          }).observe({ entryTypes: ['paint'] });
          
          // Largest Contentful Paint (LCP)
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            vitals.lcp = lastEntry.startTime;
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          
          // Cumulative Layout Shift (CLS)
          let clsValue = 0;
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
            vitals.cls = clsValue;
          }).observe({ entryTypes: ['layout-shift'] });
          
          // First Input Delay (FID) - approximated with interaction latency
          let fidMeasured = false;
          const measureFID = () => {
            if (!fidMeasured) {
              const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach((entry: any) => {
                  vitals.fid = entry.processingStart - entry.startTime;
                  fidMeasured = true;
                });
              });
              observer.observe({ entryTypes: ['first-input'] });
            }
          };
          
          // Trigger measurement
          document.addEventListener('click', measureFID, { once: true });
          document.addEventListener('keydown', measureFID, { once: true });
          
          // Return vitals after a delay to collect measurements
          setTimeout(() => {
            resolve(vitals);
          }, 2000);
        });
      });
      
      // Validate Core Web Vitals thresholds
      if ((webVitals as any).fcp) {
        expect((webVitals as any).fcp).toBeLessThan(1800); // Good FCP < 1.8s
      }
      
      if ((webVitals as any).lcp) {
        expect((webVitals as any).lcp).toBeLessThan(2500); // Good LCP < 2.5s
      }
      
      if ((webVitals as any).cls !== undefined) {
        expect((webVitals as any).cls).toBeLessThan(0.1); // Good CLS < 0.1
      }
    });

    test('should have fast Time to First Byte (TTFB)', async ({ page }) => {
      const response = await page.goto('/');
      const timing = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          ttfb: nav.responseStart - nav.requestStart,
          domContentLoaded: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
          loadComplete: nav.loadEventEnd - nav.loadEventStart,
        };
      });
      
      expect(timing.ttfb).toBeLessThan(800); // TTFB should be under 800ms
      expect(timing.domContentLoaded).toBeLessThan(1500); // DOM ready under 1.5s
    });
  });

  test.describe('Resource Loading Performance', () => {
    test('should load images efficiently', async ({ page }) => {
      await page.goto('/');
      
      // Wait for images to load
      await page.waitForLoadState('networkidle');
      
      // Check image loading performance
      const imageMetrics = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.map(img => ({
          src: img.src,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          complete: img.complete,
          loading: img.loading,
        }));
      });
      
      // All images should be loaded
      imageMetrics.forEach(img => {
        expect(img.complete).toBe(true);
      });
      
      // Check for lazy loading implementation
      const lazyImages = imageMetrics.filter(img => img.loading === 'lazy');
      if (imageMetrics.length > 3) {
        expect(lazyImages.length).toBeGreaterThan(0); // Should have some lazy-loaded images
      }
    });

    test('should have optimal bundle sizes', async ({ page }) => {
      // Intercept network requests to measure bundle sizes
      const resources: { url: string; size: number; type: string }[] = [];
      
      page.on('response', response => {
        const contentType = response.headers()['content-type'] || '';
        const contentLength = parseInt(response.headers()['content-length'] || '0');
        
        if (contentType.includes('javascript') || contentType.includes('css')) {
          resources.push({
            url: response.url(),
            size: contentLength,
            type: contentType.includes('javascript') ? 'js' : 'css',
          });
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Analyze bundle sizes
      const jsResources = resources.filter(r => r.type === 'js');
      const cssResources = resources.filter(r => r.type === 'css');
      
      const totalJSSize = jsResources.reduce((sum, r) => sum + r.size, 0);
      const totalCSSSize = cssResources.reduce((sum, r) => sum + r.size, 0);
      
      // Bundle size thresholds (in bytes)
      expect(totalJSSize).toBeLessThan(500 * 1024); // Total JS under 500KB
      expect(totalCSSSize).toBeLessThan(100 * 1024); // Total CSS under 100KB
      
      // Individual bundle thresholds
      jsResources.forEach(resource => {
        if (resource.size > 0) {
          expect(resource.size).toBeLessThan(200 * 1024); // Individual JS bundles under 200KB
        }
      });
    });
  });

  test.describe('Runtime Performance', () => {
    test('should have smooth scrolling and interactions', async ({ page }) => {
      await page.goto('/blog');
      await page.waitForLoadState('networkidle');
      
      // Measure scrolling performance
      const scrollMetrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          let frameCount = 0;
          const startTime = performance.now();
          
          const measureFrames = () => {
            frameCount++;
            if (frameCount < 30) {
              requestAnimationFrame(measureFrames);
            } else {
              const endTime = performance.now();
              const fps = (frameCount / (endTime - startTime)) * 1000;
              resolve({ fps, frameCount, duration: endTime - startTime });
            }
          };
          
          // Start scrolling
          window.scrollBy(0, 100);
          requestAnimationFrame(measureFrames);
        });
      });
      
      // Should maintain good frame rate during scrolling
      expect((scrollMetrics as any).fps).toBeGreaterThan(30); // At least 30 FPS
    });

    test('should handle rapid user interactions', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Simulate rapid clicks/interactions
      const button = page.locator('button, a, .clickable').first();
      if (await button.isVisible()) {
        const startTime = Date.now();
        
        // Rapid clicking
        for (let i = 0; i < 10; i++) {
          await button.click({ timeout: 100 });
          await page.waitForTimeout(50);
        }
        
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        
        // Should handle rapid interactions without significant delay
        expect(totalTime).toBeLessThan(2000); // Complete in under 2 seconds
      }
    });
  });

  test.describe('Memory and Resource Usage', () => {
    test('should not have memory leaks during navigation', async ({ page }) => {
      const initialMemory = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });
      
      // Navigate through multiple pages
      const pages = ['/', '/blog', '/personas', '/about'];
      
      for (const pagePath of pages) {
        try {
          await page.goto(pagePath);
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(500); // Allow for memory cleanup
        } catch (error) {
          // Page might not exist, continue testing
          continue;
        }
      }
      
      // Force garbage collection if available
      await page.evaluate(() => {
        if ((window as any).gc) {
          (window as any).gc();
        }
      });
      
      await page.waitForTimeout(1000); // Allow for garbage collection
      
      const finalMemory = await page.evaluate(() => {
        return (performance as any).memory ? (performance as any).memory.usedJSHeapSize : 0;
      });
      
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        const memoryIncreasePercent = (memoryIncrease / initialMemory) * 100;
        
        // Memory should not increase dramatically
        expect(memoryIncreasePercent).toBeLessThan(50); // Less than 50% increase
      }
    });

    test('should load efficiently on slower connections', async ({ page, context }) => {
      // Simulate slow 3G connection
      await context.route('**/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
        await route.continue();
      });
      
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;
      
      // Should still load reasonably fast on slow connections
      expect(loadTime).toBeLessThan(8000); // Under 8 seconds on slow connection
      
      // Check that critical content is visible
      await expect(page.locator('h1, .logo, nav')).toBeVisible();
    });
  });

  test.describe('Accessibility Performance', () => {
    test('should have fast keyboard navigation', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Test keyboard navigation speed
      const startTime = Date.now();
      
      // Tab through first 10 focusable elements
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
        await page.waitForTimeout(50); // Small delay to allow focus change
      }
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Keyboard navigation should be responsive
      expect(totalTime).toBeLessThan(2000); // Complete in under 2 seconds
      
      // Check that focus is visible
      const focusedElement = await page.locator(':focus').first();
      if (await focusedElement.isVisible()) {
        await expect(focusedElement).toBeVisible();
      }
    });
  });

  test.describe('Error Handling Performance', () => {
    test('should handle network failures gracefully', async ({ page, context }) => {
      // Block some non-critical resources
      await context.route('**/analytics/**', route => route.abort());
      await context.route('**/tracking/**', route => route.abort());
      
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;
      
      // Should still load core content even with failed resources
      expect(loadTime).toBeLessThan(5000);
      
      // Core content should be visible
      await expect(page.locator('main, .content, body')).toBeVisible();
    });

    test('should recover from JavaScript errors', async ({ page }) => {
      // Monitor console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Inject a non-critical error to test recovery
      await page.evaluate(() => {
        // Simulate a non-critical error
        try {
          (window as any).nonExistentFunction();
        } catch (error) {
          console.error('Test error:', error);
        }
      });
      
      await page.waitForTimeout(1000);
      
      // Page should still be functional despite errors
      await expect(page.locator('body')).toBeVisible();
      
      // Should be able to interact with the page
      const clickableElement = page.locator('a, button').first();
      if (await clickableElement.isVisible()) {
        await clickableElement.click();
        // Should not crash
      }
    });
  });
});