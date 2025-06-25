import { test, expect } from '@playwright/test';

test.describe('Basic Test Environment Setup', () => {
  test('should load homepage without environment errors', async ({ page }) => {
    // This test verifies that our environment configuration fixes the Supabase issue

    // Set test environment indicators
    process.env.NODE_ENV = 'test';

    // Navigate to homepage - this should not fail with Supabase errors
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Basic check that page loaded
    await expect(page).toHaveTitle(/ThreadJuice/);

    // Check that we can see some content (not a crash page)
    const bodyText = await page.textContent('body');
    expect(bodyText).toBeTruthy();
    expect(bodyText).not.toContain('supabaseUrl is required');
    expect(bodyText).not.toContain('Environment validation failed');
  });

  test('should handle navigation without errors', async ({ page }) => {
    await page.goto('/');

    // Check that navigation elements are present
    const nav = page.locator('nav').first();
    if (await nav.isVisible()) {
      await expect(nav).toBeVisible();
    }

    // Try to navigate to a different page if available
    const aboutLink = page
      .locator('a[href*="/about"], a:has-text("About")')
      .first();
    if (await aboutLink.isVisible()) {
      await aboutLink.click();
      await page.waitForLoadState('networkidle');
    }

    // Should not have any console errors related to environment
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });

    // Navigate back to homepage
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Check for environment-related errors
    const environmentErrors = logs.filter(
      log =>
        log.includes('supabaseUrl') ||
        log.includes('Environment validation') ||
        log.includes('Critical environment')
    );

    expect(environmentErrors).toHaveLength(0);
  });
});
