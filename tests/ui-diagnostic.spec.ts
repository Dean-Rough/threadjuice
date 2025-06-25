import { test, expect } from '@playwright/test';

test.describe('UI Diagnostic Tests', () => {
  test('Homepage loads and renders correctly', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Take screenshot for visual debugging
    await page.screenshot({ path: 'homepage-debug.png', fullPage: true });

    // Check page title
    await expect(page).toHaveTitle(/ThreadJuice/);

    // Log console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        // console.log('Browser console error:', msg.text());
      }
    });

    // Check for basic page structure
    const bodyText = await page.textContent('body');
    // console.log('Page body text length:', bodyText?.length || 0);

    // Check if CSS is loading
    const stylesheets = await page.$$('link[rel="stylesheet"]');
    // console.log('Number of stylesheets loaded:', stylesheets.length);

    // Check for JavaScript errors
    const errors: string[] = [];
    page.on('pageerror', err => {
      errors.push(err.message);
    });

    // Wait a bit for any async loading
    await page.waitForTimeout(3000);

    // Log any JavaScript errors
    if (errors.length > 0) {
      // console.log('JavaScript errors found:', errors);
    }

    // Check if basic elements are visible
    const header = page.locator('header');
    const main = page.locator('main');
    const footer = page.locator('footer');

    // console.log('Header exists:', await header.count() > 0);
    // console.log('Main content exists:', await main.count() > 0);
    // console.log('Footer exists:', await footer.count() > 0);
  });

  test('Check CSS and styling', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if Tailwind CSS is working
    const bodyClasses = await page.getAttribute('body', 'class');
    // console.log('Body classes:', bodyClasses);

    // Check computed styles of key elements
    const body = page.locator('body');
    const bodyStyles = await body.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        fontFamily: computed.fontFamily,
        backgroundColor: computed.backgroundColor,
        color: computed.color,
      };
    });
    // console.log('Body computed styles:', bodyStyles);

    // Check if fonts are loading
    const fontFamilies = await page.evaluate(() => {
      return Array.from(document.fonts).map(font => font.family);
    });
    // console.log('Loaded fonts:', fontFamilies);
  });

  test('Check interactive elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for buttons and links
    const buttons = await page.$$('button');
    const links = await page.$$('a');

    // console.log('Number of buttons found:', buttons.length);
    // console.log('Number of links found:', links.length);

    // Check if React has hydrated
    const reactRoot = await page.$('[data-reactroot]');
    // console.log('React root element found:', reactRoot !== null);

    // Check for any loading spinners or error states
    const loadingElements = await page.$$(
      '[data-testid*="loading"], .loading, .spinner'
    );
    // console.log('Loading elements found:', loadingElements.length);
  });

  test('Network requests analysis', async ({ page }) => {
    const failedRequests: any[] = [];
    const allRequests: any[] = [];

    page.on('request', request => {
      allRequests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
      });
    });

    page.on('response', response => {
      if (!response.ok()) {
        failedRequests.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
        });
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // console.log('Total requests made:', allRequests.length);
    // console.log('Failed requests:', failedRequests);

    // Check specifically for CSS and JS files
    const cssRequests = allRequests.filter(
      req => req.resourceType === 'stylesheet'
    );
    const jsRequests = allRequests.filter(req => req.resourceType === 'script');

    // console.log('CSS requests:', cssRequests.length);
    // console.log('JS requests:', jsRequests.length);

    // Log failed CSS/JS requests
    const failedAssets = failedRequests.filter(
      req => req.url.includes('.css') || req.url.includes('.js')
    );

    if (failedAssets.length > 0) {
      // console.log('Failed asset requests:', failedAssets);
    }
  });
});
