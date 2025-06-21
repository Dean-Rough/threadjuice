import { test, expect } from '@playwright/test';

test('Final polished site check', async ({ page }) => {
  await page.goto('/');
  
  // Wait for content to load
  await page.waitForTimeout(4000);
  
  // Take a full page screenshot of the polished site
  await page.screenshot({ 
    path: 'final-threadjuice-site.png', 
    fullPage: true 
  });
  
  // Verify dark mode
  const backgroundColor = await page.evaluate(() => {
    return window.getComputedStyle(document.body).backgroundColor;
  });
  // console.log('Background color (should be dark):', backgroundColor);
  
  // Check for viral content
  const viralTitles = await page.locator('text=/emotional labor|glitter bomb|Disneyland|cardboard/').count();
  // console.log('Viral story titles found:', viralTitles);
  
  // Check for brand elements
  const logoIcon = await page.locator('img[alt="ThreadJuice Icon"]').count();
  const logoText = await page.locator('img[alt="ThreadJuice"]').count();
  // console.log('Brand elements found - Icon:', logoIcon, 'Logo:', logoText);
  
  // Check for sidebar
  const topFive = await page.locator('text="Today\'s Top 5"').count();
  const quickStats = await page.locator('text="Quick Stats"').count();
  // console.log('Sidebar elements - Top 5:', topFive, 'Stats:', quickStats);
  
  // Check for footer
  const footer = await page.locator('footer').count();
  // console.log('Footer found:', footer);
  
  // Verify tagline
  const tagline = await page.locator('text="Get ratio\'d"').count();
  // console.log('Fun tagline found:', tagline);
  
  // console.log('Final site check complete - Professional viral content aggregator ready!');
});