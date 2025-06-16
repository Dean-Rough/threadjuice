import { test, expect } from '@playwright/test';

test('homepage shows sign in and sign up buttons when not authenticated', async ({
  page,
}) => {
  await page.goto('/');

  // Check for sign in and sign up buttons
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();

  // Check for main heading
  await expect(
    page.getByRole('heading', { name: /Trending Threads/i })
  ).toBeVisible();
});
