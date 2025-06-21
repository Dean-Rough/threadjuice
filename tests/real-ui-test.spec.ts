import { test, expect } from '@playwright/test';

test('Real UI functionality test', async ({ page }) => {
  await page.goto('/');
  
  // Take a screenshot to see what's actually rendering
  await page.screenshot({ path: 'actual-ui-state.png', fullPage: true });
  
  // Check if we can actually see and interact with content
  const pageContent = await page.content();
  // console.log('Full page HTML length:', pageContent.length);
  
  // Look for actual visible text content (not just HTML)
  const visibleText = await page.locator('body').textContent();
  // console.log('Visible text content:', visibleText?.substring(0, 500) + '...');
  
  // Check if any buttons are actually clickable
  const buttons = await page.locator('button').all();
  // console.log('Found buttons:', buttons.length);
  
  if (buttons.length > 0) {
    try {
      const firstButton = buttons[0];
      const buttonText = await firstButton.textContent();
      // console.log('First button text:', buttonText);
      const isVisible = await firstButton.isVisible();
      // console.log('First button visible:', isVisible);
    } catch (e) {
      // console.log('Error checking button:', e);
    }
  }
  
  // Check if CSS is actually working by looking at computed styles
  const body = page.locator('body');
  const computedStyle = await body.evaluate(el => {
    const style = window.getComputedStyle(el);
    return {
      display: style.display,
      fontFamily: style.fontFamily,
      color: style.color,
      backgroundColor: style.backgroundColor
    };
  });
  // console.log('Body computed styles:', computedStyle);
  
  // Check console for errors
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  await page.waitForTimeout(3000);
  
  if (consoleErrors.length > 0) {
    // console.log('Console errors:', consoleErrors);
  }
});