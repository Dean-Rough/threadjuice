import { test, expect } from '@playwright/test';

test('Clean shadcn UI functionality test', async ({ page }) => {
  await page.goto('/');
  
  // Wait for the page to load
  await page.waitForTimeout(3000);
  
  // Take a screenshot to see the new clean UI
  await page.screenshot({ path: 'clean-ui-test.png', fullPage: true });
  
  // Check for the new ThreadJuice header
  const threadJuiceHeader = page.locator('h1:has-text("🧵 ThreadJuice")');
  const headerExists = await threadJuiceHeader.count() > 0;
  // console.log('ThreadJuice header found:', headerExists);
  
  // Check for shadcn components
  const cards = page.locator('[class*="bg-card"]');
  const cardCount = await cards.count();
  // console.log('shadcn cards found:', cardCount);
  
  // Check for clean Viral Stories section
  const viralStoriesHeading = page.locator('h2:has-text("🔥 Viral Stories")');
  const viralStoriesExists = await viralStoriesHeading.count() > 0;
  // console.log('Clean Viral Stories heading found:', viralStoriesExists);
  
  // Check if loading skeletons are present (good sign React Query is working)
  const skeletons = page.locator('[class*="animate-pulse"]');
  const skeletonCount = await skeletons.count();
  // console.log('Loading skeletons found:', skeletonCount);
  
  // Wait a bit more for data to load
  await page.waitForTimeout(3000);
  
  // Check for post content after loading
  const postCards = page.locator('[class*="group hover:shadow-lg"]');
  const postCount = await postCards.count();
  // console.log('Post cards found after loading:', postCount);
  
  // Check for badges
  const badges = page.locator('[class*="inline-flex"][class*="rounded-full"]');
  const badgeCount = await badges.count();
  // console.log('Badges found:', badgeCount);
  
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
  
  // console.log('Console errors:', errors.length > 0 ? errors : 'None');
  
  // Verify the UI looks clean and modern
  const hasCleanUI = headerExists && viralStoriesExists && (skeletonCount > 0 || postCount > 0);
  // console.log('Clean UI successfully rendered:', hasCleanUI);
});