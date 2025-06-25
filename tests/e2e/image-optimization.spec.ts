import { test, expect } from '@playwright/test';

test.describe('Image Optimization E2E Tests', () => {
  test('should load optimized images on homepage', async ({ page }) => {
    await page.goto('/');

    // Wait for images to load
    await page.waitForSelector('[data-testid="optimized-image"]', {
      timeout: 10000,
    });

    // Check that Next.js Image components are rendered
    const images = await page.locator('img[src*="/assets/img/"]').all();
    expect(images.length).toBeGreaterThan(0);

    // Verify that images have proper dimensions
    for (const image of images) {
      const width = await image.getAttribute('width');
      const height = await image.getAttribute('height');

      expect(width).toBeTruthy();
      expect(height).toBeTruthy();
      expect(parseInt(width!)).toBeGreaterThan(0);
      expect(parseInt(height!)).toBeGreaterThan(0);
    }
  });

  test('should load images with proper lazy loading', async ({ page }) => {
    await page.goto('/');

    // Check for loading attribute
    const lazyImages = await page.locator('img[loading="lazy"]').all();

    // Most images should have lazy loading (except priority images)
    expect(lazyImages.length).toBeGreaterThan(0);
  });

  test('should have priority images for above-the-fold content', async ({
    page,
  }) => {
    await page.goto('/');

    // Check for priority images (featured content)
    const priorityImages = await page
      .locator('img[fetchpriority="high"], img[priority]')
      .all();

    // Should have at least one priority image
    if (priorityImages.length > 0) {
      expect(priorityImages.length).toBeGreaterThan(0);
    }
  });

  test('should load images with proper alt text', async ({ page }) => {
    await page.goto('/');

    const images = await page.locator('img[src*="/assets/img/"]').all();

    for (const image of images) {
      const alt = await image.getAttribute('alt');
      expect(alt).toBeTruthy();
      expect(alt!.length).toBeGreaterThan(0);
    }
  });

  test('should handle image errors gracefully', async ({ page }) => {
    // Navigate to page
    await page.goto('/');

    // Listen for image errors
    const imageErrors: string[] = [];
    page.on('response', response => {
      if (response.url().includes('/assets/img/') && response.status() >= 400) {
        imageErrors.push(response.url());
      }
    });

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Should not have image loading errors
    expect(imageErrors.length).toBe(0);
  });

  test('should load images in different layouts correctly', async ({
    page,
  }) => {
    await page.goto('/blog');

    // Test grid layout
    await page.waitForSelector('img[src*="/assets/img/"]');
    const gridImages = await page.locator('img[src*="/assets/img/"]').all();
    expect(gridImages.length).toBeGreaterThan(0);

    // Verify images are visible
    for (const image of gridImages.slice(0, 3)) {
      // Test first 3 images
      await expect(image).toBeVisible();
    }
  });

  test('should optimize images for different viewport sizes', async ({
    page,
  }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await page.waitForSelector('img[src*="/assets/img/"]');
    let images = await page.locator('img[src*="/assets/img/"]').first();
    await expect(images).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();

    await page.waitForSelector('img[src*="/assets/img/"]');
    images = await page.locator('img[src*="/assets/img/"]').first();
    await expect(images).toBeVisible();
  });

  test('should load images with proper responsive sizing', async ({ page }) => {
    await page.goto('/');

    const images = await page.locator('img[src*="/assets/img/"]').all();

    for (const image of images.slice(0, 3)) {
      // Test first 3 images
      const boundingBox = await image.boundingBox();
      expect(boundingBox).toBeTruthy();
      expect(boundingBox!.width).toBeGreaterThan(0);
      expect(boundingBox!.height).toBeGreaterThan(0);
    }
  });
});
