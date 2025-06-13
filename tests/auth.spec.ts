import { test, expect } from '@playwright/test';

test('homepage shows sign in and sign up buttons when not authenticated', async ({ page }) => {
  await page.goto('/');

  // Check for sign in and sign up buttons
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /sign up/i })).toBeVisible();
  
  // Check for main heading
  await expect(page.getByText(/Transform Reddit into Viral Content/i)).toBeVisible();
  
  // Check for description text
  await expect(page.getByText(/ThreadJuice scrapes and curates Reddit's most outrageous threads/i)).toBeVisible();
});