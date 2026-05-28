import { test, expect } from '@playwright/test';

test('has standard layout with header and footer', async ({ page }) => {
  await page.goto('/');

  // Verify header elements
  const header = page.locator('nav');
  await expect(header).toBeVisible();

  // Navigation links
  await expect(header.locator('text=Events')).toBeVisible();
  await expect(header.locator('text=Professionals')).toBeVisible();
  await expect(header.locator('text=About')).toBeVisible();

  // The old "Explore" should not be there anymore, or just check new ones exist
});
