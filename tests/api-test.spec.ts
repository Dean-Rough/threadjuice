import { test, expect } from '@playwright/test';

test('API endpoint direct test', async ({ page }) => {
  // Navigate to API endpoint directly
  const apiResponse = await page.goto('/api/posts?limit=3');
  
  // console.log('API Response status:', apiResponse?.status());
  
  if (apiResponse && apiResponse.ok()) {
    const data = await apiResponse.json();
    // console.log('API Response data:', JSON.stringify(data, null, 2));
  } else {
    // console.log('API Response failed');
  }
  
  // Now test the React Query integration
  await page.goto('/');
  
  // Listen to network requests
  const apiRequests: string[] = [];
  page.on('request', request => {
    if (request.url().includes('/api/posts')) {
      apiRequests.push(request.url());
      // console.log('API Request intercepted:', request.url());
    }
  });
  
  // Wait for React to mount and queries to trigger
  await page.waitForTimeout(5000);
  
  // console.log('Total API requests made by React Query:', apiRequests.length);
  
  // Force trigger the TrendingFeed if needed
  const trendingSection = page.locator('text=Viral Stories');
  if (await trendingSection.count() > 0) {
    await trendingSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
  }
  
  // console.log('Final API requests count:', apiRequests.length);
  // console.log('All API requests:', apiRequests);
});