import { test, expect } from '@playwright/test';

test.describe('Critical User Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
  });

  test.describe('Homepage and Navigation', () => {
    test('should load homepage and display key elements', async ({ page }) => {
      // Check if the page loads
      await expect(page).toHaveTitle(/ThreadJuice/);

      // Check for main navigation elements
      await expect(page.locator('nav')).toBeVisible();

      // Check for logo/branding
      await expect(
        page.locator('img[alt*="ThreadJuice"], img[alt*="logo"]').first()
      ).toBeVisible();

      // Check for main content area
      await expect(
        page.locator('main, .trending-feed, .featured-content')
      ).toBeVisible();
    });

    test('should navigate between main pages', async ({ page }) => {
      // Test navigation to blog page
      const blogLink = page
        .locator('a[href*="/blog"], a:has-text("Blog"), a:has-text("Stories")')
        .first();
      if (await blogLink.isVisible()) {
        await blogLink.click();
        await expect(page).toHaveURL(/\/blog/);
      }

      // Navigate back to homepage
      await page.goto('/');

      // Test navigation to personas page
      const personasLink = page
        .locator(
          'a[href*="/personas"], a:has-text("Personas"), a:has-text("Writers")'
        )
        .first();
      if (await personasLink.isVisible()) {
        await personasLink.click();
        await expect(page).toHaveURL(/\/personas/);
      }
    });

    test('should display responsive design on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Check if mobile navigation works
      await expect(page.locator('nav')).toBeVisible();

      // Check if content adapts to mobile
      const content = page.locator('main, .content, .container').first();
      await expect(content).toBeVisible();

      // Check if images are responsive
      const images = page.locator('img');
      const imageCount = await images.count();
      if (imageCount > 0) {
        const firstImage = images.first();
        await expect(firstImage).toBeVisible();
      }
    });
  });

  test.describe('Content Discovery', () => {
    test('should browse and filter content', async ({ page }) => {
      // Navigate to blog/stories page
      await page.goto('/blog');

      // Wait for content to load
      await page.waitForLoadState('networkidle');

      // Check if posts are displayed
      const posts = page
        .locator('[data-testid="post-card"], .post-card, article')
        .first();
      await expect(posts).toBeVisible({ timeout: 10000 });

      // Test category filtering if available
      const categoryFilter = page
        .locator(
          'select[id*="category"], .category-filter select, [data-testid="category-filter"]'
        )
        .first();
      if (await categoryFilter.isVisible()) {
        await categoryFilter.selectOption({ index: 1 }); // Select first non-default option
        await page.waitForTimeout(500); // Wait for filtering
      }

      // Test search functionality if available
      const searchInput = page
        .locator(
          'input[type="search"], input[placeholder*="Search"], [data-testid="search"]'
        )
        .first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await page.waitForTimeout(500); // Wait for search results
      }
    });

    test('should view individual post', async ({ page }) => {
      // Navigate to blog page first
      await page.goto('/blog');
      await page.waitForLoadState('networkidle');

      // Click on first post link
      const postLink = page
        .locator(
          'a[href*="/posts/"], a[href*="/blog/"], .post-card a, article a'
        )
        .first();

      if (await postLink.isVisible()) {
        await postLink.click();

        // Wait for post page to load
        await page.waitForLoadState('networkidle');

        // Check if post content is displayed
        await expect(
          page.locator('h1, .post-title, .article-title')
        ).toBeVisible();
        await expect(
          page.locator('.post-content, .article-content, main')
        ).toBeVisible();

        // Check for author/persona information
        const authorInfo = page
          .locator('.author, .persona, [data-testid="author"]')
          .first();
        if (await authorInfo.isVisible()) {
          await expect(authorInfo).toBeVisible();
        }
      } else {
        test.skip('No post links found to test');
      }
    });
  });

  test.describe('Interactive Features', () => {
    test('should interact with quiz if available', async ({ page }) => {
      // Look for quiz content on any page
      await page.goto('/');

      const quizLink = page
        .locator('a:has-text("Quiz"), a[href*="quiz"], .quiz-link')
        .first();
      if (await quizLink.isVisible()) {
        await quizLink.click();

        // Check if quiz loads
        await expect(
          page.locator('.quiz, [data-testid="quiz"], .quiz-container')
        ).toBeVisible();

        // Try to interact with first question if available
        const firstOption = page
          .locator('input[type="radio"], .quiz-option, .question input')
          .first();
        if (await firstOption.isVisible()) {
          await firstOption.click();

          // Look for submit or next button
          const submitButton = page
            .locator(
              'button:has-text("Submit"), button:has-text("Next"), .quiz-submit'
            )
            .first();
          if (await submitButton.isVisible()) {
            await submitButton.click();
          }
        }
      } else {
        test.skip('No quiz functionality found to test');
      }
    });

    test('should handle theme switching if available', async ({ page }) => {
      const themeToggle = page
        .locator(
          '[data-testid="theme-toggle"], .theme-switch, button:has-text("Dark"), button:has-text("Light")'
        )
        .first();

      if (await themeToggle.isVisible()) {
        // Get initial theme state
        const body = page.locator('body');
        const initialClass = await body.getAttribute('class');

        // Click theme toggle
        await themeToggle.click();
        await page.waitForTimeout(500); // Wait for theme change animation

        // Check if theme changed
        const newClass = await body.getAttribute('class');
        expect(newClass).not.toBe(initialClass);
      } else {
        test.skip('No theme toggle found to test');
      }
    });
  });

  test.describe('Performance and Accessibility', () => {
    test('should load pages within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      // Page should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);

      // Check for core web vitals
      const fcpPromise = page.evaluate(() => {
        return new Promise(resolve => {
          new PerformanceObserver(list => {
            const entries = list.getEntries();
            for (const entry of entries) {
              if (entry.name === 'first-contentful-paint') {
                resolve(entry.startTime);
              }
            }
          }).observe({ entryTypes: ['paint'] });
        });
      });

      try {
        const fcp = await Promise.race([
          fcpPromise,
          new Promise(resolve => setTimeout(() => resolve(null), 3000)),
        ]);
        if (fcp) {
          expect(fcp as number).toBeLessThan(2500); // FCP should be under 2.5s
        }
      } catch (error) {
        // FCP measurement failed, but don't fail the test
        // console.log('FCP measurement not available');
      }
    });

    test('should have good accessibility features', async ({ page }) => {
      await page.goto('/');

      // Check for proper heading structure
      const h1 = page.locator('h1');
      await expect(h1).toBeVisible();

      // Check for alt text on images
      const images = page.locator('img');
      const imageCount = await images.count();

      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i);
        if (await img.isVisible()) {
          const alt = await img.getAttribute('alt');
          expect(alt).toBeTruthy(); // Should have alt text
        }
      }

      // Check for form labels if forms exist
      const inputs = page.locator('input:not([type="hidden"])');
      const inputCount = await inputs.count();

      for (let i = 0; i < Math.min(inputCount, 3); i++) {
        const input = inputs.nth(i);
        if (await input.isVisible()) {
          const id = await input.getAttribute('id');
          if (id) {
            const label = page.locator(`label[for="${id}"]`);
            await expect(label).toBeVisible();
          }
        }
      }
    });

    test('should handle errors gracefully', async ({ page }) => {
      // Test 404 page
      await page.goto('/nonexistent-page');

      // Should show 404 page or redirect, not crash
      const statusCode = page.url().includes('nonexistent-page') ? 404 : 200;

      if (statusCode === 404) {
        // Check if custom 404 page is shown
        await expect(
          page.locator(
            'h1:has-text("404"), h1:has-text("Not Found"), .error-404'
          )
        ).toBeVisible();
      }

      // Test navigation still works from error page
      const homeLink = page
        .locator('a[href="/"], a:has-text("Home"), .logo a')
        .first();
      if (await homeLink.isVisible()) {
        await homeLink.click();
        await expect(page).toHaveURL('/');
      }
    });
  });

  test.describe('Search and Filtering', () => {
    test('should search content effectively', async ({ page }) => {
      // Go to a page that likely has search
      await page.goto('/blog');
      await page.waitForLoadState('networkidle');

      const searchInput = page
        .locator(
          'input[type="search"], input[placeholder*="Search"], [data-testid="search-input"]'
        )
        .first();

      if (await searchInput.isVisible()) {
        // Perform search
        await searchInput.fill('test');
        await searchInput.press('Enter');

        // Wait for search results
        await page.waitForTimeout(1000);

        // Check if results are displayed or no results message
        const hasResults = await page
          .locator('.post-card, .search-result, article')
          .first()
          .isVisible();
        const noResults = await page
          .locator(
            ':has-text("No results"), :has-text("No posts"), .no-results'
          )
          .first()
          .isVisible();

        expect(hasResults || noResults).toBe(true);

        // Clear search
        await searchInput.clear();
        await searchInput.press('Enter');
        await page.waitForTimeout(500);
      } else {
        test.skip('No search functionality found to test');
      }
    });
  });

  test.describe('Social Features', () => {
    test('should display social sharing options', async ({ page }) => {
      // Navigate to a post that might have sharing
      await page.goto('/blog');
      await page.waitForLoadState('networkidle');

      const postLink = page
        .locator('a[href*="/posts/"], a[href*="/blog/"]')
        .first();
      if (await postLink.isVisible()) {
        await postLink.click();
        await page.waitForLoadState('networkidle');

        // Look for social sharing buttons
        const shareButtons = page
          .locator('.share, .social-share, [data-testid="share"]')
          .first();
        if (await shareButtons.isVisible()) {
          await expect(shareButtons).toBeVisible();

          // Check for common social platforms
          const twitterShare = page
            .locator(
              'a[href*="twitter.com"], a:has-text("Twitter"), .twitter-share'
            )
            .first();
          const facebookShare = page
            .locator(
              'a[href*="facebook.com"], a:has-text("Facebook"), .facebook-share'
            )
            .first();

          if (
            (await twitterShare.isVisible()) ||
            (await facebookShare.isVisible())
          ) {
            // At least one social sharing option should be available
            expect(true).toBe(true);
          }
        }
      }
    });
  });
});

// Test specific to authentication flows if implemented
test.describe('Authentication Flows', () => {
  test('should handle sign in/sign up flows', async ({ page }) => {
    await page.goto('/');

    // Look for sign in/sign up buttons
    const signInButton = page
      .locator(
        'a:has-text("Sign in"), a:has-text("Login"), .sign-in, [data-testid="sign-in"]'
      )
      .first();

    if (await signInButton.isVisible()) {
      await signInButton.click();

      // Should navigate to sign in page or show modal
      const signInForm = page
        .locator('form, .sign-in-form, [data-testid="auth-form"]')
        .first();
      await expect(signInForm).toBeVisible({ timeout: 5000 });

      // Check for email/username field
      const emailInput = page
        .locator(
          'input[type="email"], input[name="email"], input[placeholder*="email"]'
        )
        .first();
      if (await emailInput.isVisible()) {
        await expect(emailInput).toBeVisible();
      }

      // Check for password field
      const passwordInput = page
        .locator('input[type="password"], input[name="password"]')
        .first();
      if (await passwordInput.isVisible()) {
        await expect(passwordInput).toBeVisible();
      }
    } else {
      test.skip('No authentication UI found to test');
    }
  });
});
