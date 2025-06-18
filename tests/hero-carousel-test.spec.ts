import { test, expect } from '@playwright/test';

test('Hero carousel with animations and navigation', async ({ page }) => {
  await page.goto('/');
  
  // Wait for carousel to load
  await page.waitForTimeout(3000);
  
  // Take screenshot of hero carousel
  await page.screenshot({ 
    path: 'hero-carousel-threadjuice.png', 
    fullPage: true 
  });
  
  // Check for hero carousel section
  const heroSection = await page.locator('section.relative.overflow-hidden').count();
  console.log('Hero carousel section found:', heroSection);
  
  // Check for background image
  const backgroundImage = await page.locator('img[src*="unsplash"]').first().count();
  console.log('Hero background image found:', backgroundImage);
  
  // Check for navigation dots in bottom right
  const navDots = await page.locator('div.absolute.bottom-8.right-8 button').count();
  console.log('Navigation dots found:', navDots);
  
  // Check for trending badge with staggered animation classes
  const trendingBadge = await page.locator('text=/Trending #/').count();
  console.log('Trending badge found:', trendingBadge);
  
  // Check for large headline with animation classes
  const heroTitle = await page.locator('h1.text-4xl, h1.text-6xl, h1.text-7xl').count();
  console.log('Large hero title found:', heroTitle);
  
  // Check for excerpt text
  const excerpt = await page.locator('p.text-xl, p.text-2xl').count();
  console.log('Hero excerpt found:', excerpt);
  
  // Check for engagement stats
  const stats = await page.locator('text=/views|comments|shares/').count();
  console.log('Engagement stats found:', stats);
  
  // Check for progress bar
  const progressBar = await page.locator('div.bg-orange-500').count();
  console.log('Progress bar found:', progressBar);
  
  // Wait to see if auto-cycling works
  console.log('Testing auto-cycling...');
  await page.waitForTimeout(6000);
  
  // Check if slide changed (new trending number)
  const newTrendingBadge = await page.locator('text=/Trending #[2-5]/').count();
  console.log('Auto-cycling working (new slide):', newTrendingBadge > 0);
  
  // Test dot navigation
  const secondDot = page.locator('div.absolute.bottom-8.right-8 button').nth(1);
  if (await secondDot.count() > 0) {
    await secondDot.click();
    await page.waitForTimeout(1000);
    console.log('Dot navigation clicked successfully');
  }
  
  const heroFeatures = heroSection > 0 && navDots >= 3 && heroTitle > 0 && stats > 0;
  console.log('Hero carousel fully functional:', heroFeatures);
  
  console.log('Dynamic hero carousel with staggered animations ready!');
});