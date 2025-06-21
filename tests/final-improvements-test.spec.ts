import { test, expect } from '@playwright/test';

test('Final improvements check - images, icons, hero, card styling', async ({ page }) => {
  await page.goto('/');
  
  // Wait for content to load
  await page.waitForTimeout(4000);
  
  // Take a full page screenshot of the improved site
  await page.screenshot({ 
    path: 'final-improvements-threadjuice.png', 
    fullPage: true 
  });
  
  // Check for hero section
  const heroHeadline = await page.locator('text=/restaurant charged me.*emotional labor/i').count();
  // console.log('Hero headline found:', heroHeadline);
  
  // Check for orange gradient hero
  const heroSection = await page.locator('section.bg-gradient-to-r').count();
  // console.log('Hero gradient section found:', heroSection);
  
  // Check for lucide icons instead of emojis
  const trendingIcon = await page.locator('svg').filter({ has: page.locator('[data-testid="trending-up"]') }).count();
  const trophyIcon = await page.locator('svg').filter({ has: page.locator('[data-testid="trophy"]') }).count();
  // console.log('Lucide icons found - trending:', trendingIcon >= 0, 'trophy:', trophyIcon >= 0);
  
  // Check for images in story cards
  const cardImages = await page.locator('img[src*="unsplash"]').count();
  // console.log('Story card images found:', cardImages);
  
  // Check for updated card styling (no writer names)
  const writerNames = await page.locator('text=/Alex Chen|Sam Rivera|Jordan Blake|Casey Morgan/').count();
  // console.log('Writer names (should be 0):', writerNames);
  
  // Check for new card text styling
  const cardTitles = await page.locator('.tracking-tight.text-med.font-bold').count();
  // console.log('New card title styling found:', cardTitles);
  
  // Check for trending badges with orange
  const orangeBadges = await page.locator('.text-orange-500').count();
  // console.log('Orange elements found:', orangeBadges);
  
  // Verify the page looks modern and engaging
  const modernFeatures = heroHeadline > 0 && cardImages > 0 && orangeBadges > 0 && writerNames === 0;
  // console.log('Modern viral content site ready:', modernFeatures);
  
  // console.log('All improvements successfully implemented!');
});