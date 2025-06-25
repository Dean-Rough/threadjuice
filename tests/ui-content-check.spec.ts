import { test, expect } from '@playwright/test';

test('Check if UI content is actually displaying', async ({ page }) => {
  await page.goto('/');

  // Wait for the page to load
  await page.waitForTimeout(3000);

  // Take a screenshot to see what's actually rendered
  await page.screenshot({ path: 'ui-content-check.png', fullPage: true });

  // Check for specific content elements
  const postCards = page.locator('[class*="post-card"], [class*="post-item"]');
  const postCount = await postCards.count();
  // console.log('Post cards found:', postCount);

  // Check for specific text content
  const viralStoriesHeading = page.locator('h2:has-text("🔥 Viral Stories")');
  const viralStoriesExists = (await viralStoriesHeading.count()) > 0;
  // console.log('Viral Stories heading found:', viralStoriesExists);

  // Check for loading spinners
  const loadingSpinners = page.locator('[data-testid="loading-spinner"]');
  const spinnerCount = await loadingSpinners.count();
  // console.log('Loading spinners still showing:', spinnerCount);

  // Check if we have actual content vs just loading states
  const hasContent = postCount > 0 && spinnerCount === 0;
  // console.log('Has actual content (no loading spinners):', hasContent);

  // Get page title
  const title = await page.title();
  // console.log('Page title:', title);

  // Check for any console errors
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // console.log('Console errors:', errors);
});
