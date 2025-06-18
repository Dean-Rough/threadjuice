import { test, expect } from '@playwright/test';

test('Content loading investigation', async ({ page }) => {
  await page.goto('/');
  
  // Wait for the page to fully load
  await page.waitForLoadState('networkidle');
  
  // Check for TrendingFeed component
  const trendingSection = page.locator('section').filter({ hasText: 'Viral Stories' });
  const trendingExists = await trendingSection.count();
  console.log('Trending section found:', trendingExists > 0);
  
  // Look for any posts or content cards
  const postCards = page.locator('[class*="post-card"], [class*="post-item"], .trending-feed');
  const postCount = await postCards.count();
  console.log('Post cards found:', postCount);
  
  // Check for loading spinners
  const loadingSpinners = page.locator('[data-testid*="loading"], .loading, .spinner');
  const spinnerCount = await loadingSpinners.count();
  console.log('Loading spinners found:', spinnerCount);
  
  // Check for error messages
  const errors = page.locator('text=/error|Error|failed|Failed/i');
  const errorCount = await errors.count();
  console.log('Error messages found:', errorCount);
  
  // Look for the actual trending feed content
  const trendingFeed = page.locator('.trending-feed, [class*="trending"]');
  const feedCount = await trendingFeed.count();
  console.log('Trending feed elements:', feedCount);
  
  if (feedCount > 0) {
    const feedContent = await trendingFeed.first().textContent();
    console.log('Feed content preview:', feedContent?.substring(0, 200));
  }
  
  // Check network requests for API calls
  const apiRequests: string[] = [];
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      apiRequests.push(request.url());
    }
  });
  
  // Wait a bit for any async requests
  await page.waitForTimeout(3000);
  
  console.log('API requests made:', apiRequests);
  
  // Take screenshot of current state
  await page.screenshot({ path: 'content-debug.png', fullPage: true });
});